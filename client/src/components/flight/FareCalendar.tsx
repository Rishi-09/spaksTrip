"use client";

import { useEffect, useRef, useState } from "react";
import { generateFlights } from "@/lib/mock/flights";
import { formatINR, formatWeekday, formatDayMonth } from "@/lib/format";
import type { CabinClass } from "@/lib/mock/flights";

type CalendarDay = {
  date: string;
  minFare: number;
  signal: "low" | "mid" | "high";
};

type Props = {
  from: string;
  to: string;
  cabin: CabinClass;
  depart: string;
  onDateChange: (date: string) => void;
};

function buildDates(center: string): string[] {
  const [y, m, d] = center.split("-").map(Number);
  const base = Date.UTC(y, m - 1, d);
  return Array.from({ length: 15 }, (_, i) => {
    const ts = base + (i - 7) * 86_400_000;
    const dt = new Date(ts);
    return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
  });
}

function computeFares(from: string, to: string, cabin: CabinClass, dates: string[]): CalendarDay[] {
  const raw = dates.map((date) => {
    const flights = generateFlights({ from, to, date, cabin, adults: 1, children: 0, infants: 0 });
    return { date, minFare: flights.length ? Math.min(...flights.map((f) => f.basePrice)) : 0 };
  });
  const valid = raw.filter((r) => r.minFare > 0).map((r) => r.minFare).sort((a, b) => a - b);
  const median = valid.length ? valid[Math.floor(valid.length / 2)] : 1;
  return raw.map(({ date, minFare }) => ({
    date,
    minFare,
    signal: minFare === 0 ? "high" : minFare < median * 0.95 ? "low" : minFare < median * 1.08 ? "mid" : "high",
  }));
}

const SIGNAL_DOT: Record<string, string> = {
  low: "bg-emerald-500",
  mid: "bg-amber-400",
  high: "bg-red-400",
};

export default function FareCalendar({ from, to, cabin, depart, onDateChange }: Props) {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const dates = buildDates(depart);
      setDays(computeFares(from, to, cabin, dates));
      setLoading(false);
    }, 160);
    return () => clearTimeout(timer);
  }, [from, to, cabin, depart]);

  // Scroll active date into view after loading
  useEffect(() => {
    if (loading || !scrollRef.current) return;
    const idx = days.findIndex((d) => d.date === depart);
    const el = scrollRef.current.children[idx] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [loading, days, depart]);

  return (
    <div className="bg-white border-b border-border-soft">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div
          ref={scrollRef}
          className="flex gap-1 overflow-x-auto snap-x snap-mandatory py-3 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
          role="list"
          aria-label="Fare calendar — select a date"
        >
          {loading
            ? Array.from({ length: 15 }, (_, i) => (
                <div
                  key={i}
                  className="shrink-0 snap-start w-[72px] h-[76px] rounded-lg bg-surface-muted animate-pulse"
                />
              ))
            : days.map((day) => {
                const active = day.date === depart;
                return (
                  <button
                    key={day.date}
                    type="button"
                    role="listitem"
                    aria-pressed={active}
                    aria-label={`${formatWeekday(day.date)} ${formatDayMonth(day.date)} — ${day.minFare > 0 ? formatINR(day.minFare) : "unavailable"}`}
                    onClick={() => !active && onDateChange(day.date)}
                    className={[
                      "shrink-0 snap-start w-[72px] flex flex-col items-center gap-0.5 rounded-lg border py-2.5 px-1 transition-all",
                      active
                        ? "border-brand-600 bg-brand-50"
                        : "border-transparent hover:border-border-soft hover:bg-surface-muted cursor-pointer",
                    ].join(" ")}
                  >
                    <span className={`text-[11px] font-semibold ${active ? "text-brand-600" : "text-ink-muted"}`}>
                      {formatWeekday(day.date)}
                    </span>
                    <span className={`text-[13px] font-bold leading-tight ${active ? "text-brand-700" : "text-ink"}`}>
                      {formatDayMonth(day.date)}
                    </span>
                    <span className={`text-[10px] font-semibold ${active ? "text-brand-600" : "text-ink-muted"}`}>
                      {day.minFare > 0 ? formatINR(day.minFare) : "—"}
                    </span>
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${SIGNAL_DOT[day.signal]}`} />
                  </button>
                );
              })}
        </div>
        <div className="flex items-center gap-3 pb-2 text-[10px] text-ink-muted">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />Lowest fare</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" />Mid range</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-400" />High fare</span>
        </div>
      </div>
    </div>
  );
}
