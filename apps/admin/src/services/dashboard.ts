import { collection, onSnapshot, query, where, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { DateRange, inRange, previousRange } from "../lib/dates";
import { fetchOpsSnapshot } from "../lib/ops-snapshot";
import {
  buildCrmProfile,
  isFailedPayment,
  isPaidPayment,
  normalizeSubStatus,
  orderAmount,
  paymentAmount,
} from "../lib/crm-engine";
import { normalizeOrderStatus } from "../lib/order-status";

export function isPermissionDenied(err: unknown): boolean {
  const e = err as { code?: string; message?: string };
  const msg = String(e?.message || err || "");
  return e?.code === "permission-denied" || msg.includes("Missing or insufficient permissions");
}

export interface AttentionItem {
  id: string;
  severity: "red" | "orange" | "yellow" | "green";
  title: string;
  detail: string;
  href: string;
}

export interface DashboardMetrics {
  todaysOrders: number;
  todaysRevenue: number;
  activeSubscribers: number;
  pendingOrders: number;
  kitchenQueue: number;
  liveDeliveries: number;
  newCustomers: number;
  lowStockAlerts: number;
  monthlyRevenue: number;
  totalCustomers: number;
  supportTickets: number;
  renewalsDue: number;
  failedPayments: number;
  atRiskCustomers: number;
  pendingDeliveries: number;
  openComplaints: number;
  trendOrders: string | null;
  trendRevenue: string | null;
  truncated: boolean;
  planDistribution: { name: string; value: number; color: string }[];
  recentActivity: any[];
  revenueData: { name: string; total: number; subs: number }[];
  ordersData: { name: string; orders: number }[];
  customerGrowth: { name: string; total: number }[];
  orderStatusDistribution: { name: string; value: number; color: string }[];
  attention: AttentionItem[];
  ops: {
    kitchenQueue: number;
    preparing: number;
    packed: number;
    outForDelivery: number;
    delivered: number;
    cancelled: number;
  };
}

function trendLabel(current: number, previous: number): string | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return current > 0 ? "+100%" : null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return "0%";
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

function moneyOf(record: Record<string, any>): number {
  return orderAmount(record) || paymentAmount(record);
}

export async function loadDashboardMetrics(range: DateRange): Promise<DashboardMetrics> {
  const snap = await fetchOpsSnapshot();
  const prev = previousRange(range);

  const ordersIn = snap.orders.filter((o) => inRange(o.createdAt || o.deliveryDate, range));
  const ordersPrev = snap.orders.filter((o) => inRange(o.createdAt || o.deliveryDate, prev));
  const paymentsIn = snap.payments.filter((p) => inRange(p.createdAt || p.timestamp, range));
  const paymentsPrev = snap.payments.filter((p) => inRange(p.createdAt || p.timestamp, prev));
  const newCustomers = snap.customers.filter((c) => inRange(c.createdAt, range)).length;

  const revenue = paymentsIn.filter(isPaidPayment).reduce((s, p) => s + paymentAmount(p), 0)
    || ordersIn.reduce((s, o) => s + moneyOf(o), 0);
  const revenuePrev = paymentsPrev.filter(isPaidPayment).reduce((s, p) => s + paymentAmount(p), 0)
    || ordersPrev.reduce((s, o) => s + moneyOf(o), 0);

  const statuses = {
    Pending: 0,
    Preparing: 0,
    Packed: 0,
    Delivered: 0,
    Cancelled: 0,
    Out: 0,
  };
  for (const order of snap.orders) {
    const st = normalizeOrderStatus(order.orderStatus || order.status);
    if (st === "Pending" || st === "Confirmed") statuses.Pending++;
    else if (st === "Preparing") statuses.Preparing++;
    else if (st === "Packed" || st === "Ready") statuses.Packed++;
    else if (st === "Out for Delivery") statuses.Out++;
    else if (st === "Delivered") statuses.Delivered++;
    else if (st === "Cancelled") statuses.Cancelled++;
  }

  const profiles = snap.customers.map((customer) =>
    buildCrmProfile({
      customer,
      subscriptions: snap.subscriptions,
      orders: snap.orders,
      payments: snap.payments,
      tickets: snap.tickets,
      complaints: snap.complaints,
    })
  );

  const activeSubscribers = snap.subscriptions.filter((s) => {
    const st = normalizeSubStatus(s);
    return st === "active" || st === "expiring" || st === "paused";
  }).length;

  const renewalsDue = profiles.filter((p) => p.subscriptionStatus === "expiring" || p.segment === "Renewal Due").length;
  const atRiskCustomers = profiles.filter((p) => p.risk.riskLevel === "HIGH").length;
  const failedPayments = snap.payments.filter(isFailedPayment).length;
  const openTickets = snap.tickets.filter((t) => {
    const s = String(t.status || "").toLowerCase();
    return s !== "resolved" && s !== "closed";
  }).length;
  const openComplaints = snap.complaints.filter((c) => {
    const s = String(c.status || "").toLowerCase();
    return s !== "resolved" && s !== "closed";
  }).length;

  const pendingDeliveries = snap.deliveries.filter((d) => {
    const s = String(d.status || d.deliveryStatus || "").toLowerCase();
    return s && !["delivered", "completed", "cancelled"].includes(s);
  }).length || statuses.Out + statuses.Packed + statuses.Preparing;

  const attention: AttentionItem[] = [];
  for (const p of profiles) {
    if (p.subscriptionStatus === "payment_failed" || p.segment === "Payment Failed") {
      attention.push({
        id: `payfail-${p.customerId}`,
        severity: "red",
        title: "Payment failed",
        detail: `${p.customerId} · ${p.planName}`,
        href: `/crm/customers/${p.customerId}`,
      });
    }
    if (p.subscriptionStatus === "expiring") {
      attention.push({
        id: `exp-${p.customerId}`,
        severity: "orange",
        title: "Subscription expires soon",
        detail: p.planName,
        href: `/crm/renewals`,
      });
    }
    if (p.risk.riskLevel === "HIGH" && p.subscriptionStatus !== "payment_failed") {
      attention.push({
        id: `risk-${p.customerId}`,
        severity: "orange",
        title: "At-risk customer",
        detail: p.risk.riskReasons[0] || "High risk score",
        href: `/crm/customers/${p.customerId}`,
      });
    }
  }
  for (const ticket of snap.tickets) {
    const s = String(ticket.status || "").toLowerCase();
    if (s !== "resolved" && s !== "closed") {
      attention.push({
        id: `tkt-${ticket.id}`,
        severity: String(ticket.priority || "").toLowerCase() === "urgent" || String(ticket.priority || "").toLowerCase() === "high" ? "red" : "orange",
        title: "Unresolved support",
        detail: ticket.subject || ticket.message || ticket.id,
        href: `/support`,
      });
    }
  }
  for (const c of snap.complaints) {
    const s = String(c.status || "").toLowerCase();
    if (s !== "resolved" && s !== "closed") {
      attention.push({
        id: `cmp-${c.id}`,
        severity: "red",
        title: "Unresolved complaint",
        detail: c.issue || c.category || c.id,
        href: `/complaints`,
      });
    }
  }
  for (const d of snap.deliveries.slice(0, 20)) {
    const s = String(d.status || "").toLowerCase();
    if (["failed", "delayed", "issue"].some((x) => s.includes(x))) {
      attention.push({
        id: `del-${d.id}`,
        severity: "yellow",
        title: "Delivery issue",
        detail: d.customerName || d.id,
        href: `/delivery`,
      });
    }
  }
  for (const p of profiles.filter((x) => x.segment === "Inactive").slice(0, 8)) {
    attention.push({
      id: `ina-${p.customerId}`,
      severity: "yellow",
      title: "Customer inactive",
      detail: p.planName,
      href: `/crm/customers/${p.customerId}`,
    });
  }

  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
  const planCount: Record<string, number> = {};
  for (const sub of snap.subscriptions) {
    if (normalizeSubStatus(sub) === "active" || normalizeSubStatus(sub) === "expiring") {
      const name = sub.planSnapshot?.planName || sub.planName || sub.planId || "Plan";
      planCount[name] = (planCount[name] || 0) + 1;
    }
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const revenueData = dayNames.map((name) => ({ name, total: 0, subs: 0 }));
  for (const p of paymentsIn.filter(isPaidPayment)) {
    const d = new Date(p.createdAt || p.timestamp);
    if (!Number.isNaN(d.getTime())) revenueData[d.getDay()].total += paymentAmount(p);
  }
  for (const o of ordersIn) {
    const d = new Date(o.createdAt || o.deliveryDate);
    if (!Number.isNaN(d.getTime())) revenueData[d.getDay()].subs += 1;
  }

  return {
    todaysOrders: ordersIn.length,
    todaysRevenue: revenue,
    activeSubscribers,
    pendingOrders: statuses.Pending,
    kitchenQueue: statuses.Preparing,
    liveDeliveries: statuses.Out,
    newCustomers,
    lowStockAlerts: 0,
    monthlyRevenue: revenue,
    totalCustomers: snap.customers.length,
    supportTickets: openTickets,
    renewalsDue,
    failedPayments,
    atRiskCustomers,
    pendingDeliveries,
    openComplaints,
    trendOrders: trendLabel(ordersIn.length, ordersPrev.length),
    trendRevenue: trendLabel(revenue, revenuePrev),
    truncated: snap.truncated,
    planDistribution: Object.keys(planCount).map((name, idx) => ({
      name,
      value: planCount[name],
      color: colors[idx % colors.length],
    })),
    recentActivity: [],
    revenueData,
    ordersData: revenueData.map((d) => ({ name: d.name, orders: d.subs })),
    customerGrowth: [],
    orderStatusDistribution: [
      { name: "Pending", value: statuses.Pending, color: "#f59e0b" },
      { name: "Preparing", value: statuses.Preparing, color: "#3b82f6" },
      { name: "Packed/Out", value: statuses.Packed + statuses.Out, color: "#8b5cf6" },
      { name: "Delivered", value: statuses.Delivered, color: "#10b981" },
    ],
    attention: attention.slice(0, 24),
    ops: {
      kitchenQueue: statuses.Preparing,
      preparing: statuses.Preparing,
      packed: statuses.Packed,
      outForDelivery: statuses.Out,
      delivered: statuses.Delivered,
      cancelled: statuses.Cancelled,
    },
  };
}

export const dashboardService = {
  subscribeToMetrics(callback: (metrics: DashboardMetrics) => void, onError?: (error: Error) => void) {
    let stopped = false;
    const run = () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      loadDashboardMetrics({ preset: "today", start, end })
        .then((m) => {
          if (!stopped) callback(m);
        })
        .catch((err) => {
          if (onError && err instanceof Error) onError(err);
        });
    };
    run();
    const unsubs: Array<() => void> = [];
    const quiet = (err: Error) => {
      if (isPermissionDenied(err)) onError?.(err);
    };
    try {
      unsubs.push(
        onSnapshot(
          query(collection(db, "orders"), where("status", "in", ["Pending", "Preparing", "Packed", "Out for Delivery"]), limit(80)),
          () => run(),
          quiet
        )
      );
    } catch {
      /* composite index may be missing — KPIs still load on an interval */
    }
    try {
      unsubs.push(
        onSnapshot(query(collection(db, "supportTickets"), limit(40)), () => run(), quiet)
      );
    } catch {
      /* optional live path */
    }
    const interval = setInterval(run, 60_000);
    return () => {
      stopped = true;
      clearInterval(interval);
      unsubs.forEach((u) => u());
    };
  },
};
