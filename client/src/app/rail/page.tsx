import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import TrainHero from "@/components/rail/TrainHero";

export default function RailPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <TrainHero />
        {/* Spacer to account for overlapping form */}
        <div className="h-36 bg-surface-muted" />
        <section className="bg-surface-muted pb-16 px-4">
          <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            {[
              { icon: "🚂", title: "10,000+ Trains", sub: "Covering every major route across India" },
              { icon: "🎟️", title: "Tatkal Booking", sub: "Last-minute booking at dynamic fares" },
              { icon: "🔒", title: "Secure Payments", sub: "PCI-DSS compliant gateway" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-white border border-border-soft p-5 shadow-(--shadow-xs)">
                <p className="text-[28px]">{item.icon}</p>
                <p className="mt-2 text-[14px] font-extrabold text-ink">{item.title}</p>
                <p className="mt-0.5 text-[12px] text-ink-muted">{item.sub}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
