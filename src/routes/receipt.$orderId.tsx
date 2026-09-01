import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { getMyOrder } from "@/lib/customer.functions";
import { useCustomer } from "@/lib/customer-session";
import { formatPrice } from "@/lib/cart";
import { StatusBadge, formatDate, formatTime } from "@/components/StatusBadge";
import logo from "@/assets/logo.asset.json";
import { bakery } from "@/data/menu";

export const Route = createFileRoute("/receipt/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Receipt — Sugar Sorcery" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "Printable Sugar Sorcery order receipt with items, totals, payment method and order status.",
      },
      { property: "og:title", content: "Order Receipt — Sugar Sorcery" },
      {
        property: "og:description",
        content: "Keep a printable receipt of your Sugar Sorcery pre-order.",
      },
    ],
  }),
  component: ReceiptPage,
});

function ReceiptPage() {
  const { orderId } = Route.useParams();
  const { token, loading, signedIn } = useCustomer();
  const fetchOrder = useServerFn(getMyOrder);
  const query = useQuery({
    queryKey: ["my-order", token, orderId],
    enabled: Boolean(token),
    queryFn: () => fetchOrder({ data: { token: token as string, orderId } }),
  });

  if (loading || query.isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl justify-center px-4 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <Notice
        title="Sign in first"
        body="Sign in with your name and phone number to view this receipt."
      />
    );
  }

  if (query.isError) {
    return (
      <Notice
        title="Could not load receipt"
        body="Something went wrong loading this receipt. Please try again."
      />
    );
  }

  const order = query.data;
  if (!order) {
    return <Notice title="Receipt not found" body="We couldn't find that order ID." />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/my-orders/$orderId"
          params={{ orderId }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Order details
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm uppercase tracking-[0.16em] text-primary-foreground"
        >
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-border/70 bg-card p-6 print:border-0 print:p-0">
        <div className="flex items-center gap-3 border-b border-border/60 pb-5">
          <img
            src={logo.url}
            alt="Sugar Sorcery logo"
            className="h-14 w-14 rounded-full object-cover"
            style={{ objectPosition: "50% 34%" }}
          />
          <div>
            <p className="brand-title text-2xl text-primary">{bakery.name}</p>
            <p className="text-xs text-muted-foreground">{bakery.tagline}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {bakery.address} · {bakery.phone} · {bakery.email}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl text-primary">Receipt #{order.order_id}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(order.created_at)} · {formatTime(order.created_at)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Billed to
            </p>
            <p className="mt-1 text-foreground">{order.customer_name}</p>
            <p className="text-muted-foreground">{order.customer_phone}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Payment
            </p>
            <p className="mt-1 text-foreground">
              {order.payment_method === "cod"
                ? order.fulfilment === "pickup"
                  ? "Cash on pickup"
                  : "Cash on delivery"
                : `UPI · ${bakery.upiId}`}
            </p>
            <p className="text-muted-foreground">
              {order.fulfilment === "pickup" ? "Self pickup" : "Delivery"}
            </p>
          </div>
          {order.fulfilment === "delivery" && (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Delivery address
              </p>
              <p className="mt-1 text-foreground">{order.delivery_address ?? "—"}</p>
              {order.landmark && (
                <p className="text-muted-foreground">Landmark: {order.landmark}</p>
              )}
              {order.pincode && (
                <p className="text-muted-foreground">Pincode: {order.pincode}</p>
              )}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Preferred slot
            </p>
            <p className="mt-1 text-foreground">{order.preferred_date ?? "—"}</p>
            <p className="text-muted-foreground">{order.preferred_time ?? ""}</p>
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {(order.order_items ?? []).map((item) => (
              <tr key={item.id}>
                <td className="py-2.5 pr-2">
                  <span className="text-foreground">{item.product_name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {item.variant_label}
                  </span>
                </td>
                <td className="py-2.5 text-center text-foreground">{item.quantity}</td>
                <td className="py-2.5 text-right text-muted-foreground">
                  {formatPrice(Number(item.price))}
                </td>
                <td className="py-2.5 text-right text-foreground">
                  {formatPrice(Number(item.subtotal))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-5 space-y-2 border-t border-border/60 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-foreground">{formatPrice(Number(order.subtotal))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery charge</dt>
            <dd className="text-foreground">
              {Number(order.delivery_charge) > 0
                ? formatPrice(Number(order.delivery_charge))
                : "Free"}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border/60 pt-3 text-base">
            <dt className="text-muted-foreground">Total paid</dt>
            <dd className="text-primary">{formatPrice(Number(order.total_amount))}</dd>
          </div>
        </dl>

        {order.notes && (
          <p className="mt-5 text-sm text-muted-foreground">Notes: {order.notes}</p>
        )}

        <p className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
          Thank you for ordering from {bakery.name}. All orders are pre-orders and
          require at least 24 hours notice. Keep this receipt as proof of your order.
          For any query, WhatsApp {bakery.phone}.
        </p>
      </div>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      <h1 className="brand-title text-3xl text-primary">{title}</h1>
      <p className="mt-3 text-muted-foreground">{body}</p>
      <Link
        to="/my-orders"
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
      >
        My Orders
      </Link>
    </div>
  );
}
