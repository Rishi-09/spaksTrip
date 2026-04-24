"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Train, TrainClass, Quota } from "@/lib/mock/trains";
import type { ContactInfo } from "./bookingStore";

export type BerthPref = "LB" | "MB" | "UB" | "SL" | "SU" | "NP";
export type MealChoice = "VEG" | "NON_VEG" | "NONE";
export type Concession = "NONE" | "SENIOR_M" | "SENIOR_F" | "CHILD" | "STUDENT";

export type TrainPassenger = {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F" | "T";
  berthPref: BerthPref;
  meal: MealChoice;
  concession: Concession;
};

export type TrainBooking = {
  id: string;
  train: Train;
  date: string;
  selectedClass: TrainClass;
  quota: Quota;
  farePerPassenger: number;
  passengers: TrainPassenger[];
  contact: ContactInfo;
  totalFare: number;
  status: "PASSENGER" | "PAYMENT" | "CONFIRMED";
  pnr?: string;
  chartStatus: "Chart not prepared" | "CHART PREPARED";
  waitlistPosition?: number;
  createdAt: string;
  confirmedAt?: string;
};

type State = {
  current: TrainBooking | null;
  bookings: TrainBooking[];
};

type Actions = {
  startTrainBooking: (p: { train: Train; selectedClass: TrainClass; quota: Quota; date: string; farePerPassenger: number }) => void;
  setPassengers: (passengers: TrainPassenger[]) => void;
  setContact: (contact: ContactInfo) => void;
  confirm: (pnr: string) => void;
  clearCurrent: () => void;
};

export const useTrainBookingStore = create<State & Actions>()(
  persist(
    (set) => ({
      current: null,
      bookings: [],
      startTrainBooking: ({ train, selectedClass, quota, date, farePerPassenger }) => {
        set({
          current: {
            id: `RAIL-${Date.now().toString(36)}`,
            train,
            date,
            selectedClass,
            quota,
            farePerPassenger,
            passengers: [],
            contact: { email: "", phone: "", countryCode: "+91" },
            totalFare: farePerPassenger,
            status: "PASSENGER",
            chartStatus: "Chart not prepared",
            createdAt: new Date().toISOString(),
          },
        });
      },
      setPassengers: (passengers) =>
        set((s) => {
          if (!s.current) return s;
          const totalFare = s.current.farePerPassenger * passengers.length;
          return { current: { ...s.current, passengers, totalFare } };
        }),
      setContact: (contact) =>
        set((s) => (s.current ? { current: { ...s.current, contact } } : s)),
      confirm: (pnr) =>
        set((s) => {
          if (!s.current) return s;
          const avail = s.current.train.classes.find((c) => c.cls === s.current!.selectedClass);
          const isWaitlist = avail && avail.status !== "AVAILABLE";
          const done: TrainBooking = {
            ...s.current,
            status: "CONFIRMED",
            pnr,
            chartStatus: "Chart not prepared",
            waitlistPosition: isWaitlist ? avail?.count : undefined,
            confirmedAt: new Date().toISOString(),
          };
          return { current: done, bookings: [done, ...s.bookings].slice(0, 30) };
        }),
      clearCurrent: () => set({ current: null }),
    }),
    {
      name: "spakstrip.train-bookings",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage),
      ),
      partialize: (s) => ({ bookings: s.bookings, current: s.current }),
    },
  ),
);
