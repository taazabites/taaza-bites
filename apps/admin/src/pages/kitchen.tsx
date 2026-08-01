import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, AlertCircle, ChefHat, Package, Clock, ShieldCheck, Flame, CalendarDays } from "lucide-react";
import { KitchenTabs } from "../components/kitchen/kitchen-tabs";

export default function KitchenDashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock load
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
          <h1 className="text-3xl font-black text-white tracking-tight">Kitchen Dashboard</h1>
          <p className="text-zinc-400 mt-1">Real-time overview of kitchen operations and production status.</p>
        </div>
      </div>
      
      <KitchenTabs />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex justify-between">
              Today's Total Orders
              <CalendarDays className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">482</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +12% from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex justify-between">
              Meals in Preparation
              <Flame className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">145</div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-3">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex justify-between">
              Meals Packed
              <Package className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">210</div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-3">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex justify-between">
              Ready for Dispatch
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">127</div>
            <p className="text-xs text-zinc-500 mt-2">Waiting for delivery partners</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base text-white">Orders by Meal Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-300">Breakfast</span>
                <span className="text-white font-bold">120</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-300">Lunch</span>
                <span className="text-white font-bold">210</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-300">Dinner</span>
                <span className="text-white font-bold">152</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base text-white flex items-center justify-between">
              Kitchen Capacity
              <ChefHat className="h-4 w-4 text-zinc-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-zinc-800" />
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="351.85" strokeDashoffset={351.85 * (1 - 0.78)} className="text-emerald-500" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">78%</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Utilized</span>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-zinc-400">Current Load: 482 / 600 meals</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-rose-500/5 border-rose-500/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base text-rose-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Delayed Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: "ORD-1204", delay: "15 mins", type: "Lunch" },
                { id: "ORD-1209", delay: "10 mins", type: "Lunch" },
                { id: "ORD-1215", delay: "5 mins", type: "Lunch" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                  <div>
                    <div className="text-sm font-bold text-white">{item.id}</div>
                    <div className="text-xs text-zinc-500">{item.type}</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-500 text-sm font-medium bg-rose-500/10 px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3" /> {item.delay}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
