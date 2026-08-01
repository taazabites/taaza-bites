import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface AppLoaderProps {
    onComplete: () => void;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ onComplete }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const df = isMobile ? 0.35 : 1;
    const duf = isMobile ? 0.5 : 1;

    useEffect(() => {
        // Highly optimized animation sequence duration:
        // Logo Fade In: 0s - 0.3s
        // Ingredients Float In: 0.2s - 0.6s
        // Tagline Appears: 0.45s - 0.65s
        // Loading Bar Fills: 0.5s - 0.9s
        // Unmount trigger: 1.0s (Cut down from 2.2s to improve load time)
        const timer = setTimeout(() => {
            onComplete();
        }, isMobile ? 350 : 600);
        return () => clearTimeout(timer);
    }, [onComplete, isMobile]);

    return (
        <motion.div 
            className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
        >
            <div className="relative flex flex-col items-center justify-center max-w-xs sm:max-w-sm w-full px-6 text-center">
                
                {/* Ingredients Float In */}
                <motion.div 
                    className="absolute -top-16 -left-4 text-4xl opacity-0 pointer-events-none drop-shadow-sm"
                    initial={{ y: 20, opacity: 0, rotate: -25, scale: 0.8 }}
                    animate={{ y: 0, opacity: 0.8, rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2 * df, duration: 0.4 * duf, type: "spring", bounce: 0.3 }}
                >
                    🥑
                </motion.div>
                <motion.div 
                    className="absolute -top-10 -right-8 text-4xl opacity-0 pointer-events-none drop-shadow-sm"
                    initial={{ y: 20, opacity: 0, rotate: 25, scale: 0.8 }}
                    animate={{ y: 0, opacity: 0.8, rotate: 0, scale: 1 }}
                    transition={{ delay: 0.25 * df, duration: 0.4 * duf, type: "spring", bounce: 0.3 }}
                >
                    🥦
                </motion.div>
                <motion.div 
                    className="absolute top-20 -left-12 text-3xl opacity-0 pointer-events-none drop-shadow-sm"
                    initial={{ y: 20, opacity: 0, rotate: -15, scale: 0.8 }}
                    animate={{ y: 0, opacity: 0.7, rotate: 0, scale: 1 }}
                    transition={{ delay: 0.3 * df, duration: 0.4 * duf, type: "spring", bounce: 0.3 }}
                >
                    🫐
                </motion.div>
                <motion.div 
                    className="absolute top-32 -right-10 text-3xl opacity-0 pointer-events-none drop-shadow-sm"
                    initial={{ y: 20, opacity: 0, rotate: 20, scale: 0.8 }}
                    animate={{ y: 0, opacity: 0.9, rotate: 0, scale: 1 }}
                    transition={{ delay: 0.22 * df, duration: 0.4 * duf, type: "spring", bounce: 0.3 }}
                >
                    🥗
                </motion.div>
                <motion.div 
                    className="absolute -bottom-8 -left-6 text-3xl opacity-0 pointer-events-none drop-shadow-sm"
                    initial={{ y: -20, opacity: 0, rotate: -5, scale: 0.8 }}
                    animate={{ y: 0, opacity: 0.8, rotate: 0, scale: 1 }}
                    transition={{ delay: 0.28 * df, duration: 0.4 * duf, type: "spring", bounce: 0.3 }}
                >
                    🍗
                </motion.div>

                {/* Logo Fade In */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3 * duf, ease: "easeOut" }}
                    className="mb-8 relative z-10 flex flex-col items-center"
                >
                    <div className="relative w-24 h-24 mb-5">
                        <div className="absolute inset-0 bg-[#418B1E]/5 rounded-full scale-150 blur-xl animate-pulse"></div>
                        <img 
                            src="https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg?w=192&q=80&fm=webp" 
                            alt="Taaza Bites" 
                            className="relative w-24 h-24 object-contain rounded-full shadow-lg shadow-black/5 border border-white"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <p className="text-3xl font-serif text-[#1A1A1A] tracking-wider uppercase font-bold">
                        Taaza Bites
                    </p>
                </motion.div>

                {/* Tagline Appears */}
                <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 * df, duration: 0.2 * duf, ease: "easeOut" }}
                    className="flex flex-col items-center gap-2 mb-10 z-10"
                >
                    <p className="text-xs sm:text-sm font-bold text-[#418B1E] uppercase tracking-[0.2em] whitespace-nowrap drop-shadow-sm">
                         🥗 Fresh • Healthy • Delivered
                     </p>
                    <p className="text-[11px] sm:text-xs font-semibold text-zinc-500 tracking-wide">
                        Fuel Your Body. Transform Your Life.
                    </p>
                </motion.div>

                {/* Loading Bar Fills */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.48 * df, duration: 0.1 * duf }}
                    className="w-full flex justify-center items-center flex-col z-10 px-4"
                >
                    <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden relative shadow-inner">
                        <motion.div 
                            className="absolute top-0 left-0 bottom-0 bg-[#418B1E] rounded-full shadow-[0_0_10px_rgba(65,139,30,0.5)]"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.5 * df, duration: 0.4 * duf, ease: [0.65, 0, 0.35, 1] }}
                        />
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
};
