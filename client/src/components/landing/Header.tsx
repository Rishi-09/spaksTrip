"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslate } from "@tolgee/react";
import Logo from "./Logo";
import { cn } from "@/lib/cn";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore } from "@/state/authStore";
import { useLocaleStore, useCountryLocale } from "@/state/localeStore";
import { getCountryFlagUrl } from "@/lib/countryFlags";

type NavItem = {
  labelKey: string;
  href: string;
  menu?: { labelKey: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.flight", href: "/flight" },
  { labelKey: "nav.hotel", href: "/hotel" },
  {
    labelKey: "nav.train",
    href: "#",
    menu: [
      { labelKey: "nav.search", href: "/search" },
      { labelKey: "nav.tickets", href: "/tickets" },
      { labelKey: "nav.change_request", href: "/change-request" },
      { labelKey: "nav.file_tdr_online", href: "/file-tdr-online" },
    ],
  },
  {
    labelKey: "nav.holiday_packages",
    href: "#",
    menu: [
      { labelKey: "nav.national_tour_packages", href: "/national-tour-packages" },
      { labelKey: "nav.international_tour_packages", href: "/international-tour-packages" },
    ],
  },
  {
    labelKey: "nav.accommodation",
    href: "#",
    menu: [
      { labelKey: "nav.homestay", href: "#" },
      { labelKey: "nav.airbnb", href: "#" },
      { labelKey: "nav.villa", href: "#" },
      { labelKey: "nav.guest_house", href: "#" },
      { labelKey: "nav.house_board", href: "#" },
      { labelKey: "nav.hostels", href: "#" },
      { labelKey: "nav.resorts", href: "#" },
    ],
  },
  {
    labelKey: "nav.transport",
    href: "#",
    menu: [
      { labelKey: "nav.taxi_package", href: "/taxi-package" },
      { labelKey: "nav.cabs", href: "/cabs" },
      { labelKey: "nav.tour_bus", href: "/tour-bus" },
      { labelKey: "nav.train", href: "/train" },
    ],
  },
  {
    labelKey: "nav.cruise",
    href: "#",
    menu: [
      { labelKey: "nav.cruise_for_andaman", href: "#" },
      { labelKey: "nav.general_cruise", href: "/cruise" },
    ],
  },
  { labelKey: "nav.bus", href: "/bus" },
  { labelKey: "nav.events", href: "/events" },
  {
    labelKey: "nav.visa_consultancy",
    href: "#",
    menu: [
      { labelKey: "nav.pr_visa", href: "/visa/pr-visa" },
      { labelKey: "nav.work_visa", href: "/visa/work-visa" },
      { labelKey: "nav.investor_visa", href: "/visa/investor-visa" },
      { labelKey: "nav.study_visa", href: "/visa/study-visa" },
      { labelKey: "nav.visit_visa", href: "/visa/visit-visa" },
      { labelKey: "nav.tourist_visa", href: "#" },
    ],
  },
  { labelKey: "nav.insurance", href: "/insurance" },
  { labelKey: "nav.offers", href: "/offers" },
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

const LANGUAGE_OPTIONS: { name: string; key: string }[] = [
  { name: "English", key: "language.english" },
  { name: "Hindi", key: "language.hindi" },
  { name: "Spanish", key: "language.spanish" },
  { name: "French", key: "language.french" },
  { name: "Chinese", key: "language.chinese" },
  { name: "Arabic", key: "language.arabic" },
  { name: "Bengali", key: "language.bengali" },
  { name: "Portuguese", key: "language.portuguese" },
  { name: "Russian", key: "language.russian" },
  { name: "Urdu", key: "language.urdu" },
];

const CURRENCY_OPTIONS = [
  { value: "INR", symbol: "₹" },
  { value: "USD", symbol: "$" },
] as const;

type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]["value"];

type OpenDropdown = "country" | "currency" | "language" | null;

export default function Header() {
  const { t } = useTranslate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"customer" | "agent">("customer");
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const utilityBarRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const country = useLocaleStore((s) => s.country);
  const setCountry = useLocaleStore((s) => s.setCountry);
  const language = useLocaleStore((s) => s.language);
  const setLanguage = useLocaleStore((s) => s.setLanguage);
  const { currency } = useCountryLocale();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(
    currency === "USD" ? "USD" : "INR",
  );

  const languageOptionLabels = useMemo(
    () => LANGUAGE_OPTIONS.map((opt) => ({ value: opt.name, label: t(opt.key) })),
    [t],
  );

  const toggleMobileSection = (label: string) => {
    setMobileExpanded((current) => (current === label ? null : label));
  };

  const toggleDropdown = useCallback(
    (name: OpenDropdown) => setOpenDropdown((prev) => (prev === name ? null : name)),
    [],
  );

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (utilityBarRef.current && !utilityBarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [openDropdown]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-(--shadow-xs)">
      {/* Top utility bar */}
      <div className="bg-brand-900 text-white text-[13px]">
        <div
          ref={utilityBarRef}
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6"
        >
          <a
            href="tel:+919220328072"
            className="flex items-center gap-2 text-white/85 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden>
              <path d="M6.6 10.8c1.5 2.9 3.7 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.5 21 3 13.5 3 4.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 1.7z" />
            </svg>
            +91 922 032 8072
          </a>

          <div className="hidden sm:flex items-center gap-3">
            {/* Country / Currency / Language selectors */}
            <div className="flex items-center gap-3 border-r border-white/20 pr-3">
              <SelectDropdown
                label={t("header.country")}
                options={COUNTRIES.map((c) => ({ value: c, label: c }))}
                value={country}
                onChange={setCountry}
                isOpen={openDropdown === "country"}
                onToggle={() => toggleDropdown("country")}
                showFlags
              />
              <span className="text-white/30 select-none">|</span>
              <CurrencyDropdown
                value={selectedCurrency}
                onChange={setSelectedCurrency}
                isOpen={openDropdown === "currency"}
                onToggle={() => toggleDropdown("currency")}
                ariaLabel={t("header.currency")}
              />
              <span className="text-white/30 select-none">|</span>
              <SelectDropdown
                label={t("header.language")}
                options={languageOptionLabels}
                value={language}
                onChange={setLanguage}
                isOpen={openDropdown === "language"}
                onToggle={() => toggleDropdown("language")}
                showLanguageIcon
              />
            </div>

            {/* Login / user actions */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/my-trips" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white/85 hover:text-white text-[12px] font-semibold transition-colors">
                  {t("header.my_trips")}
                </Link>
                <span className="text-white/50">·</span>
                <span className="text-[12px] text-white/85">{user.name}</span>
                <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-white/85 hover:text-white text-[12px] font-semibold transition-colors">
                  {t("header.sign_out")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LoginPill tone="accent" label={t("header.customer_login")} onClick={() => { setAuthTab("customer"); setAuthOpen(true); }} />
                <LoginPill tone="info" label={t("header.partner_login")} href="/partner-login" />
                <LoginPill tone="brand" label={t("header.agent_login")} onClick={() => { setAuthTab("agent"); setAuthOpen(true); }} />
              </div>
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
                <li key={item.labelKey} className="group/nav relative">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 py-2 transition-colors group-hover/nav:text-brand-700"
                  >
                    {t(item.labelKey)}
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
                  {item.menu ? <DropdownMenu items={item.menu} t={t} /> : null}
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            aria-label={t("header.toggle_menu")}
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
          {/* Mobile selectors row */}
          <div className="grid grid-cols-3 gap-2 border-b border-border-soft/60 px-4 py-3 sm:px-6">
            <MobileSelect label={t("header.country")} options={COUNTRIES.map((c) => ({ value: c, label: c }))} value={country} onChange={setCountry} showFlag />
            <MobileCurrencySelect value={selectedCurrency} onChange={setSelectedCurrency} label={t("header.currency")} />
            <MobileSelect label={t("header.language")} options={languageOptionLabels} value={language} onChange={setLanguage} showLanguageIcon />
          </div>
          <ul className="flex flex-col py-2">
            {NAV_ITEMS.map((item) => {
              const itemLabel = t(item.labelKey);
              return (
                <li key={item.labelKey}>
                  {item.menu ? (
                    <div className="flex items-center justify-between border-b border-border-soft/60 px-4 py-3 sm:px-6">
                      <span className="text-[14px] font-semibold text-ink">{itemLabel}</span>
                      <button
                        type="button"
                        aria-label={t("header.toggle_section_menu", { label: itemLabel })}
                        aria-expanded={mobileExpanded === item.labelKey}
                        onClick={() => toggleMobileSection(item.labelKey)}
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
                            mobileExpanded === item.labelKey && "rotate-180",
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
                      {itemLabel}
                    </Link>
                  )}
                  {item.menu && mobileExpanded === item.labelKey ? (
                    <ul className="bg-surface-muted">
                      {item.menu.map((m) => (
                        <li key={m.labelKey}>
                          <Link
                            href={m.href}
                            className="block px-8 py-2.5 text-[13px] text-ink-soft hover:text-brand-700 sm:px-10"
                            onClick={() => {
                              setMobileOpen(false);
                              setMobileExpanded(null);
                            }}
                          >
                            {t(m.labelKey)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}

type Option = { value: string; label: string };

function SelectDropdown({
  label,
  options,
  value,
  onChange,
  isOpen,
  onToggle,
  showFlags = false,
  showLanguageIcon = false,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  showFlags?: boolean;
  showLanguageIcon?: boolean;
}) {
  const selectedFlagUrl = showFlags ? getCountryFlagUrl(value) : null;
  const selectedLabel = options.find((opt) => opt.value === value)?.label ?? value;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={`${label}: ${selectedLabel}`}
        className="flex items-center gap-1 text-white/85 hover:text-white transition-colors whitespace-nowrap"
      >
        {selectedFlagUrl ? (
          <img
            src={selectedFlagUrl}
            alt={`${value} flag`}
            width={18}
            height={14}
            className="h-3.5 w-[18px] rounded-[2px] object-cover"
          />
        ) : null}
        {showLanguageIcon ? <LanguageIcon className="h-3.5 w-3.5 shrink-0" /> : null}
        <span>{selectedLabel}</span>
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

      {isOpen && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-[10rem] max-h-60 overflow-y-auto rounded-lg bg-white border border-border-soft shadow-(--shadow-pop) py-1"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              onClick={() => { onChange(opt.value); onToggle(); }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink hover:bg-brand-50 hover:text-brand-700 transition-colors",
                value === opt.value && "bg-brand-50 text-brand-700 font-semibold",
              )}
            >
              {showFlags && getCountryFlagUrl(opt.value) ? (
                <img
                  src={getCountryFlagUrl(opt.value) ?? undefined}
                  alt={`${opt.value} flag`}
                  width={18}
                  height={14}
                  className="h-3.5 w-[18px] shrink-0 rounded-[2px] object-cover"
                />
              ) : null}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileSelect({
  label,
  options,
  value,
  onChange,
  showFlag = false,
  showLanguageIcon = false,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  showFlag?: boolean;
  showLanguageIcon?: boolean;
}) {
  const flagUrl = showFlag ? getCountryFlagUrl(value) : null;
  const hasLeadingIcon = Boolean(flagUrl || showLanguageIcon);

  return (
    <label className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      <span className="relative">
        {flagUrl ? (
          <img
            src={flagUrl}
            alt={`${value} flag`}
            width={18}
            height={14}
            className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-[18px] -translate-y-1/2 rounded-[2px] object-cover"
          />
        ) : null}
        {showLanguageIcon ? (
          <LanguageIcon className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
        ) : null}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full truncate rounded border border-border-soft bg-white px-2 py-1 text-[12px] text-ink focus:outline-none focus:ring-1 focus:ring-brand-500",
            hasLeadingIcon && "pl-8",
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </span>
    </label>
  );
}

function LanguageIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

function CurrencyDropdown({
  value,
  onChange,
  isOpen,
  onToggle,
  ariaLabel,
}: {
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
  isOpen: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  const selected = CURRENCY_OPTIONS.find((option) => option.value === value) ?? CURRENCY_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={`${ariaLabel}: ${selected.value}`}
        className="flex items-center gap-1 text-white/85 hover:text-white transition-colors whitespace-nowrap"
      >
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/40 text-[11px] font-semibold leading-none">
          {selected.symbol}
        </span>
        <span>{selected.value}</span>
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

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-[8rem] overflow-hidden rounded-lg bg-white border border-border-soft shadow-(--shadow-pop) py-1"
        >
          {CURRENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => { onChange(option.value); onToggle(); }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink hover:bg-brand-50 hover:text-brand-700 transition-colors",
                value === option.value && "bg-brand-50 text-brand-700 font-semibold",
              )}
            >
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[12px] font-semibold">
                {option.symbol}
              </span>
              <span>{option.value}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileCurrencySelect({
  value,
  onChange,
  label,
}: {
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
  label: string;
}) {
  const selected = CURRENCY_OPTIONS.find((option) => option.value === value) ?? CURRENCY_OPTIONS[0];

  return (
    <label className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      <span className="relative">
        <span className="pointer-events-none absolute left-2 top-1/2 inline-flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-surface-muted text-[11px] font-semibold leading-none text-ink-soft">
          {selected.symbol}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as CurrencyCode)}
          className="w-full truncate rounded border border-border-soft bg-white py-1 pl-8 pr-2 text-[12px] text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-label={label}
        >
          {CURRENCY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.symbol} {option.value}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

function DropdownMenu({
  items,
  t,
}: {
  items: { labelKey: string; href: string }[];
  t: (key: string) => string;
}) {
  return (
    <div
      role="menu"
      className="invisible absolute left-1/2 top-full z-50 mt-1 min-w-56 -translate-x-1/2 translate-y-1 rounded-lg bg-white border border-border-soft opacity-0 shadow-(--shadow-pop) transition-all duration-150 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100"
    >
      <ul className="py-2">
        {items.map((m) => (
          <li key={m.labelKey}>
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
              {t(m.labelKey)}
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
