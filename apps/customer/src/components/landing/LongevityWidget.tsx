import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

export default function LongevityWidget() {
  const [age, setAge] = useState(25);
  const [exercise, setExercise] = useState(2); // days/week
  const [nutrition, setNutrition] = useState(5); // 1-10
  
  const calculatedScore = Math.min(100, Math.round((nutrition * 8) + (exercise * 4) + (100 - age/2)));
  
  return (
    <section className="py-24 bg-white px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-6">
              Interactive Tools
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.95]">
              Calculate Your <br className="hidden md:block"/> <span className="text-emerald-600">Longevity Potential</span>.
            </h2>
            <p className="text-xl text-slate-500 font-medium mb-10 leading-relaxed">
              Every meal you skip or optimize adds up. Use our simplified calculator to see how TaazaBites can impact your long-term vitality.
            </p>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black uppercase tracking-widest text-slate-400">Current Age</label>
                  <span className="text-lg font-black text-slate-900">{age}</span>
                </div>
                <input 
                  type="range" 
                  min="18" 
                  max="80" 
                  value={age} 
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black uppercase tracking-widest text-slate-400">Exercise (Days/Week)</label>
                  <span className="text-lg font-black text-slate-900">{exercise}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="7" 
                  value={exercise} 
                  onChange={(e) => setExercise(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black uppercase tracking-widest text-slate-400">Current Nutrition Quality</label>
                  <span className="text-lg font-black text-slate-900">{nutrition}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={nutrition} 
                  onChange={(e) => setNutrition(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-emerald-600 blur-[120px] opacity-10 rounded-full" />
            
            <div className="relative bg-zinc-950 rounded-[3rem] p-12 text-center overflow-hidden border border-zinc-800">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <TrendingUp className="w-40 h-40 text-emerald-500" />
              </div>

              <h3 className="text-zinc-400 text-sm font-black uppercase tracking-widest mb-12">Projected Longevity Score</h3>
              
              <div className="relative inline-block mb-12">
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-zinc-800"
                  />
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray="753.98"
                    initial={{ strokeDashoffset: 753.98 }}
                    animate={{ strokeDashoffset: 753.98 - (753.98 * calculatedScore) / 100 }}
                    className="text-emerald-500"
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-7xl font-black text-white tracking-tighter">{calculatedScore}</span>
                  <span className="text-emerald-500 font-bold uppercase text-xs tracking-widest">Potential</span>
                </div>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 mb-12">
                <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                  By switching to <span className="text-white font-bold">TaazaBites Nutrition</span>, you could increase this score by <span className="text-emerald-400 font-bold">+18%</span> in just 90 days.
                </p>
              </div>

              <button className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 group">
                Optimize My Diet <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
