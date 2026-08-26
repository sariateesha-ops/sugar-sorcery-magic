import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { bakery, menu } from "@/data/menu";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1000),
      }),
    )
    .min(1)
    .max(20),
});

function knowledge() {
  const menuText = menu
    .map(
      (c) =>
        `${c.name}:\n` +
        c.products
          .map(
            (p) =>
              `  - ${p.name}: ` +
              p.variants.map((v) => `${v.label} ₹${v.price}`).join(", "),
          )
          .join("\n"),
    )
    .join("\n");

  return `Bakery: ${bakery.name} — "${bakery.tagline}"
Location: ${bakery.address}
Opening status: ${bakery.hours}
Orders: ${bakery.orders}. Every order must be placed at least 24 hours in advance.
Phone / WhatsApp: ${bakery.phone}
Email: ${bakery.email}
Instagram: ${bakery.instagram}
Fulfilment options at checkout: Self Pickup or Delivery (delivery needs full address, landmark and pincode).
Payment options at checkout: UPI / QR code (UPI ID ${bakery.upiId}, ${bakery.upiName}) or Cash on Delivery.
After an order is placed the customer gets an order code and can follow it on the Track Order page. Statuses: Order Placed, Order Confirmed, Preparing, Ready for Pickup / Out for Delivery, Delivered / Picked Up.

MENU (all prices in Indian Rupees):
${menuText}`;
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Assistant is not configured.");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: [
          {
            role: "system",
            content: `You are the friendly assistant for the ${bakery.name} bakery website. Answer only from the information below. If something is not covered (for example an item that is not on the menu, or the status of a specific order), say you don't have that information and point the customer to WhatsApp ${bakery.phone} or the Track Order page. Never invent products, prices, timings or policies. Keep answers short (1-4 sentences), warm and helpful. Prices are in Indian Rupees.\n\n${knowledge()}`,
          },
          ...data.messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429)
        throw new Error("The assistant is busy right now — please try again shortly.");
      throw new Error("The assistant could not answer right now.");
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("The assistant could not answer right now.");
    return { reply };
  });
