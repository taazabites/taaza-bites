import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Activity, Leaf, ShieldCheck, HeartPulse, MapPin, CheckCircle, Flame, Calculator, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/src/context/ToastContext";
import OptimizedImage from "../common/OptimizedImage";

export default function HeroPremium() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 15]);

  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  const [counter, setCounter] = useState(0);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  
  // Quick Metabolic Calculator state
  const [showCalc, setShowCalc] = useState(false);
  const [weight, setWeight] = useState(70);
  const [goal, setGoal] = useState<"weight_loss" | "muscle_gain" | "metabolic_health">("metabolic_health");

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => (prev < 15430 ? prev + 123 : 15430));
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length < 6) {
      showToast("Please enter a valid 6-digit Indian Pincode (e.g. 560001)", "warning");
      return;
    }
    setPincodeStatus("checking");
    setTimeout(() => {
      // Simulate checking service area
      setPincodeStatus("available");
      showToast(`Great news! Express 30-min morning delivery is active for ${pincode}`, "success");
    }, 600);
  };

  const getTargetProtein = () => {
    if (goal === "muscle_gain") return Math.round(weight * 2.0);
    if (goal === "weight_loss") return Math.round(weight * 1.8);
    return Math.round(weight * 1.5);
  };

  const getTargetCalories = () => {
    if (goal === "muscle_gain") return Math.round(weight * 32);
    if (goal === "weight_loss") return Math.round(weight * 22);
    return Math.round(weight * 26);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white text-zinc-950 pt-24 pb-12">
      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: `${p.x}%`, y: `${p.y}%` }}
            animate={{ 
              opacity: [0, 0.4, 0],
              y: [`${p.y}%`, `${p.y - 10}%`],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity, 
              delay: p.delay,
              ease: "linear" 
            }}
            className="absolute bg-emerald-500/20 rounded-full blur-[2px]"
            style={{ width: p.size, height: p.size }}
          />
        ))}
      </div>

      {/* Background Elements */}
      <motion.div 
        style={{ y: y1, opacity }}
        className="absolute top-0 left-0 w-full h-[120%] z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
        <OptimizedImage 
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fm=webp&fit=crop&q=80&w=2000" 
          alt="Premium Healthy Food" 
          className="w-full h-full object-cover blur-[1px] opacity-[0.12] scale-105"
          containerClassName="w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-white" />
      </motion.div>

      {/* Floating Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-24 w-80 h-80 bg-orange-400/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        <div className="flex-1 flex flex-col items-center lg:items-start pt-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-8">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> India's #1 Wellness Protocol
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2.75rem] sm:text-6xl md:text-8xl font-black tracking-tightest leading-[0.9] text-zinc-950 mb-8"
          >
            Invest in <br />
            <span className="text-emerald-600 relative inline-block">
              Your Health.
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute bottom-2 left-0 h-4 bg-emerald-100 -z-10" 
              />
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-zinc-500 font-medium max-w-lg mb-10 leading-relaxed"
          >
            Premium, science-backed meals engineered for peak performance and longevity. Freshly prepared, zero preservatives, delivered daily.
          </motion.p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10">
            <button 
              onClick={() => navigate('/plans')}
              className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 bg-zinc-950 text-white rounded-full font-black text-base sm:text-lg hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)] flex items-center justify-center gap-3 group cursor-pointer"
            >
              Build Your Protocol
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/health-assessment')}
              className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 bg-white text-zinc-900 border border-zinc-200 rounded-full font-black text-base sm:text-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm"
            >
              <HeartPulse className="w-5 h-5 text-emerald-600 animate-pulse" />
              Free Health Score
            </button>
          </div>

          {/* Instant Pincode Availability Bar */}
          <div className="w-full max-w-lg p-4 bg-zinc-50 border border-zinc-200 rounded-2xl mb-8">
            <form onSubmit={checkPincode} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input 
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setPincodeStatus("idle"); }}
                  placeholder="Enter Pincode (e.g. 560001)"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-zinc-200 text-sm font-semibold text-zinc-900 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <button 
                type="submit" 
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
              >
                {pincodeStatus === "checking" ? "Checking..." : "Check Delivery"}
              </button>
            </form>
            {pincodeStatus === "available" && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-2.5 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100/60 p-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Express 30-min morning delivery active for {pincode}! Free delivery included.</span>
              </motion.div>
            )}
          </div>

          {/* Quick Macro Calculator Toggle */}
          <div className="w-full max-w-lg">
            <button 
              onClick={() => setShowCalc(!showCalc)} 
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              {showCalc ? "Hide Quick Macro Target" : "Calculate My Daily Protein & Calories"}
            </button>

            {showCalc && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 p-5 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-left">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">Body Weight (kg)</label>
                    <input 
                      type="number" 
                      value={weight} 
                      onChange={e => setWeight(Number(e.target.value) || 60)} 
                      className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-xl font-bold text-sm text-zinc-900 outline-none focus:border-emerald-500" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">Primary Goal</label>
                    <select 
                      value={goal} 
                      onChange={e => setGoal(e.target.value as any)} 
                      className="w-full h-10 px-2 bg-white border border-zinc-200 rounded-xl font-bold text-xs text-zinc-900 outline-none focus:border-emerald-500"
                    >
                      <option value="metabolic_health">Metabolic Health</option>
                      <option value="muscle_gain">Muscle Building</option>
                      <option value="weight_loss">Fat Loss</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100">
                  <div>
                    <span className="text-[10px] uppercase font-black text-zinc-400 block">Recommended Target</span>
                    <span className="text-sm font-black text-zinc-900">{getTargetProtein()}g Protein / {getTargetCalories()} kcal</span>
                  </div>
                  <button 
                    onClick={() => navigate('/plans')} 
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    View Matching Plans
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Micro Stats */}
          <div className="mt-12 flex items-center gap-8 text-sm font-semibold text-zinc-400">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black text-zinc-900">{counter.toLocaleString()}+</span>
              <span className="uppercase tracking-widest text-[10px]">Active Members</span>
            </div>
            <div className="w-px h-8 bg-zinc-200" />
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black text-zinc-900">4.9/5</span>
              <span className="uppercase tracking-widest text-[10px]">Average Rating</span>
            </div>
          </div>
        </div>

        {/* Right side abstract/premium visual */}
        <div className="flex-1 relative w-full h-[300px] sm:h-[400px] md:h-[650px] block mt-8 lg:mt-0">
          <motion.div 
            style={{ y: y2, rotate }}
            className="absolute inset-0 z-10"
          >
            <OptimizedImage 
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fm=webp&fit=crop&q=80&w=800" 
              alt="Plated Meal"
              className="w-full h-full object-cover rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border-8 border-white"
              containerClassName="w-full h-full"
              priority
            />
          </motion.div>
          {/* Floating UI Elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -left-12 top-24 z-20 bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white hidden md:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Protein</p>
                <p className="text-sm font-black text-zinc-900">45g / meal</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute -right-8 bottom-32 z-20 bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Quality</p>
                <p className="text-sm font-black text-zinc-900">Lab Tested</p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

