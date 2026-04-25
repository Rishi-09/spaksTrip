type Step = "passengers" | "payment" | "confirmation";

const STEPS: Array<{ id: Step; label: string }> = [
  { id: "passengers", label: "Passengers" },
  { id: "payment",    label: "Payment" },
  { id: "confirmation", label: "Confirmation" },
];

export default function RailBookingStepper({ active }: { active: Step }) {
  const activeIdx = STEPS.findIndex((s) => s.id === active);
  return (
    <div className="bg-white border-b border-border-soft">
      <div className="mx-auto flex max-w-4xl items-center gap-0 px-4 py-3 sm:px-6">
        {STEPS.map((step, i) => {
          const done = i < activeIdx;
          const current = i === activeIdx;
          return (
            <div key={step.id} className="flex items-center gap-0 flex-1 last:flex-none">
              <div className="flex items-center gap-2 shrink-0">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${
                  done    ? "bg-success-500 text-white" :
                  current ? "bg-brand-600 text-white" :
                            "bg-surface-sunken text-ink-muted border border-border"
                }`}>
                  {done ? (
                    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-[13px] font-semibold ${current ? "text-brand-700" : done ? "text-success-700" : "text-ink-muted"}`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 mx-3 h-px ${done ? "bg-success-400" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
