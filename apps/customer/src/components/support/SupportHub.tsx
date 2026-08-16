import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/db";
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { SupportTicket } from "../../firebase/collections";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LifeBuoy, 
  Send, 
  Plus, 
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  HelpCircle,
  Upload,
  Star,
  Check,
  ChevronRight,
  ArrowLeft,
  MessageCircle,
  User,
  ExternalLink,
  ShieldCheck,
  Activity
} from "lucide-react";
import { Card, Button } from "../ui/primitives";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { useToast } from "../../context/ToastContext";

export default function SupportHub() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Layout tabs
  const [activeSubTab, setActiveSubTab] = useState<"tickets" | "chat" | "feedback" | "contacts">("tickets");

  // State for Support Tickets
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "delivery",
    priority: "medium",
    message: ""
  });

  // State for Support Rating
  const [ratingVal, setRatingVal] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState("");
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  // State for Live Chat Simulator
  const [liveChatMessages, setLiveChatMessages] = useState<{ sender: "user" | "agent"; text: string; time: string }[]>([
    { sender: "agent", text: "Hello! Thank you for contacting Taaza Bites Support. How can I assist you with your meal plan today?", time: "09:00 AM" }
  ]);
  const [liveChatInput, setLiveChatInput] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  // State for unified Feedback tab (Meals, Delivery, Support, Subscription, Nutrition)
  const [feedbackForm, setFeedbackForm] = useState({
    meals: 5,
    delivery: 5,
    support: 5,
    subscription: 5,
    nutrition: 5,
    comment: ""
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Listen to Firestore tickets collection in real-time
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "supportTickets"),
      where("userId", "==", currentUser.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const ticketList = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setTickets(ticketList);
      setLoading(false);

      // Keep selected ticket in sync with Firestore updates (e.g. replies)
      if (selectedTicket) {
        const updated = ticketList.find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, selectedTicket?.id]);

  // Handle Drag & Drop and Base64 Conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Attachment size must be under 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
      showToast("Image attached successfully!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !ticketForm.message || !ticketForm.subject) return;

    try {
      const tId = `T-${Date.now().toString().slice(-6)}`;
      const newTicketPayload = {
        ticketId: tId,
        userId: currentUser.uid,
        subject: ticketForm.subject,
        category: ticketForm.category,
        priority: ticketForm.priority,
        status: "open",
        messages: [{
          senderId: currentUser.uid,
          senderName: currentUser.displayName || currentUser.email || "Customer",
          senderRole: "customer",
          message: ticketForm.message,
          attachments: attachedImage ? [attachedImage] : [],
          createdAt: new Date().toISOString()
        }],
        attachments: attachedImage ? [attachedImage] : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "supportTickets"), newTicketPayload);
      
      // Dispatch server notification
      await fetch("/api/communication/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.uid,
          type: "ticket",
          title: "Ticket Raised! 🎫",
          message: `Ticket ${tId} is now active. Our nutritionists are auditing.`,
          channel: ["app", "whatsapp"]
        })
      });

      showToast("Support Ticket raised successfully!", "success");
      setShowCreateModal(false);
      setAttachedImage(null);
      setTicketForm({ subject: "", category: "delivery", priority: "medium", message: "" });
    } catch (err) {
      console.error(err);
      showToast("Failed to compile ticket.", "error");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!newMessage && !attachedImage) || !currentUser) return;

    try {
      const ticketRef = doc(db, "supportTickets", selectedTicket.id);
      const replyPayload = {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || "You",
        senderRole: "customer",
        message: newMessage,
        attachments: attachedImage ? [attachedImage] : [],
        createdAt: new Date().toISOString()
      };

      await updateDoc(ticketRef, {
        messages: arrayUnion(replyPayload),
        updatedAt: serverTimestamp(),
        status: "open"
      });

      setNewMessage("");
      setAttachedImage(null);
      showToast("Reply transmitted securely.", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message === 'Failed to fetch' ? "Could not connect to the server. Please check your internet connection and try again." : (err.message || "Transmission failure."), "error");
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const ticketRef = doc(db, "supportTickets", ticketId);
      await updateDoc(ticketRef, {
        status: "closed",
        updatedAt: serverTimestamp()
      });
      showToast("Ticket closed successfully. Please rate your support experience.", "success");
      setRatingVal(0);
      setIsRatingSubmitted(false);
    } catch (err) {
      showToast("Could not update status.", "error");
    }
  };

  const handleSubmitRating = async (ticketId: string) => {
    if (ratingVal === 0) return;
    try {
      const ticketRef = doc(db, "supportTickets", ticketId);
      await updateDoc(ticketRef, {
        rating: ratingVal,
        ratingComment,
        ratedAt: new Date().toISOString()
      });
      setIsRatingSubmitted(true);
      showToast("Thank you for rating our support team!", "success");
    } catch (err) {
      showToast("Failed to save rating.", "error");
    }
  };

  // WhatsApp gupshup integration simulation
  const handleWhatsAppTrigger = async () => {
    if (!currentUser) return;
    try {
      await fetch("/api/communication/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.uid,
          type: "subscription",
          title: "WhatsApp Channel Connected 💬",
          message: "WhatsApp session established over Gupshup API gateway. Realtime nutrition dispatch activated.",
          channel: ["app", "whatsapp"]
        })
      });
      showToast("Simulated WhatsApp session established! Gupshup webhook fired.", "success");
    } catch (err) {
      showToast("WhatsApp webhook fail.", "error");
    }
  };

  // Live Chat Simulator reply logic
  const handleLiveChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveChatInput.trim()) return;

    const userText = liveChatInput;
    setLiveChatMessages(prev => [...prev, { sender: "user", text: userText, time: format(new Date(), "hh:mm a") }]);
    setLiveChatInput("");
    setIsAgentTyping(true);

    // Simulated responses mimicking real customer support agent
    setTimeout(() => {
      let reply = "Our records show your subscription is active. I am checking with our kitchen team about your adjustments.";
      if (userText.toLowerCase().includes("delivery") || userText.toLowerCase().includes("time")) {
        reply = "I understand you have a query regarding delivery timeline. Our delivery partner is on the way. Your meal will be delivered between 12:00 PM and 2:00 PM.";
      } else if (userText.toLowerCase().includes("pause") || userText.toLowerCase().includes("skip")) {
        reply = "You can pause or skip deliveries directly on your Calendar page, and any refunds will be credited to your wallet instantly!";
      } else if (userText.toLowerCase().includes("allergy") || userText.toLowerCase().includes("medical")) {
        reply = "Understood. Please update any allergies or health factors under your Health Assessment to automatically filter ingredients.";
      }

      setLiveChatMessages(prev => [...prev, { sender: "agent", text: reply, time: format(new Date(), "hh:mm a") }]);
      setIsAgentTyping(false);
    }, 1500);
  };

  // Submit Feedback (Meals, Delivery, Support, Subscription, Nutrition)
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSubmittingFeedback(true);
    try {
      await addDoc(collection(db, "feedback"), {
        userId: currentUser.uid,
        userEmail: currentUser.email || "customer@taazabites.com",
        mealsRating: feedbackForm.meals,
        deliveryRating: feedbackForm.delivery,
        supportRating: feedbackForm.support,
        subscriptionRating: feedbackForm.subscription,
        nutritionRating: feedbackForm.nutrition,
        comments: feedbackForm.comment,
        createdAt: serverTimestamp()
      });

      showToast("Feedback submitted successfully!", "success");
      setFeedbackForm({ meals: 5, delivery: 5, support: 5, subscription: 5, nutrition: 5, comment: "" });
    } catch (err) {
      console.error(err);
      showToast("Feedback submission failed.", "error");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Segmented Controller (Tabs) */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-[24px] max-w-xl mx-auto border border-zinc-200 dark:border-zinc-800 shrink-0">
        {[
          { id: "tickets", label: "Tickets Tracker" },
          { id: "chat", label: "Live Support" },
          { id: "feedback", label: "Feedback" },
          { id: "contacts", label: "Direct Lines" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={cn(
              "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-[18px] transition-all",
              activeSubTab === tab.id 
                ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10" 
                : "text-zinc-500 hover:text-zinc-850"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Support Tickets tab */}
        {activeSubTab === "tickets" && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <LifeBuoy className="h-6 w-6 text-emerald-600" />
                  Support Tickets Engine
                </h3>
                <p className="text-xs font-medium text-zinc-500 mt-0.5">Audit, escalate, and resolve technical or culinary tickets.</p>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="rounded-2xl h-12 px-6 bg-zinc-950 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" /> New Ticket
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse bg-white h-24 rounded-[32px] border border-zinc-100" />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <Card className="p-16 border-dashed border-2 border-zinc-200 flex flex-col items-center text-center rounded-[48px] bg-white">
                <HelpCircle className="h-10 w-10 text-zinc-300 mb-4" />
                <h3 className="text-lg font-black text-zinc-900">No Active Tickets</h3>
                <p className="text-xs font-medium text-zinc-500 mt-1 max-w-xs mb-6">
                  Need meal modifications, address fixes, or payment audits? Raise a ticket.
                </p>
                <Button onClick={() => setShowCreateModal(true)} className="rounded-xl px-5 bg-zinc-900 text-white font-black text-xs uppercase tracking-widest">Create Ticket</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tickets.map((ticket) => (
                  <Card 
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-6 bg-white border-zinc-150 rounded-[32px] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{ticket.ticketId}</span>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                          ticket.status === "open" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-zinc-50 text-zinc-400 border-zinc-150"
                        )}>
                          {ticket.status}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-zinc-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">{ticket.subject}</h4>
                      <p className="text-xs font-medium text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {ticket.messages?.[ticket.messages.length - 1]?.message}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <span>Category: {ticket.category}</span>
                      <div className="flex items-center gap-1.5 text-zinc-400 font-bold">
                        <Clock className="h-3 w-3" />
                        <span>Update {ticket.updatedAt?.toDate ? format(ticket.updatedAt.toDate(), "dd MMM") : "Today"}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Live Chat simulator tab */}
        {activeSubTab === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-white border border-zinc-150 rounded-[48px] shadow-sm flex flex-col h-[520px] overflow-hidden">
              <div className="p-6 bg-zinc-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black leading-tight">Concierge Specialist</h4>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online • Guaranteed 10m Response
                    </span>
                  </div>
                </div>
                <Activity className="h-5 w-5 text-zinc-400" />
              </div>

              {/* Chat screen */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50">
                {liveChatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="flex flex-col max-w-[80%]">
                      <div className={cn(
                        "p-4 rounded-[22px] text-sm leading-relaxed",
                        msg.sender === "user" 
                          ? "bg-zinc-900 text-white rounded-tr-none shadow-md" 
                          : "bg-white border border-zinc-150 text-zinc-800 rounded-tl-none"
                      )}>
                        <p>{msg.text}</p>
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold text-zinc-400 tracking-wider mt-1.5",
                        msg.sender === "user" ? "text-right" : "text-left"
                      )}>{msg.time}</span>
                    </div>
                  </div>
                ))}
                {isAgentTyping && (
                  <div className="flex justify-start">
                    <span className="text-xs font-bold text-zinc-400 animate-pulse">Specialist is compiling data...</span>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <form onSubmit={handleLiveChatSend} className="p-5 border-t border-zinc-150 flex gap-3 bg-white shrink-0">
                <input 
                  type="text" 
                  value={liveChatInput}
                  onChange={(e) => setLiveChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold placeholder:text-zinc-400 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  disabled={isAgentTyping}
                />
                <Button type="submit" disabled={isAgentTyping || !liveChatInput.trim()} className="h-12 px-6 rounded-2xl bg-zinc-900 text-white font-black text-xs uppercase tracking-widest">Send</Button>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Feedback Center tab */}
        {activeSubTab === "feedback" && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-xl mx-auto"
          >
            <Card className="p-8 bg-white border border-zinc-150 rounded-[48px] shadow-sm">
              <div className="text-center pb-6 border-b border-zinc-100 mb-6">
                <h3 className="text-xl font-black text-zinc-900">Feedback & Suggestions</h3>
                <p className="text-xs font-medium text-zinc-500 mt-1">Help us fine-tune our recipes, delivery, and services.</p>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                {[
                  { field: "meals", label: "Meal Quality & Sourcing" },
                  { field: "delivery", label: "Delivery Precision & Temperature" },
                  { field: "support", label: "Customer Support Responsiveness" },
                  { field: "subscription", label: "Subscription Pricing & Flexibility" },
                  { field: "nutrition", label: "Nutrition Advisor Customization" }
                ].map((item) => (
                  <div key={item.field} className="flex justify-between items-center p-3 hover:bg-zinc-50 rounded-xl transition-all">
                    <span className="text-xs font-black text-zinc-800 uppercase tracking-wider">{item.label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackForm({ ...feedbackForm, [item.field]: star })}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={cn(
                            "h-5 w-5",
                            (feedbackForm as any)[item.field] >= star ? "fill-amber-400 text-amber-400" : "text-zinc-300"
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="space-y-2 pt-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Meal Suggestions & Comments</label>
                  <textarea 
                    value={feedbackForm.comment}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                    placeholder="Tell us what you loved or what needs calibrating..."
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all min-h-[100px] resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={submittingFeedback}
                  className="w-full rounded-2xl py-4 h-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/15 flex justify-center items-center"
                >
                  {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Contacts & Direct Lines tab */}
        {activeSubTab === "contacts" && (
          <motion.div
            key="contacts"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="p-8 bg-zinc-950 text-white rounded-[40px] shadow-xl flex flex-col justify-between h-64">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Enterprise SMS</p>
                  <h4 className="text-xl font-black mt-2">WhatsApp Channel</h4>
                </div>
                <MessageCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">Integrate WhatsApp to receive real-time shipping reminders, health advice, and calorie reports.</p>
                <Button onClick={handleWhatsAppTrigger} className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 border-none">
                  Simulate Connection <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </Card>

            <Card className="p-8 bg-white border border-zinc-150 rounded-[40px] shadow-sm flex flex-col justify-between h-64">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Direct Support Hotline</p>
                  <h4 className="text-xl font-black text-zinc-900 mt-2">Specialist Call Center</h4>
                </div>
                <Phone className="h-6 w-6 text-zinc-900" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">Direct access line for premium subscribers to reach our lead culinary nutritionist and executive chefs.</p>
                <div className="p-4 bg-zinc-50 rounded-2xl flex justify-between items-center">
                  <span className="text-sm font-black text-zinc-800">+91 79757 71457</span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Live</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Details Chat & Close Rating Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-50 rounded-[48px] max-w-2xl w-full h-[80vh] shadow-2xl flex flex-col overflow-hidden border border-zinc-150"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 bg-white border-b border-zinc-150 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedTicket(null)} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-xl text-zinc-500 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{selectedTicket.ticketId}</span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                        selectedTicket.status === "open" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-zinc-50 text-zinc-400 border-zinc-150"
                      )}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-zinc-900 leading-tight">{selectedTicket.subject}</h3>
                  </div>
                </div>

                {selectedTicket.status === "open" && (
                  <Button 
                    onClick={() => handleCloseTicket(selectedTicket.id)}
                    variant="outline" 
                    className="rounded-xl text-xs font-black uppercase tracking-widest text-zinc-600 border-zinc-200"
                  >
                    Close Ticket
                  </Button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {selectedTicket.messages?.map((msg: any, i: number) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.senderRole === "customer" ? "ml-auto items-end" : "mr-auto items-start"
                  )}>
                    <div className={cn(
                      "p-4 md:p-5 rounded-[24px]",
                      msg.senderRole === "customer" 
                        ? "bg-zinc-900 text-white rounded-tr-none shadow-md" 
                        : "bg-white text-zinc-800 rounded-tl-none border border-zinc-150 shadow-sm"
                    )}>
                      <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                      
                      {/* Image attachments list */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {msg.attachments.map((img: string, imgIdx: number) => (
                            <img 
                              key={imgIdx} 
                              src={img} 
                              alt="Ticket attachment" 
                              className="max-h-36 rounded-xl object-contain border border-white/10 shadow-sm" 
                              loading="lazy"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 tracking-wider mt-2 uppercase">
                      {msg.senderRole === "customer" ? "You" : "Agent"} • {msg.createdAt ? format(new Date(msg.createdAt), "hh:mm a") : "Just now"}
                    </span>
                  </div>
                ))}

                {/* Post-Resolution Rating UI */}
                {selectedTicket.status === "closed" && (
                  <div className="p-6 bg-white border border-zinc-150 rounded-[32px] shadow-sm text-center space-y-4">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                    <div>
                      <h4 className="text-base font-black text-zinc-900">This Support Ticket is Resolved</h4>
                      <p className="text-xs font-medium text-zinc-500 mt-1">Please rate your concierge experience below.</p>
                    </div>

                    {!selectedTicket.rating && !isRatingSubmitted ? (
                      <div className="space-y-4">
                        <div className="flex justify-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRatingVal(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star className={cn(
                                "h-8 w-8",
                                ratingVal >= star ? "fill-amber-400 text-amber-400" : "text-zinc-300"
                              )} />
                            </button>
                          ))}
                        </div>
                        <input 
                          type="text" 
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          placeholder="Optional comments about support specialist..."
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <Button 
                          onClick={() => handleSubmitRating(selectedTicket.id)}
                          disabled={ratingVal === 0}
                          className="rounded-xl w-full bg-zinc-900 text-white font-black text-xs uppercase tracking-widest"
                        >
                          Submit Rating
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-black text-emerald-800 flex items-center justify-center gap-2">
                        <Check className="h-4 w-4" /> Rating Completed: {selectedTicket.rating || ratingVal} Stars!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat message composer */}
              {selectedTicket.status === "open" && (
                <div className="p-6 bg-white border-t border-zinc-150 shrink-0">
                  <form onSubmit={handleSendReply} className="space-y-4">
                    {/* Attachment preview */}
                    {attachedImage && (
                      <div className="flex items-center gap-3 p-2 bg-zinc-50 rounded-xl border border-zinc-150 max-w-xs relative">
                        <img src={attachedImage} alt="Attachment preview" className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase truncate">Image attached</span>
                        <button 
                          type="button" 
                          onClick={() => setAttachedImage(null)} 
                          className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      {/* File attachment button */}
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-150 flex items-center justify-center text-zinc-500 transition-colors shrink-0"
                        title="Upload Image"
                      >
                        <Upload className="h-5 w-5" />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />

                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type reply to nutritionist..."
                        className="flex-1 px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      />
                      <Button type="submit" disabled={!newMessage && !attachedImage} className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[48px] p-8 md:p-10 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh] border border-zinc-100"
            >
              <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mb-6">New Support Ticket</h3>
              <form onSubmit={handleCreateTicket} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Subject</label>
                  <input 
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    placeholder="e.g. Modify next week ingredients"
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Category</label>
                  <select 
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                  >
                    <option value="delivery">Delivery Timeline / Location</option>
                    <option value="quality">Meal Quality & Ingredients</option>
                    <option value="payment">Payment / Wallet Recharge</option>
                    <option value="subscription">Subscription Upgrades</option>
                    <option value="refund">Refund request</option>
                    <option value="nutritionist">Direct Nutritionist Review</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Escalation Priority</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["low", "medium", "high", "urgent"].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTicketForm({...ticketForm, priority: p})}
                        className={cn(
                          "py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                          ticketForm.priority === p 
                            ? "bg-zinc-950 border-zinc-950 text-white" 
                            : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Detailed Message</label>
                  <textarea 
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                    placeholder="Describe your request in details..."
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none min-h-[100px] resize-none"
                    required
                  />
                </div>

                {/* Upload Image Section */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ticket Attachment (Optional)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 bg-zinc-50"
                  >
                    <Upload className="h-4 w-4 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-500">
                      {attachedImage ? "Image Attached! Click to swap" : "Click to attach image"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 rounded-xl">Cancel</Button>
                  <Button type="submit" className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/15">Create Ticket</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
