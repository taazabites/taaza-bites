import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: "How does the delivery schedule work?",
    answer: "We deliver fresh meals every morning between 7:00 AM and 9:00 AM across Bengaluru. Your meal arrives in insulated, tamper-proof packaging designed to keep ingredients in peak fresh condition."
  },
  {
    question: "Can I pause my subscription or skip specific days?",
    answer: "Yes, absolutely! You have 100% control over your calendar. You can pause or skip specific meals directly from your Dashboard up to 24 hours in advance. Skipped meals are added back to your balance—they never expire."
  },
  {
    question: "Are the meals customized for allergies or diet preferences?",
    answer: "Yes. During checkout and onboarding, you can specify your diet profile (Veg, Egg, Non-Veg) and health goals. You can also log active allergies and medical conditions in your health assessment so we can screen ingredients appropriately."
  },
  {
    question: "Which areas in Bengaluru do you serve?",
    answer: "We serve almost all major tech hubs and residential areas in Bengaluru, including HSR Layout, Koramangala, Indiranagar, Whitefield, Bellandur, Marathahalli, Jayanagar, and Electronic City. You can enter your PIN code in our delivery area checker to confirm instantly."
  },
  {
    question: "How are the nutritional values verified?",
    answer: "Every single dish is analyzed and calculated using verified clinical databases. Our certified, in-house clinical nutritionists verify all protein, fat, fiber, and carbohydrate macros before a recipe enters production."
  }
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white border-t border-zinc-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-black uppercase tracking-widest text-xs px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">Got Questions?</span>
          <h2 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tighter mt-4 mb-4">
            Frequently Asked <span className="text-emerald-600">Questions</span>
          </h2>
          <p className="text-lg text-zinc-600 max-w-xl mx-auto font-medium">
            Everything you need to know about our daily meals, scheduling, and metabolic methodology.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-zinc-200/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center py-5 px-6 bg-zinc-50 hover:bg-zinc-100/50 text-left cursor-pointer transition-colors"
                >
                  <span className="font-bold text-zinc-900 pr-4 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    {faq.question}
                  </span>
                  <span className="shrink-0 text-zinc-400 bg-white border border-zinc-200 p-1 rounded-full">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-white border-t border-zinc-100"
                    >
                      <div className="p-6 text-zinc-600 text-sm leading-relaxed font-medium">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
