import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Zap, Settings, AlertTriangle, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrdersTabs } from "../../components/orders/orders-tabs";
import { orderService } from "../../services/orders";
import { useAuth } from "../../contexts/auth-context";
import { toast } from "sonner";

export default function OrdersGeneratePage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const res = await orderService.generateDailyOrders(user.id);
      toast.success(`Successfully generated ${res.created} orders for tomorrow.`);
    } catch (e) {
      toast.error("Failed to generate orders. Check console for details.");
    } finally {
      setGenerating(false);
    }
  };

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
          <h1 className="text-3xl font-black text-white tracking-tight">Automatic Order Generation</h1>
          <p className="text-zinc-400 mt-1">Configure and run bulk order creation from active subscriptions.</p>
        </div>
      </div>
      
      <OrdersTabs />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-500" /> Manual Trigger
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Orders are generated automatically every evening at 8:00 PM. You can manually trigger generation here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
              <h4 className="text-sm font-bold text-white mb-2">Generation Rules Enforced:</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Respects active subscription status</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Skips paused or explicitly skipped meals</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Applies designated delivery slots and kitchens</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Matches appropriate meal rotation</li>
              </ul>
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-xl"
            >
              {generating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Orders...</>
              ) : (
                <><Play className="mr-2 h-5 w-5" /> Generate Tomorrow's Orders</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-zinc-900/50 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-zinc-400" /> System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">CRON Job</span>
              <span className="px-2 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-500 rounded-md">Active</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Next Run</span>
              <span className="text-sm text-white">Today, 20:00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Last Run</span>
              <span className="text-sm text-white">Yesterday, 20:00</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-zinc-400">Orders Created</span>
              <span className="text-sm text-emerald-400">482</span>
            </div>
            
            <div className="mt-4 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-500/90 leading-tight">
                Manual generation will overwrite existing pending orders for tomorrow to reflect latest subscription changes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
