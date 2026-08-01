import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Calendar, Package, ArrowRight, Download, Clock, Phone } from "lucide-react";
import { Button } from "@/src/components/ui/primitives";
import { Analytics } from "../utils/analytics";
import { useAuth } from "@/src/context/AuthContext";
import { LottieLoader } from "@/src/components/common/LottieLoader";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderNumber, planName, amount } = location.state || {};
  const { currentUser } = useAuth();

  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (!location.state) {
      navigate("/");
    } else {
      const ordNum = orderNumber || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const pName = planName || "Baseline";
      const amt = Number(amount) || 2999;

      // Track conversion events across GA4, GTM, Meta Pixel and Firestore
      Analytics.trackPaymentSuccess(currentUser?.uid || "", ordNum, amt, "plan_id", pName);
      Analytics.trackSubscriptionActivated(currentUser?.uid || "", ordNum, pName, amt);

      // Trigger payment success communication (Email + WhatsApp)
      fetch("/api/communication/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.uid || "", // Will resolve on backend
          type: "payment_success",
          title: "Payment Confirmed! 🥗",
          message: `Your payment of ₹${amt} was successful for the ${pName} plan. Your order number is ${ordNum}. Your subscription is now active and deliveries begin tomorrow morning!`,
          channel: ["app", "email", "whatsapp", "push"]
        })
      }).catch(err => console.error("Payment communication failed:", err));
    }
  }, [location, navigate, orderNumber, planName, amount]);

  const nextDeliveryDate = new Date();
  nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 1);
  const formattedDate = nextDeliveryDate.toLocaleDateString('en-IN', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
      >
        <div className="bg-zinc-900 rounded-[3rem] p-8 sm:p-12 border border-zinc-800 shadow-2xl shadow-black">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="flex items-start mb-6 -ml-4"
          >
            <LottieLoader type="success" size="lg" loop={false} />
          </motion.div>

          <div className="mb-10">
            <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">
              Authorization Successful
            </div>
            <h1 className="text-4xl font-black text-white tracking-tightest leading-tight mb-3">
              Subscription <span className="text-emerald-500">Confirmed.</span>
            </h1>
            <p className="text-zinc-500 font-medium text-sm">Welcome to the future of metabolic health. Your first delivery is scheduled.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-10">
            {/* Start Date (First Delivery) */}
            <div className="p-5 bg-zinc-950/50 border border-zinc-800 rounded-3xl flex items-center gap-5 group hover:border-emerald-500/30 transition-all">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Initialization Date</p>
                <p className="text-sm font-black text-white uppercase tracking-tight">{formattedDate}</p>
              </div>
            </div>

            {/* Delivery Schedule */}
            <div className="p-5 bg-zinc-950/50 border border-zinc-800 rounded-3xl flex items-center gap-5 group hover:border-blue-500/30 transition-all">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Delivery Slot</p>
                <p className="text-sm font-black text-white uppercase tracking-tight">Daily Morning • 07:00 - 09:00 AM</p>
              </div>
            </div>

            {/* Support */}
            <div className="p-5 bg-zinc-950/50 border border-zinc-800 rounded-3xl flex items-center gap-5 group hover:border-indigo-500/30 transition-all">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Customer Support</p>
                <p className="text-sm font-black text-white uppercase tracking-tight">VIP Health Hotline Active</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => navigate("/welcome-journey")}
              className="w-full py-8 rounded-[2rem] bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 transition-all active:scale-[0.98]"
            >
              Begin Welcome Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <button 
              onClick={() => setShowInvoice(!showInvoice)}
              className="flex items-center justify-center gap-2 w-full py-4 text-[10px] font-black text-zinc-600 hover:text-zinc-400 uppercase tracking-widest transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              {showInvoice ? "Hide Invoice" : "View Invoice"}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showInvoice ? (
            <motion.div 
              key="invoice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-[3rem] p-10 text-zinc-950 shadow-2xl shadow-black/50 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <Package className="w-12 h-12 text-zinc-100" />
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black tracking-tightest uppercase italic">TaazaBites</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Healthy Meal Delivery</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Invoice Number</p>
                    <p className="text-sm font-black uppercase">{orderNumber?.replace('ORD-', 'INV-') || "INV-859201"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-100">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Customer</p>
                    <p className="text-sm font-black">{currentUser?.displayName || "Metabolic Client"}</p>
                    <p className="text-xs font-medium text-zinc-500 mt-1">{currentUser?.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Billing Date</p>
                    <p className="text-sm font-black">{new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-zinc-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order Summary</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-black">{planName || "30-Day Subscription"}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Standard Subscription Layer</p>
                      </div>
                      <p className="text-sm font-black">₹{amount || "2,999"}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-zinc-400">Logistics & Delivery</p>
                      <p className="text-xs font-bold">₹0 (Included)</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-zinc-400">GST (5%)</p>
                      <p className="text-xs font-bold">Included</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t-2 border-zinc-950 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Paid</p>
                    <p className="text-3xl font-black tracking-tightest">₹{amount || "2,999"}</p>
                  </div>
                  <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center text-white rotate-12">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                </div>

                <div className="pt-6">
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic">
                    Note: This is a system-generated invoice and does not require a physical signature.
                  </p>
                </div>

                <Button className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border-0 font-black text-[10px] uppercase tracking-widest h-14 rounded-2xl">
                   Download PDF Document
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
               <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8">
                  <h3 className="text-xl font-black text-white mb-6 tracking-tight">Your Subscription Summary</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                          <Package className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Plan</p>
                          <p className="text-sm font-bold text-zinc-200">{planName || "30 Day Transformation"}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                          <CheckCircle2 className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</p>
                          <p className="text-sm font-bold text-emerald-500">Verified & Active</p>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-900/20">
                  <h3 className="text-xl font-black mb-4 tracking-tight">Next Steps</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                       <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black mt-0.5 shrink-0">1</div>
                       <p className="text-sm font-bold text-white/90">Our nutritionists will review your bio-metrics within the next 2 hours.</p>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black mt-0.5 shrink-0">2</div>
                       <p className="text-sm font-bold text-white/90">Your customized daily menu will be visible on your dashboard tonight.</p>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black mt-0.5 shrink-0">3</div>
                       <p className="text-sm font-bold text-white/90">First meal delivery will arrive tomorrow in your selected precision slot.</p>
                    </li>
                  </ul>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
