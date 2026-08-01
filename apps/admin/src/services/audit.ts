import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SUSPEND' | 'ACTIVATE' | 'EXPORT';

export const auditService = {
  async logAction(
    userId: string, 
    userEmail: string, 
    action: AuditAction, 
    resource: string, 
    details?: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        userId,
        userEmail,
        action,
        resource,
        details: details || '',
        timestamp: serverTimestamp(),
        ipAddress: 'client-side-omitted' // Typically handled via Cloud Functions in production
      });
    } catch (error) {
      // We don't want audit log failures to break the main application flow, but they should be monitored
      console.error("Failed to write audit log:", error);
    }
  }
};
