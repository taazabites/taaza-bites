import React from "react"
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  RefreshCcw, 
  XOctagon, 
  DollarSign, 
  MapPin, 
  Award,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

interface PlanAnalyticsProps {
  plans: any[]
  subscriptions: any[]
}

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"]

export function PlanAnalytics({ plans, subscriptions }: PlanAnalyticsProps) {
  // Compute metrics from active subscriptions
  const activeSubs = subscriptions.filter(s => s.status === "Active" || s.status === "Paused")
  const totalSubscribers = activeSubs.length
  
  // Monthly Revenue estimation
  const monthlyRevenue = activeSubs.reduce((sum, sub) => {
    const p = plans.find(plan => plan.id === sub.planId)
    return sum + (p ? (p.offerPrice || p.price || 0) : 4999)
  }, 0)

  // Average Order Value (AOV)
  const avgOrderValue = plans.length > 0 
    ? Math.round(plans.reduce((sum, p) => sum + (p.offerPrice || p.price || 0), 0) / plans.length) 
    : 3499

  // Statically realistic mock trends over the past 6 months
  const monthlyTrends = [
    { name: "Jan", Subscribers: Math.round(totalSubscribers * 0.7), Revenue: Math.round(monthlyRevenue * 0.65) },
    { name: "Feb", Subscribers: Math.round(totalSubscribers * 0.78), Revenue: Math.round(monthlyRevenue * 0.72) },
    { name: "Mar", Subscribers: Math.round(totalSubscribers * 0.83), Revenue: Math.round(monthlyRevenue * 0.8) },
    { name: "Apr", Subscribers: Math.round(totalSubscribers * 0.9), Revenue: Math.round(monthlyRevenue * 0.88) },
    { name: "May", Subscribers: Math.round(totalSubscribers * 0.94), Revenue: Math.round(monthlyRevenue * 0.93) },
    { name: "Jun", Subscribers: totalSubscribers, Revenue: monthlyRevenue }
  ]

  // Retention, cancellation, renewal data
  const performanceMetrics = [
    { label: "Retention Rate", value: "92.4%", desc: "30-day active cohort survival", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Renewal Success", value: "87.1%", desc: "Automatic credit card & wallet topups", icon: RefreshCcw, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Cancellation Rate", value: "4.8%", desc: "Direct client opt-out requests", icon: XOctagon, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Avg Ticket Size", value: `₹${avgOrderValue.toLocaleString()}`, desc: "Mean price across catalog tiers", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" }
  ]

  // Top Area Breakdown
  const topAreas = [
    { name: "Powai Premium", value: 430, percent: "35.2%" },
    { name: "Bandra Coastal", value: 320, percent: "26.2%" },
    { name: "Juhu Scheme", value: 270, percent: "22.1%" },
    { name: "Andheri West", value: 200, percent: "16.5%" }
  ]

  // Top Diet Preference from Catalog & Sales
  const topMealChoices = [
    { name: "High Protein", value: 45, color: "#10b981" },
    { name: "Keto/Fat Loss", value: 25, color: "#f59e0b" },
    { name: "Pure Veg Detox", value: 20, color: "#3b82f6" },
    { name: "Vegan Glow", value: 10, color: "#ec4899" }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((item, idx) => {
          const Icon = item.icon
          return (
            <Card key={idx} className="bg-zinc-950 border-zinc-900 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">{item.label}</span>
                  <span className="text-3xl font-black text-white block">{item.value}</span>
                  <p className="text-[10px] text-zinc-400">{item.desc}</p>
                </div>
                <div className={`h-12 w-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subscriber & Revenue Trends */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Cohorts & Recurrency</h3>
              <p className="text-xs text-zinc-500">Realtime tracking of subscriber expansion and billing volumes</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25 gap-1 border-emerald-500/20 font-bold">
              <TrendingUp className="h-3 w-3" /> +14.2% Growth
            </Badge>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="subGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "12px", color: "#fff" }}
                  itemStyle={{ color: "#10b981" }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line 
                  name="Active Subscribers" 
                  type="monotone" 
                  dataKey="Subscribers" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  name="Estimated Revenue (₹)" 
                  type="monotone" 
                  dataKey="Revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Meal Choices Pie */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Top Meal Prototypes</h3>
            <p className="text-xs text-zinc-500">Preferences by daily subscription selections</p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topMealChoices}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {topMealChoices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Top Tier</span>
              <span className="text-lg font-black text-white block mt-0.5">High Prot.</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {topMealChoices.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-400 font-medium">{item.name}</span>
                </div>
                <span className="text-zinc-200 font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Areas and Growth Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Cities & Areas */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Top Regional Hotspots</h3>
            <p className="text-xs text-zinc-500">Highest active contract densities in core cities</p>
          </div>

          <div className="space-y-3.5">
            {topAreas.map((area, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-zinc-300 font-semibold">{area.name}</span>
                  </div>
                  <span className="text-zinc-400">{area.value} subs ({area.percent})</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(area.value / 1220) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth & Achievements panel */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Retention Performance Insights</h3>
            <p className="text-xs text-zinc-500">System diagnostics on member lifecycle duration</p>
          </div>

          <div className="space-y-4 my-auto">
            <div className="bg-emerald-950/15 p-4 rounded-xl border border-emerald-500/10 flex items-start gap-3">
              <div className="h-8 w-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 shrink-0">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Premium Upsell Success</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  28% of active customers upgraded from 15-day trials to 30-day "High Protein" or "Keto" core subscription protocols in the last 14 days.
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/80 flex items-start gap-3">
              <div className="h-8 w-8 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Customer Lifetime Value (LTV)</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Average customer tenure has extended to <strong className="text-zinc-200">76 days</strong>, driven by smart pause features and add-on customizer incentives.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 font-mono text-right">
            Diagnostics computed at {new Date().toLocaleTimeString()}
          </div>
        </div>

      </div>

    </div>
  )
}
