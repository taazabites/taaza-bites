import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, CalendarClock, ArrowRight, Settings, 
  Sparkles, Salad, PlayCircle, PauseCircle, ChevronRight, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../ui/primitives';
import { cn } from '@/src/lib/utils';
import { triggerHaptic } from '@/src/utils/haptics';

export interface CurrentPlanSnapshotProps {
  subscription?: {
    id?: string;
    planName?: string;
    status?: 'active' | 'paused' | 'cancelled';
    mealCredits?: number;
    totalMeals?: number;
    daysRemaining?: number;
    totalDays?: number;
    billingCycleEnd?: string | Date | any;
    endDate?: string | Date | any;
    startDate?: string | Date | any;
    deliveryTime?: string;
    deliveryTiming?: string;
    dietaryPreference?: string;
  };
  onManagePreferences?: () => void;
  className?: string;
}

export function CurrentPlanSnapshotCard({
  subscription,
  onManagePreferences,
  className
}: CurrentPlanSnapshotProps) {
  const navigate = useNavigate();

  // Smart defaults if subscription object is partial or missing
  const planName = subscription?.planName;
  const status = subscription?.status;
  const isPaused = status === "paused";
  
  const totalMeals = subscription?.totalMeals ?? 0;
  const remainingCredits = subscription?.mealCredits ?? subscription?.daysRemaining ?? 0;
  const creditPercentage = Math.min(100, Math.max(0, Math.round((remainingCredits / totalMeals) * 100)));

  // Calculate days left in billing cycle
  const computeDaysLeft = () => {
    if (subscription?.daysRemaining !== undefined) return subscription.daysRemaining;
    const end = subscription?.billingCycleEnd || subscription?.endDate;
    if (end) {
      const endDate = (end as any)?.toDate ? (end as any).toDate() : new Date(end);
      const diffMs = endDate.getTime() - Date.now();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
    return 0;
  };

  const daysLeftInCycle = computeDaysLeft();
  const deliverySlot = subscription?.deliveryTime || subscription?.deliveryTiming || "—";
  const dietaryTag = subscription?.dietaryPreference || "";

  const handleManageClick = () => {
    triggerHaptic('light');
    if (onManagePreferences) {
      onManagePreferences();
    } else {
      navigate('/dashboard/subscriptions');
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden rounded-[2.25rem] border p-5 sm:p-6 shadow-xl transition-all",
      "bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300",
      "dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-950 dark:to-black dark:text-white dark:border-zinc-800 dark:hover:border-zinc-700/80 dark:shadow-2xl",
      className
    )}>
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-[70px] pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3 relative z-10 mb-4 pb-4 border-b border-zinc-100 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1.5",
              isPaused 
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30" 
                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isPaused ? "bg-amber-400" : "bg-emerald-400")} />
              {isPaused ? "Paused (Vacation Mode)" : "Active Subscription"}
            </span>

            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
              {dietaryTag}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            {planName}
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
            Slot: <span className="text-zinc-800 dark:text-zinc-200 font-bold">{deliverySlot}</span>
          </p>
        </div>

        {/* One-Tap Manage Plan Preferences Link */}
        <button
          onClick={handleManageClick}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-100 hover:bg-emerald-500 hover:text-white text-zinc-900 border border-zinc-200 dark:bg-white/10 dark:hover:bg-emerald-500 dark:hover:text-zinc-950 dark:text-white dark:border-white/15 text-xs font-black tracking-wide transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
        >
          <Settings className="w-3.5 h-3.5 transition-transform group-hover:rotate-45" />
          <span>Manage Plan</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-950 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Main Metrics Snapshot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
        {/* Metric 1: Remaining Meal Credits */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 backdrop-blur-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300/90 flex items-center gap-1.5">
              <Salad className="w-3.5 h-3.5 text-emerald-400" /> Meal Credits
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
              {remainingCredits} / {totalMeals} Left
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {remainingCredits}
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Credits Available
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-100 dark:border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${creditPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[9px] text-zinc-400 font-medium">
              <span>{creditPercentage}% balance</span>
              <span>Rolls over on pause</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Days Left in Billing Cycle */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 backdrop-blur-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300/90 flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-indigo-400" /> Billing Cycle
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
              Auto-Renews
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {daysLeftInCycle}
            </span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Days Remaining
            </span>
          </div>

          {/* Cycle Info Footer */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium pt-1 border-t border-zinc-100 dark:border-white/5">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> 100% Wallet Protection
            </span>
            <button
              onClick={handleManageClick}
              className="text-emerald-400 font-bold hover:underline"
            >
              Preferences &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom One-Tap Quick Actions Bar */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Need to skip a meal or change address?</span>
        </div>

        <button
          onClick={handleManageClick}
          className="text-[11px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline underline-offset-4 cursor-pointer"
        >
          Customize Meal Preferences & Cycle
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </Card>
  );
}
