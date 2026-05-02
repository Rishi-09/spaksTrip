"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import AddYourTaxiForm from "@/components/transport/AddYourTaxiForm";
import {
  TAXI_PACKAGE_DESTINATIONS_ROUTE,
  TAXI_PACKAGE_ROOT,
  isTaxiManagerRole,
} from "@/lib/taxiRoles";
import { useAuthStore } from "@/state/authStore";

export default function AddYourTaxiPage() {
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

    if (!user) {
      router.replace(TAXI_PACKAGE_ROOT);
      return;
    }

    if (!isTaxiManagerRole(user.role)) {
      router.replace(TAXI_PACKAGE_DESTINATIONS_ROUTE);
    }
  }, [router, status, user]);

  const canRenderForm = Boolean(user && isTaxiManagerRole(user.role));

  return (
    <div className="min-h-screen bg-surface-muted text-ink">
      <Header />
      {canRenderForm ? (
        <AddYourTaxiForm />
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="rounded-[28px] border border-border-soft bg-white p-8 text-center shadow-(--shadow-xs)">
            <p className="text-[14px] text-ink-muted">Checking access to taxi submission...</p>
          </div>
        </main>
      )}
      <Footer />
      <BackToTop />
    </div>
  );
}
