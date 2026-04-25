"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import Skeleton from "@/components/ui/Skeleton";
import Accordion from "@/components/ui/Accordion";
import TrainRouteStops from "@/components/rail/TrainRouteStops";
import CoachLayoutDiagram from "@/components/rail/CoachLayoutDiagram";
import ClassFareTable from "@/components/rail/ClassFareTable";
import ErrorState from "@/components/ui/ErrorState";
import { getTrain } from "@/services/trains";
import type { Train, TrainClass, Quota } from "@/lib/mock/trains";

export default function TrainDetailPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <TrainDetailInner />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col gap-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </main>
      <Footer />
    </div>
  );
}

const TYPE_COLOR: Record<string, string> = {
  rajdhani: "bg-red-600",
  shatabdi: "bg-orange-500",
  duronto: "bg-purple-600",
  superfast: "bg-brand-600",
  express: "bg-ink",
  "jan-shatabdi": "bg-teal-600",
  "garib-rath": "bg-emerald-600",
};

function durationStr(min: number) {
  return `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}m`;
}

function TrainDetailInner() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const highlightCls = (sp.get("cls") ?? "SL") as TrainClass;
  const quota = (sp.get("quota") ?? "GENERAL") as Quota;

  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTrain(id).then((t) => {
      if (t) setTrain(t);
      else setError(true);
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col gap-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </main>
      <Footer />
    </div>
  );

  if (error || !train) return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
        <ErrorState message="Train details not found." />
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 py-8">
        {/* Train header card */}
        <div className="rounded-xl bg-white border border-border-soft shadow-(--shadow-xs) p-5 mb-5">
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-wide ${TYPE_COLOR[train.type] ?? "bg-ink"}`}>
                  {train.type.replace("-", " ")}
                </span>
                <span className="text-[12px] font-mono text-ink-muted">#{train.number}</span>
                {train.pantry && <span className="text-[11px] text-ink-muted bg-surface-muted rounded px-1.5 py-0.5">🍽 Pantry</span>}
              </div>
              <h1 className="text-[20px] font-extrabold text-ink">{train.name}</h1>
              <p className="text-[12px] text-ink-muted mt-0.5">Runs on: {train.runsOn.join(", ")} · {train.distance} km</p>
            </div>

            {/* Journey summary */}
            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="text-[22px] font-extrabold text-ink">{train.departs}</p>
                <p className="text-[12px] font-semibold text-ink-muted">{train.fromCode}</p>
                <p className="text-[11px] text-ink-muted">{train.fromStation}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-[12px] text-ink-muted font-semibold">{durationStr(train.durationMin)}</p>
                <div className="flex items-center gap-1 w-24">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  <div className="flex-1 h-px bg-border" />
                  <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                </div>
              </div>
              <div>
                <p className="text-[22px] font-extrabold text-ink">{train.arrives}</p>
                <p className="text-[12px] font-semibold text-ink-muted">{train.toCode}</p>
                <p className="text-[11px] text-ink-muted">{train.toStation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class fare table */}
        <div className="mb-5">
          <h2 className="text-[16px] font-extrabold text-ink mb-3">Class & Availability</h2>
          <ClassFareTable train={train} quota={quota} />
        </div>

        {/* Route + Coach accordion */}
        <div className="rounded-xl bg-white border border-border-soft shadow-(--shadow-xs) overflow-hidden mb-5">
          <Accordion
            items={[
              {
                value: "route",
                title: `Route (${train.stops.length} stations)`,
                content: <TrainRouteStops stops={train.stops} />,
              },
              {
                value: "coach",
                title: `Coach Layout — ${highlightCls}`,
                content: <CoachLayoutDiagram cls={highlightCls} />,
              },
            ]}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
