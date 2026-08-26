export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export const statusFlow: OrderStatus[] = [
  "placed",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
];

export function statusLabel(status: OrderStatus, fulfilment: "pickup" | "delivery") {
  switch (status) {
    case "placed":
      return "Order Placed";
    case "confirmed":
      return "Order Confirmed";
    case "preparing":
      return "Preparing";
    case "ready":
      return fulfilment === "pickup" ? "Ready for Pickup" : "Out for Delivery";
    case "delivered":
      return fulfilment === "pickup" ? "Picked Up" : "Delivered";
    case "cancelled":
      return "Cancelled";
  }
}

export function statusIndex(status: OrderStatus) {
  return statusFlow.indexOf(status);
}
