import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Twitter, Instagram, Linkedin, ArrowRight, ShieldCheck, Heart, MapPin } from "lucide-react";
import { Input } from "../ui/primitives";
import { useToast } from "@/src/context/ToastContext";
import { motion } from "framer-motion";
import BrandLogo from "../common/BrandLogo";

export default function PublicFooter() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    showToast("Subscribed successfully! Welcome to the metabolic revolution.", "success");
    setEmail("");
  };

  const footerLinks = {
    product: [
      { name: "Longevity Plans", href: "/plans" },
      { name: "Metabolic Menu", href: "/menu" },
      { name: "Bengaluru Delivery", href: "/delivery-areas" },
      { name: "Health Assessment", href: "/health-assessment" },
      { name: "Support Hub", href: "/support" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "How It Works", href: "/how-it-works" },
      { name: "Corporate Wellness", href: "/corporate" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
      { name: "FAQs", href: "/faq" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Refund Policy", href: "/refund-policy" },
    ]
  };

  return (
    <footer className="bg-zinc-950 text-white pt-32 pb-12 px-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Newsletter & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pb-24 border-b border-zinc-900 mb-20 items-center">
          <div className="lg:col-span-7">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black tracking-tightest text-white mb-8 leading-[0.95]"
            >
              The future of <br/>
              <span className="text-emerald-500">nutrition is personal.</span>
            </motion.h3>
            <p className="text-zinc-400 max-w-md font-medium text-lg">
              Join 15k+ high-performers optimizing their biology daily. No spam, just pure science.
            </p>
          </div>
          <div className="lg:col-span-5">
            <form onSubmit={handleSubscribe} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex flex-col sm:flex-row gap-3 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email for longevity updates" 
                  className="h-14 bg-transparent border-none text-white placeholder:text-zinc-600 focus-visible:ring-0 w-full font-bold px-4"
                />
                <button 
                  type="submit"
                  className="h-14 px-8 rounded-xl bg-emerald-600 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 shrink-0 cursor-pointer"
                >
                  Join Protocol <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
            <div className="mt-4 flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> HIPAA Compliant</span>
              <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Made for Bengaluru</span>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-24">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <BrandLogo size="lg" textColor="text-white" />
            </Link>
            <p className="text-zinc-500 font-medium leading-relaxed max-w-sm mb-8">
              Premium, science-backed metabolic nutrition protocol engineered for peak performance and human longevity. 
            </p>
            <div className="flex items-center gap-2 text-zinc-400 font-bold text-sm">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Sarjapur Road, Bengaluru, KA 560035</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">Product</h4>
            <ul className="space-y-4">
              {footerLinks.product.map(link => (
                <li key={link.name}>
                  <Link to={link.href} className="text-zinc-400 hover:text-emerald-500 font-bold transition-all hover:translate-x-1 inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  <Link to={link.href} className="text-zinc-400 hover:text-emerald-500 font-bold transition-all hover:translate-x-1 inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map(link => (
                <li key={link.name}>
                  <Link to={link.href} className="text-zinc-400 hover:text-emerald-500 font-bold transition-all hover:translate-x-1 inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
              © {new Date().getFullYear()} TaazaBites Subscription Services Pvt. Ltd.
            </p>
            <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
              CIN: U15400KA2021PTC145230 • GSTIN: 29AAKCT0000A1Z5
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {[Instagram, Twitter, Linkedin].map((Icon, i) => (
              <motion.a
                key={i}
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all cursor-pointer"
              >
                <Icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
