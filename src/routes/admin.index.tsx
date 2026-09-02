import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  IndianRupee,
  Loader2,
  LogOut,
  PackageCheck,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteOrder, listOrders, markOrderDelivered } from "@/lib/orders.functions";
import { useAdminGate } from "@/lib/use-admin";
import { formatPrice } from "@/lib/cart";
import { StatusBadge, formatDate, formatTime } from "@/components/StatusBadge";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Sugar Sorcery" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Sugar Sorcery order management: totals, sales and delivery updates.",
      },
      { property: "og:title", content: "Admin Dashboard — Sugar Sorcery" },
      {
        property: "og:description",
        content: "Sugar Sorcery order management dashboard.",
      },
    ],
  }),
  component: AdminDashboard,
});

type Filter = "all" | "pending" | "delivered";

function AdminDashboard() {
  const gate = useAdminGate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchOrders = useServerFn(listOrders);
  const deliver = useServerFn(markOrderDelivered);
  const removeOrder = useServerFn(deleteOrder);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    enabled: gate.data?.isAdmin === true,
    refetchInterval: 30_000,
    queryFn: () => fetchOrders({}),
  });

  const mutation = useMutation({
    mutationFn: (orderId: string) => deliver({ data: { orderId } }),
    onSuccess: async () => {
      toast.success("Order marked as delivered");
      setConfirming(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => toast.error("Could not update this order. Please try again."),
  });

  const deletion = useMutation({
    mutationFn: (orderId: string) => removeOrder({ data: { orderId } }),
    onSuccess: async () => {
      toast.success("Order deleted");
      setConfirmingDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not delete this order."),
  });


  const orders = ordersQuery.data ?? [];
  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status !== "delivered").length;
    return {
      total: orders.length,
      pending,
      delivered: orders.length - pending,
      sales: orders.reduce((sum, o) => sum + Number(o.total_amount), 0),
    };
  }, [orders]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const statusOk =
        filter === "all" ||
        (filter === "delivered" ? o.status === "delivered" : o.status !== "delivered");
      if (!statusOk) return false;
      if (!q) return true;
      return (
        o.order_id.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q)
      );
    });
  }, [orders, search, filter]);

  if (gate.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!gate.data?.signedIn) {
    return (
      <Blocked
        title="Admin sign-in required"
        body="Please sign in with your admin email and password."
        cta="Go to Admin Login"
      />
    );
  }

  if (!gate.data.isAdmin) {
    return (
      <Blocked
        title="Not authorised"
        body="This account does not have admin access to the Sugar Sorcery portal."
        cta="Use a different account"
        signOutFirst
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="brand-title text-4xl text-primary">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{gate.data.email}</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            queryClient.clear();
            void navigate({ to: "/admin/login" });
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Orders" value={String(stats.total)} />
        <Stat label="Pending Orders" value={String(stats.pending)} />
        <Stat label="Delivered Orders" value={String(stats.delivered)} />
        <Stat label="Total Sales" value={formatPrice(stats.sales)} icon />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, customer or phone"
            className="w-full rounded-full border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "delivered"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {ordersQuery.isLoading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : ordersQuery.isError ? (
        <div className="mt-10 rounded-xl border border-border/70 bg-card p-8 text-center">
          <p className="text-muted-foreground">Could not load orders.</p>
          <button
            type="button"
            onClick={() => void ordersQuery.refetch()}
            className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
          >
            Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border/70 bg-card p-12 text-center">
          <PackageCheck className="mx-auto h-8 w-8 text-primary/60" />
          <p className="mt-4 text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-8 hidden overflow-x-auto rounded-xl border border-border/70 bg-card lg:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border/70 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {visible.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3">
                      <Link
                        to="/admin/orders/$orderId"
                        params={{ orderId: o.order_id }}
                        className="text-primary hover:underline"
                      >
                        {o.order_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{o.customer_name}</td>
                    <td className="px-4 py-3">{o.customer_phone}</td>
                    <td className="px-4 py-3">
                      {formatPrice(Number(o.total_amount))}
                    </td>
                    <td className="px-4 py-3 uppercase">
                      {o.payment_method === "cod" ? "Cash" : "UPI"}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(o.created_at)}
                      <span className="block text-xs text-muted-foreground">
                        {formatTime(o.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <DeliverButton
                          status={o.status}
                          pending={mutation.isPending && confirming === o.order_id}
                          onClick={() => setConfirming(o.order_id)}
                        />
                        <button
                          type="button"
                          title="Delete order"
                          aria-label={`Delete order ${o.order_id}`}
                          onClick={() => setConfirmingDelete(o.order_id)}
                          className="rounded-full border border-destructive/40 p-2 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-8 grid gap-4 lg:hidden">
            {visible.map((o) => (
              <div key={o.id} className="rounded-xl border border-border/70 bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <Link
                    to="/admin/orders/$orderId"
                    params={{ orderId: o.order_id }}
                    className="text-lg text-primary"
                  >
                    #{o.order_id}
                  </Link>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-2 text-sm text-foreground">{o.customer_name}</p>
                <p className="text-sm text-muted-foreground">{o.customer_phone}</p>
                <p className="mt-2 text-sm">
                  {formatPrice(Number(o.total_amount))} ·{" "}
                  {o.payment_method === "cod" ? "Cash" : "UPI"}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {formatDate(o.created_at)} · {formatTime(o.created_at)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <DeliverButton
                    status={o.status}
                    pending={mutation.isPending && confirming === o.order_id}
                    onClick={() => setConfirming(o.order_id)}
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(o.order_id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2 text-xs uppercase tracking-[0.14em] text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-foreground">
              Are you sure you want to mark {confirming} as delivered?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(confirming)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
              >
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, delivered
              </button>
              <button
                type="button"
                onClick={() => setConfirming(null)}
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

function DeliverButton({
  status,
  pending,
  onClick,
}: {
  status: string;
  pending: boolean;
  onClick: () => void;
}) {
  if (status === "delivered") {
    return (
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        Delivered
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="rounded-full bg-primary px-4 py-2 text-xs uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-60"
    >
      Mark as Delivered
    </button>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5">
      {icon && <IndianRupee className="mb-2 h-5 w-5 text-primary" />}
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl text-foreground">{value}</p>
    </div>
  );
}

function Blocked({
  title,
  body,
  cta,
  signOutFirst,
}: {
  title: string;
  body: string;
  cta: string;
  signOutFirst?: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      <h1 className="brand-title text-3xl text-primary">{title}</h1>
      <p className="mt-3 text-muted-foreground">{body}</p>
      <button
        type="button"
        onClick={async () => {
          if (signOutFirst) {
            await supabase.auth.signOut();
            queryClient.clear();
          }
          void navigate({ to: "/admin/login" });
        }}
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
      >
        {cta}
      </button>
    </div>
  );
}
