/**
 * MobileSwipeContainer.tsx
 * Out-of-the-box Mobile Horizontal Side Sliding Engine for Taazabites.
 * Features:
 * - Native momentum touch scrolling with hardware acceleration
 * - Dynamic edge fade gradients indicating remaining scroll distance
 * - Real-time active index dot/progress tracker
 * - Touch-friendly quick navigation tap-arrows
 * - Zero cumulative layout shift (CLS) & lightweight execution
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Hand } from 'lucide-react';

interface MobileSwipeContainerProps {
    children: React.ReactNode;
    className?: string;
    itemCount?: number;
    showDots?: boolean;
    showArrows?: boolean;
    showSwipeHint?: boolean;
    theme?: 'dark' | 'light';
}

export const MobileSwipeContainer: React.FC<MobileSwipeContainerProps> = ({
    children,
    className = '',
    itemCount = 0,
    showDots = true,
    showArrows = true,
    showSwipeHint = true,
    theme = 'light'
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const checkScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);

        // Calculate active item index accurately
        if (itemCount > 0 && clientWidth > 0) {
            const itemWidth = scrollWidth / itemCount;
            const index = Math.min(
                Math.max(0, Math.round(scrollLeft / (itemWidth || clientWidth * 0.75))),
                itemCount - 1
            );
            setActiveIndex(index);
        }
    }, [itemCount]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll, { passive: true });

        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [checkScroll]);

    const scrollByAmount = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const width = scrollRef.current.clientWidth * 0.8;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -width : width,
            behavior: 'smooth'
        });
    };

    const scrollToIndex = (index: number) => {
        if (!scrollRef.current || itemCount === 0) return;
        const { scrollWidth } = scrollRef.current;
        const itemWidth = scrollWidth / itemCount;
        scrollRef.current.scrollTo({
            left: itemWidth * index,
            behavior: 'smooth'
        });
    };

    const isDark = theme === 'dark';

    return (
        <div className="relative group/swipe-container w-full overflow-hidden sm:overflow-visible">
            {/* Left Edge Gradient Fade */}
            <div
                className={`absolute top-0 bottom-0 left-0 w-8 sm:w-12 pointer-events-none z-10 transition-opacity duration-300 ${
                    canScrollLeft ? 'opacity-100' : 'opacity-0'
                } ${
                    isDark
                        ? 'bg-gradient-to-r from-[#0D0E12] via-[#0D0E12]/80 to-transparent'
                        : 'bg-gradient-to-r from-[#F5F2ED] via-[#F5F2ED]/80 to-transparent'
                }`}
            />

            {/* Right Edge Gradient Fade */}
            <div
                className={`absolute top-0 bottom-0 right-0 w-8 sm:w-12 pointer-events-none z-10 transition-opacity duration-300 ${
                    canScrollRight ? 'opacity-100' : 'opacity-0'
                } ${
                    isDark
                        ? 'bg-gradient-to-l from-[#0D0E12] via-[#0D0E12]/80 to-transparent'
                        : 'bg-gradient-to-l from-[#F5F2ED] via-[#F5F2ED]/80 to-transparent'
                }`}
            />

            {/* Main Side Sliding Horizontal Container */}
            <div
                ref={scrollRef}
                className={`flex overflow-x-auto snap-x snap-mandatory hide-scrollbar scrollbar-hide scroll-smooth overscroll-x-contain touch-pan-x -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 transform-gpu ${className}`}
                style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollPaddingLeft: '1rem',
                    scrollPaddingRight: '1rem'
                }}
            >
                {children}
            </div>

            {/* Left Desktop Tap Arrow */}
            {showArrows && canScrollLeft && (
                <button
                    onClick={() => scrollByAmount('left')}
                    aria-label="Scroll left"
                    className={`hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center shadow-xl transition-all active:scale-95 ${
                        isDark
                            ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md'
                            : 'bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200 shadow-md'
                    }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}

            {/* Right Desktop Tap Arrow */}
            {showArrows && canScrollRight && (
                <button
                    onClick={() => scrollByAmount('right')}
                    aria-label="Scroll right"
                    className={`hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center shadow-xl transition-all active:scale-95 ${
                        isDark
                            ? 'bg-[#059669] text-white hover:bg-[#047857]'
                            : 'bg-[#059669] text-white hover:bg-[#047857]'
                    }`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}

            {/* Bottom Dots & Touch Swipe Bar */}
            {(showDots && itemCount > 1) || (showSwipeHint && canScrollRight) ? (
                <div className="flex items-center justify-between mt-3 px-2 text-xs font-mono">
                    {/* Interactive Active Index Dots */}
                    {showDots && itemCount > 1 && (
                        <div className="flex items-center gap-1.5 mx-auto">
                            {Array.from({ length: itemCount }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => scrollToIndex(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                    className={`transition-all duration-300 rounded-full ${
                                        activeIndex === i
                                            ? 'w-7 h-2 bg-[#059669] shadow-sm'
                                            : `w-2 h-2 ${isDark ? 'bg-white/25 hover:bg-white/50' : 'bg-zinc-300 hover:bg-zinc-400'}`
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Mobile Touch Swipe Visual Hint Badge */}
                    {showSwipeHint && canScrollRight && (
                        <div className={`sm:hidden text-[10px] uppercase font-extrabold tracking-wider flex items-center gap-1.5 ml-auto px-2.5 py-1 rounded-full border transition-opacity ${
                            isDark 
                                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400' 
                                : 'bg-emerald-50 border-emerald-200 text-[#059669]'
                        }`}>
                            <span>Swipe</span>
                            <ChevronRight className="w-3 h-3 animate-pulse" />
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};
