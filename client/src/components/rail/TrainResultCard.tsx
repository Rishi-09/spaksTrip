import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatINR } from "@/lib/format";
import type { Train, AvailStatus, TrainClass } from "@/lib/mock/trains";

const TYPE_COLOR: Record<string, string> = {
  rajdhani:       "bg-red-600 text-white",
  shatabdi:       "bg-orange-500 text-white",
  duronto:        "bg-purple-600 text-white",
  superfast:      "bg-brand-600 text-white",
  express:        "bg-ink text-white",
  "jan-shatabdi": "bg-teal-600 text-white",
  "garib-rath":   "bg-emerald-600 text-white",
};

const AVAIL_TONE: Record<AvailStatus, "success" | "warn" | "danger" | "info"> = {
  AVAILABLE: "success",
  RAC:       "warn",
  GNWL:      "danger",
  TQWL:      "danger",
};

function availLabel(cls: string, status: AvailStatus, count: number): string {
  if (status === "AVAILABLE") return `AVBL ${count}`;
  if (status === "RAC")       return `RAC ${count}`;
  return `${status} ${count}`;
}

function durationStr(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

type Props = { train: Train; searchCls?: TrainClass };

export default function TrainResultCard({ train, searchCls }: Props) {
  const classesToShow = train.classes.slice(0, 4);
  const cheapest = [...train.classes].sort((a, b) => a.fare - b.fare)[0];

  return (
    <div className="rounded-xl bg-white border border-border-soft shadow-(--shadow-xs) hover:shadow-(--shadow-sm) transition-shadow overflow-hidden">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border-soft/60">
        <div className="flex items-center gap-3">
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${TYPE_COLOR[train.type] ?? "bg-ink text-white"}`}>
            {train.type.replace("-", " ")}
          </span>
          <div>
            <p className="text-[14px] font-extrabold text-ink">{train.name}</p>
            <p className="text-[11px] text-ink-muted">#{train.number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-ink-muted">
          {train.pantry && (
            <span className="flex items-center gap-1 rounded bg-surface-muted px-2 py-0.5">
              <svg viewBox="0 0 24 24" width={10} height={10} fill="currentColor" aria-hidden className="text-success-500"><path d="M18 4v1h-2V4a1 1 0 0 0-2 0v1h-2V4a1 1 0 0 0-2 0v1H8V4a1 1 0 0 0-2 0v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4a1 1 0 0 0-2 0z" /></svg>
              Pantry
            </span>
          )}
          <span>{train.runsOn.join(", ")}</span>
        </div>
      </div>

      {/* Journey row */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-4">
        <div className="flex flex-1 items-center gap-3 min-w-[200px]">
          <div className="text-center">
            <p className="text-[20px] font-extrabold text-ink">{train.departs}</p>
            <p className="text-[11px] font-semibold text-ink-muted">{train.fromCode}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <p className="text-[11px] text-ink-muted">{durationStr(train.durationMin)}</p>
            <div className="w-full flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              <div className="flex-1 h-px bg-border" />
              <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            </div>
            <p className="text-[11px] text-ink-muted">{train.stops.length - 2} stops · {train.distance} km</p>
          </div>
          <div className="text-center">
            <p className="text-[20px] font-extrabold text-ink">{train.arrives}</p>
            <p className="text-[11px] font-semibold text-ink-muted">{train.toCode}</p>
          </div>
        </div>

        {/* Class availability chips */}
        <div className="flex flex-wrap gap-2">
          {classesToShow.map((c) => (
            <Link
              key={c.cls}
              href={`/rail/${train.id}?cls=${c.cls}`}
              className={`flex flex-col items-center rounded-lg border px-3 py-2 text-center transition-colors hover:border-brand-400 ${
                searchCls === c.cls ? "border-brand-500 bg-brand-50" : "border-border bg-surface-muted/50"
              }`}
            >
              <span className="text-[12px] font-extrabold text-ink">{c.cls}</span>
              <span className="text-[10px] font-medium text-ink-muted">{formatINR(c.fare)}</span>
              <Badge tone={AVAIL_TONE[c.status]} size="sm" className="mt-1">
                {availLabel(c.cls, c.status, c.count)}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
