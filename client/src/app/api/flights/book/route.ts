import { NextRequest, NextResponse } from "next/server";
import { tboBookFlight } from "@/lib/adapters/tbo/flight/book";
import { TboFareExpiredError, TboBookingFailedError } from "@/lib/adapters/tbo/errors";
import type { TboBookFlightInput } from "@/lib/adapters/tbo/flight/book";

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body: TboBookFlightInput = await request.json();

    if (!body?.resultIndex) return err("resultIndex is required.", 400);
    if (!body?.passengers?.length) return err("At least one passenger is required.", 400);
    if (!body?.contactEmail) return err("contactEmail is required.", 400);

    const result = await tboBookFlight(body);
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    if (e instanceof TboFareExpiredError) {
      return err("Fare has expired. Please search again.", 410);
    }
    if (e instanceof TboBookingFailedError) {
      return err(e.message, 422);
    }
    const message = e instanceof Error ? e.message : "Booking failed";
    return err(message, 500);
  }
}
