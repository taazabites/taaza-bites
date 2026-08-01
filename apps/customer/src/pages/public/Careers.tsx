import { motion } from "framer-motion";
import { Sparkles, Users, Coffee, Rocket, ArrowRight, Briefcase } from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

const jobs = [
  { title: "Senior Product Designer", dept: "Product", location: "Bangalore / Remote" },
  { title: "Staff Backend Engineer", dept: "Engineering", location: "Bangalore" },
  { title: "Clinical Nutritionist", dept: "Health", location: "Bangalore" },
  { title: "Operations Manager", dept: "Logistics", location: "Bangalore" },
];

export default function Careers() {
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
              Join the Team
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-950 mb-8 max-w-4xl mx-auto leading-[0.85]">
              Build the future <br/> of <span className="text-emerald-600">Health</span>.
            </h1>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              We're looking for obsessed builders, designers, and scientists to help us solve the metabolic health crisis in India.
            </p>
          </motion.div>
        </section>

        {/* Culture Section */}
        <section className="py-32 bg-zinc-50 border-y border-zinc-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { icon: Rocket, title: "High Velocity", desc: "We move fast, ship daily, and prioritize execution over everything else." },
                { icon: Users, title: "Radical Candor", desc: "We believe in direct feedback and extreme ownership of outcomes." },
                { icon: Coffee, title: "Member Obsessed", desc: "Every decision we make starts and ends with our members' health." },
              ].map((feat, i) => (
                <div key={i} className="text-center">
                  <div className="h-16 w-16 rounded-3xl bg-white border border-zinc-200 flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <feat.icon className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-950 mb-4">{feat.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-32 px-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl font-black tracking-tighter text-zinc-950">Open Positions.</h2>
            <div className="text-sm font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full">
              {jobs.length} Jobs Available
            </div>
          </div>
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <motion.div
                key={job.title}
                whileHover={{ x: 10 }}
                onClick={() => showToast(`Opening application for ${job.title}...`, "info")}
                className="group p-8 rounded-3xl bg-white border border-zinc-100 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">{job.dept} • {job.location}</div>
                  <h3 className="text-2xl font-bold text-zinc-950 group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                </div>
                <button className="h-14 px-8 rounded-2xl bg-zinc-950 text-white font-bold flex items-center gap-2 group-hover:bg-emerald-600 transition-colors cursor-pointer">
                  Apply Now <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Perks Section */}
        <section className="py-32 px-6 bg-zinc-950 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 leading-[0.9]">
                  Why work at <br/> <span className="text-emerald-600">Taaza Bites?</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[
                    "Daily Gourmet Meals",
                    "Health & Vitality Budget",
                    "Equity & Stock Options",
                    "Premium MacBooks",
                    "Remote-First Culture",
                    "Unlimited PTO"
                  ].map((perk, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-emerald-500" />
                      <span className="text-lg font-bold text-zinc-300">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="aspect-video rounded-[3rem] overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center p-20">
                <Briefcase className="h-32 w-32 text-zinc-800" />
              </div>
            </div>
          </div>
        </section>

        {/* General Application */}
        <section className="py-40 px-6 text-center">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-zinc-950 mb-10 max-w-4xl mx-auto">
            Don't see a role? <br/> Surprise us.
          </h2>
          <p className="text-xl text-zinc-500 mb-12 max-w-xl mx-auto">
            We're always looking for exceptional talent. If you're a builder, we want to hear from you.
          </p>
          <button onClick={() => showToast("General application portal opened. Send your CV to careers@taazabites.com!", "info")} className="h-16 px-12 rounded-full bg-emerald-600 text-white font-bold text-lg shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer">
            Send General Application
          </button>
        </section>
      </main>
    </div>
  );
}
