import React from "react";
import { Card } from "../ui/primitives";
import { BrainCircuit, Sparkles, Zap, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export default function MentalClarityWidget() {
  return (
    <Card className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950 dark:to-indigo-900 border border-indigo-100 dark:border-indigo-800 p-6 rounded-[2rem] text-zinc-900 dark:text-white shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-black text-sm uppercase tracking-widest text-indigo-900 dark:text-indigo-200">Cognitive Load</h4>
          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Neural Readiness Score</p>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4 relative z-10">
        <h2 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">94</h2>
        <span className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">/100</span>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="bg-white/80 dark:bg-indigo-950/50 p-4 rounded-2xl border border-indigo-200/60 dark:border-indigo-500/20 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Peak Focus Window</span>
          </div>
          <p className="text-[10px] text-zinc-600 dark:text-indigo-300 font-medium leading-relaxed">
            Your afternoon meal was formulated with <strong className="text-indigo-900 dark:text-indigo-100">L-Tyrosine</strong> & <strong className="text-indigo-900 dark:text-indigo-100">Lion's Mane</strong> to prevent the 3PM crash. You have ~3 hours of peak deep work capacity remaining.
          </p>
        </div>
        
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Alpha Waves Optimal</span>
          <span>+12% vs avg</span>
        </div>
      </div>
    </Card>
  );
}
