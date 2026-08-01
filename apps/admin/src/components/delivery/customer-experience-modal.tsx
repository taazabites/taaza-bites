import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Phone, Star, Clock, AlertCircle, CheckCircle2, Navigation, MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface CustomerExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryItem: any;
}

export function CustomerExperienceModal({ isOpen, onClose, deliveryItem }: CustomerExperienceModalProps) {
  if (!deliveryItem) return null;

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRatingSubmit = () => {
    setIsSubmitted(true);
    toast.success("Thank you for your rating!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md p-0 overflow-hidden rounded-2xl shadow-2xl">
        <DialogHeader className="p-5 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-emerald-400" />
              Customer Live Order Tracker
            </DialogTitle>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
              Customer App View
            </Badge>
          </div>
          <DialogDescription className="text-xs text-zinc-400 mt-1">
            Simulated view of customer's mobile experience for order <span className="text-emerald-400 font-mono font-bold">{deliveryItem.orderId}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[500px] overflow-y-auto">
          
          {/* Status Tracker Line */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Estimated Delivery</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">08:25 AM (In 6 mins)</p>
              </div>
              <Badge className="bg-emerald-500 text-black font-extrabold text-[10px] uppercase">
                {deliveryItem.status || "Out For Delivery"}
              </Badge>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-4 gap-1 pt-2">
              <div className="h-1.5 bg-emerald-500 rounded-full" />
              <div className="h-1.5 bg-emerald-500 rounded-full" />
              <div className="h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <div className="h-1.5 bg-zinc-800 rounded-full" />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>Kitchen</span>
              <span>Packed</span>
              <span className="text-emerald-400 font-bold">On the way</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Assigned Driver Card */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center font-bold text-emerald-400">
                {(deliveryItem.driverName || 'DP')[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{deliveryItem.driverName || "Karthik V"}</p>
                <p className="text-[11px] text-zinc-400">Ather 450X (EV) • ★ 4.95</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => toast.info(`Calling driver at +91 98765 43210`)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-8 rounded-lg cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5 mr-1" /> Call Driver
            </Button>
          </div>

          {/* Customer Self-Service Cut-Off Actions */}
          <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-2">
            <p className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400" /> Subscription Delivery Controls
            </p>
            <p className="text-[11px] text-zinc-400">
              Need changes for tomorrow's meal? Cut-off time is <span className="text-amber-400 font-mono font-bold">10:00 PM tonight</span>.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Tomorrow's delivery paused successfully.")}
                className="text-[11px] border-zinc-800 text-zinc-300 hover:bg-zinc-800 h-8"
              >
                Pause Tomorrow
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Address update window open.")}
                className="text-[11px] border-zinc-800 text-zinc-300 hover:bg-zinc-800 h-8"
              >
                Change Address
              </Button>
            </div>
          </div>

          {/* Delivery Rating Box */}
          <div className="p-4 border border-zinc-800 bg-zinc-900/50 rounded-xl space-y-3">
            <p className="text-xs font-bold text-white uppercase font-mono">Rate Today's Delivery Experience</p>
            {!isSubmitted ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating ? "text-amber-400 fill-amber-400" : "text-zinc-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Optional notes for delivery partner..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs p-2 rounded-lg text-white"
                />
                <Button
                  onClick={handleRatingSubmit}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs h-8 rounded-lg"
                >
                  Submit Rating
                </Button>
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Rating logged! Thank you for your feedback.
              </div>
            )}
          </div>

        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <Button onClick={onClose} className="bg-zinc-800 text-white hover:bg-zinc-700 font-bold text-xs rounded-xl">
            Close Tracker
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
