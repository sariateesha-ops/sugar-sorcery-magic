import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Circle, Search } from "lucide-react";
import { bakery } from "@/data/menu";
import { formatPrice } from "@/lib/cart";
import { trackOrder } from "@/lib/orders.functions";
import { statusFlow, statusIndex, statusLabel, type OrderStatus } from "@/lib/order-status";

type TrackSearch = { code?: string };

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>): TrackSearch => ({
    code: typeof search.code === "string" ? search.code.slice(0, 20) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Track Your Order — Sugar Sorcery" },
      {
        name: "description",
        content:
          "Enter your Sugar Sorcery order code to see whether your order is placed, confirmed, being prepared, ready for pickup, out for delivery or completed.",
      },
      { property: "og:title", content: "Track Your Order — Sugar Sorcery" },
      {
        property: "og:description",
        content: "Follow your Sugar Sorcery pre-order from placed to delivered.",
      },
    ],
  }),
  component: TrackPage,
});

type OrderRow = {
  code: string;
  customer_name: string;
  fulfilment: "pickup" | "delivery";
  preferred_date: string;
  preferred_time: string;
  payment_method: "upi" | "cod";
  items: { name: string; variantLabel: string; quantity: number; lineTotal: number }[];
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

function TrackPage() {
  const { code: initialCode } = Route.useSearch();
  const lookup = useServerFn(trackOrder);
  const [code, setCode] = useState(initialCode ?? "");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function find(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < 4) return;
    setLoading(true);
    setMessage(null);
    try {
      const row = (await lookup({ data: { code: trimmed } })) as OrderRow | null;
      setOrder(row);
      if (!row) setMessage("We couldn't find an order with that code.");
    } catch {
      setMessage("Could not look up that order right now. Please try again.");
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="brand-title text-4xl text-primary">Track your order</h1>
      <p className="mt-2 text-sm uppercase tracking-[0.2em] text-primary/80">
        Enter the order code from your confirmation
      </p>

      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void find(code);
        }}
      >
        <input
          value={code}
          maxLength={20}
          placeholder="e.g. SS-ABC123"
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 rounded-full border border-input bg-background px-5 py-3 text-sm uppercase tracking-[0.1em] outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-50"
        >
          <Search className="h-4 w-4" /> {loading ? "Checking…" : "Track order"}
        </button>
      </form>

      {message && <p className="mt-6 text-sm text-muted-foreground">{message}</p>}

      {order && (
        <section className="mt-10 rounded-xl border border-border/70 bg-card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-2xl text-primary">{order.code}</h2>
            <span className="text-sm text-muted-foreground">
              {order.fulfilment === "pickup" ? "Self pickup" : "Delivery"} ·{" "}
              {order.preferred_date} at {order.preferred_time}
            </span>
          </div>

          {order.status === "cancelled" ? (
            <p className="mt-6 text-sm text-destructive">
              This order was cancelled. Please contact us on WhatsApp {bakery.phone} if
              this is unexpected.
            </p>
          ) : (
            <ol className="mt-6 space-y-4">
              {statusFlow.map((s) => {
                const done = statusIndex(order.status) >= statusIndex(s);
                return (
                  <li key={s} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className={done ? "text-foreground" : "text-muted-foreground"}>
                      {statusLabel(s, order.fulfilment)}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <ul className="mt-8 space-y-2 border-t border-border/70 pt-5 text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  {item.name} · {item.variantLabel} × {item.quantity}
                </span>
                <span>{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
            <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Total ·{" "}
              {order.payment_method === "upi" ? "Paid via UPI" : "Cash on delivery"}
            </span>
            <span className="font-display text-2xl text-primary">
              {formatPrice(Number(order.total))}
            </span>
          </div>
        </section>
      )}

      {searched && !order && !message && (
        <p className="mt-6 text-sm text-muted-foreground">
          Need help? WhatsApp us on {bakery.phone}.
        </p>
      )}
    </div>
  );
}
