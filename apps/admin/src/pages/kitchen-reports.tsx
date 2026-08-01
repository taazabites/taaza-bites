import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, TrendingUp, TrendingDown, Activity, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KitchenTabs } from "../components/kitchen/kitchen-tabs";

export default function KitchenReportsPage() {
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
          <h1 className="text-3xl font-black text-white tracking-tight">Kitchen Reports</h1>
          <p className="text-zinc-400 mt-1">Efficiency, wastage, and staff productivity metrics.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-6 rounded-xl">
          <Download className="h-4 w-4 mr-2" /> Export PDF
        </Button>
      </div>
      
      <KitchenTabs />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Total Meals Prepared (Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">3,450</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +5% vs last week
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Meals Wasted (Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">12</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3" /> -2% vs last week
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Average Prep Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">18 <span className="text-base text-zinc-500">mins</span></div>
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +1 min vs avg
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Kitchen Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">92%</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <Activity className="h-3 w-3" /> Optimal Range
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl min-h-[300px] flex items-center justify-center">
          <div className="text-zinc-500 text-sm flex flex-col items-center">
            <Activity className="h-8 w-8 mb-2 opacity-50" />
            <p>Production Trend Chart Placeholder</p>
          </div>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl min-h-[300px] flex items-center justify-center">
          <div className="text-zinc-500 text-sm flex flex-col items-center">
            <Users className="h-8 w-8 mb-2 opacity-50" />
            <p>Staff Productivity Chart Placeholder</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
