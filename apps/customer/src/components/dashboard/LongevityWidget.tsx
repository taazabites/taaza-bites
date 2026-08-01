import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Button } from "../ui/primitives";
import { 
  Dna, 
  Clock, 
  Camera, 
  ActivitySquare,
  Sparkles,
  Zap,
  TrendingDown
} from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

export default function LongevityWidget() {
  const { showToast } = useToast();
  const [fastingProgress, setFastingProgress] = useState(65); // percentage
  
  // Fake animation for fasting progress
  useEffect(() => {
    const interval = setInterval(() => {
      setFastingProgress(p => p >= 100 ? 100 : p + 0.1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleScanClick = () => {
    // Provide tactile feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    showToast("Activating AI Camera...", "success");
    // In a real app this would open the device camera using a native bridge or webRTC
    setTimeout(() => {
      showToast("Camera access requested for AI Cheat Meal analysis.", "success");
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Longevity & Bio-Age */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden group shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] -mr-20 -mt-20 group-hover:bg-purple-500/20 transition-colors duration-700" />
        
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Dna className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">Longevity Metrics</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Bio Age</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">27.4</h3>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-bold flex items-center">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -1.2y
                  </span>
                </div>
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Chrono Age</p>
                <h3 className="text-4xl font-black tracking-tighter text-zinc-600">29.0</h3>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <ActivitySquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                Cellular turnover is <span className="text-purple-600 dark:text-purple-400 font-bold">14% higher</span> than average due to your customized high-antioxidant protocol.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Autophagy / Fasting & AI Cam */}
      <div className="flex flex-col gap-6">
        <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 p-6 rounded-[2rem] flex-1 shadow-lg flex items-center gap-6">
           <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
             <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="45" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="8" fill="none" />
               <motion.circle 
                 cx="50" 
                 cy="50" 
                 r="45" 
                 className="stroke-amber-500" 
                 strokeWidth="8" 
                 fill="none"
                 strokeLinecap="round"
                 initial={{ strokeDasharray: "283 283", strokeDashoffset: 283 }}
                 animate={{ strokeDashoffset: 283 - (283 * fastingProgress) / 100 }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <Clock className="w-4 h-4 text-amber-500 mb-1" />
               <span className="text-xs font-black">16:8</span>
             </div>
           </div>
           
           <div>
             <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Circadian Fasting</h4>
             <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-2 leading-relaxed">
               Deep cellular repair (autophagy) begins in 2 hours. Stay hydrated.
             </p>
             <div className="flex items-center gap-2">
                <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-full">
                  Fasting
                </span>
                <span className="text-[10px] font-bold text-zinc-400">10h 24m elapsed</span>
             </div>
           </div>
        </Card>

        {/* AI Scan Action */}
        <Button 
          onClick={handleScanClick}
          className="w-full h-16 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-[1.5rem] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          <Camera className="w-5 h-5" />
          <span className="font-black text-xs uppercase tracking-widest">AI Off-Plan Meal Scan</span>
          <Sparkles className="w-4 h-4 opacity-70" />
        </Button>
      </div>
    </div>
  );
}
