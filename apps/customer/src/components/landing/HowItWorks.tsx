import { motion } from 'framer-motion';
import { Target, ClipboardList, Zap, Truck } from 'lucide-react';

const steps = [
  {
    icon: Target,
    title: "Choose Goal",
    desc: "Tell us your fitness objective—Weight Loss, Muscle Gain, or Healthy Maintenance."
  },
  {
    icon: ClipboardList,
    title: "Get Diet Plan",
    desc: "Our AI nutritionist designs a precise macro-blueprint tailored to your metabolic needs."
  },
  {
    icon: Zap,
    title: "Subscribe",
    desc: "Pick a plan that fits your schedule. Pause or skip meals anytime with zero hassle."
  },
  {
    icon: Truck,
    title: "Daily Delivery",
    desc: "Fresh, hot, and healthy meals delivered at your doorstep, exactly when you need them."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tighter mb-4">How It Works</h2>
            <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto px-4">Getting healthy has never been this simple. Four easy steps to a happier you.</p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-1 bg-emerald-50 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border-4 border-emerald-50 flex items-center justify-center shadow-lg md:shadow-xl mb-6 md:mb-8 group-hover:scale-110 group-hover:border-emerald-200 transition-all duration-300 relative bg-white">
                    <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs md:text-sm shadow-lg">
                        {i + 1}
                    </div>
                    <step.icon className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-zinc-950 mb-3 tracking-tight">{step.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed px-4 md:px-0 text-sm md:text-base">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
