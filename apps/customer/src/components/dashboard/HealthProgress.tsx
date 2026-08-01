import { motion } from "framer-motion";
import { Card } from "@/src/components/ui/primitives";
import { Activity, Flame, Droplets, BarChart3, CalendarDays } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { GoalProgressTracker } from "./GoalProgressTracker";

interface HealthProgressProps {
  data: any;
}

const weightHistory = [
  { day: 'Mon', weight: 74.2 },
  { day: 'Tue', weight: 74.0 },
  { day: 'Wed', weight: 73.8 },
  { day: 'Thu', weight: 73.9 },
  { day: 'Fri', weight: 73.5 },
  { day: 'Sat', weight: 73.2 },
  { day: 'Sun', weight: 73.0 },
];

export default function HealthProgress({ data }: HealthProgressProps) {
  const bmi = data.weight && data.height ? (data.weight / ((data.height / 100) * (data.height / 100))).toFixed(1) : '22.5';
  
  return (
    <div className="space-y-6">
      <GoalProgressTracker initialAssessment={data} />

      <Card className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-xl shadow-zinc-200/40 dark:shadow-none">
          <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-2xl text-zinc-900 dark:text-white tracking-tighter">Metabolic Progress</h3>
              <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Goal: {data.goal || 'Weight Loss'}
              </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-1">Current BMI</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{bmi}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mb-1">Weight Progress</p>
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{data.weight || 72} kg</p>
              </div>
          </div>

          <div className="space-y-6">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                      <Flame className="text-orange-500 w-6 h-6" />
                  </div>
                  <div className="flex-1">
                      <div className="flex justify-between">
                          <p className="text-sm font-black text-zinc-500 uppercase tracking-wider">Calories</p>
                          <p className="text-sm font-black text-zinc-900 dark:text-white">{data.calories || 1240} / {data.recommendedCalories || 2000}</p>
                      </div>
                      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2 relative overflow-hidden">
                          <motion.div 
                            initial={{width: 0}} 
                            animate={{width: `${((data.calories || 1240) / (data.recommendedCalories || 2000)) * 100}%`}} 
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" 
                          />
                      </div>
                  </div>
              </div>

              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                      <Activity className="text-blue-500 w-6 h-6" />
                  </div>
                  <div className="flex-1">
                      <div className="flex justify-between">
                          <p className="text-sm font-black text-zinc-500 uppercase tracking-wider">Protein</p>
                          <p className="text-sm font-black text-zinc-900 dark:text-white">{data.protein || 45}g / {data.recommendedProtein || 120}g</p>
                      </div>
                      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2 relative overflow-hidden">
                          <motion.div 
                            initial={{width: 0}} 
                            animate={{width: `${((data.protein || 45) / (data.recommendedProtein || 120)) * 100}%`}} 
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" 
                          />
                      </div>
                  </div>
              </div>

              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center">
                      <Droplets className="text-cyan-500 w-6 h-6" />
                  </div>
                  <div className="flex-1">
                      <div className="flex justify-between">
                          <p className="text-sm font-black text-zinc-500 uppercase tracking-wider">Water</p>
                          <p className="text-sm font-black text-zinc-900 dark:text-white">{data.waterIntake || 1.5}L / {data.recommendedWater || 3.5}L</p>
                      </div>
                      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2 relative overflow-hidden">
                          <motion.div 
                            initial={{width: 0}} 
                            animate={{width: `${((data.waterIntake || 1.5) / (data.recommendedWater || 3.5)) * 100}%`}} 
                            className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" 
                          />
                      </div>
                  </div>
              </div>
          </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-6 text-zinc-400">
                <BarChart3 className="w-5 h-5" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Weight Trend</h4>
            </div>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightHistory}>
                        <defs>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip cursor={false} contentStyle={{ background: '#000', borderRadius: '1rem', border: 'none', color: '#fff' }} />
                        <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
        <Card className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex flex-col items-center justify-center text-center gap-4">
             <CalendarDays className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
             <div>
                <p className="text-lg font-black text-zinc-900 dark:text-white">Monthly Report</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Ready for Download</p>
             </div>
             <button className="text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-3 rounded-2xl mt-2 hover:opacity-90">
                View Report
             </button>
        </Card>
      </div>
    </div>
  );
}
