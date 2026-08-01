import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplet, Flame, Activity, Award, TrendingUp, Plus, Minus, 
  Sparkles, GlassWater, Footprints, Heart, CheckCircle, RefreshCw, Info 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import confetti from 'canvas-confetti';

interface DailyVitalityTrackerProps {
  completedMeals: Record<string, Record<string, boolean>>;
  plan: any;
}

interface VitalityLog {
  waterIntake: number; // ml
  steps: number;
  activeMinutes: number;
  caloriesBurned: number;
  date: string;
}

interface MacroCalculatorResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  goal: string;
  dietType: string;
  weightKg?: number;
  activityLevel?: number;
}

export const DailyVitalityTracker: React.FC<DailyVitalityTrackerProps> = ({ completedMeals, plan }) => {
  const { user } = useAuth();
  
  // Format current date as YYYY-MM-DD
  const todayDateStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const todayDayOfWeek = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getDay()];
  }, []);

  // State for macro calculator results
  const [macroResults, setMacroResults] = useState<MacroCalculatorResults | null>(null);

  // State for daily logs
  const [log, setLog] = useState<VitalityLog>({
    waterIntake: 0,
    steps: 0,
    activeMinutes: 0,
    caloriesBurned: 0,
    date: todayDateStr
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Load Macro Results & Daily Logs
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // 1. Load macro-calculator results from localStorage or Firestore
      let savedMacros: MacroCalculatorResults | null = null;
      try {
        const localMacros = localStorage.getItem('tb_macro_calculator_results');
        if (localMacros) {
          savedMacros = JSON.parse(localMacros);
        }
      } catch (e) {
        console.warn("Storage access denied:", e);
      }

      if (db && user && user.uid) {
        try {
          const macroDocRef = doc(db, 'users', user.uid, 'macro_calculator', 'results');
          const docSnap = await getDoc(macroDocRef);
          if (docSnap.exists()) {
            savedMacros = docSnap.data() as MacroCalculatorResults;
            try {
              localStorage.setItem('tb_macro_calculator_results', JSON.stringify(savedMacros));
            } catch (e) {}
          }
        } catch (err) {
          console.error("Failed to load macros from Firestore:", err);
        }
      }
      setMacroResults(savedMacros);

      // 2. Load daily vitality log for today
      let todayLog: VitalityLog = {
        waterIntake: 0,
        steps: 0,
        activeMinutes: 0,
        caloriesBurned: 0,
        date: todayDateStr
      };

      // Load from local storage
      let localLogs: string | null = null;
      try {
        localLogs = localStorage.getItem('tb_daily_vitality_logs');
        if (localLogs) {
          const parsed = JSON.parse(localLogs);
          if (parsed[todayDateStr]) {
            todayLog = parsed[todayDateStr];
          }
        }
      } catch (e) {
        console.warn("Storage access denied:", e);
      }

      // Sync with Firestore if logged in
      if (db && user && user.uid) {
        try {
          const logDocRef = doc(db, 'users', user.uid, 'vitality_logs', todayDateStr);
          const docSnap = await getDoc(logDocRef);
          if (docSnap.exists()) {
            todayLog = docSnap.data() as VitalityLog;
            // Merge & save locally
            try {
              const parsed = localLogs ? JSON.parse(localLogs) : {};
              parsed[todayDateStr] = todayLog;
              localStorage.setItem('tb_daily_vitality_logs', JSON.stringify(parsed));
            } catch (e) {}
          }
        } catch (err) {
          console.error("Failed to load daily vitality log from Firestore:", err);
        }
      }

      setLog(todayLog);
      setIsLoading(false);
    };

    loadData().catch(e => console.error("Unhandled in loadData", e));

    // Listen to real-time updates from MacroCalculator
    const handleMacrosUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<MacroCalculatorResults>;
      if (customEvent.detail) {
        setMacroResults(customEvent.detail);
      }
    };

    window.addEventListener('tb:macros_updated', handleMacrosUpdated);
    return () => {
      window.removeEventListener('tb:macros_updated', handleMacrosUpdated);
    };
  }, [user, todayDateStr]);

  // Handle saving log changes (local and cloud)
  const saveLog = async (updatedLog: VitalityLog) => {
    setLog(updatedLog);

    // Save locally
    try {
      const localLogs = localStorage.getItem('tb_daily_vitality_logs');
      const parsed = localLogs ? JSON.parse(localLogs) : {};
      parsed[todayDateStr] = updatedLog;
      localStorage.setItem('tb_daily_vitality_logs', JSON.stringify(parsed));
    } catch (e) {}

    // Save to Firestore if authenticated
    if (db && user && user.uid) {
      setIsSyncing(true);
      try {
        const logDocRef = doc(db, 'users', user.uid, 'vitality_logs', todayDateStr);
        await setDoc(logDocRef, updatedLog);
      } catch (err) {
        console.error("Failed to save daily log to Firestore:", err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Dynamic Targets derived from Macro Calculator
  const hydrationTarget = useMemo(() => {
    // Standard formula: 35ml per kg of bodyweight
    if (macroResults && (macroResults.weightKg || (macroResults as any).weight)) {
      const weight = macroResults.weightKg || (macroResults as any).weight || 70;
      return Math.round(weight * 35);
    }
    return 2500; // default 2.5L
  }, [macroResults]);

  const stepsTarget = useMemo(() => {
    if (macroResults && macroResults.tdee) {
      // Scale step target based on TDEE / activity levels
      const tdee = macroResults.tdee;
      if (tdee > 2800) return 12000;
      if (tdee < 1800) return 8000;
    }
    return 10000; // default 10k steps
  }, [macroResults]);

  const activeMinutesTarget = useMemo(() => {
    if (macroResults && macroResults.tdee) {
      const tdee = macroResults.tdee;
      if (tdee > 2800) return 60;
      if (tdee < 1800) return 30;
    }
    return 45; // default 45 mins
  }, [macroResults]);

  const calorieTarget = useMemo(() => {
    return macroResults?.targetCalories || 2000;
  }, [macroResults]);

  // Calculate calories consumed for today from parent schedule state
  const caloriesConsumedToday = useMemo(() => {
    // Map completed meals for todayDayOfWeek
    // completedMeals keys are 'Mon', 'Tue' etc. from WEEK_DAYS
    const completedForToday = completedMeals[todayDayOfWeek] || { breakfast: false, lunch: false, dinner: false };
    const mealsForToday = plan[todayDayOfWeek] || {};

    let totalCals = 0;
    if (completedForToday.breakfast && mealsForToday.breakfast) totalCals += mealsForToday.breakfast.calories;
    if (completedForToday.lunch && mealsForToday.lunch) totalCals += mealsForToday.lunch.calories;
    if (completedForToday.dinner && mealsForToday.dinner) totalCals += mealsForToday.dinner.calories;

    return totalCals;
  }, [completedMeals, plan, todayDayOfWeek]);

  // Calculate component scores and final Vitality Score
  const scores = useMemo(() => {
    // 1. Hydration Score (30%)
    const hydrationScore = Math.min(30, (log.waterIntake / hydrationTarget) * 30);

    // 2. Steps Adherence (20%)
    const stepsScore = Math.min(20, (log.steps / stepsTarget) * 20);

    // 3. Exercise Adherence (20%)
    const exerciseScore = Math.min(20, (log.activeMinutes / activeMinutesTarget) * 20);

    // 4. Nutrition Adherence (30%)
    // Compares completedCalories against calorieTarget from the calculator!
    let nutritionScore = 0;
    if (caloriesConsumedToday > 0) {
      const percentage = caloriesConsumedToday / calorieTarget;
      if (percentage <= 1.0) {
        // Linear scale up to 30 points as they eat their planned meals
        nutritionScore = percentage * 30;
      } else if (percentage <= 1.15) {
        // High score for being close but slightly over
        nutritionScore = 30;
      } else {
        // Penalty for overeating beyond 15% surplus
        const excess = percentage - 1.15;
        nutritionScore = Math.max(10, 30 - (excess * 60));
      }
    } else {
      // Default base score for metabolic BMR breathing
      nutritionScore = 5;
    }

    const totalScore = Math.round(hydrationScore + stepsScore + exerciseScore + nutritionScore);

    return {
      hydration: Math.round(hydrationScore),
      steps: Math.round(stepsScore),
      exercise: Math.round(exerciseScore),
      nutrition: Math.round(nutritionScore),
      total: Math.min(100, totalScore)
    };
  }, [log, hydrationTarget, stepsTarget, activeMinutesTarget, caloriesConsumedToday, calorieTarget]);

  // Trigger high-score celebration
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);
  useEffect(() => {
    if (scores.total === 100 && !hasCelebrated) {
      setHasCelebrated(true);
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#059669', '#3b82f6', '#fbbf24', '#f59e0b', '#38bdf8']
      })?.catch(e => console.warn("Confetti", e));
      const toastEvent = new CustomEvent('taaza:toast', {
        detail: { message: "Daily Vitality Peak! 100% lifestyle goal matched! 🎉", type: 'success' }
      });
      window.dispatchEvent(toastEvent);
    } else if (scores.total < 100) {
      setHasCelebrated(false);
    }
  }, [scores.total, hasCelebrated]);

  // State text based on Vitality Score
  const vitalityMessage = useMemo(() => {
    const s = scores.total;
    if (s >= 95) return { label: 'Metabolic Peak', desc: 'Your bio-vitality markers are highly optimal today. Exceptional discipline!', color: 'text-emerald-500' };
    if (s >= 75) return { label: 'Vitality Optimized', desc: 'Great energy balance. Mindful hydration and active habits are synchronized.', color: 'text-teal-500' };
    if (s >= 40) return { label: 'Active Homeostasis', desc: 'Steady state. Increase hydration or step count to fully activate metabolic burning.', color: 'text-amber-500' };
    return { label: 'Low Metabolic State', desc: 'Sedentary baseline. Hydrate and move briefly to boost your circulation and energy.', color: 'text-zinc-400' };
  }, [scores.total]);

  // Logging handlers
  const handleAddWater = (amount: number) => {
    const updatedWater = Math.max(0, log.waterIntake + amount);
    saveLog({
      ...log,
      waterIntake: updatedWater
    });
  };

  const handleAddSteps = (amount: number) => {
    const updatedSteps = Math.max(0, log.steps + amount);
    // Auto-calculate passive calories burned (standard metric: approx 0.04 kcal per step)
    const passiveBurn = updatedSteps * 0.04;
    const activeBurn = log.activeMinutes * 6.5; // average 6.5 kcal per active minute
    saveLog({
      ...log,
      steps: updatedSteps,
      caloriesBurned: Math.round(passiveBurn + activeBurn)
    });
  };

  const handleAddActiveMinutes = (amount: number) => {
    const updatedMins = Math.max(0, log.activeMinutes + amount);
    const activeBurn = updatedMins * 6.5;
    const passiveBurn = log.steps * 0.04;
    saveLog({
      ...log,
      activeMinutes: updatedMins,
      caloriesBurned: Math.round(passiveBurn + activeBurn)
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-[#FF7A00] animate-spin mb-4" />
        <p className="text-zinc-500 text-xs font-mono">Synchronizing live vitality signals...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF7A00]/5 rounded-bl-[100px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-zinc-50 pb-6 gap-4">
        <div>
          <span className="text-[9px] font-black text-[#FF7A00] uppercase tracking-[0.5em] block mb-2">VITALITY LOGGING</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-sans text-[#1A1A1A] uppercase">Daily Vitality Matrix</h3>
          <p className="text-zinc-500 text-xs sm:text-sm mt-2 max-w-md font-light leading-relaxed">
            Track water, physical activity, and subscription nutrition to calculate your real-time daily vitality score.
          </p>
        </div>
        
        {isSyncing && (
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-full text-[9px] text-zinc-400 font-mono">
            <RefreshCw className="w-3 h-3 animate-spin text-[#FF7A00]" />
            CLOUD SYNC ACTIVE
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Circle Progress Score Display */}
        <div className="lg:col-span-4 bg-zinc-50 p-8 rounded-3xl border border-zinc-100 flex flex-col justify-between items-center text-center">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono mb-4 block">VITALITY STATUS</span>
          
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Outer ring background */}
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                stroke="#E5E7EB" 
                strokeWidth="7" 
                fill="transparent" 
              />
              {/* Progress ring */}
              <motion.circle 
                cx="50" 
                cy="50" 
                r="42" 
                stroke="#FF7A00" 
                strokeWidth="7" 
                fill="transparent" 
                strokeDasharray={263.89}
                initial={{ strokeDashoffset: 263.89 }}
                animate={{ strokeDashoffset: 263.89 - (263.89 * scores.total) / 100 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">Vitality</span>
              <span className="text-5xl font-mono font-black text-[#1A1A1A] tracking-tighter">{scores.total}</span>
              <span className="text-[9px] font-black text-[#FF7A00] block">/ 100 PTS</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <span className={`text-xs font-black uppercase tracking-wider block ${vitalityMessage.color}`}>
              {vitalityMessage.label}
            </span>
            <p className="text-zinc-500 text-[11px] font-light leading-relaxed max-w-xs">
              {vitalityMessage.desc}
            </p>
          </div>
        </div>

        {/* Interactive Hydration & Steps & Active Minutes Logger */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-6 overflow-hidden">
          <div className="flex lg:flex-col gap-6 overflow-x-auto pb-4 -mx-2 px-2 lg:mx-0 lg:px-0 lg:pb-0 snap-x snap-mandatory scrollbar-hide">
            {/* Hydration Logger */}
            <div className="flex-shrink-0 w-[85vw] lg:w-full snap-center bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <GlassWater className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-800">Hydration Progress</h4>
                    <p className="text-[10px] text-zinc-400">Target: {hydrationTarget}ml ({Math.round(hydrationTarget/250)} glasses)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-black text-zinc-800">{log.waterIntake} <span className="text-xs text-zinc-400">ml</span></span>
                  <span className="text-[9px] font-bold text-blue-500 block">+{scores.hydration} pts</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-200/50 h-2.5 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-blue-500 h-full rounded-full"
                  animate={{ width: `${Math.min(100, (log.waterIntake / hydrationTarget) * 100)}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Quick buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button 
                  onClick={() => handleAddWater(250)}
                  className="px-4 py-2 border border-zinc-200 hover:border-blue-400 bg-white rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-500" /> 1 Glass
                </button>
                <button 
                  onClick={() => handleAddWater(500)}
                  className="px-4 py-2 border border-zinc-200 hover:border-blue-400 bg-white rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-500" /> 1 Bottle
                </button>
              </div>
            </div>

            {/* Activity Steps Logger */}
            <div className="flex-shrink-0 w-[85vw] lg:w-full snap-center bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <Footprints className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-800">Step Tracker</h4>
                    <p className="text-[10px] text-zinc-400">Target: {stepsTarget} steps</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-black text-zinc-800">{log.steps} <span className="text-xs text-zinc-400">steps</span></span>
                  <span className="text-[9px] font-bold text-emerald-500 block">+{scores.steps} pts</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-200/50 h-2.5 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-emerald-500 h-full rounded-full"
                  animate={{ width: `${Math.min(100, (log.steps / stepsTarget) * 100)}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Quick buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button 
                  onClick={() => handleAddSteps(1000)}
                  className="px-4 py-2 border border-zinc-200 hover:border-emerald-400 bg-white rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" /> +1,000
                </button>
                <button 
                  onClick={() => handleAddSteps(2500)}
                  className="px-4 py-2 border border-zinc-200 hover:border-emerald-400 bg-white rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" /> +2,500
                </button>
              </div>
            </div>

            {/* Active Workout Tracker */}
            <div className="flex-shrink-0 w-[85vw] lg:w-full snap-center bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-800">Active Minutes</h4>
                    <p className="text-[10px] text-zinc-400">Target: {activeMinutesTarget} mins</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-black text-zinc-800">{log.activeMinutes} <span className="text-xs text-zinc-400">mins</span></span>
                  <span className="text-[9px] font-bold text-amber-500 block">+{scores.exercise} pts</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-200/50 h-2.5 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-amber-500 h-full rounded-full"
                  animate={{ width: `${Math.min(100, (log.activeMinutes / activeMinutesTarget) * 100)}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Quick buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button 
                  onClick={() => handleAddActiveMinutes(10)}
                  className="px-4 py-2 border border-zinc-200 hover:border-amber-400 bg-white rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-500" /> +10 Mins
                </button>
                <button 
                  onClick={() => handleAddActiveMinutes(30)}
                  className="px-4 py-2 border border-zinc-200 hover:border-amber-400 bg-white rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-500" /> +30 Mins
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-100 text-center">
        <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1">BURNED ENERGY</span>
          <span className="text-sm font-mono font-black text-zinc-800 flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 text-orange-500 shrink-0" /> {log.caloriesBurned} kcal
          </span>
        </div>
        
        <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1">NUTRITION BUDGET</span>
          <span className="text-sm font-mono font-black text-zinc-800 flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4 text-[#059669] shrink-0" /> {caloriesConsumedToday} / {calorieTarget} kcal
          </span>
        </div>

        <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1">NUTRITION SCORE</span>
          <span className="text-sm font-mono font-black text-zinc-800 flex items-center justify-center gap-1">
            <Award className="w-4 h-4 text-yellow-500 shrink-0" /> {scores.nutrition} / 30 pts
          </span>
        </div>

        <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1">CALCULATOR BASIS</span>
          <span className="text-sm font-mono font-bold text-zinc-600 flex items-center justify-center gap-1 uppercase tracking-wider text-[10px] truncate">
            <Info className="w-4 h-4 text-zinc-400 shrink-0" /> {macroResults ? `${macroResults.goal} (${macroResults.dietType})` : 'DEFAULT CALS'}
          </span>
        </div>
      </div>

    </div>
  );
};
