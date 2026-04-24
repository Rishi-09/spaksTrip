import type { Stop } from "@/lib/mock/trains";

type Props = { stops: Stop[] };

export default function TrainRouteStops({ stops }: Props) {
  return (
    <div className="relative">
      {/* Vertical connector */}
      <div className="absolute left-[19px] top-5 bottom-5 w-px bg-border" aria-hidden />

      <ol className="flex flex-col gap-0">
        {stops.map((stop, i) => {
          const isOrigin = i === 0;
          const isDest = i === stops.length - 1;

          return (
            <li key={`${stop.code}-${i}`} className="flex gap-4 py-3 relative">
              {/* Dot */}
              <div className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-full z-10 border-2 ${
                isOrigin || isDest
                  ? "bg-brand-600 border-brand-600"
                  : "bg-white border-border"
              }`}>
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={isOrigin || isDest ? "white" : "currentColor"} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={isOrigin || isDest ? "" : "text-ink-muted"}>
                  {isOrigin ? (
                    <circle cx="12" cy="12" r="4" fill="white" />
                  ) : isDest ? (
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  ) : (
                    <circle cx="12" cy="12" r="3" />
                  )}
                </svg>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-0.5 min-w-0 py-1">
                <div>
                  <p className={`text-[14px] font-bold text-ink ${isOrigin || isDest ? "" : "font-semibold"}`}>
                    {stop.station}
                    <span className="ml-1.5 text-[11px] font-mono font-normal text-ink-muted">{stop.code}</span>
                  </p>
                  {!isOrigin && !isDest && stop.halt > 0 && (
                    <p className="text-[11px] text-ink-muted">Halt {stop.halt} min</p>
                  )}
                  {stop.distance > 0 && (
                    <p className="text-[11px] text-ink-muted">{stop.distance} km from origin</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[13px] font-semibold text-ink shrink-0">
                  {stop.arrive && (
                    <div className="text-right">
                      <span className="block text-[10px] text-ink-muted font-normal">Arr</span>
                      {stop.arrive}
                      {stop.day > 1 && <sup className="text-[9px] text-accent-600 ml-0.5">+{stop.day - 1}</sup>}
                    </div>
                  )}
                  {stop.depart && (
                    <div className="text-right">
                      <span className="block text-[10px] text-ink-muted font-normal">Dep</span>
                      {stop.depart}
                    </div>
                  )}
                  {stop.platform > 0 && (
                    <span className="text-[11px] text-ink-muted bg-surface-muted rounded px-1.5 py-0.5">Pf {stop.platform}</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
