
import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    variant?: 'light' | 'dark';
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ 
    className = '', 
    showText = true, 
    variant = 'dark',
    size = 'md'
}) => {
    const iconSizes = {
        sm: 'w-6 h-6 sm:w-8 sm:h-8',
        md: 'w-8 h-8 sm:w-10 sm:h-10',
        lg: 'w-12 h-12 sm:w-16 sm:h-16',
        xl: 'w-16 h-16 sm:w-24 sm:h-24'
    };

    const textSizes = {
        sm: 'text-base sm:text-lg',
        md: 'text-lg sm:text-xl',
        lg: 'text-2xl sm:text-3xl',
        xl: 'text-4xl sm:text-5xl'
    };

    const isLight = variant === 'light';
    const logoUrl = 'https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg?w=192&q=80&fm=webp';
    
    const brandOrange = '#FF7A00';
    const brandDark = '#1A1A1A';

    return (
        <div className={`flex items-center flex-nowrap gap-2 sm:gap-4 select-none touch-none ${className} group/brand`}>
            <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
                <img 
                    src={logoUrl} 
                    alt="Taazabites - Premium Healthy Meal Delivery Bengaluru Logo" 
                    className="w-full h-full object-contain relative z-10 transition-all duration-500 ease-out group-hover/brand:rotate-12 group-hover/brand:scale-110"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    referrerPolicy="no-referrer"
                />
            </div>

            {showText && (
                <div className="flex flex-col justify-center translate-y-0.5 shrink-0">
                    <span className={`font-black font-serif leading-[0.8] tracking-tight ${textSizes[size]}`}>
                        <span className="transition-colors duration-500 text-[#FF7A00] group-hover/brand:text-[#059669]">Taaza</span>
                        <span className={`transition-colors duration-500 ${isLight ? 'text-white' : 'text-[#1A1A1A]'} group-hover/brand:text-[#059669]`}>bites</span>
                    </span>
                    <div className="flex items-center mt-0.5 sm:mt-1">
                        <span className={`text-[6px] sm:text-[8px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] transition-colors duration-500 ${isLight ? 'text-white/80 group-hover/brand:text-white' : 'text-zinc-500 group-hover/brand:text-[#059669]/80'}`}>
                            BENGALURU
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
