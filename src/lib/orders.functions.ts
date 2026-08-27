import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { adminOrderSchema, createOrderSchema } from "@/lib/order-schemas";

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyCustomerToken } = await import("@/lib/customer-token.server");
    const session = await verifyCustomerToken(data.token);
    if (!session) throw new Error("Please sign in before placing your order.");

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id, name, phone")
      .eq("id", session.id)
      .maybeSingle();
    if (!customer) throw new Error("Please sign in before placing your order.");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        fulfilment: data.fulfilment,
        delivery_address: data.fulfilment === "delivery" ? data.address || null : null,
        landmark: data.fulfilment === "delivery" ? data.landmark || null : null,
        pincode: data.fulfilment === "delivery" ? data.pincode || null : null,
        preferred_date: data.preferredDate,
        preferred_time: data.preferredTime,
        notes: data.notes || null,
        payment_method: data.paymentMethod,
        subtotal: data.subtotal,
        delivery_charge: data.deliveryCharge,
        total_amount: data.total,
        status: "pending",
      })
      .select("id, order_id, status, total_amount, payment_method, created_at")
      .single();

    if (error || !order) throw new Error("Could not save the order. Please try again.");

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
      data.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: `${item.name} (${item.category})`,
        product_image: item.image || null,
        variant_label: item.variantLabel,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.lineTotal,
      })),
    );
    if (itemsError) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error("Could not save the order items. Please try again.");
    }

    return {
      orderId: order.order_id,
      customerName: customer.name,
      total: Number(order.total_amount),
      paymentMethod: order.payment_method,
      status: order.status,
    };
  });

export const listOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error("Not allowed to read orders.");
    return data ?? [];
  });

export const getAdminOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => adminOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_id", data.orderId.toUpperCase())
      .maybeSingle();
    if (error) throw new Error("Not allowed to read this order.");
    return row ?? null;
  });

export const markOrderDelivered = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => adminOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("order_id", data.orderId.toUpperCase())
      .select("order_id, status")
      .maybeSingle();
    if (error || !row) throw new Error("Could not update this order.");
    return row;
  });

export const checkIsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: data === true };
  });
