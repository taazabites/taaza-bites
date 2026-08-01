import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Sparkles, 
  Award, 
  Trophy, 
  ChevronRight, 
  CheckCircle2, 
  Plus, 
  Zap, 
  Utensils, 
  Star, 
  Flame, 
  PartyPopper, 
  ArrowUpRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Card } from '../ui/primitives';
import { useToast } from '../../context/ToastContext';
import { triggerHaptic } from '../../utils/haptics';

export interface LoyaltyPointsWidgetProps {
  rewardPoints?: any; // totalPoints or number
  user?: any;
}

interface Milestone {
  id: string;
  pointsRequired: number;
  title: string;
  subtext: string;
  icon: any;
  unlocked: boolean;
  claimed?: boolean;
}

const FREE_MEAL_TARGET = 500; // Target for a free gourmet meal

export default function LoyaltyPointsWidget({ rewardPoints, user }: LoyaltyPointsWidgetProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Extract baseline points
  const initialPoints = useMemo(() => {
    if (typeof rewardPoints === 'number') return rewardPoints;
    if (rewardPoints?.totalPoints !== undefined) return Number(rewardPoints.totalPoints);
    if (user?.rewardPoints !== undefined) return Number(user.rewardPoints);
    return 380; // Default baseline score (380 / 500 pts = 76%)
  }, [rewardPoints, user]);

  const [currentPoints, setCurrentPoints] = useState(initialPoints);
  const [showCelebration, setShowCelebration] = useState(false);
  const [claimedMilestones, setClaimedMilestones] = useState<Record<string, boolean>>({});

  // Sync initial points if prop updates
  useEffect(() => {
    setCurrentPoints(initialPoints);
  }, [initialPoints]);

  // Defined Milestones
  const milestones: Milestone[] = useMemo(() => [
    {
      id: 'm-juice',
      pointsRequired: 250,
      title: 'Free Cold-Pressed Juice',
      subtext: 'Fresh detox juice with next meal',
      icon: Flame,
      unlocked: currentPoints >= 250,
      claimed: !!claimedMilestones['m-juice']
    },
    {
      id: 'm-freemeal',
      pointsRequired: 500,
      title: 'Free Gourmet Meal',
      subtext: 'Any Chef Special Bowl (Value ₹320)',
      icon: Utensils,
      unlocked: currentPoints >= 500,
      claimed: !!claimedMilestones['m-freemeal']
    },
    {
      id: 'm-vipbox',
      pointsRequired: 1000,
      title: 'VIP Feast Box & Double XP',
      subtext: 'Multi-course luxury meal + 2x multiplier',
      icon: Trophy,
      unlocked: currentPoints >= 1000,
      claimed: !!claimedMilestones['m-vipbox']
    }
  ], [currentPoints, claimedMilestones]);

  // Calculate Progress towards Next Free Meal (500 pts)
  const targetMilestone = milestones.find(m => m.pointsRequired === FREE_MEAL_TARGET) || milestones[1];
  const progressPercent = Math.min(100, Math.round((currentPoints / targetMilestone.pointsRequired) * 100));
  const pointsNeeded = Math.max(0, targetMilestone.pointsRequired - currentPoints);

  // Trigger milestone celebration when reaching 500 pts or more
  const handleAddPoints = (amount: number = 50) => {
    triggerHaptic('medium');
    const newPts = currentPoints + amount;
    setCurrentPoints(newPts);

    showToast(` Earned +${amount} Taaza Loyalty Points!`, 'success');

    // Check if crossing a new milestone
    if (newPts >= 500 && currentPoints < 500) {
      triggerHaptic('success');
      setShowCelebration(true);
      showToast('🎉 Free Gourmet Meal Milestone Reached!', 'success');
    }
  };

  const handleClaimReward = (milestone: Milestone) => {
    if (!milestone.unlocked) return;
    triggerHaptic('success');
    setClaimedMilestones(prev => ({ ...prev, [milestone.id]: true }));
    setShowCelebration(true);
    showToast(` Voucher Unlocked: ${milestone.title}! Saved to your wallet.`, 'success');
  };

  return (
    <Card className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white border border-zinc-800 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* Background Glows */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Sparkles Burst for Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-40 bg-zinc-950/90 backdrop-blur-md p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4"
          >
            {/* Animated Confetti / Trophy Burst */}
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-emerald-400 p-0.5 shadow-2xl shadow-amber-500/40"
            >
              <div className="w-full h-full bg-zinc-900 rounded-[22px] flex items-center justify-center text-amber-400">
                <PartyPopper className="w-10 h-10 animate-bounce" />
              </div>
            </motion.div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                Milestone Unlocked!
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">
                FREE Gourmet Meal Voucher!
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto font-medium leading-relaxed">
                Congratulations! You’ve reached {currentPoints} Taaza Loyalty Points. Your free chef-curated meal voucher has been added to your profile.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 w-full max-w-xs">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowCelebration(false);
                  navigate('/rewards');
                }}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Redeem Voucher
              </button>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowCelebration(false);
                }}
                className="p-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget Header */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-amber-400" />
              Taaza Rewards Club
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Gold Tier
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
              {currentPoints}
            </h3>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Loyalty Points
            </span>
          </div>
        </div>

        {/* Quick Add Points / Simulate Button */}
        <button
          onClick={() => handleAddPoints(50)}
          className="px-3.5 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
          title="Simulate earning +50 XP points from orders/missions"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>+50 Pts</span>
        </button>
      </div>

      {/* Visual Progress Bar Section towards Free Meal */}
      <div className="space-y-2 mb-6 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-300 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-emerald-400" />
            Next Free Meal Progress
          </span>
          <span className="font-mono font-black text-amber-400">
            {pointsNeeded > 0 ? `${pointsNeeded} pts needed` : '🎉 UNLOCKED!'}
          </span>
        </div>

        {/* Animated Progress Track */}
        <div className="relative h-4 bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-zinc-700/80 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500 rounded-full relative overflow-hidden"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Glossy Shimmer Animation */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
              className="absolute top-0 bottom-0 w-12 bg-white/40 skew-x-12 blur-xs"
            />
          </motion.div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 pt-0.5">
          <span>0 Pts</span>
          <span className="text-emerald-400 font-black">{progressPercent}% Achieved</span>
          <span className="text-amber-400 font-black">500 Pts (Free Meal)</span>
        </div>
      </div>

      {/* Milestones Horizontal Badges Bar */}
      <div className="grid grid-cols-3 gap-2.5 mb-5 relative z-10">
        {milestones.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              onClick={() => {
                if (m.unlocked && !m.claimed) {
                  handleClaimReward(m);
                } else if (!m.unlocked) {
                  triggerHaptic('light');
                  showToast(` Need ${m.pointsRequired - currentPoints} more points to unlock ${m.title}.`, 'info');
                }
              }}
              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                m.claimed
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : m.unlocked
                  ? 'bg-gradient-to-b from-amber-500/20 to-emerald-500/20 border-amber-400/50 text-white shadow-lg animate-pulse'
                  : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-xl ${
                  m.unlocked ? 'bg-amber-400 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-600'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono font-black opacity-80">
                  {m.pointsRequired} pts
                </span>
              </div>

              <div>
                <p className="text-[11px] font-black line-clamp-1 leading-snug">{m.title}</p>
                <span className={`text-[9px] font-black uppercase tracking-wider block mt-1 ${
                  m.claimed ? 'text-emerald-400' : m.unlocked ? 'text-amber-300' : 'text-zinc-500'
                }`}>
                  {m.claimed ? 'Claimed ✓' : m.unlocked ? 'Claim Now →' : 'Locked'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Widget Footer Navigation */}
      <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-zinc-300 font-medium">Earn 10 pts per ₹100 spent</span>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            navigate('/rewards');
          }}
          className="text-[11px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
        >
          <span>All Perks & Badges</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}
