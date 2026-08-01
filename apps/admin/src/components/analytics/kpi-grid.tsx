import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Activity, 
  HeartHandshake, 
  UserPlus 
} from "lucide-react"
import { KPIMetrics } from "../../utils/analytics-helpers"

interface KPIGridProps {
  metrics: KPIMetrics;
}

export default function KPIGrid({ metrics }: KPIGridProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: `₹${metrics.totalRevenue.toLocaleString("en-IN")}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      desc: "Gross successful income"
    },
    {
      title: "Total Customers",
      value: metrics.totalCustomers.toString(),
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      desc: "All registered clients"
    },
    {
      title: "Active Subscribers",
      value: metrics.activeSubscribers.toString(),
      icon: Calendar,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      desc: "Active nutritional plan users"
    },
    {
      title: "Total Orders",
      value: metrics.totalOrders.toString(),
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      desc: "All historical meal orders"
    },
    {
      title: "Delivered Orders",
      value: metrics.deliveredOrders.toString(),
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      desc: "Dispatched & successfully completed"
    },
    {
      title: "Cancelled Orders",
      value: metrics.cancelledOrders.toString(),
      icon: XCircle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      desc: "Refunded or terminated plans"
    },
    {
      title: "Avg Order Value (AOV)",
      value: `₹${Math.round(metrics.averageOrderValue).toLocaleString("en-IN")}`,
      icon: TrendingUp,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      desc: "Average spend per checkout"
    },
    {
      title: "Monthly Growth",
      value: `${metrics.monthlyGrowth >= 0 ? "+" : ""}${metrics.monthlyGrowth.toFixed(1)}%`,
      icon: Activity,
      color: metrics.monthlyGrowth >= 0 ? "text-emerald-500" : "text-rose-500",
      bg: metrics.monthlyGrowth >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
      desc: "Net active subscriber progression"
    },
    {
      title: "Customer Retention",
      value: `${metrics.customerRetention}%`,
      icon: HeartHandshake,
      color: "text-teal-400",
      bg: "bg-teal-400/10",
      desc: "Subscriptions to user ratio"
    },
    {
      title: "New Customers Today",
      value: metrics.newCustomersToday.toString(),
      icon: UserPlus,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      desc: "Registered within past 24 hours"
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
      {cards.map((card, idx) => (
        <Card key={idx} className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/80 hover:border-zinc-700/60 transition-all duration-300 shadow-sm relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
              {card.title}
            </CardTitle>
            <div className={`p-1.5 rounded-md ${card.bg} ${card.color}`}>
              <card.icon className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-bold text-white tracking-tight">
              {card.value}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">
              {card.desc}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
