import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, ShieldCheck, Cpu, Server, Network, Layers, Sparkles, CheckCircle2, Lock } from "lucide-react";

interface ArchitectureBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureBlueprintModal({ isOpen, onClose }: ArchitectureBlueprintModalProps) {
  const collections = [
    { name: "deliveryPartners", desc: "Driver profiles, vehicle specs, Aadhaar, license, rating, availability status" },
    { name: "deliveryRoutes", desc: "Zone definitions, PIN code clusters, geohash path, driver assignments, capacity" },
    { name: "deliveryAssignments", desc: "Batch mapping between driver ID, order list, and route sequence" },
    { name: "deliveries", desc: "Individual meal box delivery lifecycle (Pending, Out for Delivery, Delivered)" },
    { name: "deliveryProof", desc: "Geotagged GPS stamp, photo proof, customer PIN, thermal bag return tag" },
    { name: "deliverySlots", desc: "Time slot caps (Morning/Afternoon/Evening), booked count, auto-block status" },
    { name: "vehicles", desc: "Fleet inventory (Ather/Ola EVs, Vans), battery charge, maintenance log" },
    { name: "driverAttendance", desc: "Daily shift check-ins, shift duration, payout calculation" },
    { name: "driverRatings", desc: "Customer review scores, tip logs, feedback tags" },
    { name: "deliveryIncidents", desc: "Failed delivery logs, gated security rejections, damaged meal replacements" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl p-0 overflow-hidden rounded-2xl shadow-2xl">
        <DialogHeader className="p-5 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-emerald-400" />
              Taaza Bites Logistics Engineering Blueprint (DMS)
            </DialogTitle>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
              20,000 Meals/Day Bengaluru Scale
            </Badge>
          </div>
          <DialogDescription className="text-xs text-zinc-400 mt-1">
            Production Architecture, 10 Firestore Collections, Security Rules, and Route Clustering
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[550px] overflow-y-auto">
          
          {/* Architecture Pillars */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
              <Network className="h-4 w-4 text-emerald-400" />
              Core System Architecture
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
                <span className="font-bold text-white block">1. Geohash Route Planner</span>
                <span className="text-zinc-400 text-[11px] mt-1 block">
                  Clusters subscription deliveries by 6-character Geohash & PIN codes to generate multi-stop routes with &lt; 8% travel overlap.
                </span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
                <span className="font-bold text-white block">2. Real-Time Dispatch</span>
                <span className="text-zinc-400 text-[11px] mt-1 block">
                  WebSockets & Firestore snapshot listeners push batch updates to driver mobile apps with offline thermal bag scanning.
                </span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
                <span className="font-bold text-white block">3. Proof & Reverse Logistics</span>
                <span className="text-zinc-400 text-[11px] mt-1 block">
                  Validates GPS proximity within 50m before photo/OTP proof capture. Tracks empty insulated meal bag returns on next delivery.
                </span>
              </div>
            </div>
          </div>

          {/* Firestore Collections Schema */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
              <Database className="h-4 w-4 text-amber-400" />
              10 Firestore Collections Schema
            </h4>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-3 p-2.5 bg-zinc-900 font-semibold text-zinc-400 border-b border-zinc-800">
                <span>COLLECTION</span>
                <span className="col-span-2">PURPOSE & DATA STRUCTURE</span>
              </div>
              {collections.map((c, i) => (
                <div key={i} className="grid grid-cols-3 p-2.5 border-b border-zinc-800/50 hover:bg-zinc-900/30">
                  <span className="text-emerald-400 font-mono font-bold">{c.name}</span>
                  <span className="col-span-2 text-zinc-300">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Rules Snippet */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-indigo-400" />
              Security Rules & Role Access Matrix
            </h4>
            <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl text-xs font-mono text-zinc-300 space-y-1">
              <p className="text-emerald-400 font-bold">// Driver status update restriction</p>
              <p>match /deliveries/{`{deliveryId}`} &#123;</p>
              <p className="pl-4">allow update: if request.auth.uid == resource.data.driverId || hasRole('dispatch_manager');</p>
              <p className="pl-4">allow read: if request.auth != null;</p>
              <p>&#125;</p>
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <Button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl">
            Close Technical Blueprint
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
