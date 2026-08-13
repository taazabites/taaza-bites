import { doc, getDoc } from 'firebase/firestore';
import { auth, adminDb, deliveryDb, db as customerDb } from '../firebase';
import { PORTAL_LINKS } from '../config';

export type PortalKind = 'admin' | 'delivery' | 'customer' | 'website';

export interface PortalOption {
  kind: PortalKind;
  label: string;
  description: string;
  url: string;
  roleLabel?: string;
}

export interface PortalResolution {
  uid: string;
  email?: string | null;
  primary: PortalKind;
  options: PortalOption[];
  adminRole?: string;
  source?: 'admin-api' | 'client';
}

export const SUPER_ADMIN_EMAILS = new Set([
  '143bhosur@gmail.com',
  'admin@taazabites.in',
]);

const ROLE_API_URL = import.meta.env.VITE_ROLE_API_URL || "/api/me";

async function safeGet(existsCheck: () => Promise<{ exists: boolean; data?: Record<string, unknown> }>) {
  try {
    return await existsCheck();
  } catch (err) {
    console.warn('[portalRouter] lookup skipped:', err instanceof Error ? err.message : err);
    return { exists: false as const };
  }
}

async function resolveViaApi(uid: string, email?: string | null): Promise<PortalResolution | null> {
  if (!auth?.currentUser) return null;
  try {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(ROLE_API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 503) {
      const body = await res.json().catch(() => ({}));
      if (body?.fallback) return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    return {
      uid: data.uid || uid,
      email: data.email ?? email,
      primary: data.primary || 'customer',
      options: data.options || [],
      adminRole: data.adminRole || undefined,
      source: 'admin-api',
    };
  } catch (err) {
    console.warn('[portalRouter] role API unreachable, using client fallback', err);
    return null;
  }
}

async function resolveViaClient(uid: string, email?: string | null): Promise<PortalResolution> {
  const options: PortalOption[] = [];
  let adminRole: string | undefined;
  const normalizedEmail = email?.toLowerCase()?.trim() || null;

  if (adminDb) {
    const adminSnap = await safeGet(async () => {
      const snap = await getDoc(doc(adminDb!, 'admins', uid));
      return {
        exists: snap.exists(),
        data: snap.exists() ? (snap.data() as Record<string, unknown>) : undefined,
      };
    });

    if (adminSnap.exists && adminSnap.data) {
      adminRole = String(adminSnap.data.role || 'Admin');
      options.push({
        kind: 'admin',
        label: 'Admin Panel',
        description: `${adminRole} dashboard`,
        url: PORTAL_LINKS.adminHome,
        roleLabel: adminRole,
      });
    } else if (normalizedEmail && SUPER_ADMIN_EMAILS.has(normalizedEmail)) {
      adminRole = 'Super Admin';
      options.push({
        kind: 'admin',
        label: 'Admin Panel',
        description: 'Super Admin — first login creates your profile',
        url: PORTAL_LINKS.adminLogin,
        roleLabel: 'Super Admin',
      });
    }
  }

  if (deliveryDb) {
    const partnerSnap = await safeGet(async () => {
      const snap = await getDoc(doc(deliveryDb!, 'deliveryPartners', uid));
      return {
        exists: snap.exists(),
        data: snap.exists() ? (snap.data() as Record<string, unknown>) : undefined,
      };
    });
    if (partnerSnap.exists && !partnerSnap.data?.isBlocked) {
      options.push({
        kind: 'delivery',
        label: 'Delivery Partner',
        description: 'Routes, deliveries & earnings',
        url: PORTAL_LINKS.deliveryHome,
        roleLabel: 'Delivery Partner',
      });
    }
  }

  let customerRole = 'customer';
  if (customerDb) {
    const userSnap = await safeGet(async () => {
      const snap = await getDoc(doc(customerDb!, 'users', uid));
      return {
        exists: snap.exists(),
        data: snap.exists() ? (snap.data() as Record<string, unknown>) : undefined,
      };
    });
    if (userSnap.exists && userSnap.data?.role) {
      customerRole = String(userSnap.data.role);
    }
  }

  options.push({
    kind: 'customer',
    label: 'Customer Panel',
    description: 'Subscriptions, meals & account',
    url: PORTAL_LINKS.customerHome,
    roleLabel: customerRole,
  });

  options.push({
    kind: 'website',
    label: 'Stay on Website',
    description: 'Continue browsing Taaza Bites',
    url: typeof window !== 'undefined' ? window.location.origin : '/',
  });

  const primary: PortalKind =
    options.find((o) => o.kind === 'admin')?.kind ||
    options.find((o) => o.kind === 'delivery')?.kind ||
    'customer';

  return { uid, email: normalizedEmail, primary, options, adminRole, source: 'client' };
}

/**
 * Resolve portals: prefer admin `/api/me` (Phase 3), fall back to client multi-DB reads.
 */
export async function resolvePortalAccess(
  uid: string,
  email?: string | null
): Promise<PortalResolution> {
  const fromApi = await resolveViaApi(uid, email);
  if (fromApi?.options?.length) return fromApi;
  return resolveViaClient(uid, email);
}

export function redirectToPortal(option: PortalOption) {
  if (option.kind === 'website') return;
  window.location.assign(option.url);
}
