import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  UserCheck, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle,
  Download,
  Calendar,
  CreditCard,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ceoService, CEOMetrics } from '../services/ceo';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function CEODashboardPage() {
  const [metrics, setMetrics] = useState<CEOMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = ceoService.subscribeToMetrics((data) => {
      setMetrics(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading || !metrics) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-indigo-500" />
            CEO Executive Dashboard
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Enterprise performance, financials, and strategic growth insights.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-zinc-800">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Primary Financial KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold text-white">{formatCurrency(metrics.totalRevenue)}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className={`flex items-center gap-1 font-medium ${metrics.growthPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {metrics.growthPercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(metrics.growthPercent).toFixed(1)}%
              </span>
              <span className="text-zinc-500">vs last 30 days</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">Monthly Recurring (MRR)</p>
                <h3 className="text-3xl font-bold text-white">{formatCurrency(metrics.mrr)}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-zinc-400">ARR Runway:</span>
              <span className="font-medium text-indigo-400">{formatCurrency(metrics.arr)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">Net Profit (Est.)</p>
                <h3 className="text-3xl font-bold text-emerald-500">{formatCurrency(metrics.netProfit)}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-zinc-400">Gross Margin:</span>
              <span className="font-medium text-emerald-400">{metrics.grossMargin}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">Lifetime Value (CLV)</p>
                <h3 className="text-3xl font-bold text-white">{formatCurrency(metrics.clv)}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Target className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-zinc-400">CAC Ratio:</span>
              <span className="font-medium text-purple-400">{(metrics.clv / metrics.cac).toFixed(1)}x</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart */}
        <Card className="col-span-1 lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Revenue & Profit Growth</CardTitle>
            <CardDescription className="text-zinc-400">Trailing 4 months performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#52525b" tick={{fill: '#a1a1aa'}} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" tick={{fill: '#a1a1aa'}} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Base & Churn */}
        <div className="space-y-6">
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Customer Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end border-b border-zinc-800/50 pb-4 mb-4">
                <div>
                  <p className="text-sm text-zinc-400">Active Subs</p>
                  <p className="text-2xl font-bold text-white">{metrics.activeSubscribers}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400 text-right">Total Base</p>
                  <p className="text-2xl font-bold text-indigo-400">{metrics.activeCustomers}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Renewal Rate</span>
                  <span className="text-sm font-bold text-emerald-500">{metrics.renewalRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${metrics.renewalRate}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-zinc-400">Churn Rate</span>
                  <span className="text-sm font-bold text-rose-500">{metrics.churnRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5">
                  <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${metrics.churnRate}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Forecast & Alerts */}
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.alerts.length === 0 ? (
                <div className="text-sm text-zinc-500 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" /> All metrics normal.
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.alerts.map((alert) => (
                    <div key={alert.id} className={`flex gap-3 p-3 rounded-lg border ${alert.type === 'danger' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                      <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${alert.type === 'danger' ? 'text-rose-500' : 'text-amber-500'}`} />
                      <p className={`text-sm ${alert.type === 'danger' ? 'text-rose-400' : 'text-amber-400'}`}>{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-zinc-800/50">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">AI Sales Forecast (Next 30D)</h4>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-white">{formatCurrency(metrics.mrr * 1.15)}</span>
                  <span className="flex items-center gap-1 text-sm text-emerald-500 font-medium">
                    <TrendingUp className="h-4 w-4" /> +15%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
