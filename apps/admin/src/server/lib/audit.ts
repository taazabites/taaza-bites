import { getFirebaseAdmin } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const logAudit = async (uid: string, action: string, details: any, ip: string, device: string) => {
  const { db } = getFirebaseAdmin();
  if (!db) return;

  try {
    await db.collection('auditLogs').add({
      uid,
      action,
      details,
      ip,
      device,
      timestamp: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};
