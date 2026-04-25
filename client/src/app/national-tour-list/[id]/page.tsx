"use client";

import { useParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import PackagePageHero from "@/components/holiday-packages/PackagePageHero";
import TourListContent from "@/components/holiday-packages/TourListContent";
import {
  NATIONAL_CATEGORY_TITLES,
  getNationalPackagesByCategory,
} from "@/lib/mock/tourPackages";

export default function NationalTourListPage() {
  const params = useParams();
  const id = Number(params.id);

  const categoryTitle = NATIONAL_CATEGORY_TITLES[id] ?? "Tour Packages";
  const packages = getNationalPackagesByCategory(id);

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
