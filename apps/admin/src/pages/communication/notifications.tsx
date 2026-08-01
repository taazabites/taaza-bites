import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Bell, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Settings, 
  Trash2, 
  Search,
  Check,
  Shield,
  ArrowUpRight,
  MessageSquare,
  CreditCard,
  AlertCircle,
  Eye,
  PlusCircle,
  Clock,
  X,
  ArrowRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function NotificationCenter() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null)
  
  const [notifications, setNotifications] = useState<any[]>([
    { 
      id: 1, 
      title: "Gupshup API Rate Limit", 
      message: "You are approaching 80% of your current rate limit on WhatsApp API. Consider upgrading or throttling campaigns.", 
      type: "warning", 
      category: "system", 
      time: "5m ago", 
      read: false, 
      link: "/settings/gateways",
      payload: { 
        provider: "Gupshup WhatsApp Gateway", 
        current_tier: "Tier 1 (50 msgs/sec)", 
        usage_ratio: "82.5%", 
        threshold: "80.0%", 
        timestamp_utc: "2026-07-11T16:48:11Z",
        active_rules: "rate_alert_v1"
      },
      recommendations: [
        "Upgrade Gupshup tier via active wallet billing", 
        "Distribute campaigns over staggered scheduling windows", 
        "Monitor retry rates on bulk dispatches in Settings"
      ]
    },
    { 
      id: 2, 
      title: "New Campaign Launched", 
      message: "Diwali Special Offer campaign is now running and sending messages to 12,000 recipients.", 
      type: "success", 
      category: "campaigns", 
      time: "12m ago", 
      read: true, 
      link: "/communication/campaigns",
      payload: { 
        campaign_id: "camp_diwali_2026", 
        recipients: 12000, 
        channel: "whatsapp", 
        status: "SENDING", 
        initiated_by: "admin_kishore",
        batch_count: 24
      },
      recommendations: [
        "Track real-time delivery and read metrics in Campaign Analytics", 
        "Verify recipient deliverability status logs", 
        "Ensure customer feedback channels are staffed for replies"
      ]
    },
    { 
      id: 3, 
      title: "Payment Gateway Alert", 
      message: "High failure rate detected on Razorpay for International cards. Investigating provider status.", 
      type: "error", 
      category: "security", 
      time: "1h ago", 
      read: false, 
      link: "/settings",
      payload: { 
        gateway: "Razorpay v3", 
        failed_attempts_count: 341, 
        failure_rate: "14.2%", 
        impacted_issuers: ["HDFC", "ICICI", "Citi"], 
        error_code: "GATEWAY_TIMEOUT_RESP" 
      },
      recommendations: [
        "Verify payment gateway connection status with provider support", 
        "Temporarily fallback primary routing to secondary Razorpay/Stripe gateways if failure persists", 
        "Advise international users to check authorization logs"
      ]
    },
    { 
      id: 4, 
      title: "Backup Completed", 
      message: "Full system state backup successfully stored in Firebase Storage (Bucket: taazabites-backup).", 
      type: "info", 
      category: "system", 
      time: "3h ago", 
      read: true,
      payload: { 
        backup_id: "bak_state_20260711", 
        bucket: "taazabites-backup", 
        file_size: "2.14 GB", 
        integrity_check: "MD5_MATCH_SUCCESS",
        server_node: "node_production_primary"
      },
      recommendations: [
        "Confirm automatic replication to multi-region storage is active", 
        "No developer intervention is required.", 
        "Perform routine restore drill in sandbox weekly"
      ]
    },
    { 
      id: 5, 
      title: "Critical Security Update", 
      message: "Firewall rules updated to block suspicious traffic patterns from ASN: 48021.", 
      type: "security", 
      category: "security", 
      time: "5h ago", 
      read: false, 
      link: "/audit-logs",
      payload: { 
        rule_id: "fw_block_asn_48021", 
        action: "BLOCK", 
        target_asn: "48021", 
        trigger_metric: "DDoS telemetry threshold trigger (5k reqs/sec)",
        block_duration: "86400s"
      },
      recommendations: [
        "Inspect continuous live traffic streams in cloud monitor", 
        "Maintain block for 24 hours to enforce IP quarantine", 
        "Check the Audit Logs for high traffic rates"
      ]
    },
    { 
      id: 6, 
      title: "Template Approved", 
      message: "Gupshup template 'flash_sale_v2' has been approved by Meta.", 
      type: "success", 
      category: "templates", 
      time: "1d ago", 
      read: true, 
      link: "/communication/templates",
      payload: { 
        template_name: "flash_sale_v2", 
        language: "en_US", 
        provider_status: "APPROVED", 
        meta_asset_id: "waba_tpl_829318",
        categories: ["marketing"]
      },
      recommendations: [
        "Launch a test campaign to confirm content variables render correctly", 
        "No other actions needed. Template is immediately live."
      ]
    },
  ])

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

  const simulateEvent = () => {
    const templates = [
      {
        title: "Meta Template Rejected",
        message: "Meta rejected template 'flash_sale_v3' due to lack of a clear opt-out option in the body text.",
        type: "error",
        category: "templates",
        link: "/communication/templates",
        payload: {
          template_id: "flash_sale_v3",
          rejection_reason: "Category Guidelines: Opt-out mechanism missing",
          provider: "Meta WhatsApp Cloud API",
          ref: "ERR_META_WABA_7294"
        },
        recommendations: [
          "Review the Meta WhatsApp template guidelines regarding business promotions.",
          "Add a clearly visible 'Reply STOP to Opt Out' footer or CTA button.",
          "Resubmit the template for approval."
        ]
      },
      {
        title: "High Memory Utilization",
        message: "Applet container RAM usage exceeded 85% during the bulk notification batch execution.",
        type: "warning",
        category: "system",
        link: "/settings/gateways",
        payload: {
          container_id: "cr-taazabites-admin-0192",
          memory_pct: 87.4,
          limit: "512MB",
          caller: "BatchNotificationWorker"
        },
        recommendations: [
          "Consider increasing the Cloud Run memory allocation to 1GB or 2GB.",
          "Throttle the broadcast worker batch size in Communication Settings.",
          "Monitor the memory trend during the next campaign release."
        ]
      },
      {
        title: "FCM Token Rotated",
        message: "Firebase Cloud Messaging service account token rotated successfully by Automated SecOps key policy.",
        type: "success",
        category: "system",
        payload: {
          key_id: "fcm_sa_key_119283",
          rotation_trigger: "Age limit (90 days) exceeded",
          status: "ACTIVE",
          scope: "messaging"
        },
        recommendations: [
          "No action required.",
          "Verify that client push tokens are being retrieved and stored under normal parameters."
        ]
      },
      {
        title: "Anomaly: High Rate of Auth Failures",
        message: "Detected 23 failed admin login attempts from unauthorized IP: 185.220.101.4 within 5 minutes.",
        type: "security",
        category: "security",
        link: "/audit-logs",
        payload: {
          source_ip: "185.220.101.4",
          user_agent: "Mozilla/5.0 Go-http-client/1.1",
          failed_attempts: 23,
          target_endpoint: "/api/auth/login"
        },
        recommendations: [
          "Confirm that this is not an internal developer's script running on a loop.",
          "Inspect the Audit Logs for any successful authentications from this block.",
          "Consider enforcing Multi-Factor Authentication (MFA) for high-privilege administrative roles."
        ]
      },
      {
        title: "Email Queue Throttled",
        message: "Bulk email dispatch speed is being throttled dynamically by Brevo to protect domain sender reputation.",
        type: "warning",
        category: "campaigns",
        link: "/communication/campaigns",
        payload: {
          provider: "Brevo API",
          queue_depth: 4209,
          throttle_rate: "10 msgs/sec",
          domain_reputation: "98%"
        },
        recommendations: [
          "Wait for the queue to complete under normal throttling parameters.",
          "Ensure DNS settings (SPF, DKIM, DMARC) are fully verified in Domain settings to enable higher default send caps."
        ]
      }
    ]

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
    const newNotif = {
      id: Date.now(),
      title: randomTemplate.title,
      message: randomTemplate.message,
      type: randomTemplate.type,
      category: randomTemplate.category,
      time: "Just now",
      read: false,
      link: randomTemplate.link,
      payload: randomTemplate.payload,
      recommendations: randomTemplate.recommendations
    }

    setNotifications(prev => [newNotif, ...prev])
    toast.success(`Event Simulated: ${randomTemplate.title}`)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "error": return <AlertCircle className="h-5 w-5 text-rose-500" />
      case "success": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case "security": return <Shield className="h-5 w-5 text-blue-500" />
      default: return <Info className="h-5 w-5 text-zinc-400" />
    }
  }

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "system": return <Badge variant="outline" className="text-[10px] bg-zinc-900 border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">SYSTEM</Badge>
      case "campaigns": return <Badge variant="outline" className="text-[10px] bg-zinc-900 border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">CAMPAIGNS</Badge>
      case "security": return <Badge variant="outline" className="text-[10px] bg-zinc-900 border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">SECURITY</Badge>
      case "templates": return <Badge variant="outline" className="text-[10px] bg-zinc-900 border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">TEMPLATES</Badge>
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
          <p className="text-zinc-500 text-sm">Enterprise activity stream, gateway telemetries, and automated security alerts.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button 
            variant="outline" 
            className="border-zinc-800 bg-zinc-900/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-bold text-xs h-10 px-4 rounded-lg shadow-sm gap-2 transition-all duration-200"
            onClick={simulateEvent}
            id="simulate_alert_btn"
          >
            <PlusCircle className="h-4 w-4" /> Simulate System Alert
          </Button>
          <Button 
            variant="outline" 
            className="border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white font-bold text-xs h-10 px-4 rounded-lg shadow-sm gap-2 transition-all duration-200"
            onClick={markAllAsRead}
            id="mark_all_read_btn"
          >
            <Check className="h-4 w-4" /> Mark all read
          </Button>
        </div>
      </div>

      {/* Tabs and Advanced Filters */}
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab} id="notification_tabs_wrapper">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <TabsList className="bg-zinc-950 border border-zinc-900 h-11 p-1 rounded-xl">
            <TabsTrigger value="all" className="px-6 text-xs font-bold data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all rounded-lg">All Events</TabsTrigger>
            <TabsTrigger value="campaigns" className="px-6 text-xs font-bold data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all rounded-lg">Campaigns</TabsTrigger>
            <TabsTrigger value="security" className="px-6 text-xs font-bold data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all rounded-lg">Security</TabsTrigger>
            <TabsTrigger value="system" className="px-6 text-xs font-bold data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all rounded-lg">System</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-[250px] md:flex-initial">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search alerts..." 
                className="bg-zinc-950 border-zinc-900 pl-10 h-11 text-xs rounded-xl focus-visible:ring-emerald-500/30" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="alert_search_input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Unread Only Trigger */}
            <Button
              variant="outline"
              className={`h-11 border-zinc-900 text-xs font-bold gap-2 px-4 rounded-xl transition-all duration-200 shrink-0 ${
                filterUnreadOnly 
                  ? "bg-emerald-500 text-zinc-950 border-emerald-500 hover:bg-emerald-400 hover:text-zinc-950" 
                  : "bg-zinc-950 text-zinc-400 hover:text-white"
              }`}
              onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
              id="unread_filter_toggle"
            >
              Unread
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge className={`h-5 min-w-[20px] px-1 rounded-full text-[10px] font-black flex items-center justify-center border-none ${
                  filterUnreadOnly ? "bg-zinc-950 text-emerald-400" : "bg-emerald-500 text-zinc-950"
                }`}>
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0 focus-visible:ring-0">
          <Card className="bg-zinc-950 border-zinc-900 overflow-hidden shadow-2xl rounded-2xl">
            <CardContent className="p-0">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notif, i) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18, delay: Math.min(i * 0.03, 0.15) }}
                    className={`flex items-start gap-4.5 p-6 border-b border-zinc-900 last:border-0 hover:bg-zinc-900/40 transition-all duration-200 group relative overflow-hidden cursor-pointer ${!notif.read ? "bg-emerald-500/[0.015]" : ""}`}
                    onClick={() => setSelectedNotification(notif)}
                    id={`notif_row_${notif.id}`}
                  >
                    {!notif.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                    )}
                    <div className="mt-0.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5 gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className={`font-bold tracking-tight text-sm ${notif.read ? "text-zinc-300" : "text-white"}`}>{notif.title}</h4>
                          {getCategoryBadge(notif.category)}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 shrink-0">
                          <Clock className="h-3 w-3 text-zinc-600" />
                          <span className="text-[10px] font-mono tracking-tight">{notif.time}</span>
                        </div>
                      </div>
                      <p className={`text-xs md:text-sm leading-relaxed max-w-3xl line-clamp-2 ${notif.read ? "text-zinc-500" : "text-zinc-400"}`}>{notif.message}</p>
                      
                      <div className="flex gap-4 mt-3.5">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 no-underline gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotification(notif);
                          }}
                        >
                          Diagnostic Details <Eye className="h-3 w-3" />
                        </Button>
                        {notif.link && (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white no-underline gap-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(notif.link!);
                            }}
                          >
                            Go To Source <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        )}
                        {!notif.read && (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white no-underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredNotifications.length === 0 && (
                <div className="p-20 text-center" id="empty_notifications_placeholder">
                  <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                    <Bell className="h-7 w-7 text-zinc-600" />
                  </div>
                  <h3 className="text-white font-bold text-lg">No alerts found</h3>
                  <p className="text-zinc-500 text-sm max-w-sm mx-auto mt-1 leading-relaxed">
                    We couldn't find any events matching your current tab or search criteria. Try modifying your search or filters.
                  </p>
                  {(searchQuery || filterUnreadOnly) && (
                    <Button 
                      variant="outline" 
                      className="border-zinc-800 mt-5 h-9 bg-zinc-900/30 text-xs font-bold px-4 hover:text-white rounded-lg"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterUnreadOnly(false);
                      }}
                    >
                      Reset active filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Grid Quick Paths */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8" id="notification_quick_paths">
        <Card 
          className="bg-zinc-950 border-zinc-900 border-dashed hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group rounded-2xl" 
          onClick={() => navigate('/settings/gateways')}
          id="whatsapp_health_card"
        >
          <CardContent className="p-6 text-center">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 border border-emerald-500/10">
              <MessageSquare className="h-5 w-5 text-emerald-500" />
            </div>
            <h5 className="text-white font-bold text-sm mb-1 group-hover:text-emerald-400 transition-colors">WhatsApp Gateway Health</h5>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">99.98% SUCCESS RATE</p>
          </CardContent>
        </Card>
        <Card 
          className="bg-zinc-950 border-zinc-900 border-dashed hover:border-blue-500/50 transition-all duration-300 cursor-pointer group rounded-2xl" 
          onClick={() => navigate('/audit-logs')}
          id="security_audit_card"
        >
          <CardContent className="p-6 text-center">
            <div className="h-11 w-11 rounded-xl bg-blue-500/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 border border-blue-500/10">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <h5 className="text-white font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors">Security Auditing</h5>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">CLEAN - SCAN 2H AGO</p>
          </CardContent>
        </Card>
        <Card 
          className="bg-zinc-950 border-zinc-900 border-dashed hover:border-purple-500/50 transition-all duration-300 cursor-pointer group rounded-2xl" 
          onClick={() => navigate('/finance')}
          id="finance_payouts_card"
        >
          <CardContent className="p-6 text-center">
            <div className="h-11 w-11 rounded-xl bg-purple-500/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 border border-purple-500/10">
              <CreditCard className="h-5 w-5 text-purple-500" />
            </div>
            <h5 className="text-white font-bold text-sm mb-1 group-hover:text-purple-400 transition-colors">Gateway Settlements</h5>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">NEXT CYCLE: MAR 22</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Telemetry Inspector Modal */}
      <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-900 p-0 overflow-hidden rounded-2xl flex flex-col shadow-2xl" id="diagnostic_inspector_modal">
          <div className="bg-zinc-900/50 p-6 border-b border-zinc-900 flex justify-between items-start shrink-0">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                {selectedNotification && getIcon(selectedNotification.type)}
                {selectedNotification && getCategoryBadge(selectedNotification.category)}
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">{selectedNotification?.time}</span>
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-white leading-tight">
                {selectedNotification?.title}
              </DialogTitle>
              <DialogDescription className="text-zinc-500 text-xs">
                System telemetry analysis & troubleshooting protocol.
              </DialogDescription>
            </div>
          </div>
          
          <div className="p-6 space-y-6 overflow-y-auto max-h-[55vh] custom-scrollbar">
            {/* Context message */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Alert Message</h4>
              <p className="text-zinc-300 text-sm leading-relaxed">{selectedNotification?.message}</p>
            </div>

            {/* JSON Metadata Payload */}
            {selectedNotification?.payload && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Diagnostic Telemetry Payload</h4>
                <div className="relative">
                  <pre className="bg-zinc-900/80 border border-zinc-850 p-4 text-xs font-mono text-emerald-400 rounded-xl overflow-x-auto select-all max-h-[220px]">
                    {JSON.stringify(selectedNotification.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Resolution Checklist */}
            {selectedNotification?.recommendations && selectedNotification.recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Remediation Blueprint</h4>
                <ul className="space-y-2.5">
                  {selectedNotification.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-zinc-400 leading-relaxed bg-zinc-900/30 border border-zinc-900/50 p-3 rounded-xl">
                      <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-zinc-900/50 p-6 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4">
            <div>
              {selectedNotification && !selectedNotification.read ? (
                <Button 
                  variant="ghost" 
                  className="text-xs text-zinc-400 hover:text-white font-bold h-9 px-3 gap-1.5"
                  onClick={() => {
                    markAsRead(selectedNotification.id);
                    setSelectedNotification((prev: any) => prev ? { ...prev, read: true } : null);
                  }}
                >
                  <Check className="h-4 w-4" /> Mark as Read
                </Button>
              ) : (
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-full">✓ Audit Verified</span>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button 
                variant="outline" 
                className="border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs h-9 px-4 rounded-lg" 
                onClick={() => setSelectedNotification(null)}
              >
                Close Inspector
              </Button>
              {selectedNotification?.link && (
                <Button 
                  className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-black text-xs h-9 px-4 rounded-lg gap-1.5 transition-all"
                  onClick={() => {
                    setSelectedNotification(null);
                    navigate(selectedNotification.link);
                  }}
                >
                  Inspect Source <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
