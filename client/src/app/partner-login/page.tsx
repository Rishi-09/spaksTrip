import PartnerLoginForm from "@/components/auth/PartnerLoginForm";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";

export default function PartnerLoginPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main className="bg-[#F4F6F9] flex items-center justify-center px-4 py-16">
        <PartnerLoginForm />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
