"use client";

export default function CabSearchForm() {
  return (
    <div className="bg-[#E8682A] px-6 py-6">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto flex max-w-7xl flex-col gap-4 rounded-xl bg-white px-6 py-5 shadow-md md:flex-row md:items-end md:gap-0"
      >
        <Field label="From" className="md:flex-1 md:border-r md:border-zinc-200">
          <input
            type="text"
            aria-label="Pickup location"
            placeholder="-- Select Pickup --"
            className="w-full bg-transparent text-base font-semibold text-zinc-700 placeholder:text-zinc-500 outline-none"
          />
        </Field>

        <Field label="To" className="md:flex-1 md:border-r md:border-zinc-200">
          <input
            type="text"
            aria-label="Drop location"
            placeholder="-- Select Drop --"
            className="w-full bg-transparent text-base font-semibold text-zinc-700 placeholder:text-zinc-500 outline-none"
          />
        </Field>

        <Field label="Departure" className="md:flex-1 md:border-r md:border-zinc-200">
          <input
            type="date"
            aria-label="Departure date"
            className="w-full bg-transparent text-base font-semibold text-zinc-700 outline-none"
          />
        </Field>

        <Field label="Pickup Time" className="md:flex-1">
          <input
            type="time"
            aria-label="Pickup time"
            className="w-full bg-transparent text-base font-semibold text-zinc-700 outline-none"
          />
        </Field>

        <div className="md:ml-4 md:shrink-0">
          <button
            type="submit"
            className="h-full w-full rounded-md bg-[#B5383A] px-10 py-4 text-base font-bold text-white hover:bg-[#9d2f31] transition-colors md:w-auto"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 px-4 py-1 ${className}`}>
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </div>
  );
}
