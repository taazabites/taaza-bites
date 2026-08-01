import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Sparkles, Heart, Clock, Target, ChefHat, 
  ArrowRight, ShieldCheck, CheckCircle2, 
  ChevronRight, Activity, Zap
} from "lucide-react";
import { Button } from "../components/ui/primitives";

const STEPS = [
  {
    id: "welcome",
    title: "The Awakening",
    subtitle: "Your journey to optimal metabolic health begins now.",
    icon: <Sparkles className="w-12 h-12 text-emerald-500" />,
    color: "from-emerald-500/20 to-emerald-500/5",
    content: (
      <div className="space-y-6">
        <p className="text-zinc-400 text-lg font-medium leading-relaxed">
          You've just taken the most significant step toward a better version of yourself. 
          TaazaBites isn't just a meal service; it's a precision biological intervention.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-2xl font-black text-white">100%</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Natural</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-2xl font-black text-white">AI</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Optimized</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "nutrition",
    title: "Personalized Engine",
    subtitle: "Every macro-nutrient has been calculated for your DNA profile.",
    icon: <Activity className="w-12 h-12 text-blue-500" />,
    color: "from-blue-500/20 to-blue-500/5",
    content: (
      <div className="space-y-6">
        <p className="text-zinc-400 text-lg font-medium leading-relaxed">
          Our AI nutrition engine analyzes your metabolic rate to craft the perfect caloric ratio.
        </p>
        <ul className="space-y-4">
          {[
            "Dynamic Macro Adjustments",
            "Low-Glycemic Index Focus",
            "Bio-available Proteins"
          ].map(item => (
            <li key={item} className="flex items-center gap-3 text-zinc-200 font-bold">
              <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
              </div>
              {item}
            </li>
          ))}
        </ul>
      </div>
    )
  },
  {
    id: "chef",
    title: "Culinary Craft",
    subtitle: "Meet the artisans behind your transformation.",
    icon: <ChefHat className="w-12 h-12 text-amber-500" />,
    color: "from-amber-500/20 to-amber-500/5",
    content: (
      <div className="space-y-6">
        <p className="text-zinc-400 text-lg font-medium leading-relaxed">
          Each meal is prepared fresh in our state-of-the-art kitchen by chefs who specialize in metabolic cooking.
        </p>
        <div className="p-6 bg-zinc-900 rounded-3xl border border-white/5 flex gap-4 items-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
             <img 
               src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fm=webp&fit=crop&q=80&w=150" 
               alt="Chef" 
               className="w-full h-full object-cover" 
               referrerPolicy="no-referrer" 
               loading="lazy"
             />
          </div>
          <div>
            <p className="text-white font-black">Chef Arjan Singh</p>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Head of Culinary Science</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "delivery",
    title: "Precision Logistics",
    subtitle: "Your meals arrive in their optimal state.",
    icon: <Clock className="w-12 h-12 text-rose-500" />,
    color: "from-rose-500/20 to-rose-500/5",
    content: (
      <div className="space-y-6">
        <p className="text-zinc-400 text-lg font-medium leading-relaxed">
          Our cold-chain delivery network ensures temperature control from kitchen to table.
        </p>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.2em]">
            <span className="text-zinc-500">Cooked</span>
            <span className="text-zinc-500">Dispatched</span>
            <span className="text-white">Arriving</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: "0%" }}
               animate={{ width: "80%" }}
               transition={{ duration: 2, ease: "easeInOut" }}
               className="h-full bg-rose-500"
             />
          </div>
        </div>
      </div>
    )
  },
  {
    id: "goals",
    title: "The Destination",
    subtitle: "Let's manifest your desired outcomes.",
    icon: <Target className="w-12 h-12 text-indigo-500" />,
    color: "from-indigo-500/20 to-indigo-500/5",
    content: (
      <div className="space-y-6">
        <p className="text-zinc-400 text-lg font-medium leading-relaxed">
          Over the next few weeks, you will experience increased cognitive clarity, sustained energy levels, and metabolic flexibility.
        </p>
        <div className="flex gap-3">
          <div className="flex-1 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-center">
            <Zap className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Energy Boost</p>
          </div>
          <div className="flex-1 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-center">
            <Heart className="w-6 h-6 text-rose-400 mx-auto mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Vitals Check</p>
          </div>
        </div>
      </div>
    )
  }
];

export default function WelcomeJourney() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (currentUser) {
        localStorage.setItem(`taaza_journey_v2_seen_${currentUser.uid}`, 'true');
      }
      navigate("/dashboard");
    }
  };

  const step = STEPS[currentStep];

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 relative overflow-x-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="bg-zinc-900/50 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-8 md:p-12 shadow-2xl overflow-hidden relative">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              className="h-full bg-emerald-500"
            />
          </div>

          <div className="flex flex-col items-center text-center space-y-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-6 rounded-[2rem] bg-gradient-to-br ${step.color} border border-white/10`}
            >
              {step.icon}
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tightest leading-none">
                {step.title}
              </h2>
              <p className="text-zinc-500 font-medium text-lg max-w-md mx-auto">
                {step.subtitle}
              </p>
            </div>

            <div className="w-full text-left py-4">
              {step.content}
            </div>

            <div className="w-full flex items-center gap-4 pt-4">
              <div className="flex-1 flex gap-1.5">
                {STEPS.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${idx <= currentStep ? "bg-emerald-500" : "bg-zinc-800"}`} 
                  />
                ))}
              </div>
              <Button 
                onClick={next}
                className="h-14 sm:h-16 px-5 sm:px-8 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 font-black text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-xl transition-all flex items-center gap-2 group shrink-0"
              >
                <span className="hidden sm:inline">{currentStep === STEPS.length - 1 ? "Enter Transformation Hub" : "Continue"}</span>
                <span className="sm:hidden">{currentStep === STEPS.length - 1 ? "Enter Hub" : "Next"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" /> Encrypted Profile
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-3 h-3" /> Bio-Feedback Ready
          </div>
        </div>
      </motion.div>
    </main>
  );
}
