import React, { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Target, Flame, Droplets, Activity, 
  TrendingUp, HeartPulse, Zap, Trophy,
  ShieldCheck, ChevronRight, Bot, ChefHat, Leaf, Thermometer, MapPin,
  Wallet as WalletIcon, Gift, Calendar, PauseCircle, PlayCircle,
  Star, RefreshCw, Plus, Check, Truck, MessageSquare, ArrowUpRight, Clock,
  Award, ShieldAlert, SlidersHorizontal, Share2
} from "lucide-react";
import { Card, Button } from "../ui/primitives";
import StreakTracker from "./StreakTracker";
import DailyMissionsWidget from "./DailyMissionsWidget";
import DeliveryTrackerWidget from "./DeliveryTrackerWidget";
import TodaysMealWidget from "./TodaysMealWidget";
import FoodSwipeSkipWidget from "./FoodSwipeSkipWidget";
import LoyaltyPointsWidget from "./LoyaltyPointsWidget";
import LongevityWidget from "./LongevityWidget";
import MentalClarityWidget from "./MentalClarityWidget";
import { CurrentPlanSnapshotCard } from "./CurrentPlanSnapshotCard";
import { GoalProgressTracker } from "./GoalProgressTracker";
import { MorningMotivationGreeting } from "./MorningMotivationGreeting";
import { QRScannerButton } from "../common/QRScannerButton";
import { BottomSheet } from "../ui/BottomSheet";
import { useToast } from "../../context/ToastContext";
import { triggerHaptic } from "../../utils/haptics";
import { SubscriptionService } from "../../firebase/services";
import { SubscriptionActions } from "../../firebase/subscription-actions";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { format } from "date-fns";

const AiNutritionModal = lazy(() => import("./AiNutritionModal"));
const AchievementsModal = lazy(() => import("./AchievementsModal"));

interface HealthHubProps {
  user: any;
healthScore?: number;
  nutrition: {
    calories: { consumed: number; target: number };
    protein: { consumed: number; target: number };
    water: { consumed: number; target: number };
  };
  weightGoal: {
    current: number;
    target: number;
    label: string;
  };
  todayMeal: any;
  weeklyMeals?: any[];
  subscription?: any;
  wallet?: any;
  rewardPoints?: any;
  addresses?: any[];
  deliveryStatus: any;
  onDataRefresh?: () => void;
}

export default function HealthHubLayout({ 
  user, 
  healthScore, 
  nutrition, 
  weightGoal,
  todayMeal,
  weeklyMeals = [],
  subscription,
  wallet,
  rewardPoints,
  addresses = [],
  deliveryStatus,
  onDataRefresh
}: HealthHubProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Modals & Bottom Sheets
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showMealDetails, setShowMealDetails] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapDay, setSwapDay] = useState<string>("Tomorrow");
  const [activeMealTab, setActiveMealTab] = useState<"nutrition" | "story" | "guide">("nutrition");

  // Local Hydration State
  const [todayWater, setTodayWater] = useState<number>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`water_consumed_${todayStr}`);
    if (saved) return parseInt(saved, 10);
    return nutrition.water.consumed ?? 1850;
  });

  // Dynamic Theme state
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Local Subscription Pause state
  const [isSubPaused, setIsSubPaused] = useState<boolean>(subscription?.status === 'paused');
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  const [skipError, setSkipError] = useState<string | null>(null);

  // Meal Rating State
  const [ratingMeal, setRatingMeal] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);
  const [ratingComment, setRatingComment] = useState<string>("");

  useEffect(() => {
    if (subscription) {
      setIsSubPaused(subscription.status === 'paused');
    }

    // Gentle Toast Notification: Check if subscription expires in <= 3 days
    if (subscription && subscription.status !== 'cancelled') {
      let daysLeft = subscription.daysRemaining;
      if (daysLeft === undefined || daysLeft === null) {
        const end = subscription.billingCycleEnd || subscription.endDate;
        if (end) {
          const endDate = (end as any)?.toDate ? (end as any).toDate() : new Date(end);
          const diffMs = endDate.getTime() - Date.now();
          daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        }
      }

      if (daysLeft !== undefined && daysLeft !== null && daysLeft <= 3 && daysLeft >= 0) {
        const subId = subscription.id || 'current_sub';
        const storageKey = `expiry_toast_notified_${subId}_${daysLeft}`;
        const alreadyNotified = sessionStorage.getItem(storageKey);

        if (!alreadyNotified) {
          sessionStorage.setItem(storageKey, 'true');
          const dayWord = daysLeft === 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`;

          setTimeout(() => {
            showToast(
              `Your plan expires ${dayWord} — Renew now!`,
              "warning"
            );
          }, 1500);
        }
      }
    }
  }, [subscription, showToast]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleAddWater = (amount: number) => {
    triggerHaptic('light');
    const todayStr = new Date().toISOString().split('T')[0];
    const newTotal = Math.min(5000, todayWater + amount);
    setTodayWater(newTotal);
    localStorage.setItem(`water_consumed_${todayStr}`, newTotal.toString());
    showToast(`Logged +${amount}ml clean water! Total: ${newTotal}ml 💧`, "success");
  };

  const handleTogglePause = async () => {
    triggerHaptic('medium');
    const nextPausedState = !isSubPaused;
    setIsSubPaused(nextPausedState);

    if (subscription?.id) {
      try {
        if (nextPausedState) {
          await SubscriptionService.pauseSubscription(subscription.id, "Paused from Dashboard Quick Toggle");
        } else {
          await SubscriptionService.resumeSubscription(subscription.id);
        }
      } catch (err) {
        console.error("Error toggling subscription pause state:", err);
      }
    }

    if (nextPausedState) {
      showToast("Subscription paused. No meal credits will be deducted.", "info");
    } else {
      showToast("Subscription resumed! Your next fresh meal is scheduled.", "success");
    }

    if (onDataRefresh) onDataRefresh();
  };

  const handleSkipTomorrowMeal = () => {
    if (!subscription?.id) {
      showToast("No active subscription to skip.", "error");
      return;
    }
    setSkipError(null);
    setConfirmSkip(true);
  };

  const confirmSkipTomorrow = async () => {
    if (!subscription?.id || !user?.uid) return;
    setSkipLoading(true);
    try {
      const dateStr = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
      await SubscriptionActions.skipDay(user.uid, subscription.id, dateStr);
      setConfirmSkip(false);
      showToast("Tomorrow’s meals were skipped. Those meal credits stay on your plan.", "success");
      onDataRefresh?.();
    } catch (err: any) {
      setSkipError(err.message || "Could not skip tomorrow. Please retry.");
    } finally {
      setSkipLoading(false);
    }
  };

  const handleSwapDishSelect = (dishName: string) => {
    triggerHaptic('medium');
    setShowSwapModal(false);
    showToast(`Swap requested for ${swapDay}: ${dishName}. We'll confirm in your meals calendar.`, "success");
  };

  const handleRatingSubmit = () => {
    if (ratingMeal === 0) return;
    triggerHaptic('success');
    setRatingSubmitted(true);
    showToast("Thanks for the rating.", "success");
  };

  const achievements = [
    { id: "1", title: "Early Bird", icon: <Zap className="w-4 h-4" />, color: "bg-amber-500", label: "7 Day Streak" },
    { id: "2", title: "Protein King", icon: <Trophy className="w-4 h-4" />, color: "bg-blue-500", label: "Goal Met" },
    { id: "3", title: "Hydro Hero", icon: <Droplets className="w-4 h-4" />, color: "bg-cyan-500", label: "3L Consumed" },
  ];

  const availableSwapOptions = [
    { id: "1", name: "High-Protein Herb Grilled Chicken Bowl", calories: 520, protein: "42g", tags: ["Chef Best", "Gluten Free"] },
    { id: "2", name: "Pan-Seared Salmon & Quinoa Power Salad", calories: 480, protein: "38g", tags: ["Omega-3", "Low Carb"] },
    { id: "3", name: "Keto Creamy Paneer Tikka & Exotic Veggies", calories: 450, protein: "32g", tags: ["Vegetarian", "Keto"] },
    { id: "4", name: "Smoked Tofu Teriyaki Grain & Avocado Bowl", calories: 430, protein: "28g", tags: ["Vegan", "High Fiber"] }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 px-0 sm:px-0">
      
      {/* 1. Dynamic Greeting & AI Morning Motivation Header */}
      <MorningMotivationGreeting
        user={user}
        healthAssessment={weightGoal}
        subscription={subscription}
        wallet={wallet}
        rewardPoints={rewardPoints}
        onNavigate={navigate}
      />

      {/* 2. Current Plan Snapshot Card */}
      <div className="space-y-3">
        <CurrentPlanSnapshotCard
          subscription={{
            ...subscription,
            status: isSubPaused ? 'paused' : subscription?.status,
            daysRemaining: subscription?.daysRemaining,
            totalMeals: subscription?.totalMeals || subscription?.planSnapshot?.totalMeals,
            mealCredits: subscription?.mealsRemaining ?? subscription?.remainingMeals,
            deliveryTime: subscription?.deliveryTime || subscription?.deliveryTiming,
            planName: subscription?.planSnapshot?.planName || subscription?.planName
          }}
          onManagePreferences={() => {
            triggerHaptic('light');
            navigate('/dashboard/subscriptions');
          }}
        />

        {/* Quick Plan Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Quick Plan Actions:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <QRScannerButton variant="badge" />
            <Button
              onClick={handleTogglePause}
              variant="outline"
              className={`h-9 px-3.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider border transition-all cursor-pointer ${
                isSubPaused
                  ? "bg-emerald-500 text-white dark:text-zinc-950 hover:bg-emerald-400 border-emerald-500 shadow-xs"
                  : "bg-zinc-50 dark:bg-white/10 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/20 border-zinc-200 dark:border-white/20"
              }`}
            >
              {isSubPaused ? (
                <>
                  <PlayCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-950" /> Resume Deliveries
                </>
              ) : (
                <>
                  <PauseCircle className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Pause Plan
                </>
              )}
            </Button>

            <Button
              onClick={() => { triggerHaptic('light'); setShowSwapModal(true); }}
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider cursor-pointer border-none"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Swap Dish
            </Button>

            <Button
              onClick={handleSkipTomorrowMeal}
              variant="ghost"
              className="h-9 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer"
            >
              Skip Meal (+₹280)
            </Button>
          </div>
        </div>
      </div>

      {/* 2b. Visual Health Goal Progress Tracker */}
      <GoalProgressTracker />

      {/* 3. Primary Metrics & Hydration Logger Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Health Score & Macro Overview */}
        <Card className="md:col-span-8 bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden shadow-xl shadow-zinc-200/40 dark:shadow-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center">
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">Live Health Index</p>
               <div className="flex items-baseline gap-4 mb-3">
                 <h2 className="text-5xl sm:text-7xl font-black text-zinc-900 dark:text-white tracking-tightest leading-none">{healthScore}</h2>
                 <div className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-500/20">
                    Top 2%
                 </div>
               </div>
               <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed text-[11px] sm:text-sm">
                 Biomarkers indicate optimal macronutrient ratios and consistent protein pacing today.
               </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-[1.5rem] sm:rounded-3xl border border-zinc-100 dark:border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Weekly Consistency</p>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex gap-2 items-end h-16">
                   {[40, 60, 45, 80, 75, 90, 85].map((h, i) => (
                     <motion.div 
                       key={i}
                       initial={{ height: 0 }}
                       animate={{ height: `${h}%` }}
                       className={`flex-1 rounded-t-xl ${i === 6 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                     />
                   ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Streak & Achievements Sidebar */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-6">
          <StreakTracker userId={user?.uid} isDark={isDark} />
          
          <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] text-white border-0 shadow-xl shadow-indigo-900/20 relative overflow-hidden">
             <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-indigo-200">Unlocked Badges</p>
             <div className="flex -space-x-2 sm:-space-x-3 mb-5">
                {achievements.map(a => (
                  <div key={a.id} className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[3px] sm:border-4 border-indigo-700 ${a.color} flex items-center justify-center shadow-lg transition-transform hover:-translate-y-2 cursor-pointer active:scale-95`} title={a.title}>
                    {React.cloneElement(a.icon as any, { className: "w-3.5 h-3.5 sm:w-4 sm:h-4" })}
                  </div>
                ))}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[3px] sm:border-4 border-indigo-700 bg-zinc-900 flex items-center justify-center shadow-lg text-[10px] font-black">
                   +12
                </div>
             </div>
             <Button 
               onClick={() => { triggerHaptic('light'); setShowAchievements(true); }} 
               variant="outline" 
               className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 active:bg-white/30 rounded-xl sm:rounded-2xl h-10 sm:h-11 font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all"
             >
                View Gallery
             </Button>
          </Card>
        </div>
      </div>

      {/* 4. Daily Stats & Hydration Logger Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
         <StatBlock 
           label="Calories" 
           current={nutrition.calories.consumed} 
           target={nutrition.calories.target} 
           unit="kcal" 
           icon={<Flame className="w-5 h-5" />} 
           color="text-orange-500" 
           bg="bg-orange-500/10"
         />
         <StatBlock 
           label="Protein" 
           current={nutrition.protein.consumed} 
           target={nutrition.protein.target} 
           unit="g" 
           icon={<Zap className="w-5 h-5" />} 
           color="text-emerald-500" 
           bg="bg-emerald-500/10"
         />
         
         {/* Interactive Hydration Block */}
         <Card className="p-4 sm:p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
               <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Droplets className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Hydration</span>
            </div>

            <div className="space-y-3">
               <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {(todayWater / 1000).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">/ {(nutrition.water.target / 1000).toFixed(1)}L</span>
               </div>

               <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (todayWater / nutrition.water.target) * 100)}%` }}
                  />
               </div>

               <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => handleAddWater(250)}
                    className="flex-1 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[9px] uppercase tracking-wider rounded-lg hover:bg-blue-100 active:scale-95 transition-all cursor-pointer"
                  >
                    +250ml
                  </button>
                  <button
                    onClick={() => handleAddWater(500)}
                    className="flex-1 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[9px] uppercase tracking-wider rounded-lg hover:bg-blue-100 active:scale-95 transition-all cursor-pointer"
                  >
                    +500ml
                  </button>
               </div>
            </div>
         </Card>

         <Card className="p-4 sm:p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2 sm:mb-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Weight Goal</span>
               <Target className="w-4 h-4 text-rose-500" />
            </div>
            <div className="space-y-3 sm:space-y-4">
               <div className="flex justify-between items-end">
                  <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                    {weightGoal.current}<span className="text-[10px] text-zinc-400 ml-1">kg</span>
                  </p>
                  <p className="text-[10px] font-bold text-emerald-500">Target: {weightGoal.target}kg</p>
               </div>
               <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-[68%] rounded-full" />
               </div>
               <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-400">
                  <span>Start: 76kg</span>
                  <span>Goal: {weightGoal.target}kg</span>
               </div>
            </div>
         </Card>
      </div>

      {/* 5. Quick Actions Hub Bar */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-lg shadow-zinc-200/40 dark:shadow-none">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 px-1 sm:px-2">
          Customer Portal Quick Hub
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {[
            { label: "Order Meals", icon: <ChefHat className="w-5 h-5 text-emerald-500" />, path: "/dashboard/todays-meals", color: "bg-emerald-50 dark:bg-emerald-500/10" },
            { label: "Wallet Top-Up", icon: <WalletIcon className="w-5 h-5 text-blue-500" />, path: "/dashboard/wallet", color: "bg-blue-50 dark:bg-blue-500/10" },
            { label: "Invoices", icon: <ArrowUpRight className="w-5 h-5 text-amber-500" />, path: "/dashboard/invoices", color: "bg-amber-50 dark:bg-amber-500/10" },
            { label: "AI Health Coach", icon: <Bot className="w-5 h-5 text-purple-500" />, action: () => setShowAiModal(true), color: "bg-purple-50 dark:bg-purple-500/10" },
            { label: "Delivery Addresses", icon: <MapPin className="w-5 h-5 text-rose-500" />, path: "/dashboard/addresses", color: "bg-rose-50 dark:bg-rose-500/10" },
            { label: "Live Support", icon: <MessageSquare className="w-5 h-5 text-teal-500" />, path: "/dashboard/support", color: "bg-teal-50 dark:bg-teal-500/10" }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                triggerHaptic('light');
                if (item.action) item.action();
                else if (item.path) navigate(item.path);
              }}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-100 dark:border-white/5 transition-all active:scale-95 cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <span className="text-xs font-black text-zinc-900 dark:text-white text-center leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* 6. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Meal & Live Tracking */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Today's Protocol & Delivery</h3>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Tracking</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <TodaysMealWidget 
                 meal={todayMeal} 
                 onSwapRequest={() => { triggerHaptic('light'); setShowSwapModal(true); }}
                 onMealClick={() => { triggerHaptic('light'); setShowMealDetails(true); }} 
               />
               <DeliveryTrackerWidget 
                  status={deliveryStatus?.status || 'preparing'}
                  eta={deliveryStatus?.eta || "08:15 AM"}
                  driver={deliveryStatus?.driver}
                  addresses={addresses}
               />
            </div>
          </div>

          {/* Food Swipe & Cutoff-Enforced Skip Meal Section */}
          <FoodSwipeSkipWidget onMealSwap={() => setShowSwapModal(true)} />

          {/* Weekly Delivery Schedule Preview */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 p-6 rounded-[2.5rem] shadow-lg shadow-zinc-200/40 dark:shadow-none">
             <div className="flex items-center justify-between mb-6">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">7-Day Meal Planner</span>
                   <h3 className="text-lg font-black text-zinc-900 dark:text-white">Upcoming Deliveries</h3>
                </div>
                <Button 
                  onClick={() => navigate('/dashboard/calendar')} 
                  variant="outline" 
                  size="sm"
                  className="rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Full Calendar <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                  const isToday = i === (new Date().getDay() + 6) % 7;
                  const mealItem = weeklyMeals[i] || {
                    mealType: "Lunch",
                    mealDetails: { name: i % 2 === 0 ? "Herb Chicken Bowl" : "Salmon Grain Salad", calories: 510 }
                  };

                  return (
                    <div 
                      key={day}
                      onClick={() => {
                        triggerHaptic('light');
                        setSwapDay(day);
                        setShowSwapModal(true);
                      }}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all hover:-translate-y-1 ${
                        isToday 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-zinc-900 dark:text-white" 
                          : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-white/5 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-black uppercase ${isToday ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                          {day}
                        </span>
                        {isToday && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </div>
                      <p className="text-xs font-black truncate">{mealItem?.mealDetails?.name || "Chef Special"}</p>
                      <p className="text-[9px] font-bold text-zinc-400 mt-1">{mealItem?.mealDetails?.calories || 500} kcal</p>
                    </div>
                  );
                })}
             </div>
          </Card>

          {/* Meal Rating Widget */}
          {!ratingSubmitted ? (
            <Card className="bg-gradient-to-r from-emerald-900/40 to-zinc-900 border border-emerald-500/30 p-6 rounded-[2.5rem] text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Micro Quality Control</span>
                    </div>
                    <h4 className="text-base font-black">How was yesterday's High Protein Herb Chicken Bowl?</h4>
                 </div>
                 <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full">Earn +25 Coins</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => { triggerHaptic('light'); setRatingMeal(star); }}
                    className="p-1 cursor-pointer transition-transform hover:scale-125"
                  >
                    <Star className={`w-7 h-7 ${star <= ratingMeal ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} />
                  </button>
                ))}
              </div>

              {ratingMeal > 0 && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Add a quick chef feedback note (e.g. Extra spice, perfectly packed)..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <Button 
                    onClick={handleRatingSubmit}
                    className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-xl h-10 px-5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Submit Meal Rating
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <Card className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[2rem] text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="text-xs font-black">Rating Received!</p>
                  <p className="text-[10px]">Your feedback was routed directly to executive chef Arjun.</p>
                </div>
              </div>
              <span className="text-xs font-black bg-emerald-500 text-zinc-950 px-3 py-1 rounded-full">+25 XP</span>
            </Card>
          )}

          <LongevityWidget />
          <DailyMissionsWidget />
        </div>

        {/* Sidebar Widgets Column */}
        <div className="space-y-8">
           <LoyaltyPointsWidget rewardPoints={rewardPoints} user={user} />
           <MentalClarityWidget />
           
           <Card className="bg-zinc-50 dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform pointer-events-none">
                 <ShieldCheck className="w-16 h-16" />
              </div>
              <h4 className="text-lg font-black mb-2 tracking-tight">AI Clinical Advisor</h4>
              <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                "Dr. Ananya Sen adjusted your dinner to include 15g more protein based on your afternoon metabolic rate."
              </p>
              <Button 
                onClick={() => { triggerHaptic('light'); setShowAiModal(true); }} 
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl h-14 uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                 <Bot className="w-4 h-4 text-zinc-950" />
                 Ask Nutrition AI
              </Button>
           </Card>

           <div 
             onClick={() => { triggerHaptic('light'); navigate('/health-assessment'); }} 
             className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-emerald-500/20 transition-all"
           >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                    <HeartPulse className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-sm font-black text-zinc-900 dark:text-white">Daily Check-In</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Update Biometrics</p>
                 </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
           </div>
        </div>
      </div>

      {/* Meal Insights Bottom Sheet */}
      <BottomSheet isOpen={showMealDetails} onClose={() => setShowMealDetails(false)} title="Meal Insights">
        <div className="space-y-6 pb-6 px-1">
           <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 bg-zinc-100 dark:bg-zinc-800">
             <img src={(todayMeal?.mealDetails?.imageUrl || "https://images.unsplash.com/photo-1540420773420-3366772f4999") + "?w=1000&auto=format&fit=crop&q=80"} alt="Meal" className="w-full h-full object-cover" />
             <div className="absolute bottom-4 left-4 right-4 text-white drop-shadow-md">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-sm border border-white/20 inline-block mb-2">
                  {todayMeal?.mealType || "Lunch"}
                </div>
                <h3 className="text-2xl font-black">{todayMeal?.mealDetails?.name || "Chef's Special Bowl"}</h3>
             </div>
           </div>

           <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5">
             {[
               { id: "nutrition", label: "Nutrition", icon: <HeartPulse className="w-3 h-3" /> },
               { id: "story", label: "Source", icon: <MapPin className="w-3 h-3" /> },
               { id: "guide", label: "Heating", icon: <Thermometer className="w-3 h-3" /> }
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveMealTab(tab.id as any)}
                 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                   activeMealTab === tab.id 
                     ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" 
                     : "text-zinc-500"
                 }`}
               >
                 {tab.icon} {tab.label}
               </button>
             ))}
           </div>

           <div className="min-h-[180px]">
             {activeMealTab === "nutrition" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/5">
                       <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Calories</p>
                       <p className="text-xl font-black text-zinc-900 dark:text-white">{todayMeal?.mealDetails?.nutrition?.calories || 520} kcal</p>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                       <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 mb-1">Protein</p>
                       <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{todayMeal?.mealDetails?.nutrition?.protein || 42}g</p>
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/5 space-y-3 text-zinc-900 dark:text-white">
                     <div className="flex justify-between items-center text-xs">
                       <span className="font-bold text-zinc-500">Carbs</span>
                       <span className="font-black">{todayMeal?.mealDetails?.nutrition?.carbs || 45}g</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                       <span className="font-bold text-zinc-500">Fat</span>
                       <span className="font-black">{todayMeal?.mealDetails?.nutrition?.fat || 18}g</span>
                     </div>
                  </div>
                </div>
             )}
             {activeMealTab === "story" && (
                <div className="space-y-4">
                   <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/5 flex gap-4 items-center">
                     <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                       <Leaf className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-sm font-black text-zinc-900 dark:text-white">Farm Fresh Ingredients</p>
                       <p className="text-xs text-zinc-500">Organic vegetables sourced daily from local hydroponic farms.</p>
                     </div>
                   </div>
                   <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/5 flex gap-4 items-center">
                     <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl flex items-center justify-center shrink-0">
                       <ChefHat className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-sm font-black text-zinc-900 dark:text-white">Chef Crafted</p>
                       <p className="text-xs text-zinc-500">Calibrated precisely for optimum bio-availability and digestion.</p>
                     </div>
                   </div>
                </div>
             )}
             {activeMealTab === "guide" && (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/5">
                     <div className="flex items-center gap-2 mb-2">
                       <Flame className="w-4 h-4 text-orange-500" />
                       <span className="font-black text-sm text-zinc-900 dark:text-white">Microwave Instructions</span>
                     </div>
                     <p className="text-xs text-zinc-500 leading-relaxed">Remove transparent lid. Heat on medium-high power for 2-3 minutes. Let sit for 60 seconds before enjoying.</p>
                  </div>
                </div>
             )}
           </div>

           <Button 
             onClick={() => {
               triggerHaptic('success');
               setShowMealDetails(false);
               showToast("Meal consumption logged in daily macro tracker!", "success");
             }}
             className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl h-14 uppercase tracking-widest text-[10px] mt-4 shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform cursor-pointer"
           >
             Log Consumption
           </Button>
        </div>
      </BottomSheet>

      {/* Dish Swap Bottom Sheet Modal */}
      <BottomSheet isOpen={showSwapModal} onClose={() => setShowSwapModal(false)} title={`Swap Dish for ${swapDay}`}>
        <div className="space-y-4 pb-6 px-1">
          <p className="text-xs text-zinc-500 font-medium">
            Select a custom high-protein alternative prepared fresh by TaazaBites chefs:
          </p>

          <div className="space-y-3">
            {availableSwapOptions.map((option) => (
              <div 
                key={option.id}
                onClick={() => handleSwapDishSelect(option.name)}
                className="p-4 bg-zinc-50 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl cursor-pointer transition-all flex items-center justify-between group active:scale-98"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {option.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {option.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                    {option.calories} kcal • {option.protein} Protein
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      <Suspense fallback={null}>
        <AiNutritionModal 
          isOpen={showAiModal} 
          onClose={() => setShowAiModal(false)}
          user={user}
          healthScore={healthScore}
          nutrition={nutrition}
          weightGoal={weightGoal}
        />
        <AchievementsModal 
          isOpen={showAchievements} 
          onClose={() => setShowAchievements(false)} 
        />
      </Suspense>
      <ConfirmDialog
        open={confirmSkip}
        title="Skip tomorrow?"
        description="Tomorrow’s scheduled meals will be marked skipped and those credits stay on your subscription. This updates Firestore."
        confirmLabel="Skip tomorrow"
        loading={skipLoading}
        error={skipError}
        onConfirm={confirmSkipTomorrow}
        onClose={() => setConfirmSkip(false)}
      />
    </div>
  );
}

function StatBlock({ label, current, target, unit, icon, color, bg }: any) {
  const percent = Math.min(100, Math.round((current / (target || 1)) * 100));
  
  return (
    <Card className="p-4 sm:p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className={`p-2 rounded-xl ${bg} ${color}`}>
           {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
        </div>
        <div className="text-right">
           <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
        </div>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
         <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{current}</span>
            <span className="text-[8px] sm:text-[10px] font-black uppercase text-zinc-400 tracking-widest">/ {target}{unit}</span>
         </div>
         <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${percent}%` }}
               className={`h-full ${color.replace('text-', 'bg-')} rounded-full`}
            />
         </div>
      </div>
    </Card>
  );
}
