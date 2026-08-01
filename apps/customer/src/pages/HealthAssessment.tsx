import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Check, Activity, Target, Zap, 
  HeartPulse, Loader2, Utensils, Clock, ArrowRight, Salad, 
  Leaf, TrendingDown, Dumbbell, Coffee, Smile, Moon, Sparkle,
  ShieldCheck, AlertTriangle, Flame, Trophy
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/primitives';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';
import { GoogleLocationInput } from '../components/location/GoogleLocationInput';
import { SubscriptionService, HealthService } from '../firebase/services';
import confetti from 'canvas-confetti';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { useThrottledCallback } from '../hooks/useThrottledCallback';

interface OnboardingData {
  goals: string[];
  age: string;
  gender: string;
  height: string;
  weight: string;
  activityLevel: string;
  workSchedule: string;
  sleepPattern: string;
  exerciseFrequency: string;
  foodPreferences: string[];
  allergies: string[];
  deliveryArea: string;
  mealTimes: string[];
  deliverySlot: string;
}

interface FloatingText {
  id: number;
  text: string;
  sub: string;
  x: number;
  y: number;
  color: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100vw' : '-100vw',
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100vw' : '-100vw',
    opacity: 0
  })
};

export default function HealthAssessmentPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState('Analyzing your profile...');
  
  const [data, setData] = useState<OnboardingData>({
    goals: [],
    age: '25',
    gender: 'male',
    height: '170',
    weight: '65',
    activityLevel: 'Active',
    workSchedule: 'Regular',
    sleepPattern: '7-8 Hours',
    exerciseFrequency: '3-4 times/week',
    foodPreferences: ['Vegetarian', 'Chicken'],
    allergies: ['None'],
    deliveryArea: '',
    mealTimes: ['Lunch'],
    deliverySlot: 'Morning (7 AM - 9 AM)',
  });

  const updateData = (fields: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...fields }));
  };

  const throttledUpdateData = useThrottledCallback((fields: Partial<OnboardingData>) => {
    updateData(fields);
  }, 50);

  const nextStep = () => {
    if (step === 6) {
      setDirection(1);
      setStep(7);
      setIsAnalyzing(true);
      
      const phrases = [
        'Calculating your metabolic needs... 🧬',
        'Designing your macro blueprint... 🥩',
        'Optimizing your meal timing... ⏱️',
        'Verifying allergy safety protocols... 🛡️',
        'Finalizing your personalized menu... 🥗'
      ];
      
      phrases.forEach((text, i) => {
        setTimeout(() => setAnalysisText(text), i * 800);
      });

      setTimeout(() => {
        setIsAnalyzing(false);
        setStep(8);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10B981', '#F59E0B', '#10B981']
        });
      }, phrases.length * 800);
    } else {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(s => Math.max(0, s - 1));
  };

  const canProceed = () => {
    switch(step) {
      case 1: return data.goals.length > 0;
      case 2: return !!(data.age && data.gender && data.height && data.weight);
      case 3: return !!(data.activityLevel && data.workSchedule && data.sleepPattern && data.exerciseFrequency);
      case 4: return data.foodPreferences.length > 0;
      case 5: return data.allergies.length > 0;
      case 6: return !!(data.deliveryArea && data.mealTimes.length > 0 && data.deliverySlot);
      default: return true;
    }
  };

  const selectPlan = (planId: string) => {
    const weightNum = Number(data.weight) || 70;
    const calories = data.goals.includes('weight-loss') ? 1650 : (data.goals.includes('muscle-gain') ? 2450 : 2000);
    const protein = Math.round(weightNum * 1.8);

    const mealsCount = data.mealTimes.length || 1;
    const duration = planId === 'trial-week' ? 3 : 30;
    const rawPrice = 300 * mealsCount * duration;
    const discountMultiplier = duration === 30 ? 0.85 : 1.00;
    const price = Math.round(rawPrice * discountMultiplier);
    const originalPrice = rawPrice;

    const selectedPlanData = {
        id: planId === 'trial-week' ? 'trial_3' : 'plan_30',
        name: planId === 'trial-week' ? '3-Day Intro Trial' : '30-Day Monthly Plan',
        durationDays: duration,
        price: originalPrice,
        offerPrice: price,
        savings: originalPrice - price,
        mealsPerDay: mealsCount,
        totalMeals: duration * mealsCount,
        calories: calories,
        protein: protein,
        deliveryTiming: data.deliverySlot || 'Morning',
    };
    
    localStorage.setItem('taaza_selected_plan', JSON.stringify(selectedPlanData));
    localStorage.setItem('taaza_health_profile', JSON.stringify(data));

    if (currentUser) {
      HealthService.saveAssessment(currentUser.uid, {
        ...data,
        ...selectedPlanData,
        calculatedCalories: calories,
        calculatedProtein: protein
      }).catch(err => console.warn("Failed to persist health assessment:", err));
      
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  };

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 max-w-lg mx-auto space-y-10">
      {/* Visual Header */}
      <div className="relative">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center relative z-10 shadow-xl"
        >
          <BrandLogo size="xl" showText={false} />
        </motion.div>
        <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
          Let's find your <br />
          <span className="text-emerald-600">Perfect Meal Plan</span>
        </h1>
        <p className="text-zinc-500 font-medium">
          Answer a few questions about your lifestyle and we'll design a 100% personalized nutrition protocol for you.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-emerald-50 p-5 rounded-2xl flex items-center gap-4 text-left w-full border border-emerald-100">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
          👋
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-900">Takes only 2 minutes!</p>
          <p className="text-xs text-emerald-700/70 font-medium">No credit card required for the assessment.</p>
        </div>
      </div>

      <Button 
        onClick={nextStep}
        className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
      >
        Get Started
      </Button>
    </div>
  );

  const renderGoals = () => {
    const goalsList = [
      { id: 'weight-loss', label: 'Weight Loss', sub: 'Burn fat effectively', icon: TrendingDown, color: 'bg-rose-50 text-rose-600' },
      { id: 'muscle-gain', label: 'Muscle Gain', sub: 'Build strength with protein', icon: Zap, color: 'bg-amber-50 text-amber-600' },
      { id: 'healthy-lifestyle', label: 'Healthy Life', sub: 'Better energy & longevity', icon: HeartPulse, color: 'bg-emerald-50 text-emerald-600' },
      { id: 'high-protein', label: 'High Protein', sub: 'Fuel your active workouts', icon: Target, color: 'bg-sky-50 text-sky-600' }
    ];
    
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-zinc-900">What's your goal?</h2>
          <p className="text-zinc-500 font-medium text-sm">Select one or more targets for your plan.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {goalsList.map(g => {
            const Icon = g.icon;
            const isSelected = data.goals.includes(g.id);
            return (
              <motion.div 
                key={g.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (isSelected) {
                    updateData({ goals: data.goals.filter(id => id !== g.id) });
                  } else {
                    updateData({ goals: [...data.goals, g.id] });
                  }
                }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                  isSelected 
                    ? "border-emerald-600 bg-emerald-50/50 shadow-md" 
                    : "border-zinc-100 bg-white hover:border-zinc-200"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", g.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-bold text-zinc-900">{g.label}</span>
                  <span className="block text-xs text-zinc-500 font-medium">{g.sub}</span>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPersonal = () => {
    return (
      <div className="flex flex-col h-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-zinc-900">About you</h2>
          <p className="text-zinc-500 font-medium text-sm">This helps us calculate your daily calorie needs.</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'male', label: 'Male', icon: '👨' },
              { id: 'female', label: 'Female', icon: '👩' }
            ].map(g => {
              const isSelected = data.gender === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => updateData({ gender: g.id })}
                  className={cn(
                    "p-4 rounded-2xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-2",
                    isSelected 
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900" 
                      : "border-zinc-100 bg-white text-zinc-500"
                  )}
                >
                  <span className="text-2xl">{g.icon}</span>
                  {g.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900">Age</span>
              <span className="text-emerald-600 font-bold">{data.age} years</span>
            </div>
            <input 
              type="range" min="15" max="80" value={data.age}
              onChange={e => throttledUpdateData({ age: e.target.value })}
              className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900">Height</span>
              <span className="text-emerald-600 font-bold">{data.height} cm</span>
            </div>
            <input 
              type="range" min="140" max="210" value={data.height}
              onChange={e => throttledUpdateData({ height: e.target.value })}
              className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900">Weight</span>
              <span className="text-emerald-600 font-bold">{data.weight} kg</span>
            </div>
            <input 
              type="range" min="40" max="150" value={data.weight}
              onChange={e => throttledUpdateData({ weight: e.target.value })}
              className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderLifestyle = () => {
    const activityLevels = [
      { id: 'Sedentary', label: 'Sedentary', icon: '🛋️', sub: 'Mainly sitting (desk job)' },
      { id: 'Active', label: 'Active', icon: '🚶', sub: 'Regular movement' },
      { id: 'Very Active', label: 'Very Active', icon: '🏃', sub: 'High daily movement' }
    ];

    const exerciseFreq = [
      { id: 'Rarely', label: 'Rarely', icon: '☕' },
      { id: '1-2 times/week', label: '1-2 times', icon: '💪' },
      { id: '3-4 times/week', label: '3-4 times', icon: '⚡' },
      { id: '5+ times/week', label: 'Daily', icon: '🔥' }
    ];

    return (
      <div className="flex flex-col h-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-zinc-900">Your lifestyle</h2>
          <p className="text-zinc-500 font-medium text-sm">This helps us adjust your nutrient balance.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-sm font-bold text-zinc-900">Activity Level</span>
            <div className="grid grid-cols-1 gap-2">
              {activityLevels.map(al => {
                const isSelected = data.activityLevel === al.id;
                return (
                  <button
                    key={al.id}
                    onClick={() => updateData({ activityLevel: al.id })}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                      isSelected 
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm" 
                        : "border-zinc-100 bg-white text-zinc-500"
                    )}
                  >
                    <span className="text-2xl">{al.icon}</span>
                    <div>
                      <span className="block font-bold">{al.label}</span>
                      <span className="block text-xs font-medium opacity-70">{al.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-bold text-zinc-900">Exercise Frequency</span>
            <div className="grid grid-cols-2 gap-2">
              {exerciseFreq.map(ef => {
                const isSelected = data.exerciseFrequency === ef.id;
                return (
                  <button
                    key={ef.id}
                    onClick={() => updateData({ exerciseFrequency: ef.id })}
                    className={cn(
                      "p-3 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2",
                      isSelected 
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900" 
                        : "border-zinc-100 bg-white text-zinc-500"
                    )}
                  >
                    <span>{ef.icon}</span>
                    {ef.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFoodPreferences = () => {
    const preferences = [
      { name: 'Vegetarian', emoji: '🥦' },
      { name: 'Vegan', emoji: '🌱' },
      { name: 'Eggetarian', emoji: '🥚' },
      { name: 'Chicken', emoji: '🍗' },
      { name: 'Fish', emoji: '🐟' },
      { name: 'Paneer', emoji: '🧀' },
      { name: 'Tofu', emoji: '🧊' }
    ];

    return (
      <div className="flex flex-col h-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-zinc-900">Your preferences</h2>
          <p className="text-zinc-500 font-medium text-sm">Tell us your protein choices.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center">
          {preferences.map(pref => {
            const isSelected = data.foodPreferences.includes(pref.name);
            return (
              <button 
                key={pref.name}
                onClick={() => {
                  if (isSelected) {
                    updateData({ foodPreferences: data.foodPreferences.filter(p => p !== pref.name) });
                  } else {
                    updateData({ foodPreferences: [...data.foodPreferences, pref.name] });
                  }
                }}
                className={cn(
                  "px-6 py-4 rounded-2xl border-2 font-bold text-sm flex items-center gap-2 transition-all",
                  isSelected 
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-lg" 
                    : "border-zinc-100 bg-white text-zinc-700 hover:border-zinc-200"
                )}
              >
                <span>{pref.emoji}</span>
                <span>{pref.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAllergies = () => {
    const allergyList = [
      { name: 'None', label: 'No Allergies' },
      { name: 'Dairy', label: 'Dairy' },
      { name: 'Gluten', label: 'Gluten' },
      { name: 'Nuts', label: 'Nuts' },
      { name: 'Soy', label: 'Soy' },
      { name: 'Shellfish', label: 'Shellfish' }
    ];

    return (
      <div className="flex flex-col h-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-zinc-900">Any allergies?</h2>
          <p className="text-zinc-500 font-medium text-sm">We take safety very seriously.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {allergyList.map(item => {
            const isSelected = data.allergies.includes(item.name);
            return (
              <button 
                key={item.name}
                onClick={() => {
                  if (item.name === 'None') {
                    updateData({ allergies: ['None'] });
                  } else {
                    const filtered = data.allergies.filter(a => a !== 'None');
                    if (isSelected) {
                      const afterFilter = filtered.filter(a => a !== item.name);
                      updateData({ allergies: afterFilter.length === 0 ? ['None'] : afterFilter });
                    } else {
                      updateData({ allergies: [...filtered, item.name] });
                    }
                  }
                }}
                className={cn(
                  "p-5 rounded-2xl border-2 font-bold text-sm transition-all text-center",
                  isSelected 
                    ? (item.name === 'None' 
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900" 
                        : "border-rose-600 bg-rose-50 text-rose-900") 
                    : "border-zinc-100 bg-white text-zinc-500"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDelivery = () => {
    const mealList = [
      { id: 'Breakfast', label: '🥞 Breakfast', desc: 'Energy to start your day' },
      { id: 'Lunch', label: '🍱 Healthy Lunch', desc: 'Fuel for afternoon focus' },
      { id: 'Snacks', label: '🍪 Healthy Snacks', desc: 'Midday energy boost' },
      { id: 'Dinner', label: '🍛 Light Dinner', desc: 'Clean evening recovery' }
    ];

    const slots = [
      'Morning (7 AM - 9 AM)',
      'Evening (5 PM - 7 PM)',
      'Both Times'
    ];

    return (
      <div className="flex flex-col h-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-zinc-900">Delivery details</h2>
          <p className="text-zinc-500 font-medium text-sm">Configure when and where you want your meals.</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white border-2 border-zinc-100 p-4 rounded-2xl shadow-sm">
            <GoogleLocationInput
              value={data.deliveryArea}
              onChange={val => updateData({ deliveryArea: val })}
              label="Delivery Area"
              placeholder="Enter your locality or area"
            />
          </div>

          <div className="space-y-3">
            <span className="text-sm font-bold text-zinc-900">Which meals do you need?</span>
            <div className="grid grid-cols-2 gap-2">
              {mealList.map(ml => {
                const isSelected = data.mealTimes.includes(ml.id);
                return (
                  <button 
                    key={ml.id}
                    onClick={() => {
                      if (isSelected) {
                        if (data.mealTimes.length > 1) {
                          updateData({ mealTimes: data.mealTimes.filter(m => m !== ml.id) });
                        }
                      } else {
                        updateData({ mealTimes: [...data.mealTimes, ml.id] });
                      }
                    }}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      isSelected 
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm" 
                        : "border-zinc-100 bg-white text-zinc-500"
                    )}
                  >
                    <div className="text-xs font-bold text-zinc-900">{ml.label}</div>
                    <div className="text-[10px] text-zinc-400 font-medium leading-none mt-1">{ml.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-bold text-zinc-900">Delivery Timing</span>
            <div className="grid grid-cols-1 gap-2">
              {slots.map(s => {
                const isSelected = data.deliverySlot === s;
                return (
                  <button 
                    key={s}
                    onClick={() => updateData({ deliverySlot: s })}
                    className={cn(
                      "p-3 rounded-xl border-2 text-center font-bold text-xs transition-all",
                      isSelected 
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900" 
                        : "border-zinc-100 bg-white text-zinc-500"
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalysis = () => (
    <div className="flex flex-col items-center justify-center text-center min-h-[70dvh] px-6 space-y-8 max-w-md mx-auto">
      <div className="relative">
        <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center relative z-10 shadow-xl mx-auto">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
        <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-zinc-900">Preparing your plan</h2>
        <p className="text-zinc-500 font-medium text-sm leading-relaxed">
          {analysisText}
        </p>
      </div>
    </div>
  );

  const renderResults = () => {
    const weightNum = Number(data.weight) || 70;
    const heightNum = Number(data.height) || 170;
    const bmi = (weightNum / Math.pow(heightNum / 100, 2)).toFixed(1);
    
    const isWeightLoss = data.goals.includes('weight-loss');
    const isMuscleGain = data.goals.includes('muscle-gain');
    
    const calories = isWeightLoss ? 1650 : (isMuscleGain ? 2450 : 2000);
    const protein = Math.round(weightNum * 1.8);

    const mealsCount = data.mealTimes.length || 1;

    const monthlyPrice = Math.round(300 * mealsCount * 30 * 0.85);
    const originalPrice = 300 * mealsCount * 30;
    const trialPrice = 300 * mealsCount * 3;

    return (
      <div className="flex flex-col min-h-screen bg-white text-zinc-900 pb-32">
         <div className="bg-emerald-600 text-white rounded-b-[2.5rem] sm:rounded-b-[3rem] px-6 sm:px-8 pt-12 sm:pt-16 pb-12 sm:pb-12 text-center space-y-4 sm:space-y-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold"
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" /> Assessment Complete
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
              Your Personalized <br className="hidden sm:block" /> Nutrition Plan
            </h2>
            
            <p className="text-emerald-50 text-[13px] sm:text-sm font-medium leading-relaxed max-w-[280px] sm:max-w-xs mx-auto opacity-90">
              Based on your profile, we've designed a plan with <span className="font-bold">{protein}g protein</span> and <span className="font-bold">{calories} Kcal</span> per day.
            </p>
         </div>

         <div className="max-w-md mx-auto px-5 sm:px-6 -mt-6 sm:-mt-8 space-y-6 sm:space-y-8 w-full">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
               {[
                 { label: 'Calories', val: calories, unit: 'kcal', icon: <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" /> },
                 { label: 'Protein', val: protein, unit: 'g', icon: <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" /> },
                 { label: 'BMI', val: bmi, unit: '', icon: <HeartPulse className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" /> }
               ].map((m, i) => (
                 <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center shadow-lg border border-zinc-100/50">
                    <div className="flex justify-center mb-1">{m.icon}</div>
                    <p className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">{m.val}{m.unit}</p>
                    <p className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{m.label}</p>
                 </div>
               ))}
            </div>

            <div className="space-y-4">
               <h3 className="text-base sm:text-lg font-bold text-zinc-900 px-1">Choose your start</h3>
               
               <div 
                 onClick={() => selectPlan('monthly-core')}
                 className="bg-zinc-900 text-white rounded-[2rem] p-5 sm:p-6 relative cursor-pointer hover:scale-[1.02] transition-all shadow-xl active:scale-[0.98]"
               >
                  <div className="absolute top-4 right-4 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-wider">
                     BEST VALUE
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <h4 className="text-lg sm:text-xl font-bold">30-Day Monthly Plan</h4>
                        <p className="text-[11px] text-zinc-400">Scientifically paced results</p>
                     </div>
                     
                     <div className="flex justify-between items-end">
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold">₹{monthlyPrice.toLocaleString()}</p>
                          <p className="text-[10px] text-zinc-500 line-through">₹{originalPrice.toLocaleString()}</p>
                        </div>
                        <Button className="rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black h-9 sm:h-10 px-5 sm:px-6 text-[10px] uppercase tracking-widest">
                           Select
                        </Button>
                     </div>
                  </div>
               </div>

               <div 
                 onClick={() => selectPlan('trial-week')}
                 className="bg-white rounded-[2rem] p-5 sm:p-6 border-2 border-zinc-100 cursor-pointer hover:border-emerald-200 transition-all flex justify-between items-center shadow-sm active:scale-[0.98]"
               >
                  <div>
                     <h4 className="text-base sm:text-lg font-bold">3-Day Intro Trial</h4>
                     <p className="text-[11px] text-zinc-400">Taste the experience</p>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-zinc-900">₹{trialPrice.toLocaleString()}</p>
               </div>
            </div>
         </div>
      </div>
    );
  };

  const renderStep = () => {
    switch(step) {
      case 0: return renderWelcome();
      case 1: return renderGoals();
      case 2: return renderPersonal();
      case 3: return renderLifestyle();
      case 4: return renderFoodPreferences();
      case 5: return renderAllergies();
      case 6: return renderDelivery();
      case 7: return renderAnalysis();
      case 8: return renderResults();
      default: return null;
    }
  };

  const showProgress = step > 0 && step < 7;
  const progressPercent = (step / 6) * 100;

  // Level Names based on step
  const getStepName = () => {
    switch (step) {
      case 1: return "Choose Directive 🚀";
      case 2: return "Biometrics Specs 📊";
      case 3: return "Chronotype Activity ⏰";
      case 4: return "Primary Inventory 🥦";
      case 5: return "Safety Protocols 🛡️";
      case 6: return "Hot Drops Router 🏍️";
      default: return "Onboarding Level";
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col relative overflow-hidden select-none pb-24">
      {showProgress && (
         <div className="pt-10 px-6 pb-6 flex flex-col space-y-4 sticky top-0 bg-white/90 backdrop-blur-xl z-40">
            <div className="flex items-center justify-between">
              <button 
                 onClick={prevStep}
                 className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                 <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Step {step} of 6</span>
                <span className="text-sm font-bold text-zinc-900">{getStepName()}</span>
              </div>

              <div className="w-10 h-10" /> {/* Spacer */}
            </div>

            <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
               <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-emerald-500 rounded-full"
               />
            </div>
         </div>
      )}

      <div className="flex-1 flex flex-col px-6 py-4 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {showProgress && (
         <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md z-40 border-t border-zinc-50">
            <div className="max-w-md mx-auto">
              <Button 
                 onClick={nextStep}
                 disabled={!canProceed()}
                 className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg transition-all disabled:opacity-50"
              >
                 {step === 6 ? 'Finalize Plan' : 'Continue'}
              </Button>
            </div>
         </div>
      )}
    </div>
  );
}
