import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { emailInviteId } from '../lib/staff-invites';
import { buildSuperAdminProfile, isSuperAdminEmail } from '../lib/super-admin';
import { User } from '../types';

/**
 * Resolve admin profile for a Firebase user:
 * 1) admins/{uid}
 * 2) Super Admin email allowlist bootstrap
 * 3) Claim pending adminInvites/{emailSlug}
 * 4) Migrate legacy admins/{emailSlug} → admins/{uid}
 */
export async function resolveOrClaimAdminProfile(
  uid: string,
  email?: string | null,
  displayName?: string | null
): Promise<User | null> {
  const direct = await getDoc(doc(db, 'admins', uid));
  if (direct.exists()) {
    return { id: uid, ...direct.data() } as User;
  }

  if (isSuperAdminEmail(email)) {
    const profile = buildSuperAdminProfile(uid, email || '', displayName);
    await setDoc(doc(db, 'admins', uid), profile, { merge: true });
    return profile as User;
  }

  if (!email) return null;
  const emailLower = email.toLowerCase().trim();
  const inviteId = emailInviteId(emailLower);

  // Pending invite
  const inviteSnap = await getDoc(doc(db, 'adminInvites', inviteId));
  if (inviteSnap.exists()) {
    const invite = inviteSnap.data();
    if (invite.status === 'revoked') return null;
    if (invite.status === 'accepted' && invite.acceptedUid && invite.acceptedUid !== uid) {
      return null;
    }

    const profile = {
      id: uid,
      name: invite.name || displayName || emailLower.split('@')[0],
      email: emailLower,
      role: invite.role || 'Admin',
      status: invite.status === 'accepted' ? 'Active' : (invite.desiredStatus || 'Active'),
      createdAt: invite.createdAt || new Date().toISOString(),
      invitedVia: inviteId,
    };

    await setDoc(doc(db, 'admins', uid), profile, { merge: true });
    await setDoc(
      doc(db, 'adminInvites', inviteId),
      {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        acceptedUid: uid,
      },
      { merge: true }
    );
    return profile as User;
  }

  // Legacy email-slug admin doc
  const legacySnap = await getDoc(doc(db, 'admins', inviteId));
  if (legacySnap.exists() && inviteId !== uid) {
    const data = legacySnap.data();
    const profile = {
      id: uid,
      ...data,
      email: data.email || emailLower,
      migratedFrom: inviteId,
    };
    await setDoc(doc(db, 'admins', uid), profile, { merge: true });
    try {
      await deleteDoc(doc(db, 'admins', inviteId));
    } catch {
      /* keep legacy if delete blocked */
    }
    return profile as User;
  }

  // Fallback: query by email field
  try {
    const q = query(collection(db, 'admins'), where('email', '==', emailLower), limit(1));
    const qs = await getDocs(q);
    if (!qs.empty) {
      const found = qs.docs[0];
      if (found.id === uid) {
        return { id: uid, ...found.data() } as User;
      }
      const data = found.data();
      const profile = { id: uid, ...data, email: emailLower, migratedFrom: found.id };
      await setDoc(doc(db, 'admins', uid), profile, { merge: true });
      return profile as User;
    }
  } catch {
    /* rules may block list */
  }

  return null;
}
