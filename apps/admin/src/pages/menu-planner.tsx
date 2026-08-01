import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/auth-context";
import { menuService } from "../services/menu";
import { planService } from "../services/plans";
import { MenuItem, SubscriptionPlan } from "../types";
import { Loader2, Search, Calendar, ChevronRight, CheckCircle2, ChevronLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { doc, getDoc, setDoc, onSnapshot, collection } from "firebase/firestore";
import { db } from "../lib/firebase";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner"];

export default function MenuPlannerPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [meals, setMeals] = useState<MenuItem[]>([]);
  
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [planMenu, setPlanMenu] = useState<Record<string, Record<string, MenuItem | null>>>({});
  
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedMeal, setDraggedMeal] = useState<MenuItem | null>(null);

  useEffect(() => {
    let unsubscribePlans: () => void;
    let unsubscribeMenu: () => void;
    
    try {
      unsubscribePlans = planService.subscribePlans(
        (data) => setPlans(data),
        (err) => console.error(err)
      );
      
      unsubscribeMenu = menuService.subscribeMenu(
        (data) => setMeals(data),
        (err) => console.error(err)
      );
    } catch (err) {
      console.error(err);
    }

    return () => {
      if (unsubscribePlans) unsubscribePlans();
      if (unsubscribeMenu) unsubscribeMenu();
    };
  }, []);
  
  useEffect(() => {
    if (plans.length > 0 && meals.length > 0) {
      setLoading(false);
      if (!selectedPlanId) setSelectedPlanId(plans[0]?.id);
    }
  }, [plans, meals]);

  useEffect(() => {
    if (!selectedPlanId) return;
    
    // Fetch current plan menu mapping
    const unsub = onSnapshot(doc(db, "planMenus", selectedPlanId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // reconstruct meal objects
        const loadedMenu: Record<string, Record<string, MenuItem | null>> = {};
        
        DAYS.forEach(day => {
          loadedMenu[day] = {};
          MEAL_TIMES.forEach(time => {
            const mealId = data?.[day]?.[time];
            if (mealId) {
              const meal = meals.find(m => m.id === mealId);
              loadedMenu[day][time] = meal || null;
            } else {
              loadedMenu[day][time] = null;
            }
          });
        });
        
        setPlanMenu(loadedMenu);
      } else {
        // Initialize empty
        const emptyMenu: Record<string, Record<string, MenuItem | null>> = {};
        DAYS.forEach(day => {
          emptyMenu[day] = {};
          MEAL_TIMES.forEach(time => {
            emptyMenu[day][time] = null;
          });
        });
        setPlanMenu(emptyMenu);
      }
    });
    
    return () => unsub();
  }, [selectedPlanId, meals]);

  const handleSave = async () => {
    if (!selectedPlanId || !user) return;
    
    try {
      setSaving(true);
      const dataToSave: Record<string, any> = {};
      
      Object.keys(planMenu).forEach(day => {
        dataToSave[day] = {};
        Object.keys(planMenu[day]).forEach(time => {
          dataToSave[day][time] = planMenu[day][time]?.id || null;
        });
      });
      
      await setDoc(doc(db, "planMenus", selectedPlanId), dataToSave);
      toast.success("Menu mapping saved successfully");
    } catch (error: any) {
      toast.error("Failed to save menu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredMeals = meals.filter(m => 
    m.mealName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Weekly Menu Planner</h1>
          <p className="text-zinc-400 mt-1">Assign meals to subscription plans</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-6 rounded-xl">
            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            Save Mapping
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar - Plans & Meals */}
        <div className="col-span-1 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Select Plan</h2>
            <div className="space-y-2">
              {plans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors border ${
                    selectedPlanId === plan.id 
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <span className="font-bold text-sm truncate">{plan.name}</span>
                  {selectedPlanId === plan.id && <CheckCircle2 className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-xl flex flex-col h-[600px]">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Meal Bank</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="Search meals..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-zinc-950 border-zinc-800 h-10 rounded-xl text-sm"
                />
              </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {filteredMeals.map(meal => (
                <div 
                  key={meal.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedMeal(meal);
                  }}
                  className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-colors group flex items-start gap-3"
                >
                  <div className="h-12 w-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                    {meal.thumbnailUrl || meal.imageUrls?.[0] ? (
                      <img src={meal.thumbnailUrl || meal.imageUrls?.[0]} alt={meal.mealName} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs leading-tight line-clamp-1">{meal.mealName}</h4>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-medium">{meal.category}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-medium">{meal.calories} kcal</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredMeals.length === 0 && (
                <div className="text-center py-10 text-zinc-500 text-sm">No meals found.</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Content - Calendar */}
        <div className="col-span-1 lg:col-span-3">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            
            <div className="grid grid-cols-8 border-b border-zinc-800">
              <div className="col-span-2 p-4 bg-zinc-950/50 flex items-center justify-center border-r border-zinc-800">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Time</span>
              </div>
              {MEAL_TIMES.map(time => (
                <div key={time} className="col-span-2 p-4 bg-zinc-950/50 flex items-center justify-center border-r border-zinc-800 last:border-0">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{time}</span>
                </div>
              ))}
            </div>
            
            <div className="divide-y divide-zinc-800">
              {DAYS.map(day => (
                <div key={day} className="grid grid-cols-8">
                  <div className="col-span-2 p-4 flex items-center border-r border-zinc-800 bg-zinc-950/20">
                    <span className="font-bold text-white">{day}</span>
                  </div>
                  
                  {MEAL_TIMES.map(time => {
                    const assignedMeal = planMenu[day]?.[time];
                    
                    return (
                      <div 
                        key={`${day}-${time}`} 
                        className="col-span-2 p-2 border-r border-zinc-800 last:border-0 min-h-[100px] relative group"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('bg-emerald-500/10');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('bg-emerald-500/10');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('bg-emerald-500/10');
                          if (draggedMeal) {
                            setPlanMenu(prev => ({
                              ...prev,
                              [day]: {
                                ...prev[day],
                                [time]: draggedMeal
                              }
                            }));
                          }
                        }}
                      >
                        {assignedMeal ? (
                          <div className="h-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 relative group-hover:border-zinc-700 transition-colors">
                            <button 
                              onClick={() => {
                                setPlanMenu(prev => ({
                                  ...prev,
                                  [day]: {
                                    ...prev[day],
                                    [time]: null
                                  }
                                }));
                              }}
                              className="absolute -top-2 -right-2 h-5 w-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-rose-600"
                            >
                              &times;
                            </button>
                            <div className="flex flex-col h-full gap-2">
                               {assignedMeal.thumbnailUrl || assignedMeal.imageUrls?.[0] ? (
                                <img src={assignedMeal.thumbnailUrl || assignedMeal.imageUrls?.[0]} alt={assignedMeal.mealName} className="h-12 w-full object-cover rounded bg-zinc-900 shrink-0" />
                               ) : null}
                              <span className="text-[10px] font-bold text-white leading-tight line-clamp-2">{assignedMeal.mealName}</span>
                              <div className="mt-auto flex justify-between items-center">
                                <span className="text-[9px] text-zinc-500">{assignedMeal.calories} kcal</span>
                                <Badge className="text-[8px] px-1 py-0 bg-emerald-500/10 text-emerald-400 border-0 h-4">{assignedMeal.mealType}</Badge>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full border-2 border-dashed border-zinc-800 rounded-lg flex items-center justify-center bg-zinc-950/30 text-zinc-600 group-hover:border-zinc-700 transition-colors">
                            <span className="text-[10px] uppercase font-bold tracking-wider">Drop Meal</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
