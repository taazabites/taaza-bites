import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight, ShieldCheck, Sun, Moon, Coffee, RefreshCcw } from "lucide-react";
import { Button, Card } from "../components/ui/primitives";
import { cn } from "../lib/utils";
import { useToast } from "../context/ToastContext";

export default function DeliverySlot() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const selectedPlan = location.state?.selectedPlan || JSON.parse(localStorage.getItem('taaza_selected_plan') || 'null');

  const [selectedSlot, setSelectedSlot] = useState<string>(() => {
    if (selectedPlan?.deliverySlot) return selectedPlan.deliverySlot;
    if (selectedPlan?.deliveryTiming) {
      const t = selectedPlan.deliveryTiming.toLowerCase();
      if (t.includes('morning')) return 'morning';
      if (t.includes('lunch')) return 'lunch';
      if (t.includes('evening')) return 'evening';
      if (t.includes('split')) return 'split';
    }
    return "";
  });

  const slots = [
    { id: 'morning', label: 'Morning', time: '7:30 - 9:00 AM', icon: Coffee, desc: 'Freshly prepared at 4 AM' },
    { id: 'lunch', label: 'Lunch hour', time: '12:00 - 1:30 PM', icon: Sun, desc: 'Delivered warm and ready' },
    { id: 'evening', label: 'Evening', time: '6:30 - 8:00 PM', icon: Moon, desc: 'Perfect for dinner' },
    { id: 'split', label: 'Split Combo', time: 'Custom Schedule', icon: RefreshCcw, desc: 'Morning + Evening delivery' }
  ];

  const handleProceed = () => {
    if (!selectedSlot) {
      showToast("Please select a delivery timing slot", "info");
      return;
    }

    const slotLabel = slots.find(s => s.id === selectedSlot)?.label || "Morning";
    const slotTime = slots.find(s => s.id === selectedSlot)?.time || "";

    const timing = `${slotLabel} (${slotTime})`;
    
    navigate("/checkout", { 
      state: { 
        ...location.state, 
        selectedPlan: {
          ...selectedPlan,
          deliveryTiming: timing
        },
        deliverySlot: selectedSlot
      } 
    });
  };

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-4">
            <ShieldCheck className="w-3 h-3" /> Step 4: Schedule Activation
          </div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tightest mb-4">Choose Delivery Slot</h1>
          <p className="text-zinc-500 font-medium max-w-md mx-auto">Select your preferred timing for meal delivery so we can deliver it fresh and on time.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {slots.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSlot(s.id)}
              className={cn(
                "p-6 rounded-[2.5rem] text-left border-2 transition-all relative overflow-hidden group",
                selectedSlot === s.id 
                  ? "bg-white border-emerald-500 shadow-xl shadow-emerald-500/10" 
                  : "bg-white border-zinc-100 hover:border-zinc-200"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                selectedSlot === s.id ? "bg-emerald-500 text-white" : "bg-zinc-50 text-zinc-400"
              )}>
                <s.icon className="h-6 w-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{s.label}</p>
              <h3 className="text-xl font-black text-zinc-900 mb-1">{s.time}</h3>
              <p className="text-xs text-zinc-500 font-medium">{s.desc}</p>
              
              {selectedSlot === s.id && (
                <div className="absolute top-6 right-6">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Clock className="w-3 h-3" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleProceed}
            disabled={!selectedSlot}
            className="w-full py-8 rounded-3xl bg-zinc-900 hover:bg-black text-white font-black text-lg shadow-2xl shadow-zinc-900/10 group disabled:opacity-50"
          >
            Finalize Subscription
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <button 
            onClick={() => navigate(-1)}
            className="w-full text-xs font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors py-2"
          >
            ← Back to Address
          </button>
        </div>
      </div>
    </main>
  );
}
