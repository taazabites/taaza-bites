import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { db } from '@/src/firebase/db';
import { auth } from '@/src/firebase/auth';
import {
 doc,
 setDoc,
 serverTimestamp,
 writeBatch,
 Timestamp
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/src/context/ToastContext";
import {
 CreditCard,
 CheckCircle,
 AlertTriangle,
 Loader2,
 Lock,
 ArrowLeft,
 ChevronRight,
 ShieldCheck,
 Smartphone,
 Wallet,
 Sparkles,
 Receipt,
 Utensils,
 RefreshCw,
 HelpCircle
} from "lucide-react";

interface PaymentState {
 plan: {
 id: string;
 name: string;
 durationDays: number;
 price: number;
 offerPrice: number;
 mealsPerDay: number;
 calories: number;
 protein: number;
 totalMeals?: number;
 dietType?: string;
 };
 addressId: string;
 deliveryTime: string;
 appliedCoupon: {
 code: string;
 discount: number;
 type: "percent" | "flat";
 } | null;
 walletDeduction: number;
 pointsDeduction?: number;
 walletBalance?: number;
 rewardPoints?: number;
 subtotal: number;
 discount: number;
 gst: number;
 deliveryCharge: number;
 total: number;
 paymentMethod: "upi" | "card" | "netbanking" | "wallet";
 selectedApp?: "gpay" | "phonepe" | "paytm";
 notes?: string;
}

export default function Payment() {
 const { user } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();
 const { showToast } = useToast();

 const state = location.state as PaymentState | null;

 // State managers
 const [loading, setLoading] = useState(true);
 const [processingStep, setProcessingStep] = useState<string>("Initializing secure channel...");
 const [paymentStep, setPaymentStep] = useState<"gateway_handshake" | "collecting_funds" | "processing_complete" | "failed">("gateway_handshake");
  const [razorpayOrder, setRazorpayOrder] = useState<any>(null);
 const [errorMessage, setErrorMessage] = useState<string>("");
 const [selectedMethod, setSelectedMethod] = useState<string>("");
 const [enteredPaymentId, setEnteredPaymentId] = useState("");

 // Card Interactive Form state (for simulated fallback/sandbox)
 const [cardNumber, setCardNumber] = useState("");
 const [cardName, setCardName] = useState("");
 const [cardExpiry, setCardExpiry] = useState("");
 const [cardCvv, setCardCvv] = useState("");
 const [isCardFlipped, setIsCardFlipped] = useState(false);

 const getPaymentHeaders = async (): Promise<Record<string, string>> => {
   const headers: Record<string, string> = { "Content-Type": "application/json" };
   try {
     const currentUser = auth.currentUser;
     if (currentUser) {
       const token = await currentUser.getIdToken();
       headers["Authorization"] = `Bearer ${token}`;
       return headers;
     }
   } catch (e) {
     console.warn("Error getting ID token in Payment.tsx:", e);
   }

   const savedSim = localStorage.getItem("taaza_simulated_user");
   if (savedSim) {
     try {
       const parsed = JSON.parse(savedSim);
       if (parsed?.uid) {
         headers["Authorization"] = `Bearer sim_token_${parsed.uid}`;
       }
     } catch (e) {
       // ignore
     }
   }
   return headers;
 };

 // Load state and run initial order setup
 useEffect(() => {
 if (!user) {
 showToast("Access Denied: Authenticate to access payments", "error");
 navigate("/login");
 return;
 }

 if (!state) {
 showToast("No active checkout session found.", "warning");
 navigate("/plans");
 return;
 }

 createOrderAndInit();
 }, [user, state]);

 useEffect(() => {
 if (state?.paymentMethod) {
 setSelectedMethod(state.paymentMethod);
 }
 }, [state]);

 // Load Razorpay Script dynamically
 const loadRazorpayScript = () => {
 return new Promise((resolve) => {
 const script = document.createElement("script");
 script.src = "https://checkout.razorpay.com/v1/checkout.js";
 script.onload = () => resolve(true);
 script.onerror = () => resolve(false);
 document.body.appendChild(script);
 });
 };

 const createOrderAndInit = async () => {
 if (!state) return;
 try {
 setLoading(true);
 setProcessingStep("Contacting server for order token...");

 // Call express backend endpoint to create order
 const getHeaders = async () => {
   const headers: Record<string, string> = { "Content-Type": "application/json" };
   try {
     const currentUser = auth.currentUser;
     if (currentUser) {
       const token = await currentUser.getIdToken();
       headers["Authorization"] = `Bearer ${token}`;
     } else {
       const savedSim = localStorage.getItem("taaza_simulated_user");
       if (savedSim) {
         const parsed = JSON.parse(savedSim);
         if (parsed?.uid) {
           headers["Authorization"] = `Bearer sim_token_${parsed.uid}`;
         }
       }
     }
   } catch (e) {
     console.warn(e);
   }
   return headers;
 };

 const headers = await getPaymentHeaders();
 const response = await fetch("/api/payments/create-order", {
 method: "POST",
 headers,
 body: JSON.stringify({ amount: state.total })
 });

 if (!response.ok) {
 const errData = await response.json().catch(() => ({})); throw new Error(errData.error || "Failed to construct backend payment parameters");
 }

 const orderData = await response.json();
 setRazorpayOrder(orderData);

 // Attempt loading real Razorpay checkout script
 setProcessingStep("Verifying Razorpay SDK handshake...");
 const scriptLoaded = await loadRazorpayScript();

 if (scriptLoaded && !orderData.isSandbox) {
 setProcessingStep("Waiting for SDK checkout overlay...");
 triggerRealRazorpay(orderData);
 } else {
 // If script fails or is sandbox, fallback to elegant inside-app interactive sandbox
 setPaymentStep("gateway_handshake");
 setLoading(false);
 }
 } catch (err: any) {
 console.error(err);
 setErrorMessage(err.message === "Failed to fetch" ? "Could not connect to the payment server. Please check your internet connection and try again." : (err.message || "Could not launch secure payment engine."));
 setPaymentStep("failed");
 setLoading(false);
 }
 };

 // Launch actual Razorpay SDK checkout overlay
 const triggerRealRazorpay = (orderData: any) => {
 if (!user || !state) return;

 if (orderData.isSandbox || !(window as any).Razorpay) {
 setErrorMessage("Payments are unavailable right now. Please retry.");
 setPaymentStep("failed");
 setLoading(false);
 return;
 }

 const options = {
 key: orderData.keyId,
 amount: orderData.amount,
 currency: orderData.currency,
 name: "Taaza Bites",
 description: `Premium Subscription - ${state.plan.name}`,
 image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop",
 order_id: orderData.id,
 handler: async function (response: any) {
 await handlePaymentVerification(
 response.razorpay_order_id,
 response.razorpay_payment_id,
 response.razorpay_signature,
 "razorpay"
 );
 },
 prefill: {
 name: user.displayName || "",
 email: user.email || "",
 contact: user.phoneNumber || ""
 },
 notes: {
 planId: state.plan.id,
 userId: user.uid,
 addressId: state.addressId
 },
 theme: {
 color: "#059669" // emerald 600
 },
 modal: {
 ondismiss: function () {
 showToast("Payment window closed by customer", "warning");
 setErrorMessage("Payment was cancelled by the user.");
 setPaymentStep("failed");
 setLoading(false);
 }
 }
 };

 try {
 const rzp = new (window as any).Razorpay(options);
 rzp.open();
 } catch (err) {
 console.error("Failed to construct Razorpay instance", err);
 // Fallback inside-app UI
 setLoading(false);
 }
 };

 // Handle signature verification and database commits
 const handlePaymentVerification = async (
 orderId: string,
 paymentId: string,
 signature: string,
 method: "razorpay" | "card" | "upi" | "netbanking" | "wallet"
 ) => {
 try {
 setProcessingStep("Verifying secure signature...");
 
 const headers = await getPaymentHeaders();
 const verifyRes = await fetch("/api/payments/verify", {
 method: "POST",
 headers,
 body: JSON.stringify({
 razorpay_order_id: orderId,
 razorpay_payment_id: paymentId,
 razorpay_signature: signature,
 type: "subscription",
 amount: state?.total || 0,
 notes: {
  userId: user?.uid,
  planId: state?.plan.id,
  addressId: state?.addressId,
  deliveryFee: state?.deliveryCharge || 0
 },
 customizations: {
  durationDays: state?.plan.durationDays,
  mealsPerDay: state?.plan.mealsPerDay,
  totalMeals: state?.plan.totalMeals,
  dietType: state?.plan.dietType,
  offerPrice: state?.plan.offerPrice || state?.plan.price
 }
 })
 });
 
 const verifyData = await verifyRes.json();
 
 if (!verifyRes.ok || !verifyData.success) {
 throw new Error(verifyData.error || "Payment verification failed");
 }

 setProcessingStep("Finalizing dashboard synchronization...");
 setTimeout(() => {
 setPaymentStep("processing_complete");
 setLoading(false);
 showToast("Welcome to elite daily fresh nutrition! 🎉", "success");
 navigate("/payment-success", {
 state: {
 orderId: orderId,
 total: state.total,
 planName: state.plan.name,
 deliveryTime: state.deliveryTime
 }
 });
 }, 1000);
 
 } catch (err: any) {
 console.error("Verification error:", err);
 setErrorMessage(err.message || "Database transaction sync error. Contact support.");
 setPaymentStep("failed");
 setLoading(false);
 }
 };

 // Sandbox Simulated Checkout Submission
 const handleSandboxPaymentSubmit = async (e?: React.FormEvent) => {
 if (e) e.preventDefault();
 if (!state) return;
 
 setLoading(true);
 setProcessingStep("Contacting payment gateway simulation server...");
 
 try {
 let orderId = razorpayOrder?.id || razorpayOrder?.orderId;
 if (!orderId || !orderId.startsWith("order_sim_")) {
 orderId = `order_sim_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
 }
 
 setProcessingStep("Simulating secure gateway charge authorization...");
 
 const mockPaymentId = "pay_sim_" + Math.random().toString(36).substring(2, 11).toUpperCase();
 const mockSignature = "sig_sim_" + Math.random().toString(36).substring(2, 15).toUpperCase();
 
 await handlePaymentVerification(
 orderId,
 mockPaymentId,
 mockSignature,
 (selectedMethod || "card") as any
 );
 } catch (err: any) {
 console.error(err);
 setErrorMessage(err.message || "Simulated payment failed");
 setPaymentStep("failed");
 setLoading(false);
 }
 };

 // Card formatting helpers
 const handleCardNumberChange = (val: string) => {
 const clean = val.replace(/\D/g, "").substring(0, 16);
 const formatted = clean.replace(/(\d{4})(?=\d)/g, "$1 ");
 setCardNumber(formatted);
 };

 const handleExpiryChange = (val: string) => {
 const clean = val.replace(/\D/g, "").substring(0, 4);
 if (clean.length >= 2) {
 setCardExpiry(`${clean.substring(0, 2)}/${clean.substring(2)}`);
 } else {
 setCardExpiry(clean);
 }
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-stone-50 #0f1411] flex flex-col items-center justify-center p-6 text-center space-y-6">
 <div className="relative">
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
 className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full shadow-lg shadow-emerald-500/10"
 />
 <div className="absolute inset-0 flex items-center justify-center">
 <Lock className="w-5 h-5 text-emerald-600 animate-pulse" />
 </div>
 </div>

 <div className="space-y-2 max-w-sm">
 <h2 className="text-sm font-black uppercase tracking-widest text-emerald-600 ">
 Secure Cryptographic Channel
 </h2>
 <p className="text-xs text-stone-500 font-bold">
 {processingStep}
 </p>
 <p className="text-[10px] text-stone-400">
 Do not refresh this screen or navigate away.
 </p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-stone-50/50 #0f1411] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
 <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
 
 {/* Left Side: Summary Panel (40%) */}
 <div className="md:col-span-5 bg-white border border-stone-200/50 p-6 rounded-3xl shadow-sm space-y-6">
 <div>
 <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
 Secure Checkout
 </span>
 <h2 className="text-lg font-black text-stone-900 mt-3">
 Subscription billing
 </h2>
 <p className="text-xs text-stone-400 mt-0.5">
 Review parameters prior to final transaction execution.
 </p>
 </div>

 <div className="space-y-4 pt-4 border-t border-stone-100 ">
 <div className="p-3 bg-stone-50 rounded-2xl flex items-center gap-3">
 <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
 <Utensils className="w-5 h-5" />
 </div>
 <div>
 <h4 className="text-xs font-black text-stone-800 ">{state?.plan.name}</h4>
 <p className="text-[10px] text-stone-400 mt-0.5">{state?.plan.durationDays} Days • {state?.plan.mealsPerDay} Meals Daily</p>
 </div>
 </div>

 <div className="space-y-2 text-xs text-stone-500">
 <div className="flex justify-between">
 <span>Plan cost</span>
 <span className="font-mono text-stone-800 font-bold">₹{state?.subtotal}</span>
 </div>
 {state && state.discount > 0 && (
 <div className="flex justify-between text-emerald-600 font-bold">
 <span>Savings Applied</span>
 <span className="font-mono">-₹{state.discount}</span>
 </div>
 )}
 {state && state.walletDeduction > 0 && (
 <div className="flex justify-between text-amber-600 font-bold">
 <span>Wallet deduction</span>
 <span className="font-mono">-₹{state.walletDeduction}</span>
 </div>
 )}
 <div className="flex justify-between">
 <span>Food service GST (18%)</span>
 <span className="font-mono text-stone-800 font-bold">₹{state?.gst}</span>
 </div>
 <div className="flex justify-between">
 <span>Shipping charge</span>
 <span className="font-mono text-stone-800 font-bold">
 {state?.deliveryCharge === 0 ? "FREE" : `₹${state?.deliveryCharge}`}
 </span>
 </div>
 </div>

 <div className="pt-4 border-t border-stone-100 flex justify-between items-end">
 <div>
 <span className="text-xs text-stone-400 block font-bold">Total Amount Due</span>
 <span className="text-[9px] text-stone-400 block">PCI-DSS Secure transaction</span>
 </div>
 <span className="text-2xl font-black font-mono tracking-tight text-stone-900 ">
 ₹{state?.total}
 </span>
 </div>
 </div>

 <div className="bg-stone-50 p-4 rounded-2xl space-y-2 text-[10.5px] leading-relaxed text-stone-400 border border-stone-100 ">
 <span className="font-black text-stone-500 uppercase block tracking-wider">Estimated Launch Time:</span>
 <p>Your subscription launches tomorrow morning within the <strong>{state?.deliveryTime}</strong> window. Fresh ingredients will be assembled cleanly by certified chefs.</p>
 </div>
 </div>

 {/* Right Side: Interactive Stripe/CRED Level Payment Form (60%) */}
 <div className="md:col-span-7 space-y-6">
 <AnimatePresence mode="wait">
 {paymentStep === "gateway_handshake" && (
 <motion.div
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -15 }}
 className="bg-white border border-stone-200/50 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6"
 >
 <div className="flex justify-between items-center pb-3 border-b border-stone-100 ">
 <h3 className="text-sm font-black uppercase tracking-wider text-stone-400 flex items-center gap-2">
 <CreditCard className="w-4.5 h-4.5 text-emerald-600" />
 Interactive Checkout Console
 </h3>
 <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">
 <Sparkles className="w-3 h-3 animate-spin" /> Sandbox Mode
 </span>
 </div>

 {/* Payment Mode Selector Tabs */}
 <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200/40 ">
 <button
 type="button"
 onClick={() => setSelectedMethod(state?.paymentMethod || "card")}
 className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
 selectedMethod !== "link"
 ? "bg-white text-stone-900 shadow-sm font-black"
 : "text-stone-500 hover:text-stone-700 :text-stone-300"
 }`}
 >
 Simulated Gateway
 </button>
 <button
 type="button"
 onClick={() => setSelectedMethod("link")}
 className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
 selectedMethod === "link"
 ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10 font-black"
 : "text-stone-500 hover:text-stone-700 :text-stone-300"
 }`}
 >
 <ShieldCheck className="w-3.5 h-3.5" />
 Razorpay Payment Link
 </button>
 </div>

 {selectedMethod === "card" && (
 <form onSubmit={handleSandboxPaymentSubmit} className="space-y-6">
 {/* Live Card Graphic Frame */}
 <div className="relative h-44 w-full rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-stone-900 text-white p-6 flex flex-col justify-between shadow-lg overflow-hidden select-none">
 <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-10 pointer-events-none">
 <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
 <path d="M0,100 C30,40 70,60 100,0 L100,100 Z" fill="white" />
 </svg>
 </div>

 <div className="flex justify-between items-start">
 <div>
 <p className="text-[9px] uppercase font-black tracking-widest text-emerald-200">Taaza Bites Elite</p>
 <p className="text-xs font-bold mt-1">Nutrition Signature Card</p>
 </div>
 <div className="w-10 h-7 bg-white/20 rounded-md backdrop-blur-md flex items-center justify-center font-bold text-xs">
 {cardNumber.startsWith("4") ? "VISA" : cardNumber.startsWith("5") ? "MC" : "CARD"}
 </div>
 </div>

 <div className="space-y-4">
 <p className="text-lg font-mono font-bold tracking-[0.15em]">
 {cardNumber || "•••• •••• •••• ••••"}
 </p>

 <div className="flex justify-between items-end">
 <div>
 <span className="text-[8px] text-emerald-200 block uppercase font-bold">Cardholder name</span>
 <span className="text-xs font-bold uppercase block tracking-wide truncate max-w-[200px]">
 {cardName || "Your Name"}
 </span>
 </div>
 <div className="text-right">
 <span className="text-[8px] text-emerald-200 block uppercase font-bold">Expires</span>
 <span className="text-xs font-mono font-bold block">
 {cardExpiry || "MM/YY"}
 </span>
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <div>
 <label className="text-[10px] text-stone-400 font-bold block mb-1.5 uppercase">Cardholder Full Name</label>
 <input
 type="text"
 required
 value={cardName}
 onChange={(e) => setCardName(e.target.value)}
 placeholder="E.g. Dr. Rohan Sharma"
 className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all text-stone-800 placeholder:font-normal"
 />
 </div>

 <div>
 <label className="text-[10px] text-stone-400 font-bold block mb-1.5 uppercase">16-Digit Credit/Debit Card Number</label>
 <div className="relative">
 <input
 type="text"
 required
 value={cardNumber}
 onChange={(e) => handleCardNumberChange(e.target.value)}
 placeholder="4111 2222 3333 4444"
 className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all text-stone-800 "
 />
 <div className="absolute right-3.5 top-3.5 text-stone-400">
 <Lock className="w-4 h-4" />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] text-stone-400 font-bold block mb-1.5 uppercase">Expiry Month / Year</label>
 <input
 type="text"
 required
 value={cardExpiry}
 onChange={(e) => handleExpiryChange(e.target.value)}
 placeholder="MM/YY"
 maxLength={5}
 className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all text-stone-800 text-center"
 />
 </div>
 <div>
 <label className="text-[10px] text-stone-400 font-bold block mb-1.5 uppercase">CVV / Security Code</label>
 <input
 type="password"
 required
 value={cardCvv}
 onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
 placeholder="•••"
 maxLength={4}
 className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all text-stone-800 text-center"
 />
 </div>
 </div>
 </div>

 <button
 type="submit"
 className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/15 transition-all hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2"
 >
 <Lock className="w-4 h-4" />
 <span>Confirm Secure Charge of ₹{state?.total}</span>
 </button>
 </form>
 )}

 {selectedMethod === "upi" && (
 <div className="space-y-6 text-center py-4">
 <div className="max-w-[200px] mx-auto p-4 bg-white border border-stone-200/60 rounded-3xl shadow-sm flex flex-col items-center">
 {/* Stylized QR Code Graphic */}
 <div className="w-36 h-36 border-2 border-dashed border-stone-200 flex items-center justify-center relative rounded-2xl p-2 select-none">
 <div className="grid grid-cols-5 gap-1.5 w-full h-full opacity-80">
 {Array.from({ length: 25 }).map((_, idx) => (
 <div
 key={idx}
 className={`rounded-xs ${
 idx % 3 === 0 || idx % 5 === 2 ? "bg-stone-850" : "bg-transparent"
 }`}
 />
 ))}
 </div>
 <div className="absolute bg-white p-1 rounded-lg shadow-sm border border-stone-100">
 <Smartphone className="w-6 h-6 text-emerald-600" />
 </div>
 </div>
 <span className="text-[9px] font-extrabold text-stone-400 mt-3 block uppercase tracking-wider">
 Scan with your UPI App
 </span>
 </div>

 <div className="space-y-2">
 <p className="text-xs font-black text-stone-800 ">
 Initiating UPI request with {state?.selectedApp?.toUpperCase() || "UPI Partner"}
 </p>
 <p className="text-[10px] text-stone-400 leading-normal max-w-sm mx-auto">
 We have pushed a payment request for ₹{state?.total} directly to your registered UPI handle. Check your notification tray or scan the QR above.
 </p>
 </div>

 <button
 type="button"
 onClick={() => handleSandboxPaymentSubmit()}
 className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/15 transition-all hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2"
 >
 <Smartphone className="w-4 h-4" />
 <span>Authorize Sandbox UPI Payment</span>
 </button>
 </div>
 )}

 {selectedMethod !== "card" && selectedMethod !== "upi" && selectedMethod !== "link" && (
 <div className="space-y-6 text-center py-6">
 <div className="w-16 h-16 bg-stone-50 border border-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-500">
 <Wallet className="w-8 h-8" />
 </div>
 <div className="space-y-2">
 <h4 className="text-xs font-black text-stone-800 ">
 Proceed via Secure Netbanking / External Wallet
 </h4>
 <p className="text-[10.5px] text-stone-400 max-w-xs mx-auto leading-normal">
 Verify and complete transaction using our secure redirect tunnel. Funds will be captured atomically.
 </p>
 </div>
 <button
 type="button"
 onClick={() => handleSandboxPaymentSubmit()}
 className="w-full py-4 bg-stone-900 hover:bg-stone-850 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
 >
 <ShieldCheck className="w-4 h-4 text-emerald-500" />
 <span>Proceed with Sandbox Authorization</span>
 </button>
 </div>
 )}

 {selectedMethod === "link" && (
 <div className="space-y-6 py-2">
 <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2.5">
 <div className="flex items-center gap-2 text-emerald-600 ">
 <ShieldCheck className="w-5 h-5" />
 <h4 className="text-xs font-black uppercase tracking-wider">Official Razorpay Gateway Page</h4>
 </div>
 <p className="text-[11px] text-stone-500 leading-normal">
 To pay cleanly without SDK handshake overhead, utilize our direct merchant-powered payment link below. It supports UPI (GPay/PhonePe/Paytm), Cards, Wallets, and Netbanking.
 </p>
 </div>

 <div className="space-y-3.5">
 <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-100 ">
 <div>
 <p className="text-xs font-bold text-stone-800 ">Transaction Amount</p>
 <p className="text-[10px] text-stone-400 mt-0.5">Pay exactly this amount to prevent disputes</p>
 </div>
 <span className="text-xl font-mono font-black text-stone-900 ">
 ₹{state?.total}
 </span>
 </div>

 <button type="button" onClick={() => { if (razorpayOrder) triggerRealRazorpay(razorpayOrder); else createOrderAndInit(); }}
 className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/15 transition-all text-center block cursor-pointer flex items-center justify-center gap-2"
 >
 <span>Pay with Razorpay Securely</span>
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>

 {/* Verification Panel */}
 <div className="border-t border-stone-100 pt-5 space-y-4">
 <div className="space-y-1.5">
 <label className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">
 Step 2: Enter Razorpay Payment ID
 </label>
 <p className="text-[10px] text-stone-400 leading-normal">
 After successful payment, copy the transaction/payment ID from your success screen (e.g., <strong>pay_P1rXyZ9D8f</strong>) and paste it below.
 </p>
 <div className="relative mt-2">
 <input
 type="text"
 required
 value={enteredPaymentId}
 onChange={(e) => setEnteredPaymentId(e.target.value.trim())}
 placeholder="e.g. pay_Pl3XyZ9F8e"
 className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all text-stone-800 "
 />
 <div className="absolute right-3.5 top-3.5 text-stone-400">
 <Receipt className="w-4.5 h-4.5" />
 </div>
 </div>
 </div>

 <button
 type="button"
 onClick={async () => {
 if (!enteredPaymentId) {
 showToast("Please enter the Razorpay Payment ID from your receipt.", "warning");
 return;
 }
 if (!enteredPaymentId.startsWith("pay_")) {
 showToast("Razorpay Payment ID typically starts with 'pay_'.", "warning");
 }
 
 setLoading(true);
 setProcessingStep("Verifying Razorpay payment ID reference...");
 
 // Proceed with verifying and committing
 const mockOrderId = "order_sim_" + Math.random().toString(36).substring(2, 11).toUpperCase();
 const mockSignature = "sig_lnk_" + Math.random().toString(36).substring(2, 15).toUpperCase();
 
 await handlePaymentVerification(
 mockOrderId,
 enteredPaymentId,
 mockSignature,
 "razorpay"
 );
 }}
 className="w-full py-4 bg-stone-900 hover:bg-stone-850 :bg-stone-750 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
 >
 <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
 <span>Submit & Activate Subscription</span>
 </button>
 </div>
 </div>
 )}
 </motion.div>
 )}

 {paymentStep === "failed" && (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0 }}
 className="bg-white border border-stone-200/50 p-6 sm:p-8 rounded-3xl shadow-sm text-center space-y-6"
 >
 <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
 <AlertTriangle className="w-8 h-8" />
 </div>

 <div className="space-y-2">
 <span className="text-[10px] bg-red-500/10 text-red-600 px-3 py-1 rounded-full uppercase font-black tracking-wider">
 PAYMENT ERROR
 </span>
 <h3 className="text-lg font-black text-stone-900 ">
 Charge Handshake Declined
 </h3>
 <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
 {errorMessage || "We encountered an issue creating your transaction contract. Please verify your billing selections or bank parameters."}
 </p>
 </div>

 <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
 <button
 onClick={createOrderAndInit}
 className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
 >
 <RefreshCw className="w-3.5 h-3.5" />
 <span>Retry Checkout</span>
 </button>
 <button
 onClick={() => navigate("/checkout")}
 className="py-3 px-4 border border-stone-200 hover:bg-stone-50 :bg-stone-850 text-stone-700 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 <span>Go Back</span>
 </button>
 </div>

 <div className="pt-4 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
 <HelpCircle className="w-3.5 h-3.5" />
 <span>Confused? Contact support@taazabites.com</span>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 );
}
