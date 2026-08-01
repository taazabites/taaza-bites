import { motion } from 'framer-motion';
import { Leaf, Dumbbell, Flame, Truck, Package, Heart } from 'lucide-react';

const features = [
  { icon: Leaf, title: 'Fresh Ingredients', desc: 'Sourced daily from local farmers for peak freshness.' },
  { icon: Dumbbell, title: 'High Protein', desc: 'Optimized macro profiles for muscle recovery.' },
  { icon: Flame, title: 'Calorie Controlled', desc: 'Precisely measured calories for your goals.' },
  { icon: Truck, title: 'Daily Delivery', desc: 'Freshly prepared meals at your door.' },
  { icon: Package, title: 'Flexible Plans', desc: 'Pause, swap, or customize effortlessly.' },
  { icon: Heart, title: 'Expert Nutrition', desc: 'Nutritionist-designed guidance for success.' },
];

export default function WhyUs() {
  return (
    <section className="py-24 bg-zinc-50">
      <div className="container mx-auto px-6">
        <h2 className="text-5xl font-black text-center mb-20 text-zinc-950 tracking-tighter">Why TaazaBites?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-10 rounded-[2.5rem] border border-zinc-200 bg-white hover:border-emerald-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                <feature.icon className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-zinc-950">{feature.title}</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
