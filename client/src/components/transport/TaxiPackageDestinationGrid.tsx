"use client";

import Link from "next/link";
import TaxiPackageCard, { type TaxiPackage } from "@/components/transport/TaxiPackageCard";

type Props = {
  title: string;
  subtitle: string;
  destinations: TaxiPackage[];
  limit?: number;
  ctaHref?: string;
  ctaLabel?: string;
  cardHref?: string;
};

export default function TaxiPackageDestinationGrid({
  title,
  subtitle,
  destinations,
  limit,
  ctaHref,
  ctaLabel,
  cardHref,
}: Props) {
  const items = typeof limit === "number" ? destinations.slice(0, limit) : destinations;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[24px] font-extrabold tracking-tight text-ink">{title}</h2>
          <p className="mt-1 text-[14px] text-ink-muted">{subtitle}</p>
        </div>

        {ctaHref && ctaLabel ? (
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full border border-border-soft px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((destination) => {
          const card = <TaxiPackageCard pkg={destination} />;
          return cardHref ? (
            <Link key={destination.title} href={cardHref} className="block">
              {card}
            </Link>
          ) : (
            <div key={destination.title}>{card}</div>
          );
        })}
      </div>
    </section>
  );
}
