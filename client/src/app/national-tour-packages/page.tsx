import PackagePageHero from "@/components/holiday-packages/PackagePageHero";
import TourPackageCard, {
  type TourPackage,
} from "@/components/holiday-packages/TourPackageCard";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";

const PACKAGES: TourPackage[] = [
  {
    title: "Jammu, Srinagar & Leh Ladakh",
    image:
      "https://images.unsplash.com/photo-1566837497312-7be4a47c1e84?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Andaman Tour Package",
    image:
      "https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "kerela tour package",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Uttarakhand Tour Package",
    image:
      "https://images.unsplash.com/photo-1591017403286-fd8493524e1d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Ujjain and Mahakaleshwar Tour Packages",
    image:
      "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Jagannath Puri Temple Tour Packages",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Tripura Tour Packages",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Manipur tour packages",
    image:
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Punjab Tour Package",
    image:
      "https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Delhi Sightseen Tour",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Rajasthan Tour Package",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Golden Temple Tour",
    image:
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Himanchal Tour Package",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Assam Tours",
    image:
      "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Ajmer and Pushkar Tour Packages",
    image:
      "https://images.unsplash.com/photo-1477586957327-847a0f3f4ff2?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Varanasi Temple Tour Packages",
    image:
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Shirdi Tour Packages",
    image:
      "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Tirupati Balaji Tour Packages",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Tamil Nadu Tour Packages",
    image:
      "https://images.unsplash.com/photo-1621907658998-9ca89c2c0a09?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Delhi Golden Triangle Trip",
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Odisha Tour Package",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "karnataka Tour Package",
    image:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Assam Tour Packages",
    image:
      "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Goa Tour Package",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Gujarat Tour",
    image:
      "https://images.unsplash.com/photo-1624886002150-1a7b01d67d93?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Sikkim Tour Package",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Maharashtra Tour Package",
    image:
      "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=900&q=80",
  },
];

export default function NationalTourPackagesPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <PackagePageHero
          title="National Tour Packages"
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
