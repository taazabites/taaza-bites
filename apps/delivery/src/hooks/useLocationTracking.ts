import { useEffect, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export function useLocationTracking(isOnline: boolean) {
  const { user } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const lastPushTimeRef = useRef(0);

  useEffect(() => {
    if (!user || !isOnline) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }
    if (!("geolocation" in navigator)) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastPushTimeRef.current < 60_000) return;
        lastPushTimeRef.current = now;
        updateDoc(doc(db, "deliveryPartners", user.uid), {
          location: { lat: position.coords.latitude, lng: position.coords.longitude },
          lastLocationUpdate: now,
        }).catch(() => undefined);
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 }
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [user, isOnline]);
}
