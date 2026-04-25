"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import DateRangePicker, { type DateRange } from "@/components/ui/DateRangePicker";
import { useToast } from "@/components/ui/Toast";
import { useHotelSearchStore } from "@/state/hotelSearchStore";
import { toIsoDate } from "@/lib/format";
import CityField from "./CityField";
import RoomsGuestsPopover from "./RoomsGuestsPopover";

export default function HotelSearchForm() {
  const router = useRouter();
  const toast = useToast();
  const {
    city, checkIn, checkOut, rooms, adults, children,
    setCity, setCheckIn, setCheckOut, setRooms, setAdults, setChildren, pushRecent,
  } = useHotelSearchStore();

  const [submitting, setSubmitting] = useState(false);

  const dateRange: DateRange = {
    from: checkIn ? new Date(checkIn) : null,
    to: checkOut ? new Date(checkOut) : null,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const onSearch = () => {
    if (!city) { toast.push({ title: "Choose a destination", tone: "warn" }); return; }
    if (!checkIn) { toast.push({ title: "Pick a check-in date", tone: "warn" }); return; }
    if (!checkOut) { toast.push({ title: "Pick a check-out date", tone: "warn" }); return; }
    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.push({ title: "Check-out must be after check-in", tone: "warn" });
      return;
    }
    setSubmitting(true);
    pushRecent({
      id: `${city.code}-${checkIn}`,
      label: `${city.name} · ${checkIn}`,
      cityCode: city.code,
      when: new Date().toISOString(),
    });
    const params = new URLSearchParams({
      city: city.code,
      checkIn,
      checkOut,
      rooms: String(rooms),
      adults: String(adults),
      children: String(children),
    });
    router.push(`/hotel/results?${params.toString()}`);
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-(--shadow-lg) md:p-6">
      <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_1fr] lg:grid-cols-[1.2fr_1.5fr_1fr_auto]">
        <CityField value={city} onChange={setCity} />
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-ink-muted">Check-in — Check-out</span>
          <DateRangePicker
            mode="range"
            value={dateRange}
            minDate={today}
            onChange={(v) => {
              setCheckIn(v.from ? toIsoDate(v.from) : null);
              setCheckOut(v.to ? toIsoDate(v.to) : null);
            }}
            labelFrom="Check-in"
            labelTo="Check-out"
            placeholderFrom="Add date"
            placeholderTo="Add date"
          />
        </div>
        <RoomsGuestsPopover
          rooms={rooms}
          adults={adults}
          children={children}
          onRoomsChange={setRooms}
          onAdultsChange={setAdults}
          onChildrenChange={setChildren}
        />
        <div className="flex items-end">
          <Button onClick={onSearch} loading={submitting} size="xl" variant="accent" fullWidth>
            Search Hotels
          </Button>
        </div>
      </div>
    </div>
  );
}
