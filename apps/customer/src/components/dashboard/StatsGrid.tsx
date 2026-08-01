import { motion } from "framer-motion";
import { Zap, Wallet as WalletIcon, Gift, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/src/components/ui/primitives";

interface StatsGridProps {
  data: any;
}

export default function StatsGrid({ data }: StatsGridProps) {
  const getTier = (points: number) => {
    if (points >= 5000) return { name: "Diamond", color: "text-blue-600", bg: "bg-blue-50" };
    if (points >= 2000) return { name: "Gold", color: "text-amber-500", bg: "bg-amber-50" };
    if (points >= 1000) return { name: "Silver", color: "text-zinc-400", bg: "bg-zinc-50" };
    return { name: "Bronze", color: "text-orange-600", bg: "bg-orange-50" };
  };

  const tier = getTier(data.rewards?.currentPoints || 0);

  const stats = [
    { label: "Meals Left", value: data.subscription?.remainingMeals || 0, icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50", chartColor: "bg-emerald-500", chart: [30, 40, 35, 50, 45, 60, 65] },
    { label: "Wallet", value: `₹${data.wallet?.balance || 0}`, icon: WalletIcon, color: "text-orange-500", bg: "bg-orange-50", chartColor: "bg-orange-500", chart: [20, 40, 30, 50, 40, 60, 70] },
    { label: "Reward Points", value: data.rewards?.currentPoints || 0, icon: Gift, color: "text-amber-500", bg: "bg-amber-50", chartColor: "bg-amber-500", chart: [25, 35, 45, 40, 50, 55, 60] },
    { label: "Membership", value: tier.name, icon: Sparkles, color: tier.color, bg: tier.bg, chartColor: "bg-blue-500", chart: [40, 45, 50, 55, 60, 65, 70] },
  ];

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
    >
      {stats.map((stat, i) => (
        <Card key={i} className="p-5 md:p-6 bg-white rounded-[2.5rem] border-zinc-100 shadow-sm flex flex-col justify-between h-44 md:h-48 spring-interactive border-glow-hover overflow-hidden group relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-50 rounded-full -mr-12 -mt-12 group-hover:bg-zinc-100 transition-colors" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className={`p-2 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
            </div>
            <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <TrendingUp className="h-3 w-3" />
                <span>+12%</span>
            </div>
          </div>
          
          <div className="mt-4 relative z-10">
            <p className="text-[9px] md:text-[10px] text-zinc-400 font-black uppercase tracking-[0.15em] mb-1">{stat.label}</p>
            <h3 className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight">{stat.value}</h3>
          </div>
          
          {/* Mini Chart */}
          <div className="flex items-end gap-1 h-6 md:h-8 mt-4 relative z-10">
            {stat.chart.map((height, j) => (
              <motion.div
                key={j}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: j * 0.05 + i * 0.1, duration: 1 }}
                className={`flex-1 ${stat.chartColor}/10 group-hover:${stat.chartColor}/30 rounded-t-sm transition-all duration-500`}
                style={{ minHeight: '2px' }}
              />
            ))}
          </div>
        </Card>
      ))}
    </motion.div>
  );
}
