import React from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface DeliveryTrackerProps {
  status: 'preparing' | 'shipped' | 'delivered' | 'confirmed' | 'completed' | string;
  compact?: boolean;
}

export const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ status, compact = false }) => {
  // Map internal statuses to tracker steps
  // Steps: Preparing (Confirmed) -> Out for Delivery (Shipped) -> Delivered (Completed)
  
  const getActiveStep = () => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 2;
      case 'shipped':
      case 'out_for_delivery':
        return 1;
      case 'preparing':
      case 'confirmed':
      case 'processing':
        return 0;
      default:
        return -1;
    }
  };

  const activeStep = getActiveStep();

  const steps = [
    { label: 'Preparing', icon: UtensilsCrossed, desc: 'Chef is crafting your meal' },
    { label: 'Out for Delivery', icon: Truck, desc: 'On its way to you' },
    { label: 'Delivered', icon: CheckCircle2, desc: 'Enjoy your fresh meal!' }
  ];

  if (activeStep === -1 && status !== 'cancelled' && status !== 'failed') {
      return (
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-3">
              <Package className="w-5 h-5 text-zinc-400" />
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Status: {status.replace('_', ' ')}</p>
          </div>
      );
  }

  if (status === 'cancelled' || status === 'failed') {
      return (
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-3">
              <Package className="w-5 h-5 text-rose-400" />
              <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">Order {status}</p>
          </div>
      );
  }

  return (
    <div className={cn("w-full", compact ? "py-2" : "py-6")}>
      <div className="relative flex justify-between items-center w-full">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-100 rounded-full" />
        
        {/* Active Line */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-10"
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div key={idx} className="relative z-20 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isCompleted ? '#10b981' : '#f4f4f5',
                  color: isCompleted ? '#ffffff' : '#a1a1aa',
                }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-4 border-white",
                  isCompleted ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-400"
                )}
              >
                <Icon className={cn("w-5 h-5", isCurrent && "animate-pulse")} />
              </motion.div>
              
              {!compact && (
                <div className="absolute top-12 flex flex-col items-center w-32 text-center">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                    isCompleted ? "text-emerald-600" : "text-zinc-400"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-[9px] text-zinc-400 font-medium leading-tight mt-0.5 line-clamp-1">
                    {step.desc}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!compact && <div className="h-10" />} {/* Spacer for the labels */}
    </div>
  );
};
