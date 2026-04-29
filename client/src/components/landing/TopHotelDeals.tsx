"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslate } from "@tolgee/react";
import SectionHeading from "./SectionHeading";
import { useCountryLocale } from "@/state/localeStore";
import { formatCurrency } from "@/lib/format";

type Hotel = {
  city: string;
  image: string;
  basePrice: number;
};

const HOTELS: Hotel[] = [
  { city: "Haridwar",  image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=900&q=80", basePrice: 2500 },
  { city: "Bangkok",   image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80", basePrice: 4800 },
  { city: "Abu Dhabi", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80", basePrice: 8500 },
  { city: "Mumbai",    image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=900&q=80", basePrice: 3200 },
  { city: "Manali",    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80", basePrice: 2800 },
  { city: "Dubai",     image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80", basePrice: 9200 },
  { city: "Goa",       image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80", basePrice: 3500 },
  { city: "Jaipur",    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80", basePrice: 2100 },
  { city: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80", basePrice: 7600 },
  { city: "Paris",     image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80", basePrice: 11000 },
];

export default function TopHotelDeals() {
  const { t } = useTranslate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  // total slides (move 1 card at a time)
  const pageCount = HOTELS.length - 1;

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const onScroll = () => {
      setPage(Math.round(element.scrollLeft / (element.clientWidth / 2)));
    };

    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
  }, []);

  const scrollCards = (direction: "left" | "right") => {
    const element = scrollRef.current;
    if (!element) return;

    element.scrollBy({
      left: direction === "left" ? -(element.clientWidth / 2) : element.clientWidth / 2,
      behavior: "smooth",
    });
  };

  const scrollToPage = (index: number) => {
    const element = scrollRef.current;
    if (!element) return;

    element.scrollTo({
      left: index * (element.clientWidth / 2),
      behavior: "smooth",
    });
  };

  return (
    <section className="py-20">
      <div className="w-full px-10">
        <SectionHeading
          title={t("hotel.top_deals")}
          subtitle={t("hotel.top_choices_subtitle")}
        />

        {/* SLIDER */}
        <div className="relative mt-12 w-full">
          <button
            type="button"
            aria-label={t("landing.scroll_left")}
            onClick={() => scrollCards("left")}
            className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white text-zinc-700 shadow-md ring-1 ring-black/5 hover:bg-zinc-50"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            aria-label={t("landing.scroll_right")}
            onClick={() => scrollCards("right")}
            className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-white text-zinc-700 shadow-md ring-1 ring-black/5 hover:bg-zinc-50"
          >
            <Chevron direction="right" />
          </button>
          <div
            ref={scrollRef}
            className="flex w-full overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {HOTELS.map((h) => (
              <div
                key={h.city}
                className="w-1/2 flex-shrink-0 flex justify-center px-6"
              >
                <HotelCard hotel={h} />
              </div>
            ))}
          </div>
        </div>

        {/* DOTS */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={t("landing.hotel_deals_page", { n: i + 1 })}
              onClick={() => scrollToPage(i)}
              className={`h-2 rounded-full transition-all ${
                i === page ? "w-8 bg-[#E0382E]" : "w-2 bg-zinc-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HotelCard({ hotel }: { hotel: Hotel }) {
  const { t } = useTranslate();
  const { locale, currency } = useCountryLocale();
  const price = formatCurrency(hotel.basePrice, locale, currency);

  return (
    <a
      href="#"
      className="group relative block h-[460px] w-full  overflow-hidden rounded-xl"
      aria-label={t("landing.explore_hotels_in", { city: hotel.city })}
    >
      <img
        src={hotel.image}
        alt={hotel.city}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <div className="absolute bottom-4 left-4 flex flex-col gap-0.5">
        <span className="text-xl font-bold text-white drop-shadow">{hotel.city}</span>
        <span className="text-[11px] text-white/80">{t("landing.from_per_night", { price })}</span>
      </div>

      <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white text-[#0E1E3A] shadow transition-transform group-hover:translate-x-1">
        <svg
          viewBox="0 0 24 24"
          width={16}
          height={16}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1={5} y1={12} x2={19} y2={12} />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </a>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}
