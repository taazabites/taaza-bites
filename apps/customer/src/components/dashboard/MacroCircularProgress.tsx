import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';

interface MacroCircularProgressProps {
  value: number;
  max: number;
  label: string;
  colorClass: string;
  unit: string;
}

export function MacroCircularProgress({ value, max, label, colorClass, unit }: MacroCircularProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(Math.min((value / max) * 100, 100)), 100);
    return () => clearTimeout(timer);
  }, [value, max]);

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-zinc-100 dark:text-zinc-800"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className={colorClass}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-black text-zinc-900 dark:text-white leading-none">
            {value}
          </span>
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
            / {max} {unit}
          </span>
        </div>
      </div>
      <span className="mt-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}
