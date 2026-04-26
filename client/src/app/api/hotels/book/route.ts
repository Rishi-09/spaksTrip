import { NextRequest, NextResponse } from "next/server";
import { tboBookHotel } from "@/lib/adapters/tbo/hotel/book";
import { TboBookingFailedError } from "@/lib/adapters/tbo/errors";
import type { TboHotelBookInput } from "@/lib/adapters/tbo/hotel/book";

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body: TboHotelBookInput = await request.json();

    if (!body?.hotelCode) return err("hotelCode is required.", 400);
    if (!body?.roomTypeCode) return err("roomTypeCode is required.", 400);
    if (!body?.guests?.length) return err("At least one guest is required.", 400);
    if (!body?.contactEmail) return err("contactEmail is required.", 400);

    const result = await tboBookHotel(body);
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    if (e instanceof TboBookingFailedError) {
      return err(e.message, 422);
    }
    const message = e instanceof Error ? e.message : "Hotel booking failed";
    return err(message, 500);
  }
}
