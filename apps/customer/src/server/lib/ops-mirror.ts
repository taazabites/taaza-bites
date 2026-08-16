import { Firestore, getFirestore } from "firebase-admin/firestore";
import app from "../../firebase/firebase-admin.ts";

export const ADMIN_FIRESTORE_DB_ID = "ai-studio-taazabitesadmint-f2702470-dbd9-4fd8-8d80-708eb0bdb4c2";

let opsDb: Firestore | null | undefined;

export function getOpsDb(): Firestore | null {
  if (opsDb !== undefined) return opsDb;
  try {
    opsDb = getFirestore(app, ADMIN_FIRESTORE_DB_ID);
  } catch (error) {
    console.warn("[ops-mirror] Admin Firestore unavailable:", (error as Error)?.message || error);
    opsDb = null;
  }
  return opsDb;
}

export type OpsCheckoutMirror = {
  userId: string;
  orderNumber: string;
  subscriptionId: string;
  planId?: string;
  planName: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: Record<string, unknown> | null;
  durationDays?: number;
  mealsRemaining?: number;
  nextDeliveryDate?: string;
  paymentId?: string;
  deliveryId?: string;
  coupon?: string;
};

/** Copy a live checkout onto the admin CRM database so ops sees the same sale. */
export async function mirrorCheckoutToOps(payload: OpsCheckoutMirror): Promise<void> {
  const db = getOpsDb();
  if (!db) return;

  const now = new Date().toISOString();
  const customerId = payload.userId;
  const batch = db.batch();

  batch.set(
    db.collection("customers").doc(customerId),
    {
      id: customerId,
      customerId,
      userId: customerId,
      name: payload.customerName || "Customer",
      email: payload.customerEmail || "",
      phone: payload.customerPhone || "",
      status: "Active",
      hasActiveSubscription: true,
      currentPlanId: payload.planId || "",
      currentSubscriptionId: payload.subscriptionId,
      mealsRemaining: payload.mealsRemaining ?? 0,
      nextDeliveryDate: payload.nextDeliveryDate || "",
      source: "customer_checkout",
      updatedAt: now,
      createdAt: now,
    },
    { merge: true }
  );

  batch.set(
    db.collection("subscriptions").doc(payload.subscriptionId),
    {
      id: payload.subscriptionId,
      customerId,
      userId: customerId,
      customerName: payload.customerName || "Customer",
      customerPhone: payload.customerPhone || "",
      planId: payload.planId || "",
      planName: payload.planName,
      status: "active",
      paused: false,
      mealsRemaining: payload.mealsRemaining ?? 0,
      remainingMeals: payload.mealsRemaining ?? 0,
      durationDays: payload.durationDays || 30,
      nextDeliveryDate: payload.nextDeliveryDate || "",
      paymentId: payload.paymentId || "",
      syncedFromCustomerDb: true,
      updatedAt: now,
      createdAt: now,
    },
    { merge: true }
  );

  batch.set(
    db.collection("orders").doc(payload.orderNumber),
    {
      id: payload.orderNumber,
      orderId: payload.orderNumber,
      orderNumber: payload.orderNumber,
      customerId,
      userId: customerId,
      customerName: payload.customerName || "Customer",
      customerPhone: payload.customerPhone || "",
      subscriptionId: payload.subscriptionId,
      planName: payload.planName,
      amount: payload.amount,
      paymentStatus: "Paid",
      orderStatus: "Confirmed",
      coupon: payload.coupon || "",
      deliveryAddress: payload.address || "",
      syncedFromCustomerDb: true,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  if (payload.paymentId) {
    batch.set(
      db.collection("payments").doc(payload.paymentId),
      {
        id: payload.paymentId,
        paymentId: payload.paymentId,
        customerId,
        userId: customerId,
        customerName: payload.customerName || "Customer",
        amount: payload.amount,
        netAmount: payload.amount,
        status: "Success",
        razorpayPaymentId: payload.paymentId,
        orderId: payload.orderNumber,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  const deliveryId = payload.deliveryId || `del_${payload.subscriptionId}_${payload.nextDeliveryDate || "next"}`;
  if (payload.nextDeliveryDate) {
    batch.set(
      db.collection("deliveries").doc(deliveryId),
      {
        id: deliveryId,
        orderId: payload.orderNumber,
        customerId,
        userId: customerId,
        customerName: payload.customerName || "Customer",
        status: "Pending",
        opStatus: "ASSIGNED",
        deliveryDate: payload.nextDeliveryDate,
        date: payload.nextDeliveryDate,
        syncedFromCustomerDb: true,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  try {
    await batch.commit();
  } catch (error) {
    console.error("[ops-mirror] Failed to copy checkout into admin DB:", (error as Error)?.message || error);
  }
}