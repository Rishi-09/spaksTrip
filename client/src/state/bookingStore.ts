"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FlightOffer, FareFamily } from "@/lib/mock/flights";
import type { PaxCounts } from "./flightSearchStore";

export type TravelerType = "ADT" | "CHD" | "INF";
export type Gender = "M" | "F";

export type Traveler = {
  id: string;
  type: TravelerType;
  title: "Mr" | "Ms" | "Mrs" | "Mstr" | "Miss";
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string | null;       // YYYY-MM-DD
  addressLine1: string;     // required by TBO rule 5
  city: string;             // required by TBO rule 5
  passport?: string;
  passportExpiry?: string;  // YYYY-MM-DD
  nationality?: string;
  meal?: string;
  seat?: string;
};

export type ContactInfo = {
  email: string;
  phone: string;
  countryCode: string;
};

// Mirrors TboFareBreakdown — kept in PascalCase so it passes straight through to the API.
export type FareBreakdownItem = {
  PassengerType: number;    // 1=ADT, 2=CHD, 3=INF
  PassengerCount: number;
  BaseFare: number;
  Tax: number;
  YQTax: number;
  Currency: string;
  AdditionalTxnFeeOfrd?: number;
  AdditionalTxnFeePub?: number;
};

export type FlightBooking = {
  id: string;             // PNR-like id
  offer: FlightOffer;
  fareFamily: FareFamily;
  pax: PaxCounts;
  travelers: Traveler[];
  contact: ContactInfo;
  totalPrice: number;
  taxes: number;
  fees: number;
  addOns: { meals: number; seats: number; baggage: number; insurance: number };
  status: "CART" | "TRAVELER" | "PAYMENT" | "CONFIRMED";
  createdAt: string;
  confirmedAt?: string;
  // Set after FareQuote on the review page
  quoteTraceId?: string;
  isLCC?: boolean;
  fareBreakdown?: FareBreakdownItem[];
  // Set after real Book/Ticket API calls
  bookingId?: number;
  pnr?: string;
  ticketNumbers?: string[];
  bookingReference?: string;
};

type State = {
  current: FlightBooking | null;
  bookings: FlightBooking[];
};

type Actions = {
  startFlightBooking: (p: { offer: FlightOffer; fareFamily: FareFamily; pax: PaxCounts }) => void;
  setTravelers: (t: Traveler[]) => void;
  setContact: (c: ContactInfo) => void;
  setAddOns: (a: Partial<FlightBooking["addOns"]>) => void;
  advanceStatus: (s: FlightBooking["status"]) => void;
  storeFareQuote: (d: { traceId: string; isLCC: boolean; fareBreakdown: FareBreakdownItem[] }) => void;
  storeBookingResult: (r: { bookingId: number; pnr: string; ticketNumbers: string[] }) => void;
  confirm: (ref: string) => void;
  clearCurrent: () => void;
};

function computeTotals(offer: FlightOffer, fareFamily: FareFamily, pax: PaxCounts) {
  const base = offer.basePrice + fareFamily.priceDelta;
  const adultsCost = base * pax.adults;
  const childrenCost = Math.round(base * 0.75) * pax.children;
  const infantsCost = Math.round(base * 0.1) * pax.infants;
  const subtotal = adultsCost + childrenCost + infantsCost;
  const taxes = Math.round(subtotal * 0.16);
  const fees = 349 + 99 * (pax.adults + pax.children);
  return { subtotal, taxes, fees, total: subtotal + taxes + fees };
}

export const useBookingStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      current: null,
      bookings: [],
      startFlightBooking: ({ offer, fareFamily, pax }) => {
        const { taxes, fees, total } = computeTotals(offer, fareFamily, pax);
        const id = `${offer.id}-${Date.now().toString(36)}`;
        set({
          current: {
            id,
            offer,
            fareFamily,
            pax,
            travelers: [],
            contact: { email: "", phone: "", countryCode: "+91" },
            addOns: { meals: 0, seats: 0, baggage: 0, insurance: 0 },
            totalPrice: total,
            taxes,
            fees,
            status: "CART",
            createdAt: new Date().toISOString(),
          },
        });
      },
      setTravelers: (travelers) =>
        set((s) => (s.current ? { current: { ...s.current, travelers } } : s)),
      setContact: (contact) =>
        set((s) => (s.current ? { current: { ...s.current, contact } } : s)),
      setAddOns: (a) =>
        set((s) => {
          if (!s.current) return s;
          const addOns = { ...s.current.addOns, ...a };
          const add = addOns.meals + addOns.seats + addOns.baggage + addOns.insurance;
          const { taxes, fees, total } = computeTotals(s.current.offer, s.current.fareFamily, s.current.pax);
          return { current: { ...s.current, addOns, taxes, fees, totalPrice: total + add } };
        }),
      advanceStatus: (status) =>
        set((s) => (s.current ? { current: { ...s.current, status } } : s)),
      storeFareQuote: ({ traceId, isLCC, fareBreakdown }) =>
        set((s) =>
          s.current
            ? { current: { ...s.current, quoteTraceId: traceId, isLCC, fareBreakdown } }
            : s,
        ),
      storeBookingResult: ({ bookingId, pnr, ticketNumbers }) =>
        set((s) =>
          s.current
            ? { current: { ...s.current, bookingId, pnr, ticketNumbers } }
            : s,
        ),
      confirm: (ref) =>
        set((s) => {
          if (!s.current) return s;
          const done: FlightBooking = {
            ...s.current,
            status: "CONFIRMED",
            confirmedAt: new Date().toISOString(),
            bookingReference: ref,
          };
          return { current: done, bookings: [done, ...s.bookings].slice(0, 30) };
        }),
      clearCurrent: () => set({ current: null }),
    }),
    {
      name: "spakstrip.bookings",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage),
      ),
      partialize: (s) => ({ bookings: s.bookings, current: s.current }),
    },
  ),
);

export { computeTotals };
