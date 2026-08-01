import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function Contact() {
  const { showToast } = useToast();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    showToast("Message received successfully! Our team will contact you shortly.", "success");
  };

  return (
    <section className="py-24 bg-zinc-50 border-t border-zinc-100" id="contact">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-black uppercase tracking-widest text-xs px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">Contact Us</span>
          <h2 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tighter mt-4 mb-4">
            Get in Touch <span className="text-emerald-600">With Us</span>
          </h2>
          <p className="text-lg text-zinc-600 max-w-xl mx-auto font-medium">
            Have questions about our menus, enterprise deliveries, or bulk wellness subscriptions? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-[3rem] border border-zinc-200/60 p-8 md:p-12 shadow-sm overflow-hidden">
          
          {/* Info Side (4 cols) */}
          <div className="lg:col-span-5 bg-zinc-950 rounded-[2rem] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-black tracking-tight mb-4">Contact Information</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                Our customer happiness team is active 7 days a week to assist you with scheduling, queries, and dietitian consultations.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-emerald-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-widest text-zinc-500 mb-1">Telephone & WhatsApp</h4>
                    <p className="text-sm font-bold text-white">+91 98860 12345</p>
                    <p className="text-[10px] text-emerald-400 font-bold mt-0.5">🟢 Instant WhatsApp Chat Enabled</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-emerald-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-widest text-zinc-500 mb-1">Email Support</h4>
                    <p className="text-sm font-bold text-white">support@taazabites.in</p>
                    <p className="text-xs text-zinc-400">Response average: 15 mins</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-emerald-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-widest text-zinc-500 mb-1">Central Kitchen & HQ</h4>
                    <p className="text-sm font-bold text-white">TaazaBites HQ, Sector 3,</p>
                    <p className="text-xs text-zinc-400">HSR Layout, Bengaluru, KA 560102</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-emerald-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-widest text-zinc-500 mb-1">Operation Hours</h4>
                    <p className="text-sm font-bold text-white">Mon - Sun: 6:00 AM - 10:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 border-t border-white/10 pt-8 mt-12 text-xs text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
              Support Team is currently Online
            </div>

            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
          </div>

          {/* Form Side (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6 text-left"
                >
                  <h3 className="text-2xl font-black text-zinc-950 tracking-tight mb-2">Send us a Message</h3>
                  <p className="text-zinc-500 text-sm mb-6">Have an operational request or enterprise query? Send a secure dispatch below.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={e => setFormState(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                        className="w-full h-14 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 text-sm font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Your Email *</label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@example.com"
                        className="w-full h-14 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 text-sm font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Subject</label>
                    <input
                      type="text"
                      value={formState.subject}
                      onChange={e => setFormState(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g. Enterprise Corporate Plan"
                      className="w-full h-14 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 text-sm font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 mb-2">Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={formState.message}
                      onChange={e => setFormState(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Detail your request or enquiry..."
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 text-sm font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wider uppercase text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/10 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending secure message...</span>
                    ) : (
                      <>
                        <span>Submit Secure Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-zinc-950 tracking-tighter mb-2">Secure Message Dispatched</h3>
                  <p className="text-zinc-600 font-medium max-w-sm mx-auto mb-8">
                    Thank you, {formState.name}! We've registered your ticket successfully. Our customer happiness desk will reach out within 15 minutes.
                  </p>
                  <button
                    onClick={() => {
                      setFormState({ name: '', email: '', subject: '', message: '' });
                      setIsSubmitted(false);
                    }}
                    className="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Send Another Dispatch
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
