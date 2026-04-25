"use client";

import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { formatINR } from "@/lib/format";
import type { Train, TrainClass, AvailStatus, Quota } from "@/lib/mock/trains";
import { useTrainBookingStore } from "@/state/trainBookingStore";

const AVAIL_TONE: Record<AvailStatus, "success" | "warn" | "danger" | "info"> = {
  AVAILABLE: "success",
  RAC:       "warn",
  GNWL:      "danger",
  TQWL:      "danger",
};

function availLabel(status: AvailStatus, count: number): string {
  if (status === "AVAILABLE") return `AVBL ${count}`;
  if (status === "RAC")       return `RAC ${count}`;
  return `${status} ${count}`;
}

const CLASS_FULL: Record<TrainClass, string> = {
  SL: "Sleeper (SL)",
  "3A": "AC 3 Tier (3A)",
  "2A": "AC 2 Tier (2A)",
  "1A": "AC First Class (1A)",
  CC: "Chair Car (CC)",
  EC: "Executive Chair (EC)",
};

type Props = { train: Train; quota: Quota };

export default function ClassFareTable({ train, quota }: Props) {
  const router = useRouter();
  const startTrainBooking = useTrainBookingStore((s) => s.startTrainBooking);

  const onBook = (cls: TrainClass, fare: number) => {
    startTrainBooking({ train, selectedClass: cls, quota, date: train.id.split("-").slice(3).join("-"), farePerPassenger: fare });
    router.push(`/rail/${train.id}/passengers?cls=${cls}`);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border-soft">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-muted">
            <th className="text-left text-[12px] font-semibold text-ink-muted px-4 py-3">Class</th>
            <th className="text-center text-[12px] font-semibold text-ink-muted px-4 py-3">Fare</th>
            <th className="text-center text-[12px] font-semibold text-ink-muted px-4 py-3">Availability</th>
            <th className="text-center text-[12px] font-semibold text-ink-muted px-4 py-3">Quota</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {train.classes.map((c, i) => (
            <tr key={c.cls} className={i % 2 === 0 ? "bg-white" : "bg-surface-muted/30"}>
              <td className="px-4 py-3">
                <p className="text-[13px] font-bold text-ink">{c.cls}</p>
                <p className="text-[11px] text-ink-muted">{CLASS_FULL[c.cls]}</p>
              </td>
              <td className="px-4 py-3 text-center">
                <p className="text-[15px] font-extrabold text-brand-700">{formatINR(c.fare)}</p>
                <p className="text-[10px] text-ink-muted">per person</p>
              </td>
              <td className="px-4 py-3 text-center">
                <Badge tone={AVAIL_TONE[c.status]} size="sm">
                  {availLabel(c.status, c.count)}
                </Badge>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="rounded bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-muted">{quota}</span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onBook(c.cls, c.fare)}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-brand-700 transition-colors"
                >
                  Book Now
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
