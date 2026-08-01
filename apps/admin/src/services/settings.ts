import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { auditService } from './audit';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error in settings service: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const settingsService = {
  /**
   * Listen to any settings document in real-time.
   * If the document does not exist yet, we invoke callback with the fallback data.
   */
  subscribeToDoc<T>(
    docId: string, 
    callback: (data: T) => void, 
    fallback: T
  ): () => void {
    const docRef = doc(db, 'settings', docId);
    
    return onSnapshot(
      docRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          callback({ ...fallback, ...snapshot.data() } as T);
        } else {
          callback(fallback);
        }
      }, 
      (error) => {
        handleFirestoreError(error, OperationType.GET, `settings/${docId}`);
      }
    );
  },

  /**
   * Save settings document to Firestore.
   */
  async saveDoc<T extends object>(
    docId: string, 
    data: T, 
    adminUser: { id: string; email: string; name: string } | null
  ): Promise<void> {
    const docRef = doc(db, 'settings', docId);
    const path = `settings/${docId}`;
    
    try {
      // Add standard timestamp or audit metadata
      const payload = {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUser?.email || 'system'
      };
      
      await setDoc(docRef, payload);
      
      // Log audit trail
      if (adminUser) {
        await auditService.logAction(
          adminUser.id,
          adminUser.email,
          'UPDATE',
          'SETTINGS',
          `Updated setting configuration for group: ${docId}`
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Get settings document snapshot statically (one-time fetch)
   */
  async getDocOnce<T>(docId: string, fallback: T): Promise<T> {
    const docRef = doc(db, 'settings', docId);
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...fallback, ...snap.data() } as T;
      }
      return fallback;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `settings/${docId}`);
      return fallback;
    }
  }
};
