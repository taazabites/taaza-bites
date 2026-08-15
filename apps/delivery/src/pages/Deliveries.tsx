import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { DeliveryAssignment, OrderStatus } from "@/types";
import {
  normalizeMealSlot,
  getSlotTimingStatus,
  slotStatusLabel,
  optimizeRouteOrder,
  buildGoogleDirectionsUrl,
} from "@/lib/routeUtils";
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Navigation,
  Utensils,
  AlertTriangle,
  Leaf,
  Drumstick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const TABS = ["All", "Breakfast", "Lunch", "Dinner"] as const;

export default function Deliveries() {
  const { user, profile } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [optimized, setOptimized] = useState(false);

  useEffect(() => {
    if (!user) return;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "deliveryAssignments"),
      where("partnerId", "==", user.uid),
      where("createdAt", ">=", startOfDay.getTime())
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: DeliveryAssignment[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as DeliveryAssignment));
        list.sort((a, b) => {
          if (a.isPriority && !b.isPriority) return -1;
          if (!a.isPriority && b.isPriority) return 1;
          return (a.routeOrder || 999) - (b.routeOrder || 999) || a.createdAt - b.createdAt;
        });
        setDeliveries(list);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsubscribe();
  }, [user]);

  const active = useMemo(
    () => deliveries.filter((d) => !["delivered", "failed", "returned", "rejected"].includes(d.status)),
    [deliveries]
  );
  const completed = useMemo(
    () => deliveries.filter((d) => ["delivered", "failed", "returned"].includes(d.status)),
    [deliveries]
  );

  const filtered = useMemo(() => {
    if (tab === "All") return active;
    return active.filter((d) => normalizeMealSlot(d.mealType) === tab);
  }, [active, tab]);

  const updateStatus = async (id: string, newStatus: OrderStatus, extra: Record<string, unknown> = {}) => {
    try {
      await updateDoc(doc(db, "deliveryAssignments", id), {
        status: newStatus,
        updatedAt: Date.now(),
        ...extra,
      });
      toast.success(`Marked ${newStatus.replace(/_/g, " ")}`);
    } catch {
      toast.error("Could not update status");
    }
  };

  const optimize = () => {
    const ordered = optimizeRouteOrder(filtered.length ? filtered : active);
    setDeliveries((prev) => {
      const map = new Map(ordered.map((d) => [d.id, d.routeOrder]));
      return prev
        .map((d) => (map.has(d.id) ? { ...d, routeOrder: map.get(d.id) } : d))
        .sort((a, b) => (a.routeOrder || 999) - (b.routeOrder || 999));
    });
    setOptimized(true);
    toast.success("Route optimized: Kitchen → stops → Kitchen");
  };

  const openOptimizedMaps = () => {
    const stops = optimizeRouteOrder(filtered.length ? filtered : active);
    window.open(buildGoogleDirectionsUrl(stops), "_blank");
  };

  const reportCantReach = async (delivery: DeliveryAssignment) => {
    const attempts = (delivery.cantReachAttempts || 0) + 1;
    try {
      await updateDoc(doc(db, "deliveryAssignments", delivery.id), {
        cantReachAttempts: attempts,
        updatedAt: Date.now(),
      });
      await addDoc(collection(db, "partnerIssueReports"), {
        partnerId: user?.uid,
        partnerName: profile?.name,
        type: "customer_unavailable",
        message: `Can't reach customer (attempt ${attempts})`,
        assignmentId: delivery.id,
        createdAt: Date.now(),
        status: "open",
      });
      toast.success(attempts >= 2 ? "Admin alerted — can't reach customer" : `Attempt ${attempts} logged`);
    } catch {
      toast.error("Failed to log attempt");
    }
  };

  const reportMismatch = async (delivery: DeliveryAssignment) => {
    try {
      await addDoc(collection(db, "partnerIssueReports"), {
        partnerId: user?.uid,
        partnerName: profile?.name,
        type: "location_mismatch",
        message: "Customer GPS pin does not match address",
        assignmentId: delivery.id,
        location: delivery.location,
        createdAt: Date.now(),
        status: "open",
      });
      toast.success("Location mismatch reported to admin");
    } catch {
      toast.error("Could not report issue");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading deliveries...</div>;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">Today's Deliveries</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={optimize}>
            Optimize route
          </Button>
          <Button size="sm" onClick={openOptimizedMaps}>
            <Navigation className="size-4 mr-1" /> Maps
          </Button>
        </div>
      </div>

      {optimized && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          Stops sorted Kitchen → customers → Kitchen. Open Maps for traffic-aware navigation.
        </p>
      )}

      {/* Meal tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const count =
            t === "All"
              ? active.length
              : active.filter((d) => normalizeMealSlot(d.mealType) === t).length;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && completed.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-card rounded-2xl border border-dashed p-12 text-center">
          <Utensils className="size-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No deliveries assigned yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            When kitchen assigns orders, they appear here. Stay online.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onUpdateStatus={updateStatus}
              onNavigate={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${delivery.location.lat},${delivery.location.lng}&travelmode=driving`,
                  "_blank"
                )
              }
              onCall={() => window.open(`tel:${delivery.customerPhone}`)}
              onWhatsApp={() => {
                const p = delivery.customerPhone.startsWith("+")
                  ? delivery.customerPhone.replace("+", "")
                  : `91${delivery.customerPhone}`;
                window.open(`https://wa.me/${p}`, "_blank");
              }}
              onCantReach={() => reportCantReach(delivery)}
              onMismatch={() => reportMismatch(delivery)}
            />
          ))}

          {completed.length > 0 && tab === "All" && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Completed</h3>
              <div className="space-y-2 opacity-80">
                {completed.map((d) => (
                  <div key={d.id} className="bg-card rounded-xl border p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{d.customerName}</p>
                      <p className="text-xs text-muted-foreground">{d.orderId}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        d.status === "delivered" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const DeliveryCard: React.FC<{
  delivery: DeliveryAssignment;
  onUpdateStatus: (id: string, status: OrderStatus, extra?: Record<string, unknown>) => void;
  onNavigate: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
  onCantReach: () => void;
  onMismatch: () => void;
}> = ({ delivery, onUpdateStatus, onNavigate, onCall, onWhatsApp, onCantReach, onMismatch }) => {
  const timing = slotStatusLabel(getSlotTimingStatus(delivery.mealType));
  const ad = delivery.addressDetails;

  return (
    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden relative">
      {delivery.isPriority && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase">
          Priority
        </div>
      )}
      {delivery.routeOrder ? (
        <div className="absolute top-0 left-0 bg-zinc-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-br-lg">
          Stop #{delivery.routeOrder}
        </div>
      ) : null}

      <div className="p-4 border-b space-y-3">
        <div className="flex justify-between items-start gap-2 pt-1">
          <div className="flex items-start gap-3 min-w-0">
            <div className="size-11 rounded-full bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center font-bold text-primary">
              {delivery.customerPhotoUrl ? (
                <img src={delivery.customerPhotoUrl} alt="" className="size-full object-cover" />
              ) : (
                delivery.customerName.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold truncate">{delivery.customerName}</h3>
              <p className="text-sm text-muted-foreground">{delivery.customerPhone}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="size-3" /> {delivery.deliveryTimeSlot}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 space-y-1">
            <Link to={`/deliveries/${delivery.id}`} className="text-xs font-semibold text-primary hover:underline block">
              Details →
            </Link>
            <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${timing.color}`}>
              {timing.label}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
            {normalizeMealSlot(delivery.mealType)}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              delivery.isVeg !== false
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-red-50 text-red-700 border-red-100"
            }`}
          >
            {delivery.isVeg !== false ? <Leaf className="size-3" /> : <Drumstick className="size-3" />}
            {delivery.isVeg !== false ? "Veg" : "Non-Veg"}
          </span>
          {delivery.subscriptionDay && (
            <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
              Day {delivery.subscriptionDay}
            </span>
          )}
        </div>

        <div className="text-sm bg-muted/40 p-3 rounded-xl space-y-1">
          <p className="font-medium flex items-start gap-2">
            <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
            <span>
              {ad?.type && <span className="font-bold">{ad.type}: </span>}
              {delivery.deliveryAddress}
              {(ad?.flatNumber || ad?.building || ad?.floor) && (
                <span className="block text-xs text-muted-foreground mt-1">
                  {[ad.flatNumber && `Flat ${ad.flatNumber}`, ad.building, ad.floor && `Floor ${ad.floor}`]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
              {ad?.landmark && <span className="block text-xs">Landmark: {ad.landmark}</span>}
              {ad?.gateInstructions && <span className="block text-xs">Gate: {ad.gateInstructions}</span>}
              {ad?.securityInstructions && (
                <span className="block text-xs">Security: {ad.securityInstructions}</span>
              )}
              <span className="block font-semibold mt-1">
                {delivery.area}, {delivery.pincode}
              </span>
            </span>
          </p>
        </div>

        <div className="text-sm">
          <p className="font-semibold flex items-center gap-2">
            <Utensils className="size-4 text-orange-500" />
            {delivery.mealName || delivery.mealItems?.join(", ") || delivery.mealType}
          </p>
          {delivery.customerNotes && (
            <p className="text-xs text-blue-700 mt-1 bg-blue-50 rounded-lg px-2 py-1.5">
              Instructions: {delivery.customerNotes}
            </p>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-wrap gap-2 border-b bg-zinc-50/80">
        <Button size="sm" variant="outline" onClick={onCall}>
          <Phone className="size-3.5 mr-1" /> Call
        </Button>
        <Button size="sm" variant="outline" onClick={onWhatsApp}>
          <MessageCircle className="size-3.5 mr-1" /> WhatsApp
        </Button>
        <Button size="sm" variant="outline" onClick={onNavigate}>
          <Navigation className="size-3.5 mr-1" /> Navigate
        </Button>
        <Button size="sm" variant="outline" className="text-amber-700 border-amber-200" onClick={onCantReach}>
          Can't reach
        </Button>
        <Button size="sm" variant="ghost" className="text-red-600" onClick={onMismatch}>
          <AlertTriangle className="size-3.5 mr-1" /> GPS mismatch
        </Button>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {delivery.status === "assigned" && (
          <div className="flex gap-2">
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => onUpdateStatus(delivery.id, "accepted")}>
              Accept
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-red-600"
              onClick={() => {
                const reason = window.prompt("Reject reason:");
                if (reason) onUpdateStatus(delivery.id, "rejected", { rejectReason: reason });
              }}
            >
              Reject
            </Button>
          </div>
        )}
        {delivery.status === "accepted" && (
          <Button onClick={() => onUpdateStatus(delivery.id, "picked_up")}>Confirm kitchen pickup</Button>
        )}
        {delivery.status === "picked_up" && (
          <Button onClick={() => onUpdateStatus(delivery.id, "out_for_delivery")}>Out for delivery</Button>
        )}
        {(delivery.status === "out_for_delivery" || delivery.status === "picked_up") && (
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link to={`/deliveries/${delivery.id}`}>Complete with OTP + photo</Link>
          </Button>
        )}
        {!["delivered", "failed", "returned", "rejected"].includes(delivery.status) && (
          <Button
            variant="outline"
            className="text-red-600"
            onClick={() => {
              const reason = window.prompt("Failure reason (food damaged / wrong package / unavailable…):");
              if (reason) onUpdateStatus(delivery.id, "failed", { failureReason: reason });
            }}
          >
            Mark failed
          </Button>
        )}
      </div>
    </div>
  );
};
