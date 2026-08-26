import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Banknote,
  CheckCircle2,
  MessageCircle,
  QrCode,
  Sparkles,
  Store,
  Truck,
  Upload,
} from "lucide-react";
import { bakery } from "@/data/menu";
import { formatPrice, useCart } from "@/lib/cart";
import { createOrder } from "@/lib/orders.functions";
import upiQr from "@/assets/upi-qr.jpeg.asset.json";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Sugar Sorcery Pre-Order" },
      {
        name: "description",
        content:
          "Confirm your Sugar Sorcery pre-order: choose self pickup or delivery, pay by UPI or cash on delivery, and get an order code to track your order.",
      },
      { property: "og:title", content: "Checkout — Sugar Sorcery" },
      {
        property: "og:description",
        content:
          "Choose self pickup or delivery, pay by UPI or cash on delivery, and track your Sugar Sorcery pre-order.",
      },
    ],
  }),
  component: CheckoutPage,
});

type Fulfilment = "pickup" | "delivery";
type PaymentMethod = "upi" | "cod";

type Details = {
  name: string;
  phone: string;
  email: string;
  address: string;
  landmark: string;
  pincode: string;
  date: string;
  time: string;
  notes: string;
};

function CheckoutPage() {
  const { detailedLines, total, clear } = useCart();
  const placeOrder = useServerFn(createOrder);
  const [fulfilment, setFulfilment] = useState<Fulfilment>("delivery");
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [details, setDetails] = useState<Details>({
    name: "",
    phone: "",
    email: "",
    address: "",
    landmark: "",
    pincode: "",
    date: "",
    time: "",
    notes: "",
  });
  const [step, setStep] = useState<"details" | "payment">("details");
  const [proof, setProof] = useState<{ name: string; url: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{
    code: string;
    summary: string;
    proofUrl: string | null;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  function buildSummary(code: string) {
    const lines = detailedLines
      .map(
        (l) =>
          `• ${l.name} (${l.category}) — ${l.variantLabel} × ${l.quantity} = ${formatPrice(l.lineTotal)}`,
      )
      .join("\n");
    return [
      `Sugar Sorcery pre-order · ${code}`,
      ``,
      lines,
      ``,
      `Total: ${formatPrice(total)}`,
      ``,
      `Name: ${details.name}`,
      `Phone: ${details.phone}`,
      details.email ? `Email: ${details.email}` : "",
      ``,
      fulfilment === "pickup"
        ? `Fulfilment: Self pickup`
        : [
            `Fulfilment: Delivery`,
            `Delivery address: ${details.address}`,
            `Landmark: ${details.landmark}`,
            `Pincode: ${details.pincode}`,
          ].join("\n"),
      `Preferred ${fulfilment === "pickup" ? "pickup" : "delivery"} date: ${details.date}`,
      `Preferred ${fulfilment === "pickup" ? "pickup" : "delivery"} time: ${details.time}`,
      details.notes ? `Notes: ${details.notes}` : "",
      ``,
      payment === "upi"
        ? `Payment: Paid via UPI (${bakery.upiId}) — payment screenshot attached in this chat`
        : `Payment: Cash on ${fulfilment === "pickup" ? "pickup" : "delivery"}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await placeOrder({
        data: {
          customerName: details.name,
          phone: details.phone,
          email: details.email,
          fulfilment,
          address: fulfilment === "delivery" ? details.address : "",
          landmark: fulfilment === "delivery" ? details.landmark : "",
          pincode: fulfilment === "delivery" ? details.pincode : "",
          preferredDate: details.date,
          preferredTime: details.time,
          notes: details.notes,
          paymentMethod: payment,
          items: detailedLines.map((l) => ({
            name: l.name,
            category: l.category,
            variantLabel: l.variantLabel,
            quantity: l.quantity,
            price: l.price,
            lineTotal: l.lineTotal,
          })),
          total,
        },
      });
      const code = res?.code ?? "";
      const summary = buildSummary(code);
      clear();
      setPlaced({ code, summary, proofUrl: proof?.url ?? null });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong placing the order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    const waHref = `${bakery.whatsappHref}?text=${encodeURIComponent(placed.summary)}`;
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h1 className="brand-title mt-4 text-4xl text-primary">Order placed</h1>
        <p className="mt-3 text-muted-foreground">
          Your order code is{" "}
          <span className="font-medium text-foreground">{placed.code}</span>. Keep it
          safe — you can follow your order any time on the tracking page.
        </p>
        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/track"
            search={{ code: placed.code }}
            className="rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
          >
            Track my order
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 px-6 py-2.5 text-sm text-primary"
          >
            <MessageCircle className="h-4 w-4" /> Send details on WhatsApp
          </a>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Tap “Send details on WhatsApp” so the bakery receives your complete order
          {placed.proofUrl ? " — please also attach your payment screenshot" : ""}.
        </p>
        <pre className="mt-6 whitespace-pre-wrap rounded-xl border border-border/70 bg-card p-5 text-left text-sm">
          {placed.summary}
        </pre>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {placed.proofUrl && (
            <a
              href={placed.proofUrl}
              download="payment-screenshot"
              className="rounded-full border border-primary/30 px-6 py-2.5 text-sm text-primary"
            >
              Save payment screenshot
            </a>
          )}
          <Link
            to="/menu"
            className="rounded-full border border-border px-6 py-2.5 text-sm text-foreground"
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
        {step === "details" ? (
          <form
            className="space-y-5 rounded-xl border border-border/70 bg-card p-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (payment === "upi") setStep("payment");
              else void submit();
            }}
          >
            <fieldset>
              <legend className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                How would you like to receive your order?
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <Choice
                  active={fulfilment === "pickup"}
                  onClick={() => setFulfilment("pickup")}
                  icon={<Store className="h-4 w-4" />}
                  title="Self Pickup"
                  subtitle={bakery.address}
                />
                <Choice
                  active={fulfilment === "delivery"}
                  onClick={() => setFulfilment("delivery")}
                  icon={<Truck className="h-4 w-4" />}
                  title="Delivery"
                  subtitle="We deliver to your address"
                />
              </div>
            </fieldset>

            <Field label="Full name">
              <input
                required
                maxLength={100}
                value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </Field>
            <Field label="Phone number">
              <input
                required
                inputMode="tel"
                maxLength={20}
                value={details.phone}
                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </Field>
            <Field label="Email (optional)">
              <input
                type="email"
                maxLength={255}
                value={details.email}
                onChange={(e) => setDetails({ ...details, email: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </Field>

            {fulfilment === "delivery" && (
              <>
                <Field label="Full delivery address (flat / building / wing, street, area, city)">
                  <textarea
                    required
                    rows={3}
                    maxLength={500}
                    placeholder="e.g. Flat 402, B Wing, Shree Residency, Sector 12, Kharghar, Navi Mumbai"
                    value={details.address}
                    onChange={(e) => setDetails({ ...details, address: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Nearby landmark">
                  <input
                    required
                    maxLength={200}
                    placeholder="e.g. opposite Little World Mall, next to HDFC ATM"
                    value={details.landmark}
                    onChange={(e) => setDetails({ ...details, landmark: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Pincode">
                  <input
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder="410210"
                    value={details.pincode}
                    onChange={(e) => setDetails({ ...details, pincode: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </Field>
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={`Preferred ${fulfilment === "pickup" ? "pickup" : "delivery"} date`}
              >
                <input
                  required
                  type="date"
                  min={minDate}
                  value={details.date}
                  onChange={(e) => setDetails({ ...details, date: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </Field>
              <Field
                label={`Preferred ${fulfilment === "pickup" ? "pickup" : "delivery"} time`}
              >
                <input
                  required
                  type="time"
                  value={details.time}
                  onChange={(e) => setDetails({ ...details, time: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </Field>
            </div>
            <Field label="Notes (optional)">
              <textarea
                rows={3}
                maxLength={1000}
                value={details.notes}
                onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </Field>

            <fieldset>
              <legend className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Payment method
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <Choice
                  active={payment === "upi"}
                  onClick={() => setPayment("upi")}
                  icon={<QrCode className="h-4 w-4" />}
                  title="UPI / QR Code"
                  subtitle="Pay now by scanning our QR"
                />
                <Choice
                  active={payment === "cod"}
                  onClick={() => setPayment("cod")}
                  icon={<Banknote className="h-4 w-4" />}
                  title="Cash on Delivery"
                  subtitle={
                    fulfilment === "pickup" ? "Pay when you pick up" : "Pay on delivery"
                  }
                />
              </div>
            </fieldset>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {payment === "upi"
                ? `Continue to payment · ${formatPrice(total)}`
                : submitting
                  ? "Placing order…"
                  : `Place order · ${formatPrice(total)}`}
            </button>
          </form>
        ) : (
          <section className="space-y-5 rounded-xl border border-border/70 bg-card p-6">
            <div className="flex items-center gap-2 text-primary">
              <QrCode className="h-5 w-5" />
              <h2 className="text-2xl">Pay {formatPrice(total)} via UPI</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Scan the QR with any UPI app (GPay, PhonePe, Paytm) and pay the exact
              total. Then upload the payment screenshot below — your order is placed only
              after the payment proof is uploaded.
            </p>
            <div className="flex flex-col items-center gap-3 rounded-lg border border-border/70 bg-background p-5">
              <img
                src={upiQr.url}
                alt={`UPI QR code to pay ${bakery.upiName} at ${bakery.upiId}`}
                className="w-full max-w-[280px] rounded-lg"
                loading="lazy"
              />
              <p className="text-center text-sm">
                <span className="text-muted-foreground">UPI ID: </span>
                <span className="font-medium">{bakery.upiId}</span>
              </p>
            </div>

            <div>
              <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Payment screenshot
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return setProof(null);
                  if (!file.type.startsWith("image/")) return setProof(null);
                  setProof({ name: file.name, url: URL.createObjectURL(file) });
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-5 py-2.5 text-sm text-primary"
              >
                <Upload className="h-4 w-4" />
                {proof ? "Change screenshot" : "Upload screenshot"}
              </button>
              {proof && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-border/70 p-3">
                  <img
                    src={proof.url}
                    alt="Uploaded payment screenshot"
                    className="h-20 w-20 rounded object-cover"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{proof.name}</p>
                    <p className="flex items-center gap-1 text-primary">
                      <CheckCircle2 className="h-4 w-4" /> Payment proof attached
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="button"
              disabled={!proof || submitting}
              onClick={() => void submit()}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "Placing order…" : "Confirm payment & place order"}
            </button>
            <button
              type="button"
              onClick={() => setStep("details")}
              className="w-full text-xs uppercase tracking-[0.18em] text-muted-foreground"
            >
              Back to details
            </button>
          </section>
        )}

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

function Choice({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border p-4 text-left transition-colors ${
        active
          ? "border-primary bg-primary/10"
          : "border-border/70 bg-background hover:border-primary/50"
      }`}
    >
      <span className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{subtitle}</span>
    </button>
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
