import React from 'react';
import { Card } from '../ui/primitives';
import { ChefHat, ShieldCheck, Flame, PackageCheck, Bike, CheckCircle2 } from 'lucide-react';

interface LiveKitchenProps {
  status?: string;
  eta?: string;
}

export default function LiveKitchenWidget({ status = 'cooking', eta = '1:15 PM' }: LiveKitchenProps) {
  const stages = [
    { key: 'farm', label: 'Fresh Harvest Picked', time: '06:30 AM', icon: <Flame className="w-3.5 h-3.5" /> },
    { key: 'chef', label: 'Chef Prep & Cooking', time: '11:15 AM', icon: <ChefHat className="w-3.5 h-3.5" /> },
    { key: 'qa', label: 'Metabolic QA Audit', time: '12:00 PM', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { key: 'pack', label: 'Eco Sealed & Packed', time: '12:30 PM', icon: <PackageCheck className="w-3.5 h-3.5" /> },
    { key: 'dispatch', label: 'Out for Express Transit', time: '01:00 PM', icon: <Bike className="w-3.5 h-3.5" /> },
  ];

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 p-6 rounded-[2rem] shadow-xl shadow-zinc-200/40 dark:shadow-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Kitchen Telemetry</span>
          </div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Bengaluru Central Kitchen</h3>
        </div>

        <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-right">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Target ETA</p>
          <p className="text-xs font-black text-zinc-900 dark:text-white">{eta}</p>
        </div>
      </div>

      <div className="space-y-4 relative">
        {/* Timeline bar */}
        <div className="absolute top-3 bottom-3 left-4 w-0.5 bg-zinc-100 dark:bg-zinc-800 z-0" />

        {stages.map((stage, idx) => {
          const isDone = idx <= 2; // Simulated pipeline state
          const isCurrent = idx === 2;

          return (
            <div key={stage.key} className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCurrent ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-110' :
                  isDone ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                  'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : stage.icon}
                </div>
                <div>
                  <p className={`text-xs font-bold ${isCurrent ? 'text-zinc-900 dark:text-white font-black' : 'text-zinc-600 dark:text-zinc-400'}`}>
                    {stage.label}
                  </p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{stage.time}</p>
                </div>
              </div>

              {isCurrent && (
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  In Progress
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
