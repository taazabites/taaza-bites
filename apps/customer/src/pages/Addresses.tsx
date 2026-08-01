"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 MapPin, 
 Home, 
 Building, 
 Plus, 
 Star, 
 Edit2, 
 Trash2, 
 Loader2,
 CheckCircle2,
 X,
 Briefcase,
 Navigation
} from "lucide-react";
import { Button, Card } from "@/src/components/ui/primitives";
import { useToast } from "@/src/context/ToastContext";
import { useAuth } from "@/src/context/AuthContext";
import { AddressService } from "../firebase/services";
import { Address } from "../firebase/collections";
import { useNavigate } from "react-router-dom";

export default function PremiumAddressesPage() {
 const { currentUser } = useAuth();
 const { showToast } = useToast();
 const navigate = useNavigate();

 const [loading, setLoading] = useState(true);
 const [addresses, setAddresses] = useState<Address[]>([]);
 const [isDeleting, setIsDeleting] = useState<string | null>(null);

 useEffect(() => {
  if (!currentUser) {
  setLoading(false);
  return;
  }

  const fetchAddresses = async () => {
    try {
      const list = await AddressService.getAddresses(currentUser.uid);
      setAddresses(list);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAddresses();
 }, [currentUser]);

 const handleSetDefault = async (id: string) => {
  if (!currentUser) return;
  try {
    await AddressService.updateAddress(id, { default: true });
    setAddresses(addresses.map(a => ({ ...a, default: a.id === id })));
    showToast("Primary Delivery Zone updated successfully.", "success");
  } catch (err) {
    showToast("Failed to sync primary address update.", "error");
  }
 };

 const handleDelete = async (id: string) => {
  if (!currentUser) return;
  setIsDeleting(id);
  try {
    await AddressService.deleteAddress(id);
    setAddresses(addresses.filter(a => a.id !== id));
    showToast("Drop zone removed from your ledger.", "success");
  } catch (err) {
    showToast("Error removing location.", "error");
  } finally {
    setIsDeleting(null);
  }
 };

 if (loading) {
  return (
   <div className="max-w-5xl mx-auto p-6 lg:p-10 flex flex-col items-center justify-center min-h-[60vh]">
    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
    </div>
    <p className="text-zinc-500 font-medium animate-pulse">Syncing Drop Zones...</p>
   </div>
  );
 }

 return (
  <div className="max-w-5xl mx-auto p-6 lg:p-12">
   <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div className="space-y-3">
     <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
      <Navigation className="h-3 w-3" /> Logistics
     </div>
     <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900">
      Delivery Zones
     </h1>
     <p className="text-zinc-500 text-lg max-w-xl leading-relaxed">
      Manage your calibrated delivery locations for seamless, precision nutrition drop-offs.
     </p>
    </div>
    <Button 
      onClick={() => navigate('/subscribe/address')} 
      className="h-14 px-8 rounded-2xl bg-zinc-900 hover:bg-black text-white font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-zinc-900/10 active:scale-[0.98]"
    >
     <Plus className="h-5 w-5" /> Add New Zone
    </Button>
   </div>

   {addresses.length === 0 ? (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-24 px-6 text-center bg-white rounded-[3rem] border border-zinc-100 shadow-sm"
    >
     <div className="inline-flex p-8 bg-zinc-50 rounded-[2rem] mb-6 border border-zinc-100">
      <MapPin className="h-12 w-12 text-zinc-400" />
     </div>
     <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">No Drop Zones Configured</h3>
     <p className="text-zinc-500 max-w-md mx-auto mb-8 text-lg">
      Establish your primary location to begin receiving calibrated metabolic fuel.
     </p>
     <Button 
      onClick={() => navigate('/subscribe/address')} 
      variant="outline" 
      className="h-14 px-8 rounded-2xl border-2 border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-50 hover:border-zinc-300 transition-all"
     >
      Initialize Mapping
     </Button>
    </motion.div>
   ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
     <AnimatePresence>
       {addresses.map((address) => (
        <motion.div
          key={address.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          layout
        >
          <Card 
            className={`relative overflow-hidden p-8 rounded-[2.5rem] border-2 transition-all duration-300 group ${
              address.default 
                ? "border-emerald-500 bg-white shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.25)]" 
                : "border-zinc-100 bg-white hover:border-emerald-200 hover:shadow-lg"
            }`}
          >
           {/* Primary Indicator Line */}
           {address.default && (
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />
           )}

           <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-[1.5rem] flex items-center justify-center transition-colors ${
              address.addressType === 'Home' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : 
              address.addressType === 'Work' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 
              'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
            }`}>
             {address.addressType === 'Home' ? <Home className="h-6 w-6" /> : 
              address.addressType === 'Work' ? <Building className="h-6 w-6" /> : 
              <Briefcase className="h-6 w-6" />}
            </div>
            
            <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
             <button 
                onClick={() => navigate('/subscribe/address', { state: { editAddress: address } })} 
                className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-600"
             >
               <Edit2 className="h-4 w-4" />
             </button>
             <button 
                onClick={() => handleDelete(address.id)} 
                disabled={isDeleting === address.id}
                className="p-3 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors text-rose-500 disabled:opacity-50"
             >
               {isDeleting === address.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
             </button>
            </div>
           </div>

           <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{address.addressType} Zone</span>
                {address.default && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-bold uppercase tracking-wider">Active</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-zinc-900 leading-tight">
                {address.houseNumber} {address.building && `, ${address.building}`}
              </h3>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-zinc-600">{address.street}</p>
              <p className="text-sm text-zinc-500 font-medium">{address.area}, {address.city}</p>
              <p className="text-sm font-mono text-zinc-400">{address.state} {address.pincode}</p>
            </div>

            {address.deliveryInstructions && (
              <div className="pt-4 border-t border-zinc-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Drop Instructions</p>
                <p className="text-sm text-zinc-600 italic">"{address.deliveryInstructions}"</p>
              </div>
            )}
           </div>

           <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
            {address.default ? (
             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
              <CheckCircle2 className="h-4 w-4" /> Selected For Deliveries
             </div>
            ) : (
             <button 
                onClick={() => handleSetDefault(address.id)} 
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-600 transition-colors py-2"
             >
              <Star className="h-4 w-4" /> Make Primary Zone
             </button>
            )}
           </div>
          </Card>
        </motion.div>
       ))}
     </AnimatePresence>
    </div>
   )}
  </div>
 );
}

