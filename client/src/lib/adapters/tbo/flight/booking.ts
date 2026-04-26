import "server-only";
import { withRetry, tboBase, tboApiUrl } from "../auth";
import { assertTboSuccess } from "../errors";
import { logRequest, logResponse, logError } from "../log";
import type { TboFlightBookingDetailResponse } from "../types";

export type BookingStatus = "CONFIRMED" | "FAILED" | "PENDING";

export interface BookingDetailResult {
  bookingId: number;
  pnr: string;
  bookingStatus: BookingStatus;
  ticketNumbers: string[];
}

// TBO BookingStatus codes (not exhaustive — extend as needed from TBO docs)
function mapBookingStatus(code: number): BookingStatus {
  // 1 = Confirmed, 2 = Pending, 4 = Failed/Cancelled
  if (code === 1) return "CONFIRMED";
  if (code === 4 || code === 8 || code === 9) return "FAILED";
  return "PENDING";
}

export async function tboGetFlightBookingDetail(bookingId: number): Promise<BookingDetailResult> {
  return withRetry(async (token) => {
    const url = tboApiUrl("BookingEngineService_Air/AirService.svc/rest/GetBookingDetails");
    const reqBody = { ...tboBase(token), BookingId: bookingId };
    logRequest("Flight GetBookingDetails", url, { ...reqBody, TokenId: "***" });

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
    } catch (err) {
      logError("Flight GetBookingDetails", err);
      throw err;
    }

    const text = await res.text();
    let data: TboFlightBookingDetailResponse;
    try { data = JSON.parse(text); }
    catch { throw new Error(`TBO GetBookingDetails non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`); }

    logResponse("Flight GetBookingDetails", res.status, data);
    if (!res.ok) throw new Error(`TBO GetBookingDetails HTTP ${res.status}`);
    assertTboSuccess(data.Response?.Error);

    const itinerary = data.Response?.FlightItinerary;
    const ticketNumbers = (itinerary?.Passenger ?? [])
      .map((p) => p.Ticket?.TicketNumber)
      .filter((t): t is string => Boolean(t));

    return {
      bookingId: itinerary?.BookingId ?? bookingId,
      pnr: itinerary?.PNR ?? "",
      bookingStatus: mapBookingStatus(itinerary?.BookingStatus ?? 0),
      ticketNumbers,
    };
  });
}

/**
 * Polls GetBookingDetail until status is CONFIRMED or FAILED, or until
 * maxAttempts is exhausted (returns PENDING in that case).
 */
export async function pollFlightBookingDetail(
  bookingId: number,
  maxAttempts = 5,
  delayMs = 2000,
): Promise<BookingDetailResult> {
  let last: BookingDetailResult | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }

    last = await tboGetFlightBookingDetail(bookingId);
    if (last.bookingStatus !== "PENDING") return last;
  }

  return last ?? { bookingId, pnr: "", bookingStatus: "PENDING", ticketNumbers: [] };
}
