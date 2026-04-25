import "server-only";

import { promises as fs } from "fs";
import path from "path";
import mockBuses from "@/data/mockBuses.json";
import type {
  BusBooking,
  BusBookingInput,
  BusSearchInput,
  BusSearchResult,
  BusSeat,
  BusSeatLayoutResponse,
} from "@/lib/busTypes";

type SeatLayoutConfig = {
  kind: "seater" | "sleeper";
  rows: number;
  columns: number;
};

type MockBusRecord = Omit<BusSearchResult, "seatsAvailable"> & {
  seatLayout: SeatLayoutConfig;
};

const inventory = mockBuses as MockBusRecord[];
const bookingsFile = path.join(process.cwd(), "src", "data", "mockBusBookings.json");

function normalize(value: string) {
  return value.trim().toLowerCase();
}

async function readBookings(): Promise<BusBooking[]> {
  try {
    const raw = await fs.readFile(bookingsFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BusBooking[]) : [];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeBookings(bookings: BusBooking[]) {
  await fs.writeFile(bookingsFile, JSON.stringify(bookings, null, 2), "utf8");
}

function getBusRecord(busId: string) {
  return inventory.find((item) => item.id === busId) ?? null;
}

function getBookedSeatNumbers(busId: string, travelDate: string, bookings: BusBooking[]) {
  return new Set(
    bookings
      .filter((booking) => booking.busId === busId && booking.travelDate === travelDate)
      .flatMap((booking) => booking.selectedSeats),
  );
}

function createSeatNumber(kind: SeatLayoutConfig["kind"], deck: BusSeat["deck"], row: number, column: number) {
  if (kind === "seater") {
    return `L${row + 1}${String.fromCharCode(65 + column)}`;
  }
  const prefix = deck === "lower" ? "L" : "U";
  return `${prefix}${row + 1}${column === 0 ? "A" : column === 1 ? "B" : "C"}`;
}

function createSeatLayout(bus: MockBusRecord, bookedSeats: Set<string>): BusSeat[] {
  const { seatLayout, price } = bus;
  const seats: BusSeat[] = [];

  if (seatLayout.kind === "seater") {
    for (let row = 0; row < seatLayout.rows; row += 1) {
      for (let column = 0; column < seatLayout.columns; column += 1) {
        const seatNumber = createSeatNumber("seater", "lower", row, column);
        seats.push({
          seatNumber,
          deck: "lower",
          row,
          column,
          type: "seater",
          status: bookedSeats.has(seatNumber) ? "booked" : "available",
          price: price + (row < 2 ? 120 : 0),
        });
      }
    }
    return seats;
  }

  for (const deck of ["lower", "upper"] as const) {
    for (let row = 0; row < seatLayout.rows; row += 1) {
      for (let column = 0; column < seatLayout.columns; column += 1) {
        const seatNumber = createSeatNumber("sleeper", deck, row, column);
        seats.push({
          seatNumber,
          deck,
          row,
          column,
          type: "sleeper",
          status: bookedSeats.has(seatNumber) ? "booked" : "available",
          price: price + (deck === "upper" ? 0 : 180) + (column === 2 ? 90 : 0),
        });
      }
    }
  }

  return seats;
}

function buildSearchResult(bus: MockBusRecord, bookedSeats: Set<string>): BusSearchResult {
  const totalSeats =
    bus.seatLayout.kind === "seater"
      ? bus.seatLayout.rows * bus.seatLayout.columns
      : bus.seatLayout.rows * bus.seatLayout.columns * 2;

  return {
    id: bus.id,
    operatorName: bus.operatorName,
    source: bus.source,
    destination: bus.destination,
    departureTime: bus.departureTime,
    arrivalTime: bus.arrivalTime,
    price: bus.price,
    seatsAvailable: totalSeats - bookedSeats.size,
    busType: bus.busType,
    boardingPoint: bus.boardingPoint,
    droppingPoint: bus.droppingPoint,
    durationMinutes: bus.durationMinutes,
    amenities: bus.amenities,
  };
}

export async function searchBuses(input: BusSearchInput): Promise<BusSearchResult[]> {
  const bookings = await readBookings();

  // TODO: Replace with TBO Bus Search API here.
  return inventory
    .filter(
      (bus) =>
        normalize(bus.source) === normalize(input.source) &&
        normalize(bus.destination) === normalize(input.destination),
    )
    .map((bus) =>
      buildSearchResult(bus, getBookedSeatNumbers(bus.id, input.travelDate, bookings)),
    )
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}

export async function getSeatLayout(input: {
  busId: string;
  travelDate: string;
}): Promise<BusSeatLayoutResponse | null> {
  const bus = getBusRecord(input.busId);
  if (!bus) return null;

  const bookings = await readBookings();
  const bookedSeats = getBookedSeatNumbers(input.busId, input.travelDate, bookings);

  // TODO: Replace with TBO Bus Seat Layout API here.
  return {
    bus: {
      id: bus.id,
      operatorName: bus.operatorName,
      source: bus.source,
      destination: bus.destination,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      price: bus.price,
      busType: bus.busType,
      boardingPoint: bus.boardingPoint,
      droppingPoint: bus.droppingPoint,
      durationMinutes: bus.durationMinutes,
      amenities: bus.amenities,
    },
    seats: createSeatLayout(bus, bookedSeats),
  };
}

export async function bookBus(input: BusBookingInput): Promise<BusBooking> {
  const bus = getBusRecord(input.busId);
  if (!bus) {
    throw new Error("Selected bus was not found.");
  }

  const layout = await getSeatLayout({ busId: input.busId, travelDate: input.travelDate });
  if (!layout) {
    throw new Error("Seat layout could not be loaded.");
  }

  const selectedSeats = layout.seats.filter((seat) => input.selectedSeats.includes(seat.seatNumber));
  if (selectedSeats.length !== input.selectedSeats.length) {
    throw new Error("One or more seats are invalid.");
  }

  const unavailable = selectedSeats.find((seat) => seat.status === "booked");
  if (unavailable) {
    throw new Error(`Seat ${unavailable.seatNumber} is no longer available.`);
  }

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const booking: BusBooking = {
    bookingId: `BUS-${Date.now().toString(36).toUpperCase()}`,
    pnr: `PNR${Math.floor(100000 + Math.random() * 900000)}`,
    busId: bus.id,
    operatorName: bus.operatorName,
    source: bus.source,
    destination: bus.destination,
    travelDate: input.travelDate,
    departureTime: bus.departureTime,
    arrivalTime: bus.arrivalTime,
    busType: bus.busType,
    selectedSeats: input.selectedSeats,
    passengers: input.passengers,
    contact: input.contact,
    totalPrice,
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  };

  const bookings = await readBookings();

  // TODO: Replace with TBO Bus Booking API here.
  await writeBookings([booking, ...bookings].slice(0, 100));

  return booking;
}

export async function getBookings(): Promise<BusBooking[]> {
  const bookings = await readBookings();
  return bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
