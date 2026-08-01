import { PORTAL_LINKS } from '../config';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  User, Scale, Ruler, Activity, Award, Sparkles, TrendingUp, 
  Apple, Flame, Info, Brain, CheckCircle, RefreshCw, Loader2, ArrowRight,
  Share2, Code, Copy, Check
} from 'lucide-react';
import { SmartButton } from './SmartButton';
import confetti from 'canvas-confetti';

type Gender = 'male' | 'female' | 'neutral';
type UnitSystem = 'metric' | 'imperial';
type FitnessGoal = 'lose' | 'maintain' | 'gain';
type DietType = 'balanced' | 'high-protein' | 'low-carb' | 'custom';

interface MacroSplit {
  carbs: number;
  protein: number;
  fats: number;
}

interface AiInsights {
  insightSummary: string;
  actionableTips: string[];
  taazaPlanRecommendation: string;
}

export const MacroCalculator: React.FC = () => {
  const { user } = useAuth();

  const saveResultsToStorageAndCloud = async (
    targetCals: number, 
    proteinGrams: number, 
    carbsGrams: number, 
    fatsGrams: number,
    bmrVal: number,
    tdeeVal: number,
    goalVal: string,
    dietTypeVal: string
  ) => {
    const results = {
      bmr: Math.round(bmrVal),
      tdee: Math.round(tdeeVal),
      targetCalories: Math.round(targetCals),
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbsGrams),
      fats: Math.round(fatsGrams),
      goal: goalVal,
      dietType: dietTypeVal,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('tb_macro_calculator_results', JSON.stringify(results));
    } catch (e) {
      console.warn("Storage access denied:", e);
    }
    window.dispatchEvent(new CustomEvent('tb:macros_updated', { detail: results }));

    if (db && user && user.uid) {
      try {
        const docRef = doc(db, 'users', user.uid, 'macro_calculator', 'results');
        await setDoc(docRef, {
          bmr: Math.round(bmrVal),
          tdee: Math.round(tdeeVal),
          targetCalories: Math.round(targetCals),
          protein: Math.round(proteinGrams),
          carbs: Math.round(carbsGrams),
          fats: Math.round(fatsGrams),
          goal: goalVal,
          dietType: dietTypeVal
        });
      } catch (err) {
        console.error("Failed to save macros to Firestore:", err);
      }
    }
  };

  // Unit System
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  
  // Biological Inputs
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<number>(28);
  
  // Height State (metric is cm, imperial is feet & inches)
  const [heightCm, setHeightCm] = useState<number>(175);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(9);
  
  // Weight State (metric is kg, imperial is lbs)
  const [weightKg, setWeightKg] = useState<number>(72);
  const [weightLbs, setWeightLbs] = useState<number>(158);

  // Activity Level
  // 1.2 = Sedentary, 1.375 = Light, 1.55 = Moderate, 1.725 = Active, 1.9 = Elite
  const [activityLevel, setActivityLevel] = useState<number>(1.375);

  // Goal
  const [goal, setGoal] = useState<FitnessGoal>('lose');

  // SEO Off-Page & Social Sharing states
  const [shareTab, setShareTab] = useState<'share' | 'embed'>('share');
  const [embedCopied, setEmbedCopied] = useState<boolean>(false);
  const [textCopied, setTextCopied] = useState<boolean>(false);

  // Diet Preset and custom macro splits
  const [dietType, setDietType] = useState<DietType>('balanced');
  const [macroSplit, setMacroSplit] = useState<MacroSplit>({
    carbs: 50,
    protein: 20,
    fats: 30
  });

  // AI Insights State
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Food Preference for AI prompt guidance
  const [dietPreference, setDietPreference] = useState<string>('Non-Vegetarian (High Protein)');

  // Calculation workflow states
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [tickerText, setTickerText] = useState<string>("Analyzing bio-stats...");

  // Synchronization between metric and imperial when toggled
  useEffect(() => {
    if (unitSystem === 'metric') {
      // Calculate cm from ft/in
      const calculatedCm = Math.round((heightFt * 12 + heightIn) * 2.54);
      setHeightCm(calculatedCm);
      // Calculate kg from lbs
      const calculatedKg = Math.round(weightLbs * 0.45359237);
      setWeightKg(calculatedKg);
    } else {
      // Calculate ft/in from cm
      const totalInches = heightCm / 2.54;
      const calculatedFt = Math.floor(totalInches / 12);
      const calculatedIn = Math.round(totalInches % 12);
      setHeightFt(calculatedFt);
      setHeightIn(calculatedIn);
      // Calculate lbs from kg
      const calculatedLbs = Math.round(weightKg / 0.45359237);
      setWeightLbs(calculatedLbs);
    }
  }, [unitSystem]);

  // Adjust macro preset when type changes
  useEffect(() => {
    if (dietType === 'balanced') {
      setMacroSplit({ carbs: 50, protein: 20, fats: 30 });
    } else if (dietType === 'high-protein') {
      setMacroSplit({ carbs: 40, protein: 30, fats: 30 });
    } else if (dietType === 'low-carb') {
      setMacroSplit({ carbs: 10, protein: 30, fats: 60 });
    }
  }, [dietType]);

  // Proportional dynamic balancing algorithm for custom macros
  const handleMacroChange = (type: keyof MacroSplit, value: number) => {
    setDietType('custom');
    const clampedValue = Math.min(100, Math.max(0, value));
    const otherTypes = (['carbs', 'protein', 'fats'] as Array<keyof MacroSplit>).filter(t => t !== type);
    const remaining = 100 - clampedValue;
    
    const otherTotal = macroSplit[otherTypes[0]] + macroSplit[otherTypes[1]];
    
    let newVal0 = 0;
    let newVal1 = 0;
    
    if (otherTotal === 0) {
      newVal0 = Math.round(remaining / 2);
      newVal1 = remaining - newVal0;
    } else {
      newVal0 = Math.round((macroSplit[otherTypes[0]] / otherTotal) * remaining);
      newVal1 = remaining - newVal0;
    }
    
    // Ensure accurate sum to 100
    const finalSum = clampedValue + newVal0 + newVal1;
    if (finalSum !== 100) {
      const diff = 100 - finalSum;
      newVal1 += diff;
    }

    setMacroSplit({
      [type]: clampedValue,
      [otherTypes[0]]: newVal0,
      [otherTypes[1]]: newVal1
    } as unknown as MacroSplit);
  };

  // Metric values used for calculations
  const finalWeightKg = useMemo(() => {
    if (unitSystem === 'metric') return weightKg;
    return weightLbs * 0.45359237;
  }, [unitSystem, weightKg, weightLbs]);

  const finalHeightCm = useMemo(() => {
    if (unitSystem === 'metric') return heightCm;
    return (heightFt * 12 + heightIn) * 2.54;
  }, [unitSystem, heightCm, heightFt, heightIn]);

  // Mifflin-St Jeor Equation
  const bmr = useMemo(() => {
    if (gender === 'male') {
      return 10 * finalWeightKg + 6.25 * finalHeightCm - 5 * age + 5;
    } else if (gender === 'female') {
      return 10 * finalWeightKg + 6.25 * finalHeightCm - 5 * age - 161;
    } else {
      // Neutral - Average of Male and Female factors
      return 10 * finalWeightKg + 6.25 * finalHeightCm - 5 * age - 78;
    }
  }, [gender, finalWeightKg, finalHeightCm, age]);

  // Total Daily Energy Expenditure
  const tdee = useMemo(() => {
    return bmr * activityLevel;
  }, [bmr, activityLevel]);

  // Target Calories based on Goal
  const targetCalories = useMemo(() => {
    let calories = tdee;
    if (goal === 'lose') {
      // Deficit of 500 kcal (approx 15-20% deficit, with safety floor)
      calories = Math.max(1200, tdee - 500);
    } else if (goal === 'gain') {
      // Mild surplus of 300 kcal
      calories = tdee + 350;
    }
    return Math.round(calories);
  }, [tdee, goal]);

  // Macronutrient breakdowns in Grams
  const macrosGrams = useMemo(() => {
    const proteinKcal = (targetCalories * macroSplit.protein) / 100;
    const carbsKcal = (targetCalories * macroSplit.carbs) / 100;
    const fatsKcal = (targetCalories * macroSplit.fats) / 100;

    return {
      protein: Math.round(proteinKcal / 4),
      carbs: Math.round(carbsKcal / 4),
      fats: Math.round(fatsKcal / 9)
    };
  }, [targetCalories, macroSplit]);

  // Handle macro submission calculation and celebration flow
  const handleCalculate = () => {
    setIsCalculating(true);
    setHasCalculated(false);
    if (navigator.vibrate) navigator.vibrate(20);

    const tickerSteps = [
      "Analyzing biological stature...",
      "Evaluating energy coefficient...",
      "Solving Mifflin-St Jeor metabolic baseline...",
      "Slicing target macromolar ratios...",
      "Formulating customized Bangalore-delivered plan suggestion..."
    ];

    let currentStep = 0;
    setTickerText(tickerSteps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < tickerSteps.length) {
        setTickerText(tickerSteps[currentStep]);
      }
    }, 380);

    setTimeout(() => {
      clearInterval(interval);
      setIsCalculating(false);
      setHasCalculated(true);
      
      // Trigger canvas-confetti blast for a grand celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#34d399', '#D4A373', '#f59e0b', '#3b82f6']
      })?.catch(e => console.warn("Confetti", e));
    }, 2000);
  };

  // Synchronize and auto-save calculated results when they change (e.g. via sliders)
  useEffect(() => {
    if (hasCalculated) {
      saveResultsToStorageAndCloud(
        targetCalories,
        macrosGrams.protein,
        macrosGrams.carbs,
        macrosGrams.fats,
        bmr,
        tdee,
        goal,
        dietType
      );
    }
  }, [hasCalculated, targetCalories, macrosGrams, bmr, tdee, goal, dietType]);

  // Handle AI Insights generation
  const handleGetAiInsights = async () => {
    setAiLoading(true);
    setAiError(null);
    if (navigator.vibrate) navigator.vibrate(12);

    try {
      const response = await fetch('/api/macro-calculator-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          age,
          gender,
          height: Math.round(finalHeightCm),
          weight: Math.round(finalWeightKg),
          activityLevel: activityLevel === 1.2 ? 'Sedentary' :
                         activityLevel === 1.375 ? 'Lightly Active' :
                         activityLevel === 1.55 ? 'Moderately Active' :
                         activityLevel === 1.725 ? 'Very Active' : 'Extra Active',
          goal: goal === 'lose' ? 'Weight Loss (Caloric Deficit)' :
                goal === 'maintain' ? 'Weight Maintenance' : 'Muscle Gain (Caloric Surplus)',
          dietPreference,
          calories: targetCalories,
          protein: macrosGrams.protein,
          carbs: macrosGrams.carbs,
          fats: macrosGrams.fats
        })
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve nutritional insights from AI engine');
      }

      const data = await response.json();
      setAiInsights(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSmoothScrollToPlans = () => {
    const section = document.getElementById('subscriptions');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getActivityLabel = (val: number) => {
    if (val === 1.2) return 'Sedentary (desk job, low movement)';
    if (val === 1.375) return 'Lightly Active (walks, light exercise 1-3 days)';
    if (val === 1.55) return 'Moderately Active (exercise 3-5 days)';
    if (val === 1.725) return 'Very Active (vigorous sport/exercise 6-7 days)';
    return 'Elite (athletic training, high physical job)';
  };

  return (
    <section className="bg-white py-16 sm:py-24 relative overflow-hidden" id="macro-calculator">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#059669]/5 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#D4A373]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-[#059669]/10 rounded-full border border-[#059669]/10">
            <Sparkles className="w-4 h-4 text-[#059669]" />
            <span className="text-[10px] font-mono font-bold text-[#059669] uppercase tracking-[0.2em]">Scientific Nutrition Engine</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-light font-serif text-[#1A1A1A] tracking-tight mb-4">
            Macro & Caloric <span className="text-[#059669] italic font-normal">Calculator</span>
          </h2>
          <p className="text-zinc-500 text-base font-light leading-relaxed">
            Tailor your exact scientific profile. Compute your Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), 
            and customized macronutrient proportions designed to support your body's potential.
          </p>
        </div>

        {/* Dual Panel Configuration Station */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Biological Profile Configuration */}
          <div className="lg:col-span-6 bg-zinc-50/50 rounded-[2.5rem] border border-zinc-100 p-8 sm:p-10 space-y-8 shadow-sm backdrop-blur-sm">
            
            {/* Control Panel Title */}
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-medium text-zinc-800">Biological Parameters</h3>
              </div>
              
              {/* Unit System Switcher */}
              <div className="flex bg-zinc-200/60 rounded-xl p-1 text-xs">
                <button
                  id="unit-metric"
                  onClick={() => setUnitSystem('metric')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${unitSystem === 'metric' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                >
                  Metric
                </button>
                <button
                  id="unit-imperial"
                  onClick={() => setUnitSystem('imperial')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${unitSystem === 'imperial' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                >
                  Imperial
                </button>
              </div>
            </div>

            {/* Gender Switch */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Assigned Gender</label>
              <div className="grid grid-cols-3 gap-3">
                {(['male', 'female', 'neutral'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    id={`gender-${g}`}
                    onClick={() => setGender(g)}
                    className={`py-3 px-4 rounded-2xl border text-sm font-medium capitalize transition-all flex items-center justify-center gap-2 ${
                      gender === g 
                        ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-md' 
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {g === 'neutral' ? 'Other/Neutral' : g}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Age Baseline</label>
                <span className="text-base font-mono font-bold text-zinc-800">{age} <span className="text-xs text-zinc-400 font-normal">years</span></span>
              </div>
              <input 
                type="range" 
                id="input-age"
                min="15" 
                max="80" 
                value={age} 
                onChange={e => setAge(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none accent-[#059669] cursor-pointer"
              />
            </div>

            {/* Height & Weight Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Height Configuration */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Stature / Height</label>
                {unitSystem === 'metric' ? (
                  <div className="relative">
                    <input
                      type="number"
                      id="input-height-cm"
                      min="120"
                      max="240"
                      value={heightCm}
                      onChange={e => setHeightCm(Number(e.target.value))}
                      className="w-full pl-4 pr-12 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] font-mono font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">cm</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        type="number"
                        id="input-height-ft"
                        min="3"
                        max="8"
                        value={heightFt}
                        onChange={e => setHeightFt(Number(e.target.value))}
                        className="w-full pl-3 pr-8 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] font-mono font-medium"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">ft</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        id="input-height-in"
                        min="0"
                        max="11"
                        value={heightIn}
                        onChange={e => setHeightIn(Number(e.target.value))}
                        className="w-full pl-3 pr-8 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] font-mono font-medium"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">in</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Weight Configuration */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Body Weight</label>
                <div className="relative">
                  {unitSystem === 'metric' ? (
                    <>
                      <input
                        type="number"
                        id="input-weight-kg"
                        min="30"
                        max="220"
                        value={weightKg}
                        onChange={e => setWeightKg(Number(e.target.value))}
                        className="w-full pl-4 pr-12 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] font-mono font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">kg</span>
                    </>
                  ) : (
                    <>
                      <input
                        type="number"
                        id="input-weight-lbs"
                        min="60"
                        max="500"
                        value={weightLbs}
                        onChange={e => setWeightLbs(Number(e.target.value))}
                        className="w-full pl-4 pr-12 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] font-mono font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">lbs</span>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Lifestyle Activity Level Selector */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Physical Activity Coefficient</label>
                <span className="text-[11px] font-mono font-bold text-[#059669]">{activityLevel}x Multiplier</span>
              </div>
              <div className="space-y-3">
                {[
                  { value: 1.2, title: 'Sedentary', desc: 'Desk job, minimal activity, sitting throughout day' },
                  { value: 1.375, title: 'Lightly Active', desc: '1-3 sessions/week of casual light workouts' },
                  { value: 1.55, title: 'Moderately Active', desc: '3-5 moderate training blocks/week, steady movement' },
                  { value: 1.725, title: 'Very Active', desc: '6-7 intense sport / fitness workouts/week' },
                ].map((act) => (
                  <button
                    key={act.value}
                    id={`activity-${act.value}`}
                    onClick={() => setActivityLevel(act.value)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-4 ${
                      activityLevel === act.value 
                        ? 'bg-[#059669]/5 border-[#059669] shadow-sm' 
                        : 'bg-white border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      activityLevel === act.value ? 'border-[#059669] bg-[#059669]' : 'border-zinc-300 bg-white'
                    }`}>
                      {activityLevel === act.value && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${activityLevel === act.value ? 'text-[#059669]' : 'text-zinc-800'}`}>
                        {act.title}
                      </h4>
                      <p className="text-zinc-500 text-xs font-light mt-0.5">{act.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Goal Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Desired Performance Goal</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'lose', title: 'Lose Fat', desc: 'Deficit', icon: Flame },
                  { id: 'maintain', title: 'Maintain', desc: 'Balance', icon: Activity },
                  { id: 'gain', title: 'Gain Muscle', desc: 'Surplus', icon: TrendingUp }
                ].map((g) => {
                  const Icon = g.icon;
                  return (
                    <button
                      key={g.id}
                      id={`goal-${g.id}`}
                      onClick={() => setGoal(g.id as FitnessGoal)}
                      className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-2 ${
                        goal === g.id 
                          ? 'bg-[#059669]/5 border-[#059669] text-zinc-800 shadow-sm' 
                          : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${goal === g.id ? 'text-[#059669]' : 'text-zinc-400'}`} />
                      <div>
                        <div className="text-sm font-semibold">{g.title}</div>
                        <div className="text-[10px] text-zinc-400 font-light font-mono mt-0.5">{g.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Food Preference (Veg/Non-Veg Selection to optimize insights) */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Dietary Theme</label>
              <select
                id="input-diet-preference"
                value={dietPreference}
                onChange={e => setDietPreference(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] font-medium"
              >
                <option value="Pure Vegetarian">Pure Vegetarian (Indian Style)</option>
                <option value="Vegan (Plant-Based)">Vegan (Strictly Plant-Based)</option>
                <option value="Non-Vegetarian (High Protein)">Non-Vegetarian (Lean Meat & Poultry)</option>
                <option value="PCOS Friendly (Low GI)">PCOS Management (Low-GI, Anti-inflammatory)</option>
                <option value="Low Carb / Keto Style">Keto / Low Carb Focused Diet</option>
              </select>
            </div>

            {/* Primary Calculation Trigger Button */}
            <div className="pt-4">
              <button
                id="btn-calculate-macros"
                onClick={handleCalculate}
                disabled={isCalculating}
                className="w-full py-4 px-6 bg-[#059669] hover:bg-[#047857] disabled:bg-zinc-300 text-white font-semibold rounded-2xl text-base shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Metabolic Baseline...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Calculate My Custom Macros</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Calculations & Interactive Macro Split Adjuster */}
          <div className="lg:col-span-6">
            
            <AnimatePresence mode="wait">
              {/* State 1: Placeholder Card */}
              {!isCalculating && !hasCalculated && (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-zinc-50/70 border border-zinc-100 rounded-[2.5rem] p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[550px] space-y-6 shadow-inner"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#059669]/10 blur-2xl rounded-full scale-150"></div>
                    <div className="relative w-20 h-20 rounded-3xl bg-white border border-zinc-100 shadow-md flex items-center justify-center text-[#059669]">
                      <Sparkles className="w-10 h-10 animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-w-sm">
                    <h3 className="text-2xl font-serif text-[#1A1A1A]">Your Custom Macro Profile</h3>
                    <p className="text-zinc-500 text-sm font-light leading-relaxed">
                      Set your Assigned Gender, Age, Height, Weight, and desired Goal on the left, then click 
                      <strong className="text-[#059669] font-medium"> "Calculate My Custom Macros" </strong> 
                      to formulate your customized scientific calorie and nutrient breakdown.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleCalculate}
                      className="px-6 py-3.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold rounded-2xl transition-all shadow-md flex items-center gap-2 group cursor-pointer"
                    >
                      Launch Calculation Engine
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* State 2: "Calculating..." Transition Screen */}
              {isCalculating && (
                <motion.div
                  key="calculating"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#1A1A1A] text-white rounded-[2.5rem] p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[550px] relative overflow-hidden shadow-xl ring-1 ring-white/5"
                >
                  {/* Glowing decorative ambient light */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#059669]/10 blur-3xl rounded-full pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4A373]/5 blur-3xl rounded-full pointer-events-none"></div>

                  <div className="relative w-24 h-24 mb-8">
                    {/* Outer spinning loader */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-t-[#059669] border-r-transparent border-b-[#D4A373] border-l-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    />
                    {/* Inner pulsing icon */}
                    <motion.div
                      className="absolute inset-2.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#059669]"
                      animate={{ scale: [0.9, 1.1, 0.9] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    >
                      <Activity className="w-8 h-8" />
                    </motion.div>
                  </div>

                  <div className="space-y-4 max-w-sm relative z-10 mb-6">
                    <h3 className="text-xl font-serif font-light text-zinc-100">Configuring Profile</h3>
                    
                    {/* Status Ticker */}
                    <div className="h-6 overflow-hidden flex items-center justify-center">
                      <motion.p
                        key={tickerText}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-[#059669] font-mono text-xs uppercase tracking-wider font-semibold"
                      >
                        {tickerText}
                      </motion.p>
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full max-w-[240px] bg-white/5 h-1.5 rounded-full overflow-hidden relative z-10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#059669] to-[#D4A373]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.0, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              )}

              {/* State 3: Results Panel */}
              {!isCalculating && hasCalculated && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 110 }}
                  className="space-y-8"
                >
                  
                  {/* Calculation Output Panel */}
                  <div className="bg-[#1A1A1A] text-white rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden shadow-xl ring-1 ring-white/5">
                    
                    {/* Decorative radial blur */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#059669]/20 blur-3xl rounded-full pointer-events-none"></div>
                    
                    {/* Summary Label */}
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-6 font-mono">Caloric_Budget_Metrics_0xFE</p>
                    
                    <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-white/5 relative z-10">
                      <div>
                        <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest">BMR Baseline</span>
                          <span title="Basal Metabolic Rate: calories burned at complete rest.">
                            <Info className="w-3.5 h-3.5 opacity-30 cursor-help" />
                          </span>
                        </div>
                        <div className="text-3xl font-mono font-black text-zinc-100 tracking-tight tabular-nums">
                          {Math.round(bmr)}<span className="text-sm font-sans font-normal text-zinc-500 ml-1">kcal</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest">TDEE Budget</span>
                          <span title="Total Daily Energy Expenditure: Calories needed to maintain your current weight based on activity.">
                            <Info className="w-3.5 h-3.5 opacity-30 cursor-help" />
                          </span>
                        </div>
                        <div className="text-3xl font-mono font-black text-zinc-100 tracking-tight tabular-nums">
                          {Math.round(tdee)}<span className="text-sm font-sans font-normal text-zinc-500 ml-1">kcal</span>
                        </div>
                      </div>
                    </div>

                    {/* Major Actionable Calorie Callout */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                      <div>
                        <div className="text-xs text-zinc-400 font-light">Your Daily Recommended Intake</div>
                        <div className="text-5xl font-mono font-black text-[#059669] tracking-tighter mt-1 tabular-nums">
                          {targetCalories}
                          <span className="text-lg font-serif italic text-zinc-400 font-light tracking-normal ml-2">kcal/day</span>
                        </div>
                      </div>
                      
                      {/* Goal indicator badge */}
                      <div className="flex-shrink-0 self-start sm:self-center">
                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${goal === 'lose' ? 'bg-orange-500' : goal === 'gain' ? 'bg-[#059669]' : 'bg-blue-400'}`}></div>
                          <span className="font-medium text-zinc-300">
                            {goal === 'lose' ? 'Caloric Deficit' : goal === 'gain' ? 'Caloric Surplus' : 'Maintenance Mode'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Interactive Macro Split Station */}
                  <div className="bg-zinc-50/50 rounded-[2.5rem] border border-zinc-100 p-8 sm:p-10 space-y-8 shadow-sm">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D4A373]/10 flex items-center justify-center text-[#D4A373]">
                          <Apple className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-800">Dynamic Macro Split Station</h3>
                      </div>
                      
                      {/* Diet Type Selector */}
                      <div className="flex bg-zinc-200/60 rounded-xl p-1 text-xs">
                        {[
                          { id: 'balanced', label: 'Balanced' },
                          { id: 'high-protein', label: 'High Protein' },
                          { id: 'low-carb', label: 'Low Carb' }
                        ].map((preset) => (
                          <button
                            key={preset.id}
                            id={`preset-${preset.id}`}
                            onClick={() => setDietType(preset.id as DietType)}
                            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${dietType === preset.id ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Circular SVG Stack or Bento Grid of Macros */}
                    <div className="grid grid-cols-3 gap-4">
                      
                      {/* Carbohydrates Card */}
                      <div className="bg-white p-5 rounded-3xl border border-zinc-100 text-center relative group">
                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-wider block mb-2">Carbohydrates</span>
                        <div className="text-2xl font-mono font-black text-zinc-800 tracking-tight tabular-nums">
                          {macrosGrams.carbs}<span className="text-xs text-zinc-400 font-sans font-normal ml-0.5">g</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-1">{macroSplit.carbs}% energy</div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-400 rounded-b-3xl"></div>
                      </div>

                      {/* Protein Card */}
                      <div className="bg-white p-5 rounded-3xl border border-zinc-100 text-center relative group">
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-wider block mb-2">Protein (Build)</span>
                        <div className="text-2xl font-mono font-black text-zinc-800 tracking-tight tabular-nums">
                          {macrosGrams.protein}<span className="text-xs text-zinc-400 font-sans font-normal ml-0.5">g</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-1">{macroSplit.protein}% energy</div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 rounded-b-3xl"></div>
                      </div>

                      {/* Fats Card */}
                      <div className="bg-white p-5 rounded-3xl border border-zinc-100 text-center relative group">
                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-wider block mb-2">Dietary Fats</span>
                        <div className="text-2xl font-mono font-black text-zinc-800 tracking-tight tabular-nums">
                          {macrosGrams.fats}<span className="text-xs text-zinc-400 font-sans font-normal ml-0.5">g</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-1">{macroSplit.fats}% energy</div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-400 rounded-b-3xl"></div>
                      </div>

                    </div>

                    {/* Sliders Block */}
                    <div className="space-y-6">
                      
                      {/* Carbs Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-zinc-700">Carbohydrates Ratio</span>
                          <span className="font-mono font-bold text-amber-500">{macroSplit.carbs}%</span>
                        </div>
                        <input
                          type="range"
                          id="slider-carbs"
                          min="10"
                          max="70"
                          value={macroSplit.carbs}
                          onChange={(e) => handleMacroChange('carbs', Number(e.target.value))}
                          className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none accent-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* Protein Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-zinc-700">Protein Ratio</span>
                          <span className="font-mono font-bold text-emerald-500">{macroSplit.protein}%</span>
                        </div>
                        <input
                          type="range"
                          id="slider-protein"
                          min="15"
                          max="50"
                          value={macroSplit.protein}
                          onChange={(e) => handleMacroChange('protein', Number(e.target.value))}
                          className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* Fats Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-zinc-700">Dietary Fats Ratio</span>
                          <span className="font-mono font-bold text-orange-500">{macroSplit.fats}%</span>
                        </div>
                        <input
                          type="range"
                          id="slider-fats"
                          min="10"
                          max="60"
                          value={macroSplit.fats}
                          onChange={(e) => handleMacroChange('fats', Number(e.target.value))}
                          className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none accent-orange-500 cursor-pointer"
                        />
                      </div>

                    </div>

                    {/* Disclaimer */}
                    <div className="flex items-start gap-3 bg-zinc-100 rounded-2xl p-4 text-zinc-500 text-xs font-light">
                      <Info className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                      <p>
                        Adjusting any slider will re-balance the remaining macros proportionally so that they always equal 
                        exactly 100% total daily energy intake.
                      </p>
                    </div>

                  </div>

                  {/* SmartButton to trigger AI Nutritionist Insights */}
                  <div>
                    <SmartButton
                      label={aiLoading ? "Consulting AI Dietitian..." : "Retrieve Personalized AI Dietitian Insights"}
                      variant="primary"
                      onClick={handleGetAiInsights}
                      disabled={aiLoading}
                      icon={aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                      className="w-full !h-18 text-base shadow-lg"
                    />
                  </div>

                  {/* Off-Page SEO Backlink & Social Sharing Engine */}
                  <div className="bg-[#1A1A1A] border border-white/5 rounded-[2.5rem] p-6 sm:p-8 mt-6 relative overflow-hidden font-sans text-left">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A00]/5 blur-2xl rounded-full pointer-events-none"></div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
                      <div>
                        <span className="text-[#FF7A00] text-[10px] font-bold uppercase tracking-widest block mb-1">PRO-GRADE GROWTH HUB</span>
                        <h4 className="text-lg font-serif text-white">Share Results & Support Organic Growth</h4>
                      </div>
                      
                      {/* Tab toggles */}
                      <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShareTab('share')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                            shareTab === 'share'
                              ? 'bg-zinc-800 text-[#FF7A00] shadow'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Share2 className="w-3.5 h-3.5 inline mr-1" />
                          Social Share
                        </button>
                        <button
                          type="button"
                          onClick={() => setShareTab('embed')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                            shareTab === 'embed'
                              ? 'bg-zinc-800 text-[#FF7A00] shadow'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Code className="w-3.5 h-3.5 inline mr-1" />
                          Blog Embed
                        </button>
                      </div>
                    </div>

                    {shareTab === 'share' ? (
                      <div className="space-y-4">
                        <p className="text-zinc-400 text-xs font-light leading-relaxed">
                          Celebrate your custom health blueprint! Copy or share your recommended macros with your fitness group. This fuels our Bengaluru clean-eating community.
                        </p>
                        
                        {/* Share preview card */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[11px] text-zinc-300 leading-relaxed relative">
                          <span className="absolute top-2 right-2 text-[9px] bg-zinc-900 px-2 py-0.5 rounded text-zinc-500 border border-white/5 uppercase">Preview</span>
                          "My customized daily calorie budget is <strong className="text-[#FF7A00]">{targetCalories} kcal</strong> calculated by the Taazabites Macro Engine! Protein: <strong>{macrosGrams.protein}g</strong>, Carbs: <strong>{macrosGrams.carbs}g</strong>, Fats: <strong>{macrosGrams.fats}g</strong>. Check yours here: https://www.taazabites.in/macro-calculator"
                        </div>

                        {/* Share actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const shareText = `My customized daily calorie budget is ${targetCalories} kcal calculated by the Taazabites Macro Engine! Protein: ${macrosGrams.protein}g, Carbs: ${macrosGrams.carbs}g, Fats: ${macrosGrams.fats}g. Check yours here: https://www.taazabites.in/macro-calculator?utm_source=whatsapp_share`;
                              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                            }}
                            className="w-full py-2.5 px-4 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-emerald-500/10 transition-colors cursor-pointer"
                          >
                            WhatsApp Share
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const shareText = `My customized daily calorie budget is ${targetCalories} kcal calculated by the Taazabites Macro Engine! Protein: ${macrosGrams.protein}g, Carbs: ${macrosGrams.carbs}g, Fats: ${macrosGrams.fats}g.`;
                              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=https://www.taazabites.in/macro-calculator&hashtags=Taazabites,Nutrition,Fitness`, '_blank');
                            }}
                            className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                          >
                            Twitter/X Share
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const shareText = `My customized daily calorie budget is ${targetCalories} kcal calculated by the Taazabites Macro Engine! Protein: ${macrosGrams.protein}g, Carbs: ${macrosGrams.carbs}g, Fats: ${macrosGrams.fats}g. Check yours here: https://www.taazabites.in/macro-calculator`;
                              navigator.clipboard.writeText(shareText);
                              setTextCopied(true);
                              setTimeout(() => setTextCopied(false), 2000);
                              if (window.dispatchEvent) {
                                window.dispatchEvent(new CustomEvent('show-toast', { 
                                  detail: { message: "Share text copied to clipboard!", type: "success" } 
                                }));
                              }
                            }}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500/10 to-orange-500/20 hover:from-orange-500/20 hover:to-orange-500/30 text-[#FF7A00] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-orange-500/10 transition-colors cursor-pointer"
                          >
                            {textCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 animate-pulse" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy Text
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-zinc-400 text-xs font-light leading-relaxed">
                          Are you a fitness blogger, personal trainer, or diet coach? Embed this professional, macro-calculated diet engine directly on your website to instantly boost reader retention! 
                        </p>
                        
                        {/* Embed code snippet */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[10px] text-zinc-400 leading-relaxed relative max-h-24 overflow-y-auto">
                          <span className="absolute top-2 right-2 text-[9px] bg-zinc-900 px-2 py-0.5 rounded text-zinc-500 border border-white/5 uppercase">HTML Code</span>
                          {`<iframe src="${typeof window !== 'undefined' ? window.location.origin : 'https://www.taazabites.in'}/macro-calculator?embed=true" width="100%" height="750px" style="border:none;border-radius:24px;background:#1A1A1A;box-shadow:0 8px 30px rgba(0,0,0,0.25);"></iframe>\n<p style="font-size:11px;color:#888;text-align:center;font-family:sans-serif;">Calculated via <a href="https://www.taazabites.in" target="_blank" style="color:#FF7A00;font-weight:bold;text-decoration:none;">Taazabites Healthy Diet Meal Delivery Bangalore</a></p>`}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/20 p-3.5 rounded-2xl border border-white/[0.03]">
                          <span className="text-[10px] text-zinc-500 italic">
                            *Auto-includes a search engine indexable (Do-Follow) link back to support our local community.
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.taazabites.in';
                              const embedCode = `<iframe src="${originUrl}/macro-calculator?embed=true" width="100%" height="750px" style="border:none;border-radius:24px;background:#1a1a1a;box-shadow:0 8px 30px rgba(0,0,0,0.25);"></iframe>\n<p style="font-size:11px;color:#888;text-align:center;font-family:sans-serif;">Calculated via <a href="https://www.taazabites.in" target="_blank" style="color:#FF7A00;font-weight:bold;text-decoration:none;">Taazabites Healthy Diet Meal Delivery Bangalore</a></p>`;
                              navigator.clipboard.writeText(embedCode);
                              setEmbedCopied(true);
                              setTimeout(() => setEmbedCopied(false), 2000);
                              if (window.dispatchEvent) {
                                window.dispatchEvent(new CustomEvent('show-toast', { 
                                  detail: { message: "HTML Embed code copied!", type: "success" } 
                                }));
                              }
                            }}
                            className="w-full sm:w-auto py-2.5 px-6 bg-[#FF7A00] hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {embedCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Copied Code!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy HTML Code
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

        {/* AI Insight Response Section */}
        <AnimatePresence>
          {(aiLoading || aiInsights || aiError) && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-16 bg-zinc-50/50 rounded-[3rem] border border-zinc-100 p-8 sm:p-12 relative overflow-hidden"
              id="ai-insights-panel"
            >
              
              {/* Subtle Glowing Decor */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#059669]/10 blur-3xl rounded-full pointer-events-none"></div>

              {aiLoading ? (
                <div className="text-center py-12 space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#059669]/10 text-[#059669] animate-spin">
                    <Loader2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-light text-zinc-800">Formulating Metabolic Profile Analytics</h4>
                    <p className="text-zinc-500 text-sm font-light mt-1">Gemini AI is consulting dietary frameworks for HSR & Indiranagar active routes...</p>
                  </div>
                </div>
              ) : aiError ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-red-500 font-medium text-sm">{aiError}</p>
                  <button 
                    onClick={handleGetAiInsights} 
                    className="px-6 py-2.5 bg-zinc-800 text-white rounded-xl text-xs font-semibold hover:bg-zinc-700"
                  >
                    Retry Query
                  </button>
                </div>
              ) : aiInsights ? (
                <div className="space-y-10">
                  
                  {/* Title & Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-zinc-800">Personalized Nutritionist Analysis</h4>
                        <p className="text-xs text-[#059669] font-mono">Powered by Gemini AI Engine</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setAiInsights(null)} 
                      className="text-xs font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Clear Report
                    </button>
                  </div>

                  {/* Analysis Breakdown Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Summary Pane */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Metabolic Feedback Summary</span>
                        <p className="text-zinc-700 font-light leading-relaxed text-base">
                          {aiInsights.insightSummary}
                        </p>
                      </div>

                      <div className="space-y-4 pt-4">
                        <span className="text-[10px] font-black text-[#059669] uppercase tracking-widest block">Actionable Plan Advice</span>
                        <div className="grid grid-cols-1 gap-3">
                          {aiInsights.actionableTips.map((tip, i) => (
                            <div key={i} className="flex gap-3 items-start bg-white p-4 rounded-2xl border border-zinc-100">
                              <CheckCircle className="w-5 h-5 text-[#059669] flex-shrink-0 mt-0.5" />
                              <p className="text-sm font-light text-zinc-600 leading-normal">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommendation Pane */}
                    <div className="lg:col-span-5 bg-white border border-zinc-100 p-8 rounded-[2rem] space-y-6 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4A373]/10 blur-2xl rounded-full"></div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Recommended Subscription</span>
                        <h5 className="text-lg font-semibold text-zinc-800 font-serif">Taaza Bites Customized Plan</h5>
                      </div>

                      <p className="text-sm text-zinc-600 font-light leading-relaxed">
                        {aiInsights.taazaPlanRecommendation}
                      </p>

                      <div className="pt-4 space-y-3">
                        <a
                          id="btn-scoll-to-plans"
                          href={PORTAL_LINKS.subscribe}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-4 px-6 bg-[#059669] text-white font-medium rounded-2xl text-sm hover:bg-[#047857] transition-all flex items-center justify-center gap-2 shadow-md group"
                        >
                          Lock in and Subscribe <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                        
                        <p className="text-[10px] text-center text-zinc-400">
                          Freshly cooked & hand-delivered in Bengaluru. Pause/Skip options included.
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              ) : null}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
