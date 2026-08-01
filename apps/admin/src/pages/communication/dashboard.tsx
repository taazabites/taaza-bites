import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Users, 
  MessageSquare, 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  Filter,
  Calendar
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { motion } from "framer-motion"
import { db } from "../../lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"

const data = [
  { name: 'Mon', sent: 4000, delivered: 3800, read: 2400 },
  { name: 'Tue', sent: 3000, delivered: 2900, read: 1800 },
  { name: 'Wed', sent: 2000, delivered: 1950, read: 1200 },
  { name: 'Thu', sent: 2780, delivered: 2700, read: 2100 },
  { name: 'Fri', sent: 1890, delivered: 1850, read: 1400 },
  { name: 'Sat', sent: 2390, delivered: 2300, read: 1900 },
  { name: 'Sun', sent: 3490, delivered: 3400, read: 2800 },
]

export default function CommunicationDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState([
    { label: "Total Reach", value: "0", trend: "0%", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Delivered", value: "0%", trend: "0%", icon: Send, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Read Rate", value: "0%", trend: "0%", icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Active Campaigns", value: "0", trend: "Stable", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
  ])

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "analytics", "dashboard"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.stats) {
          // Map real data to UI structure
          setStats(data.stats.map((s: any) => ({
             ...s,
             icon: Users, // Need better icon mapping
             color: "text-blue-500",
             bg: "bg-blue-500/10"
          })));
        }
      }
    });
    return unsub;
  }, [])

  const recentCampaigns = [
    { id: 1, name: "Diwali Special Offer", channel: "WhatsApp", status: "Running", reach: "12,000", conversion: "18.5%" },
    { id: 2, name: "Weekend Breakfast Push", channel: "Push", status: "Completed", reach: "8,400", conversion: "4.2%" },
    { id: 3, name: "New Menu Launch", channel: "Email", status: "Scheduled", reach: "24,000", conversion: "-" },
  ]

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white font-sans uppercase italic">Communication Center</h1>
          <p className="text-zinc-500 text-sm">Unified messaging dashboard and campaign analytics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:text-white" onClick={() => navigate('/communication/campaigns')}>
            <Calendar className="h-4 w-4 mr-2" /> Last 30 Days
          </Button>
          <Button className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]" onClick={() => navigate('/communication/campaigns')}>
            <Zap className="h-4 w-4 mr-2" /> New Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-zinc-950 border-zinc-900 overflow-hidden relative group">
              <div className={`absolute top-0 right-0 p-4 ${stat.bg} rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0`}>
                <stat.icon className={`h-12 w-12 ${stat.color} opacity-20`} />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <Badge variant="outline" className="border-zinc-800 text-emerald-500 text-[10px] bg-emerald-500/5">
                    {stat.trend} <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Badge>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tighter">{stat.value}</h3>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-zinc-950 border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg font-bold">Message Performance</CardTitle>
              <CardDescription className="text-zinc-500">Sent vs Delivered vs Read across all channels.</CardDescription>
            </div>
            <Tabs defaultValue="all" className="w-[200px]">
              <TabsList className="bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="wa" className="text-xs">WA</TabsTrigger>
                <TabsTrigger value="push" className="text-xs">Push</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-4 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} />
                <Area type="monotone" dataKey="read" stroke="#10b981" fillOpacity={1} fill="url(#colorRead)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-900">
          <CardHeader>
            <CardTitle className="text-white text-lg font-bold">Channel Distribution</CardTitle>
            <CardDescription className="text-zinc-500">Volume by messaging provider.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'WA', val: 65, color: '#10b981' },
                { name: 'Email', val: 20, color: '#8b5cf6' },
                { name: 'Push', val: 15, color: '#f59e0b' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff' }}
                />
                <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-950 border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg font-bold">Recent Campaigns</CardTitle>
              <CardDescription className="text-zinc-500">Status of active and upcoming broadcasts.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCampaigns.map((camp) => (
                <div key={camp.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 group hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm leading-none mb-1">{camp.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-black">{camp.channel}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-800" />
                        <span className="text-[10px] text-zinc-500">{camp.reach} Recipients</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={`text-[10px] font-bold ${camp.status === 'Running' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                      {camp.status}
                    </Badge>
                    <p className="text-[10px] text-zinc-500 mt-1">{camp.conversion} Conversion</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-900">
          <CardHeader>
            <CardTitle className="text-white text-lg font-bold">System Health & Logs</CardTitle>
            <CardDescription className="text-zinc-500">Real-time gateway connectivity status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gupshup API</p>
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-lg font-bold text-white">Connected</p>
                <p className="text-[10px] text-zinc-500 mt-1">Lat: 124ms</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Razorpay Webhook</p>
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-lg font-bold text-white">Active</p>
                <p className="text-[10px] text-zinc-500 mt-1">Last: 2m ago</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">FCM Service</p>
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-lg font-bold text-white">Healthy</p>
                <p className="text-[10px] text-zinc-500 mt-1">99.9% Uptime</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email (Brevo)</p>
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                </div>
                <p className="text-lg font-bold text-white">Rate Limited</p>
                <p className="text-[10px] text-zinc-500 mt-1">Wait: 45s</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-900 font-mono text-[10px] text-zinc-500 overflow-hidden h-[100px]">
              <div className="animate-pulse">
                <p><span className="text-emerald-500">INFO</span> [12:44:01] Gupshup Template 'order_success' Synced</p>
                <p><span className="text-emerald-500">INFO</span> [12:44:05] Webhook received: payment.captured (Razorpay)</p>
                <p><span className="text-blue-500">DEBUG</span> [12:44:10] Executing scheduled campaign: WEEKEND_PROMO</p>
                <p><span className="text-emerald-500">INFO</span> [12:44:12] Push notification sent to 4,204 devices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
