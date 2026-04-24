"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type DateRange = { from: Date | null; to: Date | null };

type Props = {
  value: DateRange;
  onChange: (v: DateRange) => void;
  mode?: "range" | "single";
  minDate?: Date;
  placeholderFrom?: string;
  placeholderTo?: string;
  labelFrom?: string;
  labelTo?: string;
  className?: string;
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["S","M","T","W","T","F","S"];

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function stripTime(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function sameDay(a: Date, b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function between(d: Date, a: Date, b: Date) { const x=stripTime(d).getTime(), lo=Math.min(stripTime(a).getTime(),stripTime(b).getTime()), hi=Math.max(stripTime(a).getTime(),stripTime(b).getTime()); return x>=lo && x<=hi; }

export function formatDate(d: Date | null) {
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShort(d: Date | null) {
  if (!d) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function DateRangePicker({
  value,
  onChange,
  mode = "range",
  minDate,
  placeholderFrom = "Select date",
  placeholderTo = "Return",
  labelFrom = "Departure",
  labelTo = "Return",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(value.from ?? new Date()));
  const [pickingTo, setPickingTo] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const minStripped = minDate ? stripTime(minDate) : stripTime(new Date());

  const onDayClick = (d: Date) => {
    if (mode === "single") {
      onChange({ from: d, to: null });
      setOpen(false);
      return;
    }
    if (!value.from || (value.from && value.to) || pickingTo === false) {
      onChange({ from: d, to: null });
      setPickingTo(true);
      return;
    }
    if (stripTime(d) < stripTime(value.from)) {
      onChange({ from: d, to: value.from });
    } else {
      onChange({ from: value.from, to: d });
    }
    setPickingTo(false);
    setOpen(false);
  };

  const months = useMemo(() => [viewMonth, addMonths(viewMonth, 1)], [viewMonth]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setPickingTo(false);
        }}
        className="flex w-full gap-0 rounded-md border border-border bg-white h-14 items-center text-left hover:border-brand-400 transition-colors"
      >
        <DateCell label={labelFrom} value={value.from} placeholder={placeholderFrom} />
        {mode === "range" && (
          <>
            <span className="w-px self-stretch bg-border" />
            <DateCell label={labelTo} value={value.to} placeholder={placeholderTo} />
          </>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 left-0 rounded-xl bg-white shadow-[var(--shadow-pop)] border border-border-soft p-4 animate-pop-in w-[640px] max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, -1))}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface-muted text-ink"
              aria-label="Previous month"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface-muted text-ink"
              aria-label="Next month"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {months.map((m) => (
              <Month
                key={m.toISOString()}
                monthDate={m}
                value={value}
                min={minStripped}
                onPick={onDayClick}
              />
            ))}
          </div>
          {mode === "range" && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-soft text-[12px] text-ink-muted">
              <span>Click departure then return date</span>
              <button
                type="button"
                onClick={() => {
                  onChange({ from: null, to: null });
                  setPickingTo(false);
                }}
                className="font-semibold text-brand-700 hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DateCell({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: Date | null;
  placeholder: string;
}) {
  return (
    <div className="flex-1 min-w-0 px-4">
      <div className="text-[11px] font-medium text-ink-muted">{label}</div>
      <div className="text-[15px] font-semibold text-ink truncate">
        {value ? formatDate(value) : <span className="text-ink-subtle">{placeholder}</span>}
      </div>
    </div>
  );
}

function Month({
  monthDate,
  value,
  min,
  onPick,
}: {
  monthDate: Date;
  value: DateRange;
  min: Date;
  onPick: (d: Date) => void;
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysIn = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(new Date(year, month, d));

  return (
    <div>
      <div className="text-center text-[14px] font-semibold text-ink mb-2">
        {MONTHS_FULL[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {DOW.map((d, i) => (
          <div key={i} className="h-7 grid place-items-center text-[11px] font-semibold text-ink-subtle">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const disabled = stripTime(d) < min;
          const isFrom = value.from && sameDay(d, value.from);
          const isTo = value.to && sameDay(d, value.to);
          const inRange = value.from && value.to && between(d, value.from, value.to);
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onPick(d)}
              className={cn(
                "h-8 w-full rounded-md text-[13px] font-medium transition-colors",
                disabled && "text-ink-subtle cursor-not-allowed",
                !disabled && !inRange && "hover:bg-surface-muted text-ink",
                inRange && !(isFrom || isTo) && "bg-brand-50 text-brand-700",
                (isFrom || isTo) && "bg-brand-600 text-white",
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
