import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Users, Target, ShieldCheck, Heart, Sparkles, ArrowRight } from "lucide-react";

const team = [
  {
    name: "Dr. Ananya Sharma",
    role: "Chief Nutritionist",
    image: "https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fm=webp&fit=crop&q=80&w=300&h=300",
    bio: "Ex-AIIMS, 15+ years in metabolic health."
  },
  {
    name: "Vikram Mehta",
    role: "Executive Chef",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fm=webp&fit=crop&q=80&w=300&h=300",
    bio: "Michelin-star background, specialist in healthy gourmet."
  },
  {
    name: "Rohan Das",
    role: "Operations Head",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fm=webp&fit=crop&q=80&w=300&h=300",
    bio: "Logistics expert ensuring freshness every morning."
  }
];

const values = [
  {
    icon: Heart,
    title: "Customer First",
    description: "Every meal is crafted with your specific health goals in mind."
  },
  {
    icon: Target,
    title: "Precision Nutrition",
    description: "Data-driven approach to calorie and macro-nutrient management."
  },
  {
    icon: ShieldCheck,
    title: "Pure Quality",
    description: "Zero preservatives, zero refined oils, only farm-fresh ingredients."
  }
];

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-20 sm:pt-24 pb-20">
        {/* Hero Section */}
        <section className="px-6 py-20 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-6">
              Our Story
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-950 mb-8 max-w-4xl mx-auto leading-[0.9]">
              We are on a mission to make <span className="text-emerald-600">India Healthy</span>, one bite at a time.
            </h1>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Taaza Bites started with a simple observation: healthy food was either boring or inaccessible. We combined gourmet culinary arts with precision nutrition to create a membership that transforms lives.
            </p>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="bg-zinc-50 py-24 px-6 border-y border-zinc-100">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Active Members", value: "10,000+" },
              { label: "Meals Delivered", value: "1M+" },
              { label: "Partner Farms", value: "50+" },
              { label: "Cities", value: "12" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-black text-zinc-950 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-zinc-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fm=webp&fit=crop&q=80&w=800" 
                  alt="Healthy Food Preparation" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[2rem] shadow-2xl max-w-xs hidden md:block">
                <Sparkles className="text-emerald-600 mb-4 h-8 w-8" />
                <p className="text-zinc-950 font-bold leading-tight">
                  "Freshness isn't an option for us. It's the core of our DNA."
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-950 mb-8 leading-[0.9]">
                Precision engineering for your <span className="text-emerald-600">metabolic health</span>.
              </h2>
              <div className="space-y-10">
                {values.map((value, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <value.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-950 mb-2">{value.title}</h3>
                      <p className="text-zinc-500 leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-32 bg-zinc-950 text-white px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">The Council of Nutrition.</h2>
              <p className="text-zinc-400 max-w-xl mx-auto">Meet the experts behind your personalized meal protocols.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {team.map((member, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <div className="aspect-square rounded-[2rem] overflow-hidden mb-8 grayscale group-hover:grayscale-0 transition-all duration-500">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                  <p className="text-emerald-500 font-bold text-sm uppercase tracking-widest mb-4">{member.role}</p>
                  <p className="text-zinc-500 leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-40 px-6 text-center">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-zinc-950 mb-10 max-w-4xl mx-auto">
            Ready to start your <br/> health transformation?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/plans')} className="h-16 px-10 rounded-full bg-emerald-600 text-white font-bold text-lg shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
              Get Started <ArrowRight className="h-5 w-5" />
            </button>
            <button onClick={() => navigate('/plans')} className="h-16 px-10 rounded-full bg-zinc-100 text-zinc-950 font-bold text-lg hover:bg-zinc-200 transition-all cursor-pointer">
              View Plans
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
