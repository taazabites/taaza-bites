import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const quotes = [
  "Small steps every day lead to big changes in health.",
  "Your body is your home; nourish it with love and good food.",
  "Wellness is a journey, not a destination.",
  "Eating well is a form of self-respect.",
  "Take time to nourish your mind, body, and soul."
];

export default function DailyAffirmationWidget({ isDark }: { isDark: boolean }) {
  const [quote, setQuote] = useState('');

  const getRandomQuote = () => {
    let newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    while (newQuote === quote && quotes.length > 1) {
      newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    }
    setQuote(newQuote);
  };

  useEffect(() => {
    getRandomQuote();
  }, []);

  return (
    <div
      onClick={getRandomQuote}
      className={`p-6 rounded-[2rem] border relative overflow-hidden group cursor-pointer transition-all ${
        isDark
          ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-100 hover:border-emerald-500/40"
          : "bg-emerald-50/50 border-emerald-100/50 text-emerald-900 hover:border-emerald-200"
      }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform" />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Daily Affirmation</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={quote}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg sm:text-xl font-bold font-serif leading-snug"
          >
            "{quote}"
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
