import "server-only";
import { withRetry, tboBase, tboApiUrl } from "../auth";
import { assertTboSuccess } from "../errors";
import { logRequest, logResponse, logError } from "../log";
import type { TboHotelBookingDetailResponse } from "../types";

export type HotelBookingStatus = "CONFIRMED" | "FAILED" | "PENDING";

export interface HotelBookingDetailResult {
  bookingId: string;
  confirmationNumber: string;
  bookingStatus: HotelBookingStatus;
}

function mapStatus(raw: string | undefined | null): HotelBookingStatus {
  if (!raw) return "PENDING";
  const upper = raw.toUpperCase();
  if (upper === "CONFIRMED" || upper === "1") return "CONFIRMED";
  if (upper === "FAILED" || upper === "CANCELLED" || upper === "4") return "FAILED";
  return "PENDING";
}

export async function tboGetHotelBookingDetail(
  bookingId: string,
): Promise<HotelBookingDetailResult> {
  return withRetry(async (token) => {
    const url = tboApiUrl("HotelAPI/Hotel/GetBookingDetail");
    const reqBody = { ...tboBase(token), BookingId: bookingId };
    logRequest("Hotel GetBookingDetail", url, { ...reqBody, TokenId: "***" });

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
    } catch (err) {
      logError("Hotel GetBookingDetail", err);
      throw err;
    }

    const text = await res.text();
    let data: TboHotelBookingDetailResponse;
    try { data = JSON.parse(text); }
    catch { throw new Error(`TBO Hotel GetBookingDetail non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`); }

    logResponse("Hotel GetBookingDetail", res.status, data);
    if (!res.ok) throw new Error(`TBO Hotel GetBookingDetail HTTP ${res.status}`);
    assertTboSuccess(data.GetBookingDetailResult?.Error);

    const detail = data.GetBookingDetailResult?.HotelBookingDetail;

    return {
      bookingId: detail?.BookingId ?? bookingId,
      confirmationNumber: detail?.ConfirmationNumber ?? "",
      bookingStatus: mapStatus(detail?.BookingStatus),
    };
  });
}

export async function pollHotelBookingDetail(
  bookingId: string,
  maxAttempts = 5,
  delayMs = 2000,
): Promise<HotelBookingDetailResult> {
  let last: HotelBookingDetailResult | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    last = await tboGetHotelBookingDetail(bookingId);
    if (last.bookingStatus !== "PENDING") return last;
  }

  return last ?? { bookingId, confirmationNumber: "", bookingStatus: "PENDING" };
}
