import React from 'react';
import { Card } from '../ui/primitives';
import { Activity, Flame, Droplets, Target, Award, HeartPulse } from 'lucide-react';

interface HealthOverviewProps {
  score: number;
  calories: { consumed: number; target: number };
  protein: { consumed: number; target: number };
  water: { consumed: number; target: number };
  weightGoal?: string;
}

export default function HealthOverviewWidget({ score, calories, protein, water, weightGoal }: HealthOverviewProps) {
  const calPercent = Math.min(100, Math.round((calories.consumed / (calories.target || 1)) * 100));
  const proPercent = Math.min(100, Math.round((protein.consumed / (protein.target || 1)) * 100));
  const watPercent = Math.min(100, Math.round((water.consumed / (water.target || 1)) * 100));

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 shadow-xl shadow-zinc-200/40 dark:shadow-none p-6 rounded-[2rem] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-1">Health Score</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
              {score}
            </span>
            <span className="text-sm font-bold text-emerald-500">Excellent</span>
          </div>
        </div>
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <HeartPulse className="w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 relative z-10">
        <MetricRing 
          icon={<Flame className="w-4 h-4 text-orange-500" />} 
          label="Calories" 
          value={calories.consumed} 
          target={calories.target} 
          unit="kcal" 
          percent={calPercent} 
          color="bg-orange-500"
          bg="bg-orange-100 dark:bg-orange-950/50"
        />
        <MetricRing 
          icon={<Activity className="w-4 h-4 text-emerald-500" />} 
          label="Protein" 
          value={protein.consumed} 
          target={protein.target} 
          unit="g" 
          percent={proPercent} 
          color="bg-emerald-500"
          bg="bg-emerald-100 dark:bg-emerald-950/50"
        />
        <MetricRing 
          icon={<Droplets className="w-4 h-4 text-blue-500" />} 
          label="Water" 
          value={water.consumed / 1000} 
          target={water.target / 1000} 
          unit="L" 
          percent={watPercent} 
          color="bg-blue-500"
          bg="bg-blue-100 dark:bg-blue-950/50"
        />
      </div>

      {weightGoal && (
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <Target className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Goal</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-white capitalize">{weightGoal}</p>
            </div>
          </div>
          <Award className="w-5 h-5 text-amber-500" />
        </div>
      )}
    </Card>
  );
}

function MetricRing({ icon, label, value, target, unit, percent, color, bg }: any) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" className={`fill-none stroke-[8px] ${bg} text-transparent`} />
          <circle 
            cx="50" 
            cy="50" 
            r="42" 
            className={`fill-none stroke-[8px] ${color.replace('bg-', 'text-')} transition-all duration-1000 ease-out`} 
            strokeLinecap="round"
            strokeDasharray={`${(percent / 100) * 264} 264`}
          />
        </svg>
        <div className="relative z-10 bg-white dark:bg-zinc-900 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-sm">
          {icon}
        </div>
      </div>
      <p className="text-sm sm:text-base font-black text-zinc-900 dark:text-white tracking-tight">
        {value}<span className="text-[10px] font-bold text-zinc-400 uppercase ml-0.5">{unit}</span>
      </p>
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
        {label}
      </p>
    </div>
  );
}
