"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import DateRangePicker, { type DateRange } from "@/components/ui/DateRangePicker";
import { useFlightSearchStore } from "@/state/flightSearchStore";
import AirportField from "./AirportField";
import PassengerSelector from "./PassengerSelector";
import TripTypeTabs from "./TripTypeTabs";
import { toIsoDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";

type Props = { variant?: "hero" | "inline" };

export default function FlightSearchForm({ variant = "hero" }: Props) {
  const router = useRouter();
  const toast = useToast();

  const {
    tripType,
    legs,
    returnDate,
    cabin,
    pax,
    directOnly,
    setTripType,
    setLeg,
    addLeg,
    removeLeg,
    swapLeg,
    setReturnDate,
    setCabin,
    setPax,
    setDirectOnly,
    pushRecent,
  } = useFlightSearchStore();

  const [submitting, setSubmitting] = useState(false);

  const primaryLeg = legs[0];
  const returnRange: DateRange = useMemo(
    () => ({
      from: primaryLeg.date ? new Date(primaryLeg.date) : null,
      to: returnDate ? new Date(returnDate) : null,
    }),
    [primaryLeg.date, returnDate],
  );

  const onSearch = () => {
    if (!primaryLeg.from || !primaryLeg.to) {
      toast.push({ title: "Add origin and destination", tone: "warn" });
      return;
    }
    if (primaryLeg.from.code === primaryLeg.to.code) {
      toast.push({ title: "Origin and destination can't be the same", tone: "warn" });
      return;
    }
    if (!primaryLeg.date) {
      toast.push({ title: "Pick a departure date", tone: "warn" });
      return;
    }
    if (tripType === "ROUND" && !returnDate) {
      toast.push({ title: "Pick a return date", tone: "warn" });
      return;
    }

    setSubmitting(true);
    const params = new URLSearchParams({
      from: primaryLeg.from.code,
      to: primaryLeg.to.code,
      depart: primaryLeg.date,
      cabin,
      adults: String(pax.adults),
      children: String(pax.children),
      infants: String(pax.infants),
      trip: tripType,
      direct: directOnly ? "1" : "0",
    });
    if (tripType === "ROUND" && returnDate) params.set("return", returnDate);
    if (tripType === "MULTI" && legs[1]?.from && legs[1]?.to && legs[1]?.date) {
      params.set("from2", legs[1].from.code);
      params.set("to2", legs[1].to.code);
      params.set("depart2", legs[1].date);
    }

    pushRecent({
      id: `${primaryLeg.from.code}-${primaryLeg.to.code}-${primaryLeg.date}`,
      label: `${primaryLeg.from.city} → ${primaryLeg.to.city}`,
      when: new Date().toISOString(),
      from: primaryLeg.from.code,
      to: primaryLeg.to.code,
      date: primaryLeg.date,
    });

    router.push(`/flight/results?${params.toString()}`);
  };

  const isHero = variant === "hero";

  return (
    <div
      className={
        isHero
          ? "rounded-2xl bg-white p-5 shadow-[var(--shadow-lg)] md:p-6"
          : "rounded-xl bg-white p-4 shadow-[var(--shadow-sm)] border border-border-soft"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TripTypeTabs value={tripType} onChange={setTripType} />
        <div className="flex items-center gap-4">
          <Checkbox
            id="direct-only"
            label="Direct flights only"
            checked={directOnly}
            onChange={(e) => setDirectOnly(e.target.checked)}
          />
        </div>
      </div>

      {tripType !== "MULTI" ? (
        <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_auto_1fr_1.5fr_1fr]">
          <AirportField
            label="From"
            value={primaryLeg.from}
            onChange={(a) => setLeg(0, { from: a })}
          />
          <button
            type="button"
            aria-label="Swap origin and destination"
            onClick={() => swapLeg(0)}
            className="self-end mb-[3px] grid h-11 w-11 place-items-center rounded-full border border-border bg-white text-ink-soft hover:border-brand-500 hover:text-brand-600 transition-colors"
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="16 3 21 8 16 13" />
              <line x1="21" y1="8" x2="4" y2="8" />
              <polyline points="8 21 3 16 8 11" />
              <line x1="3" y1="16" x2="20" y2="16" />
            </svg>
          </button>
          <AirportField
            label="To"
            value={primaryLeg.to}
            onChange={(a) => setLeg(0, { to: a })}
          />
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-ink-muted">
              {tripType === "ROUND" ? "Depart — Return" : "Departure"}
            </span>
            <DateRangePicker
              mode={tripType === "ROUND" ? "range" : "single"}
              value={returnRange}
              onChange={(v) => {
                setLeg(0, { date: v.from ? toIsoDate(v.from) : null });
                setReturnDate(v.to ? toIsoDate(v.to) : null);
              }}
            />
          </div>
          <PassengerSelector
            pax={pax}
            cabin={cabin}
            onPaxChange={setPax}
            onCabinChange={setCabin}
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {legs.map((leg, i) => (
            <div key={i} className="grid gap-2 lg:grid-cols-[1fr_auto_1fr_1fr_auto]">
              <AirportField
                label={`From (${i + 1})`}
                value={leg.from}
                onChange={(a) => setLeg(i, { from: a })}
              />
              <button
                type="button"
                aria-label="Swap"
                onClick={() => swapLeg(i)}
                className="self-end mb-[3px] grid h-11 w-11 place-items-center rounded-full border border-border bg-white text-ink-soft hover:border-brand-500 hover:text-brand-600"
              >
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
                  <polyline points="16 3 21 8 16 13" />
                  <line x1="21" y1="8" x2="4" y2="8" />
                  <polyline points="8 21 3 16 8 11" />
                  <line x1="3" y1="16" x2="20" y2="16" />
                </svg>
              </button>
              <AirportField
                label={`To (${i + 1})`}
                value={leg.to}
                onChange={(a) => setLeg(i, { to: a })}
              />
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-ink-muted">Departure</span>
                <DateRangePicker
                  mode="single"
                  value={{ from: leg.date ? new Date(leg.date) : null, to: null }}
                  onChange={(v) => setLeg(i, { date: v.from ? toIsoDate(v.from) : null })}
                  labelFrom="Departure"
                  placeholderFrom="Pick date"
                />
              </div>
              <div className="flex items-end gap-2">
                {legs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeLeg(i)}
                    aria-label="Remove leg"
                    className="h-11 px-3 rounded-md border border-border text-ink-soft hover:bg-danger-50 hover:text-danger-600"
                  >
                    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-2 14H7L5 6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLeg}
              disabled={legs.length >= 5}
              leading={
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
                  <line x1={12} y1={5} x2={12} y2={19} />
                  <line x1={5} y1={12} x2={19} y2={12} />
                </svg>
              }
            >
              Add another flight
            </Button>
            <PassengerSelector
              pax={pax}
              cabin={cabin}
              onPaxChange={setPax}
              onCabinChange={setCabin}
            />
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <PopularRoutes />
        <Button onClick={onSearch} loading={submitting} size="xl" variant="accent" className="min-w-[180px]">
          Search Flights
        </Button>
      </div>
    </div>
  );
}

const POPULAR: Array<{ from: string; to: string; label: string }> = [
  { from: "DEL", to: "BOM", label: "Delhi → Mumbai" },
  { from: "BLR", to: "GOI", label: "Bengaluru → Goa" },
  { from: "BOM", to: "DXB", label: "Mumbai → Dubai" },
  { from: "DEL", to: "LHR", label: "Delhi → London" },
];

function PopularRoutes() {
  const { setLeg } = useFlightSearchStore();
  return (
    <div className="hidden md:flex items-center gap-2 overflow-hidden">
      <span className="text-[12px] font-medium text-ink-muted">Popular:</span>
      <div className="flex items-center gap-2 flex-wrap">
        {POPULAR.map((r) => (
          <button
            key={`${r.from}-${r.to}`}
            type="button"
            onClick={() => {
              import("@/lib/mock/airports").then(({ getAirport }) => {
                setLeg(0, { from: getAirport(r.from), to: getAirport(r.to) });
              });
            }}
            className="text-[12px] font-medium text-brand-700 hover:text-brand-800 hover:underline"
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
