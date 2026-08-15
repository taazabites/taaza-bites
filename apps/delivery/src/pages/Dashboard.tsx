import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { DeliveryAssignment, PartnerStats } from "@/types";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { normalizeMealSlot, getSlotTimingStatus, slotStatusLabel } from "@/lib/routeUtils";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  IndianRupee,
  Star,
  TrendingUp,
  AlertCircle,
  XCircle,
  Navigation,
  QrCode,
  Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const SHIFT = { start: "07:00", end: "21:00" };

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<PartnerStats>({
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    failedDeliveries: 0,
    performanceScore: 100,
    rating: 5.0,
    completedKm: 0,
    workingHours: 0,
  });
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useLocationTracking(isOnline);

  useEffect(() => {
    if (!user) return;

    const fetchStatus = async () => {
      try {
        const partnerDoc = await getDoc(doc(db, "deliveryPartners", user.uid));
        if (partnerDoc.exists() && partnerDoc.data().isOnline) {
          setIsOnline(!!partnerDoc.data().isOnline);
        }
      } catch (error) {
        console.error("Error fetching partner status:", error);
      }
    };
    fetchStatus();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "deliveryAssignments"),
      where("partnerId", "==", user.uid),
      where("createdAt", ">=", startOfDay.getTime())
    );

    const unsubscribeDeliveries = onSnapshot(
      q,
      (snapshot) => {
        let pending = 0;
        let completed = 0;
        let failed = 0;
        let todayPay = 0;
        const list: DeliveryAssignment[] = [];

        snapshot.forEach((docSnap) => {
          const data = { id: docSnap.id, ...docSnap.data() } as DeliveryAssignment;
          list.push(data);
          if (data.status === "delivered") {
            completed++;
            todayPay += (data as any).earning || 50;
          } else if (["failed", "returned"].includes(data.status)) {
            failed++;
          } else if (!["rejected"].includes(data.status)) {
            pending++;
          }
        });

        setAssignments(list);
        setStats((prev) => ({
          ...prev,
          pendingDeliveries: pending,
          completedDeliveries: completed,
          failedDeliveries: failed,
          todayEarnings: todayPay,
        }));
        setLoading(false);
      },
      () => setLoading(false)
    );

    const unsubscribeStats = onSnapshot(
      doc(db, "deliveryPartners", user.uid, "stats", "current"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStats((prev) => ({
            ...prev,
            weeklyEarnings: data.weeklyEarnings || prev.weeklyEarnings,
            monthlyEarnings: data.monthlyEarnings || prev.monthlyEarnings,
            performanceScore: data.performanceScore || prev.performanceScore,
            rating: data.rating || prev.rating,
            completedKm: data.completedKm || prev.completedKm,
            workingHours: data.workingHours || prev.workingHours,
          }));
        }
      }
    );

    return () => {
      unsubscribeDeliveries();
      unsubscribeStats();
    };
  }, [user]);

  const successPct = useMemo(() => {
    const done = stats.completedDeliveries + stats.failedDeliveries;
    if (!done) return 100;
    return Math.round((stats.completedDeliveries / done) * 100);
  }, [stats.completedDeliveries, stats.failedDeliveries]);

  const nextDelivery = useMemo(() => {
    const active = assignments
      .filter((d) => !["delivered", "failed", "returned", "rejected"].includes(d.status))
      .sort((a, b) => {
        if (a.isPriority && !b.isPriority) return -1;
        if (!a.isPriority && b.isPriority) return 1;
        return (a.routeOrder || 999) - (b.routeOrder || 999) || a.createdAt - b.createdAt;
      });
    return active[0] || null;
  }, [assignments]);

  const toggleOnlineStatus = async () => {
    if (!user) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      await updateDoc(doc(db, "deliveryPartners", user.uid), {
        isOnline: newStatus,
        lastOnlineChange: Date.now(),
      });
      toast.success(newStatus ? "You are now ONLINE" : "You are now OFFLINE");
    } catch {
      toast.error("Failed to update status");
      setIsOnline(!newStatus);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-5 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Online / Offline */}
      <div className="flex items-center justify-between bg-card p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-14 rounded-full bg-primary/10 overflow-hidden border-2 border-primary/20">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-xl font-bold text-primary">
                  {profile?.name?.charAt(0) || "P"}
                </div>
              )}
            </div>
            <div
              className={`absolute bottom-0 right-0 size-4 rounded-full border-2 border-white ${
                isOnline ? "bg-green-500" : "bg-zinc-400"
              }`}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold">{profile?.name || "Delivery Partner"}</h2>
            <p className={`text-sm font-semibold ${isOnline ? "text-green-600" : "text-zinc-500"}`}>
              {isOnline ? "🟢 Online" : "⚫ Offline"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Shift {SHIFT.start} – {SHIFT.end}
            </p>
          </div>
        </div>
        <Button
          variant={isOnline ? "outline" : "default"}
          onClick={toggleOnlineStatus}
          className={isOnline ? "border-green-500 text-green-600 hover:bg-green-50" : ""}
        >
          {isOnline ? "Go Offline" : "Go Online"}
        </Button>
      </div>

      {/* Today's metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric icon={<Package className="size-5 text-blue-500" />} value={stats.pendingDeliveries} label="Pending" />
        <Metric icon={<CheckCircle2 className="size-5 text-green-500" />} value={stats.completedDeliveries} label="Completed" />
        <Metric icon={<XCircle className="size-5 text-red-500" />} value={stats.failedDeliveries} label="Failed" />
        <Metric icon={<IndianRupee className="size-5 text-primary" />} value={`₹${stats.todayEarnings}`} label="Earnings today" />
        <Metric icon={<MapPin className="size-5 text-violet-500" />} value={`${stats.completedKm} km`} label="Distance" />
        <Metric icon={<TrendingUp className="size-5 text-emerald-500" />} value={`${successPct}%`} label="Success %" />
        <Metric icon={<Star className="size-5 text-amber-500" />} value={`${stats.performanceScore}%`} label="Delivery score" />
        <Metric icon={<Clock className="size-5 text-sky-500" />} value={`${stats.workingHours}h`} label="Hours" />
      </div>

      {/* Next delivery */}
      <div className="bg-card rounded-2xl border shadow-sm p-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Next delivery</h3>
        {nextDelivery ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-lg">{nextDelivery.customerName}</p>
              <p className="text-sm text-muted-foreground">
                {normalizeMealSlot(nextDelivery.mealType)} · {nextDelivery.deliveryTimeSlot}
              </p>
              <p className="text-sm mt-1 line-clamp-2">{nextDelivery.deliveryAddress}</p>
              {(() => {
                const s = slotStatusLabel(getSlotTimingStatus(nextDelivery.mealType));
                return (
                  <span className={`inline-block mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.color}`}>
                    {s.label}
                  </span>
                );
              })()}
            </div>
            <Button asChild>
              <Link to={`/deliveries/${nextDelivery.id}`}>
                <Navigation className="size-4 mr-2" /> Open
              </Link>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No pending deliveries right now.</p>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-14 justify-start" asChild>
          <Link to="/route">
            <Route className="size-5 mr-3 text-primary" />
            Smart route
          </Link>
        </Button>
        <Button variant="outline" className="h-14 justify-start" asChild>
          <Link to="/kitchen-handover">
            <QrCode className="size-5 mr-3 text-orange-500" />
            Kitchen handover
          </Link>
        </Button>
      </div>

      {stats.pendingDeliveries > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-900">
          <AlertCircle className="size-5 shrink-0 text-amber-600" />
          <p>
            You have <strong>{stats.pendingDeliveries}</strong> active stops. Use Smart Route before leaving the kitchen.
          </p>
        </div>
      )}
    </div>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="bg-card p-3.5 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
      <div className="mb-1.5">{icon}</div>
      <p className="text-xl font-bold leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1.5">{label}</p>
    </div>
  );
}
