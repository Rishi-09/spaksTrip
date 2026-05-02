"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import TaxiPackageDestinationGrid from "@/components/transport/TaxiPackageDestinationGrid";
import { TAXI_PACKAGE_DESTINATIONS } from "@/lib/mock/taxiPackageDestinations";
import { TAXI_PACKAGE_DESTINATIONS_ROUTE } from "@/lib/taxiRoles";
import { toIsoDate } from "@/lib/format";

const TRUST_POINTS = [
  {
    title: "Verified drivers",
    description: "On-ground partners and chauffeurs screened before going live.",
  },
  {
    title: "Transparent fares",
    description: "Route pricing, package inclusions, and cab type shown clearly.",
  },
  {
    title: "Flexible coverage",
    description: "Airport runs, local city disposal, and regional sightseeing packages.",
  },
];

export default function TaxiPackageLanding() {
  const router = useRouter();
  const toast = useToast();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!pickup.trim()) {
      toast.push({ title: "Enter pickup location", tone: "warn" });
      return;
    }

    if (!drop.trim()) {
      toast.push({ title: "Enter drop location", tone: "warn" });
      return;
    }

    setSearching(true);
    const params = new URLSearchParams({
      from: pickup.trim(),
      to: drop.trim(),
      date: toIsoDate(new Date()),
      time: "10:00",
      mode: "oneway",
    });
    router.push(`/cabs/results?${params.toString()}`);
  };

  return (
    <main className="bg-surface-muted">
      <section className="relative overflow-hidden bg-brand-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,30,58,0.96),rgba(14,30,58,0.82))]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/85">
              Transport
            </span>
            <h1 className="mt-5 text-[34px] font-black leading-tight text-white sm:text-[48px]">
              Search from over 99,00,000 taxis
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/75 sm:text-[16px]">
              Compare airport pickups, local city rides, and long-distance taxi packages without changing the booking experience your customers already know.
            </p>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white p-5 shadow-[0_24px_80px_rgba(14,30,58,0.2)] sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
              <Input
                id="taxi-package-pickup"
                label="Pickup"
                value={pickup}
                onChange={(event) => setPickup(event.target.value)}
                placeholder="Enter pickup city, airport, or landmark"
                sizeVariant="lg"
              />
              <Input
                id="taxi-package-drop"
                label="Drop"
                value={drop}
                onChange={(event) => setDrop(event.target.value)}
                placeholder="Enter drop city or destination"
                sizeVariant="lg"
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="accent"
                  size="xl"
                  fullWidth
                  loading={searching}
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TRUST_POINTS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm"
              >
                <p className="text-[15px] font-bold text-white">{item.title}</p>
                <p className="mt-2 text-[13px] leading-6 text-white/72">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <TaxiPackageDestinationGrid
          title="Featured Taxi Package Destinations"
          subtitle="Popular regions your customers can explore once they move from the landing page into packages."
          destinations={TAXI_PACKAGE_DESTINATIONS}
          limit={3}
          ctaHref={TAXI_PACKAGE_DESTINATIONS_ROUTE}
          ctaLabel="View all destinations"
          cardHref={TAXI_PACKAGE_DESTINATIONS_ROUTE}
        />
      </section>
    </main>
  );
}
