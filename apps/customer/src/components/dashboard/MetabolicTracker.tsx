import { motion } from "framer-motion";
import { Zap, Activity, Flame, Droplets } from "lucide-react";
import { Card } from "@/src/components/ui/primitives";
import { Progress } from "@/src/components/ui/Progress";

interface MetabolicTrackerProps {
  healthData: any;
}

export default function MetabolicTracker({ healthData }: MetabolicTrackerProps) {
  if (!healthData) return null;

  const calories = healthData.recommendedCalories || 2000;
  const protein = healthData.recommendedProtein || 100;
  const water = healthData.recommendedWater || 3;

  return (
    <Card className="p-8 bg-zinc-950 text-white rounded-[40px] border-none shadow-2xl relative overflow-hidden group">
      {/* Background aesthetic */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Biological Bio-Profile</p>
            <h3 className="text-3xl font-black tracking-tighter">Metabolic Status</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Activity className="h-7 w-7 text-emerald-400 animate-pulse" />
          </div>
        </div>

        <div className="space-y-8">
          {/* Calories */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-xl">
                  <Flame className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Daily Fuel</span>
                  <span className="text-xs font-bold text-zinc-300">Target Reached</span>
                </div>
              </div>
              <p className="text-2xl font-black text-white">{calories} <span className="text-xs font-medium text-zinc-500">KCAL</span></p>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '65%' }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
               />
            </div>
          </div>

          {/* Protein */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <Zap className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Protein Density</span>
                  <span className="text-xs font-bold text-zinc-300">Muscle Synthesis</span>
                </div>
              </div>
              <p className="text-2xl font-black text-white">{protein} <span className="text-xs font-medium text-zinc-500">G</span></p>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '45%' }}
                 transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                 className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
               />
            </div>
          </div>

          {/* Water */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Droplets className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Hydration Lock</span>
                  <span className="text-xs font-bold text-zinc-300">Cellular Vitality</span>
                </div>
              </div>
              <p className="text-2xl font-black text-white">{water} <span className="text-xs font-medium text-zinc-500">L</span></p>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '80%' }}
                 transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                 className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
               />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Biometric Sync Active</p>
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Next Audit: 2h</p>
        </div>
      </div>
    </Card>
  );
}
