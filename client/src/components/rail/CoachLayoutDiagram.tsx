import type { TrainClass } from "@/lib/mock/trains";

type Props = { cls: TrainClass };

const BERTHS: Record<TrainClass, { label: string; rows: number; cols: number; sideberth?: boolean }> = {
  SL:  { label: "Sleeper", rows: 9, cols: 6, sideberth: true },
  "3A":{ label: "AC 3 Tier", rows: 9, cols: 6, sideberth: true },
  "2A":{ label: "AC 2 Tier", rows: 9, cols: 4 },
  "1A":{ label: "AC First Class", rows: 6, cols: 2 },
  CC:  { label: "Chair Car", rows: 10, cols: 5 },
  EC:  { label: "Executive Chair Car", rows: 8, cols: 4 },
};

const BERTH_LABELS: Record<TrainClass, string[]> = {
  SL:   ["LB","MB","UB","LB","MB","UB","SL","SU",""],
  "3A": ["LB","MB","UB","LB","MB","UB","SL","SU",""],
  "2A": ["LB","UB","LB","UB"],
  "1A": ["L","U"],
  CC:   ["W","A","M","A","W"],
  EC:   ["W","A","A","W"],
};

export default function CoachLayoutDiagram({ cls }: Props) {
  const cfg = BERTHS[cls];
  const labels = BERTH_LABELS[cls];

  return (
    <div className="rounded-xl border border-border-soft bg-surface-muted/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] font-extrabold text-ink">{cls} — {cfg.label}</p>
          <p className="text-[11px] text-ink-muted mt-0.5">Seating / berth layout (illustrative)</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-success-100 border border-success-400" /> Available</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-warn-100 border border-warn-400" /> RAC</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-surface-sunken border border-border" /> Booked</span>
        </div>
      </div>

      {/* Coach boundary */}
      <div className="relative rounded-lg border-2 border-ink-soft/30 bg-white overflow-x-auto">
        {/* Top label */}
        <div className="flex border-b border-border-soft/50 px-2 py-1">
          {Array.from({ length: cfg.cols }, (_, i) => (
            <div key={i} className="flex-1 text-center text-[9px] font-bold text-ink-muted tracking-wider">
              {labels[i] ?? ""}
            </div>
          ))}
        </div>

        {/* Berth grid */}
        <div className="p-2 flex flex-col gap-1">
          {Array.from({ length: cfg.rows }, (_, row) => (
            <div key={row} className="flex gap-1">
              {Array.from({ length: cfg.cols }, (_, col) => {
                const n = row * cfg.cols + col;
                const state = n % 5 === 0 ? "booked" : n % 7 === 0 ? "rac" : "available";
                return (
                  <div
                    key={col}
                    className={`flex-1 min-w-[32px] rounded text-[9px] font-bold text-center py-1.5 ${
                      state === "booked"    ? "bg-surface-sunken text-ink-muted border border-border" :
                      state === "rac"       ? "bg-warn-50 text-warn-700 border border-warn-300" :
                                             "bg-success-50 text-success-700 border border-success-300"
                    }`}
                  >
                    {row * cfg.cols + col + 1}
                  </div>
                );
              })}
              {/* Side berth indicator for SL/3A */}
              {cfg.sideberth && (row % 3 === 2) && (
                <div className="w-8 rounded bg-surface-sunken border border-border text-[9px] font-bold text-ink-muted text-center py-1.5 ml-2">
                  S{Math.floor(row / 3) + 1}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Engine direction */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-bold text-ink-muted/40 tracking-widest select-none">
          ENGINE →
        </div>
      </div>
    </div>
  );
}
