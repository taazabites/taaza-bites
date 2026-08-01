import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  descriptionClassName?: string;
  icon?: LucideIcon;
  badge?: string;
  className?: string;
  children?: React.ReactNode;
  gradient?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  descriptionClassName,
  icon: Icon,
  badge,
  className,
  children,
  gradient = "from-zinc-950 via-zinc-900 to-zinc-950"
}) => {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 mb-8 shadow-2xl border border-white/5",
      `bg-gradient-to-br ${gradient}`,
      className
    )}>
      {/* Abstract Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            {badge && (
              <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {badge}
              </span>
            )}
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white"
          >
            {title}
          </motion.h1>
          
          {description && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn("text-sm sm:text-base text-zinc-400 font-medium leading-relaxed", descriptionClassName)}
            >
              {description}
            </motion.p>
          )}
        </div>

        {children && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 shrink-0"
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
};
