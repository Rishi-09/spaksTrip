import CabSearchForm from "@/components/transport/CabSearchForm";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import SectionHeading from "@/components/landing/SectionHeading";
import WhyChooseUs from "@/components/landing/WhyChooseUs";

export default function CabsPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <CabSearchForm />

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading title="Why Choose Us OYO Tours" />
          </div>
          <div className="mt-0">
            <WhyChooseUsGrid />
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

function WhyChooseUsGrid() {
  return (
    <div className="mx-auto mt-8 max-w-7xl px-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className="flex flex-col items-center justify-center gap-5 rounded-2xl bg-[#F4F6F9] px-6 py-10 text-center hover:-translate-y-1 hover:shadow-lg transition"
          >
            <div aria-hidden="true" className="grid h-20 w-20 place-items-center">
              {f.icon}
            </div>
            <h3 className="text-base font-bold text-[#0E1E3A]">{f.title}</h3>
          </article>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "Best Review",
    icon: (
      <svg viewBox="0 0 64 64" width={64} height={64}>
        <polygon points="16,12 20,4 24,12" fill="#FFC72C" />
        <polygon points="32,8 36,0 40,8" fill="#FFC72C" />
        <polygon points="48,12 52,4 56,12" fill="#FFC72C" />
        <path d="M14 28h10v26H14a2 2 0 0 1-2-2V30a2 2 0 0 1 2-2Z" fill="#F7B2A8" />
        <path d="M24 28l6-12c1-2 4-2 5 0s1 4 0 6l-2 4h12c3 0 5 3 4 6l-4 14c-1 3-3 4-6 4H24Z" fill="#F78A6B" />
      </svg>
    ),
  },
  {
    title: "No Cost EMI Facility",
    icon: (
      <svg viewBox="0 0 64 64" width={64} height={64}>
        <path d="M32 8 22 20h6v16h8V20h6L32 8Z" fill="#2ECC71" />
        <circle cx={32} cy={48} r={10} fill="none" stroke="#2ECC71" strokeWidth={3} />
        <text x={32} y={53} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2ECC71">%</text>
      </svg>
    ),
  },
  {
    title: "Premium Tours",
    icon: (
      <svg viewBox="0 0 64 64" width={64} height={64}>
        <circle cx={32} cy={32} r={22} fill="#4A90E2" />
        <path d="M10 32h44M32 10c8 8 8 36 0 44M32 10c-8 8-8 36 0 44" stroke="#fff" strokeWidth={2} fill="none" />
        <circle cx={18} cy={16} r={3} fill="#E74C3C" />
        <circle cx={48} cy={22} r={3} fill="#F1C40F" />
        <circle cx={44} cy={48} r={3} fill="#27AE60" />
      </svg>
    ),
  },
  {
    title: "Verified Drivers",
    icon: (
      <svg viewBox="0 0 64 64" width={64} height={64}>
        <rect x={14} y={10} width={36} height={18} rx={9} fill="#1F3A8A" />
        <rect x={18} y={14} width={28} height={6} rx={2} fill="#fff" />
        <rect x={12} y={28} width={40} height={22} rx={4} fill="#2C7BD9" />
        <circle cx={32} cy={42} r={8} fill="#F5D6B3" />
      </svg>
    ),
  },
  {
    title: "Verified Hotels",
    icon: (
      <svg viewBox="0 0 64 64" width={64} height={64}>
        <rect x={10} y={18} width={44} height={36} fill="#E74C3C" />
        <rect x={14} y={10} width={36} height={10} fill="#fff" stroke="#2C3E50" strokeWidth={1} />
        <text x={32} y={18} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#2C3E50">HOTEL</text>
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`${r}-${c}`} x={16 + c * 12} y={24 + r * 8} width={8} height={5} fill="#5DADE2" />
          ))
        )}
      </svg>
    ),
  },
  {
    title: "Well Planned Itineraries",
    icon: (
      <svg viewBox="0 0 64 64" width={64} height={64}>
        <path d="M16 14c6 0 6 10 0 10s-6-10 0-10Z" fill="#FF3B30" />
        <circle cx={16} cy={19} r={2} fill="#fff" />
        <path d="M48 34c6 0 6 10 0 10s-6-10 0-10Z" fill="#FF3B30" />
        <circle cx={48} cy={39} r={2} fill="#fff" />
        <path d="M16 28c4 8 20 0 32 14" stroke="#4A90E2" strokeWidth={2} fill="none" strokeDasharray="3 3" />
      </svg>
    ),
  },
  {
    title: "Lowest Price Challenges",
    icon: (
      <svg viewBox="0 0 64 64" width={64} height={64}>
        <path d="M32 10a22 22 0 1 1-20 30" stroke="#1F3A8A" strokeWidth={4} fill="none" strokeLinecap="round" />
        <polygon points="12,40 6,34 16,34" fill="#1F3A8A" />
        <text x={32} y={38} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#E91E63">$</text>
      </svg>
    ),
  },
  {
    title: "24*7 Call & WhatsApp Support",
    icon: (
      <svg viewBox="0 0 64 64" width={64} height={64}>
        <circle cx={32} cy={22} r={12} fill="#F5A623" />
        <path d="M16 54c0-10 8-16 16-16s16 6 16 16Z" fill="#E74C3C" />
        <rect x={18} y={22} width={6} height={10} rx={3} fill="#333" />
        <rect x={40} y={22} width={6} height={10} rx={3} fill="#333" />
        <path d="M18 22c0-8 6-14 14-14s14 6 14 14" stroke="#333" strokeWidth={2} fill="none" />
      </svg>
    ),
  },
];
