import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Gift, Heart, Sparkles, Send, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

const giftCards = [
  {
    title: "The Kickstart",
    price: "₹2,499",
    days: "7 Days",
    includes: ["7 Premium Lunches", "Metabolic Intro Call", "Health Hub Access"],
    popular: false
  },
  {
    title: "The Transformation",
    price: "₹8,999",
    days: "30 Days",
    includes: ["30 Days Lunch or Dinner", "Full Health Assessment", "Dedicated Support", "Priority Delivery"],
    popular: true
  },
  {
    title: "The Bio-Hacker",
    price: "₹16,499",
    days: "30 Days Full",
    includes: ["30 Days Lunch & Dinner", "2x Nutritionist Calls", "Monthly Lab Review", "Concierge Delivery"],
    popular: false
  }
];

export default function GiftPlans() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-20 sm:pt-24 pb-20">
        {/* Hero Section */}
        <section className="px-6 py-20 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-6">
              Gift Wellness
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-950 mb-8 max-w-4xl mx-auto leading-[0.9]">
              The gift of <span className="text-emerald-600">Vitality</span>.
            </h1>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Show you care by gifting a healthier life. Precision-nutrition meal memberships for your friends, family, and team.
            </p>
          </motion.div>
        </section>

        {/* Gift Cards Grid */}
        <section className="px-6 max-w-7xl mx-auto mb-40">
          <div className="grid lg:grid-cols-3 gap-8">
            {giftCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`p-10 rounded-[3rem] border ${
                  card.popular 
                    ? "bg-zinc-950 text-white border-zinc-800 shadow-2xl scale-105 z-10" 
                    : "bg-zinc-50 border-zinc-100"
                } relative group transition-all duration-500`}
              >
                {card.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest">
                    Best Value
                  </div>
                )}
                
                <div className="h-14 w-14 rounded-2xl bg-emerald-600/10 flex items-center justify-center mb-8">
                  <Gift className={`h-7 w-7 ${card.popular ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                
                <h3 className="text-2xl font-black mb-1">{card.title}</h3>
                <div className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-6">{card.days} Protocol</div>
                
                <div className="text-4xl font-black mb-8">{card.price}</div>
                
                <div className="space-y-4 mb-10">
                  {card.includes.map((item, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                      <span className={`text-sm ${card.popular ? 'text-zinc-400' : 'text-zinc-600'}`}>{item}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => { showToast(`Selected ${card.title} gift card!`, "success"); navigate('/plans'); }} className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  card.popular 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                    : "bg-white text-zinc-950 border border-zinc-200 hover:border-emerald-500"
                }`}>
                  Buy Gift Card <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-zinc-50 py-32 px-6 border-y border-zinc-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-950">Simple Gifting.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { icon: Gift, title: "Choose a Plan", desc: "Select the membership duration that best fits your recipient's goals." },
                { icon: Send, title: "Deliver Instantly", desc: "Send via email or WhatsApp with a personalized message and health assessment link." },
                { icon: Sparkles, title: "They Transform", desc: "Your recipient activates their plan and begins their journey to better health." },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="h-20 w-20 rounded-[2.5rem] bg-white border border-zinc-100 flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <step.icon className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 mb-4">{step.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Custom Amount */}
        <section className="py-40 px-6 text-center">
          <Heart className="h-16 w-16 text-emerald-500 mx-auto mb-10 animate-pulse" />
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-zinc-950 mb-10 max-w-4xl mx-auto">
            Need a custom <br/> corporate gift order?
          </h2>
          <button onClick={() => navigate('/corporate')} className="h-16 px-12 rounded-full bg-zinc-950 text-white font-bold text-lg hover:bg-emerald-600 transition-colors cursor-pointer">
            Contact Sales for Bulk Gifting
          </button>
        </section>
      </main>
    </div>
  );
}
