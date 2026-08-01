import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, TrendingDown, TrendingUp, Zap, Sparkles, Plus, 
  CheckCircle2, ArrowRight, Scale, Activity, Flame, ChevronRight, RefreshCw, X
} from 'lucide-react';
import { Card, Button } from '../ui/primitives';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { triggerHaptic } from '@/src/utils/haptics';
import { db } from '@/src/firebase/db';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export interface GoalProgressTrackerProps {
  initialAssessment?: any;
  className?: string;
  onProgressUpdated?: (updatedData: any) => void;
}

export function GoalProgressTracker({
  initialAssessment,
  className,
  onProgressUpdated
}: GoalProgressTrackerProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [assessment, setAssessment] = useState<any>(initialAssessment || null);
  const [loading, setLoading] = useState<boolean>(!initialAssessment);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [newLogValue, setNewLogValue] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch assessment if not provided via props
  useEffect(() => {
    if (initialAssessment) {
      setAssessment(initialAssessment);
      setLoading(false);
      return;
    }

    async function fetchAssessment() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'healthAssessments'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setAssessment(snap.docs[0].data());
        }
      } catch (err) {
        console.error('Error fetching health assessment for goal tracker:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssessment();
  }, [currentUser, initialAssessment]);

  // Derived Goal Data & Metrics
  const rawGoal = assessment?.goal || 'weight_loss';
  
  // Format goal name
  const getGoalInfo = (g: string) => {
    switch (g?.toLowerCase()) {
      case 'weight_loss':
      case 'weightloss':
      case 'weight_management':
        return {
          title: 'Weight Management Goal',
          type: 'weight_loss',
          icon: TrendingDown,
          unit: 'kg',
          color: 'from-emerald-500 to-teal-400',
          badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          accentText: 'text-emerald-500',
          barGradient: 'from-emerald-500 via-teal-400 to-emerald-300',
        };
      case 'muscle_gain':
      case 'musclegain':
      case 'bulking':
        return {
          title: 'Lean Muscle Gain Target',
          type: 'muscle_gain',
          icon: TrendingUp,
          unit: 'kg',
          color: 'from-indigo-500 to-purple-400',
          badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          accentText: 'text-indigo-500',
          barGradient: 'from-indigo-500 via-purple-400 to-indigo-300',
        };
      case 'active_metabolism':
      case 'energy_levels':
      case 'vitality':
        return {
          title: 'Metabolic Energy & Vitality',
          type: 'energy_levels',
          icon: Zap,
          unit: '% Boost',
          color: 'from-amber-500 to-orange-400',
          badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          accentText: 'text-amber-500',
          barGradient: 'from-amber-500 via-orange-400 to-amber-300',
        };
      default:
        return {
          title: 'General Nutrition & Health Target',
          type: 'clean_eating',
          icon: Activity,
          unit: '% Score',
          color: 'from-blue-500 to-cyan-400',
          badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          accentText: 'text-blue-500',
          barGradient: 'from-blue-500 via-cyan-400 to-blue-300',
        };
    }
  };

  const goalMeta = getGoalInfo(rawGoal);

  // Values calculation
  const currentWeight = Number(assessment?.weight) || 72.5;
  const targetWeight = Number(assessment?.targetWeight) || (goalMeta.type === 'muscle_gain' ? 78.0 : 68.0);
  
  // Starting weight from history or fallback
  const history = assessment?.weightHistory || [];
  const startWeight = history.length > 0 ? Number(history[0].weight) : (goalMeta.type === 'muscle_gain' ? 66.0 : 77.0);

  // Compute percentage completed
  let percentage = 0;
  let remainingText = '';
  let startLabel = '';
  let currentLabel = '';
  let targetLabel = '';

  if (goalMeta.type === 'weight_loss') {
    const totalToLose = Math.max(0.1, startWeight - targetWeight);
    const lostSoFar = startWeight - currentWeight;
    percentage = Math.min(100, Math.max(0, Math.round((lostSoFar / totalToLose) * 100)));
    const remainingKg = Math.max(0, currentWeight - targetWeight);
    remainingText = remainingKg > 0 ? `${remainingKg.toFixed(1)} kg remaining` : 'Target Achieved! 🎉';
    startLabel = `${startWeight} kg`;
    currentLabel = `${currentWeight} kg`;
    targetLabel = `${targetWeight} kg`;
  } else if (goalMeta.type === 'muscle_gain') {
    const totalToGain = Math.max(0.1, targetWeight - startWeight);
    const gainedSoFar = currentWeight - startWeight;
    percentage = Math.min(100, Math.max(0, Math.round((gainedSoFar / totalToGain) * 100)));
    const remainingKg = Math.max(0, targetWeight - currentWeight);
    remainingText = remainingKg > 0 ? `${remainingKg.toFixed(1)} kg to build` : 'Goal Target Reached! 💪';
    startLabel = `${startWeight} kg`;
    currentLabel = `${currentWeight} kg`;
    targetLabel = `${targetWeight} kg`;
  } else {
    // Energy / Vitality Score
    const energyScore = Number(assessment?.vitalityScore) || Number(assessment?.energyScore) || 78;
    percentage = Math.min(100, Math.max(0, energyScore));
    remainingText = percentage >= 90 ? 'Peak Vitality Unlocked!' : `${100 - percentage}% to Peak Energy`;
    startLabel = '50% Baseline';
    currentLabel = `${percentage}% Current`;
    targetLabel = '100% Peak';
  }

  // Handle logging progress update
  const handleSaveLog = async () => {
    if (!newLogValue || isNaN(Number(newLogValue))) {
      showToast('Please enter a valid numeric value', 'error');
      return;
    }

    setSubmitting(true);
    triggerHaptic('medium');

    const numVal = parseFloat(newLogValue);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const updatedData: any = { ...assessment };

      if (goalMeta.type === 'weight_loss' || goalMeta.type === 'muscle_gain') {
        updatedData.weight = numVal;
        const newHistory = [...(assessment?.weightHistory || [])];
        newHistory.push({ date: todayStr, weight: numVal });
        updatedData.weightHistory = newHistory;
      } else {
        updatedData.vitalityScore = numVal;
        updatedData.energyScore = numVal;
      }

      updatedData.updatedAt = new Date().toISOString();

      if (currentUser) {
        const docRef = doc(db, 'healthAssessments', `ha_${currentUser.uid}`);
        await setDoc(docRef, updatedData, { merge: true });
      }

      setAssessment(updatedData);
      if (onProgressUpdated) onProgressUpdated(updatedData);

      showToast(`Progress updated! ${numVal} ${goalMeta.unit} logged successfully.`, 'success');
      setShowLogModal(false);
      setNewLogValue('');
    } catch (err) {
      console.error('Error logging health goal progress:', err);
      showToast('Failed to update progress. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const IconComponent = goalMeta.icon;

  return (
    <Card className={cn(
      "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 sm:p-7 rounded-[2.25rem] shadow-xl shadow-zinc-200/40 dark:shadow-none relative overflow-hidden transition-all",
      className
    )}>
      {/* Background Decorative Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 mb-5">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-2xl border flex items-center justify-center", goalMeta.badgeBg)}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Health Assessment Target
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
              {goalMeta.title}
            </h3>
          </div>
        </div>

        {/* Action Button: Log Progress */}
        <Button
          onClick={() => {
            triggerHaptic('light');
            setNewLogValue(goalMeta.type === 'energy_levels' ? `${percentage}` : `${currentWeight}`);
            setShowLogModal(true);
          }}
          className="h-9 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Update Progress</span>
        </Button>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-3 relative z-10 p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80">
        
        {/* Progress Bar Header Specs */}
        <div className="flex items-baseline justify-between text-xs font-black">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {percentage}%
            </span>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Goal Completed
            </span>
          </div>
          <span className={cn("text-xs font-black px-2.5 py-1 rounded-full border", goalMeta.badgeBg)}>
            {remainingText}
          </span>
        </div>

        {/* Visual Progress Bar Track */}
        <div className="relative h-4 w-full bg-zinc-200/80 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-300/40 dark:border-zinc-700/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full bg-gradient-to-r shadow-xs relative",
              goalMeta.barGradient
            )}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </motion.div>
        </div>

        {/* Milestones / Key Markers Row */}
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400 pt-1">
          <div className="flex flex-col items-start">
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-extrabold">Starting</span>
            <span className="font-black text-zinc-800 dark:text-zinc-200">{startLabel}</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" /> Current
            </span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">{currentLabel}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-extrabold">Target</span>
            <span className="font-black text-zinc-800 dark:text-zinc-200">{targetLabel}</span>
          </div>
        </div>
      </div>

      {/* Goal Insights & Context Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            {goalMeta.type === 'weight_loss' 
              ? 'Calorie & macro-balanced TaazaBites meals keep your deficit on track without muscle loss.'
              : goalMeta.type === 'muscle_gain'
              ? 'High-protein organic ingredients deliver optimal muscle synthesis after workouts.'
              : 'Clean ingredients and low-GI carbs provide steady all-day metabolic energy.'}
          </span>
        </div>

        <Link 
          to="/dashboard/settings"
          className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
        >
          Edit Target & Assessment &rarr;
        </Link>
      </div>

      {/* Log Progress Modal Overlay */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowLogModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-emerald-500" />
                <h4 className="text-lg font-black text-zinc-900 dark:text-white">
                  Update Goal Progress
                </h4>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Log your latest measurement for <span className="font-bold text-zinc-800 dark:text-zinc-200">{goalMeta.title}</span> ({goalMeta.unit}).
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                    Current {goalMeta.type === 'energy_levels' ? 'Energy Level Score (%)' : 'Weight (kg)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLogValue}
                    onChange={(e) => setNewLogValue(e.target.value)}
                    placeholder={goalMeta.type === 'energy_levels' ? 'e.g. 85' : 'e.g. 71.5'}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono font-bold text-lg border border-transparent focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => setShowLogModal(false)}
                    variant="ghost"
                    className="flex-1 h-11 rounded-xl text-zinc-600 dark:text-zinc-300 font-bold text-xs uppercase"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveLog}
                    disabled={submitting}
                    className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase cursor-pointer"
                  >
                    {submitting ? 'Saving...' : 'Save Record'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Card>
  );
}
