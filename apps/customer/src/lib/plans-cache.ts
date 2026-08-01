import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/db';
import { SubscriptionPlan } from '../firebase/collections';

type Callback<T> = (data: T) => void;

// Helper to recursively restore serialized Timestamps from localStorage
function restoreTimestamps(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(restoreTimestamps);
  }

  // If it's a serialized Timestamp, reconstruct it
  if (
    typeof obj.seconds === 'number' &&
    typeof obj.nanoseconds === 'number' &&
    Object.keys(obj).length === 2
  ) {
    return new Timestamp(obj.seconds, obj.nanoseconds);
  }

  const result: any = {};
  for (const key of Object.keys(obj)) {
    result[key] = restoreTimestamps(obj[key]);
  }
  return result;
}

class SubscriptionPlansCache {
  private cacheKey = 'taazabites_cache_subscriptionPlans';
  private currentCache: SubscriptionPlan[] = [];
  private subscribers: Map<string, Callback<SubscriptionPlan[]>> = new Map();
  private unsubscribeFromFirestore: (() => void) | null = null;
  private isInitialized = false;

  constructor() {
    // Attempt to load and hydrate from localStorage instantly
    try {
      const stored = localStorage.getItem(this.cacheKey);
      if (stored) {
        const rawData = JSON.parse(stored);
        this.currentCache = restoreTimestamps(rawData);
        this.isInitialized = true;
      }
    } catch (e) {
      console.warn('Failed to restore localStorage cache for subscriptionPlans:', e);
    }
  }

  // Get all cached plans synchronously
  getPlansSync(): SubscriptionPlan[] {
    return this.currentCache;
  }

  // Retrieve a specific plan by ID synchronously from the cache
  getPlanSync(id: string): SubscriptionPlan | null {
    return this.currentCache.find((p) => p.id === id) || null;
  }

  // Subscribe to updates. Multiple components calling this share ONE single active listener.
  subscribe(subscriberId: string, callback: Callback<SubscriptionPlan[]>): () => void {
    // Immediately invoke callback with cached data if available
    if (this.currentCache.length > 0) {
      callback(this.currentCache);
    }

    this.subscribers.set(subscriberId, callback);

    // If first subscriber, initiate Firestore connection
    if (!this.unsubscribeFromFirestore) {
      this.startFirestoreListener();
    }

    // Return the unsubscribe function
    return () => {
      this.subscribers.delete(subscriberId);
      
      // If no active subscribers left, clean up the listener to optimize connections
      if (this.subscribers.size === 0 && this.unsubscribeFromFirestore) {
        this.unsubscribeFromFirestore();
        this.unsubscribeFromFirestore = null;
      }
    };
  }

  private startFirestoreListener() {
    try {
      const q = query(
        collection(db, 'subscriptionPlans')
      );

      console.log("[SubscriptionPlansCache] Starting Firestore realtime listener for 'subscriptionPlans' collection (no ordering)...");
      console.log("[SubscriptionPlansCache] Firestore connected");

      this.unsubscribeFromFirestore = onSnapshot(q, 
        (snapshot) => {
          console.log("[SubscriptionPlansCache] Snapshot size:", snapshot.size);
          const fetchedPlans = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            console.log("[SubscriptionPlansCache] Every document:", docSnap.id, data);
            
            // Map active state dynamically to support both isAvailable (Firestore) and active (Admin Panels)
            const isAvailableVal = data.isAvailable !== undefined && data.isAvailable !== null ? data.isAvailable : undefined;
            const isActiveVal = data.active !== undefined && data.active !== null ? data.active : undefined;
            
            const isPlanActive = isAvailableVal !== undefined ? isAvailableVal : (isActiveVal !== undefined ? isActiveVal : false);
            
            const plan = {
              id: docSnap.id,
              ...data,
              active: isPlanActive,
              isAvailable: isAvailableVal !== undefined ? isAvailableVal : isPlanActive
            } as SubscriptionPlan;
            
            console.log("[SubscriptionPlansCache] Mapped plan:", plan);
            return plan;
          });

          // Sort plans safely
          fetchedPlans.sort((a, b) => {
            const displayA = (a as any).displayOrder;
            const displayB = (b as any).displayOrder;
            
            if (displayA !== undefined && displayB !== undefined) {
              return displayA - displayB;
            }
            
            // Fallback to name
            const nameA = a.name || "";
            const nameB = b.name || "";
            return nameA.localeCompare(nameB);
          });

          this.currentCache = fetchedPlans;
          this.isInitialized = true;

          // Sync back to persistent localStorage
          try {
            localStorage.setItem(this.cacheKey, JSON.stringify(fetchedPlans));
          } catch (e) {
            console.warn('Failed to save subscriptionPlans to localStorage:', e);
          }

          // Notify all active subscribers in real-time
          this.subscribers.forEach((cb) => {
            try {
              cb(fetchedPlans);
            } catch (err) {
              console.error('Error in subscriber callback:', err);
            }
          });
        },
        (error) => {
          console.error('[SubscriptionPlansCache] Realtime Firestore listener error:', error);
          
          // Log/Handle conforming to the standardized error specs
          try {
            handleFirestoreError(error, OperationType.GET, 'subscriptionPlans');
          } catch (thrownErr) {
            console.error('[SubscriptionPlansCache] Handled exception:', thrownErr);
          }

          // Fallback to cache to ensure continuous runtime availability
          if (this.currentCache.length > 0) {
            console.log('[SubscriptionPlansCache] Falling back to local cache of subscriptionPlans:', this.currentCache);
            this.subscribers.forEach((cb) => cb(this.currentCache));
          }
        }
      );
    } catch (err) {
      console.error('Failed to start subscriptionPlans Firestore listener:', err);
    }
  }
}

export const plansCache = new SubscriptionPlansCache();

export interface UseSubscriptionPlansOptions {
  activeOnly?: boolean;
}

export function useSubscriptionPlans(options: UseSubscriptionPlansOptions = {}) {
  const { activeOnly = false } = options;
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    const initial = plansCache.getPlansSync();
    return activeOnly ? initial.filter((p) => p.isAvailable ?? p.active ?? false) : initial;
  });
  const [loading, setLoading] = useState(() => plansCache.getPlansSync().length === 0);

  useEffect(() => {
    const subscriberId = `sub_${Math.random().toString(36).substring(2, 9)}`;
    
    const unsubscribe = plansCache.subscribe(subscriberId, (allPlans) => {
      let filtered = allPlans;
      if (activeOnly) {
        filtered = allPlans.filter((p) => {
          const isOk = p.isAvailable ?? p.active ?? false;
          console.log("[useSubscriptionPlans] Filtered plan:", p.id, isOk);
          return isOk;
        });
      }
      console.log("[useSubscriptionPlans] Final plans array:", filtered);
      setPlans(filtered);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [activeOnly]);

  return { plans, loading };
}
