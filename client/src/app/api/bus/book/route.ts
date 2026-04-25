import { NextRequest, NextResponse } from "next/server";
import { bookBus, getBookings } from "@/lib/busService";
import type { ApiResponse, BusBooking, BusBookingInput } from "@/lib/busTypes";

function error<T>(message: string, status: number) {
  return NextResponse.json<ApiResponse<T>>({ success: false, error: message }, { status });
}

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json<ApiResponse<BusBooking[]>>({ success: true, data: bookings });
  } catch {
    return error<BusBooking[]>("Unable to fetch bus bookings right now.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<BusBookingInput>;
    const busId = String(body?.busId ?? "").trim();
    const travelDate = String(body?.travelDate ?? "").trim();
    const selectedSeats = Array.isArray(body?.selectedSeats) ? body.selectedSeats : [];
    const passengers = Array.isArray(body?.passengers) ? body.passengers : [];
    const contact = body?.contact;

    if (!busId || !travelDate || selectedSeats.length === 0) {
      return error<BusBooking>("Bus, date, and seats are required.", 400);
    }

    if (!contact || !isValidEmail(String(contact.email ?? "")) || !String(contact.phone ?? "").trim()) {
      return error<BusBooking>("Valid contact details are required.", 400);
    }

    if (passengers.length !== selectedSeats.length) {
      return error<BusBooking>("Each selected seat must have one passenger.", 400);
    }

    const invalidPassenger = passengers.find((passenger) => {
      const name = String(passenger?.name ?? "").trim();
      const age = Number(passenger?.age ?? 0);
      return !name || !Number.isFinite(age) || age < 1 || !selectedSeats.includes(String(passenger?.seatNumber ?? ""));
    });

    if (invalidPassenger) {
      return error<BusBooking>("Passenger details are incomplete or invalid.", 400);
    }

    const booking = await bookBus({
      busId,
      travelDate,
      selectedSeats: selectedSeats.map(String),
      passengers: passengers.map((passenger) => ({
        seatNumber: String(passenger.seatNumber),
        name: String(passenger.name).trim(),
        age: Number(passenger.age),
        gender:
          passenger.gender === "Female" || passenger.gender === "Other" ? passenger.gender : "Male",
      })),
      contact: {
        email: String(contact.email).trim(),
        phone: String(contact.phone).trim(),
      },
    });

    return NextResponse.json<ApiResponse<BusBooking>>({ success: true, data: booking });
  } catch (caughtError) {
    const message =
      caughtError instanceof Error ? caughtError.message : "Unable to complete the bus booking right now.";
    return error<BusBooking>(message, 400);
  }
}
