import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Wallet, 
  CreditCard, 
  ChevronRight, 
  Coffee, 
  Utensils, 
  Moon, 
  Salad, 
  Loader2, 
  ShieldCheck, 
  Info,
  Droplet,
  Leaf
} from 'lucide-react';
import { Button, Card, Badge } from '@/src/components/ui/primitives';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { ADD_ON_CATALOG, AddOnItemDef, AddOnService, WalletService } from '@/src/firebase/services';
import { format, addDays } from 'date-fns';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '@/src/utils/haptics';

interface AddOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string; // yyyy-MM-dd
  initialMealSlot?: "Breakfast" | "Lunch" | "Snacks" | "Dinner";
  onSuccess?: () => void;
}

export default function AddOnModal({
  isOpen,
  onClose,
  initialDate,
  initialMealSlot,
  onSuccess
}: AddOnModalProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedAddOn, setSelectedAddOn] = useState<AddOnItemDef | null>(null);

  // Form states for scheduling
  const [targetDate, setTargetDate] = useState<string>(
    initialDate || format(new Date(), 'yyyy-MM-dd')
  );
  const [targetSlot, setTargetSlot] = useState<"Breakfast" | "Lunch" | "Snacks" | "Dinner">(
    initialMealSlot || "Dinner"
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "cod">("wallet");
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialDate) setTargetDate(initialDate);
      if (initialMealSlot) setTargetSlot(initialMealSlot);
      fetchWallet();
    }
  }, [isOpen, initialDate, initialMealSlot]);

  const fetchWallet = async () => {
    if (!currentUser) return;
    try {
      const w = await WalletService.getWallet(currentUser.uid);
      setWalletBalance(w?.balance || 0);
    } catch (e) {
      console.warn("Wallet fetch error:", e);
    }
  };

  const categories = ["All", "Cold-Pressed Juices", "Protein Smoothies & Shakes", "Oats & Superfood Bowls", "Herbal Teas & Tonics"];

  const filteredItems = ADD_ON_CATALOG.filter(item => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  const handleOpenScheduleForm = (item: AddOnItemDef) => {
    triggerHaptic('light');
    setSelectedAddOn(item);
  };

  const handleScheduleSubmit = async () => {
    if (!selectedAddOn || !currentUser) {
      showToast('Please sign in to order add-ons', 'error');
      return;
    }

    const totalCost = selectedAddOn.price * quantity;
    if (paymentMethod === 'wallet' && walletBalance < totalCost) {
      showToast(`Insufficient Wallet Balance ( ₹${walletBalance} available, ₹${totalCost} needed). Switch to Cash on Delivery or Top Up Wallet.`, 'error');
      return;
    }

    setLoading(true);
    triggerHaptic('medium');

    try {
      const res = await AddOnService.orderAddOn({
        userId: currentUser.uid,
        addOn: selectedAddOn,
        date: targetDate,
        mealSlot: targetSlot,
        quantity,
        paymentMethod,
        notes
      });

      if (res.success) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast(`🥤 ${res.message}`, 'success');
        setSelectedAddOn(null);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      triggerHaptic('heavy');
      showToast(err?.message || 'Could not schedule add-on order.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const dayAfterStr = format(addDays(new Date(), 2), 'yyyy-MM-dd');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-[36px] shadow-2xl overflow-hidden flex flex-col z-10 text-white"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">Chef-Crafted Add-ons</span>
                <h2 className="text-xl font-black tracking-tight text-white">Cold-Pressed Juices, Smoothies & Oats</h2>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {!selectedAddOn ? (
              <>
                {/* Active Context Banner */}
                <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Scheduling for: <strong className="text-white font-bold">{targetDate === todayStr ? 'Today' : targetDate === tomorrowStr ? 'Tomorrow' : targetDate}</strong> ({targetSlot})
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Select Item Below</span>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { triggerHaptic('light'); setActiveCategory(cat); }}
                      className={cn(
                        "px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border",
                        activeCategory === cat 
                          ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20" 
                          : "bg-zinc-800/80 border-zinc-700/80 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grid of Add-ons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredItems.map((item) => (
                    <Card
                      key={item.id}
                      className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-3xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                    >
                      {item.badge && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="px-2.5 py-1 bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest rounded-full shadow-md">
                            {item.badge}
                          </span>
                        </div>
                      )}

                      <div className="flex items-start gap-3.5">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-zinc-800 relative bg-zinc-900">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block">{item.category}</span>
                          <h4 className="text-sm font-black text-white leading-snug line-clamp-2">{item.name}</h4>
                          <p className="text-[11px] text-zinc-400 line-clamp-2">{item.description}</p>
                        </div>
                      </div>

                      {/* Macros & Action Bar */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                          <span className="bg-zinc-800 px-2 py-0.5 rounded-md text-amber-300">{item.calories} Cal</span>
                          <span className="bg-zinc-800 px-2 py-0.5 rounded-md text-emerald-300">{item.protein}g Pro</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-white">₹{item.price}</span>
                          <Button
                            onClick={() => handleOpenScheduleForm(item)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs h-9 px-3.5 rounded-xl flex items-center gap-1 shadow-md shadow-emerald-500/20"
                          >
                            <Plus className="w-4 h-4" /> Add
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              /* Schedule & Slot Selection Step */
              <div className="space-y-6">
                <button
                  onClick={() => setSelectedAddOn(null)}
                  className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  ← Back to Add-ons Catalog
                </button>

                {/* Item Card Summary */}
                <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center gap-4">
                  <img src={selectedAddOn.image} alt={selectedAddOn.name} className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-zinc-800" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black uppercase text-emerald-400">{selectedAddOn.category}</span>
                    <h3 className="text-base font-black text-white">{selectedAddOn.name}</h3>
                    <p className="text-xs text-zinc-400 font-bold mt-0.5">₹{selectedAddOn.price} per item • {selectedAddOn.calories} Cal | {selectedAddOn.protein}g Protein</p>
                  </div>
                </div>

                {/* 1. Date Picker Options */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-400 block">1. Select Scheduled Date</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Today", val: todayStr },
                      { label: "Tomorrow", val: tomorrowStr },
                      { label: "Day After", val: dayAfterStr }
                    ].map(d => (
                      <button
                        key={d.val}
                        type="button"
                        onClick={() => { triggerHaptic('light'); setTargetDate(d.val); }}
                        className={cn(
                          "py-3 px-3 rounded-2xl border font-bold text-xs text-center transition-all",
                          targetDate === d.val
                            ? "bg-emerald-500 border-emerald-400 text-white font-black shadow-lg shadow-emerald-500/20"
                            : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        )}
                      >
                        {d.label}
                        <span className="block text-[9px] opacity-75 font-mono">{d.val.split('-').slice(1).join('/')}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-zinc-500 block mb-1">Or pick custom date:</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-2xl px-4 py-2.5 text-xs font-mono focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* 2. Meal Slot Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-400 block">2. Select Target Meal Slot</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { slot: "Breakfast", time: "07:30 - 09:00 AM", icon: Coffee },
                      { slot: "Lunch", time: "12:00 - 01:30 PM", icon: Utensils },
                      { slot: "Snacks", time: "04:30 - 06:00 PM", icon: Salad },
                      { slot: "Dinner", time: "07:30 - 09:00 PM", icon: Moon }
                    ].map(({ slot, time, icon: Icon }) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => { triggerHaptic('light'); setTargetSlot(slot as any); }}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between",
                          targetSlot === slot
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md"
                            : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Icon className="w-4 h-4" />
                          {targetSlot === slot && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div className="mt-2">
                          <span className="block font-black text-xs">{slot}</span>
                          <span className="block text-[9px] text-zinc-400 font-medium">{time}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Quantity & Instructions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-400 block mb-2">Quantity</label>
                    <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-700 rounded-2xl p-2 w-fit">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-xl bg-zinc-800 text-white font-black hover:bg-zinc-700"
                      >
                        -
                      </button>
                      <span className="font-mono font-black text-base px-2">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-xl bg-zinc-800 text-white font-black hover:bg-zinc-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-400 block mb-2">Special Instructions (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Extra chilled, deliver with dinner pod"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-2xl px-4 py-2.5 text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* 4. Payment Method */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-400 block">4. Payment Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3",
                        paymentMethod === 'wallet'
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                          : "bg-zinc-800/80 border-zinc-700 text-zinc-300"
                      )}
                    >
                      <Wallet className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="block font-black text-xs">Taaza Wallet</span>
                        <span className="block text-[10px] text-zinc-400">Bal: ₹{walletBalance}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3",
                        paymentMethod === 'cod'
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                          : "bg-zinc-800/80 border-zinc-700 text-zinc-300"
                      )}
                    >
                      <CreditCard className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <span className="block font-black text-xs">Pay on Delivery</span>
                        <span className="block text-[10px] text-zinc-400">Cash / UPI at delivery</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Order Summary & Confirm Button */}
                <div className="pt-4 border-t border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 font-bold">Total Amount ({quantity}x item):</span>
                    <span className="text-xl font-black text-white">₹{selectedAddOn.price * quantity}</span>
                  </div>

                  <Button
                    onClick={handleScheduleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" /> Schedule Add-on for {targetDate === todayStr ? 'Today' : targetDate} ({targetSlot})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
