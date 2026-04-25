import TrainSearchForm from "./TrainSearchForm";

export default function TrainHero() {
  return (
    <section className="relative h-105 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1600&q=80"
        alt="Indian Railways"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-b from-brand-900/70 via-brand-900/50 to-brand-900/80" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white/90 backdrop-blur-sm">
          <svg viewBox="0 0 24 24" width={13} height={13} fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
            <path d="M12 6a1 1 0 0 0-1 1v5a1 1 0 0 0 .29.71l3 3a1 1 0 1 0 1.41-1.41L13 11.59V7a1 1 0 0 0-1-1z" />
          </svg>
          PNR · Tatkal · Quota Booking
        </span>
        <h1 className="text-[36px] font-extrabold text-white leading-tight max-w-xl">
          Book Train Tickets Online
        </h1>
        <p className="mt-2 text-[15px] text-white/75 max-w-sm">
          Search across all train types — Rajdhani, Shatabdi, Express and more.
        </p>
      </div>

      {/* Overlapping form */}
      <div className="absolute bottom-0 left-1/2 w-full max-w-5xl -translate-x-1/2 translate-y-28 px-4">
        <TrainSearchForm />
      </div>
    </section>
  );
}
