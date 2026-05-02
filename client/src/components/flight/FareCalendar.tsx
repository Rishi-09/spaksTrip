"use client";

import { useEffect, useMemo, useRef } from "react";
import { formatWeekday, formatDayMonth } from "@/lib/format";
import type { CabinClass } from "@/lib/mock/flights";

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

export default function FareCalendar({ from, to, cabin, depart, onDateChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const days = useMemo(() => {
    void from;
    void to;
    void cabin;
    return buildDates(depart).map((date) => ({ date }));
  }, [from, to, cabin, depart]);

  // Scroll active date into view after loading
  useEffect(() => {
    if (!scrollRef.current) return;
    const idx = days.findIndex((d) => d.date === depart);
    const el = scrollRef.current.children[idx] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [days, depart]);

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
          {days.map((day) => {
            const active = day.date === depart;
            return (
              <button
                key={day.date}
                type="button"
                aria-pressed={active}
                aria-label={`${formatWeekday(day.date)} ${formatDayMonth(day.date)}`}
                onClick={() => !active && onDateChange(day.date)}
                className={[
                  "shrink-0 snap-start w-[88px] flex flex-col items-center gap-0.5 rounded-lg border py-2.5 px-1 transition-all",
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
                  Select date
                </span>
              </button>
            );
          })}
        </div>
        <div className="pb-2 text-[10px] text-ink-muted">
          Browse nearby dates. Prices load from live search results after you select a departure day.
        </div>
      </div>
    </div>
  );
}
