import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const comparisonData = [
  { feature: "Macro-Calculated Meals", taaza: true, others: "Rarely" },
  { feature: "Zero Seed Oils (Cold-Pressed Only)", taaza: true, others: "No" },
  { feature: "Chef-Curated Gourmet Taste", taaza: true, others: "Variable" },
  { feature: "FSSAI Certified Kitchen", taaza: true, others: "Most" },
  { feature: "Custom Nutritionist Consultation", taaza: true, others: "Extra Cost" },
  { feature: "Punctual Doorstep Delivery", taaza: true, others: "Inconsistent" },
  { feature: "Flexible Pause/Skip Anytime", taaza: true, others: "Restrictive" },
];

export default function ComparisonTable() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-black uppercase tracking-widest text-xs">Why Choose Us</span>
          <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter mt-4">
            The TaazaBites <span className="text-emerald-600">Edge</span>
          </h2>
          <p className="text-lg text-zinc-500 mt-4 max-w-2xl mx-auto font-medium">
            We don't just deliver food; we deliver precise nutrition designed for your goals.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="py-8 px-6 text-left text-zinc-400 font-black uppercase tracking-widest text-xs border-b border-zinc-100">Features</th>
                <th className="py-8 px-6 text-center border-b-4 border-emerald-500 bg-emerald-50/30 rounded-t-3xl">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-emerald-600 font-black text-xl tracking-tighter">TaazaBites</span>
                    <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Recommended</span>
                  </div>
                </th>
                <th className="py-8 px-6 text-center text-zinc-400 font-black text-xl tracking-tighter border-b border-zinc-100">Local Tiffins</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item, i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <td className="py-6 px-6 text-zinc-700 font-bold border-b border-zinc-50 group-hover:bg-zinc-50 transition-colors">
                    {item.feature}
                  </td>
                  <td className="py-6 px-6 text-center border-b border-zinc-50 bg-emerald-50/20">
                    <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Check className="w-5 h-5 text-white" />
                        </div>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center border-b border-zinc-50">
                    <span className="text-zinc-400 font-medium italic">{item.others}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-12 p-8 bg-zinc-950 rounded-[3rem] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left">
                    <h3 className="text-2xl font-black text-white tracking-tight">Ready to start your transformation?</h3>
                    <p className="text-zinc-400 font-medium">Join 15,000+ happy customers in Bengaluru today.</p>
                </div>
                <button className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-2xl shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer">
                    Start Your Trial Now
                </button>
            </div>
        </div>
      </div>
    </section>
  );
}
