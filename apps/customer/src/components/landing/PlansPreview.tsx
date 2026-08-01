import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CardSkeleton } from '../ui/Skeleton';
import { useSubscriptionPlans } from '../../lib/plans-cache';
import { Check } from 'lucide-react';

const FIXED_PLANS = [
  {
    id: "trial",
    name: "3-Day Trial",
    pricePerDay: 266,
    totalPrice: 799,
    savings: 0,
    calories: "450-550",
    protein: "30g+",
    type: "Short Term",
    description: "Perfect for testing the taste and quality.",
    features: ["Daily Delivery", "Standard Macros", "Chef's Menu"],
    color: "bg-zinc-100"
  },
  {
    id: "weekly",
    name: "Weekly Plan",
    pricePerDay: 242,
    totalPrice: 1699,
    savings: 200,
    calories: "450-550",
    protein: "35g+",
    type: "Habit Builder",
    popular: true,
    description: "Build your healthy eating momentum.",
    features: ["Daily Delivery", "Custom Macros", "Meal Swapping", "Nutritionist Chat"],
    color: "bg-emerald-600"
  },
  {
    id: "fortnight",
    name: "15-Day Plan",
    pricePerDay: 226,
    totalPrice: 3399,
    savings: 600,
    calories: "450-550",
    protein: "35g+",
    type: "Body Transformation",
    description: "Visible results in energy and focus.",
    features: ["Daily Delivery", "Priority Support", "Diet Consultation", "Gift Vouchers"],
    color: "bg-zinc-950"
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    pricePerDay: 199,
    totalPrice: 5999,
    savings: 2000,
    calories: "450-550",
    protein: "40g+",
    type: "Lifestyle Protocol",
    description: "The ultimate long-term health investment.",
    features: ["Free Blood Test", "Dedicated Coach", "Unlimited Swaps", "Exclusive Recipes"],
    color: "bg-emerald-950"
  }
];

export default function PlansPreview() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-zinc-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
        >
            <span className="text-emerald-600 font-black uppercase tracking-widest text-xs px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">Clear Pricing</span>
            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tighter mt-4 mb-4">Subscribe to <span className="text-emerald-600">Health</span></h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto font-medium">No hidden costs. Just pure nutrition delivered to your doorstep daily.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {FIXED_PLANS.map((plan, i) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={cn(
                "group relative p-8 rounded-[3rem] border transition-all duration-500 flex flex-col h-full",
                plan.popular ? "bg-white border-emerald-200 shadow-2xl scale-105 z-10" : "bg-white border-zinc-100 shadow-sm hover:shadow-xl"
              )}
            >
              {plan.popular && (
                  <div className="absolute top-0 right-12 bg-emerald-600 text-white px-4 py-2 rounded-b-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                      Best Seller
                  </div>
              )}

              <div className="mb-8">
                <span className="text-zinc-400 font-black text-[10px] uppercase tracking-widest block mb-2">{plan.type}</span>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{plan.name}</h3>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-zinc-950 tracking-tighter">₹{plan.totalPrice}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-emerald-600 font-bold text-sm">₹{plan.pricePerDay}/day</span>
                  {plan.savings > 0 && (
                    <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Save ₹{plan.savings}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Calories</p>
                      <p className="text-sm font-black text-zinc-800">{plan.calories}</p>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Protein</p>
                      <p className="text-sm font-black text-zinc-800">{plan.protein}</p>
                  </div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="bg-emerald-50 p-1 rounded-full mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      </div>
                      <span className="text-xs font-bold text-zinc-600 leading-tight">{f}</span>
                    </li>
                ))}
              </ul>

              <button 
                onClick={() => navigate('/health-assessment')}
                className={cn(
                    "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl cursor-pointer",
                    plan.popular ? "bg-emerald-600 text-white shadow-emerald-600/25" : "bg-zinc-900 text-white shadow-zinc-900/20"
                )}
              >
                Choose This Plan
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Helper for cn
import { cn } from '../../lib/utils';
