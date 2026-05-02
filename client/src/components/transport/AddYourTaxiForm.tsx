"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api";
import { partnerClient } from "@/lib/partnerClient";
import { TAXI_PACKAGE_DESTINATIONS_ROUTE } from "@/lib/taxiRoles";

type FormState = {
  title: string;
  serviceCity: string;
  vehicleType: string;
  seatingCapacity: string;
  price: string;
  pickupArea: string;
  operatingHours: string;
  contactNumber: string;
  description: string;
  airConditioned: boolean;
};

const INITIAL_FORM: FormState = {
  title: "",
  serviceCity: "",
  vehicleType: "Sedan",
  seatingCapacity: "",
  price: "",
  pickupArea: "",
  operatingHours: "",
  contactNumber: "",
  description: "",
  airConditioned: true,
};

export default function AddYourTaxiForm() {
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    const serviceCity = form.serviceCity.trim();
    const price = Number(form.price);
    const description = form.description.trim();
    const contactNumber = form.contactNumber.trim();

    if (!title) {
      toast.push({ title: "Taxi title is required", tone: "warn" });
      return;
    }

    if (!serviceCity) {
      toast.push({ title: "Service city is required", tone: "warn" });
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.push({
        title: "Enter a valid base fare",
        description: "Base fare must be a number greater than zero.",
        tone: "warn",
      });
      return;
    }

    if (contactNumber.length < 8) {
      toast.push({
        title: "Enter a valid contact number",
        description: "Please provide at least 8 digits for calls or WhatsApp.",
        tone: "warn",
      });
      return;
    }

    if (description.length < 20) {
      toast.push({
        title: "Add a fuller description",
        description: "Give customers at least a short overview of the taxi package.",
        tone: "warn",
      });
      return;
    }

    setSaving(true);

    try {
      await partnerClient.create({
        type: "taxi",
        title,
        description,
        price,
        metadata: {
          serviceCity,
          vehicleType: form.vehicleType,
          seatingCapacity: form.seatingCapacity ? Number(form.seatingCapacity) : null,
          pickupArea: form.pickupArea.trim(),
          operatingHours: form.operatingHours.trim(),
          contactNumber,
          airConditioned: form.airConditioned,
        },
      });

      toast.push({
        title: "Taxi submitted successfully",
        description: "Your listing was sent using the existing taxi resource endpoint.",
        tone: "success",
      });
      setForm(INITIAL_FORM);
      router.replace(TAXI_PACKAGE_DESTINATIONS_ROUTE);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to submit taxi right now.";

      toast.push({
        title: "Could not submit taxi",
        description: message,
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="bg-surface-muted">
      <section className="border-b border-border-soft bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-brand-700">
              Taxi Partner Form
            </p>
            <h1 className="mt-3 text-[34px] font-black tracking-tight text-ink sm:text-[42px]">
              Add your taxi to the package catalog
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-ink-muted">
              Complete the frontend form below and we will submit it through the existing taxi resource API without changing any backend contract.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-border-soft bg-white p-6 shadow-(--shadow-xs) sm:p-8"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                id="taxi-title"
                label="Taxi Package Title"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="e.g. Delhi City Full-Day Sedan"
              />
              <Input
                id="taxi-city"
                label="Service City"
                value={form.serviceCity}
                onChange={(event) => updateField("serviceCity", event.target.value)}
                placeholder="Delhi"
              />

              <label className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-ink-soft">Vehicle Type</span>
                <select
                  value={form.vehicleType}
                  onChange={(event) => updateField("vehicleType", event.target.value)}
                  className="h-11 rounded-md border border-border bg-white px-3.5 text-[14px] text-ink outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Tempo Traveller">Tempo Traveller</option>
                  <option value="Premium Van">Premium Van</option>
                </select>
              </label>

              <Input
                id="taxi-capacity"
                label="Seating Capacity"
                type="number"
                min="1"
                value={form.seatingCapacity}
                onChange={(event) => updateField("seatingCapacity", event.target.value)}
                placeholder="4"
              />

              <Input
                id="taxi-price"
                label="Base Fare"
                type="number"
                min="1"
                step="0.01"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="2500"
              />
              <Input
                id="taxi-contact"
                label="Contact Number"
                type="tel"
                value={form.contactNumber}
                onChange={(event) => updateField("contactNumber", event.target.value)}
                placeholder="+91 98XXXXXX12"
              />

              <Input
                id="taxi-pickup-area"
                label="Pickup Area"
                value={form.pickupArea}
                onChange={(event) => updateField("pickupArea", event.target.value)}
                placeholder="Airport, hotel zone, or city center"
              />
              <Input
                id="taxi-hours"
                label="Operating Hours"
                value={form.operatingHours}
                onChange={(event) => updateField("operatingHours", event.target.value)}
                placeholder="06:00 AM - 10:00 PM"
              />
            </div>

            <label className="mt-5 flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-muted/55 px-4 py-3">
              <input
                type="checkbox"
                checked={form.airConditioned}
                onChange={(event) => updateField("airConditioned", event.target.checked)}
                className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
              />
              <span className="text-[14px] font-medium text-ink">
                Air conditioned vehicle
              </span>
            </label>

            <label className="mt-5 flex flex-col gap-1">
              <span className="text-[13px] font-medium text-ink-soft">Package Description</span>
              <textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                rows={7}
                placeholder="Describe route coverage, driver inclusions, luggage support, and package highlights."
                className="min-h-[180px] rounded-md border border-border bg-white px-3.5 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </label>

            <div className="mt-6 flex flex-col gap-3 border-t border-border-soft pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={TAXI_PACKAGE_DESTINATIONS_ROUTE}
                className="text-[13px] font-semibold text-ink-muted transition-colors hover:text-brand-700"
              >
                Back to destinations
              </Link>
              <Button type="submit" size="lg" loading={saving}>
                Submit Taxi
              </Button>
            </div>
          </form>

          <aside className="rounded-[28px] border border-border-soft bg-white p-6 shadow-(--shadow-xs)">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-brand-700">
              Submission Notes
            </p>
            <div className="mt-4 space-y-4 text-[14px] leading-6 text-ink-muted">
              <p>
                The page only changes frontend rendering. Form submission still goes through the existing `partnerClient.create()` taxi resource call.
              </p>
              <p>
                Structured taxi details are stored inside `metadata`, so no API shape or backend schema changes are required.
              </p>
              <p>
                Customer-facing package discovery continues to use the new destinations route while inventory submission stays isolated to authorized roles.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
