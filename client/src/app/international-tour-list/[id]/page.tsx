"use client";

import { useParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import PackagePageHero from "@/components/holiday-packages/PackagePageHero";
import TourListContent from "@/components/holiday-packages/TourListContent";
import {
  INTERNATIONAL_CATEGORY_TITLES,
  getInternationalPackagesByCategory,
} from "@/lib/mock/tourPackages";

export default function InternationalTourListPage() {
  const params = useParams();
  const id = Number(params.id);

  const categoryTitle = INTERNATIONAL_CATEGORY_TITLES[id] ?? "International Tour Packages";
  const packages = getInternationalPackagesByCategory(id);

  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <PackagePageHero title={categoryTitle} image="/forest.jpg" />
        <section className="mx-auto max-w-5xl px-6 py-12">
          <TourListContent categoryTitle={categoryTitle} packages={packages} />
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
