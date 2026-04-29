"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Combobox, { type ComboOption } from "@/components/ui/Combobox";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { searchStationOptions } from "@/services/trains";
import { STATIONS, type TrainClass, type Quota } from "@/lib/mock/trains";

const CLASSES: Array<{ value: TrainClass; label: string }> = [
  { value: "SL", label: "Sleeper (SL)" },
  { value: "3A", label: "AC 3 Tier (3A)" },
  { value: "2A", label: "AC 2 Tier (2A)" },
  { value: "1A", label: "AC First (1A)" },
  { value: "CC", label: "Chair Car (CC)" },
  { value: "EC", label: "Exec. Chair (EC)" },
];

const QUOTAS: Array<{ value: Quota; label: string }> = [
  { value: "GENERAL", label: "General" },
  { value: "TATKAL", label: "Tatkal" },
  { value: "LADIES", label: "Ladies" },
];

function stationToOption(s: { code: string; name: string; city: string }): ComboOption {
  return { value: s.code, label: s.name, sublabel: `${s.code} · ${s.city}` };
}

const today = new Date().toISOString().slice(0, 10);

function stationCodeToOption(code: string | null | undefined): ComboOption | null {
  if (!code) return null;
  const station = STATIONS.find((item) => item.code === code);
  if (!station) return null;
  return stationToOption(station);
}

type Props = {
  variant?: "hero" | "inline";
  searchPath?: string;
  initialValues?: {
    fromCode?: string | null;
    toCode?: string | null;
    date?: string | null;
    cls?: TrainClass | null;
    quota?: Quota | null;
  };
};

export default function TrainSearchForm({
  variant = "hero",
  searchPath = "/rail/results",
  initialValues,
}: Props) {
  const router = useRouter();
  const [from, setFrom] = useState<ComboOption | null>(
    stationCodeToOption(initialValues?.fromCode),
  );
  const [to, setTo] = useState<ComboOption | null>(
    stationCodeToOption(initialValues?.toCode),
  );
  const [date, setDate] = useState(initialValues?.date ?? today);
  const [cls, setCls] = useState<TrainClass>(initialValues?.cls ?? "SL");
  const [quota, setQuota] = useState<Quota>(initialValues?.quota ?? "GENERAL");

  const swap = () => {
    const tmp = from;
    setFrom(to);
    setTo(tmp);
  };

  const searchFrom = (q: string) =>
    searchStationOptions(q).map(stationToOption);

  const onSearch = () => {
    if (!from || !to || !date) return;
    const params = new URLSearchParams({ from: from.value, to: to.value, date, cls, quota });
    router.push(`${searchPath}?${params}`);
  };

  return (
    <div
      className={
        variant === "hero"
          ? "rounded-2xl bg-white p-5 shadow-(--shadow-lg)"
          : "rounded-2xl border border-border-soft bg-white p-5 shadow-(--shadow-sm)"
      }
    >
      {/* Station row */}
      <div className="flex flex-col md:flex-row items-stretch gap-3">
        <div className="flex-1">
          <Combobox
            label="From Station"
            placeholder="City or station code"
            value={from}
            onChange={setFrom}
            search={searchFrom}
            minQuery={0}
            leading={
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-brand-500">
                <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" />
              </svg>
            }
          />
        </div>

        {/* Swap */}
        <button
          type="button"
          onClick={swap}
          aria-label="Swap stations"
          className="self-center md:mt-5 h-9 w-9 shrink-0 flex items-center justify-center rounded-full border border-border bg-surface-muted hover:bg-brand-50 hover:border-brand-400 transition-colors"
        >
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 16V4m0 0L3 8m4-4l4 4" />
            <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        <div className="flex-1">
          <Combobox
            label="To Station"
            placeholder="City or station code"
            value={to}
            onChange={setTo}
            search={searchFrom}
            minQuery={0}
            leading={
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-accent-500">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-[12px] font-semibold text-ink-muted">Date of Journey</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 rounded-lg border border-border bg-white px-3 text-[14px] text-ink outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Class + Quota + Search */}
      <div className="mt-4 flex flex-wrap items-end gap-4 justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold text-ink-muted">Class</span>
          <div className="flex flex-wrap gap-1.5">
            {CLASSES.map((c) => (
              <Chip key={c.value} active={cls === c.value} onClick={() => setCls(c.value)}>
                {c.value}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold text-ink-muted">Quota</span>
          <div className="flex gap-1.5">
            {QUOTAS.map((q) => (
              <Chip key={q.value} active={quota === q.value} onClick={() => setQuota(q.value)}>
                {q.label}
              </Chip>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onSearch}
          disabled={!from || !to || !date}
          className="min-w-[140px]"
        >
          Search Trains
        </Button>
      </div>
    </div>
  );
}
