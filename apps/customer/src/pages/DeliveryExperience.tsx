import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, MapPin, Phone, MessageSquare, 
  Clock, ShieldCheck, CheckCircle2, Navigation,
  History, Camera, Info, Star, ArrowRight,
  Package, Truck, User, ExternalLink, Sparkles,
  RefreshCcw, AlertTriangle, Map as MapIcon
} from "lucide-react";
import { Button, Card } from "../components/ui/primitives";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PageHeader } from "../components/dashboard/PageHeader";
import { PageTransition } from "../components/dashboard/PageTransition";
import { DeliveryService } from "../firebase/services";
import { useAuth } from "../context/AuthContext";
import { Delivery } from "../firebase/collections";
import { useToast } from "../context/ToastContext";
import { cn } from "../lib/utils";

export default function DeliveryExperience() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState<"tracking" | "history">("tracking");
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!userData?.uid) return;
    
    // Real-time delivery updates
    const unsubscribe = DeliveryService.subscribeToDeliveries((deliveries) => {
      setActiveDeliveries(deliveries);
    }, userData.uid);
    return () => unsubscribe();
  }, [userData?.uid]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    triggerHaptic('medium');
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Tracking status updated", "success");
    }, 800);
  };

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.navigator.vibrate) {
      const patterns = { light: 10, medium: 30, heavy: 60 };
      window.navigator.vibrate(patterns[style]);
    }
  };

  const statusOf = (d: Delivery) => String(d.deliveryStatus || "").toLowerCase();
  const currentDelivery = activeDeliveries.find(d => !statusOf(d).includes("deliver")) || null;
  const completedDeliveries = activeDeliveries.filter(d => statusOf(d).includes("deliver"));
  const userAddress = (userData as any)?.address || (userData as any)?.deliveryAddress || "Primary Delivery Address";

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="max-w-6xl mx-auto pb-24 space-y-8">
          
          <PageHeader 
            title="Delivery Tracking"
            description="Premium logistics for your daily fresh meals."
            badge={currentDelivery ? "Live Update" : "Delivery"}
            icon={Truck}
            gradient="from-emerald-950 via-zinc-900 to-emerald-950"
          >
            <div className="flex gap-4">
              <button 
                onClick={handleRefresh}
                className={cn(
                  "w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center transition-all bg-white/5 backdrop-blur-md text-white hover:bg-white/10",
                  isRefreshing && "animate-spin"
                )}
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
              <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                <button 
                  onClick={() => setActiveView("tracking")}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === "tracking" ? "bg-emerald-500 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
                >
                  Tracking
                </button>
                <button 
                  onClick={() => setActiveView("history")}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === "history" ? "bg-emerald-500 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
                >
                  History
                </button>
              </div>
            </div>
          </PageHeader>

          <AnimatePresence mode="wait">
            {activeView === "tracking" ? (
              <motion.div 
                key="tracking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Left Column: Map & Status */}
                <div className="lg:col-span-8 space-y-6">
                   {/* Live Map Placeholder */}
                   <Card className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 rounded-[3rem] overflow-hidden relative group shadow-2xl">
                      {/* Real-looking Map texture */}
                      <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/77.0263,28.4595,13,0/1200x800?access_token=mock')] bg-cover opacity-60 dark:opacity-40" />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none" />
                      
                      {/* Status Indicator */}
                      <div className="absolute top-8 left-8 flex items-center gap-3 bg-zinc-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">
                            {currentDelivery?.deliveryStatus || "Out for Delivery"}
                         </span>
                      </div>

                      {/* Animated Route Line Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="relative w-full max-w-lg h-40">
                            <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" viewBox="0 0 400 100">
                               <defs>
                                 <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                   <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                   <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                                   <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                                 </linearGradient>
                               </defs>
                               <motion.path 
                                 d="M 40 60 Q 200 10 360 60" 
                                 fill="none" 
                                 stroke="url(#routeGradient)" 
                                 strokeWidth="4" 
                                 strokeLinecap="round"
                                 initial={{ pathLength: 0 }}
                                 animate={{ pathLength: 1 }}
                                 transition={{ duration: 2, ease: "easeInOut" }}
                               />
                               <circle cx="40" cy="60" r="5" fill="#10b981" />
                               <circle cx="360" cy="60" r="5" fill="#f43f5e" />
                            </svg>
                            
                            <motion.div 
                               initial={{ left: "10%" }}
                               animate={{ left: "75%" }}
                               transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                               className="absolute top-1/2 -translate-y-1/2"
                            >
                               <div className="relative">
                                 <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-40 animate-pulse" />
                                 <div className="bg-emerald-500 p-3 rounded-2xl shadow-2xl shadow-emerald-500/40 text-white relative border-2 border-white/20">
                                    <Truck className="w-6 h-6" />
                                 </div>
                               </div>
                            </motion.div>

                            {/* Destination Marker */}
                            <div className="absolute right-[10%] top-[60%]">
                               <div className="flex flex-col items-center">
                                  <div className="bg-rose-500 p-2 rounded-lg shadow-lg text-white mb-1">
                                     <MapPin className="w-4 h-4" />
                                  </div>
                                  <div className="w-1 h-1 bg-rose-500 rounded-full" />
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="absolute bottom-8 left-8 right-8 p-8 bg-zinc-950/80 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 flex items-center justify-between shadow-2xl z-20">
                         <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                               <Navigation className="w-7 h-7 animate-pulse" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Live Update</p>
                               <p className="text-base font-black text-white">Heading to your location</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-3xl font-black text-emerald-400 tracking-tightest">
                               {currentDelivery?.eta || (currentDelivery ? "Estimated 30-45m" : "No Active Delivery")}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Estimated Arrival</p>
                         </div>
                      </div>
                   </Card>

                   {/* Delivery Info */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] flex flex-col justify-between shadow-sm">
                         <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Destination</h4>
                            <div className="flex gap-5">
                               <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                                  <MapPin className="w-6 h-6" />
                               </div>
                               <p className="text-base font-bold text-zinc-900 dark:text-white leading-relaxed">
                                  {userAddress}
                               </p>
                            </div>
                         </div>
                         <Button onClick={() => navigate("/dashboard/addresses")} variant="ghost" className="mt-8 text-[10px] font-black uppercase tracking-widest text-emerald-600 self-start p-0 h-auto hover:bg-transparent">
                            Update Address <ArrowRight className="w-3.5 h-3.5 ml-2" />
                         </Button>
                      </Card>

                      <Card className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] shadow-sm">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">Delivery Protocol</h4>
                         <div className="space-y-5">
                            {[
                              { label: "Cold-Chain Certified", icon: <ShieldCheck className="w-5 h-5" /> },
                              { label: "Contactless Drop-off", icon: <CheckCircle2 className="w-5 h-5" /> },
                              { label: "Security Verification", icon: <ShieldCheck className="w-5 h-5" /> }
                            ].map(p => (
                              <div key={p.label} className="flex items-center gap-4 text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">
                                 <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                    {p.icon}
                                 </div>
                                 {p.label}
                              </div>
                            ))}
                         </div>
                      </Card>
                   </div>
                </div>

                {/* Right Column: Driver Details & Timeline */}
                <div className="lg:col-span-4 space-y-8">
                   {/* Driver Card */}
                   <Card className="p-10 bg-zinc-950 rounded-[3rem] border border-white/5 text-white relative overflow-hidden group shadow-2xl">
                      <div className="absolute top-0 right-0 p-10 opacity-5">
                         <User className="w-40 h-40" />
                      </div>
                      
                      <div className="flex flex-col items-center text-center gap-4 mb-10 relative z-10">
                         <div className="relative">
                            <div className="w-28 h-28 rounded-[2.5rem] bg-zinc-800 flex items-center justify-center shadow-2xl border-2 border-white/10 text-white font-black text-3xl">
                              {(currentDelivery?.partnerName || "TB")[0]}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-2xl shadow-xl border-4 border-zinc-950">
                               <CheckCircle2 className="w-5 h-5" />
                            </div>
                         </div>
                         <div>
                            <div className="flex items-center justify-center gap-3 mb-1">
                               <h4 className="text-2xl font-black">{currentDelivery?.partnerName || "Assigned Courier"}</h4>
                               <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl text-[10px] font-black">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  4.9
                               </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Logistics Excellence Partner</p>
                         </div>
                      </div>

                      <div className="space-y-4 mb-8 relative z-10">
                         <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Active Vehicle</p>
                            <p className="text-sm font-bold text-zinc-300">{currentDelivery ? "Temperature-Controlled EV Pod" : "Cold-Chain EV Transport"}</p>
                         </div>
                         <div className="flex gap-4">
                            <Button 
                              onClick={() => showToast((currentDelivery as any)?.partnerPhone ? `Calling ${(currentDelivery as any).partnerPhone}...` : "Partner will contact you upon arrival", "info")} 
                              className="flex-1 bg-white text-zinc-950 hover:bg-zinc-200 rounded-2xl h-14 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
                            >
                               <Phone className="w-4.5 h-4.5" /> Call
                            </Button>
                            <Button 
                              onClick={() => showToast("Opening chat support...", "info")} 
                              className="flex-1 bg-zinc-800 text-white hover:bg-zinc-700 rounded-2xl h-14 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
                            >
                               <MessageSquare className="w-4.5 h-4.5" /> Chat
                            </Button>
                         </div>
                      </div>
                   </Card>

                   {/* Vertical Timeline */}
                   <Card className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] shadow-sm">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-10">Journey Progress</h4>
                      <div className="space-y-12 relative pl-10 border-l-2 border-zinc-100 dark:border-zinc-800 ml-2">
                          {[
                            { label: "Kitchen Dispatched", time: currentDelivery?.createdAt ? new Date((currentDelivery.createdAt as any).seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : "Pending", status: currentDelivery ? "completed" : "pending" },
                            { label: "Partner Assigned", time: currentDelivery?.partnerName ? "Ready" : "Pending", status: currentDelivery?.partnerName ? "completed" : "pending" },
                            { label: "Out for Delivery", time: currentDelivery?.deliveryStatus === "OutForDelivery" ? "Active" : "Est. Arrival", status: currentDelivery?.deliveryStatus === "OutForDelivery" ? "current" : currentDelivery?.deliveryStatus === "Delivered" ? "completed" : "pending" },
                            { label: "Delivered", time: currentDelivery?.deliveryStatus === "Delivered" ? "Success" : currentDelivery?.eta || "Pending", status: currentDelivery?.deliveryStatus === "Delivered" ? "completed" : "pending" }
                          ].map((step, idx) => (
                            <div key={idx} className="relative">
                              <div className={`absolute -left-[49px] w-8 h-8 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-sm ${step.status === 'completed' ? 'bg-emerald-500' : step.status === 'current' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                                 {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                              </div>
                              <div className="flex justify-between items-baseline">
                                 <p className={`text-sm font-black ${step.status === 'pending' ? 'text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>{step.label}</p>
                                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{step.time}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </Card>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {completedDeliveries.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {completedDeliveries.map((item, idx) => (
                       <Card key={item.id || idx} className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] group shadow-sm hover:shadow-xl transition-all">
                          <div className="flex justify-between items-start mb-8">
                             <div>
                                <h4 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tightest">{(item as any).date || "Delivered"}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-2">{item.deliveryStatus} • {(item as any).timeSlot || "Scheduled Slot"}</p>
                             </div>
                             <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400">
                                <Package className="w-7 h-7" />
                             </div>
                          </div>

                          <div className="flex gap-3 mt-6">
                             <Button onClick={() => navigate("/dashboard/support")} variant="ghost" className="flex-1 text-[10px] font-black uppercase tracking-widest h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                                Support
                             </Button>
                             <Button onClick={() => navigate("/dashboard/feedback")} variant="ghost" className="flex-1 text-[10px] font-black uppercase tracking-widest h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                                Feedback
                             </Button>
                          </div>
                       </Card>
                     ))}
                  </div>
                ) : (
                  <Card className="p-16 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center gap-6 bg-zinc-50/50 dark:bg-zinc-900/50">
                     <div className="w-20 h-20 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                       <History className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                     </div>
                     <div>
                        <p className="text-xl font-black text-zinc-900 dark:text-white">No Past Deliveries Recorded</p>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-2">When your active meal subscriptions complete, logs will appear here.</p>
                     </div>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}

