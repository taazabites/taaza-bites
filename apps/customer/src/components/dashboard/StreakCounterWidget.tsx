import React from 'react';
import { motion } from 'motion/react';
import { Flame, Award, Zap, ShieldCheck, Check, Lock, Sparkles } from 'lucide-react';
import { Card } from '../ui/primitives';

interface StreakDay {
  day: string;
  completed: boolean;
  isToday?: boolean;
}

interface Milestone {
  id: string;
  label: string;
  daysReq: number;
  unlocked: boolean;
  reward: string;
  icon: string;
}

export function StreakCounterWidget() {
  const currentStreak = 14;
  const bestStreak = 21;

  const weeklyProgress: StreakDay[] = [
    { day: 'M', completed: true },
    { day: 'T', completed: true },
    { day: 'W', completed: true },
    { day: 'T', completed: true },
    { day: 'F', completed: true },
    { day: 'S', completed: true, isToday: true },
    { day: 'S', completed: false },
  ];

  const milestones: Milestone[] = [
    { id: '1', label: '7-Day Starter', daysReq: 7, unlocked: true, reward: '+50 Coins', icon: '🔥' },
    { id: '2', label: '14-Day Warrior', daysReq: 14, unlocked: true, reward: 'Free Dessert', icon: '⚡' },
    { id: '3', label: '30-Day Legend', daysReq: 30, unlocked: false, reward: '10% Off Next Month', icon: '👑' },
  ];

  return (
    <Card className="p-6 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/20 dark:via-orange-950/10 dark:to-transparent border border-amber-200/60 dark:border-amber-900/40 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
              Nutrition Streak
            </h3>
            <p className="text-xs text-zinc-500 font-semibold">Best streak: {bestStreak} days</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight flex items-center gap-1">
            {currentStreak} <span className="text-sm font-extrabold text-zinc-500">Days</span>
          </span>
        </div>
      </div>

      {/* Days Tracker Bar */}
      <div className="bg-white/80 dark:bg-zinc-900/80 p-3.5 rounded-2xl border border-amber-100 dark:border-zinc-800">
        <div className="flex justify-between items-center text-center">
          {weeklyProgress.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-zinc-400">{item.day}</span>
              <motion.div
                whileHover={{ scale: 1.15 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  item.completed
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                    : item.isToday
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-2 border-dashed border-amber-500'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}
              >
                {item.completed ? <Check className="w-4 h-4 stroke-[3]" /> : item.isToday ? '•' : ''}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges & Milestones */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Milestone Rewards
        </span>
        <div className="grid grid-cols-3 gap-2">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`p-2.5 rounded-2xl text-center border transition-all ${
                m.unlocked
                  ? 'bg-white dark:bg-zinc-900 border-amber-300 dark:border-amber-800/80 shadow-sm'
                  : 'bg-zinc-100/50 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800 opacity-60'
              }`}
            >
              <div className="text-xl mb-1">{m.icon}</div>
              <p className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 truncate">{m.label}</p>
              <span
                className={`inline-block mt-1 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  m.unlocked
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                }`}
              >
                {m.unlocked ? m.reward : `${m.daysReq - currentStreak}d left`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
