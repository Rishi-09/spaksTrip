import type { FlightBooking } from "@/state/bookingStore";
import { formatINR } from "@/lib/format";

export default function PriceBreakdown({
  booking,
  showTotal = true,
}: {
  booking: FlightBooking;
  showTotal?: boolean;
}) {
  const { offer, fareFamily, pax, addOns } = booking;
  const base = offer.basePrice + fareFamily.priceDelta;
  const addsum = addOns.meals + addOns.seats + addOns.baggage + addOns.insurance;

  return (
    <div className="rounded-xl bg-white border border-border-soft p-5 shadow-[var(--shadow-xs)]">
      <h3 className="text-[15px] font-bold text-ink mb-3">Price summary</h3>
      <div className="flex flex-col gap-2 text-[13px]">
        {pax.adults > 0 && (
          <Row label={`Adult × ${pax.adults}`} value={formatINR(base * pax.adults)} />
        )}
        {pax.children > 0 && (
          <Row
            label={`Child × ${pax.children}`}
            value={formatINR(Math.round(base * 0.75) * pax.children)}
          />
        )}
        {pax.infants > 0 && (
          <Row
            label={`Infant × ${pax.infants}`}
            value={formatINR(Math.round(base * 0.1) * pax.infants)}
          />
        )}
        <Row label="Taxes & fees" value={formatINR(booking.taxes + booking.fees)} />
        {addOns.seats > 0 && <Row label="Seat selection" value={formatINR(addOns.seats)} />}
        {addOns.meals > 0 && <Row label="Meals" value={formatINR(addOns.meals)} />}
        {addOns.baggage > 0 && <Row label="Extra baggage" value={formatINR(addOns.baggage)} />}
        {addOns.insurance > 0 && <Row label="Insurance" value={formatINR(addOns.insurance)} />}
      </div>
      {showTotal && (
        <>
          <div className="my-4 h-px bg-border-soft" />
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-ink-soft">Total payable</span>
            <span className="text-[22px] font-extrabold text-ink">
              {formatINR(booking.totalPrice)}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-ink-muted">
            Incl. all taxes {addsum > 0 ? `& ₹${addsum.toLocaleString("en-IN")} add-ons` : ""}
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-soft">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
