import { Router } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { FIRESTORE_DB_IDS, getFirebaseAdmin, getNamedDb } from '../lib/firebase-admin';
import { isSuperAdminEmail } from '../../lib/super-admin';

const router = Router();

function portalUrlsFromEnv() {
  const customer = (process.env.VITE_CUSTOMER_URL || 'http://localhost:3000').replace(/\/$/, '');
  const admin = (process.env.VITE_ADMIN_URL || process.env.APP_URL || 'http://localhost:3001').replace(/\/$/, '');
  const delivery = (process.env.VITE_DELIVERY_URL || 'http://localhost:3003').replace(/\/$/, '');
  const landing = (process.env.VITE_LANDING_URL || 'http://localhost:3002').replace(/\/$/, '');
  return { customer, admin, delivery, landing };
}

async function portalUrls() {
  const env = portalUrlsFromEnv();
  try {
    const db = getNamedDb(FIRESTORE_DB_IDS.admin);
    if (!db) return env;
    const snap = await db.collection('systemSettings').doc('portals').get();
    if (!snap.exists) return env;
    const d = snap.data() || {};
    return {
      customer: (d.customerUrl || env.customer).replace(/\/$/, ''),
      admin: (d.adminUrl || env.admin).replace(/\/$/, ''),
      delivery: (d.deliveryUrl || env.delivery).replace(/\/$/, ''),
      landing: (d.landingUrl || env.landing).replace(/\/$/, ''),
    };
  } catch {
    return env;
  }
}

/**
 * GET /api/me
 * Authorization: Bearer <Firebase ID token>
 * Returns unified role + portal list for landing / sibling apps.
 */
router.get('/api/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const { app } = getFirebaseAdmin();
  if (!app) {
    return res.status(503).json({
      error: 'Role API unavailable — Firebase Admin credentials not configured',
      fallback: true,
    });
  }

  try {
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await getAuth(app).verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = (decoded.email || '').toLowerCase();
    const urls = await portalUrls();

    const portals: Array<{
      kind: 'admin' | 'delivery' | 'customer' | 'website';
      label: string;
      description: string;
      url: string;
      roleLabel?: string;
    }> = [];

    let adminRole: string | undefined;
    let primary: 'admin' | 'delivery' | 'customer' = 'customer';

    const adminDb = getNamedDb(FIRESTORE_DB_IDS.admin);
    if (adminDb) {
      const adminSnap = await adminDb.collection('admins').doc(uid).get();
      if (adminSnap.exists) {
        adminRole = String(adminSnap.data()?.role || 'Admin');
        portals.push({
          kind: 'admin',
          label: 'Admin Panel',
          description: `${adminRole} dashboard`,
          url: urls.admin,
          roleLabel: adminRole,
        });
        primary = 'admin';
      } else if (isSuperAdminEmail(email)) {
        adminRole = 'Super Admin';
        portals.push({
          kind: 'admin',
          label: 'Admin Panel',
          description: 'Super Admin — bootstrap on first admin login',
          url: `${urls.admin}/admin/login`,
          roleLabel: adminRole,
        });
        primary = 'admin';
      }
    }

    const deliveryDb = getNamedDb(FIRESTORE_DB_IDS.delivery);
    if (deliveryDb) {
      const partnerSnap = await deliveryDb.collection('deliveryPartners').doc(uid).get();
      if (partnerSnap.exists && !partnerSnap.data()?.isBlocked) {
        portals.push({
          kind: 'delivery',
          label: 'Delivery Partner',
          description: 'Routes, deliveries & earnings',
          url: urls.delivery,
          roleLabel: 'Delivery Partner',
        });
        if (primary === 'customer') primary = 'delivery';
      }
    }

    let customerRole = 'customer';
    const customerDb = getNamedDb(FIRESTORE_DB_IDS.customer);
    if (customerDb) {
      const userSnap = await customerDb.collection('users').doc(uid).get();
      if (userSnap.exists && userSnap.data()?.role) {
        customerRole = String(userSnap.data()?.role);
      }
    }

    portals.push({
      kind: 'customer',
      label: 'Customer Panel',
      description: 'Subscriptions, meals & account',
      url: urls.customer,
      roleLabel: customerRole,
    });

    portals.push({
      kind: 'website',
      label: 'Stay on Website',
      description: 'Continue browsing Taaza Bites',
      url: urls.landing,
    });

    res.json({
      uid,
      email: email || null,
      primary,
      adminRole: adminRole || null,
      options: portals,
      source: 'admin-api',
    });
  } catch (error) {
    console.error('[api/me] error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
});

export default router;
