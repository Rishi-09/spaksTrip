"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import AddTaxiListingForm from "@/components/transport/AddTaxiListingForm";
import { canAccessTaxiListings } from "@/lib/authRoles";
import { useAuthStore } from "@/state/authStore";

export default function AddYourTaxiPage() {
  const pathname = usePathname();
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
      router.replace(`/auth?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!canAccessTaxiListings(user.role)) {
      router.replace("/taxi-package/destinations");
    }
  }, [pathname, router, status, user]);

  const showForm = status === "ready" && canAccessTaxiListings(user?.role);

  return (
    <div className="min-h-screen bg-surface-muted text-ink">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {showForm ? (
          <AddTaxiListingForm />
        ) : (
          <div className="rounded-[28px] border border-border-soft bg-white p-8 shadow-(--shadow-xs)">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 h-11 w-72 animate-pulse rounded bg-slate-100" />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
