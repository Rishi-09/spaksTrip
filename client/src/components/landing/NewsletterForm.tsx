"use client";

export default function NewsletterForm() {
  return (
    <form
      className="mt-4 flex w-full max-w-md items-center gap-0 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-zinc-200"
      onSubmit={(e) => e.preventDefault()}
    >
      <span className="grid h-10 w-10 place-items-center text-[#E0382E]">
        <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
          <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 3V7a2 2 0 0 1 2-2Z" />
        </svg>
      </span>
      <input
        type="email"
        required
        aria-label="Email address"
        placeholder="Enter Email Address"
        className="flex-1 bg-transparent px-2 text-[15px] text-zinc-800 placeholder:text-zinc-400 outline-none"
      />
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center rounded-full bg-[#E0382E] px-6 text-sm font-semibold text-white hover:bg-[#c42f26]"
      >
        Subscribe
      </button>
    </form>
  );
}
