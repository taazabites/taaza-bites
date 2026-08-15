import { daysSince, daysUntil, toDate } from "./dates";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type CrmSegment =
  | "New Lead"
  | "New Customer"
  | "Active Customer"
  | "Highly Engaged"
  | "VIP"
  | "Renewal Due"
  | "At Risk"
  | "Inactive"
  | "Churned"
  | "Payment Failed";

export interface RiskResult {
  riskLevel: RiskLevel;
  riskScore: number;
  riskReasons: string[];
  calculatedAt: string;
}

export interface CrmProfile {
  customerId: string;
  segment: CrmSegment;
  segments: CrmSegment[];
  risk: RiskResult;
  planName: string;
  subscriptionStatus: string;
  startDate?: unknown;
  endDate?: unknown;
  mealsRemaining: number;
  mealsCompleted: number;
  lastOrderAt?: Date | null;
  lastActivityAt?: Date | null;
  totalSpent: number;
}

function lower(value: unknown): string {
  return String(value || "").toLowerCase();
}

export function customerDisplayName(customer: Record<string, any> | null | undefined): string {
  if (!customer) return "Unknown customer";
  const joined = [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim();
  return joined || customer.name || customer.phone || customer.email || "Unknown customer";
}

export function normalizeSubStatus(sub: Record<string, any> | null | undefined): string {
  if (!sub) return "none";
  const raw = lower(sub.status);
  const days = daysUntil(sub.endDate);
  if (raw === "cancelled" || raw === "canceled") return "cancelled";
  if (raw === "payment_failed" || raw === "payment failed") return "payment_failed";
  if (raw === "paused" || raw === "frozen") return "paused";
  if (raw === "pending" || raw === "draft") return "pending";
  if (days !== null && days < 0) return "expired";
  if ((raw === "active" || raw === "") && days !== null && days <= 7) return "expiring";
  if (raw === "expired") return "expired";
  if (raw === "active" || raw === "") return "active";
  return raw || "active";
}

export function orderAmount(order: Record<string, any>): number {
  return Number(order.total || order.amount || order.netAmount || order.grandTotal || 0) || 0;
}

export function paymentAmount(payment: Record<string, any>): number {
  return Number(payment.netAmount || payment.amount || payment.total || 0) || 0;
}

export function isPaidPayment(payment: Record<string, any>): boolean {
  const s = lower(payment.status);
  return s === "success" || s === "paid" || s === "captured" || s === "completed";
}

export function isFailedPayment(payment: Record<string, any>): boolean {
  const s = lower(payment.status);
  return s === "failed" || s === "failure";
}

export function latestDate(values: unknown[]): Date | null {
  let latest: Date | null = null;
  for (const value of values) {
    const d = toDate(value);
    if (d && (!latest || d.getTime() > latest.getTime())) latest = d;
  }
  return latest;
}

export function computeRisk(input: {
  subscription?: Record<string, any> | null;
  orders?: Record<string, any>[];
  payments?: Record<string, any>[];
  tickets?: Record<string, any>[];
  complaints?: Record<string, any>[];
  lastActivityAt?: unknown;
}): RiskResult {
  const reasons: string[] = [];
  let score = 12;
  const sub = input.subscription || null;
  const status = normalizeSubStatus(sub);
  const daysLeft = sub ? daysUntil(sub.endDate) : null;
  const skipped = Number(sub?.skippedMealsCount || sub?.skippedMeals || 0) || 0;
  const remaining = Number(sub?.mealsRemaining ?? sub?.remainingMeals ?? 0) || 0;
  const totalMeals = Number(sub?.totalMeals || sub?.planSnapshot?.totalMeals || 0) || 0;
  const completed = Number(sub?.mealsCompleted || 0) || 0;
  const usage = totalMeals > 0 ? completed / totalMeals : remaining > 0 ? 0.5 : 0;
  const failedPayments = (input.payments || []).filter(isFailedPayment).length;
  const openComplaints = (input.complaints || []).filter((c) => {
    const s = lower(c.status);
    return s !== "resolved" && s !== "closed";
  }).length;
  const openTickets = (input.tickets || []).filter((t) => {
    const s = lower(t.status);
    return s !== "resolved" && s !== "closed";
  }).length;
  const inactiveDays = daysSince(input.lastActivityAt) ?? 0;
  const previouslyCancelled = lower(sub?.previousStatus) === "cancelled" || Boolean(sub?.hadCancellation);

  if (status === "payment_failed" || failedPayments > 0) {
    score += 34;
    reasons.push(failedPayments > 0 ? `${failedPayments} failed payment(s)` : "Subscription payment failed");
  }
  if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 3) {
    score += 22;
    reasons.push(daysLeft === 0 ? "Subscription expires today" : `Subscription expires in ${daysLeft} day(s)`);
  } else if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 7) {
    score += 14;
    reasons.push("Subscription expiring within 7 days");
  }
  if (skipped >= 2) {
    score += Math.min(24, skipped * 6);
    reasons.push(`${skipped} skipped meals`);
  }
  if (openComplaints > 0 || openTickets > 0) {
    score += 16;
    reasons.push(openComplaints > 0 ? `${openComplaints} open complaint(s)` : `${openTickets} open ticket(s)`);
  }
  if (inactiveDays >= 14) {
    score += 20;
    reasons.push(`Inactive for ${inactiveDays} days`);
  } else if (inactiveDays >= 7) {
    score += 10;
    reasons.push(`Low activity (${inactiveDays} days)`);
  }
  if (status === "active" && totalMeals > 0 && usage < 0.25) {
    score += 12;
    reasons.push("Low meal usage");
  }
  if (status === "cancelled" || previouslyCancelled) {
    score += 18;
    reasons.push("Previous or current cancellation");
  }
  if (status === "expired") {
    score += 16;
    reasons.push("Subscription expired");
  }

  if (status === "active" && failedPayments === 0 && inactiveDays < 5 && skipped < 2 && openComplaints === 0) {
    score = Math.min(score, 28);
    if (reasons.length === 0) reasons.push("Regular activity with an active subscription");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const riskLevel: RiskLevel = score >= 60 ? "HIGH" : score >= 35 ? "MEDIUM" : "LOW";
  return {
    riskLevel,
    riskScore: score,
    riskReasons: reasons.slice(0, 6),
    calculatedAt: new Date().toISOString(),
  };
}

export function computeSegments(input: {
  customer: Record<string, any>;
  subscription?: Record<string, any> | null;
  orders?: Record<string, any>[];
  payments?: Record<string, any>[];
  risk: RiskResult;
  lastActivityAt?: Date | null;
}): CrmSegment[] {
  const segments: CrmSegment[] = [];
  const customer = input.customer;
  const sub = input.subscription || null;
  const status = normalizeSubStatus(sub);
  const ageDays = daysSince(customer.createdAt) ?? 0;
  const accountAge = ageDays;
  const spent = (input.payments || []).filter(isPaidPayment).reduce((s, p) => s + paymentAmount(p), 0);
  const points = Number(customer.rewardPoints || customer.points || 0) || 0;
  const inactiveDays = daysSince(input.lastActivityAt) ?? accountAge;
  const totalMeals = Number(sub?.totalMeals || sub?.planSnapshot?.totalMeals || 0) || 0;
  const completed = Number(sub?.mealsCompleted || 0) || 0;
  const usage = totalMeals > 0 ? completed / totalMeals : 0;
  const failed = (input.payments || []).some(isFailedPayment) || status === "payment_failed";

  if (!sub) {
    if (accountAge <= 14) segments.push("New Lead");
    else segments.push("Inactive");
  }
  if (sub && accountAge <= 14 && (status === "active" || status === "pending" || status === "expiring")) {
    segments.push("New Customer");
  }
  if (status === "payment_failed" || failed) segments.push("Payment Failed");
  if (status === "cancelled" || status === "expired") segments.push("Churned");
  if (status === "expiring") segments.push("Renewal Due");
  if (input.risk.riskLevel === "HIGH" && status !== "cancelled") segments.push("At Risk");
  if (inactiveDays >= 14 && status !== "active") segments.push("Inactive");
  if ((spent >= 15000 || points >= 150) && (status === "active" || status === "expiring" || status === "paused")) {
    segments.push("VIP");
  }
  if (status === "active" && usage >= 0.45 && inactiveDays < 5) segments.push("Highly Engaged");
  if (status === "active" || status === "paused") segments.push("Active Customer");

  const unique = Array.from(new Set(segments));
  return unique.length > 0 ? unique : ["New Lead"];
}

const SEGMENT_PRIORITY: CrmSegment[] = [
  "Payment Failed",
  "Churned",
  "At Risk",
  "Renewal Due",
  "Inactive",
  "VIP",
  "Highly Engaged",
  "Active Customer",
  "New Customer",
  "New Lead",
];

export function primarySegment(segments: CrmSegment[]): CrmSegment {
  return SEGMENT_PRIORITY.find((s) => segments.includes(s)) || segments[0] || "New Lead";
}

export function buildCrmProfile(input: {
  customer: Record<string, any>;
  subscriptions: Record<string, any>[];
  orders: Record<string, any>[];
  payments: Record<string, any>[];
  tickets?: Record<string, any>[];
  complaints?: Record<string, any>[];
}): CrmProfile {
  const customerId = input.customer.id;
  const subs = input.subscriptions.filter((s) => s.customerId === customerId);
  const current =
    subs.find((s) => ["active", "expiring", "paused", "pending", "payment_failed"].includes(normalizeSubStatus(s))) ||
    subs[0] ||
    null;
  const orders = input.orders.filter((o) => o.customerId === customerId);
  const payments = input.payments.filter((p) => p.customerId === customerId);
  const tickets = (input.tickets || []).filter((t) => t.customerId === customerId);
  const complaints = (input.complaints || []).filter((c) => c.customerId === customerId);
  const lastOrderAt = latestDate(orders.map((o) => o.createdAt || o.deliveryDate || o.updatedAt));
  const lastActivityAt = latestDate([
    input.customer.lastActivityAt,
    input.customer.updatedAt,
    current?.updatedAt,
    lastOrderAt,
    ...tickets.map((t) => t.updatedAt || t.createdAt),
  ]);
  const risk = computeRisk({
    subscription: current,
    orders,
    payments,
    tickets,
    complaints,
    lastActivityAt,
  });
  const segments = computeSegments({
    customer: input.customer,
    subscription: current,
    orders,
    payments,
    risk,
    lastActivityAt,
  });
  const totalSpent = payments.filter(isPaidPayment).reduce((s, p) => s + paymentAmount(p), 0);
  return {
    customerId,
    segment: primarySegment(segments),
    segments,
    risk,
    planName: current?.planSnapshot?.planName || current?.planName || current?.planId || "—",
    subscriptionStatus: normalizeSubStatus(current),
    startDate: current?.startDate,
    endDate: current?.endDate,
    mealsRemaining: Number(current?.mealsRemaining ?? current?.remainingMeals ?? 0) || 0,
    mealsCompleted: Number(current?.mealsCompleted ?? 0) || 0,
    lastOrderAt,
    lastActivityAt,
    totalSpent,
  };
}

export function recommendedRenewalAction(profile: CrmProfile): string {
  if (profile.risk.riskLevel === "HIGH") return "Call today. Confirm payment and offer a one-time renewal coupon after consent.";
  if (profile.subscriptionStatus === "expiring") return "Send an approved renewal reminder and offer plan continuation.";
  if (profile.subscriptionStatus === "expired" || profile.subscriptionStatus === "cancelled") {
    return "Win-back: view profile, then offer renewal with an approved coupon.";
  }
  return "Review activity and contact if the customer asks for help.";
}
