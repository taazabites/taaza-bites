"use client";

import { useState, useEffect } from "react";
import { db } from '@/src/firebase/db';
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/src/context/AuthContext";

export interface Subscription {
  id: string;
  planName: string;
  status: "active" | "paused" | "cancelled";
  mealsRemaining: number;
  totalMeals: number;
  nextDelivery: string;
  dailyTarget: {
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Real-time listener for the user's active subscription document
    const subRef = doc(db, "subscriptions", user.uid);
    
    const unsubscribe = onSnapshot(subRef, (docSnap) => {
      if (docSnap.exists()) {
        setSubscription({ id: docSnap.id, ...docSnap.data() } as Subscription);
      } else {
        setSubscription(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching subscription:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { subscription, loading };
}
