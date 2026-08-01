import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Zap, Shield, HeartPulse } from 'lucide-react';

export default function LongevityTimeline() {
  const steps = [
    {
      time: "Day 1-3",
      title: "Glycemic Stability",
      desc: "Removal of inflammatory oils and processed sugars leads to immediate blood sugar stabilization.",
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: "bg-amber-400/10"
    },
    {
      time: "Week 1",
      title: "Metabolic Switch",
      desc: "Improved insulin sensitivity. Reduced water retention and bloating through sodium-potassium balancing.",
      icon: <HeartPulse className="w-5 h-5 text-emerald-400" />,
      color: "bg-emerald-400/10"
    },
    {
      time: "Month 1",
      title: "Cellular Repair",
      desc: "High phytonutrient density triggers autophagy and reduces markers of oxidative stress (CRP).",
      icon: <Shield className="w-5 h-5 text-blue-400" />,
      color: "bg-blue-400/10"
    },
    {
      time: "Continuous",
      title: "Optimal Longevity",
      desc: "Sustained nutrient precision maintains biological age markers and peak cognitive function.",
      icon: <Clock className="w-5 h-5 text-rose-400" />,
      color: "bg-rose-400/10"
    }
  ];

  return (
    <section className="py-24 bg-zinc-950 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block"
          >
            The Biological Journey
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tightest mb-6"
          >
            Your Body on the <br />
            <span className="text-emerald-500">Protocol.</span>
          </motion.h2>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-zinc-800 md:-translate-x-1/2" />

          <div className="space-y-24">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col md:flex-row items-start md:items-center gap-12 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="flex-1 w-full text-left md:text-right">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${step.color} mb-4`}>
                    <span className="text-xs font-black uppercase tracking-widest text-white">{step.time}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight">{step.title}</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed max-w-md ml-auto mr-0 md:mr-auto">
                    {step.desc}
                  </p>
                </div>

                <div className="relative z-10 w-16 h-16 rounded-full bg-zinc-900 border-4 border-zinc-950 shadow-[0_0_40px_rgba(16,185,129,0.2)] flex items-center justify-center shrink-0">
                  {step.icon}
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    className="absolute inset-0 rounded-full border border-emerald-500/50 scale-125"
                  />
                </div>

                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-32 p-12 rounded-[3rem] bg-gradient-to-br from-emerald-500 to-teal-600 text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <h3 className="text-3xl md:text-4xl font-black text-white mb-6 relative z-10 tracking-tight">Ready to optimize your biology?</h3>
          <p className="text-emerald-50 font-medium mb-10 relative z-10 max-w-xl mx-auto">
            Join 15,000+ high-performers in Bengaluru who have switched to medical-grade nutrition.
          </p>
          <button className="h-16 px-12 bg-white text-emerald-600 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl relative z-10 cursor-pointer">
            Start Your Protocol
          </button>
        </motion.div>
      </div>
    </section>
  );
}
