/**
 * Full-height right-side Log In / Sign Up drawer (shop surfaces).
 */
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { Logo } from "./Logo";
import { PORTAL_LINKS } from "../config";

interface ShopAuthDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Optional context for post-login destination */
  intent?: "subscriptions" | "deliveries" | "profile";
}

export const ShopAuthDrawer: React.FC<ShopAuthDrawerProps> = ({
  open,
  onClose,
  intent = "subscriptions",
}) => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPhone("");
      setError(null);
    }
  }, [open]);

  const cleanedPhone = phone.replace(/\D/g, "").slice(0, 10);

  const goToLogin = (mode: "otp" | "password") => {
    if (cleanedPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    const params = new URLSearchParams({
      phone: cleanedPhone,
      mode,
      intent,
    });
    window.location.href = `${PORTAL_LINKS.customerLogin}?${params.toString()}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[6000] flex justify-end" role="dialog" aria-modal="true" aria-label="Log In or Sign Up">
          <motion.button
            type="button"
            aria-label="Close login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/55 border-0 cursor-pointer"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="relative h-full w-full sm:w-[min(420px,92vw)] md:w-[400px] bg-[#6B9F3C] shadow-[-12px_0_40px_rgba(0,0,0,0.25)] flex flex-col"
          >
            {/* Green header */}
            <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-8 flex flex-col flex-1 min-h-0">
              <div className="flex items-center gap-3 text-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Back"
                >
                  <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
                </button>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Log In or Sign Up
                </h2>
              </div>

              <div className="flex-1 flex items-center justify-center py-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1A1A1A] shadow-lg flex items-center justify-center overflow-hidden">
                  <Logo showText={false} size="lg" />
                </div>
              </div>

              {/* White form sheet */}
              <div className="bg-white rounded-t-[1.75rem] sm:rounded-t-[2rem] -mx-4 sm:-mx-5 px-5 sm:px-6 pt-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
                <label className="block text-sm text-zinc-500 mb-2" htmlFor="shop-auth-phone">
                  Mobile Number
                </label>
                <input
                  id="shop-auth-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="Enter number"
                  value={cleanedPhone}
                  onChange={(e) => {
                    setError(null);
                    setPhone(e.target.value);
                  }}
                  className="w-full h-12 px-4 rounded-xl border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#6B9F3C] focus:ring-2 focus:ring-[#6B9F3C]/20 text-base"
                />
                {error && (
                  <p className="mt-2 text-xs text-red-600 font-medium">{error}</p>
                )}

                <button
                  type="button"
                  onClick={() => goToLogin("otp")}
                  className="mt-5 w-full h-12 rounded-xl bg-[#6B9F3C] hover:bg-[#5a8a32] text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                >
                  Continue with OTP
                </button>

                <button
                  type="button"
                  onClick={() => goToLogin("password")}
                  className="mt-3 w-full h-12 rounded-xl bg-white border-2 border-[#6B9F3C] text-[#6B9F3C] font-semibold text-sm sm:text-base hover:bg-[#6B9F3C]/5 transition-colors cursor-pointer"
                >
                  Continue with Password
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShopAuthDrawer;
