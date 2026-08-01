import React, { useState } from "react";
import { BottomSheet } from "../ui/BottomSheet";
import { CalendarDays, PauseCircle, ChevronRight, Sparkles, Plane, ShieldCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/primitives";
import { format, addDays } from "date-fns";
import { generateSmartPauseSuggestions } from "@/src/utils/smartPauseEngine";
import { triggerHaptic } from "@/src/utils/haptics";

export function PauseSubscriptionSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [pauseMode, setPauseMode] = useState<"smart" | "single" | "range">("smart");
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const suggestions = generateSmartPauseSuggestions(todayStr);
  const [selectedId, setSelectedId] = useState(suggestions[0].id);
  const [autoResume, setAutoResume] = useState(true);

  const selectedSuggestion = suggestions.find(s => s.id === selectedId) || suggestions[0];

  const handleConfirm = () => {
    triggerHaptic('heavy');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Smart Delivery Pause & Vacation Freeze">
      <div className="space-y-5 pb-6 px-1">
         <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 animate-pulse" />
            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
               Going on vacation? <strong className="text-emerald-700 dark:text-emerald-300 font-black">Smart Pause</strong> analyzes your travel pattern to suggest optimal resume dates with auto-resume.
            </p>
         </div>

         {/* Mode Picker */}
         <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
            <button
               onClick={() => { triggerHaptic('light'); setPauseMode("smart"); }}
               className={`py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                  pauseMode === "smart"
                     ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs"
                     : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
               }`}
            >
               <Sparkles className="w-3 h-3 text-emerald-500" /> AI Smart
            </button>
            <button
               onClick={() => { triggerHaptic('light'); setPauseMode("single"); }}
               className={`py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                  pauseMode === "single"
                     ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs"
                     : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
               }`}
            >
               <CalendarDays className="w-3 h-3 text-orange-500" /> Single Day
            </button>
            <button
               onClick={() => { triggerHaptic('light'); setPauseMode("range"); }}
               className={`py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                  pauseMode === "range"
                     ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs"
                     : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
               }`}
            >
               <Plane className="w-3 h-3 text-indigo-500" /> Custom Range
            </button>
         </div>

         {/* SMART MODE SUGGESTIONS */}
         {pauseMode === "smart" && (
            <div className="space-y-2.5">
               <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Select Optimal Resume Plan
               </label>
               {suggestions.slice(0, 3).map((s) => {
                  const isSel = selectedId === s.id;
                  return (
                     <div 
                        key={s.id}
                        onClick={() => { triggerHaptic('light'); setSelectedId(s.id); }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                           isSel 
                              ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/30"
                              : "border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900"
                        }`}
                     >
                        <div className="space-y-0.5">
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                 {s.badgeText}
                              </span>
                           </div>
                           <p className="text-xs font-black text-zinc-900 dark:text-white">
                              {s.title}
                           </p>
                           <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              Resumes {s.resumeDate} ({s.estimatedMealsSaved} Meals Saved)
                           </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? "border-emerald-500" : "border-zinc-300 dark:border-zinc-700"}`}>
                           {isSel && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                        </div>
                     </div>
                  );
               })}
            </div>
         )}

         {pauseMode === "single" && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-center">
               <p className="text-xs font-black text-zinc-900 dark:text-white mb-1">Pause Tomorrow's Delivery</p>
               <p className="text-[11px] text-zinc-500">Your meal credit will automatically roll over to the end of your plan cycle.</p>
            </div>
         )}

         {pauseMode === "range" && (
            <div className="flex gap-4 items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-white/5">
               <div className="flex-1 text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">From</p>
                  <p className="font-bold text-xs text-zinc-900 dark:text-white">{todayStr}</p>
               </div>
               <ChevronRight className="w-4 h-4 text-zinc-300" />
               <div className="flex-1 text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Until</p>
                  <p className="font-bold text-xs text-zinc-900 dark:text-white">{format(addDays(new Date(), 5), 'yyyy-MM-dd')}</p>
               </div>
            </div>
         )}

         {/* Auto Resume Toggle */}
         <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-white/5">
            <div className="flex items-center gap-2">
               <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
               <div>
                  <p className="text-xs font-black text-zinc-900 dark:text-white">Smart Auto-Resume</p>
                  <p className="text-[10px] text-zinc-500">Auto restarts delivery on return date</p>
               </div>
            </div>
            <input 
               type="checkbox" 
               checked={autoResume} 
               onChange={(e) => setAutoResume(e.target.checked)} 
               className="w-4 h-4 accent-emerald-600 cursor-pointer"
            />
         </div>

         <Button 
            className="w-full h-13 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-transform"
            onClick={handleConfirm}
         >
            Confirm Smart Pause ({selectedSuggestion.durationDays} Days)
         </Button>
      </div>
    </BottomSheet>
  );
}
