export type DeliveryStage = 'preparing' | 'packed' | 'out_for_delivery' | 'delivered' | 'skipped' | 'cancelled' | 'scheduled';

const MAP: Record<string, DeliveryStage> = {
  pending: 'scheduled',
  scheduled: 'scheduled',
  confirmed: 'preparing',
  preparing: 'preparing',
  cooking: 'preparing',
  packing: 'packed',
  packed: 'packed',
  ready: 'packed',
  shipped: 'out_for_delivery',
  dispatched: 'out_for_delivery',
  out_for_delivery: 'out_for_delivery',
  outfordelivery: 'out_for_delivery',
  arriving: 'out_for_delivery',
  delivered: 'delivered',
  completed: 'delivered',
  skipped: 'skipped',
  paused: 'skipped',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  payment_failed: 'cancelled',
};

export function normalizeDeliveryStatus(status: unknown): DeliveryStage {
  const key = String(status || 'scheduled').toLowerCase().replace(/\s+/g, '_');
  return MAP[key] || 'scheduled';
}

export const DELIVERY_STEPS: { id: DeliveryStage; label: string }[] = [
  { id: 'preparing', label: 'Preparing' },
  { id: 'packed', label: 'Packed' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered' },
];

export function deliveryStepIndex(status: unknown): number {
  const stage = normalizeDeliveryStatus(status);
  const idx = DELIVERY_STEPS.findIndex((s) => s.id === stage);
  if (stage === 'scheduled') return -1;
  return idx;
}

export function deliveryLabel(status: unknown): string {
  const stage = normalizeDeliveryStatus(status);
  return DELIVERY_STEPS.find((s) => s.id === stage)?.label || stage.replace(/_/g, ' ');
}
