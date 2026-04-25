"use client";

import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";
import type { BusSeat } from "@/lib/busTypes";

type Props = {
  seats: BusSeat[];
  selectedSeats: string[];
  onToggle: (seatNumber: string) => void;
};

function SeatDeckSection({
  title,
  seats,
  selectedSeats,
  onToggle,
}: Props & { title: string }) {
  return (
    <section className="rounded-2xl border border-border-soft bg-surface-muted p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-ink">{title}</h3>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
          {seats.length} berths
        </span>
      </div>

      <div className="grid gap-3">
        {Array.from(new Set(seats.map((seat) => seat.row))).map((row) => {
          const rowSeats = seats.filter((seat) => seat.row === row);
          const gridClass =
            rowSeats[0]?.type === "seater"
              ? "grid-cols-[repeat(2,minmax(0,1fr))_24px_repeat(2,minmax(0,1fr))]"
              : "grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)_20px_minmax(0,1fr)]";

          return (
            <div key={row} className={`grid ${gridClass} gap-2`}>
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.seatNumber);
                const isBooked = seat.status === "booked";
                const spacerAfter = seat.type === "seater" ? seat.column === 1 : seat.column === 0 || seat.column === 1;

                return (
                  <div key={seat.seatNumber} className="contents">
                    <button
                      type="button"
                      onClick={() => onToggle(seat.seatNumber)}
                      disabled={isBooked}
                      className={cn(
                        "flex h-14 min-w-0 flex-col items-center justify-center rounded-lg border text-[11px] font-semibold transition-colors",
                        isSelected && "border-brand-600 bg-brand-600 text-white",
                        !isSelected && !isBooked && "border-border bg-white text-ink hover:border-brand-400 hover:bg-brand-50",
                        isBooked && "cursor-not-allowed border-border bg-surface-sunken text-ink-subtle opacity-70",
                      )}
                    >
                      <span>{seat.seatNumber}</span>
                      <span className="text-[10px] font-medium opacity-80">{formatINR(seat.price)}</span>
                    </button>
                    {spacerAfter ? <span aria-hidden className="block" /> : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function BusSeatMap({ seats, selectedSeats, onToggle }: Props) {
  const lowerSeats = seats.filter((seat) => seat.deck === "lower");
  const upperSeats = seats.filter((seat) => seat.deck === "upper");

  return (
    <div className="flex flex-col gap-4">
      {lowerSeats.length > 0 ? (
        <SeatDeckSection
          title={upperSeats.length > 0 ? "Lower Deck" : "Seat Layout"}
          seats={lowerSeats}
          selectedSeats={selectedSeats}
          onToggle={onToggle}
        />
      ) : null}
      {upperSeats.length > 0 ? (
        <SeatDeckSection
          title="Upper Deck"
          seats={upperSeats}
          selectedSeats={selectedSeats}
          onToggle={onToggle}
        />
      ) : null}
    </div>
  );
}
