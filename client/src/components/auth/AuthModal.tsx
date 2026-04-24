"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Tabs from "@/components/ui/Tabs";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore, type UserRole } from "@/state/authStore";
import { sleep } from "@/services/delay";

type TabValue = "customer" | "agent";

const TAB_ITEMS: Array<{ value: TabValue; label: string }> = [
  { value: "customer", label: "Customer" },
  { value: "agent", label: "Agent" },
];

const ROLE_MAP: Record<TabValue, UserRole> = {
  customer: "customer",
  agent: "agent",
};

function LoginForm({ role, onSuccess }: { role: TabValue; onSuccess: () => void }) {
  const toast = useToast();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.push({ title: "Enter a valid email", tone: "warn" });
      return;
    }
    if (password.length < 4) {
      toast.push({ title: "Password too short", tone: "warn" });
      return;
    }
    setLoading(true);
    await sleep(1100);
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    login({ name, email, role: ROLE_MAP[role] });
    toast.push({ title: "Login successful", description: `Welcome back, ${name}!`, tone: "success" });
    setLoading(false);
    onSuccess();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 pt-4">
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      <div className="flex justify-end">
        <button type="button" className="text-[12px] text-brand-600 hover:underline">Forgot password?</button>
      </div>
      <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
        Sign In
      </Button>
      <p className="text-center text-[12px] text-ink-muted">
        New user?{" "}
        <button type="button" className="text-brand-600 font-semibold hover:underline">Register</button>
      </p>
    </form>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTab?: TabValue;
};

export default function AuthModal({ open, onClose, defaultTab = "customer" }: Props) {
  const [tab, setTab] = useState<TabValue>(defaultTab);

  return (
    <Modal open={open} onClose={onClose} title="Sign In" size="sm">
      <Tabs value={tab} onChange={setTab} items={TAB_ITEMS} variant="underline" />
      <LoginForm key={tab} role={tab} onSuccess={onClose} />
    </Modal>
  );
}
