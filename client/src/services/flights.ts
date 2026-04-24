import {
  generateFlights,
  getFlightById,
  type FlightOffer,
  type FlightSearchInput,
  type CabinClass,
} from "@/lib/mock/flights";
import { searchAirports, type Airport } from "@/lib/mock/airports";
import { jitter, sleep } from "./delay";

export type SortBy = "price" | "duration" | "departure" | "arrival";

export type FlightFilters = {
  stops?: (0 | 1 | 2)[];           // allowed stop counts; empty = any
  airlines?: string[];             // IATA codes; empty = any
  departureWindows?: Array<"early" | "morning" | "afternoon" | "evening" | "night">;
  maxPrice?: number;
  refundableOnly?: boolean;
};

function inWindow(iso: string, w: "early" | "morning" | "afternoon" | "evening" | "night") {
  const h = new Date(iso).getUTCHours();
  if (w === "early") return h >= 0 && h < 6;
  if (w === "morning") return h >= 6 && h < 12;
  if (w === "afternoon") return h >= 12 && h < 18;
  if (w === "evening") return h >= 18 && h < 21;
  return h >= 21 || h < 0;
}

export function applyFilters(offers: FlightOffer[], f: FlightFilters): FlightOffer[] {
  return offers.filter((o) => {
    if (f.stops?.length && !f.stops.includes(Math.min(o.stops, 2) as 0 | 1 | 2)) return false;
    if (f.airlines?.length && !f.airlines.includes(o.segments[0].airlineCode)) return false;
    if (f.maxPrice && o.basePrice > f.maxPrice) return false;
    if (f.refundableOnly && !o.refundable) return false;
    if (f.departureWindows?.length) {
      const ok = f.departureWindows.some((w) => inWindow(o.segments[0].depart, w));
      if (!ok) return false;
    }
    return true;
  });
}

export function sortOffers(offers: FlightOffer[], by: SortBy): FlightOffer[] {
  const cp = [...offers];
  switch (by) {
    case "price":
      return cp.sort((a, b) => a.basePrice - b.basePrice);
    case "duration":
      return cp.sort((a, b) => a.totalDurationMin - b.totalDurationMin);
    case "departure":
      return cp.sort(
        (a, b) => new Date(a.segments[0].depart).getTime() - new Date(b.segments[0].depart).getTime(),
      );
    case "arrival":
      return cp.sort(
        (a, b) =>
          new Date(a.segments.at(-1)!.arrive).getTime() -
          new Date(b.segments.at(-1)!.arrive).getTime(),
      );
  }
}

export async function searchFlights(
  input: FlightSearchInput,
): Promise<{ offers: FlightOffer[]; minPrice: number; maxPrice: number }> {
  await sleep(jitter(650));
  const offers = generateFlights(input);
  const minPrice = offers.reduce((m, o) => Math.min(m, o.basePrice), Infinity);
  const maxPrice = offers.reduce((m, o) => Math.max(m, o.basePrice), 0);
  return { offers, minPrice, maxPrice };
}

export async function getFlight(id: string): Promise<FlightOffer | null> {
  await sleep(jitter(350));
  return getFlightById(id);
}

export async function searchAirportOptions(q: string): Promise<Airport[]> {
  await sleep(jitter(120, 60));
  return searchAirports(q, 12);
}

export type { FlightOffer, FlightSearchInput, CabinClass };
