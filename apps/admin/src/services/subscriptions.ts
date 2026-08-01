import { collection, getDocs, query, orderBy, limit, doc, updateDoc, setDoc, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Subscription, SubscriptionPlan } from '../types';
import { auditService } from './audit';

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    
    const snapshot = await getDocs(collection(db, 'subscriptionPlans'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubscriptionPlan[];
  },
  subscribeToFilteredSubscriptions(
    callback: (subs: Subscription[]) => void, 
    filters: { branchId?: string, planId?: string, status?: string }
  ): () => void {
    let q = query(collection(db, 'subscriptions'));
    
    const constraints: any[] = [];
    if (filters.branchId) constraints.push(where('branchId', '==', filters.branchId));
    if (filters.planId) constraints.push(where('planId', '==', filters.planId));
    if (filters.status) constraints.push(where('status', '==', filters.status));
    
    if (constraints.length > 0) {
      q = query(collection(db, 'subscriptions'), ...constraints);
    }
    
    return onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[];
      callback(subs);
    }, (error) => {
      console.error("Error in filtered subscriptions listener:", error);
    });
  },
  
  async getSubscriptions(): Promise<Subscription[]> {
    
    try {
      const q = query(collection(db, 'subscriptions'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[];
    } catch (error) {
      console.error("Error fetching all subscriptions:", error);
      throw error;
    }
  },
  
  async updateSubscription(subId: string, data: Partial<Subscription>): Promise<void> {
    try {
      const subRef = doc(db, 'subscriptions', subId);
      await updateDoc(subRef, data);
    } catch (error: any) {
      console.error("Error updating subscription:", error);
      throw error;
    }
  },
  async getSubscriptionsByCustomerId(customerId: string): Promise<Subscription[]> {
    
    try {
      const q = query(collection(db, 'subscriptions'), where('customerId', '==', customerId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subscription[];
    } catch (error) {
      console.error("Error fetching customer subscriptions:", error);
      throw error;
    }
  },
  async getActiveSubscriptions(limitCount = 50): Promise<Subscription[]> {
    
    try {
      const q = query(
        collection(db, 'subscriptions'),
        where('status', 'in', ['Active', 'Paused']),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const subs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[];
      
      // Sort in-memory to prevent requiring a composite Firestore index
      return subs.sort((a, b) => {
        const dateA = new Date(a.nextBillingDate || 0).getTime();
        const dateB = new Date(b.nextBillingDate || 0).getTime();
        return dateA - dateB;
      });
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }
  },

  async updateSubscriptionStatus(
    subId: string, 
    status: 'Active' | 'Paused' | 'Cancelled' | 'Frozen',
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    try {
      const subRef = doc(db, 'subscriptions', subId);
      await updateDoc(subRef, { status });
      
      // Log this action
      await auditService.logAction(
        adminId, 
        adminEmail, 
        status === 'Cancelled' ? 'DELETE' : 'UPDATE', 
        `Subscription ${subId}`, 
        `Changed status to ${status}`
      );
    } catch (error: any) {
      console.error("Error updating subscription status:", error);
      throw error;
    }
  }
};
