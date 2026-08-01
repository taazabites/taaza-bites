import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, ArrowRight, Send } from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

export default function Contact() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", subject: "General Inquiry", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      showToast("Please fill in your email and message.", "error");
      return;
    }
    showToast("Message sent successfully! Our support team will reach out within 2 hours.", "success");
    setFormData({ firstName: "", lastName: "", email: "", subject: "General Inquiry", message: "" });
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
              Connect With Us
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-950 mb-8 max-w-4xl mx-auto leading-[0.85]">
              We're here to <br/> <span className="text-emerald-600">Support</span> your journey.
            </h1>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Have questions about our protocols, delivery, or pricing? Our team of experts is ready to help you optimize your health.
            </p>
          </motion.div>
        </section>

        {/* Contact Grid */}
        <section className="px-6 py-20 max-w-7xl mx-auto mb-40">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Contact Form */}
            <div className="p-10 md:p-16 rounded-[3rem] bg-zinc-50 border border-zinc-100">
              <h2 className="text-3xl font-black tracking-tighter text-zinc-950 mb-8">Send us a message.</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">First Name</label>
                    <input 
                      value={formData.firstName} 
                      onChange={e => setFormData({...formData, firstName: e.target.value})} 
                      className="w-full h-14 rounded-2xl bg-white border border-zinc-200 focus:border-emerald-500 transition-all px-6 outline-none" 
                      placeholder="John" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Last Name</label>
                    <input 
                      value={formData.lastName} 
                      onChange={e => setFormData({...formData, lastName: e.target.value})} 
                      className="w-full h-14 rounded-2xl bg-white border border-zinc-200 focus:border-emerald-500 transition-all px-6 outline-none" 
                      placeholder="Doe" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Email Address</label>
                  <input 
                    type="email"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full h-14 rounded-2xl bg-white border border-zinc-200 focus:border-emerald-500 transition-all px-6 outline-none" 
                    placeholder="john@example.com" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Subject</label>
                  <select 
                    value={formData.subject} 
                    onChange={e => setFormData({...formData, subject: e.target.value})} 
                    className="w-full h-14 rounded-2xl bg-white border border-zinc-200 focus:border-emerald-500 transition-all px-6 outline-none appearance-none"
                  >
                    <option>General Inquiry</option>
                    <option>Support Request</option>
                    <option>Corporate Partnership</option>
                    <option>Careers</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Message</label>
                  <textarea 
                    value={formData.message} 
                    onChange={e => setFormData({...formData, message: e.target.value})} 
                    className="w-full h-40 rounded-2xl bg-white border border-zinc-200 focus:border-emerald-500 transition-all p-6 outline-none resize-none" 
                    placeholder="How can we help you?" 
                  />
                </div>
                <button type="submit" className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  Send Message <Send className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col justify-center">
              <div className="space-y-12">
                {[
                  { icon: Mail, title: "Email Us", detail: "hello@taazabites.com", sub: "Response within 2 hours" },
                  { icon: Phone, title: "Call Support", detail: "+91 79757 71457", sub: "Available 7 AM - 9 PM" },
                  { icon: MessageCircle, title: "WhatsApp", detail: "+91 79757 71457", sub: "Instant text support" },
                  { icon: MapPin, title: "Headquarters", detail: "123 Health Street, Sarjapur Road, Bengaluru, Karnataka 560035", sub: "Visit by appointment" },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 group"
                  >
                    <div className="h-16 w-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">{item.title}</h3>
                      <p className="text-2xl font-black text-zinc-950 mb-1">{item.detail}</p>
                      <p className="text-zinc-500 font-medium">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-20 pt-12 border-t border-zinc-100">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8">Follow our community.</h4>
                <div className="flex gap-4">
                  {["Instagram", "Twitter", "LinkedIn", "YouTube"].map(social => (
                    <button key={social} onClick={() => showToast(`Opening ${social}...`, "info")} className="px-6 py-3 rounded-xl bg-zinc-50 text-zinc-600 font-bold hover:bg-zinc-950 hover:text-white transition-all cursor-pointer">
                      {social}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="bg-zinc-950 py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-10">Already a member?</h2>
            <p className="text-zinc-400 text-xl mb-12">
              Access 24/7 priority chat and ticket support directly from your health hub.
            </p>
            <button onClick={() => navigate('/dashboard/support')} className="h-16 px-12 rounded-full bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer">
              Open Support Dashboard <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
