import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { Input } from "../ui/primitives";
import { useToast } from "../../context/ToastContext";
import BrandLogo from "../common/BrandLogo";

export default function Footer() {
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

  return (
    <footer className="bg-zinc-950 text-white pt-20 pb-10 px-6 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* CTA & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-16 border-b border-zinc-800 mb-16 items-center">
          <div>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">
              Ready to optimize <br/> your biology?
            </h3>
            <p className="text-zinc-400 max-w-md">Join the TaazaBites network and experience metabolic clarity.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
            <Input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email for updates" 
              className="h-14 rounded-xl bg-zinc-900 border-zinc-850 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500 w-full"
            />
            <button 
              type="submit"
              className="h-14 px-6 rounded-xl bg-emerald-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 shrink-0 cursor-pointer"
            >
              Notify Me <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Main Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <BrandLogo size="md" textColor="text-white" />
            </Link>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
              India's premier metabolic meal subscription service. Eat for longevity, not just for today.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-xs uppercase tracking-widest text-zinc-400">Product</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><Link to="/pricing" className="hover:text-emerald-500 transition-colors">Pricing</Link></li>
              <li><Link to="/menu" className="hover:text-emerald-500 transition-colors">Weekly Menu</Link></li>
              <li><Link to="/delivery-areas" className="hover:text-emerald-500 transition-colors">Delivery Areas</Link></li>
              <li><Link to="/health-assessment" className="hover:text-emerald-500 transition-colors">Health Assessment</Link></li>
              <li><Link to="/gift" className="hover:text-emerald-500 transition-colors">Gift Subscriptions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-xs uppercase tracking-widest text-zinc-400">Company</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><Link to="/about" className="hover:text-emerald-500 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-emerald-500 transition-colors">Careers</Link></li>
              <li><Link to="/corporate" className="hover:text-emerald-500 transition-colors">Corporate Plans</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-500 transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-emerald-500 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-xs uppercase tracking-widest text-zinc-400">Legal</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><Link to="/privacy" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="hover:text-emerald-500 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600 tracking-tight">© {new Date().getFullYear()} TaazaBites Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-3">
            <a href="https://instagram.com/taazabites" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://twitter.com/taazabites" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com/company/taazabites" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
