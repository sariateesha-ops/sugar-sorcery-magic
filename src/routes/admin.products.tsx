import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminGate } from "@/lib/use-admin";
import { CATEGORIES, fetchProductRows, type ProductRow } from "@/lib/products";
import { formatPrice } from "@/lib/cart";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "Manage Products — Sugar Sorcery Admin" },
      { name: "description", content: "Add and edit Sugar Sorcery menu products, prices and photos." },
      { property: "og:title", content: "Manage Products — Sugar Sorcery Admin" },
      { property: "og:description", content: "Owner tools to manage the bakery menu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminProducts,
});

type Draft = {
  id: string | null;
  name: string;
  category_id: string;
  variants: { label: string; price: string }[];
  image_url: string | null;
  is_active: boolean;
};

const emptyDraft = (): Draft => ({
  id: null,
  name: "",
  category_id: CATEGORIES[0]!.id,
  variants: [{ label: "", price: "" }],
  image_url: null,
  is_active: true,
});

function AdminProducts() {
  const gate = useAdminGate();
  const qc = useQueryClient();
  const isAdmin = gate.data?.isAdmin === true;
  const products = useQuery({
    queryKey: ["products", "admin"],
    queryFn: fetchProductRows,
    enabled: isAdmin,
  });
  const [draft, setDraft] = useState<Draft | null>(null);

  if (gate.isLoading)
    return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="brand-title text-3xl text-primary">Admin sign-in required</h1>
        <Link to="/admin/login" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground">
          Go to Admin Login
        </Link>
      </div>
    );

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["products"] });
  };

  const remove = async (p: ProductRow) => {
    if (!confirm(`Delete "${p.name}" from the menu permanently?`)) return;
    const { error } = await supabase.from("products" as never).delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted");
    refresh();
  };

  const rows = products.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="brand-title text-4xl text-primary">Products</h1>
        <button
          type="button"
          onClick={() => setDraft(emptyDraft())}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {products.isLoading && <Loader2 className="mx-auto mt-12 h-6 w-6 animate-spin text-primary" />}
      {products.error && <p className="mt-8 text-destructive">Could not load products.</p>}

      {CATEGORIES.map((c) => {
        const list = rows.filter((r) => r.category_id === c.id);
        if (!list.length) return null;
        return (
          <section key={c.id} className="mt-10">
            <h2 className="text-2xl text-primary">{c.name}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <article key={p.id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary/60">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-primary/40"><Sparkles className="h-5 w-5" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">
                      {p.name} {!p.is_active && <span className="text-xs text-muted-foreground">(hidden)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.variants.map((v) => `${v.label} ${formatPrice(v.price)}`).join(" · ")}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            id: p.id,
                            name: p.name,
                            category_id: p.category_id,
                            variants: p.variants.map((v) => ({ label: v.label, price: String(v.price) })),
                            image_url: p.image_url,
                            is_active: p.is_active,
                          })
                        }
                        className="rounded-full border border-primary/40 px-3 py-1 text-xs text-primary"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(p)}
                        className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1 text-xs text-destructive"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {draft && (
        <Editor
          draft={draft}
          nextOrder={rows.length}
          onClose={() => setDraft(null)}
          onSaved={() => {
            setDraft(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Editor({
  draft: initial,
  nextOrder,
  onClose,
  onSaved,
}: {
  draft: Draft;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [d, setD] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10 MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data, error: e2 } = await supabase.storage
        .from("product-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (e2 || !data) throw e2 ?? new Error("Could not create link");
      setD((x) => ({ ...x, image_url: data.signedUrl }));
      toast.success("Photo uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const name = d.name.trim();
    const variants = d.variants
      .map((v) => ({ label: v.label.trim(), price: Number(v.price) }))
      .filter((v) => v.label);
    if (!name) { toast.error("Enter a product name"); return; }
    if (!variants.length) { toast.error("Add at least one size with a price"); return; }
    if (variants.some((v) => !Number.isFinite(v.price) || v.price <= 0))
      { toast.error("Every price must be a number above 0"); return; }
    const cat = CATEGORIES.find((c) => c.id === d.category_id)!;
    const payload = {
      name,
      category_id: cat.id,
      category_name: cat.name,
      variants,
      image_url: d.image_url,
      is_active: d.is_active,
    };
    setBusy(true);
    const { error } = d.id
      ? await supabase.from("products" as never).update(payload as never).eq("id", d.id)
      : await supabase
          .from("products" as never)
          .insert({ ...payload, id: `${slug(cat.id)}-${slug(name)}-${Date.now().toString(36)}`, sort_order: nextOrder } as never);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(d.id ? "Product updated" : "Product added");
    onSaved();
  };

  const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl text-primary">{d.id ? "Edit product" : "Add product"}</h2>
          <button type="button" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Photo</p>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-lg bg-secondary/60">
                {d.image_url ? (
                  <img src={d.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-primary/40"><Sparkles className="h-6 w-6" /></div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-sm text-primary">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  {uploading ? "Uploading…" : d.image_url ? "Change photo" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void upload(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                {d.image_url && (
                  <button type="button" onClick={() => setD({ ...d, image_url: null })} className="text-xs text-muted-foreground underline">
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Name</span>
            <input className={input} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} maxLength={100} />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Category</span>
            <select className={input} value={d.category_id} onChange={(e) => setD({ ...d, category_id: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <div>
            <p className="mb-1 text-sm font-medium">Sizes & prices (₹)</p>
            <div className="space-y-2">
              {d.variants.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={input}
                    placeholder="e.g. 1 KG / Box of 4 / Each"
                    value={v.label}
                    onChange={(e) => setD({ ...d, variants: d.variants.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
                  />
                  <input
                    className={`${input} w-28`}
                    inputMode="numeric"
                    placeholder="Price"
                    value={v.price}
                    onChange={(e) => setD({ ...d, variants: d.variants.map((x, j) => (j === i ? { ...x, price: e.target.value.replace(/[^0-9.]/g, "") } : x)) })}
                  />
                  <button
                    type="button"
                    aria-label="Remove size"
                    disabled={d.variants.length === 1}
                    onClick={() => setD({ ...d, variants: d.variants.filter((_, j) => j !== i) })}
                    className="px-2 text-muted-foreground disabled:opacity-30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setD({ ...d, variants: [...d.variants, { label: "", price: "" }] })}
              className="mt-2 text-sm text-primary underline"
            >
              + Add another size
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={d.is_active} onChange={(e) => setD({ ...d, is_active: e.target.checked })} />
            Show on the menu
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2 text-sm">Cancel</button>
          <button
            type="button"
            disabled={busy || uploading}
            onClick={() => void save()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}
