#!/bin/bash
cat << 'INNEREOF' > src/pages/communication/conversations.tsx
import React, { useState, useEffect, useRef } from "react"
import { 
  Search, 
  Filter, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  User, 
  Clock, 
  CheckCheck, 
  Phone, 
  Video, 
  Info,
  ChevronLeft,
  Zap,
  Star,
  Shield,
  MessageSquare,
  BadgeCheck,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { conversationService } from "../../services/communication"
import { format } from "date-fns"
import { toast } from "sonner"

export default function ConversationManager() {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = conversationService.subscribeToConversations((data) => {
      setConversations(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!selectedConvId) {
      setMessages([])
      return
    }
    const unsub = conversationService.subscribeToMessages(selectedConvId, (data) => {
      setMessages(data)
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    })
    conversationService.markAsRead(selectedConvId).catch(console.error)
    return () => unsub()
  }, [selectedConvId])

  const selectedConv = conversations.find(c => c.id === selectedConvId)

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConv) return
    const text = message.trim()
    setMessage("")
    setSending(true)
    try {
      await conversationService.sendMessage(selectedConv.id, selectedConv.phone || selectedConv.id, text)
    } catch (error: any) {
      toast.error("Failed to send message: " + error.message)
      setMessage(text)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return ""
    try {
      return format(new Date(isoString), "h:mm a")
    } catch (e) {
      return ""
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr_300px] h-[calc(100vh-65px)] bg-zinc-950 overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="flex flex-col border-r border-zinc-900 bg-zinc-950/50">
        <div className="p-4 border-b border-zinc-900 flex items-center justify-between sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-10">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-500" />
            Chats
          </h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-white">
            <Filter className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="p-3 border-b border-zinc-900 bg-zinc-950">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-9 bg-zinc-900/50 border-zinc-800 text-xs h-8 focus-visible:ring-emerald-500/20"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {loading ? (
             <div className="p-6 text-center text-zinc-500 flex flex-col items-center">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <span className="text-xs">Loading conversations...</span>
             </div>
          ) : conversations.length === 0 ? (
             <div className="p-6 text-center text-zinc-500 text-xs">No active conversations.</div>
          ) : (
            <div className="divide-y divide-zinc-900/50">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full text-left p-4 hover:bg-zinc-900/50 transition-colors flex gap-3 ${
                    selectedConvId === conv.id ? "bg-zinc-900/80 border-l-2 border-emerald-500" : "border-l-2 border-transparent"
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-zinc-800">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.name || conv.phone || conv.id}`} />
                      <AvatarFallback className="bg-zinc-900 text-zinc-400">{(conv.name || conv.phone || "U")[0]}</AvatarFallback>
                    </Avatar>
                    {conv.status === 'online' && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="text-sm font-semibold text-white truncate">{conv.name || conv.phone || "Unknown User"}</h4>
                      <span className="text-[10px] text-zinc-600 font-medium">{formatTime(conv.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-zinc-500 truncate">{conv.lastMessage || "No messages"}</p>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-emerald-500 text-zinc-950 h-4 min-w-[16px] px-1 text-[10px] rounded-full border-none">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col h-full border-r border-zinc-900 bg-zinc-950">
        {selectedConv ? (
          <>
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-zinc-800">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConv.name || selectedConv.phone || selectedConv.id}`} />
                  <AvatarFallback className="bg-zinc-900 text-zinc-400">{(selectedConv.name || selectedConv.phone || "U")[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-semibold">{selectedConv.name || selectedConv.phone || "Unknown User"}</h3>
                  <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> WhatsApp (Gupshup) • {selectedConv.status || 'Active'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6 bg-zinc-950">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-600 text-[10px] px-3">CONVERSATION HISTORY</Badge>
                </div>
                
                {messages.length === 0 && (
                   <div className="text-center text-zinc-500 text-xs mt-10">No messages yet. Send a message to start the conversation.</div>
                )}
                
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[70%] ${msg.sender === 'agent' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-8 w-8 border border-zinc-800 mt-1 shrink-0">
                        <AvatarImage src={msg.sender === 'agent' ? "https://api.dicebear.com/7.x/bottts/svg?seed=Admin" : `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConv.name || selectedConv.phone || selectedConv.id}`} />
                      </Avatar>
                      <div className={`space-y-1 ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-xl text-sm ${
                          msg.sender === 'agent' 
                            ? "bg-emerald-500 text-zinc-950 rounded-tr-none" 
                            : "bg-zinc-900 text-zinc-200 rounded-tl-none border border-zinc-800"
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-zinc-600 px-1 flex items-center gap-1 justify-end">
                           {formatTime(msg.createdAt)}
                           {msg.sender === 'agent' && (
                             <span className={msg.status === 'failed' ? 'text-red-500' : 'text-emerald-500'}>
                                {msg.status === 'failed' ? 'Failed' : (msg.status === 'sending' ? '...' : <CheckCheck className="h-3 w-3" />)}
                             </span>
                           )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 bg-zinc-950 border-t border-zinc-900">
              <div className="flex items-end gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 focus-within:border-emerald-500/50 transition-colors">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white"><Paperclip className="h-4 w-4" /></Button>
                <Textarea 
                  placeholder="Type a message via Gupshup..." 
                  className="bg-transparent border-none focus-visible:ring-0 text-white min-h-[40px] max-h-[100px] resize-none py-2 px-0 text-sm"
                  rows={1}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={sending}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white"><Smile className="h-4 w-4" /></Button>
                <Button 
                   className="h-8 w-8 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 p-0 disabled:opacity-50"
                   onClick={handleSendMessage}
                   disabled={sending || !message.trim()}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <MessageSquare className="h-12 w-12 text-zinc-800 mb-4" />
            <h3 className="text-white font-semibold">Select a conversation</h3>
            <p className="text-zinc-500 text-sm mt-2 max-w-[200px]">Choose a chat from the left to start viewing messages.</p>
          </div>
        )}
      </div>

      {/* Right Info Panel */}
      <div className="h-full bg-zinc-950 p-6 overflow-y-auto">
        {selectedConv ? (
          <>
             <div className="flex flex-col items-center text-center mb-8">
                <Avatar className="h-20 w-20 border-2 border-emerald-500/20 mb-4">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConv.name || selectedConv.phone || selectedConv.id}`} />
                </Avatar>
                <h3 className="text-white font-semibold text-base">{selectedConv.name || selectedConv.phone || "Unknown User"}</h3>
                <p className="text-xs text-zinc-500">{selectedConv.phone || "No phone number"}</p>
             </div>
             
             <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Customer Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Phone</span>
                      <span className="text-emerald-500 font-semibold">{selectedConv.phone || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Channel</span>
                      <span className="text-zinc-300 font-semibold uppercase">{selectedConv.channel || 'Whatsapp'}</span>
                    </div>
                  </div>
                </div>
             </div>
          </>
        ) : (
          <div className="text-center text-zinc-600 text-sm">Select a user to view profile details.</div>
        )}
      </div>
    </div>
  )
}
INNEREOF
chmod +x update_conv.sh
./update_conv.sh
