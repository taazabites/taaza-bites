import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { SubscriptionService, SubscriptionChangeService, AddressService, OrderService } from "../firebase/services";
import { Subscription, Address, Order } from "../firebase/collections";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  PauseCircle, 
  PlayCircle, 
  MapPin, 
  Clock, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  History,
  CreditCard,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Heart,
  ShieldAlert,
  RefreshCw,
  Eye,
  Sparkles,
  Flame,
  Activity,
  Coffee,
  Salad,
  Leaf,
  Moon,
  Check,
  FileText,
  Download
} from "lucide-react";
import { Card, Button } from "@/src/components/ui/primitives";
import { format, addDays, parseISO } from "date-fns";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import PauseSubscriptionModal from "../components/subscription/PauseSubscriptionModal";
import { CurrentPlanSnapshotCard } from "../components/dashboard/CurrentPlanSnapshotCard";
import { WeeklyMenuPreview } from "../components/subscription/WeeklyMenuPreview";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { SubscriptionActions } from "../firebase/subscription-actions";
import { useToast } from "@/src/context/ToastContext";
import { cn } from "@/src/lib/utils";
import { useNavigate } from "react-router-dom";
import { plansCache } from "../lib/plans-cache";
import { 
  doc, 
  onSnapshot,
  getDoc,
  getDocs,
  query, 
  collection, 
  where, 
  updateDoc, 
  serverTimestamp, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "../firebase/db";

export default function SubscriptionsPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Core Firestore Real-Time States
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [userDoc, setUserDoc] = useState<any>(null);
  
  // Auxiliary States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals & Sheets
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelStep, setCancelStep] = useState<'offer' | 'reason'>('offer');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showPlanDetailsModal, setShowPlanDetailsModal] = useState(false);
  const [showWeeklyMenu, setShowWeeklyMenu] = useState(false);
  const [isSkippedToday, setIsSkippedToday] = useState(false);
  const [isSkippingToday, setIsSkippingToday] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // Forms
  const [vacationData, setVacationData] = useState(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const defaultEnd = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    return { startDate: today, endDate: defaultEnd, reason: '' };
  });
  const [cancelReason, setCancelReason] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  // Theme observer
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('dashboard_theme') === 'dark';
    }
    return false;
  });

  // Observe theme changes from global state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const durations = { light: 15, medium: 30, heavy: 60 };
      navigator.vibrate(durations[type]);
    }
  };

  // 1. Real-time Firestore Sync Engine
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // A. Batch Fetch Subscription, User, Addresses, Orders
    const fetchStaticSubscriptionData = async () => {
      try {
        const subQ = query(
          collection(db, 'subscriptions'),
          where('userId', '==', currentUser.uid)
        );

        const [
          subSnap,
          userSnap,
          addrList,
          orderList
        ] = await Promise.all([
          getDocs(subQ),
          getDoc(doc(db, 'users', currentUser.uid)),
          AddressService.getAddresses(currentUser.uid),
          OrderService.getOrders(currentUser.uid, 5)
        ]);

        if (!subSnap.empty) {
          const subsList = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
          const currentSub = subsList.find(s => s.status === 'active') || 
                             subsList.find(s => s.status === 'paused') || 
                             subsList[0];
          setSubscription(currentSub || null);
          if (currentSub?.deliveryTime) {
            setDeliveryTime(currentSub.deliveryTime);
          }
        } else {
          setSubscription(null);
        }

        if (userSnap.exists()) {
          setUserDoc(userSnap.data());
        }

        setAddresses(addrList);
        setOrders(orderList);
      } catch (err) {
        console.error("Error fetching static subscription data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaticSubscriptionData();

    // B. Real-time Subscription Plans listener (using multiplexed caching layer)
    const unsubPlans = plansCache.subscribe(`subscriptions_page_${currentUser.uid}`, (allPlans) => {
      setPlans(allPlans);
    });

    return () => {
      unsubPlans();
    };
  }, [currentUser]);

  // Gentle Toast Notification when subscription is expiring in <= 3 days
  useEffect(() => {
    if (!subscription || subscription.status === 'cancelled') return;

    let daysLeft = 0;
    if (subscription.endDate) {
      const end = (subscription.endDate as any).toDate ? (subscription.endDate as any).toDate() : new Date(subscription.endDate as any);
      const diffTime = end.getTime() - Date.now();
      daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } else if (subscription.daysRemaining !== undefined) {
      daysLeft = subscription.daysRemaining;
    }

    if (daysLeft <= 3 && daysLeft >= 0) {
      const storageKey = `expiry_toast_notified_${subscription.id}_${daysLeft}`;
      const alreadyNotified = sessionStorage.getItem(storageKey);

      if (!alreadyNotified) {
        sessionStorage.setItem(storageKey, 'true');
        const dayWord = daysLeft === 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`;

        setTimeout(() => {
          showToast(
            `Your plan expires ${dayWord} — Renew now!`,
            "warning"
          );
        }, 1200);
      }
    }
  }, [subscription, showToast]);

  // Find corresponding plan details
  const activePlan = plans.find(p => p.id === subscription?.planId);

  // Pause modal activator
  const handlePauseWithDates = async (startDate: string, endDate: string, reason: string) => {
    if (!subscription) return;
    if (!startDate || !endDate) {
      showToast("Please enter valid start and end dates.", "error");
      return;
    }
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    if (d2 <= d1) {
      showToast("End date must be after start date.", "error");
      return;
    }
    setIsProcessing(true);
    triggerHaptic('heavy');
    try {
      const days = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      await SubscriptionChangeService.requestPause(currentUser.uid, subscription.id, startDate, endDate, days, reason);

      showToast("Pause request submitted for approval.", "success");
      setShowPauseModal(false);
    } catch (err) {
      showToast("Failed to pause subscription.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle active/paused cycle status
  const handleTogglePause = async () => {
    if (!subscription) return;
    setIsProcessing(true);
    triggerHaptic('heavy');
    try {
      if (subscription.status === 'active') {
        // This was the old immediate pause, now we use the modal instead.
        // But handleTogglePause is still needed for resume.
      } else {
        await SubscriptionChangeService.requestResume(currentUser!.uid, subscription.id);
        showToast("Resume request submitted for approval.", "success");
      }
    } catch (err) {
      showToast("Logistics protocol switch failed. Please retry.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Auto-Renewal state in Firestore (Requirement 8 - No Mock Data, persistent)
  const handleToggleAutoRenew = async () => {
    if (!subscription) return;
    setIsProcessing(true);
    triggerHaptic('medium');
    const currentAutoRenew = (subscription as any).autoRenew !== false; // default true
    try {
      await updateDoc(doc(db, 'subscriptions', subscription.id), {
        autoRenew: !currentAutoRenew,
        updatedAt: serverTimestamp()
      });
      showToast(`Auto-renewal ${!currentAutoRenew ? 'enabled' : 'disabled'} successfully!`, "success");
    } catch (err) {
      showToast("Auto-renewal state update failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Save updated delivery time window
  const handleUpdateDeliveryTime = async () => {
    if (!subscription || !deliveryTime) return;
    setIsProcessing(true);
    triggerHaptic('light');
    try {
      await SubscriptionActions.changeDeliveryTime(currentUser!.uid, subscription.id, deliveryTime);
      showToast("Preferred delivery window updated successfully.", "success");
      setShowTimeModal(false);
    } catch (err) {
      showToast("Failed to adjust preferred slot.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Vacation mode activator
  const handleVacationMode = async () => {
    if (!subscription) return;
    if (!vacationData.startDate || !vacationData.endDate) {
      showToast("Please enter valid start and end calendar dates.", "error");
      return;
    }
    const d1 = new Date(vacationData.startDate);
    const d2 = new Date(vacationData.endDate);
    if (d2 <= d1) {
      showToast("End date must be after start date.", "error");
      return;
    }
    setIsProcessing(true);
    triggerHaptic('medium');
    try {
      const days = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      await SubscriptionChangeService.requestPause(
        currentUser!.uid,
        subscription.id,
        vacationData.startDate,
        vacationData.endDate,
        days,
        `Vacation: ${vacationData.reason || 'Not Specified'}`
      );
  
      showToast("Vacation mode requested. We'll confirm within 2 hours.", "success");
      setShowVacationModal(false);
    } catch (err) {
      showToast("Vacation mode setup failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Skip Today's Meal
  const handleSkipToday = async () => {
    if (!subscription?.id || !currentUser?.uid) return;
    setIsSkippingToday(true);
    triggerHaptic('medium');
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      await SubscriptionActions.skipDay(currentUser.uid, subscription.id, todayStr);
      setIsSkippedToday(true);
      showToast("Today's delivery skipped. Meal credits remain on your plan.", "success");
    } catch (err) {
      showToast("Failed to skip today's delivery. Please try again.", "error");
    } finally {
      setIsSkippingToday(false);
    }
  };

  // Subscription Cancellation execution
  const handleCancelSubscription = async () => {
    if (!subscription || !cancelReason) return;
    setIsProcessing(true);
    triggerHaptic('heavy');
    try {
      await SubscriptionActions.cancel(currentUser!.uid, subscription.id, cancelReason);
      showToast("Subscription cancelled. We will miss feeding your health journey!", "success");
      setShowCancelModal(false);
      setCancelStep('offer');
    } catch (err) {
      showToast("Failed to cancel subscription.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delivery Address Selector
  const handleUpdateAddress = async (addressId: string) => {
    if (!subscription) return;
    setIsProcessing(true);
    triggerHaptic('light');
    try {
      const addr = addresses.find((a) => a.id === addressId);
      await SubscriptionActions.changeAddress(currentUser!.uid, subscription.id, addressId, addr as any);
      showToast("Delivery node address updated for future packages.", "success");
      setShowAddressModal(false);
    } catch (err) {
      showToast("Failed to shift delivery node.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-10 py-4">
          <div className="h-12 bg-zinc-200 dark:bg-zinc-850 rounded-[20px] w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 h-96 bg-zinc-200 dark:bg-zinc-850 rounded-[48px]" />
            <div className="h-96 bg-zinc-200 dark:bg-zinc-850 rounded-[48px]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- COMPUTE STATISTICS & DERIVED PROPERTIES ---
  const totalMeals = activePlan?.totalMeals || (subscription?.mealsPerDay || 1) * (activePlan?.durationDays || 30);
  const remainingMeals = subscription?.remainingMeals ?? 0;
  const deliveredMeals = Math.max(0, totalMeals - remainingMeals);
  const completionPercentage = totalMeals > 0 ? Math.round((deliveredMeals / totalMeals) * 100) : 0;

  // Calculate remaining days based on Firestore Timestamp
  const getDaysRemaining = () => {
    if (!subscription?.endDate) return 0;
    const end = (subscription.endDate as any).toDate ? (subscription.endDate as any).toDate() : new Date(subscription.endDate as any);
    const diffTime = end.getTime() - Date.now();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };
  const daysRemaining = getDaysRemaining();

  // Diet Type Badge details
  const getDietBadge = (diet: string) => {
    const dLower = (diet || '').toLowerCase();
    if (dLower.includes('non-veg') || dLower.includes('nonveg')) {
      return { label: "Non-Veg", style: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" };
    }
    if (dLower.includes('egg')) {
      return { label: "Eggitarian", style: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" };
    }
    return { label: "Veg Only", style: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" };
  };
  const dietBadge = getDietBadge(activePlan?.dietType || subscription?.caloriesTarget ? 'Veg' : 'Veg');

  // Time formatting handlers
  const formatDateSafe = (timestamp: any) => {
    if (!timestamp) return "TBD";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid Date";
      return format(date, "dd MMM yyyy");
    } catch (err) {
      return "TBD";
    }
  };

  // Active address finder
  const activeAddress = addresses.find(a => a.id === subscription?.deliveryAddressId);
  const deliveryAreaLabel = activeAddress ? `${activeAddress.area}, ${activeAddress.city}` : "Not Selected";

  // Macronutrient calculation estimates if not hard-coded (Requirement 3)
  const calories = activePlan?.calories;
  const protein = activePlan?.protein;
  const carbs = Math.round(calories * 0.45 / 4); // Standard healthy 45% Carb balance
  const fat = Math.round(calories * 0.25 / 9);  // Standard healthy 25% Fat balance

  return (
    <DashboardLayout>
      <div className={cn(
        "min-h-screen pb-16 space-y-10 transition-colors duration-500",
        isDark ? "text-zinc-100" : "text-zinc-900"
      )}>
        
        {/* Header Block */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">Your Active Subscription</span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter flex items-center gap-3">
              <Zap className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
              My Plan
            </h1>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
              Manage your daily meals, delivery address, auto-renew, and plan settings.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            {subscription && (
              <>
                <StatusBadge status={subscription.status} endDate={subscription.endDate} />
                {Number((subscription as any).deliveredMeals || subscription.mealsCompleted || 0) > 0 && (
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Day {Number((subscription as any).deliveredMeals || subscription.mealsCompleted)} Streak
                  </span>
                )}
              </>
            )}
          </div>
        </header>

        {/* Dynamic Empty State */}
        {!subscription ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={cn(
              "p-12 sm:p-20 border-dashed border-2 flex flex-col items-center text-center rounded-[3rem] transition-all",
              isDark 
                ? "bg-zinc-900/20 border-zinc-800 text-zinc-100" 
                : "bg-white border-zinc-200 text-zinc-900 shadow-sm"
            )}>
              <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mb-6">
                <Zap className="h-10 w-10 text-emerald-500 animate-pulse" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">No Active Subscription</h3>
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-3 max-w-md mb-8 leading-relaxed">
                {userDoc?.preferences?.goal 
                  ? `Pick up where you left off — your ${userDoc.preferences.goal} journey is waiting. Fresh meals from ₹99/day.`
                  : "Enjoy fresh, chef-cooked healthy meals delivered warm to your doorstep every day. Choose a meal plan to get started."}
              </p>
              <Button 
                onClick={() => { triggerHaptic('medium'); navigate("/plans"); }} 
                className="rounded-[1.5rem] px-8 py-6 h-auto font-black text-sm uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
              >
                Browse Plans
              </Button>
            </Card>
          </motion.div>
        ) : (
          
          <div className="space-y-8 pb-28 md:pb-0">

            {/* Expiry Banner */}
            {subscription && subscription.status === 'active' && daysRemaining <= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">
                    Your plan expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. Renew now to keep your daily meals coming!
                  </p>
                </div>
                <Button 
                  onClick={() => { triggerHaptic('medium'); navigate("/plans"); }} 
                  className="w-full sm:w-auto rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest shadow-sm"
                >
                  Renew Now
                </Button>
              </motion.div>
            )}

            {/* Today's Delivery Prominent Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className={cn(
                "p-6 sm:p-8 rounded-[2.5rem] border shadow-lg relative overflow-hidden transition-all",
                isDark 
                  ? "bg-emerald-950/30 border-emerald-500/20 text-white" 
                  : "bg-emerald-50/70 border-emerald-200 text-zinc-900"
              )}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm">
                        <Salad className="w-3.5 h-3.5" /> Today's Delivery
                      </span>
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                        {format(new Date(), 'EEEE, dd MMMM')}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                      {isSkippedToday ? "Today's Delivery Skipped" : (subscription.planName || "Chef's Healthy High-Protein Lunch")}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        {subscription.deliveryTime || "12:00 PM - 01:30 PM"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        {deliveryAreaLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                    {isSkippedToday ? (
                      <span className="px-5 py-3 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black text-xs uppercase tracking-wider border border-amber-500/30">
                        ✓ Meal credit kept on plan
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setShowSkipConfirm(true)}
                        disabled={isSkippingToday || subscription.status === 'paused'}
                        className="w-full md:w-auto rounded-2xl border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-900 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-black text-xs uppercase tracking-wider py-4 h-auto"
                      >
                        {isSkippingToday ? "Skipping..." : "Skip Today's Meal"}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      onClick={() => setShowAddressModal(true)}
                      className="w-full md:w-auto rounded-2xl text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 py-4 h-auto"
                    >
                      Change Address
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Top Compact Current Plan Snapshot */}
            <CurrentPlanSnapshotCard
              subscription={{
                ...subscription,
                status: subscription?.status,
                daysRemaining: subscription?.daysRemaining,
                totalMeals: subscription?.totalMeals || subscription?.planSnapshot?.totalMeals,
                mealCredits: subscription?.mealsRemaining ?? subscription?.remainingMeals,
                deliveryTime: subscription?.deliveryTime || subscription?.deliveryTiming,
                planName: subscription?.planSnapshot?.planName || subscription?.planName
              } as any}
              onManagePreferences={() => {
                const element = document.getElementById('plan-preferences-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />

            {/* Main Dashboard Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Column 1 & 2: Main Premium Subscription Card (Requirement 1, 2, 3) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Premium Card Container */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden group"
              >
                {/* Immersive Glassmorphic Card (Requirement 7) */}
                <Card className={cn(
                  "p-6 sm:p-10 rounded-[3rem] border backdrop-blur-2xl transition-all duration-500 shadow-2xl relative overflow-hidden",
                  isDark 
                    ? "bg-zinc-900/60 border-white/10 text-zinc-100" 
                    : "bg-white/80 border-zinc-200/50 text-zinc-900"
                )}>
                  
                  {/* Decorative glowing backdrops */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                  
                  {/* CARD SECTION 1: Plan Header */}
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-zinc-200/50 dark:border-white/10">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-md">
                          {activePlan?.durationDays || 30}-Day Plan
                        </span>
                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md border", dietBadge.style)}>
                          {dietBadge.label}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-md">
                          {activePlan?.goal || "Weight Loss & Fitness"}
                        </span>
                      </div>
                      
                      <h2 className="text-3xl sm:text-4xl font-black tracking-tighter">
                        {subscription.planName || activePlan?.name || "Premium Health Meal Plan"}
                      </h2>
                      
                      <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                        Subscriber: <span className="text-zinc-700 dark:text-zinc-300 font-extrabold">{userDoc?.displayName || currentUser?.displayName || "Valued Member"}</span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right space-y-1.5 shrink-0 w-full sm:w-auto">
                      <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Plan Price</p>
                      <div className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                        ₹{(activePlan?.offerPrice || activePlan?.price)?.toLocaleString() || '—'}
                      </div>
                      <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Paid &bull; {subscription.mealsPerDay || 1} Meal(s) Daily</p>
                    </div>
                  </div>

                  {/* CARD SECTION 2: Interactive Realtime Progress Metrics */}
                  <div className="relative z-10 py-8 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{deliveredMeals}</span>
                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">/ {totalMeals} total meals received</span>
                      </div>
                      <div className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                        {completionPercentage}% Complete
                      </div>
                    </div>

                    {/* Animated Progress Bar Container */}
                    <div className="relative h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200/30 dark:border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-indigo-500 rounded-full shadow-lg relative"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center pt-2">
                      <div className="bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl p-3 border border-zinc-200/20 dark:border-white/5">
                        <p className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Total Plan</p>
                        <p className="text-base font-black mt-1">{totalMeals} Meals</p>
                      </div>
                      <div className="bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl p-3 border border-zinc-200/20 dark:border-white/5">
                        <p className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Delivered</p>
                        <p className="text-base font-black mt-1 text-emerald-600 dark:text-emerald-400">{deliveredMeals} Meals</p>
                      </div>
                      <div className="bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl p-3 border border-zinc-200/20 dark:border-white/5">
                        <p className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Remaining</p>
                        <p className="text-base font-black mt-1 text-indigo-500 dark:text-indigo-400">{remainingMeals} Meals</p>
                      </div>
                    </div>
                  </div>

                  {/* CARD SECTION 3: Detailed Macronutrient Calibration Grid */}
                  <div className="relative z-10 py-8 border-t border-zinc-200/50 dark:border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Daily Nutrition Targets (Estimated)</h4>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 italic">Approx. per day</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Calories */}
                      <div className="p-4 rounded-3xl bg-orange-500/5 border border-orange-500/10 text-center relative overflow-hidden group/macro hover:scale-[1.03] transition-all">
                        <Flame className="h-5 w-5 text-orange-500 mx-auto opacity-70 group-hover/macro:scale-110 transition-transform" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-2">Daily Calories</p>
                        <p className="text-xl font-black mt-1 text-orange-500">{calories} kcal</p>
                      </div>

                      {/* Protein */}
                      <div className="p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-center relative overflow-hidden group/macro hover:scale-[1.03] transition-all">
                        <Activity className="h-5 w-5 text-emerald-500 mx-auto opacity-70 group-hover/macro:scale-110 transition-transform" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-2">Daily Protein</p>
                        <p className="text-xl font-black mt-1 text-emerald-500">{protein}g</p>
                      </div>

                      {/* Carbs */}
                      <div className="p-4 rounded-3xl bg-teal-500/5 border border-teal-500/10 text-center relative overflow-hidden group/macro hover:scale-[1.03] transition-all">
                        <Leaf className="h-5 w-5 text-teal-500 mx-auto opacity-70 group-hover/macro:scale-110 transition-transform" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-2">Daily Carbs</p>
                        <p className="text-xl font-black mt-1 text-teal-500">{carbs}g</p>
                      </div>

                      {/* Fat */}
                      <div className="p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 text-center relative overflow-hidden group/macro hover:scale-[1.03] transition-all">
                        <Salad className="h-5 w-5 text-amber-500 mx-auto opacity-70 group-hover/macro:scale-110 transition-transform" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-2">Daily Fats</p>
                        <p className="text-xl font-black mt-1 text-amber-500">{fat}g</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center italic">
                      *Estimated daily targets based on standard guidelines. Actual nutritional values vary per daily meal menu.
                    </p>
                  </div>

                  {/* CARD SECTION 4: Comprehensive Details Matrix */}
                  <div className="relative z-10 py-8 border-t border-zinc-200/50 dark:border-white/10">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Subscription Details
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-zinc-150/50 dark:border-white/5">
                          <span className="text-zinc-400 dark:text-zinc-500">Plan Type</span>
                          <span>{(activePlan?.durationDays || 30) >= 30 ? "Monthly Meal Subscription" : "Weekly Meal Subscription"}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-150/50 dark:border-white/5">
                          <span className="text-zinc-400 dark:text-zinc-500">Meals Per Day</span>
                          <span>{subscription.mealsPerDay || activePlan?.mealsPerDay || 1} Meal(s)</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-150/50 dark:border-white/5">
                          <span className="text-zinc-400 dark:text-zinc-500">Start Date</span>
                          <span className="font-mono">{formatDateSafe(subscription.startDate)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-150/50 dark:border-white/5">
                          <span className="text-zinc-400 dark:text-zinc-500">End Date</span>
                          <span className="font-mono">{formatDateSafe(subscription.endDate)}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-zinc-150/50 dark:border-white/5">
                          <span className="text-zinc-400 dark:text-zinc-500">Time Window</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{subscription.deliveryTime || "12:00 PM - 01:30 PM"}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-150/50 dark:border-white/5">
                          <span className="text-zinc-400 dark:text-zinc-500">Delivering To</span>
                          <span className="truncate max-w-[150px]">{deliveryAreaLabel}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-150/50 dark:border-white/5">
                          <span className="text-zinc-400 dark:text-zinc-500">Payment Status</span>
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            Paid
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-150/50 dark:border-white/5">
                          <span className="text-zinc-400 dark:text-zinc-500">Days Remaining</span>
                          <span className={cn(
                            "font-black font-mono",
                            daysRemaining <= 3 ? "text-red-500 animate-pulse" : "text-emerald-500"
                          )}>
                            {daysRemaining} Days Left
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD SECTION 5: Action Buttons Block with Clear Visual Hierarchy */}
                  <div className="relative z-10 pt-8 border-t border-zinc-200/50 dark:border-white/10 flex flex-col sm:flex-row gap-3">
                    
                    {/* Primary action changes dynamically if expiring soon */}
                    {daysRemaining <= 3 ? (
                      <>
                        <Button 
                          onClick={() => { triggerHaptic('medium'); navigate(`/plans?mode=renew&subscriptionId=${subscription.id}`); }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-5 h-auto font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                        >
                          Renew Subscription
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => subscription.status === 'active' ? setShowPauseModal(true) : handleTogglePause()}
                          disabled={isProcessing}
                          className="flex-1 border-zinc-200/80 hover:bg-zinc-50 text-zinc-900 dark:border-white/10 dark:text-white dark:hover:bg-white/5 rounded-2xl py-5 h-auto font-black text-xs uppercase tracking-widest"
                        >
                          {subscription.status === 'active' ? 'Pause Plan' : 'Resume Plan'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => subscription.status === 'active' ? setShowPauseModal(true) : handleTogglePause()}
                          disabled={isProcessing}
                          className={cn(
                            "flex-1 rounded-2xl py-5 h-auto font-black text-xs uppercase tracking-widest transition-all",
                            subscription.status === 'active' 
                              ? "bg-zinc-900 text-white hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100" 
                              : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/10"
                          )}
                        >
                          {isProcessing ? (
                            <>Updating Plan...</>
                          ) : (
                            subscription.status === 'active' ? (
                              <><PauseCircle className="mr-2 h-4.5 w-4.5" /> Pause Plan</>
                            ) : (
                              <><PlayCircle className="mr-2 h-4.5 w-4.5" /> Resume Plan</>
                            )
                          )}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => { triggerHaptic('medium'); navigate(`/plans?mode=upgrade&subscriptionId=${subscription.id}`); }}
                          className="flex-1 border-zinc-200/80 hover:bg-zinc-50 text-zinc-900 dark:border-white/10 dark:text-white dark:hover:bg-white/5 rounded-2xl py-5 h-auto font-black text-xs uppercase tracking-widest"
                        >
                          Renew / Upgrade
                        </Button>
                      </>
                    )}

                    {/* View Full Plan Modal Trigger */}
                    <Button 
                      variant="ghost"
                      onClick={() => { triggerHaptic('light'); setShowPlanDetailsModal(true); }}
                      className="flex-1 text-emerald-600 hover:text-emerald-500 hover:bg-emerald-500/5 rounded-2xl py-5 h-auto font-black text-xs uppercase tracking-widest"
                    >
                      <Eye className="mr-2 h-4.5 w-4.5" /> Plan details
                    </Button>
                  </div>

                </Card>
              </motion.div>

              {/* Delivery Settings Management */}
              <section id="plan-preferences-section" className="space-y-6">
                <h3 className="text-xl font-black flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  Delivery Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Address Selector */}
                  <Card className={cn(
                    "p-6 rounded-[2rem] border transition-all duration-300 group hover:scale-[1.01]",
                    isDark ? "bg-zinc-900/40 border-white/5 text-white" : "bg-white border-zinc-200/50 text-zinc-900 shadow-xs"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <button 
                        onClick={() => { triggerHaptic('light'); setShowAddressModal(true); }}
                        className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Change Address
                      </button>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Delivering To</p>
                    <p className="text-sm font-bold line-clamp-2">
                      {activeAddress ? `${activeAddress.houseNumber} ${activeAddress.street}, ${activeAddress.area}, ${activeAddress.city}` : "No address selected"}
                    </p>
                  </Card>

                  {/* Delivery Hours Selector */}
                  <Card className={cn(
                    "p-6 rounded-[2rem] border transition-all duration-300 group hover:scale-[1.01]",
                    isDark ? "bg-zinc-900/40 border-white/5 text-white" : "bg-white border-zinc-200/50 text-zinc-900 shadow-xs"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                        <Clock className="h-5 w-5" />
                      </div>
                      <button 
                        onClick={() => { triggerHaptic('light'); setShowTimeModal(true); }}
                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Change Time
                      </button>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Time Window</p>
                    <p className="text-sm font-bold">
                      {subscription.deliveryTime || "12:00 PM - 01:30 PM"}
                    </p>
                  </Card>
                </div>
              </section>

            </div>

            {/* Column 3: Billing Logs, Auto-Renew, and Vacation Controls */}
            <div className="space-y-8">
              
              {/* Auto-Renewal Card */}
              <Card className={cn(
                "p-8 rounded-[3rem] text-center border relative overflow-hidden shadow-xl",
                isDark ? "bg-zinc-900/40 border-white/5 text-white" : "bg-emerald-50/50 border-emerald-100 text-zinc-900"
              )}>
                <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/5">
                  <History className="h-7 w-7" />
                </div>
                <h4 className="text-lg font-black tracking-tight">Auto-Renew Subscription</h4>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-2 mb-4 leading-relaxed">
                  {subscription.status === 'active' ? (
                    <>Auto-renews on <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{formatDateSafe(subscription.endDate)}</span> for <span className="font-extrabold">₹{(activePlan?.offerPrice || activePlan?.price)?.toLocaleString() || '—'}</span>.</>
                  ) : (
                    <>Auto renewal paused until your subscription is resumed.</>
                  )}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-6 italic">
                  You can turn auto-renew off anytime before your cycle end date with zero extra charges.
                </p>

                {/* Interactive Auto-Renew Toggle */}
                <div className="flex items-center justify-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Disabled</span>
                  <button 
                    onClick={handleToggleAutoRenew}
                    disabled={isProcessing}
                    className={cn(
                      "w-12 h-7 rounded-full transition-colors relative p-1 cursor-pointer focus:outline-none flex items-center",
                      (subscription as any).autoRenew !== false ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                    )}
                  >
                    <motion.div 
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-5 h-5 bg-white rounded-full shadow-md"
                      animate={{ x: (subscription as any).autoRenew !== false ? 20 : 0 }}
                    />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Enabled</span>
                </div>
              </Card>

              {/* Weekly Menu Preview Card (Collapsible) */}
              <Card className={cn(
                "p-8 rounded-[3rem] border shadow-sm transition-all",
                isDark ? "bg-zinc-900/40 border-white/5 text-white" : "bg-white border-zinc-200/50 text-zinc-900"
              )}>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                      <Salad className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      Weekly Menu
                    </h3>
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      Preview fresh upcoming daily dishes
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => { triggerHaptic('light'); setShowWeeklyMenu(!showWeeklyMenu); }}
                    className="rounded-2xl text-xs font-black uppercase tracking-wider border-zinc-200 dark:border-white/10"
                  >
                    {showWeeklyMenu ? "Hide Menu" : "View Menu"}
                  </Button>
                </div>

                <AnimatePresence>
                  {showWeeklyMenu && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-zinc-100 dark:border-white/5"
                    >
                      <WeeklyMenuPreview goal={subscription.planName || 'Healthy Lifestyle'} dietPreference="Vegetarian" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Subscription Order Logs Panel */}
              <Card className={cn(
                "p-8 rounded-[3rem] border shadow-sm",
                isDark ? "bg-zinc-900/40 border-white/5 text-white" : "bg-white border-zinc-200/50 text-zinc-900"
              )}>
                <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-zinc-400" />
                  Subscription History
                </h3>
                
                <div className="space-y-6">
                  {orders.length === 0 ? (
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest text-center py-4">No recent payments</p>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="flex gap-4 group/item">
                        <div className="w-1 bg-zinc-100 dark:bg-zinc-800 rounded-full group-hover/item:bg-emerald-500 transition-colors" />
                        <div className="space-y-1.5 w-full">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-black">{order.planName || "Fresh Meal Subscription"}</p>
                            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {formatDateSafe(order.createdAt)} • ₹{order.amount} • {(order as any).paymentMethod || "Online Payment"}
                          </p>
                          <div className="text-[10px] font-bold text-zinc-500 flex items-center gap-1 mt-1">
                            <FileText className="w-3 h-3 shrink-0" /> Order #{order.id.substring(0, 8).toUpperCase()}
                            <button onClick={() => { triggerHaptic('light'); showToast("Downloading invoice PDF...", "info"); }} className="ml-auto text-blue-500 hover:underline flex items-center gap-1"><Download className="w-3 h-3" /> Invoice</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Button 
                  variant="ghost" 
                  onClick={() => { triggerHaptic('light'); navigate("/dashboard/orders"); }}
                  className="w-full mt-8 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 rounded-2xl py-3"
                >
                  View All Orders & Invoices
                </Button>
              </Card>

              {/* Danger & Vacation Zones */}
              <Card className={cn(
                "p-8 rounded-[3rem] border",
                isDark ? "bg-zinc-900/10 border-white/5" : "bg-rose-50/20 border-rose-100"
              )}>
                <h4 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">Pause or Cancel Plan</h4>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-2 mb-6 leading-relaxed">
                  Going on vacation or need to temporarily pause your deliveries? Manage your plan options below.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={() => { triggerHaptic('medium'); setShowVacationModal(true); }}
                    className="w-full rounded-2xl border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-900 dark:text-white font-black text-xs uppercase tracking-widest py-4 h-auto shadow-sm"
                  >
                    <Calendar className="mr-2 h-4 w-4 text-indigo-500" /> Set Vacation Mode
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => { triggerHaptic('heavy'); setShowCancelModal(true); }}
                    className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-500/5 font-black text-xs uppercase tracking-widest py-4 h-auto"
                  >
                    Cancel Plan
                  </Button>
                </div>
              </Card>

            </div>

          </div>
          </div>
        )}

      </div>

      {/* MODAL 1: Preferred Time Window */}
      <AnimatePresence>
        {showTimeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full shadow-2xl border transition-all",
                isDark ? "bg-zinc-950 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              <h3 className="text-2xl font-black tracking-tight mb-2">Delivery Time Window</h3>
              <p className="text-zinc-500 text-xs font-bold mb-8">Select your preferred time slot for daily meal deliveries.</p>
              
              <div className="space-y-4">
                {[
                  "07:00 AM - 08:30 AM",
                  "12:00 PM - 01:30 PM",
                  "07:00 PM - 08:30 PM"
                ].map(slot => (
                  <button
                    key={slot}
                    onClick={() => { triggerHaptic('light'); setDeliveryTime(slot); }}
                    className={cn(
                      "w-full p-5 rounded-2xl border-2 text-left transition-all font-black text-sm relative flex items-center justify-between",
                      deliveryTime === slot 
                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" 
                        : "border-zinc-100 dark:border-white/5 hover:border-zinc-200 text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    <span>{slot}</span>
                    {deliveryTime === slot && <Check className="h-4.5 w-4.5 text-emerald-500" />}
                  </button>
                ))}
              </div>

              <p className="text-zinc-500 text-xs font-bold mb-4 mt-6">Meal preference</p>
              <div className="grid grid-cols-2 gap-2">
                {['Breakfast', 'Lunch', 'Dinner', 'All Meals'].map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={async () => {
                      if (!currentUser?.uid || !subscription?.id) return;
                      try {
                        await SubscriptionActions.changeMealPreference(currentUser.uid, subscription.id, [pref]);
                        showToast('Meal preference updated', 'success');
                      } catch {
                        showToast('Could not update meal preference. Retry.', 'error');
                      }
                    }}
                    className="rounded-2xl border border-zinc-200 dark:border-white/10 py-3 text-xs font-black uppercase tracking-widest"
                  >
                    {pref}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowTimeModal(false)}
                  className="rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest"
                >
                  Dismiss
                </Button>
                <Button 
                  onClick={handleUpdateDeliveryTime}
                  disabled={isProcessing}
                  className="rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                >
                  {isProcessing ? "Saving..." : "Update Node"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Vacation Period Setup */}
      <AnimatePresence>
        {showVacationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full shadow-2xl border transition-all",
                isDark ? "bg-zinc-950 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              <h3 className="text-2xl font-black tracking-tight mb-2">Configure Vacation</h3>
              <p className="text-zinc-500 text-xs font-bold mb-8">We will freeze your subscription cycles and auto-renew dates automatically.</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Start Date</label>
                    <input 
                      type="date" 
                      min={format(new Date(), 'yyyy-MM-dd')}
                      className={cn(
                        "p-4 rounded-2xl border-2 outline-none font-bold text-sm",
                        isDark 
                          ? "bg-zinc-900 border-white/5 text-white focus:border-emerald-500" 
                          : "bg-white border-zinc-100 focus:border-emerald-500"
                      )}
                      value={vacationData.startDate}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        let newEnd = vacationData.endDate;
                        if (!newEnd || new Date(newEnd) <= new Date(newStart)) {
                          try {
                            newEnd = format(addDays(parseISO(newStart), 7), 'yyyy-MM-dd');
                          } catch {
                            newEnd = newStart;
                          }
                        }
                        setVacationData({ ...vacationData, startDate: newStart, endDate: newEnd });
                      }}
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">End Date</label>
                    <input 
                      type="date" 
                      min={vacationData.startDate || format(new Date(), 'yyyy-MM-dd')}
                      className={cn(
                        "p-4 rounded-2xl border-2 outline-none font-bold text-sm",
                        isDark 
                          ? "bg-zinc-900 border-white/5 text-white focus:border-emerald-500" 
                          : "bg-white border-zinc-100 focus:border-emerald-500"
                      )}
                      value={vacationData.endDate}
                      onChange={(e) => setVacationData({ ...vacationData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 flex flex-col">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Reason (optional)</label>
                  <textarea 
                    placeholder="e.g. Traveling to Himalayan Retreat"
                    className={cn(
                      "p-4 rounded-2xl border-2 outline-none font-bold text-sm min-h-[100px] resize-none",
                      isDark 
                        ? "bg-zinc-900 border-white/5 text-white focus:border-emerald-500" 
                        : "bg-white border-zinc-100 focus:border-emerald-500"
                    )}
                    value={vacationData.reason}
                    onChange={(e) => setVacationData({ ...vacationData, reason: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowVacationModal(false)}
                  className="rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest"
                >
                  Dismiss
                </Button>
                <Button 
                  onClick={handleVacationMode}
                  disabled={isProcessing}
                  className="rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                >
                  {isProcessing ? "Setting..." : "Confirm Vacation"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Subscription Cancellation */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full shadow-2xl border transition-all",
                isDark ? "bg-zinc-950 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              {cancelStep === 'offer' ? (
                <>
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mb-6">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-2xl font-black tracking-tight mb-2">Before You Cancel...</h3>
                  <p className="text-zinc-500 text-xs font-bold leading-relaxed mb-6">
                    Did you know you can pause your plan or set vacation mode anytime? You won't lose your locked-in discount rate or meal credits!
                  </p>

                  <div className="space-y-3 mb-6">
                    <Button
                      onClick={() => { setShowCancelModal(false); setShowVacationModal(true); }}
                      className="w-full rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                    >
                      <Calendar className="mr-2 h-4 w-4" /> Set Vacation Dates
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => { setShowCancelModal(false); setShowPauseModal(true); }}
                      className="w-full rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest border-zinc-200 dark:border-white/10"
                    >
                      <PauseCircle className="mr-2 h-4 w-4" /> Pause Subscription
                    </Button>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-white/5">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowCancelModal(false)}
                      className="text-xs font-bold text-zinc-400"
                    >
                      Keep Active
                    </Button>
                    <button 
                      onClick={() => setCancelStep('reason')}
                      className="text-xs font-bold text-rose-500 hover:underline"
                    >
                      I still want to cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
                     <AlertCircle className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-2xl font-black tracking-tight mb-2 text-rose-500">Cancel Subscription</h3>
                  <p className="text-zinc-500 text-xs font-bold mb-6">
                    Please let us know why you wish to cancel so we can improve.
                  </p>
                  
                  <div className="space-y-2 mb-8 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Reason for Cancellation</label>
                    <select 
                      className={cn(
                        "p-4 rounded-2xl border-2 outline-none font-bold text-sm appearance-none",
                        isDark 
                          ? "bg-zinc-900 border-white/5 text-white focus:border-emerald-500" 
                          : "bg-white border-zinc-100 focus:border-emerald-500"
                      )}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    >
                      <option value="">Select a reason</option>
                      <option value="Too expensive / budget constraints">Too expensive / budget constraints</option>
                      <option value="Traveling or moving location">Traveling or moving location</option>
                      <option value="Want to try different meal options">Want to try different meal options</option>
                      <option value="Delivery timing issues">Delivery timing issues</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => setCancelStep('offer')}
                      className="rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest"
                    >
                      Back
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={isProcessing || !cancelReason}
                      className="rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest bg-rose-600 hover:bg-rose-500 text-white"
                    >
                      {isProcessing ? "Cancelling..." : "Confirm Cancel"}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Delivery Node selector (Address Selector) */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full shadow-2xl border transition-all",
                isDark ? "bg-zinc-950 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              <h3 className="text-2xl font-black tracking-tight mb-6">Change Delivery Address</h3>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {addresses.map(address => (
                  <button
                    key={address.id}
                    onClick={() => handleUpdateAddress(address.id)}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 text-left transition-all relative",
                      subscription?.deliveryAddressId === address.id 
                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" 
                        : "border-zinc-100 dark:border-white/5 hover:border-zinc-200 text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    <p className="text-sm font-black">{address.houseNumber} {address.street}</p>
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-1">{address.area}, {address.city}</p>
                    {subscription?.deliveryAddressId === address.id && (
                      <span className="absolute top-4 right-4 text-emerald-500">
                        <CheckCircle2 className="h-5 w-5 fill-emerald-500 text-white" />
                      </span>
                    )}
                  </button>
                ))}
                
                <button 
                  onClick={() => { triggerHaptic('light'); navigate("/dashboard/addresses"); }}
                  className="w-full p-5 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-white/10 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Delivery Address
                </button>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => setShowAddressModal(false)}
                className="w-full mt-6 rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest"
              >
                Dismiss
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: Comprehensive Full Plan Details (Requirement 4 detail viewer) */}
      <AnimatePresence>
        {showPlanDetailsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "rounded-[3rem] p-8 sm:p-10 max-w-lg w-full shadow-2xl border transition-all max-h-[90vh] overflow-y-auto",
                isDark ? "bg-zinc-950 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Plan Details</span>
                  <h3 className="text-3xl font-black tracking-tighter mt-1">{activePlan?.name || subscription.planName || "Plan Summary"}</h3>
                </div>
                <button 
                  onClick={() => setShowPlanDetailsModal(false)}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6 text-sm">
                
                {/* Description block */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-3xl border border-zinc-100 dark:border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Plan Description</h4>
                  <p className="font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {activePlan?.description || "A customized diet plan designed to help you reach your health goals with fresh, premium ingredients."}
                  </p>
                </div>

                {/* Technical stats bento list */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Meals Target Volume</p>
                    <p className="text-base font-black mt-1 text-emerald-600 dark:text-emerald-400">{activePlan?.totalMeals || totalMeals} Total Units</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Calibrated Ingresses</p>
                    <p className="text-base font-black mt-1 text-indigo-500 dark:text-indigo-400">{activePlan?.mealsPerDay || 1} Meal(s) Per Day</p>
                  </div>
                </div>

                {/* Features & Benefits Check list */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Plan Benefits Include:</h4>
                  <div className="space-y-2.5">
                    {(activePlan?.features && activePlan.features.length > 0 ? activePlan.features : [
                      "Nutritionist-approved macro-balanced meals",
                      "Fresh warm meals delivered daily",
                      "Access to health progress tracking",
                      "Flexible plan with free pauses & address changes"
                    ]).map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2.5 font-bold">
                        <span className="p-1 rounded-full bg-emerald-500/15 text-emerald-500 shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick informational note */}
                <div className="flex gap-3 bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10 text-xs text-indigo-600 dark:text-indigo-400 font-bold leading-relaxed">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <span>
                    Your plan complies with TaazaBites quality standards. All meals are packed in food-safe insulated containers.
                  </span>
                </div>

              </div>

              <Button 
                onClick={() => setShowPlanDetailsModal(false)}
                className="w-full mt-8 rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100"
              >
                Close Details
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Bar */}
      {subscription && (
        <div className="md:hidden fixed bottom-[72px] left-0 right-0 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200/50 dark:border-white/10 z-30">
          {daysRemaining <= 3 ? (
            <Button 
              onClick={() => { triggerHaptic('medium'); navigate("/plans"); }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20"
            >
              Renew Plan Now (₹{(activePlan?.offerPrice || activePlan?.price)?.toLocaleString() || '—'})
            </Button>
          ) : subscription.status === 'active' ? (
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowPauseModal(true)}
                disabled={isProcessing}
                className="flex-1 border-zinc-200/80 hover:bg-zinc-50 text-zinc-900 dark:border-white/10 dark:text-white dark:hover:bg-white/5 rounded-2xl py-4 h-auto font-black text-[10px] sm:text-xs uppercase tracking-widest"
              >
                <PauseCircle className="mr-1.5 h-4 w-4" /> Pause
              </Button>
              <Button 
                onClick={() => { triggerHaptic('medium'); navigate("/plans"); }}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 rounded-2xl py-4 h-auto font-black text-[10px] sm:text-xs uppercase tracking-widest"
              >
                Renew / Upgrade
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => handleTogglePause()}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/10"
            >
              {isProcessing ? "Updating..." : <><PlayCircle className="mr-2 h-4.5 w-4.5" /> Resume Plan</>}
            </Button>
          )}
        </div>
      )}

      {/* MODAL 6: Pause Subscription (Requirement: date range) */}
      <PauseSubscriptionModal 
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        onPause={handlePauseWithDates}
        isProcessing={isProcessing}
        isDark={isDark}
      />

      <ConfirmDialog
        open={showSkipConfirm}
        title="Skip today?"
        description="Today’s scheduled meals will be skipped in Firestore and those credits stay on your subscription."
        confirmLabel="Skip today"
        loading={isSkippingToday}
        onConfirm={async () => {
          await handleSkipToday();
          setShowSkipConfirm(false);
        }}
        onClose={() => setShowSkipConfirm(false)}
      />

    </DashboardLayout>
  );
}
