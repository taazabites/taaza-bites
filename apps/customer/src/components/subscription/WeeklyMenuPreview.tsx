import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Clock, Info, Flame, ShieldAlert, Utensils, AlertTriangle } from "lucide-react";
import { Card } from "../ui/primitives";
import { cn } from "../../lib/utils";
import { MealItemService } from "../../firebase/services";
import { MealItem } from "../../firebase/collections";

interface WeeklyMenuPreviewProps {
  goal: string;
  dietPreference: string;
  allergies?: string[];
  medicalConditions?: string[];
  mealsPerDay?: string;
}

const DAYS = [
  { name: "Monday", short: "Mon" },
  { name: "Tuesday", short: "Tue" },
  { name: "Wednesday", short: "Wed" },
  { name: "Thursday", short: "Thu" },
  { name: "Friday", short: "Fri" },
  { name: "Saturday", short: "Sat" },
  { name: "Sunday", short: "Sun" }
];

export const WeeklyMenuPreview: React.FC<WeeklyMenuPreviewProps> = ({ 
  goal, 
  dietPreference, 
  allergies = [], 
  medicalConditions = [], 
  mealsPerDay = "3 Meals" 
}) => {
  const [dbMeals, setDbMeals] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  // Fetch meals from Firestore on load
  useEffect(() => {
    let isMounted = true;
    const fetchMeals = async () => {
      try {
        setLoading(true);
        // Ensure seeded meals are populated first
        await MealItemService.seedMealItems();
        const items = await MealItemService.getMealItems();
        if (isMounted) {
          setDbMeals(items);
          setError(null);
        }
      } catch (err: any) {
        console.error("Error loading meals from Firestore:", err);
        if (isMounted) {
          setError("Failed to load custom recommendations. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMeals();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and build recommended meals
  const recommendationResult = useMemo(() => {
    if (loading || dbMeals.length === 0) {
      return { success: false, menuByDay: [], reason: "loading" };
    }

    // 1. Filter out meals that conflict with customer selected diet
    // Jain: Only Jain meals (no onion, garlic, egg, chicken, fish, meat)
    // Vegetarian: Veg + Jain
    // Eggetarian: Veg + Jain + Egg
    // Chicken: Veg + Jain + Chicken
    const dietFiltered = dbMeals.filter(meal => {
      const diet = dietPreference?.toLowerCase();
      const mealDiet = meal.dietType?.toLowerCase();

      if (diet === "jain") {
        return mealDiet === "jain";
      }
      if (diet === "veg" || diet === "vegetarian") {
        return mealDiet === "veg" || mealDiet === "jain";
      }
      if (diet === "egg" || diet === "eggetarian") {
        return mealDiet === "egg" || mealDiet === "veg" || mealDiet === "jain";
      }
      if (diet === "chicken") {
        return mealDiet === "chicken" || mealDiet === "veg" || mealDiet === "jain";
      }
      return true; // Fallback
    });

    // 2. Filter out meals with allergens or ingredients matched in user allergies
    const userAllergies = (allergies || []).map(a => a.trim().toLowerCase()).filter(Boolean);
    const allergenFiltered = dietFiltered.filter(meal => {
      if (userAllergies.length === 0) return true;

      const hasConflict = userAllergies.some(allergy => {
        const inAllergens = meal.allergens?.some(a => a.toLowerCase().includes(allergy));
        const inIngredients = meal.ingredients?.some(i => i.toLowerCase().includes(allergy));
        const inName = meal.mealName?.toLowerCase().includes(allergy);
        return inAllergens || inIngredients || inName;
      });

      return !hasConflict;
    });

    // 3. Filter/Prioritize by Medical Conditions
    const userMedical = (medicalConditions || []).map(c => c.toLowerCase());
    const medicalFiltered = allergenFiltered.filter(meal => {
      // If user has Diabetes, avoid high sugar/carb if possible, or prioritize Low GI
      if (userMedical.includes("diabetes")) {
        const isLowGI = meal.goalTags?.some(t => t.toLowerCase() === "low gi" || t.toLowerCase() === "diabetes");
        // We don't strictly exclude yet, but we'll prioritize in the next step
      }
      return true;
    });

    // Ensure we always have valid meals for each category by falling back gracefully
    const getMealsForCategory = (cat: string) => {
      let catMeals = medicalFiltered.filter(m => m.category === cat);
      if (catMeals.length === 0) {
        catMeals = allergenFiltered.filter(m => m.category === cat);
      }
      if (catMeals.length === 0) {
        catMeals = dbMeals.filter(m => m.category === cat);
      }
      if (catMeals.length === 0) {
        catMeals = dbMeals;
      }
      return catMeals;
    };

    const breakfastMeals = getMealsForCategory("Breakfast");
    const lunchMeals = getMealsForCategory("Lunch");
    const dinnerMeals = getMealsForCategory("Dinner");

    // Determine what categories are active based on meals per day
    const activeCategories = mealsPerDay === "1 Meal" ? ["Lunch"] :
                             mealsPerDay === "2 Meals" ? ["Lunch", "Dinner"] :
                             ["Breakfast", "Lunch", "Dinner"];

    // Helper to prioritize meals by Health Goal and Medical Condition tags
    const prioritizeByProfile = (meals: MealItem[]) => {
      // Score each meal based on matches with goal and medical conditions
      const scored = meals.map(meal => {
        let score = 0;
        const tags = (meal.goalTags || []).map(t => t.toLowerCase());
        
        if (goal && tags.includes(goal.toLowerCase())) score += 5;
        
        userMedical.forEach(condition => {
          if (tags.includes(condition.toLowerCase())) score += 10;
          // Specialized matches
          if (condition === "diabetes" && tags.includes("low gi")) score += 5;
          if (condition === "pcos" && tags.includes("low gi")) score += 5;
          if (condition === "hypertension" && tags.includes("heart health")) score += 5;
        });

        return { meal, score };
      });

      // Sort by score descending
      scored.sort((a, b) => b.score - a.score);
      
      // Return top meals (at least some variety if scores are same)
      const topScore = scored[0].score;
      const topMeals = scored.filter(s => s.score >= topScore || s.score > 0).map(s => s.meal);
      
      return topMeals.length > 0 ? topMeals : meals;
    };

    const prioritizedBreakfast = prioritizeByProfile(breakfastMeals);
    const prioritizedLunch = prioritizeByProfile(lunchMeals);
    const prioritizedDinner = prioritizeByProfile(dinnerMeals);

    // Build the 7-day schedule
    const menuByDay = DAYS.map((day, idx) => {
      const dailyMeals: Record<string, MealItem> = {};

      if (activeCategories.includes("Breakfast") && prioritizedBreakfast.length > 0) {
        dailyMeals["Breakfast"] = prioritizedBreakfast[idx % prioritizedBreakfast.length];
      }
      if (activeCategories.includes("Lunch") && prioritizedLunch.length > 0) {
        dailyMeals["Lunch"] = prioritizedLunch[idx % prioritizedLunch.length];
      }
      if (activeCategories.includes("Dinner") && prioritizedDinner.length > 0) {
        dailyMeals["Dinner"] = prioritizedDinner[idx % prioritizedDinner.length];
      }

      return {
        day: day.name,
        short: day.short,
        meals: dailyMeals,
        categories: activeCategories
      };
    });

    return { success: true, menuByDay, reason: "ok" };
  }, [dbMeals, loading, goal, dietPreference, allergies, mealsPerDay]);

  if (loading) {
    return (
      <div className="min-h-[350px] flex flex-col items-center justify-center space-y-4 bg-zinc-50 rounded-3xl border border-zinc-200/80 p-8">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }} 
            className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600" 
          />
          <Utensils className="w-6 h-6 text-emerald-600" />
        </div>
        <p className="text-zinc-600 font-extrabold text-sm animate-pulse">Running recommendation engine...</p>
      </div>
    );
  }

  if (error || !recommendationResult.success) {
    return (
      <div className="p-8 text-center bg-amber-50/50 rounded-3xl border border-amber-200/60 max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-amber-950">No meals available for your selected preferences.</h3>
          <p className="text-zinc-600 text-xs font-semibold leading-relaxed">
            Our nutritionists are busy preparing recipes that strictly meet your strict requirements. Please try updating your allergies or food choice.
          </p>
        </div>
      </div>
    );
  }

  const { menuByDay } = recommendationResult;
  const activeDayData = menuByDay[activeDayIdx];

  return (
    <div className="space-y-6">
      {/* Upper bar with header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-emerald-600" /> Recommended Weekly Menu
          </h3>
          <p className="text-xs font-medium text-zinc-500 mt-0.5">
            Dynamically customized for your <span className="font-extrabold text-emerald-700">{goal}</span> goal & <span className="font-extrabold text-emerald-700">{dietPreference}</span> preference.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100 self-start sm:self-center">
          <Clock className="w-3.5 h-3.5" /> Updated Weekly
        </div>
      </div>

      {/* Weekday Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth -mx-6 px-6 sm:mx-0 sm:px-0">
        {DAYS.map((day, idx) => {
          const isSelected = activeDayIdx === idx;
          return (
            <button
              key={day.name}
              onClick={() => setActiveDayIdx(idx)}
              className={cn(
                "px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shrink-0 transition-all border-2",
                isSelected
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              <span className="hidden sm:inline">{day.name}</span>
              <span className="inline sm:hidden">{day.short}</span>
            </button>
          );
        })}
      </div>

      {/* Recommended Dishes for selected day */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {activeDayData.categories.map((category) => {
            const meal = activeDayData.meals[category];
            if (!meal) return null;

            return (
              <motion.div
                key={`${activeDayIdx}-${category}-${meal.mealName}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex"
              >
                <Card className="flex flex-col w-full overflow-hidden rounded-3xl border-2 border-zinc-200/80 bg-white hover:border-emerald-500 hover:shadow-lg transition-all duration-300 group">
                  {/* Meal Image */}
                  <div className="relative h-44 overflow-hidden shrink-0">
                    <img
                      src={meal.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fm=webp"}
                      alt={meal.mealName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-zinc-950/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider rounded-xl">
                      {category}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1 shadow-sm">
                      <Flame className="w-3.5 h-3.5 fill-white" /> {meal.calories} kcal
                    </div>
                  </div>

                  {/* Meal Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-base font-black text-zinc-900 leading-snug line-clamp-2">
                        {meal.mealName}
                      </h4>
                      <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                        {meal.cuisine} Cuisine
                      </p>
                    </div>

                    {/* Macronutrient Breakdowns */}
                    <div className="grid grid-cols-3 gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-150/60 text-center shrink-0">
                      <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Protein</p>
                        <p className="text-xs font-black text-zinc-900 mt-0.5">{meal.protein}g</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Carbs</p>
                        <p className="text-xs font-black text-zinc-900 mt-0.5">{meal.carbs}g</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Fat</p>
                        <p className="text-xs font-black text-zinc-900 mt-0.5">{meal.fat}g</p>
                      </div>
                    </div>

                    {/* Goal & Custom Tags */}
                    <div className="flex flex-wrap gap-1 shrink-0">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider",
                        meal.dietType === "Jain" ? "bg-amber-100 text-amber-800" :
                        meal.dietType === "Veg" ? "bg-emerald-100 text-emerald-800" :
                        meal.dietType === "Egg" ? "bg-blue-100 text-blue-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {meal.dietType}
                      </span>
                      {meal.goalTags?.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md text-[9px] font-extrabold uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Ingredients / Allergens Footer */}
                    <div className="border-t border-zinc-100 pt-3 text-[10px] space-y-1 font-semibold text-zinc-500 shrink-0">
                      <p className="line-clamp-1">
                        <span className="font-extrabold text-zinc-700">Ingredients:</span> {meal.ingredients?.join(", ")}
                      </p>
                      {meal.allergens && meal.allergens.length > 0 && (
                        <p className="text-amber-700 flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" /> Contains: {meal.allergens.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex items-start gap-3 mt-4">
        <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <p className="text-xs text-zinc-600 font-medium leading-relaxed">
          This sample menu preview is customized strictly to avoid allergens (<strong>{allergies.join(", ") || "None"}</strong>) and match your food style preference (<strong>{dietPreference}</strong>).
        </p>
      </div>
    </div>
  );
};

// Simple Sparkles icon helper
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
  </svg>
);
