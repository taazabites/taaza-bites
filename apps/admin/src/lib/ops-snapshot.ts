import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../lib/firebase";

/** Cap historical dashboard/CRM scans. Do not pull thousands of docs on the client. */
export const OPS_READ_CAP = 400;

export interface OpsSnapshot {
  customers: Record<string, any>[];
  subscriptions: Record<string, any>[];
  orders: Record<string, any>[];
  payments: Record<string, any>[];
  tickets: Record<string, any>[];
  complaints: Record<string, any>[];
  deliveries: Record<string, any>[];
  events: Record<string, any>[];
  referrals: Record<string, any>[];
  coupons: Record<string, any>[];
  truncated: boolean;
}

async function fetchCol(name: string, cap = OPS_READ_CAP): Promise<Record<string, any>[]> {
  const run = async (constraints: QueryConstraint[]) => {
    const snap = await getDocs(query(collection(db, name), ...constraints));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  };
  try {
    return await run([orderBy("createdAt", "desc"), limit(cap)]);
  } catch {
    try {
      return await run([limit(cap)]);
    } catch (error) {
      console.warn(`[ops-snapshot] ${name} skipped:`, error);
      return [];
    }
  }
}

let cache: { at: number; data: OpsSnapshot } | null = null;
const TTL_MS = 20_000;

export async function fetchOpsSnapshot(force = false): Promise<OpsSnapshot> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) return cache.data;
  const [
    customers,
    subscriptions,
    orders,
    payments,
    tickets,
    complaints,
    deliveries,
    events,
    referrals,
    coupons,
  ] = await Promise.all([
    fetchCol("customers"),
    fetchCol("subscriptions"),
    fetchCol("orders"),
    fetchCol("payments"),
    fetchCol("supportTickets"),
    fetchCol("complaints"),
    fetchCol("deliveries"),
    fetchCol("subscriptionEvents"),
    fetchCol("referrals"),
    fetchCol("coupons"),
  ]);
  const data: OpsSnapshot = {
    customers,
    subscriptions,
    orders,
    payments,
    tickets,
    complaints,
    deliveries,
    events,
    referrals,
    coupons,
    truncated:
      customers.length >= OPS_READ_CAP ||
      subscriptions.length >= OPS_READ_CAP ||
      orders.length >= OPS_READ_CAP,
  };
  cache = { at: Date.now(), data };
  return data;
}

export function invalidateOpsSnapshot() {
  cache = null;
}
