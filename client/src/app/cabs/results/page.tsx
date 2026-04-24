"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import CabResultCard from "@/components/transport/CabResultCard";
import Chip from "@/components/ui/Chip";
import { searchCabs, type CabOffer, type CabType } from "@/services/cabs";
import Skeleton from "@/components/ui/Skeleton";

export default function CabResultsPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <CabResultsInner />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <main className="flex-1 p-8 max-w-3xl mx-auto w-full flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </main>
      <Footer />
    </div>
  );
}

const CAB_TYPE_ORDER: CabType[] = ["Mini", "Sedan", "SUV", "Luxury", "Van"];

function CabResultsInner() {
  const sp = useSearchParams();
  const from = sp.get("from") ?? "";
  const to = sp.get("to") ?? "";
  const date = sp.get("date") ?? "";

  const [cabs, setCabs] = useState<CabOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<CabType | "All">("All");

  useEffect(() => {
    if (!from || !to || !date) return;
    setLoading(true);
    searchCabs({ from, to, date }).then((results) => {
      setCabs(results);
      setLoading(false);
    });
  }, [from, to, date]);

  const displayed = typeFilter === "All" ? cabs : cabs.filter((c) => c.type === typeFilter);

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />

      <div className="bg-brand-900 text-white px-4 py-3 text-[13px] font-medium">
        <div className="mx-auto max-w-3xl flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-bold text-[15px]">{from} → {to}</span>
          {date && <span className="text-white/70">{date}</span>}
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 md:px-6 py-6">
          {/* Type filter chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Chip active={typeFilter === "All"} onClick={() => setTypeFilter("All")}>All</Chip>
            {CAB_TYPE_ORDER.map((t) => (
              <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>{t}</Chip>
            ))}
          </div>

          {loading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          )}

          {!loading && (
            <div className="flex flex-col gap-3" aria-live="polite">
              {displayed.length === 0 ? (
                <div className="rounded-xl bg-white border border-border-soft p-12 text-center">
                  <p className="text-[15px] font-semibold text-ink">No cabs available for this filter</p>
                </div>
              ) : (
                displayed.map((cab) => (
                  <CabResultCard key={cab.id} cab={cab} searchParams={sp.toString()} />
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
