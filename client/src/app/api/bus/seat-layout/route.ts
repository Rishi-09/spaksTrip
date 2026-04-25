import { NextRequest, NextResponse } from "next/server";
import { getSeatLayout } from "@/lib/busService";
import type { ApiResponse, BusSeatLayoutResponse } from "@/lib/busTypes";

function error(message: string, status: number) {
  return NextResponse.json<ApiResponse<BusSeatLayoutResponse>>(
    { success: false, error: message },
    { status },
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const busId = searchParams.get("busId")?.trim() ?? "";
  const travelDate = searchParams.get("date")?.trim() ?? "";

  if (!busId || !travelDate) {
    return error("Bus ID and date are required.", 400);
  }

  try {
    const layout = await getSeatLayout({ busId, travelDate });
    if (!layout) {
      return error("Bus seat layout was not found.", 404);
    }
    return NextResponse.json<ApiResponse<BusSeatLayoutResponse>>({ success: true, data: layout });
  } catch {
    return error("Unable to load seat layout right now.", 500);
  }
}
