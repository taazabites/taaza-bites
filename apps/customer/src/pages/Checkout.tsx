import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { 
  AddressService, 
  WalletService, 
  RewardService,
  RazorpayService,
  PaymentService,
  ServiceAreaService
} from "../firebase/services";
import { 
  Address, 
  Coupon, 
  Wallet, 
  RewardPoints,
  ServiceArea
} from "../firebase/collections";
import { doc, setDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../firebase/db";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/src/context/ToastContext";
import { 
  MapPin, 
  Clock, 
  CheckCircle2,
  ShieldCheck, 
  Loader2, 
  Plus,
  ArrowRight,
  ArrowLeft,
  Home,
  Briefcase,
  Wallet as WalletIcon,
  Gift,
  ChevronDown,
  Info,
  AlertCircle,
  HelpCircle,
  Lock,
  Truck,
  Heart,
  Undo2
} from "lucide-react";
import { Button, Card } from "@/src/components/ui/primitives";
import { CouponModule } from "../components/CouponModule";
import { TaskProgressBarModal } from "../components/common/LoadingSystem";
import { cn } from "../lib/utils";

interface SelectedPlan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  offerPrice: number;
  savings: number;
  mealsPerDay: number;
  totalMeals: number;
  calories: number;
  protein: number;
  deliveryTiming: string;
  dietType?: string;
  fitnessGoal?: string;
}


export default function CheckoutPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [paymentStepLabel, setPaymentStepLabel] = useState("Securing Payment Session...");
  const [paymentSteps, setPaymentSteps] = useState([
    { label: "Tokenizing Credentials", completed: false, active: true },
    { label: "Authorizing Gateway", completed: false, active: false },
    { label: "Configuring Meal Rotation", completed: false, active: false },
    { label: "Finalizing Subscription", completed: false, active: false },
  ]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [reward, setReward] = useState<RewardPoints | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedAddressArea, setSelectedAddressArea] = useState<ServiceArea | null>(null);
  const [isAddressValid, setIsAddressValid] = useState<boolean>(true);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  
  const [useWallet, setUseWallet] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  
  const [showSummary, setShowSummary] = useState(false);
  
  // States for Payment Method & GST Invoice
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "wallet">("upi");
  const [wantGstInvoice, setWantGstInvoice] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyGst, setCompanyGst] = useState("");
  
  // RECOVER plan from state or localStorage
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const durations = { light: 15, medium: 30, heavy: 50 };
      navigator.vibrate(durations[type]);
    }
  };

  useEffect(() => {
    const statePlan = location.state?.selectedPlan;
    if (statePlan) {
      setSelectedPlan(statePlan as SelectedPlan);
    } else {
      const savedPlan = localStorage.getItem('taaza_selected_plan');
      if (savedPlan) {
        try {
          setSelectedPlan(JSON.parse(savedPlan));
        } catch (e) {
          console.error("Failed to parse saved plan", e);
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: location.pathname } } });
      return;
    }
    if (!selectedPlan) {
      const savedPlan = localStorage.getItem('taaza_selected_plan');
      if (!savedPlan && !location.state?.selectedPlan) {
        navigate("/plans");
      }
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [addrList, walletData, rewardData] = await Promise.all([
          AddressService.getAddresses(currentUser.uid),
          WalletService.getWallet(currentUser.uid),
          RewardService.getRewardPoints(currentUser.uid)
        ]);
        
        setAddresses(addrList);
        setWallet(walletData);
        setReward(rewardData);
        
        const defaultAddr = addrList.find(a => a.default) || addrList[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      } catch (err) {
        console.error("Error initializing checkout data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Load Razorpay Script
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById("razorpay-sdk");
      if (existingScript) document.body.removeChild(existingScript);
    };
  }, [currentUser, selectedPlan, navigate]);

  useEffect(() => {
    if (!selectedAddressId || addresses.length === 0) return;
    
    const validateSelectedAddress = async () => {
      const addr = addresses.find(a => a.id === selectedAddressId);
      if (!addr) return;

      const area = await ServiceAreaService.getServiceAreaByPincode(addr.pincode);
      setSelectedAddressArea(area);
      setIsAddressValid(!!area);
    };

    validateSelectedAddress();
  }, [selectedAddressId, addresses]);

  const deliveryFee = selectedAddressArea?.deliveryFee || location.state?.deliveryFee || 0;
  const basePrice = selectedPlan?.offerPrice || selectedPlan?.price || 0;
  
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percentage") {
      return Math.round((basePrice * appliedCoupon.discountValue) / 100);
    }
    return appliedCoupon.discountValue;
  }, [appliedCoupon, basePrice]);

  const subtotal = basePrice - discountAmount + deliveryFee;
  const taxes = Math.round(subtotal * 0.05);
  const intermediateTotal = subtotal + taxes;

  const pointsValue = useMemo(() => {
    if (!reward || !usePoints) return 0;
    // Assume 10 points = ₹1
    return Math.min(Math.floor(reward.currentPoints / 10), intermediateTotal);
  }, [reward, usePoints, intermediateTotal]);

  const walletValue = useMemo(() => {
    if (!wallet || !useWallet) return 0;
    return Math.min(wallet.balance, intermediateTotal - pointsValue);
  }, [wallet, useWallet, intermediateTotal, pointsValue]);

  const total = Math.max(0, intermediateTotal - pointsValue - walletValue);

  const initiatePayment = async () => {
    if (!currentUser || !selectedAddressId) {
      showToast("Please select a delivery address.", "error");
      return;
    }

    if (!isAddressValid) {
      showToast("The selected delivery address is outside our service area.", "error");
      return;
    }
    
    setIsProcessing(true);
    setShowSummary(false);
    setPaymentProgress(15);
    setPaymentStepLabel("Tokenizing Security Credentials...");
    setPaymentSteps([
      { label: "Tokenizing Credentials", completed: true, active: false },
      { label: "Authorizing Gateway", completed: false, active: true },
      { label: "Configuring Meal Rotation", completed: false, active: false },
      { label: "Finalizing Subscription", completed: false, active: false },
    ]);

    try {
      // Load Razorpay Script dynamically if not already loaded
      if (!(window as any).Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      }

      setPaymentProgress(45);
      setPaymentStepLabel("Authorizing Payment Gateway...");

      // 1. Special case for zero payment: directly activate via secure server-side wallet/points deductions
      if (total === 0) {
        setPaymentProgress(80);
        setPaymentStepLabel("Activating Zero-Balance Plan...");
        const res = await RazorpayService.activateZeroOrder({
          userId: currentUser.uid,
          planId: selectedPlan.id,
          addressId: selectedAddressId,
          walletDeduction: useWallet ? walletValue : 0,
          pointsDeduction: usePoints ? (pointsValue * 10) : 0,
          couponCode: appliedCoupon?.code,
          deliveryFee,
          customizations: selectedPlan
        });
        
        if (res.success) {
          setPaymentProgress(100);
          showToast("Subscription Activated Successfully!", "success");
          navigate("/payment-success", { state: { orderNumber: res.orderNumber, planName: selectedPlan.name, amount: 0 } });
        }
        return;
      }

      // 2. Create Razorpay Order via Backend
      const orderData = await RazorpayService.createOrder(
        selectedPlan.id,
        selectedPlan, // customizations
        appliedCoupon?.code,
        deliveryFee,
        currentUser.uid,
        selectedAddressId
      );

      // Handle Sandbox Simulation fallback
      if (orderData.isSandbox) {
        showToast("Processing simulated sandbox transaction...", "info");
        const mockPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        const verifyRes = await RazorpayService.verifyPayment({
          razorpay_order_id: orderData.id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: "sandbox_sig_approved",
          couponCode: appliedCoupon?.code,
          amount: total,
          useWallet,
          usePoints,
          notes: {
            userId: currentUser.uid,
            planId: selectedPlan.id,
            addressId: selectedAddressId,
            deliveryFee
          },
          customizations: selectedPlan
        });

        if (verifyRes.success) {
          showToast("Sandbox Payment Successful!", "success");
          


          navigate("/payment-success", { 
            state: { 
              orderNumber: verifyRes.orderNumber || "ORD-" + mockPaymentId.slice(-6),
              planName: selectedPlan.name,
              amount: total
            } 
          });
        } else {
          throw new Error(verifyRes.error || "Sandbox verification failed");
        }
        return;
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mock_key",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Taaza Bites",
        description: `Premium Subscription - ${selectedPlan.name}`,
        image: "/logo.png",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            setIsProcessing(true);
            // 4. Verify Payment on Server
            const verifyRes = await RazorpayService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              couponCode: appliedCoupon?.code,
              amount: total,
              useWallet,
              usePoints,
              notes: {
                userId: currentUser.uid,
                planId: selectedPlan.id,
                addressId: selectedAddressId,
                deliveryFee
              },
              customizations: selectedPlan
            });

            if (verifyRes.success) {
              showToast("Payment Successful!", "success");
              navigate("/payment-success", { 
                 state: { 
                   orderNumber: verifyRes.orderNumber || "ORD-" + mockPaymentId.slice(-6),
                   planName: selectedPlan.name,
                   amount: total
                 } 
               });
            } else {
              throw new Error(verifyRes.error || "Verification failed");
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            showToast(err.message || "Failed to verify payment. Please contact support.", "error");
            navigate("/payment-failed", { state: { error: err.message, fromState: location.state } });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: currentUser.displayName || "",
          email: currentUser.email || "",
          contact: currentUser.phoneNumber || ""
        },
        theme: {
          color: "#10b981"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            showToast("Payment cancelled by user.", "info");
          }
        }
      };

      if (!(window as any).Razorpay) {
        console.warn("Razorpay SDK not loaded. Proceeding with sandbox fallback.");
        const mockPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        const verifyRes = await RazorpayService.verifyPayment({
          razorpay_order_id: orderData.id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: "sandbox_sig_approved",
          couponCode: appliedCoupon?.code,
          amount: total,
          useWallet,
          usePoints,
          notes: {
            userId: currentUser.uid,
            planId: selectedPlan.id,
            addressId: selectedAddressId,
            deliveryFee
          },
          customizations: selectedPlan
        });

        if (verifyRes.success) {
          showToast("Sandbox Payment Successful!", "success");
          navigate("/payment-success", { 
            state: { 
              orderNumber: verifyRes.orderNumber || "ORD-" + mockPaymentId.slice(-6),
              planName: selectedPlan.name,
              amount: total
            } 
          });
        } else {
          showToast(verifyRes.error || "Sandbox verification failed", "error");
          navigate("/payment-failed", { state: { error: verifyRes.error, fromState: location.state } });
        }
        setIsProcessing(false);
        return;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      showToast(error.message || "Failed to initiate payment. Please try again.", "error");
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!currentUser || !selectedAddressId) {
      showToast("Please select a delivery address.", "error");
      return;
    }
    if (!isAddressValid) {
      showToast("Selected area is not serviceable.", "error");
      return;
    }
    if (wantGstInvoice) {
      if (!companyName.trim()) {
        showToast("Please enter Company Name for GST Invoice.", "error");
        return;
      }
      if (companyGst.trim().length !== 15) {
        showToast("Please enter a valid 15-digit GSTIN.", "error");
        return;
      }
    }
    setShowSummary(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 pt-12">
        {/* Checkout Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-zinc-900 text-white p-8 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group mb-12">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-40 -mt-40 group-hover:bg-emerald-500/20 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 group-hover:bg-blue-500/20 transition-all duration-700" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black uppercase tracking-[0.2em]">Transaction Secure</div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Secure Checkout</span>
                </div>
                <h1 className="text-4xl font-black tracking-tightest">
                  Secure <span className="text-emerald-500">Checkout</span>
                </h1>
              </div>
            </div>
            <p className="text-zinc-400 font-medium max-w-lg leading-relaxed text-sm">
              Confirm your meal options, delivery details, and complete your payment to activate your daily healthy meal subscription.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={() => navigate(-1)} 
              className="px-6 py-3 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
               Return to Plans
            </button>
          </div>
        </header>

        {!currentUser && (
          <section className="mb-12">
            <Card className="p-8 border-2 border-emerald-500/20 bg-emerald-500/5 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                <h2 className="text-xl font-black text-zinc-900">Sign in for a faster checkout</h2>
                <p className="text-sm text-zinc-500 font-medium">Earn reward points and track your delivery in real-time.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate('/login', { state: { from: location } })}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                >
                  Sign In with OTP
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => showToast("Guest checkout is enabled. Please provide your delivery details below.", "info")}
                  className="border-zinc-200 text-zinc-600 px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                >
                  Continue as Guest
                </Button>
              </div>
            </Card>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-emerald-500" />
                  Delivery Address
                </h2>
                {addresses.length > 0 && (
                  <Button 
                    onClick={() => navigate("/subscribe/address", { state: { selectedPlan } })} 
                    variant="outline" 
                    size="sm"
                    className="rounded-xl border border-zinc-200 text-xs font-black uppercase tracking-wider hover:bg-zinc-50 hover:border-zinc-300"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add New Address
                  </Button>
                )}
              </div>
              {addresses.length === 0 ? (
                <Card className="p-8 border-dashed border-2 border-zinc-200 flex flex-col items-center text-center rounded-[32px]">
                  <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-zinc-400" />
                  </div>
                  <p className="text-zinc-500 font-medium mb-4">No addresses found in your profile.</p>
                  <Button onClick={() => navigate("/subscribe/address", { state: { selectedPlan } })} className="rounded-xl">Add New Address</Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map(address => (
                    <div 
                      key={address.id} 
                      onClick={() => setSelectedAddressId(address.id)}
                      className={cn(
                        "p-6 rounded-3xl border-2 transition-all cursor-pointer",
                        selectedAddressId === address.id 
                        ? "border-emerald-500 bg-emerald-50/30 shadow-lg shadow-emerald-500/5" 
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {address.addressType === 'Home' && <Home className="h-4 w-4 text-emerald-500" />}
                          {address.addressType === 'Work' && <Briefcase className="h-4 w-4 text-blue-500" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">{address.addressType}</span>
                        </div>
                        {selectedAddressId === address.id && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                      </div>
                      <p className="text-sm font-bold text-zinc-900 leading-relaxed">{address.houseNumber} {address.street}</p>
                      <p className="text-xs text-zinc-500 mt-1">{address.area}, {address.city}</p>
                      {!addresses.find(a => a.id === address.id)?.verified && (
                        <p className="text-[10px] font-bold text-rose-500 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Unverified Zone
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Loyalty Redemption Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                <Gift className="h-6 w-6 text-emerald-500" />
                Loyalty Perks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button 
                  disabled={!wallet || wallet.balance === 0}
                  onClick={() => setUseWallet(!useWallet)}
                  className={cn(
                    "p-6 rounded-[32px] border-2 text-left transition-all relative overflow-hidden group",
                    useWallet 
                    ? "border-emerald-500 bg-emerald-50/30" 
                    : "border-zinc-100 bg-white hover:border-zinc-200 disabled:opacity-50"
                  )}
                 >
                    <div className="relative z-10 flex items-center gap-4">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                         useWallet ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-400"
                       )}>
                          <WalletIcon className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Use Wallet Balance</p>
                          <p className="text-lg font-black text-zinc-900">₹{wallet?.balance || 0}</p>
                       </div>
                       {useWallet && <CheckCircle2 className="ml-auto h-6 w-6 text-emerald-500" />}
                    </div>
                 </button>

                 <button 
                  disabled={!reward || reward.currentPoints === 0}
                  onClick={() => setUsePoints(!usePoints)}
                  className={cn(
                    "p-6 rounded-[32px] border-2 text-left transition-all relative overflow-hidden group",
                    usePoints 
                    ? "border-indigo-500 bg-indigo-50/30" 
                    : "border-zinc-100 bg-white hover:border-zinc-200 disabled:opacity-50"
                  )}
                 >
                    <div className="relative z-10 flex items-center gap-4">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                         usePoints ? "bg-indigo-500 text-white" : "bg-zinc-100 text-zinc-400"
                       )}>
                          <Gift className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Redeem Points</p>
                          <p className="text-lg font-black text-zinc-900">{reward?.currentPoints || 0} PTS</p>
                       </div>
                       {usePoints && <CheckCircle2 className="ml-auto h-6 w-6 text-indigo-500" />}
                    </div>
                 </button>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-3">
                <Clock className="h-6 w-6 text-emerald-500" />
                Protocol Details
              </h2>
              <Card className="p-8 border-zinc-200 rounded-[32px] bg-white">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-black text-zinc-900">{selectedPlan.name}</h3>
                    <p className="text-zinc-500 font-medium">{selectedPlan.durationDays}-Day Metabolic Cycle</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-zinc-900">₹{selectedPlan.offerPrice}</div>
                    <div className="text-xs font-bold text-emerald-600">Secure Protocol Access</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-zinc-100">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Calories</div>
                    <div className="font-bold text-zinc-900">{selectedPlan.calories} kcal</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Protein</div>
                    <div className="font-bold text-zinc-900">{selectedPlan.protein}g Avg</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Meals</div>
                    <div className="font-bold text-zinc-900">{selectedPlan.mealsPerDay} / Day</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Timing</div>
                    <div className="font-bold text-zinc-900">{selectedPlan.deliveryTiming || "Morning Slot"}</div>
                  </div>
                </div>
              </Card>
            </section>

            {/* GST Invoice Section */}
            <section className="mt-8">
              <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-emerald-500" />
                GST Invoice Option (Optional)
              </h2>
              <Card className="p-8 border-zinc-200 rounded-[32px] bg-white space-y-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={wantGstInvoice}
                    onChange={(e) => setWantGstInvoice(e.target.checked)}
                    className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-extrabold text-zinc-900 text-sm">Request GST Business Invoice</span>
                    <p className="text-xs text-zinc-400 font-medium">Claim 5% input tax credit on your subscription bill</p>
                  </div>
                </label>

                {wantGstInvoice && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 animate-fadeIn"
                  >
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Registered Company Name *</label>
                      <input 
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                        className="w-full h-12 px-4 rounded-xl bg-zinc-50 border border-zinc-150 text-sm font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Company GSTIN *</label>
                      <input 
                        type="text"
                        required
                        value={companyGst}
                        onChange={(e) => setCompanyGst(e.target.value.toUpperCase())}
                        placeholder="e.g. 29AAAAA1111A1Z1"
                        maxLength={15}
                        className="w-full h-12 px-4 rounded-xl bg-zinc-50 border border-zinc-150 text-sm font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </motion.div>
                )}
              </Card>
            </section>
          </div>

          <div className="space-y-8">
            <CouponModule 
              onApply={setAppliedCoupon} 
              subtotal={basePrice} 
              planId={selectedPlan.id} 
            />

            <Card className="p-8 border-zinc-200 rounded-[40px] bg-white sticky top-12 shadow-xl shadow-zinc-200/50">
              <motion.div layout>
                <h3 className="text-xl font-black text-zinc-900 mb-6">Payment Ledger</h3>
                <div className="space-y-4 mb-8">
                  <motion.div layout className="flex justify-between text-sm font-medium">
                    <span className="text-zinc-500">Plan Base Rate</span>
                    <span className="text-zinc-900 font-bold">₹{basePrice}</span>
                  </motion.div>
                  <AnimatePresence>
                    {discountAmount > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        layout
                        className="flex justify-between text-sm font-medium text-emerald-600"
                      >
                        <span>Coupon Discount</span>
                        <span className="font-bold">-₹{discountAmount}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {deliveryFee > 0 && (
                    <motion.div layout className="flex justify-between text-sm font-medium">
                      <span className="text-zinc-500">Delivery Fee</span>
                      <span className="text-zinc-900 font-bold">₹{deliveryFee}</span>
                    </motion.div>
                  )}
                  <motion.div layout className="flex justify-between text-sm font-medium">
                    <span className="text-zinc-500">Protocol GST (5%)</span>
                    <span className="text-zinc-900 font-bold">₹{taxes}</span>
                  </motion.div>
                  
                  <AnimatePresence>
                    {usePoints && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        layout
                        className="flex justify-between text-sm font-medium text-indigo-600 overflow-hidden"
                      >
                        <span>Points Redemption</span>
                        <span className="font-bold">-₹{pointsValue}</span>
                      </motion.div>
                    )}
                    {useWallet && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        layout
                        className="flex justify-between text-sm font-medium text-emerald-600 overflow-hidden"
                      >
                        <span>Wallet Usage</span>
                        <span className="font-bold">-₹{walletValue}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
  
                  {/* Payment Method Selector */}
                  <motion.div layout className="border-t border-zinc-100 pt-6 mt-6">
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-4">Choose Payment Mode</h4>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {(["upi", "card", "netbanking"] as const).map((method) => {
                        const isSelected = paymentMethod === method;
                        return (
                          <motion.button
                            key={method}
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { triggerHaptic('light'); setPaymentMethod(method); }}
                            className={cn(
                              "p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                              isSelected
                                ? "border-emerald-500 bg-emerald-50/20 shadow-sm"
                                : "border-zinc-150 hover:border-zinc-200 bg-zinc-50/30"
                            )}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              {method === "upi" && "Instant UPI"}
                              {method === "card" && "Card Payment"}
                              {method === "netbanking" && "Net Banking"}
                            </span>
                            <span className="font-extrabold text-sm text-zinc-900 mt-1">
                              {method === "upi" && "GPay / PhonePe"}
                              {method === "card" && "Visa / Mastercard"}
                              {method === "netbanking" && "Major Banks"}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
  
                  <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                    <span className="text-lg font-black text-zinc-900">Total Payable</span>
                    <motion.span 
                      key={total}
                      initial={{ scale: 1.1, color: "#10b981" }}
                      animate={{ scale: 1, color: "#10b981" }}
                      className="text-3xl font-black tracking-tighter"
                    >
                      ₹{total}
                    </motion.span>
                  </div>
                </div>
  
                <Button 
                  onClick={() => { triggerHaptic('medium'); handlePlaceOrder(); }}
                  disabled={isProcessing}
                  className="w-full rounded-2xl py-8 font-black text-lg bg-zinc-900 hover:bg-black text-white group shadow-2xl shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99] transition-transform"
                >
                  {isProcessing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      {total === 0 ? "Activate via Credits" : "Activate Protocol"}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>
            </Card>
          </div>
        </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Bank-Grade 256-Bit Encryption
              </div>
            </div>

            {/* Why Taaza Bites (Trust) */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Truck className="w-5 h-5" />, title: "Free Delivery", desc: "No hidden charges on subscriptions" },
                { icon: <Heart className="w-5 h-5" />, title: "Freshly Made", desc: "Prepared hours before delivery" },
                { icon: <Undo2 className="w-5 h-5" />, title: "Easy Pause", desc: "Skip or pause meals anytime" }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white rounded-3xl border border-zinc-100 flex flex-col gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-black text-zinc-900">{item.title}</h4>
                  <p className="text-xs text-zinc-500 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Checkout FAQ */}
            <section className="mt-16 space-y-8">
              <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                <HelpCircle className="h-6 w-6 text-emerald-500" />
                Frequently Asked Questions
              </h2>
              <div className="grid gap-4">
                {[
                  { q: "Can I cancel my subscription anytime?", a: "Yes, you can pause or cancel. For cancellations, the remaining balance is refunded as per our policy." },
                  { q: "What if I'm not home during delivery?", a: "Our delivery team can leave the bag with security or at your doorstep in an insulated bag." },
                  { q: "Can I change my delivery address later?", a: "Absolutely. You can update your address via the dashboard at least 24 hours in advance." }
                ].map((faq, i) => (
                  <Card key={i} className="p-6 bg-white border-zinc-100 rounded-3xl">
                    <h4 className="text-sm font-black text-zinc-900 mb-2">{faq.q}</h4>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">{faq.a}</p>
                  </Card>
                ))}
              </div>
            </section>

            <div className="mt-12 text-center">
              <button 
                onClick={() => navigate('/refund-policy')}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-emerald-500 transition-colors inline-flex items-center gap-2"
              >
                <ShieldCheck className="w-3 h-3" /> View Refund & Cancellation Policy
              </button>
            </div>

            {total > 0 && (
              <div className="mt-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-start gap-3">
                <Info className="h-4 w-4 text-zinc-400 mt-0.5" />
                <p className="text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">
                  You will earn ~{Math.round(total / 20)} reward points on this transaction.
                </p>
              </div>
            )}

        {/* Order Summary Overlay */}
        <AnimatePresence>
          {showSummary && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isProcessing && setShowSummary(false)}
                className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
              >
                <div className="p-8 sm:p-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-zinc-900">Order Summary</h3>
                    <button 
                      onClick={() => setShowSummary(false)}
                      disabled={isProcessing}
                      className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                    >
                      <Plus className="h-6 w-6 text-zinc-400 rotate-45" />
                    </button>
                  </div>

                  <div className="space-y-6 mb-10">
                    <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Protocol Selected</p>
                          <p className="text-base font-black text-zinc-900">{selectedPlan.name} • {selectedPlan.durationDays} Days</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                          <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Delivery Zone</p>
                          <p className="text-base font-black text-zinc-900 truncate max-w-[240px]">
                            {addresses.find(a => a.id === selectedAddressId)?.street}, {addresses.find(a => a.id === selectedAddressId)?.area}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 px-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 font-medium">Subtotal</span>
                        <span className="text-zinc-900 font-bold">₹{basePrice - discountAmount + deliveryFee}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 font-medium">Protocol Tax (5%)</span>
                        <span className="text-zinc-900 font-bold">₹{taxes}</span>
                      </div>
                      {(useWallet || usePoints) && (
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span className="font-medium">Credits Applied</span>
                          <span className="font-bold">-₹{walletValue + pointsValue}</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-zinc-100 flex justify-between items-center">
                        <span className="text-lg font-black text-zinc-900">Final Payable</span>
                        <span className="text-3xl font-black text-emerald-600">₹{total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      onClick={initiatePayment}
                      disabled={isProcessing}
                      className="w-full py-8 rounded-2xl bg-zinc-900 hover:bg-black text-white font-black text-lg shadow-xl shadow-emerald-500/10"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <>
                          {total === 0 ? "Confirm Activation" : "Confirm & Pay Now"}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                    <p className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Secure Encrypted Transaction
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <TaskProgressBarModal
          isOpen={isProcessing}
          title="Processing Subscription Payment"
          subtitle="Please do not close or refresh this tab"
          progressPercent={paymentProgress}
          currentStepLabel={paymentStepLabel}
          steps={paymentSteps}
        />
      </div>
    </main>
  );
}
