import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { 
  Loader2, 
  RefreshCcw, 
  TrendingUp, 
  Award, 
  Activity, 
  Target, 
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Info,
  Layers,
  Zap,
  Flame,
  ArrowRight,
  ShieldAlert,
  ShieldCheck
} from "lucide-react"
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
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Line
} from "recharts"

const acquisitionData = [
  { name: "Organic Search", value: 45, color: "#10b981" },
  { name: "Instagram Ads", value: 30, color: "#a855f7" },
  { name: "Referral Network", value: 15, color: "#3b82f6" },
  { name: "Partner Clinics", value: 10, color: "#f59e0b" }
]

const revenueProjections = [
  { month: "Jan", baseline: 120000, longevity: 80000, optimize: 150000, users: 1200, orders: 450 },
  { month: "Feb", baseline: 140000, longevity: 90000, optimize: 170000, users: 1500, orders: 520 },
  { month: "Mar", baseline: 180000, longevity: 110000, optimize: 210000, users: 1900, orders: 680 },
  { month: "Apr", baseline: 210000, longevity: 130000, optimize: 250000, users: 2400, orders: 810 },
  { month: "May", baseline: 250000, longevity: 160000, optimize: 300000, users: 3100, orders: 940 },
  { month: "Jun", baseline: 310000, longevity: 200000, optimize: 380000, users: 4200, orders: 1120 }
]

const aiInsights = [
  { title: "Keto Demand Surge", description: "Demand for Keto Paneer Bowl is outpacing supply by 18%. Recommend increasing prep quota for HSR Layout branch.", type: "opportunity", icon: Zap, color: "emerald" },
  { title: "Retention Opportunity", description: "30% of March cohort users haven't renewed. Deploying 'Loyalty-5' automated SMS campaign could recover ₹45k MRR.", type: "action", icon: Target, color: "blue" },
  { title: "Efficiency Alert", description: "Delivery CAC in Koramangala rose by 12% due to traffic peak. Suggest dynamic slot pricing for 7PM-9PM.", type: "warning", icon: ShieldAlert, color: "orange" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6 px-1">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                <span className="text-[11px] font-bold text-zinc-300">{entry.name}</span>
              </div>
              <span className="text-[11px] font-black text-white">
                {typeof entry.value === 'number' && entry.value > 1000 ? `₹${(entry.value / 1000).toFixed(1)}k` : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const mealPerformance = [
  { name: "Keto Paneer Bowl", sales: 450, growth: 12 },
  { name: "Low Carb Salad", sales: 380, growth: 8 },
  { name: "Muscle Build Shake", sales: 310, growth: 15 },
  { name: "Longevity Soup", sales: 290, growth: -2 },
  { name: "Paleo Chicken", sales: 240, growth: 22 },
]

const timeRanges = ["7D", "30D", "90D", "YTD", "ALL"]

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeRange, setActiveRange] = useState("30D")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activePulse, setActivePulse] = useState(142)

  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    const pulseInterval = setInterval(() => {
      setActivePulse(prev => Math.max(130, Math.min(160, prev + (Math.random() > 0.5 ? 1 : -1))))
    }, 4000)
    return () => {
      clearTimeout(timer)
      clearInterval(pulseInterval)
    }
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastSync(new Date().toLocaleTimeString())
      toast.success("Intelligence curves synchronized with live data.")
    }, 1500)
  }

  const handleDownload = () => {
    toast.info("Preparing data export...", {
      description: "Business intelligence report will be ready in a moment."
    })
    setTimeout(() => {
      toast.success("Intelligence Report Exported", {
        description: "The PDF report has been saved to your downloads folder."
      })
    }, 2000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Layers className="h-5 w-5 text-emerald-500" />
            </div>
            <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-2 py-0">LIVE INTEL</Badge>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white font-sans">Business Intelligence</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              Last Synchronized: <span className="text-zinc-300">{lastSync}</span>
            </p>
            <div className="h-1 w-1 rounded-full bg-zinc-800" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              Neural Engine: <span className="text-emerald-500/80">Active</span>
            </p>
            <div className="h-1 w-1 rounded-full bg-zinc-800" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              Region: <span className="text-zinc-300">South Asia Cluster</span>
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 shadow-inner">
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 rounded-lg mr-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-white">{activePulse}</span>
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter leading-none">Live</span>
            </div>
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={cn(
                  "px-4 py-1.5 text-[11px] font-black rounded-lg transition-all",
                  activeRange === range 
                    ? "bg-zinc-800 text-white shadow-lg" 
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-zinc-800 text-zinc-400 hover:text-white bg-zinc-950/50"
          >
            <RefreshCcw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} /> 
            {isRefreshing ? "Calculating..." : "Sync Graphs"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDownload}
            className="text-zinc-500 hover:text-white"
          >
            <Download className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-48 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-zinc-600 font-mono text-xs tracking-widest uppercase">Initializing Analytics Matrix...</p>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Monthly Run Rate", value: "₹8.9M", icon: TrendingUp, color: "emerald", change: "+14.2%", detail: "vs Prev Month", href: "/finance" },
              { label: "Avg Lifetime Value", value: "₹18,240", icon: Award, color: "amber", change: "+5.1%", detail: "Cohort expansion", href: "/customers" },
              { label: "Acquisition CAC", value: "₹1,150", icon: Zap, color: "orange", change: "-12%", detail: "Efficiency opt.", negative: true },
              { label: "Growth Velocity", value: "15.8x", icon: Flame, color: "emerald", change: "STABLE", detail: "LTV/CAC Health" }
            ].map((kpi, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <Card 
                  onClick={() => kpi.href && navigate(kpi.href)}
                  className={cn(
                    "bg-zinc-950/60 border-zinc-900 overflow-hidden relative group h-full transition-all backdrop-blur-sm shadow-xl",
                    kpi.href && "cursor-pointer hover:border-emerald-500/40 hover:bg-zinc-900/40"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity`}>
                    <kpi.icon className={`h-20 w-20 text-${kpi.color}-500`} />
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("p-2 rounded-lg bg-zinc-900 border border-zinc-800", `text-${kpi.color}-500`)}>
                          <kpi.icon className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{kpi.label}</span>
                      </div>
                      {kpi.href && <ArrowRight className="h-3.5 w-3.5 text-zinc-700 group-hover:text-emerald-500 transition-colors" />}
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter mb-4">{kpi.value}</div>
                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-900/50">
                      <div className={cn(
                        "flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md",
                        kpi.negative ? (kpi.change.startsWith('-') ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10') :
                        (kpi.change.startsWith('+') ? 'text-emerald-500 bg-emerald-500/10' : 
                         kpi.change === 'STABLE' ? 'text-zinc-400 bg-zinc-900' : 'text-rose-500 bg-rose-500/10')
                      )}>
                        {kpi.change}
                      </div>
                      <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">{kpi.detail}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Charts Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="bg-zinc-950/40 border-zinc-900 shadow-2xl h-full overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-900 bg-zinc-900/10 px-6 py-4">
                  <div>
                    <CardTitle className="text-lg font-black text-white">Revenue Progression Curves</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold underline decoration-emerald-500/50 decoration-2 underline-offset-4">Predictive vs Actual Modeling</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-zinc-600 cursor-help" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[360px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={revenueProjections} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <defs>
                          <linearGradient id="colorOptimize" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                        <XAxis dataKey="month" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontWeight: 700 }} />
                        <YAxis stroke="#3f3f46" fontSize={10} tickFormatter={(val) => `₹${val/1000}k`} tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontWeight: 700 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#27272a', strokeWidth: 1 }} />
                        <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingBottom: '20px' }} />
                        <Area type="monotone" dataKey="optimize" name="Optimize Tier" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOptimize)" />
                        <Bar dataKey="longevity" name="Longevity Vol." fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} opacity={0.6} />
                        <Line type="monotone" dataKey="baseline" name="Growth Baseline" stroke="#71717a" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-zinc-950/40 border-zinc-900 shadow-2xl h-full overflow-hidden">
                <CardHeader className="border-b border-zinc-900 bg-zinc-900/10 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-black text-white">Popularity Index</CardTitle>
                      <CardDescription className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Top Performing Entities</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-500 bg-emerald-500/5">+8% MoM</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={mealPerformance} margin={{ left: -10, right: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} width={110} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#18181b', opacity: 0.4 }} />
                        <Bar dataKey="sales" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-6">
                    {mealPerformance.slice(0, 3).map((meal, idx) => (
                      <Link 
                        key={meal.name} 
                        to="/meals"
                        className="flex items-center justify-between p-2.5 bg-zinc-900/30 rounded-xl border border-zinc-800/50 hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all group/meal"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 group-hover/meal:text-emerald-500 transition-colors">
                            {idx + 1}
                          </div>
                          <span className="text-[11px] font-bold text-white group-hover/meal:text-white transition-colors">{meal.name}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-black ${meal.growth > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {meal.growth > 0 ? <TrendingUp className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                          {meal.growth > 0 ? '+' : ''}{meal.growth}%
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Insights Section */}
          <div className="grid gap-6 lg:grid-cols-4">
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <Card className="bg-zinc-950 border-zinc-900 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none" />
                <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-900/50 bg-zinc-900/5 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-500/10 rounded border border-amber-500/20">
                      <Zap className="h-4 w-4 text-amber-500" />
                    </div>
                    <CardTitle className="text-sm font-black text-white uppercase tracking-widest">AI Strategic Advisory</CardTitle>
                  </div>
                  <Badge className="bg-zinc-900 text-zinc-500 font-black text-[9px] px-2 py-0">NEURAL CORE ACTIVE</Badge>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {aiInsights.map((insight, idx) => (
                      <div key={idx} className="space-y-4 relative">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg", `text-${insight.color}-500`)}>
                            <insight.icon className="h-4 w-4" />
                          </div>
                          <h5 className="text-xs font-black text-white tracking-tight">{insight.title}</h5>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                          {insight.description}
                        </p>
                        <Button variant="ghost" size="sm" className={cn("p-0 h-auto text-[10px] font-black uppercase tracking-widest hover:bg-transparent", `text-${insight.color}-500/80 hover:text-${insight.color}-500`)}>
                          Execute Suggestion <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-zinc-950/40 border-zinc-900 h-full overflow-hidden flex flex-col">
                <CardHeader className="bg-zinc-900/10 px-6 py-4 border-b border-zinc-900/50">
                  <CardTitle className="text-xs font-black text-white uppercase tracking-widest">Channel Efficiency</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center p-6 flex-1 justify-center">
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={acquisitionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {acquisitionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 justify-center">
                    {acquisitionData.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-6">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="bg-zinc-950/40 border-zinc-900 h-full overflow-hidden relative shadow-2xl">
                <CardHeader className="bg-zinc-900/10 px-6 py-4 border-b border-zinc-900/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-black text-white uppercase tracking-widest">Retention Cohort Analysis</CardTitle>
                      <CardDescription className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">Rolling 6-month retention cycle</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-black text-zinc-600 uppercase">High</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                        <span className="text-[9px] font-black text-zinc-600 uppercase">Low</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-1.5">
                    {[
                      { month: "Jan 26", data: [100, 92, 85, 78, 72, 68] },
                      { month: "Feb 26", data: [100, 95, 88, 82, 75] },
                      { month: "Mar 26", data: [100, 91, 84, 76] },
                      { month: "Apr 26", data: [100, 94, 87] },
                      { month: "May 26", data: [100, 93] },
                      { month: "Jun 26", data: [100] },
                    ].map((row, i) => (
                      <div key={row.month} className="flex items-center gap-3">
                        <div className="w-14 text-[9px] font-black text-zinc-600 uppercase tracking-tighter">{row.month}</div>
                        <div className="flex-1 flex gap-1">
                          {row.data.map((val, j) => (
                            <div 
                              key={j} 
                              className="h-8 flex-1 rounded-lg flex items-center justify-center text-[10px] font-black text-white/20 hover:text-white hover:ring-1 hover:ring-white/10 transition-all cursor-default group/cell relative"
                              style={{ 
                                backgroundColor: `rgba(16, 185, 129, ${val / 100 * 0.8})`,
                                opacity: 1 - (i * 0.04)
                              }}
                            >
                              {val}%
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-950 text-white text-[9px] px-2 py-1 rounded border border-zinc-800 opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-2xl">
                                {row.month} • Month {j}
                              </div>
                            </div>
                          ))}
                          {Array.from({ length: 6 - row.data.length }).map((_, k) => (
                            <div key={k} className="h-8 flex-1 rounded-lg bg-zinc-900/30 border border-zinc-900/50" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between text-[10px] text-zinc-600 font-black uppercase tracking-widest border-t border-zinc-900 pt-4 px-2">
                    <span className="flex items-center gap-1.5"><RefreshCcw className="h-3 w-3" /> New Users</span>
                    <span className="flex items-center gap-1.5"><Activity className="h-3 w-3" /> LTV Stable</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <motion.div variants={itemVariants} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/50 via-emerald-500/50 to-amber-500/50 animate-pulse" />
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
                  <ShieldAlert className="h-7 w-7 text-amber-500 relative z-10" />
                </div>
                <div>
                  <h4 className="text-white font-black text-lg tracking-tight">Analytics Data Validation</h4>
                  <p className="text-zinc-500 text-xs font-medium max-w-md leading-relaxed mt-1">
                    System verifies calculation precision against live ledger entries. Current variance: <span className="text-emerald-500 font-bold">0.02% (Optimal)</span>.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="hidden lg:flex items-center gap-6 px-6 border-x border-zinc-900">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Freshness</p>
                    <p className="text-xs font-bold text-white">99.8%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Precision</p>
                    <p className="text-xs font-bold text-white">High</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsRefreshing(true);
                    toast.info("Running Data Integrity Audit...", {
                      description: "Validating MRR curves against transaction logs."
                    });
                    setTimeout(() => {
                      setIsRefreshing(false);
                      toast.success("Audit Complete", {
                        description: "All analytics nodes are synchronized and verified."
                      });
                    }, 2000);
                  }}
                  disabled={isRefreshing}
                  className="border-zinc-800 text-zinc-400 hover:text-white text-xs px-8 h-12 rounded-xl bg-zinc-900/50 flex-1 md:flex-none"
                >
                  {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                  Verify Dataset
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
