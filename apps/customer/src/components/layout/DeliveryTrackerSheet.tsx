import React from "react";
import { BottomSheet } from "../ui/BottomSheet";
import { MapPin, Clock, CheckCircle2, Phone, User, Package, Navigation } from "lucide-react";
import { Button } from "../ui/primitives";
import { motion } from "framer-motion";

export function DeliveryTrackerSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Live Delivery Status">
      <div className="space-y-6 pb-6 px-1">
         
         <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-white/5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            
            <div className="flex justify-between items-start mb-8 relative z-10">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Status</p>
                 <h2 className="text-2xl font-black text-zinc-900 dark:text-white">On the way</h2>
                 <p className="text-sm text-zinc-500 font-medium mt-1">Arriving in <span className="text-zinc-900 dark:text-white font-bold">12 mins</span></p>
               </div>
               <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center animate-pulse">
                  <Navigation className="w-6 h-6" />
               </div>
            </div>

            <div className="relative z-10 pl-4 space-y-6">
               <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-zinc-200 dark:bg-zinc-800" />
               
               <div className="relative flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-zinc-900 z-10" />
                  <div>
                     <p className="text-sm font-bold text-zinc-900 dark:text-white">Kitchen</p>
                     <p className="text-xs text-zinc-500">Meal prepared • 07:15 AM</p>
                  </div>
               </div>
               <div className="relative flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-zinc-900 z-10" />
                  <div>
                     <p className="text-sm font-bold text-zinc-900 dark:text-white">Out for delivery</p>
                     <p className="text-xs text-zinc-500">Picked up by driver • 07:45 AM</p>
                  </div>
               </div>
               <div className="relative flex items-center gap-4 opacity-50">
                  <div className="w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 ring-4 ring-white dark:ring-zinc-900 z-10" />
                  <div>
                     <p className="text-sm font-bold text-zinc-900 dark:text-white">Home Address</p>
                     <p className="text-xs text-zinc-500">Expected • 08:15 AM</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-zinc-500" />
               </div>
               <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Ramesh K.</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Delivery Partner</p>
               </div>
            </div>
            <button className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
               <Phone className="w-4 h-4" />
            </button>
         </div>

         <Button 
            className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
            onClick={onClose}
         >
            Close Tracker
         </Button>
      </div>
    </BottomSheet>
  );
}
