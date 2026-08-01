import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/primitives";

export default function PaymentIssuePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { error, fromState } = location.state || {};

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-x-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] -ml-48 -mt-48" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-zinc-500/5 rounded-full blur-[120px] -mr-48 -mb-48" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full relative z-10"
      >
        <div className="bg-zinc-900 rounded-3xl sm:rounded-[3rem] p-8 sm:p-12 border border-zinc-800 shadow-2xl shadow-black">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-10"
          >
            <XCircle className="h-12 w-12 text-rose-500" />
          </motion.div>

          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-[8px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4">
              Transaction Interrupted
            </div>
            <h1 className="text-4xl font-black text-white tracking-tightest leading-tight mb-3">
              Payment <span className="text-rose-500">Failed</span>.
            </h1>
            <p className="text-zinc-400 font-medium text-sm leading-relaxed max-w-sm mx-auto">
              {error || "Your payment could not be completed. Please check your payment details and try again."}
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-zinc-950/50 border border-zinc-800 rounded-3xl mb-12 flex items-start gap-5">
            <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
            <p className="text-xs font-bold text-zinc-400 leading-relaxed uppercase tracking-wider">
              Note: If any amount was debited from your bank account or UPI app, it will be automatically refunded to your original payment method within 3 to 5 business days.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => navigate("/plans", { state: fromState })}
              className="w-full py-8 rounded-[2rem] bg-zinc-100 hover:bg-white text-zinc-900 font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Payment Again
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate("/support")}
                className="flex items-center justify-center gap-2 py-4 px-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-[8px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all"
              >
                Contact Support
              </button>
              <button 
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 py-4 px-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-[8px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
