/** Emails allowed to bootstrap Super Admin (must match firestore.rules isSuperAdmin) */
export const SUPER_ADMIN_EMAILS = [
  '143bhosur@gmail.com',
  'admin@taazabites.in',
] as const;

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim() as (typeof SUPER_ADMIN_EMAILS)[number]);
}

export function buildSuperAdminProfile(uid: string, email: string, name?: string | null) {
  return {
    id: uid,
    email: email.toLowerCase().trim(),
    role: 'Super Admin' as const,
    name: name || 'Super Admin',
    status: 'Active' as const,
    createdAt: new Date().toISOString(),
  };
}
