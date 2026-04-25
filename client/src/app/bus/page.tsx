"use client";

import { useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import BusSearchForm from "@/components/bus/BusSearchForm";
import BusResultCard from "@/components/bus/BusResultCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import { toIsoDate } from "@/lib/format";
import type { ApiResponse, BusSearchResult } from "@/lib/busTypes";

const today = toIsoDate(new Date());

export default function BusPage() {
  const [source, setSource] = useState("Delhi");
  const [destination, setDestination] = useState("Jaipur");
  const [travelDate, setTravelDate] = useState(today);
  const [results, setResults] = useState<BusSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const runSearch = async () => {
    if (source === destination) {
      setError("Source and destination must be different.");
      setResults([]);
      setSearched(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await fetch("/api/bus/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination, travelDate }),
      });

      const payload = (await response.json()) as ApiResponse<BusSearchResult[]>;
      if (!payload.success) {
        setError(payload.error);
        setResults([]);
        return;
      }

      setResults(payload.data);
    } catch {
      setError("Unable to search buses right now.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />
      <main>
        <section className="relative overflow-hidden bg-brand-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(242,90,26,0.22),transparent_30%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/80">
                Bus booking with mock backend
              </span>
              <h1 className="mt-4 text-[38px] font-black leading-tight text-white">
                Search intercity buses with a TBO-ready frontend flow
              </h1>
              <p className="mt-3 max-w-xl text-[15px] text-white/75">
                Pick your route, compare operators, open the seat map, and complete a full mock booking without changing the UI contract later.
              </p>
            </div>
            <div className="mt-8">
              <BusSearchForm
                source={source}
                destination={destination}
                travelDate={travelDate}
                loading={loading}
                error={error ?? undefined}
                onChange={(field, value) => {
                  if (field === "source") setSource(value);
                  if (field === "destination") setDestination(value);
                  if (field === "travelDate") setTravelDate(value);
                }}
                onSwap={() => {
                  setSource(destination);
                  setDestination(source);
                }}
                onSubmit={runSearch}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {!searched ? (
            <div className="rounded-2xl border border-border-soft bg-white">
              <EmptyState
                title="Search buses to see live mock inventory"
                subtitle="Results will load from the new `/api/bus/search` route backed by the abstracted bus service."
              />
            </div>
          ) : null}

          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-52 rounded-2xl" />
              ))}
            </div>
          ) : null}

          {!loading && error && searched ? (
            <div className="rounded-2xl border border-border-soft bg-white">
              <ErrorState message={error} onRetry={runSearch} />
            </div>
          ) : null}

          {!loading && searched && !error && results.length === 0 ? (
            <div className="rounded-2xl border border-border-soft bg-white">
              <EmptyState
                title="No buses found"
                subtitle="Try a different city pair or another date. The mock dataset only includes selected intercity routes."
              />
            </div>
          ) : null}

          {!loading && !error && results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[26px] font-black text-ink">
                    {source} to {destination}
                  </p>
                  <p className="text-[14px] text-ink-muted">
                    {results.length} buses for {travelDate}
                  </p>
                </div>
              </div>
              {results.map((bus) => (
                <BusResultCard key={bus.id} bus={bus} travelDate={travelDate} />
              ))}
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
