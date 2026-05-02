import { NextRequest, NextResponse } from "next/server";
import { tboFareQuote } from "@/lib/adapters/tbo/flight/fareQuote";
import { TboFareExpiredError } from "@/lib/adapters/tbo/errors";

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) return err("id (ResultIndex) is required.", 400);

    // Accept explicit traceId from client — required for serverless deployments
    // where the server-side traceCache may not survive across function instances.
    const traceId = req.nextUrl.searchParams.get("traceId") ?? undefined;

    const result = await tboFareQuote(decodeURIComponent(id), traceId);
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    if (e instanceof TboFareExpiredError) {
      return err("Fare has expired. Please search again.", 410);
    }
    const message = e instanceof Error ? e.message : "FareQuote failed";
    return err(message, 500);
  }
}
