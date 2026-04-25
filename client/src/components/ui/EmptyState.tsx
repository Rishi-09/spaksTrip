import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  cta?: ReactNode;
};

export default function EmptyState({ title, subtitle, cta }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <svg viewBox="0 0 80 80" width={72} height={72} fill="none" aria-hidden className="mb-5 opacity-30">
        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="3" className="text-ink-muted" />
        <path d="M26 40h28M40 26v28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-ink-muted" strokeDasharray="4 4" />
        <circle cx="40" cy="40" r="8" stroke="currentColor" strokeWidth="3" className="text-ink-muted" />
      </svg>
      <p className="text-[16px] font-bold text-ink">{title}</p>
      {subtitle && <p className="mt-1.5 text-[13px] text-ink-muted max-w-xs">{subtitle}</p>}
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}
