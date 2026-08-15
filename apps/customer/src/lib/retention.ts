import { daysUntil, resolveSubscriptionStatus } from './subscription-lifecycle';

export type RetentionState = 'healthy' | 'at_risk' | 'expiring' | 'churned';

export function computeRetentionState(input: {
  status?: string;
  endDate?: unknown;
  skippedMealsCount?: number;
  complaintCount?: number;
  lastActivityAt?: unknown;
}): RetentionState {
  const status = resolveSubscriptionStatus(input);
  if (status === 'cancelled' || status === 'expired' || status === 'payment_failed') return 'churned';
  if (status === 'expiring') return 'expiring';

  const skipped = Number(input.skippedMealsCount || 0);
  const complaints = Number(input.complaintCount || 0);
  const daysLeft = daysUntil(input.endDate);
  const last = input.lastActivityAt
    ? (typeof (input.lastActivityAt as any)?.toDate === 'function'
        ? (input.lastActivityAt as any).toDate()
        : new Date(input.lastActivityAt as any))
    : null;
  const inactiveDays = last ? Math.floor((Date.now() - last.getTime()) / 86400000) : 0;

  if (skipped >= 4 || complaints >= 1 || inactiveDays >= 10 || (daysLeft !== null && daysLeft <= 7 && daysLeft >= 0)) {
    return daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 ? 'expiring' : 'at_risk';
  }
  if (status === 'active' || status === 'paused') return 'healthy';
  return 'at_risk';
}

/** Heuristic 0-100 score for admin CRM. Not a medical or credit score. */
export function computeRenewalProbability(input: {
  status?: string;
  skippedMealsCount?: number;
  mealsCompleted?: number;
  totalMeals?: number;
  endDate?: unknown;
}): number {
  const status = resolveSubscriptionStatus(input);
  if (status === 'cancelled' || status === 'expired' || status === 'payment_failed') return 8;
  let score = 72;
  if (status === 'paused') score -= 12;
  if (status === 'expiring') score -= 8;
  score -= Math.min(30, Number(input.skippedMealsCount || 0) * 4);
  const total = Number(input.totalMeals || 0);
  const done = Number(input.mealsCompleted || 0);
  if (total > 0 && done / total > 0.5) score += 10;
  return Math.max(5, Math.min(95, Math.round(score)));
}
