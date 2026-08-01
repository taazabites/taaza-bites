import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { HealthAssessmentService } from "../firebase/services";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PageHeader } from "../components/dashboard/PageHeader";
import { PageTransition } from "../components/dashboard/PageTransition";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import { Activity, Scale, TrendingDown, Target, Zap, Flame, CalendarDays, Download, ChevronRight } from "lucide-react";
import { Button, Card } from "../components/ui/primitives";
import { calculateBMI, getBMICategory } from "../lib/nutrition-utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ProgressPage() {
  const { currentUser } = useAuth();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (currentUser) {
        const data = await HealthAssessmentService.getLastAssessment(currentUser.uid);
        setAssessment(data);
      }
      setLoading(false);
    }
    loadData();
  }, [currentUser]);

  // Mock data for charts
  const weightData = [
    { name: 'Week 1', weight: 76.5 },
    { name: 'Week 2', weight: 75.8 },
    { name: 'Week 3', weight: 75.1 },
    { name: 'Week 4', weight: 74.5 },
    { name: 'Now', weight: 74.2 },
  ];

  const nutritionData = [
    { name: 'Mon', calories: 2100, protein: 140 },
    { name: 'Tue', calories: 2200, protein: 145 },
    { name: 'Wed', calories: 2050, protein: 138 },
    { name: 'Thu', calories: 2300, protein: 150 },
    { name: 'Fri', calories: 2150, protein: 142 },
    { name: 'Sat', calories: 2400, protein: 160 },
    { name: 'Sun', calories: 2250, protein: 145 },
  ];

  const currentWeight = assessment?.weight || 74.2;
  const targetWeight = assessment?.targetWeight || 70;
  const height = assessment?.height || 175;
  const currentBmi = assessment?.bmi || calculateBMI(currentWeight, height);
  const bmiCat = assessment?.bmiCategory || getBMICategory(Number(currentBmi));

  const downloadReport = () => {
     const doc = new jsPDF();
     doc.setFontSize(18);
     doc.text("Monthly Progress Report", 14, 22);
     doc.setFontSize(12);
     doc.text(`Client: ${assessment?.fullName || 'User'}`, 14, 32);
     doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 38);
     
     autoTable(doc, {
        startY: 50,
        head: [['Metric', 'Current', 'Target']],
        body: [
           ['Weight', `${currentWeight} kg`, `${targetWeight} kg`],
           ['BMI', currentBmi, '18.5 - 24.9'],
           ['Daily Calories', `${assessment?.recommendedCalories || 2200} kcal`, '-'],
           ['Daily Protein', `${assessment?.recommendedProtein || 140} g`, '-']
        ]
     });
     
     doc.save("TaazaBites-Monthly-Report.pdf");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="max-w-6xl mx-auto pb-24 space-y-6">
          <PageHeader 
            title="Health Journey"
            description="Track your transformation and biological markers."
            badge="Progress"
            icon={Activity}
            gradient="from-emerald-950 via-zinc-900 to-zinc-950"
          >
             <Button onClick={downloadReport} className="h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 font-bold text-[10px] uppercase tracking-widest px-4">
                <Download className="w-4 h-4 mr-2" /> Report
             </Button>
          </PageHeader>

          {/* Core Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Card className="p-5 rounded-3xl bg-zinc-900 dark:bg-zinc-900 border-zinc-800 text-white shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                   <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Scale className="w-4 h-4 text-blue-400" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Weight</span>
                </div>
                <div>
                   <p className="text-3xl font-black tracking-tight">{currentWeight}<span className="text-sm font-bold text-zinc-500 ml-1">kg</span></p>
                   <p className="text-[10px] font-bold text-blue-400 mt-1 uppercase">Target: {targetWeight} kg</p>
                </div>
             </Card>

             <Card className="p-5 rounded-3xl bg-emerald-600 border-emerald-500 text-white shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                   <div className="w-8 h-8 rounded-xl bg-emerald-900/40 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-emerald-200" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">BMI</span>
                </div>
                <div>
                   <p className="text-3xl font-black tracking-tight">{currentBmi}</p>
                   <p className="text-[10px] font-bold text-emerald-100 mt-1 uppercase">{bmiCat}</p>
                </div>
             </Card>

             <Card className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                   <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-orange-500" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Calories</span>
                </div>
                <div>
                   <p className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">{assessment?.recommendedCalories || 2200}</p>
                   <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase">Daily Avg</p>
                </div>
             </Card>

             <Card className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                   <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-500" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Protein</span>
                </div>
                <div>
                   <p className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">{assessment?.recommendedProtein || 140}<span className="text-sm font-bold text-zinc-500 ml-1">g</span></p>
                   <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase">Daily Avg</p>
                </div>
             </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Weight Trend Chart */}
             <Card className="p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                         <TrendingDown className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Weight Trend</h3>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Last 30 Days</p>
                      </div>
                   </div>
                   <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                      -2.3 kg
                   </div>
                </div>

                <div className="h-[250px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weightData}>
                         <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                         <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} dx={-10} />
                         <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(24, 24, 27, 0.9)', color: '#fff', fontWeight: 'bold' }}
                            itemStyle={{ color: '#60a5fa' }}
                         />
                         <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </Card>

             {/* Nutrition Adherence Chart */}
             <Card className="p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                         <Target className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Macro Adherence</h3>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Weekly View</p>
                      </div>
                   </div>
                </div>

                <div className="h-[250px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={nutritionData} barSize={12}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                         <YAxis yAxisId="left" orientation="left" stroke="#f97316" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                         <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                         <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(24, 24, 27, 0.9)', color: '#fff', fontWeight: 'bold' }}
                         />
                         <Bar yAxisId="left" dataKey="calories" fill="#f97316" radius={[6, 6, 6, 6]} />
                         <Bar yAxisId="right" dataKey="protein" fill="#8b5cf6" radius={[6, 6, 6, 6]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
                
                <div className="flex justify-center gap-6 mt-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Calories</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Protein</span>
                   </div>
                </div>
             </Card>
          </div>

          <Card className="bg-zinc-900 p-8 rounded-[3rem] text-white overflow-hidden relative border border-white/5">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-4">
                      <CalendarDays className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Monthly Report</span>
                   </div>
                   <h3 className="text-2xl font-black tracking-tight mb-2">Ready for Review</h3>
                   <p className="text-zinc-400 text-sm max-w-md font-medium">Your metabolic performance for this month has been analyzed. Download your personalized PDF report.</p>
                </div>
                <Button onClick={downloadReport} className="h-14 px-8 rounded-2xl bg-white text-zinc-900 hover:bg-zinc-100 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform shrink-0">
                   <Download className="w-5 h-5" /> Download PDF
                </Button>
             </div>
          </Card>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
