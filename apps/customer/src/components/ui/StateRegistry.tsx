import React from 'react';
import { motion } from 'motion/react';
import { 
  WifiOff, 
  AlertCircle, 
  Search, 
  Lock, 
  Clock, 
  CheckCircle2, 
  Inbox, 
  Loader2,
  SignalLow,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface StateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

// 1. Loading State (Molecular Spinner)
export const LoadingState: React.FC<{ message?: string }> = ({ message = "Synchronizing nutritional data..." }) => (
  <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center">
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </motion.div>
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-black text-zinc-900 tracking-tight">{message}</h3>
      <p className="text-xs text-zinc-400 font-medium animate-pulse uppercase tracking-widest">Protocol Active</p>
    </div>
  </div>
);

// 2. Empty State / No Search Results
export const EmptyState: React.FC<StateProps & { type?: 'inbox' | 'search' }> = ({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  type = 'inbox' 
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center p-12 bg-zinc-50/50 rounded-[3rem] border border-dashed border-zinc-200 text-center space-y-6"
  >
    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-zinc-100">
      {type === 'search' ? (
        <Search className="w-10 h-10 text-zinc-300" />
      ) : (
        <Inbox className="w-10 h-10 text-zinc-300" />
      )}
    </div>
    <div className="max-w-xs space-y-2">
      <h3 className="text-xl font-black text-zinc-900 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-500 font-medium leading-relaxed">{description}</p>
    </div>
    {actionLabel && (
      <Button onClick={onAction} className="h-12 px-8 rounded-2xl bg-zinc-950 hover:bg-black text-white text-xs font-black uppercase tracking-widest group">
        {actionLabel}
        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    )}
  </motion.div>
);

// 3. Network / Connection States
export const NetworkState: React.FC<StateProps & { type: 'offline' | 'slow' }> = ({ 
  type, 
  title, 
  description, 
  onAction 
}) => (
  <div className="p-8 rounded-[2.5rem] bg-amber-50 border border-amber-100 flex flex-col items-center text-center space-y-4">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
      {type === 'offline' ? <WifiOff className="w-6 h-6" /> : <SignalLow className="w-6 h-6" />}
    </div>
    <div className="space-y-1">
      <h4 className="text-base font-black text-amber-950 uppercase tracking-tight">{title}</h4>
      <p className="text-xs text-amber-700 font-medium">{description}</p>
    </div>
    <button onClick={onAction} className="text-[10px] font-black uppercase text-amber-600 tracking-widest hover:underline">
      Retry Connection
    </button>
  </div>
);

// 4. Security / Session States
export const SecurityState: React.FC<StateProps & { type: 'denied' | 'expired' }> = ({ 
  type, 
  title, 
  description, 
  onAction 
}) => (
  <div className="p-10 rounded-[3.5rem] bg-zinc-950 text-white text-center space-y-6 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl -mr-16 -mt-16" />
    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto text-red-400">
      {type === 'denied' ? <ShieldAlert className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
    </div>
    <div className="space-y-2">
      <h3 className="text-2xl font-black tracking-tight">{title}</h3>
      <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Access Protocol Violation</p>
      <p className="text-sm text-zinc-400 font-medium max-w-xs mx-auto">{description}</p>
    </div>
    <Button onClick={onAction} className="w-full h-14 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 font-black uppercase tracking-widest text-xs">
      {type === 'expired' ? 'Re-Initialize Session' : 'Return to Safe Zone'}
    </Button>
  </div>
);

// 5. Success State
export const SuccessState: React.FC<StateProps> = ({ 
  title, 
  description, 
  onAction,
  actionLabel = "Continue" 
}) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="flex flex-col items-center justify-center p-12 text-center space-y-6"
  >
    <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center relative">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-emerald-500 rounded-[2.5rem]"
      />
      <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 relative z-10">
        <CheckCircle2 className="w-10 h-10" />
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">{description}</p>
    </div>
    {onAction && (
      <Button onClick={onAction} className="h-14 px-10 rounded-2xl bg-zinc-950 hover:bg-black text-white text-xs font-black uppercase tracking-widest">
        {actionLabel}
      </Button>
    )}
  </motion.div>
);

// 6. Error State (Component level)
export const InlineErrorState: React.FC<{ message: string; retry?: () => void }> = ({ message, retry }) => (
  <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 flex items-start gap-4">
    <div className="p-2 bg-white rounded-xl text-rose-500 shadow-sm">
      <AlertCircle className="w-5 h-5" />
    </div>
    <div className="flex-1 space-y-1">
      <h5 className="text-sm font-black text-rose-950 uppercase tracking-tight">System Exception</h5>
      <p className="text-xs text-rose-700 font-medium leading-relaxed">{message}</p>
      {retry && (
        <button onClick={retry} className="text-[10px] font-black uppercase text-rose-600 tracking-widest hover:underline mt-2">
          Retry Operation
        </button>
      )}
    </div>
  </div>
);
