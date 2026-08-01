import { MobileSwipeContainer } from './MobileSwipeContainer';
import { Circle, Shield, Leaf, Activity, HeartHandshake } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useCarousel } from '../hooks/useCarousel';

interface AnimatedCounterProps {
    value: string | number;
    duration?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 1500 }) => {
    const valStr = String(value);
    const [displayValue, setDisplayValue] = useState('0');
    const elementRef = useRef<HTMLSpanElement>(null);
    const hasAnimatedRef = useRef(false);

    useEffect(() => {
        if (hasAnimatedRef.current) {
            setDisplayValue(valStr);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimatedRef.current) {
                    hasAnimatedRef.current = true;
                    // Disconnect to avoid triggering again, but we also tracked hasAnimatedRef
                    observer.disconnect();
                    startAnimation();
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [valStr]);

    const startAnimation = () => {
        const numRegex = /([-+]?[0-9]*\.?[0-9]+)/;
        const match = valStr.match(numRegex);
        
        if (!match) {
            setDisplayValue(valStr);
            return;
        }

        const matchStr = match[0];
        const targetNum = parseFloat(matchStr);
        const index = match.index ?? 0;
        const prefix = valStr.slice(0, index);
        const suffix = valStr.slice(index + matchStr.length);

        const hasDecimal = matchStr.includes('.');
        const decimalPlaces = hasDecimal ? matchStr.split('.')[1].length : 0;

        let startTimestamp: number | null = null;
        
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Cubic ease-out
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentNum = easeProgress * targetNum;
            
            const formattedNum = currentNum.toFixed(decimalPlaces);
            setDisplayValue(`${prefix}${formattedNum}${suffix}`);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setDisplayValue(valStr);
            }
        };

        requestAnimationFrame(step);
    };

    return <span ref={elementRef}>{displayValue}</span>;
};

const COMBINED_METRICS = [
    {
        ref: "PROT_01",
        title: "Safety Shield",
        desc: "Clinical-grade sterilization guidelines. Zero deviation from global food safety benchmarks.",
        metricLabel: "SAFETY_INDEX",
        metricValue: "100%",
        status: "SYNC_OK",
        color: "text-orange-400"
    },
    {
        ref: "PROT_02",
        title: "100% Premium Origin",
        desc: "Traceable healthy sourcing from clean, toxin-free farms. Zero synthetic interference.",
        metricLabel: "TOXIN_LEVEL",
        metricValue: "0%",
        status: "ACTIVE",
        color: "text-blue-400"
    },
    {
        ref: "PROT_03",
        title: "Cold-Path Freshness",
        desc: "Temperature-controlled delivery to preserve delicate nutritional enzymes and peak freshness.",
        metricLabel: "CORE_TEMP",
        metricValue: "< 4°C",
        status: "STABLE",
        color: "text-orange-400"
    },
    {
        ref: "PROT_04",
        title: "Nutritional Science",
        desc: "AI-verified portioning ensuring absolute macro-sync for every individual module.",
        metricLabel: "VAR_MARGIN",
        metricValue: "±0.5g",
        status: "CALIBRATED",
        color: "text-purple-400"
    }
];

const USPs = [
    {
        title: "Clinical-Grade Prep",
        id: "HEALTH_01",
        metric: "100%",
        unit: "Hygienic",
        desc: "Prepared in state-of-the-art kitchens with zero refined oils, artificial colors, or preservatives.",
        icon: Shield
    },
    {
        title: "Farm-Fresh Premium",
        id: "QUALITY_02",
        metric: "24h",
        unit: "Farm to Fork",
        desc: "We source only the highest quality premium ingredients directly from trusted local farms.",
        icon: Leaf
    },
    {
        title: "Nutritional Science",
        id: "SCIENCE_03",
        metric: "Gram",
        unit: "Perfect",
        desc: "Every meal is macro-calculated by expert nutritionists to perfectly fuel your body.",
        icon: Activity
    },
    {
        title: "White-Glove Service",
        id: "SERVICE_04",
        metric: "24/7",
        unit: "Support",
        desc: "Enjoy flexible meal swaps, easy pausing, and a dedicated support team for your health journey.",
        icon: HeartHandshake
    }
];

export const WhyUs: React.FC = () => {
    const [loadPercent, setLoadPercent] = useState(94);
    const { scrollContainerRef, activeIndex, goToSlide, handlers } = useCarousel({ itemCount: USPs.length, slideInterval: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setLoadPercent(prev => Math.min(100, Math.max(90, prev + (Math.random() - 0.5))));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-16 sm:py-24 lg:py-32 bg-[#FFF8F0] text-[#1A1A1A] relative overflow-hidden" id="why-us">
            {/* Soft Tech Scanlines */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:100%_3px] animate-scan-y-fast"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center mb-16 sm:mb-20 lg:mb-32">
                    <div className="animate-on-scroll text-left" data-animation="fade-in">
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] font-bold text-[8px] sm:text-[10px] tracking-widest uppercase mb-6 sm:mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-pulse"></span>
                            The Taazabites Standard
                        </div>
                        <h1 className="sr-only">Why Choose Taazabites - High-Performance Nutrition and Meal Prep Bangalore</h1>
                        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-light font-serif leading-[1.1] tracking-tight mb-6 sm:mb-8 text-[#1A1A1A]">
                            Why Choose <br/> <span className="text-[#FF7A00] italic font-medium">Taazabites?</span>
                        </h2>
                        <p className="text-gray-600 text-base sm:text-lg lg:text-xl font-light leading-relaxed max-w-lg mb-6">
                            We don't just deliver food; we deliver a commitment to your health. Experience the difference of true culinary excellence combined with nutritional science. 
                        </p>
                        <p className="text-gray-500 text-sm font-light leading-relaxed max-w-lg">
                            From HSR Layout and Koramangala to Sarjapur Road, Bellandur, and across Bengaluru, our cold-chain tech ensures your premium, high-protein, and weight-loss meals reach you hyper-fresh daily. Recognized as the top healthy food delivery app in the city, we guarantee peak vitality with every bite.
                        </p>
                    </div>

                    {/* Trust/Metric Display */}
                    <div className="bg-white p-6 sm:p-8 lg:p-12 rounded-[2rem] sm:rounded-[2.5rem] border border-[#FF7A00]/10 shadow-xl animate-on-scroll relative overflow-hidden" data-animation="slide-in-right">
                        <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-[#FF7A00]/5 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="flex justify-between items-center mb-8 sm:mb-10 relative z-10">
                            <div>
                                <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1 sm:mb-2">Daily Quality Score</span>
                                <span className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#FF7A00]">Excellence</span>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-[#FFF8F0] flex items-center justify-center text-[#FF7A00] text-base sm:text-lg lg:text-xl shadow-sm border border-[#FF7A00]/20">
                                <Circle />
                            </div>
                        </div>
                        
                        <div className="space-y-6 sm:space-y-8 relative z-10">
                            <div>
                                <div className="flex justify-between text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 sm:mb-3">
                                    <span>Health Standards Met</span>
                                    <span className="text-[#1A1A1A]">
                                        <AnimatedCounter value={`${loadPercent.toFixed(1)}%`} />
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#FF7A00] transition-all duration-1000 shadow-[0_0_10px_rgba(255,122,0,0.4)]" style={{ width: `${loadPercent}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-4 sm:pt-6 border-t border-gray-200">
                                <div className="text-center">
                                    <span className="block text-xl sm:text-2xl lg:text-3xl font-light text-[#1A1A1A] font-serif mb-0.5 sm:mb-1">
                                        <AnimatedCounter value="0%" />
                                    </span>
                                    <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">Refined Oil</span>
                                </div>
                                <div className="text-center border-x border-gray-200">
                                    <span className="block text-xl sm:text-2xl lg:text-3xl font-light text-[#1A1A1A] font-serif mb-0.5 sm:mb-1">
                                        <AnimatedCounter value="100%" />
                                    </span>
                                    <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">Premium</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xl sm:text-2xl lg:text-3xl font-light text-[#1A1A1A] font-serif mb-0.5 sm:mb-1">
                                        <AnimatedCounter value="24/7" />
                                    </span>
                                    <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advantage Grid */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {USPs.map((item, i) => (
                        <AdvantageCard key={item.id} item={item} index={i} isActive={true} />
                    ))}
                </div>

                {/* Mobile Slider */}
                <div className="md:hidden relative overflow-hidden w-full">
                    <div 
                        ref={scrollContainerRef} 
                        {...handlers} 
                        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-12 gap-6 scroll-smooth"
                    >
                        {USPs.map((item, i) => (
                            <div key={item.id} className="w-[85vw] flex-shrink-0 snap-center">
                                <AdvantageCard item={item} index={i} isActive={activeIndex === i} />
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex items-center justify-center gap-3 mt-4">
                        {USPs.map((_, i) => (
                            <button 
                                key={i} 
                                onClick={() => goToSlide(i)} 
                                className={`h-1.5 transition-all duration-500 rounded-full ${activeIndex === i ? 'w-8 bg-orange-800' : 'w-2 bg-gray-300'}`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export const QualityMetrics: React.FC = () => {
    const qualityCarousel = useCarousel({
        itemCount: COMBINED_METRICS.length,
        slideInterval: 0
    });

    return (
        <div className="bg-[#050505] text-gray-300 font-sans selection:bg-orange-500/30 relative overflow-hidden py-24 sm:py-32" id="quality">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-40 w-96 h-96 bg-[#FF7A00]/10 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-[#D4A373]/10 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    {/* Left Column: Intro & Score */}
                    <div className="lg:col-span-5 min-w-0 flex flex-col justify-center">
                        
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light font-serif text-white tracking-tight mb-6 leading-tight">
                            Bengaluru's Best<br/>Healthy Food Delivery.
                        </h2>
                        
                        <p className="text-lg text-gray-400 font-light mb-8 leading-relaxed">
                            We use the finest premium ingredients to prepare the most nutritious healthy meals in Bangalore. <br/><br/><span className="italic text-gray-300">"Our quality is not a claim—it is a live metric."</span>
                        </p>

                        <div className="flex flex-wrap gap-3 mb-10">
                            {['[FSSAI_CERT]', '[ISO_22000]', '[HACCP_PASS]'].map((cert, idx) => (
                                <span key={idx} className="px-4 py-1.5 rounded-full border border-gray-800 bg-gray-900/50 text-xs font-mono text-gray-400 tracking-wide">{cert}</span>
                            ))}
                        </div>

                        <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute -right-10 -top-10 w-48 h-48 bg-orange-500/10 blur-3xl rounded-full"></div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0 relative z-10">
                                <div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-400 block mb-2 tracking-wide uppercase">Live Wellness Score</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl sm:text-6xl font-light font-serif text-white tracking-tighter">
                                            <AnimatedCounter value="94.7" />
                                        </span>
                                        <span className="text-2xl sm:text-3xl font-light text-orange-500">%</span>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Status</span>
                                    <span className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-mono tracking-wider border border-orange-500/30">OPTIMAL</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Grid of Protocols */}
                    <div className="lg:col-span-7 min-w-0 overflow-hidden w-full lg:overflow-visible">
                        <div className="lg:hidden w-full">
                            <MobileSwipeContainer itemCount={COMBINED_METRICS.length} className="gap-4 sm:gap-6 pb-4 sm:grid sm:grid-cols-2" theme="dark">
                                {COMBINED_METRICS.map((prot, idx) => (
                                    <div key={idx} className="snap-center shrink-0 w-[280px] sm:w-auto bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 hover:bg-gray-800/60 hover:border-gray-600 transition-all duration-500 group relative overflow-hidden shadow-lg flex flex-col">
                                        <div className="flex justify-between items-start mb-4 sm:mb-6 relative z-10">
                                            <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Node_Ref<br/>[{prot.ref}]</span>
                                            <span className={`text-[10px] font-mono px-3 py-1 rounded-full bg-gray-900/80 border border-gray-700/50 ${prot.color} tracking-wider shadow-inner`}>
                                                {prot.status}
                                            </span>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2 sm:mb-3 relative z-10 group-hover:text-orange-400 transition-colors duration-300">{prot.title}</h3>
                                        <p className="text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8 font-light leading-relaxed relative z-10 flex-grow">{prot.desc}</p>
                                        <div className="pt-4 sm:pt-5 border-t border-gray-700/50 flex justify-between items-end relative z-10">
                                            <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">{prot.metricLabel}</span>
                                            <span className={`text-2xl sm:text-3xl font-mono font-light ${prot.color} drop-shadow-md`}>
                                                <AnimatedCounter value={prot.metricValue} />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </MobileSwipeContainer>
                        </div>
                        <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                            {COMBINED_METRICS.map((prot, idx) => (
                                <div key={idx} className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 hover:bg-gray-800/60 hover:border-gray-600 transition-all duration-500 group relative overflow-hidden shadow-lg flex flex-col">
                                    <div className="flex justify-between items-start mb-4 sm:mb-6 relative z-10">
                                        <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Node_Ref<br/>[{prot.ref}]</span>
                                        <span className={`text-[10px] font-mono px-3 py-1 rounded-full bg-gray-900/80 border border-gray-700/50 ${prot.color} tracking-wider shadow-inner`}>
                                            {prot.status}
                                        </span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2 sm:mb-3 relative z-10 group-hover:text-orange-400 transition-colors duration-300">{prot.title}</h3>
                                    <p className="text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8 font-light leading-relaxed relative z-10 flex-grow">{prot.desc}</p>
                                    <div className="pt-4 sm:pt-5 border-t border-gray-700/50 flex justify-between items-end relative z-10">
                                        <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">{prot.metricLabel}</span>
                                        <span className={`text-2xl sm:text-3xl font-mono font-light ${prot.color} drop-shadow-md`}>
                                            <AnimatedCounter value={prot.metricValue} />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdvantageCard: React.FC<{ item: any; index: number; isActive: boolean }> = ({ item, index, isActive }) => (
    <div 
        className={`group p-6 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[2.5rem] border transition-all duration-500 flex flex-col h-full ${isActive ? 'bg-white border-[#FF7A00]/10 shadow-sm hover:shadow-md hover:bg-[#FF7A00]/5 scale-100' : 'bg-gray-50 border-gray-100 scale-95 opacity-60'}`}
    >
        <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mb-6 sm:mb-8 lg:mb-10 transition-all duration-500 ${isActive ? 'bg-[#FFF8F0] text-[#FF7A00] shadow-sm group-hover:bg-[#FF7A00] group-hover:text-white' : 'bg-gray-100 text-gray-400'}`}>
            <item.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${isActive ? 'text-[#FF7A00]' : 'text-gray-400'}`}>{item.id}</span>
            <div className={`h-[1px] flex-grow ${isActive ? 'bg-[#FF7A00]/20' : 'bg-gray-200'}`}></div>
        </div>

        <h3 className={`text-xl sm:text-2xl lg:text-3xl font-light font-serif mb-3 sm:mb-4 tracking-tight ${isActive ? 'text-[#1A1A1A]' : 'text-gray-500'}`}>{item.title}</h3>
        <p className={`text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed mb-6 sm:mb-8 lg:mb-10 font-light ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.desc}</p>
        
        <div className={`mt-auto pt-4 sm:pt-6 lg:pt-8 border-t flex items-baseline justify-between ${isActive ? 'border-gray-200' : 'border-gray-200'}`}>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className={`text-2xl sm:text-3xl lg:text-4xl font-light tracking-tighter ${isActive ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>
                    <AnimatedCounter value={item.metric} />
                </span>
                <span className={`text-[8px] sm:text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-[#FF7A00]' : 'text-gray-400'}`}>{item.unit}</span>
            </div>
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isActive ? 'bg-[#FF7A00] animate-pulse' : 'bg-gray-300'}`}></div>
        </div>
    </div>
);