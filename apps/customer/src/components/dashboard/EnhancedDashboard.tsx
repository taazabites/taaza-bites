import { motion } from 'motion/react';
import { TrendingUp, Users, DollarSign, Package } from 'lucide-react';

export default function EnhancedDashboard() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '₹1,24,500',
      change: '+12.5%',
      icon: DollarSign,
      color: 'from-green-400 to-green-600',
      chart: [20, 40, 30, 50, 40, 60, 70],
    },
    {
      title: 'Active Subscriptions',
      value: '1,243',
      change: '+8.2%',
      icon: Users,
      color: 'from-blue-400 to-blue-600',
      chart: [30, 40, 35, 50, 45, 60, 65],
    },
    {
      title: 'Meals Delivered',
      value: '5,678',
      change: '+15.3%',
      icon: Package,
      color: 'from-purple-400 to-purple-600',
      chart: [25, 35, 45, 40, 50, 55, 60],
    },
    {
      title: 'Customer Satisfaction',
      value: '4.7★',
      change: '+0.2',
      icon: TrendingUp,
      color: 'from-orange-400 to-orange-600',
      chart: [40, 45, 50, 55, 60, 65, 70],
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Stats Grid - Horizontal Scroll on Mobile */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:pb-0 md:snap-none">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0 w-[85vw] sm:w-[280px] snap-start bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{stat.change}</span>
            </div>
            
            <div className="mb-4">
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.title}</h3>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
            
            {/* Mini Chart */}
            <div className="flex items-end gap-1 h-12">
              {stat.chart.map((height, j) => (
                <motion.div
                  key={j}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: j * 0.05 + i * 0.1, duration: 1 }}
                  className={`flex-1 bg-gradient-to-t ${stat.color} rounded-t-sm`}
                  style={{ minHeight: '4px' }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Recent Activity placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100"
      >
        <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">System Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Real-time Fulfillment</span>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed">
                    Logistics engine is currently operating at <span className="text-slate-900 font-bold">98.4% efficiency</span>. 
                    Average delivery time across Bengaluru tech hubs is <span className="text-slate-900 font-bold">28.5 minutes</span>.
                </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Subscriber Growth</span>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed">
                    Customer acquisition cost has decreased by <span className="text-slate-900 font-bold">14%</span> this quarter. 
                    Referral program contributing to <span className="text-slate-900 font-bold">32%</span> of new signups.
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
