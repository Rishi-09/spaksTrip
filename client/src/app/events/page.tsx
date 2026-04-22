import EventsHero from "@/components/events/EventsHero";
import EventTypes from "@/components/events/EventTypes";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import EventReviews from "@/components/events/EventReviews";
import BackToTop from "@/components/landing/BackToTop";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-white text-[#0E1E3A]">
      <Header />
      <main>
        <EventsHero />
        <EventTypes />
        <UpcomingEvents />
        <EventReviews />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
