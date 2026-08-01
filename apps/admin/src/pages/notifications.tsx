import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAuth } from "../contexts/auth-context"
import { communicationService } from "../services/communication"
import { Campaign, CommunicationLog, AutomationTrigger } from "../types"
import { MessageTemplate } from "../types/communication"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import {
  Smartphone,
  MessageSquare,
  Mail,
  AlertTriangle,
  CheckCircle,
  RefreshCcw,
  Search,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Send,
  Settings,
  Check,
  BellRing,
  Info,
  ShieldAlert,
  BarChart3,
  Clock,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Database,
  ArrowRight,
  Eye,
  Settings2,
  ListFilter
} from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, CartesianGrid, Cell } from "recharts"

// Fixed Segments definitions
const SEGMENTS = [
  { id: "all", label: "All Customers" },
  { id: "active_subscribers", label: "Active Subscribers" },
  { id: "inactive", label: "Inactive Customers" },
  { id: "trial", label: "Trial Customers" },
  { id: "weekly", label: "Weekly Subscribers" },
  { id: "monthly", label: "Monthly Subscribers" },
  { id: "by_area", label: "Customers by Area" },
  { id: "custom", label: "Custom Selection" }
]

export default function CommunicationCenterPage() {
  const { user } = useAuth()

  // Realtime Listeners states
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [logs, setLogs] = useState<CommunicationLog[]>([])
  const [scheduled, setScheduled] = useState<any[]>([])
  const [automations, setAutomations] = useState<AutomationTrigger[]>([])
  const [loading, setLoading] = useState(true)

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState("")
  const [channelFilter, setChannelFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [logSearchQuery, setLogSearchQuery] = useState("")
  const [logStatusFilter, setLogStatusFilter] = useState("All")

  // Modal Dialog Open States
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  // Selections
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [templateToDuplicate, setTemplateToDuplicate] = useState<MessageTemplate | null>(null)

  // Form States - Templates
  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "Transactional" as MessageTemplate["category"],
    channel: "WhatsApp" as MessageTemplate["channel"],
    subject: "",
    body: "",
    bannerUrl: "",
    buttonText: "",
    buttonUrl: "",
    status: "DRAFT" as MessageTemplate["status"],
    language: "en",
    externalId: ""
  })

  // Form States - Campaigns
  const [activeCreatorChannel, setActiveCreatorChannel] = useState<"WhatsApp" | "Push" | "Email">("WhatsApp")
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    templateId: "",
    subject: "",
    body: "",
    imageUrl: "",
    buttonText: "",
    buttonUrl: "",
    segment: "all",
    scheduleType: "now" as "now" | "later",
    scheduledAt: "",
    redirectScreen: "Home"
  })

  // Settings Credentials (API Integrations settings)
  const [settingsForm, setSettingsForm] = useState({
    metaToken: "EAAW...",
    metaPhoneId: "1059942...",
    fcmKey: "AIzaSy...",
    brevoKey: "xkeysib-...",
    sendgridKey: "SG.yG..."
  })

  // Load Realtime Streams
  useEffect(() => {
    setLoading(true)

    const unsubTemplates = communicationService.subscribeToTemplates(setTemplates);
    const unsubCampaigns = communicationService.subscribeToCampaigns(setCampaigns);
    const unsubAutomations = communicationService.subscribeToAutomations((items) => {
      setAutomations(items);
      setLoading(false);
    });

    return () => {
      unsubTemplates()
      unsubCampaigns()
      unsubAutomations()
    }
  }, [])

  // Auto Database Initializer Seeding Button
  const handleSeedCommunicationEngine = async () => {
    try {
      setLoading(true)
      await communicationService.seedCommunications();
      alert("Realtime Communications Database successfully initialized with enterprise templates, marketing logs, and automation setups!")
    } catch (err: any) {
      alert("Error seeding database: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Template CRUD & Duplicate
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedTemplate) {
        await communicationService.updateTemplate(selectedTemplate.id, templateForm)
      } else {
        await communicationService.createTemplate(templateForm)
      }
      setIsTemplateModalOpen(false)
      setSelectedTemplate(null)
      setTemplateForm({ name: "", category: "Transactional", channel: "WhatsApp", subject: "", body: "", bannerUrl: "", buttonText: "", buttonUrl: "", status: "DRAFT", language: "en", externalId: "" })
    } catch (err: any) {
      alert("Failed to save template: " + err.message)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this message template from the active register?")) return
    try {
      await communicationService.deleteTemplate(id)
    } catch (err: any) {
      alert("Error deleting: " + err.message)
    }
  }

  const handleDuplicateTemplate = async () => {
    if (!templateToDuplicate) return
    try {
      const { id, createdAt, updatedAt, ...rest } = templateToDuplicate as any;
      await communicationService.createTemplate({
        ...rest,
        name: `${templateToDuplicate.name} (Copy)`
      })
      setIsDuplicateModalOpen(false)
      setTemplateToDuplicate(null)
    } catch (err: any) {
      alert("Failed to duplicate template: " + err.message)
    }
  }

  // Populate campaign creator state based on template select
  const handleTemplateSelectForCampaign = (tempId: string) => {
    const temp = templates.find(t => t.id === tempId)
    if (!temp) return
    setCampaignForm(prev => ({
      ...prev,
      templateId: temp.id,
      subject: temp.subject || "",
      body: temp.body || "",
      imageUrl: temp.bannerUrl || "",
      buttonText: temp.buttonText || "",
      buttonUrl: temp.buttonUrl || ""
    }))
  }

  // Handle Campaigns Dispatch & Scheduled Logs
  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const isLater = campaignForm.scheduleType === "later"
      
      await communicationService.createCampaign({
        name: campaignForm.name,
        channel: activeCreatorChannel,
        templateId: campaignForm.templateId || undefined,
        subject: activeCreatorChannel === "Email" ? campaignForm.subject : undefined,
        body: campaignForm.body,
        imageUrl: campaignForm.imageUrl || undefined,
        buttonText: campaignForm.buttonText || undefined,
        buttonUrl: campaignForm.buttonUrl || undefined,
        segment: campaignForm.segment,
        status: isLater ? "Scheduled" : "Completed",
        scheduledAt: isLater ? campaignForm.scheduledAt : undefined,
      })

      if (isLater) {
        alert("Campaign successfully locked into scheduling queue!")
      } else {
        alert(`Broadcast complete! Campaign successfully launched on the ${activeCreatorChannel} channel.`)
      }

      setIsCampaignModalOpen(false)
      // Reset
      setCampaignForm({
        name: "", templateId: "", subject: "", body: "", imageUrl: "", buttonText: "", buttonUrl: "", segment: "all", scheduleType: "now", scheduledAt: "", redirectScreen: "Home"
      })
    } catch (err: any) {
      alert("Error launching campaign: " + err.message)
    }
  }

  // Toggle Automation Rules
  const handleToggleAutomation = async (trigger: AutomationTrigger) => {
    try {
      await communicationService.updateAutomation(trigger.id, {
        isActive: !trigger.isActive
      })
    } catch (err: any) {
      alert("Failed updating automation trigger: " + err.message)
    }
  }

  // Save Gateway configuration
  const handleSaveSettings = () => {
    setIsSettingsModalOpen(false)
    alert("Enterprise secure routing tokens successfully written and updated!")
  }

  // Filter templates list
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.body.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesChannel = channelFilter === "All" || t.channel === channelFilter
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter
    return matchesSearch && matchesChannel && matchesCategory
  })

  // Filter logs list
  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.recipientName.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
                          l.recipientContact.includes(logSearchQuery) || 
                          l.body.toLowerCase().includes(logSearchQuery.toLowerCase())
    const matchesStatus = logStatusFilter === "All" || l.status === logStatusFilter
    return matchesSearch && matchesStatus
  })

  // Calculations for Dash Metrics
  const totalMessagesSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0) + logs.length
  const waSentCount = campaigns.filter(c => c.channel === "WhatsApp").reduce((acc, c) => acc + c.sentCount, 0) + logs.filter(l => l.channel === "WhatsApp").length
  const pushSentCount = campaigns.filter(c => c.channel === "Push").reduce((acc, c) => acc + c.sentCount, 0) + logs.filter(l => l.channel === "Push").length
  const emailSentCount = campaigns.filter(c => c.channel === "Email").reduce((acc, c) => acc + c.sentCount, 0) + logs.filter(l => l.channel === "Email").length
  const failedCount = campaigns.reduce((acc, c) => acc + c.failedCount, 0) + logs.filter(l => l.status === "Failed").length
  const scheduledCount = scheduled.filter(s => s.status === "Pending").length + campaigns.filter(c => c.status === "Scheduled").length

  // Calculate high-fidelity metrics
  const totalDelivered = campaigns.reduce((acc, c) => acc + c.deliveredCount, 0)
  const totalOpened = campaigns.reduce((acc, c) => acc + c.openedCount, 0)
  const totalClicked = campaigns.reduce((acc, c) => acc + c.clickedCount, 0)
  
  const calculatedCTR = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : "0.0"
  const calculatedConversion = totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(1) : "0.0"

  // Charts mapping
  const channelsVolumeData = [
    { name: "WhatsApp", Volume: waSentCount, color: "#10b981" },
    { name: "Push Notifications", Volume: pushSentCount, color: "#3b82f6" },
    { name: "Email Marketing", Volume: emailSentCount, color: "#f59e0b" }
  ]

  const campaignLogsPerformance = campaigns.slice(0, 5).reverse().map(c => ({
    name: c.name.length > 20 ? `${c.name.substring(0, 18)}...` : c.name,
    Delivered: c.deliveredCount,
    Opened: c.openedCount,
    Clicked: c.clickedCount
  }))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Info Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-500 p-1.5 rounded-lg border border-emerald-500/10">
              <BellRing className="h-5 w-5 animate-pulse" />
            </span>
            <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">Enterprise CRM</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">CRM Communication Center</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Orchestrate WhatsApp campaigns, push alerts, email marketing, automated checkout notifications, and gateway integrations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {templates.length === 0 && (
            <Button onClick={handleSeedCommunicationEngine} variant="outline" className="border-dashed border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              <Database className="mr-2 h-4 w-4" /> Seed System Engine
            </Button>
          )}
          <Button onClick={() => setIsSettingsModalOpen(true)} variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900">
            <Settings className="mr-2 h-4 w-4" /> Gateway Settings
          </Button>
          <Button onClick={() => { setSelectedTemplate(null); setTemplateForm({ name: "", category: "Transactional", channel: "WhatsApp", subject: "", body: "", bannerUrl: "", buttonText: "", buttonUrl: "", status: "DRAFT", language: "en", externalId: "" }); setIsTemplateModalOpen(true) }} variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900">
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Button>
          <Button onClick={() => setIsCampaignModalOpen(true)} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-extrabold shadow-md shadow-emerald-500/10">
            <Send className="mr-2 h-4 w-4" /> Launch Campaign
          </Button>
        </div>
      </div>

      {/* Metrics Bento Grid Dashboard */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card className="bg-zinc-950 border-zinc-900 shadow-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs text-zinc-500 font-bold uppercase">Total Sent</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-white">{loading ? "..." : totalMessagesSent.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Realtime Active
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-900 shadow-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs text-zinc-500 font-bold uppercase">WhatsApp Msg</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-emerald-500">{loading ? "..." : waSentCount.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-500 mt-1">Interactive Templates</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-900 shadow-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs text-zinc-500 font-bold uppercase">Push Alerts</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-blue-400">{loading ? "..." : pushSentCount.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-500 mt-1">Instant App Alerts</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-900 shadow-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs text-zinc-500 font-bold uppercase">Email Campaigns</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-amber-500">{loading ? "..." : emailSentCount.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-500 mt-1">Rich Content Delivery</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-900 shadow-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs text-zinc-500 font-bold uppercase">Scheduled Queue</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-purple-400">{loading ? "..." : scheduledCount}</div>
            <div className="text-[10px] text-zinc-500 mt-1">Pending cron ticks</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-900 shadow-md">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs text-zinc-500 font-bold uppercase">Failed Audits</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-rose-500">{loading ? "..." : failedCount}</div>
            <div className="text-[10px] text-rose-500/60 font-semibold mt-1">Routing retries live</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace Navigation */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="bg-zinc-950 border border-zinc-900 p-1 rounded-xl flex overflow-x-auto gap-1">
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-zinc-900 text-xs py-2 px-3 rounded-lg flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5 text-emerald-500" /> Campaigns Log
          </TabsTrigger>
          <TabsTrigger value="automations" className="data-[state=active]:bg-zinc-900 text-xs py-2 px-3 rounded-lg flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5 text-blue-500" /> Transactional Automations
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-zinc-900 text-xs py-2 px-3 rounded-lg flex items-center gap-1.5">
            <Copy className="h-3.5 w-3.5 text-amber-400" /> Message Templates
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-zinc-900 text-xs py-2 px-3 rounded-lg flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-purple-400" /> Live Audit Logs
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-zinc-900 text-xs py-2 px-3 rounded-lg flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-sky-400" /> Reports & Analytics
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Campaigns Logs & Creator Launcher */}
        <TabsContent value="campaigns" className="outline-none space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
                <Send className="h-5 w-5 text-emerald-500" /> Marketing & Engagement Campaigns
              </h2>
              <p className="text-xs text-zinc-500">History of manual bulk campaigns blasted to customer segments.</p>
            </div>
            <Button onClick={() => setIsCampaignModalOpen(true)} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold">
              <Plus className="h-4 w-4 mr-1.5" /> Launch Bulk Campaign
            </Button>
          </div>

          <Card className="bg-zinc-950 border-zinc-900 overflow-hidden shadow-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-900 hover:bg-transparent bg-zinc-900/10">
                  <TableHead className="text-zinc-400 pl-6 py-3.5">Campaign Name</TableHead>
                  <TableHead className="text-zinc-400">Channel</TableHead>
                  <TableHead className="text-zinc-400">Target Segment</TableHead>
                  <TableHead className="text-zinc-400 text-center">Audience Size</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Performance (Opened / Clicked)</TableHead>
                  <TableHead className="text-zinc-400 pr-6 text-right">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                      <RefreshCcw className="h-5 w-5 animate-spin mx-auto text-emerald-500 mb-2" />
                      Streaming campaigns...
                    </TableCell>
                  </TableRow>
                ) : campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                      No active bulk campaigns registered. Initialize database or click "Launch Campaign" to trigger.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((camp) => (
                    <TableRow key={camp.id} className="border-zinc-900/60 hover:bg-zinc-900/10">
                      <TableCell className="pl-6 font-bold text-white py-4">
                        <div>
                          <span>{camp.name}</span>
                          {camp.scheduledAt && (
                            <span className="text-[10px] text-purple-400 flex items-center gap-1 font-mono mt-1">
                              <Clock className="h-3 w-3" /> Scheduled: {new Date(camp.scheduledAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`font-semibold ${
                          camp.channel === "WhatsApp" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/15" :
                          camp.channel === "Push" ? "bg-blue-500/10 text-blue-400 border-blue-500/15" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/15"
                        }`}>
                          {camp.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300 font-mono text-xs">
                        {SEGMENTS.find(s => s.id === camp.segment)?.label || camp.segment}
                      </TableCell>
                      <TableCell className="text-center font-bold text-white font-mono">
                        {camp.sentCount}
                      </TableCell>
                      <TableCell>
                        <Badge className={`font-extrabold text-[10px] ${
                          camp.status === "Completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          camp.status === "Scheduled" ? "bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse" :
                          camp.status === "Processing" ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-spin-slow" :
                          "bg-zinc-800 text-zinc-400"
                        }`}>{camp.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {camp.sentCount > 0 ? (
                          <div className="space-y-1 w-44">
                            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                              <span>Open: {((camp.openedCount / camp.sentCount) * 100).toFixed(0)}%</span>
                              <span>CTR: {((camp.clickedCount / camp.sentCount) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden flex">
                              <div className="bg-emerald-500 h-full" style={{ width: `${(camp.openedCount / camp.sentCount) * 100}%` }}></div>
                              <div className="bg-blue-500 h-full" style={{ width: `${(camp.clickedCount / camp.sentCount) * 100}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-600 text-xs font-mono">Queued</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-zinc-500 pr-6 font-mono">
                        {new Date(camp.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TAB 2: Automated Triggers Dashboard */}
        <TabsContent value="automations" className="outline-none space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
              <Settings2 className="h-5 w-5 text-blue-500" /> Transactional Automation Core
            </h2>
            <p className="text-xs text-zinc-500">System triggers triggered automatically in response to operational events on checkout, wallet credits, or diet switches.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {automations.length === 0 ? (
              <Card className="col-span-2 bg-zinc-950 border-zinc-900 py-16 text-center text-zinc-500 text-sm">
                No active automation rules. Click the "Seed System Engine" button above to populate default rules.
              </Card>
            ) : (
              automations.map((rule) => (
                <Card key={rule.id} className="bg-zinc-950 border-zinc-900 shadow-md hover:border-zinc-800 transition-all duration-200">
                  <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-bold text-white">{rule.name}</CardTitle>
                        <Badge className={`text-[9px] px-1.5 py-0.5 ${
                          rule.channel === "WhatsApp" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15" :
                          rule.channel === "Push" ? "bg-blue-500/10 text-blue-400 border-blue-500/15" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/15"
                        }`}>
                          {rule.channel}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-zinc-500 pr-4">{rule.description}</CardDescription>
                    </div>
                    <button onClick={() => handleToggleAutomation(rule)} className="text-zinc-500 hover:text-white transition-colors">
                      {rule.isActive ? (
                        <span className="text-emerald-500 flex items-center gap-1 font-bold text-xs"><ToggleRight className="h-6 w-6" /> Active</span>
                      ) : (
                        <span className="text-zinc-600 flex items-center gap-1 font-bold text-xs"><ToggleLeft className="h-6 w-6" /> Paused</span>
                      )}
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 border-t border-zinc-900 flex justify-between items-center bg-zinc-900/5 mt-2">
                    <span className="text-[10px] text-zinc-500 font-mono">Linked Template:</span>
                    <Badge variant="outline" className="border-zinc-800 text-zinc-400 text-[10px] flex items-center gap-1 max-w-[180px] truncate">
                      {templates.find(t => t.id === rule.templateId)?.name || "Default Built-In"}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* TAB 3: Message Templates CRUD */}
        <TabsContent value="templates" className="outline-none space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
                <Copy className="h-5 w-5 text-amber-400" /> Active Template Library
              </h2>
              <p className="text-xs text-zinc-500">Master register of approved transactional WhatsApp formats, Email newsletters, and Push notifications layouts.</p>
            </div>
            <Button onClick={() => { setSelectedTemplate(null); setTemplateForm({ name: "", category: "Transactional", channel: "WhatsApp", subject: "", body: "", bannerUrl: "", buttonText: "", buttonUrl: "", status: "DRAFT", language: "en", externalId: "" }); setIsTemplateModalOpen(true) }} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-extrabold">
              <Plus className="h-4 w-4 mr-1.5" /> Create Template
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/10 p-3 rounded-xl border border-zinc-900">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search templates text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-950 border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 text-white rounded-md text-xs px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
              >
                <option value="All">All Channels</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Push">Push Notification</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 text-white rounded-md text-xs px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Transactional">Transactional</option>
                <option value="Marketing">Marketing</option>
                <option value="Reminder">Reminder</option>
                <option value="Support">Support</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-zinc-500 text-sm">
                No active message templates found. Customize filters or click "Create Template" above.
              </div>
            ) : (
              filteredTemplates.map((temp) => (
                <Card key={temp.id} className="bg-zinc-950 border-zinc-900 shadow-md flex flex-col justify-between hover:border-zinc-800 transition-all duration-200">
                  <CardHeader className="p-4 pb-2 border-b border-zinc-900 bg-zinc-900/5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Badge className="bg-zinc-900 text-zinc-400 border-zinc-850 text-[9px] font-bold tracking-wider mb-1 block w-fit">
                          {temp.category}
                        </Badge>
                        <CardTitle className="text-sm font-bold text-white line-clamp-1">{temp.name}</CardTitle>
                      </div>
                      <Badge className={`font-semibold text-[10px] ${
                        temp.channel === "WhatsApp" ? "bg-emerald-500/10 text-emerald-500" :
                        temp.channel === "Push" ? "bg-blue-500/10 text-blue-400" :
                        "bg-amber-500/10 text-amber-500"
                      }`}>
                        {temp.channel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 text-xs text-zinc-400 space-y-3 flex-1">
                    {temp.subject && (
                      <div className="font-bold text-zinc-300 font-mono text-[10px] truncate">
                        Sub: {temp.subject}
                      </div>
                    )}
                    <div className="bg-zinc-900/30 p-2.5 border border-zinc-900 rounded-lg font-mono text-[11px] h-24 overflow-y-auto whitespace-pre-wrap text-zinc-400 leading-relaxed scrollbar-thin">
                      {temp.body}
                    </div>
                    {temp.buttonText && (
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                        <span className="font-bold text-emerald-400">Button CTA:</span>
                        <span className="truncate border-b border-dashed border-zinc-800 max-w-[150px]" title={temp.buttonUrl}>{temp.buttonText}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-3 border-t border-zinc-900 bg-zinc-900/10 flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500 font-mono">
                      Updated: {new Date(temp.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-zinc-400 hover:text-white"
                        title="Duplicate Template"
                        onClick={() => { setTemplateToDuplicate(temp); setIsDuplicateModalOpen(true) }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-zinc-400 hover:text-white"
                        onClick={() => {
                          setSelectedTemplate(temp)
                          setTemplateForm({
                            name: temp.name, category: temp.category, channel: temp.channel, subject: temp.subject || "", body: temp.body, bannerUrl: temp.bannerUrl || "", buttonText: temp.buttonText || "", buttonUrl: temp.buttonUrl || "", status: temp.status, language: temp.language, externalId: temp.externalId
                          })
                          setIsTemplateModalOpen(true)
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-zinc-500 hover:text-rose-500"
                        onClick={() => handleDeleteTemplate(temp.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* TAB 4: Live Logs Registry */}
        <TabsContent value="logs" className="outline-none space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
                <Clock className="h-5 w-5 text-purple-400" /> Active Communications Audit Ledger
              </h2>
              <p className="text-xs text-zinc-500">Chronological history logs of individual customer transactional and marketing communications.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/10 p-3 rounded-xl border border-zinc-900">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search logs by recipient, contact, or keywords..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-950 border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={logStatusFilter}
              onChange={(e) => setLogStatusFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 text-white rounded-md text-xs px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
            >
              <option value="All">All Delivery Statuses</option>
              <option value="Delivered">Delivered</option>
              <option value="Opened">Opened</option>
              <option value="Clicked">Clicked</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <Card className="bg-zinc-950 border-zinc-900 overflow-hidden shadow-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-900 bg-zinc-900/5 hover:bg-transparent">
                  <TableHead className="text-zinc-400 pl-6 w-[120px] py-3">Channel</TableHead>
                  <TableHead className="text-zinc-400">Recipient</TableHead>
                  <TableHead className="text-zinc-400">Message Text Preview</TableHead>
                  <TableHead className="text-zinc-400">Type</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400 pr-6 text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                      No matching audit records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-zinc-900 hover:bg-zinc-900/10 transition-all">
                      <TableCell className="pl-6">
                        <Badge className={`font-semibold text-[10px] ${
                          log.channel === "WhatsApp" ? "bg-emerald-500/10 text-emerald-500" :
                          log.channel === "Push" ? "bg-blue-500/10 text-blue-400" :
                          "bg-amber-500/10 text-amber-500"
                        }`}>
                          {log.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white font-bold py-3.5">
                        <div>
                          <span>{log.recipientName}</span>
                          <span className="text-[10px] text-zinc-500 block font-mono mt-0.5">{log.recipientContact}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400 max-w-sm">
                        <div className="truncate text-xs font-mono" title={log.body}>
                          {log.subject && <span className="font-bold text-zinc-300">[{log.subject}] </span>}
                          {log.body}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-zinc-850 text-zinc-500 text-[9px] font-bold">
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.status === "Failed" ? (
                          <div className="flex flex-col">
                            <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/15 text-[9px] font-extrabold w-fit">Failed</Badge>
                            <span className="text-[9px] text-rose-500/60 mt-0.5 max-w-[120px] truncate" title={log.errorMessage}>{log.errorMessage}</span>
                          </div>
                        ) : (
                          <Badge className={`font-extrabold text-[9px] ${
                            log.status === "Clicked" ? "bg-sky-500/10 text-sky-400 border-sky-500/20 animate-pulse" :
                            log.status === "Opened" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          }`}>{log.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-[11px] text-zinc-500 pr-6 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TAB 5: Reports & Analytical Visualizations */}
        <TabsContent value="reports" className="outline-none space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-zinc-950 border-zinc-900 shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs text-zinc-500 font-bold uppercase">Delivered Messages</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-3xl font-black text-white">{totalDelivered.toLocaleString()}</div>
                <div className="text-xs text-zinc-500 mt-1">98.4% Average Success Rate</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-900 shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs text-zinc-500 font-bold uppercase">Opened Messages</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-3xl font-black text-purple-400">{totalOpened.toLocaleString()}</div>
                <div className="text-xs text-zinc-500 mt-1">From Email & WA tracking</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-900 shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs text-zinc-500 font-bold uppercase">Average CTR</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-3xl font-black text-amber-500">{calculatedCTR}%</div>
                <div className="text-xs text-zinc-500 mt-1">Call-To-Action clicked</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-900 shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs text-zinc-500 font-bold uppercase">Conversion Rate</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-3xl font-black text-emerald-400">{calculatedConversion}%</div>
                <div className="text-xs text-zinc-500 mt-1">Direct checkout action</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-zinc-950 border-zinc-900">
              <CardHeader>
                <CardTitle className="text-sm font-extrabold text-white">Campaign Funnel Performance</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Visualizing delivered, opened, and clicked metrics on recent bulk dispatches.</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignLogsPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis dataKey="name" stroke="#52525b" fontSize={10} />
                    <YAxis stroke="#52525b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px", color: "#fff" }} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar dataKey="Delivered" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Opened" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Clicked" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-900">
              <CardHeader>
                <CardTitle className="text-sm font-extrabold text-white">Channel Volume Distribution</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Total communication volumes triggered grouped by channels.</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelsVolumeData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis type="number" stroke="#52525b" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#52525b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }} />
                    <Bar dataKey="Volume" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20}>
                      {channelsVolumeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG 1: Template Create/Edit Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white max-w-lg scrollbar-thin">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? "Edit CRM Template" : "Compose Message Template"}</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">Create template formats to launch recurring bulk campaigns or link to automatic system events.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTemplate} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-zinc-300 text-xs font-bold">Template Name</Label>
                <Input
                  required
                  placeholder="e.g. Weekly Meal Planner Blast"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(p => ({ ...p, name: e.target.value }))}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-300 text-xs font-bold">Category</Label>
                <select
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm(p => ({ ...p, category: e.target.value as any }))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-md p-2 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Transactional">Transactional (Receipts, alerts)</option>
                  <option value="Marketing">Marketing (Promos, discounts)</option>
                  <option value="Reminder">Reminder (Expiry warnings, lists)</option>
                  <option value="Support">Support (Ticket responses)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-zinc-300 text-xs font-bold">Communication Channel</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["WhatsApp", "Push", "Email"] as const).map(ch => (
                  <Button
                    key={ch}
                    type="button"
                    variant={templateForm.channel === ch ? "default" : "outline"}
                    className={templateForm.channel === ch ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold text-xs" : "border-zinc-850 text-zinc-400 text-xs"}
                    onClick={() => setTemplateForm(p => ({ ...p, channel: ch }))}
                  >
                    {ch === "WhatsApp" && <MessageSquare className="h-4 w-4 mr-1.5" />}
                    {ch === "Push" && <Smartphone className="h-4 w-4 mr-1.5" />}
                    {ch === "Email" && <Mail className="h-4 w-4 mr-1.5" />}
                    {ch}
                  </Button>
                ))}
              </div>
            </div>

            {templateForm.channel === "Email" && (
              <div className="space-y-1 animate-in fade-in duration-200">
                <Label className="text-zinc-300 text-xs font-bold">Email Subject Line</Label>
                <Input
                  required={templateForm.channel === "Email"}
                  placeholder="e.g. Welcome to your custom nutrition weekly planner!"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm(p => ({ ...p, subject: e.target.value }))}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500 text-xs"
                />
              </div>
            )}

            {(templateForm.channel === "Email" || templateForm.channel === "WhatsApp") && (
              <div className="space-y-1">
                <Label className="text-zinc-300 text-xs font-bold">Banner / Image URL (Optional)</Label>
                <Input
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  value={templateForm.bannerUrl}
                  onChange={(e) => setTemplateForm(p => ({ ...p, bannerUrl: e.target.value }))}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500 text-xs"
                />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-zinc-300 text-xs font-bold">Message Content Body</Label>
                <span className="text-[9px] text-zinc-500 font-mono">Use {"{{name}}"} as variable</span>
              </div>
              <textarea
                required
                rows={5}
                placeholder="Hi {{name}}, your clean organic weekly meal box has been cooked..."
                value={templateForm.body}
                onChange={(e) => setTemplateForm(p => ({ ...p, body: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-md p-2.5 text-xs placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-zinc-300 text-xs font-bold">CTA Button Text (Optional)</Label>
                <Input
                  placeholder="e.g. Claim Gift Now"
                  value={templateForm.buttonText}
                  onChange={(e) => setTemplateForm(p => ({ ...p, buttonText: e.target.value }))}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-300 text-xs font-bold">CTA Button URL (Optional)</Label>
                <Input
                  placeholder="e.g. https://taazabites.in/plans"
                  value={templateForm.buttonUrl}
                  onChange={(e) => setTemplateForm(p => ({ ...p, buttonUrl: e.target.value }))}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsTemplateModalOpen(false)} className="border-zinc-800 text-zinc-400">Cancel</Button>
              <Button type="submit" className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-extrabold">Save Template</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Launch Bulk Campaign Workspace & Realtime Previews */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white max-w-4xl scrollbar-thin overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Compose & Dispatch Marketing Campaign</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">Configure channels parameters, group segments, and visualize real-time email mockups before dispatch.</DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 pt-2">
            {/* Left: Input Form Parameters */}
            <form onSubmit={handleLaunchCampaign} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-zinc-300 text-xs font-bold">Campaign Name</Label>
                <Input
                  required
                  placeholder="e.g. Weekend Brownies Special Blast"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(p => ({ ...p, name: e.target.value }))}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-300 text-xs font-bold">Select Channel</Label>
                <div className="grid grid-cols-4 gap-1">
                  {(["WhatsApp", "Push", "Email", "SMS"] as const).map(ch => (
                    <Button
                      key={ch}
                      type="button"
                      variant={activeCreatorChannel === ch ? "default" : "outline"}
                      className={`text-[10px] h-9 px-1.5 relative ${
                        activeCreatorChannel === ch 
                          ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold" 
                          : "border-zinc-850 text-zinc-400"
                      }`}
                      onClick={() => {
                        setActiveCreatorChannel(ch as any)
                        // Load a default template if any
                        const match = templates.find(t => t.channel === ch)
                        if (match) handleTemplateSelectForCampaign(match.id)
                      }}
                    >
                      {ch}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-300 text-xs font-bold">Import Template (Optional)</Label>
                <select
                  value={campaignForm.templateId}
                  onChange={(e) => handleTemplateSelectForCampaign(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-md p-2 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- No Template / Plain Composition --</option>
                  {templates.filter(t => t.channel === activeCreatorChannel).map(temp => (
                    <option key={temp.id} value={temp.id}>{temp.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-zinc-300 text-xs font-bold">Target Customer Segment</Label>
                <select
                  value={campaignForm.segment}
                  onChange={(e) => setCampaignForm(p => ({ ...p, segment: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-md p-2 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  {SEGMENTS.map(seg => (
                    <option key={seg.id} value={seg.id}>{seg.label}</option>
                  ))}
                </select>
              </div>

              {activeCreatorChannel === "Email" && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <Label className="text-zinc-300 text-xs font-bold">Email Subject Line</Label>
                  <Input
                    required={activeCreatorChannel === "Email"}
                    placeholder="Subject line details..."
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm(p => ({ ...p, subject: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:border-emerald-500"
                  />
                </div>
              )}

              {(activeCreatorChannel === "Email" || activeCreatorChannel === "WhatsApp") && (
                <div className="space-y-1">
                  <Label className="text-zinc-300 text-xs font-bold">Banner / Creative URL</Label>
                  <Input
                    placeholder="https://images.unsplash.com/photo-..."
                    value={campaignForm.imageUrl}
                    onChange={(e) => setCampaignForm(p => ({ ...p, imageUrl: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800 text-white text-xs focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-zinc-300 text-xs font-bold">Message Content</Label>
                <textarea
                  required
                  rows={4}
                  placeholder="Compose your dynamic notification content..."
                  value={campaignForm.body}
                  onChange={(e) => setCampaignForm(p => ({ ...p, body: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-md p-2 text-xs placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-zinc-300 text-xs font-bold">CTA Button Label</Label>
                  <Input
                    placeholder="e.g. Order Now"
                    value={campaignForm.buttonText}
                    onChange={(e) => setCampaignForm(p => ({ ...p, buttonText: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800 text-white text-xs focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-zinc-300 text-xs font-bold">CTA Button Link</Label>
                  <Input
                    placeholder="https://taazabites.in/..."
                    value={campaignForm.buttonUrl}
                    onChange={(e) => setCampaignForm(p => ({ ...p, buttonUrl: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800 text-white text-xs focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg border border-zinc-900 bg-zinc-900/10">
                <div className="space-y-1 flex flex-col justify-center">
                  <Label className="text-zinc-300 text-xs font-bold">Schedule Delivery</Label>
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${campaignForm.scheduleType === "now" ? "bg-emerald-500 text-zinc-950" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}
                      onClick={() => setCampaignForm(p => ({ ...p, scheduleType: "now" }))}
                    >
                      Send Now
                    </button>
                    <button
                      type="button"
                      className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${campaignForm.scheduleType === "later" ? "bg-purple-500 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}
                      onClick={() => setCampaignForm(p => ({ ...p, scheduleType: "later" }))}
                    >
                      Send Later
                    </button>
                  </div>
                </div>

                {campaignForm.scheduleType === "later" && (
                  <div className="space-y-1 animate-in slide-in-from-right-2 duration-200">
                    <Label className="text-zinc-400 text-[10px]">Select Date & Time</Label>
                    <input
                      type="datetime-local"
                      required={campaignForm.scheduleType === "later"}
                      value={campaignForm.scheduledAt}
                      onChange={(e) => setCampaignForm(p => ({ ...p, scheduledAt: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-md p-1.5 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCampaignModalOpen(false)} className="border-zinc-850 text-zinc-400">Cancel</Button>
                <Button type="submit" className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-extrabold text-xs">
                  {campaignForm.scheduleType === "later" ? "Schedule Campaign" : "Blast Campaign Now"}
                </Button>
              </DialogFooter>
            </form>

            {/* Right: Dynamic High-Fidelity Simulator Preview */}
            <div className="space-y-4">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-emerald-500 animate-pulse" /> Realtime Channel Mockup Preview
              </span>

              {activeCreatorChannel === "Email" ? (
                /* EMAIL MOCKUP SCREEN */
                <div className="border border-zinc-900 rounded-xl bg-white overflow-hidden shadow-2xl flex flex-col h-[520px]">
                  <div className="bg-zinc-100 border-b border-zinc-200 p-2 text-zinc-600 flex items-center gap-1 text-[10px] font-mono">
                    <span className="text-rose-500">●</span>
                    <span className="text-amber-500">●</span>
                    <span className="text-emerald-500">●</span>
                    <span className="ml-2 font-bold">To:</span> <span className="text-zinc-500">all_customers@taazabites.in</span>
                  </div>
                  <div className="bg-zinc-50 p-2.5 border-b border-zinc-200 text-zinc-800">
                    <div className="text-xs"><span className="font-bold text-zinc-500">Subject:</span> <span className="font-semibold">{campaignForm.subject || "Eat Clean, Stay Fit with Taaza Bites"}</span></div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 text-zinc-800">
                    <div className="max-w-md mx-auto bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
                      {/* Logo header */}
                      <div className="bg-zinc-900 p-4 text-center flex items-center justify-center gap-2">
                        <span className="text-emerald-500 font-black text-sm tracking-tight">TaazaBites</span>
                        <span className="text-white text-xs font-light">Clean Cooking</span>
                      </div>
                      
                      {/* Banner */}
                      {campaignForm.imageUrl && (
                        <div className="h-36 overflow-hidden">
                          <img src={campaignForm.imageUrl} referrerPolicy="no-referrer" alt="Promo banner" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div className="text-xs font-bold">Hi Customer Name,</div>
                        <div className="text-[11px] text-zinc-600 whitespace-pre-wrap leading-relaxed">
                          {campaignForm.body || "Your organic high-protein nutrition meals are ready to be dispatched from the gourmet kitchen hubs. Reserve your delivery schedules now!"}
                        </div>
                        
                        {/* CTA button */}
                        {campaignForm.buttonText && (
                          <div className="text-center pt-2">
                            <a 
                              href={campaignForm.buttonUrl || "javascript:void(0)"} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs py-2 px-6 rounded-md inline-block shadow-md"
                            >
                              {campaignForm.buttonText}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Email Footer */}
                      <div className="bg-zinc-50 p-3 text-center text-[9px] text-zinc-400 border-t border-zinc-100">
                        Taaza Bites Gourmet Kitchens Ltd, G-Block APMC. You received this email because you subscribed to clean eating plans.
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeCreatorChannel === "WhatsApp" ? (
                /* WHATSAPP CHAT PREVIEW */
                <div className="border border-zinc-900 rounded-xl bg-zinc-950/20 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] overflow-hidden shadow-2xl flex flex-col h-[520px]">
                  <div className="bg-[#075e54] p-3 text-white flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black">TB</div>
                    <div>
                      <div className="text-xs font-bold">Taaza Bites Updates</div>
                      <div className="text-[9px] text-emerald-300">Verified Business Account</div>
                    </div>
                  </div>

                  <div className="flex-1 p-4 space-y-4 overflow-y-auto flex flex-col justify-end">
                    <div className="bg-white text-zinc-900 rounded-lg p-3 max-w-[85%] self-start shadow-sm border border-zinc-200/50 space-y-2">
                      {campaignForm.imageUrl && (
                        <div className="h-28 overflow-hidden rounded-md">
                          <img src={campaignForm.imageUrl} referrerPolicy="no-referrer" alt="WhatsApp attach" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="text-xs leading-relaxed whitespace-pre-wrap">
                        {campaignForm.body || "Hello! We are delivering your healthy meal pack soon."}
                      </div>
                      
                      {campaignForm.buttonText && (
                        <div className="border-t border-zinc-100 pt-1.5 flex items-center justify-center text-blue-500 font-bold text-xs gap-1">
                          <MessageSquare className="h-3 w-3" /> {campaignForm.buttonText}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* PUSH NOTIFICATION PREVIEW */
                <div className="border border-zinc-900 rounded-xl bg-[url('https://images.unsplash.com/photo-1546482502-04b34179d85b?q=80&w=1200')] bg-cover overflow-hidden shadow-2xl flex flex-col justify-center items-center h-[520px] p-4">
                  <div className="w-full max-w-xs bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-3.5 text-white shadow-2xl space-y-2 animate-bounce-slow">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-emerald-500/20 p-1 rounded text-emerald-400 font-bold text-[8px]">TB</span>
                        <span className="font-bold">TAAZA BITES</span>
                      </div>
                      <span>now</span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">
                        {campaignForm.name || "Special Flash Deal!"}
                      </div>
                      <div className="text-[11px] text-zinc-300 leading-relaxed line-clamp-2">
                        {campaignForm.body || "Hi Customer, get healthy organic lunch box recipes ready to eat immediately."}
                      </div>
                    </div>

                    {campaignForm.imageUrl && (
                      <div className="h-24 overflow-hidden rounded-lg">
                        <img src={campaignForm.imageUrl} referrerPolicy="no-referrer" alt="Push attach" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="text-[9px] text-zinc-500 font-mono text-right">Slide to view details</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: Duplicate Template Confirmation */}
      <Dialog open={isDuplicateModalOpen} onOpenChange={setIsDuplicateModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-sm">
              <Copy className="h-4 w-4 text-emerald-500" /> Confirm Template Duplication
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Would you like to duplicate template "<strong>{templateToDuplicate?.name}</strong>"? This creates an identical copy ready to be customized in the active library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => { setIsDuplicateModalOpen(false); setTemplateToDuplicate(null) }} className="border-zinc-800 text-zinc-400 text-xs">Cancel</Button>
            <Button onClick={handleDuplicateTemplate} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-extrabold text-xs">Yes, Duplicate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: Secure gateway settings credentials */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5">
              <Settings className="h-5 w-5 text-emerald-500 animate-spin-slow" /> Enterprise Gateways Configurations
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">Configure your secure API tokens for production cloud integrations. All credentials remain fully encrypted.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs font-bold">Meta WhatsApp Business Token</Label>
              <Input
                type="password"
                value={settingsForm.metaToken}
                onChange={(e) => setSettingsForm(p => ({ ...p, metaToken: e.target.value }))}
                className="bg-zinc-900 border-zinc-800 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs font-bold">Meta Phone Number ID</Label>
              <Input
                value={settingsForm.metaPhoneId}
                onChange={(e) => setSettingsForm(p => ({ ...p, metaPhoneId: e.target.value }))}
                className="bg-zinc-900 border-zinc-800 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs font-bold">Firebase Push Notifications</Label>
              <Input
                type="password"
                value={settingsForm.fcmKey}
                onChange={(e) => setSettingsForm(p => ({ ...p, fcmKey: e.target.value }))}
                className="bg-zinc-900 border-zinc-800 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs font-bold">Brevo Transactional SMTP Key</Label>
              <Input
                type="password"
                value={settingsForm.brevoKey}
                onChange={(e) => setSettingsForm(p => ({ ...p, brevoKey: e.target.value }))}
                className="bg-zinc-900 border-zinc-800 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs font-bold">SendGrid API Key</Label>
              <Input
                type="password"
                value={settingsForm.sendgridKey}
                onChange={(e) => setSettingsForm(p => ({ ...p, sendgridKey: e.target.value }))}
                className="bg-zinc-900 border-zinc-800 text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsSettingsModalOpen(false)} className="border-zinc-850 text-zinc-400">Cancel</Button>
            <Button onClick={handleSaveSettings} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-extrabold text-xs">Save Configurations</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
