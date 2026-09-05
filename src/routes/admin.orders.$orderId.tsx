import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteOrder,
  getAdminOrder,
  markOrderDelivered,
} from "@/lib/orders.functions";
import { useAdminGate } from "@/lib/use-admin";
import { formatPrice } from "@/lib/cart";
import { StatusBadge, formatDate, formatTime } from "@/components/StatusBadge";

export const Route = createFileRoute("/admin/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Details — Sugar Sorcery Admin" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "Sugar Sorcery admin order detail: customer, items, payment and delivery information.",
      },
      { property: "og:title", content: "Order Details — Sugar Sorcery Admin" },
      {
        property: "og:description",
        content: "Sugar Sorcery admin order detail view.",
      },
    ],
  }),
  component: AdminOrderDetails,
});

function AdminOrderDetails() {
  const { orderId } = Route.useParams();
  const gate = useAdminGate();
  const queryClient = useQueryClient();
  const fetchOrder = useServerFn(getAdminOrder);
  const deliver = useServerFn(markOrderDelivered);
  const removeOrder = useServerFn(deleteOrder);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const query = useQuery({
    queryKey: ["admin-order", orderId],
    enabled: gate.data?.isAdmin === true,
    queryFn: () => fetchOrder({ data: { orderId } }),
  });

  const mutation = useMutation({
    mutationFn: () => deliver({ data: { orderId } }),
    onSuccess: async () => {
      toast.success("Order marked as delivered");
      setConfirming(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => toast.error("Could not update this order."),
  });

  const deletion = useMutation({
    mutationFn: () => removeOrder({ data: { orderId } }),
    onSuccess: async () => {
      toast.success("Order deleted");
      setConfirmingDelete(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      void navigate({ to: "/admin" });
    },
    onError: () => toast.error("Could not delete this order."),
  });

  if (gate.isLoading || query.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!gate.data?.isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <h1 className="brand-title text-3xl text-primary">Not authorised</h1>
        <Link
          to="/admin/login"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
        >
          Admin Login
        </Link>
      </div>
    );
  }

  const order = query.data;
  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <h1 className="brand-title text-3xl text-primary">Order not found</h1>
        <Link
          to="/admin"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="brand-title text-4xl text-primary">#{order.order_id}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatDate(order.created_at)} · {formatTime(order.created_at)}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Panel title="Customer information">
          <p className="text-foreground">{order.customer_name}</p>
          <p className="text-muted-foreground">{order.customer_phone}</p>
          {(() => {
            const email =
              (order as { customer_email?: string | null }).customer_email ??
              (order as { customers?: { email?: string | null } | null }).customers?.email;
            return email ? (
              <p className="text-muted-foreground">{email}</p>
            ) : (
              <p className="text-xs text-muted-foreground/70">No email on record</p>
            );
          })()}
        </Panel>
        <Panel title="Payment information">
          <p className="text-foreground">
            {order.payment_method === "cod"
              ? order.fulfilment === "pickup"
                ? "Cash on pickup"
                : "Cash on delivery"
              : "UPI / QR code"}
          </p>
          <p className="text-muted-foreground">
            {order.fulfilment === "pickup" ? "Self pickup" : "Delivery"}
          </p>
          {order.payment_method === "upi" && (
            <div className="mt-3">
              {order.paymentProofUrl ? (
                <>
                  <a href={order.paymentProofUrl} target="_blank" rel="noreferrer">
                    <img
                      src={order.paymentProofUrl}
                      alt={`Payment screenshot for order ${order.order_id}`}
                      className="max-h-64 w-auto rounded-lg border border-border/70 object-contain"
                    />
                  </a>
                  <a
                    href={order.paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-xs uppercase tracking-[0.16em] text-primary"
                  >
                    Open full screenshot
                  </a>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No payment screenshot uploaded for this order.
                </p>
              )}
            </div>
          )}
        </Panel>
        <Panel title="Delivery information">
          {order.fulfilment === "pickup" ? (
            <p className="text-muted-foreground">Self pickup — no address needed.</p>
          ) : (
            <>
              <p className="text-foreground">{order.delivery_address ?? "—"}</p>
              {order.landmark && (
                <p className="text-muted-foreground">Landmark: {order.landmark}</p>
              )}
              {order.pincode && (
                <p className="text-muted-foreground">Pincode: {order.pincode}</p>
              )}
            </>
          )}
        </Panel>
        <Panel title="Preferred slot">
          <p className="text-foreground">{order.preferred_date ?? "—"}</p>
          <p className="text-muted-foreground">{order.preferred_time ?? ""}</p>
        </Panel>
      </div>

      <div className="mt-8 rounded-xl border border-border/70 bg-card p-5">
        <h2 className="text-lg text-primary">Products</h2>
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
                <p className="text-xs text-muted-foreground">ID: {item.product_id}</p>
              </div>
              <p className="text-sm text-foreground">
                {formatPrice(Number(item.subtotal))}
              </p>
            </div>
          ))}
        </div>
        <dl className="mt-5 space-y-2 border-t border-border/60 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(Number(order.subtotal))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery charge</dt>
            <dd>
              {Number(order.delivery_charge) > 0
                ? formatPrice(Number(order.delivery_charge))
                : "Free"}
            </dd>
          </div>
          <div className="flex justify-between pt-2 text-base">
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

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {order.status === "delivered" ? (
          <span className="inline-flex rounded-full bg-primary/10 px-6 py-2.5 text-sm uppercase tracking-[0.16em] text-primary">
            Delivered
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-full bg-primary px-6 py-2.5 text-sm uppercase tracking-[0.16em] text-primary-foreground"
          >
            Mark as Delivered
          </button>
        )}
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-6 py-2.5 text-sm uppercase tracking-[0.16em] text-destructive"
        >
          <Trash2 className="h-4 w-4" /> Delete order
        </button>
      </div>

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-foreground">
              Delete order #{order.order_id} permanently? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                disabled={deletion.isPending}
                onClick={() => deletion.mutate()}
                className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm text-destructive-foreground disabled:opacity-60"
              >
                {deletion.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-full border border-border px-5 py-2.5 text-sm text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-foreground">
              Are you sure you want to mark this order as delivered?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
              >
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, delivered
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-full border border-border px-5 py-2.5 text-sm text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5 text-sm">
      <h2 className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}
