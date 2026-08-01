import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Flame, Utensils, AlertTriangle, ShieldAlert, CheckCircle2, Scale, Thermometer } from "lucide-react";

interface RecipeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: any;
}

export function RecipeDetailsModal({ isOpen, onClose, recipe }: RecipeDetailsModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-xl p-0 overflow-hidden rounded-2xl shadow-2xl">
        <DialogHeader className="p-5 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-emerald-400" />
              {recipe.mealName || "Standard Meal Recipe Card"}
            </DialogTitle>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
              Master Kitchen SOP
            </Badge>
          </div>
          <DialogDescription className="text-xs text-zinc-400 mt-1">
            Official Production Guidelines, Portion Grammage, and CCP Safety Controls
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[500px] overflow-y-auto">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-3 bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-center">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Prep Time</span>
              <span className="text-sm font-extrabold text-white flex items-center justify-center gap-1 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                {recipe.prepTime || 18}m
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Calories</span>
              <span className="text-sm font-extrabold text-amber-400 mt-0.5 block">{recipe.calories || 420}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Protein</span>
              <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block">{recipe.protein || 32}g</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-mono block">Target Temp</span>
              <span className="text-sm font-extrabold text-rose-400 flex items-center justify-center gap-1 mt-0.5">
                <Thermometer className="h-3.5 w-3.5 text-rose-400" />
                ≥74°C
              </span>
            </div>
          </div>

          {/* Portioning Grammage Table */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-emerald-400" />
              Standard Portion Grammage (per single meal)
            </h4>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-3 p-2.5 bg-zinc-900 font-semibold text-zinc-400 border-b border-zinc-800">
                <span>INGREDIENT</span>
                <span className="text-center">GRAMMAGE</span>
                <span className="text-right">STATION</span>
              </div>
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ing: any, i: number) => (
                  <div key={i} className="grid grid-cols-3 p-2.5 border-b border-zinc-800/50 hover:bg-zinc-900/30">
                    <span className="text-white font-medium">{ing.ingredientName}</span>
                    <span className="text-center font-mono font-bold text-emerald-400">{ing.quantity} {ing.unit}</span>
                    <span className="text-right text-zinc-400">Station A</span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-zinc-500 text-center">Default portioning: Protein 180g, Base Grain 140g, Veggies 80g</div>
              )}
            </div>
          </div>

          {/* Step-by-Step Culinary Instructions */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
              <Utensils className="h-4 w-4 text-amber-400" />
              Step-by-Step Cooking Steps & CCPs
            </h4>
            <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl space-y-2 text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
              {recipe.instructions || (
                `1. Wash and sanitize all fresh greens and produce in cold water.\n2. Sear paneer/chicken in steam kettles at 180°C until internal temperature reaches 74°C.\n3. Prepare low-fat gravy separately and simmer for 15 minutes.\n4. Combine base grain and top with sauce.`
              )}
            </div>
          </div>

          {/* Packaging & Thermal Instruction */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1">
            <p className="font-bold text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> Packaging & Thermal SOP
            </p>
            <p className="text-zinc-300">{recipe.packagingInstructions || "Pack in bio-degradable sugarcane containers. Ensure heat film seal is hermetically closed."}</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs"
          >
            Close Recipe Card
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
