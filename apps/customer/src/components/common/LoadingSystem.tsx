import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, AlertCircle, Heart } from 'lucide-react';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { cn } from '@/src/lib/utils';

/* ============================================================================
   1. INLINE SPINNER & LOADING BUTTONS (Best for contextual/small actions)
   ============================================================================ */

export interface InlineSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'white' | 'zinc' | 'dark';
  className?: string;
}

export function InlineSpinner({ size = 'sm', color = 'emerald', className }: InlineSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-[2.5px]',
  };

  const colorClasses = {
    emerald: 'border-emerald-600/30 border-t-emerald-600 dark:border-emerald-400/30 dark:border-t-emerald-400',
    white: 'border-white/30 border-t-white',
    zinc: 'border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-200',
    dark: 'border-zinc-900/30 border-t-zinc-900',
  };

  return (
    <span className={cn("inline-block animate-spin rounded-full", sizeClasses[size], colorClasses[color], className)} />
  );
}

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  spinnerColor?: 'emerald' | 'white' | 'zinc' | 'dark';
  variant?: 'primary' | 'secondary' | 'outline' | 'dark' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  spinnerColor = 'white',
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  const variantStyles = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10 active:scale-[0.98]',
    secondary: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30',
    outline: 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800',
    dark: 'bg-zinc-950 hover:bg-zinc-900 text-white shadow-md shadow-zinc-950/10 active:scale-[0.98]',
    ghost: 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200',
  };

  const sizeStyles = {
    sm: 'h-9 px-3.5 text-[11px] rounded-xl font-bold uppercase tracking-wider',
    md: 'h-11 px-5 text-xs rounded-2xl font-black uppercase tracking-widest',
    lg: 'h-13 px-7 text-sm rounded-2xl font-black uppercase tracking-widest',
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-black transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2"
          >
            <InlineSpinner size={size === 'lg' ? 'md' : 'sm'} color={spinnerColor} />
            <span>{loadingText || 'Processing...'}</span>
          </motion.span>
        ) : (
          <motion.span
            key="normal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ============================================================================
   2. PROGRESS BAR MODAL & CARDS (Best for long tasks: Payment, Uploads)
   ============================================================================ */

export interface TaskProgressProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  progressPercent: number;
  currentStepLabel?: string;
  steps?: { label: string; completed: boolean; active: boolean }[];
  error?: string | null;
  onClose?: () => void;
}

export function TaskProgressBarModal({
  isOpen,
  title,
  subtitle,
  progressPercent,
  currentStepLabel,
  steps,
  error,
  onClose
}: TaskProgressProps) {
  if (!isOpen) return null;

  const isComplete = progressPercent >= 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
              error ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" :
              isComplete ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" :
              "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            )}>
              {error ? (
                <AlertCircle className="w-6 h-6" />
              ) : isComplete ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Loader2 className="w-6 h-6 animate-spin" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">{title}</h3>
              {subtitle && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-2 my-6">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span>{currentStepLabel || (isComplete ? 'Complete' : 'Processing...')}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">{Math.min(100, Math.max(0, Math.round(progressPercent)))}%</span>
            </div>

            <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200/50 dark:border-white/5">
              <motion.div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  error ? "bg-rose-500" : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/20"
                )}
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
          </div>

          {/* Steps checklist if provided */}
          {steps && steps.length > 0 && (
            <div className="space-y-2 mb-6 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-150 dark:border-white/5">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-bold">
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : step.active ? (
                    <InlineSpinner size="xs" color="emerald" className="shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-600 shrink-0" />
                  )}
                  <span className={cn(
                    step.completed ? "text-zinc-900 dark:text-white" :
                    step.active ? "text-emerald-600 dark:text-emerald-400 font-black" :
                    "text-zinc-400 dark:text-zinc-500"
                  )}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action button if complete or errored */}
          {(isComplete || error) && onClose && (
            <button
              onClick={onClose}
              className={cn(
                "w-full h-11 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer",
                error ? "bg-rose-600 text-white hover:bg-rose-500" : "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800"
              )}
            >
              {error ? 'Dismiss' : 'Done'}
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ============================================================================
   3. SKELETON SCREENS (Best for initial page / menu / card loading)
   ============================================================================ */

export function MealCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-white/5 p-4 space-y-5 shadow-sm">
      <Skeleton className="h-52 w-full rounded-[2rem]" />
      <div className="px-3 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-1/2 rounded-xl" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <Skeleton className="h-14 w-full rounded-2xl mt-4" />
      </div>
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/5 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/* ============================================================================
   4. OPTIMISTIC UI BUTTONS (Instant state change with background sync & rollback)
   ============================================================================ */

export interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (nextState: boolean) => Promise<void>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OptimisticFavoriteButton({
  isFavorite,
  onToggle,
  className,
  size = 'md'
}: FavoriteButtonProps) {
  const [favState, setFavState] = React.useState(isFavorite);
  const [isPending, setIsPending] = React.useState(false);

  React.useEffect(() => {
    setFavState(isFavorite);
  }, [isFavorite]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousState = favState;
    const nextState = !favState;

    // Trigger haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(20); } catch (_) {}
    }

    // 1. Instant local update
    setFavState(nextState);
    setIsPending(true);

    try {
      // 2. Async server operation
      await onToggle(nextState);
      setIsPending(false);
    } catch (err) {
      // 3. Rollback on failure
      console.warn("Favorite toggle failed, rolling back state:", err);
      setFavState(previousState);
      setIsPending(false);
    }
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizes = {
    sm: 'w-8 h-8 rounded-full',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center transition-all cursor-pointer active:scale-90 border shadow-sm",
        favState
          ? "bg-rose-500 text-white border-rose-400 shadow-rose-500/20"
          : "bg-white/90 dark:bg-zinc-900/90 text-zinc-400 dark:text-zinc-500 border-zinc-200/80 dark:border-white/10 hover:text-rose-500",
        buttonSizes[size],
        className
      )}
      title={favState ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn(iconSizes[size], favState && "fill-current scale-110 transition-transform")} />
    </button>
  );
}
