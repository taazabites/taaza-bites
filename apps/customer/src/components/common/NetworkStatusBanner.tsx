import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showRestoredToast, setShowRestoredToast] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredToast(true);
      const timer = setTimeout(() => setShowRestoredToast(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredToast(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {/* Offline Alert Bar */}
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-0 inset-x-0 z-[9999] bg-rose-600 text-white px-4 py-2.5 shadow-lg border-b border-rose-700/50 flex items-center justify-between text-xs sm:text-sm font-semibold"
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-center text-center">
            <WifiOff className="w-4 h-4 animate-bounce shrink-0" />
            <span>
              You are currently offline. Changes will sync automatically when connection is restored.
            </span>
          </div>
        </motion.div>
      )}

      {/* Connection Restored Toast */}
      {isOnline && showRestoredToast && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-4 right-4 z-[9999] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-500 flex items-center gap-3 text-xs sm:text-sm font-bold"
        >
          <Wifi className="w-4 h-4 text-emerald-200" />
          <span>Connection Restored! Syncing protocol...</span>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-200 ml-1" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatusBanner;
