import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UtensilsCrossed, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { Image } from '../ui/Image';

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "FSSAI Certified",
    desc: "Our kitchens adhere to the highest safety and hygiene standards set by the Indian government.",
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    icon: UtensilsCrossed,
    title: "Clinical Hygiene",
    desc: "Surgical-grade sanitation protocols with mandatory masks, hairnets, and frequent lab testing.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: Users,
    title: "Expert Team",
    desc: "Led by 5-star hotel executive chefs and clinical nutritionists with 10+ years of experience.",
    color: "bg-amber-50 text-amber-600"
  },
  {
    icon: Sparkles,
    title: "Zero Seed Oils",
    desc: "We only use premium cold-pressed oils, organic ghee, and butter. No industrial shortcuts.",
    color: "bg-pink-50 text-pink-600"
  }
];

export default function TrustSection() {
  return (
    <section className="py-24 bg-white overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual Side */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <motion.div 
                   whileHover={{ y: -5 }}
                   className="rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl shadow-emerald-900/10"
                >
                  <Image 
                    src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600" 
                    alt="Professional Kitchen" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white">
                  <h4 className="text-3xl font-black mb-2">99.8%</h4>
                  <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Hygiene Score</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-between aspect-square">
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                  <div>
                    <h4 className="text-xl font-bold mb-1">FSSAI License</h4>
                    <p className="text-xs text-zinc-400 font-medium italic">#11222033001245</p>
                  </div>
                </div>
                <motion.div 
                   whileHover={{ y: -5 }}
                   className="rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl shadow-blue-900/10"
                >
                  <Image 
                    src="https://images.unsplash.com/photo-1577100078279-b3445dee847a?auto=format&fit=crop&q=80&w=600" 
                    alt="Chef at Work" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </div>
            {/* Trust Badge Floating */}
            <div className="absolute -bottom-6 -right-6 md:right-10 bg-white p-6 rounded-3xl shadow-2xl border border-zinc-100 flex items-center gap-4 z-20">
               <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                 <CheckCircle2 className="w-6 h-6 text-emerald-600" />
               </div>
               <div>
                 <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Audited By</p>
                 <p className="text-lg font-black text-zinc-900">SGS Global</p>
               </div>
            </div>
          </div>

          {/* Content Side */}
          <div>
            <span className="text-emerald-600 font-black uppercase tracking-[0.3em] text-xs mb-4 block">Trust & Quality</span>
            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tighter mb-6 leading-[1.1]">
              A kitchen built on <span className="text-emerald-600">Absolute Trust.</span>
            </h2>
            <p className="text-lg text-zinc-600 font-medium mb-12 max-w-xl">
              We aren't just a food delivery company. We are a clinical-grade kitchen committed to the long-term metabolic health of Bengaluru.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {TRUST_POINTS.map((point, i) => (
                <div key={i} className="group">
                  <div className={`w-12 h-12 rounded-2xl ${point.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <point.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-zinc-900 mb-2">{point.title}</h4>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed">{point.desc}</p>
                </div>
              ))}
            </div>

            {/* Team Members Section */}
            <div className="border-t border-zinc-100 pt-12">
               <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-8">The Protocol Architects</h4>
               <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "Dr. Ananya Sen", role: "Chief Nutritionist", img: "https://images.unsplash.com/photo-1594824464562-0608356a955a?auto=format&fit=crop&q=80&w=200" },
                    { name: "Chef Kabir", role: "Executive Chef", img: "https://images.unsplash.com/photo-1583394238235-941e998f37f1?auto=format&fit=crop&q=80&w=200" },
                    { name: "Arjun & Team", role: "Logistics Expert", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200" }
                  ].map((member, i) => (
                    <div key={i} className="text-center">
                       <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden border-2 border-zinc-100 mb-3 grayscale hover:grayscale-0 transition-all duration-500">
                          <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                       </div>
                       <p className="text-[11px] font-black text-zinc-900 leading-tight">{member.name}</p>
                       <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{member.role}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
