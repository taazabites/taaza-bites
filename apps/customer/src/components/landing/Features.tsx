import { motion } from 'framer-motion';
import { Leaf, Truck, Shield, Clock } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Leaf,
      title: "100% Fresh Ingredients",
      description: "We use only the best, freshest ingredients delivered daily from local farms straight to our kitchen.",
      color: "from-emerald-400 to-emerald-600",
      stats: "Farm Fresh",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Hot and fresh food delivered right to your door when you want it, anywhere in Bengaluru.",
      color: "from-blue-400 to-blue-600",
      stats: "On Time",
    },
    {
      icon: Shield,
      title: "Healthy & Tasty",
      description: "Our chefs make sure every meal is healthy, packed with nutrients, and tastes absolutely amazing.",
      color: "from-purple-400 to-purple-600",
      stats: "Chef Approved",
    },
    {
      icon: Clock,
      title: "Flexible Subscriptions",
      description: "Pause, skip, or cancel anytime. You are always in control of your plan with no hidden rules.",
      color: "from-orange-400 to-orange-600",
      stats: "100% Flexible",
    },
  ];

  return (
    <section className="py-24 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-4 block">The Taaza Advantage</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Why Bengaluru Loves <span className="text-emerald-600">Taaza Bites</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium px-4">
            We make healthy eating easy, delicious, and convenient for your busy lifestyle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group relative bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 border border-slate-100"
            >
              {/* Icon with Gradient */}
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 md:mb-4 leading-tight">{feature.title}</h3>
              <p className="text-slate-500 mb-6 md:mb-8 font-medium leading-relaxed text-sm md:text-base">{feature.description}</p>
              
              {/* Stats Badge */}
              <div className="inline-flex items-center gap-2 md:gap-3 bg-slate-50 px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-slate-700 border border-slate-100">
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                {feature.stats}
              </div>

              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:bg-emerald-50 transition-colors -z-10"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
