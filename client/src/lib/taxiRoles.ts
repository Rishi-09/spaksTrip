import type { UserRole } from "@/lib/authClient";

export const TAXI_PACKAGE_ROOT = "/taxi-package";
export const TAXI_PACKAGE_DESTINATIONS_ROUTE = "/taxi-package/destinations";
export const ADD_YOUR_TAXI_ROUTE = "/taxi-package/add-your-taxi";

export function isTaxiManagerRole(role?: UserRole | null): boolean {
  return role === "partner" || role === "agent";
}

export function shouldOpenTaxiDestinations(role?: UserRole | null): boolean {
  return role === "customer" || isTaxiManagerRole(role);
}

export function getTaxiPackageHref(role?: UserRole | null): string {
  return shouldOpenTaxiDestinations(role)
    ? TAXI_PACKAGE_DESTINATIONS_ROUTE
    : TAXI_PACKAGE_ROOT;
}
