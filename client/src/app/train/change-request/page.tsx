"use client";

import { useMemo, useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import TrainServiceNav from "@/components/rail/TrainServiceNav";
import EmptyState from "@/components/ui/EmptyState";
import { useTrainBookingStore } from "@/state/trainBookingStore";

const REQUEST_TYPES = [
  { value: "date-change", label: "Date or train change" },
  { value: "boarding-point", label: "Boarding point update" },
  { value: "passenger-update", label: "Passenger detail correction" },
] as const;

export default function TrainChangeRequestPage() {
  const bookings = useTrainBookingStore((state) => state.bookings);
  const confirmedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "CONFIRMED"),
    [bookings],
  );
  const [bookingId, setBookingId] = useState("");
  const [requestType, setRequestType] = useState<string>(REQUEST_TYPES[0].value);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingId || !notes.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />

      <section className="bg-brand-900 px-4 py-6 text-white sm:px-6">
        <div className="mx-auto max-w-4xl">
          <TrainServiceNav current="change-request" className="mb-5" />
          <h1 className="text-[30px] font-black">Train Change Request</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-white/72">
            The train flow now exposes support actions directly from the header.
            Use this page to start a lightweight change request against confirmed tickets.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {confirmedBookings.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-white">
            <EmptyState
              title="No confirmed train tickets available"
              subtitle="Once a train booking is confirmed, it will appear here for change requests."
            />
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-border-soft bg-white p-6 shadow-(--shadow-xs)"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-ink-muted">
                  Ticket
                </span>
                <select
                  value={bookingId}
                  onChange={(event) => setBookingId(event.target.value)}
                  className="h-11 rounded-lg border border-border bg-white px-3 text-[14px] text-ink outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Select a booking</option>
                  {confirmedBookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.train.fromCode} to {booking.train.toCode} · {booking.pnr}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-ink-muted">
                  Request Type
                </span>
                <select
                  value={requestType}
                  onChange={(event) => setRequestType(event.target.value)}
                  className="h-11 rounded-lg border border-border bg-white px-3 text-[14px] text-ink outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {REQUEST_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-ink-muted">
                Notes
              </span>
              <textarea
                rows={6}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add the correction or change details you want the support team to review."
                className="rounded-xl border border-border bg-white px-3 py-3 text-[14px] text-ink outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>

            {submitted ? (
              <div className="mt-4 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-[13px] text-success-700">
                Change request submitted. This now follows the header train flow while reusing your saved booking details.
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => {
                  setBookingId("");
                  setRequestType(REQUEST_TYPES[0].value);
                  setNotes("");
                  setSubmitted(false);
                }}
                className="inline-flex rounded-full border border-border px-5 py-2.5 text-[13px] font-semibold text-ink hover:border-brand-400 hover:text-brand-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
