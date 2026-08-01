/**
 * @file LogisticsDrawer.tsx
 * @description Highly polished, modern, interactive sliding side drawer for mobile users to inspect Taazabites
 * service logistics, delivery coverage hubs, meal slots, and contact parameters with dynamic hover accents.
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Clock, Phone, Truck, MapPin, Calendar, ShieldCheck, 
  Leaf, Apple, Settings, MessageSquare, Sparkles, ChevronRight 
} from "lucide-react";
import { WHATSAPP_NUMBER } from "../config";

export const LogisticsDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const touchStartRef = useRef<number | null>(null);

  // Listen for custom open event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("taazabites:open-logistics", handleOpen);
    return () => window.removeEventListener("taazabites:open-logistics", handleOpen);
  }, []);

  // Stop body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartRef.current;

    // Swipe to the right to close (since drawer slides from right)
    if (deltaX > 30) {
      setIsOpen(false);
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1001] lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#0b0b0b] z-[1002] shadow-[0_0_50px_rgba(0,0,0,0.8)] lg:hidden flex flex-col border-l border-white/5 overflow-hidden"
            id="panel-logistics-drawer"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-white/5 bg-[#0e0e0e]/95 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#059669]" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-white flex items-center gap-1.5">
                    Service Logistics
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">Taazabites Bengaluru Hub</p>
                </div>
              </div>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-zinc-400 hover:text-white transition-all active:scale-95 shadow-sm"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area with highly scannable, beautifully styled sections */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gradient-to-b from-[#0b0b0b] to-[#0d0d0d]">
              
              {/* Active Hub status */}
              <div className="bg-[#121212] p-4 rounded-3xl border border-emerald-500/20 flex items-center gap-3 bg-gradient-to-r from-emerald-950/20 to-transparent">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#059669]"></span>
                </span>
                <p className="text-[11px] text-emerald-400 font-mono uppercase tracking-wider font-semibold">
                  Fresh Kitchen Dispatch Center Active
                </p>
              </div>

              {/* Section 1: Service Logistics with gorgeous bento-style design */}
              <div className="bg-[#121212]/90 p-5 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                  <MapPin className="w-16 h-16 text-[#059669]" />
                </div>
                <h3 className="text-[10px] font-mono font-bold text-[#059669] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                  Hub Logistics
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                      <Truck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Service Type</span>
                      <p className="text-sm text-zinc-200 font-semibold mt-0.5">Macro-Calculated Meal Plans</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                      <MapPin className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Operations Zone</span>
                      <p className="text-sm text-zinc-200 font-semibold mt-0.5">Bengaluru, Karnataka</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Key Coverage Areas</span>
                      <p className="text-sm text-zinc-200 font-semibold mt-0.5">HSR Layout, Sarjapur Rd, Bellandur, Koramangala & Hubs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Slots with colored time tags */}
              <div className="bg-[#121212]/90 p-5 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                  <Clock className="w-16 h-16 text-[#F59E0B]" />
                </div>
                <h3 className="text-[10px] font-mono font-bold text-[#F59E0B] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  Precise Delivery Slots
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs text-zinc-300 font-medium">Breakfast Slot</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                      7:00 AM - 9:00 AM
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-[#059669]" />
                      <span className="text-xs text-zinc-300 font-medium">Lunch Slot</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      11:30 AM - 1:30 PM
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-xs text-zinc-300 font-medium">Dinner Slot</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                      6:30 PM - 8:30 PM
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/5 text-xs">
                    <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Service Days
                    </span>
                    <span className="text-[#F59E0B] font-mono font-bold bg-[#F59E0B]/10 px-2 py-0.5 rounded">
                      Mon-Sat (Sunday Off)
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Diet & Menu with micro icons */}
              <div className="bg-[#121212]/90 p-5 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                  <Apple className="w-16 h-16 text-indigo-400" />
                </div>
                <h3 className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Diet Architecture
                </h3>

                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-1.5 text-zinc-500 font-medium mb-1 font-mono uppercase text-[9px]">
                      <Apple className="w-3 h-3 text-[#059669]" /> Bases
                    </div>
                    <span className="text-zinc-200 font-semibold font-serif">Veg, Egg, Non-Veg</span>
                  </div>

                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-1.5 text-zinc-500 font-medium mb-1 font-mono uppercase text-[9px]">
                      <Sparkles className="w-3 h-3 text-orange-400" /> Plan Targets
                    </div>
                    <span className="text-zinc-200 font-semibold font-serif">Deficit, Gain, Keto</span>
                  </div>

                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-1.5 text-zinc-500 font-medium mb-1 font-mono uppercase text-[9px]">
                      <Leaf className="w-3 h-3 text-emerald-400" /> Packaging
                    </div>
                    <span className="text-emerald-400 font-semibold font-serif">Compostable Tray</span>
                  </div>

                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-1.5 text-zinc-500 font-medium mb-1 font-mono uppercase text-[9px]">
                      <Settings className="w-3 h-3 text-indigo-400" /> Allergies
                    </div>
                    <span className="text-zinc-200 font-semibold font-serif">Custom Handling</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Subscription Terms with checkmark confirmations */}
              <div className="bg-[#121212]/90 p-5 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-16 h-16 text-[#FF7A00]" />
                </div>
                <h3 className="text-[10px] font-mono font-bold text-[#FF7A00] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
                  Subscription Guarantee
                </h3>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> Pausing Rules
                    </span>
                    <span className="text-emerald-400 font-bold font-mono">100% Flexible</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-orange-400 shrink-0" /> Daily Cut-off
                    </span>
                    <span className="text-zinc-200 font-semibold font-mono">6:00 PM (Previous Day)</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400 shrink-0" /> Credit Expiration
                    </span>
                    <span className="text-indigo-400 font-bold font-mono">Never Expires</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-amber-500 shrink-0" /> Concierge Access
                    </span>
                    <span className="text-zinc-200 font-semibold font-mono">24/7 WhatsApp Desk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with primary dynamic actions */}
            <div className="p-6 border-t border-white/5 bg-[#0e0e0e]/95 backdrop-blur-md flex flex-col gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Taazabites!%20I'm%20inquiring%20about%20delivery%20to%20my%20area%20and%20available%20slots.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-4 rounded-full bg-[#059669] hover:bg-[#047857] text-white text-center font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(5,150,105,0.25)] active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Phone className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                <span>Consult WhatsApp Concierge</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-white/75" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-4 px-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 text-center font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
