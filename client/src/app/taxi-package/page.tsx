"use client";

import { useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import AirportTransferSearch from "@/components/transport/AirportTransferSearch";
import OutstationSearch from "@/components/transport/OutstationSearch";
import SightseeingSearch from "@/components/transport/SightseeingSearch";
import { SIGHTSEEING_CITIES } from "@/lib/mock/taxi";

type Tab = "airport" | "outstation" | "sightseeing";

const TABS: { value: Tab; label: string; icon: string }[] = [
  { value: "airport", label: "Airport Transfer", icon: "✈️" },
  { value: "outstation", label: "Outstation Cab", icon: "🚗" },
  { value: "sightseeing", label: "Sightseeing Tours", icon: "🏛️" },
];

const WHY_ITEMS = [
  { icon: "🛡️", title: "Safe & Verified", desc: "All drivers background-checked and vehicles inspected regularly." },
  { icon: "💳", title: "Transparent Pricing", desc: "No hidden charges. Toll, driver allowance shown upfront." },
  { icon: "📍", title: "GPS Tracked", desc: "Real-time tracking on every ride shared with your contacts." },
  { icon: "🕐", title: "24×7 Support", desc: "Dedicated helpline for any issue before, during, or after your ride." },
  { icon: "🔄", title: "Free Cancellation", desc: "Cancel up to 24h before pickup on most bookings." },
  { icon: "⭐", title: "Top-Rated Drivers", desc: "Average driver rating above 4.3 across 50,000+ trips." },
];

export default function TaxiPackagePage() {
  const [tab, setTab] = useState<Tab>("airport");

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />

      {/* Hero */}
      <div className="relative overflow-hidden bg-brand-900 py-12 sm:py-16">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=70')" }}
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-[28px] sm:text-[36px] font-extrabold text-white mb-2">
              Book Cabs &amp; Tours Across India
            </h1>
            <p className="text-[15px] text-white/75">
              Airport transfers, outstation rides, and guided sightseeing — one platform.
            </p>
          </div>

          {/* Search card */}
          <div className="rounded-2xl bg-white shadow-(--shadow-pop) overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border-soft">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTab(t.value)}
                  className={[
                    "flex-1 flex items-center justify-center gap-2 py-3.5 text-[13px] font-semibold transition-colors",
                    tab === t.value
                      ? "border-b-2 border-brand-600 text-brand-700 bg-brand-50/40"
                      : "text-ink-muted hover:text-ink hover:bg-surface-muted",
                  ].join(" ")}
                >
                  <span>{t.icon}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="p-5 sm:p-6">
              {tab === "airport" && <AirportTransferSearch />}
              {tab === "outstation" && <OutstationSearch />}
              {tab === "sightseeing" && <SightseeingSearch />}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Popular sightseeing destinations */}
        <section className="mb-14">
          <h2 className="text-[22px] font-extrabold text-ink mb-1">Popular Destinations</h2>
          <p className="text-[14px] text-ink-muted mb-6">Discover top-rated guided tours across India</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SIGHTSEEING_CITIES.slice(0, 8).map((city) => (
              <a
                key={city.code}
                href={`/taxi-package/sightseeing/results?city=${city.code}&date=${new Date().toISOString().slice(0, 10)}&pax=2`}
                className="group relative overflow-hidden rounded-xl aspect-[4/3] block"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3">
                  <p className="text-[13px] font-bold text-white">{city.name}</p>
                  <p className="text-[11px] text-white/75">{city.state}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Why choose SpaksTrip */}
        <section className="mb-12">
          <h2 className="text-[22px] font-extrabold text-ink mb-1">Why Travel With Us</h2>
          <p className="text-[14px] text-ink-muted mb-6">Everything you need for a comfortable, safe journey</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="rounded-xl bg-white border border-border-soft p-5 flex gap-4">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-[14px] font-bold text-ink">{item.title}</p>
                  <p className="text-[12px] text-ink-muted mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular outstation routes */}
        <section>
          <h2 className="text-[22px] font-extrabold text-ink mb-1">Popular Outstation Routes</h2>
          <p className="text-[14px] text-ink-muted mb-6">Most booked one-way and round-trip routes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { from: "DEL", to: "AGR", fromName: "Delhi", toName: "Agra", dist: "230 km" },
              { from: "DEL", to: "JAI", fromName: "Delhi", toName: "Jaipur", dist: "290 km" },
              { from: "MUM", to: "PNQ", fromName: "Mumbai", toName: "Pune", dist: "155 km" },
              { from: "BLR", to: "MSO", fromName: "Bangalore", toName: "Mysore", dist: "145 km" },
              { from: "DEL", to: "SML", fromName: "Delhi", toName: "Shimla", dist: "360 km" },
              { from: "MUM", to: "GOA", fromName: "Mumbai", toName: "Goa", dist: "590 km" },
            ].map((r) => (
              <a
                key={`${r.from}-${r.to}`}
                href={`/taxi-package/outstation/results?from=${r.from}&to=${r.to}&date=${new Date().toISOString().slice(0, 10)}&tripType=one-way&pax=1`}
                className="flex items-center justify-between rounded-xl bg-white border border-border-soft px-4 py-3.5 hover:border-brand-400 hover:shadow-(--shadow-xs) transition-all"
              >
                <div>
                  <p className="text-[14px] font-bold text-ink">{r.fromName} → {r.toName}</p>
                  <p className="text-[12px] text-ink-muted mt-0.5">{r.dist}</p>
                </div>
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-ink-soft" aria-hidden>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
