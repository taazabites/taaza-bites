import { createHash, randomInt, timingSafeEqual } from "crypto";
import { FieldValue, Firestore } from "firebase-admin/firestore";
import { FIRESTORE_DB_IDS, getNamedDb } from "./firebase-admin";

export const STATUS = {
  ASSIGNED: "ASSIGNED",
  ACCEPTED: "ACCEPTED",
  PICKED_UP: "PICKED_UP",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  ARRIVED: "ARRIVED",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  RETURN_TO_KITCHEN: "RETURN_TO_KITCHEN",
} as const;

export type DeliveryOpStatus = (typeof STATUS)[keyof typeof STATUS];

export const PARTNER_STATUS = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  ON_DELIVERY: "ON_DELIVERY",
  SUSPENDED: "SUSPENDED",
} as const;

export type PartnerLiveStatus = (typeof PARTNER_STATUS)[keyof typeof PARTNER_STATUS];

const ALLOWED: Record<string, DeliveryOpStatus[]> = {
  ASSIGNED: [STATUS.ACCEPTED, STATUS.FAILED, STATUS.CANCELLED, STATUS.RETURN_TO_KITCHEN],
  ACCEPTED: [STATUS.PICKED_UP, STATUS.FAILED, STATUS.CANCELLED, STATUS.RETURN_TO_KITCHEN],
  PICKED_UP: [STATUS.OUT_FOR_DELIVERY, STATUS.FAILED, STATUS.RETURN_TO_KITCHEN],
  OUT_FOR_DELIVERY: [STATUS.ARRIVED, STATUS.FAILED, STATUS.RETURN_TO_KITCHEN],
  ARRIVED: [STATUS.FAILED, STATUS.RETURN_TO_KITCHEN],
  DELIVERED: [],
  FAILED: [],
  CANCELLED: [],
  RETURN_TO_KITCHEN: [],
};

const TIMESTAMP_FIELD: Partial<Record<DeliveryOpStatus, string>> = {
  ASSIGNED: "assignedAt",
  ACCEPTED: "acceptedAt",
  PICKED_UP: "pickedUpAt",
  OUT_FOR_DELIVERY: "outForDeliveryAt",
  ARRIVED: "arrivedAt",
  DELIVERED: "deliveredAt",
  FAILED: "failedAt",
  CANCELLED: "cancelledAt",
  RETURN_TO_KITCHEN: "returnedAt",
};

export const ISSUE_REASONS = [
  "Customer unavailable",
  "Wrong address",
  "Customer requested reschedule",
  "Phone unreachable",
  "Refused delivery",
  "Vehicle issue",
  "Kitchen delay",
  "Other",
] as const;

export function normalizeOpStatus(raw: unknown): DeliveryOpStatus {
  const s = String(raw || "ASSIGNED")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
  if (s === "PICKEDUP" || s === "PICKED_UP") return STATUS.PICKED_UP;
  if (s === "OUTFORDELIVERY" || s === "OUT_FOR_DELIVERY") return STATUS.OUT_FOR_DELIVERY;
  if (s === "RETURNED" || s === "RETURN_TO_KITCHEN") return STATUS.RETURN_TO_KITCHEN;
  if (s === "PENDING") return STATUS.ASSIGNED;
  if ((Object.values(STATUS) as string[]).includes(s)) return s as DeliveryOpStatus;
  return STATUS.ASSIGNED;
}

export function toAdminStatusLabel(status: DeliveryOpStatus): string {
  switch (status) {
    case STATUS.ASSIGNED:
    case STATUS.ACCEPTED:
      return "Assigned";
    case STATUS.PICKED_UP:
      return "Picked Up";
    case STATUS.OUT_FOR_DELIVERY:
    case STATUS.ARRIVED:
      return "Out For Delivery";
    case STATUS.DELIVERED:
      return "Delivered";
    case STATUS.FAILED:
      return "Failed";
    case STATUS.CANCELLED:
      return "Cancelled";
    case STATUS.RETURN_TO_KITCHEN:
      return "Returned";
    default:
      return "Assigned";
  }
}

export function toCustomerMealStatus(status: DeliveryOpStatus): string {
  switch (status) {
    case STATUS.PICKED_UP:
      return "Ready";
    case STATUS.OUT_FOR_DELIVERY:
    case STATUS.ARRIVED:
      return "Out for Delivery";
    case STATUS.DELIVERED:
      return "Delivered";
    case STATUS.FAILED:
    case STATUS.CANCELLED:
    case STATUS.RETURN_TO_KITCHEN:
      return "Preparing";
    default:
      return "Preparing";
  }
}

export function toCustomerTrackerStatus(status: DeliveryOpStatus): string {
  switch (status) {
    case STATUS.PICKED_UP:
      return "packed";
    case STATUS.OUT_FOR_DELIVERY:
    case STATUS.ARRIVED:
      return "Out for Delivery";
    case STATUS.DELIVERED:
      return "Delivered";
    default:
      return "preparing";
  }
}

export function canTransition(from: DeliveryOpStatus, to: DeliveryOpStatus): boolean {
  if (from === to) return true;
  return (ALLOWED[from] || []).includes(to);
}

export function dbs() {
  return {
    delivery: getNamedDb(FIRESTORE_DB_IDS.delivery),
    admin: getNamedDb(FIRESTORE_DB_IDS.admin),
    customer: getNamedDb(FIRESTORE_DB_IDS.customer),
  };
}

function otpPepper() {
  return process.env.DELIVERY_OTP_PEPPER || process.env.FIREBASE_PROJECT_ID || "taaza-bites";
}

export function hashDeliveryOtp(deliveryId: string, otp: string): string {
  return createHash("sha256").update(`${deliveryId}:${otp}:${otpPepper()}`).digest("hex");
}

export function generateDeliveryOtp(): string {
  return String(randomInt(1000, 10000));
}

function hashesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function loadPartner(deliveryDb: Firestore, uid: string) {
  const snap = await deliveryDb.collection("deliveryPartners").doc(uid).get();
  return snap.exists ? { id: snap.id, ...(snap.data() as Record<string, unknown>) } : null;
}

export function partnerIsSuspended(partner: Record<string, unknown> | null): boolean {
  if (!partner) return true;
  const status = String(partner.currentStatus || partner.status || "").toUpperCase();
  return (
    partner.active === false ||
    partner.isBlocked === true ||
    status === "SUSPENDED" ||
    status === "BLOCKED" ||
    status === "INACTIVE" ||
    status === "DEACTIVATED"
  );
}

async function loadSettings(deliveryDb: Firestore) {
  const snap = await deliveryDb.collection("deliverySettings").doc("config").get();
  const data = snap.data() || {};
  const method = String(data.verificationMethod || "OTP").toUpperCase();
  return {
    verificationMethod: method === "PHOTO" || method === "CONFIRMATION" ? method : "OTP",
    requirePhoto: Boolean(data.requirePhoto),
    otpEnabled: data.otpEnabled !== false && method === "OTP",
    defaultBaseAmount: Number(data.defaultBaseAmount) > 0 ? Number(data.defaultBaseAmount) : 50,
  };
}

async function writeEvent(
  deliveryDb: Firestore,
  eventId: string,
  payload: Record<string, unknown>
): Promise<{ created: boolean }> {
  const ref = deliveryDb.collection("deliveryEvents").doc(eventId);
  const existing = await ref.get();
  if (existing.exists) return { created: false };
  await ref.set({
    ...payload,
    eventId,
    createdAt: Date.now(),
    serverCreatedAt: FieldValue.serverTimestamp(),
  });
  return { created: true };
}

async function notifyPartner(
  deliveryDb: Firestore,
  partnerId: string,
  type: string,
  title: string,
  body: string,
  deliveryId?: string,
  dedupeKey?: string
) {
  const id = dedupeKey || `${type}_${deliveryId || "ops"}_${Date.now()}`;
  const ref = deliveryDb.collection("partnerNotifications").doc(id);
  const existing = await ref.get();
  if (existing.exists) return;
  await ref.set({
    partnerId,
    type,
    title,
    body,
    deliveryId: deliveryId || null,
    read: false,
    createdAt: Date.now(),
  });
}

function stripSecrets(patch: Record<string, unknown>) {
  const clean = { ...patch };
  delete clean.deliveryOtp;
  delete clean.otp;
  delete clean.otpHash;
  return clean;
}

async function mirrorAdminDelivery(
  adminDb: Firestore | null,
  deliveryId: string,
  patch: Record<string, unknown>
) {
  if (!adminDb) return;
  await adminDb.collection("deliveries").doc(deliveryId).set(
    {
      ...stripSecrets(patch),
      otpIssued: Boolean(patch.otpIssued),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

async function mirrorCustomerDelivery(
  customerDb: Firestore | null,
  deliveryId: string,
  patch: Record<string, unknown>
) {
  if (!customerDb) return;
  const opStatus = normalizeOpStatus(patch.opStatus || patch.status);
  const userId = String(patch.userId || patch.customerId || "");
  const date = String(patch.deliveryDate || patch.date || "");
  const payload = stripSecrets({
    ...patch,
    userId: userId || patch.customerId,
    customerId: userId || patch.customerId,
    date: date || patch.deliveryDate,
    deliveryDate: date || patch.deliveryDate,
    status: toCustomerMealStatus(opStatus),
    deliveryStatus: toCustomerTrackerStatus(opStatus),
    deliveryAgentName: patch.driverName || patch.deliveryAgentName || "",
    estimatedTime: patch.estimatedTime || "",
    opStatus,
    updatedAt: new Date().toISOString(),
  });
  await customerDb.collection("deliveries").doc(deliveryId).set(payload, { merge: true });

  const orderId = String(patch.orderId || "");
  if (!orderId) return;
  try {
    const twins = await customerDb.collection("deliveries").where("orderId", "==", orderId).get();
    await Promise.all(
      twins.docs
        .filter((d) => d.id !== deliveryId)
        .map((d) => d.ref.set(payload, { merge: true }))
    );
  } catch (error) {
    console.warn("[partner-delivery] customer delivery twin update skipped:", (error as Error).message);
  }
}

async function refreshPartnerDuty(deliveryDb: Firestore, partnerId: string) {
  const open = await deliveryDb
    .collection("deliveries")
    .where("partnerId", "==", partnerId)
    .get();
  const onJob = open.docs.some((d) => {
    const s = normalizeOpStatus(d.data().status);
    return [STATUS.ACCEPTED, STATUS.PICKED_UP, STATUS.OUT_FOR_DELIVERY, STATUS.ARRIVED].includes(s);
  });
  const partner = await loadPartner(deliveryDb, partnerId);
  if (!partner || partnerIsSuspended(partner)) return;
  const next = onJob
    ? PARTNER_STATUS.ON_DELIVERY
    : partner.currentStatus === PARTNER_STATUS.OFFLINE
      ? PARTNER_STATUS.OFFLINE
      : PARTNER_STATUS.ONLINE;
  await deliveryDb.collection("deliveryPartners").doc(partnerId).set(
    {
      currentStatus: next,
      isOnline: next !== PARTNER_STATUS.OFFLINE,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function applyStatusChange(opts: {
  partnerId: string;
  deliveryId: string;
  toStatus: DeliveryOpStatus;
  eventId?: string;
  extra?: Record<string, unknown>;
  allowDelivered?: boolean;
}) {
  const { delivery } = dbs();
  if (!delivery) throw Object.assign(new Error("Delivery DB unavailable"), { status: 503 });

  const { partnerId, deliveryId, extra = {}, allowDelivered = false } = opts;
  const toStatus = opts.toStatus;
  if (toStatus === STATUS.DELIVERED && !allowDelivered) {
    throw Object.assign(new Error("Delivered must be confirmed by backend verification"), { status: 403 });
  }
  if (!canTransition(STATUS.ASSIGNED, toStatus) && toStatus !== STATUS.DELIVERED && toStatus !== STATUS.ASSIGNED) {
    /* validated against current below */
  }

  const ref = delivery.collection("deliveries").doc(deliveryId);
  const snap = await ref.get();
  if (!snap.exists) throw Object.assign(new Error("Delivery not found"), { status: 404 });
  const data = snap.data() as Record<string, unknown>;
  if (String(data.partnerId || data.driverId) !== partnerId) {
    throw Object.assign(new Error("Not assigned to you"), { status: 403 });
  }

  const from = normalizeOpStatus(data.status);
  if (toStatus === STATUS.DELIVERED && from !== STATUS.ARRIVED) {
    throw Object.assign(new Error("Arrive at the stop before completing delivery"), { status: 409 });
  }
  if (toStatus !== STATUS.DELIVERED && !canTransition(from, toStatus)) {
    throw Object.assign(new Error(`Illegal transition ${from} → ${toStatus}`), { status: 409 });
  }

  const partner = await loadPartner(delivery, partnerId);
  if (partnerIsSuspended(partner) && toStatus === STATUS.ACCEPTED) {
    throw Object.assign(new Error("Suspended partners cannot accept deliveries"), { status: 403 });
  }

  const eventId = opts.eventId || `${deliveryId}_${toStatus}`;
  const { created } = await writeEvent(delivery, eventId, {
    deliveryId,
    orderId: data.orderId || null,
    partnerId,
    fromStatus: from,
    toStatus,
    type: "STATUS",
  });

  if (!created) {
    return { delivery: { id: deliveryId, ...data, status: toStatus }, idempotent: true };
  }

  const tsField = TIMESTAMP_FIELD[toStatus];
  const now = Date.now();
  const patch: Record<string, unknown> = {
    status: toStatus,
    updatedAt: now,
    ...extra,
  };
  if (tsField) patch[tsField] = now;
  await ref.set(patch, { merge: true });

  const { admin: adminDb, customer: customerDb } = dbs();
  const statusMirror = {
    status: toAdminStatusLabel(toStatus),
    opStatus: toStatus,
    driverId: partnerId,
    driverName: data.driverName || "",
    customerId: data.customerId || data.userId || "",
    userId: data.userId || data.customerId || "",
    orderId: data.orderId || "",
    deliveryDate: data.deliveryDate || data.date || "",
    estimatedTime: data.estimatedTime || "",
  };
  await mirrorAdminDelivery(adminDb, deliveryId, statusMirror);
  await mirrorCustomerDelivery(customerDb, deliveryId, statusMirror);

  if (adminDb && toStatus === STATUS.OUT_FOR_DELIVERY) {
    const orderId = String(data.orderId || "");
    if (orderId) {
      await adminDb.collection("orders").doc(orderId).set(
        { status: "Out For Delivery", orderStatus: "Out For Delivery", updatedAt: new Date().toISOString() },
        { merge: true }
      );
    }
  }
  if (customerDb) {
    const orderId = String(data.orderId || "");
    if (orderId) {
      await customerDb.collection("orders").doc(orderId).set(
        {
          orderStatus: toCustomerMealStatus(toStatus),
          deliveryStatus: toCustomerTrackerStatus(toStatus),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  }

  await refreshPartnerDuty(delivery, partnerId);
  const next = await ref.get();
  return { delivery: { id: next.id, ...next.data() }, idempotent: false };
}

async function creditEarning(
  deliveryDb: Firestore,
  partnerId: string,
  deliveryId: string,
  orderId: string,
  baseAmount: number
) {
  const earningId = `earn_${deliveryId}`;
  const ref = deliveryDb.collection("deliveryEarnings").doc(earningId);
  const existing = await ref.get();
  if (existing.exists) return earningId;
  const totalAmount = baseAmount;
  await ref.set({
    partnerId,
    deliveryId,
    orderId,
    baseAmount,
    bonus: 0,
    adjustment: 0,
    totalAmount,
    status: "POSTED",
    createdAt: Date.now(),
  });
  return earningId;
}

export async function completeDelivery(opts: {
  partnerId: string;
  deliveryId: string;
  otp?: string;
  photoUrl?: string;
  eventId?: string;
  confirmation?: boolean;
}) {
  const { delivery } = dbs();
  if (!delivery) throw Object.assign(new Error("Delivery DB unavailable"), { status: 503 });

  const settings = await loadSettings(delivery);
  const ref = delivery.collection("deliveries").doc(opts.deliveryId);
  const snap = await ref.get();
  if (!snap.exists) throw Object.assign(new Error("Delivery not found"), { status: 404 });
  const data = snap.data() as Record<string, unknown>;
  if (String(data.partnerId || data.driverId) !== opts.partnerId) {
    throw Object.assign(new Error("Not assigned to you"), { status: 403 });
  }

  const from = normalizeOpStatus(data.status);
  if (from === STATUS.DELIVERED) {
    return { delivery: { id: snap.id, ...data }, alreadyDelivered: true };
  }
  if (from !== STATUS.ARRIVED) {
    throw Object.assign(new Error("Mark Arrived before completing delivery"), { status: 409 });
  }

  if (settings.requirePhoto || settings.verificationMethod === "PHOTO") {
    const photo = opts.photoUrl || data.deliveryPhotoUrl;
    if (!photo) throw Object.assign(new Error("Photo proof is required"), { status: 400 });
  }

  if (settings.otpEnabled || settings.verificationMethod === "OTP") {
    const code = String(opts.otp || "").replace(/\D/g, "");
    if (code.length < 4) throw Object.assign(new Error("Enter the customer delivery OTP"), { status: 400 });
    const secret = await delivery.collection("deliverySecrets").doc(opts.deliveryId).get();
    const stored = String(secret.data()?.otpHash || "");
    if (!stored || !hashesMatch(stored, hashDeliveryOtp(opts.deliveryId, code))) {
      throw Object.assign(new Error("Invalid delivery OTP"), { status: 403 });
    }
  } else if (!opts.confirmation) {
    throw Object.assign(new Error("Delivery confirmation required"), { status: 400 });
  }

  const result = await applyStatusChange({
    partnerId: opts.partnerId,
    deliveryId: opts.deliveryId,
    toStatus: STATUS.DELIVERED,
    eventId: opts.eventId || `${opts.deliveryId}_DELIVERED`,
    extra: opts.photoUrl ? { deliveryPhotoUrl: opts.photoUrl } : {},
    allowDelivered: true,
  });

  await creditEarning(
    delivery,
    opts.partnerId,
    opts.deliveryId,
    String(data.orderId || ""),
    settings.defaultBaseAmount
  );

  const adminDb = dbs().admin;
  if (adminDb) {
    const orderId = String(data.orderId || "");
    if (orderId) {
      await adminDb.collection("orders").doc(orderId).set(
        { status: "Delivered", orderStatus: "Delivered", updatedAt: new Date().toISOString() },
        { merge: true }
      );
    }
  }

  await delivery.collection("deliveryPartners").doc(opts.partnerId).set(
    { completedDeliveries: FieldValue.increment(1), updatedAt: new Date().toISOString() },
    { merge: true }
  );

  return result;
}

export async function reportIssue(opts: {
  partnerId: string;
  partnerName?: string;
  deliveryId: string;
  reason: string;
  notes?: string;
  action?: "RESCHEDULE" | "RETURN_TO_KITCHEN" | "NONE";
  eventId?: string;
}) {
  const { delivery, admin } = dbs();
  if (!delivery) throw Object.assign(new Error("Delivery DB unavailable"), { status: 503 });
  if (!ISSUE_REASONS.includes(opts.reason as (typeof ISSUE_REASONS)[number])) {
    throw Object.assign(new Error("Invalid issue reason"), { status: 400 });
  }
  if (opts.reason === "Other" && !String(opts.notes || "").trim()) {
    throw Object.assign(new Error('Notes are required for "Other"'), { status: 400 });
  }

  const snap = await delivery.collection("deliveries").doc(opts.deliveryId).get();
  if (!snap.exists) throw Object.assign(new Error("Delivery not found"), { status: 404 });
  const data = snap.data() as Record<string, unknown>;
  if (String(data.partnerId || data.driverId) !== opts.partnerId) {
    throw Object.assign(new Error("Not assigned to you"), { status: 403 });
  }

  const from = normalizeOpStatus(data.status);
  if (from === STATUS.DELIVERED) {
    throw Object.assign(new Error("Already delivered"), { status: 409 });
  }

  const issueId = opts.eventId || `issue_${opts.deliveryId}_${Date.now()}`;
  const issue = {
    deliveryIssue: true,
    deliveryId: opts.deliveryId,
    orderId: data.orderId || null,
    partnerId: opts.partnerId,
    reason: opts.reason,
    notes: String(opts.notes || "").trim(),
    reportedBy: opts.partnerId,
    reportedByName: opts.partnerName || null,
    reportedAt: Date.now(),
    action: opts.action || "NONE",
    autoRescheduled: false,
    status: "open",
  };
  await delivery.collection("deliveryIssues").doc(issueId).set(issue, { merge: true });
  if (admin) {
    await admin.collection("deliveryIssues").doc(issueId).set(issue, { merge: true });
  }

  const nextStatus =
    opts.action === "RETURN_TO_KITCHEN" ? STATUS.RETURN_TO_KITCHEN : STATUS.FAILED;

  await applyStatusChange({
    partnerId: opts.partnerId,
    deliveryId: opts.deliveryId,
    toStatus: nextStatus,
    eventId: `${issueId}_status`,
    extra: {
      issueReason: opts.reason,
      issueNotes: issue.notes,
      rescheduleRequested: opts.action === "RESCHEDULE",
    },
  });

  await writeEvent(delivery, `${issueId}_event`, {
    deliveryId: opts.deliveryId,
    partnerId: opts.partnerId,
    type: "ISSUE",
    reason: opts.reason,
    notes: issue.notes,
    action: opts.action || "NONE",
  });

  return { issueId, status: nextStatus, autoRescheduled: false };
}

export type AssignableOrder = {
  orderId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerFirstName?: string;
  deliveryAddress?: string;
  deliveryArea?: string;
  deliverySlot?: string;
  mealName?: string;
  mealItems?: string[];
  quantity?: number;
  packageCount?: number;
  specialInstructions?: string;
  paymentStatus?: string;
  location?: { lat: number; lng: number };
  isPriority?: boolean;
  kitchenNotes?: string;
};

export async function assignDeliveries(opts: {
  adminUid: string;
  partnerId: string;
  partnerName: string;
  orders: AssignableOrder[];
  routeId?: string;
  routeName?: string;
  estimatedTime?: string;
  reassign?: boolean;
}) {
  const { delivery, admin } = dbs();
  if (!delivery) throw Object.assign(new Error("Delivery DB unavailable"), { status: 503 });

  const partner = await loadPartner(delivery, opts.partnerId);
  if (!partner) throw Object.assign(new Error("Partner not found in delivery fleet"), { status: 404 });
  if (partnerIsSuspended(partner)) {
    throw Object.assign(new Error("Cannot assign to a suspended partner"), { status: 409 });
  }

  const results: { deliveryId: string; orderId: string; otpIssued: boolean }[] = [];

  for (const order of opts.orders) {
    const existing = await delivery.collection("deliveries").where("orderId", "==", order.orderId).limit(1).get();
    const deliveryRef = existing.empty
      ? delivery.collection("deliveries").doc()
      : existing.docs[0].ref;
    const prev = existing.empty ? null : (existing.docs[0].data() as Record<string, unknown>);
    const prevPartner = prev ? String(prev.partnerId || prev.driverId || "") : "";
    const prevStatus = prev ? normalizeOpStatus(prev.status) : null;
    if (
      prevStatus &&
      [STATUS.DELIVERED, STATUS.CANCELLED].includes(prevStatus) &&
      !opts.reassign
    ) {
      continue;
    }

    const otp = generateDeliveryOtp();
    const now = Date.now();
    const customerName = order.customerName || "Customer";
    const firstName = order.customerFirstName || customerName.trim().split(/\s+/)[0] || "Customer";
    const area = order.deliveryArea || "";
    const payload = {
      partnerId: opts.partnerId,
      driverId: opts.partnerId,
      driverName: opts.partnerName,
      orderId: order.orderId,
      customerId: order.customerId || "",
      customerName,
      customerFirstName: firstName,
      customerPhone: order.customerPhone || "",
      deliveryAddress: order.deliveryAddress || "",
      deliveryArea: area,
      area,
      deliverySlot: order.deliverySlot || "",
      mealName: order.mealName || "",
      mealItems: order.mealItems || [],
      quantity: order.packageCount || order.quantity || 1,
      packageCount: order.packageCount || order.quantity || 1,
      specialInstructions: order.specialInstructions || "",
      kitchenNotes: order.kitchenNotes || "",
      paymentStatus: String(order.paymentStatus || "paid").toLowerCase() === "cod" ? "cod" : "paid",
      location: order.location || null,
      isPriority: Boolean(order.isPriority),
      routeId: opts.routeId || "",
      routeName: opts.routeName || "",
      estimatedTime: opts.estimatedTime || "",
      status: STATUS.ASSIGNED,
      assignedAt: now,
      assignedBy: opts.adminUid,
      verificationMethod: (await loadSettings(delivery)).verificationMethod,
      createdAt: prev?.createdAt || now,
      updatedAt: now,
    };

    await deliveryRef.set(payload, { merge: true });
    await delivery.collection("deliverySecrets").doc(deliveryRef.id).set({
      otpHash: hashDeliveryOtp(deliveryRef.id, otp),
      createdAt: now,
    });

    if (prevPartner && prevPartner !== opts.partnerId) {
      await notifyPartner(
        delivery,
        prevPartner,
        "REASSIGNMENT",
        "Delivery reassigned",
        `Order ${order.orderId} was moved to another partner.`,
        deliveryRef.id,
        `reassign_old_${deliveryRef.id}_${now}`
      );
    }

      await notifyPartner(
        delivery,
        opts.partnerId,
        prevPartner && prevPartner !== opts.partnerId ? "REASSIGNMENT" : "NEW_ASSIGNMENT",
        prevPartner && prevPartner !== opts.partnerId ? "Delivery reassigned to you" : "New delivery assigned",
        `Order ${order.orderId} · ${area || "delivery"} · ${order.deliverySlot || "slot TBA"}`,
        deliveryRef.id,
        `assign_${deliveryRef.id}_${opts.partnerId}`
      );

    await writeEvent(delivery, `assign_${deliveryRef.id}_${now}`, {
      deliveryId: deliveryRef.id,
      partnerId: opts.partnerId,
      orderId: order.orderId,
      type: "ASSIGN",
      previousPartnerId: prevPartner || null,
    });

    const assignedPatch = {
      deliveryId: deliveryRef.id,
      orderId: order.orderId,
      customerId: order.customerId || "",
      userId: order.customerId || "",
      customerName,
      customerPhone: order.customerPhone || "",
      deliveryAddress: order.deliveryAddress || "",
      deliveryArea: area,
      deliverySlot: order.deliverySlot || "",
      driverId: opts.partnerId,
      driverName: opts.partnerName,
      status: "Assigned",
      opStatus: STATUS.ASSIGNED,
      estimatedArrival: opts.estimatedTime || "",
      estimatedTime: opts.estimatedTime || "",
      notes: order.specialInstructions || "",
      otpIssued: true,
      createdAt: new Date(Number(payload.createdAt)).toISOString(),
    };
    await mirrorAdminDelivery(admin, deliveryRef.id, assignedPatch);
    const { customer } = dbs();
    await mirrorCustomerDelivery(customer, deliveryRef.id, assignedPatch);

    if (admin) {
      await admin.collection("orders").doc(order.orderId).set(
        {
          driverId: opts.partnerId,
          driverName: opts.partnerName,
          otpIssued: true,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    results.push({ deliveryId: deliveryRef.id, orderId: order.orderId, otpIssued: true });
  }

  return results;
}

export async function upsertPartnerProfile(
  partnerId: string,
  profile: Record<string, unknown>
) {
  const { delivery, admin } = dbs();
  if (!delivery) throw Object.assign(new Error("Delivery DB unavailable"), { status: 503 });
  const now = new Date().toISOString();
  const payload = {
    ...profile,
    partnerId,
    updatedAt: now,
  };
  await delivery.collection("deliveryPartners").doc(partnerId).set(payload, { merge: true });
  if (admin) {
    await admin.collection("deliveryPartners").doc(partnerId).set(
      { ...payload, syncedFromPartnerDb: true },
      { merge: true }
    );
  }
  return payload;
}

export function computePerformance(rows: Array<Record<string, unknown>>) {
  const total = rows.length;
  const successful = rows.filter((d) => normalizeOpStatus(d.status) === STATUS.DELIVERED).length;
  const failed = rows.filter((d) =>
    [STATUS.FAILED, STATUS.RETURN_TO_KITCHEN].includes(normalizeOpStatus(d.status))
  ).length;
  const durations = rows
    .filter((d) => d.pickedUpAt && d.deliveredAt)
    .map((d) => Number(d.deliveredAt) - Number(d.pickedUpAt))
    .filter((n) => n > 0);
  const avgMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const onTime = rows.filter((d) => d.deliveredAt && d.slotEndAt && Number(d.deliveredAt) <= Number(d.slotEndAt)).length;
  const rated = rows.filter((d) => typeof d.customerRating === "number");
  const avgRating = rated.length
    ? rated.reduce((a, d) => a + Number(d.customerRating), 0) / rated.length
    : null;
  const complaints = rows.filter((d) => Boolean(d.issueReason)).length;
  const pct = total ? Math.round((successful / total) * 100) : null;
  return {
    totalDeliveries: total,
    successfulDeliveries: successful,
    failedDeliveries: failed,
    averageDeliveryMinutes: avgMs ? Math.round(avgMs / 60000) : null,
    onTimePercentage: rated.length || rows.some((d) => d.slotEndAt) ? (total ? Math.round((onTime / Math.max(successful, 1)) * 100) : null) : null,
    customerComplaints: complaints,
    averageRating: avgRating,
    performancePercent: pct,
  };
}
