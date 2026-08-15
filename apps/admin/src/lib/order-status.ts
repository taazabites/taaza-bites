export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Packed",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const ALIASES: Record<string, OrderStatus> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  prepping: "Preparing",
  packed: "Packed",
  ready: "Ready",
  "out for delivery": "Out for Delivery",
  "out for delivery ": "Out for Delivery",
  "out_for_delivery": "Out for Delivery",
  "out with courier": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  canceled: "Cancelled",
};

export function normalizeOrderStatus(value: unknown): OrderStatus {
  const raw = String(value || "Pending").trim();
  const aliased = ALIASES[raw.toLowerCase()];
  if (aliased) return aliased;
  if ((ORDER_STATUSES as readonly string[]).includes(raw)) return raw as OrderStatus;
  return "Pending";
}

const FORWARD: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Preparing", "Cancelled"],
  Preparing: ["Packed", "Cancelled"],
  Packed: ["Ready", "Out for Delivery", "Cancelled"],
  Ready: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

export function allowedNextStatuses(current: unknown): OrderStatus[] {
  return FORWARD[normalizeOrderStatus(current)] || [];
}

export function canTransitionOrder(from: unknown, to: unknown): boolean {
  const next = normalizeOrderStatus(to);
  if (normalizeOrderStatus(from) === next) return true;
  return allowedNextStatuses(from).includes(next);
}

export function orderTransitionError(from: unknown, to: unknown): string | null {
  if (canTransitionOrder(from, to)) return null;
  return `Cannot move an order from ${normalizeOrderStatus(from)} to ${normalizeOrderStatus(to)}.`;
}
