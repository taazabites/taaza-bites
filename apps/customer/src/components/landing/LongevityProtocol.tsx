import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Heart, Utensils, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LongevityProtocol() {
  const navigate = useNavigate();

  const protocols = [
    {
      id: 'metabolic',
      name: 'Metabolic Optimization',
      desc: 'Focused on glycemic control and insulin sensitivity.',
      tag: 'Most Popular',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/10 to-orange-500/10',
      borderColor: 'border-amber-200'
    },
    {
      id: 'performance',
      name: 'Athletic Performance',
      desc: 'High protein pacing for muscle protein synthesis.',
      tag: 'High Protein',
      icon: <Utensils className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'longevity',
      name: 'Longevity Foundations',
      desc: 'Anti-inflammatory whole foods for cellular repair.',
      tag: 'Science Backed',
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      color: 'from-rose-500/10 to-red-500/10',
      borderColor: 'border-rose-200'
    }
  ];

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-emerald-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block"
          >
            The Protocol System
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tighter mb-6"
          >
            Not just meals. <br className="hidden md:block" /> 
            <span className="text-emerald-600">Bio-Hacking</span> through Nutrition.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 text-lg font-medium max-w-2xl mx-auto"
          >
            Select your clinical objective. We handle the macro-precision, ingredient selection, and delivery logistics.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {protocols.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className={`p-8 rounded-[2.5rem] border ${p.borderColor} bg-gradient-to-br ${p.color} flex flex-col justify-between group transition-all cursor-pointer shadow-lg shadow-zinc-100 hover:shadow-2xl`}
              onClick={() => navigate('/plans')}
            >
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    {p.icon}
                  </div>
                  <span className="px-3 py-1 bg-white rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-950 shadow-sm">
                    {p.tag}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-zinc-950 mb-3 tracking-tight group-hover:text-emerald-600 transition-colors">
                  {p.name}
                </h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
                  {p.desc}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600">
                Start Protocol <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
           <div className="flex items-center gap-2">
             <ShieldCheck className="w-5 h-5 text-emerald-600" />
             <span className="text-[10px] font-black uppercase tracking-widest">Medical Grade Hygiene</span>
           </div>
           <div className="flex items-center gap-2">
             <Zap className="w-5 h-5 text-amber-500" />
             <span className="text-[10px] font-black uppercase tracking-widest">Precision Delivery</span>
           </div>
           <div className="flex items-center gap-2">
             <Heart className="w-5 h-5 text-rose-500" />
             <span className="text-[10px] font-black uppercase tracking-widest">Clinically Validated</span>
           </div>
        </div>
      </div>
    </section>
  );
}
