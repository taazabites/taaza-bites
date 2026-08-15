import { DeliveryAssignment, SlotTimingStatus } from "@/types";

const SLOT_WINDOWS: Record<string, { start: number; end: number }> = {
  breakfast: { start: 7, end: 9 },
  lunch: { start: 12, end: 14 },
  dinner: { start: 19, end: 21 },
};

export function normalizeMealSlot(mealType: string): "Breakfast" | "Lunch" | "Dinner" | "Other" {
  const t = mealType.toLowerCase();
  if (t.includes("break")) return "Breakfast";
  if (t.includes("lunch")) return "Lunch";
  if (t.includes("dinner")) return "Dinner";
  return "Other";
}

/** Compare current time to typical slot windows */
export function getSlotTimingStatus(mealType: string, now = new Date()): SlotTimingStatus {
  const key = normalizeMealSlot(mealType).toLowerCase();
  const window = SLOT_WINDOWS[key];
  if (!window) return "on_time";
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour <= window.end) return "on_time";
  if (hour <= window.end + 0.75) return "running_late";
  return "delayed";
}

export function slotStatusLabel(status: SlotTimingStatus) {
  if (status === "on_time") return { label: "On time", color: "bg-emerald-100 text-emerald-700" };
  if (status === "running_late") return { label: "Running late", color: "bg-amber-100 text-amber-800" };
  return { label: "Delayed", color: "bg-red-100 text-red-700" };
}

/** Haversine distance in km */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Nearest-neighbor route from kitchen → stops → kitchen.
 * Optionally opens Google Directions multi-stop URL.
 */
export function optimizeRouteOrder(
  deliveries: DeliveryAssignment[],
  kitchen: { lat: number; lng: number } = { lat: 12.9121, lng: 77.6446 }
): DeliveryAssignment[] {
  const remaining = [...deliveries];
  const ordered: DeliveryAssignment[] = [];
  let cursor = kitchen;

  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((d, i) => {
      if (d.isPriority) {
        // prefer priority among near-equal; still distance-first overall
      }
      const dist = distanceKm(cursor, d.location) - (d.isPriority ? 0.5 : 0);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    cursor = next.location;
  }
  return ordered.map((d, i) => ({ ...d, routeOrder: i + 1 }));
}

export function buildGoogleDirectionsUrl(
  deliveries: DeliveryAssignment[],
  kitchen: { lat: number; lng: number } = { lat: 12.9121, lng: 77.6446 }
): string {
  if (!deliveries.length) {
    return `https://www.google.com/maps/dir/?api=1&destination=${kitchen.lat},${kitchen.lng}&travelmode=driving`;
  }
  const origin = `${kitchen.lat},${kitchen.lng}`;
  const destination = origin; // return to kitchen
  const waypoints = deliveries
    .map((d) => `${d.location.lat},${d.location.lng}`)
    .join("|");
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(
    waypoints
  )}&travelmode=driving`;
}

export function estimateRouteKm(
  deliveries: DeliveryAssignment[],
  kitchen: { lat: number; lng: number } = { lat: 12.9121, lng: 77.6446 }
): number {
  if (!deliveries.length) return 0;
  let total = 0;
  let cursor = kitchen;
  for (const d of deliveries) {
    total += distanceKm(cursor, d.location);
    cursor = d.location;
  }
  total += distanceKm(cursor, kitchen);
  return Math.round(total * 10) / 10;
}
