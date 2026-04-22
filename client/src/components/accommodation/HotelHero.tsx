import HotelSearchForm from "./HotelSearchForm";

export default function HotelHero() {
  return (
    <section
      className="relative w-full py-14 px-6"
      style={{
        background: "linear-gradient(135deg, #0f2a3c 0%, #1a6060 60%, #1e7070 100%)",
      }}
    >
      <h1 className="text-center text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight">
        Book Domestic and International Hotels
      </h1>
      <HotelSearchForm />
    </section>
  );
}
