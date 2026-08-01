import React, { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Send, 
  Calendar, 
  Users, 
  MessageSquare, 
  Mail, 
  Bell, 
  Zap, 
  Eye, 
  Copy, 
  Trash2, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ChevronRight,
  Info,
  BarChart
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { communicationService } from "../../services/communication"
import { Campaign } from "../../types"

export default function CampaignManager() {
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<string>("gupshup")
  const [previewContent, setPreviewContent] = useState("")
  const [campaignName, setCampaignName] = useState("")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    const unsub = communicationService.subscribeToCampaigns((data) => {
      setCampaigns(data)
    })
    return unsub
  }, [])

  const ChannelIcon = ({ channel, className }: { channel: string, className?: string }) => {
    switch (channel) {
      case "gupshup": return <MessageSquare className={className || "h-4 w-4 text-emerald-500"} />
      case "email": return <Mail className={className || "h-4 w-4 text-purple-500"} />
      case "push": return <Bell className={className || "h-4 w-4 text-yellow-500"} />
      default: return <Zap className={className || "h-4 w-4 text-blue-500"} />
    }
  }

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "running": return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0">RUNNING</Badge>
      case "scheduled": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0">SCHEDULED</Badge>
      case "completed": return <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 px-2 py-0">COMPLETED</Badge>
      case "draft": return <Badge className="bg-zinc-900 text-zinc-600 border-zinc-800 px-2 py-0">DRAFT</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white font-sans">Campaign Management</h1>
          <p className="text-zinc-500 text-sm">Create and monitor automated broadcasts across channels.</p>
        </div>
        <Button onClick={() => setIsComposerOpen(true)} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold px-6">
          <Plus className="h-5 w-5 mr-2" /> Create New Campaign
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input placeholder="Search campaigns by name, ID or channel..." className="bg-zinc-950 border-zinc-900 pl-10 text-zinc-300 h-11" />
        </div>
        <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 text-zinc-400 h-11">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {campaigns.map((camp) => (
          <Card key={camp.id} className="bg-zinc-950 border-zinc-900 hover:border-zinc-800 transition-colors group">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                    <ChannelIcon channel={camp.channel} className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{camp.name}</h3>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={camp.status} />
                      <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{camp.channel}</span>
                      <span className="h-1 w-1 rounded-full bg-zinc-800" />
                      <span className="text-[10px] text-zinc-500">{camp.createdAt ? `Created on ${camp.createdAt.split('T')[0]}` : 'Not started'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 px-8 border-x border-zinc-900">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Sent</p>
                    <p className="text-xl font-black text-white">{camp.sentCount > 1000 ? `${(camp.sentCount/1000).toFixed(1)}k` : camp.sentCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Delivered</p>
                    <p className="text-xl font-black text-white">{camp.deliveredCount > 1000 ? `${(camp.deliveredCount/1000).toFixed(1)}k` : camp.deliveredCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Read Rate</p>
                    <p className="text-xl font-black text-emerald-500">
                      {camp.sentCount > 0 ? `${Math.round((camp.openedCount / camp.deliveredCount) * 100)}%` : '0%'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-500 hover:text-white hover:bg-zinc-900">
                    <Eye className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-500 hover:text-white hover:bg-zinc-900">
                    <BarChart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-500 hover:text-red-500 hover:bg-red-500/10">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message Composer Dialog */}
      <Dialog open={isComposerOpen} onOpenChange={setIsComposerOpen}>
        <DialogContent className="max-w-[95vw] w-[1600px] h-[90vh] bg-zinc-950 border-zinc-900 p-0 overflow-hidden rounded-2xl flex flex-col">
          {/* Fixed Header */}
          <div className="bg-zinc-900/50 p-6 border-b border-zinc-900 flex justify-between items-center shrink-0">
            <div>
              <DialogTitle className="text-2xl font-black tracking-tighter text-white">Create New Campaign</DialogTitle>
              <DialogDescription className="text-zinc-500">Design your message and select target audience.</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-zinc-800 text-zinc-400 bg-zinc-900">DRAFT</Badge>
            </div>
          </div>
          
          {/* Grid Body */}
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            {/* Form Side */}
            <div className="col-span-5 border-r border-zinc-900 overflow-y-auto p-8 custom-scrollbar">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Campaign Name</Label>
                  <Input 
                    placeholder="e.g. Weekend Special 20% Off" 
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white h-12 text-sm rounded-lg" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Target Channel</Label>
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white h-12 text-sm rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-zinc-800">
                        <SelectItem value="gupshup" className="text-white focus:bg-emerald-500/10">gupshup (Gupshup)</SelectItem>
                        <SelectItem value="email" className="text-white focus:bg-emerald-500/10">Email (Brevo)</SelectItem>
                        <SelectItem value="push" className="text-white focus:bg-emerald-500/10">Push Notification (FCM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Customer Segment</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white h-12 text-sm rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-zinc-800">
                        <SelectItem value="all" className="text-white">All Active Customers (48,294)</SelectItem>
                        <SelectItem value="subscribers" className="text-white">Active Subscribers (1,204)</SelectItem>
                        <SelectItem value="dormant" className="text-white">Dormant Users (12,400)</SelectItem>
                        <SelectItem value="custom" className="text-white">+ Create New Segment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-10 border-t border-zinc-900">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Message Content</Label>
                  <Button variant="ghost" size="sm" className="h-8 text-xs bg-zinc-900/50 hover:bg-zinc-800 text-emerald-500 font-bold px-3 rounded-lg">Insert Placeholder {`{ }`}</Button>
                </div>
                <Textarea 
                  placeholder="Type your message here... Use {name} for personalization." 
                  className="bg-zinc-950 border-zinc-800 text-white min-h-[200px] font-sans leading-relaxed rounded-xl text-sm"
                  value={previewContent}
                  onChange={(e) => setPreviewContent(e.target.value)}
                />
                <div className="flex gap-3">
                  <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400 text-[10px] font-bold px-3 py-1">CHARACTERS: {previewContent.length}</Badge>
                  <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400 text-[10px] font-bold px-3 py-1">MEDIA: NO ATTACHMENT</Badge>
                </div>
              </div>

              <div className="bg-zinc-900/20 p-6 rounded-xl border border-zinc-900/50 flex items-start gap-5 mt-10">
                <div className="h-12 w-12 rounded-xl bg-blue-500/5 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <Info className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1.5">Scheduling Protocol</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">Broadcasts are throttled at 50 messages per second to ensure high delivery rates and compliance with gateway policies.</p>
                </div>
              </div>
            </div>

            {/* Preview Side */}
            <div className="col-span-7 p-8 flex flex-col items-center sticky top-0 h-full bg-zinc-900/10">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-8">Live Preview</p>
              
              <AnimatePresence mode="wait">
                {selectedChannel === 'gupshup' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-[280px] bg-[#0b141a] rounded-[24px] border-[6px] border-zinc-800 overflow-hidden shadow-2xl"
                  >
                    <div className="bg-[#1f2c33] p-3 flex items-center gap-2 border-b border-zinc-800/50">
                      <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Smartphone className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-white">Taazabites Admin</p>
                        <p className="text-[8px] text-emerald-500">online</p>
                      </div>
                    </div>
                    <div className="p-4 min-h-[300px] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[length:150px]">
                      <div className="bg-[#dcf8c6] p-3 rounded-xl rounded-tl-none shadow-sm max-w-[90%] relative">
                        <p className="text-[11px] text-[#0b141a] whitespace-pre-wrap leading-relaxed">
                          {previewContent || "Hello! Your delicious Taazabites meal is being prepared. Stay tuned for delivery updates!"}
                        </p>
                        <p className="text-[8px] text-[#555] text-right mt-1">12:44 PM</p>
                        <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[8px] border-t-[#dcf8c6] border-l-[8px] border-l-transparent" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedChannel === 'push' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-[280px] bg-zinc-900 rounded-3xl border border-zinc-800 p-4 shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-emerald-500 flex items-center justify-center">
                          <Bell className="h-3 w-3 text-zinc-950" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400">TAAZABITES</span>
                      </div>
                      <span className="text-[8px] text-zinc-600">now</span>
                    </div>
                    <p className="text-xs font-bold text-white mb-1">{campaignName || "Special Notification"}</p>
                    <p className="text-[11px] text-zinc-500 leading-tight">
                      {previewContent || "New menu items added! Check out our latest healthy treats and order now."}
                    </p>
                  </motion.div>
                )}

                {selectedChannel === 'email' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col"
                  >
                    <div className="bg-zinc-100 p-4 border-b border-zinc-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-red-400" />
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                        <div className="h-2 w-2 rounded-full bg-green-400" />
                      </div>
                      <p className="text-[10px] text-zinc-400">To: customer@example.com</p>
                      <p className="text-[11px] font-bold text-zinc-800 mt-1">Subject: {campaignName || "Welcome to Taazabites"}</p>
                    </div>
                    <div className="p-6 min-h-[250px]">
                      <div className="h-10 w-full bg-emerald-500 rounded mb-4 flex items-center justify-center">
                        <span className="text-white font-black italic text-xs tracking-tighter">TAAZABITES</span>
                      </div>
                      <p className="text-[11px] text-zinc-700 whitespace-pre-wrap">
                        {previewContent || "Dear Customer,\n\nWelcome to Taazabites! We're excited to have you on board with our premium healthy meal subscriptions.\n\nBest regards,\nTaazabites Team"}
                      </p>
                      <div className="mt-8 pt-4 border-t border-zinc-100 text-[8px] text-zinc-400 text-center">
                        © 2024 Taazabites. All rights reserved.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 flex gap-4">
                <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-white">
                  <Smartphone className="h-4 w-4 mr-2" /> Mobile
                </Button>
                <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-white">
                  <ChevronRight className="h-4 w-4 mr-2" /> Desktop
                </Button>
              </div>
            </div>
          </div>
          
          {/* Fixed Footer */}
          <div className="bg-zinc-900/50 p-6 border-t border-zinc-900 flex justify-end gap-2 shrink-0">
              <Button variant="outline" className="border-zinc-800 text-zinc-400" onClick={() => setIsComposerOpen(false)}>Cancel</Button>
              <Button variant="outline" className="border-zinc-800 text-zinc-400" onClick={() => setIsComposerOpen(false)}>Save Draft</Button>
              <Button variant="outline" className="border-zinc-800 text-zinc-400">Send Test</Button>
              <Button className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold">Launch Campaign</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
