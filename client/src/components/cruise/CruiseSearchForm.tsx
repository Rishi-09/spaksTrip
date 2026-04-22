"use client";

const NIGHTS = ["Night ?", "1 Night", "2 Nights", "3 Nights", "4 Nights", "5 Nights", "7 Nights", "10 Nights", "14 Nights"];

export default function CruiseSearchForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="w-full rounded-2xl bg-white shadow-xl overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto]">
        <Cell label="Select Destination">
          <input
            type="text"
            aria-label="Destination"
            placeholder="Where to ?"
            className="w-full bg-transparent text-lg font-bold text-zinc-800 placeholder:text-zinc-700 placeholder:font-bold outline-none pt-1"
          />
        </Cell>

        <Cell label="Date">
          <input
            type="date"
            aria-label="Travel date"
            className="w-full bg-transparent text-base font-medium text-zinc-700 outline-none pt-1"
          />
        </Cell>

        <Cell label="Select Night">
          <select
            aria-label="Number of nights"
            defaultValue="Night ?"
            className="w-full bg-transparent text-lg font-bold text-zinc-800 outline-none pt-1 appearance-none cursor-pointer"
          >
            {NIGHTS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Cell>

        <button
          type="submit"
          className="bg-white text-zinc-800 font-semibold text-base px-10 py-6 hover:bg-zinc-50 transition-colors border-l border-zinc-200"
        >
          Search
        </button>
      </div>
    </form>
  );
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-zinc-200 px-6 py-5">
      <span className="text-xs font-medium text-zinc-500 mb-0.5">{label}</span>
      {children}
    </div>
  );
}
