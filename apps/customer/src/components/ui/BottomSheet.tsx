import React, { useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, className }: BottomSheetProps) {
  const dragControls = useDragControls();

  // Prevent scrolling on body when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-zinc-950/40 dark:bg-zinc-950/80 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex flex-col justify-end sm:justify-center items-center pointer-events-none sm:p-4">
            <motion.div
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              initial={{ y: "100%", scale: 1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "w-full sm:max-w-md bg-white dark:bg-zinc-950 pointer-events-auto flex flex-col",
                "rounded-t-[2.5rem] sm:rounded-[2rem]",
                "border-t sm:border border-zinc-200 dark:border-white/10 shadow-[0_-8px_40px_rgba(0,0,0,0.1)] sm:shadow-2xl",
                "max-h-[90vh] sm:max-h-[85vh] overflow-hidden safe-area-bottom",
                className
              )}
            >
              <div 
                className="flex justify-center pt-3 pb-4 w-full touch-none sm:hidden cursor-grab active:cursor-grabbing" 
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              </div>
              
              {(title) && (
                <div className="flex items-center justify-between px-6 pb-4 pt-0 sm:pt-6 border-b border-zinc-100 dark:border-white/5 shrink-0">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{title}</h3>
                  <button 
                    onClick={onClose}
                    className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="overflow-y-auto px-6 py-6 overscroll-contain">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
