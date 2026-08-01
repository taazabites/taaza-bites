import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, X, MessageCircle, Phone, Mail, Search, ChevronDown, 
  Truck, Calendar, Salad, Wallet, Sparkles, ExternalLink, ArrowRight,
  ShieldCheck, Clock, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from "@/src/components/ui/primitives";
import { cn } from "@/src/lib/utils";
import { triggerHaptic } from "@/src/utils/haptics";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/src/context/ToastContext";

export interface TroubleshootingTopic {
  id: string;
  category: string;
  icon: React.ReactNode;
  question: string;
  shortSummary: string;
  steps: string[];
  actionLabel?: string;
  actionPath?: string;
  actionWhatsAppText?: string;
}

export const COMMON_TROUBLESHOOTING_TOPICS: TroubleshootingTopic[] = [
  {
    id: "delivery_tracking",
    category: "Delivery & Drivers",
    icon: <Truck className="w-4 h-4 text-emerald-500" />,
    question: "Where is my meal delivery or driver right now?",
    shortSummary: "Check live GPS tracking or contact your assigned delivery partner.",
    steps: [
      "Open the 'Orders' page on your dashboard to see your driver's live GPS route.",
      "Standard delivery windows: Morning Breakfast (7:00 AM - 8:30 AM), Lunch (12:00 PM - 1:30 PM).",
      "If marked delivered but not received, check your doorstep box or contact our WhatsApp team for an instant replacement."
    ],
    actionLabel: "Track Live Order",
    actionPath: "/delivery-experience",
    actionWhatsAppText: "Hi TaazaBites! My delivery is delayed or missing. Please help check order status."
  },
  {
    id: "pause_subscription",
    category: "Pause & Vacation",
    icon: <Calendar className="w-4 h-4 text-indigo-500" />,
    question: "How do I pause or skip meals when going on vacation?",
    shortSummary: "Use Smart Pause to freeze deliveries with 100% wallet credit rollover.",
    steps: [
      "Go to the 'Calendar' or 'Subscriptions' tab on your dashboard.",
      "Tap 'Pause Subscription' or 'Vacation Freeze' and select your departure and return dates.",
      "Cutoff time is 10:00 PM the night before delivery.",
      "All paused meal credits are automatically added back to your Taaza Wallet instantly with no expiry date."
    ],
    actionLabel: "Pause Subscription",
    actionPath: "/dashboard/calendar",
    actionWhatsAppText: "Hi TaazaBites! Need assistance pausing my active subscription plan."
  },
  {
    id: "meal_swap_diet",
    category: "Diet & Menu",
    icon: <Salad className="w-4 h-4 text-amber-500" />,
    question: "Can I swap dishes or change my spice level for tomorrow?",
    shortSummary: "Customize your daily menu up to 8:00 PM the previous evening.",
    steps: [
      "Navigate to 'Today's Menu' or 'Customize' from your home dashboard.",
      "Select alternative dish choices (e.g., Low-Carb, High-Protein, Keto, or Jain).",
      "Update spice levels and specific food allergies under 'Profile' -> 'Dietary Preferences'.",
      "Changes take effect on your next freshly prepared batch."
    ],
    actionLabel: "Customize Today's Menu",
    actionPath: "/dashboard/todays-meals",
    actionWhatsAppText: "Hi TaazaBites! I want to update my dietary preferences or dish choices."
  },
  {
    id: "wallet_refunds",
    category: "Wallet & Payments",
    icon: <Wallet className="w-4 h-4 text-teal-500" />,
    question: "How do meal credit refunds and Taaza Wallet balance work?",
    shortSummary: "Credits from skipped meals roll over 1:1 and auto-apply at renewal.",
    steps: [
      "Whenever a meal is skipped or paused, the exact rupee value is added to your 'Taaza Wallet'.",
      "Wallet cash is applied automatically to reduce your next subscription renewal invoice.",
      "If you experience a failed payment or duplicate charge, send us a WhatsApp message for an immediate reversal within 5 minutes."
    ],
    actionLabel: "View Wallet Balance",
    actionPath: "/wallet",
    actionWhatsAppText: "Hi TaazaBites! I have a query regarding my wallet balance or payment refund."
  },
  {
    id: "damaged_food",
    category: "Quality Assurance",
    icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
    question: "What if a meal container is damaged or quality is unsatisfactory?",
    shortSummary: "100% Quality Guarantee — Snap a photo for instant wallet refund or replacement.",
    steps: [
      "Take a quick photo of the container or dish.",
      "Tap the 'Chat on WhatsApp' button below and send us the image.",
      "Our support agent will issue a 100% instant wallet refund or dispatch a fresh replacement meal within 20 minutes."
    ],
    actionWhatsAppText: "Hi TaazaBites! I received a damaged or incorrect meal. Here is the picture."
  }
];

export function QuickHelpFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>("delivery_tracking");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const filteredTopics = COMMON_TROUBLESHOOTING_TOPICS.filter(t => 
    t.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.shortSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.steps.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenWhatsApp = (customText?: string) => {
    triggerHaptic('medium');
    const msg = customText || "Hi TaazaBites! I need quick support with my subscription deliveries.";
    const encoded = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/917975771457?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    showToast("Connecting to TaazaBites WhatsApp Support...", "info");
  };

  const handleNavigate = (path: string) => {
    triggerHaptic('light');
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Floating Quick Help Trigger Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => { triggerHaptic('light'); setIsOpen(true); }}
          className="group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-600/30 border border-white/20 cursor-pointer transition-all active:bg-emerald-700"
          aria-label="Quick Help & Support"
        >
          {/* Animated pulse badge ring */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-200"></span>
          </span>

          <MessageCircle className="w-5 h-5 text-white shrink-0" />
          
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-tight leading-none text-white">
              Quick Help
            </span>
            <span className="text-[9px] font-bold text-emerald-100 dark:text-emerald-200 leading-tight hidden sm:block">
              WhatsApp 24/7
            </span>
          </div>

          <span className="hidden md:inline-flex ml-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 text-white">
            FAQ
          </span>
        </motion.button>
      </div>

      {/* Quick Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="rounded-[2.5rem] p-5 sm:p-7 max-w-xl w-full shadow-2xl border transition-all my-auto max-h-[90vh] flex flex-col bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        WhatsApp Support Online
                      </span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Quick Help & Support</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Troubleshooting guides & instant WhatsApp chat
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div className="overflow-y-auto hide-scrollbar space-y-4 pr-1 flex-1">
                {/* Hero WhatsApp Direct Action Banner */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-600/20 border border-emerald-400/20 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-white/20 text-[9px] font-black uppercase tracking-wider text-white">
                          Direct WhatsApp Chat
                        </span>
                        <span className="text-[10px] text-emerald-100 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Response &lt; 2 mins
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black tracking-tight">
                        Need Immediate Assistance?
                      </h4>
                      <p className="text-xs text-emerald-100 font-medium leading-relaxed max-w-sm">
                        Connect with our dedicated support agents on WhatsApp for live order updates, refunds, or dietary changes.
                      </p>
                    </div>

                    <Button
                      onClick={() => handleOpenWhatsApp()}
                      className="w-full sm:w-auto shrink-0 bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs uppercase tracking-wider py-3.5 px-5 rounded-2xl shadow-lg border-none flex items-center justify-center gap-2 group transition-transform active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-4.5 h-4.5 fill-emerald-600 text-emerald-600 group-hover:scale-110 transition-transform" />
                      Chat on WhatsApp
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </Button>
                  </div>
                </div>

                {/* Search Bar for Troubleshooting Topics */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search delivery delay, pause subscription, wallet refund..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-xs font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Common Troubleshooting Accordion List */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                      Common Troubleshooting Steps ({filteredTopics.length})
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Tap topic to view guide
                    </span>
                  </div>

                  {filteredTopics.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5">
                      <HelpCircle className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No matching troubleshooting guides found</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Tap below to talk directly with support on WhatsApp</p>
                      <Button
                        onClick={() => handleOpenWhatsApp(`Hi TaazaBites! I have a question regarding: ${searchQuery}`)}
                        className="mt-3 bg-emerald-600 text-white text-xs font-black uppercase tracking-wider py-2 px-4 rounded-xl"
                      >
                        Ask on WhatsApp
                      </Button>
                    </div>
                  ) : (
                    filteredTopics.map((topic) => {
                      const isExpanded = expandedTopicId === topic.id;
                      return (
                        <div
                          key={topic.id}
                          className={cn(
                            "rounded-2xl border transition-all overflow-hidden",
                            isExpanded
                              ? "border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-500/5 shadow-xs"
                              : "border-zinc-200/80 dark:border-white/5 bg-zinc-50/80 dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-white/10"
                          )}
                        >
                          <button
                            onClick={() => {
                              triggerHaptic('light');
                              setExpandedTopicId(isExpanded ? null : topic.id);
                            }}
                            className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-white/10 flex items-center justify-center shrink-0 shadow-2xs">
                                {topic.icon}
                              </div>
                              <div>
                                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                                  {topic.category}
                                </span>
                                <h5 className="text-xs font-black text-zinc-900 dark:text-white">
                                  {topic.question}
                                </h5>
                              </div>
                            </div>
                            <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform shrink-0", isExpanded && "rotate-180 text-emerald-600")} />
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-4 pb-4 pt-1 border-t border-emerald-500/10 dark:border-white/5 space-y-3"
                              >
                                <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                                  {topic.shortSummary}
                                </p>

                                <div className="space-y-2 bg-white dark:bg-zinc-900/90 p-3 rounded-xl border border-zinc-200/60 dark:border-white/5">
                                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                                    Step-by-step resolution:
                                  </p>
                                  <ul className="space-y-1.5">
                                    {topic.steps.map((step, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                                        <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                          {idx + 1}
                                        </span>
                                        <span className="leading-tight">{step}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  {topic.actionPath && (
                                    <Button
                                      onClick={() => handleNavigate(topic.actionPath!)}
                                      className="py-2 px-3 text-[10px] font-black uppercase tracking-wider bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl"
                                    >
                                      {topic.actionLabel} <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() => handleOpenWhatsApp(topic.actionWhatsAppText)}
                                    variant="outline"
                                    className="py-2 px-3 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl flex items-center gap-1.5"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    Ask on WhatsApp
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Direct Telephone & Email Support Bar */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-zinc-900 dark:text-white">Customer Helpline</p>
                      <p className="text-[10px] text-zinc-500 font-medium">+91 79757 71457 • Daily 7 AM - 10 PM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="tel:+917975771457"
                      className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-wider hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Call Now
                    </a>
                    <a
                      href="mailto:support@taazabites.com"
                      className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-wider hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" /> Email
                    </a>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 shrink-0">
                <span className="flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Satisfaction Guarantee
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="font-black text-zinc-600 dark:text-zinc-300 hover:underline uppercase tracking-wider"
                >
                  Close Quick Help
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
