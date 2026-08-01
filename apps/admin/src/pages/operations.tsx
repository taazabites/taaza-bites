import { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  CloudRain,
  CreditCard,
  MessageSquare,
  MapPin,
  HardDrive,
  TrendingUp,
  AlertOctagon,
  Clock,
  PlayCircle,
  PauseCircle,
  Megaphone,
  AlertTriangle,
  Download,
  Terminal,
  ActivitySquare,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { operationsService, OperationsMetrics } from '../services/operations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OperationsCenterPage() {
  const [metrics, setMetrics] = useState<OperationsMetrics>({
    liveOrders: 0,
    kitchenQueue: 0,
    deliveryTracking: 0,
    registrationsToday: 0,
    activeSubscriptions: 0,
    liveRevenue: 0,
    alerts: [],
    recentActivity: []
  });

  const [loading, setLoading] = useState(true);

  const [graphData, setGraphData] = useState<{ time: number; val: number }[]>([]);

  useEffect(() => {
    const unsubscribe = operationsService.subscribeToLiveMetrics((data) => {
      setMetrics(data);
      setLoading(false);
      setGraphData(prev => {
        const nextTime = prev.length > 0 ? prev[prev.length - 1].time + 1 : 1;
        const currentVal = data.liveOrders || 0;
        const updated = [...prev, { time: nextTime, val: currentVal }];
        return updated.slice(-20);
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleQuickAction = async (action: string, status: string) => {
    try {
      await operationsService.executeQuickAction(action, status, 'admin_master', 'CEO');
      alert(`Action executed: ${action} is now ${status}`);
    } catch (error) {
      console.error('Quick action failed:', error);
      alert('Failed to execute action.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Terminal className="h-6 w-6 text-indigo-500" />
            Operations Control Center
          </h2>
          <p className="text-sm text-zinc-400">Enterprise live monitoring and system health dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
           <span className="flex items-center gap-2 text-sm font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             System Online
           </span>
        </div>
      </div>

      {/* Realtime Business Monitor */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl overflow-hidden relative group">
          <CardContent className="p-4 flex flex-col items-center justify-center h-24">
            <p className="text-xs font-medium text-zinc-400 mb-1">Live Orders</p>
            <h3 className="text-2xl font-bold text-white">{metrics.liveOrders}</h3>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl overflow-hidden relative group">
          <CardContent className="p-4 flex flex-col items-center justify-center h-24">
            <p className="text-xs font-medium text-zinc-400 mb-1">Kitchen Queue</p>
            <h3 className="text-2xl font-bold text-amber-500">{metrics.kitchenQueue}</h3>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl overflow-hidden relative group">
          <CardContent className="p-4 flex flex-col items-center justify-center h-24">
            <p className="text-xs font-medium text-zinc-400 mb-1">Delivery Tracking</p>
            <h3 className="text-2xl font-bold text-blue-500">{metrics.deliveryTracking}</h3>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl overflow-hidden relative group">
          <CardContent className="p-4 flex flex-col items-center justify-center h-24">
            <p className="text-xs font-medium text-zinc-400 mb-1">Live Revenue</p>
            <h3 className="text-2xl font-bold text-emerald-500">₹{metrics.liveRevenue}</h3>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl overflow-hidden relative group">
          <CardContent className="p-4 flex flex-col items-center justify-center h-24">
            <p className="text-xs font-medium text-zinc-400 mb-1">Registrations</p>
            <h3 className="text-2xl font-bold text-indigo-500">{metrics.registrationsToday}</h3>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl overflow-hidden relative group">
          <CardContent className="p-4 flex flex-col items-center justify-center h-24">
            <p className="text-xs font-medium text-zinc-400 mb-1">Active Subs</p>
            <h3 className="text-2xl font-bold text-purple-500">{metrics.activeSubscriptions}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Operations Heartbeat Chart */}
        <Card className="col-span-1 lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ActivitySquare className="h-5 w-5 text-emerald-500" />
              Global System Heartbeat
            </CardTitle>
            <CardDescription className="text-zinc-500">Realtime API throughput and server load.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="val" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* System Health Matrix */}
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Firebase Core', icon: Database, status: 'Operational' },
              { label: 'Firestore', icon: HardDrive, status: 'Operational' },
              { label: 'Cloud Functions', icon: CloudRain, status: 'Operational' },
              { label: 'Razorpay Gateway', icon: CreditCard, status: 'Operational' },
              { label: 'WhatsApp API', icon: MessageSquare, status: 'Degraded' },
              { label: 'Google Maps API', icon: MapPin, status: 'Operational' },
            ].map((service, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <service.icon className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-300">{service.label}</span>
                </div>
                <span className={`text-xs font-bold ${service.status === 'Operational' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {service.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Alerts & Incidents */}
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-rose-500" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {metrics.alerts.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-sm">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500/50" />
                  No critical alerts at this time.
                </div>
              ) : (
                metrics.alerts.map((alert: any, i) => (
                  <div key={alert.id || i} className="flex gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3">
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-rose-500">{alert.action || 'System Error'}</p>
                      <p className="text-xs text-rose-400/80 mt-1">{alert.module} • {alert.adminName}</p>
                      <p className="text-xs text-zinc-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Realtime Operations Timeline */}
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Operations Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
              {metrics.recentActivity.map((log: any, i) => (
                <div key={log.id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-zinc-200 text-xs">{log.module}</div>
                      <time className="font-mono text-[10px] text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</time>
                    </div>
                    <div className="text-xs text-zinc-400">{log.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Reports */}
        <div className="space-y-6">
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button 
                onClick={() => handleQuickAction('globalOrderState', 'Paused')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <PauseCircle className="h-4 w-4" /> Pause All Orders
                </div>
              </button>
              <button 
                onClick={() => handleQuickAction('globalOrderState', 'Active')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <PlayCircle className="h-4 w-4" /> Resume All Orders
                </div>
              </button>
              <button 
                onClick={() => handleQuickAction('emergencyBanner', 'Active')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Megaphone className="h-4 w-4" /> Enable Emergency Banner
                </div>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Download className="h-5 w-5 text-zinc-400" />
                Live Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <button className="py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
                Export PDF
              </button>
              <button className="py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
                Export Excel
              </button>
              <button className="py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors col-span-2">
                Download CSV Dump
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
