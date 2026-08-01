import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarDays, TrendingUp, PackageSearch, Package, Truck, CheckCircle2, AlertCircle, XCircle, RotateCw } from "lucide-react";
import { OrdersTabs } from "../../components/orders/orders-tabs";

export default function OrdersDashboardPage() {
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
          <h1 className="text-3xl font-black text-white tracking-tight">Order Dashboard</h1>
          <p className="text-zinc-400 mt-1">Real-time overview of all order statuses and KPIs.</p>
        </div>
      </div>
      
      <OrdersTabs />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex justify-between">
              Today's Orders
              <CalendarDays className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">482</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> 100% Generated
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex justify-between">
              Tomorrow's Orders
              <CalendarDays className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">495</div>
            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
              Generation scheduled for 8:00 PM
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex justify-between">
              Active Orders
              <PackageSearch className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">325</div>
            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
              Currently processing
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400 flex justify-between">
              Skipped Meals
              <RotateCw className="h-4 w-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">12</div>
            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
              Paused by customers today
            </p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-bold text-white mt-8 mb-4">Live Fulfillment Status</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Preparing", count: 145, icon: PackageSearch, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { label: "Packed", count: 85, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: "Out For Delivery", count: 65, icon: Truck, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          { label: "Delivered", count: 180, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Failed / Cancelled", count: 7, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
        ].map((stat, i) => (
          <div key={i} className={`rounded-xl border ${stat.border} ${stat.bg} p-4 flex flex-col items-center justify-center text-center`}>
            <stat.icon className={`h-6 w-6 ${stat.color} mb-2`} />
            <div className={`text-2xl font-black ${stat.color}`}>{stat.count}</div>
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
