import { motion } from 'framer-motion';
import { Utensils, Sparkles, ShieldCheck, Flame } from 'lucide-react';
import { Skeleton } from "@/src/components/ui/Skeleton";

export default function PageSkeleton() {
  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-zinc-950 flex flex-col items-center justify-start pt-8 pb-20 px-4 md:px-8 space-y-8 max-w-7xl mx-auto overflow-hidden">
      {/* Ambient Emerald & Teal Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Sweep Progress Line */}
      <div className="w-full max-w-2xl h-1 bg-emerald-100 dark:bg-emerald-950/60 rounded-full overflow-hidden relative shadow-xs">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-1/2 h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-full shadow-sm shadow-emerald-500/50"
        />
      </div>

      {/* Brand Loading Banner Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center space-y-3.5 text-center"
      >
        <div className="relative">
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2.5 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-30 blur-md"
          />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 ring-2 ring-emerald-400/40">
            <Utensils className="w-8 h-8 stroke-[2.2]" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 justify-center">
            <span className="font-black text-2xl tracking-tight text-zinc-900 dark:text-white">TAAZABITES</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-300/50 dark:border-emerald-700/50">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Kitchen Live
            </span>
          </div>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400/90 flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Curating macro-calculated nutrition for your day...</span>
          </p>
        </div>
      </motion.div>

      {/* Main Skeleton Content Layout */}
      <div className="w-full space-y-8">
        {/* Top Hero Banner Skeleton */}
        <div className="p-6 md:p-8 rounded-[2.5rem] bg-white/90 dark:bg-zinc-900/90 border border-emerald-100/80 dark:border-emerald-900/40 shadow-xl shadow-emerald-900/5 backdrop-blur-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton variant="emerald" className="h-7 w-56 rounded-xl" />
              <Skeleton className="h-4 w-72 rounded-lg" />
            </div>
            <Skeleton variant="emerald" className="h-9 w-32 rounded-full" />
          </div>

          {/* Quick Macro Indicators Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                <Flame className="w-3.5 h-3.5 text-emerald-500" />
                <span>Calories</span>
              </div>
              <Skeleton variant="emerald" className="h-8 w-24 rounded-lg" />
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/40 space-y-2">
              <span className="text-xs text-teal-700 dark:text-teal-400 font-bold">Protein</span>
              <Skeleton variant="teal" className="h-8 w-20 rounded-lg" />
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 space-y-2">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">Complex Carbs</span>
              <Skeleton variant="amber" className="h-8 w-22 rounded-lg" />
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/30 space-y-2">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">Healthy Fats</span>
              <Skeleton variant="emerald" className="h-8 w-18 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Shimmering Category Pills Row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <Skeleton variant="emerald" className="h-10 w-28 rounded-full shrink-0" />
          <Skeleton className="h-10 w-32 rounded-full shrink-0" />
          <Skeleton className="h-10 w-36 rounded-full shrink-0" />
          <Skeleton className="h-10 w-28 rounded-full shrink-0" />
        </div>

        {/* 3 Meal Cards Grid Skeleton with Shimmering Emerald Accents */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="p-5 bg-white/90 dark:bg-zinc-900/90 rounded-[2.2rem] border border-emerald-100/70 dark:border-emerald-900/30 shadow-lg shadow-emerald-900/5 backdrop-blur-sm space-y-4 relative overflow-hidden group"
            >
              {/* Image Shimmer Container */}
              <div className="relative overflow-hidden rounded-2xl">
                <Skeleton variant="emerald" className="h-48 w-full rounded-2xl" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Skeleton variant="emerald" className="h-6 w-20 rounded-full" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <Skeleton className="h-5 w-3/4 rounded-lg" />
                  <Skeleton variant="emerald" className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-4/5 rounded-md" />
              </div>

              {/* Macro Pills Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <Skeleton variant="emerald" className="h-7 rounded-xl" />
                <Skeleton variant="teal" className="h-7 rounded-xl" />
                <Skeleton variant="amber" className="h-7 rounded-xl" />
              </div>

              {/* Bottom Action CTA */}
              <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Skeleton variant="emerald" className="h-6 w-24 rounded-full" />
                <Skeleton variant="emerald" className="h-10 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Analytics & Delivery Tracking Chart Skeleton */}
        <div className="p-6 bg-white/90 dark:bg-zinc-900/90 rounded-[2.5rem] border border-emerald-100/70 dark:border-emerald-900/30 shadow-md space-y-5">
          <div className="flex justify-between items-center">
            <Skeleton variant="emerald" className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
          <div className="grid grid-cols-7 gap-3 items-end h-36 pt-4 px-2">
            {[40, 65, 80, 50, 90, 75, 60].map((heightPct, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end w-full">
                <Skeleton 
                  variant={idx % 2 === 0 ? "emerald" : "teal"} 
                  className="w-full rounded-t-xl" 
                  style={{ height: `${heightPct}%` }} 
                />
                <Skeleton className="h-3 w-6 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


