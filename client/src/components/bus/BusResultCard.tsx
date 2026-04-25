import Link from "next/link";
import Button from "@/components/ui/Button";
import { formatDuration, formatINR } from "@/lib/format";
import type { BusSearchResult } from "@/lib/busTypes";

export default function BusResultCard({
  bus,
  travelDate,
}: {
  bus: BusSearchResult;
  travelDate: string;
}) {
  return (
    <article className="rounded-2xl border border-border-soft bg-white p-5 shadow-(--shadow-xs) transition-shadow hover:shadow-(--shadow-md)">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[18px] font-extrabold text-ink">{bus.operatorName}</h3>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
              {bus.busType}
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto] md:items-center">
            <div>
              <p className="text-[26px] font-black text-ink">{bus.departureTime}</p>
              <p className="text-[13px] text-ink-muted">{bus.source}</p>
              <p className="text-[12px] text-ink-subtle">{bus.boardingPoint}</p>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                {formatDuration(bus.durationMinutes)}
              </p>
              <div className="flex w-28 items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-brand-500" />
                <div className="h-px flex-1 bg-border" />
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-accent-500">
                  <path d="M3 12h18" />
                  <path d="M15 6l6 6-6 6" />
                </svg>
              </div>
            </div>

            <div>
              <p className="text-[26px] font-black text-ink">{bus.arrivalTime}</p>
              <p className="text-[13px] text-ink-muted">{bus.destination}</p>
              <p className="text-[12px] text-ink-subtle">{bus.droppingPoint}</p>
            </div>

            <div className="flex flex-col gap-1 rounded-xl bg-surface-muted p-3">
              <p className="text-[12px] font-medium text-ink-muted">Starting from</p>
              <p className="text-[22px] font-black text-brand-700">{formatINR(bus.price)}</p>
              <p className="text-[12px] text-success-700">{bus.seatsAvailable} seats left</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {bus.amenities.map((amenity) => (
              <span key={amenity} className="rounded-full border border-border-soft px-3 py-1 text-[12px] text-ink-muted">
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:w-[180px]">
          <Link href={`/bus/${bus.id}?date=${encodeURIComponent(travelDate)}`}>
            <Button variant="primary" size="lg" fullWidth>
              View Seats
            </Button>
          </Link>
          <p className="text-center text-[12px] text-ink-subtle">Boarding and seat layout on next step</p>
        </div>
      </div>
    </article>
  );
}
