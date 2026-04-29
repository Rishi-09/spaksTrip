"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Radio from "@/components/ui/Radio";
import Tabs from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api";
import { authClient, type ApiAuthUser } from "@/lib/authClient";
import { useAuthStore } from "@/state/authStore";

type Mode = "signin" | "register";
type AuthRole = "customer" | "partner";

type Props = {
  initialMode?: Mode;
  redirectTo?: string | null;
  onSuccess?: (user: ApiAuthUser) => void | Promise<void>;
};

const MODE_ITEMS = [
  { value: "signin", label: "Login" },
  { value: "register", label: "Register" },
] as const;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AuthForm({
  initialMode = "signin",
  redirectTo,
  onSuccess,
}: Props) {
  const toast = useToast();
  const loginToStore = useAuthStore((state) => state.login);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [role, setRole] = useState<AuthRole>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitLabel = useMemo(() => {
    return mode === "register" ? "Create Account" : "Sign In";
  }, [mode]);

  const hintCopy = useMemo(() => {
    if (mode === "register") {
      return "Create your account once and choose whether it should behave as a customer or partner profile.";
    }

    return "Sign in with your email and password. We will route you based on the role stored on your account.";
  }, [mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === "register" && normalizedName.length < 2) {
      toast.push({
        title: "Enter your name",
        description: "Please add at least 2 characters for your display name.",
        tone: "warn",
      });
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      toast.push({ title: "Enter a valid email", tone: "warn" });
      return;
    }

    if (mode === "register" && password.length < 8) {
      toast.push({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        tone: "warn",
      });
      return;
    }

    if (mode === "signin" && password.length === 0) {
      toast.push({ title: "Password required", tone: "warn" });
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        await authClient.register({ email: normalizedEmail, password, role });
      } else {
        await authClient.login({ email: normalizedEmail, password, role });
      }

      const user = await authClient.me();
      loginToStore(user, mode === "register" ? normalizedName : undefined);

      toast.push({
        title: mode === "register" ? "Account created" : "Login successful",
        description: `Signed in as ${user.email}`,
        tone: "success",
      });

      await onSuccess?.(user);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.";

      toast.push({
        title: mode === "register" ? "Could not create account" : "Could not sign in",
        description: message,
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={mode}
        onChange={(value) => setMode(value)}
        items={MODE_ITEMS as unknown as Array<{ value: Mode; label: string }>}
        variant="underline"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
        <p className="text-[13px] text-ink-muted">{hintCopy}</p>

        {mode === "register" ? (
          <Input
            id="auth-name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            autoComplete="name"
          />
        ) : null}

        <Input
          id="auth-email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Input
          id="auth-password"
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          hint={mode === "register" ? "Minimum 8 characters." : undefined}
        />

        <div className="rounded-xl border border-border-soft bg-surface-muted/60 p-4">
          <div className="mb-3">
            <span className="text-[13px] font-medium text-ink-soft">Choose Role</span>
            <p className="mt-1 text-[12px] text-ink-muted">
              {role === "partner"
                ? "Partner accounts unlock the protected dashboard after authentication."
                : "Customer accounts continue into the travel booking experience."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Radio
              id="role-customer"
              name="auth-role"
              checked={role === "customer"}
              onChange={() => setRole("customer")}
              label="Customer"
            />
            <Radio
              id="role-partner"
              name="auth-role"
              checked={role === "partner"}
              onChange={() => setRole("partner")}
              label="Partner"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
          {submitLabel}
        </Button>

        <p className="text-center text-[12px] text-ink-muted">
          {redirectTo
            ? "You will return to the page you were trying to open after authentication."
            : "We will route you automatically after authentication based on your role."}
        </p>
      </form>
    </div>
  );
}
