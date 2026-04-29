import Link from "next/link";
import { cn } from "@/lib/cn";

export type TrainServiceSection =
  | "search"
  | "tickets"
  | "change-request"
  | "file-tdr-online";

const ITEMS: Array<{
  value: TrainServiceSection;
  label: string;
  href: string;
}> = [
  { value: "search", label: "Search Trains", href: "/train/search" },
  { value: "tickets", label: "My Tickets", href: "/train/tickets" },
  {
    value: "change-request",
    label: "Change Request",
    href: "/train/change-request",
  },
  {
    value: "file-tdr-online",
    label: "File TDR Online",
    href: "/train/file-tdr-online",
  },
];

export default function TrainServiceNav({
  current,
  className,
}: {
  current: TrainServiceSection;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 rounded-2xl border border-white/15 bg-white/8 p-2 backdrop-blur-sm",
        className,
      )}
    >
      {ITEMS.map((item) => {
        const active = item.value === current;
        return (
          <Link
            key={item.value}
            href={item.href}
            className={cn(
              "rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors",
              active
                ? "bg-white text-brand-900 shadow-(--shadow-xs)"
                : "text-white/78 hover:bg-white/10 hover:text-white",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
