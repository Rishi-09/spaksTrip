"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import { cn } from "@/lib/cn";
import RoleGate from "@/components/auth/RoleGate";
import { useAuthStore } from "@/state/authStore";
import { useLocaleStore, useCountryLocale } from "@/state/localeStore";

type NavItem = {
  label: string;
  href: string;
  menu?: { label: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Flight", href: "/flight" },
  { label: "Hotel", href: "/hotel" },
  {
    label: "Train",
    href: "#",
    menu: [
      { label: "Search", href: "/search" },
      { label: "Tickets", href: "/tickets" },
      { label: "Change Request", href: "/change-request" },
      { label: "File TDR Online", href: "/file-tdr-online" },
    ],
  },
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
      { label: "Tour Bus", href: "/tour-bus" },
      { label: "Train", href: "/train" },
    ],
  },
  { label: "Cruise", href: "/cruise" },
  { label: "Bus", href: "/bus" },
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

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium",
  "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria", "Cambodia", "Cameroon",
  "Canada", "Chile", "China", "Colombia", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Ecuador", "Egypt", "Estonia", "Ethiopia", "Finland", "France", "Georgia",
  "Germany", "Ghana", "Greece", "Guatemala", "Hungary", "India", "Indonesia", "Iran",
  "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kuwait", "Latvia", "Lebanon", "Lithuania", "Luxembourg", "Malaysia", "Maldives",
  "Malta", "Mexico", "Moldova", "Mongolia", "Morocco", "Myanmar", "Nepal", "Netherlands",
  "New Zealand", "Nigeria", "North Korea", "Norway", "Oman", "Pakistan", "Palestine",
  "Panama", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Saudi Arabia", "Senegal", "Serbia", "Singapore", "Slovakia", "Slovenia", "Somalia",
  "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tanzania", "Thailand", "Tunisia", "Turkey", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const LANGUAGES = [
  "English", "Hindi", "Spanish", "French", "Chinese",
  "Arabic", "Bengali", "Portuguese", "Russian", "Urdu",
];

type OpenDropdown = "country" | "language" | "user" | null;

export default function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const utilityBarRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const country = useLocaleStore((state) => state.country);
  const setCountry = useLocaleStore((state) => state.setCountry);
  const language = useLocaleStore((state) => state.language);
  const setLanguage = useLocaleStore((state) => state.setLanguage);
  const { currency } = useCountryLocale();

  const toggleMobileSection = (label: string) => {
    setMobileExpanded((current) => (current === label ? null : label));
  };

  const toggleDropdown = useCallback(
    (name: OpenDropdown) => setOpenDropdown((prev) => (prev === name ? null : name)),
    [],
  );

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (utilityBarRef.current && !utilityBarRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    if (openDropdown) {
      document.addEventListener("mousedown", handleOutside);
    }

    return () => document.removeEventListener("mousedown", handleOutside);
  }, [openDropdown]);

  const profileHref = user?.role === "partner" ? "/partner/dashboard" : "/my-trips";

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-(--shadow-xs)">
      <RoleGate />

      <div className="bg-brand-900 text-white text-[13px]">
        <div
          ref={utilityBarRef}
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6"
        >
          <a
            href="tel:+919220328072"
            className="flex items-center gap-2 text-white/85 transition-colors hover:text-white"
          >
            <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden>
              <path d="M6.6 10.8c1.5 2.9 3.7 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.5 21 3 13.5 3 4.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 1.7z" />
            </svg>
            +91 922 032 8072
          </a>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex items-center gap-3 border-r border-white/20 pr-3">
              <SelectDropdown
                label="Country"
                options={COUNTRIES}
                value={country}
                onChange={setCountry}
                isOpen={openDropdown === "country"}
                onToggle={() => toggleDropdown("country")}
              />
              <span className="text-white/30 select-none">|</span>
              <span className="whitespace-nowrap text-[13px] text-white/85" aria-label={`Currency: ${currency}`}>
                {currency}
              </span>
              <span className="text-white/30 select-none">|</span>
              <SelectDropdown
                label="Language"
                options={LANGUAGES}
                value={language}
                onChange={setLanguage}
                isOpen={openDropdown === "language"}
                onToggle={() => toggleDropdown("language")}
              />
            </div>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown("user")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-semibold text-white/90 transition-colors hover:bg-white/8 hover:text-white"
                >
                  <span>{user.displayName}</span>
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
                    className={cn("transition-transform", openDropdown === "user" && "rotate-180")}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {openDropdown === "user" ? (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[13rem] rounded-xl border border-border-soft bg-white p-2 text-ink shadow-(--shadow-pop)">
                    <div className="border-b border-border-soft px-3 py-2">
                      <p className="text-[13px] font-semibold text-ink">{user.displayName}</p>
                      <p className="text-[12px] text-ink-muted">{user.email}</p>
                    </div>
                    <div className="pt-2">
                      <Link
                        href={profileHref}
                        className="block rounded-lg px-3 py-2 text-[13px] font-medium text-ink hover:bg-surface-muted"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          setOpenDropdown(null);
                          await logout();
                          router.replace("/");
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium text-ink hover:bg-surface-muted"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <LoginPill label="Login / Register" href="/auth" />
            )}
          </div>
        </div>
      </div>

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
              setMobileOpen((value) => {
                const next = !value;
                if (!next) setMobileExpanded(null);
                return next;
              });
            }}
            className="grid h-10 w-10 place-items-center rounded-md text-ink hover:bg-surface-muted lg:hidden"
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

      {mobileOpen ? (
        <nav className="max-h-[70vh] overflow-y-auto border-b border-border-soft bg-white scrollbar-thin lg:hidden">
          <div className="grid grid-cols-3 gap-2 border-b border-border-soft/60 px-4 py-3 sm:px-6">
            <MobileSelect label="Country" options={COUNTRIES} value={country} onChange={setCountry} />
            <label className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[10px] font-medium uppercase tracking-wide text-ink-soft">Currency</span>
              <span className="w-full truncate rounded border border-border-soft bg-surface-muted px-2 py-1 text-[12px] text-ink">
                {currency}
              </span>
            </label>
            <MobileSelect label="Language" options={LANGUAGES} value={language} onChange={setLanguage} />
          </div>

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
                        className={cn("transition-transform", mobileExpanded === item.label && "rotate-180")}
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
                    {item.menu.map((menuItem) => (
                      <li key={menuItem.label}>
                        <Link
                          href={menuItem.href}
                          className="block px-8 py-2.5 text-[13px] text-ink-soft hover:text-brand-700 sm:px-10"
                          onClick={() => {
                            setMobileOpen(false);
                            setMobileExpanded(null);
                          }}
                        >
                          {menuItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="border-t border-border-soft/60 px-4 py-4 sm:px-6">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href={profileHref}
                  className="rounded-lg border border-border-soft px-4 py-3 text-[14px] font-semibold text-ink"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setMobileOpen(false);
                    await logout();
                    router.replace("/");
                  }}
                  className="rounded-lg bg-brand-600 px-4 py-3 text-left text-[14px] font-semibold text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="block rounded-lg bg-brand-600 px-4 py-3 text-center text-[14px] font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function SelectDropdown({
  label,
  options,
  value,
  onChange,
  isOpen,
  onToggle,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={`${label}: ${value}`}
        className="flex items-center gap-1 whitespace-nowrap text-white/85 transition-colors hover:text-white"
      >
        <span>{value}</span>
        <svg
          viewBox="0 0 24 24"
          width={11}
          height={11}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={cn("transition-transform duration-150", isOpen && "rotate-180")}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-60 min-w-[10rem] overflow-y-auto rounded-lg border border-border-soft bg-white py-1 shadow-(--shadow-pop)"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              onClick={() => {
                onChange(option);
                onToggle();
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-[13px] text-ink transition-colors hover:bg-brand-50 hover:text-brand-700",
                value === option && "bg-brand-50 font-semibold text-brand-700",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full truncate rounded border border-border-soft bg-white px-2 py-1 text-[12px] text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function DropdownMenu({ items }: { items: { label: string; href: string }[] }) {
  return (
    <div
      role="menu"
      className="invisible absolute left-1/2 top-full z-50 mt-1 min-w-56 -translate-x-1/2 translate-y-1 rounded-lg border border-border-soft bg-white opacity-0 shadow-(--shadow-pop) transition-all duration-150 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100"
    >
      <ul className="py-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
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
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoginPill({ label, href }: { label: string; href: string }) {
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90",
  );

  return (
    <Link href={href} className={cls}>
      <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden fill="currentColor">
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.3 0-8 1.7-8 5v2h16v-2c0-3.3-4.7-5-8-5Z" />
      </svg>
      {label}
    </Link>
  );
}
