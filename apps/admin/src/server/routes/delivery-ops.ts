import { Router } from "express";
import { getAuth } from "firebase-admin/auth";
import { authenticate, AuthenticatedRequest } from "../middleware/auth-middleware";
import { FIRESTORE_DB_IDS, getFirebaseAdmin, getNamedDb } from "../lib/firebase-admin";
import {
  assignDeliveries,
  computePerformance,
  dbs,
  upsertPartnerProfile,
  type AssignableOrder,
} from "../lib/partner-delivery";
import { isSuperAdminEmail } from "../../lib/super-admin";

const router = Router();

async function requireOps(req: AuthenticatedRequest, res: any): Promise<boolean> {
  const { app, db } = getFirebaseAdmin();
  if (!app || !db) {
    res.status(503).json({ error: "Firebase Admin not configured" });
    return false;
  }
  const uid = req.user?.uid;
  const email = (req.user?.email || "").toLowerCase();
  if (isSuperAdminEmail(email)) return true;
  const snap = await db.collection("admins").doc(uid).get();
  const role = String(snap.data()?.role || "");
  const ok = [
    "Super Admin",
    "superAdmin",
    "Admin",
    "admin",
    "Operations Manager",
    "Delivery Manager",
  ].includes(role);
  if (!ok) {
    res.status(403).json({ error: "Forbidden: delivery operations only" });
    return false;
  }
  return true;
}

function wrap(err: unknown, res: any) {
  const e = err as { status?: number; message?: string };
  return res.status(e.status || 500).json({ error: e.message || "Delivery operation failed" });
}

router.post("/assign", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!(await requireOps(req, res))) return;
    const { partnerId, partnerName, orders, orderIds, routeId, routeName, estimatedTime, reassign } = req.body || {};
    let payload = (orders || []) as AssignableOrder[];
    if ((!payload.length) && Array.isArray(orderIds) && orderIds.length) {
      const adminDb = getNamedDb(FIRESTORE_DB_IDS.admin);
      if (!adminDb) return res.status(503).json({ error: "Admin DB unavailable" });
      payload = [];
      for (const orderId of orderIds) {
        const snap = await adminDb.collection("orders").doc(String(orderId)).get();
        const o = snap.data() || {};
        payload.push({
          orderId: String(orderId),
          customerId: String(o.customerId || ""),
          customerName: String(o.customerName || "Customer"),
          customerPhone: String(o.customerPhone || ""),
          deliveryAddress: String(o.deliveryAddress || ""),
          deliveryArea: String(o.deliveryArea || ""),
          deliverySlot: String(o.deliverySlot || ""),
          mealName: String(o.mealName || o.planName || ""),
          mealItems: Array.isArray(o.meals) ? o.meals.map(String) : [],
          quantity: Number(o.quantity || 1),
          specialInstructions: String(o.specialInstructions || ""),
          paymentStatus: String(o.paymentStatus || "paid"),
        });
      }
    }
    if (!partnerId || !payload.length) {
      return res.status(400).json({ error: "partnerId and orders[] are required" });
    }
    const results = await assignDeliveries({
      adminUid: req.user.uid,
      partnerId: String(partnerId),
      partnerName: String(partnerName || "Partner"),
      orders: payload,
      routeId,
      routeName,
      estimatedTime,
      reassign: Boolean(reassign),
    });
    res.json({ ok: true, results });
  } catch (err) {
    wrap(err, res);
  }
});

router.post("/partners", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!(await requireOps(req, res))) return;
    const body = req.body || {};
    const cleanPhone = String(body.phone || "").replace(/\D/g, "").slice(-10);
    let partnerUid = String(body.uid || body.partnerId || "").trim();
    const { app } = getFirebaseAdmin();
    if (!partnerUid && app && cleanPhone) {
      try {
        const user = await getAuth(app).getUserByPhoneNumber(`+91${cleanPhone}`);
        partnerUid = user.uid;
      } catch {
        partnerUid = `pending_${cleanPhone}`;
      }
    }
    if (!partnerUid) return res.status(400).json({ error: "phone or uid required" });

    const suspended =
      body.currentStatus === "SUSPENDED" ||
      body.status === "Inactive" ||
      body.status === "Deactivated" ||
      body.active === false;

    const profile = {
      uid: partnerUid,
      partnerId: partnerUid,
      name: body.fullName || body.name || "Delivery Partner",
      fullName: body.fullName || body.name || "Delivery Partner",
      phone: cleanPhone ? `+91${cleanPhone}` : body.phone || "",
      email: body.email || "",
      photo: body.profilePhoto || body.photo || "",
      photoUrl: body.profilePhoto || body.photoUrl || "",
      role: "deliveryPartner",
      active: !suspended,
      isBlocked: Boolean(body.isBlocked) || suspended,
      vehicleType: body.vehicleType || "Bike",
      vehicleNumber: body.vehicleNumber || "",
      licenseNumber: body.licenseNumber || "",
      serviceAreas: Array.isArray(body.serviceAreas)
        ? body.serviceAreas
        : String(body.serviceAreas || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
      currentStatus: suspended ? "SUSPENDED" : body.currentStatus || "OFFLINE",
      joiningDate: body.joiningDate || new Date().toISOString().slice(0, 10),
      emergencyContact: body.emergencyContact || "",
      status: body.status || (suspended ? "Inactive" : "Active"),
      availability: body.availability || "Offline",
      createdAt: new Date().toISOString(),
    };

    await upsertPartnerProfile(partnerUid, profile);
    res.json({ ok: true, partner: profile });
  } catch (err) {
    wrap(err, res);
  }
});

router.patch("/partners/:id", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!(await requireOps(req, res))) return;
    const id = req.params.id;
    const body = req.body || {};
    const patch: Record<string, unknown> = {};
    const keys = [
      "name",
      "fullName",
      "phone",
      "email",
      "photo",
      "photoUrl",
      "profilePhoto",
      "vehicleType",
      "vehicleNumber",
      "licenseNumber",
      "serviceAreas",
      "currentStatus",
      "joiningDate",
      "emergencyContact",
      "status",
      "availability",
      "active",
      "isBlocked",
    ];
    for (const k of keys) {
      if (body[k] !== undefined) patch[k] = body[k];
    }
    if (patch.fullName && !patch.name) patch.name = patch.fullName;
    if (patch.profilePhoto && !patch.photoUrl) patch.photoUrl = patch.profilePhoto;
    if (typeof patch.serviceAreas === "string") {
      patch.serviceAreas = String(patch.serviceAreas)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (patch.status === "Deactivated" || patch.status === "Inactive" || patch.active === false) {
      patch.currentStatus = "SUSPENDED";
      patch.active = false;
      patch.isBlocked = true;
    }
    if (patch.status === "Active") {
      patch.active = true;
      patch.isBlocked = false;
      if (!patch.currentStatus || patch.currentStatus === "SUSPENDED") patch.currentStatus = "OFFLINE";
    }
    await upsertPartnerProfile(id, patch);
    res.json({ ok: true });
  } catch (err) {
    wrap(err, res);
  }
});

router.post("/ready-pickup", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!(await requireOps(req, res))) return;
    const deliveryDb = getNamedDb(FIRESTORE_DB_IDS.delivery);
    if (!deliveryDb) return res.status(503).json({ error: "Delivery DB unavailable" });
    const { partnerId, deliveryId } = req.body || {};
    if (!partnerId || !deliveryId) return res.status(400).json({ error: "partnerId and deliveryId required" });
    await deliveryDb.collection("partnerNotifications").doc(`ready_${deliveryId}`).set({
      partnerId,
      type: "READY_FOR_PICKUP",
      title: "Order ready for pickup",
      body: "Kitchen has packed this order. Collect at the handover counter.",
      deliveryId,
      read: false,
      createdAt: Date.now(),
    });
    res.json({ ok: true });
  } catch (err) {
    wrap(err, res);
  }
});

router.post("/cancel", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!(await requireOps(req, res))) return;
    const { delivery, admin } = dbs();
    if (!delivery) return res.status(503).json({ error: "Delivery DB unavailable" });
    const deliveryId = String(req.body?.deliveryId || "");
    const snap = await delivery.collection("deliveries").doc(deliveryId).get();
    if (!snap.exists) return res.status(404).json({ error: "Delivery not found" });
    const data = snap.data() || {};
    await delivery.collection("deliveries").doc(deliveryId).set(
      {
        status: "CANCELLED",
        cancelledAt: Date.now(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    const partnerId = String(data.partnerId || data.driverId || "");
    if (partnerId) {
      await delivery.collection("partnerNotifications").add({
        partnerId,
        type: "CANCELLATION",
        title: "Delivery cancelled",
        body: `Order ${data.orderId || deliveryId} was cancelled by operations.`,
        deliveryId,
        read: false,
        createdAt: Date.now(),
      });
    }
    if (admin) {
      await admin.collection("deliveries").doc(deliveryId).set(
        { status: "Cancelled", opStatus: "CANCELLED", updatedAt: new Date().toISOString() },
        { merge: true }
      );
    }
    res.json({ ok: true });
  } catch (err) {
    wrap(err, res);
  }
});

router.get("/performance/:partnerId", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!(await requireOps(req, res))) return;
    const deliveryDb = getNamedDb(FIRESTORE_DB_IDS.delivery);
    if (!deliveryDb) return res.status(503).json({ error: "Delivery DB unavailable" });
    const snap = await deliveryDb
      .collection("deliveries")
      .where("partnerId", "==", req.params.partnerId)
      .get();
    const rows = snap.docs.map((d) => d.data());
    res.json({ ok: true, performance: computePerformance(rows) });
  } catch (err) {
    wrap(err, res);
  }
});

export default router;
