"use client";

import { useMemo, useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import TrainServiceNav from "@/components/rail/TrainServiceNav";
import EmptyState from "@/components/ui/EmptyState";
import { useTrainBookingStore } from "@/state/trainBookingStore";

const TDR_REASONS = [
  "Train delayed by more than three hours",
  "Passenger not travelled",
  "Train cancelled",
  "AC failure or coach issue",
];

export default function TrainTdrPage() {
  const bookings = useTrainBookingStore((state) => state.bookings);
  const eligibleBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "CONFIRMED"),
    [bookings],
  );
  const [bookingId, setBookingId] = useState("");
  const [reason, setReason] = useState(TDR_REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingId || !details.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />

      <section className="bg-brand-900 px-4 py-6 text-white sm:px-6">
        <div className="mx-auto max-w-4xl">
          <TrainServiceNav current="file-tdr-online" className="mb-5" />
          <h1 className="text-[30px] font-black">File TDR Online</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-white/72">
            This keeps the train support workflow near the header, while reusing the confirmed booking data already produced by the rail journey flow.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {eligibleBookings.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-white">
            <EmptyState
              title="No eligible tickets found"
              subtitle="Confirmed train tickets will appear here once the booking flow is completed."
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
                  <option value="">Select confirmed ticket</option>
                  {eligibleBookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.train.fromCode} to {booking.train.toCode} · {booking.pnr}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-ink-muted">
                  TDR Reason
                </span>
                <select
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="h-11 rounded-lg border border-border bg-white px-3 text-[14px] text-ink outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {TDR_REASONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-ink-muted">
                Supporting details
              </span>
              <textarea
                rows={6}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Add delay details, no-travel context, or any coach issue notes for this mock TDR submission."
                className="rounded-xl border border-border bg-white px-3 py-3 text-[14px] text-ink outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>

            {submitted ? (
              <div className="mt-4 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-[13px] text-success-700">
                Mock TDR request submitted. The page is now discoverable from the train menu instead of living outside the train flow.
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                File TDR
              </button>
              <button
                type="button"
                onClick={() => {
                  setBookingId("");
                  setReason(TDR_REASONS[0]);
                  setDetails("");
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
