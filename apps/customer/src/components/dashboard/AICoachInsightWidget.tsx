import React from 'react';
import { Card } from '../ui/primitives';
import { Sparkles, Brain, ArrowUpRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AICoachInsightProps {
  userName?: string;
  goal?: string;
}

export default function AICoachInsightWidget({ userName, goal }: AICoachInsightProps) {
  const tips = [
    "Pair your high-protein lunch with 300ml water to optimize amino-acid uptake and prevent mid-afternoon energy slumps.",
    "Your streak is building steady metabolic momentum. Aim for 7 hours of restorative sleep tonight for peak cell recovery.",
    "Metabolic balance peak detected: Your macro distribution is perfectly aligned with active weight management goals."
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 text-white border-none p-6 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-zinc-950/20">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] -mr-24 -mt-24 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">AI Metabolic Coach</span>
            <p className="text-xs font-bold text-zinc-300">Daily Health Brief</p>
          </div>
        </div>

        <Link to="/ai-engine" className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          Ask AI <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <p className="text-xs sm:text-sm font-medium text-zinc-200 leading-relaxed relative z-10 mb-4 italic">
        "{randomTip}"
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-white/10 relative z-10 text-[10px] text-zinc-400 uppercase font-black tracking-widest">
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" /> Verified by Taaza Metabolic Lab
        </span>
        <span>Goal: {goal || 'Maintenance'}</span>
      </div>
    </Card>
  );
}
