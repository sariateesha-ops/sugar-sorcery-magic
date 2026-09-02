import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().max(120),
  name: z.string().max(120),
  category: z.string().max(120),
  variantLabel: z.string().max(120),
  image: z.string().max(500).optional().or(z.literal("")),
  quantity: z.number().int().min(1).max(99),
  price: z.number().min(0).max(100000),
  lineTotal: z.number().min(0).max(1000000),
});

export const createOrderSchema = z
  .object({
    token: z.string().min(10).max(2000),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
    fulfilment: z.enum(["pickup", "delivery"]),
    address: z.string().trim().max(500).optional().or(z.literal("")),
    landmark: z.string().trim().max(200).optional().or(z.literal("")),
    pincode: z.string().trim().max(10).optional().or(z.literal("")),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    preferredTime: z.string().trim().min(3).max(20),
    notes: z.string().trim().max(1000).optional().or(z.literal("")),
    paymentMethod: z.enum(["upi", "cod"]),
    paymentProofPath: z.string().trim().max(300).optional().or(z.literal("")),
    items: z.array(orderItemSchema).min(1).max(50),
    subtotal: z.number().min(1).max(1000000),
    deliveryCharge: z.number().min(0).max(100000),
    total: z.number().min(1).max(1000000),
  })
  .refine((v) => v.fulfilment === "pickup" || (v.address && v.address.length > 5), {
    message: "Delivery address is required for delivery orders",
    path: ["address"],
  });

export const signInSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,20}$/, "Enter a valid phone number"),
});

export const tokenSchema = z.object({ token: z.string().min(10).max(2000) });

export const updateNameSchema = z.object({
  token: z.string().min(10).max(2000),
  name: z.string().trim().min(2).max(100),
});

export const myOrderSchema = z.object({
  token: z.string().min(10).max(2000),
  orderId: z.string().trim().min(3).max(40),
});

export const uploadProofSchema = z.object({
  token: z.string().min(10).max(2000),
  fileName: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(3).max(100),
  // base64 (no data: prefix) — capped to roughly 6MB of binary data
  dataBase64: z.string().min(20).max(8_500_000),
});

export const adminOrderSchema = z.object({
  orderId: z.string().trim().min(3).max(40),
});

export function normalizePhone(phone: string) {
  return phone.replace(/[^0-9]/g, "").slice(-10);
}
