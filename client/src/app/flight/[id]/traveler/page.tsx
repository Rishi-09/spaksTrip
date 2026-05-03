"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BookingStepper from "@/components/flight/BookingStepper";
import ItinerarySummary from "@/components/flight/ItinerarySummary";
import PriceBreakdown from "@/components/flight/PriceBreakdown";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import Radio from "@/components/ui/Radio";
import { useBookingStore } from "@/state/bookingStore";
import { useToast } from "@/components/ui/Toast";
import type { Traveler, TravelerType } from "@/state/bookingStore";

type FormTraveler = Omit<Traveler, "id"> & { id: string };

const TITLES_ADT_MALE = ["Mr"] as const;
const TITLES_ADT_FEMALE = ["Ms", "Mrs"] as const;
const TITLES_CHILD_MALE = ["Mstr"] as const;
const TITLES_CHILD_FEMALE = ["Miss"] as const;

// Title → canonical gender
const TITLE_GENDER: Record<string, "M" | "F"> = {
  Mr: "M", Mstr: "M",
  Ms: "F", Mrs: "F", Miss: "F",
};

// Default title for a given type + gender
function defaultTitle(type: TravelerType, gender: "M" | "F"): Traveler["title"] {
  if (type === "ADT") return gender === "M" ? "Mr" : "Ms";
  return gender === "M" ? "Mstr" : "Miss";
}

function emptyFor(type: TravelerType, idx: number): FormTraveler {
  return {
    id: `${type}-${idx}`,
    type,
    title: type === "ADT" ? "Mr" : "Mstr",
    firstName: "",
    lastName: "",
    gender: "M",
    dob: null,
    addressLine1: "",
    city: "",
    nationality: "IN",
  };
}

export default function FlightTravelerPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <TravelerInner />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <BookingStepper active="traveler" />
      <main className="flex-1 grid place-items-center p-8 text-ink-muted text-[14px]">
        Loading…
      </main>
      <Footer />
    </div>
  );
}

function TravelerInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();
  const { current, setTravelers, setContact, setAddOns, advanceStatus } = useBookingStore();

  const needsPassport = Boolean(current?.offer.isPassportRequired);

  const initial = useMemo(() => {
    if (!current) return [];
    const list: FormTraveler[] = [];
    for (let i = 0; i < current.pax.adults; i++) list.push(emptyFor("ADT", i));
    for (let i = 0; i < current.pax.children; i++) list.push(emptyFor("CHD", i));
    for (let i = 0; i < current.pax.infants; i++) list.push(emptyFor("INF", i));
    return list;
  }, [current]);

  const [travelers, setLocalTravelers] = useState<FormTraveler[]>(initial);
  const [email, setEmail] = useState(current?.contact.email ?? "");
  const [phone, setPhone] = useState(current?.contact.phone ?? "");
  const [addInsurance, setAddInsurance] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!current) {
      router.replace("/flight");
    } else if (travelers.length === 0) {
      setLocalTravelers(initial);
    }
  }, [current, initial, router, travelers.length]);

  if (!current) return null;

  const update = (id: string, patch: Partial<FormTraveler>) => {
    setLocalTravelers((list) =>
      list.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...patch };
        // Rule 6/7: keep title and gender in sync
        if (patch.gender && !patch.title) {
          next.title = defaultTitle(t.type, patch.gender);
        }
        if (patch.title && !patch.gender) {
          next.gender = TITLE_GENDER[patch.title] ?? t.gender;
        }
        return next;
      }),
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    for (const t of travelers) {
      if (!t.firstName.trim()) e[`${t.id}.firstName`] = "Required";
      if (!t.lastName.trim()) e[`${t.id}.lastName`] = "Required";
      if (!t.dob) e[`${t.id}.dob`] = "Date of birth required";
      if (!t.addressLine1.trim()) e[`${t.id}.addressLine1`] = "Required";
      if (!t.city.trim()) e[`${t.id}.city`] = "Required";
      if (needsPassport || t.type === "CHD" || t.type === "INF") {
        if (needsPassport && !t.passport?.trim()) e[`${t.id}.passport`] = "Required for this flight";
        if (needsPassport && !t.passportExpiry?.trim()) e[`${t.id}.passportExpiry`] = "Required for this flight";
      }
    }
    if (!/.+@.+\..+/.test(email)) e.email = "Enter a valid email";
    if (phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onContinue = () => {
    if (!validate()) {
      toast.push({ title: "Please fix the highlighted fields", tone: "warn" });
      return;
    }
    setTravelers(travelers);
    setContact({ email, phone, countryCode: "+91" });
    setAddOns({ insurance: addInsurance ? 199 * travelers.length : 0 });
    advanceStatus("PAYMENT");
    router.push(`/flight/${encodeURIComponent(current.offer.id)}/payment?${sp.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <BookingStepper active="traveler" />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 md:px-6 py-6">
          <div className="grid md:grid-cols-[1fr_340px] gap-5">
            <div className="flex flex-col gap-4">
              <ItinerarySummary offer={current.offer} compact />

              <section className="rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs)">
                <h2 className="text-[16px] font-bold text-ink mb-1">Traveller details</h2>
                <p className="text-[12px] text-ink-muted mb-4">
                  Names must match government-issued ID exactly.
                </p>

                <div className="flex flex-col gap-5">
                  {travelers.map((t, i) => (
                    <TravelerCard
                      key={t.id}
                      traveler={t}
                      index={i}
                      needsPassport={needsPassport}
                      errors={errors}
                      onUpdate={(patch) => update(t.id, patch)}
                    />
                  ))}
                </div>
              </section>

              <section className="rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs)">
                <h2 className="text-[16px] font-bold text-ink mb-1">Contact information</h2>
                <p className="text-[12px] text-ink-muted mb-4">
                  Your booking confirmation will be sent here.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    placeholder="you@example.com"
                  />
                  <Input
                    label="Mobile number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                    placeholder="+91 98xxxxxxxx"
                  />
                </div>
              </section>

              <section className="rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs)">
                <h2 className="text-[16px] font-bold text-ink mb-3">Add-ons</h2>
                <AddOnRow
                  title="Travel insurance"
                  price="₹199 / traveller"
                  desc="COVID coverage, loss of baggage, trip cancellation."
                  checked={addInsurance}
                  onChange={setAddInsurance}
                />
              </section>
            </div>

            <aside className="flex flex-col gap-4">
              <PriceBreakdown booking={current} />
              <Button variant="accent" size="lg" onClick={onContinue} fullWidth>
                Continue to payment
              </Button>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TravelerCard({
  traveler: t,
  index,
  needsPassport,
  errors,
  onUpdate,
}: {
  traveler: FormTraveler;
  index: number;
  needsPassport: boolean;
  errors: Record<string, string>;
  onUpdate: (patch: Partial<FormTraveler>) => void;
}) {
  const isAdult = t.type === "ADT";
  const titleOptions = isAdult
    ? (t.gender === "M" ? ["Mr"] : ["Ms", "Mrs"])
    : (t.gender === "M" ? ["Mstr"] : ["Miss"]);

  return (
    <div className="pb-5 border-b last:border-b-0 border-border-soft">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-ink">
          {t.type === "ADT" ? "Adult" : t.type === "CHD" ? "Child" : "Infant"}{" "}
          {index + 1}
        </h3>
        {t.type === "INF" && (
          <span className="text-[11px] text-ink-muted">Must travel with an adult</span>
        )}
      </div>

      {/* Name row */}
      <div className="grid sm:grid-cols-[110px_1fr_1fr] gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-medium text-ink-soft">Title</label>
          <select
            value={t.title}
            onChange={(e) => onUpdate({ title: e.target.value as Traveler["title"] })}
            className="h-11 rounded-md border border-border bg-white px-3 text-[14px] font-medium text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            {titleOptions.map((tt) => (
              <option key={tt} value={tt}>{tt}</option>
            ))}
          </select>
        </div>
        <Input
          label="First & middle name"
          value={t.firstName}
          onChange={(e) => onUpdate({ firstName: e.target.value })}
          error={errors[`${t.id}.firstName`]}
        />
        <Input
          label="Last name"
          value={t.lastName}
          onChange={(e) => onUpdate({ lastName: e.target.value })}
          error={errors[`${t.id}.lastName`]}
        />
      </div>

      {/* DOB + Gender row */}
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-medium text-ink-soft">Date of birth</label>
          <input
            type="date"
            value={t.dob ?? ""}
            onChange={(e) => onUpdate({ dob: e.target.value || null })}
            className="h-11 rounded-md border border-border bg-white px-3 text-[14px] font-medium text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            aria-invalid={Boolean(errors[`${t.id}.dob`]) || undefined}
          />
          {errors[`${t.id}.dob`] && (
            <p className="text-[12px] font-medium text-danger-600">{errors[`${t.id}.dob`]}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-medium text-ink-soft">Gender</label>
          <div className="flex items-center gap-4 h-11">
            <Radio
              id={`${t.id}-m`}
              name={`gender-${t.id}`}
              label="Male"
              checked={t.gender === "M"}
              onChange={() => onUpdate({ gender: "M" })}
            />
            <Radio
              id={`${t.id}-f`}
              name={`gender-${t.id}`}
              label="Female"
              checked={t.gender === "F"}
              onChange={() => onUpdate({ gender: "F" })}
            />
          </div>
        </div>
      </div>

      {/* Address row — required by TBO rule 5 */}
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <Input
          label="Address line 1"
          value={t.addressLine1}
          onChange={(e) => onUpdate({ addressLine1: e.target.value })}
          error={errors[`${t.id}.addressLine1`]}
          placeholder="Street / flat / building"
        />
        <Input
          label="City"
          value={t.city}
          onChange={(e) => onUpdate({ city: e.target.value })}
          error={errors[`${t.id}.city`]}
          placeholder="e.g. Mumbai"
        />
      </div>

      {/* Passport — required for international flights or when TBO flags it */}
      {needsPassport && (
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Input
            label="Passport number"
            value={t.passport ?? ""}
            onChange={(e) => onUpdate({ passport: e.target.value })}
            error={errors[`${t.id}.passport`]}
            placeholder="e.g. A1234567"
          />
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-ink-soft">Passport expiry</label>
            <input
              type="date"
              value={t.passportExpiry ?? ""}
              onChange={(e) => onUpdate({ passportExpiry: e.target.value || undefined })}
              className="h-11 rounded-md border border-border bg-white px-3 text-[14px] font-medium text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              aria-invalid={Boolean(errors[`${t.id}.passportExpiry`]) || undefined}
            />
            {errors[`${t.id}.passportExpiry`] && (
              <p className="text-[12px] font-medium text-danger-600">{errors[`${t.id}.passportExpiry`]}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddOnRow({
  title,
  price,
  desc,
  checked,
  onChange,
}: {
  title: string;
  price: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 rounded-lg border border-border-soft p-4 cursor-pointer hover:border-border">
      <div className="flex gap-3">
        <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div>
          <div className="text-[14px] font-semibold text-ink">{title}</div>
          <div className="text-[12px] text-ink-muted">{desc}</div>
        </div>
      </div>
      <div className="text-[13px] font-bold text-brand-700">{price}</div>
    </label>
  );
}
