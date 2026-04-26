import { NextRequest, NextResponse } from "next/server";
import { tboSearchFlights } from "@/lib/adapters/tbo/flight/search";
import { TboNoResultsError, TboError } from "@/lib/adapters/tbo/errors";
import type { TboFlightSearchInput } from "@/lib/adapters/tbo/flight/search";

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  let body: TboFlightSearchInput | null = null;

  try {
    body = await request.json();
    console.log("[API /api/flights/search] payload:", JSON.stringify(body));

    if (!body?.from || !body?.to || !body?.date) {
      return err("from, to, and date are required.", 400);
    }
    if (body.from === body.to) {
      return err("Origin and destination must be different.", 400);
    }
    if (typeof body.adults !== "number" || body.adults < 1) {
      return err("adults must be a number >= 1.", 400);
    }

    const result = await tboSearchFlights(body);
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    const stack = e instanceof Error ? e.stack : String(e);
    console.error("[API /api/flights/search] FAILED");
    console.error("  payload:", JSON.stringify(body));
    console.error("  stack:", stack);

    if (e instanceof TboNoResultsError) {
      return err("No flights found for the selected criteria.", 404);
    }
    if (e instanceof TboError) {
      return err(`TBO error (${e.code}): ${e.message}`, 502);
    }
    const message = e instanceof Error ? e.message : "Flight search failed";
    return err(message, 500);
  }
}
