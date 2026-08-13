import { Router } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { authenticate, AuthenticatedRequest } from '../middleware/auth-middleware';
import { FIRESTORE_DB_IDS, getFirebaseAdmin, getNamedDb } from '../lib/firebase-admin';
import { isSuperAdminEmail } from '../../lib/super-admin';

const router = Router();

async function requireSuperAdmin(req: AuthenticatedRequest, res: any): Promise<boolean> {
  const { app, db } = getFirebaseAdmin();
  if (!app || !db) {
    res.status(503).json({ error: 'Firebase Admin not configured', fallback: true });
    return false;
  }
  const uid = req.user?.uid;
  const email = (req.user?.email || '').toLowerCase();
  if (isSuperAdminEmail(email)) return true;

  const snap = await db.collection('admins').doc(uid).get();
  const role = snap.data()?.role;
  if (snap.exists && (role === 'Super Admin' || role === 'superAdmin')) return true;

  res.status(403).json({ error: 'Forbidden: Super Admin only' });
  return false;
}

/** List + upsert portal URLs / feature flags in admin DB systemSettings */
router.get('/portals', authenticate, async (req: AuthenticatedRequest, res) => {
  if (!(await requireSuperAdmin(req, res))) return;
  const db = getNamedDb(FIRESTORE_DB_IDS.admin);
  if (!db) return res.status(503).json({ error: 'DB unavailable' });

  const [portalsSnap, flagsSnap] = await Promise.all([
    db.collection('systemSettings').doc('portals').get(),
    db.collection('systemSettings').doc('featureFlags').get(),
  ]);

  const defaults = {
    customerUrl: process.env.VITE_CUSTOMER_URL || '/app',
    adminUrl: process.env.VITE_ADMIN_URL || '/admin',
    landingUrl: process.env.VITE_LANDING_URL || '/',
    deliveryUrl: process.env.VITE_DELIVERY_URL || '/partner',
  };

  res.json({
    portals: { ...defaults, ...(portalsSnap.data() || {}) },
    featureFlags: {
      maintenanceMode: false,
      allowCustomerSignup: true,
      allowPartnerSelfRegister: false,
      showStaffLoginOnLanding: true,
      ...(flagsSnap.data() || {}),
    },
  });
});

router.put('/portals', authenticate, async (req: AuthenticatedRequest, res) => {
  if (!(await requireSuperAdmin(req, res))) return;
  const db = getNamedDb(FIRESTORE_DB_IDS.admin);
  if (!db) return res.status(503).json({ error: 'DB unavailable' });

  const { portals, featureFlags } = req.body || {};
  if (portals && typeof portals === 'object') {
    await db.collection('systemSettings').doc('portals').set(
      { ...portals, updatedAt: FieldValue.serverTimestamp(), updatedBy: req.user.uid },
      { merge: true }
    );
  }
  if (featureFlags && typeof featureFlags === 'object') {
    await db.collection('systemSettings').doc('featureFlags').set(
      { ...featureFlags, updatedAt: FieldValue.serverTimestamp(), updatedBy: req.user.uid },
      { merge: true }
    );
  }
  res.json({ success: true });
});

/** Register / approve delivery partner on partner Firestore DB (+ mirror admin fleet) */
router.get('/partners', authenticate, async (req: AuthenticatedRequest, res) => {
  if (!(await requireSuperAdmin(req, res))) return;
  const deliveryDb = getNamedDb(FIRESTORE_DB_IDS.delivery);
  const adminDb = getNamedDb(FIRESTORE_DB_IDS.admin);
  if (!deliveryDb) return res.status(503).json({ error: 'Delivery DB unavailable', fallback: true });

  const snap = await deliveryDb.collection('deliveryPartners').limit(200).get();
  const partners = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  let adminFleet: any[] = [];
  if (adminDb) {
    const fleet = await adminDb.collection('deliveryPartners').limit(200).get();
    adminFleet = fleet.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  res.json({ partners, adminFleet });
});

router.post('/partners', authenticate, async (req: AuthenticatedRequest, res) => {
  if (!(await requireSuperAdmin(req, res))) return;
  const deliveryDb = getNamedDb(FIRESTORE_DB_IDS.delivery);
  const adminDb = getNamedDb(FIRESTORE_DB_IDS.admin);
  if (!deliveryDb) return res.status(503).json({ error: 'Delivery DB unavailable', fallback: true });

  const { uid, phone, name, email, vehicleType } = req.body || {};
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  if (!cleanPhone && !uid) {
    return res.status(400).json({ error: 'phone or uid required' });
  }

  let partnerUid = uid as string | undefined;
  const { app } = getFirebaseAdmin();

  // Optional: resolve Auth user by phone
  if (!partnerUid && app && cleanPhone) {
    try {
      const e164 = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;
      const user = await getAuth(app).getUserByPhoneNumber(e164);
      partnerUid = user.uid;
    } catch {
      // Partner not in Auth yet — use phone-based pending id; they claim on first OTP login
      partnerUid = `pending_${cleanPhone}`;
    }
  }
  if (!partnerUid) partnerUid = `pending_${cleanPhone || Date.now()}`;

  const profile = {
    uid: partnerUid,
    phone: cleanPhone ? `+91${cleanPhone.slice(-10)}` : '',
    name: name || 'Delivery Partner',
    email: email || '',
    role: 'deliveryPartner',
    status: 'Active',
    isBlocked: false,
    isApproved: true,
    vehicleType: vehicleType || 'Bike',
    approvedAt: new Date().toISOString(),
    approvedBy: req.user.uid,
    createdAt: new Date().toISOString(),
  };

  await deliveryDb.collection('deliveryPartners').doc(partnerUid).set(profile, { merge: true });

  if (adminDb) {
    await adminDb.collection('deliveryPartners').doc(partnerUid).set(
      {
        ...profile,
        syncedFromPartnerDb: true,
      },
      { merge: true }
    );
  }

  res.json({ success: true, partner: profile });
});

router.patch('/partners/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  if (!(await requireSuperAdmin(req, res))) return;
  const deliveryDb = getNamedDb(FIRESTORE_DB_IDS.delivery);
  const adminDb = getNamedDb(FIRESTORE_DB_IDS.admin);
  if (!deliveryDb) return res.status(503).json({ error: 'Delivery DB unavailable', fallback: true });

  const id = req.params.id;
  const { isBlocked, status, isApproved, name } = req.body || {};
  const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (typeof isBlocked === 'boolean') patch.isBlocked = isBlocked;
  if (status) patch.status = status;
  if (typeof isApproved === 'boolean') patch.isApproved = isApproved;
  if (name) patch.name = name;

  await deliveryDb.collection('deliveryPartners').doc(id).set(patch, { merge: true });
  if (adminDb) {
    await adminDb.collection('deliveryPartners').doc(id).set(patch, { merge: true });
  }
  res.json({ success: true });
});

/** Link admin CRM customer ↔ customer-app Firebase uid */
router.post('/customer-map', authenticate, async (req: AuthenticatedRequest, res) => {
  if (!(await requireSuperAdmin(req, res))) return;
  const adminDb = getNamedDb(FIRESTORE_DB_IDS.admin);
  const customerDb = getNamedDb(FIRESTORE_DB_IDS.customer);
  if (!adminDb) return res.status(503).json({ error: 'Admin DB unavailable' });

  const { customerAppUid, email, phone, adminCustomerId, displayName } = req.body || {};
  if (!customerAppUid && !email && !phone) {
    return res.status(400).json({ error: 'customerAppUid, email, or phone required' });
  }

  let uid = customerAppUid as string | undefined;
  if (!uid && customerDb && email) {
    const q = await customerDb.collection('users').where('email', '==', String(email).toLowerCase()).limit(1).get();
    if (!q.empty) uid = q.docs[0].id;
  }
  if (!uid) uid = adminCustomerId || `map_${Date.now()}`;

  const mapDoc = {
    customerAppUid: uid,
    adminCustomerId: adminCustomerId || uid,
    email: email || '',
    phone: phone || '',
    displayName: displayName || '',
    linkedAt: new Date().toISOString(),
    linkedBy: req.user.uid,
  };

  await adminDb.collection('customerAccountMaps').doc(uid).set(mapDoc, { merge: true });

  if (customerDb) {
    await customerDb.collection('users').doc(uid).set(
      {
        linkedAdminCustomerId: mapDoc.adminCustomerId,
        role: 'customer',
        email: email || undefined,
        phone: phone || undefined,
      },
      { merge: true }
    );
  }

  res.json({ success: true, map: mapDoc });
});

router.get('/customer-map', authenticate, async (req: AuthenticatedRequest, res) => {
  if (!(await requireSuperAdmin(req, res))) return;
  const adminDb = getNamedDb(FIRESTORE_DB_IDS.admin);
  if (!adminDb) return res.status(503).json({ error: 'Admin DB unavailable' });
  const snap = await adminDb.collection('customerAccountMaps').limit(200).get();
  res.json({ maps: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
});

export default router;
