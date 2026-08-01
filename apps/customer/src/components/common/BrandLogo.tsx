import React from 'react';
import { cn } from '../../lib/utils';

export const LOGO_IMAGE_URL = "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_5385.jpeg";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: string;
}

export default function BrandLogo({
  className,
  imageClassName,
  showText = true,
  size = 'md',
  textColor = 'text-zinc-950 dark:text-white',
}: BrandLogoProps) {
  const sizeMap = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 rounded-xl',
    lg: 'h-12 w-12 rounded-2xl',
    xl: 'h-16 w-16 rounded-[1.25rem]',
  };

  const textMap = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={cn("flex items-center gap-2.5 group", className)}>
      <img
        src={LOGO_IMAGE_URL}
        alt="TaazaBites"
        referrerPolicy="no-referrer"
        className={cn(
          "object-cover shrink-0 shadow-md transition-transform duration-300 group-hover:scale-105",
          sizeMap[size],
          imageClassName
        )}
      />
      {showText && (
        <span className={cn("font-black tracking-tightest uppercase leading-none", textMap[size], textColor)}>
          Taaza<span className="text-emerald-600">Bites</span>
          <span className="block text-[8px] tracking-[0.3em] text-zinc-400 mt-1 font-bold">PREMIUM MEALS</span>
        </span>
      )}
    </div>
  );
}
