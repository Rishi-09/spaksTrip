import "server-only";

import type {
  BusBooking,
  BusBookingInput,
  BusSearchInput,
  BusSearchResult,
  BusSeatLayoutResponse,
} from "@/lib/busTypes";

export async function searchBuses(input: BusSearchInput): Promise<BusSearchResult[]> {
  void input;
  throw new Error("Bus inventory is currently unavailable.");
}

export async function getSeatLayout(input: {
  busId: string;
  travelDate: string;
}): Promise<BusSeatLayoutResponse | null> {
  void input;
  return null;
}

export async function bookBus(input: BusBookingInput): Promise<BusBooking> {
  void input;
  throw new Error("Bus booking is currently unavailable.");
}

export async function getBookings(): Promise<BusBooking[]> {
  return [];
}
