import { db } from '@/src/firebase/db';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";

export interface Subscription {
  planId: string;
  planName: string;
  status: "active" | "paused" | "cancelled" | "expired" | "pending";
  mealsPerDay: number;
  caloriesTarget: number;
  deliveryTiming: string;
  startDate: string | any;
  endDate: string | any;
  daysRemaining: number;
  totalDays: number;
  razorpaySubscriptionId?: string;
  userId: string;
}

export const getSubscription = async (userId: string): Promise<Subscription | null> => {
  const ref = doc(db, "subscriptions", userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as Subscription;
  }
  return null;
};

export const subscribeToSubscription = (userId: string, callback: (sub: Subscription | null) => void) => {
  return onSnapshot(doc(db, "subscriptions", userId), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as Subscription);
    } else {
      callback(null);
    }
  });
};

export const updateSubscription = async (userId: string, data: Partial<Subscription>) => {
  const ref = doc(db, "subscriptions", userId);
  await updateDoc(ref, data);
};
