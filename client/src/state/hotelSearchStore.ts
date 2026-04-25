"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { City } from "@/lib/mock/hotels";

type RecentHotelSearch = {
  id: string;
  label: string;
  cityCode: string;
  when: string;
};

type State = {
  city: City | null;
  checkIn: string | null;
  checkOut: string | null;
  rooms: number;
  adults: number;
  children: number;
  recent: RecentHotelSearch[];
};

type Actions = {
  setCity: (c: City | null) => void;
  setCheckIn: (d: string | null) => void;
  setCheckOut: (d: string | null) => void;
  setRooms: (n: number) => void;
  setAdults: (n: number) => void;
  setChildren: (n: number) => void;
  pushRecent: (r: RecentHotelSearch) => void;
  reset: () => void;
};

const initial: State = {
  city: null,
  checkIn: null,
  checkOut: null,
  rooms: 1,
  adults: 2,
  children: 0,
  recent: [],
};

export const useHotelSearchStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,
      setCity: (city) => set({ city }),
      setCheckIn: (checkIn) => set({ checkIn }),
      setCheckOut: (checkOut) => set({ checkOut }),
      setRooms: (rooms) => set({ rooms }),
      setAdults: (adults) => set({ adults }),
      setChildren: (children) => set({ children }),
      pushRecent: (r) =>
        set((s) => ({
          recent: [r, ...s.recent.filter((x) => x.id !== r.id)].slice(0, 8),
        })),
      reset: () => {
        const prev = get().recent;
        set({ ...initial, recent: prev });
      },
    }),
    {
      name: "spakstrip.hotel-search",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage),
      ),
      partialize: (s) => ({ recent: s.recent, rooms: s.rooms, adults: s.adults }),
    },
  ),
);
