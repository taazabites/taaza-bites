import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Award, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Gift, 
  Flame, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  ChevronRight, 
  Star, 
  Zap, 
  ShieldCheck, 
  Info,
  ArrowUpRight
} from 'lucide-react';
import { Card } from '../ui/primitives';
import { useToast } from '../../context/ToastContext';
import { triggerHaptic } from '../../utils/haptics';

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  referralsCount: number;
  totalEarned: number; // in ₹
  tier: 'Diamond' | 'Platinum' | 'Gold' | 'Silver';
  streak: number; // in days
  isCurrentUser?: boolean;
  badgeTitle?: string;
  monthlyGrowth?: string;
}

interface TopReferrersLeaderboardProps {
  currentUserReferralsCount?: number;
  currentUserEarnings?: number;
  currentUserCode?: string;
  userName?: string;
  userAvatar?: string;
}

export default function TopReferrersLeaderboard({
  currentUserReferralsCount = 8,
  currentUserEarnings = 2000,
  currentUserCode = 'TAAZA250',
  userName = 'You',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
}: TopReferrersLeaderboardProps) {
  const { showToast } = useToast();
  const [timeframe, setTimeframe] = useState<'this_month' | 'all_time'>('this_month');
  const [copied, setCopied] = useState(false);
  const [showPrizeModal, setShowPrizeModal] = useState(false);

  // Baseline Community Leaders Data
  const baseLeaders = useMemo<LeaderboardUser[]>(() => {
    if (timeframe === 'this_month') {
      return [
        {
          rank: 1,
          id: 'u1',
          name: 'Ananya Sharma',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
          referralsCount: 42,
          totalEarned: 10500,
          tier: 'Diamond',
          streak: 28,
          badgeTitle: 'Top Community Ambassador',
          monthlyGrowth: '+12 this week'
        },
        {
          rank: 2,
          id: 'u2',
          name: 'Rahul Kapoor',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          referralsCount: 35,
          totalEarned: 8750,
          tier: 'Platinum',
          streak: 19,
          badgeTitle: 'Fitness Influencer',
          monthlyGrowth: '+8 this week'
        },
        {
          rank: 3,
          id: 'u3',
          name: 'Priya Mehta',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
          referralsCount: 29,
          totalEarned: 7250,
          tier: 'Platinum',
          streak: 15,
          badgeTitle: 'Corporate Wellness Lead',
          monthlyGrowth: '+6 this week'
        },
        {
          rank: 4,
          id: 'u4',
          name: 'Vikram Malhotra',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
          referralsCount: 22,
          totalEarned: 5500,
          tier: 'Gold',
          streak: 12,
          badgeTitle: 'Nutrient Evangelist'
        },
        {
          rank: 5,
          id: 'u5',
          name: 'Sneha Reddy',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
          referralsCount: 18,
          totalEarned: 4500,
          tier: 'Gold',
          streak: 10,
          badgeTitle: 'Yoga Instructor'
        },
        {
          rank: 6,
          id: 'u6',
          name: 'Kabir Sengupta',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
          referralsCount: 14,
          totalEarned: 3500,
          tier: 'Gold',
          streak: 8,
          badgeTitle: 'Tech Lead & Foodie'
        },
        {
          rank: 7,
          id: 'curr_user',
          name: userName || 'You',
          avatar: userAvatar,
          referralsCount: currentUserReferralsCount,
          totalEarned: currentUserEarnings,
          tier: currentUserReferralsCount >= 20 ? 'Platinum' : currentUserReferralsCount >= 10 ? 'Gold' : 'Silver',
          streak: 7,
          isCurrentUser: true,
          badgeTitle: 'Rising Ambassador',
          monthlyGrowth: '+3 this week'
        },
        {
          rank: 8,
          id: 'u8',
          name: 'Divya Nair',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
          referralsCount: 6,
          totalEarned: 1500,
          tier: 'Silver',
          streak: 4,
          badgeTitle: 'Health Enthusiast'
        }
      ];
    } else {
      // All-Time Leaders
      return [
        {
          rank: 1,
          id: 'u1',
          name: 'Ananya Sharma',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
          referralsCount: 184,
          totalEarned: 46000,
          tier: 'Diamond',
          streak: 120,
          badgeTitle: 'Master Ambassador'
        },
        {
          rank: 2,
          id: 'u2',
          name: 'Rahul Kapoor',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          referralsCount: 142,
          totalEarned: 35500,
          tier: 'Diamond',
          streak: 95,
          badgeTitle: 'Fitness Influencer'
        },
        {
          rank: 3,
          id: 'u3',
          name: 'Priya Mehta',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
          referralsCount: 110,
          totalEarned: 27500,
          tier: 'Platinum',
          streak: 80,
          badgeTitle: 'Corporate Wellness Lead'
        },
        {
          rank: 4,
          id: 'u4',
          name: 'Vikram Malhotra',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
          referralsCount: 88,
          totalEarned: 22000,
          tier: 'Platinum',
          streak: 65,
          badgeTitle: 'Nutrient Evangelist'
        },
        {
          rank: 5,
          id: 'curr_user',
          name: userName || 'You',
          avatar: userAvatar,
          referralsCount: currentUserReferralsCount + 12,
          totalEarned: currentUserEarnings + 3000,
          tier: 'Gold',
          streak: 21,
          isCurrentUser: true,
          badgeTitle: 'Pioneer Member'
        }
      ];
    }
  }, [timeframe, currentUserReferralsCount, currentUserEarnings, userName, userAvatar]);

  // Separate Top 3 Podium vs Rest
  const topThree = baseLeaders.slice(0, 3);
  const remainingLeaders = baseLeaders.slice(3);

  // Current user rank info
  const currentUserRankInfo = baseLeaders.find(l => l.isCurrentUser) || {
    rank: 7,
    referralsCount: currentUserReferralsCount,
    totalEarned: currentUserEarnings
  };

  const nextRankTarget = topThree[2]; // #3 spot
  const referralsNeededForTop3 = Math.max(0, (nextRankTarget.referralsCount + 1) - currentUserRankInfo.referralsCount);

  const handleCopyLink = () => {
    triggerHaptic('success');
    const link = `${window.location.origin}/subscribe?ref=${currentUserCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    showToast(' Invite link copied! Share with friends to climb the leaderboard.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    triggerHaptic('light');
    const text = `Hey! Join me on TaazaBites for fresh, chef-curated gourmet meals. Use my code ${currentUserCode} to get ₹250 off your first meal sub!\n${window.location.origin}/subscribe?ref=${currentUserCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header Banner & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white border border-zinc-800 shadow-2xl relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Community Champions
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              July 2026 Season
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <span>Top Referrers Leaderboard</span>
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse hidden sm:inline-block" />
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-medium leading-relaxed">
            Compete with fellow foodies! Top monthly ambassadors win free gourmet meal subscriptions, cash credits, and exclusive VIP badges.
          </p>
        </div>

        {/* Timeframe Filters & Prize Modal Toggle */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <div className="p-1 rounded-2xl bg-zinc-800/80 border border-zinc-700/80 flex items-center gap-1">
            <button
              onClick={() => {
                triggerHaptic('light');
                setTimeframe('this_month');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                timeframe === 'this_month'
                  ? 'bg-amber-400 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setTimeframe('all_time');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                timeframe === 'all_time'
                  ? 'bg-amber-400 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All-Time
            </button>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setShowPrizeModal(true);
            }}
            className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-400/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            title="View Monthly Prize Pool"
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Prizes</span>
          </button>
        </div>
      </div>

      {/* User Standing Hero Banner */}
      <Card className="p-6 rounded-[2rem] bg-gradient-to-r from-emerald-950 via-zinc-900 to-teal-950 text-white border border-emerald-500/30 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={userAvatar}
              alt={userName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-400/80 shadow-lg"
            />
            <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-zinc-950 font-black text-xs px-2 py-0.5 rounded-full border border-emerald-300 shadow-sm">
              #{currentUserRankInfo.rank}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Your Current Position
              </span>
              <span className="text-[10px] font-bold text-amber-300">
                Rank #{currentUserRankInfo.rank} of 450+
              </span>
            </div>

            <h3 className="text-xl font-black tracking-tight text-white">
              {userName} • <span className="text-emerald-400">{currentUserRankInfo.referralsCount} Referrals</span>
            </h3>

            <p className="text-xs text-zinc-300 font-medium">
              Total Earnings Generated: <strong className="text-emerald-300 font-mono">₹{currentUserRankInfo.totalEarned}</strong>
              {referralsNeededForTop3 > 0 ? (
                <span> — <span className="text-amber-400 font-bold">{referralsNeededForTop3} more referrals</span> to enter Top 3 Podium!</span>
              ) : (
                <span className="text-amber-300 font-bold"> — 🎉 You are on the Podium!</span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Invite CTA */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCopyLink}
            className="flex-1 md:flex-initial px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-zinc-950" /> : <Copy className="w-4 h-4 text-zinc-950" />}
            <span>{copied ? 'Copied Link!' : 'Copy Invite Link'}</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="p-3.5 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 transition-all cursor-pointer"
            title="Share on WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </Card>

      {/* TOP 3 PODIUM STAGE */}
      <div className="pt-4 pb-2">
        <div className="text-center mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Hall of Fame
          </span>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-1">
            Season Champions Podium
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
          {/* #2 SILVER (Left) */}
          {topThree[1] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="order-2 md:order-1 bg-gradient-to-b from-slate-800 to-zinc-900 border border-slate-700/80 rounded-[2.5rem] p-6 text-white text-center shadow-2xl relative overflow-hidden group hover:border-slate-400/50 transition-all"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-slate-300" />
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-slate-400/10 rounded-full blur-2xl" />

              <div className="relative inline-block mb-3">
                <img
                  src={topThree[1].avatar}
                  alt={topThree[1].name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-300/80 mx-auto shadow-md"
                />
                <div className="absolute -top-3 -right-2 bg-slate-300 text-zinc-950 p-1.5 rounded-full shadow-lg">
                  <Crown className="w-4 h-4 fill-zinc-950" />
                </div>
                <span className="absolute -bottom-2 inset-x-0 bg-slate-300 text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md w-max mx-auto border border-white">
                  #2 SILVER
                </span>
              </div>

              <h4 className="text-lg font-black text-white tracking-tight mt-2 line-clamp-1">
                {topThree[1].name}
              </h4>
              <p className="text-[11px] font-bold text-slate-300">{topThree[1].badgeTitle}</p>

              <div className="mt-4 p-3 rounded-2xl bg-zinc-800/80 border border-zinc-700 space-y-1">
                <div className="text-2xl font-black font-mono text-slate-200">
                  {topThree[1].referralsCount} <span className="text-xs font-sans font-bold text-zinc-400">Referrals</span>
                </div>
                <p className="text-[11px] font-bold text-emerald-400 font-mono">
                  ₹{topThree[1].totalEarned} Earned
                </p>
              </div>

              <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-300">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{topThree[1].streak} Day Streak</span>
              </div>
            </motion.div>
          )}

          {/* #1 GOLD (Center - Higher Elevation) */}
          {topThree[0] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="order-1 md:order-2 bg-gradient-to-b from-amber-950 via-zinc-900 to-zinc-950 border-2 border-amber-400/80 rounded-[2.8rem] p-7 text-white text-center shadow-2xl shadow-amber-500/20 relative overflow-hidden group hover:border-amber-300 transition-all md:-translate-y-4"
            >
              <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative inline-block mb-3">
                <img
                  src={topThree[0].avatar}
                  alt={topThree[0].name}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-amber-400 mx-auto shadow-xl"
                />
                <div className="absolute -top-4 -right-3 bg-amber-400 text-zinc-950 p-2 rounded-full shadow-xl animate-bounce">
                  <Crown className="w-5 h-5 fill-zinc-950" />
                </div>
                <span className="absolute -bottom-2 inset-x-0 bg-gradient-to-r from-amber-400 to-yellow-300 text-zinc-950 text-xs font-black px-3 py-0.5 rounded-full shadow-lg w-max mx-auto border border-white">
                  🏆 #1 GOLD CHAMPION
                </span>
              </div>

              <h4 className="text-xl font-black text-white tracking-tight mt-3 line-clamp-1">
                {topThree[0].name}
              </h4>
              <p className="text-xs font-bold text-amber-300">{topThree[0].badgeTitle}</p>

              <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-1">
                <div className="text-3xl font-black font-mono text-amber-300">
                  {topThree[0].referralsCount} <span className="text-xs font-sans font-bold text-zinc-300">Referrals</span>
                </div>
                <p className="text-xs font-black text-emerald-400 font-mono">
                  ₹{topThree[0].totalEarned} Total Earned
                </p>
              </div>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Prize: 1 Month Free Meals + VIP Pass</span>
              </div>
            </motion.div>
          )}

          {/* #3 BRONZE (Right) */}
          {topThree[2] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="order-3 bg-gradient-to-b from-amber-950/60 to-zinc-900 border border-amber-800/60 rounded-[2.5rem] p-6 text-white text-center shadow-2xl relative overflow-hidden group hover:border-amber-600/50 transition-all"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-amber-700" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-700/10 rounded-full blur-2xl" />

              <div className="relative inline-block mb-3">
                <img
                  src={topThree[2].avatar}
                  alt={topThree[2].name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-amber-700/80 mx-auto shadow-md"
                />
                <div className="absolute -top-3 -right-2 bg-amber-700 text-white p-1.5 rounded-full shadow-lg">
                  <Crown className="w-4 h-4 fill-white" />
                </div>
                <span className="absolute -bottom-2 inset-x-0 bg-amber-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md w-max mx-auto border border-white">
                  #3 BRONZE
                </span>
              </div>

              <h4 className="text-lg font-black text-white tracking-tight mt-2 line-clamp-1">
                {topThree[2].name}
              </h4>
              <p className="text-[11px] font-bold text-amber-200">{topThree[2].badgeTitle}</p>

              <div className="mt-4 p-3 rounded-2xl bg-zinc-800/80 border border-zinc-700 space-y-1">
                <div className="text-2xl font-black font-mono text-amber-200">
                  {topThree[2].referralsCount} <span className="text-xs font-sans font-bold text-zinc-400">Referrals</span>
                </div>
                <p className="text-[11px] font-bold text-emerald-400 font-mono">
                  ₹{topThree[2].totalEarned} Earned
                </p>
              </div>

              <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-bold text-amber-300">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{topThree[2].streak} Day Streak</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* LEADERBOARD TABLE (RANKS 4 - 10) */}
      <Card className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
              Season Standings & Rankings
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Updated live every 15 minutes based on active referral conversions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>{baseLeaders.length} Active Ambassadors</span>
            </span>
          </div>
        </div>

        {/* List Items */}
        <div className="space-y-3">
          {remainingLeaders.map((user) => (
            <motion.div
              key={user.id}
              whileHover={{ scale: 1.01, x: 4 }}
              transition={{ duration: 0.15 }}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                user.isCurrentUser
                  ? 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/40 dark:border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {/* Rank & User Info */}
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-xl font-black text-xs font-mono flex items-center justify-center ${
                  user.isCurrentUser
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}>
                  #{user.rank}
                </span>

                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                />

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight">
                      {user.name}
                    </h4>
                    {user.isCurrentUser && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-zinc-950 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                    <span>{user.badgeTitle || 'Ambassador'}</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{user.tier} Tier</span>
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-6 text-right">
                <div className="hidden sm:block space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Earned</span>
                  <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{user.totalEarned}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Referrals</span>
                  <div className="text-base font-black font-mono text-zinc-900 dark:text-white flex items-center justify-end gap-1">
                    <span>{user.referralsCount}</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Tip Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-4 text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold">
              Tip: Referrals convert 3x faster when shared directly in WhatsApp group chats!
            </span>
          </div>

          <button
            onClick={handleWhatsAppShare}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-[11px] uppercase tracking-wider cursor-pointer transition-all shrink-0"
          >
            Share Now
          </button>
        </div>
      </Card>

      {/* PRIZE POOL MODAL */}
      <AnimatePresence>
        {showPrizeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 text-white border border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Monthly Ambassador Prize Pool
                  </h3>
                </div>

                <button
                  onClick={() => setShowPrizeModal(false)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center text-xl font-black">
                    🥇
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                      1st Place Champion
                    </h4>
                    <p className="text-xs text-zinc-300 font-medium">
                      1 Month Free Gourmet Meal Sub + ₹2,500 Cash + Gold VIP Ambassador Badge
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-300 text-zinc-950 flex items-center justify-center text-xl font-black">
                    🥈
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                      2nd Place Runner Up
                    </h4>
                    <p className="text-xs text-zinc-300 font-medium">
                      2 Weeks Free Meal Sub + ₹1,500 Wallet Credit
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white flex items-center justify-center text-xl font-black">
                    🥉
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-200 uppercase tracking-wider">
                      3rd Place Achiever
                    </h4>
                    <p className="text-xs text-zinc-300 font-medium">
                      1 Week Free Meal Sub + ₹1,000 Wallet Credit
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-black">
                    🏅
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider">
                      4th - 10th Place
                    </h4>
                    <p className="text-xs text-zinc-300 font-medium">
                      ₹500 Taaza Wallet Cash + 500 Loyalty Bonus XP
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowPrizeModal(false);
                  handleCopyLink();
                }}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Start Inviting Friends
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
