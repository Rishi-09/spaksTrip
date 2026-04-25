import { formatDuration, formatINR } from "@/lib/format";
import type { BusSearchResult, BusSeat } from "@/lib/busTypes";

export default function BusBookingSummary({
  bus,
  travelDate,
  selectedSeats,
  totalPrice,
}: {
  bus: Omit<BusSearchResult, "seatsAvailable">;
  travelDate: string;
  selectedSeats: BusSeat[];
  totalPrice: number;
}) {
  return (
    <aside className="rounded-2xl border border-border-soft bg-white p-5 shadow-(--shadow-xs)">
      <h3 className="text-[17px] font-extrabold text-ink">Trip Summary</h3>
      <div className="mt-4 flex flex-col gap-3 text-[13px]">
        <div>
          <p className="text-[15px] font-bold text-ink">{bus.operatorName}</p>
          <p className="text-ink-muted">{bus.busType}</p>
        </div>
        <div className="rounded-xl bg-surface-muted p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[22px] font-black text-ink">{bus.departureTime}</p>
              <p className="text-ink-muted">{bus.source}</p>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-black text-ink">{bus.arrivalTime}</p>
              <p className="text-ink-muted">{bus.destination}</p>
            </div>
          </div>
          <p className="mt-2 text-center text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
            {formatDuration(bus.durationMinutes)} | {travelDate}
          </p>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Boarding</span>
          <span className="max-w-[180px] text-right text-ink">{bus.boardingPoint}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Dropping</span>
          <span className="max-w-[180px] text-right text-ink">{bus.droppingPoint}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Selected Seats</span>
          <span className="max-w-[180px] text-right font-semibold text-ink">
            {selectedSeats.length > 0 ? selectedSeats.map((seat) => seat.seatNumber).join(", ") : "None"}
          </span>
        </div>
        <div className="rounded-xl border border-border-soft p-3">
          <div className="flex flex-col gap-2">
            {selectedSeats.map((seat) => (
              <div key={seat.seatNumber} className="flex items-center justify-between">
                <span className="text-ink-muted">{seat.seatNumber}</span>
                <span className="font-semibold text-ink">{formatINR(seat.price)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border-soft pt-3">
          <span className="text-[14px] font-bold text-ink">Total</span>
          <span className="text-[20px] font-black text-brand-700">{formatINR(totalPrice)}</span>
        </div>
      </div>
    </aside>
  );
}
