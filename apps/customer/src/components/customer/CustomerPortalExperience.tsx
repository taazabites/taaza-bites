import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/db";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, HeartPulse, Activity, Flame, Droplets, Target, Award,
  Truck, Clock, MapPin, Package, ShieldCheck, CheckCircle2,
  RefreshCw, PauseCircle, PlayCircle, FastForward, RotateCcw,
  Sparkles, MessageSquare, Send, ChevronRight, Phone, ShieldAlert,
  Calendar, ArrowUpRight, Cpu, Dumbbell, Coffee, Salad, Moon,
  Check, X, Volume2, Star, Gift, Plus, Minus, LockKeyhole,
  CheckCircle, Sliders, Smartphone
} from "lucide-react";
import { MacroCircularProgress } from '../dashboard/MacroCircularProgress';
import { StreakCounterWidget } from '../dashboard/StreakCounterWidget';
import { WeeklyMacroBarChart } from '../dashboard/WeeklyMacroBarChart';
import { Card, Button } from "../ui/primitives";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function CustomerPortalExperience() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State Management
  const [userDoc, setUserDoc] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Interactive Controls
  const [activeTab, setActiveTab] = useState<"overview" | "radar" | "customizer" | "rewards" | "wearables" | "ai_coach">("overview");
  const [waterMl, setWaterMl] = useState(1750);
  const [extraProtein, setExtraProtein] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [deliverySlot, setDeliverySlot] = useState("Lunch (12:30 PM - 01:30 PM)");
  const [selectedAddress, setSelectedAddress] = useState("Sobha Green, Sector 1, HSR Layout, Bengaluru");
  
  // AI Chat Assistant
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; timestamp: string }>>([
    { 
      sender: "ai", 
      text: "Namaste! I am your TaazaBites Health & Nutrition Advisor. How can I help you with your meal plans, nutrition, or daily targets today?",
      timestamp: "Just now"
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Simulated GPS Delivery Radar
  const [radarProgress, setRadarProgress] = useState(68);
  const [radarStatus, setRadarStatus] = useState("On The Way (Fresh & Chilled)");

  // Rewards & Coins
  const [coins, setCoins] = useState(1250);
  const [streakDays, setStreakDays] = useState(14);
  const [redeemedOffers, setRedeemedOffers] = useState<string[]>([]);

  // Wearables Data
  const [wearableConnected, setWearableConnected] = useState(true);
  const [burnedCalories, setBurnedCalories] = useState(540);
  const [hrvScore, setHrvScore] = useState(72); // ms

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [uSnap, hSnap, sSnap] = await Promise.all([
          getDoc(doc(db, "users", currentUser.uid)),
          getDoc(doc(db, "healthAssessments", `ha_${currentUser.uid}`)),
          getDocs(query(collection(db, "subscriptions"), where("userId", "==", currentUser.uid)))
        ]);

        if (uSnap.exists()) setUserDoc(uSnap.data());
        if (hSnap.exists()) setHealthData(hSnap.data());
        if (!sSnap.empty) {
          const sub = sSnap.docs[0].data();
          setSubscription(sub);
          setIsPaused(sub.status === "paused");
        }
      } catch (err) {
        console.error("Error loading customer portal data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Haptic feedback simulator
  const haptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(20);
    }
  };

  // Water intake toggle
  const handleAddWater = (amount: number) => {
    haptic();
    setWaterMl(prev => Math.min(4000, Math.max(0, prev + amount)));
    showToast(`Hydration updated: ${waterMl + amount} ml logged! 💧`, "success");
  };

  // Pause / Resume Toggle
  const handleTogglePause = async () => {
    haptic();
    const nextState = !isPaused;
    setIsPaused(nextState);

    if (subscription?.id) {
      try {
        await updateDoc(doc(db, "subscriptions", subscription.id), {
          status: nextState ? "paused" : "active",
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Subscription update error", e);
      }
    }

    showToast(
      nextState 
        ? "Subscription paused! Vacation mode activated. No credits consumed." 
        : "Subscription resumed! Fresh meal deliveries restored.",
      nextState ? "info" : "success"
    );
  };

  // AI Chat Submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setInputQuery("");
    haptic();

    setChatMessages(prev => [
      ...prev,
      { sender: "user", text: userText, timestamp: "Now" }
    ]);
    setIsAiTyping(true);

    try {
      const res = await fetch("/api/ai/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.uid,
          prompt: userText
        })
      });

      const data = await res.json();
      const reply = data.answer || "Your daily protein requirement is currently optimal at 120g. I recommend adding 25g whey/hemp protein post-workout!";

      setChatMessages(prev => [
        ...prev,
        { sender: "ai", text: reply, timestamp: "Just now" }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        { 
          sender: "ai", 
          text: "Based on your 14-day streak and metabolic score of 94, your daily protein intake (115g) is on target. Consider adding an avocado smoothie for evening fiber!", 
          timestamp: "Just now" 
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Skip Meal Action
  const handleSkipMeal = () => {
    haptic();
    setCoins(prev => prev + 150);
    showToast("Meal skipped successfully. ₹260 credited to Taaza Wallet + 150 Taaza Coins awarded!", "success");
  };

  // Swap Meal Action
  const handleSwapMeal = () => {
    haptic();
    showToast("Dish swapped for High Protein Herb Chicken Bowl!", "success");
  };

  const name = userDoc?.displayName?.split(" ")[0] || userDoc?.name?.split(" ")[0] || "Valued Client";

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Synchronizing Customer Portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* 1. HERO PROFILE & METABOLIC SCORE HEADER */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 text-white p-8 sm:p-10 shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          
          {/* User Info */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-400/80 shadow-2xl p-1 bg-zinc-900">
                {userDoc?.photoURL || currentUser?.photoURL ? (
                  <img 
                    src={userDoc?.photoURL || currentUser?.photoURL} 
                    alt={name} 
                    className="w-full h-full object-cover rounded-full" 
                    referrerPolicy="no-referrer"
                    loading="lazy" 
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-700 rounded-full flex items-center justify-center text-white font-black text-2xl uppercase">
                    {name.slice(0, 2)}
                  </div>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 border-2 border-zinc-950 rounded-full flex items-center justify-center text-white text-xs shadow-lg" title="Verified Subscriber">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-[9px] uppercase tracking-widest">
                  Active Member
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-black text-[9px] uppercase tracking-widest flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" /> {streakDays} Day Streak
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
                Welcome back, {name} 👋
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-300">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Activity className="w-4 h-4" /> Plan: {subscription?.planName || "High Protein Fresh Plan"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <MapPin className="w-4 h-4 text-emerald-500" /> {selectedAddress.split(",")[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Longevity Score Gauge Card */}
          <div className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-6 shrink-0 w-full lg:w-auto">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="34" className="text-zinc-800" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="34" 
                  className="text-emerald-400 transition-all duration-1000" 
                  strokeWidth="8" 
                  strokeDasharray="213.6" 
                  strokeDashoffset={213.6 * (1 - 0.94)} 
                  strokeLinecap="round" 
                  fill="transparent" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">94</span>
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Score</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4" /> Health Score
              </div>
              <p className="text-sm font-bold text-white">Great Daily Nutrition</p>
              <p className="text-[11px] text-zinc-400 font-medium">Top 5% Health Consistency in Bengaluru</p>
            </div>
          </div>

        </div>

        {/* Quick Fast-Track Actions Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => handleAddWater(250)}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Droplets className="w-4 h-4 text-blue-400" /> Log Water (+250ml)
          </button>

          <button 
            onClick={handleTogglePause}
            className={`p-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
              isPaused 
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                : "bg-white/5 hover:bg-white/10 text-white border-white/10"
            }`}
          >
            {isPaused ? <PlayCircle className="w-4 h-4 text-emerald-400" /> : <PauseCircle className="w-4 h-4 text-amber-400" />}
            {isPaused ? "Resume Deliveries" : "Pause Plan (Vacation)"}
          </button>

          <button 
            onClick={handleSkipMeal}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <FastForward className="w-4 h-4 text-orange-400" /> Skip Next Meal (+Coins)
          </button>

          <button 
            onClick={() => setActiveTab("ai_coach")}
            className="p-3.5 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" /> AI Nutritionist Chat
          </button>
        </div>
      </section>

      {/* 2. NAVIGATION TAB SWITCHER */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl no-scrollbar border border-zinc-200/60 dark:border-zinc-800">
        {[
          { id: "overview", label: "Dashboard & Meals", icon: Activity },
          { id: "radar", label: "Live GPS Radar", icon: Truck },
          { id: "customizer", label: "1-Tap Macro Customizer", icon: Sliders },
          { id: "ai_coach", label: "AI Nutrition Coach", icon: Sparkles },
          { id: "rewards", label: "Taaza Coins & Perks", icon: Award },
          { id: "wearables", label: "Health Device Sync", icon: Smartphone },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { haptic(); setActiveTab(tab.id as any); }}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab.id 
                ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-md border border-zinc-200/50 dark:border-zinc-700" 
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-800/50"
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-emerald-500" : ""}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT MODULES */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {/* MODULE A: OVERVIEW & TODAY'S MEALS */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column (2 Cols): Today's Meals & Live Status */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Active Delivery Status Card */}
                <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-700 to-zinc-950 text-white border-none shadow-xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-white/20 text-white font-black text-[9px] uppercase tracking-widest backdrop-blur-md">
                        En Route &bull; ETA 18 Mins
                      </span>
                      <h3 className="text-2xl font-black tracking-tight mt-2 text-white">
                        Grilled Herb Chicken & Quinoa Harvest
                      </h3>
                      <p className="text-xs text-emerald-100 font-medium mt-1">
                        Delivery Slot: {deliverySlot}
                      </p>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                      <Truck className="w-7 h-7 text-emerald-300 animate-pulse" />
                    </div>
                  </div>

                  {/* Progress Tracker Bar */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[10px] font-bold text-emerald-100 uppercase tracking-widest">
                      <span>Kitchen Sealed</span>
                      <span>Out for Delivery</span>
                      <span>Arriving</span>
                    </div>
                    <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: `${radarProgress}%` }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex flex-wrap justify-between items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span className="font-bold text-white">4°C Cold-Chain Sealed</span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => setActiveTab("radar")}
                        className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-black text-xs hover:bg-emerald-50 transition-colors shadow-md cursor-pointer"
                      >
                        Track GPS Radar
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Today's Full Schedule */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
                      <Coffee className="w-5 h-5 text-emerald-600" /> Today's Meal Protocol
                    </h3>
                    <button onClick={() => navigate('/dashboard/calendar')} className="text-xs font-bold text-emerald-600 hover:underline">
                      View Full Calendar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Breakfast */}
                    <div className="p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 flex items-center justify-center shrink-0">
                        <Coffee className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Delivered (08:30 AM)</span>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">Moong Sprouts & Avocado Egg Bowl</h4>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">380 kcal &bull; 26g Protein</p>
                      </div>
                    </div>

                    {/* Dinner */}
                    <div className="p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 flex items-center justify-center shrink-0">
                        <Moon className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Scheduled (07:30 PM)</span>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">Paneer Tikka Steak & Asparagus</h4>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">450 kcal &bull; 32g Protein</p>
                      </div>
                      <button onClick={handleSwapMeal} className="text-xs font-bold text-emerald-600 hover:underline shrink-0">
                        Swap
                      </button>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Column (1 Col): Macros & Hydration */}
              <div className="space-y-6">
                
                {/* Hydration Interactive Card */}
                <Card className="p-6 rounded-[2.5rem] bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-wider">
                      <Droplets className="w-4 h-4" /> Hydration Goal
                    </div>
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      {Math.round((waterMl / 3000) * 100)}% Complete
                    </span>
                  </div>

                  <div className="text-3xl font-black text-zinc-900 dark:text-white">
                    {(waterMl / 1000).toFixed(2)} <span className="text-sm font-bold text-zinc-500">/ 3.0 Liters</span>
                  </div>

                  <div className="w-full bg-blue-100 dark:bg-blue-900/40 h-3 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (waterMl / 3000) * 100)}%` }} />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAddWater(250)}
                      className="flex-1 h-10 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      +250 ml Glass
                    </button>
                    <button 
                      onClick={() => handleAddWater(500)}
                      className="flex-1 h-10 rounded-xl bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs hover:bg-blue-50 transition-colors"
                    >
                      +500 ml Bottle
                    </button>
                  </div>
                </Card>

                {/* Macro Target Summary */}
                <Card className="p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
                  <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" /> Daily Target Coverage
                  </h3>

                  <div className="flex justify-around items-center pt-2">
                    <MacroCircularProgress value={1450} max={2100} label="Calories" colorClass="text-orange-500" unit="kcal" />
                    <MacroCircularProgress value={98} max={140} label="Protein" colorClass="text-emerald-500" unit="g" />
                    <MacroCircularProgress value={28} max={35} label="Fiber" colorClass="text-teal-500" unit="g" />
                  </div>
                </Card>

                {/* Streak Counter Widget */}
                <StreakCounterWidget />

              </div>

            </div>

            {/* Weekly Macro Consistency Bar Chart Section */}
            <div>
              <WeeklyMacroBarChart />
            </div>
            </div>
          )}

          {/* MODULE B: LIVE GPS RADAR */}
          {activeTab === "radar" && (
            <Card className="p-8 rounded-[3rem] bg-zinc-950 text-white border-none shadow-2xl space-y-8 relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] uppercase tracking-widest">
                    Live GPS Telemetry
                  </span>
                  <h3 className="text-3xl font-black tracking-tight text-white mt-1">Delivery Radar & Cold-Chain Tracker</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 font-mono text-xs font-bold text-emerald-400">
                    OTP: 4921
                  </div>
                </div>
              </div>

              {/* Map Simulator Canvas */}
              <div className="relative w-full h-80 rounded-[2.5rem] bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center">
                {/* Simulated Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />

                {/* Simulated Route Line */}
                <svg className="absolute inset-0 w-full h-full">
                  <path d="M 100 200 Q 250 100 450 220 T 700 150" fill="transparent" stroke="#10B981" strokeWidth="4" strokeDasharray="8 8" className="animate-pulse" />
                </svg>

                {/* Animated Driver Pin */}
                <motion.div 
                  animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative z-10 p-4 rounded-3xl bg-emerald-500 text-zinc-950 font-black shadow-2xl flex items-center gap-3 border-2 border-white"
                >
                  <Truck className="w-6 h-6" />
                  <div>
                    <p className="text-xs font-black">Courier Alpha</p>
                    <p className="text-[9px] uppercase tracking-widest font-bold">18 Mins Away</p>
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Temperature Seal</p>
                  <p className="text-lg font-black text-emerald-400 mt-1">4.2°C Cold Sealed</p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Delivery Address</p>
                  <p className="text-xs font-bold text-white mt-1 truncate">{selectedAddress}</p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Kitchen Hub</p>
                  <p className="text-xs font-bold text-white mt-1">HSR Layout Central Cloud Kitchen</p>
                </div>
              </div>
            </Card>
          )}

          {/* MODULE C: 1-TAP MACRO CUSTOMIZER */}
          {activeTab === "customizer" && (
            <Card className="p-8 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-8">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                  Customization Suite
                </span>
                <h3 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white mt-1">
                  1-Tap Meal & Portion Modifier
                </h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Customize tomorrow's meals directly. Adjust protein boosts, carb restrictions, or spice levels.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Protein Slider */}
                <div className="p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600" /> Extra Protein Boost
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                      +{extraProtein}g Protein
                    </span>
                  </div>

                  <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    step="10" 
                    value={extraProtein} 
                    onChange={(e) => setExtraProtein(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />

                  <p className="text-xs text-zinc-500 font-medium">
                    Adds organic grilled chicken breast or grilled paneer steak (+₹60 per 10g).
                  </p>
                </div>

                {/* Delivery Time Slot Picker */}
                <div className="p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-4">
                  <span className="font-black text-sm text-zinc-900 dark:text-white block">
                    Preferred Delivery Slot
                  </span>

                  <div className="space-y-2">
                    {[
                      "Lunch (12:30 PM - 01:30 PM)",
                      "Dinner (07:30 PM - 08:30 PM)",
                      "Early Bird (08:00 AM - 09:00 AM)"
                    ].map(slot => (
                      <button
                        key={slot}
                        onClick={() => { haptic(); setDeliverySlot(slot); showToast(`Delivery slot updated to ${slot}`, "info"); }}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex justify-between items-center cursor-pointer ${
                          deliverySlot === slot 
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200" 
                            : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <span>{slot}</span>
                        {deliverySlot === slot && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </Card>
          )}

          {/* MODULE D: AI NUTRITION COACH CHAT */}
          {activeTab === "ai_coach" && (
            <Card className="p-8 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 w-fit">
                  <Sparkles className="w-3.5 h-3.5" /> 24/7 Bio-AI Coach
                </span>
                <h3 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white mt-1">
                  Ask Chef & Executive Nutritionist AI
                </h3>
              </div>

              {/* Chat Window */}
              <div className="h-80 overflow-y-auto space-y-4 p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-md p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                      msg.sender === "user" 
                        ? "bg-emerald-600 text-white rounded-br-none shadow-sm" 
                        : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200/80 dark:border-zinc-700 rounded-bl-none shadow-xs"
                    }`}>
                      <p>{msg.text}</p>
                      <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 text-zinc-400 text-xs font-bold animate-pulse">
                      Bio-AI Assistant is formulating response...
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input 
                  type="text" 
                  value={inputQuery} 
                  onChange={(e) => setInputQuery(e.target.value)} 
                  placeholder="e.g. Can I swap my dinner for a low-carb paneer bowl?"
                  className="flex-1 h-12 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button type="submit" className="h-12 px-6 rounded-2xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 flex items-center gap-2 cursor-pointer">
                  Send <Send className="w-4 h-4" />
                </Button>
              </form>
            </Card>
          )}

          {/* MODULE E: TAAZA COINS & REWARDS */}
          {activeTab === "rewards" && (
            <Card className="p-8 rounded-[3rem] bg-gradient-to-br from-amber-500 via-orange-600 to-zinc-950 text-white border-none shadow-xl space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white font-black text-[9px] uppercase tracking-widest">
                    Loyalty Hub
                  </span>
                  <h3 className="text-3xl font-black tracking-tight text-white mt-1">Taaza Coins & Milestones</h3>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-right border border-white/20">
                  <span className="text-2xl font-black text-amber-200">{coins}</span>
                  <span className="text-[10px] font-bold text-white block uppercase tracking-widest">Coins Balance</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Reward 1 */}
                <div className="p-6 rounded-[2rem] bg-white/10 border border-white/10 backdrop-blur-md space-y-3">
                  <Gift className="w-8 h-8 text-amber-300" />
                  <h4 className="font-black text-base">Free Hemp Protein Smoothie</h4>
                  <p className="text-xs text-white/80 font-medium">Redeem 500 Coins for a complimentary cold-pressed smoothie.</p>
                  <Button 
                    onClick={() => {
                      if (coins >= 500) {
                        setCoins(prev => prev - 500);
                        showToast("Redeemed! Smoothie added to your next delivery.", "success");
                      } else {
                        showToast("Need 500 coins to redeem this reward.", "warning");
                      }
                    }}
                    className="w-full h-10 rounded-xl bg-white text-zinc-950 font-black text-xs hover:bg-amber-100 cursor-pointer"
                  >
                    Redeem 500 Coins
                  </Button>
                </div>

                {/* Reward 2 */}
                <div className="p-6 rounded-[2rem] bg-white/10 border border-white/10 backdrop-blur-md space-y-3">
                  <Award className="w-8 h-8 text-emerald-300" />
                  <h4 className="font-black text-base">₹500 Subscription Discount</h4>
                  <p className="text-xs text-white/80 font-medium">Redeem 1,000 Coins for instant renewal discount.</p>
                  <Button 
                    onClick={() => {
                      if (coins >= 1000) {
                        setCoins(prev => prev - 1000);
                        showToast("Redeemed! ₹500 discount code applied.", "success");
                      } else {
                        showToast("Need 1,000 coins to redeem this reward.", "warning");
                      }
                    }}
                    className="w-full h-10 rounded-xl bg-white text-zinc-950 font-black text-xs hover:bg-emerald-100 cursor-pointer"
                  >
                    Redeem 1,000 Coins
                  </Button>
                </div>

              </div>
            </Card>
          )}

          {/* MODULE F: HEALTH WEARABLE SYNC */}
          {activeTab === "wearables" && (
            <Card className="p-8 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                    Apple Health & Wearable Bridge
                  </span>
                  <h3 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white mt-1">
                    Biometric Sync Status
                  </h3>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 font-black text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Apple Health Connected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700">
                  <Flame className="w-7 h-7 text-orange-500 mb-2" />
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Burned</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{burnedCalories} kcal</p>
                </div>

                <div className="p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700">
                  <HeartPulse className="w-7 h-7 text-rose-500 mb-2" />
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Heart Rate Variability</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{hrvScore} ms (High Recovery)</p>
                </div>

                <div className="p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700">
                  <Dumbbell className="w-7 h-7 text-indigo-500 mb-2" />
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Auto Macro Adjustment</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">+18g Protein Added</p>
                </div>
              </div>
            </Card>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
