"use client";

const STATES = [
  "--Select State--", "Andhra Pradesh", "Delhi", "Gujarat", "Karnataka",
  "Kerala", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "West Bengal",
];

export default function ConsultForm({ visaType }: { visaType: string }) {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Full Name</label>
        <input
          type="text"
          placeholder=""
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1F86C7] focus:ring-1 focus:ring-[#1F86C7]"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Email</label>
        <input
          type="email"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1F86C7] focus:ring-1 focus:ring-[#1F86C7]"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Phone No</label>
        <input
          type="tel"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1F86C7] focus:ring-1 focus:ring-[#1F86C7]"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Select State</label>
        <select className="w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-700 outline-none focus:border-[#1F86C7]">
          {STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Immigrate to</label>
          <input
            type="text"
            defaultValue="Immigrate to"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1F86C7]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Visa Type</label>
          <input
            type="text"
            defaultValue={visaType}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1F86C7]"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full rounded bg-[#1a5fa8] py-2.5 text-sm font-semibold text-white hover:bg-[#154e8a] transition-colors"
      >
        Send Message
      </button>
    </form>
  );
}
