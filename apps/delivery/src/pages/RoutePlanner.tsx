import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { DeliveryAssignment } from "@/types";
import {
  optimizeRouteOrder,
  buildGoogleDirectionsUrl,
  estimateRouteKm,
  normalizeMealSlot,
} from "@/lib/routeUtils";
import { Navigation, Route as RouteIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Default HSR kitchen pin — replace via admin settings later */
const KITCHEN = { lat: 12.9121, lng: 77.6446 };

export default function RoutePlanner() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryAssignment[]>([]);

  useEffect(() => {
    if (!user) return;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const q = query(
      collection(db, "deliveryAssignments"),
      where("partnerId", "==", user.uid),
      where("createdAt", ">=", startOfDay.getTime())
    );
    return onSnapshot(q, (snap) => {
      const list: DeliveryAssignment[] = [];
      snap.forEach((d) => {
        const data = { id: d.id, ...d.data() } as DeliveryAssignment;
        if (!["delivered", "failed", "returned", "rejected"].includes(data.status)) {
          list.push(data);
        }
      });
      setDeliveries(list);
    });
  }, [user]);

  const ordered = useMemo(() => optimizeRouteOrder(deliveries, KITCHEN), [deliveries]);
  const km = useMemo(() => estimateRouteKm(ordered, KITCHEN), [ordered]);
  const etaMin = Math.round(km * 4 + ordered.length * 3);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full space-y-5">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <RouteIcon className="size-6 text-primary" /> Smart Route
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kitchen → optimized stops → Kitchen. Opens Google Directions (traffic-aware).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold">{ordered.length}</p>
          <p className="text-[10px] uppercase font-semibold text-muted-foreground">Stops</p>
        </div>
        <div className="bg-card border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold">{km} km</p>
          <p className="text-[10px] uppercase font-semibold text-muted-foreground">Est. distance</p>
        </div>
        <div className="bg-card border rounded-2xl p-4 text-center col-span-2">
          <p className="text-2xl font-bold">~{etaMin} min</p>
          <p className="text-[10px] uppercase font-semibold text-muted-foreground">Est. round-trip</p>
        </div>
      </div>

      <div className="bg-card border rounded-2xl divide-y overflow-hidden">
        <div className="p-3 flex items-center gap-3 bg-emerald-50">
          <span className="size-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
            K
          </span>
          <div>
            <p className="font-semibold text-sm">Kitchen (start)</p>
            <p className="text-xs text-muted-foreground">HSR Layout cloud kitchen</p>
          </div>
        </div>
        {ordered.map((d, i) => (
          <div key={d.id} className="p-3 flex items-center gap-3">
            <span className="size-8 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">
                {d.customerName}
                {d.isPriority && (
                  <span className="ml-2 text-[10px] uppercase bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                    Priority
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {normalizeMealSlot(d.mealType)} · {d.area}
              </p>
            </div>
            <Link to={`/deliveries/${d.id}`} className="text-primary text-xs font-semibold shrink-0">
              Open <ArrowRight className="inline size-3" />
            </Link>
          </div>
        ))}
        <div className="p-3 flex items-center gap-3 bg-emerald-50">
          <span className="size-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
            K
          </span>
          <div>
            <p className="font-semibold text-sm">Kitchen (return)</p>
            <p className="text-xs text-muted-foreground">End of route</p>
          </div>
        </div>
      </div>

      <Button
        className="w-full h-12"
        disabled={!ordered.length}
        onClick={() => window.open(buildGoogleDirectionsUrl(ordered, KITCHEN), "_blank")}
      >
        <Navigation className="size-4 mr-2" />
        Open in Google Maps
      </Button>
    </div>
  );
}
