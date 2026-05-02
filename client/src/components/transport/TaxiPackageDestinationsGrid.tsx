import TaxiPackageCard from "@/components/transport/TaxiPackageCard";
import { TAXI_PACKAGE_DESTINATIONS } from "@/lib/taxiPackageDestinations";

type Props = {
  title?: string;
  subtitle?: string;
};

export default function TaxiPackageDestinationsGrid({
  title = "Taxi Packages",
  subtitle = "Explore popular regional taxi packages across India.",
}: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-brand-700">
          Transport
        </p>
        <h2 className="text-3xl font-black text-ink">{title}</h2>
        <p className="max-w-3xl text-[14px] text-ink-muted sm:text-[15px]">{subtitle}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {TAXI_PACKAGE_DESTINATIONS.map((item) => (
          <article
            key={item.name}
            className="overflow-hidden rounded-[24px] border border-border-soft bg-white shadow-(--shadow-xs)"
          >
            <TaxiPackageCard
              pkg={{
                title: item.name,
                subtitle: item.subtitle,
                image: item.image,
              }}
            />

            <div className="space-y-3 p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Coverage
                </p>
                <p className="mt-1 text-[14px] font-semibold text-ink">{item.coverage}</p>
              </div>

              <div className="rounded-2xl bg-surface-muted px-3 py-3 text-[13px] text-ink-muted">
                {item.highlight}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
