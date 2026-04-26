import { NextRequest, NextResponse } from "next/server";
import { tboGetHotelBookingDetail } from "@/lib/adapters/tbo/hotel/booking";

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) return err("bookingId is required.", 400);

    const result = await tboGetHotelBookingDetail(decodeURIComponent(id));
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Hotel GetBookingDetail failed";
    return err(message, 500);
  }
}
