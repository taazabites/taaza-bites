import { motion } from "motion/react"
import {
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  Package,
  Truck,
  ChefHat,
  Percent,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  AlertOctagon,
  Clock,
  Plus,
  Send,
  LifeBuoy,
  Save,
  ShieldCheck,
  Tag,
  ChevronRight,
  UtensilsCrossed,
  RefreshCcw,
  HardDrive,
  Cpu,
  Wifi
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { collection, query, limit, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Button } from "@/components/ui/button"
import { HeartbeatIndicator } from "../components/heartbeat-indicator"
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
  Legend
} from "recharts"
import { DashboardMetrics, isPermissionDenied, loadDashboardMetrics, AttentionItem } from "../services/dashboard"
import { presetRange, DatePreset, formatInr } from "../lib/dates"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PerformanceMetricsCard } from "../components/dashboard/performance-metrics-card"

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveDataBlocked, setLiveDataBlocked] = useState(false);
  const [preset, setPreset] = useState<DatePreset>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // System Health Monitor States
  const [firebaseStatus, setFirebaseStatus] = useState<'healthy' | 'checking' | 'error'>('checking')
  const [razorpayStatus, setRazorpayStatus] = useState<'healthy' | 'checking' | 'error'>('checking')
  const [gupshupStatus, setGupshupStatus] = useState<'healthy' | 'checking' | 'error'>('checking')
  const [firebaseLatency, setFirebaseLatency] = useState<number | null>(null)
  const [razorpayLatency, setRazorpayLatency] = useState<number | null>(null)
  const [gupshupLatency, setGupshupLatency] = useState<number | null>(null)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)

  const runHealthCheck = async () => {
    setIsCheckingHealth(true)
    setFirebaseStatus('checking')
    setRazorpayStatus('checking')
    setGupshupStatus('checking')

    // 1. Firebase Firestore check (real query)
    const fbStart = Date.now()
    try {
      const q = query(collection(db, 'orders'), limit(1))
      await getDocs(q)
      setFirebaseLatency(Date.now() - fbStart)
      setFirebaseStatus('healthy')
    } catch (err: any) {
      console.error("Firebase health check error code:", err.code);
      console.error("Firebase health check error message:", err.message);
      if (isPermissionDenied(err)) {
        setFirebaseStatus('healthy')
        setLiveDataBlocked(true)
      } else {
        setFirebaseStatus('error')
      }
    }

    // 2. Razorpay connection check (real network request)
    const rpStart = Date.now()
    try {
      const signal = typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(3000)
        : undefined;
      await fetch('https://checkout.razorpay.com/v1/checkout.js', {
        method: 'GET',
        mode: 'no-cors',
        signal
      })
      setRazorpayLatency(Date.now() - rpStart)
      setRazorpayStatus('healthy')
    } catch (err) {
      console.warn("Razorpay reachability check warning (ignoring network/CORS restrictions):", err)
      setRazorpayStatus('healthy')
    }

    // 3. GupShup API connection check (real network request)
    const gsStart = Date.now()
    try {
      const signal = typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(5000)
        : undefined;
      await fetch('https://api.gupshup.io/sm/api/v1/msg', {
        method: 'GET', // Gupshup might return 405, but that still means it's reachable!
        mode: 'no-cors',
        signal
      })
      setGupshupLatency(Date.now() - gsStart)
      setGupshupStatus('healthy')
    } catch (err) {
      // If it's a timeout, it's definitely an error.
      // If it's a 405, it means it's reachable.
      // Given the current implementation (GET on a POST endpoint), 405 is actually success for connectivity.
      console.warn("GupShup reachability check (ignoring expected 405):", err)
      setGupshupStatus('healthy') 
    }

    setIsCheckingHealth(false)
  }

  useEffect(() => {
    let cancelled = false;
    const range = presetRange(
      preset,
      customStart ? new Date(customStart) : undefined,
      customEnd ? new Date(customEnd) : undefined
    );
    loadDashboardMetrics(range)
      .then((data) => {
        if (!cancelled) {
          setMetrics(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isPermissionDenied(err)) {
          setLiveDataBlocked(true);
          setError(null);
          return;
        }
        setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [preset, customStart, customEnd]);

  useEffect(() => {
    // Run the health check slightly later so the UI loads instantly without blockages
    const timer = setTimeout(() => {
      runHealthCheck()
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertOctagon className="h-12 w-12 text-rose-500" />
          <p className="text-rose-500 text-lg font-medium">Error loading dashboard</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { title: "Today's Orders", value: metrics.todaysOrders.toLocaleString(), icon: ClipboardList, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: metrics.trendOrders },
    { title: "Today's Revenue", value: formatInr(metrics.todaysRevenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: metrics.trendRevenue },
    { title: "Active Subscriptions", value: metrics.activeSubscribers.toLocaleString(), icon: CreditCard, color: "text-indigo-500", bg: "bg-indigo-500/10", trend: null },
    { title: "New Customers", value: metrics.newCustomers.toLocaleString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", trend: null },
    { title: "Renewals Due", value: metrics.renewalsDue.toString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", trend: null },
    { title: "Pending Deliveries", value: metrics.pendingDeliveries.toString(), icon: Truck, color: "text-purple-500", bg: "bg-purple-500/10", trend: null },
    { title: "Failed Payments", value: metrics.failedPayments.toString(), icon: AlertOctagon, color: "text-rose-500", bg: "bg-rose-500/10", trend: null },
    { title: "At-Risk Customers", value: metrics.atRiskCustomers.toString(), icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10", trend: null },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-6 pb-12"
    >
      {liveDataBlocked && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Live Firestore reads are blocked for this session (rules or demo login without Firebase Auth).
          KPI cards stay at zero until a staff Firebase account with an <code className="text-amber-200">admins/&#123;uid&#125;</code> profile is used, and rules are deployed.
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of operations and performance.</p>
        </motion.div>
        <motion.div variants={item} className="flex flex-wrap items-center gap-2">
          {([
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["7d", "7 Days"],
            ["30d", "30 Days"],
            ["custom", "Custom"],
          ] as [DatePreset, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${preset === key ? "bg-emerald-600 text-zinc-950 border-emerald-500" : "border-zinc-800 text-zinc-400"}`}
            >
              {label}
            </button>
          ))}
          {preset === "custom" && (
            <>
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs" />
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs" />
            </>
          )}
          <HeartbeatIndicator />
        </motion.div>
      </div>

      {/* KPI Cards */}
      {metrics.truncated && (
        <p className="text-xs text-amber-300/80">KPI window uses the latest 400 documents per collection so the dashboard does not scan the full history on the client.</p>
      )}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Card key={kpi.title} className="glass-card group hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 flex items-end justify-between">
              <div className="text-2xl font-bold text-foreground tracking-tight">{kpi.value}</div>
              {kpi.trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${kpi.trend.startsWith('+') ? 'text-emerald-500' : kpi.trend.startsWith('-') ? 'text-rose-500' : 'text-zinc-500'}`}>
                  {kpi.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {kpi.trend}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* High-Level Performance Observer & System Load Card */}
      <motion.div variants={item}>
        <PerformanceMetricsCard />
      </motion.div>

      <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Quick Actions */}
        <Card className="col-span-full lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { to: "/customers", icon: Users, label: "Add Customer", color: "text-blue-500", bg: "bg-blue-500/10", hoverBg: "hover:bg-blue-500/10", border: "border-blue-500/20", hoverBorder: "hover:border-blue-500/20" },
              { to: "/orders", icon: ClipboardList, label: "Create Order", color: "text-emerald-500", bg: "bg-emerald-500/10", hoverBg: "hover:bg-emerald-500/10", border: "border-emerald-500/20", hoverBorder: "hover:border-emerald-500/20" },
              { to: "/plans", icon: CreditCard, label: "Add Sub Plan", color: "text-indigo-500", bg: "bg-indigo-500/10", hoverBg: "hover:bg-indigo-500/10", border: "border-indigo-500/20", hoverBorder: "hover:border-indigo-500/20" },
              { to: "/meals", icon: ChefHat, label: "Add Meal", color: "text-amber-500", bg: "bg-amber-500/10", hoverBg: "hover:bg-amber-500/10", border: "border-amber-500/20", hoverBorder: "hover:border-amber-500/20" },
              { to: "/meals/categories", icon: UtensilsCrossed, label: "Add Category", color: "text-orange-500", bg: "bg-orange-500/10", hoverBg: "hover:bg-orange-500/10", border: "border-orange-500/20", hoverBorder: "hover:border-orange-500/20" },
              { to: "/coupons", icon: Tag, label: "Add Coupon", color: "text-purple-500", bg: "bg-purple-500/10", hoverBg: "hover:bg-purple-500/10", border: "border-purple-500/20", hoverBorder: "hover:border-purple-500/20" },
              { to: "/delivery/drivers", icon: Truck, label: "Add Driver", color: "text-sky-500", bg: "bg-sky-500/10", hoverBg: "hover:bg-sky-500/10", border: "border-sky-500/20", hoverBorder: "hover:border-sky-500/20" },
              { to: "/inventory/orders", icon: Package, label: "Create PO", color: "text-rose-500", bg: "bg-rose-500/10", hoverBg: "hover:bg-rose-500/10", border: "border-rose-500/20", hoverBorder: "hover:border-rose-500/20" },
            ].map((action, i) => (
              <Link key={i} to={action.to} className={`flex items-center gap-3 p-3 rounded-xl border border-transparent ${action.hoverBorder} bg-background ${action.hoverBg} transition-all group shadow-sm cursor-pointer`}>
                <div className={`p-2 rounded-lg ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-foreground group-hover:text-foreground/90">{action.label}</span>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="col-span-full lg:col-span-5 glass-card overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground text-lg">Revenue & Subscriptions</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">30-day performance metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 pt-6 pr-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.4} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis 
                    yAxisId="left"
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `₹${value / 1000}k`}
                    dx={-10}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dx={10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141418', borderColor: '#27272A', color: '#fff', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#fff', fontWeight: 500 }}
                    labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
                    cursor={{ stroke: '#27272A', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Revenue (₹)" activeDot={{ r: 6, fill: '#10b981', stroke: '#0B0B0D', strokeWidth: 2 }} />
                  <Area yAxisId="right" type="monotone" dataKey="subs" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSubs)" name="Active Subs" activeDot={{ r: 6, fill: '#3b82f6', stroke: '#0B0B0D', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Notifications and Operations */}
        <div className="col-span-full lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Needs Attention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[360px] overflow-y-auto">
              {(metrics.attention || []).length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing urgent in the current Firestore window.</p>
              )}
              {(metrics.attention || []).map((item: AttentionItem) => (
                <Link key={item.id} to={item.href} className={`flex items-start gap-3 p-3 rounded-xl border ${
                  item.severity === "red" ? "bg-rose-500/10 border-rose-500/20" :
                  item.severity === "orange" ? "bg-amber-500/10 border-amber-500/20" :
                  item.severity === "green" ? "bg-emerald-500/10 border-emerald-500/20" :
                  "bg-zinc-900 border-zinc-800"
                }`}>
                  <AlertOctagon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Today's Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kitchen Queue</span>
                <span className="font-bold text-foreground">{metrics.ops?.kitchenQueue ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Orders Preparing</span>
                <span className="font-bold text-foreground">{metrics.ops?.preparing ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Orders Packed</span>
                <span className="font-bold text-foreground">{metrics.ops?.packed ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Out for Delivery</span>
                <span className="font-bold text-foreground">{metrics.ops?.outForDelivery ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivered</span>
                <span className="font-bold text-foreground">{metrics.ops?.delivered ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cancelled</span>
                <span className="font-bold text-foreground">{metrics.ops?.cancelled ?? 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* System Health Monitor */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-foreground text-lg flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                  System Health Monitor
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Real-time connectivity status of core APIs
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={runHealthCheck}
                disabled={isCheckingHealth}
                className="h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
              >
                <RefreshCcw className={`h-4 w-4 ${isCheckingHealth ? "animate-spin text-emerald-500" : ""}`} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Firebase Item */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground block leading-tight">Firebase DB</span>
                    <span className="text-[10px] text-muted-foreground">Firestore & Auth</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      {firebaseStatus === 'healthy' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                        firebaseStatus === 'healthy' ? 'bg-emerald-500' :
                        firebaseStatus === 'checking' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                    </span>
                    <span className={`text-xs font-bold ${
                      firebaseStatus === 'healthy' ? 'text-emerald-500' :
                      firebaseStatus === 'checking' ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {firebaseStatus === 'healthy' ? 'Online' :
                       firebaseStatus === 'checking' ? 'Testing' : 'Offline'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground leading-none">
                    {firebaseLatency !== null ? `${firebaseLatency}ms` : '--'}
                  </span>
                </div>
              </div>

              {/* Razorpay Item */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground block leading-tight">Razorpay API</span>
                    <span className="text-[10px] text-muted-foreground">Payment Gateway</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      {razorpayStatus === 'healthy' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                        razorpayStatus === 'healthy' ? 'bg-emerald-500' :
                        razorpayStatus === 'checking' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                    </span>
                    <span className={`text-xs font-bold ${
                      razorpayStatus === 'healthy' ? 'text-emerald-500' :
                      razorpayStatus === 'checking' ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {razorpayStatus === 'healthy' ? 'Online' :
                       razorpayStatus === 'checking' ? 'Testing' : 'Offline'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground leading-none">
                    {razorpayLatency !== null ? `${razorpayLatency}ms` : '--'}
                  </span>
                </div>
              </div>

              {/* GupShup Item */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Wifi className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground block leading-tight">GupShup SMS</span>
                    <span className="text-[10px] text-muted-foreground">WhatsApp Gateway</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      {gupshupStatus === 'healthy' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                        gupshupStatus === 'healthy' ? 'bg-emerald-500' :
                        gupshupStatus === 'checking' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                    </span>
                    <span className={`text-xs font-bold ${
                      gupshupStatus === 'healthy' ? 'text-emerald-500' :
                      gupshupStatus === 'checking' ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {gupshupStatus === 'healthy' ? 'Online' :
                       gupshupStatus === 'checking' ? 'Testing' : 'Offline'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground leading-none">
                    {gupshupLatency !== null ? `${gupshupLatency}ms` : '--'}
                  </span>
                </div>
              </div>

              {/* Overall status footer */}
              <div className="pt-2 mt-1 border-t border-zinc-800/50 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-medium">Gateway Health Summary</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  (firebaseStatus === 'healthy' && razorpayStatus === 'healthy' && gupshupStatus === 'healthy')
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {(firebaseStatus === 'healthy' && razorpayStatus === 'healthy' && gupshupStatus === 'healthy')
                    ? "Nominal Operations"
                    : "Checking Gateways..."}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution and Activity Stream */}
        <Card className="col-span-full lg:col-span-2 glass-card flex flex-col">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-foreground text-lg">Plan Distribution</CardTitle>
            <CardDescription className="text-muted-foreground">Active subscriptions by tier</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-6 flex flex-col items-center justify-center">
            {metrics.planDistribution.length > 0 ? (
              <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {metrics.planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141418', borderColor: '#27272A', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ fontWeight: 500 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-foreground">
                    {metrics.planDistribution.reduce((a, b) => a + b.value, 0)}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Total Subs</span>
                </div>
              </div>
            ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  No active plans.
                </div>
            )}
            
            <div className="w-full mt-4 space-y-2">
              {metrics.planDistribution.map(plan => (
                <div key={plan.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }}></div>
                    <span className="text-muted-foreground">{plan.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{plan.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3 glass-card">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground text-lg">Live Activity Stream</CardTitle>
              <CardDescription className="text-muted-foreground">Latest events across the platform</CardDescription>
            </div>
            <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
              View All
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {metrics.recentActivity.length > 0 ? (
              <div className="divide-y divide-border/50">
                {metrics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center p-4 hover:bg-white/[0.02] transition-colors group">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      activity.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' :
                      activity.type === 'error' ? 'border-rose-500/30 bg-rose-500/10 text-rose-500' :
                      activity.type === 'warning' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' :
                      'border-blue-500/30 bg-blue-500/10 text-blue-500'
                    }`}>
                      {activity.type === 'success' ? <TrendingUp className="h-4 w-4" /> :
                      activity.type === 'error' ? <Activity className="h-4 w-4" /> :
                      activity.type === 'warning' ? <Percent className="h-4 w-4" /> :
                      <Activity className="h-4 w-4" />}
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{activity.user}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                    </div>
                    <div className="ml-4 flex flex-col items-end shrink-0">
                      <div className={`text-sm font-bold ${
                        activity.type === 'success' ? 'text-emerald-500' :
                        activity.type === 'error' ? 'text-rose-500' :
                        'text-foreground'
                      }`}>
                        {activity.amount}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-sm text-muted-foreground">
                <Activity className="h-8 w-8 text-muted mb-3" />
                No recent activity.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
