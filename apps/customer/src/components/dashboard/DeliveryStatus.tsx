import { motion } from "framer-motion";
import { MapPin, Clock, Package, UtensilsCrossed, User, Truck, Phone } from "lucide-react";
import { Card } from "@/src/components/ui/primitives";

interface DeliveryStatusProps {
  order: any;
}

export default function DeliveryStatus({ order }: DeliveryStatusProps) {
  if (!order) {
    return (
      <Card className="p-10 border-dashed border-2 border-zinc-200/50 bg-white/50 backdrop-blur-sm rounded-[2.5rem] flex flex-col justify-center items-center text-center">
        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-zinc-300" />
        </div>
        <h3 className="font-black tracking-tight text-xl text-zinc-900">No Active Logistics</h3>
        <p className="text-sm font-bold text-zinc-400 mt-1">Your next scheduled delivery will appear here.</p>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-500/20 text-emerald-400';
      case 'shipped': return 'bg-blue-500/20 text-blue-400';
      case 'pending': return 'bg-orange-500/20 text-orange-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 sm:p-8 md:p-10 bg-zinc-950 text-white border-none rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden group">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-colors duration-1000" />
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
               <Truck className="h-6 w-6 text-emerald-400" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Live Tracking</p>
                <h3 className="font-black text-3xl tracking-tighter text-white">Logistics</h3>
             </div>
          </div>
          <div className="text-right">
             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-lg ${getStatusColor(order.deliveryStatus || order.status)}`}>
                 {order.deliveryStatus || order.status || 'En Route'}
             </span>
             <motion.div 
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="flex items-center justify-end gap-1.5 mt-2"
             >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Live Sync</span>
             </motion.div>
          </div>
        </div>
        
        <div className="flex gap-6 items-center relative z-10 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
             <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-inner shrink-0">
                {order.mealImage ? (
                  <img src={order.mealImage} alt={order.mealName} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <UtensilsCrossed className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
             </div>
             <div className="flex-1">
                <p className="font-black text-2xl tracking-tight text-white line-clamp-1">{order.mealName || 'Metabolic Bio-Box'}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> {order.deliverySlot || 'Lunch (12:00 PM)'}
                  </p>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-700" />
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" /> Home Sector
                  </p>
                </div>
             </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-8 relative z-10">
            <div>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Estimated Arrival</p>
                <div className="flex items-center gap-2">
                   <p className="text-3xl font-black tracking-tighter text-emerald-400">{order.eta || '1:15'}</p>
                   <span className="text-sm font-bold text-emerald-400/50 mt-1">PM</span>
                </div>
            </div>
            <div>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-2">Assigned Courier</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/5 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                   </div>
                   <div>
                     <p className="font-black text-white">{order.driverName || 'Courier Alpha'}</p>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ID: D-4921</p>
                   </div>
                   <button className="ml-auto w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-emerald-950 transition-colors">
                      <Phone className="w-4 h-4" />
                   </button>
                </div>
            </div>
        </div>
      </Card>
    </motion.div>
  );
}
