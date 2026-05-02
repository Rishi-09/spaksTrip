"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import TrainResultCard from "@/components/rail/TrainResultCard";
import TrainSearchForm from "@/components/rail/TrainSearchForm";
import TrainServiceNav from "@/components/rail/TrainServiceNav";
import Chip from "@/components/ui/Chip";
import Skeleton from "@/components/ui/Skeleton";
import { searchTrains } from "@/services/trains";
import type { Train, TrainType, TrainClass, Quota } from "@/lib/mock/trains";
import InventoryUnavailable from "@/components/shared/InventoryUnavailable";

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

  return (
    <RailResultsContent
      key={`${fromCode}-${toCode}-${date}-${cls}-${quota}`}
      fromCode={fromCode}
      toCode={toCode}
      date={date}
      cls={cls}
      quota={quota}
    />
  );
}

function RailResultsContent({
  fromCode,
  toCode,
  date,
  cls,
  quota,
}: {
  fromCode: string;
  toCode: string;
  date: string;
  cls: TrainClass;
  quota: Quota;
}) {

  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TrainType | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("departs");

  useEffect(() => {
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

      <section className="bg-brand-900 px-4 py-6 text-white md:px-6">
        <div className="mx-auto max-w-5xl">
          <TrainServiceNav current="search" className="mb-5" />
          <div className="max-w-3xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-white/65">
              Train Search
            </p>
            <h1 className="mt-2 text-[30px] font-black leading-tight">
              {fromCode} to {toCode}
            </h1>
            <p className="mt-2 text-[14px] text-white/72">
              Refine your journey, compare train types, and continue into the
              existing rail booking flow without leaving the train section.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
              <span className="rounded-full bg-white/12 px-3 py-1 font-semibold">
                {date}
              </span>
              <span className="rounded-full bg-white/12 px-3 py-1 font-semibold">
                Class {cls}
              </span>
              <span className="rounded-full bg-white/12 px-3 py-1 font-semibold">
                {quota}
              </span>
            </div>
          </div>
          <div className="mt-6">
            <TrainSearchForm
              key={`${fromCode}-${toCode}-${date}-${cls}-${quota}`}
              variant="inline"
              initialValues={{ fromCode, toCode, date, cls, quota }}
            />
          </div>
        </div>
      </section>

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-6 md:px-6">
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

        {!loading ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[14px] font-semibold text-ink">
              {displayed.length} train{displayed.length === 1 ? "" : "s"} found
            </p>
            <p className="text-[12px] text-ink-muted">
              Powered by the existing rail availability flow
            </p>
          </div>
        ) : null}

        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-3" aria-live="polite">
            {displayed.length === 0 ? (
              <div className="rounded-xl bg-white border border-border-soft">
                <InventoryUnavailable
                  title="Train inventory is currently unavailable"
                  subtitle="This rail flow no longer shows generated train availability. Connect a live rail source to restore results."
                  href="/train"
                  ctaLabel="Back to Train Search"
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
