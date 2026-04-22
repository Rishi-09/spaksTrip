import Link from "next/link";
import Logo from "./Logo";

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
      { label: "Hotel", href: "#" },
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
  { label: "Visa Consultancy", href: "#" },
  { label: "Travel Insurance", href: "#" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="bg-[#102132] text-white text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <a
            href="tel:+919220328072"
            className="flex items-center gap-2 text-white/90 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              width={16}
              height={16}
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M6.6 10.8c1.5 2.9 3.7 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.5 21 3 13.5 3 4.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 1.7z" />
            </svg>
            Support No. +91 922 032 8072
          </a>
          <div className="flex items-center gap-3">
            <LoginPill color="#E0742E" label="Customer Login" href="#" />
            <LoginPill color="#3CC4D0" label="Patner Login" href="/partner-login" />
            <LoginPill color="#2C7BD9" label="Agent Login" href="#" />
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-8 text-[15px] font-semibold text-[#0E1E3A]">
              {NAV_ITEMS.map((item) => (
                <li key={item.label} className="group/nav relative">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 transition-colors group-hover/nav:text-[#E0382E]"
                  >
                    {item.label}
                    {item.menu ? <span aria-hidden="true">+</span> : null}
                  </Link>
                  {item.menu ? <DropdownMenu items={item.menu} /> : null}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

function DropdownMenu({ items }: { items: { label: string; href: string }[] }) {
  return (
    <div
      role="menu"
      className="invisible absolute left-1/2 top-full z-50 mt-3 min-w-60 -translate-x-1/2 translate-y-1 rounded-md bg-[#1F86C7] py-2 opacity-0 shadow-xl transition-all duration-150 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100"
    >
      <span
        aria-hidden="true"
        className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-[#1F86C7]"
      />
      <ul className="relative flex flex-col">
        {items.map((m) => (
          <li key={m.label}>
            <Link
              href={m.href}
              role="menuitem"
              className="flex items-center gap-2 px-5 py-2.5 text-[15px] font-medium text-white/95 hover:bg-white/10 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
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

function LoginPill({ color, label, href }: { color: string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white text-sm font-medium shadow-sm hover:opacity-90"
      style={{ backgroundColor: color }}
    >
      <svg
        viewBox="0 0 24 24"
        width={16}
        height={16}
        aria-hidden="true"
        fill="currentColor"
      >
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.3 0-8 1.7-8 5v2h16v-2c0-3.3-4.7-5-8-5Z" />
      </svg>
      {label}
    </Link>
  );
}
