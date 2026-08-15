import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DeliveryStop } from "@/types";
import { mapDeliveryDoc } from "@/lib/mapDelivery";
import { isOpenStatus, startOfTodayMs } from "@/lib/status";
import { slotSortValue } from "@/lib/mapDelivery";
import { distanceKm } from "@/lib/routeUtils";

export function usePartnerDeliveries(partnerId?: string) {
  const [items, setItems] = useState<DeliveryStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setHere({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => undefined,
      { maximumAge: 60_000, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!partnerId) return;
    const q = query(collection(db, "deliveries"), where("partnerId", "==", partnerId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => mapDeliveryDoc(d.id, d.data() as Record<string, unknown>)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [partnerId]);

  const sortedOpen = useMemo(() => {
    const open = items.filter((d) => isOpenStatus(d.status));
    return [...open].sort((a, b) => {
      const slot = slotSortValue(a.deliverySlot) - slotSortValue(b.deliverySlot);
      if (slot) return slot;
      const area = a.deliveryArea.localeCompare(b.deliveryArea);
      if (area) return area;
      if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
      if (here && a.location && b.location) {
        return distanceKm(here, a.location) - distanceKm(here, b.location);
      }
      return a.createdAt - b.createdAt;
    });
  }, [items, here]);

  const today = useMemo(() => items.filter((d) => d.createdAt >= startOfTodayMs()), [items]);

  return { items, today, sortedOpen, loading, here };
}
