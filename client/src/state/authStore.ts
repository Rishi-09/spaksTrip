"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "customer" | "partner" | "agent";

export type AuthUser = {
  name: string;
  email: string;
  role: UserRole;
};

type State = {
  user: AuthUser | null;
};

type Actions = {
  login: (user: AuthUser) => void;
  logout: () => void;
};

export const useAuthStore = create<State & Actions>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "spakstrip.auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage),
      ),
    },
  ),
);
