"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import RailBookingStepper from "@/components/rail/RailBookingStepper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { useTrainBookingStore, type TrainPassenger, type BerthPref, type MealChoice, type Concession } from "@/state/trainBookingStore";
import type { TrainClass, Quota } from "@/lib/mock/trains";

export default function PassengersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex flex-col bg-surface-muted"><Header /><RailBookingStepper active="passengers" /><main className="flex-1" /></div>}>
      <PassengersInner />
    </Suspense>
  );
}

const BERTH_OPTIONS: Array<{ value: BerthPref; label: string }> = [
  { value: "LB", label: "Lower Berth" },
  { value: "MB", label: "Middle Berth" },
  { value: "UB", label: "Upper Berth" },
  { value: "SL", label: "Side Lower" },
  { value: "SU", label: "Side Upper" },
  { value: "NP", label: "No Preference" },
];

const MEAL_OPTIONS: Array<{ value: MealChoice; label: string }> = [
  { value: "VEG", label: "Vegetarian" },
  { value: "NON_VEG", label: "Non-Vegetarian" },
  { value: "NONE", label: "No Meal" },
];

const CONCESSION_OPTIONS: Array<{ value: Concession; label: string }> = [
  { value: "NONE", label: "None" },
  { value: "SENIOR_M", label: "Senior Citizen (Male)" },
  { value: "SENIOR_F", label: "Senior Citizen (Female)" },
  { value: "CHILD", label: "Child (5–11 yrs)" },
  { value: "STUDENT", label: "Student" },
];

function emptyPassenger(id: string): TrainPassenger {
  return { id, name: "", age: 0, gender: "M", berthPref: "NP", meal: "NONE", concession: "NONE" };
}

function PassengerRow({
  pax,
  num,
  onChange,
  onRemove,
  canRemove,
}: {
  pax: TrainPassenger;
  num: number;
  onChange: (p: TrainPassenger) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const upd = (patch: Partial<TrainPassenger>) => onChange({ ...pax, ...patch });

  return (
    <div className="rounded-xl border border-border-soft bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-ink">Passenger {num}</p>
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-[11px] font-semibold text-danger-500 hover:underline">Remove</button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Full Name" value={pax.name} onChange={(e) => upd({ name: e.target.value })} placeholder="As per ID proof" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Age" type="number" value={pax.age || ""} onChange={(e) => upd({ age: parseInt(e.target.value) || 0 })} placeholder="25" />
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1">Gender</label>
            <select value={pax.gender} onChange={(e) => upd({ gender: e.target.value as "M" | "F" | "T" })}
              className="w-full h-11 rounded-lg border border-border px-3 text-[14px] text-ink bg-white outline-none focus:border-brand-500 transition-colors">
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="T">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-ink mb-1">Berth Preference</label>
          <select value={pax.berthPref} onChange={(e) => upd({ berthPref: e.target.value as BerthPref })}
            className="w-full h-11 rounded-lg border border-border px-3 text-[14px] text-ink bg-white outline-none focus:border-brand-500 transition-colors">
            {BERTH_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1">Meal Choice</label>
            <select value={pax.meal} onChange={(e) => upd({ meal: e.target.value as MealChoice })}
              className="w-full h-11 rounded-lg border border-border px-3 text-[14px] text-ink bg-white outline-none focus:border-brand-500 transition-colors">
              {MEAL_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1">Concession</label>
            <select value={pax.concession} onChange={(e) => upd({ concession: e.target.value as Concession })}
              className="w-full h-11 rounded-lg border border-border px-3 text-[14px] text-ink bg-white outline-none focus:border-brand-500 transition-colors">
              {CONCESSION_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function PassengersInner() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const cls = sp.get("cls") as TrainClass ?? "SL";
  const toast = useToast();

  const { current, setPassengers, setContact } = useTrainBookingStore();

  const [passengers, setLocalPassengers] = useState<TrainPassenger[]>([emptyPassenger("p1")]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!current) router.replace(`/rail/${id}`);
  }, [current, router, id]);

  if (!current) return null;

  const addPassenger = () => {
    if (passengers.length >= 6) return;
    setLocalPassengers((prev) => [...prev, emptyPassenger(`p${prev.length + 1}`)]);
  };

  const updatePassenger = (idx: number, p: TrainPassenger) => {
    setLocalPassengers((prev) => prev.map((x, i) => (i === idx ? p : x)));
  };

  const removePassenger = (idx: number) => {
    setLocalPassengers((prev) => prev.filter((_, i) => i !== idx));
  };

  const onProceed = () => {
    for (const p of passengers) {
      if (!p.name.trim()) { toast.push({ title: "Enter name for all passengers", tone: "warn" }); return; }
      if (!p.age || p.age < 1) { toast.push({ title: "Enter valid age for all passengers", tone: "warn" }); return; }
    }
    if (!email.includes("@")) { toast.push({ title: "Enter a valid email", tone: "warn" }); return; }
    if (!phone.trim()) { toast.push({ title: "Enter contact phone", tone: "warn" }); return; }
    setPassengers(passengers);
    setContact({ email, phone, countryCode: "+91" });
    router.push(`/rail/${id}/payment`);
  };

  const total = current.farePerPassenger * passengers.length;

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <RailBookingStepper active="passengers" />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Passenger forms */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-extrabold text-ink">Passenger Details</h2>
              {passengers.length < 6 && (
                <button type="button" onClick={addPassenger}
                  className="text-[13px] font-semibold text-brand-600 hover:underline flex items-center gap-1">
                  + Add Passenger
                </button>
              )}
            </div>

            {passengers.map((p, i) => (
              <PassengerRow
                key={p.id}
                pax={p}
                num={i + 1}
                onChange={(updated) => updatePassenger(i, updated)}
                onRemove={() => removePassenger(i)}
                canRemove={passengers.length > 1}
              />
            ))}

            {/* Contact */}
            <div className="rounded-xl border border-border-soft bg-white p-4">
              <p className="text-[13px] font-bold text-ink mb-3">Contact Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="booking@example.com" />
                <Input label="Mobile" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
            </div>
          </div>

          {/* Booking summary */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-white border border-border-soft p-4 shadow-(--shadow-xs)">
              <p className="text-[13px] font-extrabold text-ink mb-3">Booking Summary</p>
              <div className="flex flex-col gap-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-ink-muted">{current.train.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">#{current.train.number}</span>
                  <span className="font-semibold text-ink">{cls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">{current.train.fromCode} → {current.train.toCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Date</span>
                  <span className="font-semibold text-ink">{current.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Fare/person</span>
                  <span className="font-semibold text-ink">{formatINR(current.farePerPassenger)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Passengers</span>
                  <span className="font-semibold text-ink">× {passengers.length}</span>
                </div>
                <div className="border-t border-border-soft pt-2 flex justify-between">
                  <span className="font-bold text-ink">Total</span>
                  <span className="font-extrabold text-[16px] text-brand-700">{formatINR(total)}</span>
                </div>
              </div>
            </div>

            <Button variant="primary" size="lg" fullWidth onClick={onProceed}>
              Proceed to Payment
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
