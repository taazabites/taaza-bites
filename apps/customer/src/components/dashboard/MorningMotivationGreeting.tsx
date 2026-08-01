import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, RefreshCw, Sun, Sunset, Moon, Target, 
  Wallet as WalletIcon, Award, Zap, HeartPulse, Quote, ArrowUpRight
} from 'lucide-react';
import { Card } from '../ui/primitives';
import { cn } from '@/src/lib/utils';
import { triggerHaptic } from '@/src/utils/haptics';

export interface MorningMotivationGreetingProps {
  user?: any;
  healthAssessment?: any;
  subscription?: any;
  wallet?: any;
  rewardPoints?: any;
  onNavigate?: (path: string) => void;
  className?: string;
}

export function MorningMotivationGreeting({
  user,
  healthAssessment,
  subscription,
  wallet,
  rewardPoints,
  onNavigate,
  className
}: MorningMotivationGreetingProps) {
  const [motivationTip, setMotivationTip] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Extract user first name
  const rawName = user?.name || user?.displayName || user?.email?.split('@')[0] || '';
  const firstName = rawName ? rawName.split(' ')[0] : 'Friend';
  
  // Goal name formatting
  const rawGoal = healthAssessment?.goal || 'weight_loss';
  const formatGoalLabel = (g: string) => {
    switch (g?.toLowerCase()) {
      case 'weight_loss':
      case 'weightloss':
      case 'weight_management':
        return 'Weight Management';
      case 'muscle_gain':
      case 'musclegain':
      case 'bulking':
        return 'Lean Muscle Building';
      case 'active_metabolism':
      case 'energy_levels':
      case 'vitality':
        return 'Metabolic Energy & Vitality';
      default:
        return 'Clean Healthy Living';
    }
  };

  const goalLabel = formatGoalLabel(rawGoal);

  // Time-based greeting helper
  const getGreetingHeader = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return { text: 'Good morning', icon: Sun, color: 'text-amber-500' };
    } else if (hour < 17) {
      return { text: 'Good afternoon', icon: Sun, color: 'text-orange-500' };
    } else {
      return { text: 'Good evening', icon: Moon, color: 'text-indigo-400' };
    }
  };

  const greeting = getGreetingHeader();
  const GreetingIcon = greeting.icon;

  // Fetch AI Morning Motivation
  const fetchMotivationTip = async (manual = false) => {
    if (manual) {
      setIsRefreshing(true);
      triggerHaptic('light');
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch('/api/ai/morning-motivation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          userName: firstName,
          healthGoal: goalLabel,
          subscriptionPlan: subscription,
          healthAssessment: healthAssessment
        })
      });

      if (!response.ok) throw new Error('Failed to fetch motivation');

      const data = await response.json();
      setMotivationTip(data.motivationTip || `Small, consistent choices compound into massive transformation. Align today's clean TaazaBites meals with your ${goalLabel} target!`);
    } catch (err) {
      console.error('Error fetching morning motivation tip:', err);
      setMotivationTip(`Fuel your body with intention today. Sticking to your ${goalLabel} plan keeps your energy high and metabolism optimized!`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMotivationTip();
  }, [firstName, goalLabel]);

  return (
    <section className={cn("space-y-4 relative", className)}>
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-br from-emerald-50 via-white to-amber-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/80 border border-emerald-100 dark:border-zinc-800 p-6 sm:p-7 rounded-[2.25rem] shadow-xl shadow-emerald-900/5 dark:shadow-2xl relative overflow-hidden text-zinc-900 dark:text-white">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-400/10 dark:bg-teal-500/10 rounded-full blur-[90px] pointer-events-none -ml-20 -mb-20" />

        {/* Left Column: Greeting & AI Motivation Tip */}
        <div className="space-y-3 relative z-10 max-w-2xl">
          
          {/* Status & Goal Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
              <GreetingIcon className={cn("w-3.5 h-3.5", greeting.color)} />
              <span>{greeting.text}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/15 text-zinc-700 dark:text-zinc-300 text-[10px] font-black uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Target: {goalLabel}</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400 animate-pulse" />
              <span>AI Health Coach</span>
            </div>
          </div>

          {/* User Name Greeting */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
            {greeting.text}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200">{firstName}</span>!
          </h1>

          {/* AI Morning Motivation Box */}
          <div className="relative pt-2 hidden md:block">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="h-14 w-full bg-emerald-50 dark:bg-white/5 animate-pulse rounded-2xl border border-emerald-100 dark:border-white/10 flex items-center px-4">
                  <div className="h-4 w-3/4 bg-emerald-200/60 dark:bg-white/10 rounded-md" />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="bg-white/95 dark:bg-white/5 backdrop-blur-md border border-emerald-100 dark:border-white/10 rounded-2xl p-4 sm:p-4.5 relative group hover:border-emerald-500/40 transition-all shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <Quote className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 opacity-90" />
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-relaxed italic">
                        "{motivationTip}"
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-900/10 dark:border-white/10 text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                        <span>Tailored for your {goalLabel} target</span>
                        
                        <button
                          onClick={() => fetchMotivationTip(true)}
                          disabled={isRefreshing}
                          className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-black transition-colors cursor-pointer"
                        >
                          <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
                          <span>{isRefreshing ? 'Refreshing...' : 'New Tip'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Quick Wallet & Rewards Status Pills */}
        <div className="flex lg:flex-col sm:flex-row flex-wrap items-center lg:items-end justify-start gap-3 relative z-10 shrink-0 pt-2 lg:pt-0">
          <button 
            onClick={() => { triggerHaptic('light'); if (onNavigate) onNavigate('/dashboard/wallet'); }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border border-emerald-100 dark:border-white/15 shadow-2xs hover:shadow-md transition-all active:scale-95 cursor-pointer text-left w-full sm:w-auto min-w-[150px]"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
              <WalletIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Taaza Wallet</p>
              <p className="text-sm font-black text-zinc-950 dark:text-white">₹{wallet?.balance ?? 1250}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 ml-auto" />
          </button>

          <button 
            onClick={() => { triggerHaptic('light'); if (onNavigate) onNavigate('/dashboard/rewards'); }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 dark:border-amber-500/30 shadow-2xs hover:shadow-md transition-all active:scale-95 cursor-pointer text-left w-full sm:w-auto min-w-[150px]"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest">Taaza Coins</p>
              <p className="text-sm font-black text-amber-900 dark:text-amber-300">{rewardPoints?.totalPoints ?? 450} XP</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-amber-600/60 dark:text-amber-400/60 ml-auto" />
          </button>
        </div>

      </div>
    </section>
  );
}
