"use client";

import { useState } from "react";

type TripType = "oneway" | "round" | "multi";

const CABIN_CLASSES = ["All", "Economy", "Premium Economy", "Business", "First"];

export default function FlightSearchForm() {
  const [trip, setTrip] = useState<TripType>("oneway");
  const [adult, setAdult] = useState(0);
  const [children, setChildren] = useState(0);
  const [infant, setInfant] = useState(0);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="mx-auto w-full max-w-[1200px] rounded-2xl bg-white p-6 shadow-[0_10px_40px_-10px_rgba(10,30,60,0.25)] md:p-8"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div
          role="radiogroup"
          aria-label="Trip type"
          className="flex flex-wrap items-center gap-6"
        >
          <TripRadio
            label="Oneway"
            checked={trip === "oneway"}
            onChange={() => setTrip("oneway")}
          />
          <TripRadio
            label="Round Trip"
            checked={trip === "round"}
            onChange={() => setTrip("round")}
          />
          <TripRadio
            label="Multi Trip"
            checked={trip === "multi"}
            onChange={() => setTrip("multi")}
          />
        </div>
        <p className="text-sm font-semibold text-[#0E1E3A]">
          Millions of cheap flights. One simple search
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-0 rounded-xl ring-1 ring-zinc-200 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto]">
        <TextField label="From" placeholder="Search..." ariaLabel="Origin" />
        <TextField label="To" placeholder="Search..." ariaLabel="Destination" />
        <DateField label="Departure" ariaLabel="Departure date" />
        <Counter
          label="Adult"
          value={adult}
          onChange={setAdult}
          min={0}
        />
        <Counter
          label="Children"
          subLabel="(2y - 12y)"
          value={children}
          onChange={setChildren}
          min={0}
        />
        <Counter
          label="Infant (below 2y)"
          value={infant}
          onChange={setInfant}
          min={0}
        />
        <SelectField label="Cabin class" options={CABIN_CLASSES} />
        <div className="col-span-1 lg:col-auto">
          <button
            type="submit"
            className="flex h-full w-full items-center justify-center rounded-r-xl bg-[#1668E3] px-8 py-5 text-center text-base font-semibold text-white hover:bg-[#0f58c7] lg:min-w-[140px]"
          >
            Search
            <br />
            Flight
          </button>
        </div>
      </div>
    </form>
  );
}

function TripRadio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[15px] font-medium text-[#0E1E3A]">
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border-2 transition-colors ${
          checked ? "border-[#E0382E]" : "border-zinc-300"
        }`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full transition-transform ${
            checked ? "scale-100 bg-[#E0382E]" : "scale-0 bg-transparent"
          }`}
        />
      </span>
      <input
        type="radio"
        name="trip"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}

function CellShell({
  label,
  subLabel,
  children,
}: {
  label: string;
  subLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-zinc-200 px-5 py-3 last:border-b-0 lg:border-b-0 lg:border-r">
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        {subLabel ? (
          <span className="text-xs font-semibold text-[#E0382E]">{subLabel}</span>
        ) : null}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function TextField({
  label,
  placeholder,
  ariaLabel,
}: {
  label: string;
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <CellShell label={label}>
      <input
        type="text"
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full bg-transparent text-base font-medium text-zinc-800 placeholder:text-zinc-400 outline-none"
      />
    </CellShell>
  );
}

function DateField({
  label,
  ariaLabel,
}: {
  label: string;
  ariaLabel: string;
}) {
  return (
    <CellShell label={label}>
      <input
        type="date"
        aria-label={ariaLabel}
        className="w-full bg-transparent text-base font-medium text-zinc-800 outline-none"
      />
    </CellShell>
  );
}

function Counter({
  label,
  subLabel,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  subLabel?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <CellShell label={label} subLabel={subLabel}>
      <div className="flex items-center gap-3">
        <CounterButton
          ariaLabel={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          symbol="minus"
          disabled={value <= min}
        />
        <span className="min-w-[1ch] text-base font-semibold text-zinc-800">
          {value}
        </span>
        <CounterButton
          ariaLabel={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
          symbol="plus"
        />
      </div>
    </CellShell>
  );
}

function CounterButton({
  ariaLabel,
  onClick,
  symbol,
  disabled,
}: {
  ariaLabel: string;
  onClick: () => void;
  symbol: "plus" | "minus";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className="grid h-7 w-7 place-items-center rounded-full bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-100"
    >
      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
        <line x1={5} y1={12} x2={19} y2={12} />
        {symbol === "plus" ? <line x1={12} y1={5} x2={12} y2={19} /> : null}
      </svg>
    </button>
  );
}

function SelectField({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <CellShell label={label}>
      <select
        aria-label={label}
        defaultValue={options[0]}
        className="w-full appearance-none bg-transparent pr-6 text-base font-medium text-zinc-800 outline-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='1 1 6 6 11 1'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0 center",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </CellShell>
  );
}
