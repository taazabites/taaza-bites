import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className={cn(
          "border transition-all duration-300 rounded-2xl overflow-hidden bg-white",
          openIndex === index ? "border-emerald-500/40 shadow-md ring-1 ring-emerald-500/5" : "border-zinc-200"
        )}>
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-6 text-left cursor-pointer group"
          >
            <span className={cn(
              "font-black text-sm tracking-tight transition-colors duration-300",
              openIndex === index ? "text-emerald-700" : "text-zinc-900 group-hover:text-emerald-600"
            )}>{item.question}</span>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-zinc-500 transition-transform duration-300",
                openIndex === index && "rotate-180 text-emerald-600"
              )}
            />
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="p-6 pt-0 text-zinc-600 leading-relaxed">
                  {item.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
