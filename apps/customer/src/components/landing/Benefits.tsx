import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Sparkles, Brain } from 'lucide-react';

export default function Benefits() {
  const benefits = [
    {
      icon: Brain,
      title: "Eliminate Midday Slump",
      desc: "Our low-glycemic meal formulations prevent the classic insulin spike-and-crash cycle, keeping your cognitive focus sharp all day.",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100"
    },
    {
      icon: Heart,
      title: "Optimized Gut Health",
      desc: "Fiber-rich complex carbohydrates paired with active prebiotics support a diverse microbiome for effortless digestion and robust energy.",
      color: "text-amber-600 bg-amber-50 border-amber-100"
    },
    {
      icon: ShieldCheck,
      title: "100% Clean Sourcing",
      desc: "Strictly zero preservatives, zero hidden vegetable oils, and zero refined sugars. Only cold-pressed oils and organic farm produce.",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100"
    },
    {
      icon: Sparkles,
      title: "Chef-Crafted Gastronomy",
      desc: "Who said healthy food must taste bland? Our premium culinary team blends rich Indian spices with gourmet global techniques.",
      color: "text-amber-600 bg-amber-50 border-amber-100"
    }
  ];

  return (
    <section className="py-24 bg-white border-t border-zinc-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-black uppercase tracking-widest text-xs px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">Biological Benefits</span>
          <h2 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tighter mt-4 mb-4">
            How TaazaBites <span className="text-emerald-600">Upgrades Your Life</span>
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto font-medium">
            We are not just a food delivery service. We are a metabolic performance system designed for high-performing individuals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex gap-6 p-8 rounded-[2rem] border border-zinc-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 bg-zinc-50/50"
            >
              <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center border shadow-sm ${b.color}`}>
                <b.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-950 mb-2">{b.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
