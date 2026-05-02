"use client";

import Link from "next/link";
import { useEffect } from "react";
import TaxiPackageDestinationGrid from "@/components/transport/TaxiPackageDestinationGrid";
import { TAXI_PACKAGE_DESTINATIONS } from "@/lib/mock/taxiPackageDestinations";
import { ADD_YOUR_TAXI_ROUTE, isTaxiManagerRole } from "@/lib/taxiRoles";
import { useAuthStore } from "@/state/authStore";

export default function TaxiPackageDestinations() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    if (status === "idle") {
      void hydrate();
    }
  }, [hydrate, status]);

  return (
    <main className="bg-white">
      <section className="border-b border-border-soft bg-surface-muted/45">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-brand-700">
                Taxi Packages
              </p>
              <h1 className="mt-3 text-[34px] font-black tracking-tight text-ink sm:text-[42px]">
                Browse destinations for your next taxi package
              </h1>
              <p className="mt-4 text-[15px] leading-7 text-ink-muted">
                Explore regional taxi packages across India, from metro transfers to multi-stop sightseeing itineraries.
              </p>
            </div>

            {isTaxiManagerRole(user?.role) ? (
              <Link
                href={ADD_YOUR_TAXI_ROUTE}
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Add Your Taxi
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <TaxiPackageDestinationGrid
          title="Available package regions"
          subtitle="The destination grid stays frontend-driven so role-based navigation can swap between landing and package browsing without backend changes."
          destinations={TAXI_PACKAGE_DESTINATIONS}
        />
      </section>
    </main>
  );
}
