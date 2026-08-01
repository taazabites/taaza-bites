#!/bin/bash
cat << 'INNEREOF' > src/pages/communication/dashboard.tsx
import React, { useState, useEffect } from "react"
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
import { communicationService } from "../../services/communication"
import { Campaign } from "../../types"

// Keep chart data as static since it's just visual for now, unless we want to query orders for communication stats.
// Let's use real campaigns.
const chartData = [
  { name: 'Mon', sent: 400, delivered: 380, read: 240 },
  { name: 'Tue', sent: 300, delivered: 290, read: 180 },
  { name: 'Wed', sent: 550, delivered: 500, read: 420 },
  { name: 'Thu', sent: 200, delivered: 180, read: 150 },
  { name: 'Fri', sent: 800, delivered: 780, read: 600 },
  { name: 'Sat', sent: 1200, delivered: 1150, read: 900 },
  { name: 'Sun', sent: 900, delivered: 880, read: 750 },
]

export default function CommunicationDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    const unsub = communicationService.subscribeToCampaigns((data) => setCampaigns(data))
    return () => unsub()
  }, [])

  const recentCampaigns = campaigns.slice(0, 3)
  
  const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0)
  const totalDelivered = campaigns.reduce((sum, c) => sum + (c.deliveredCount || 0), 0)

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white font-sans uppercase italic">Communication Center</h1>
          <p className="text-zinc-500 mt-1 text-sm font-medium">Manage all customer interactions and marketing campaigns.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white">
            <Calendar className="mr-2 h-4 w-4 text-emerald-500" />
            This Week
          </Button>
          <Button className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold uppercase tracking-wide">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="bg-zinc-950 border-zinc-900 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-500 text-xs font-semibold uppercase tracking-widest flex items-center justify-between">
                Total Sent
                <Send className="h-4 w-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{totalSent > 0 ? totalSent.toLocaleString() : '0'}</div>
              <p className="text-xs text-blue-500 font-medium flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" /> +12.5% from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-zinc-950 border-zinc-900 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-500 text-xs font-semibold uppercase tracking-widest flex items-center justify-between">
                Delivered
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{totalDelivered > 0 ? totalDelivered.toLocaleString() : '0'}</div>
              <p className="text-xs text-emerald-500 font-medium flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" /> {(totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0).toFixed(1)}% delivery rate
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-zinc-950 border-zinc-900 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-500 text-xs font-semibold uppercase tracking-widest flex items-center justify-between">
                Active Campaigns
                <Zap className="h-4 w-4 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{campaigns.filter(c => c.status === 'running').length}</div>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Currently running
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-zinc-950 border-zinc-900 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-500 text-xs font-semibold uppercase tracking-widest flex items-center justify-between">
                Active Automations
                <Clock className="h-4 w-4 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">0</div>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Triggered messages
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-zinc-950 border-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">Engagement Overview</CardTitle>
            <CardDescription>Message delivery and read rates across all channels.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                  <Area type="monotone" dataKey="read" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRead)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">Recent Campaigns</CardTitle>
              <CardDescription>Latest marketing efforts.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-emerald-500 hover:text-emerald-400">View All</Button>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length === 0 ? (
               <div className="text-center py-6 text-zinc-500 text-sm">No campaigns yet.</div>
            ) : (
            <div className="space-y-4 mt-4">
              {recentCampaigns.map((camp) => (
                <div key={camp.id} className="flex flex-col gap-2 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{camp.name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{camp.channels.join(', ')}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] border-none px-2 py-0 h-5 ${
                      camp.status === 'running' ? 'bg-emerald-500/10 text-emerald-500' :
                      camp.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {camp.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800/50">
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase">Reach</p>
                      <p className="text-xs font-semibold text-white">{camp.sentCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase">Opened</p>
                      <p className="text-xs font-semibold text-emerald-500">{camp.openedCount || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
INNEREOF
chmod +x update_comm_dashboard.sh
./update_comm_dashboard.sh
