import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Clock, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const FAQ_DATA = [
  {
    question: "Which areas in Bengaluru do you cover?",
    answer: "We currently deliver to Koramangala, Indiranagar, HSR Layout, Whitefield, Bellandur, and Marathahalli. We are expanding rapidly to other zones!",
    icon: MapPin
  },
  {
    question: "What are your delivery time slots?",
    answer: "We offer three primary delivery windows: Breakfast (7:30 AM - 9:00 AM), Lunch (12:00 PM - 1:30 PM), and Dinner (7:00 PM - 8:30 PM).",
    icon: Clock
  },
  {
    question: "Is the food prepared fresh?",
    answer: "Yes, every single meal is prepared fresh in our central kitchen just hours before delivery to ensure maximum nutrient density and taste.",
    icon: Zap
  },
  {
    question: "Can I trust the quality of ingredients?",
    answer: "We use only premium, locally sourced ingredients with zero preservatives or MSG. Our kitchen follows strict hygiene protocols.",
    icon: ShieldCheck
  }
];

export const LocalCoverageFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {FAQ_DATA.map((item, index) => (
        <div 
          key={index}
          className={cn(
            "rounded-3xl border transition-all duration-300 overflow-hidden",
            openIndex === index 
              ? "bg-emerald-50/50 border-emerald-200 shadow-sm" 
              : "bg-white border-zinc-100 hover:border-zinc-200"
          )}
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-5 flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                openIndex === index ? "bg-emerald-500 text-white" : "bg-zinc-50 text-zinc-400 group-hover:text-zinc-600"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-zinc-900">{item.question}</span>
            </div>
            <ChevronDown className={cn(
              "w-5 h-5 text-zinc-400 transition-transform duration-300",
              openIndex === index && "rotate-180 text-emerald-500"
            )} />
          </button>
          
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-16 pb-6 text-zinc-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
