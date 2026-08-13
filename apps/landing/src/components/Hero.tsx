import { Circle, Star, Leaf, ArrowRight, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LazyImage } from './LazyImage';
import { SubscriptionQuickInfo } from './SubscriptionQuickInfo';
import { PORTAL_LINKS } from '../config';

interface HeroProps {
    onNavigate?: (path: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
    const [wordIndex, setWordIndex] = useState(0);
    const words = ['Vitality', 'Balance', 'Energy', 'Health'];

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section
            className="relative min-h-[100dvh] w-full overflow-hidden flex items-center justify-center bg-[#1A1A1A]"
            id="hero"
        >
            {/* Full Page Background Image */}
            <div className="absolute inset-0 z-0 bg-[#1A1A1A]">
                <LazyImage 
                    src="https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg" 
                    alt="Premium healthy Indian meals prepared for delivery" 
                    className="w-full h-full object-cover object-center scale-105 transition-transform duration-[20s] hover:scale-100 opacity-80"
                    wrapperClassName="w-full h-full"
                    priority={true}
                    fetchPriority="high"
                    loading="eager"
                    sizes="100vw"
                />
                {/* Gradient Overlays for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#059669]/40 mix-blend-multiply z-[3]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-95 z-[3]"></div>
            </div>

            {/* Hero Main Content */}
            <div
                className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-12 text-center w-full max-w-5xl mx-auto pt-24 sm:pt-40 pb-20 sm:pb-12"
            >
                {/* Micro-label */}
                <div className="mb-4 sm:mb-8 flex items-center justify-center gap-2 sm:gap-4 animate-fade-in-up">
                    <span className="bg-[#059669]/30 text-emerald-300 border border-emerald-500/40 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Bengaluru's Premier Healthy Subscription
                    </span>
                </div>

                {/* Massive Visual Headline */}
                <h1 className="text-[13vw] sm:text-[9vw] lg:text-[100px] leading-[0.95] sm:leading-[0.92] tracking-[-0.04em] font-sans font-extrabold text-white mb-4 sm:mb-8 uppercase drop-shadow-2xl">
                    <span className="sr-only">Taazabites - Premium Healthy Indian Diet Meal Delivery Bengaluru</span>
                    <span className="block font-extrabold animate-fade-in-up" style={{ animationDelay: '0.1s' }}>Eat Clean.</span>
                    <span className="block font-script text-[#059669] normal-case tracking-normal text-6xl sm:text-8xl lg:text-[110px] animate-fade-in-up my-1.5" style={{ animationDelay: '0.2s' }}>Live with</span>
                    <span className="block font-extrabold relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <span key={wordIndex} className="animate-fade-in-up inline-block text-[#F59E0B] min-w-[120px] sm:min-w-auto">
                            {words[wordIndex]}.
                        </span>
                    </span>
                </h1>

                <p className="text-base sm:text-2xl text-white font-bold leading-snug sm:leading-relaxed mb-6 sm:mb-10 max-w-2xl animate-fade-in-up drop-shadow-md px-2" style={{ animationDelay: '0.4s' }}>
                    Chef-crafted, macro-calculated meals delivered fresh across HSR, Sarjapur & Bellandur.
                </p>

                {/* Mobile & Desktop Action Dock */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up w-full max-w-md sm:max-w-none mx-auto mb-6" style={{ animationDelay: '0.5s' }}>
                    <a 
                        href={PORTAL_LINKS.subscribe}
                        className="group relative px-6 py-4 sm:px-9 sm:py-4.5 bg-[#059669] text-white rounded-full font-bold uppercase tracking-[0.15em] text-xs sm:text-base overflow-hidden shadow-[0_20px_40px_rgba(5,150,105,0.4)] hover:shadow-[0_25px_50px_rgba(5,150,105,0.6)] transition-all duration-300 hover:-translate-y-1 flex items-center justify-center w-full sm:w-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#059669] to-[#F59E0B] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 flex items-center justify-center gap-2 w-full">
                            Start Subscription
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform"/>
                        </span>
                    </a>
                    
                    <a 
                        href={PORTAL_LINKS.order}
                        className="px-6 py-4 sm:px-9 sm:py-4.5 rounded-full border-2 border-white/40 text-white font-bold uppercase tracking-[0.15em] text-xs sm:text-base hover:bg-white hover:text-black hover:border-white transition-all duration-300 backdrop-blur-md flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        Order Online
                    </a>
                </div>

                <SubscriptionQuickInfo className="animate-fade-in-up scale-90 sm:scale-100" style={{ animationDelay: '0.55s' }} />

                {/* Micro Brand Trust Bar */}
                <div className="mt-6 sm:mt-12 pt-6 border-t border-white/10 w-full animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-sm text-white/80 font-mono mb-2 sm:mb-4">
                        <span className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                            ✓ FSSAI Certified
                        </span>
                        <span className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                            ★ 4.7 on Swiggy
                        </span>
                        <span className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                            🌿 10,000+ meals
                        </span>
                        <span className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 text-emerald-400">
                            📍 Kasavanahalli's #1
                        </span>
                    </div>
                </div>
            </div>

            {/* Floating 3D Desktop Badges */}
            <div className="absolute bottom-10 left-6 sm:left-12 bg-black/60 backdrop-blur-md rounded-2xl border border-white/15 p-4 shadow-2xl z-20 hidden lg:flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                <div className="w-12 h-12 rounded-full bg-[#059669]/30 flex items-center justify-center text-[#F59E0B] border border-[#059669]/40">
                    <Circle className="text-lg"/>
                </div>
                <div className="pr-4">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-white">Festive Healthy Specials</p>
                    <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Free Delivery across HSR & Bellandur</p>
                </div>
            </div>

            <div className="absolute bottom-10 right-6 sm:right-12 bg-black/60 backdrop-blur-md rounded-2xl border border-white/15 p-4 shadow-2xl z-20 hidden lg:flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '1s' }}>
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#059669] shadow-sm shrink-0">
                    <LazyImage src="https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg" alt="Chef's Special Premium Indian Healthy Bowl" sizes="56px" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                </div>
                <div className="pr-4">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-white">Chef's Special</p>
                    <p className="text-[10px] text-[#F59E0B] font-bold tracking-wider mt-0.5">Macro-Precision Guaranteed</p>
                </div>
            </div>
            
            <style>{`
              @media (min-width: 640px) {
                @keyframes blob {
                  0% { transform: translate(0px, 0px) scale(1); }
                  33% { transform: translate(30px, -50px) scale(1.1); }
                  66% { transform: translate(-20px, 20px) scale(0.9); }
                  100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                  animation: blob 10s infinite alternate;
                }
              }
            `}</style>
        </section>
    );
};
