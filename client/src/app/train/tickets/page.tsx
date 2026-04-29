"use client";

import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import TrainServiceNav from "@/components/rail/TrainServiceNav";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { useTrainBookingStore } from "@/state/trainBookingStore";
import { formatINR } from "@/lib/format";

const STATUS_TONE = {
  PASSENGER: "info",
  PAYMENT: "warn",
  CONFIRMED: "success",
} as const;

export default function TrainTicketsPage() {
  const bookings = useTrainBookingStore((state) => state.bookings);
  const current = useTrainBookingStore((state) => state.current);

  const activeDraft =
    current && current.status !== "CONFIRMED" ? current : null;

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />

      <section className="bg-brand-900 px-4 py-6 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <TrainServiceNav current="tickets" className="mb-5" />
          <h1 className="text-[30px] font-black">Train Tickets</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-white/72">
            This page sits closer to the header train menu and brings current
            bookings, confirmed tickets, and train-specific actions into one place.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {activeDraft ? (
          <section className="mb-6 rounded-2xl border border-brand-200 bg-white p-5 shadow-(--shadow-xs)">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                  Continue Booking
                </p>
                <h2 className="mt-2 text-[22px] font-black text-ink">
                  {activeDraft.train.fromCode} to {activeDraft.train.toCode}
                </h2>
                <p className="mt-1 text-[13px] text-ink-muted">
                  {activeDraft.train.name} · #{activeDraft.train.number} ·{" "}
                  {activeDraft.date}
                </p>
              </div>
              <Link
                href={`/rail/${activeDraft.train.id}/${activeDraft.status === "PAYMENT" ? "payment" : "passengers"}`}
                className="inline-flex rounded-full bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Resume
              </Link>
            </div>
          </section>
        ) : null}

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-white">
            <EmptyState
              title="No train tickets yet"
              subtitle="Search trains from the header-driven train flow and your bookings will appear here."
              cta={
                <Link
                  href="/train/search"
                  className="inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Search Trains
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-2xl border border-border-soft bg-white p-5 shadow-(--shadow-xs)"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[20px] font-black text-ink">
                        {booking.train.fromCode} to {booking.train.toCode}
                      </h2>
                      <Badge
                        tone={STATUS_TONE[booking.status]}
                        size="sm"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[13px] text-ink-muted">
                      {booking.train.name} · #{booking.train.number} ·{" "}
                      {booking.date} · {booking.selectedClass} · {booking.quota}
                    </p>
                    <p className="mt-1 text-[12px] text-ink-soft">
                      {booking.pnr ? `PNR ${booking.pnr}` : "PNR pending"} ·{" "}
                      {booking.passengers.length} passenger
                      {booking.passengers.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[22px] font-black text-ink">
                      {formatINR(booking.totalFare)}
                    </p>
                    <p className="text-[12px] text-ink-muted">
                      {booking.chartStatus}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/rail/${booking.train.id}/confirmation`}
                    className="inline-flex rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-ink hover:border-brand-400 hover:text-brand-700 transition-colors"
                  >
                    View Ticket
                  </Link>
                  <Link
                    href="/train/change-request"
                    className="inline-flex rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-ink hover:border-brand-400 hover:text-brand-700 transition-colors"
                  >
                    Request Change
                  </Link>
                  <Link
                    href="/train/file-tdr-online"
                    className="inline-flex rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-ink hover:border-brand-400 hover:text-brand-700 transition-colors"
                  >
                    File TDR
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
