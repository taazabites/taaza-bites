import React from 'react';
import { motion } from 'framer-motion';
import { Users, Home, Gift, ArrowRight, Building2, Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const specializedPlans = [
  {
    id: "corporate",
    title: "Corporate Wellness",
    desc: "Boost employee productivity with healthy team lunches. Tax-saving benefits for your company.",
    icon: Building2,
    color: "from-blue-600 to-indigo-700",
    features: ["Bulk Discounting", "Monthly Invoicing", "Wellness Webinars", "Dedicated Account Manager"],
    cta: "Contact Sales"
  },
  {
    id: "family",
    title: "Family Bundle",
    desc: "Clean eating for the whole household. Customize meals for parents, kids, and seniors.",
    icon: Home,
    color: "from-emerald-600 to-teal-700",
    features: ["Up to 4 Members", "Diverse Macro Profiles", "Shared Delivery Window", "15% Combo Savings"],
    cta: "Start Family Plan",
    link: "/health-assessment"
  },
  {
    id: "gift",
    title: "Gift a Subscription",
    desc: "Give the gift of health to your loved ones. Perfect for birthdays, recovery, or new parents.",
    icon: Gift,
    color: "from-purple-600 to-pink-700",
    features: ["Flexible Duration", "Custom Message", "Digital Gift Card", "Instant Activation"],
    cta: "Gift Now",
    link: "/plans"
  }
];

export default function SpecializedPlans() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-zinc-950 overflow-hidden relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-emerald-400 font-black uppercase tracking-widest text-xs">Specialized Solutions</span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mt-4 mb-4">
            Tailored for <span className="text-emerald-400">Everyone</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
            Beyond individual plans, we offer comprehensive nutrition solutions for teams, families, and gifting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {specializedPlans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 hover:border-zinc-700 transition-all duration-500 overflow-hidden flex flex-col h-full"
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                  plan.color
                )} />
                
                <div className="relative z-10 mb-8">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg mb-6",
                        plan.color
                    )}>
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight mb-4">{plan.title}</h3>
                    <p className="text-zinc-400 font-medium leading-relaxed">{plan.desc}</p>
                </div>

                <ul className="relative z-10 space-y-4 mb-10 flex-grow">
                    {plan.features.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                            <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="text-sm font-bold text-zinc-300">{f}</span>
                        </li>
                    ))}
                </ul>

                <button 
                  onClick={() => plan.link ? navigate(plan.link) : null}
                  className="relative z-10 w-full py-4 bg-white hover:bg-zinc-100 text-zinc-900 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                    {plan.cta} <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { cn } from '../../lib/utils';
