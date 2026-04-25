"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import BusSeatLegend from "@/components/bus/BusSeatLegend";
import BusSeatMap from "@/components/bus/BusSeatMap";
import BusPassengerForm from "@/components/bus/BusPassengerForm";
import BusBookingSummary from "@/components/bus/BusBookingSummary";
import type {
  ApiResponse,
  BusBooking,
  BusContact,
  BusPassenger,
  BusSeatLayoutResponse,
} from "@/lib/busTypes";

function emptyPassenger(seatNumber: string): BusPassenger {
  return { seatNumber, name: "", age: 0, gender: "Male" };
}

function syncPassengers(seatNumbers: string[], current: BusPassenger[]) {
  const bySeat = new Map(current.map((passenger) => [passenger.seatNumber, passenger]));
  return seatNumbers.map((seatNumber) => bySeat.get(seatNumber) ?? emptyPassenger(seatNumber));
}

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export default function BusDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const travelDate = searchParams.get("date") ?? "";

  const [layout, setLayout] = useState<BusSeatLayoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<BusPassenger[]>([]);
  const [contact, setContact] = useState<BusContact>({ email: "", phone: "" });
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});
  const [booking, setBooking] = useState<BusBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!travelDate) {
      router.replace("/bus");
      return;
    }

    const loadLayout = async () => {
      setLoading(true);
      setLoadingError(null);

      try {
        const response = await fetch(`/api/bus/seat-layout?busId=${encodeURIComponent(id)}&date=${encodeURIComponent(travelDate)}`);
        const payload = (await response.json()) as ApiResponse<BusSeatLayoutResponse>;

        if (!payload.success) {
          setLoadingError(payload.error);
          setLayout(null);
          return;
        }

        setLayout(payload.data);
      } catch {
        setLoadingError("Unable to load seat layout right now.");
        setLayout(null);
      } finally {
        setLoading(false);
      }
    };

    void loadLayout();
  }, [id, router, travelDate]);

  const selectedSeats = useMemo(() => {
    if (!layout) return [];
    return layout.seats.filter((seat) => selectedSeatNumbers.includes(seat.seatNumber));
  }, [layout, selectedSeatNumbers]);

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const toggleSeat = (seatNumber: string) => {
    const seat = layout?.seats.find((item) => item.seatNumber === seatNumber);
    if (!seat || seat.status === "booked") return;

    setBooking(null);
    setSelectedSeatNumbers((current) => {
      const nextSeatNumbers = current.includes(seatNumber)
        ? current.filter((item) => item !== seatNumber)
        : [...current, seatNumber].sort();
      setPassengers((existing) => syncPassengers(nextSeatNumbers, existing));
      return nextSeatNumbers;
    });
  };

  const updatePassenger = (seatNumber: string, field: "name" | "age" | "gender", value: string) => {
    setPassengers((current) =>
      current.map((passenger) =>
        passenger.seatNumber === seatNumber
          ? {
              ...passenger,
              [field]: field === "age" ? Number(value) : value,
            }
          : passenger,
      ),
    );
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (selectedSeatNumbers.length === 0) {
      nextErrors.seats = "Select at least one seat to continue.";
    }

    passengers.forEach((passenger) => {
      if (!passenger.name.trim()) {
        nextErrors[`name-${passenger.seatNumber}`] = "Enter passenger name.";
      }
      if (!passenger.age || passenger.age < 1) {
        nextErrors[`age-${passenger.seatNumber}`] = "Enter a valid age.";
      }
    });

    if (!isValidEmail(contact.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!contact.phone.trim()) {
      nextErrors.phone = "Enter a contact phone number.";
    }

    setSubmitErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitBooking = async () => {
    if (!layout || !validate()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/bus/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: id,
          travelDate,
          selectedSeats: selectedSeatNumbers,
          passengers,
          contact,
        }),
      });

      const payload = (await response.json()) as ApiResponse<BusBooking>;
      if (!payload.success) {
        toast.push({ title: payload.error, tone: "warn" });
        return;
      }

      setBooking(payload.data);
      setSelectedSeatNumbers([]);
      setPassengers([]);
      setSubmitErrors({});
      toast.push({ title: "Bus booking confirmed", description: `PNR ${payload.data.pnr}`, tone: "success" });

      const refreshed = await fetch(`/api/bus/seat-layout?busId=${encodeURIComponent(id)}&date=${encodeURIComponent(travelDate)}`);
      const refreshedPayload = (await refreshed.json()) as ApiResponse<BusSeatLayoutResponse>;
      if (refreshedPayload.success) {
        setLayout(refreshedPayload.data);
      }
    } catch {
      toast.push({ title: "Unable to complete booking right now.", tone: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-muted">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_420px]">
            <Skeleton className="h-[680px] rounded-2xl" />
            <Skeleton className="h-[520px] rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadingError || !layout) {
    return (
      <div className="min-h-screen bg-surface-muted">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-border-soft bg-white">
            <ErrorState message={loadingError ?? "Bus details not found."} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/bus" className="text-[13px] font-semibold text-brand-700 hover:underline">
              Back to bus search
            </Link>
            <h1 className="mt-2 text-[30px] font-black text-ink">
              {layout.bus.source} to {layout.bus.destination}
            </h1>
            <p className="text-[14px] text-ink-muted">
              {layout.bus.operatorName} | {travelDate} | {layout.bus.busType}
            </p>
          </div>
          <Link
            href="/my-bookings"
            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-brand-700 shadow-(--shadow-xs) ring-1 ring-border-soft transition-colors hover:bg-brand-50"
          >
            My Bookings
          </Link>
        </div>

        {booking ? (
          <div className="mb-6 rounded-2xl border border-success-500/20 bg-success-50 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[20px] font-black text-success-700">Booking confirmed</p>
                <p className="mt-1 text-[14px] text-success-700/90">
                  Booking ID {booking.bookingId} | PNR {booking.pnr}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/my-bookings">
                  <Button variant="primary">Open My Bookings</Button>
                </Link>
                <Button variant="outline" onClick={() => setBooking(null)}>
                  Book another seat
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.5fr_420px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border-soft bg-white p-5 shadow-(--shadow-xs)">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-[18px] font-extrabold text-ink">Select Your Seats</h2>
                  <p className="mt-1 text-[13px] text-ink-muted">
                    Choose from the live mock layout. Booked seats are already locked.
                  </p>
                </div>
                <BusSeatLegend />
              </div>
              {submitErrors.seats ? (
                <p className="mt-4 text-[13px] font-medium text-danger-600">{submitErrors.seats}</p>
              ) : null}
              <div className="mt-5">
                <BusSeatMap seats={layout.seats} selectedSeats={selectedSeatNumbers} onToggle={toggleSeat} />
              </div>
            </section>

            {selectedSeatNumbers.length > 0 ? (
              <BusPassengerForm
                passengers={passengers}
                contact={contact}
                errors={submitErrors}
                onPassengerChange={updatePassenger}
                onContactChange={(field, value) => {
                  setContact((current) => ({ ...current, [field]: value }));
                }}
              />
            ) : (
              <div className="rounded-2xl border border-border-soft bg-white">
                <EmptyState
                  title="Select seats to enter passenger details"
                  subtitle="Passenger and contact fields will appear as soon as you choose one or more available seats."
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <BusBookingSummary
              bus={layout.bus}
              travelDate={travelDate}
              selectedSeats={selectedSeats}
              totalPrice={totalPrice}
            />
            <Button
              variant="accent"
              size="lg"
              fullWidth
              onClick={submitBooking}
              loading={submitting}
              disabled={selectedSeatNumbers.length === 0}
            >
              Confirm Mock Booking
            </Button>
            <p className="rounded-xl bg-warn-50 px-4 py-3 text-[12px] font-medium text-warn-600">
              This is a simulation flow. Later, only the bus service layer needs to change for TBO integration.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
