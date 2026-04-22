import FlightSearchForm from "./FlightSearchForm";

export default function FlightHero() {
  return (
    <section
      aria-label="Flight booking"
      className="relative isolate"
    >
      <div className="relative h-[520px] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=2000&q=80"
          alt="Tropical beach with long-tail boats"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-x-0 top-0 px-6 pt-20 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow">
            Flight Booking
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base md:text-lg font-medium drop-shadow">
            Plan Your Travels Seamlessly with a Range of Domestic &
            International Flight Options.
          </p>
        </div>
      </div>

      <div className="relative z-10 -mt-32 px-6 pb-16">
        <FlightSearchForm />
      </div>
    </section>
  );
}
