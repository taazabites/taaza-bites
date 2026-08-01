import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2, Package, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/primitives';

interface WelcomeJourneyProps {
  userName: string;
  onComplete: () => void;
  subscriptionPlan: string;
}

export default function WelcomeJourney({ userName, onComplete, subscriptionPlan }: WelcomeJourneyProps) {
  const [step, setStep] = useState(1);

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const steps = [
    {
      id: 1,
      title: `Hi ${userName} 👋`,
      subtitle: "Welcome to Taaza Bites",
      description: "Let's begin your transformation.",
      icon: <Sparkles className="w-12 h-12 text-emerald-500" />
    },
    {
      id: 2,
      title: "Your Subscription",
      subtitle: "Active & Ready",
      description: `You are enrolled in the ${subscriptionPlan || 'Premium'} plan. Designed to fuel your daily performance.`,
      icon: <ShieldCheck className="w-12 h-12 text-emerald-500" />
    },
    {
      id: 3,
      title: "Nutrition Program",
      subtitle: "Personalized for you",
      description: "Every meal is calibrated to your macros. We track calories, protein, and your daily goals.",
      icon: <Activity className="w-12 h-12 text-emerald-500" />
    },
    {
      id: 4,
      title: "Delivery Schedule",
      subtitle: "Fresh to your door",
      description: "We deliver your meals fresh daily. You can track live status, pause, or reschedule anytime.",
      icon: <Package className="w-12 h-12 text-emerald-500" />
    }
  ];

  const currentStep = steps.find(s => s.id === step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md w-full flex flex-col items-center text-center space-y-8"
        >
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-white/5 w-full">
            <div className="w-24 h-24 mx-auto bg-emerald-50 dark:bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mb-8 rotate-3">
              {currentStep?.icon}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight mb-2">
              {currentStep?.title}
            </h1>
            <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-4">
              {currentStep?.subtitle}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm sm:text-base leading-relaxed max-w-[280px] mx-auto mb-10">
              {currentStep?.description}
            </p>

            <div className="flex flex-col gap-4">
              <Button 
                onClick={nextStep}
                className="h-14 rounded-2xl bg-zinc-950 hover:bg-emerald-600 dark:bg-white dark:text-zinc-950 dark:hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
              >
                {step === 4 ? "Enter Transformation Hub" : "Continue"} 
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center justify-center gap-2 mt-4">
                {steps.map((s) => (
                  <div 
                    key={s.id} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${step === s.id ? 'w-8 bg-emerald-500' : 'w-2 bg-zinc-200 dark:bg-zinc-800'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
