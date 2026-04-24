"use client";

import { useState } from "react";
import type { FlightOffer } from "@/lib/mock/flights";
import { airlineName } from "@/lib/mock/flights";
import { getAirport } from "@/lib/mock/airports";
import { formatDuration, formatINR, formatTime } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import AirlineLogo from "./AirlineLogo";
import FareFamilyModal from "./FareFamilyModal";

type Props = {
  offer: FlightOffer;
  searchParams: string;
};

export default function FlightResultCard({ offer, searchParams }: Props) {
  const [open, setOpen] = useState(false);
  const [expand, setExpand] = useState(false);
  const firstSeg = offer.segments[0];
  const lastSeg = offer.segments[offer.segments.length - 1];

  return (
    <article className="rounded-xl bg-white border border-border-soft shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)] transition-shadow overflow-hidden">
      <div className="grid lg:grid-cols-[1fr_auto] gap-4">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <AirlineLogo code={firstSeg.airlineCode} size={38} />
              <div>
                <div className="text-[14px] font-semibold text-ink">
                  {airlineName(firstSeg.airlineCode)}
                </div>
                <div className="text-[11px] text-ink-muted">
                  {firstSeg.flightNumber} · {firstSeg.aircraft}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {offer.refundable && <Badge tone="success">Refundable</Badge>}
              {offer.seatsLeft <= 5 && (
                <Badge tone="danger">{offer.seatsLeft} seats left</Badge>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_2fr_1fr] items-center gap-3">
            <div>
              <div className="text-[22px] font-bold text-ink leading-none">
                {formatTime(firstSeg.depart)}
              </div>
              <div className="text-[12px] font-semibold text-ink-soft mt-1">
                {firstSeg.from} · {getAirport(firstSeg.from)?.city}
              </div>
              {firstSeg.fromTerminal && (
                <div className="text-[11px] text-ink-muted">Terminal {firstSeg.fromTerminal}</div>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="text-[11px] text-ink-muted">{formatDuration(offer.totalDurationMin)}</div>
              <div className="relative w-full my-1.5 flex items-center">
                <span className="h-px flex-1 bg-border" />
                <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden className="text-brand-500 mx-1">
                  <path d="M22 16v-2l-8.5-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8.5-2.5V19L8 20.5v1.5l4-1 4 1V20.5L13.5 19v-5.5L22 16z" />
                </svg>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="text-[11px] font-semibold">
                {offer.stops === 0 ? (
                  <span className="text-success-600">Non-stop</span>
                ) : (
                  <span className="text-warn-600">
                    {offer.stops} stop{offer.stops > 1 ? "s" : ""}
                    {offer.segments.length > 1 &&
                      ` · ${offer.segments
                        .slice(0, -1)
                        .map((s) => s.to)
                        .join(", ")}`}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[22px] font-bold text-ink leading-none">
                {formatTime(lastSeg.arrive)}
              </div>
              <div className="text-[12px] font-semibold text-ink-soft mt-1">
                {lastSeg.to} · {getAirport(lastSeg.to)?.city}
              </div>
              {lastSeg.toTerminal && (
                <div className="text-[11px] text-ink-muted">Terminal {lastSeg.toTerminal}</div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone="neutral">Cabin {offer.baggage.cabin} kg</Badge>
            <Badge tone="neutral">Check-in {offer.baggage.checkin} kg</Badge>
            <Badge tone="info">{offer.cabin.replace("_", " ")}</Badge>
          </div>

          <button
            type="button"
            onClick={() => setExpand((e) => !e)}
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:text-brand-800"
          >
            {expand ? "Hide" : "View"} flight details
            <svg
              viewBox="0 0 24 24"
              width={14}
              height={14}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className={expand ? "rotate-180 transition-transform" : "transition-transform"}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {expand && (
            <div className="mt-3 border-t border-border-soft pt-3 space-y-3">
              {offer.segments.map((s, i) => (
                <div key={s.id} className="flex gap-3 text-[12px]">
                  <div className="w-16 shrink-0 text-ink-muted">
                    {formatTime(s.depart)}
                    <div className="text-[10px]">{s.durationMin}m</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-ink">
                      {s.from} → {s.to} · {s.flightNumber}
                    </div>
                    <div className="text-ink-muted">
                      {getAirport(s.from)?.city} ({s.fromTerminal ?? "—"}) · {formatTime(s.depart)}
                      {"  →  "}
                      {getAirport(s.to)?.city} ({s.toTerminal ?? "—"}) · {formatTime(s.arrive)}
                    </div>
                    <div className="text-ink-muted">
                      {airlineName(s.airlineCode)} · {s.aircraft}
                    </div>
                  </div>
                  {i < offer.segments.length - 1 && (
                    <div className="text-[11px] text-warn-600 self-end font-semibold">
                      Layover in {s.to}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:border-l border-t lg:border-t-0 border-border-soft p-5 flex flex-col items-stretch lg:items-end justify-between gap-3 bg-surface-muted lg:bg-transparent">
          <div className="text-right">
            <div className="text-[11px] text-ink-muted">starting from</div>
            <div className="text-2xl font-extrabold text-ink leading-none">
              {formatINR(offer.basePrice)}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">per adult, incl. taxes</div>
          </div>
          <div className="flex flex-col gap-2 lg:min-w-[180px]">
            <Button variant="accent" onClick={() => setOpen(true)}>
              Book now
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              View fare options
            </Button>
          </div>
        </div>
      </div>

      <FareFamilyModal
        open={open}
        onClose={() => setOpen(false)}
        offer={offer}
        searchParams={searchParams}
      />
    </article>
  );
}
