"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import TaxiPackageLanding from "@/components/transport/TaxiPackageLanding";
import { isBusinessUser } from "@/lib/authRoles";
import { useAuthStore } from "@/state/authStore";

export default function TaxiPackagePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    if (status === "idle") {
      void hydrate();
    }
  }, [hydrate, status]);

  useEffect(() => {
    if (status !== "ready") return;

    if (user?.role === "customer" || isBusinessUser(user?.role)) {
      router.replace("/taxi-package/destinations");
    }
  }, [router, status, user]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <TaxiPackageLanding />
      <Footer />
      <BackToTop />
    </div>
  );
}
