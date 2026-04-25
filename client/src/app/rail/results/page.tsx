"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import TrainResultCard from "@/components/rail/TrainResultCard";
import Chip from "@/components/ui/Chip";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { searchTrains } from "@/services/trains";
import type { Train, TrainType, TrainClass, Quota } from "@/lib/mock/trains";

export default function RailResultsPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <RailResultsInner />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
      </main>
      <Footer />
    </div>
  );
}

const TYPE_FILTERS: Array<{ value: TrainType | "all"; label: string }> = [
  { value: "all",           label: "All" },
  { value: "rajdhani",      label: "Rajdhani" },
  { value: "shatabdi",      label: "Shatabdi" },
  { value: "duronto",       label: "Duronto" },
  { value: "superfast",     label: "Superfast" },
  { value: "express",       label: "Express" },
  { value: "garib-rath",    label: "Garib Rath" },
];

type SortBy = "departs" | "arrives" | "duration" | "fare";

function RailResultsInner() {
  const sp = useSearchParams();
  const fromCode = sp.get("from") ?? "NDLS";
  const toCode   = sp.get("to") ?? "HWH";
  const date     = sp.get("date") ?? new Date().toISOString().slice(0, 10);
  const cls      = (sp.get("cls") ?? "SL") as TrainClass;
  const quota    = (sp.get("quota") ?? "GENERAL") as Quota;

  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TrainType | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("departs");

  useEffect(() => {
    setLoading(true);
    searchTrains({ fromCode, toCode, date, quota }).then((res) => {
      setTrains(res);
      setLoading(false);
    });
  }, [fromCode, toCode, date, quota]);

  const displayed = useMemo(() => {
    let list = typeFilter === "all" ? trains : trains.filter((t) => t.type === typeFilter);
    if (sortBy === "departs")  list = [...list].sort((a, b) => a.departs.localeCompare(b.departs));
    if (sortBy === "arrives")  list = [...list].sort((a, b) => a.arrives.localeCompare(b.arrives));
    if (sortBy === "duration") list = [...list].sort((a, b) => a.durationMin - b.durationMin);
    if (sortBy === "fare") {
      list = [...list].sort((a, b) => {
        const aFare = Math.min(...a.classes.map((c) => c.fare));
        const bFare = Math.min(...b.classes.map((c) => c.fare));
        return aFare - bFare;
      });
    }
    return list;
  }, [trains, typeFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />

      {/* Context bar */}
      <div className="bg-brand-900 text-white px-4 py-3">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <span className="font-extrabold text-[15px]">{fromCode} → {toCode}</span>
          <span className="text-white/70">{date}</span>
          <span className="rounded bg-white/15 px-2 py-0.5 font-semibold">{cls}</span>
          <span className="rounded bg-white/10 px-2 py-0.5 text-white/80">{quota}</span>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 py-6">
        {/* Filters + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((f) => (
              <Chip key={f.value} active={typeFilter === f.value} onClick={() => setTypeFilter(f.value)}>
                {f.label}
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ink-muted font-semibold">Sort:</span>
            {(["departs","arrives","duration","fare"] as SortBy[]).map((s) => (
              <Chip key={s} active={sortBy === s} onClick={() => setSortBy(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Chip>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-3" aria-live="polite">
            {displayed.length === 0 ? (
              <div className="rounded-xl bg-white border border-border-soft">
                <EmptyState
                  title="No trains found"
                  subtitle="Try changing the type filter or search for a different date."
                  cta={
                    <button type="button" onClick={() => setTypeFilter("all")} className="rounded-lg bg-brand-600 px-5 py-2 text-[13px] font-semibold text-white hover:bg-brand-700 transition-colors">
                      Show all types
                    </button>
                  }
                />
              </div>
            ) : (
              displayed.map((train) => (
                <TrainResultCard key={train.id} train={train} searchCls={cls} />
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
