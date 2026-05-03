"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BookingStepper from "@/components/flight/BookingStepper";
import ItinerarySummary from "@/components/flight/ItinerarySummary";
import PriceBreakdown from "@/components/flight/PriceBreakdown";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Radio from "@/components/ui/Radio";
import { useBookingStore } from "@/state/bookingStore";
import type { Traveler } from "@/state/bookingStore";
import { useToast } from "@/components/ui/Toast";
import { bookFlight, issueFlight, type BookingPassenger } from "@/services/flights";

type Method = "card" | "upi" | "netbanking" | "wallet";

function travelerToPassenger(t: Traveler): BookingPassenger {
  return {
    type: t.type,
    title: t.title,
    firstName: t.firstName,
    lastName: t.lastName,
    gender: t.gender,
    dob: t.dob ?? "2000-01-01",
    addressLine1: t.addressLine1,
    city: t.city,
    nationality: t.nationality ?? "IN",
    countryCode: "IN",
    countryName: "India",
    passport: t.passport,
    passportExpiry: t.passportExpiry,
  };
}

export default function FlightPaymentPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <PaymentInner />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <BookingStepper active="payment" />
      <main className="flex-1 grid place-items-center p-8 text-ink-muted text-[14px]">
        Loading…
      </main>
      <Footer />
    </div>
  );
}

function PaymentInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();
  const { current, confirm, storeBookingResult } = useBookingStore();

  const [method, setMethod] = useState<Method>("upi");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [upi, setUpi] = useState("");
  const [netBank, setNetBank] = useState("HDFC");
  const [wallet, setWallet] = useState("Paytm");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!current) router.replace("/flight");
  }, [current, router]);

  if (!current) return null;

  const validatePaymentForm = (): string | null => {
    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 14) return "Enter a valid card number";
      if (!cardName.trim()) return "Name on card is required";
      if (!/^(\d{2})\/(\d{2})$/.test(exp)) return "Expiry must be MM/YY";
      if (!/^\d{3,4}$/.test(cvv)) return "CVV must be 3 or 4 digits";
    }
    if (method === "upi" && !/^[\w.-]+@[\w]+$/.test(upi)) return "Enter a valid UPI ID";
    return null;
  };

  const onPay = async () => {
    const formErr = validatePaymentForm();
    if (formErr) {
      toast.push({ title: formErr, tone: "warn" });
      return;
    }

    if (!current.fareBreakdown?.length) {
      toast.push({ title: "Fare data missing", description: "Please go back to the review page.", tone: "danger" });
      return;
    }

    setProcessing(true);
    try {
      const passengers = current.travelers.map(travelerToPassenger);

      let pnr: string;
      let bookingId: number;
      let ticketNumbers: string[] = [];

      if (current.isLCC !== false) {
        // LCC path (also default if isLCC is undefined — safe fallback)
        const result = await issueFlight({
          isLCC: true,
          resultIndex: current.offer.id,
          traceId: current.quoteTraceId,
          fareBreakdown: current.fareBreakdown,
          passengers,
          contactEmail: current.contact.email,
          contactPhone: current.contact.phone,
        });
        pnr = result.pnr;
        bookingId = result.bookingId;
        ticketNumbers = result.ticketNumbers;
      } else {
        // Non-LCC: Book first, then Ticket
        const booked = await bookFlight({
          resultIndex: current.offer.id,
          traceId: current.quoteTraceId,
          fareBreakdown: current.fareBreakdown,
          passengers,
          contactEmail: current.contact.email,
          contactPhone: current.contact.phone,
        });
        const issued = await issueFlight({ isLCC: false, bookingId: booked.bookingId });
        pnr = issued.pnr || booked.pnr;
        bookingId = issued.bookingId;
        ticketNumbers = issued.ticketNumbers;
      }

      storeBookingResult({ bookingId, pnr, ticketNumbers });
      confirm(pnr || `SPX${bookingId}`);
      toast.push({ title: "Booking confirmed", description: `PNR: ${pnr}`, tone: "success" });
      router.push(`/flight/${encodeURIComponent(current.offer.id)}/confirmation?${sp.toString()}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Booking failed";
      toast.push({ title: "Payment failed", description: msg, tone: "danger" });
    } finally {
      setProcessing(false);
    }
  };

  const METHODS: Array<{ v: Method; label: string; icon: React.ReactNode }> = [
    { v: "upi", label: "UPI", icon: <UpiIcon /> },
    { v: "card", label: "Credit / Debit card", icon: <CardIcon /> },
    { v: "netbanking", label: "Net banking", icon: <BankIcon /> },
    { v: "wallet", label: "Wallet", icon: <WalletIcon /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <BookingStepper active="payment" />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 md:px-6 py-6">
          <div className="grid md:grid-cols-[1fr_340px] gap-5">
            <div className="flex flex-col gap-4">
              <ItinerarySummary offer={current.offer} compact />

              <section className="rounded-xl bg-white border border-border-soft p-0 shadow-(--shadow-xs) overflow-hidden">
                <div className="px-5 py-4 border-b border-border-soft">
                  <h2 className="text-[16px] font-bold text-ink">Payment</h2>
                  <p className="text-[12px] text-ink-muted">All payments are 256-bit SSL encrypted.</p>
                </div>
                <div className="grid md:grid-cols-[220px_1fr]">
                  <div className="bg-surface-muted p-3 md:p-4 flex md:flex-col gap-2 overflow-x-auto">
                    {METHODS.map((m) => (
                      <button
                        key={m.v}
                        type="button"
                        onClick={() => setMethod(m.v)}
                        className={
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] font-semibold whitespace-nowrap transition-colors " +
                          (m.v === method
                            ? "bg-white text-brand-700 shadow-(--shadow-xs)"
                            : "text-ink-soft hover:bg-white/60")
                        }
                      >
                        <span className="text-brand-600">{m.icon}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-5">
                    {method === "card" && (
                      <div className="flex flex-col gap-3">
                        <Input
                          label="Card number"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) =>
                            setCardNumber(
                              e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 16)
                                .replace(/(\d{4})(?=\d)/g, "$1 "),
                            )
                          }
                        />
                        <Input
                          label="Name on card"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="As printed"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Expiry (MM/YY)"
                            value={exp}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                              setExp(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                            }}
                            placeholder="12/28"
                          />
                          <Input
                            label="CVV"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            type="password"
                            placeholder="•••"
                          />
                        </div>
                      </div>
                    )}
                    {method === "upi" && (
                      <div className="flex flex-col gap-3">
                        <Input
                          label="UPI ID"
                          placeholder="name@bank"
                          value={upi}
                          onChange={(e) => setUpi(e.target.value)}
                          hint="e.g. yourname@okhdfc, yourname@paytm"
                        />
                      </div>
                    )}
                    {method === "netbanking" && (
                      <div className="flex flex-col gap-2">
                        {["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Yes Bank"].map((b) => (
                          <Radio
                            key={b}
                            id={`bank-${b}`}
                            name="bank"
                            label={b}
                            checked={netBank === b}
                            onChange={() => setNetBank(b)}
                          />
                        ))}
                      </div>
                    )}
                    {method === "wallet" && (
                      <div className="grid sm:grid-cols-3 gap-2">
                        {["Paytm", "PhonePe", "Amazon Pay", "MobiKwik", "Freecharge", "Airtel Money"].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setWallet(w)}
                            className={
                              "rounded-md border px-3 h-11 text-[13px] font-semibold transition-colors " +
                              (wallet === w
                                ? "bg-brand-50 border-brand-600 text-brand-700"
                                : "bg-white border-border text-ink-soft hover:bg-surface-muted")
                            }
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <aside className="flex flex-col gap-4">
              <PriceBreakdown booking={current} />
              <Button variant="accent" size="lg" onClick={onPay} loading={processing} fullWidth>
                Pay {current.totalPrice.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
              </Button>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}
function UpiIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function BankIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M5 6l7-3 7 3" />
      <path d="M4 10v11" />
      <path d="M20 10v11" />
      <path d="M8 14v4" />
      <path d="M12 14v4" />
      <path d="M16 14v4" />
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 12V6a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v3" />
      <path d="M3 6v12a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-3h-4a2 2 0 0 1 0-4h4" />
    </svg>
  );
}
