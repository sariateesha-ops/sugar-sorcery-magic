import { useState } from "react";
import { Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/menu";
import { formatPrice, useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [variantLabel, setVariantLabel] = useState(product.variants[0]!.label);
  const [quantity, setQuantity] = useState(1);

  const variant =
    product.variants.find((v) => v.label === variantLabel) ?? product.variants[0]!;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-[var(--shadow-soft)]">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-secondary/60">
        {product.image ? (
          <img
            src={product.image}
            alt={`${product.name} — ${product.category}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-primary/50">
            <Sparkles className="h-6 w-6" />
            <span className="text-xs uppercase tracking-[0.2em]">Photo coming soon</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {product.category}
          </p>
          <h3 className="mt-1 text-2xl text-primary">{product.name}</h3>
        </div>

        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.label}
                type="button"
                onClick={() => setVariantLabel(v.label)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  v.label === variantLabel
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/60"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="font-display text-2xl text-primary">
            {formatPrice(variant.price)}
          </span>
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-primary"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-6 text-center text-sm">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2 text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            add(product.id, variant.label, quantity);
            toast.success(`${product.name} (${variant.label}) added to cart`);
            setQuantity(1);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
        >
          <ShoppingBag className="h-4 w-4" />
          Add to cart
        </button>
      </div>
    </article>
  );
}
