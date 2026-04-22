"use client";

import { useState } from "react";

export default function HotelSearchForm() {
  const [guests, setGuests] = useState({ adults: 4, rooms: 2 });

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="mx-auto w-full max-w-5xl rounded-xl bg-white shadow-lg overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <Cell label="Where do you want to stay?">
          <input
            type="text"
            aria-label="City"
            placeholder="City"
            className="w-full bg-transparent text-lg font-medium text-zinc-800 placeholder:text-zinc-400 outline-none pt-1"
          />
        </Cell>

        <Cell label="Check-In">
          <input
            type="date"
            aria-label="Check-In date"
            className="w-full bg-transparent text-base font-medium text-zinc-700 outline-none pt-1"
          />
        </Cell>

        <Cell label="Check-Out">
          <input
            type="date"
            aria-label="Check-Out date"
            className="w-full bg-transparent text-base font-medium text-zinc-700 outline-none pt-1"
          />
        </Cell>

        <GuestsCell guests={guests} onChange={setGuests} />

        <button
          type="submit"
          className="bg-[#1668E3] text-white font-bold text-lg px-10 py-6 hover:bg-[#0f58c7] transition-colors whitespace-nowrap"
        >
          Search
        </button>
      </div>
    </form>
  );
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-zinc-200 px-5 py-4">
      <span className="text-xs font-medium text-zinc-500 mb-0.5">{label}</span>
      {children}
    </div>
  );
}

function GuestsCell({
  guests,
  onChange,
}: {
  guests: { adults: number; rooms: number };
  onChange: (v: { adults: number; rooms: number }) => void;
}) {
  return (
    <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-zinc-200 px-5 py-4">
      <span className="text-xs font-medium text-zinc-500 mb-0.5">Guests</span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-[#1668E3]">
          {guests.adults}
        </span>
        <span className="text-base font-medium text-zinc-700">Persons</span>
      </div>
      <span className="text-xs text-zinc-400 mt-0.5">
        {guests.adults} Adult, {guests.rooms} Rooms
      </span>
    </div>
  );
}
