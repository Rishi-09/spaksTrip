import type { UserRole } from "@/lib/authClient";

export function isBusinessUser(role?: UserRole | null): boolean {
  return role === "partner" || role === "agent";
}

export function canAccessTaxiListings(role?: UserRole | null): boolean {
  return isBusinessUser(role);
}
