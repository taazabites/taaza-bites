export type SubscriptionStatus =
  | 'pending'
  | 'active'
  | 'paused'
  | 'expiring'
  | 'expired'
  | 'cancelled'
  | 'payment_failed'
  | 'draft';

export const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-sky-100 text-sky-800 border-sky-200' },
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  paused: { label: 'Paused', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  expiring: { label: 'Expiring', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  expired: { label: 'Expired', className: 'bg-zinc-200 text-zinc-600 border-zinc-300' },
  cancelled: { label: 'Cancelled', className: 'bg-zinc-200 text-zinc-600 border-zinc-300' },
  payment_failed: { label: 'Payment Failed', className: 'bg-red-100 text-red-800 border-red-200' },
  draft: { label: 'Draft', className: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
};

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'object' && value !== null && typeof (value as any).toDate === 'function') {
    const d = (value as any).toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
  }
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function daysUntil(value: unknown): number | null {
  const end = toDate(value);
  if (!end) return null;
  return Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function resolveSubscriptionStatus(sub: {
  status?: string;
  endDate?: unknown;
} | null | undefined): SubscriptionStatus {
  if (!sub) return 'expired';
  const raw = String(sub.status || 'pending').toLowerCase() as SubscriptionStatus;
  if (raw === 'cancelled' || raw === 'payment_failed' || raw === 'pending' || raw === 'draft' || raw === 'paused') {
    return raw;
  }
  const days = daysUntil(sub.endDate);
  if (days !== null && days < 0) return 'expired';
  if (raw === 'active' && days !== null && days <= 7) return 'expiring';
  if (raw === 'expired') return 'expired';
  return raw === 'active' ? 'active' : raw;
}

export function mealsCompletedOf(sub: Record<string, any> | null | undefined): number {
  if (!sub) return 0;
  return Number(sub.mealsCompleted ?? 0) || 0;
}

export function mealsRemainingOf(sub: Record<string, any> | null | undefined): number {
  if (!sub) return 0;
  if (sub.mealsRemaining != null) return Math.max(0, Number(sub.mealsRemaining) || 0);
  if (sub.remainingMeals != null) return Math.max(0, Number(sub.remainingMeals) || 0);
  const total = Number(sub.totalMeals ?? 0) || 0;
  return Math.max(0, total - mealsCompletedOf(sub));
}

export function totalMealsOf(sub: Record<string, any> | null | undefined): number {
  if (!sub) return 0;
  const snap = sub.planSnapshot || {};
  return Number(sub.totalMeals ?? snap.totalMeals ?? 0) || 0;
}

export function planNameOf(sub: Record<string, any> | null | undefined): string {
  return sub?.planSnapshot?.planName || sub?.planName || 'Your plan';
}

export function moneySavedOf(sub: Record<string, any> | null | undefined, paymentsTotal?: number): number {
  const snap = sub?.planSnapshot || {};
  const savings = Number(snap.savings ?? sub?.savings ?? 0) || 0;
  if (paymentsTotal && paymentsTotal > 0 && savings > 0) return savings;
  return savings;
}

export const RENEWAL_WINDOWS = [7, 3, 1] as const;
