import { Circle, Lightbulb, Utensils, CheckCircle, Flame, Apple, Activity, TrendingUp, Percent, Target, Ban, X, Plus, Award, Package, Sparkles, ShieldAlert } from 'lucide-react';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { SmartButton } from './SmartButton';
import { DailyVitalityTracker } from './DailyVitalityTracker';
import { MealFeedbackWidget } from './MealFeedbackWidget';
import { OrderFeedbackForm } from './OrderFeedbackForm';
import confetti from 'canvas-confetti';
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    PieChart, 
    Pie, 
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';

type MealType = 'breakfast' | 'lunch' | 'dinner';

interface MealInfo {
    id: string;
    name: string;
    type: MealType;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const INITIAL_PLAN: Record<string, Record<MealType, MealInfo>> = {
    'Mon': {
        breakfast: { id: 'm1', name: 'Oatmeal & Berries', type: 'breakfast', calories: 300, protein: 12, carbs: 48, fats: 6 },
        lunch: { id: 'm2', name: 'Grilled Chicken Salad', type: 'lunch', calories: 450, protein: 35, carbs: 15, fats: 27 },
        dinner: { id: 'm3', name: 'Quinoa Bowl', type: 'dinner', calories: 500, protein: 18, carbs: 68, fats: 17 },
    },
    'Tue': {
        breakfast: { id: 'm4', name: 'Avocado Toast & Egg', type: 'breakfast', calories: 350, protein: 15, carbs: 28, fats: 20 },
        lunch: { id: 'm5', name: 'Lentil Soup', type: 'lunch', calories: 400, protein: 22, carbs: 54, fats: 10 },
        dinner: { id: 'm6', name: 'Baked Salmon & Greens', type: 'dinner', calories: 550, protein: 40, carbs: 12, fats: 38 },
    },
    'Wed': {
        breakfast: { id: 'm7', name: 'Protein Smoothie', type: 'breakfast', calories: 250, protein: 25, carbs: 20, fats: 8 },
        lunch: { id: 'm8', name: 'Turkey Wrap', type: 'lunch', calories: 420, protein: 30, carbs: 38, fats: 16 },
        dinner: { id: 'm9', name: 'Tofu Stir Fry', type: 'dinner', calories: 400, protein: 20, carbs: 35, fats: 20 },
    },
    'Thu': {
        breakfast: { id: 'm10', name: 'Greek Yogurt Parfait', type: 'breakfast', calories: 280, protein: 18, carbs: 35, fats: 7 },
        lunch: { id: 'm11', name: 'Paneer Tikka Bowl', type: 'lunch', calories: 480, protein: 24, carbs: 32, fats: 28 },
        dinner: { id: 'm12', name: 'Lemon Herb Fish', type: 'dinner', calories: 450, protein: 38, carbs: 15, fats: 26 },
    },
    'Fri': {
        breakfast: { id: 'm13', name: 'Chia Seed Pudding', type: 'breakfast', calories: 320, protein: 14, carbs: 42, fats: 10 },
        lunch: { id: 'm14', name: 'Brown Rice & Beans', type: 'lunch', calories: 460, protein: 20, carbs: 70, fats: 10 },
        dinner: { id: 'm15', name: 'Roasted Chicken Root Veg', type: 'dinner', calories: 520, protein: 45, carbs: 35, fats: 22 },
    }
};

const SUBSTITUTIONS: MealInfo[] = [
    { id: 'sub1', name: 'Protein Pancakes', type: 'breakfast', calories: 400, protein: 30, carbs: 45, fats: 11 },
    { id: 'sub2', name: 'Scrambled Eggs & Spinach', type: 'breakfast', calories: 340, protein: 22, carbs: 10, fats: 24 },
    { id: 'sub3', name: 'Mediterranean Salad', type: 'lunch', calories: 380, protein: 16, carbs: 24, fats: 24 },
    { id: 'sub4', name: 'Beef Mince & Sweet Potato', type: 'lunch', calories: 520, protein: 38, carbs: 42, fats: 22 },
    { id: 'sub5', name: 'Shrimp Zucchini Pasta', type: 'dinner', calories: 410, protein: 32, carbs: 25, fats: 20 },
    { id: 'sub6', name: 'Veggie Curry & Millet', type: 'dinner', calories: 450, protein: 14, carbs: 65, fats: 15 },
];

const getCustomizedMeal = (meal: MealInfo, preferences: any): MealInfo & { isCustomized?: boolean; customizationReason?: string } => {
    if (!preferences) return meal;
    const dislikes = preferences.dislikes || [];
    const allergies = preferences.allergies || [];
    const allTags = [...dislikes, ...allergies];
    
    if (allTags.length === 0) return meal;

    let nameLower = meal.name.toLowerCase();
    let hasModifications = false;
    let modifiedFields: string[] = [];

    allTags.forEach(tag => {
        const tagLower = tag.toLowerCase().trim();
        if (tagLower.length === 0) return;
        
        // 1. Onion/Garlic
        if (tagLower.includes('onion') || tagLower.includes('garlic')) {
            const savoryMeals = [
                'salad', 'soup', 'salmon', 'wrap', 'stir fry', 
                'tikka', 'fish', 'rice', 'chicken', 'pasta', 'curry'
            ];
            if (savoryMeals.some(sm => nameLower.includes(sm))) {
                hasModifications = true;
                if (!modifiedFields.includes(tag)) {
                    modifiedFields.push(tag);
                }
            }
        }
        
        // 2. Nuts/Peanut
        if (tagLower.includes('nut') || tagLower.includes('peanut') || tagLower.includes('almond')) {
            const nutMeals = ['oatmeal', 'parfait', 'pancakes', 'pudding', 'smoothie'];
            if (nutMeals.some(nm => nameLower.includes(nm))) {
                hasModifications = true;
                if (!modifiedFields.includes(tag)) {
                    modifiedFields.push(tag);
                }
            }
        }

        // 3. Dairy/Lactose
        if (tagLower.includes('dairy') || tagLower.includes('lactose') || tagLower.includes('milk') || tagLower.includes('paneer')) {
            const dairyMeals = ['paneer', 'yogurt', 'parfait', 'smoothie', 'pancakes', 'pudding'];
            if (dairyMeals.some(dm => nameLower.includes(dm))) {
                hasModifications = true;
                if (!modifiedFields.includes(tag)) {
                    modifiedFields.push(tag);
                }
            }
        }

        // 4. Eggs
        if (tagLower.includes('egg')) {
            const eggMeals = ['egg', 'pancakes', 'scrambled'];
            if (eggMeals.some(em => nameLower.includes(em))) {
                hasModifications = true;
                if (!modifiedFields.includes(tag)) {
                    modifiedFields.push(tag);
                }
            }
        }

        // 5. General substring match
        if (tagLower.length > 2 && nameLower.includes(tagLower)) {
            hasModifications = true;
            if (!modifiedFields.includes(tag)) {
                modifiedFields.push(tag);
            }
        }
    });

    if (hasModifications) {
        const modsStr = modifiedFields.map(f => {
            const fLower = f.toLowerCase();
            if (fLower.includes('no ') || fLower.startsWith('without ')) return f;
            if (fLower.includes('allergy')) return `No ${fLower.replace('allergy', '').trim()}`;
            return `No ${f}`;
        }).join(', ');
        
        const formattedMods = modsStr.charAt(0).toUpperCase() + modsStr.slice(1);
        return {
            ...meal,
            name: `${meal.name} (${formattedMods})`,
            calories: Math.max(meal.calories - 30, 50),
            carbs: Math.max(meal.carbs - 5, 2),
            fats: Math.max(meal.fats - 3, 1),
            isCustomized: true,
            customizationReason: formattedMods
        };
    }

    return meal;
};

interface SubscriptionCalendarProps {
    plan: Record<string, Record<MealType, MealInfo>>;
    setPlan: React.Dispatch<React.SetStateAction<Record<string, Record<MealType, MealInfo>>>>;
    completedMeals: Record<string, Record<MealType, boolean>>;
    onToggleMeal: (day: string, slot: MealType) => void;
}

const SubscriptionCalendar: React.FC<SubscriptionCalendarProps> = ({ plan, setPlan, completedMeals, onToggleMeal }) => {
    const { user } = useAuth();
    const [draggedItem, setDraggedItem] = useState<{ origin: 'pool' | 'slot', id: string, day?: string, slot?: MealType, meal: MealInfo } | null>(null);
    const [hoveredSlot, setHoveredSlot] = useState<{day: string, slot: MealType} | null>(null);

    const handleDragStart = (e: React.DragEvent, origin: 'pool' | 'slot', meal: MealInfo, day?: string, slot?: MealType) => {
        // Required for Firefox
        e.dataTransfer.setData('text/plain', meal.id);
        e.dataTransfer.effectAllowed = 'move';
        
        // Timeout prevents dragged item styling from being applied to the drag ghost
        setTimeout(() => {
            setDraggedItem({ origin, id: meal.id, day, slot, meal });
        }, 0);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setHoveredSlot(null);
    };

    const handleDragOver = (e: React.DragEvent, day: string, slot: MealType) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (hoveredSlot?.day !== day || hoveredSlot?.slot !== slot) {
            setHoveredSlot({ day, slot });
        }
    };

    const handleDragLeave = (e: React.DragEvent, day: string, slot: MealType) => {
        e.preventDefault();
        // Only clear if we're leaving the same slot (prevents flickering)
        if (hoveredSlot?.day === day && hoveredSlot?.slot === slot) {
            setHoveredSlot(null);
        }
    };

    const handleDrop = (e: React.DragEvent, targetDay: string, targetSlot: MealType) => {
        e.preventDefault();
        setHoveredSlot(null);
        
        if (!draggedItem) return;

        if (draggedItem.meal.type !== targetSlot) {
             const toastEvent = new CustomEvent('taaza:toast', {
                detail: { message: `You can only slot a ${draggedItem.meal.type} into a ${targetSlot} slot.`, type: 'error' }
            });
            window.dispatchEvent(toastEvent);
            return;
        }

        const newPlan = { ...plan };
        const replacedMeal = newPlan[targetDay][targetSlot];
        
        if (draggedItem.origin === 'slot' && draggedItem.day && draggedItem.slot) {
            newPlan[draggedItem.day][draggedItem.slot] = replacedMeal;
            newPlan[targetDay][targetSlot] = draggedItem.meal;
        } else {
            newPlan[targetDay][targetSlot] = draggedItem.meal;
        }

        setPlan(newPlan);
        
        const toastEvent = new CustomEvent('taaza:toast', {
            detail: { message: 'Meal replaced successfully.', type: 'success' }
        });
        window.dispatchEvent(toastEvent);
    };

    return (
        <div className="bg-white p-4 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-zinc-100 shadow-sm mb-12 relative overflow-hidden group">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-zinc-50 pb-6 gap-4">
                <div>
                    <span className="text-[9px] font-black text-[#059669] uppercase tracking-[0.5em] block mb-2">DYNAMIC SUBSCRIPTION</span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold font-sans text-[#1A1A1A] uppercase">Meal Schedule</h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-2 max-w-md font-light leading-relaxed">Drag and drop meals from the substitution pool to customize your upcoming plan boundaries.</p>
                </div>
             </div>

             <div className="grid lg:grid-cols-4 gap-8">
                 {/* Calendar Grid */}
                 <div className="lg:col-span-3 space-y-4">
                     {WEEK_DAYS.map(day => (
                         <div key={day} className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-zinc-50/50 p-4 rounded-3xl border border-zinc-100">
                             <div className="md:w-16 flex-shrink-0 text-center md:text-left">
                                 <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest">{day}</h4>
                                  <div className="mt-1 flex flex-col items-center md:items-start gap-1">
                                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                          [completedMeals[day]?.breakfast, completedMeals[day]?.lunch, completedMeals[day]?.dinner].filter(Boolean).length === 3
                                              ? 'bg-[#059669]/10 text-[#059669]' 
                                              : 'bg-zinc-200/60 text-zinc-500'
                                      }`}>
                                          {[completedMeals[day]?.breakfast, completedMeals[day]?.lunch, completedMeals[day]?.dinner].filter(Boolean).length}/3 eaten
                                      </span>
                                      {[completedMeals[day]?.breakfast, completedMeals[day]?.lunch, completedMeals[day]?.dinner].filter(Boolean).length === 3 && (
                                          <span className="text-[8px] font-black tracking-wider text-[#059669] uppercase flex items-center gap-0.5 animate-pulse">
                                              🎯 target hit!
                                          </span>
                                      )}
                                  </div>
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-grow">
                                 {(['breakfast', 'lunch', 'dinner'] as MealType[]).map(slot => {
                                     const rawMeal = plan[day][slot];
                                     const meal = getCustomizedMeal(rawMeal, user?.preferences);
                                     const isHovered = hoveredSlot?.day === day && hoveredSlot?.slot === slot;
                                     const isDraggedSelf = draggedItem?.origin === 'slot' && draggedItem?.day === day && draggedItem?.slot === slot;
                                      const isCompleted = completedMeals[day]?.[slot] || false;
                                     
                                     return (
                                         <div 
                                             key={slot}
                                             onDragOver={(e) => handleDragOver(e, day, slot)}
                                             onDragLeave={(e) => handleDragLeave(e, day, slot)}
                                             onDrop={(e) => handleDrop(e, day, slot)}
                                             className={`relative border-2 border-dashed rounded-2xl p-3 transition-all duration-300 ${
                                                 isHovered 
                                                    ? 'border-[#059669] bg-[#059669]/5 scale-[1.02] shadow-sm z-10' 
                                                    : isDraggedSelf 
                                                        ? 'border-transparent opacity-30 shadow-inner'
                                                         : isCompleted
                                                             ? 'border-[#059669]/20 bg-[#059669]/5 hover:bg-[#059669]/10'
                                                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                                             }`}
                                         >
                                             <div 
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, 'slot', meal, day, slot)}
                                                onDragEnd={handleDragEnd}
                                                className="cursor-grab active:cursor-grabbing h-full"
                                                title="Drag to substitute or swap"
                                             >
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">{slot}</span>
                                                    <button 
                                                         onClick={(e) => {
                                                             e.stopPropagation();
                                                             onToggleMeal(day, slot);
                                                         }}
                                                         className="focus:outline-none transition-transform active:scale-90 cursor-pointer"
                                                         title={isCompleted ? "Mark as uneaten" : "Mark as eaten"}
                                                     >
                                                         {isCompleted ? (
                                                             <CheckCircle className="text-[#059669] w-4 h-4" />
                                                         ) : (
                                                             <Circle className="text-zinc-300 hover:text-[#059669] w-4 h-4 transition-colors"/>
                                                         )}
                                                     </button>
                                                </div>
                                                <p className={`text-xs font-bold text-[#1A1A1A] leading-tight mb-2 pr-2 transition-all duration-300 ${isCompleted ? 'line-through text-zinc-400 font-light' : ''}`}>{meal.name}</p>
                                                {(meal as any).isCustomized && (
                                                     <div className="inline-flex items-center gap-1 mb-2 px-1.5 py-0.5 bg-[#FF7A00]/10 text-[#FF7A00] text-[8px] font-black uppercase tracking-wider rounded">
                                                         🛡️ chef custom
                                                     </div>
                                                 )}
                                                {isCompleted && (
                                                     <span className="absolute bottom-1.5 right-2 text-[7px] font-black text-[#059669] uppercase tracking-wider bg-[#059669]/10 px-1 rounded">
                                                         eaten
                                                     </span>
                                                 )}
                                                <div className="flex flex-wrap gap-x-2 gap-y-1 text-[9px] font-mono font-bold text-zinc-500">
                                                    <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 opacity-60 text-orange-500"/> {meal.calories}</span>
                                                    <span className="flex items-center gap-0.5"><Apple className="w-3 h-3 opacity-60 text-green-600"/> P:{meal.protein}g</span>
                                                    <span className="flex items-center gap-0.5"><Activity className="w-3 h-3 opacity-60 text-amber-500"/> C:{meal.carbs}g</span>
                                                    <span className="flex items-center gap-0.5"><TrendingUp className="w-3 h-3 opacity-60 text-rose-500"/> F:{meal.fats}g</span>
                                                </div>
                                             </div>
                                         </div>
                                     );
                                 })}
                             </div>
                         </div>
                     ))}
                 </div>

                 {/* Substitution Pool */}
                 <div className="bg-zinc-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-100 flex flex-col max-h-[700px] overflow-hidden">
                     <div className="mb-6">
                         <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest pl-2">Available Swaps</h4>
                     </div>
                     <div className="flex-grow overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-4">
                         {SUBSTITUTIONS.map(rawMeal => {
                             const meal = getCustomizedMeal(rawMeal, user?.preferences);
                             return (
                             <div 
                                 key={meal.id}
                                 draggable
                                 onDragStart={(e) => handleDragStart(e, 'pool', meal)}
                                 onDragEnd={handleDragEnd}
                                 className="bg-white border border-zinc-100 rounded-2xl p-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md hover:border-[#059669]/30 transition-all group"
                                 title="Drag to schedule"
                             >
                                 <div className="flex justify-between items-start mb-1.5">
                                    <span className="text-[8px] font-black uppercase text-[#FF7A00] tracking-widest">{meal.type}</span>
                                    <Circle className="text-zinc-300 text-[10px] group-hover:text-[#059669]/50 transition-colors"/>
                                 </div>
                                 <p className="text-xs font-bold text-[#1A1A1A] leading-tight mb-2">{meal.name}</p>
                                 {(meal as any).isCustomized && (
                                     <div className="inline-flex items-center gap-1 mb-2 px-1.5 py-0.5 bg-[#FF7A00]/10 text-[#FF7A00] text-[8px] font-black uppercase tracking-wider rounded">
                                         🛡️ chef custom
                                     </div>
                                 )}
                                 <div className="flex flex-wrap gap-x-2 gap-y-1 text-[9px] font-mono font-bold text-zinc-500">
                                     <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 opacity-60 text-orange-500"/> {meal.calories}</span>
                                     <span className="flex items-center gap-0.5"><Apple className="w-3 h-3 opacity-60 text-green-600"/> P:{meal.protein}g</span>
                                     <span className="flex items-center gap-0.5"><Activity className="w-3 h-3 opacity-60 text-amber-500"/> C:{meal.carbs}g</span>
                                     <span className="flex items-center gap-0.5"><TrendingUp className="w-3 h-3 opacity-60 text-rose-500"/> F:{meal.fats}g</span>
                                 </div>
                             </div>
                             );
                         })}
                     </div>
                     <div className="pt-4 border-t border-zinc-200 text-[10px] text-zinc-400 font-light flex gap-2 w-full">
                        <Circle className="mt-0.5 shrink-0"/>
                        <span>Drag items to your calendar to swap meals within plan capacity.</span>
                     </div>
                 </div>
             </div>
        </div>
    );
};

const DASHBOARD_TIPS = [
    "Hydration is key! Drinking water before meals can aid digestion and prevent overeating.",
    "Protein at every meal helps maintain muscle mass and keeps you feeling full longer.",
    "Don't fear healthy fats! Avocados, MTCs, and olive oil are essential for brain health.",
    "Eating a rainbow of vegetables ensures you get a wide spectrum of vitamins and minerals.",
    "Chew your food thoroughly. Digestion begins in the mouth, promoting better nutrient absorption.",
    "Sleep is nutrition too. Lack of sleep can increase cravings for sugary, high-calorie foods.",
    "Fiber is your friend. It stabilizes blood sugar and supports a healthy gut microbiome.",
];

const DashboardNutritionTip: React.FC = () => {
    const [currentTip, setCurrentTip] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentTip((prev) => (prev + 1) % DASHBOARD_TIPS.length);
                setIsVisible(true);
            }, 500); // Wait for fade out
        }, 8000); // Change tip every 8 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#059669]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#059669]/10 transition-colors duration-1000"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#059669]/10 flex items-center justify-center text-[#059669] shrink-0">
                    <Lightbulb className="text-xl"/>
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xs font-bold text-[#059669] uppercase tracking-widest mb-2">Nutrition Tip of the Day</h3>
                    <div className="min-h-[3rem] flex items-center">
                        <p className={`text-[#1A1A1A] font-sans text-base sm:text-lg font-medium italic leading-relaxed transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                            &ldquo;{DASHBOARD_TIPS[currentTip]}&rdquo;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const totalCalories = data.calories || payload.reduce((acc: number, entry: any) => {
            const multiplier = entry.name === 'protein' || entry.name === 'carbs' ? 4 : 9;
            return acc + (entry.value * multiplier);
        }, 0);

        return (
            <div className="bg-[#1A1A1A] text-zinc-100 p-4 rounded-2xl shadow-2xl border border-zinc-800 text-xs font-sans space-y-3 min-w-[260px] max-w-[320px] backdrop-blur-md">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <p className="font-sans text-sm font-bold text-white">{label} Log</p>
                    <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                        {Math.round(totalCalories)} kcal
                    </span>
                </div>

                <div className="space-y-2">
                    {payload.map((entry: any) => {
                        const displayName = entry.name.charAt(0).toUpperCase() + entry.name.slice(1);
                        const kcal = entry.value * (entry.name === 'fats' ? 9 : 4);
                        const pct = totalCalories > 0 ? Math.round((kcal / totalCalories) * 100) : 0;
                        
                        let colorHex = '#059669';
                        let bgClass = 'bg-[#059669]';
                        let textClass = 'text-[#059669]';
                        if (entry.name === 'carbs') {
                            colorHex = '#FF7A00';
                            bgClass = 'bg-[#FF7A00]';
                            textClass = 'text-[#FF7A00]';
                        } else if (entry.name === 'fats') {
                            colorHex = '#EF4444';
                            bgClass = 'bg-[#EF4444]';
                            textClass = 'text-[#EF4444]';
                        }

                        return (
                            <div key={entry.name} className="space-y-1">
                                <div className="flex justify-between text-[11px] items-center">
                                    <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorHex }} />
                                        {displayName}
                                    </span>
                                    <span className="font-mono font-bold">
                                        <span className={textClass}>{entry.value}g</span>
                                        <span className="text-zinc-500 ml-1.5 text-[10px] font-normal">({pct}%)</span>
                                    </span>
                                </div>
                                <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${bgClass}`} style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {data.meals && data.meals.length > 0 && (
                    <div className="border-t border-zinc-800 pt-2 space-y-1.5">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-[#059669]" /> Completed Meals
                        </p>
                        <div className="space-y-1">
                            {data.meals.map((meal: any, idx: number) => {
                                if (!meal.name) return null;
                                return (
                                    <div key={idx} className="flex items-start gap-1.5 bg-zinc-900/40 p-1.5 rounded-lg border border-zinc-800/50">
                                        {meal.completed ? (
                                            <CheckCircle className="w-3.5 h-3.5 text-[#059669] mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <Circle className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" />
                                        )}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between gap-1 items-baseline">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase">{meal.type}</span>
                                                <span className={`text-[8px] px-1 rounded uppercase font-bold ${meal.completed ? 'bg-[#059669]/10 text-[#059669]' : 'bg-zinc-800 text-zinc-400'}`}>
                                                    {meal.completed ? 'eaten' : 'pending'}
                                                </span>
                                            </div>
                                            <p className={`text-[11px] font-medium leading-tight truncate ${meal.completed ? 'text-zinc-200' : 'text-zinc-400 line-through font-light'}`}>
                                                {meal.name}
                                            </p>
                                            {meal.protein !== undefined && (
                                                <p className="text-[9px] font-mono text-zinc-500 mt-0.5 font-bold">
                                                    P:{meal.protein}g • C:{meal.carbs}g • F:{meal.fats}g
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const RadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const current = data.Current;
        const target = data.Target;
        const percent = target > 0 ? Math.round((current / target) * 100) : 0;
        
        return (
            <div className="bg-[#1A1A1A] text-white p-4 rounded-2xl shadow-xl border border-zinc-800 text-xs font-sans space-y-2 min-w-[200px] backdrop-blur-md">
                <p className="font-bold text-sm border-b border-zinc-800 pb-1 mb-1">{data.subject}</p>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Current Average:</span>
                    <span className="font-bold text-white font-mono">{current}g</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Goal Target:</span>
                    <span className="font-bold text-[#FF7A00] font-mono">{target}g</span>
                </div>
                <div className="border-t border-zinc-800 pt-1.5 mt-1">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400">Target Progress:</span>
                        <span className="font-bold font-mono text-[#059669]">{percent}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${percent >= 100 ? 'bg-[#059669]' : 'bg-[#FF7A00]'}`} 
                            style={{ width: `${Math.min(percent, 100)}%` }} 
                        />
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const kcal = data.value;
        const color = data.color;
        const grams = data.grams;
        
        return (
            <div className="bg-[#1A1A1A] text-white p-4 rounded-2xl shadow-xl border border-zinc-800 text-xs font-sans space-y-2 min-w-[180px] backdrop-blur-md">
                <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-bold text-sm">{data.name} Breakdown</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Total Weight:</span>
                    <span className="font-bold font-mono" style={{ color }}>{grams}g</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Caloric Value:</span>
                    <span className="font-bold font-mono text-zinc-100">{Math.round(kcal)} kcal</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono italic">
                    {data.name === 'Protein' ? '4 kcal per gram' : data.name === 'Carbs' ? '4 kcal per gram' : '9 kcal per gram'}
                </div>
            </div>
        );
    }
    return null;
};

interface MacroAnalyticsProps {
    plan: Record<string, Record<MealType, MealInfo>>;
    userOrders: { id: string; date: string; status: string; items: string[]; total: number }[];
    goal: string;
    completedMeals: Record<string, Record<MealType, boolean>>;
    preferences?: any;
}

const MacroAnalytics: React.FC<MacroAnalyticsProps> = ({ plan, userOrders, goal, completedMeals, preferences }) => {
    const [selectedView, setSelectedView] = useState<string>('active');
    const [chartType, setChartType] = useState<'bar' | 'radar'>('bar');
    const [macroMode, setMacroMode] = useState<'scheduled' | 'consumed'>('scheduled');

    // Dynamic macro calculation based on selected subscription view
    const macroData = useMemo(() => {
        if (selectedView === 'active') {
            return WEEK_DAYS.map(day => {
                const meals = plan[day];
                const completed = completedMeals[day] || { breakfast: false, lunch: false, dinner: false };
                
                const protein = 
                    (completed.breakfast ? (meals.breakfast?.protein || 0) : 0) + 
                    (completed.lunch ? (meals.lunch?.protein || 0) : 0) + 
                    (completed.dinner ? (meals.dinner?.protein || 0) : 0);
                    
                const carbs = 
                    (completed.breakfast ? (meals.breakfast?.carbs || 0) : 0) + 
                    (completed.lunch ? (meals.lunch?.carbs || 0) : 0) + 
                    (completed.dinner ? (meals.dinner?.carbs || 0) : 0);
                    
                const fats = 
                    (completed.breakfast ? (meals.breakfast?.fats || 0) : 0) + 
                    (completed.lunch ? (meals.lunch?.fats || 0) : 0) + 
                    (completed.dinner ? (meals.dinner?.fats || 0) : 0);
                    
                const calories = 
                    (completed.breakfast ? (meals.breakfast?.calories || 0) : 0) + 
                    (completed.lunch ? (meals.lunch?.calories || 0) : 0) + 
                    (completed.dinner ? (meals.dinner?.calories || 0) : 0);
                    
                return {
                    day,
                    protein,
                    carbs,
                    fats,
                    calories,
                    meals: [
                        { type: 'Breakfast', name: meals.breakfast?.name, completed: completed.breakfast, protein: meals.breakfast?.protein, carbs: meals.breakfast?.carbs, fats: meals.breakfast?.fats },
                        { type: 'Lunch', name: meals.lunch?.name, completed: completed.lunch, protein: meals.lunch?.protein, carbs: meals.lunch?.carbs, fats: meals.lunch?.fats },
                        { type: 'Dinner', name: meals.dinner?.name, completed: completed.dinner, protein: meals.dinner?.protein, carbs: meals.dinner?.carbs, fats: meals.dinner?.fats },
                    ]
                };
            });
        } else if (selectedView === 'ORD_9210') {
            // High Protein completed subscription
            return [
                { day: 'Mon', protein: 45, carbs: 40, fats: 15, calories: 1200 },
                { day: 'Tue', protein: 48, carbs: 42, fats: 16, calories: 1250 },
                { day: 'Wed', protein: 42, carbs: 38, fats: 14, calories: 1180 },
                { day: 'Thu', protein: 46, carbs: 45, fats: 18, calories: 1220 },
                { day: 'Fri', protein: 44, carbs: 41, fats: 15, calories: 1210 }
            ];
        } else {
            // ORD_9455: Balanced vegetarian meal completed subscription
            return [
                { day: 'Mon', protein: 28, carbs: 55, fats: 12, calories: 1100 },
                { day: 'Tue', protein: 26, carbs: 58, fats: 14, calories: 1080 },
                { day: 'Wed', protein: 30, carbs: 52, fats: 11, calories: 1050 },
                { day: 'Thu', protein: 27, carbs: 56, fats: 13, calories: 1120 },
                { day: 'Fri', protein: 29, carbs: 54, fats: 12, calories: 1090 }
            ];
        }
    }, [selectedView, plan, completedMeals]);

    // Aggregate values
    const totals = useMemo(() => {
        const totalProtein = (macroData as any[]).reduce((acc: number, curr: any) => acc + (curr.protein || 0), 0);
        const totalCarbs = (macroData as any[]).reduce((acc: number, curr: any) => acc + (curr.carbs || 0), 0);
        const totalFats = (macroData as any[]).reduce((acc: number, curr: any) => acc + (curr.fats || 0), 0);
        const totalCalories = (macroData as any[]).reduce((acc: number, curr: any) => acc + (curr.calories || 0), 0);
        
        const proteinCal = totalProtein * 4;
        const carbsCal = totalCarbs * 4;
        const fatsCal = totalFats * 9;
        const totalCalFromMacros = proteinCal + carbsCal + fatsCal;

        return {
            protein: totalProtein,
            carbs: totalCarbs,
            fats: totalFats,
            calories: totalCalories,
            proteinCal,
            carbsCal,
            fatsCal,
            totalCalFromMacros
        };
    }, [macroData]);

    const targets = useMemo(() => {
        if (goal === 'weight-loss') {
            return { protein: 180, carbs: 120, fats: 50 };
        } else if (goal === 'hypertrophy') {
            return { protein: 200, carbs: 250, fats: 70 };
        } else {
            return { protein: 150, carbs: 200, fats: 65 };
        }
    }, [goal]);

    const radarData = useMemo(() => {
        const avgProtein = totals.protein / 5;
        const avgCarbs = totals.carbs / 5;
        const avgFats = totals.fats / 5;
        return [
            {
                subject: 'Protein (g)',
                Current: Math.round(avgProtein),
                Target: targets.protein,
            },
            {
                subject: 'Carbs (g)',
                Current: Math.round(avgCarbs),
                Target: targets.carbs,
            },
            {
                subject: 'Fats (g)',
                Current: Math.round(avgFats),
                Target: targets.fats,
            }
        ];
    }, [totals, targets]);

    // Total macros for the scheduled subscription plan (100% capacity)
    const scheduledTotals = useMemo(() => {
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        let totalCalories = 0;

        WEEK_DAYS.forEach(day => {
            const dayPlan = plan[day];
            if (dayPlan) {
                (['breakfast', 'lunch', 'dinner'] as MealType[]).forEach(slot => {
                    const meal = dayPlan[slot];
                    if (meal) {
                        const customized = getCustomizedMeal(meal, preferences);
                        totalProtein += customized.protein || 0;
                        totalCarbs += customized.carbs || 0;
                        totalFats += customized.fats || 0;
                        totalCalories += customized.calories || 0;
                    }
                });
            }
        });

        const proteinCal = totalProtein * 4;
        const carbsCal = totalCarbs * 4;
        const fatsCal = totalFats * 9;
        const totalCalFromMacros = proteinCal + carbsCal + fatsCal;

        return {
            protein: totalProtein,
            carbs: totalCarbs,
            fats: totalFats,
            calories: totalCalories,
            proteinCal,
            carbsCal,
            fatsCal,
            totalCalFromMacros
        };
    }, [plan, preferences]);

    const activeTotals = useMemo(() => {
        if (selectedView !== 'active') {
            return totals;
        }
        return macroMode === 'scheduled' ? scheduledTotals : totals;
    }, [selectedView, macroMode, scheduledTotals, totals]);

    const pieData = useMemo(() => {
        const { proteinCal, carbsCal, fatsCal, totalCalFromMacros } = activeTotals;
        if (totalCalFromMacros === 0) return [];
        return [
            { name: 'Protein', value: proteinCal, color: '#059669', grams: activeTotals.protein },
            { name: 'Carbs', value: carbsCal, color: '#FF7A00', grams: activeTotals.carbs },
            { name: 'Fats', value: fatsCal, color: '#EF4444', grams: activeTotals.fats }
        ];
    }, [activeTotals]);

    // Dynamic health insights based on selected goal and selected view
    const goalInsight = useMemo(() => {
        const avgProtein = totals.protein / 5;
        const avgCarbs = totals.carbs / 5;
        const avgCalories = totals.calories / 5;

        if (goal === 'weight-loss') {
            return {
                title: "Weight Loss Performance",
                description: `Average daily intake is ${Math.round(avgCalories)} kcal. Low-glycemic carbs and moderate healthy fats are aligned. Keeping carbs under ${Math.round(avgCarbs + 10)}g supports sustained fat-burning ketosis and calorie deficit.`,
                status: "Optimal Deficit Achieved"
            };
        } else if (goal === 'hypertrophy') {
            return {
                title: "Muscle Gain Performance",
                description: `Average daily protein is ${Math.round(avgProtein)}g (${Math.round((totals.proteinCal / totals.totalCalFromMacros) * 100)}% of total energy). This is highly anabolic and perfectly optimized to support lean muscle hypertrophy.`,
                status: "Anabolic Target Reached"
            };
        } else {
            return {
                title: "Maintenance Performance",
                description: `Average daily intake is ${Math.round(avgCalories)} kcal with a highly balanced macro ratio of ${Math.round((totals.carbsCal / totals.totalCalFromMacros) * 100)}% carbs, ${Math.round((totals.proteinCal / totals.totalCalFromMacros) * 100)}% protein, and ${Math.round((totals.fatsCal / totals.totalCalFromMacros) * 100)}% fats for steady energy levels.`,
                status: "Metabolic Homeostasis Active"
            };
        }
    }, [goal, totals]);

    return (
        <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-zinc-100 shadow-sm mb-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#059669]/5 rounded-bl-[100px] pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-zinc-50 pb-6 gap-4">
                <div>
                    <span className="text-[9px] font-black text-[#FF7A00] uppercase tracking-[0.5em] block mb-2">MACRONUTRIENT ANALYTICS</span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold font-sans text-[#1A1A1A] uppercase">Intake Visualization</h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-2 max-w-md font-light leading-relaxed">
                        Visualize daily intake of protein, carbs, and fats mapped dynamically from your meal plan subscriptions.
                    </p>
                </div>
                
                {/* Selector */}
                <div className="flex gap-2 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100 self-stretch sm:self-auto overflow-x-auto">
                    <button
                        onClick={() => setSelectedView('active')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${selectedView === 'active' ? 'bg-[#1A1A1A] text-white shadow-md' : 'text-zinc-400 hover:text-zinc-800'}`}
                    >
                        Active Plan
                    </button>
                    {userOrders.map(order => (
                        <button
                            key={order.id}
                            onClick={() => setSelectedView(order.id)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${selectedView === order.id ? 'bg-[#1A1A1A] text-white shadow-md' : 'text-zinc-400 hover:text-zinc-800'}`}
                        >
                            {order.id}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                {/* Stacked Bar or Radar Chart */}
                <div className="lg:col-span-8 bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100 flex flex-col justify-between min-h-[360px]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Macro Visualization</span>
                            <h4 className="text-sm font-bold text-zinc-800 mt-0.5">
                                {chartType === 'bar' ? 'Daily Stacked Breakdown' : 'Daily Average vs Goal Target'}
                            </h4>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* Chart Toggle */}
                            <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                                <button
                                    onClick={() => setChartType('bar')}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${chartType === 'bar' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                                >
                                    Daily Bar
                                </button>
                                <button
                                    onClick={() => setChartType('radar')}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${chartType === 'radar' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                                >
                                    Target Radar
                                </button>
                            </div>

                            {chartType === 'bar' && (
                                <div className="flex gap-3 text-[10px] font-bold">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> Protein</span>
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" /> Carbs</span>
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Fats</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full h-64 flex items-center justify-center">
                        {chartType === 'bar' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={macroData}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#71717A', fontSize: 11, fontWeight: 'bold' }} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#71717A', fontSize: 10 }} 
                                        unit="g"
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
                                    <Bar dataKey="protein" name="protein" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} barSize={36} />
                                    <Bar dataKey="carbs" name="carbs" stackId="a" fill="#FF7A00" />
                                    <Bar dataKey="fats" name="fats" stackId="a" fill="#EF4444" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#E5E7EB" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#52525B', fontSize: 11, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#A1A1AA', fontSize: 9 }} />
                                    <Radar name="Current Average" dataKey="Current" stroke="#059669" fill="#059669" fillOpacity={0.3} />
                                    <Radar name="Goal Target" dataKey="Target" stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.05} strokeDasharray="4 4" />
                                    <Tooltip content={<RadarTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', fill: '#52525B' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-100 text-[10px] text-zinc-400">
                        <span className="flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-[#059669] animate-pulse" /> 
                            {chartType === 'bar' 
                                ? 'Live calculated from completed subscription meals' 
                                : `Target macros optimized for ${goal.replace('-', ' ')} goal`}
                        </span>
                        <span className="font-mono">Total Weekly energy: ~{Math.round(totals.calories)} kcal</span>
                    </div>
                </div>

                {/* Donut Chart and Key Metrics */}
                <div className="lg:col-span-4 bg-zinc-50 p-6 rounded-3xl border border-zinc-100 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Caloric Contribution</span>
                            
                            {/* Toggle Mode (Only show for active plan view) */}
                            {selectedView === 'active' && (
                                <div className="flex bg-zinc-200/50 p-0.5 rounded-lg border border-zinc-200/40">
                                    <button
                                        onClick={() => setMacroMode('scheduled')}
                                        className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${macroMode === 'scheduled' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    >
                                        Plan
                                    </button>
                                    <button
                                        onClick={() => setMacroMode('consumed')}
                                        className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${macroMode === 'consumed' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    >
                                        Eaten
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-center items-center relative h-44">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={70}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center p-4 border border-dashed border-zinc-200 rounded-2xl w-full h-full flex flex-col items-center justify-center bg-white/50">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">No Food Eaten</span>
                                    <p className="text-zinc-400 text-[10px] mt-1 leading-relaxed max-w-[150px]">Mark meals completed in calendar above!</p>
                                </div>
                            )}
                            {pieData.length > 0 && (
                                <div className="absolute text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                                        {selectedView !== 'active' ? 'Weekly Energy' : macroMode === 'scheduled' ? 'Plan Energy' : 'Eaten Energy'}
                                    </span>
                                    <span className="text-xl font-bold font-mono text-[#1A1A1A]">~{Math.round(activeTotals.calories)}</span>
                                    <span className="text-[9px] font-black text-zinc-400 uppercase block">kcal</span>
                                </div>
                            )}
                        </div>

                        {/* List */}
                        <div className="space-y-3 mt-4">
                            {pieData.length > 0 ? (
                                pieData.map((entry, index) => {
                                    const kcal = entry.value;
                                    const pct = activeTotals.totalCalFromMacros > 0 ? Math.round((kcal / activeTotals.totalCalFromMacros) * 100) : 0;
                                    const scheduledForMacro = entry.name === 'Protein' ? scheduledTotals.protein : entry.name === 'Carbs' ? scheduledTotals.carbs : scheduledTotals.fats;
                                    return (
                                        <div key={index} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                <span className="font-bold text-zinc-800">{entry.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-mono font-bold text-[#1A1A1A]">
                                                    {selectedView !== 'active' || macroMode === 'scheduled' ? (
                                                        `${entry.grams}g`
                                                    ) : (
                                                        `${entry.grams}g / ${scheduledForMacro}g`
                                                    )}
                                                </span>
                                                <span className="text-zinc-400 font-light ml-1.5 text-[10px]">({pct}%)</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="space-y-2.5">
                                    {['Protein', 'Carbs', 'Fats'].map((macro, idx) => {
                                        const color = macro === 'Protein' ? '#059669' : macro === 'Carbs' ? '#FF7A00' : '#EF4444';
                                        const targetVal = macro === 'Protein' ? scheduledTotals.protein : macro === 'Carbs' ? scheduledTotals.carbs : scheduledTotals.fats;
                                        return (
                                            <div key={idx} className="flex justify-between items-center text-xs opacity-50">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                                    <span className="font-bold text-zinc-800">{macro}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-mono font-bold text-[#1A1A1A]">0g / {targetVal}g</span>
                                                    <span className="text-zinc-400 font-light ml-1.5 text-[10px]">(0%)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Insights panel */}
                    <div className="mt-6 pt-6 border-t border-zinc-200">
                        <div className="bg-[#1A1A1A] text-white p-4 rounded-2xl flex flex-col gap-1 text-[11px] font-light">
                            <span className="text-[8px] font-black tracking-widest text-[#FF7A00] uppercase">{goalInsight.status}</span>
                            <span className="font-bold text-xs text-white">{goalInsight.title}</span>
                            <p className="text-zinc-300 leading-relaxed mt-1 font-light">{goalInsight.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const UserDashboard: React.FC = () => {
    const { user, logout, updatePreferences } = useAuth();
    const [plan, setPlan] = useState(INITIAL_PLAN);
    const [activeFeedbackOrderId, setActiveFeedbackOrderId] = useState<string | null>(null);
    const [submittedFeedbackOrderIds, setSubmittedFeedbackOrderIds] = useState<string[]>([]);

    useEffect(() => {
        try {
            const localFeedbacks = JSON.parse(localStorage.getItem('mock_order_feedback') || '[]');
            const ids = localFeedbacks.map((fb: any) => fb.orderId);
            setSubmittedFeedbackOrderIds(ids);
        } catch (e) {
            console.warn("Storage reading error:", e);
        }
    }, [activeFeedbackOrderId]);

    const [completedMeals, setCompletedMeals] = useState<Record<string, Record<MealType, boolean>>>(() => {
        try {
            const saved = localStorage.getItem('completedMeals');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn("Storage access denied:", e);
        }
        return {
            'Mon': { breakfast: true, lunch: true, dinner: false },
            'Tue': { breakfast: false, lunch: false, dinner: false },
            'Wed': { breakfast: false, lunch: false, dinner: false },
            'Thu': { breakfast: false, lunch: false, dinner: false },
            'Fri': { breakfast: false, lunch: false, dinner: false }
        };
    });

    const triggerSuccessConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#059669', '#FF7A00', '#EF4444', '#10B981', '#FBBF24']
        })?.catch(err => console.warn("Confetti failed", err));
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#059669', '#FF7A00']
            })?.catch(err => console.warn("Confetti failed", err));
        }, 200);
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#059669', '#FF7A00']
            })?.catch(err => console.warn("Confetti failed", err));
        }, 400);
    };

    const handleToggleMeal = (day: string, slot: MealType) => {
        setCompletedMeals(prev => {
            const dayMeals = prev[day] || { breakfast: false, lunch: false, dinner: false };
            const newValue = !dayMeals[slot];
            const updated = {
                ...prev,
                [day]: {
                    ...dayMeals,
                    [slot]: newValue
                }
            };
            try {
                localStorage.setItem('completedMeals', JSON.stringify(updated));
            } catch (e) {
                console.warn("Storage access denied:", e);
            }
            const newDayMeals = updated[day];
            if (newDayMeals.breakfast && newDayMeals.lunch && newDayMeals.dinner && newValue) {
                triggerSuccessConfetti();
            }
            return updated;
        });
    };

    if (!user) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DEPLOYED': return 'text-[#FF7A00] bg-[#FFF0E5]';
            case 'IN_TRANSIT': return 'text-cyan-500 bg-cyan-50';
            default: return 'text-zinc-400 bg-zinc-50';
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };
    const greeting = getGreeting();

    return (
        <section className="py-32 sm:py-48 bg-[#F5F2ED] min-h-screen">
            <div className="container mx-auto px-6 max-w-6xl">
                
                {/* Reference matched Hero Banner */}
                <div className="mb-12 bg-[#059669] p-8 sm:p-14 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl border border-[#047857] animate-fade-in">
                    {/* Abstract curves for design authenticity */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <span className="text-[10px] sm:text-xs font-extrabold text-emerald-200/80 uppercase tracking-[0.4em] block mb-2 font-sans">
                            SECTION LABEL
                        </span>
                        <div className="text-3xl sm:text-5xl font-script text-[#FF7A00] leading-none mb-3 normal-case select-none">
                            plans and pricing
                        </div>
                        <h2 className="text-4xl sm:text-7xl font-sans font-black text-white tracking-tighter leading-none mb-3 uppercase">
                            {greeting},
                        </h2>
                        <p className="text-emerald-100 font-sans text-sm sm:text-lg font-light">
                            Here's your meal plan.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    
                    {/* User Profile */}
                    <div className="lg:col-span-4 space-y-8 animate-on-scroll">
                        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A00]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                            
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-[2rem] bg-[#222222] flex items-center justify-center text-white text-3xl mb-8 border-[6px] border-white shadow-2xl">
                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="text-[8px] font-mono font-black text-zinc-300 uppercase tracking-[0.5em] mb-2">ACTIVE USER</span>
                                <h2 className="text-3xl font-extrabold font-sans text-[#1A1A1A] mb-2 uppercase">{user.displayName || 'User'}</h2>
                                <p className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest">{user.uid}</p>
                            </div>

                            <div className="mt-12 pt-8 border-t border-zinc-50 space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Account Status</span>
                                    <span className="text-[#FF7A00] font-mono text-xs font-bold">ACTIVE</span>
                                </div>
                                <SmartButton 
                                    label="Log Out" 
                                    variant="danger" 
                                    onClick={logout} 
                                    className="w-full !h-14 !min-h-0 !text-[8px]"
                                />
                            </div>
                        </div>

                        {/* Dietary Preferences */}
                        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-lg space-y-10">
                            <div>
                                <h3 className="text-lg font-extrabold font-sans text-[#1A1A1A] mb-6 border-b border-zinc-50 pb-4 flex items-center gap-4 uppercase">
                                    <Utensils className="text-[#FF7A00]"/> Diet Type
                                </h3>
                                <div className="space-y-3">
                                    {(['veg', 'nonVeg'] as const).map(diet => (
                                        <button 
                                            key={diet}
                                            onClick={() => updatePreferences({...user.preferences, diet})}
                                            className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${user.preferences.diet === diet ? 'bg-[#1A1A1A] text-white border-zinc-950 shadow-xl' : 'bg-zinc-50 text-zinc-400 border-transparent hover:border-zinc-200'}`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">{diet === 'veg' ? 'VEGETARIAN' : 'NON-VEGETARIAN'}</span>
                                            {user.preferences.diet === diet && <CheckCircle className="text-[#FF7A00]"/>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-extrabold font-sans text-[#1A1A1A] mb-6 border-b border-zinc-50 pb-4 flex items-center gap-4 uppercase">
                                    <Target className="text-[#FF7A00]"/> Health Goal
                                </h3>
                                <div className="space-y-3">
                                    {([
                                        { id: 'weight-loss', label: 'WEIGHT LOSS' },
                                        { id: 'hypertrophy', label: 'MUSCLE GAIN' },
                                        { id: 'maintenance', label: 'MAINTENANCE' }
                                    ] as const).map(goal => (
                                        <button 
                                            key={goal.id}
                                            onClick={() => updatePreferences({...user.preferences, goal: goal.id})}
                                            className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${user.preferences.goal === goal.id ? 'bg-[#1A1A1A] text-white border-zinc-950 shadow-xl' : 'bg-zinc-50 text-zinc-400 border-transparent hover:border-zinc-200'}`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">{goal.label}</span>
                                            {user.preferences.goal === goal.id && <CheckCircle className="text-[#FF7A00]"/>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-extrabold font-sans text-[#1A1A1A] mb-6 border-b border-zinc-50 pb-4 flex items-center gap-4 uppercase">
                                    <Ban className="text-[#FF7A00]"/> Dislikes
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {user.preferences.dislikes.map(dislike => (
                                            <span 
                                                key={dislike} 
                                                className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 group"
                                            >
                                                {dislike}
                                                <button 
                                                    onClick={() => updatePreferences({
                                                        ...user.preferences, 
                                                        dislikes: user.preferences.dislikes.filter(d => d !== dislike)
                                                    })}
                                                    className="hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        {user.preferences.dislikes.length === 0 && (
                                            <p className="text-zinc-400 text-[10px] italic">No dislikes added yet.</p>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Add dislike (e.g. Mushrooms)"
                                            className="w-full bg-zinc-50 border-transparent focus:bg-white focus:border-[#FF7A00] rounded-2xl p-4 text-xs outline-none transition-all pr-12"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = e.currentTarget.value.trim();
                                                    if (val && !user.preferences.dislikes.includes(val)) {
                                                        updatePreferences({
                                                            ...user.preferences,
                                                            dislikes: [...user.preferences.dislikes, val]
                                                        });
                                                        e.currentTarget.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300">
                                            <Plus className="w-4 h-4 text-zinc-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-extrabold font-sans text-[#1A1A1A] mb-6 border-b border-zinc-50 pb-4 flex items-center gap-4 uppercase">
                                    <ShieldAlert className="text-[#EF4444] w-5 h-5"/> Allergies & Food Preferences
                                </h3>
                                <p className="text-zinc-500 text-[11px] mb-4 font-light leading-relaxed">Meals containing these allergens or restrictions will be custom-crafted by our culinary team on your upcoming plan schedule.</p>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {(user.preferences.allergies || []).map(allergy => (
                                            <span 
                                                key={allergy} 
                                                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 group border border-red-100"
                                            >
                                                🛡️ {allergy}
                                                <button 
                                                    onClick={() => updatePreferences({
                                                        ...user.preferences, 
                                                        allergies: (user.preferences.allergies || []).filter(a => a !== allergy)
                                                    })}
                                                    className="hover:text-red-900 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        {(!user.preferences.allergies || user.preferences.allergies.length === 0) && (
                                            <p className="text-zinc-400 text-[10px] italic">No allergies declared.</p>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Add allergy/dislike (e.g. Nut allergy, Onion, Dairy)"
                                            className="w-full bg-zinc-50 border-transparent focus:bg-white focus:border-red-500 rounded-2xl p-4 text-xs outline-none transition-all pr-12"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = e.currentTarget.value.trim();
                                                    if (val) {
                                                        const currentAllergies = user.preferences.allergies || [];
                                                        if (!currentAllergies.includes(val)) {
                                                            updatePreferences({
                                                                ...user.preferences,
                                                                allergies: [...currentAllergies, val]
                                                            });
                                                            e.currentTarget.value = '';
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300">
                                            <Plus className="w-4 h-4 text-zinc-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order History and Rewards */}
                    <div className="lg:col-span-8 space-y-8 animate-on-scroll">
                        
                        {/* Nutrition Tip of the Day */}
                        <DashboardNutritionTip />

                        {/* Subscription Schedule Plan */}
                        <SubscriptionCalendar 
                            plan={plan} 
                            setPlan={setPlan} 
                            completedMeals={completedMeals} 
                            onToggleMeal={handleToggleMeal} 
                        />

                        {/* Daily Hydration and Activity Tracker */}
                        <DailyVitalityTracker 
                            completedMeals={completedMeals}
                            plan={plan}
                        />

                        {/* Culinary feedback star rating widget */}
                        <MealFeedbackWidget 
                            plan={plan as any}
                            completedMeals={completedMeals}
                        />

                        {/* Weekly Macronutrient Intake Analytics */}
                        <MacroAnalytics 
                            plan={plan} 
                            userOrders={user.orders} 
                            goal={user.preferences.goal} 
                            completedMeals={completedMeals} 
                            preferences={user.preferences}
                        />

                        {/* Taaza Rewards Section */}
                        <div className="bg-gradient-to-br from-[#059669] to-[#047857] p-8 sm:p-10 rounded-3xl sm:rounded-[3rem] border border-[#059669]/20 shadow-xl relative overflow-hidden group mb-12">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                                <div className="text-white text-center md:text-left">
                                    <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                                        <Sparkles className="text-yellow-400 text-xl w-5 h-5"/>
                                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/80">TAAZA REWARDS</span>
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-sans tracking-tighter mb-4 uppercase">{user.rewards.points} <span className="text-lg sm:text-xl">pts</span></h2>
                                    <p className="text-white/80 text-xs sm:text-sm font-light leading-relaxed max-w-sm">Earn points for every subscription renewal. Redeem them for exclusive discounts on your next meal plan!</p>
                                </div>

                                <div className="flex flex-col items-center md:items-end gap-3 sm:gap-4 w-full md:w-auto">
                                    <div className="bg-white/10 backdrop-blur-md px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/20 flex items-center gap-2">
                                        <span className="text-[10px] sm:text-xs text-white/80 uppercase tracking-widest">{user.rewards.tier} Tier</span>
                                    </div>
                                    <button 
                                        className="w-full md:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-[#059669] rounded-full font-bold uppercase tracking-[0.15em] text-[10px] sm:text-xs shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                        onClick={() => {
                                            const toastEvent = new CustomEvent('taaza:toast', {
                                                detail: { message: `Redemption options for ${user.rewards.points} points coming soon!`, type: 'info' }
                                            });
                                            window.dispatchEvent(toastEvent);
                                        }}
                                    >
                                        Redeem points
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <span className="text-[9px] font-black text-[#FF7A00] uppercase tracking-[0.5em] block mb-2">ORDER HISTORY</span>
                                <h2 className="text-4xl font-extrabold font-sans text-[#1A1A1A] tracking-tighter uppercase">Your Orders.</h2>
                            </div>
                            <div className="hidden sm:block text-right">
                                <span className="text-[8px] font-mono text-zinc-300 block">LAST LOGIN: {new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {user.orders.map(order => {
                                const hasSubmitted = submittedFeedbackOrderIds.includes(order.id);
                                const isDelivered = order.status === 'DEPLOYED';
                                return (
                                    <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col gap-6 group">
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
                                            <div className="flex items-center gap-8 w-full sm:w-auto">
                                                <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-[#FF7A00] group-hover:text-white transition-all animate-fade-in">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-xs font-mono font-bold text-[#1A1A1A]">{order.id}</span>
                                                        <span className="text-[8px] font-mono text-zinc-300">/ {order.date}</span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-[#1A1A1A]">{order.items[0]}</h4>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-6 sm:pt-0">
                                                <div className="text-center sm:text-right">
                                                    <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest block mb-1">VALUE</span>
                                                    <span className="text-xl font-mono font-black text-[#1A1A1A]">₹{order.total}</span>
                                                </div>
                                                <div className={`px-5 py-2 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                                                    {order.status === 'DEPLOYED' && (
                                                        <CheckCircle className="animate-pulse"/>
                                                    )}
                                                    {order.status}
                                                </div>

                                                {/* Rate Delivered Meal & Packaging */}
                                                {isDelivered && (
                                                    <div className="shrink-0">
                                                        {hasSubmitted ? (
                                                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-full flex items-center gap-1 border border-emerald-100">
                                                                <CheckCircle className="w-3 h-3 text-emerald-600 animate-bounce" /> RATED
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => setActiveFeedbackOrderId(activeFeedbackOrderId === order.id ? null : order.id)}
                                                                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-sm hover:shadow cursor-pointer ${
                                                                    activeFeedbackOrderId === order.id
                                                                        ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                                                                        : 'bg-[#FF7A00] text-white hover:bg-[#059669]'
                                                                }`}
                                                            >
                                                                {activeFeedbackOrderId === order.id ? 'Close' : 'Rate Meal'}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Inline Feedback Form */}
                                        {activeFeedbackOrderId === order.id && (
                                            <OrderFeedbackForm
                                                orderId={order.id}
                                                mealName={order.items[0]}
                                                onSuccess={() => {
                                                    setActiveFeedbackOrderId(null);
                                                    triggerSuccessConfetti();
                                                }}
                                                onCancel={() => setActiveFeedbackOrderId(null)}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-[#1A1A1A] text-white p-10 rounded-[3rem] relative overflow-hidden shadow-2xl group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FF7A00]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                <div className="text-center md:text-left">
                                    <h4 className="text-2xl font-extrabold font-sans mb-2 tracking-tight uppercase">Hungry for more?</h4>
                                    <p className="text-zinc-500 text-sm font-light leading-relaxed">Order again and enjoy fresh, healthy meals delivered to your door.</p>
                                </div>
                                <SmartButton label="ORDER NOW" href="/menu" variant="accent" className="!h-16" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
