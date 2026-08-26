import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { findProduct } from "@/data/menu";

export type CartLine = {
  productId: string;
  variantLabel: string;
  quantity: number;
};

export type CartLineDetail = CartLine & {
  name: string;
  category: string;
  price: number;
  image?: string | undefined;
  lineTotal: number;
};

type CartContextValue = {
  lines: CartLine[];
  detailedLines: CartLineDetail[];
  itemCount: number;
  total: number;
  add: (productId: string, variantLabel: string, quantity?: number) => void;
  setQuantity: (productId: string, variantLabel: string, quantity: number) => void;
  remove: (productId: string, variantLabel: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "sugar-sorcery-cart";

// Stored on globalThis so hot-reloads / duplicate module instances share the
// exact same context object instead of throwing "must be used inside CartProvider".
const globalStore = globalThis as unknown as {
  __sugarSorceryCartContext?: React.Context<CartContextValue | null>;
};
const CartContext =
  globalStore.__sugarSorceryCartContext ??
  (globalStore.__sugarSorceryCartContext = createContext<CartContextValue | null>(null));

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore malformed cart */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const detailedLines: CartLineDetail[] = lines.flatMap((line) => {
      const product = findProduct(line.productId);
      const variant = product?.variants.find((v) => v.label === line.variantLabel);
      if (!product || !variant) return [];
      return [
        {
          ...line,
          name: product.name,
          category: product.category,
          image: product.image,
          price: variant.price,
          lineTotal: variant.price * line.quantity,
        },
      ];
    });

    return {
      lines,
      detailedLines,
      itemCount: detailedLines.reduce((n, l) => n + l.quantity, 0),
      total: detailedLines.reduce((n, l) => n + l.lineTotal, 0),
      add: (productId, variantLabel, quantity = 1) =>
        setLines((prev) => {
          const existing = prev.find(
            (l) => l.productId === productId && l.variantLabel === variantLabel,
          );
          if (existing) {
            return prev.map((l) =>
              l === existing ? { ...l, quantity: l.quantity + quantity } : l,
            );
          }
          return [...prev, { productId, variantLabel, quantity }];
        }),
      setQuantity: (productId, variantLabel, quantity) =>
        setLines((prev) =>
          quantity <= 0
            ? prev.filter(
                (l) =>
                  !(l.productId === productId && l.variantLabel === variantLabel),
              )
            : prev.map((l) =>
                l.productId === productId && l.variantLabel === variantLabel
                  ? { ...l, quantity }
                  : l,
              ),
        ),
      remove: (productId, variantLabel) =>
        setLines((prev) =>
          prev.filter(
            (l) => !(l.productId === productId && l.variantLabel === variantLabel),
          ),
        ),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function formatPrice(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
