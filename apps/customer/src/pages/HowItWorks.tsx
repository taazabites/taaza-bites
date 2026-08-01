import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  ChefHat, 
  Truck, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Leaf, 
  Award, 
  ArrowRight, 
  HelpCircle,
  Zap
} from 'lucide-react';
import FAQAccordion from '../components/FAQAccordion';

const STEPS = [
  {
    id: "01",
    icon: ClipboardList,
    title: "Pick Your Perfect Plan",
    desc: "Tell us a bit about your goals, whether it's losing weight, eating healthier, or just saving time. We'll recommend the best meals for you.",
    color: "emerald",
    bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fm=webp&q=80&w=800"
  },
  {
    id: "02",
    icon: ChefHat,
    title: "We Cook Fresh Every Day",
    desc: "Our chefs prepare your meals from scratch using fresh vegetables and high-quality ingredients. No preservatives, no unhealthy oils.",
    color: "amber",
    bg: "bg-amber-50 text-amber-600 border-amber-100",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fm=webp&q=80&w=800"
  },
  {
    id: "03",
    icon: Truck,
    title: "Delivered to Your Door",
    desc: "Your food is cooked fresh in the morning and delivered straight to your home or office. It arrives ready to eat or heat.",
    color: "orange",
    bg: "bg-orange-50 text-orange-650 border-orange-100",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fm=webp&q=80&w=800"
  },
  {
    id: "04",
    icon: Activity,
    title: "Eat & Feel Amazing",
    desc: "Enjoy delicious, healthy food every day without the stress of cooking. Track your progress and feel your energy levels rise.",
    color: "rose",
    bg: "bg-rose-50 text-rose-600 border-rose-100",
    image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fm=webp&q=80&w=800"
  }
];

const TIMELINE_EVENTS = [
  {
    time: "03:30 AM",
    title: "Fresh Ingredients Arrive",
    desc: "We receive fresh, locally-sourced vegetables and ingredients at our kitchen. Everything is sorted and prepped for the day's meals."
  },
  {
    time: "04:00 AM",
    title: "Cooking Begins",
    desc: "Our expert chefs start cooking your meals. We use healthy cooking methods and only the best quality oils, like cold-pressed olive oil."
  },
  {
    time: "06:30 AM",
    title: "Packed with Care",
    desc: "The freshly cooked food is safely packed into eco-friendly containers, sealing in the flavor and nutrients."
  },
  {
    time: "07:30 AM",
    title: "Out for Delivery",
    desc: "Our delivery partners pick up your meals and bring them straight to your door, so you have healthy food ready for your day."
  }
];

const SCIENCE_PILLARS = [
  {
    icon: Zap,
    title: "Steady Energy",
    desc: "Our meals are balanced with the right mix of proteins, carbs, and healthy fats, so you don't feel sleepy or tired after eating."
  },
  {
    icon: Leaf,
    title: "No Preservatives",
    desc: "Because we cook and deliver the same day, we don't need to add any chemicals or preservatives to keep the food fresh."
  },
  {
    icon: ShieldCheck,
    title: "Healthy Cooking Oils",
    desc: "We never use cheap, unhealthy seed oils. Your food is cooked only in cold-pressed olive oil, coconut oil, or pure ghee."
  }
];

const HOW_IT_WORKS_FAQS = [
  {
    question: "Is the food really fresh every day?",
    answer: "Yes! We cook all our meals early in the morning and deliver them directly to you. We never freeze your meals or use preservatives."
  },
  {
    question: "Can I pause my subscription if I travel?",
    answer: "Absolutely. You can easily pause your deliveries from your account dashboard and resume whenever you're back."
  },
  {
    question: "What if I have allergies or dietary preferences?",
    answer: "When you sign up, you can tell us what you don't like or can't eat. We'll make sure your meals are prepared safely and exactly how you need them."
  },
  {
    question: "Where do you deliver?",
    answer: "We currently deliver to all major areas across Bengaluru. You can enter your pincode or address to check if we deliver to your exact location."
  }
];

export default function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>How It Works | TaazaBites</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight mb-6"
          >
            Healthy Eating, <br />
            <span className="text-emerald-600">Made Simple.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium"
          >
            We take the stress out of eating well. Fresh, chef-prepared meals delivered straight to your door, every single day.
          </motion.p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 px-4 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-24">
            {STEPS.map((step, idx) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}
              >
                {/* Image Section */}
                <div className="w-full lg:w-1/2 relative">
                  <div className={`absolute inset-0 bg-${step.color}-100 rounded-[3rem] translate-x-4 translate-y-4 -z-10`} />
                  <div className="relative rounded-[3rem] overflow-hidden border border-zinc-200/50 shadow-xl bg-white aspect-[4/3]">
                    <img src={step.image} alt={step.title} className="w-full h-full object-cover" loading="lazy" />
                    
                    {/* Floating Step Number */}
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full font-black text-sm flex items-center gap-2 border border-zinc-200/50">
                      <span className="text-emerald-600">{step.id}</span>
                      <span className="text-zinc-400">/</span>
                      <span className="text-zinc-700">04</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="w-full lg:w-1/2 space-y-5">
                  <div className={`inline-flex items-center justify-center p-3 rounded-2xl border ${step.bg}`}>
                    <step.icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">{step.title}</h3>
                  <p className="text-zinc-600 leading-relaxed text-base md:text-lg font-medium">
                    {step.desc}
                  </p>
                  
                  <div className="pt-4">
                    <button 
                      onClick={() => navigate('/plans')}
                      className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
                    >
                      Explore Plans <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 AM Timeline Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[10px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-3">
              <Clock className="w-3.5 h-3.5" />
              OUR PROMISE
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Cooked Fresh Every Morning</h2>
            <p className="text-zinc-500 text-sm md:text-base max-w-xl mx-auto mt-4 font-medium">
              We wake up early so you don't have to. Here's how we get healthy, fresh food to your door every single day.
            </p>
          </div>

          <div className="relative border-l-2 border-emerald-100 ml-4 md:ml-32 space-y-12">
            {TIMELINE_EVENTS.map((event, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative pl-8 md:pl-12"
              >
                {/* Timeline Pin */}
                <div className="absolute -left-[9px] top-1 w-4.5 h-4.5 rounded-full border-4 border-white bg-emerald-500 shadow-md ring-4 ring-emerald-50" />
                
                {/* Left Side Time label (Desktop) */}
                <div className="hidden md:block absolute -left-36 top-0 w-28 text-right font-black text-sm text-emerald-600 uppercase tracking-wider">
                  {event.time}
                </div>

                <div className="bg-zinc-50 border border-zinc-100/80 p-6 md:p-8 rounded-2xl hover:shadow-md transition-shadow">
                  {/* Mobile Time label */}
                  <span className="inline-block md:hidden text-emerald-600 font-black text-xs uppercase tracking-wider mb-3">
                    ⏱️ {event.time}
                  </span>
                  <h4 className="text-lg md:text-xl font-black text-zinc-900 mb-2">{event.title}</h4>
                  <p className="text-zinc-600 text-sm md:text-base leading-relaxed font-medium">{event.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Science & Quality Pillars */}
      <section className="py-24 px-4 bg-emerald-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Why Our Food is Better</h2>
            <p className="text-emerald-100 text-sm md:text-base max-w-xl mx-auto mt-4">
              We believe food should taste good and make you feel good.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SCIENCE_PILLARS.map((pillar, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-emerald-800/50 border border-emerald-700/50 p-8 rounded-[2rem] hover:bg-emerald-800 transition-colors"
              >
                <div className="h-12 w-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6">
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">{pillar.title}</h3>
                <p className="text-emerald-100 text-sm leading-relaxed font-medium">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-24 px-4 bg-zinc-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-4">Got Questions?</h2>
            <p className="text-zinc-500 font-medium">Everything you need to know about how Taaza Bites works.</p>
          </div>
          
          <FAQAccordion items={HOW_IT_WORKS_FAQS} />
        </div>
      </section>

      {/* Final Premium CTA */}
      <section className="py-24 px-4 bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 shadow-sm border border-emerald-100">
            <Award className="w-3.5 h-3.5 text-emerald-600" /> Start Eating Better
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter mb-6 leading-tight">
            Ready to change <br className="md:hidden" /> how you eat?
          </h2>
          
          <p className="text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed text-base font-medium">
            Join thousands of people in Bengaluru who have made healthy eating simple, delicious, and effortless.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
              onClick={() => navigate('/plans')}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-10 rounded-full text-sm md:text-base transition-all shadow-xl shadow-emerald-600/25 active:scale-95 flex items-center justify-center gap-2"
            >
              See Our Plans <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate('/support')}
              className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-black py-4 px-10 rounded-full text-sm md:text-base transition-all flex items-center justify-center gap-2"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
