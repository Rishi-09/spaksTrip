"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

type FormState = {
  listingName: string;
  vehicleType: string;
  seatingCapacity: string;
  packageCategory: string;
  operatingCity: string;
  pickupCoverage: string;
  dropCoverage: string;
  baseFare: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  description: string;
  amenities: string;
};

const VEHICLE_TYPES = ["Hatchback", "Sedan", "SUV", "MUV", "Tempo Traveller", "Luxury"];
const PACKAGE_CATEGORIES = ["Airport Transfer", "Outstation", "Sightseeing", "Rental", "Corporate"];

const INITIAL_FORM: FormState = {
  listingName: "",
  vehicleType: VEHICLE_TYPES[0],
  seatingCapacity: "",
  packageCategory: PACKAGE_CATEGORIES[0],
  operatingCity: "",
  pickupCoverage: "",
  dropCoverage: "",
  baseFare: "",
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  description: "",
  amenities: "",
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AddTaxiListingForm() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const price = Number(form.baseFare);
    const seats = Number(form.seatingCapacity);

    if (!form.listingName.trim()) {
      toast.push({ title: "Listing name is required", tone: "warn" });
      return;
    }

    if (!form.operatingCity.trim()) {
      toast.push({ title: "Operating city is required", tone: "warn" });
      return;
    }

    if (!Number.isFinite(seats) || seats <= 0) {
      toast.push({ title: "Enter a valid seating capacity", tone: "warn" });
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.push({ title: "Enter a valid base fare", tone: "warn" });
      return;
    }

    if (!form.contactPerson.trim()) {
      toast.push({ title: "Contact person is required", tone: "warn" });
      return;
    }

    if (!form.contactPhone.trim()) {
      toast.push({ title: "Contact phone is required", tone: "warn" });
      return;
    }

    if (!isValidEmail(form.contactEmail.trim())) {
      toast.push({ title: "Enter a valid contact email", tone: "warn" });
      return;
    }

    setSubmitting(true);

    try {
      toast.push({
        title: "Taxi listing validated",
        description: "UI shell is ready. Submission API is intentionally not wired yet.",
        tone: "success",
      });

      setForm(INITIAL_FORM);
    } catch (error) {
      const description = error instanceof Error ? error.message : "Please try again.";
      toast.push({
        title: "Could not save taxi listing",
        description,
        tone: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-border-soft bg-white p-5 shadow-(--shadow-xs) sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-brand-700">
              Add Your Taxi
            </p>
            <h1 className="mt-2 text-3xl font-black text-ink">Create a taxi package listing</h1>
            <p className="mt-2 max-w-3xl text-[14px] text-ink-muted">
              Publish a cab package without leaving the current booking experience. Keep the
              details clean so customers can compare and enquire faster.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="listing-name"
              label="Listing Name"
              value={form.listingName}
              onChange={(event) => updateField("listingName", event.target.value)}
              placeholder="Delhi Airport to Gurgaon Sedan"
            />
            <SelectField
              id="vehicle-type"
              label="Vehicle Type"
              value={form.vehicleType}
              options={VEHICLE_TYPES}
              onChange={(value) => updateField("vehicleType", value)}
            />
            <Input
              id="seating-capacity"
              label="Seating Capacity"
              type="number"
              min="1"
              value={form.seatingCapacity}
              onChange={(event) => updateField("seatingCapacity", event.target.value)}
              placeholder="4"
            />
            <SelectField
              id="package-category"
              label="Package Category"
              value={form.packageCategory}
              options={PACKAGE_CATEGORIES}
              onChange={(value) => updateField("packageCategory", value)}
            />
            <Input
              id="operating-city"
              label="Operating City"
              value={form.operatingCity}
              onChange={(event) => updateField("operatingCity", event.target.value)}
              placeholder="Delhi NCR"
            />
            <Input
              id="base-fare"
              label="Base Fare"
              type="number"
              min="0"
              step="0.01"
              value={form.baseFare}
              onChange={(event) => updateField("baseFare", event.target.value)}
              placeholder="1800"
            />
            <Input
              id="pickup-coverage"
              label="Pickup Coverage"
              value={form.pickupCoverage}
              onChange={(event) => updateField("pickupCoverage", event.target.value)}
              placeholder="Airport T1, T2, T3"
            />
            <Input
              id="drop-coverage"
              label="Drop Coverage"
              value={form.dropCoverage}
              onChange={(event) => updateField("dropCoverage", event.target.value)}
              placeholder="Gurgaon, Noida, Delhi hotels"
            />
            <Input
              id="contact-person"
              label="Contact Person"
              value={form.contactPerson}
              onChange={(event) => updateField("contactPerson", event.target.value)}
              placeholder="Amit Sharma"
            />
            <Input
              id="contact-phone"
              label="Contact Phone"
              value={form.contactPhone}
              onChange={(event) => updateField("contactPhone", event.target.value)}
              placeholder="+91 98XXXXXXXX"
            />
            <Input
              id="contact-email"
              label="Contact Email"
              type="email"
              value={form.contactEmail}
              onChange={(event) => updateField("contactEmail", event.target.value)}
              placeholder="fleet@example.com"
              className="md:col-span-2"
            />
          </div>

          <TextAreaField
            id="listing-description"
            label="Description"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Add package details, route notes, inclusions, and booking highlights."
            rows={5}
          />

          <TextAreaField
            id="amenities"
            label="Amenities"
            value={form.amenities}
            onChange={(value) => updateField("amenities", value)}
            placeholder="AC, Bottled water, Child seat, GPS tracking"
            rows={3}
            hint="Separate amenities with commas."
          />

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border-soft pt-4">
            <Button type="button" variant="ghost" onClick={() => router.push("/partner/taxis")}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="lg" loading={submitting}>
              Save Taxi Listing
            </Button>
          </div>
        </form>

        <aside className="space-y-4 rounded-[24px] border border-border-soft bg-surface-muted p-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              Listing Preview
            </p>
            <h2 className="mt-2 text-xl font-black text-ink">
              {form.listingName.trim() || "Your taxi package"}
            </h2>
            <p className="mt-2 text-[13px] text-ink-muted">
              {form.description.trim() || "Add route details, inclusions, and service highlights."}
            </p>
          </div>

          <InfoRow label="Category" value={form.packageCategory} />
          <InfoRow label="Vehicle" value={form.vehicleType} />
          <InfoRow label="Seats" value={form.seatingCapacity || "Not set"} />
          <InfoRow label="City" value={form.operatingCity || "Not set"} />
          <InfoRow label="Base fare" value={form.baseFare ? `INR ${form.baseFare}` : "Not set"} />

          <div className="rounded-2xl border border-dashed border-border-soft bg-white px-4 py-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand-700">
              Submission Notes
            </p>
            <ul className="mt-3 space-y-2 text-[13px] text-ink-muted">
              <li>Keep titles route-specific so customers can scan quickly.</li>
              <li>Include coverage areas if pickup and drop points vary by package.</li>
              <li>List important amenities in commas to save them into metadata cleanly.</li>
              <li>This page is a validated UI shell only and does not submit to the backend yet.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-ink-soft">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-border bg-white px-3.5 text-[14px] text-ink outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-ink-soft">{label}</span>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="rounded-md border border-border bg-white px-3.5 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
      {hint ? <span className="text-[12px] text-ink-muted">{hint}</span> : null}
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className="text-[13px] font-semibold text-ink">{value}</span>
    </div>
  );
}
