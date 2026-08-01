import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Layers, Zap, Scale, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/primitives";
import { cn } from "@/src/lib/utils";
import { MealCustomizationService } from "@/src/firebase/services";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";

interface MealCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealScheduleId: string;
  originalMealId: string;
  subscriptionId: string;
  isDark?: boolean;
}

export default function MealCustomizationModal({
  isOpen,
  onClose,
  mealScheduleId,
  originalMealId,
  subscriptionId,
  isDark = false
}: MealCustomizationModalProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Customization details
  const [ingredientToReplace, setIngredientToReplace] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [portionSize, setPortionSize] = useState("Standard");
  const [extraProtein, setExtraProtein] = useState("Chicken Breast (+20g)");
  const [newMealId, setNewMealId] = useState("");

  const handleSubmit = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let details = {};
      if (type === 'replace_ingredient') {
        details = { ingredientToReplace, newIngredient };
      } else if (type === 'change_portion') {
        details = { portionSize };
      } else if (type === 'add_protein') {
        details = { extraProtein };
      }

      await MealCustomizationService.requestCustomization(
        currentUser.uid,
        subscriptionId,
        mealScheduleId,
        originalMealId,
        type,
        details,
        newMealId
      );
      
      showToast("Customization request submitted for kitchen review.", "success");
      onClose();
      // Reset
      setStep(1);
      setType(null);
    } catch (err) {
      console.error(err);
      showToast("Failed to submit request.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = (selectedType: string) => {
    setType(selectedType);
    setStep(2);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            "relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border",
            isDark ? "bg-zinc-950 border-white/10" : "bg-white border-zinc-200"
          )}
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <div>
              <h3 className={cn("text-lg font-black uppercase tracking-widest", isDark ? "text-white" : "text-zinc-900")}>
                Protocol Customization
              </h3>
              <p className="text-xs text-zinc-500 font-medium mt-1">Request kitchen modifications</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {step === 1 && (
              <div className="space-y-3">
                <button 
                  onClick={() => handleSelectType('replace_meal')}
                  className={cn("w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all text-left", isDark ? "border-white/5 hover:border-emerald-500/50 bg-zinc-900/50" : "border-zinc-100 hover:border-emerald-500/50 bg-zinc-50")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={cn("font-bold text-sm", isDark ? "text-white" : "text-zinc-900")}>Replace Entire Meal</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Swap with another item from the menu</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </button>

                <button 
                  onClick={() => handleSelectType('replace_ingredient')}
                  className={cn("w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all text-left", isDark ? "border-white/5 hover:border-amber-500/50 bg-zinc-900/50" : "border-zinc-100 hover:border-amber-500/50 bg-zinc-50")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={cn("font-bold text-sm", isDark ? "text-white" : "text-zinc-900")}>Replace Ingredient</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Remove allergen or disliked item</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </button>

                <button 
                  onClick={() => handleSelectType('swap_veg_nonveg')}
                  className={cn("w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all text-left", isDark ? "border-white/5 hover:border-blue-500/50 bg-zinc-900/50" : "border-zinc-100 hover:border-blue-500/50 bg-zinc-50")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={cn("font-bold text-sm", isDark ? "text-white" : "text-zinc-900")}>Veg ↔ Non-Veg Swap</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Change protein source type</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </button>

                <button 
                  onClick={() => handleSelectType('change_portion')}
                  className={cn("w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all text-left", isDark ? "border-white/5 hover:border-purple-500/50 bg-zinc-900/50" : "border-zinc-100 hover:border-purple-500/50 bg-zinc-50")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={cn("font-bold text-sm", isDark ? "text-white" : "text-zinc-900")}>Change Portion Size</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Adjust caloric density</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </button>

                <button 
                  onClick={() => handleSelectType('add_protein')}
                  className={cn("w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all text-left", isDark ? "border-white/5 hover:border-rose-500/50 bg-zinc-900/50" : "border-zinc-100 hover:border-rose-500/50 bg-zinc-50")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={cn("font-bold text-sm", isDark ? "text-white" : "text-zinc-900")}>Add Extra Protein</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Boost macros (+20g, +40g)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {type === 'replace_meal' && (
                  <div>
                     <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">New Meal Reference ID</label>
                     <input 
                       className={cn("w-full p-4 rounded-xl border outline-none font-medium", isDark ? "bg-zinc-900 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900")}
                       placeholder="e.g. meal_123"
                       value={newMealId}
                       onChange={e => setNewMealId(e.target.value)}
                     />
                     <p className="text-xs text-zinc-500 mt-2">Enter the ID of the meal you want instead.</p>
                  </div>
                )}

                {type === 'replace_ingredient' && (
                  <div className="space-y-4">
                     <div>
                       <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Ingredient to Remove</label>
                       <input 
                         className={cn("w-full p-4 rounded-xl border outline-none font-medium", isDark ? "bg-zinc-900 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900")}
                         placeholder="e.g. Peanuts, Tomatoes"
                         value={ingredientToReplace}
                         onChange={e => setIngredientToReplace(e.target.value)}
                       />
                     </div>
                     <div>
                       <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Ingredient to Add (Optional)</label>
                       <input 
                         className={cn("w-full p-4 rounded-xl border outline-none font-medium", isDark ? "bg-zinc-900 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900")}
                         placeholder="e.g. Almonds, Cucumber"
                         value={newIngredient}
                         onChange={e => setNewIngredient(e.target.value)}
                       />
                     </div>
                  </div>
                )}

                {type === 'swap_veg_nonveg' && (
                  <div>
                    <p className={cn("text-sm mb-4", isDark ? "text-zinc-300" : "text-zinc-600")}>
                      Your meal will be converted to the alternative protein source.
                    </p>
                  </div>
                )}

                {type === 'change_portion' && (
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Select Size</label>
                    <select 
                      className={cn("w-full p-4 rounded-xl border outline-none font-medium", isDark ? "bg-zinc-900 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900")}
                      value={portionSize}
                      onChange={e => setPortionSize(e.target.value)}
                    >
                      <option>Lite (350 kcal)</option>
                      <option>Standard (500 kcal)</option>
                      <option>Athlete (750 kcal)</option>
                    </select>
                  </div>
                )}

                {type === 'add_protein' && (
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Select Protein Boost</label>
                    <select 
                      className={cn("w-full p-4 rounded-xl border outline-none font-medium", isDark ? "bg-zinc-900 border-white/10 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900")}
                      value={extraProtein}
                      onChange={e => setExtraProtein(e.target.value)}
                    >
                      <option>Chicken Breast (+20g)</option>
                      <option>Tofu (+15g)</option>
                      <option>Eggs (+12g)</option>
                      <option>Whey Isolate (+25g)</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <Button 
                    variant="ghost" 
                    className="flex-1 rounded-xl"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
