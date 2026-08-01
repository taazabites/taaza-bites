import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/src/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'emerald' | 'teal' | 'amber';
  shimmerColor?: string;
}

export function Skeleton({ className, variant = 'default', shimmerColor, ...props }: SkeletonProps) {
  const baseBg = {
    default: "bg-zinc-200/80 dark:bg-zinc-800/80",
    emerald: "bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-200/40 dark:border-emerald-800/40",
    teal: "bg-teal-100/70 dark:bg-teal-950/60 border border-teal-200/40 dark:border-teal-800/40",
    amber: "bg-amber-100/70 dark:bg-amber-950/60 border border-amber-200/40 dark:border-amber-800/40",
  }[variant];

  const shimmerGradient = shimmerColor || {
    default: "from-transparent via-emerald-200/35 dark:via-emerald-400/20 to-transparent",
    emerald: "from-transparent via-emerald-300/70 dark:via-emerald-400/40 to-transparent",
    teal: "from-transparent via-teal-300/70 dark:via-teal-400/40 to-transparent",
    amber: "from-transparent via-amber-300/70 dark:via-amber-400/40 to-transparent",
  }[variant];

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl", baseBg, className)}
      {...props}
    >
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className={cn("absolute inset-0 bg-gradient-to-r", shimmerGradient)}
      />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function CardSkeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4", className)} {...props}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-1/3 rounded" />
        <Skeleton className="h-5 w-1/4 rounded" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-5/6 rounded" />
        <Skeleton className="h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}
