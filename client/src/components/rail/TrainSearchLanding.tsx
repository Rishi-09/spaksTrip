import TrainHero from "./TrainHero";
import TrainServiceNav from "./TrainServiceNav";

export default function TrainSearchLanding() {
  return (
    <>
      <section className="bg-brand-900 px-4 pt-6 pb-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <TrainServiceNav current="search" />
        </div>
      </section>

      <TrainHero />

      <section className="bg-surface-muted px-4 pb-16 pt-36 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Search & shortlist",
                sub: "Compare timings, availability and fares across major train types in one flow.",
              },
              {
                title: "Manage tickets",
                sub: "Jump back into active bookings or review confirmed train tickets from the same train hub.",
              },
              {
                title: "Raise requests",
                sub: "Start change requests and TDR filings from train-specific support pages instead of generic navigation.",
              },
              {
                title: "Rail booking engine",
                sub: "The existing rail search, class availability and passenger steps continue underneath this train layer.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border-soft bg-white p-5 shadow-(--shadow-xs)"
              >
                <p className="text-[15px] font-extrabold text-ink">{item.title}</p>
                <p className="mt-1.5 text-[13px] leading-6 text-ink-muted">
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
