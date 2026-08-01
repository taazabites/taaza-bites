import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Users, BarChart3, HeartPulse, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

const benefits = [
  {
    icon: BarChart3,
    title: "Increased Productivity",
    desc: "Optimized nutrition reduces mid-day energy crashes and enhances cognitive focus."
  },
  {
    icon: HeartPulse,
    title: "Reduced Healthcare Costs",
    desc: "Preventative wellness initiatives lead to fewer sick leaves and lower insurance premiums."
  },
  {
    icon: Users,
    title: "Employee Retention",
    desc: "Premium wellness benefits are the #1 requested perk for modern high-performing teams."
  }
];

export default function Corporate() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", company: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.company) {
      showToast("Please enter your work email and company name.", "error");
      return;
    }
    showToast("Consultation request submitted! Our team will contact you shortly.", "success");
    setFormData({ name: "", email: "", company: "" });
  };

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
              Taaza For Business
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-950 mb-8 max-w-4xl mx-auto leading-[0.9]">
              Fuel your team's <br/> <span className="text-emerald-600">Peak Performance</span>.
            </h1>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Custom-engineered nutrition for high-growth companies. Transform your workplace into a hub of vitality and focus.
            </p>
          </motion.div>
        </section>

        {/* Benefits Section */}
        <section className="py-32 px-6 bg-zinc-50 border-y border-zinc-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              {benefits.map((benefit, i) => (
                <div key={i} className="p-10 rounded-[3rem] bg-white border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-8">
                    <benefit.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-950 mb-4">{benefit.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise Features */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-950 mb-8 leading-[0.9]">
                Wellness infrastructure <br/> for the <span className="text-emerald-600">modern HQ</span>.
              </h2>
              <div className="space-y-6">
                {[
                  "On-site Smart Kitchen Installations",
                  "Personalized Health Dashboards for HR",
                  "Monthly Wellness Seminars & Audits",
                  "Custom Branding & White-label Packaging",
                  "Dedicated Corporate Relationship Manager",
                  "Seamless Billing & Compliance Reports"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                    <span className="text-lg font-medium text-zinc-700">{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => showToast("Downloading Corporate Brochure...", "info")} className="mt-12 h-16 px-10 rounded-full bg-zinc-950 text-white font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors cursor-pointer">
                Download Brochure <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fm=webp&fit=crop&q=80&w=800" 
                  alt="Modern Office Wellness" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-emerald-600 text-white p-10 rounded-[2rem] shadow-2xl max-w-xs">
                <Building2 className="mb-4 h-10 w-10 opacity-50" />
                <div className="text-4xl font-black mb-2">500+</div>
                <div className="text-sm font-bold uppercase tracking-widest opacity-80">Enterprise Partners</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Preview */}
        <section className="py-32 px-6 text-center bg-zinc-950 text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">Let's build a healthier workplace.</h2>
            <p className="text-zinc-400 text-xl mb-12">
              Our enterprise team will reach out within 2 hours to discuss a customized plan for your organization.
            </p>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
                <input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 rounded-xl bg-zinc-900 border-zinc-800 focus:border-emerald-500 transition-colors px-6 text-white" 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Work Email</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full h-14 rounded-xl bg-zinc-900 border-zinc-800 focus:border-emerald-500 transition-colors px-6 text-white" 
                  placeholder="john@company.com" 
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Company Name</label>
                <input 
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full h-14 rounded-xl bg-zinc-900 border-zinc-800 focus:border-emerald-500 transition-colors px-6 text-white" 
                  placeholder="Acme Inc." 
                />
              </div>
              <button type="submit" className="sm:col-span-2 h-16 mt-4 rounded-xl bg-emerald-600 text-white font-black text-lg hover:bg-emerald-700 transition-all cursor-pointer">
                Request a Consultation
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
