import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getMyOrder } from "@/lib/customer.functions";
import { useCustomer } from "@/lib/customer-session";
import { formatPrice } from "@/lib/cart";
import { StatusBadge, formatDate, formatTime } from "@/components/StatusBadge";

export const Route = createFileRoute("/my-orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Details — Sugar Sorcery" },
      {
        name: "description",
        content:
          "Full details of your Sugar Sorcery pre-order: items, totals, payment method, delivery details and status.",
      },
      { property: "og:title", content: "Order Details — Sugar Sorcery" },
      {
        property: "og:description",
        content: "Full details of your Sugar Sorcery pre-order.",
      },
    ],
  }),
  component: OrderDetailsPage,
});

function OrderDetailsPage() {
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
        body="Sign in with your name and phone number to view this order."
      />
    );
  }

  if (query.isError) {
    return (
      <Notice
        title="Could not load order"
        body="Something went wrong loading this order. Please try again."
      />
    );
  }

  const order = query.data;
  if (!order) {
    return <Notice title="Order not found" body="We couldn't find that order ID." />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link
        to="/my-orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> My Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="brand-title text-4xl text-primary">#{order.order_id}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatDate(order.created_at)} · {formatTime(order.created_at)}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card title="Customer">
          <p className="text-foreground">{order.customer_name}</p>
          <p className="text-muted-foreground">{order.customer_phone}</p>
        </Card>
        <Card title="Payment">
          <p className="text-foreground">
            {order.payment_method === "cod" ? "Cash on delivery" : "UPI"}
          </p>
          <p className="text-muted-foreground">
            {order.fulfilment === "pickup" ? "Self pickup" : "Delivery"}
          </p>
        </Card>
        {order.fulfilment === "delivery" && (
          <Card title="Delivery details">
            <p className="text-foreground">{order.delivery_address ?? "—"}</p>
            {order.landmark && (
              <p className="text-muted-foreground">Landmark: {order.landmark}</p>
            )}
            {order.pincode && (
              <p className="text-muted-foreground">Pincode: {order.pincode}</p>
            )}
          </Card>
        )}
        <Card title="Preferred slot">
          <p className="text-foreground">{order.preferred_date ?? "—"}</p>
          <p className="text-muted-foreground">{order.preferred_time ?? ""}</p>
        </Card>
      </div>

      <div className="mt-8 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-lg text-primary">Items</h2>
        <div className="mt-4 divide-y divide-border/60">
          {(order.order_items ?? []).map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3">
              {item.product_image ? (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-secondary" />
              )}
              <div className="flex-1">
                <p className="text-foreground">{item.product_name}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {item.variant_label} · {formatPrice(Number(item.price))} ×{" "}
                  {item.quantity}
                </p>
              </div>
              <p className="text-sm text-foreground">
                {formatPrice(Number(item.subtotal))}
              </p>
            </div>
          ))}
        </div>

        <dl className="mt-5 space-y-2 border-t border-border/60 pt-4 text-sm">
          <Row label="Subtotal" value={formatPrice(Number(order.subtotal))} />
          <Row
            label="Delivery charge"
            value={
              Number(order.delivery_charge) > 0
                ? formatPrice(Number(order.delivery_charge))
                : "Free"
            }
          />
          <div className="flex items-center justify-between pt-2 text-base">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="text-foreground">
              {formatPrice(Number(order.total_amount))}
            </dd>
          </div>
        </dl>
      </div>

      {order.notes && (
        <p className="mt-6 text-sm text-muted-foreground">Notes: {order.notes}</p>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5 text-sm">
      <h2 className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
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
