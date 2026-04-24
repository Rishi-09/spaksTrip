"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import RailBookingStepper from "@/components/rail/RailBookingStepper";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Radio from "@/components/ui/Radio";
import { formatINR } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { useTrainBookingStore } from "@/state/trainBookingStore";
import { sleep } from "@/services/delay";

type Method = "upi" | "card" | "netbanking" | "wallet";

export default function RailPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex flex-col bg-surface-muted"><Header /><RailBookingStepper active="payment" /></div>}>
      <PaymentInner />
    </Suspense>
  );
}

function PaymentInner() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { current, confirm } = useTrainBookingStore();

  const [method, setMethod] = useState<Method>("upi");
  const [upi, setUpi] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [netBank, setNetBank] = useState("HDFC");
  const [wallet, setWallet] = useState("Paytm");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!current) router.replace(`/rail/${id}`);
  }, [current, router, id]);

  if (!current) return null;

  const validate = (): string | null => {
    if (method === "upi" && !/^[\w.-]+@[\w]+$/.test(upi)) return "Enter a valid UPI ID (e.g. name@upi)";
    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 14) return "Enter a valid card number";
      if (!cardName.trim()) return "Name on card is required";
      if (!/^\d{2}\/\d{2}$/.test(exp)) return "Expiry must be MM/YY";
      if (!/^\d{3,4}$/.test(cvv)) return "CVV must be 3–4 digits";
    }
    return null;
  };

  const onPay = async () => {
    const err = validate();
    if (err) { toast.push({ title: err, tone: "warn" }); return; }
    setProcessing(true);
    await sleep(1400);
    const pnr = `PNR${Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000)}`;
    confirm(pnr);
    router.push(`/rail/${id}/confirmation`);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header />
      <RailBookingStepper active="payment" />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment methods */}
          <div className="lg:col-span-2 rounded-xl bg-white border border-border-soft shadow-(--shadow-xs) p-5">
            <h2 className="text-[16px] font-extrabold text-ink mb-5">Payment Method</h2>

            <div className="flex flex-col gap-3">
              {(["upi","card","netbanking","wallet"] as Method[]).map((m) => (
                <div key={m} onClick={() => setMethod(m)}
                  className={`rounded-lg border p-4 cursor-pointer transition-colors ${method === m ? "border-brand-500 bg-brand-50" : "border-border hover:border-brand-300"}`}>
                  <div className="flex items-center gap-3">
                    <Radio checked={method === m} onChange={() => setMethod(m)} />
                    <span className="text-[14px] font-semibold text-ink capitalize">
                      {m === "upi" ? "UPI" : m === "netbanking" ? "Net Banking" : m}
                    </span>
                  </div>

                  {method === m && (
                    <div className="mt-4 ml-7">
                      {m === "upi" && (
                        <Input label="UPI ID" value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="name@upi" />
                      )}
                      {m === "card" && (
                        <div className="flex flex-col gap-3">
                          <Input label="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" />
                          <Input label="Name on Card" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Full name" />
                          <div className="grid grid-cols-2 gap-3">
                            <Input label="Expiry (MM/YY)" value={exp} onChange={(e) => setExp(e.target.value)} placeholder="12/27" />
                            <Input label="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="•••" />
                          </div>
                        </div>
                      )}
                      {m === "netbanking" && (
                        <div>
                          <label className="block text-[13px] font-semibold text-ink mb-1">Select Bank</label>
                          <select value={netBank} onChange={(e) => setNetBank(e.target.value)}
                            className="w-full h-11 rounded-lg border border-border px-3 text-[14px] text-ink bg-white outline-none focus:border-brand-500 transition-colors">
                            {["HDFC","ICICI","SBI","Axis","Kotak","PNB"].map((b) => <option key={b}>{b}</option>)}
                          </select>
                        </div>
                      )}
                      {m === "wallet" && (
                        <div>
                          <label className="block text-[13px] font-semibold text-ink mb-1">Select Wallet</label>
                          <select value={wallet} onChange={(e) => setWallet(e.target.value)}
                            className="w-full h-11 rounded-lg border border-border px-3 text-[14px] text-ink bg-white outline-none focus:border-brand-500 transition-colors">
                            {["Paytm","PhonePe","Google Pay","Amazon Pay","Mobikwik"].map((w) => <option key={w}>{w}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Price summary */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-white border border-border-soft p-4 shadow-(--shadow-xs)">
              <p className="text-[13px] font-extrabold text-ink mb-3">Fare Summary</p>
              <div className="flex flex-col gap-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Train</span>
                  <span className="font-semibold text-ink text-right max-w-[160px]">{current.train.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Class</span>
                  <span className="font-semibold text-ink">{current.selectedClass} · {current.quota}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Passengers</span>
                  <span className="font-semibold text-ink">{current.passengers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Base fare</span>
                  <span className="font-semibold text-ink">{formatINR(current.farePerPassenger)} × {current.passengers.length}</span>
                </div>
                <div className="border-t border-border-soft pt-2 flex justify-between">
                  <span className="font-bold text-ink">Total</span>
                  <span className="font-extrabold text-[16px] text-brand-700">{formatINR(current.totalFare)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-warn-50 text-warn-600 text-[11px] font-medium px-3 py-2.5">
              Demo only — no real ticket will be issued.
            </div>

            <Button variant="accent" size="lg" fullWidth onClick={onPay} loading={processing}>
              Pay {formatINR(current.totalFare)}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
