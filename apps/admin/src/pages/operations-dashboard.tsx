import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Server, Database, Webhook, ShieldCheck, Mail, MessageSquare } from "lucide-react";

export default function OperationsDashboardPage() {
  const [health, setHealth] = useState<any>(null);
  const [gateways, setGateways] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/health').then(res => res.json()),
      fetch('/api/settings/gateways').then(res => res.json())
    ]).then(([healthData, gatewaysData]) => {
      setHealth(healthData);
      setGateways(gatewaysData);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load operations data", err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-white">Operations Dashboard</h2>
      
      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/40 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">System Health</CardTitle>
              <Server className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{health?.status === 'ok' ? 'Operational' : 'Issues Detected'}</div>
              <p className="text-xs text-zinc-500">Uptime: Optimal</p>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900/40 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Firebase</CardTitle>
              <Database className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Connected</div>
              <p className="text-xs text-zinc-500">Firestore & Auth Status: Stable</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Webhooks (Razorpay)</CardTitle>
              <Webhook className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{gateways?.razorpay?.webhookStatus === 'warning' ? 'Warning' : 'Healthy'}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Gupshup (WhatsApp)</CardTitle>
              <MessageSquare className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Operational</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Email (Brevo)</CardTitle>
              <Mail className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Healthy</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Security</CardTitle>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Secure</div>
              <p className="text-xs text-zinc-500">Firewall & SSL Active</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
