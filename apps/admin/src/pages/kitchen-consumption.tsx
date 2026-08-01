import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Droplet, Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { KitchenTabs } from "../components/kitchen/kitchen-tabs";

export default function KitchenConsumptionPage() {
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
          <h1 className="text-3xl font-black text-white tracking-tight">Ingredient Consumption</h1>
          <p className="text-zinc-400 mt-1">Calculated ingredients required for today's production vs available stock.</p>
        </div>
      </div>
      
      <KitchenTabs />
      
      <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800 bg-zinc-950/50 p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Consumption & Shortage Alerts</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search ingredients..." 
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
                  <th className="py-4 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ingredient</th>
                  <th className="py-4 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Required Qty</th>
                  <th className="py-4 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Available Stock</th>
                  <th className="py-4 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {[
                  { name: "Chicken Breast", required: 45, stock: 50, unit: "kg", alert: false },
                  { name: "Basmati Rice", required: 20, stock: 15, unit: "kg", alert: true },
                  { name: "Olive Oil", required: 5, stock: 12, unit: "L", alert: false },
                  { name: "Broccoli", required: 15, stock: 8, unit: "kg", alert: true },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        {item.name}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-white">
                      {item.required} <span className="text-zinc-500 text-xs">{item.unit}</span>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-white">
                      {item.stock} <span className="text-zinc-500 text-xs">{item.unit}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {item.alert ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase bg-rose-500/10 text-rose-500 rounded-lg border border-rose-500/20">
                          <AlertTriangle className="h-3 w-3" /> Shortage
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
                          Sufficient
                        </span>
                      )}
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
