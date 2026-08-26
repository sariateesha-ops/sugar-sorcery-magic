import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const itemSchema = z.object({
  name: z.string().max(120),
  category: z.string().max(120),
  variantLabel: z.string().max(120),
  quantity: z.number().int().min(1).max(99),
  price: z.number().min(0).max(100000),
  lineTotal: z.number().min(0).max(1000000),
});

const orderSchema = z
  .object({
    customerName: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(8).max(20),
    email: z.string().trim().email().max(255).optional().or(z.literal("")),
    fulfilment: z.enum(["pickup", "delivery"]),
    address: z.string().trim().max(500).optional().or(z.literal("")),
    landmark: z.string().trim().max(200).optional().or(z.literal("")),
    pincode: z.string().trim().max(10).optional().or(z.literal("")),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    preferredTime: z.string().trim().min(3).max(20),
    notes: z.string().trim().max(1000).optional().or(z.literal("")),
    paymentMethod: z.enum(["upi", "cod"]),
    items: z.array(itemSchema).min(1).max(50),
    total: z.number().min(1).max(1000000),
  })
  .refine((v) => v.fulfilment === "pickup" || (v.address && v.address.length > 5), {
    message: "Delivery address is required for delivery orders",
    path: ["address"],
  });

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `SS-${out}`;
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = makeCode();

    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        code,
        customer_name: data.customerName,
        phone: data.phone,
        email: data.email || null,
        fulfilment: data.fulfilment,
        address: data.fulfilment === "delivery" ? data.address || null : null,
        landmark: data.fulfilment === "delivery" ? data.landmark || null : null,
        pincode: data.fulfilment === "delivery" ? data.pincode || null : null,
        preferred_date: data.preferredDate,
        preferred_time: data.preferredTime,
        notes: data.notes || null,
        payment_method: data.paymentMethod,
        items: data.items,
        total: data.total,
        status: "placed",
      })
      .select("code, status, created_at")
      .single();

    if (error) throw new Error("Could not save the order. Please try again.");
    return row;
  });

const publicOrderColumns =
  "code, customer_name, fulfilment, preferred_date, preferred_time, payment_method, items, total, status, created_at, updated_at";

export const trackOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ code: z.string().trim().min(4).max(20) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("orders")
      .select(publicOrderColumns)
      .eq("code", data.code.toUpperCase())
      .maybeSingle();
    return row ?? null;
  });

export const listOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Not allowed to read orders.");
    return data;
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        code: z.string().trim().min(4).max(20),
        status: z.enum([
          "placed",
          "confirmed",
          "preparing",
          "ready",
          "delivered",
          "cancelled",
        ]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("code", data.code)
      .select("code, status")
      .maybeSingle();
    if (error || !row) throw new Error("Could not update this order.");
    return row;
  });
