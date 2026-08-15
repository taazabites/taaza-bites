import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, PackageSearch, Package, Truck, CheckCircle2, AlertCircle, RotateCw } from "lucide-react";
import { OrdersTabs } from "../../components/orders/orders-tabs";
import { loadDashboardMetrics } from "../../services/dashboard";
import { presetRange } from "../../lib/dates";
import { Link } from "react-router-dom";

export default function OrdersDashboardPage() {
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof loadDashboardMetrics>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardMetrics(presetRange("today"))
      .then(setMetrics)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="p-8 text-rose-400">{error}</div>;
  }
  if (!metrics) {
    return <div className="p-8 text-zinc-400">Loading live order metrics…</div>;
  }

  const stats = [
    { label: "Preparing", count: metrics.ops.preparing, icon: PackageSearch, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", href: "/orders/preparing" },
    { label: "Packed", count: metrics.ops.packed, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", href: "/orders/packed" },
    { label: "Out For Delivery", count: metrics.ops.outForDelivery, icon: Truck, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", href: "/orders/out" },
    { label: "Delivered", count: metrics.ops.delivered, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", href: "/orders/delivered" },
    { label: "Failed / Cancelled", count: metrics.ops.cancelled, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", href: "/orders/cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Order Dashboard</h1>
        <p className="text-zinc-400 mt-1">Live Firestore order counts. Click a status to open the filtered queue.</p>
      </div>
      <OrdersTabs />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 flex justify-between">Today's Orders<CalendarDays className="h-4 w-4 text-emerald-500" /></CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black text-white">{metrics.todaysOrders}</div></CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 flex justify-between">Active / pending<PackageSearch className="h-4 w-4 text-amber-500" /></CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black text-white">{metrics.pendingOrders + metrics.ops.preparing + metrics.ops.packed}</div></CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 flex justify-between">Out for delivery<Truck className="h-4 w-4" /></CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black text-white">{metrics.ops.outForDelivery}</div></CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400 flex justify-between">Cancelled / skipped<RotateCw className="h-4 w-4 text-purple-500" /></CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black text-white">{metrics.ops.cancelled}</div></CardContent>
        </Card>
      </div>
      <h3 className="text-lg font-bold text-white mt-8 mb-4">Live Fulfillment Status</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href} className={`rounded-xl border ${stat.border} ${stat.bg} p-4 flex flex-col items-center justify-center text-center`}>
            <stat.icon className={`h-6 w-6 ${stat.color} mb-2`} />
            <div className={`text-2xl font-black ${stat.color}`}>{stat.count}</div>
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
