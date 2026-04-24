"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import { cn } from "@/lib/cn";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore } from "@/state/authStore";

type NavItem = {
  label: string;
  href: string;
  menu?: { label: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Flight", href: "/flight" },
  {
    label: "Holiday Packages",
    href: "#",
    menu: [
      { label: "National Tour Packages", href: "/national-tour-packages" },
      { label: "International Tour Packages", href: "/international-tour-packages" },
    ],
  },
  {
    label: "Accommodation",
    href: "#",
    menu: [
      { label: "Hotel", href: "/hotel" },
      { label: "Homestay", href: "#" },
      { label: "Airbnb", href: "#" },
      { label: "Villa", href: "#" },
      { label: "Guest House", href: "#" },
      { label: "House Board", href: "#" },
      { label: "Hostels", href: "#" },
      { label: "Resorts", href: "#" },
    ],
  },
  {
    label: "Transport",
    href: "#",
    menu: [
      { label: "Taxi Package", href: "/taxi-package" },
      { label: "Cabs", href: "/cabs" },
      { label: "Tour Bus", href: "#" },
      { label: "Train", href: "#" },
    ],
  },
  { label: "Cruise", href: "/cruise" },
  { label: "Bus", href: "#" },
  { label: "Events", href: "/events" },
  {
    label: "Visa Consultancy",
    href: "#",
    menu: [
      { label: "PR Visa", href: "/visa/pr-visa" },
      { label: "Work Visa", href: "/visa/work-visa" },
      { label: "Investor Visa", href: "/visa/investor-visa" },
      { label: "Study Visa", href: "/visa/study-visa" },
      { label: "Visit Visa", href: "/visa/visit-visa" },
      { label: "Tourist Visa", href: "#" },
    ],
  },
  { label: "Insurance", href: "/insurance" },
  { label: "Offers", href: "/offers" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"customer" | "agent">("customer");
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const toggleMobileSection = (label: string) => {
    setMobileExpanded((current) => (current === label ? null : label));
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-(--shadow-xs)">
      {/* Top utility bar */}
      <div className="bg-brand-900 text-white text-[13px]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          <a
            href="tel:+919220328072"
            className="flex items-center gap-2 text-white/85 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden>
              <path d="M6.6 10.8c1.5 2.9 3.7 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.5 21 3 13.5 3 4.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 1.7z" />
            </svg>
            +91 922 032 8072
          </a>
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/my-trips" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white/85 hover:text-white text-[12px] font-semibold transition-colors">
                  My Trips
                </Link>
                <span className="text-white/50">·</span>
                <span className="text-[12px] text-white/85">{user.name}</span>
                <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-white/85 hover:text-white text-[12px] font-semibold transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <LoginPill tone="accent" label="Customer Login" onClick={() => { setAuthTab("customer"); setAuthOpen(true); }} />
                <LoginPill tone="info" label="Partner Login" href="/partner-login" />
                <LoginPill tone="brand" label="Agent Login" onClick={() => { setAuthTab("agent"); setAuthOpen(true); }} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-border-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Logo />
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-7 text-[14px] font-semibold text-ink">
              {NAV_ITEMS.map((item) => (
                <li key={item.label} className="group/nav relative">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 py-2 transition-colors group-hover/nav:text-brand-700"
                  >
                    {item.label}
                    {item.menu ? (
                      <svg
                        viewBox="0 0 24 24"
                        width={14}
                        height={14}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                        className="transition-transform group-hover/nav:rotate-180"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    ) : null}
                  </Link>
                  {item.menu ? <DropdownMenu items={item.menu} /> : null}
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => {
              setMobileOpen((v) => {
                const next = !v;
                if (!next) setMobileExpanded(null);
                return next;
              });
            }}
            className="lg:hidden grid h-10 w-10 place-items-center rounded-md text-ink hover:bg-surface-muted"
          >
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />

      {mobileOpen && (
        <nav className="lg:hidden border-b border-border-soft bg-white max-h-[70vh] overflow-y-auto scrollbar-thin">
          <ul className="flex flex-col py-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                {item.menu ? (
                  <div className="flex items-center justify-between border-b border-border-soft/60 px-4 py-3 sm:px-6">
                    <span className="text-[14px] font-semibold text-ink">{item.label}</span>
                    <button
                      type="button"
                      aria-label={`Toggle ${item.label} menu`}
                      aria-expanded={mobileExpanded === item.label}
                      onClick={() => toggleMobileSection(item.label)}
                      className="grid h-8 w-8 place-items-center rounded-md text-ink hover:bg-surface-muted"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width={16}
                        height={16}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                        className={cn(
                          "transition-transform",
                          mobileExpanded === item.label && "rotate-180",
                        )}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block border-b border-border-soft/60 px-4 py-3 text-[14px] font-semibold text-ink hover:bg-surface-muted sm:px-6"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
                {item.menu && mobileExpanded === item.label ? (
                  <ul className="bg-surface-muted">
                    {item.menu.map((m) => (
                      <li key={m.label}>
                        <Link
                          href={m.href}
                          className="block px-8 py-2.5 text-[13px] text-ink-soft hover:text-brand-700 sm:px-10"
                          onClick={() => {
                            setMobileOpen(false);
                            setMobileExpanded(null);
                          }}
                        >
                          {m.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function DropdownMenu({ items }: { items: { label: string; href: string }[] }) {
  return (
    <div
      role="menu"
      className="invisible absolute left-1/2 top-full z-50 mt-1 min-w-56 -translate-x-1/2 translate-y-1 rounded-lg bg-white border border-border-soft opacity-0 shadow-(--shadow-pop) transition-all duration-150 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100"
    >
      <ul className="py-2">
        {items.map((m) => (
          <li key={m.label}>
            <Link
              href={m.href}
              role="menuitem"
              className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-medium text-ink hover:bg-brand-50 hover:text-brand-700"
            >
              <svg
                viewBox="0 0 24 24"
                width={12}
                height={12}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="text-brand-500"
              >
                <polyline points="9 6 15 12 9 18" />
              </svg>
              {m.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoginPill({
  tone,
  label,
  href,
  onClick,
}: {
  tone: "brand" | "accent" | "info";
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white text-[12px] font-semibold shadow-sm transition-opacity hover:opacity-90",
    tone === "brand" && "bg-brand-600",
    tone === "accent" && "bg-accent-500",
    tone === "info" && "bg-info-500",
  );
  const icon = (
    <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden fill="currentColor">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.3 0-8 1.7-8 5v2h16v-2c0-3.3-4.7-5-8-5Z" />
    </svg>
  );
  if (onClick) {
    return <button type="button" onClick={onClick} className={cls}>{icon}{label}</button>;
  }
  return <Link href={href ?? "#"} className={cls}>{icon}{label}</Link>;
}
