import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, HelpCircle, ArrowRight } from 'lucide-react';
import { useDebounce } from '@/src/hooks/useDebounce';

const faqs = [
  {
    category: "Subscription",
    q: "How does the membership work?",
    a: "Taaza Bites is a recurring subscription. Once you complete your health assessment and choose a plan, our chefs prepare meals tailored to your goals. Meals are delivered fresh every morning before 7:00 AM."
  },
  {
    category: "Delivery",
    q: "What time do you deliver?",
    a: "We deliver every day between 4:00 AM and 7:00 AM. Our logistics team ensures that your meals are waiting at your doorstep when you wake up."
  },
  {
    category: "Nutrition",
    q: "Are the meals organic?",
    a: "We prioritize farm-fresh, seasonal ingredients. While not everything is certified organic, we work directly with partner farms that follow sustainable, chemical-free practices."
  },
  {
    category: "Payments",
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI, and net banking through our secure payment partner, Razorpay."
  },
  {
    category: "Technical",
    q: "Can I manage everything via the app?",
    a: "Yes! Our web and mobile apps allow you to pause your plan, swap meals, track your macros, and contact support with a single tap."
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
    faq.a.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-20 sm:pt-24 pb-20">
        {/* Hero Section */}
        <section className="px-6 py-20 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-6">
              Help Center
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-950 mb-8 max-w-4xl mx-auto leading-[0.85]">
              Got questions? <br/> We've got <span className="text-emerald-600">Answers</span>.
            </h1>
            
            <div className="relative max-w-2xl mx-auto mt-12">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-400" />
              <input 
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-20 rounded-[2rem] bg-zinc-50 border border-zinc-100 px-16 text-lg font-medium focus:border-emerald-500 transition-all outline-none"
              />
            </div>
          </motion.div>
        </section>

        {/* FAQ List */}
        <section className="px-6 py-20 max-w-4xl mx-auto mb-40">
          <div className="space-y-4">
            {filteredFaqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-3xl border border-zinc-100 overflow-hidden bg-white hover:border-emerald-500 transition-colors"
              >
                <button 
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  className="w-full p-8 text-left flex items-center justify-between gap-6"
                >
                  <span className="text-xl font-black text-zinc-950 tracking-tight">{faq.q}</span>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${expandedIndex === i ? 'bg-emerald-600 text-white' : 'bg-zinc-50 text-zinc-400'}`}>
                    {expandedIndex === i ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="px-8 pb-8 text-zinc-500 leading-relaxed text-lg border-t border-zinc-50 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-zinc-50 py-32 px-6 border-y border-zinc-100 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="h-20 w-20 rounded-[2.5rem] bg-white border border-zinc-100 flex items-center justify-center mx-auto mb-8 shadow-sm">
              <HelpCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-zinc-950 mb-6">Still have questions?</h2>
            <p className="text-zinc-500 text-lg mb-10 leading-relaxed">
              Our support team is obsessed with metabolic health and here to help you every step of the way.
            </p>
            <button onClick={() => navigate('/contact')} className="h-16 px-10 rounded-full bg-zinc-950 text-white font-bold flex items-center justify-center gap-2 mx-auto hover:bg-emerald-600 transition-colors cursor-pointer">
              Contact Support <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
