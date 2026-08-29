import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2, LogOut, Phone, ShoppingBag, UserRound } from "lucide-react";
import { toast } from "sonner";
import { updateCustomerName } from "@/lib/customer.functions";
import { useCustomer, type Customer } from "@/lib/customer-session";
import { formatDate } from "@/components/StatusBadge";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Sugar Sorcery" },
      {
        name: "description",
        content:
          "Manage your Sugar Sorcery account details and jump straight to your bakery order history.",
      },
      { property: "og:title", content: "My Profile — Sugar Sorcery" },
      {
        property: "og:description",
        content: "Manage your Sugar Sorcery account details and order history.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { customer, token, orderCount, loading, signedIn, setCustomer, signOut } =
    useCustomer();
  const navigate = useNavigate();
  const saveName = useServerFn(updateCustomerName);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (customer) setName(customer.name);
  }, [customer]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl justify-center px-4 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!signedIn || !customer || !token) {
    return <SignedOutNotice />;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !token) return;
    setBusy(true);
    try {
      const updated = await saveName({ data: { token, name } });
      setCustomer(updated as Customer);
      toast.success("Name updated");
    } catch {
      toast.error("Could not update your name. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="brand-title text-4xl text-primary">My Profile</h1>
      <p className="mt-2 text-sm uppercase tracking-[0.2em] text-primary/80">
        Your Sugar Sorcery account
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-card p-5">
          <UserRound className="h-5 w-5 text-primary" />
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Name
          </p>
          <p className="mt-1 text-lg text-foreground">{customer.name}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-5">
          <Phone className="h-5 w-5 text-primary" />
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Phone (your ID)
          </p>
          <p className="mt-1 text-lg text-foreground">{customer.phone}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-5">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Total Orders
          </p>
          <p className="mt-1 text-lg text-foreground">{orderCount}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Account created on {formatDate(customer.created_at)}.
      </p>

      <form
        onSubmit={submit}
        className="mt-8 rounded-xl border border-border/70 bg-card p-6"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Edit your name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={busy || name.trim() === customer.name}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/my-orders"
          className="rounded-full bg-primary px-6 py-2.5 text-center text-sm text-primary-foreground"
        >
          My Orders
        </Link>
        <button
          type="button"
          onClick={() => {
            signOut();
            toast.success("Signed out");
            void navigate({ to: "/" });
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

function SignedOutNotice() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      <UserRound className="mx-auto h-8 w-8 text-primary/70" />
      <h1 className="brand-title mt-4 text-4xl text-primary">Sign in first</h1>
      <p className="mt-3 text-muted-foreground">
        Sign in with your name and phone number to see your profile.
      </p>
      <Link
        to="/signin"
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
      >
        Sign In
      </Link>
    </div>
  );
}
