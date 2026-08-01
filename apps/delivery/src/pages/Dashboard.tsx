import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { PartnerStats } from "@/types";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Navigation, 
  Package, 
  IndianRupee, 
  Star, 
  TrendingUp, 
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

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
    workingHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useLocationTracking(isOnline);

  useEffect(() => {
    if (!user) return;

    const fetchStatus = async () => {
      try {
        const partnerDoc = await getDoc(doc(db, "deliveryPartners", user.uid));
        if (partnerDoc.exists() && partnerDoc.data().isOnline) {
          setIsOnline(partnerDoc.data().isOnline);
        }
      } catch (error) {
        console.error("Error fetching partner status:", error);
      }
    };
    fetchStatus();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Listen to today's assignments
    const q = query(
      collection(db, "deliveryAssignments"),
      where("partnerId", "==", user.uid),
      where("createdAt", ">=", startOfDay.getTime())
    );

    const unsubscribeDeliveries = onSnapshot(q, (snapshot) => {
      let pending = 0;
      let completed = 0;
      let failed = 0;
      let todayPay = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (['delivered'].includes(data.status)) {
          completed++;
          todayPay += (data.earning || 50); // Fallback to 50 rs per delivery if not specified
        } else if (['failed', 'returned'].includes(data.status)) {
          failed++;
        } else {
          pending++;
        }
      });

      setStats(prev => ({
        ...prev,
        pendingDeliveries: pending,
        completedDeliveries: completed,
        failedDeliveries: failed,
        todayEarnings: todayPay
      }));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching deliveries:", error);
      setLoading(false);
    });

    // Listen to partner stats for weekly/monthly and rating
    const unsubscribeStats = onSnapshot(doc(db, "deliveryPartners", user.uid, "stats", "current"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats(prev => ({
          ...prev,
          weeklyEarnings: data.weeklyEarnings || prev.weeklyEarnings,
          monthlyEarnings: data.monthlyEarnings || prev.monthlyEarnings,
          performanceScore: data.performanceScore || prev.performanceScore,
          rating: data.rating || prev.rating,
          completedKm: data.completedKm || prev.completedKm,
          workingHours: data.workingHours || prev.workingHours
        }));
      }
    });

    return () => {
      unsubscribeDeliveries();
      unsubscribeStats();
    };
  }, [user]);

  const toggleOnlineStatus = async () => {
    if (!user) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      await updateDoc(doc(db, "deliveryPartners", user.uid), {
        isOnline: newStatus,
        lastOnlineChange: Date.now()
      });
      toast.success(newStatus ? "You are now ONLINE" : "You are now OFFLINE");
    } catch (error) {
      console.error("Error updating online status:", error);
      toast.error("Failed to update status");
      setIsOnline(!newStatus); // Revert on failure
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header Profile Section */}
      <div className="flex items-center justify-between bg-card p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-16 rounded-full bg-primary/10 overflow-hidden border-2 border-primary/20">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-xl font-bold text-primary">
                  {profile?.name?.charAt(0) || "P"}
                </div>
              )}
            </div>
            <div className={`absolute bottom-0 right-0 size-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-zinc-400'}`}></div>
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.name || "Delivery Partner"}</h2>
            <p className="text-sm text-muted-foreground">ID: {user?.uid.substring(0, 8).toUpperCase()}</p>
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
          <Package className="size-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats.pendingDeliveries}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending</p>
        </div>
        <div className="bg-card p-4 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="size-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats.completedDeliveries}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Completed</p>
        </div>
        <div className="bg-card p-4 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
          <IndianRupee className="size-6 text-primary mb-2" />
          <p className="text-2xl font-bold">₹{stats.todayEarnings}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Today's Pay</p>
        </div>
        <div className="bg-card p-4 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
          <Star className="size-6 text-yellow-500 mb-2 fill-yellow-500" />
          <p className="text-2xl font-bold">{stats.rating}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Rating</p>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Earnings Overview
          </h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4 divide-x">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-xl font-bold text-zinc-900 mt-1">₹{stats.weeklyEarnings}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-xl font-bold text-zinc-900 mt-1">₹{stats.monthlyEarnings}</p>
          </div>
        </div>
      </div>

      {/* Performance & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border shadow-sm p-4 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl">
            <Navigation className="size-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Distance Covered</p>
            <p className="text-xl font-bold">{stats.completedKm} km</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border shadow-sm p-4 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl">
            <Clock className="size-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Working Hours</p>
            <p className="text-xl font-bold">{stats.workingHours} hrs</p>
          </div>
        </div>
      </div>

      {/* Urgent Notifications or Alerts */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="size-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-semibold text-red-800">Ensure Hygiene Protocols</h4>
          <p className="text-sm text-red-600 mt-1">Please sanitize your hands before picking up the next order from the kitchen.</p>
        </div>
      </div>
    </div>
  );
}
