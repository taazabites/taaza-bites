import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Download, PieChart, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrdersTabs } from "../../components/orders/orders-tabs";

export default function OrdersReportsPage() {
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
          <h1 className="text-3xl font-black text-white tracking-tight">Order Reports</h1>
          <p className="text-zinc-400 mt-1">Analytics on delivery success, preparation times, and failure rates.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-6 rounded-xl">
          <Download className="h-4 w-4 mr-2" /> Export Data
        </Button>
      </div>
      
      <OrdersTabs />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Delivered %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">98.5%</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +1.2% vs last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Avg Preparation Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">18m</div>
            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
              Per meal average
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Avg Delivery Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">24m</div>
            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
              Kitchen to customer
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Failure Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-500">1.5%</div>
            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
              Returned or undelivered
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl min-h-[300px] flex items-center justify-center">
          <div className="text-zinc-500 text-sm flex flex-col items-center">
            <BarChart className="h-8 w-8 mb-2 opacity-50" />
            <p>Orders Over Time Chart Placeholder</p>
          </div>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl min-h-[300px] flex items-center justify-center">
          <div className="text-zinc-500 text-sm flex flex-col items-center">
            <PieChart className="h-8 w-8 mb-2 opacity-50" />
            <p>Order Status Distribution Placeholder</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
