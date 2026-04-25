import { formatINR } from "@/lib/format";
import type { BusBooking } from "@/lib/busTypes";

export default function BusBookingsList({ bookings }: { bookings: BusBooking[] }) {
  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => (
        <article
          key={booking.bookingId}
          className="rounded-2xl border border-border-soft bg-white p-5 shadow-(--shadow-xs)"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[18px] font-extrabold text-ink">
                  {booking.source} to {booking.destination}
                </h2>
                <span className="rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-semibold text-success-700">
                  {booking.status}
                </span>
              </div>
              <p className="text-[13px] text-ink-muted">
                {booking.operatorName} | {booking.busType} | {booking.travelDate}
              </p>
              <p className="text-[13px] text-ink-muted">
                {booking.departureTime} to {booking.arrivalTime}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">Seats</p>
                <p className="mt-1 text-[14px] font-bold text-ink">{booking.selectedSeats.join(", ")}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">Booking ID</p>
                <p className="mt-1 text-[14px] font-bold text-ink">{booking.bookingId}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">PNR</p>
                <p className="mt-1 text-[14px] font-bold text-ink">{booking.pnr}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">Amount</p>
                <p className="mt-1 text-[16px] font-black text-brand-700">{formatINR(booking.totalPrice)}</p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
