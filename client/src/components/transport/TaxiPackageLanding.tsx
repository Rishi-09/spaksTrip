"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import TaxiPackageDestinationsGrid from "@/components/transport/TaxiPackageDestinationsGrid";
import { toIsoDate } from "@/lib/format";

const QUICK_FILTERS = [
  "Airport transfer",
  "Outstation cab",
  "Full day rental",
  "Sightseeing taxi",
];

export default function TaxiPackageLanding() {
  const router = useRouter();
  const toast = useToast();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = () => {
    if (!pickup.trim()) {
      toast.push({ title: "Enter pickup location", tone: "warn" });
      return;
    }

    if (!drop.trim()) {
      toast.push({ title: "Enter drop location", tone: "warn" });
      return;
    }

    setSubmitting(true);
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
    <>
      <section className="relative overflow-hidden bg-brand-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-brand-950/95 via-brand-900/82 to-brand-900/55" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/85">
              Taxi Package
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Search from over 99,00,000 taxis
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/76 sm:text-[16px]">
              Compare airport transfers, city rides, outstation cabs, and chauffeur-driven
              holiday packages from one booking surface.
            </p>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/20 bg-white/95 p-5 shadow-[0_24px_70px_rgba(9,20,41,0.28)] backdrop-blur sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
              <Input
                id="taxi-package-pickup"
                label="Pickup"
                value={pickup}
                onChange={(event) => setPickup(event.target.value)}
                placeholder="Enter city, airport, or locality"
                sizeVariant="lg"
              />
              <Input
                id="taxi-package-drop"
                label="Drop"
                value={drop}
                onChange={(event) => setDrop(event.target.value)}
                placeholder="Where do you want to go?"
                sizeVariant="lg"
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="accent"
                  size="xl"
                  fullWidth
                  loading={submitting}
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {QUICK_FILTERS.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-surface-muted px-3 py-1.5 text-[12px] font-medium text-ink-muted"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="bg-surface-muted">
        <TaxiPackageDestinationsGrid />
      </main>
    </>
  );
}
