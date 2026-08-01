import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { SubscriptionPlan, Subscription } from '../types';
import { auditService } from './audit';


enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Ensure connection is active
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export const planService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
        const snapshot = await getDocs(collection(db, 'subscriptionPlans'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubscriptionPlan[];
  },
  /**
   * Subscribe to real-time plans updates.
   */
  subscribePlans(
    onUpdate: (plans: SubscriptionPlan[]) => void, 
    onError?: (err: any) => void
  ) {
    
    const path = 'subscriptionPlans';
    const plansRef = collection(db, path);
    
    return onSnapshot(
      plansRef,
      (snapshot) => {
        const plans = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SubscriptionPlan[];
        
        // Sort by displayOrder first, then name
        plans.sort((a, b) => {
          const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
          if (orderDiff !== 0) return orderDiff;
          return a.name.localeCompare(b.name);
        });
        
        onUpdate(plans);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (wrappedError) {
          if (onError) onError(wrappedError);
        }
      }
    );
  },

  /**
   * Subscribe to all subscriptions in real-time to calculate live customer counts,
   * active subscribers, and monthly revenue metrics.
   */
  subscribeAllSubscriptions(
    onUpdate: (subs: Subscription[]) => void,
    onError?: (err: any) => void
  ) {
    
    const path = 'subscriptions';
    const subsRef = collection(db, path);
    
    return onSnapshot(
      subsRef,
      (snapshot) => {
        const subs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Subscription[];
        onUpdate(subs);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (wrappedError) {
          if (onError) onError(wrappedError);
        }
      }
    );
  },

  /**
   * Create a new subscription plan
   */
  async createPlan(
    plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>,
    adminId: string,
    adminEmail: string
  ): Promise<string> {
    const path = 'subscriptionPlans';
    const now = new Date().toISOString();
    const newPlanData = {
      ...plan,
      createdAt: now,
      updatedAt: now
    };

    

    try {
      const plansRef = collection(db, path);
      const docRef = await addDoc(plansRef, newPlanData);
      
      await auditService.logAction(
        adminId,
        adminEmail,
        'CREATE',
        `Subscription Plan ${docRef.id}`,
        `Created plan "${plan.name}" with price ₹${plan.price}`
      );
      
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  /**
   * Update an existing subscription plan
   */
  async updatePlan(
    planId: string,
    updates: Partial<SubscriptionPlan>,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const path = `subscriptionPlans/${planId}`;
    const now = new Date().toISOString();
    
    

    try {
      const planRef = doc(db, 'subscriptionPlans', planId);
      const updatedData = {
        ...updates,
        updatedAt: now
      };
      
      // Clean undefined fields and id
      delete (updatedData as any).id;
      
      await updateDoc(planRef, updatedData);
      
      await auditService.logAction(
        adminId,
        adminEmail,
        'UPDATE',
        `Subscription Plan ${planId}`,
        `Updated plan fields: ${Object.keys(updates).join(', ')}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Delete a subscription plan
   */
  async deletePlan(
    planId: string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const path = `subscriptionPlans/${planId}`;
    
    try {
      const planRef = doc(db, 'subscriptionPlans', planId);
      
      // Get the plan name first for audit logging
      const planSnap = await getDoc(planRef);
      const planName = planSnap.exists() ? planSnap.data().name : planId;
      
      await deleteDoc(planRef);
      
      await auditService.logAction(
        adminId,
        adminEmail,
        'DELETE',
        `Subscription Plan ${planId}`,
        `Deleted plan "${planName}"`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Duplicate an existing plan
   */
  async duplicatePlan(
    planId: string,
    adminId: string,
    adminEmail: string
  ): Promise<string> {
    const path = `subscriptionPlans/${planId}`;
    const now = new Date().toISOString();

    

    try {
      const planRef = doc(db, 'subscriptionPlans', planId);
      const snap = await getDoc(planRef);
      if (!snap.exists()) throw new Error('Original plan not found');
      
      const original = snap.data() as SubscriptionPlan;
      const duplicateData = {
        ...original,
        name: `${original.name} Copy`,
        displayOrder: (original.displayOrder || 0) + 1,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, 'subscriptionPlans'), duplicateData);

      await auditService.logAction(
        adminId,
        adminEmail,
        'CREATE',
        `Subscription Plan ${docRef.id}`,
        `Duplicated plan "${original.name}" as "${duplicateData.name}"`
      );
      
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  }
};
