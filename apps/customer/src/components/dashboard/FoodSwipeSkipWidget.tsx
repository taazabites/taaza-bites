import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Flame, 
  Clock, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  Wallet, 
  ChevronRight, 
  AlertCircle, 
  Utensils, 
  ChefHat, 
  ShieldAlert, 
  ArrowLeftRight, 
  Zap, 
  Calendar, 
  Info,
  Check,
  X,
  HelpCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { triggerHaptic } from '../../utils/haptics';

export interface SwipeableMeal {
  id: string;
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // e.g., "Today", "Tomorrow", "Wednesday"
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  dishName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
  status: 'scheduled' | 'skipped' | 'confirmed';
  price: number;
}

interface FoodSwipeSkipWidgetProps {
  onMealSkip?: (meal: SwipeableMeal) => void;
  onMealSwap?: (meal: SwipeableMeal) => void;
  userWalletBalance?: number;
}

// Kitchen Cutoff Rules
// Breakfast: 10:00 PM (22:00) night before
// Lunch: 08:00 AM (08:00) same day
// Dinner: 02:00 PM (14:00) same day (Explicit user requirement)
export function getMealCutoffTime(dateStr: string, mealType: 'Breakfast' | 'Lunch' | 'Dinner'): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const mealDate = new Date(year, month - 1, day);

  if (mealType === 'Dinner') {
    // 2:00 PM same day
    mealDate.setHours(14, 0, 0, 0);
  } else if (mealType === 'Lunch') {
    // 8:00 AM same day
    mealDate.setHours(8, 0, 0, 0);
  } else {
    // Breakfast: 10:00 PM day before
    mealDate.setDate(mealDate.getDate() - 1);
    mealDate.setHours(22, 0, 0, 0);
  }

  return mealDate;
}

export function formatCutoffLabel(mealType: 'Breakfast' | 'Lunch' | 'Dinner'): string {
  if (mealType === 'Dinner') return '02:00 PM Same Day';
  if (mealType === 'Lunch') return '08:00 AM Same Day';
  return '10:00 PM Night Before';
}

const DEFAULT_MEAL_DECK: SwipeableMeal[] = [
  {
    id: 'm-dinner-today',
    dateStr: new Date().toISOString().split('T')[0],
    dayLabel: 'Today',
    mealType: 'Dinner',
    dishName: 'Slow-Cooked Lean Lamb Tagine with Cauliflower Couscous',
    calories: 540,
    protein: 38,
    carbs: 18,
    fat: 26,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fm=webp&fit=crop&q=80&w=600',
    status: 'scheduled',
    price: 280,
  },
  {
    id: 'm-brk-tmrw',
    dateStr: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dayLabel: 'Tomorrow',
    mealType: 'Breakfast',
    dishName: 'Avocado & Quinoa Power Bowl with Poached Egg',
    calories: 420,
    protein: 18,
    carbs: 45,
    fat: 22,
    image: 'https://images.unsplash.com/photo-1511690656153-19294f27c832?auto=format&fm=webp&fit=crop&q=80&w=600',
    status: 'scheduled',
    price: 240,
  },
  {
    id: 'm-lunch-tmrw',
    dateStr: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dayLabel: 'Tomorrow',
    mealType: 'Lunch',
    dishName: 'Mediterranean Grilled Salmon over Charred Asparagus',
    calories: 510,
    protein: 35,
    carbs: 12,
    fat: 28,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fm=webp&fit=crop&q=80&w=600',
    status: 'scheduled',
    price: 320,
  },
  {
    id: 'm-dinner-tmrw',
    dateStr: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dayLabel: 'Tomorrow',
    mealType: 'Dinner',
    dishName: 'Zucchini Noodles with House-Made Basil Cashew Pesto',
    calories: 320,
    protein: 12,
    carbs: 25,
    fat: 18,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fm=webp&fit=crop&q=80&w=600',
    status: 'scheduled',
    price: 260,
  }
];

export default function FoodSwipeSkipWidget({
  onMealSkip,
  onMealSwap,
  userWalletBalance = 450
}: FoodSwipeSkipWidgetProps) {
  const { showToast } = useToast();
  const [meals, setMeals] = useState<SwipeableMeal[]>(DEFAULT_MEAL_DECK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wallet, setWallet] = useState(userWalletBalance);
  const [now, setNow] = useState(new Date());

  // Locked cutoff modal state
  const [lockedModalMeal, setLockedModalMeal] = useState<SwipeableMeal | null>(null);

  // Visual Onboarding Tooltip State
  const [showTooltip, setShowTooltip] = useState(() => {
    return localStorage.getItem('taaza_swipe_onboarding_dismissed') !== 'true';
  });

  const dismissTooltip = () => {
    triggerHaptic('light');
    setShowTooltip(false);
    localStorage.setItem('taaza_swipe_onboarding_dismissed', 'true');
  };

  // Live clock ticker for exact cutoff comparison
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeMeal = meals[currentIndex];

  // Motion values for swipe drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const leftOpacity = useTransform(x, [-120, -20], [1, 0]);
  const rightOpacity = useTransform(x, [20, 120], [0, 1]);

  // Cutoff Status Calculation for active meal
  const cutoffInfo = useMemo(() => {
    if (!activeMeal) return { isLocked: false, label: '', timeRemainingStr: '' };

    const cutoffTime = getMealCutoffTime(activeMeal.dateStr, activeMeal.mealType);
    const diffMs = cutoffTime.getTime() - now.getTime();
    const isLocked = diffMs <= 0;

    if (isLocked) {
      return {
        isLocked: true,
        label: `Locked at ${formatCutoffLabel(activeMeal.mealType)}`,
        timeRemainingStr: 'Cutoff Passed'
      };
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

    const timeStr = hours > 0 
      ? `${hours}h ${mins}m left` 
      : `${mins}m ${secs}s left`;

    return {
      isLocked: false,
      label: `Cutoff: ${formatCutoffLabel(activeMeal.mealType)}`,
      timeRemainingStr: timeStr
    };
  }, [activeMeal, now]);

  // Action: Skip Meal
  const handleSkipAction = (meal: SwipeableMeal) => {
    const cutoffTime = getMealCutoffTime(meal.dateStr, meal.mealType);
    if (now.getTime() >= cutoffTime.getTime()) {
      // Locked! Show professional warning modal
      triggerHaptic('warning');
      setLockedModalMeal(meal);
      return;
    }

    // Success skip!
    triggerHaptic('success');
    setWallet(prev => prev + meal.price);
    showToast(` Meal Skipped! ₹${meal.price} credited to your Taaza Wallet.`, 'success');

    if (onMealSkip) onMealSkip(meal);

    // Update meal status and advance deck
    setMeals(prev => prev.map(m => m.id === meal.id ? { ...m, status: 'skipped' } : m));
    setCurrentIndex(prev => Math.min(prev + 1, meals.length - 1));
  };

  // Action: Confirm / Keep Meal
  const handleConfirmAction = (meal: SwipeableMeal) => {
    triggerHaptic('medium');
    showToast(` Meal Confirmed for ${meal.dayLabel} (${meal.mealType})!`, 'info');
    setMeals(prev => prev.map(m => m.id === meal.id ? { ...m, status: 'confirmed' } : m));
    setCurrentIndex(prev => Math.min(prev + 1, meals.length - 1));
  };

  // Drag End Handler
  const handleDragEnd = (_: any, info: any) => {
    const swipeThreshold = 100;
    if (info.offset.x < -swipeThreshold) {
      // Swiped Left -> Attempt Skip
      handleSkipAction(activeMeal);
    } else if (info.offset.x > swipeThreshold) {
      // Swiped Right -> Confirm Meal
      handleConfirmAction(activeMeal);
    }
  };

  if (!activeMeal || currentIndex >= meals.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-8 rounded-[2.5rem] text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/80 rounded-3xl flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="font-black text-xl text-zinc-900 dark:text-white">All Scheduled Meals Reviewed!</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto font-medium leading-relaxed">
          Your schedule is up-to-date. Any skipped meals have been automatically refunded to your Taaza Wallet balance (<strong>₹{wallet}</strong>).
        </p>
        <button
          onClick={() => {
            triggerHaptic('light');
            setCurrentIndex(0);
          }}
          className="px-6 py-2.5 rounded-full bg-zinc-950 dark:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider hover:bg-emerald-600 transition-all cursor-pointer"
        >
          Review Deck Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Widget Top Header Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                Meal Swipe & Cutoff Control
              </h3>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowTooltip(true);
                }}
                className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-zinc-700 text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 transition-all cursor-pointer"
                title="View Swipe Tutorial Tooltip"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Swipe left to skip before cutoff • Right to confirm
            </p>
          </div>
        </div>

        {/* Live Wallet Badge */}
        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1.5 rounded-full text-xs font-black text-emerald-700 dark:text-emerald-300">
          <Wallet className="w-3.5 h-3.5" />
          <span>₹{wallet}</span>
        </div>
      </div>

      {/* Onboarding Tooltip Callout Banner */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-teal-950 text-white border border-emerald-500/30 shadow-xl relative overflow-hidden space-y-3 z-30"
          >
            {/* Ambient shimmer */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    How Meal Swiping Works
                  </h4>
                  <p className="text-[11px] text-zinc-300 font-medium">
                    Manage your daily nutrition deck effortlessly in 3 simple gestures
                  </p>
                </div>
              </div>

              <button
                onClick={dismissTooltip}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Gesture Steps Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px]">
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center space-y-1">
                <span className="text-rose-400 text-base font-black">👈 Swipe Left</span>
                <span className="font-bold text-zinc-200">Skip Meal</span>
                <span className="text-[9px] text-zinc-400">Refunds 100% to Taaza Wallet</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center space-y-1">
                <span className="text-emerald-400 text-base font-black">👉 Swipe Right</span>
                <span className="font-bold text-zinc-200">Keep & Confirm</span>
                <span className="text-[9px] text-zinc-400">Prepares & delivers fresh</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center space-y-1">
                <span className="text-amber-400 text-base font-black">⏰ Cutoff Rules</span>
                <span className="font-bold text-zinc-200">Dinner: 2:00 PM</span>
                <span className="text-[9px] text-zinc-400">Lunch: 8:00 AM • Brk: 10 PM</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[10px]">
              <span className="text-emerald-400/90 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                No wasted food • Automatic wallet rollover
              </span>

              <button
                onClick={dismissTooltip}
                className="px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-wider cursor-pointer shadow-md transition-all"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Card Deck Container */}
      <div className="relative h-[430px] sm:h-[450px] w-full flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeMeal.id}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            whileGrab={{ scale: 1.02 }}
            className="absolute inset-0 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-[2.5rem] shadow-xl overflow-hidden cursor-grab active:cursor-grabbing flex flex-col justify-between touch-none selection:none"
          >
            {/* Visual Overlays for Swipe Indication */}
            {/* Left Overlay (SKIP) */}
            <motion.div 
              style={{ opacity: leftOpacity }}
              className={`absolute inset-0 z-30 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center pointer-events-none ${
                cutoffInfo.isLocked ? 'bg-zinc-950/90' : 'bg-rose-900/90'
              }`}
            >
              {cutoffInfo.isLocked ? (
                <>
                  <Lock className="w-16 h-16 text-amber-400 mb-3 animate-bounce" />
                  <h4 className="text-2xl font-black uppercase tracking-tight">Kitchen Locked</h4>
                  <p className="text-xs font-bold text-amber-200 max-w-xs mt-2">
                    {cutoffInfo.label} passed. Chefs are flame-cooking this meal.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-rose-400 mb-3" />
                  <h4 className="text-3xl font-black uppercase tracking-tight">SKIP MEAL</h4>
                  <span className="text-sm font-black bg-rose-500 text-white px-4 py-1.5 rounded-full mt-3 shadow-lg">
                    +₹{activeMeal.price} Wallet Credit
                  </span>
                </>
              )}
            </motion.div>

            {/* Right Overlay (CONFIRM) */}
            <motion.div 
              style={{ opacity: rightOpacity }}
              className="absolute inset-0 z-30 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center pointer-events-none"
            >
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3" />
              <h4 className="text-3xl font-black uppercase tracking-tight">KEEP & CONFIRM</h4>
              <p className="text-xs font-bold text-emerald-200 max-w-xs mt-2">
                Prepared fresh & delivered hot on {activeMeal.dayLabel}
              </p>
            </motion.div>

            {/* Meal Hero Image & Header */}
            <div className="relative h-56 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <img
                src={activeMeal.image}
                alt={activeMeal.dishName}
                className="w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />

              {/* Day & Category Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                <span className="bg-black/60 backdrop-blur-md text-white font-black px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-widest border border-white/20 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {activeMeal.dayLabel} • {activeMeal.mealType}
                </span>

                {/* Cutoff Status Badge */}
                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border shadow-md flex items-center gap-1.5 ${
                  cutoffInfo.isLocked
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                    : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                }`}>
                  {cutoffInfo.isLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>{cutoffInfo.timeRemainingStr}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>{cutoffInfo.timeRemainingStr}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Dish Name Overlay */}
              <div className="absolute bottom-3 left-4 right-4 z-20">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight drop-shadow-md">
                  {activeMeal.dishName}
                </h3>
              </div>
            </div>

            {/* Meal Body & Macro Strip */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              {/* Cutoff Timing Banner Notice */}
              <div className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
                cutoffInfo.isLocked
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
              }`}>
                <div className="flex items-center gap-2">
                  {cutoffInfo.isLocked ? <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" /> : <Clock className="w-4 h-4 shrink-0 text-emerald-600" />}
                  <span>{cutoffInfo.label}</span>
                </div>
                <span className="font-mono font-bold text-[10px] opacity-80">
                  {cutoffInfo.isLocked ? 'Kitchen Locked' : 'Skip Eligible'}
                </span>
              </div>

              {/* Macros Breakdown Grid */}
              <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-[9px] font-black uppercase text-zinc-400">Calories</p>
                  <p className="text-xs font-black text-zinc-900 dark:text-white">{activeMeal.calories} kcal</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-zinc-400">Protein</p>
                  <p className="text-xs font-black text-zinc-900 dark:text-white">{activeMeal.protein}g</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-zinc-400">Carbs</p>
                  <p className="text-xs font-black text-zinc-900 dark:text-white">{activeMeal.carbs}g</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-zinc-400">Fat</p>
                  <p className="text-xs font-black text-zinc-900 dark:text-white">{activeMeal.fat}g</p>
                </div>
              </div>

              {/* Interactive Control Buttons */}
              <div className="grid grid-cols-3 gap-2.5 pt-1 z-20">
                {/* Skip Button */}
                <button
                  onClick={() => handleSkipAction(activeMeal)}
                  className={`py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
                    cutoffInfo.isLocked
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-600 hover:text-white'
                  }`}
                >
                  {cutoffInfo.isLocked ? <Lock className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>{cutoffInfo.isLocked ? 'Locked' : 'Skip Meal'}</span>
                </button>

                {/* Swap Button */}
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    if (onMealSwap) onMealSwap(activeMeal);
                    else showToast(`Opening Swap Dish Selector for ${activeMeal.dishName}...`, 'info');
                  }}
                  className="py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Swap</span>
                </button>

                {/* Confirm Button */}
                <button
                  onClick={() => handleConfirmAction(activeMeal)}
                  className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Keep</span>
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Locked Cutoff Warning Modal */}
      <AnimatePresence>
        {lockedModalMeal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLockedModalMeal(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[20%] max-w-md mx-auto bg-zinc-900 border border-zinc-800 text-white rounded-[2.5rem] p-6 z-50 shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Kitchen Production Lock</h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Cutoff Rule Enforced ({formatCutoffLabel(lockedModalMeal.mealType)})
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/80 space-y-2 text-xs">
                <p className="font-bold text-zinc-200">
                  Dish: <span className="text-emerald-400">{lockedModalMeal.dishName}</span>
                </p>
                <p className="text-zinc-400 leading-relaxed font-medium">
                  To eliminate food waste, TaazaBites executive chefs begin sourcing organic micro-greens and slow-cooking dinner portions strictly at <strong>02:00 PM</strong>.
                </p>
                <p className="text-amber-300 font-semibold pt-1">
                  This meal cannot be cancelled or refunded, but you can update your drop-off address or request a insulated lockbox drop!
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setLockedModalMeal(null);
                    showToast(' Redirecting to address update...', 'info');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  Update Delivery Address
                </button>

                <button
                  onClick={() => setLockedModalMeal(null)}
                  className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Understood, Keep Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
