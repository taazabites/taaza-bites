import { useState, useMemo, useEffect } from 'react';
import { 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Flame, 
  Zap, 
  Sparkles, 
  Leaf, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  TrendingUp, 
  RotateCw, 
  X, 
  Scale, 
  Dumbbell, 
  Activity,
  Heart,
  LayoutGrid,
  Loader2,
  ChevronLeft,
  Drumstick
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { SubscriptionPlan } from '../firebase/collections';
import { cn } from '@/src/lib/utils';
import { useCarousel } from '../hooks/useCarousel';

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  loading: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
  dietBase: 'Veg' | 'Egg' | 'Non-Veg';
  setDietBase: (val: 'Veg' | 'Egg' | 'Non-Veg') => void;
  mealsPerDay: number;
  setMealsPerDay: (val: number) => void;
  fitnessGoal: 'Balanced' | 'Fat Loss' | 'Gain Muscle' | 'Keto Clean';
  setFitnessGoal: (val: 'Balanced' | 'Fat Loss' | 'Gain Muscle' | 'Keto Clean') => void;
  onDirectPurchase?: (id: string) => void;
}

const DIET_OPTIONS = [
  { id: 'Veg', label: 'Pure Veg', icon: Leaf, color: 'text-emerald-400' },
  { id: 'Egg', label: 'Eggitarian', icon: EggIcon, color: 'text-amber-400' },
  { id: 'Non-Veg', label: 'Non-Veg', icon: Drumstick, color: 'text-rose-400' }
] as const;

function EggIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C7.5 2 4 7 4 12c0 4.5 3.5 8 8 8s8-3.5 8-8c0-5-3.5-10-8-10z" />
    </svg>
  );
}

// Plan Card Sub-component for reuse in grid and carousel
function PlanCard({ 
  plan, 
  isSelected, 
  expandedNutrition, 
  expandedBenefits, 
  toggleNutrition, 
  toggleBenefits, 
  onSelect, 
  onDirectPurchase,
  dietBase,
  mealsPerDay
}: any) {
  const navigate = useNavigate();
  return (
    <motion.div
      className={cn(
        "rounded-[2.5rem] bg-white border transition-all duration-500 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-2",
        isSelected 
          ? "border-emerald-500 ring-4 ring-emerald-500/15 scale-[1.01]" 
          : plan.popular
          ? "border-amber-400 ring-2 ring-amber-400/5 shadow-[0_12px_40px_rgba(245,158,11,0.05)]"
          : "border-zinc-200/70"
      )}
    >
      {/* Popular Highlight top bar */}
      {plan.popular && (
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-amber-500 z-20" />
      )}
      
      {/* Image Header with badging */}
      <div 
        onClick={() => navigate(`/plans/${plan.id}`)}
        className="relative h-60 overflow-hidden bg-zinc-100 cursor-pointer"
        title={`View detailed subscription page for ${plan.name}`}
      >
        <img 
          referrerPolicy="no-referrer"
          src={`${plan.image}&fm=webp`} 
          alt={plan.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent"></div>
        
        {/* BADGING ON IMAGE */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {plan.badge}
          </span>
          {isSelected ? (
            <span className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-lg">
              <Check className="w-3 h-3 stroke-[3]" /> Selected
            </span>
          ) : plan.popular ? (
            <span className="px-3 py-1.5 bg-amber-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-lg animate-pulse">
              <Star className="w-3 h-3 fill-white" /> Most Popular
            </span>
          ) : null}
        </div>

        {/* DURATION BADGES */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <span className="bg-amber-400 text-zinc-950 text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider shadow-md">
            {plan.durationDays} Days Plan
          </span>
          <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider border border-white/15">
            {plan.totalMealsCount} Meals Total
          </span>
        </div>
      </div>

      {/* CARD DETAILS */}
      <div className="p-6 md:p-8 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/plans/${plan.id}`} className="hover:text-emerald-600 transition-colors">
            <h3 className="text-3xl font-black text-zinc-950 tracking-tight leading-none hover:text-emerald-600 transition-colors">
              {plan.name}
            </h3>
          </Link>
          {plan.id === 'plan_30' && (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Executive Tier
            </span>
          )}
        </div>
        <p className="text-zinc-550 text-xs md:text-sm leading-relaxed mb-4 min-h-[40px]">
          {plan.description}
        </p>
        <div className="mb-6">
          <Link 
            to={`/plans/${plan.id}`} 
            className="text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline font-extrabold uppercase tracking-widest flex items-center gap-1"
          >
            View Full Plan Details →
          </Link>
        </div>

        {/* COMPREHENSIVE PLAN METRICS GRID */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-150 text-[11px] font-bold text-zinc-600">
          <div className="flex flex-col">
            <span className="text-zinc-400 text-[9px] uppercase tracking-wider">Total Meals</span>
            <span className="text-zinc-900 font-extrabold text-xs">{plan.totalMealsCount} Meals ({plan.durationDays} Days)</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-400 text-[9px] uppercase tracking-wider">Meals Per Day</span>
            <span className="text-zinc-900 font-extrabold text-xs">{mealsPerDay} Meal(s) Daily</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-400 text-[9px] uppercase tracking-wider">Est. Nutrition</span>
            <span className="text-zinc-900 font-extrabold text-xs">{plan.calories} kcal • {plan.protein}g Protein</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-400 text-[9px] uppercase tracking-wider">Delivery timing</span>
            <span className="text-zinc-900 font-extrabold text-xs">Morning (7:00 AM - 9:00 AM)</span>
          </div>
        </div>

        {/* MINI PILL TAGS */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className={cn(
            "text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border flex items-center gap-1.5 shadow-sm",
            dietBase === 'Veg' 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" 
              : dietBase === 'Egg' 
              ? "bg-amber-50 text-amber-800 border-amber-200/60" 
              : "bg-rose-50 text-rose-700 border-rose-200/60"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", 
              dietBase === 'Veg' ? "bg-emerald-500" : dietBase === 'Egg' ? "bg-amber-500" : "bg-rose-500"
            )} />
            {dietBase === 'Veg' ? 'Pure Veg' : dietBase === 'Egg' ? 'Eggitarian' : 'Non-Veg'}
          </span>
          <span className="bg-zinc-50 text-zinc-700 border border-zinc-200/70 text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            🍽️ {mealsPerDay} Meal{mealsPerDay > 1 ? 's' : ''} / Day
          </span>
        </div>

        {/* UNIQUE HIGHLIGHT PROMO TAG */}
        <div className={cn(
          "p-3 rounded-2xl text-[11px] font-black flex items-center gap-2 mb-6 border transition-all duration-300",
          plan.id === 'trial_3' 
            ? "bg-amber-50 border-amber-100/80 text-amber-800" 
            : plan.id === 'weekly'
            ? "bg-emerald-50 border-emerald-100/80 text-emerald-800"
            : plan.id === 'plan_15'
            ? "bg-sky-50 border-sky-100/80 text-sky-800"
            : "bg-indigo-50 border-indigo-100/80 text-indigo-800"
        )}>
          {plan.id === 'trial_3' ? (
            <Flame className="w-4 h-4 shrink-0 text-amber-600" />
          ) : plan.id === 'weekly' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : plan.id === 'plan_15' ? (
            <Sparkles className="w-4 h-4 shrink-0 text-sky-600" />
          ) : (
            <Zap className="w-4 h-4 shrink-0 text-indigo-600" />
          )}
          <span className="leading-tight">{plan.promoText}</span>
        </div>

        {/* PRICING AREA */}
        <div className={cn(
          "mb-6 p-5 rounded-3xl border transition-all duration-300",
          isSelected 
            ? "bg-emerald-50/40 border-emerald-100 shadow-sm" 
            : plan.popular
            ? "bg-amber-50/30 border-amber-100"
            : "bg-zinc-50/70 border-zinc-150"
        )}>
          <div className="flex items-baseline justify-between w-full">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-zinc-950 tracking-tighter">₹{plan.pricePerMeal}</span>
              <span className="text-xs text-zinc-450 font-bold uppercase tracking-wider">/ meal</span>
            </div>
            {plan.totalSavings > 0 && (
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                Save {mealsPerDay === 2 ? '10%' : '16%'}
              </span>
            )}
          </div>
          {plan.totalSavings > 0 && (
            <div className="mt-1 flex items-baseline gap-1.5 text-xs text-zinc-450">
              <span className="line-through text-zinc-400/70 font-semibold">₹{plan.originalPricePerMeal}</span>
              <span className="text-[10px] text-zinc-400 font-medium">standard price</span>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between text-zinc-400 text-[10px] font-black uppercase tracking-wider border-t border-zinc-200/50 pt-3">
            <span>Total program cost</span>
            <div className="flex flex-col items-end">
              <span className="text-zinc-850 font-black text-sm">₹{plan.totalPrice.toLocaleString()}</span>
              {plan.totalSavings > 0 && (
                <span className="text-emerald-600 text-[8px] font-black uppercase tracking-widest mt-0.5">Saved ₹{plan.totalSavings.toLocaleString()}!</span>
              )}
            </div>
          </div>
        </div>

        {/* ACCORDION 1: EST. DAILY NUTRITION */}
        <div className={cn(
          "border-t border-zinc-100 py-3.5 transition-all",
          expandedNutrition[plan.id] && "bg-zinc-50/40 px-2 -mx-2 rounded-2xl border border-zinc-150"
        )}>
          <button
            onClick={(e) => toggleNutrition(plan.id, e)}
            className="w-full flex justify-between items-center text-xs font-black text-zinc-800 uppercase tracking-wider hover:text-emerald-600 transition-colors cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> Est. Daily Nutrition
            </span>
            <span className="text-[10px] text-zinc-400 hover:text-emerald-600 flex items-center gap-0.5">
              {expandedNutrition[plan.id] ? 'Hide Stats ▲' : 'Reveal Stats ▼'}
            </span>
          </button>
          <AnimatePresence>
            {expandedNutrition[plan.id] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="p-4 bg-emerald-50/50 border border-emerald-100/60 rounded-xl space-y-3.5 text-left">
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1">
                      <span className="text-emerald-800">Energy (Target)</span>
                      <span className="text-emerald-950 font-black">{plan.calories} kcal</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min((plan.calories / 2000) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2.5 border-t border-emerald-100/40">
                    <div>
                      <p className="text-[9px] text-emerald-800/80 font-black uppercase tracking-wider mb-1">Protein</p>
                      <p className="text-xs font-black text-emerald-950">{plan.protein}g</p>
                      <div className="w-full bg-zinc-100 h-1 mt-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min((plan.protein / 100) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-emerald-800/80 font-black uppercase tracking-wider mb-1">Carbs</p>
                      <p className="text-xs font-black text-emerald-950">{plan.carbs}g</p>
                      <div className="w-full bg-zinc-100 h-1 mt-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min((plan.carbs / 250) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-emerald-800/80 font-black uppercase tracking-wider mb-1">Fats</p>
                      <p className="text-xs font-black text-emerald-950">{plan.fats}g</p>
                      <div className="w-full bg-zinc-100 h-1 mt-1 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full rounded-full" style={{ width: `${Math.min((plan.fats / 80) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACCORDION 2: SHOW BENEFITS */}
        <div className={cn(
          "border-t border-zinc-100 py-3.5 transition-all mb-4",
          expandedBenefits[plan.id] && "bg-emerald-500/5 px-3 -mx-2.5 rounded-2xl border border-emerald-500/10"
        )}>
          <button
            onClick={(e) => toggleBenefits(plan.id, e)}
            className="w-full flex justify-between items-center text-xs font-black text-zinc-800 uppercase tracking-wider hover:text-emerald-600 transition-colors cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10 stroke-[2.5]" /> Premium Advantages
            </span>
            <span className="text-[10px] text-zinc-400 hover:text-emerald-600 flex items-center gap-0.5">
              {expandedBenefits[plan.id] ? 'Hide Details ▲' : 'Reveal Details ▼'}
            </span>
          </button>
          <AnimatePresence>
            {expandedBenefits[plan.id] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="space-y-3 p-4 bg-white/70 dark:bg-zinc-950/60 border border-emerald-500/10 rounded-xl text-[11px] text-zinc-700">
                  <p className="font-black text-emerald-800 uppercase tracking-widest text-[9px] mb-2">Weekly Plan Health Advantages</p>
                  {plan.bulletPoints.map((bp: string, i: number) => {
                    let hasBold = bp.includes('**');
                    let prefix = "";
                    let content = bp;
                    if (hasBold) {
                      const parts = bp.split('**');
                      prefix = parts[1] || "";
                      content = parts[2] || "";
                    }
                    return (
                      <div key={i} className="flex items-start gap-2 text-zinc-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                        <span>
                          {prefix && <strong className="text-emerald-900 font-extrabold">{prefix} </strong>}
                          {content}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BASE CHECKS THAT ARE ALWAYS VISIBLE */}
        <div className="space-y-3 mb-8 text-xs font-semibold text-zinc-700">
          {plan.alwaysChecks.map((checkText: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3.5]" />
              </div>
              <span>{checkText}</span>
            </div>
          ))}
        </div>

        {/* TWO VISUALLY ENGAGING BUTTON ACTIONS */}
        <div className="flex flex-col gap-3.5 mt-auto pt-6">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onDirectPurchase) {
                await onDirectPurchase(plan.id);
              } else {
                onSelect(plan.id);
              }
            }}
            className="w-full py-4.5 rounded-2xl text-xs font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] shadow-xl shadow-emerald-600/15 cursor-pointer"
          >
            ⚡ SUBSCRIBE NOW <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(plan.id);
            }}
            className={cn(
              "w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer border",
              isSelected
                ? "bg-amber-400 border-amber-500 text-zinc-950 shadow-md shadow-amber-400/10"
                : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700"
            )}
          >
            ⚙️ {isSelected ? "Selected (Customize Below)" : "Customize Ingredients & Slots"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const MEALS_OPTIONS = [
  { id: 1, label: '1 Meal', sublabel: 'Lunch/Dinner' },
  { id: 2, label: '2 Meals', sublabel: 'Save 10%' },
  { id: 3, label: '3 Meals', sublabel: 'Save 16%' }
] as const;

const GOAL_OPTIONS = [
  { id: 'Balanced', label: 'Balanced', sublabel: 'Standard Vital', icon: Activity },
  { id: 'Fat Loss', label: 'Fat Loss', sublabel: 'Deficit (+₹10)', icon: Scale },
  { id: 'Gain Muscle', label: 'Gain Muscle', sublabel: 'Protein (+₹20)', icon: Dumbbell },
  { id: 'Keto Clean', label: 'Keto Clean', sublabel: 'Low-carb (+₹20)', icon: Zap }
] as const;

// High-quality food imagery mapping
const FOOD_IMAGES = {
  trial: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fm=webp',
  habit: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fm=webp',
  lifestyle: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fm=webp'
};

export default function SubscriptionPlans({
  plans,
  loading,
  selectedId,
  onSelect,
  dietBase,
  setDietBase,
  mealsPerDay,
  setMealsPerDay,
  fitnessGoal,
  setFitnessGoal,
  onDirectPurchase
}: SubscriptionPlansProps) {
  const [showCompare, setShowCompare] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'compare'>('cards');
  const [expandedNutrition, setExpandedNutrition] = useState<Record<string, boolean>>({});
  const [expandedBenefits, setExpandedBenefits] = useState<Record<string, boolean>>({
    basic: true // default first open as in mockup
  });

  const toggleNutrition = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNutrition(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBenefits = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedBenefits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Static sample dishes list for dynamic visualization
  const sampleDishes = useMemo(() => {
    if (dietBase === 'Non-Veg') {
      return [
        {
          name: 'Lemon Herb Grilled Chicken Bowl',
          description: 'Lean high-protein chicken breast grilled with premium wild herbs, served over brown rice and charred green broccoli.',
          stats: '520 kcal • 42g Prot • 40g Carb • 8g Fiber',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fm=webp'
        },
        {
          name: 'Smoked Salmon Egg Salad Bowl',
          description: 'Omega-3 rich premium smoked salmon paired with cage-free boiled eggs, ripe avocado, and baby greens.',
          stats: '410 kcal • 30g Prot • 12g Carb • 9g Fiber',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fm=webp'
        }
      ];
    } else if (dietBase === 'Egg') {
      return [
        {
          name: 'Garden Veggie Egg Frittata',
          description: 'Fluffy oven-baked cage-free eggs with cherry tomatoes, fresh baby spinach, and low-fat crumbled feta cheese.',
          stats: '320 kcal • 22g Prot • 10g Carb • 5g Fiber',
          image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600&auto=format&fm=webp'
        },
        {
          name: 'Egg Salad & Creamy Avocado Wrap',
          description: 'High-fiber whole wheat wrap filled with chopped egg salad, fresh avocado mash, cucumber, and green lettuce.',
          stats: '430 kcal • 18g Prot • 35g Carb • 12g Fiber',
          image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?q=80&w=600&auto=format&fm=webp'
        }
      ];
    } else {
      return [
        {
          name: 'Quinoa Power Bowl with Grilled Paneer',
          description: 'Nutrient-dense premium quinoa topped with spice-marinated grilled paneer, cucumber, cherry tomatoes, and fiber-rich colorful vegetables.',
          stats: '480 kcal • 25g Prot • 50g Carb • 10g Fiber',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fm=webp'
        },
        {
          name: 'Dry Fruit Chia Seed Pudding',
          description: 'Creamy vanilla almond milk chia bowl loaded with healthy omega-3 fatty acids, dates, and raw Karnataka farm walnuts.',
          stats: '350 kcal • 12g Prot • 45g Carb • 15g Fiber',
          image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=600&auto=format&fm=webp'
        }
      ];
    }
  }, [dietBase]);

  // Compute dynamic parameters for the 4 premium subscription plans
  const computedPlans = useMemo(() => {
    const plansBase = [
      {
        id: 'trial_3',
        name: '3 Day Trial',
        badge: '3 DAYS - INTRO TRIAL',
        durationDays: 3,
        basePricePerMeal: 333,
        description: 'Sample our fresh, healthy meals for 3 days and experience the difference.',
        image: FOOD_IMAGES.trial,
        promoText: 'Try fresh, wholesome meals with zero commitment!',
        popular: false,
        bulletPoints: [
          '**Fresh Ingredients:** 100% natural, farm-fresh ingredients prepared daily',
          '**Sustained Energy:** Balanced lean proteins and complex fibers for high energy',
          '**Calorie Balanced:** Perfect calorie targets tailored to your fitness goals',
          '**Easy & Convenient:** Ideal low-commitment trial for busy schedules'
        ],
        alwaysChecks: [
          'Zero prep time required',
          'Pause schedule anytime'
        ]
      },
      {
        id: 'weekly',
        name: 'Weekly Plan',
        badge: '7 DAYS - HABIT STARTER',
        durationDays: 7,
        basePricePerMeal: 320,
        description: 'Establish solid nutrition habits. Perfect 7 days of healthy chef-cooked meals.',
        image: FOOD_IMAGES.habit,
        promoText: 'Perfect for building sustainable wellness habits',
        popular: false,
        bulletPoints: [
          '**Gut Friendly:** Easy to digest, zero artificial preservatives or MSG',
          '**Balanced Macros:** Weekly macro ratios designed for steady energy',
          '**Mental Focus:** Nutrient-rich meals to keep you sharp and active',
          '**Flexible Schedule:** Pause, skip, or change delivery address anytime'
        ],
        alwaysChecks: [
          'Dedicated certified dietitian support',
          'Weekly progress & fitness tracking'
        ]
      },
      {
        id: 'plan_15',
        name: '15 Day Plan',
        badge: '15 DAYS - HEALTH REFRESH',
        durationDays: 15,
        basePricePerMeal: 300,
        description: 'Intermediate health refresh. Clean energy and constant daytime focus.',
        image: FOOD_IMAGES.trial,
        promoText: 'Saves over ₹1,500 compared to daily ordering.',
        popular: false,
        bulletPoints: [
          '**Sustained Refresh:** Balanced nutrition that keeps you feeling active',
          '**Quality Sourcing:** Premium organic greens, cold-pressed oils, and fresh veggies',
          '**Varied Menu:** Rotating chef menu so you never get bored',
          '**Continuous Support:** Regular check-ins with your assigned dietitian'
        ],
        alwaysChecks: [
          '100% Premium handpicked natural inputs',
          'Dietitian-designed progress tracking'
        ]
      },
      {
        id: 'plan_30',
        name: '30 Day Plan',
        badge: '30 DAYS - BEST VALUE',
        durationDays: 30,
        basePricePerMeal: 280,
        description: 'Complete lifestyle alignment. Full 30 days of clean, wholesome energy and custom nutrition.',
        image: FOOD_IMAGES.lifestyle,
        promoText: 'Saves over ₹3,600 and includes free nutritionist support.',
        popular: true,
        bulletPoints: [
          '**Complete Transformation:** Feel stronger, lighter, and more energized every day',
          '**Exquisite Ingredients:** Exclusively premium superfoods and cold-pressed oils',
          '**Custom Meal Swaps:** Personalize your daily menu choices effortlessly',
          '**Personal Consultation:** Direct weekly chats with our Chief Nutritionist & Executive Chef'
        ],
        alwaysChecks: [
          '100% Premium handpicked natural inputs',
          'Unlimited direct consultations with expert nutritionists'
        ]
      }
    ];

    return plansBase.map(plan => {
      let dietPremium = 0;
      if (dietBase === 'Egg') dietPremium = 10;
      if (dietBase === 'Non-Veg') dietPremium = 25;

      let goalPremium = 0;
      if (fitnessGoal === 'Fat Loss') goalPremium = 10;
      if (fitnessGoal === 'Gain Muscle') goalPremium = 20;
      if (fitnessGoal === 'Keto Clean') goalPremium = 20;

      let discount = 1;
      if (mealsPerDay === 2) discount = 0.90;
      if (mealsPerDay === 3) discount = 0.84;

      const rawMealPrice = plan.basePricePerMeal + dietPremium + goalPremium;
      const pricePerMeal = Math.round(rawMealPrice * discount);
      const totalMealsCount = plan.durationDays * mealsPerDay;
      const totalPrice = pricePerMeal * totalMealsCount;

      // Dynamic macros
      let calories = 1200;
      if (plan.id === 'weekly') calories = 1250;
      if (plan.id === 'plan_15') calories = 1300;
      if (plan.id === 'plan_30') calories = 1350;

      if (fitnessGoal === 'Fat Loss') calories -= 100;
      if (fitnessGoal === 'Gain Muscle') calories += 400;
      if (fitnessGoal === 'Keto Clean') calories += 100;

      let protein = 45;
      if (plan.id === 'weekly') protein = 50;
      if (plan.id === 'plan_15') protein = 55;
      if (plan.id === 'plan_30') protein = 60;

      if (fitnessGoal === 'Gain Muscle') protein += 25;
      if (dietBase === 'Non-Veg') protein += 15;
      if (dietBase === 'Egg') protein += 5;

      let carbs = Math.round((calories * 0.45) / 4);
      if (fitnessGoal === 'Keto Clean') carbs = Math.round((calories * 0.10) / 4);
      
      let fats = Math.round((calories * 0.25) / 9);
      if (fitnessGoal === 'Keto Clean') fats = Math.round((calories * 0.65) / 9);

      return {
        ...plan,
        pricePerMeal,
        totalMealsCount,
        totalPrice,
        originalPricePerMeal: rawMealPrice,
        totalOriginalPrice: rawMealPrice * totalMealsCount,
        totalSavings: (rawMealPrice * totalMealsCount) - totalPrice,
        calories,
        protein,
        carbs,
        fats
      };
    });
  }, [dietBase, mealsPerDay, fitnessGoal]);

  const { currentIndex, next, prev, goTo } = useCarousel({ 
    total: computedPlans.length,
    autoplay: false 
  });

  if (loading) {
    return (
      <section className="py-16 px-4 max-w-7xl mx-auto text-center" id="plans">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto" />
        <p className="text-zinc-500 mt-4 font-bold uppercase tracking-widest text-xs">Loading meal plans...</p>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto scroll-mt-20" id="plans">
      
      {/* Title block */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100 mb-5"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> HEALTHY MEAL SUBSCRIPTION PLANS
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tight leading-tight max-w-4xl mx-auto"
        >
          Select Your Healthy Meal Plan
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 text-sm md:text-base max-w-2xl mx-auto mt-4 font-medium"
        >
          Choose a fresh meal subscription tailored to your nutrition goals. Freshly prepared, macro-calculated, and delivered to your doorstep.
        </motion.p>
      </div>

      {/* STYLISH STEP-BY-STEP FILTERS PANEL */}
      <div className="bg-white border border-zinc-200/90 rounded-[2.5rem] p-6 md:p-8 mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-zinc-150 relative z-10">
          
          {/* DIET BASE */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black font-mono">01</span>
              <h3 className="text-xs font-black tracking-widest text-zinc-700 flex items-center gap-2 uppercase">
                <Leaf className="w-4 h-4 text-emerald-600" /> Select Diet Base
              </h3>
            </div>
            <div className="flex gap-2.5">
              {DIET_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = dietBase === opt.id;
                
                // Dietary base color theme pairings
                let selectedClasses = "";
                if (opt.id === 'Veg') {
                  selectedClasses = isSelected 
                    ? "bg-emerald-50/85 border-emerald-500 text-emerald-800 shadow-[0_4px_12px_rgba(16,185,129,0.12)] ring-2 ring-emerald-500/10 scale-[1.02]" 
                    : "bg-zinc-50/50 border-zinc-200/80 text-zinc-600 hover:bg-white hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md hover:-translate-y-0.5";
                } else if (opt.id === 'Egg') {
                  selectedClasses = isSelected 
                    ? "bg-amber-50/85 border-amber-500 text-amber-900 shadow-[0_4px_12px_rgba(245,158,11,0.12)] ring-2 ring-amber-500/10 scale-[1.02]" 
                    : "bg-zinc-50/50 border-zinc-200/80 text-zinc-600 hover:bg-white hover:border-amber-300 hover:text-amber-700 hover:shadow-md hover:-translate-y-0.5";
                } else {
                  selectedClasses = isSelected 
                    ? "bg-rose-50/85 border-rose-500 text-rose-900 shadow-[0_4px_12px_rgba(244,63,94,0.12)] ring-2 ring-rose-500/10 scale-[1.02]" 
                    : "bg-zinc-50/50 border-zinc-200/80 text-zinc-600 hover:bg-white hover:border-rose-300 hover:text-rose-700 hover:shadow-md hover:-translate-y-0.5";
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => setDietBase(opt.id as any)}
                    className={cn(
                      "flex-1 py-4 px-2 rounded-2xl text-[11px] font-black transition-all duration-300 border flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer select-none",
                      selectedClasses
                    )}
                  >
                    <IconComp className={cn("w-4 h-4 shrink-0", isSelected ? (opt.id === 'Veg' ? "text-emerald-600" : opt.id === 'Egg' ? "text-amber-600" : "text-rose-600") : "text-zinc-400")} />
                    <span>{opt.label}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 animate-pulse hidden sm:inline-block" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MEALS PER DAY */}
          <div className="space-y-4 md:pl-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-black font-mono">02</span>
              <h3 className="text-xs font-black tracking-widest text-zinc-700 flex items-center gap-2 uppercase">
                <Calendar className="w-4 h-4 text-amber-500" /> Meals Per Day
              </h3>
            </div>
            <div className="flex gap-2.5">
              {MEALS_OPTIONS.map((opt) => {
                const isSelected = mealsPerDay === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setMealsPerDay(opt.id as any)}
                    className={cn(
                      "flex-1 py-3 px-2 rounded-2xl transition-all duration-300 border flex flex-col items-center justify-center cursor-pointer select-none",
                      isSelected
                        ? "bg-emerald-50/85 border-emerald-500 text-emerald-800 shadow-[0_4px_12px_rgba(16,185,129,0.12)] ring-2 ring-emerald-500/10 scale-[1.02]"
                        : "bg-zinc-50/50 border-zinc-200/80 text-zinc-600 hover:bg-white hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md hover:-translate-y-0.5"
                    )}
                  >
                    <span className="text-[11px] font-black flex items-center gap-1">
                      {opt.label}
                    </span>
                    <span className={cn(
                      "text-[8px] font-black mt-0.5 uppercase tracking-wider",
                      isSelected ? "text-emerald-600" : "text-zinc-400"
                    )}>
                      {opt.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FITNESS GOAL */}
          <div className="space-y-4 md:pl-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] font-black font-mono">03</span>
              <h3 className="text-xs font-black tracking-widest text-zinc-700 flex items-center gap-2 uppercase">
                <Zap className="w-4 h-4 text-indigo-500" /> Fitness Goal
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((opt) => {
                const isSelected = fitnessGoal === opt.id;
                const GoalIcon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFitnessGoal(opt.id as any)}
                    className={cn(
                      "py-2.5 px-3 rounded-2xl transition-all duration-300 border flex flex-col items-start justify-center text-left cursor-pointer select-none",
                      isSelected
                        ? "bg-emerald-50/85 border-emerald-500 text-emerald-800 shadow-[0_4px_12px_rgba(16,185,129,0.12)] ring-2 ring-emerald-500/10 scale-[1.02]"
                        : "bg-zinc-50/50 border-zinc-200/80 text-zinc-500 hover:bg-white hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md hover:-translate-y-0.5"
                    )}
                  >
                    <span className="text-[10px] font-black flex items-center gap-1 w-full justify-between">
                      <span className="flex items-center gap-1 truncate">
                        <GoalIcon className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-emerald-600" : "text-zinc-400")} />
                        {opt.label}
                      </span>
                    </span>
                    <span className={cn(
                      "text-[8px] font-black mt-0.5 uppercase tracking-wider",
                      isSelected ? "text-emerald-600" : "text-zinc-400"
                    )}>
                      {opt.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE VIEW MODE TOGGLE */}
      <div className="flex flex-col items-center justify-center mb-12">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-3 block">
          ⚡ Interactive Curation Engine
        </span>
        <div className="bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-[2rem] flex items-center gap-1 border border-zinc-200/60 dark:border-zinc-800/80 shadow-inner relative z-10">
          <button
            onClick={() => setViewMode('cards')}
            className={cn(
              "px-7 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 cursor-pointer select-none transform active:scale-95",
              viewMode === 'cards'
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10 scale-[1.02]"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            <LayoutGrid className="w-4 h-4" /> Standard Cards
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={cn(
              "px-7 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 cursor-pointer select-none transform active:scale-95",
              viewMode === 'compare'
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10 scale-[1.02]"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            <TrendingUp className="w-4 h-4" /> Plan Comparison Toggle
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 font-medium mt-3 text-center">
          {viewMode === 'cards' 
            ? "Showing standard tailored cards with detailed nutritional breakdowns" 
            : "Showing our interactive comparison matrix to see Trial, The Habit, and Lifestyle features side-by-side"}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'cards' ? (
          <div className="relative">
            {/* Desktop Grid View */}
            <motion.div
              key="cards-view-desktop"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
            >
              {computedPlans.map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  isSelected={selectedId === plan.id}
                  expandedNutrition={expandedNutrition}
                  expandedBenefits={expandedBenefits}
                  toggleNutrition={toggleNutrition}
                  toggleBenefits={toggleBenefits}
                  onSelect={onSelect}
                  onDirectPurchase={onDirectPurchase}
                  dietBase={dietBase}
                  mealsPerDay={mealsPerDay}
                />
              ))}
            </motion.div>

            {/* Mobile Carousel View */}
            <div className="md:hidden space-y-6">
              <div className="relative px-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PlanCard 
                      plan={computedPlans[currentIndex]} 
                      isSelected={selectedId === computedPlans[currentIndex].id}
                      expandedNutrition={expandedNutrition}
                      expandedBenefits={expandedBenefits}
                      toggleNutrition={toggleNutrition}
                      toggleBenefits={toggleBenefits}
                      onSelect={onSelect}
                      onDirectPurchase={onDirectPurchase}
                      dietBase={dietBase}
                      mealsPerDay={mealsPerDay}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Carousel Controls */}
                <div className="flex justify-between items-center mt-8 px-4">
                  <button 
                    onClick={prev}
                    className="p-3 rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-600 active:bg-zinc-50"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="flex gap-2">
                    {computedPlans.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          currentIndex === i ? "w-6 bg-emerald-600" : "bg-zinc-300"
                        )}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={next}
                    className="p-3 rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-600 active:bg-zinc-50"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            key="compare-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative z-10"
          >
            {/* INLINE SCROLLABLE MATRIX */}
            <div className="p-6 md:p-8 border-b border-zinc-150 flex justify-between items-center bg-zinc-50/50">
              <div>
                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Plan Comparison Table</h3>
                <p className="text-xs text-zinc-500 mt-1">Compare features, prices, and benefits side-by-side.</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                Interactive Curation
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/30">
                    <th className="py-5 px-6 font-black text-zinc-500 uppercase tracking-widest w-1/4">Plan Feature</th>
                    {computedPlans.map(p => (
                      <th key={p.id} className="py-5 px-6 font-black text-zinc-900 text-sm uppercase tracking-wider text-center w-1/4">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black tracking-tight">{p.name}</span>
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md mt-1">{p.badge}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-black text-zinc-700">Recommended For</td>
                    <td className="py-4.5 px-6 text-center text-zinc-600 font-medium">Beginners, short detox, testing taste discovery</td>
                    <td className="py-4.5 px-6 text-center text-zinc-600 font-medium">Consistent fat loss, active routines, habit loops</td>
                    <td className="py-4.5 px-6 text-center text-zinc-600 font-medium">Ultimate physical fitness, full systemic upgrade</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-black text-zinc-700">Program Duration</td>
                    {computedPlans.map(p => (
                      <td key={p.id} className="py-4.5 px-6 text-center font-bold text-zinc-800">{p.durationDays} Days (Mon-Fri)</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-black text-zinc-700">Calculated Meal Price</td>
                    {computedPlans.map(p => (
                      <td key={p.id} className="py-4.5 px-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-sm text-emerald-700">₹{p.pricePerMeal} / meal</span>
                          <span className="text-[9px] text-zinc-400 mt-0.5">standard ₹{p.originalPricePerMeal}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors bg-amber-50/10">
                    <td className="py-4.5 px-6 font-black text-zinc-700">Total Program Investment</td>
                    {computedPlans.map(p => (
                      <td key={p.id} className="py-4.5 px-6 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className="font-black text-zinc-950 text-sm">₹{p.totalPrice.toLocaleString()}</span>
                          <span className="text-[9px] text-zinc-500 mt-0.5">{p.totalMealsCount} meals total</span>
                          {p.totalSavings > 0 && (
                            <span className="text-[9px] font-black text-emerald-600 mt-1 bg-emerald-50 px-2 py-0.5 rounded">
                              Saved ₹{p.totalSavings.toLocaleString()}!
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-black text-zinc-700">Estimated Energy</td>
                    {computedPlans.map(p => (
                      <td key={p.id} className="py-4.5 px-6 text-center font-semibold text-zinc-850">{p.calories} kcal / day</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-black text-zinc-700">Protein Calibration</td>
                    {computedPlans.map(p => (
                      <td key={p.id} className="py-4.5 px-6 text-center font-semibold text-zinc-850">{p.protein}g / day</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-black text-zinc-700">Dietitian Consultant</td>
                    <td className="py-4.5 px-6 text-center text-zinc-400 font-medium">Digital self-serve tools</td>
                    <td className="py-4.5 px-6 text-center text-emerald-700 font-black">Weekly Progress Reviews</td>
                    <td className="py-4.5 px-6 text-center text-emerald-700 font-black">Unlimited Live Consultations</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-black text-zinc-700">Ingredient Quality Standard</td>
                    <td className="py-4.5 px-6 text-center text-zinc-650 font-medium">Premium local fresh sourcing</td>
                    <td className="py-4.5 px-6 text-center text-zinc-650 font-medium">Premium local fresh sourcing</td>
                    <td className="py-4.5 px-6 text-center text-amber-800 font-black">⭐ 100% Fresh certified farms</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-black text-zinc-700">Pause & Skip Schedulers</td>
                    <td className="py-4.5 px-6 text-center text-emerald-600 font-semibold">✔️ Unlimited (24h alert)</td>
                    <td className="py-4.5 px-6 text-center text-emerald-600 font-semibold">✔️ Unlimited (24h alert)</td>
                    <td className="py-4.5 px-6 text-center text-emerald-600 font-semibold">✔️ Unlimited (24h alert)</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-black text-zinc-700">Express Delivery Logistics</td>
                    <td className="py-4.5 px-6 text-center text-zinc-450 font-medium">Standard slot matching</td>
                    <td className="py-4.5 px-6 text-center text-zinc-800 font-bold">Standard slot priority</td>
                    <td className="py-4.5 px-6 text-center text-indigo-700 font-black">🚀 VIP Same-day matching</td>
                  </tr>
                  <tr className="bg-zinc-50/30">
                    <td className="py-6 px-6 font-black text-zinc-800">Action Selection</td>
                    {computedPlans.map(p => {
                      const isSelected = selectedId === p.id;
                      return (
                        <td key={p.id} className="py-6 px-6 text-center">
                          <button
                            onClick={() => onSelect(p.id)}
                            className={cn(
                              "w-full max-w-[200px] mx-auto py-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md",
                               isSelected
                                ? "bg-amber-400 border border-amber-500 text-zinc-950 font-black scale-[1.02]"
                                : p.id === 'plan_30'
                                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            )}
                          >
                            {isSelected ? (
                              <>
                                Selected <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </>
                            ) : (
                              <>
                                Choose {p.name} <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAMPLE DISHES SECTION */}
      <div className="mt-20 p-8 md:p-10 bg-zinc-950 text-white rounded-[2.5rem] border border-zinc-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 relative z-10">
          <div>
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.25em] mb-1.5">CRAFTED FRESH WEEKLY</p>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
              Sample Dishes Delivered for <span className="text-emerald-400">{dietBase === 'Veg' ? 'Veg' : dietBase === 'Egg' ? 'Egg' : 'Non-Veg'}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-black text-zinc-400 uppercase tracking-widest shrink-0">
            <RotateCw className="w-3.5 h-3.5 text-amber-500 animate-[spin_6s_linear_infinite]" /> Rotated Daily for Menu Zero Fatigue
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          {sampleDishes.map((dish, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-stretch bg-zinc-900/50 border border-zinc-900 rounded-3xl p-5 gap-5 hover:border-zinc-800 transition-all">
              <div className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden shrink-0 bg-zinc-800">
                <img 
                  referrerPolicy="no-referrer"
                  src={dish.image} 
                  alt={dish.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between py-1">
                <div>
                  <h4 className="text-lg font-black text-white leading-tight mb-2">{dish.name}</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-4">{dish.description}</p>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-850 px-3 py-1.5 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-wider inline-block w-fit">
                  {dish.stats}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPARISON MODAL */}
      <AnimatePresence>
        {showCompare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 text-white border border-zinc-850 rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              
              {/* Modal header */}
              <div className="p-6 border-b border-zinc-850 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Compare Subscriptions</h3>
                  <p className="text-xs text-zinc-400 mt-1">Select the duration protocol that best fits your wellness routine.</p>
                </div>
                <button
                  onClick={() => setShowCompare(false)}
                  className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Table wrapper */}
              <div className="overflow-auto p-6">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-850">
                      <th className="py-4 font-black text-zinc-400 uppercase tracking-widest w-1/4">Protocol Metric</th>
                      {computedPlans.map(p => (
                        <th key={p.id} className="py-4 font-black text-white text-sm uppercase tracking-wider text-center w-1/4">
                          {p.name} ({p.durationDays}d)
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    <tr>
                      <td className="py-4 font-black text-zinc-300">Base Meal Pricing</td>
                      {computedPlans.map(p => (
                        <td key={p.id} className="py-4 text-center font-bold text-emerald-400">₹ {p.pricePerMeal} / Meal</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 font-black text-zinc-300">Total Program Cost</td>
                      {computedPlans.map(p => (
                        <td key={p.id} className="py-4 text-center font-bold text-white">₹ {p.totalPrice.toLocaleString()} ({p.totalMealsCount} meals)</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 font-black text-zinc-300">Estimated Calorie Target</td>
                      {computedPlans.map(p => (
                        <td key={p.id} className="py-4 text-center text-zinc-300">{p.calories} kcal / day</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 font-black text-zinc-300">Estimated Protein Target</td>
                      {computedPlans.map(p => (
                        <td key={p.id} className="py-4 text-center text-zinc-300">{p.protein} grams / day</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 font-black text-zinc-300">Dietitian Consultant</td>
                      <td className="py-4 text-center text-zinc-500">❌ None</td>
                      <td className="py-4 text-center text-emerald-400">✔️ Weekly Progress Reviews</td>
                      <td className="py-4 text-center text-emerald-400">✔️ Unlimited Direct Chat</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-black text-zinc-300">Meal Sourcing Inputs</td>
                      <td className="py-4 text-center text-zinc-300">Premium Standard</td>
                      <td className="py-4 text-center text-zinc-300">Premium Standard</td>
                      <td className="py-4 text-center text-amber-400 font-bold">⭐ 100% Fresh Handpicked</td>
                    </tr>
                    <tr>
                      <td className="py-4 font-black text-zinc-300">Pause & Skip Policy</td>
                      {computedPlans.map(p => (
                        <td key={p.id} className="py-4 text-center text-emerald-400">✔️ Free (Skip 24h before)</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Modal footer */}
              <div className="p-6 border-t border-zinc-850 flex justify-end gap-3 bg-zinc-900/30">
                <button
                  onClick={() => setShowCompare(false)}
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Close Comparison
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
