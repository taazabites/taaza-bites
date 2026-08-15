import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, ArrowLeft, Check, Sparkles, Activity, ShieldCheck, 
  Flame, Leaf, Dumbbell, Stethoscope, Droplet, Clock, Coffee, Heart, Target, ChevronRight, Zap, Calculator, Scale, Info, CheckCircle2, UserIcon, Users, MapPin, Wallet as WalletIcon, Gift, Loader2, CreditCard, Utensils, Award, Lock
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { SubscriptionService, WalletService, RewardService, RazorpayService, MealItemService, AddressService } from "@/src/firebase/services";
import { OnboardingState } from "../types/onboarding";
import { calculateBMI, getBMICategory, calculateNutrition } from "../lib/nutrition-utils";
import { Card, Button, Input } from "../components/ui/primitives";
import { cn } from "../lib/utils";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PageHeader } from "../components/dashboard/PageHeader";
import { PageTransition } from "../components/dashboard/PageTransition";
import { WeeklyMenuPreview } from "../components/subscription/WeeklyMenuPreview";
import { CouponModule } from "../components/CouponModule";
import { PlansPageSkeleton, TextBlockSkeleton } from "../components/common/SkeletonLibrary";
import { LivePlanGrid } from "../components/plans/LivePlanGrid";
import { useSubscriptionPlans } from "../lib/plans-cache";
import { normalizePlan, type NormalizedPlan } from "../lib/plan-normalize";
import { trackFunnel } from "../lib/funnel-analytics";
import { Analytics } from "../utils/analytics";

const INITIAL_STATE: OnboardingState = {
  age: "", gender: "", height: "", weight: "", activity: "moderate",
  medicalConditions: [], allergies: [], foodPreference: "Veg",
  location: "", cookingFrequency: "", budget: "", goal: "Weight Loss",
  mealsPerDay: "3 Meals", mealTypes: ["Breakfast", "Lunch", "Dinner"],
  proteinLevel: "Standard", calories: "Standard", deliveryTiming: "Morning (7 AM - 9 AM)",
  cuisine: "Mixed", spiceLevel: "Medium", avoidIngredients: []
};

const GOALS = [
  { id: "Weight Loss", icon: Flame, desc: "Shed weight safely with delicious, portion-controlled meals." },
  { id: "Fat Loss", icon: Activity, desc: "Trim body fat while keeping high protein & energy levels." },
  { id: "Muscle Gain", icon: Dumbbell, desc: "Build lean muscle with extra protein-rich dishes." },
  { id: "PCOS", icon: Heart, desc: "Hormone-friendly, low-GI meals for balance & vitality." },
  { id: "Diabetes", icon: Droplet, desc: "Smart meals with fiber & slow-digesting complex carbs." },
  { id: "Heart Health", icon: ShieldCheck, desc: "Heart-healthy, low-sodium meals cooked in cold-pressed oil." },
  { id: "Gut Health", icon: Leaf, desc: "Fiber-rich, easy to digest meals with natural probiotics." },
  { id: "Senior Health", icon: Stethoscope, desc: "Soft, wholesome, nutritious meals for daily comfort." },
  { id: "Office Wellness", icon: Coffee, desc: "Light, non-drowsy lunches that keep you sharp at work." },
  { id: "Sports Nutrition", icon: Zap, desc: "High-performance meals for active athletes & gym lovers." },
];

const STEP_TITLES = [
  "Your Profile",
  "Health Goal",
  "Calculating Plan",
  "Plan Recommendation",
  "Customize Delivery",
  "Sample Menu",
  "Select Duration",
  "Order Summary & Pay"
];

export default function Plans() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const { plans: rawPlans, loading: plansLoading } = useSubscriptionPlans();
  const livePlans = useMemo(
    () => (rawPlans || []).map(normalizePlan).filter((p) => p.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [rawPlans]
  );
  const params = new URLSearchParams(location.search);
  const fromAssessment = params.get("from") === "assessment";
  const mode = params.get("mode") || "subscribe";
  const existingSubscriptionId = params.get("subscriptionId") || "";
  const recommendedId = params.get("recommended") || "";
  const [selectedLivePlan, setSelectedLivePlan] = useState<NormalizedPlan | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [step, setStep] = useState(location.state?.fromState ? 8 : (fromAssessment || mode === "upgrade" || mode === "renew" || mode === "downgrade" ? 7 : 1));
  const [state, setState] = useState<OnboardingState>(location.state?.fromState || INITIAL_STATE);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(true);

  // Checkout State
  const [wallet, setWallet] = useState<any>(null);
  const [reward, setReward] = useState<any>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [duration, setDuration] = useState<3 | 7 | 15 | 30>(30);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    addressLine1: '',
    addressLine2: '',
    pincode: '',
    city: 'Bangalore'
  });

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const durations = { light: 15, medium: 30, heavy: 50 };
      navigator.vibrate(durations[type]);
    }
  };

  useEffect(() => {
    Analytics.trackSubscriptionView();
    trackFunnel("subscription_view", { mode });
  }, [mode]);

  useEffect(() => {
    if (!selectedLivePlan && livePlans.length) {
      const rec = livePlans.find((p) => p.id === recommendedId) || livePlans.find((p) => p.popular) || livePlans[0];
      setSelectedLivePlan(rec);
    }
  }, [livePlans, recommendedId, selectedLivePlan]);

  useEffect(() => {
    if (currentUser) {
      Promise.all([
        WalletService.getWallet(currentUser.uid),
        RewardService.getRewardPoints(currentUser.uid),
        SubscriptionService.isNewUser(currentUser.uid),
        AddressService.getAddresses(currentUser.uid)
      ]).then(([w, r, isNew, addrs]) => {
        setWallet(w);
        setReward(r);
        setIsNewUser(isNew);
        setAddresses(addrs);
        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a: any) => a.default) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
        }
        if (!isNew) {
          setDuration(30);
        }
      }).catch(err => {
        console.warn("Failed loading user data:", err);
        setIsNewUser(true);
      });
    } else {
      setIsNewUser(true);
    }
  }, [currentUser]);

  const updateState = (key: keyof OnboardingState, value: any) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    triggerHaptic('light');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    triggerHaptic('light');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => prev - 1);
  };

  const handleCalculate = () => {
    setStep(3);
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setStep(4);
    }, 2800);
  };

  const mealCountMultiplier = state.mealsPerDay === "3 Meals" ? 3 : state.mealsPerDay === "2 Meals" ? 2 : 1;
  const basePricePerDay = 300;
  const rawPrice = basePricePerDay * mealCountMultiplier * duration;
  const discountMultiplier = duration === 30 ? 0.85 : duration === 15 ? 0.90 : duration === 7 ? 0.95 : 1.00;
  const offerPrice = Math.round(rawPrice * discountMultiplier);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percentage") {
      return Math.round((offerPrice * appliedCoupon.discountValue) / 100);
    }
    return appliedCoupon.discountValue;
  }, [appliedCoupon, offerPrice]);

  const deliveryFee = 45;
  const subtotal = offerPrice - discountAmount + deliveryFee;
  const taxes = Math.round(subtotal * 0.05);
  const intermediateTotal = subtotal + taxes;

  const pointsValue = useMemo(() => {
    if (!reward || !usePoints) return 0;
    return Math.min(Math.floor(reward.currentPoints / 10), intermediateTotal);
  }, [reward, usePoints, intermediateTotal]);

  const walletValue = useMemo(() => {
    if (!wallet || !useWallet) return 0;
    return Math.min(wallet.balance, intermediateTotal - pointsValue);
  }, [wallet, useWallet, intermediateTotal, pointsValue]);

  const total = Math.max(0, intermediateTotal - pointsValue - walletValue);

  const stats = calculateNutrition(
    (state.gender as any) || 'male',
    Number(state.age) || 30,
    Number(state.height) || 170,
    Number(state.weight) || 70,
    state.activity || 'moderate',
    state.goal || 'maintenance'
  );
  
  const bmi = calculateBMI(Number(state.weight) || 70, Number(state.height) || 170);

  const handleInitiatePayment = async () => {
    if (!currentUser) {
      showToast("Please log in to complete your subscription.", "info");
      navigate('/login', { state: { from: location, fromState: state } });
      return;
    }

    if (!selectedLivePlan) {
      showToast("Select a live plan from the list first.", "error");
      return;
    }

    if (!selectedAddressId) {
      showToast("Please provide a delivery address.", "error");
      setIsProcessing(false);
      return;
    }
    
    setIsProcessing(true);
    const selectedPlan = selectedLivePlan;
    Analytics.trackPlanSelected(selectedPlan.id, selectedPlan.planName);
    trackFunnel("checkout_started", { planId: selectedPlan.id, planName: selectedPlan.planName });

    try {
      Analytics.trackPaymentStarted(selectedPlan.id, selectedPlan.planName, selectedPlan.offerPrice);
      trackFunnel("payment_started", { planId: selectedPlan.id });
      const purpose = mode === "upgrade" || mode === "downgrade" ? "upgrade" : mode === "renew" ? "renewal" : "subscription";
      const orderData = await RazorpayService.createOrder(
        selectedPlan.id,
        null,
        appliedCoupon?.isReferral ? undefined : appliedCoupon?.code,
        0,
        currentUser.uid,
        selectedAddressId,
        { purpose, existingSubscriptionId: existingSubscriptionId || undefined }
      );

      if (!(window as any).Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      }
      if (!(window as any).Razorpay) {
        throw new Error("Payment window could not load. Check your connection and retry.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Taaza Bites",
        description: `${selectedPlan.planName} Subscription`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await RazorpayService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              couponCode: appliedCoupon?.isReferral ? undefined : appliedCoupon?.code,
              amount: selectedPlan.offerPrice,
              notes: { userId: currentUser.uid, planId: selectedPlan.id, addressId: selectedAddressId },
            });
            if (verifyRes.success) {
              trackFunnel(purpose === "renewal" ? "subscription_renewed" : "subscription_activated", { planId: selectedPlan.id });
              navigate("/payment-success", { state: { orderNumber: verifyRes.orderNumber, planName: selectedPlan.planName, amount: selectedPlan.offerPrice, plan: selectedPlan } });
            } else {
              Analytics.trackPaymentFailed(selectedPlan.id, verifyRes.error);
              navigate("/payment-issue", { state: { error: verifyRes.error || "Payment verification failed", fromState: state } });
            }
          } catch (err: any) {
            Analytics.trackPaymentFailed(selectedPlan.id, err.message);
            navigate("/payment-issue", { state: { error: err.message || "Verification failed", fromState: state } });
          }
        },
        prefill: {
          name: currentUser.displayName || "",
          email: currentUser.email || "",
          contact: currentUser.phoneNumber || ""
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            showToast("Payment window closed", "info");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      Analytics.trackPaymentFailed(selectedPlan.id, err.message);
      showToast(err.message || "Could not start payment. Please retry.", "error");
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          {/* Top Fixed Progress Line */}
          <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800 z-50">
            <motion.div 
              className="h-full bg-emerald-600" 
              initial={{ width: 0 }} 
              animate={{ width: `${(step / 8) * 100}%` }} 
              transition={{ duration: 0.3 }}
            />
          </div>

          <PageHeader 
            title={STEP_TITLES[step - 1]}
            description={
              step === 1 ? "Configure your biological profile to help us calibrate your nutrition." :
              step === 2 ? "Select the primary health outcome you wish to achieve." :
              step === 3 ? "Our intelligence engine is processing your data..." :
              step === 4 ? "Review your clinically-calculated nutritional architecture." :
              step === 5 ? "Personalize your delivery logistics and taste profiles." :
              step === 6 ? "Explore the culinary variety waiting for you." :
              step === 7 ? "Select a subscription commitment level." :
              "Finalize your secure subscription and activate your plan."
            }
            badge={`Step ${step} of 8`}
            icon={step === 1 ? UserIcon : step === 2 ? Target : step === 3 ? Loader2 : step === 4 ? Activity : step === 5 ? MapPin : step === 6 ? Utensils : step === 7 ? CreditCard : ShieldCheck}
            gradient="from-emerald-950 via-zinc-900 to-zinc-950"
          >
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Secure Configuration</span>
            </div>
          </PageHeader>

          <div className="max-w-4xl mx-auto pb-12">
            <AnimatePresence mode="wait">
          
          {/* STEP 1: USER PROFILE DETAILS */}
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }} 
              className="space-y-10"
            >
              <div className="text-center space-y-3">
                <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight">
                  Tell Us About Yourself
                </h1>
                <p className="text-zinc-600 font-medium text-base md:text-lg max-w-xl mx-auto">
                  We use your details to calculate your daily calorie and protein requirements for fresh, balanced meals.
                </p>
              </div>

              <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Users className="w-3.5 h-3.5" /> Gender
                    </label>
                    <select 
                      value={state.gender} 
                      onChange={e => updateState('gender', e.target.value)}
                      className="w-full h-14 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="" disabled>Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Clock className="w-3.5 h-3.5" /> Age (Years)
                    </label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 28" 
                      value={state.age} 
                      onChange={e => updateState('age', e.target.value)} 
                      className="h-14 rounded-xl text-base font-bold border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-950" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Scale className="w-3.5 h-3.5" /> Height (cm)
                    </label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 170" 
                      value={state.height} 
                      onChange={e => updateState('height', e.target.value)} 
                      className="h-14 rounded-xl text-base font-bold border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-950" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Activity className="w-3.5 h-3.5" /> Weight (kg)
                    </label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 68" 
                      value={state.weight} 
                      onChange={e => updateState('weight', e.target.value)} 
                      className="h-14 rounded-xl text-base font-bold border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-950" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Daily Activity Level</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, light or no exercise' },
                      { id: 'moderate', label: 'Moderately Active', desc: 'Workout 3-5 days per week' },
                      { id: 'active', label: 'Very Active', desc: 'Heavy daily physical activity' }
                    ].map(a => (
                      <motion.button 
                        key={a.id} 
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { triggerHaptic('light'); updateState('activity', a.id); }} 
                        className={cn(
                          "p-4 rounded-2xl border-2 text-left transition-all", 
                          state.activity === a.id 
                            ? "border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold" 
                            : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        <div className="font-extrabold text-base">{a.label}</div>
                        <div className="text-xs text-zinc-500 mt-1">{a.desc}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Food Preference</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Veg", "Egg", "Chicken", "Jain"].map(f => (
                      <motion.button 
                        key={f} 
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { triggerHaptic('light'); updateState('foodPreference', f); }} 
                        className={cn(
                          "h-14 rounded-2xl border-2 font-bold text-base transition-all", 
                          state.foodPreference === f 
                            ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                            : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        {f}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={nextStep} 
                  disabled={!state.age || !state.height || !state.weight || !state.gender || !state.activity || !state.foodPreference} 
                  className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-black shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  Continue to Health Goals <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: HEALTH GOAL SELECTION */}
          {step === 2 && (
            <motion.div 
              key="step2" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className="space-y-8"
            >
              <button 
                onClick={prevStep} 
                className="flex items-center text-xs font-extrabold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Profile
              </button>

              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight">
                  What is your primary health goal?
                </h1>
                <p className="text-zinc-600 font-medium text-base md:text-lg">
                  Select what you want to achieve with your daily meal plan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GOALS.map(goal => (
                  <motion.button 
                    key={goal.id} 
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { triggerHaptic('light'); updateState('goal', goal.id); }} 
                    className={cn(
                      "p-5 rounded-3xl border-2 text-left transition-all flex items-start gap-4", 
                      state.goal === goal.id 
                        ? "border-emerald-600 bg-emerald-50/70 shadow-md" 
                        : "border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5", 
                      state.goal === goal.id ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700"
                    )}>
                      <goal.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={cn("text-lg font-black", state.goal === goal.id ? "text-emerald-950" : "text-zinc-900")}>
                        {goal.id}
                      </h3>
                      <p className="text-xs font-medium text-zinc-600 mt-1 leading-relaxed">
                        {goal.desc}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleCalculate} 
                  disabled={!state.goal} 
                  className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-black shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  Calculate My Ideal Plan <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CALCULATING PLAN */}
          {step === 3 && (
            <motion.div 
              key="step3" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="relative w-28 h-28 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} 
                  className="absolute inset-0 rounded-full border-4 border-zinc-200 border-t-emerald-600" 
                />
                <Utensils className="w-10 h-10 text-emerald-600" />
              </div>
              
              <div className="space-y-4 max-w-sm">
                <h2 className="text-2xl font-black text-zinc-900">Designing Your Custom Meal Plan</h2>
                <div className="space-y-3 text-left bg-white p-4 rounded-2xl border border-zinc-200">
                  {[
                    "Calculating daily calorie intake...",
                    "Balancing protein & essential nutrients...",
                    "Selecting delicious fresh recipes..."
                  ].map((text, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.7 }} 
                      className="flex items-center text-xs font-bold text-zinc-700"
                    >
                      <Check className="w-4 h-4 text-emerald-600 mr-2 shrink-0" /> {text}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: RECOMMENDATION */}
          {step === 4 && (
            <motion.div 
              key="step4" 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="space-y-10"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mx-auto">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Your Recommended Plan
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight">
                  Custom {state.goal} Plan
                </h1>
                <p className="text-zinc-600 font-medium text-base md:text-lg max-w-xl mx-auto">
                  Based on your details, here is your daily nutritional breakdown designed by our nutrition team.
                </p>
              </div>

              {/* Nutrition Targets Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm text-center">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 mb-1">Target Calories</p>
                  <p className="text-2xl font-black text-zinc-900">{stats.recommendedCalories} <span className="text-sm font-bold text-zinc-500">kcal/day</span></p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm text-center">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 mb-1">Daily Protein</p>
                  <p className="text-2xl font-black text-zinc-900">{stats.recommendedProtein} <span className="text-sm font-bold text-zinc-500">g/day</span></p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm text-center">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 mb-1">Body Mass Index</p>
                  <p className="text-2xl font-black text-zinc-900">{bmi.toFixed(1)} <span className="text-xs font-bold text-emerald-600">({getBMICategory(bmi)})</span></p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm text-center">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 mb-1">Water Goal</p>
                  <p className="text-2xl font-black text-zinc-900">{stats.recommendedWater} <span className="text-sm font-bold text-zinc-500">Liters</span></p>
                </div>
              </div>

              {/* Plan Card Summary */}
              <Card className="p-6 md:p-8 rounded-3xl bg-emerald-950 text-white relative overflow-hidden shadow-xl border-0">
                <div className="relative z-10 space-y-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-white">{state.goal} Meal Plan</h3>
                    <p className="text-emerald-200 font-medium text-sm mt-1">
                      {state.foodPreference === "Jain" ? "Fresh Jain meals prepared without onion and garlic." :
                       state.foodPreference === "Veg" ? "Fresh vegetarian meals prepared daily." :
                       state.foodPreference === "Egg" ? "High-protein vegetarian and egg meals." :
                       state.foodPreference === "Chicken" ? "Lean chicken meals prepared fresh daily." :
                       `Fresh ${state.foodPreference} meals delivered warm to your doorstep.`}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Fresh, chef-cooked healthy meals", 
                      "Free consultation with nutritionist", 
                      "Daily doorstep delivery in thermal bags", 
                      "Flexible meal pauses & swaps anytime"
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-sm text-zinc-100">{feat}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">Starting From</p>
                      <p className="text-3xl font-black text-white">â‚¹{basePricePerDay} <span className="text-sm font-normal text-emerald-200">/ meal day</span></p>
                    </div>
                    <Button 
                      onClick={nextStep} 
                      className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white text-emerald-950 text-base font-black hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                    >
                      Customize Delivery Options <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 5: CUSTOMIZE DELIVERY & CUISINE */}
          {step === 5 && (
            <motion.div 
              key="step5" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className="space-y-8"
            >
              <button 
                onClick={prevStep} 
                className="flex items-center text-xs font-extrabold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>

              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight">
                  Delivery & Taste Preferences
                </h1>
                <p className="text-zinc-600 font-medium text-base md:text-lg">
                  Customize your daily meal count, delivery time slot, and preferred cuisine.
                </p>
              </div>

              <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="space-y-3">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">How many meals per day?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "1 Meal", desc: "Lunch or Dinner" },
                      { id: "2 Meals", desc: "Lunch & Dinner" },
                      { id: "3 Meals", desc: "Breakfast, Lunch & Dinner" }
                    ].map(m => (
                      <button 
                        key={m.id} 
                        type="button"
                        onClick={() => updateState('mealsPerDay', m.id)} 
                        className={cn(
                          "p-4 rounded-2xl border-2 text-left transition-all", 
                          state.mealsPerDay === m.id 
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold" 
                            : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        <div className="font-extrabold text-base">{m.id}</div>
                        <div className="text-xs text-zinc-500">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Preferred Delivery Time</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Morning (7 AM - 9 AM)", 
                      "Lunch (12 PM - 1:30 PM)", 
                      "Evening (6 PM - 8 PM)", 
                      "Split (Morning & Evening)"
                    ].map(t => (
                      <button 
                        key={t} 
                        type="button"
                        onClick={() => updateState('deliveryTiming', t)} 
                        className={cn(
                          "p-4 rounded-2xl border-2 font-bold text-left text-sm transition-all", 
                          state.deliveryTiming === t 
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950" 
                            : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Favorite Cuisine Style</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["Mixed", "North Indian", "South Indian", "Continental"].map(c => (
                      <button 
                        key={c} 
                        type="button"
                        onClick={() => updateState('cuisine', c)} 
                        className={cn(
                          "h-14 rounded-2xl border-2 font-bold text-xs uppercase tracking-wider transition-all", 
                          state.cuisine === c 
                            ? "border-emerald-600 bg-emerald-600 text-white" 
                            : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={nextStep} 
                  className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-black shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  View Sample Weekly Menu <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: SAMPLE WEEKLY MENU */}
          {step === 6 && (
            <motion.div 
              key="step6" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className="space-y-8"
            >
              <button 
                onClick={prevStep} 
                className="flex items-center text-xs font-extrabold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
              
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight">
                  Sample Weekly Menu
                </h1>
                <p className="text-zinc-600 font-medium text-base md:text-lg">
                  Here is a sample preview of the fresh, nutritious dishes prepared for your plan.
                </p>
              </div>

              <WeeklyMenuPreview 
                goal={state.goal} 
                dietPreference={state.foodPreference} 
                allergies={state.allergies}
                medicalConditions={state.medicalConditions}
                mealsPerDay={state.mealsPerDay}
              />

              <div className="pt-4">
                <Button 
                  onClick={nextStep} 
                  className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-black shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  Choose Subscription Duration <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 7: SELECT DURATION */}
          {step === 7 && (
            <motion.div 
              key="step7" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className="space-y-8"
            >
              <button 
                onClick={prevStep} 
                className="flex items-center text-xs font-extrabold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>

              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight">
                  Choose Your Subscription Plan
                </h1>
                <p className="text-zinc-600 font-medium text-base md:text-lg">
                  Select how long you want to subscribe. Longer plans save you more money!
                </p>
              </div>

              <LivePlanGrid
                plans={livePlans}
                selectedId={selectedLivePlan?.id}
                recommendedId={recommendedId}
                loading={plansLoading}
                error={livePlans.length === 0 && !plansLoading ? "No active plans found in Firestore." : plansError}
                onRetry={() => setPlansError(null)}
                onSelect={(plan) => {
                  setSelectedLivePlan(plan);
                  trackFunnel("plan_selected", { planId: plan.id, planName: plan.planName });
                }}
              />

              <div className="pt-4">
                <Button 
                  onClick={() => {
                    if (!selectedLivePlan) {
                      showToast("Please choose a plan to continue.", "info");
                      return;
                    }
                    if (!currentUser) {
                      showToast("Please log in to proceed.", "info");
                      navigate('/login', { state: { from: location } });
                    } else {
                      nextStep();
                    }
                  }} 
                  className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-black shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  Continue to checkout <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 8: CHECKOUT & PAYMENT */}
          {step === 8 && (
            <motion.div 
              key="step8" 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="space-y-8"
            >
              <button 
                onClick={prevStep} 
                className="flex items-center text-xs font-extrabold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
               
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Discounts & Payment Methods */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Review & Payment</h3>
                    <p className="text-zinc-600 text-sm font-medium">Apply coupons or credits and choose your payment method.</p>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Delivery Address</label>
                      <button 
                        onClick={() => setIsAddingAddress(!isAddingAddress)}
                        className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        {isAddingAddress ? "Cancel" : "+ Add New"}
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {isAddingAddress ? (
                        <motion.div 
                          key="add-address"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-3"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <Input 
                              placeholder="Flat/House No." 
                              value={newAddress.addressLine1}
                              onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                              className="h-11 rounded-xl text-xs font-bold"
                            />
                            <Input 
                              placeholder="Area/Street" 
                              value={newAddress.addressLine2}
                              onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                              className="h-11 rounded-xl text-xs font-bold"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input 
                              placeholder="Pincode" 
                              value={newAddress.pincode}
                              onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                              className="h-11 rounded-xl text-xs font-bold"
                            />
                            <Button 
                              size="sm"
                              disabled={!newAddress.addressLine1 || !newAddress.pincode}
                              onClick={async () => {
                                if (!currentUser) return;
                                try {
                                  const res: any = await AddressService.addAddress(currentUser.uid, {
                                    ...newAddress,
                                    name: currentUser.displayName || 'Me',
                                    phone: currentUser.phoneNumber || '',
                                    default: true
                                  } as any);
                                  const updatedAddrs = await AddressService.getAddresses(currentUser.uid);
                                  setAddresses(updatedAddrs);
                                  if (res && res.id) setSelectedAddressId(res.id);
                                  setIsAddingAddress(false);
                                  showToast("Address saved successfully!", "success");
                                } catch (e) {
                                  showToast("Failed to save address.", "error");
                                }
                              }}
                              className="h-11 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase"
                            >
                              Save Address
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="select-address"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-2"
                        >
                          {addresses.length > 0 ? (
                            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                              {addresses.map(addr => (
                                <button
                                  key={addr.id}
                                  onClick={() => setSelectedAddressId(addr.id)}
                                  className={cn(
                                    "flex-shrink-0 min-w-[200px] p-3 rounded-2xl border-2 text-left transition-all",
                                    selectedAddressId === addr.id 
                                      ? "border-emerald-600 bg-emerald-50" 
                                      : "border-zinc-200 bg-white hover:border-zinc-300"
                                  )}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <MapPin className={cn("w-3 h-3", selectedAddressId === addr.id ? "text-emerald-700" : "text-zinc-500")} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{addr.label}</span>
                                  </div>
                                  <p className="text-[10px] font-medium text-zinc-600 truncate">{addr.addressLine1}, {addr.addressLine2}</p>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2 text-center">
                              <MapPin className="w-6 h-6 text-zinc-300" />
                              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">No address found</p>
                              <Button variant="outline" size="sm" onClick={() => setIsAddingAddress(true)} className="h-8 rounded-lg text-[9px] font-black uppercase">Add Delivery Address</Button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Coupons */}
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
                    <CouponModule subtotal={offerPrice} onApply={setAppliedCoupon} planId={`custom_${duration}`} />
                  </div>

                  {/* Wallet & Reward Credits */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Use Wallet or Points</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setUseWallet(!useWallet)}
                        disabled={!wallet || wallet.balance === 0}
                        className={cn(
                          "p-4 rounded-2xl border-2 text-left transition-all",
                          useWallet ? "border-emerald-600 bg-emerald-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <WalletIcon className={cn("w-4 h-4", useWallet ? "text-emerald-700" : "text-zinc-500")} />
                          <span className="text-xs font-extrabold text-zinc-700 uppercase">Wallet</span>
                        </div>
                        <p className="text-base font-black text-zinc-900">â‚¹{wallet?.balance || 0}</p>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setUsePoints(!usePoints)}
                        disabled={!reward || reward.currentPoints === 0}
                        className={cn(
                          "p-4 rounded-2xl border-2 text-left transition-all",
                          usePoints ? "border-emerald-600 bg-emerald-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Gift className={cn("w-4 h-4", usePoints ? "text-emerald-700" : "text-zinc-500")} />
                          <span className="text-xs font-extrabold text-zinc-700 uppercase">Points</span>
                        </div>
                        <p className="text-base font-black text-zinc-900">{reward?.currentPoints || 0} pts</p>
                      </button>
                    </div>
                  </div>

                  {/* Payment Mode Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Select Payment Mode</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "upi", label: "UPI / GPay" },
                        { id: "card", label: "Credit/Debit" },
                        { id: "netbanking", label: "Net Banking" }
                      ].map((m) => (
                        <button 
                          key={m.id} 
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)} 
                          className={cn(
                            "h-14 rounded-2xl border-2 font-black text-xs transition-all", 
                            paymentMethod === m.id 
                              ? "border-emerald-600 bg-emerald-600 text-white" 
                              : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                          )}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Ledger */}
                <div className="lg:sticky lg:top-24 h-fit">
                  <motion.div layout>
                    <Card className="p-6 md:p-8 rounded-3xl bg-zinc-950 text-white shadow-xl border-0 relative overflow-hidden">
                      <div className="relative z-10 space-y-6">
                        <motion.div layout>
                          <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-1">Metabolic Protocol</p>
                          <h3 className="text-2xl font-black">{state.goal} {selectedLivePlan?.durationDays || duration}-Day Plan</h3>
                          <p className="text-zinc-400 text-xs font-medium mt-1">
                             {state.foodPreference} â€¢ {state.mealsPerDay} per day
                          </p>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                           <div className="space-y-0.5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Price/Day</p>
                              <p className="text-lg font-black text-emerald-400">â‚¹{Math.round(offerPrice / duration)}</p>
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Savings</p>
                              <p className="text-lg font-black text-emerald-400">â‚¹{Math.round(basePricePerDay * mealCountMultiplier * duration - offerPrice + discountAmount)}</p>
                           </div>
                        </div>

                        <div className="space-y-3 pb-4 text-sm font-medium">
                          <motion.div layout className="flex justify-between">
                            <span className="text-zinc-400">Subscription Rate</span>
                            <span className="font-bold text-white">â‚¹{offerPrice}</span>
                          </motion.div>
                          <AnimatePresence>
                            {discountAmount > 0 && (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                layout
                                className="flex justify-between text-emerald-400"
                              >
                                <span>Coupon Discount</span>
                                <span className="font-bold">-â‚¹{discountAmount}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <motion.div layout className="flex justify-between">
                            <span className="text-zinc-400">Delivery Fee</span>
                            <span className="font-bold text-white">â‚¹{deliveryFee}</span>
                          </motion.div>
                          <motion.div layout className="flex justify-between">
                            <span className="text-zinc-400">GST Tax (5%)</span>
                            <span className="font-bold text-white">â‚¹{taxes}</span>
                          </motion.div>
                          <AnimatePresence>
                            {(useWallet || usePoints) && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                layout
                                className="flex justify-between text-emerald-400 pt-2 border-t border-zinc-800 overflow-hidden"
                              >
                                <span>Credits Applied</span>
                                <span className="font-bold">-â‚¹{walletValue + pointsValue}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-base font-extrabold text-white">Total Payable</span>
                          <motion.span 
                            key={total}
                            initial={{ scale: 1.1, color: "#34d399" }}
                            animate={{ scale: 1, color: "#34d399" }}
                            className="text-3xl font-black"
                          >
                            â‚¹{total}
                          </motion.span>
                        </div>

                        <Button 
                          onClick={() => { triggerHaptic('medium'); handleInitiatePayment(); }}
                          disabled={isProcessing}
                          className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <>
                              Pay â‚¹{total} & Confirm Order <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Secure Payment via Razorpay
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
