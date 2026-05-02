import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import TaxiPackageDestinationsGrid from "@/components/transport/TaxiPackageDestinationsGrid";

export default function TaxiPackageDestinationsPage() {
  return (
    <div className="min-h-screen bg-surface-muted text-ink">
      <Header />

      <section className="bg-brand-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/68">
            Transport
          </p>
          <h1 className="mt-2 text-4xl font-black">Taxi Packages</h1>
          <p className="mt-3 max-w-3xl text-[15px] text-white/75">
            Browse curated regional taxi packages including Delhi, Jammu & Kashmir, North
            East, Rajasthan, Goa, and more.
          </p>
        </div>
      </section>

      <main>
        <TaxiPackageDestinationsGrid
          title="Popular taxi package destinations"
          subtitle="Regional packages are arranged to help customers and business partners compare locations at a glance."
        />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
