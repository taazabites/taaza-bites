import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, LogOut, RefreshCw, Clock } from 'lucide-react';

interface AutoLogoutWarningModalProps {
  isOpen: boolean;
  secondsRemaining: number;
  onExtendSession: () => void;
  onLogout: () => void;
  isExtending?: boolean;
  userEmail?: string;
  userName?: string;
  userRole?: string;
}

export const AutoLogoutWarningModal: React.FC<AutoLogoutWarningModalProps> = ({
  isOpen,
  secondsRemaining,
  onExtendSession,
  onLogout,
  isExtending = false,
  userEmail,
  userName,
  userRole
}) => {
  if (!isOpen) return null;

  const formattedSeconds = secondsRemaining < 10 ? `0${secondsRemaining}` : `${secondsRemaining}`;
  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / 60) * 100));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Dark Blurred Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="relative w-full max-w-md bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.18)] p-6 sm:p-8 text-white space-y-6 overflow-hidden"
          >
            {/* Glowing Accent Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />

            {/* Header with Icon */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Session Expiring Soon
                </h3>
                <p className="text-xs text-amber-400/90 font-medium flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  Security Timeout Warning
                </p>
              </div>
            </div>

            {/* Admin User Info Pill */}
            {(userEmail || userName) && (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-semibold">Logged In As</span>
                  <span className="text-zinc-200 font-medium truncate block">{userName || userEmail}</span>
                </div>
                {userRole && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold text-[11px] border border-amber-500/20 shrink-0">
                    {userRole}
                  </span>
                )}
              </div>
            )}

            {/* Countdown Box & Progress Bar */}
            <div className="text-center py-4 bg-gradient-to-b from-amber-500/5 to-transparent rounded-2xl border border-amber-500/20 px-4 space-y-3">
              <span className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-widest block">
                Automatic Logout In
              </span>
              <div className="text-5xl font-black font-mono tracking-tight text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                00:{formattedSeconds}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                <div 
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Warning Text */}
            <p className="text-xs text-zinc-400 leading-relaxed text-center">
              Your authentication session will expire in <span className="text-amber-300 font-bold">{secondsRemaining} seconds</span>. Please confirm if you want to extend your active session or log out.
            </p>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onExtendSession}
                disabled={isExtending}
                className="flex-1 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isExtending ? 'animate-spin' : ''}`} />
                {isExtending ? 'Extending...' : 'Stay Logged In'}
              </button>
              
              <button
                type="button"
                onClick={onLogout}
                className="bg-zinc-900 hover:bg-zinc-800 hover:text-white active:scale-[0.98] text-zinc-300 font-semibold py-3.5 px-4 rounded-xl border border-zinc-800 transition duration-150 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <LogOut className="w-4 h-4" />
                Log Out Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
