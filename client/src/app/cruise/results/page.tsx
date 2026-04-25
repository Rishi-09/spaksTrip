"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import CruiseResultCard from "@/components/cruise/CruiseResultCard";
import Chip from "@/components/ui/Chip";
import { generateCruises, type CruiseOffer } from "@/lib/mock/cruises";
import { sleep } from "@/services/delay";
import Skeleton from "@/components/ui/Skeleton";

export default function CruiseResultsPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <CruiseResultsInner />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </main>
      <Footer />
    </div>
  );
}

const NIGHT_FILTERS = [
  { label: "All", value: "all" },
  { label: "3N", value: "3" },
  { label: "5N", value: "5" },
  { label: "7N", value: "7" },
  { label: "10N", value: "10" },
  { label: "14N", value: "14" },
];

function CruiseResultsInner() {
  const sp = useSearchParams();
  const port = sp.get("port") ?? "Mumbai";
  const month = sp.get("month") ?? "any";
  const nightsParam = sp.get("nights") ?? "any";

  const [cruises, setCruises] = useState<CruiseOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [nightFilter, setNightFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    sleep(700).then(() => {
      setCruises(generateCruises(port, month));
      setLoading(false);
    });
  }, [port, month]);

  const displayed = useMemo(() => {
    const nightsNum = nightFilter !== "all" ? parseInt(nightFilter) : null;
    return nightsNum ? cruises.filter((c) => c.nights === nightsNum) : cruises;
  }, [cruises, nightFilter]);

  // Apply initial nights filter from URL
  useEffect(() => {
    if (nightsParam && nightsParam !== "any") setNightFilter(nightsParam);
  }, [nightsParam]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />

      <div className="bg-brand-900 text-white px-4 py-3 text-[13px] font-medium">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-bold text-[15px]">Cruises from {port}</span>
          {month !== "any" && <span className="text-white/70">{month}</span>}
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-6">
          {/* Night filter chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {NIGHT_FILTERS.map((f) => (
              <Chip key={f.value} active={nightFilter === f.value} onClick={() => setNightFilter(f.value)}>
                {f.label}
              </Chip>
            ))}
          </div>

          {loading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          )}

          {!loading && (
            <div className="flex flex-col gap-3" aria-live="polite">
              {displayed.length === 0 ? (
                <div className="rounded-xl bg-white border border-border-soft p-12 text-center">
                  <p className="text-[15px] font-semibold text-ink">No cruises match this duration</p>
                  <button
                    type="button"
                    onClick={() => setNightFilter("all")}
                    className="mt-3 text-[13px] font-semibold text-brand-600 hover:underline"
                  >
                    Show all cruises
                  </button>
                </div>
              ) : (
                displayed.map((cruise) => (
                  <CruiseResultCard key={cruise.id} cruise={cruise} />
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
