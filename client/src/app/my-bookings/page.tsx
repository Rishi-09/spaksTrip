import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import BusBookingsList from "@/components/bus/BusBookingsList";
import EmptyState from "@/components/ui/EmptyState";
import { getBookings } from "@/lib/busService";

export default async function MyBookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-black text-ink">My Bus Bookings</h1>
            <p className="mt-1 text-[14px] text-ink-muted">
              Confirmed bus bookings will appear here once live bus booking is available.
            </p>
          </div>
          <Link
            href="/bus"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Search More Buses
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-white">
            <EmptyState
              title="No bus bookings yet"
              subtitle="Complete a booking from the bus seat map and it will appear here."
              cta={
                <Link
                  href="/bus"
                  className="inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Book a Bus
                </Link>
              }
            />
          </div>
        ) : (
          <BusBookingsList bookings={bookings} />
        )}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
