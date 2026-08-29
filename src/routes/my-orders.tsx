import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/my-orders")({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      <h1 className="brand-title text-3xl text-primary">Order not found</h1>
      <Link
        to="/my-orders"
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
      >
        Back to My Orders
      </Link>
    </div>
  ),
});
