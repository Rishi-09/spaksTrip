import "server-only";
import { withRetry, tboBase, tboApiUrl } from "../auth";
import { assertTboSuccess } from "../errors";
import { logRequest, logResponse, logError } from "../log";
import type { TboTicketResponse } from "../types";

export interface TicketResult {
  bookingId: number;
  pnr: string;
  ticketNumbers: string[];
  bookingStatus: number;
}

/**
 * Issues the flight ticket after payment is confirmed.
 *
 * TBO flow distinction:
 * - Non-LCC airlines: Book first, then Ticket after payment → POST /Ticket/NonAir
 * - LCC airlines: Book is sufficient (ticket issued at booking) → POST /Ticket/AirTicket
 *
 * The `isLCC` flag is returned by the Book adapter but not stored separately;
 * the API route handles this by calling the appropriate endpoint.
 * For safety, we default to the non-LCC path unless told otherwise.
 */
export async function tboIssueTicket(
  bookingId: number,
  isLCC = false,
): Promise<TicketResult> {
  return withRetry(async (token) => {
    // TBO B2B: Ticket is the same endpoint for LCC vs non-LCC, behavior decided server-side
    const url = tboApiUrl("BookingEngineService_Air/AirService.svc/rest/Ticket");
    const reqBody = { ...tboBase(token), BookingId: bookingId };
    logRequest(`Flight Ticket (LCC=${isLCC})`, url, { ...reqBody, TokenId: "***" });

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
    } catch (err) {
      logError("Flight Ticket", err);
      throw err;
    }

    const text = await res.text();
    let data: TboTicketResponse;
    try { data = JSON.parse(text); }
    catch { throw new Error(`TBO Ticket non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`); }

    logResponse("Flight Ticket", res.status, data);
    if (!res.ok) throw new Error(`TBO Ticket HTTP ${res.status}`);
    assertTboSuccess(data.Response?.Error);

    const itinerary = data.Response?.FlightItinerary;

    const ticketNumbers = (itinerary?.Passenger ?? [])
      .map((p) => p.Ticket?.TicketNumber)
      .filter((t): t is string => Boolean(t));

    return {
      bookingId: itinerary?.BookingId ?? bookingId,
      pnr: itinerary?.PNR ?? "",
      ticketNumbers,
      bookingStatus: itinerary?.BookingStatus ?? 0,
    };
  });
}
