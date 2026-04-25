"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import BookingSidebar from "@/components/holiday-packages/BookingSidebar";
import ItineraryBlock from "@/components/holiday-packages/ItineraryBlock";
import CalendarView from "@/components/holiday-packages/CalendarView";
import GroupTourList from "@/components/holiday-packages/GroupTourList";
import { getNationalDetail } from "@/lib/mock/tourPackages";
import type { GroupTour } from "@/lib/mock/tourPackages";

const TABS = [
  "Location View Map",
  "Tour Calendar",
  "Group Tours",
  "Tour Package Cost List",
  "Inclusions/Exclusions",
  "Tour Type Rooms",
] as const;

export default function NationalTourDetailsPage() {
  const params = useParams();
  const id = Number(params.id);
  const pkg = getNationalDetail(id);

  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<string>(TABS[0]);
  const [selectedCheckIn, setSelectedCheckIn] = useState("");
  const [selectedCheckOut, setSelectedCheckOut] = useState("");

  function handleDateSelect(ci: string, co: string) {
    setSelectedCheckIn(ci);
    setSelectedCheckOut(co);
  }

  function handleJoinGroup(tour: GroupTour) {
    setSelectedCheckIn(tour.start_date);
    setSelectedCheckOut(tour.end_date);
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-ink-muted text-lg">Package not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const images = pkg.images ?? [pkg.image];

  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Top: Image carousel + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Left: Image carousel */}
          <div>
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={images[activeImage]}
                alt={pkg.title}
                className="h-[420px] w-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 text-lg"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 text-lg"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mt-5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-[12px] font-bold transition-colors ${
                    activeTab === tab
                      ? "bg-[#c0392b] text-white"
                      : "bg-[#e53e2a] text-white hover:bg-[#c0392b]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content panels */}
            {activeTab === "Tour Calendar" && pkg.calendar && (
              <CalendarView
                calendarDates={pkg.calendar}
                pkgTitle={pkg.title}
                duration={pkg.duration}
                onDateSelect={handleDateSelect}
              />
            )}
            {activeTab === "Group Tours" && pkg.groupTours && (
              <GroupTourList
                groupTours={pkg.groupTours}
                onJoinGroup={handleJoinGroup}
              />
            )}

            {/* Description */}
            <section className="mt-8 rounded-xl border border-border-soft p-5">
              <h2 className="text-[18px] font-bold text-ink mb-3">Description</h2>
              <p className="text-[14px] text-ink-soft leading-relaxed">{pkg.description}</p>
            </section>

            {/* Highlight */}
            <section className="mt-5 rounded-xl border border-border-soft p-5">
              <h2 className="text-[18px] font-bold text-ink mb-3">Highlight</h2>
              {[1, 2, 3].map((i) => (
                <p key={i} className="text-[13px] text-ink-soft leading-relaxed mb-3 last:mb-0">
                  {pkg.highlights}
                </p>
              ))}
            </section>

            {/* Itinerary */}
            <ItineraryBlock days={pkg.itinerary} />

            {/* Documents */}
            <section className="mt-8 rounded-xl border border-border-soft overflow-hidden">
              <div className="bg-[#e8f4f1] border-b border-[#2a7c6f]/20 px-5 py-3">
                <h3 className="text-[14px] font-bold text-[#2a7c6f]">
                  Documents for National tours
                </h3>
              </div>
              <div className="p-5">
                {pkg.documents.map((doc, i) => (
                  <p key={i} className="flex items-start gap-2 text-[13px] text-ink-soft">
                    <svg
                      viewBox="0 0 24 24"
                      width={14}
                      height={14}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#2a7c6f] mt-0.5 shrink-0"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {doc}
                  </p>
                ))}
              </div>
            </section>

            {/* Cancellation Policy */}
            <section className="mt-5 rounded-xl border border-border-soft overflow-hidden">
              <div className="border-b border-border-soft px-5 py-3">
                <h3 className="text-[14px] font-bold text-ink">
                  Tour Cancellation Policy – If the package is cancelled by client:
                </h3>
              </div>
              <div className="p-5">
                <ul className="flex flex-col gap-2">
                  {pkg.cancellationPolicy.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-ink-soft">
                      <span className="text-[#e53e2a] font-bold shrink-0">»</span>
                      <span dangerouslySetInnerHTML={{ __html: rule.replace(/(\d+)/, "<strong>$1</strong>").replace(/cancelled (\d+) days/, "cancelled <strong>$1 days</strong>").replace(/7 days/, "<strong>7 days</strong>") }} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Terms & Conditions */}
            <section className="mt-5 rounded-xl border border-border-soft overflow-hidden">
              <div className="border-b border-border-soft px-5 py-3">
                <h3 className="text-[14px] font-bold text-[#2a7c6f]">Terms & Conditions</h3>
              </div>
              <div className="p-5">
                <div className="text-[12px] text-ink-soft leading-relaxed whitespace-pre-line">
                  {pkg.termsAndConditions}
                </div>
              </div>
            </section>

            {/* Tour Gallery */}
            <section className="mt-8">
              <h2 className="text-[18px] font-bold text-ink mb-4">Tour Gallery</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {pkg.gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i % images.length)}
                    className="overflow-hidden rounded-lg"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${i + 1}`}
                      className="h-20 w-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Booking sidebar */}
          <div>
            <BookingSidebar
              pkg={pkg}
              initialCheckIn={selectedCheckIn}
              initialCheckOut={selectedCheckOut}
            />
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
