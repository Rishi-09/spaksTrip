import "server-only";
import { withRetry, tboBase, tboApiUrl } from "../auth";
import { assertTboSuccess, TboFareExpiredError } from "../errors";
import { getTrace } from "../traceCache";
import { logRequest, logResponse, logError } from "../log";
import type { TboSSRResponse } from "../types";

export interface SSROption {
  code: string;
  description: string;
  amount: number;
  segmentIndex: number;
}

export interface SSRResult {
  meals: SSROption[];
  seats: SSROption[];
}

// SSR codes prefixed with "ML" are meals; "SD" are dynamic seats.
// TBO does not always return both — handle empty arrays gracefully.

export async function tboGetSSR(resultIndex: string): Promise<SSRResult> {
  const traceId = getTrace(resultIndex);
  if (!traceId) throw new TboFareExpiredError();

  return withRetry(async (token) => {
    const url = tboApiUrl("BookingEngineService_Air/AirService.svc/rest/SSR");
    const body = { ...tboBase(token), ResultIndex: resultIndex, TraceId: traceId };
    logRequest("Flight SSR", url, { ...body, TokenId: "***" });

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      logError("Flight SSR", err);
      throw err;
    }

    const text = await res.text();
    let data: TboSSRResponse;
    try { data = JSON.parse(text); }
    catch { throw new Error(`TBO SSR non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`); }

    logResponse("Flight SSR", res.status, data);
    if (!res.ok) throw new Error(`TBO SSR HTTP ${res.status}`);
    assertTboSuccess(data.Response?.Error);

    const meals: SSROption[] = [];
    const seats: SSROption[] = [];

    for (const passengerData of data.Response?.SSRDatas ?? []) {
      for (const segData of passengerData.SegmentSSRDatas ?? []) {
        for (const detail of segData.SSRDetails ?? []) {
          const option: SSROption = {
            code: detail.Code,
            description: detail.Description || detail.AirlineDescription || detail.Code,
            amount: detail.Amount,
            segmentIndex: segData.SegmentIndex,
          };
          // TBO uses "MEAL" or "ML" prefix for meals, "SD" for seat dynamic
          if (detail.Code.startsWith("ML") || detail.Code.startsWith("MEAL")) {
            meals.push(option);
          } else if (detail.Code.startsWith("SD") || detail.Code.startsWith("SEAT")) {
            seats.push(option);
          }
        }
      }
    }

    return { meals, seats };
  });
}
