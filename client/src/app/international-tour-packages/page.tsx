import PackagePageHero from "@/components/holiday-packages/PackagePageHero";
import TourPackageCard, {
  type TourPackage,
} from "@/components/holiday-packages/TourPackageCard";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";

const PACKAGES: TourPackage[] = [
  {
    title: "Dubai Tour Package",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Singapore Tour Packages",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Singapore Malaysia Tour Package",
    image:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Hong Kong Tour Package",
    image:
      "https://images.unsplash.com/photo-1506970845246-18f21d533b23?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Australia Tour Package",
    image:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Sri Lanka Tour Packages",
    image:
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Thailand Tour Package",
    image:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Bali Tour Packages",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Nepal Tour Package",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Mauritius Trip",
    image:
      "https://images.unsplash.com/photo-1473286574974-8032b5f77c0c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "France Tour Pakage",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
  },
];

export default function InternationalTourPackagesPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <PackagePageHero
          title="Inter National Tour Packages"
          image="https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?auto=format&fit=crop&w=2000&q=80"
        />
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PACKAGES.map((p) => (
              <TourPackageCard key={p.title} pkg={p} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
