import type { DeliveryStatus } from "@/types";

export const STATUS_FLOW: DeliveryStatus[] = [
  "ASSIGNED",
  "ACCEPTED",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "ARRIVED",
  "DELIVERED",
];

const ALLOWED: Record<DeliveryStatus, DeliveryStatus[]> = {
  ASSIGNED: ["ACCEPTED", "FAILED", "CANCELLED", "RETURN_TO_KITCHEN"],
  ACCEPTED: ["PICKED_UP", "FAILED", "CANCELLED", "RETURN_TO_KITCHEN"],
  PICKED_UP: ["OUT_FOR_DELIVERY", "FAILED", "RETURN_TO_KITCHEN"],
  OUT_FOR_DELIVERY: ["ARRIVED", "FAILED", "RETURN_TO_KITCHEN"],
  ARRIVED: ["FAILED", "RETURN_TO_KITCHEN"],
  DELIVERED: [],
  FAILED: [],
  CANCELLED: [],
  RETURN_TO_KITCHEN: [],
};

export function normalizeStatus(raw: unknown): DeliveryStatus {
  const s = String(raw || "ASSIGNED")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
  if (s === "PICKEDUP") return "PICKED_UP";
  if (s === "OUTFORDELIVERY") return "OUT_FOR_DELIVERY";
  if (s === "RETURNED" || s === "RETURNED_TO_KITCHEN") return "RETURN_TO_KITCHEN";
  if (s === "PENDING") return "ASSIGNED";
  if ((STATUS_FLOW as string[]).includes(s) || ["FAILED", "CANCELLED", "RETURN_TO_KITCHEN"].includes(s)) {
    return s as DeliveryStatus;
  }
  return "ASSIGNED";
}

export function canPartnerTransition(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return from === to || (ALLOWED[from] || []).includes(to);
}

export function greetingForHour(hour = new Date().getHours()): "Good morning" | "Good afternoon" | "Good evening" {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function statusLabel(status: DeliveryStatus): string {
  return status.replace(/_/g, " ");
}

export function isOpenStatus(status: DeliveryStatus): boolean {
  return !["DELIVERED", "FAILED", "CANCELLED", "RETURN_TO_KITCHEN"].includes(status);
}

export function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function eventId(deliveryId: string, action: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${deliveryId}_${action}_${crypto.randomUUID()}`;
  }
  return `${deliveryId}_${action}_${Date.now()}`;
}
