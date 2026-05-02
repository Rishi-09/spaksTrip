"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { isBusinessUser } from "@/lib/authRoles";
import { useAuthStore } from "@/state/authStore";

export default function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const initialMode =
    searchParams.get("mode") === "register" ? "register" : "signin";
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    if (status === "idle") {
      void hydrate();
    }
  }, [hydrate, status]);

  useEffect(() => {
    if (status !== "ready" || !user) return;
    router.replace(isBusinessUser(user.role) ? "/partner/dashboard" : "/");
  }, [router, status, user]);

  const subtitle = useMemo(() => {
    if (initialMode === "register") {
      return "Create one account, pick the right role, and we will route you to the correct experience.";
    }

    return "Sign in once and we will send you to your trips or your business workspace.";
  }, [initialMode]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(22,104,227,0.12),_transparent_42%),linear-gradient(180deg,_#f7fafc_0%,_#eef4fb_100%)] px-4 py-14">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(14,30,58,0.14)] backdrop-blur sm:grid-cols-[1.08fr_0.92fr]">
          <section className="hidden flex-col justify-between bg-[#0E1E3A] px-8 py-10 text-white sm:flex">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#F6A441]">
                Unified Access
              </p>
              <h1 className="max-w-sm text-4xl font-black leading-tight">
                One auth gateway for customers, partners, and agents.
              </h1>
              <p className="max-w-md text-sm leading-6 text-white/75">
                Choose your role, finish the flow, and we will drop you into
                the right part of the app.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-white/80">
              <div className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3">
                Cookie-based sessions continue to use the existing Express
                backend as-is.
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3">
                Customers land on the travel app. Partners and agents land on
                the dashboard.
              </div>
            </div>
          </section>

          <section className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="mb-6 space-y-2">
              <h2 className="text-3xl font-extrabold text-[#0E1E3A]">
                Login / Register
              </h2>
              <p className="text-sm text-ink-muted">{subtitle}</p>
            </div>

            <AuthForm
              initialMode={initialMode}
              redirectTo={redirect}
              onSuccess={(authenticatedUser) => {
                if (redirect) {
                  router.replace(redirect);
                  return;
                }

                router.replace(
                  isBusinessUser(authenticatedUser.role)
                    ? "/partner/dashboard"
                    : "/",
                );
              }}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
