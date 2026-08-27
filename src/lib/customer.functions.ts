import { createServerFn } from "@tanstack/react-start";
import {
  myOrderSchema,
  signInSchema,
  tokenSchema,
  updateNameSchema,
} from "@/lib/order-schemas";

export const signInCustomer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signInSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { signCustomerToken } = await import("@/lib/customer-token.server");
    const { normalizePhone } = await import("@/lib/order-schemas");
    const phone = normalizePhone(data.phone);
    if (phone.length < 8) throw new Error("Please enter a valid phone number.");

    const { data: existing, error: findError } = await supabaseAdmin
      .from("customers")
      .select("id, name, phone, created_at")
      .eq("phone", phone)
      .maybeSingle();
    if (findError) throw new Error("Could not sign you in. Please try again.");

    let customer = existing;
    if (customer) {
      if (customer.name !== data.name) {
        await supabaseAdmin
          .from("customers")
          .update({ name: data.name })
          .eq("id", customer.id);
        customer = { ...customer, name: data.name };
      }
    } else {
      const { data: created, error: createError } = await supabaseAdmin
        .from("customers")
        .insert({ name: data.name, phone })
        .select("id, name, phone, created_at")
        .single();
      if (createError || !created)
        throw new Error("Could not create your account. Please try again.");
      customer = created;
    }

    const token = await signCustomerToken({ id: customer.id, phone: customer.phone });
    return { token, customer };
  });

export const getCustomerProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyCustomerToken } = await import("@/lib/customer-token.server");
    const session = await verifyCustomerToken(data.token);
    if (!session) return null;

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id, name, phone, created_at")
      .eq("id", session.id)
      .maybeSingle();
    if (!customer) return null;

    const { count } = await supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customer.id);

    return { customer, orderCount: count ?? 0 };
  });

export const updateCustomerName = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateNameSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyCustomerToken } = await import("@/lib/customer-token.server");
    const session = await verifyCustomerToken(data.token);
    if (!session) throw new Error("Please sign in again.");

    const { data: customer, error } = await supabaseAdmin
      .from("customers")
      .update({ name: data.name })
      .eq("id", session.id)
      .select("id, name, phone, created_at")
      .single();
    if (error || !customer) throw new Error("Could not update your name.");
    return customer;
  });

export const listMyOrders = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyCustomerToken } = await import("@/lib/customer-token.server");
    const session = await verifyCustomerToken(data.token);
    if (!session) throw new Error("Please sign in again.");

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_id, status, payment_method, total_amount, created_at, fulfilment, order_items(quantity, product_name)",
      )
      .eq("customer_id", session.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Could not load your orders.");
    return orders ?? [];
  });

export const getMyOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => myOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyCustomerToken } = await import("@/lib/customer-token.server");
    const session = await verifyCustomerToken(data.token);
    if (!session) throw new Error("Please sign in again.");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_id", data.orderId.toUpperCase())
      .eq("customer_id", session.id)
      .maybeSingle();
    if (error) throw new Error("Could not load this order.");
    return order ?? null;
  });
