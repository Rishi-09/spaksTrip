import { NextRequest, NextResponse } from "next/server";
import { searchBuses } from "@/lib/busService";
import type { ApiResponse, BusSearchResult } from "@/lib/busTypes";

function error(message: string, status: number) {
  return NextResponse.json<ApiResponse<BusSearchResult[]>>(
    { success: false, error: message },
    { status },
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const source = String(body?.source ?? "").trim();
    const destination = String(body?.destination ?? "").trim();
    const travelDate = String(body?.travelDate ?? "").trim();

    if (!source || !destination || !travelDate) {
      return error("Source, destination, and travel date are required.", 400);
    }

    if (source.toLowerCase() === destination.toLowerCase()) {
      return error("Source and destination must be different.", 400);
    }

    const results = await searchBuses({ source, destination, travelDate });
    return NextResponse.json<ApiResponse<BusSearchResult[]>>({ success: true, data: results });
  } catch (caughtError) {
    const message =
      caughtError instanceof Error ? caughtError.message : "Unable to search buses right now.";
    return error(message, 503);
  }
}
