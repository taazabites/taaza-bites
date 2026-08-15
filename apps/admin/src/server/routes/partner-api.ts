import { Router } from "express";
import { authenticate, AuthenticatedRequest } from "../middleware/auth-middleware";
import { FIRESTORE_DB_IDS, getNamedDb } from "../lib/firebase-admin";
import {
  STATUS,
  applyStatusChange,
  completeDelivery,
  dbs,
  loadPartner,
  normalizeOpStatus,
  partnerIsSuspended,
  reportIssue,
  upsertPartnerProfile,
  type DeliveryOpStatus,
} from "../lib/partner-delivery";

const router = Router();

function wrap(err: unknown, res: any) {
  const e = err as { status?: number; message?: string };
  const status = e.status || 500;
  return res.status(status).json({ error: e.message || "Partner operation failed" });
}

async function requirePartner(req: AuthenticatedRequest, res: any) {
  const deliveryDb = getNamedDb(FIRESTORE_DB_IDS.delivery);
  if (!deliveryDb) {
    res.status(503).json({ error: "Delivery DB unavailable" });
    return null;
  }
  const uid = req.user?.uid as string;
  let partner = await loadPartner(deliveryDb, uid);
  if (!partner) {
    partner = await claimPendingPartner(uid, req.user?.phone_number);
  }
  if (!partner) {
    res.status(403).json({ error: "No delivery partner profile found" });
    return null;
  }
  if (partnerIsSuspended(partner) && req.method !== "GET") {
    const action = String(req.body?.toStatus || req.path);
    if (action.includes("ACCEPTED") || req.path.includes("/transition")) {
      /* further checked per mutation */
    }
  }
  return { deliveryDb, uid, partner };
}

async function claimPendingPartner(uid: string, phone?: string) {
  const { delivery } = dbs();
  if (!delivery || !phone) return null;
  const digits = String(phone).replace(/\D/g, "").slice(-10);
  const pendingId = `pending_${digits}`;
  const pending = await delivery.collection("deliveryPartners").doc(pendingId).get();
  if (!pending.exists) {
    const byPhone = await delivery.collection("deliveryPartners").where("phone", "==", phone).limit(1).get();
    if (byPhone.empty) return null;
    const doc = byPhone.docs[0];
    if (doc.id === uid) return { id: uid, ...doc.data() };
    await upsertPartnerProfile(uid, { ...doc.data(), uid, claimedFrom: doc.id });
    return loadPartner(delivery, uid);
  }
  await upsertPartnerProfile(uid, { ...pending.data(), uid, claimedFrom: pendingId });
  return loadPartner(delivery, uid);
}

router.post("/claim", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const ctx = await requirePartner(req, res);
    if (!ctx) return;
    res.json({ ok: true, partner: ctx.partner });
  } catch (err) {
    wrap(err, res);
  }
});

router.post("/presence", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const ctx = await requirePartner(req, res);
    if (!ctx) return;
    if (partnerIsSuspended(ctx.partner)) {
      return res.status(403).json({ error: "Account suspended" });
    }
    const next = String(req.body?.currentStatus || "").toUpperCase();
    if (next !== "ONLINE" && next !== "OFFLINE") {
      return res.status(400).json({ error: "currentStatus must be ONLINE or OFFLINE" });
    }
    await upsertPartnerProfile(ctx.uid, {
      currentStatus: next,
      isOnline: next === "ONLINE",
      lastOnlineChange: Date.now(),
    });
    res.json({ ok: true, currentStatus: next });
  } catch (err) {
    wrap(err, res);
  }
});

router.post("/profile", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const ctx = await requirePartner(req, res);
    if (!ctx) return;
    const allowed = ["emergencyContact", "photoUrl", "photo", "upiId"];
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body?.[key] !== undefined) patch[key] = req.body[key];
    }
    if (!Object.keys(patch).length) {
      return res.status(400).json({ error: "No permitted fields to update" });
    }
    await upsertPartnerProfile(ctx.uid, patch);
    res.json({ ok: true });
  } catch (err) {
    wrap(err, res);
  }
});

router.post("/transition", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const ctx = await requirePartner(req, res);
    if (!ctx) return;
    const toStatus = normalizeOpStatus(req.body?.toStatus) as DeliveryOpStatus;
    if (toStatus === STATUS.DELIVERED) {
      return res.status(403).json({ error: "Use /verify-otp or /complete to mark delivered" });
    }
    if (partnerIsSuspended(ctx.partner) && toStatus === STATUS.ACCEPTED) {
      return res.status(403).json({ error: "Suspended partners cannot accept deliveries" });
    }
    const result = await applyStatusChange({
      partnerId: ctx.uid,
      deliveryId: String(req.body?.deliveryId || ""),
      toStatus,
      eventId: req.body?.eventId,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    wrap(err, res);
  }
});

router.post("/pickup", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const ctx = await requirePartner(req, res);
    if (!ctx) return;
    const ids: string[] = Array.isArray(req.body?.deliveryIds)
      ? req.body.deliveryIds
      : [req.body?.deliveryId];
    const results = [];
    for (const id of ids.filter(Boolean)) {
      results.push(
        await applyStatusChange({
          partnerId: ctx.uid,
          deliveryId: String(id),
          toStatus: STATUS.PICKED_UP,
          eventId: `pickup_${id}`,
        })
      );
    }
    res.json({ ok: true, results });
  } catch (err) {
    wrap(err, res);
  }
});

router.post("/verify-otp", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const ctx = await requirePartner(req, res);
    if (!ctx) return;
    const result = await completeDelivery({
      partnerId: ctx.uid,
      deliveryId: String(req.body?.deliveryId || ""),
      otp: String(req.body?.otp || ""),
      photoUrl: req.body?.photoUrl,
      eventId: req.body?.eventId,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    wrap(err, res);
  }
});

router.post("/complete", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const ctx = await requirePartner(req, res);
    if (!ctx) return;
    const result = await completeDelivery({
      partnerId: ctx.uid,
      deliveryId: String(req.body?.deliveryId || ""),
      otp: req.body?.otp,
      photoUrl: req.body?.photoUrl,
      confirmation: true,
      eventId: req.body?.eventId,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    wrap(err, res);
  }
});

router.post("/issue", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const ctx = await requirePartner(req, res);
    if (!ctx) return;
    const result = await reportIssue({
      partnerId: ctx.uid,
      partnerName: String(ctx.partner.name || ctx.partner.fullName || ""),
      deliveryId: String(req.body?.deliveryId || ""),
      reason: String(req.body?.reason || ""),
      notes: req.body?.notes,
      action: req.body?.action,
      eventId: req.body?.eventId,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    wrap(err, res);
  }
});

router.post("/ready-pickup", authenticate, async (_req, res) => {
  res.status(405).json({ error: "Kitchen/ops only" });
});

export default router;

