import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarDays, Search, CheckCircle2, ChevronRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KitchenTabs } from "../components/kitchen/kitchen-tabs";

export default function KitchenPlannerPage() {
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
          <h1 className="text-3xl font-black text-white tracking-tight">Production Planner</h1>
          <p className="text-zinc-400 mt-1">Today's production list generated from active subscriptions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-xl">
            <Printer className="h-4 w-4 mr-2" /> Print List
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 rounded-xl">
            Generate Plan
          </Button>
        </div>
      </div>
      
      <KitchenTabs />
      
      <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800 bg-zinc-950/50 p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white text-base">Production List - Today</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search meals..." 
                className="pl-9 bg-zinc-900 border-zinc-800 h-9 rounded-xl text-sm focus:border-emerald-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/20">
                  <th className="py-3 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Meal Name</th>
                  <th className="py-3 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Qty Required</th>
                  <th className="py-3 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nutrition (kcal/P)</th>
                  <th className="py-3 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Priority</th>
                  <th className="py-3 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {[
                  { name: "Grilled Chicken Salad", qty: 45, kcal: 350, protein: 35, priority: "High" },
                  { name: "Quinoa Veggie Bowl", qty: 28, kcal: 420, protein: 18, priority: "Medium" },
                  { name: "Oatmeal Breakfast Bowl", qty: 120, kcal: 320, protein: 12, priority: "High" },
                  { name: "Baked Salmon & Asparagus", qty: 15, kcal: 480, protein: 42, priority: "Low" },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Prep time: 20 mins</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center justify-center bg-zinc-800 text-white font-bold rounded-lg h-8 w-12 text-sm">
                          {item.qty}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-zinc-300">{item.kcal} kcal</div>
                      <div className="text-xs text-zinc-500">{item.protein}g protein</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border ${
                        item.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                        item.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg h-8 px-3 text-xs font-bold">
                        To Prep Board <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
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
