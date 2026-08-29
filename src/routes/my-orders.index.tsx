import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package, ShoppingBag } from "lucide-react";
import { listMyOrders } from "@/lib/customer.functions";
import { useCustomer } from "@/lib/customer-session";
import { formatPrice } from "@/lib/cart";
import { StatusBadge, formatDate, formatTime } from "@/components/StatusBadge";

export const Route = createFileRoute("/my-orders/")({
  head: () => ({
    meta: [
      { title: "My Orders — Sugar Sorcery" },
      {
        name: "description",
        content:
          "See every Sugar Sorcery pre-order you have placed, with items, totals and current status.",
      },
      { property: "og:title", content: "My Orders — Sugar Sorcery" },
      {
        property: "og:description",
        content: "Every Sugar Sorcery pre-order you have placed, with its current status.",
      },
    ],
  }),
  component: MyOrdersPage,
});

function MyOrdersPage() {
  const { token, loading, signedIn } = useCustomer();
  const fetchOrders = useServerFn(listMyOrders);
  const query = useQuery({
    queryKey: ["my-orders", token],
    enabled: Boolean(token),
    queryFn: () => fetchOrders({ data: { token: token as string } }),
  });

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl justify-center px-4 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <Package className="mx-auto h-8 w-8 text-primary/70" />
        <h1 className="brand-title mt-4 text-4xl text-primary">My Orders</h1>
        <p className="mt-3 text-muted-foreground">
          Sign in with your name and phone number to see your orders.
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="brand-title text-4xl text-primary">My Orders</h1>
      <p className="mt-2 text-sm uppercase tracking-[0.2em] text-primary/80">
        Your Sugar Sorcery pre-orders
      </p>

      {query.isLoading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : query.isError ? (
        <div className="mt-10 rounded-xl border border-border/70 bg-card p-8 text-center">
          <p className="text-muted-foreground">
            We couldn't load your orders right now.
          </p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
          >
            Try again
          </button>
        </div>
      ) : (query.data ?? []).length === 0 ? (
        <div className="mt-10 rounded-xl border border-border/70 bg-card p-10 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-primary/60" />
          <p className="mt-4 text-muted-foreground">
            You haven't placed any orders yet.
          </p>
          <Link
            to="/menu"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {(query.data ?? []).map((order) => {
            const items = order.order_items ?? [];
            const count = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
            return (
              <Link
                key={order.id}
                to="/my-orders/$orderId"
                params={{ orderId: order.order_id }}
                className="block rounded-xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg text-foreground">Order #{order.order_id}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {formatDate(order.created_at)} · {formatTime(order.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {items.map((i) => i.product_name).join(", ") || "—"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">
                    {count} {count === 1 ? "Item" : "Items"}
                  </span>
                  <span className="text-foreground">
                    {formatPrice(Number(order.total_amount))}
                  </span>
                  <span className="uppercase tracking-[0.16em] text-muted-foreground">
                    {order.payment_method === "cod" ? "Cash" : "UPI"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
