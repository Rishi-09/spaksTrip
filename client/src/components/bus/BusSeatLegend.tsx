const ITEMS = [
  { label: "Available", className: "bg-white border-border text-ink" },
  { label: "Selected", className: "bg-brand-600 border-brand-600 text-white" },
  { label: "Booked", className: "bg-surface-sunken border-border text-ink-subtle opacity-70" },
];

export default function BusSeatLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-[12px] text-ink-muted">
          <span className={`inline-flex h-8 w-8 rounded-md border ${item.className}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
