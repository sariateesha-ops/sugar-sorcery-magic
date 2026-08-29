import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { signInCustomer } from "@/lib/customer.functions";
import { useCustomer, type Customer } from "@/lib/customer-session";

export const Route = createFileRoute("/signin")({
  validateSearch: (search: Record<string, unknown>): { next?: string } =>
    typeof search['next'] === "string" ? { next: search['next'] as string } : {},
  head: () => ({
    meta: [
      { title: "Sign In — Sugar Sorcery" },
      {
        name: "description",
        content:
          "Sign in to Sugar Sorcery with your name and phone number to place pre-orders and see your order history.",
      },
      { property: "og:title", content: "Sign In — Sugar Sorcery" },
      {
        property: "og:description",
        content: "Sign in with your name and phone number to follow your bakery orders.",
      },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const { setSession, signedIn } = useCustomer();
  const signIn = useServerFn(signInCustomer);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await signIn({ data: { name, phone } });
      setSession(res.token, res.customer as Customer);
      toast.success(`Welcome, ${res.customer.name}!`);
      void navigate({ to: next === "/checkout" ? "/checkout" : "/my-orders" });
    } catch (err) {
      setError(
        err instanceof Error && err.message.length < 160
          ? err.message
          : "Could not sign you in right now. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center">
        <UserRound className="mx-auto h-8 w-8 text-primary/70" />
        <h1 className="brand-title mt-4 text-4xl text-primary">Sign In</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Just your name and phone number — no OTP, no password. Your phone number
          identifies your account.
        </p>
      </div>

      {signedIn ? (
        <div className="mt-8 rounded-xl border border-border/70 bg-card p-8 text-center">
          <p className="text-muted-foreground">You're already signed in.</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/profile"
              className="rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
            >
              My Profile
            </Link>
            <Link
              to="/my-orders"
              className="rounded-full border border-primary/30 px-6 py-2.5 text-sm text-primary"
            >
              My Orders
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="mt-8 space-y-4 rounded-xl border border-border/70 bg-card p-6"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Full Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              placeholder="Ishita Gupte"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Phone Number
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              inputMode="tel"
              placeholder="7710865577"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? "Signing in" : "Sign In"}
          </button>
        </form>
      )}
    </div>
  );
}
