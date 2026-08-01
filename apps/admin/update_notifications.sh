#!/bin/bash
sed -i 's/const \[notifications, setNotifications\] = useState<any\[\]>(\[.*\])/const \[notifications, setNotifications\] = useState<any\[\]>(\[\])/g' src/pages/communication/notifications.tsx

# Because it's multi-line array initialization, we need to replace the whole block up to `])`
cat << 'INNEREOF' > src/pages/communication/notifications.tsx.tmp
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Bell, 
  Search, 
  Filter, 
  MoreVertical,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Zap,
  Mail,
  Smartphone,
  Info,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Server,
  Activity,
  User,
  ShoppingBag,
  CreditCard,
  Settings2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NotificationCenter() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null)

  const [notifications, setNotifications] = useState<any[]>([])

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    toast.success("All notifications marked as read")
  }

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
    toast.info("Notification deleted")
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "error": return <ShieldAlert className="h-5 w-5 text-rose-500" />
      case "success": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case "warning": return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "info": return <Info className="h-5 w-5 text-blue-500" />
      case "system": return <Server className="h-5 w-5 text-zinc-400" />
      case "payment": return <CreditCard className="h-5 w-5 text-purple-500" />
      case "order": return <ShoppingBag className="h-5 w-5 text-indigo-500" />
      case "user": return <User className="h-5 w-5 text-sky-500" />
      default: return <Bell className="h-5 w-5 text-emerald-500" />
    }
  }

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "system": return <Badge className="bg-zinc-800 text-zinc-400 border-none text-[9px] h-5 rounded-full px-2">SYSTEM</Badge>
      case "gateways": return <Badge className="bg-blue-500/10 text-blue-400 border-none text-[9px] h-5 rounded-full px-2">GATEWAY</Badge>
      case "campaigns": return <Badge className="bg-purple-500/10 text-purple-400 border-none text-[9px] h-5 rounded-full px-2">CAMPAIGN</Badge>
      case "security": return <Badge className="bg-rose-500/10 text-rose-400 border-none text-[9px] h-5 rounded-full px-2">SECURITY</Badge>
      case "orders": return <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] h-5 rounded-full px-2">ORDER</Badge>
      default: return null
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    const matchesTab = activeTab === "all" || notif.category === activeTab;
    const matchesSearch = searchQuery.trim() === "" || 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnread = !filterUnreadOnly || !notif.read;
    return matchesTab && matchesSearch && matchesUnread;
  });

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto" id="notification_center_root">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="notification_center_header">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black tracking-tight text-white font-sans uppercase">Notification Center</h1>
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">REALTIME</Badge>
          </div>
          <p className="text-zinc-500 text-sm">Enterprise activity stream, gateway telemetries, and automated alerts.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button 
            variant="outline" 
            className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-white h-10 px-4 rounded-lg font-medium text-xs transition-colors"
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
          >
            <Filter className={`h-4 w-4 mr-2 ${filterUnreadOnly ? 'text-emerald-500' : 'text-zinc-500'}`} />
            {filterUnreadOnly ? 'Show All' : 'Unread Only'}
          </Button>
          <Button 
            variant="outline" 
            className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-white h-10 px-4 rounded-lg font-medium text-xs transition-colors"
            onClick={markAllAsRead}
            disabled={notifications.length === 0 || notifications.every(n => n.read)}
          >
            <CheckCircle2 className="h-4 w-4 mr-2 text-zinc-500" />
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Main List */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-zinc-950/50 p-2 rounded-xl border border-zinc-900/50 backdrop-blur-sm">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent h-auto p-0 gap-1 w-full flex-wrap justify-start">
                  {[
                    { id: 'all', label: 'All Activity' },
                    { id: 'orders', label: 'Orders & Payments' },
                    { id: 'gateways', label: 'System Gateways' },
                    { id: 'campaigns', label: 'Marketing' },
                    { id: 'security', label: 'Security' }
                  ].map(tab => (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id} 
                      className="data-[state=active]:bg-zinc-800/80 data-[state=active]:text-white text-zinc-500 rounded-lg h-9 px-4 text-xs font-medium border border-transparent data-[state=active]:border-zinc-700/50 transition-all shadow-none"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
             </Tabs>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search activity logs, errors, or events..." 
              className="pl-10 bg-zinc-950 border-zinc-900 text-zinc-300 h-12 rounded-xl focus-visible:ring-emerald-500/20 font-medium placeholder:text-zinc-600 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3 mt-4 relative">
             <div className="absolute left-[27px] top-4 bottom-4 w-px bg-zinc-900 z-0 hidden sm:block" />
             
             {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border border-zinc-900 border-dashed rounded-2xl bg-zinc-950/30">
                   <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                      <Bell className="h-5 w-5 text-zinc-600" />
                   </div>
                   <h3 className="text-sm font-semibold text-zinc-300">No events found</h3>
                   <p className="text-xs text-zinc-600 mt-1 max-w-[200px]">You're all caught up. New system events will appear here.</p>
                </div>
             ) : (
             <AnimatePresence initial={false}>
              {filteredNotifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={`bg-zinc-950 border-zinc-900 overflow-hidden cursor-pointer group transition-all duration-300 relative z-10 ${
                      !notif.read ? 'border-l-4 border-l-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'hover:border-zinc-800'
                    } ${selectedNotification?.id === notif.id ? 'ring-1 ring-zinc-700' : ''}`}
                    onClick={() => {
                      setSelectedNotification(notif)
                      if (!notif.read) markAsRead(notif.id)
                    }}
                  >
                    {!notif.read && (
                       <div className="absolute top-0 right-0 p-3 flex sm:hidden">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                       </div>
                    )}
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        <div className="p-4 sm:p-5 flex items-start sm:items-center justify-center bg-zinc-900/20 w-[60px] sm:w-[72px] shrink-0 border-r border-zinc-900/50">
                          <div className={`p-2 rounded-xl shadow-inner ${
                            notif.type === 'error' ? 'bg-rose-500/10 shadow-rose-500/10' : 
                            notif.type === 'success' ? 'bg-emerald-500/10 shadow-emerald-500/10' : 
                            notif.type === 'warning' ? 'bg-amber-500/10 shadow-amber-500/10' :
                            'bg-zinc-800/50 shadow-zinc-950/20'
                          }`}>
                            {getIcon(notif.type)}
                          </div>
                        </div>
                        <div className="p-4 sm:p-5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getCategoryBadge(notif.category)}
                              <span className="text-[10px] font-medium text-zinc-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1 opacity-70" />
                                {format(new Date(notif.timestamp), "MMM d, h:mm a")}
                              </span>
                            </div>
                            <h3 className={`text-sm sm:text-base font-semibold truncate ${!notif.read ? 'text-white' : 'text-zinc-300'}`}>
                              {notif.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-500 line-clamp-1 sm:line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-end sm:self-center">
                            {!notif.read && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                                title="Mark as read"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                              title="Delete notification"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
             </AnimatePresence>
             )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="sticky top-6 hidden lg:block">
          <Card className="bg-zinc-950/50 border-zinc-900 overflow-hidden shadow-2xl backdrop-blur-xl">
            {selectedNotification ? (
              <div className="flex flex-col h-[600px]">
                <div className={`h-2 w-full ${
                  selectedNotification.type === 'error' ? 'bg-rose-500' : 
                  selectedNotification.type === 'success' ? 'bg-emerald-500' : 
                  selectedNotification.type === 'warning' ? 'bg-amber-500' :
                  'bg-blue-500'
                }`} />
                
                <div className="p-6 border-b border-zinc-900/50 flex-1 overflow-y-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-2xl ${
                      selectedNotification.type === 'error' ? 'bg-rose-500/10' : 
                      selectedNotification.type === 'success' ? 'bg-emerald-500/10' : 
                      selectedNotification.type === 'warning' ? 'bg-amber-500/10' :
                      'bg-blue-500/10'
                    }`}>
                      {getIcon(selectedNotification.type)}
                    </div>
                    <div>
                      {getCategoryBadge(selectedNotification.category)}
                      <p className="text-[10px] text-zinc-500 mt-1.5 font-medium">{format(new Date(selectedNotification.timestamp), "MMMM d, yyyy • h:mm:ss a")}</p>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-3 leading-tight">{selectedNotification.title}</h2>
                  <div className="prose prose-invert prose-sm max-w-none text-zinc-400 mb-8 leading-relaxed">
                    <p>{selectedNotification.message}</p>
                  </div>
                  
                  {selectedNotification.details && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 border-b border-zinc-800 pb-2">Event Telemetry</h4>
                      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50 shadow-inner">
                        <ul className="space-y-3">
                          {selectedNotification.details.map((detail: string, i: number) => (
                            <li key={i} className="text-xs flex items-start gap-3 text-zinc-300">
                              <span className="text-zinc-600 mt-0.5">•</span>
                              <span className="flex-1 font-mono">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {selectedNotification.actionUrl && (
                    <div className="mt-8">
                       <Button className="w-full bg-zinc-100 text-zinc-950 hover:bg-white font-bold h-11" onClick={() => navigate(selectedNotification.actionUrl)}>
                         {selectedNotification.actionText || "View Details"}
                         <ArrowUpRight className="ml-2 h-4 w-4" />
                       </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] text-center p-8 bg-zinc-950/30">
                <div className="h-16 w-16 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-6 shadow-inner">
                  <Activity className="h-6 w-6 text-zinc-600" />
                </div>
                <h3 className="text-base font-semibold text-zinc-300 mb-2">Event Inspector</h3>
                <p className="text-sm text-zinc-600 leading-relaxed max-w-[220px]">Select any notification from the stream to view full telemetry details, stack traces, and actionable next steps.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
INNEREOF
chmod +x update_notifications.sh
./update_notifications.sh
