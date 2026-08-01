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
  BadgeCheck
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"

export default function ConversationManager() {
  const [selectedConv, setSelectedConv] = useState<string | null>("1")
  const [message, setMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const conversations = [
    { id: "1", name: "Anish Kumar", lastMsg: "When will my order arrive?", time: "2m ago", unread: 2, status: "online", channel: "gupshup" },
    { id: "2", name: "Priya Sharma", lastMsg: "Thank you for the meal!", time: "15m ago", unread: 0, status: "offline", channel: "gupshup" },
    { id: "3", name: "Rahul Singh", lastMsg: "Payment failed twice.", time: "1h ago", unread: 0, status: "online", channel: "gupshup" },
    { id: "4", name: "Sneha Patel", lastMsg: "Can I pause my subscription?", time: "3h ago", unread: 0, status: "offline", channel: "gupshup" },
    { id: "5", name: "Vikram Malhotra", lastMsg: "The food was spicy.", time: "5h ago", unread: 0, status: "offline", channel: "gupshup" },
  ]

  const messages = [
    { id: 1, text: "Hello! I have a question about my subscription.", sender: "customer", time: "10:30 AM" },
    { id: 2, text: "Sure, Anish! How can I help you today?", sender: "agent", time: "10:32 AM" },
    { id: 3, text: "I want to know if I can change my delivery slot for tomorrow.", sender: "customer", time: "10:35 AM" },
    { id: 4, text: "Yes, you can change it from your profile, or I can do it for you here. Which slot would you prefer?", sender: "agent", time: "10:36 AM" },
    { id: 5, text: "8:00 AM - 9:00 AM would be perfect.", sender: "customer", time: "10:40 AM" },
    { id: 6, text: "Done! Your slot for tomorrow has been updated to 8 AM - 9 AM. Anything else?", sender: "agent", time: "10:42 AM" },
    { id: 7, text: "When will my order arrive today?", sender: "customer", time: "12:44 PM" },
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedConv])

  return (
    <div className="grid grid-cols-[350px_1fr_350px] h-[calc(100vh-120px)] gap-0 border-t border-zinc-900 bg-zinc-950">
      {/* Sidebar - Conversation List */}
      <div className="bg-zinc-950 border-r border-zinc-900 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-zinc-900/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-sm font-bold tracking-tight">Conversations</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
            <Input placeholder="Search chats..." className="bg-zinc-900 border-zinc-800 pl-10 h-10 text-xs rounded-lg" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                  selectedConv === conv.id 
                    ? "bg-zinc-900 border border-zinc-800" 
                    : "hover:bg-zinc-900/50 border border-transparent"
                }`}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 border border-zinc-800">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.name}`} />
                    <AvatarFallback className="bg-zinc-900 text-zinc-400 text-xs">{conv.name[0]}</AvatarFallback>
                  </Avatar>
                  {conv.status === 'online' && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-sm font-semibold text-white truncate">{conv.name}</h4>
                    <span className="text-[10px] text-zinc-600 font-medium">{conv.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-zinc-500 truncate">{conv.lastMsg}</p>
                    {conv.unread > 0 && (
                      <Badge className="bg-emerald-500 text-zinc-950 h-4 min-w-[16px] px-1 text-[10px] rounded-full border-none">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col h-full border-r border-zinc-900 bg-zinc-950">
        {selectedConv ? (
          <>
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-zinc-800">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversations.find(c => c.id === selectedConv)?.name}`} />
                  <AvatarFallback className="bg-zinc-900 text-zinc-400">
                    {conversations.find(c => c.id === selectedConv)?.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-semibold">{conversations.find(c => c.id === selectedConv)?.name}</h3>
                  <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> gupshup • Online
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
                  <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-600 text-[10px] px-3">MARCH 20, 2024</Badge>
                </div>
                
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[70%] ${msg.sender === 'agent' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-8 w-8 border border-zinc-800 mt-1 shrink-0">
                        <AvatarImage src={msg.sender === 'agent' ? "https://api.dicebear.com/7.x/bottts/svg?seed=Admin" : `https://api.dicebear.com/7.x/avataaars/svg?seed=Anish`} />
                      </Avatar>
                      <div className={`space-y-1 ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-xl text-sm ${
                          msg.sender === 'agent' 
                            ? "bg-emerald-500 text-zinc-950 rounded-tr-none" 
                            : "bg-zinc-900 text-zinc-200 rounded-tl-none border border-zinc-800"
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-zinc-600 px-1">{msg.time}</span>
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
                  placeholder="Type a message..." 
                  className="bg-transparent border-none focus-visible:ring-0 text-white min-h-[40px] max-h-[100px] resize-none py-2 px-0 text-sm"
                  rows={1}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white"><Smile className="h-4 w-4" /></Button>
                <Button className="h-8 w-8 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 p-0">
                  <Send className="h-4 w-4" />
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
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversations.find(c => c.id === selectedConv)?.name}`} />
                </Avatar>
                <h3 className="text-white font-semibold text-base">{conversations.find(c => c.id === selectedConv)?.name}</h3>
                <p className="text-xs text-zinc-500">Customer since Oct 2023</p>
             </div>
             
             <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Active Subscription</h4>
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-semibold text-white">Premium Meal Plan</p>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] h-4 rounded-full">ACTIVE</Badge>
                    </div>
                    <p className="text-[10px] text-zinc-500">Next billing: Mar 25, 2024</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Customer Health</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Loyalty Points</span>
                      <span className="text-emerald-500 font-semibold">2,450 pts</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Last Order Status</span>
                      <span className="text-blue-500 font-semibold">Delivered</span>
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

import { Textarea } from "@/components/ui/textarea"
