import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Flame, 
  Zap, 
  Droplet, 
  Scale, 
  TrendingUp, 
  Calendar,
  Activity,
  Heart,
  Info
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface NutritionDashboardProps {
  userData: any;
  assessment: any;
  subscription: any;
}

export default function AIPoweredNutrition({ userData, assessment, subscription }: NutritionDashboardProps) {
  // Extract data from assessment (source of truth)
  const healthData = assessment || {};
  const currentWeight = healthData.currentWeight || userData?.weight || 0;
  const targetWeight = healthData.targetWeight || 0;
  const bmi = healthData.bmi || 0;
  const goal = healthData.goal || subscription?.goal || 'Balanced';
  
  // Targets (usually from the subscription or calculated from assessment)
  const caloriesTarget = subscription?.calories || 2000;
  const proteinTarget = subscription?.protein || 60;
  const carbsTarget = subscription?.carbs || 250;
  const fatsTarget = subscription?.fats || 70;

  // Progress metrics
  const weightProgress = targetWeight > 0 ? (currentWeight - targetWeight) : 0;
  const weightDiffText = weightProgress > 0 ? `${weightProgress.toFixed(1)} kg to go` : 'Goal Reached!';
  const startWeight = healthData.startWeight || currentWeight;
  const totalWeightGoal = Math.abs(startWeight - targetWeight);
  const currentWeightLost = Math.abs(startWeight - currentWeight);
  const weightProgressPct = totalWeightGoal > 0 ? Math.min(100, Math.max(10, (currentWeightLost / totalWeightGoal) * 100)) : 100;

  const stats = [
    { 
      label: 'Daily Calories', 
      value: caloriesTarget, 
      unit: 'kcal', 
      icon: Flame, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50',
      progress: 0.65 // Mock progress for visualization
    },
    { 
      label: 'Daily Protein', 
      value: proteinTarget, 
      unit: 'g', 
      icon: Activity, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      progress: 0.45
    },
    { 
      label: 'Carbs', 
      value: carbsTarget, 
      unit: 'g', 
      icon: Zap, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50',
      progress: 0.8
    },
    { 
      label: 'Fats', 
      value: fatsTarget, 
      unit: 'g', 
      icon: Droplet, 
      color: 'text-sky-500', 
      bg: 'bg-sky-50',
      progress: 0.3
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Goal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Active Meal Plan</p>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{goal} Plan</h2>
          </div>
        </div>
        <div className="flex items-center gap-6 pr-2">
          <div className="text-right">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Current BMI</p>
            <p className={cn(
              "text-lg font-black",
              bmi >= 18.5 && bmi <= 24.9 ? "text-emerald-600" : "text-amber-600"
            )}>{bmi || '--'}</p>
          </div>
          <div className="w-px h-8 bg-zinc-100" />
          <div className="text-right">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Target Weight</p>
            <p className="text-lg font-black text-zinc-900">{targetWeight || '--'} kg</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl", stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-zinc-900">{stat.value}</span>
                <span className="text-[10px] font-black text-zinc-400 uppercase ml-1">{stat.unit}</span>
              </div>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">{stat.label}</p>
            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stat.progress * 100}%` }}
                className={cn("h-full rounded-full", stat.color.replace('text', 'bg'))}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Progress */}
        <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" /> Weight Progress
              </h3>
              <span className="bg-white/10 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest">
                {weightDiffText}
              </span>
            </div>
            
            <div className="flex items-end justify-between gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Starting</p>
                <p className="text-3xl font-black">{healthData.startWeight || currentWeight} kg</p>
              </div>
              <div className="flex-grow h-px bg-white/10 mb-4 mx-2 border-dashed border-t" />
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Target</p>
                <p className="text-3xl font-black text-emerald-400">{targetWeight} kg</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <span>Current: {currentWeight} kg</span>
                <span>{Math.abs(weightProgress).toFixed(1)} kg lost</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${weightProgressPct}%` }}
                  className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Estimated Completion */}
        <div className="bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> Completion Estimates
              </h3>
              <Info className="w-4 h-4 text-zinc-300" />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Est. Completion</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <p className="text-lg font-black text-zinc-900">12 Weeks</p>
                </div>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Weekly Target</p>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <p className="text-lg font-black text-zinc-900">0.5 kg/wk</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-[11px] font-bold text-emerald-800 leading-relaxed">
              Based on your current <span className="font-black text-emerald-950 uppercase">{goal} plan</span> and active adherence, we estimate you will hit your target of {targetWeight} kg by late October.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
