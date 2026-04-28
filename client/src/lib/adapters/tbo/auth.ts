import "server-only";
import { assertTboSuccess, TboInvalidSessionError } from "./errors";
import { logRequest, logResponse, logError } from "./log";
import type { TboAuthResponse } from "./types";

// ─── Module-level token cache (lives in Node process memory) ─────────────────

interface TokenEntry {
  tokenId: string;
  expiresAt: number; // epoch ms
}

let tokenCache: TokenEntry | null = null;
// Mutex: prevents concurrent re-auth storms when the token expires
let refreshPromise: Promise<string> | null = null;

// TBO tokens are valid for 24 hours. We cache for 8 hours and refresh
// proactively to avoid mid-request expiry.
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const TOKEN_RENEW_BUFFER_MS = 5 * 60 * 1000;

// ─── URL helpers ─────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  const url = process.env.TBO_API_URL;
  if (!url) throw new Error("TBO_API_URL not set in .env.local");
  return url.replace(/\/$/, "");
}

function normalizeTboHost(url: string, fallbackHost: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "b2b.tektravels.com") {
      parsed.hostname = fallbackHost;
      return parsed.toString().replace(/\/$/, "");
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.replace(/\/$/, "");
  }
}

function getServiceBaseUrl(
  envKey: string,
  fallbackHost: string,
): string {
  const explicit = process.env[envKey];
  if (explicit) return explicit.replace(/\/$/, "");
  return normalizeTboHost(getBaseUrl(), fallbackHost);
}

export function tboApiUrl(
  path: string,
  service: "shared" | "air" | "hotel" = "air",
): string {
  const cleanPath = path.replace(/^\//, "");
  const baseUrl =
    service === "shared"
      ? getServiceBaseUrl("TBO_SHARED_API_URL", "sharedapi.tektravels.com")
      : service === "hotel"
        ? getServiceBaseUrl("TBO_HOTEL_API_URL", "api.tektravels.com")
        : getServiceBaseUrl("TBO_AIR_API_URL", "api.tektravels.com");
  return `${baseUrl}/${cleanPath}`;
}

// ─── Internal: call TBO authenticate endpoint ─────────────────────────────────

async function authenticate(): Promise<string> {
  const userName = process.env.TBO_USER_NAME;
  const password = process.env.TBO_PASSWORD;
  const endUserIp = process.env.TBO_END_USER_IP ?? "1.1.1.1";

  if (!userName || !password) {
    throw new Error(
      "TBO credentials not configured. Set TBO_USER_NAME and TBO_PASSWORD in .env.local",
    );
  }

  // Per TBO B2B docs: auth endpoint is /SharedServices/SharedData.svc/rest/Authenticate
  const url = tboApiUrl("SharedData.svc/rest/Authenticate", "shared");
  const body = {
    ClientId: "ApiIntegrationNew",
    UserName: userName,
    Password: password,
    EndUserIp: endUserIp,
  };

  logRequest("Authenticate", url, { ...body, Password: "***" });

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    logError("Authenticate", err);
    throw new Error(
      `TBO auth network error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const text = await res.text();
  let data: TboAuthResponse;
  try {
    data = JSON.parse(text);
  } catch {
    logError("Authenticate", new Error("non-JSON response"), { status: res.status, text });
    throw new Error(`TBO auth returned non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }

  logResponse("Authenticate", res.status, { ...data, TokenId: data.TokenId ? "***" : null });

  if (!res.ok) {
    throw new Error(`TBO auth HTTP ${res.status}: ${res.statusText}`);
  }

  assertTboSuccess(data.Error);

  if (!data.TokenId) {
    throw new Error(`TBO auth returned empty TokenId. Status=${data.Status}`);
  }

  tokenCache = { tokenId: data.TokenId, expiresAt: Date.now() + TOKEN_TTL_MS };
  return data.TokenId;
}

// ─── Public: get a valid token (cached or freshly authenticated) ──────────────

export async function getTboToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt - Date.now() > TOKEN_RENEW_BUFFER_MS) {
    return tokenCache.tokenId;
  }

  if (refreshPromise) return refreshPromise;

  refreshPromise = authenticate().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export function clearTokenCache(): void {
  tokenCache = null;
  refreshPromise = null;
}

// ─── Public: retry wrapper with auto re-auth ─────────────────────────────────

export async function withRetry<T>(fn: (token: string) => Promise<T>): Promise<T> {
  const token = await getTboToken();
  try {
    return await fn(token);
  } catch (err) {
    if (err instanceof TboInvalidSessionError) {
      clearTokenCache();
      const freshToken = await getTboToken();
      return fn(freshToken);
    }
    throw err;
  }
}

// ─── Public: build standard TBO request base ─────────────────────────────────

export function tboBase(token: string): { TokenId: string; EndUserIp: string } {
  return {
    TokenId: token,
    EndUserIp: process.env.TBO_END_USER_IP ?? "1.1.1.1",
  };
}
