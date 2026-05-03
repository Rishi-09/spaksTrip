"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BookingStepper from "@/components/flight/BookingStepper";
import ItinerarySummary from "@/components/flight/ItinerarySummary";
import PriceBreakdown from "@/components/flight/PriceBreakdown";
import Button from "@/components/ui/Button";
import Accordion from "@/components/ui/Accordion";
import { useBookingStore } from "@/state/bookingStore";
import { useToast } from "@/components/ui/Toast";
import { getFareRules, fetchFareQuote, type FareRule } from "@/services/flights";

export default function FlightReviewPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ReviewInner />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <BookingStepper active="review" />
      <main className="flex-1 grid place-items-center p-8 text-ink-muted text-[14px]">
        Loading booking…
      </main>
      <Footer />
    </div>
  );
}

function ReviewInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { current, advanceStatus, storeFareQuote } = useBookingStore();
  const toast = useToast();

  // FareQuote state — gates the Continue button until confirmed
  const [quoteReady, setQuoteReady] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
  const [priceChanged, setPriceChanged] = useState(false);

  useEffect(() => {
    if (!current) {
      toast.push({ title: "Session expired", description: "Please re-select your flight", tone: "warn" });
      router.replace("/flight");
      return;
    }

    // Skip re-fetching if we already have a traceId stored for this offer
    if (current.quoteTraceId) {
      setQuoteReady(true);
      return;
    }

    fetchFareQuote(current.offer.id)
      .then((data) => {
        storeFareQuote({
          traceId: data.traceId,
          isLCC: data.isLCC,
          fareBreakdown: data.fareBreakdown,
        });
        if (data.isPriceChanged) {
          setPriceChanged(true);
          toast.push({ title: "Price updated", description: "The fare changed since you last searched.", tone: "warn" });
        }
        setQuoteReady(true);
      })
      .catch(() => {
        setQuoteError(true);
        toast.push({ title: "Could not confirm fare", description: "Please go back and re-select your flight.", tone: "danger" });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.offer.id]);

  if (!current) return null;

  const onContinue = () => {
    advanceStatus("TRAVELER");
    router.push(`/flight/${encodeURIComponent(current.offer.id)}/traveler?${sp.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <BookingStepper active="review" />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 md:px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-[22px] font-extrabold text-ink">Review your itinerary</h1>
              <p className="text-[13px] text-ink-muted">Selected fare: {current.fareFamily.name}</p>
            </div>
            <Link href={`/flight/results?${sp.toString()}`} className="text-[13px] font-semibold text-brand-700 hover:underline">
              ← Back to results
            </Link>
          </div>

          {priceChanged && (
            <div className="mb-4 rounded-xl bg-warn-50 border border-warn-200 text-warn-700 text-[13px] font-medium px-4 py-3 flex items-center gap-2">
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              The fare price has changed. The updated price is reflected in the summary.
            </div>
          )}

          <div className="grid md:grid-cols-[1fr_340px] gap-5">
            <div className="flex flex-col gap-4">
              <ItinerarySummary offer={current.offer} />
              <FareRules booking={current} />
              <BaggageInfo booking={current} />
            </div>
            <aside className="flex flex-col gap-4">
              <PriceBreakdown booking={current} />
              {quoteError ? (
                <p className="text-[13px] text-danger-600 font-medium text-center">
                  Fare confirmation failed. Please go back and re-select your flight.
                </p>
              ) : (
                <Button
                  variant="accent"
                  size="lg"
                  onClick={onContinue}
                  fullWidth
                  disabled={!quoteReady}
                  loading={!quoteReady}
                >
                  {quoteReady ? "Continue to travellers" : "Confirming fare…"}
                </Button>
              )}
              <div className="rounded-xl bg-success-50 text-success-700 text-[12px] font-medium px-4 py-3 flex items-start gap-2">
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2C20 17.5 12 22 12 22z" />
                </svg>
                <span>
                  Secure payment. All prices include taxes and airline fees. Your fare is locked until payment completes.
                </span>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FareRules({ booking }: { booking: ReturnType<typeof useBookingStore.getState>["current"] }) {
  const [rules, setRules] = useState<FareRule[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!booking) return;
    getFareRules(booking.offer.id, booking.quoteTraceId)
      .then((r) => setRules(r))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [booking?.offer.id]);

  if (!booking) return null;

  const ruleItems = rules?.map((r, i) => ({
    value: `rule-${i}`,
    title: `${r.airline}: ${r.origin} → ${r.destination} (${r.fareBasis})`,
    content: (
      <div className="text-[12px] text-ink-muted leading-relaxed">
        {r.detail.split(/\r?\n/).map((line, j) =>
          line.trim() === "" ? (
            <div key={j} className="h-2" />
          ) : (
            <p key={j} className={line.trim().length < 60 && j > 0 ? "font-semibold text-ink mt-2" : ""}>
              {line}
            </p>
          ),
        )}
        {r.restriction && (
          <p className="mt-3 text-warning-700 font-medium">{r.restriction}</p>
        )}
      </div>
    ),
  })) ?? [];

  const staticItems = [
    {
      value: "no-show",
      title: "No-show policy",
      content: <p>A no-show will forfeit the entire base fare. Only statutory taxes may be refunded.</p>,
    },
    {
      value: "visa",
      title: "Visa & travel documents",
      content: <p>Passengers are responsible for all travel documents and visa requirements.</p>,
    },
  ];

  return (
    <div className="rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs)">
      <h2 className="text-[15px] font-bold text-ink mb-2">Fare rules</h2>
      <p className="text-[11px] text-ink-muted mb-3">
        Fees are indicative per pax per sector. GST + RAF + applicable charges extra.
      </p>
      {loading && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-surface-muted animate-pulse" />
          ))}
        </div>
      )}
      {!loading && fetchError && (
        <p className="text-[13px] text-ink-muted">
          Fare rules unavailable at this time. Please check the airline website for full terms.
        </p>
      )}
      {!loading && !fetchError && (
        <Accordion
          defaultOpen={ruleItems[0] ? [ruleItems[0].value] : []}
          items={[...ruleItems, ...staticItems]}
        />
      )}
    </div>
  );
}

function BaggageInfo({ booking }: { booking: ReturnType<typeof useBookingStore.getState>["current"] }) {
  if (!booking) return null;
  const { offer } = booking;
  return (
    <div className="rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs)">
      <h2 className="text-[15px] font-bold text-ink mb-3">Baggage allowance</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <BagBox
          label="Cabin baggage"
          value={`${offer.baggage.cabin} kg`}
          sub="1 hand piece + 1 personal item"
        />
        <BagBox
          label="Check-in baggage"
          value={`${offer.baggage.checkin} kg`}
          sub="Included in fare"
        />
      </div>
    </div>
  );
}

function BagBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg bg-surface-muted p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-[18px] font-extrabold text-ink">{value}</div>
      <div className="text-[11px] text-ink-muted">{sub}</div>
    </div>
  );
}
