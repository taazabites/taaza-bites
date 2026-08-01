import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ClipboardList, Utensils, Truck, Calendar, Sparkles } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Take the Assessment",
    description: "Start with our precision health audit. We analyze your BMI, metabolic rate, and lifestyle goals to define your baseline.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fm=webp&fit=crop&q=80&w=800"
  },
  {
    icon: Sparkles,
    title: "Personalized Protocol",
    description: "Our algorithm creates a 4-week rotating meal schedule optimized for your specific caloric and macro-nutrient needs.",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fm=webp&fit=crop&q=80&w=800"
  },
  {
    icon: Utensils,
    title: "Fresh Chef-Crafted Meals",
    description: "Our kitchens operate 24/7. Your meals are cooked from scratch using farm-to-table ingredients with zero refined oils.",
    image: "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fm=webp&fit=crop&q=80&w=800"
  },
  {
    icon: Truck,
    title: "Morning Doorstep Delivery",
    description: "Waking up to health. Your meals arrive in temperature-controlled, eco-friendly packaging before 7:00 AM daily.",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fm=webp&fit=crop&q=80&w=800"
  }
];

export default function HowItWorks() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-20 sm:pt-24 pb-20">
        {/* Hero Section */}
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-6">
                The Taaza Protocol
              </span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-950 mb-8 max-w-4xl mx-auto leading-[0.9]">
                Your journey to a <br/> <span className="text-emerald-600">better biology</span> simplified.
              </h1>
              <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                We've automated the most difficult part of health: consistency. Follow our simple process and let us handle the rest.
              </p>
            </motion.div>
          </div>

          <div className="space-y-40 mb-40">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 items-center`}
              >
                <div className="flex-1">
                  <div className="h-16 w-16 rounded-[1.25rem] bg-emerald-600 text-white flex items-center justify-center mb-8 shadow-xl shadow-emerald-600/30">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="text-zinc-400 font-bold text-sm uppercase tracking-widest mb-4">Step 0{i + 1}</div>
                  <h2 className="text-4xl font-black tracking-tighter text-zinc-950 mb-6">{step.title}</h2>
                  <p className="text-lg text-zinc-500 leading-relaxed mb-8">{step.description}</p>
                  <ul className="space-y-4">
                    {[
                      "Expert Consultation",
                      "Automated Renewals",
                      "Real-time Tracking"
                    ].map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-zinc-700 font-medium">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full">
                  <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl relative group">
                    <img 
                      src={step.image} 
                      alt={step.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-zinc-950 py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">Built for your lifestyle.</h2>
              <p className="text-zinc-400">Flexibility is baked into every subscription.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Calendar, title: "Flexible Pausing", desc: "Going out for the weekend? Pause your subscription with a single tap in the app." },
                { icon: Utensils, title: "Menu Variety", desc: "Access 100+ gourmet recipes that rotate weekly so you never get bored." },
                { icon: CheckCircle2, title: "Macro Tracking", desc: "Every meal's macro-nutrients are synced automatically to your health dashboard." },
              ].map((feat, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] bg-zinc-900 border border-zinc-800">
                  <feat.icon className="h-10 w-10 text-emerald-500 mb-8" />
                  <h3 className="text-2xl font-bold text-white mb-4">{feat.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-40 px-6 text-center">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-zinc-950 mb-10 max-w-4xl mx-auto">
            Take the first step <br/> towards a new you.
          </h2>
          <button onClick={() => navigate('/health-assessment')} className="h-16 px-12 rounded-full bg-emerald-600 text-white font-bold text-lg shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer">
            Start Assessment Now
          </button>
        </section>
      </main>
    </div>
  );
}
