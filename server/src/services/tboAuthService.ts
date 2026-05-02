import axios from "axios";
import { env } from "../config/env";
import { TboToken } from "../models/TboToken";

export class TboAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TboAuthError";
  }
}

/** Returns 23:59:59.999 UTC for the current day in IST (UTC+5:30). */
function endOfDayIST(): Date {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(Date.now() + IST_OFFSET_MS);
  istNow.setHours(23, 59, 59, 999);
  return new Date(istNow.getTime() - IST_OFFSET_MS);
}

async function fetchNewToken(): Promise<string> {
  const { data } = await axios.post(
    `${env.tboSharedApiUrl}/SharedData.svc/rest/Authenticate`,
    {
      ClientId: env.tboClientId,
      UserName: env.tboUserName,
      Password: env.tboPassword,
      EndUserIp: env.tboEndUserIp,
    },
  );
  if (data?.Status !== 1 || !data?.TokenId) {
    throw new TboAuthError(
      `TBO authentication failed: ${data?.Error?.ErrorMessage ?? JSON.stringify(data)}`,
    );
  }
  return data.TokenId as string;
}

/**
 * Returns a valid TBO TokenId, reusing the one cached in MongoDB when still
 * within today's IST window (00:00–23:59). Fetches and persists a new one
 * when expired or absent.
 */
export async function getToken(): Promise<string> {
  const valid = await TboToken.findOne({
    userName: env.tboUserName,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (valid) return valid.tokenId;

  const tokenId = await fetchNewToken();

  await TboToken.create({
    tokenId,
    userName: env.tboUserName,
    expiresAt: endOfDayIST(),
  });

  return tokenId;
}
