"use client";

import Tabs, { type TabItem } from "@/components/ui/Tabs";
import type { TripType } from "@/state/flightSearchStore";

const ITEMS: TabItem<TripType>[] = [
  { value: "ONEWAY", label: "One Way" },
  { value: "ROUND", label: "Round Trip" },
  { value: "MULTI", label: "Multi City" },
];

export default function TripTypeTabs({
  value,
  onChange,
}: {
  value: TripType;
  onChange: (v: TripType) => void;
}) {
  return <Tabs value={value} onChange={onChange} items={ITEMS} variant="segmented" />;
}
