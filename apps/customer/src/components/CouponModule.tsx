import { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { Coupon } from "../firebase/collections";
import { CouponService, ReferralService } from "../firebase/services";
import { Button, Card } from "./ui/primitives";
import { Tag, Loader2, CheckCircle2, XCircle, Users } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CouponModuleProps {
  onApply: (coupon: Coupon | null) => void;
  subtotal: number;
  planId: string;
}

export function CouponModule({ onApply, subtotal, planId }: CouponModuleProps) {
  const { currentUser } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [appliedReferral, setAppliedReferral] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const durations = { light: 15, medium: 30, heavy: 50 };
      navigator.vibrate(durations[type]);
    }
  };

  const handleApply = async () => {
    if (!couponCode || !currentUser) return;
    setLoading(true);
    setError(null);
    triggerHaptic('light');

    try {
      // 1. Try standard coupon first
      const result = await CouponService.validateCoupon(couponCode, currentUser.uid, subtotal, planId);
      
      if (result.valid) {
        const coupon = result.coupon!;
        setAppliedCoupon(coupon);
        setAppliedReferral(null);
        onApply(coupon);
        triggerHaptic('medium');
        return;
      }

      // 2. Try referral code if coupon fails
      const refResult = await ReferralService.validateReferralCode(couponCode, currentUser.uid);
      if (refResult.valid) {
        // Create a mock coupon object for UI consistency
        const referralAsCoupon: any = {
          id: `ref_${refResult.referrer.uid}`,
          code: couponCode.toUpperCase(),
          type: 'fixed',
          discountValue: 0, // No immediate discount, reward comes after first delivery
          description: refResult.message,
          active: true,
          isReferral: true,
          referrerId: refResult.referrer.uid
        };
        setAppliedReferral(referralAsCoupon);
        setAppliedCoupon(null);
        onApply(referralAsCoupon);
        triggerHaptic('medium');
        return;
      }

      setError(result.message || refResult.message || "Invalid code");
      triggerHaptic('heavy');
    } catch (err) {
      console.error("Validation error:", err);
      setError("Failed to validate code");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    triggerHaptic('light');
    setAppliedCoupon(null);
    setAppliedReferral(null);
    setCouponCode("");
    onApply(null);
  };

  const activePromo = appliedCoupon || appliedReferral;

  return (
    <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-[32px] bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden">
      <motion.div layout className="space-y-4">
        <div className="flex items-center gap-2">
          {appliedReferral ? (
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><Users className="h-4 w-4 text-amber-500" /></motion.div>
          ) : (
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><Tag className="h-4 w-4 text-emerald-500" /></motion.div>
          )}
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">
            {appliedReferral ? "Referral Applied" : "Promo Code"}
          </h3>
        </div>

        <AnimatePresence mode="wait">
          {activePromo ? (
            <motion.div 
              key="applied"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className={cn(
                "flex items-center justify-between p-4 border rounded-2xl",
                appliedReferral 
                  ? "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30" 
                  : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
              )}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={cn("h-5 w-5", appliedReferral ? "text-amber-600" : "text-emerald-600")} />
                <div>
                  <div className={cn("text-sm font-bold", appliedReferral ? "text-amber-900 dark:text-amber-100" : "text-emerald-900 dark:text-emerald-100")}>
                    {activePromo.code}
                  </div>
                  <div className={cn("text-[10px] font-black uppercase tracking-widest", appliedReferral ? "text-amber-600" : "text-emerald-600")}>
                    {appliedReferral 
                      ? "₹250 Referral Reward Activated" 
                      : activePromo.type === 'percentage' 
                      ? `${activePromo.discountValue}% OFF Applied` 
                      : `₹${activePromo.discountValue} OFF Applied`}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleRemove}
                className={cn("text-xs font-black uppercase tracking-widest px-2 py-1 hover:opacity-80 transition-opacity", appliedReferral ? "text-amber-600" : "text-emerald-600")}
              >
                Remove
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout
              className="space-y-3"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="flex-1 min-w-0 bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <Button 
                  onClick={handleApply}
                  disabled={loading || !couponCode}
                  className="rounded-xl px-6 bg-zinc-950 text-white font-black hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "APPLY"}
                </Button>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-500 px-1 overflow-hidden"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
}
