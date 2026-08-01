import React, { useState } from "react";
import { BottomSheet } from "../ui/BottomSheet";
import { Wallet as WalletIcon, Tag, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/primitives";
import { useToast } from "@/src/context/ToastContext";
import { triggerHaptic } from "@/src/utils/haptics";

export function WalletSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"balance" | "coupons">("balance");

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Wallet & Coupons">
      <div className="space-y-6 pb-6 px-1">

        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5">
           <button
             onClick={() => setActiveTab("balance")}
             className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
               activeTab === "balance" 
                 ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" 
                 : "text-zinc-500"
             }`}
           >
             <WalletIcon className="w-3 h-3" /> Balance
           </button>
           <button
             onClick={() => setActiveTab("coupons")}
             className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
               activeTab === "coupons" 
                 ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" 
                 : "text-zinc-500"
             }`}
           >
             <Tag className="w-3 h-3" /> Coupons
           </button>
        </div>

        {activeTab === "balance" && (
           <div className="space-y-4">
              <div className="p-8 bg-gradient-to-br from-zinc-900 via-emerald-950 to-zinc-950 text-white rounded-3xl relative overflow-hidden border border-white/10 text-center">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 relative z-10">Available Balance</p>
                 <h2 className="text-4xl font-black relative z-10">₹1,450</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/5 text-center">
                    <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Deposit</p>
                    <p className="text-xl font-black text-zinc-900 dark:text-white">₹1,200</p>
                 </div>
                 <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20 text-center">
                    <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 mb-1">Bonus</p>
                    <p className="text-xl font-black text-amber-600 dark:text-amber-400">₹250</p>
                 </div>
              </div>

              <Button 
                onClick={() => {
                   triggerHaptic('medium');
                   showToast('Redirecting to Payment Gateway...', 'info');
                }}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                 <Plus className="w-4 h-4" /> Add Money
              </Button>
           </div>
        )}

        {activeTab === "coupons" && (
           <div className="space-y-4">
              <div className="flex gap-2">
                 <input type="text" placeholder="ENTER PROMO CODE" className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase" />
                 <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-[10px] uppercase tracking-widest rounded-xl px-4 active:scale-95">Apply</Button>
              </div>

              <div className="space-y-3 pt-4">
                 <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full" />
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">TAAZA100</p>
                          <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase">₹100 OFF on Subs</p>
                       </div>
                       <Button size="sm" className="bg-emerald-600 text-white text-[9px] h-7 px-3 rounded-lg font-black uppercase tracking-wider active:scale-95">Apply</Button>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Valid on orders above ₹1,500.</p>
                 </div>
                 
                 <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-white">PROTEIN30</p>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase">30% Cashback</p>
                       </div>
                       <Button size="sm" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] h-7 px-3 rounded-lg font-black uppercase tracking-wider active:scale-95">Apply</Button>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">Up to ₹250 on High Protein plans.</p>
                 </div>
              </div>
           </div>
        )}
      </div>
    </BottomSheet>
  );
}
