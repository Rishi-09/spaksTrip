import { NextRequest, NextResponse } from "next/server";
import { tboIssueTicket } from "@/lib/adapters/tbo/flight/ticket";
import { pollFlightBookingDetail } from "@/lib/adapters/tbo/flight/booking";

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bookingId = Number(body?.bookingId);
    const isLCC = Boolean(body?.isLCC);

    if (!bookingId || isNaN(bookingId)) return err("bookingId is required.", 400);

    const ticketResult = await tboIssueTicket(bookingId, isLCC);
    // Poll until PNR is confirmed or we exhaust retries
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
    const message = e instanceof Error ? e.message : "Ticket issuance failed";
    return err(message, 500);
  }
}
