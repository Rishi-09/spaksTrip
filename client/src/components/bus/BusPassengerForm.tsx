"use client";

import Input from "@/components/ui/Input";
import type { BusContact, BusPassenger } from "@/lib/busTypes";

type Props = {
  passengers: BusPassenger[];
  contact: BusContact;
  errors: Record<string, string>;
  onPassengerChange: (seatNumber: string, field: "name" | "age" | "gender", value: string) => void;
  onContactChange: (field: "email" | "phone", value: string) => void;
};

const GENDER_OPTIONS: Array<BusPassenger["gender"]> = ["Male", "Female", "Other"];

export default function BusPassengerForm({
  passengers,
  contact,
  errors,
  onPassengerChange,
  onContactChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-(--shadow-xs)">
        <h3 className="text-[17px] font-extrabold text-ink">Passenger Details</h3>
        <p className="mt-1 text-[13px] text-ink-muted">Each selected seat needs one passenger.</p>

        <div className="mt-4 flex flex-col gap-4">
          {passengers.map((passenger) => (
            <div key={passenger.seatNumber} className="rounded-xl border border-border-soft bg-surface-muted p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[14px] font-bold text-ink">Seat {passenger.seatNumber}</p>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                  Passenger
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-[1.4fr_120px_160px]">
                <Input
                  label="Full Name"
                  value={passenger.name}
                  onChange={(event) => onPassengerChange(passenger.seatNumber, "name", event.target.value)}
                  error={errors[`name-${passenger.seatNumber}`]}
                  placeholder="As per ID proof"
                />
                <Input
                  label="Age"
                  type="number"
                  min="1"
                  value={passenger.age ? String(passenger.age) : ""}
                  onChange={(event) => onPassengerChange(passenger.seatNumber, "age", event.target.value)}
                  error={errors[`age-${passenger.seatNumber}`]}
                  placeholder="28"
                />
                <label className="flex flex-col gap-1">
                  <span className="text-[13px] font-medium text-ink-soft">Gender</span>
                  <select
                    value={passenger.gender}
                    onChange={(event) => onPassengerChange(passenger.seatNumber, "gender", event.target.value)}
                    className="h-11 rounded-md border border-border bg-white px-3 text-[14px] text-ink outline-none transition-colors focus:border-brand-500"
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-(--shadow-xs)">
        <h3 className="text-[17px] font-extrabold text-ink">Contact Details</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input
            label="Email"
            type="email"
            value={contact.email}
            onChange={(event) => onContactChange("email", event.target.value)}
            error={errors.email}
            placeholder="traveler@example.com"
          />
          <Input
            label="Phone"
            type="tel"
            value={contact.phone}
            onChange={(event) => onContactChange("phone", event.target.value)}
            error={errors.phone}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>
    </div>
  );
}
