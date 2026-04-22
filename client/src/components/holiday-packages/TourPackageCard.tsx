export type TourPackage = {
  title: string;
  image: string;
};

export default function TourPackageCard({ pkg }: { pkg: TourPackage }) {
  return (
    <article className="flex flex-col rounded-md border border-zinc-200 bg-white p-3 shadow-[0_1px_2px_rgba(10,30,60,0.04)] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="overflow-hidden rounded-sm">
        <img
          src={pkg.image}
          alt={pkg.title}
          className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
      </div>
      <h3 className="mt-5 mb-3 text-center text-lg font-bold text-[#0E1E3A]">
        {pkg.title}
      </h3>
    </article>
  );
}
