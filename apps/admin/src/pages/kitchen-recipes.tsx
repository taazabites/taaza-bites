import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KitchenTabs } from "../components/kitchen/kitchen-tabs";

export default function KitchenRecipesPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

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
          <h1 className="text-3xl font-black text-white tracking-tight">Recipe Management</h1>
          <p className="text-zinc-400 mt-1">Standard Operating Procedures, ingredients, and nutritional values.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-6 rounded-xl">
          <Plus className="h-5 w-5 mr-2" /> Add Recipe
        </Button>
      </div>
      
      <KitchenTabs />
      
      <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800 bg-zinc-950/50 p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Recipe Book</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search recipes..." 
                className="pl-9 bg-zinc-900 border-zinc-800 h-10 rounded-xl text-sm focus:border-emerald-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/20">
                  <th className="py-4 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Recipe Name</th>
                  <th className="py-4 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Portion Size</th>
                  <th className="py-4 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Prep Time</th>
                  <th className="py-4 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nutrition (kcal/P)</th>
                  <th className="py-4 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {[
                  { name: "Grilled Chicken Salad", portion: "350g", time: "20 mins", kcal: 350, protein: 35 },
                  { name: "Quinoa Veggie Bowl", portion: "400g", time: "15 mins", kcal: 420, protein: 18 },
                  { name: "Baked Salmon & Asparagus", portion: "380g", time: "25 mins", kcal: 480, protein: 42 },
                ].map((recipe, i) => (
                  <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-sm">{recipe.name}</div>
                      <div className="text-xs text-emerald-500/70 mt-0.5">SOP Available</div>
                    </td>
                    <td className="py-4 px-6 text-zinc-300 text-sm">{recipe.portion}</td>
                    <td className="py-4 px-6 text-zinc-300 text-sm">{recipe.time}</td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-zinc-300">{recipe.kcal} kcal</div>
                      <div className="text-xs text-zinc-500">{recipe.protein}g protein</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
