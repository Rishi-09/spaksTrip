import PackagePageHero from "@/components/holiday-packages/PackagePageHero";
import TaxiPackageCard, {
  type TaxiPackage,
} from "@/components/transport/TaxiPackageCard";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";

const PACKAGES: TaxiPackage[] = [
  {
    title: "Himachal Taxi Tour",
    subtitle: "Tour Taxi Package",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Rajasthan Taxi Tour",
    subtitle: "Tour Taxi Package",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Goa Tour",
    subtitle: "North Goa Scenic Beach Explorer Tour (3 Days / 2 Nights)",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Kerala Tour",
    subtitle: "Kerala Tour Packages",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Kashmir Taxi Tour",
    subtitle: "kashmir 4 Nights 5 Days",
    image: "https://images.unsplash.com/photo-1566837497312-7be4a47c1e84?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Odisha Taxi Tour",
    subtitle: "Odisha Tour",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Andaman Taxi Tour Package",
    subtitle: "Andaman Tour Package",
    image: "https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Karnataka Taxi Tour",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Madhya Pradesh Taxi Tour",
    subtitle: "Madhya Pradesh Taxi Tour",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Delhi Taxi Tour",
    subtitle: "Delhi Tour",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Punjab Tour Package",
    subtitle: "Punjab Tour Package",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Shirdi Taxi Tour Packages",
    image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Uttarakhand Taxi Tour Package",
    subtitle: "Uttarakhand Taxi Tour Package",
    image: "https://images.unsplash.com/photo-1591017403286-fd8493524e1d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Tripura Tour Packages",
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Manipur tour packages",
    image: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Tirupati balaji",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Varanasi Temple Taxi package",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Assam Taxi package",
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Tamil Nadu Taxi package",
    image: "https://images.unsplash.com/photo-1621907658998-9ca89c2c0a09?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Maharashtra",
    image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Bali Taxi Tour",
    subtitle: "Bali Taxi Tour",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Gujarat Taxi Packages",
    image: "https://images.unsplash.com/photo-1624886002150-1a7b01d67d93?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Bhutan Taxi Tour",
    subtitle: "Bhutan Taxi Tour",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Dubai Taxi Tour",
    subtitle: "Dubai Taxi Tour",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Thailand Taxi Tour",
    subtitle: "Thailand Taxi Tour",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Malaysia Tour",
    subtitle: "Malaysia Tour",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Singapore Taxi Tour",
    subtitle: "Singapore Taxi Tour",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Mauritius Taxi Tour",
    subtitle: "Mauritius Tour",
    image: "https://images.unsplash.com/photo-1473286574974-8032b5f77c0c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Nepal Taxi Tour",
    subtitle: "Nepal Taxi Tour",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "France Taxi Tour",
    subtitle: "France Taxi Tour",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Sri Lanka Taxi Tour",
    subtitle: "Sri Lanka Taxi Tour",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Hong Kong Tour",
    subtitle: "Hong Kong Tour",
    image: "https://images.unsplash.com/photo-1506970845246-18f21d533b23?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Australia Taxi Tour",
    subtitle: "Australia Taxi Tour",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80",
  },
];

export default function TaxiPackagePage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <PackagePageHero
          title="All India Holiday Taxi Packages"
          image="https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?auto=format&fit=crop&w=2000&q=80"
        />
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PACKAGES.map((p) => (
              <TaxiPackageCard key={p.title} pkg={p} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
