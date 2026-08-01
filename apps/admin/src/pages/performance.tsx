import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gauge, Activity, Smile, Target, Clock, Zap, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie } from "recharts";
import { PerformanceMetricsCard } from "../components/dashboard/performance-metrics-card";

const slaData = [
  { time: '08:00', compliance: 98, target: 95 },
  { time: '10:00', compliance: 97, target: 95 },
  { time: '12:00', compliance: 92, target: 95 },
  { time: '14:00', compliance: 88, target: 95 },
  { time: '16:00', compliance: 94, target: 95 },
  { time: '18:00', compliance: 99, target: 95 },
  { time: '20:00', compliance: 96, target: 95 },
];

const satisfactionData = [
  { name: '5 Star', value: 75, color: '#10b981' },
  { name: '4 Star', value: 15, color: '#3b82f6' },
  { name: '3 Star', value: 7, color: '#f59e0b' },
  { name: '2 Star', value: 2, color: '#ef4444' },
  { name: '1 Star', value: 1, color: '#7f1d1d' },
];

const issueData = [
  { name: 'Late Delivery', count: 45 },
  { name: 'Cold Food', count: 32 },
  { name: 'Missing Item', count: 18 },
  { name: 'App Error', count: 12 },
  { name: 'Rude Rider', count: 8 },
];

export default function PerformancePage() {
  const [timeRange, setTimeRange] = useState("Today");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Metrics</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time SLA tracking, quality metrics, and satisfaction scores.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition">
            {timeRange} <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Overall SLA", value: "96.4%", target: "Target: 95%", status: "good", icon: Activity, bg: "bg-emerald-500/10", color: "text-emerald-500" },
          { title: "Prep Time (Avg)", value: "14m", target: "Target: <15m", status: "good", icon: Clock, bg: "bg-blue-500/10", color: "text-blue-500" },
          { title: "CSAT Score", value: "4.8/5", target: "Target: 4.5", status: "good", icon: Smile, bg: "bg-purple-500/10", color: "text-purple-500" },
          { title: "Defect Rate", value: "2.1%", target: "Target: <2%", status: "warning", icon: AlertTriangle, bg: "bg-amber-500/10", color: "text-amber-500" },
        ].map((item, i) => (
          <Card key={i} className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/60 shadow-xl overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{item.title}</CardTitle>
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{item.value}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs font-medium text-zinc-500">{item.target}</p>
                {item.status === 'good' ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* High-Level Performance Observer & System Load Card */}
      <PerformanceMetricsCard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 bg-zinc-900/40 border-zinc-800/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-base">SLA Compliance Trend</CardTitle>
            <CardDescription className="text-zinc-500">Hourly delivery compliance against 95% target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={slaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} 
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="compliance" name="Actual SLA %" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="step" dataKey="target" name="Target (95%)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-base">Satisfaction Distribution</CardTitle>
            <CardDescription className="text-zinc-500">Based on recent 1,000 ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} 
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {satisfactionData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-zinc-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 bg-zinc-900/40 border-zinc-800/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-base">Top Defect Categories</CardTitle>
            <CardDescription className="text-zinc-500">Areas requiring operational improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issueData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} 
                    cursor={{ fill: '#27272a', opacity: 0.4 }} 
                  />
                  <Bar dataKey="count" name="Incidents" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                    {issueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
