"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";

type Hotel = {
  city: string;
  image: string;
};

const HOTELS: Hotel[] = [
  { city: "Haridwar", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=900&q=80" },
  { city: "Bangkok", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80" },
  { city: "Abu Dhabi", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80" },
  { city: "Mumbai", image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=900&q=80" },
  { city: "Manali", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80" },
  { city: "Dubai", image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80" },
  { city: "Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80" },
  { city: "Jaipur", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80" },
  { city: "Singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80" },
  { city: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80" },
];

export default function TopHotelDeals() {
  const [page, setPage] = useState(0);

  // total slides (move 1 card at a time)
  const pageCount = HOTELS.length - 1;

  return (
    <section className="py-20">
      <div className="w-full px-10">
        <SectionHeading
          title="Top Hotel Deals"
          subtitle="Book hotels worldwide at affordable rates with ease."
        />

        {/* SLIDER */}
        <div className="mt-12 w-full overflow-hidden">
          <div
            className="flex w-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${page * 50}%)` }}
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
              aria-label={`Hotel deals page ${i + 1}`}
              onClick={() => setPage(i)}
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
  return (
    <a
      href="#"
      className="group relative block h-[460px] w-full  overflow-hidden rounded-xl"
      aria-label={`Explore hotels in ${hotel.city}`}
    >
      <img
        src={hotel.image}
        alt={hotel.city}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <span className="absolute bottom-4 left-4 text-xl font-bold text-white drop-shadow">
        {hotel.city}
      </span>

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