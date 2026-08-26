import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Sparkles, Trash2 } from "lucide-react";
import { bakery } from "@/data/menu";
import { formatPrice, useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Sugar Sorcery" },
      {
        name: "description",
        content:
          "Review your Sugar Sorcery pre-order, adjust quantities and proceed to secure checkout.",
      },
      { property: "og:title", content: "Your Cart — Sugar Sorcery" },
      {
        property: "og:description",
        content: "Review your Sugar Sorcery pre-order and proceed to checkout.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { detailedLines, total, setQuantity, remove } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="brand-title text-4xl text-primary">Your Cart</h1>
      <p className="mt-2 text-sm uppercase tracking-[0.2em] text-primary/80">
        {bakery.orders} · minimum 24 hours notice
      </p>

      {detailedLines.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border/70 bg-card p-10 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link
            to="/menu"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground"
          >
            Browse the menu
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-4">
            {detailedLines.map((line) => (
              <li
                key={`${line.productId}-${line.variantLabel}`}
                className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary/60">
                  {line.image ? (
                    <img
                      src={line.image}
                      alt={line.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary/50">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {line.category}
                  </p>
                  <h2 className="text-xl text-primary">{line.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {line.variantLabel} · {formatPrice(line.price)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        setQuantity(line.productId, line.variantLabel, line.quantity - 1)
                      }
                      className="px-3 py-2 text-primary"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-6 text-center text-sm">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() =>
                        setQuantity(line.productId, line.variantLabel, line.quantity + 1)
                      }
                      className="px-3 py-2 text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="w-20 text-right font-display text-xl text-primary">
                    {formatPrice(line.lineTotal)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => remove(line.productId, line.variantLabel)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-end gap-4 rounded-xl border border-border/70 bg-card p-6">
            <div className="flex w-full items-center justify-between">
              <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Total
              </span>
              <span className="font-display text-3xl text-primary">
                {formatPrice(total)}
              </span>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                to="/menu"
                className="rounded-full border border-primary/30 px-6 py-2.5 text-center text-sm text-primary"
              >
                Add more
              </Link>
              <Link
                to="/checkout"
                className="rounded-full bg-primary px-6 py-2.5 text-center text-sm text-primary-foreground"
              >
                Proceed to checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
