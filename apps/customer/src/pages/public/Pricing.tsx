import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Zap, Star, ShieldCheck } from "lucide-react";

const plans = [
  {
    name: "Essential",
    price: "₹8,999",
    duration: "/mo",
    description: "Perfect for weight management and daily wellness.",
    features: [
      "1 Meal per day (Lunch or Dinner)",
      "Basic Health Assessment",
      "Standard Delivery Slot",
      "Pause/Skip Anytime",
      "Digital Health Hub Access"
    ],
    cta: "Start Essential",
    popular: false,
    color: "zinc"
  },
  {
    name: "Performance",
    price: "₹16,499",
    duration: "/mo",
    description: "The gold standard for athletic performance and longevity.",
    features: [
      "2 Meals per day (Lunch & Dinner)",
      "Advanced Metabolic Assessment",
      "Priority Morning Delivery",
      "Dedicated Health Coach",
      "Weekly Progress Reports",
      "Monthly Lab Test Discount"
    ],
    cta: "Start Performance",
    popular: true,
    color: "emerald"
  },
  {
    name: "Elite",
    price: "₹22,999",
    duration: "/mo",
    description: "Full-spectrum biohacking and total body transformation.",
    features: [
      "3 Meals per day (Full Day Fuel)",
      "Daily Bio-Marker Tracking",
      "VIP Concierge Delivery",
      "Unlimited Nutritionist Calls",
      "Custom Macro-Adjustment",
      "Exclusive Events & Retreats"
    ],
    cta: "Go Elite",
    popular: false,
    color: "zinc"
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-20 sm:pt-24 pb-20">
        {/* Header Section */}
        <section className="px-6 py-20 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-6">
              Membership Plans
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-950 mb-8 max-w-4xl mx-auto leading-[0.9]">
              Invest in your <span className="text-emerald-600">Future Self</span>.
            </h1>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Transparent pricing with no hidden costs. Join the membership that pays dividends in longevity and vitality.
            </p>
          </motion.div>
        </section>

        {/* Pricing Grid */}
        <section className="px-6 max-w-7xl mx-auto mb-40">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex flex-col p-10 rounded-[3rem] border ${
                  plan.popular 
                    ? "bg-zinc-950 text-white border-zinc-800 shadow-2xl scale-105 z-10" 
                    : "bg-white text-zinc-950 border-zinc-100 hover:border-emerald-200 hover:shadow-xl"
                } transition-all duration-500`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-black tracking-tight mb-2">{plan.name}</h3>
                  <p className={`${plan.popular ? 'text-zinc-400' : 'text-zinc-500'} text-sm leading-relaxed`}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                  <span className={`${plan.popular ? 'text-zinc-500' : 'text-zinc-400'} text-lg font-bold`}>{plan.duration}</span>
                </div>

                <div className="flex-1 space-y-4 mb-10">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className={`mt-1 rounded-full p-0.5 ${plan.popular ? 'bg-emerald-500/20 text-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span className={`text-sm font-medium ${plan.popular ? 'text-zinc-300' : 'text-zinc-600'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate('/plans')} className={`w-full h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  plan.popular 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/30" 
                    : "bg-zinc-100 text-zinc-950 hover:bg-emerald-600 hover:text-white"
                }`}>
                  {plan.cta} <ArrowRight className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="bg-zinc-50 py-32 px-6 border-y border-zinc-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-black tracking-tighter text-zinc-950 mb-12">Frequently Asked Questions.</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              {[
                { q: "Can I pause my plan?", a: "Yes, you can pause for up to 14 days per month directly via the dashboard." },
                { q: "Are there delivery charges?", a: "No, priority morning delivery is included in all our membership plans." },
                { q: "Can I swap meals?", a: "Absolutely. Our weekly menu allows you to customize every single day's selection." },
                { q: "Is there a commitment?", a: "All plans are month-to-month. Cancel anytime before your next billing cycle." },
              ].map((faq, i) => (
                <div key={i} className="p-8 rounded-3xl bg-white border border-zinc-100 shadow-sm">
                  <h4 className="font-bold text-zinc-950 mb-2">{faq.q}</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Zap, title: "Speed of Life", desc: "Save 15+ hours a week on grocery shopping, cooking, and cleanup." },
              { icon: Star, title: "Gourmet Quality", desc: "Michelin-inspired recipes that prove healthy food can taste incredible." },
              { icon: ShieldCheck, title: "Scientific Edge", desc: "Data-driven nutrition optimized for energy, focus, and longevity." },
            ].map((benefit, i) => (
              <div key={i} className="text-center">
                <div className="h-16 w-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-950 mb-4">{benefit.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
