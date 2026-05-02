import { NextRequest, NextResponse } from "next/server";
import { tboIssueTicket, type LccTicketInput, type NonLccTicketInput } from "@/lib/adapters/tbo/flight/ticket";
import { pollFlightBookingDetail } from "@/lib/adapters/tbo/flight/booking";
import { TboFareExpiredError } from "@/lib/adapters/tbo/errors";

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ── LCC path ─────────────────────────────────────────────────────────────
    // isLCC=true: no prior Book step — Ticket issues directly from ResultIndex.
    if (body?.isLCC === true) {
      if (!body.resultIndex) return err("resultIndex is required for LCC ticket.", 400);
      if (!body.passengers?.length) return err("passengers array is required.", 400);
      if (!body.fareBreakdown?.length) return err("fareBreakdown is required.", 400);
      if (!body.contactEmail) return err("contactEmail is required.", 400);
      if (!body.contactPhone) return err("contactPhone is required.", 400);

      const input: LccTicketInput = {
        isLCC: true,
        resultIndex: body.resultIndex,
        traceId: body.traceId ?? undefined,
        fareBreakdown: body.fareBreakdown,
        passengers: body.passengers,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        preferredCurrency: body.preferredCurrency ?? "INR",
      };

      const ticketResult = await tboIssueTicket(input);
      const detail = await pollFlightBookingDetail(ticketResult.bookingId);

      return NextResponse.json({
        success: true,
        data: {
          bookingId: ticketResult.bookingId,
          pnr: ticketResult.pnr || detail.pnr,
          ticketNumbers: ticketResult.ticketNumbers,
          bookingStatus: detail.bookingStatus,
        },
      });
    }

    // ── Non-LCC path ──────────────────────────────────────────────────────────
    // isLCC=false (or unset): Book was called first and returned a BookingId.
    const bookingId = Number(body?.bookingId);
    if (!bookingId || isNaN(bookingId)) {
      return err("bookingId is required for non-LCC ticket.", 400);
    }

    const input: NonLccTicketInput = { isLCC: false, bookingId };
    const ticketResult = await tboIssueTicket(input);
    const detail = await pollFlightBookingDetail(bookingId);

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        pnr: ticketResult.pnr || detail.pnr,
        ticketNumbers: ticketResult.ticketNumbers,
        bookingStatus: detail.bookingStatus,
      },
    });
  } catch (e) {
    if (e instanceof TboFareExpiredError) {
      return err("Fare has expired. Please search again.", 410);
    }
    const message = e instanceof Error ? e.message : "Ticket issuance failed";
    return err(message, 500);
  }
}
