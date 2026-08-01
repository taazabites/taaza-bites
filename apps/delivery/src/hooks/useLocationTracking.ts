import { useEffect, useRef } from "react";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

// Haversine formula to calculate distance between two coordinates in kilometers
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function useLocationTracking(isOnline: boolean) {
  const { user } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);
  const lastPushTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!user || !isOnline) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      lastLocationRef.current = null;
      lastPushTimeRef.current = 0;
      return;
    }

    if (!("geolocation" in navigator)) {
      console.error("Geolocation is not supported by your browser");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, speed } = position.coords;
        const now = Date.now();
        
        let calculatedSpeed = speed || 0;
        let distanceCovered = 0;

        if (lastLocationRef.current) {
          const { lat: lastLat, lng: lastLng, timestamp: lastTime } = lastLocationRef.current;
          distanceCovered = getDistanceFromLatLonInKm(lastLat, lastLng, latitude, longitude);
          
          if (speed === null) {
             const timeDiffInHours = (now - lastTime) / (1000 * 60 * 60);
             if (timeDiffInHours > 0) {
                 calculatedSpeed = distanceCovered / timeDiffInHours;
             }
          }
        }

        // Push to tracking collection every 30 seconds
        if (now - lastPushTimeRef.current >= 30000) {
          lastPushTimeRef.current = now;
          lastLocationRef.current = { lat: latitude, lng: longitude, timestamp: now };

          try {
            // Log to deliveryTracking
            addDoc(collection(db, "deliveryTracking"), {
              partnerId: user.uid,
              location: { lat: latitude, lng: longitude },
              speed: calculatedSpeed,
              distanceCovered: distanceCovered,
              timestamp: serverTimestamp()
            });

            // Also update the current partner doc for instant view
            updateDoc(doc(db, "deliveryPartners", user.uid), {
              location: {
                lat: latitude,
                lng: longitude,
              },
              speed: calculatedSpeed,
              lastLocationUpdate: now,
              isOnline: true
            });

            // Update stats if we moved
            if (distanceCovered > 0) {
                // In a real application, we might want to batch this or use Cloud Functions to aggregate distance.
                updateDoc(doc(db, "deliveryPartners", user.uid, "stats", "current"), {
                    completedKm: increment(distanceCovered)
                }).catch(statsErr => console.error("Error updating stats", statsErr));
            }
          } catch (error) {
            console.error("Error updating location:", error);
          }
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user, isOnline]);
}
