"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import RailBookingStepper from "@/components/rail/RailBookingStepper";
import Badge from "@/components/ui/Badge";
import { formatINR } from "@/lib/format";
import { useTrainBookingStore } from "@/state/trainBookingStore";

const GENDER_LABEL: Record<string, string> = { M: "Male", F: "Female", T: "Other" };
const BERTH_LABEL: Record<string, string> = { LB: "Lower Berth", MB: "Middle Berth", UB: "Upper Berth", SL: "Side Lower", SU: "Side Upper", NP: "No Preference" };

// Mock seat assignment
function seatLabel(idx: number, cls: string): string {
  if (cls === "CC" || cls === "EC") return `S${Math.floor(idx / 5) + 1}/${idx + 1}`;
  const berths = ["LB","MB","UB","SL","SU"];
  const coach = String.fromCharCode(66 + Math.floor(idx / 6));
  return `${coach}${idx + 1}/${berths[idx % berths.length]}`;
}

export default function RailConfirmationPage() {
  const router = useRouter();
  const current = useTrainBookingStore((s) => s.current);

  useEffect(() => {
    if (!current || current.status !== "CONFIRMED") router.replace("/rail");
  }, [current, router]);

  if (!current || current.status !== "CONFIRMED") return null;

  const isWaitlist = !!current.waitlistPosition;

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <RailBookingStepper active="confirmation" />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 py-10">
        {/* Status banner */}
        <div className={`rounded-2xl p-6 mb-6 text-center ${isWaitlist ? "bg-warn-50 border border-warn-200" : "bg-success-50 border border-success-200"}`}>
          <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${isWaitlist ? "bg-warn-100" : "bg-success-100"}`}>
            <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke={isWaitlist ? "#d97706" : "#16a34a"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {isWaitlist ? (
                <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>
              ) : (
                <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
              )}
            </svg>
          </div>
          <p className="text-[18px] font-extrabold text-ink">
            {isWaitlist ? "Waitlisted — Booking Confirmed" : "Booking Confirmed!"}
          </p>
          {isWaitlist && current.waitlistPosition && (
            <p className="text-[13px] text-warn-700 mt-1">Waitlist Position: GNWL/{current.waitlistPosition}</p>
          )}
          {/* PNR */}
          <div className="mt-4 inline-flex flex-col items-center gap-1 rounded-xl bg-white border border-border-soft px-8 py-3 shadow-(--shadow-xs)">
            <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">PNR Number</p>
            <p className="text-[28px] font-black text-ink tracking-widest font-mono">{current.pnr}</p>
            <Badge tone="info" size="sm">{current.chartStatus}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Journey details */}
          <div className="rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs)">
            <p className="text-[13px] font-extrabold text-ink mb-3">Journey Details</p>
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-ink-muted">Train</span>
                <span className="font-semibold text-ink text-right">{current.train.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Number</span>
                <span className="font-mono font-semibold text-ink">#{current.train.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">From</span>
                <span className="font-semibold text-ink">{current.train.fromCode} · {current.train.departs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">To</span>
                <span className="font-semibold text-ink">{current.train.toCode} · {current.train.arrives}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Date</span>
                <span className="font-semibold text-ink">{current.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Class · Quota</span>
                <span className="font-semibold text-ink">{current.selectedClass} · {current.quota}</span>
              </div>
              <div className="border-t border-border-soft pt-2 flex justify-between">
                <span className="font-bold text-ink">Total Paid</span>
                <span className="font-extrabold text-[15px] text-brand-700">{formatINR(current.totalFare)}</span>
              </div>
            </div>
          </div>

          {/* Passengers */}
          <div className="rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs)">
            <p className="text-[13px] font-extrabold text-ink mb-3">Passengers</p>
            <div className="flex flex-col gap-3">
              {current.passengers.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between text-[12px]">
                  <div>
                    <p className="font-bold text-ink">{p.name}</p>
                    <p className="text-ink-muted">{p.age} yrs · {GENDER_LABEL[p.gender] ?? p.gender} · {BERTH_LABEL[p.berthPref] ?? p.berthPref}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-ink">{seatLabel(i, current.selectedClass)}</p>
                    {isWaitlist ? (
                      <Badge tone="warn" size="sm">Waitlisted</Badge>
                    ) : (
                      <Badge tone="success" size="sm">Confirmed</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="mt-5 rounded-xl bg-brand-50 border border-brand-100 p-5">
          <p className="text-[13px] font-bold text-brand-800 mb-2">What happens next?</p>
          <ul className="flex flex-col gap-1.5 text-[12px] text-brand-700">
            <li>• E-ticket will be sent to {current.contact.email}</li>
            <li>• Chart preparation: 4 hours before departure</li>
            {isWaitlist && <li>• Your ticket may get confirmed automatically if berths open up</li>}
            <li>• Carry a valid ID proof during travel</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-surface-muted transition-colors shadow-(--shadow-xs)"
          >
            Print Ticket
          </button>
          <Link
            href="/rail"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Search More Trains
          </Link>
          <Link
            href="/my-trips"
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-surface-muted transition-colors shadow-(--shadow-xs)"
          >
            My Trips
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
