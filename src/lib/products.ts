import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { menu as staticMenu, type Category, type Product, type Variant } from "@/data/menu";

export type ProductRow = {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  variants: Variant[];
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export const CATEGORIES = staticMenu.map((c) => ({ id: c.id, name: c.name }));

export async function fetchProductRows(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products" as never)
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as ProductRow[]).map((r) => ({
    ...r,
    image_url: r.image_url ? r.image_url.replace("/storage/v1/object/authenticated/", "/storage/v1/object/public/") : null,
  }));
}

export function rowsToMenu(rows: ProductRow[]): Category[] {
  const order = new Map<string, Category>();
  for (const c of CATEGORIES) order.set(c.id, { id: c.id, name: c.name, products: [] });
  for (const r of rows) {
    if (!r.is_active) continue;
    if (!order.has(r.category_id))
      order.set(r.category_id, { id: r.category_id, name: r.category_name, products: [] });
    const p: Product = {
      id: r.id,
      name: r.name,
      category: r.category_name,
      variants: Array.isArray(r.variants) ? r.variants : [],
      ...(r.image_url ? { image: r.image_url } : {}),
    };
    if (p.variants.length) order.get(r.category_id)!.products.push(p);
  }
  return [...order.values()].filter((c) => c.products.length > 0);
}

/** Live menu from the database; falls back to the printed menu while loading. */
export function useMenu(): Category[] {
  const q = useQuery({
    queryKey: ["products"],
    queryFn: fetchProductRows,
    staleTime: 60_000,
  });
  return q.data ? rowsToMenu(q.data) : staticMenu;
}
