import React from "react";
import { motion } from "framer-motion";
import { Brain, Heart, Battery } from "lucide-react";

export default function PhilosophyPremium() {
  return (
    <section className="py-24 md:py-32 bg-zinc-50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 mb-8">
          Eat Good.<br />
          <span className="text-emerald-600">Feel Good.</span>
        </h2>
        <p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed mb-16">
          What you eat every day makes a huge difference in how you feel. We make it easy to eat well without the hassle of cooking and cleaning. Taste the difference with our fresh, home-style meals.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Battery,
            title: "More Energy",
            desc: "Stay active all day without feeling tired after lunch. Our meals are perfectly balanced to keep you going."
          },
          {
            icon: Brain,
            title: "Better Focus",
            desc: "Nutritious food helps keep your mind sharp and clear, whether you are at work or spending time with family."
          },
          {
            icon: Heart,
            title: "Healthy Heart",
            desc: "No artificial stuff or extra sugars. Just honest, good food cooked with care to keep your heart healthy."
          }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-zinc-900 mb-3">{feature.title}</h3>
            <p className="text-zinc-500 font-medium leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
