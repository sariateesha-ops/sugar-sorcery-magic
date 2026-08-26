import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import { bakery } from "@/data/menu";
import { formatPrice, useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Sugar Sorcery Pre-Order" },
      {
        name: "description",
        content:
          "Confirm your Sugar Sorcery pre-order details. Pre-order only, minimum 24 hours notice.",
      },
      { property: "og:title", content: "Checkout — Sugar Sorcery" },
      {
        property: "og:description",
        content: "Confirm your Sugar Sorcery pre-order details and payment.",
      },
    ],
  }),
  component: CheckoutPage,
});

type Details = {
  name: string;
  phone: string;
  email: string;
  date: string;
  notes: string;
};

function CheckoutPage() {
  const { detailedLines, total, clear } = useCart();
  const [details, setDetails] = useState<Details>({
    name: "",
    phone: "",
    email: "",
    date: "",
    notes: "",
  });
  const [placed, setPlaced] = useState<{ summary: string } | null>(null);

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  function buildSummary() {
    const lines = detailedLines
      .map(
        (l) =>
          `• ${l.name} (${l.category}) — ${l.variantLabel} × ${l.quantity} = ${formatPrice(l.lineTotal)}`,
      )
      .join("\n");
    return [
      `Sugar Sorcery pre-order`,
      ``,
      lines,
      ``,
      `Total: ${formatPrice(total)}`,
      ``,
      `Name: ${details.name}`,
      `Phone: ${details.phone}`,
      details.email ? `Email: ${details.email}` : "",
      `Preferred date: ${details.date}`,
      details.notes ? `Notes: ${details.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h1 className="brand-title mt-4 text-4xl text-primary">Pre-order placed</h1>
        <p className="mt-3 text-muted-foreground">
          Send your order to us on WhatsApp to confirm the slot and complete payment.
        </p>
        <pre className="mt-6 whitespace-pre-wrap rounded-xl border border-border/70 bg-card p-5 text-left text-sm">
          {placed.summary}
        </pre>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`${bakery.whatsappHref}?text=${encodeURIComponent(placed.summary)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" /> Confirm on WhatsApp
          </a>
          <Link
            to="/menu"
            className="rounded-full border border-primary/30 px-6 py-2.5 text-sm text-primary"
          >
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  if (detailedLines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <Sparkles className="mx-auto h-8 w-8 text-primary/60" />
        <h1 className="brand-title mt-4 text-4xl text-primary">Checkout</h1>
        <p className="mt-3 text-muted-foreground">
          Your cart is empty — add something sweet first.
        </p>
        <Link
          to="/menu"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="brand-title text-4xl text-primary">Checkout</h1>
      <p className="mt-2 text-sm uppercase tracking-[0.2em] text-primary/80">
        {bakery.orders} · orders at least 24 hours in advance
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <form
          className="space-y-4 rounded-xl border border-border/70 bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            const summary = buildSummary();
            clear();
            setPlaced({ summary });
          }}
        >
          <Field label="Full name">
            <input
              required
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>
          <Field label="Phone number">
            <input
              required
              inputMode="tel"
              value={details.phone}
              onChange={(e) => setDetails({ ...details, phone: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>
          <Field label="Email (optional)">
            <input
              type="email"
              value={details.email}
              onChange={(e) => setDetails({ ...details, email: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>
          <Field label="Preferred pickup date">
            <input
              required
              type="date"
              min={minDate}
              value={details.date}
              onChange={(e) => setDetails({ ...details, date: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>
          <Field label="Notes (optional)">
            <textarea
              rows={3}
              value={details.notes}
              onChange={(e) => setDetails({ ...details, notes: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>

          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            Place pre-order · {formatPrice(total)}
          </button>
        </form>

        <aside className="h-fit rounded-xl border border-border/70 bg-card p-6">
          <h2 className="text-2xl text-primary">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {detailedLines.map((line) => (
              <li
                key={`${line.productId}-${line.variantLabel}`}
                className="flex justify-between gap-4"
              >
                <span className="text-muted-foreground">
                  {line.name} · {line.variantLabel} × {line.quantity}
                </span>
                <span>{formatPrice(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
            <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Total
            </span>
            <span className="font-display text-2xl text-primary">
              {formatPrice(total)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
