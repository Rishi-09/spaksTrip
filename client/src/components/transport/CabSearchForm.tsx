"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Chip from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { toIsoDate } from "@/lib/format";

type TripMode = "oneway" | "round";

export default function CabSearchForm() {
  const router = useRouter();
  const toast = useToast();

  const [mode, setMode] = useState<TripMode>("oneway");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(toIsoDate(new Date()));
  const [returnDate, setReturnDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [submitting, setSubmitting] = useState(false);

  const onSearch = () => {
    if (!from.trim()) { toast.push({ title: "Enter pickup location", tone: "warn" }); return; }
    if (!to.trim()) { toast.push({ title: "Enter drop location", tone: "warn" }); return; }
    if (!date) { toast.push({ title: "Pick a date", tone: "warn" }); return; }
    setSubmitting(true);
    const params = new URLSearchParams({ from: from.trim(), to: to.trim(), date, time, mode });
    if (mode === "round" && returnDate) params.set("return", returnDate);
    router.push(`/cabs/results?${params.toString()}`);
  };

  return (
    <div className="bg-accent-500 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-extrabold text-white mb-5 tracking-tight">Book a Cab</h1>
        <div className="rounded-2xl bg-white p-5 shadow-(--shadow-lg)">
          <div className="flex gap-2 mb-4">
            <Chip active={mode === "oneway"} onClick={() => setMode("oneway")}>One Way</Chip>
            <Chip active={mode === "round"} onClick={() => setMode("round")}>Round Trip</Chip>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <Input
              label="From (Pickup)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="City or area"
              leading={
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-ink-muted">
                  <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z" />
                </svg>
              }
            />
            <Input
              label="To (Drop)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="City or area"
              leading={
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-ink-muted">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              }
            />
            <Input
              label={mode === "round" ? "Departure Date" : "Date"}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {mode === "round" && (
              <Input
                label="Return Date"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            )}
            <Input
              label="Pickup Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button onClick={onSearch} loading={submitting} size="xl" variant="accent" fullWidth>
                Search Cabs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
