"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Hotel, Room } from "@/lib/mock/hotels";
import type { ContactInfo } from "./bookingStore";

export type HotelGuest = {
  firstName: string;
  lastName: string;
};

export type HotelBooking = {
  id: string;
  hotel: Hotel;
  room: Room;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  guests: HotelGuest[];
  contact: ContactInfo;
  addOns: { breakfast: boolean; insurance: boolean };
  totalPrice: number;
  taxes: number;
  status: "SELECTED" | "GUEST" | "PAYMENT" | "CONFIRMED";
  createdAt: string;
  confirmedAt?: string;
  bookingReference?: string;
};

type State = {
  current: HotelBooking | null;
  bookings: HotelBooking[];
};

type Actions = {
  startHotelBooking: (p: {
    hotel: Hotel;
    room: Room;
    checkIn: string;
    checkOut: string;
    rooms: number;
    adults: number;
    children: number;
  }) => void;
  setGuests: (guests: HotelGuest[]) => void;
  setContact: (contact: ContactInfo) => void;
  setAddOns: (addOns: Partial<HotelBooking["addOns"]>) => void;
  confirm: (ref: string) => void;
  clearCurrent: () => void;
};

function computeHotelTotals(room: Room, nights: number, rooms: number, addOns: HotelBooking["addOns"]) {
  const base = room.basePrice * nights * rooms;
  const breakfastCost = addOns.breakfast ? 650 * nights * rooms : 0;
  const insuranceCost = addOns.insurance ? 499 : 0;
  const subtotal = base + breakfastCost + insuranceCost;
  const taxes = Math.round(subtotal * 0.12);
  return { subtotal, taxes, total: subtotal + taxes };
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(diff / 86400000));
}

export const useHotelBookingStore = create<State & Actions>()(
  persist(
    (set) => ({
      current: null,
      bookings: [],
      startHotelBooking: ({ hotel, room, checkIn, checkOut, rooms, adults, children }) => {
        const nights = nightsBetween(checkIn, checkOut);
        const addOns: HotelBooking["addOns"] = { breakfast: room.breakfast, insurance: false };
        const { taxes, total } = computeHotelTotals(room, nights, rooms, addOns);
        set({
          current: {
            id: `HTL-BK-${Date.now().toString(36)}`,
            hotel,
            room,
            checkIn,
            checkOut,
            nights,
            rooms,
            adults,
            children,
            guests: [],
            contact: { email: "", phone: "", countryCode: "+91" },
            addOns,
            totalPrice: total,
            taxes,
            status: "SELECTED",
            createdAt: new Date().toISOString(),
          },
        });
      },
      setGuests: (guests) =>
        set((s) => (s.current ? { current: { ...s.current, guests, status: "GUEST" } } : s)),
      setContact: (contact) =>
        set((s) => (s.current ? { current: { ...s.current, contact } } : s)),
      setAddOns: (a) =>
        set((s) => {
          if (!s.current) return s;
          const addOns = { ...s.current.addOns, ...a };
          const { taxes, total } = computeHotelTotals(s.current.room, s.current.nights, s.current.rooms, addOns);
          return { current: { ...s.current, addOns, taxes, totalPrice: total } };
        }),
      confirm: (ref) =>
        set((s) => {
          if (!s.current) return s;
          const done: HotelBooking = {
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
      name: "spakstrip.hotel-bookings",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage),
      ),
      partialize: (s) => ({ bookings: s.bookings, current: s.current }),
    },
  ),
);

export { computeHotelTotals, nightsBetween };
