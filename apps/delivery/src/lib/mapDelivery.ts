import { DeliveryStop, DeliveryStatus } from "@/types";
import { normalizeStatus } from "@/lib/status";

function asMs(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object" && "toMillis" in (value as object)) {
    return Number((value as { toMillis: () => number }).toMillis());
  }
  const n = Date.parse(String(value || ""));
  return Number.isFinite(n) ? n : 0;
}

export function mapDeliveryDoc(id: string, data: Record<string, unknown>): DeliveryStop {
  const name = String(data.customerName || "Customer");
  const first = String(data.customerFirstName || name.trim().split(/\s+/)[0] || "Customer");
  const packages = Number(data.packageCount || data.quantity || 1) || 1;
  const loc = data.location as { lat?: number; lng?: number } | undefined;
  return {
    id,
    partnerId: String(data.partnerId || data.driverId || ""),
    orderId: String(data.orderId || id),
    customerId: String(data.customerId || ""),
    customerName: name,
    customerFirstName: first,
    customerPhone: String(data.customerPhone || ""),
    deliveryAddress: String(data.deliveryAddress || ""),
    deliveryArea: String(data.deliveryArea || data.area || ""),
    area: String(data.area || data.deliveryArea || ""),
    pincode: data.pincode ? String(data.pincode) : undefined,
    deliverySlot: String(data.deliverySlot || data.deliveryTimeSlot || ""),
    mealName: data.mealName ? String(data.mealName) : undefined,
    mealItems: Array.isArray(data.mealItems) ? (data.mealItems as string[]) : [],
    packageCount: packages,
    quantity: packages,
    specialInstructions: data.specialInstructions ? String(data.specialInstructions) : data.customerNotes ? String(data.customerNotes) : undefined,
    kitchenNotes: data.kitchenNotes ? String(data.kitchenNotes) : undefined,
    paymentStatus: String(data.paymentStatus || "paid").toLowerCase() === "cod" ? "cod" : "paid",
    location: loc && typeof loc.lat === "number" && typeof loc.lng === "number" ? { lat: loc.lat, lng: loc.lng } : null,
    isPriority: Boolean(data.isPriority),
    routeOrder: typeof data.routeOrder === "number" ? data.routeOrder : undefined,
    status: normalizeStatus(data.status) as DeliveryStatus,
    assignedAt: asMs(data.assignedAt),
    acceptedAt: asMs(data.acceptedAt),
    pickedUpAt: asMs(data.pickedUpAt),
    outForDeliveryAt: asMs(data.outForDeliveryAt),
    arrivedAt: asMs(data.arrivedAt),
    deliveredAt: asMs(data.deliveredAt),
    failedAt: asMs(data.failedAt),
    issueReason: data.issueReason ? String(data.issueReason) : undefined,
    issueNotes: data.issueNotes ? String(data.issueNotes) : undefined,
    deliveryPhotoUrl: data.deliveryPhotoUrl ? String(data.deliveryPhotoUrl) : undefined,
    verificationMethod: data.verificationMethod ? String(data.verificationMethod) : "OTP",
    createdAt: asMs(data.createdAt) || Date.now(),
    updatedAt: asMs(data.updatedAt) || Date.now(),
  };
}

export function slotSortValue(slot: string): number {
  const m = slot.match(/(\d{1,2})/);
  return m ? Number(m[1]) : 99;
}
