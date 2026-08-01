import { MobileSwipeContainer } from './MobileSwipeContainer';
import { Circle, Cpu, Sprout, Snowflake, ChefHat, Grid } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { LazyImage } from './LazyImage';

const tiles = [
    {
        id: 'ai',
        title: "Macro-Engine AI",
        sub: "CALC_v9.2",
        desc: "Proprietary metabolic simulation. Every nutrient is verified against performance benchmarks before deployment.",
        img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&w=1200&q=80",
        size: "large",
        theme: "orange",
        icon: Cpu
    },
    {
        id: 'trace',
        title: "Soil Trace",
        sub: "NODE_SOURCE",
        desc: "100% Premium traceability. From seed to Bio-Pod.",
        img: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
        size: "medium",
        theme: "gold",
        icon: Sprout
    },
    {
        id: 'tech',
        title: "Thermal Lock",
        sub: "CRYOSYNC_X",
        desc: "Passive cooling logic for peak meal freshness.",
        size: "small",
        theme: "cyan",
        icon: Snowflake
    },
    {
        id: 'culinary',
        title: "Culinary DNA",
        sub: "CRAFT_v4.5",
        desc: "5-Star engineering meets clinical precision. Artistry is mandatory.",
        img: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=1000&q=90",
        size: "full",
        theme: "orange",
        icon: ChefHat
    }
];

export const BentoFeatures: React.FC = () => {
    const [counter, setCounter] = useState(99.4);

    useEffect(() => {
        const interval = setInterval(() => {
            setCounter(prev => {
                const next = prev + (Math.random() - 0.5) * 0.1;
                return parseFloat(Math.min(99.9, Math.max(98.5, next)).toFixed(1));
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-24 sm:py-56 bg-white relative overflow-hidden" id="architecture">
            <div className="container mx-auto px-6 max-w-[1440px]">
                <div className="text-center mb-16 sm:mb-32 animate-on-scroll">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-400 text-[9px] font-black uppercase tracking-[0.5em] mb-10">
                        <Grid className="w-3.5 h-3.5 text-[#FF7A00]" /> System_Architecture
                    </div>
                    <h2 className="text-5xl sm:text-8xl lg:text-[9rem] font-extrabold font-sans text-[#1A1A1A] tracking-tighter mb-10 leading-[0.85] uppercase">
                        Engineered <br/> <span className="text-[#FF7A00] font-script normal-case tracking-normal">Consistency.</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-zinc-700 text-lg sm:text-2xl font-bold leading-relaxed px-4">
                        Every module in our grid is designed for peak freshness and reliability. We don't leave health to chance.
                    </p>
                </div>

                <div className="lg:hidden w-full"><MobileSwipeContainer itemCount={4} className="gap-8 pb-10">
                    
                    {/* Large Node: AI Engine */}
                    <div className="flex-shrink-0 w-[85vw] md:w-auto md:col-span-8 md:row-span-2 snap-center relative rounded-[3.5rem] sm:rounded-[4.5rem] overflow-hidden bg-[#1A1A1A] group border border-zinc-900 shadow-2xl transition-all duration-700 min-h-[500px]">
                        <LazyImage src={tiles[0].img} alt={tiles[0].title} className="w-full h-full object-cover opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-[10s]" wrapperClassName="w-full h-full" />
                        <div className="absolute inset-0 p-10 sm:p-20 flex flex-col justify-between">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-6 sm:gap-10">
                                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[2rem] sm:rounded-[3rem] bg-[#FF7A00]/10 border border-orange-500/20 flex items-center justify-center text-[#FF7A00] shadow-2xl shadow-orange-500/10">
                                        <Cpu className="w-8 h-8 sm:w-12 sm:h-12" />
                                    </div>
                                    <span className="text-[10px] sm:text-[14px] font-mono font-black text-white uppercase tracking-[0.5em] sm:tracking-[0.8em]">{tiles[0].sub}</span>
                                </div>
                                <div className="hidden sm:flex flex-col items-end group/stat cursor-default">
                                    <span className="text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-1 transition-colors duration-500 group-hover/stat:text-zinc-400">Neural_Sync</span>
                                    <span className="text-3xl font-mono font-bold text-orange-400 tabular-nums shadow-[0_0_20px_#FF7A0020] transition-all duration-500 origin-right group-hover/stat:scale-110 group-hover/stat:text-orange-300 group-hover/stat:shadow-[0_0_30px_#FF7A0040]">{counter}%</span>
                                </div>
                            </div>
                            <div className="max-w-3xl">
                                <h3 className="text-4xl sm:text-7xl lg:text-8xl font-extrabold font-sans text-white mb-8 sm:mb-10 tracking-tighter leading-[0.9] uppercase">{tiles[0].title}</h3>
                                <p className="text-zinc-200 text-base sm:text-2xl leading-relaxed font-bold line-clamp-3 sm:line-clamp-none">{tiles[0].desc}</p>
                            </div>
                        </div>
                    </div>

                    {/* Medium Node: Soil Trace */}
                    <div className="flex-shrink-0 w-[75vw] md:w-auto md:col-span-4 md:row-span-1 snap-center relative rounded-[3.5rem] sm:rounded-[4.5rem] overflow-hidden bg-zinc-50 group border border-zinc-100 shadow-xl transition-all duration-700 min-h-[350px]">
                        <LazyImage src={tiles[1].img} alt={tiles[1].title} className="w-full h-full object-cover opacity-10 grayscale transition-all duration-[10s] group-hover:scale-110 group-hover:opacity-30 group-hover:grayscale-0" wrapperClassName="w-full h-full" />
                        <div className="absolute inset-0 p-10 flex flex-col justify-end">
                            <div className="w-14 h-14 rounded-[2rem] bg-white flex items-center justify-center text-[#FF7A00] mb-8 shadow-xl border border-zinc-100 group-hover:scale-110 transition-transform">
                                <Sprout className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-extrabold font-sans text-[#1A1A1A] mb-4 tracking-tight uppercase">{tiles[1].title}</h3>
                            <p className="text-zinc-700 text-sm sm:text-base leading-relaxed font-bold">{tiles[1].desc}</p>
                        </div>
                    </div>

                    {/* Small Node: Thermal Lock */}
                    <div className="flex-shrink-0 w-[75vw] md:w-auto md:col-span-4 md:row-span-1 snap-center relative rounded-[3.5rem] sm:rounded-[4.5rem] overflow-hidden bg-[#0A0A0A] border border-white/5 flex items-center justify-center group transition-all duration-700 shadow-2xl min-h-[350px]">
                        <div className="text-center p-10 sm:p-14 relative z-10">
                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-[2.5rem] sm:rounded-[3.5rem] bg-cyan-400/5 border border-cyan-400/10 flex items-center justify-center text-cyan-400 mb-8 sm:mb-10 mx-auto transition-transform duration-700 group-hover:rotate-12">
                                <Snowflake className="w-10 h-10 sm:w-14 sm:h-14" />
                            </div>
                            <h3 className="text-2xl sm:text-4xl font-extrabold font-sans text-white mb-3 sm:mb-4 uppercase">{tiles[2].title}</h3>
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                                <p className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-[0.6em]">{tiles[2].sub}</p>
                            </div>
                        </div>
                    </div>

                    {/* Full Width Node: Culinary DNA */}
                    <div className="flex-shrink-0 w-[85vw] md:w-full md:col-span-12 md:row-span-1 snap-center relative rounded-[4rem] sm:rounded-[5rem] overflow-hidden bg-[#F5F2ED] border border-zinc-100 group shadow-2xl transition-all duration-1000 md:mt-8">
                        <div className="flex flex-col lg:flex-row h-full min-h-[600px]">
                            <div className="lg:w-1/2 h-80 lg:h-auto overflow-hidden bg-[#222222]">
                                <LazyImage src={tiles[3].img} alt={tiles[3].title} className="w-full h-full object-cover grayscale-[0.3] transition-all duration-[8s] group-hover:grayscale-0 group-hover:scale-105 opacity-80" wrapperClassName="w-full h-full" />
                            </div>
                            <div className="lg:w-1/2 p-10 sm:p-24 lg:p-32 flex flex-col justify-center bg-white relative">
                                <div className="inline-flex items-center gap-4 px-5 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-[0.5em] mb-10 w-fit">
                                    <ChefHat className="w-3.5 h-3.5 text-[#FF7A00]" /> LEVEL_04_CRAFT
                                </div>
                                <h3 className="text-4xl sm:text-7xl lg:text-8xl font-extrabold font-sans text-[#1A1A1A] mb-8 tracking-tighter leading-[0.9] uppercase">{tiles[3].title}</h3>
                                <p className="text-zinc-500 text-lg sm:text-2xl font-light leading-relaxed max-w-xl opacity-80 mb-12">{tiles[3].desc}</p>
                                
                                <div className="flex items-center gap-10 sm:gap-16 group/stats cursor-default">
                                     <div className="flex flex-col transition-transform duration-500 group-hover/stats:-translate-y-2">
                                        <span className="text-3xl sm:text-5xl font-black text-[#1A1A1A] tracking-tighter transition-colors duration-500 group-hover/stats:text-[#FF7A00]">92%</span>
                                        <span className="text-[8px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 transition-colors duration-500 group-hover/stats:text-zinc-600">FLAVOR_YIELD</span>
                                     </div>
                                     <div className="w-px h-12 sm:h-16 bg-zinc-100 transition-colors duration-500 group-hover/stats:bg-orange-200"></div>
                                     <div className="flex flex-col transition-transform duration-500 delay-75 group-hover/stats:-translate-y-2">
                                        <span className="text-3xl sm:text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase transition-colors duration-500 group-hover/stats:text-[#FF7A00]">Live</span>
                                        <span className="text-[8px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 transition-colors duration-500 group-hover/stats:text-zinc-600">KITCHEN_NODE</span>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </MobileSwipeContainer></div><div className="hidden lg:grid lg:grid-cols-12 gap-12">
                    {/* Desktop versions remain same layout */}
                    <div className="md:col-span-8 md:row-span-2 relative rounded-[5rem] overflow-hidden group min-h-[600px] bg-[#0A0A0A]">
                        <LazyImage src={tiles[0].img} alt={tiles[0].title} className="w-full h-full object-cover opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-[10s]" wrapperClassName="w-full h-full" />
                        <div className="absolute inset-0 p-20 flex flex-col justify-between">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-10">
                                    <div className="w-24 h-24 rounded-[3rem] bg-[#FF7A00]/10 border border-orange-500/20 flex items-center justify-center text-[#FF7A00] shadow-2xl shadow-orange-500/10">
                                        <Cpu className="w-12 h-12" />
                                    </div>
                                    <span className="text-[14px] font-mono font-black text-white uppercase tracking-[0.8em]">{tiles[0].sub}</span>
                                </div>
                                <div className="flex flex-col items-end group/stat cursor-default">
                                    <span className="text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-1 transition-colors duration-500 group-hover/stat:text-zinc-400">Neural_Sync</span>
                                    <span className="text-3xl font-mono font-bold text-orange-400 tabular-nums shadow-[0_0_20px_#FF7A0020] transition-all duration-500 origin-right group-hover/stat:scale-110 group-hover/stat:text-orange-300 group-hover/stat:shadow-[0_0_30px_#FF7A0040]">{counter}%</span>
                                </div>
                            </div>
                            <div className="max-w-3xl">
                                <h3 className="text-8xl font-extrabold font-sans text-white mb-10 tracking-tighter leading-[0.9] uppercase">{tiles[0].title}</h3>
                                <p className="text-zinc-400 text-2xl leading-relaxed font-light opacity-80">{tiles[0].desc}</p>
                            </div>
                        </div>
                    </div>
                    {/* Medium Node */}
                    <div className="md:col-span-4 md:row-span-1 relative rounded-[4.5rem] overflow-hidden bg-zinc-50 group border border-zinc-100 shadow-xl transition-all duration-700 min-h-[350px]">
                        <LazyImage src={tiles[1].img} alt={tiles[1].title} className="w-full h-full object-cover opacity-10 grayscale transition-all duration-[10s] group-hover:scale-110 group-hover:opacity-30 group-hover:grayscale-0" wrapperClassName="w-full h-full" />
                        <div className="absolute inset-0 p-10 flex flex-col justify-end">
                            <div className="w-14 h-14 rounded-[2rem] bg-white flex items-center justify-center text-[#FF7A00] mb-8 shadow-xl border border-zinc-100 group-hover:scale-110 transition-transform">
                                <Sprout className="w-6 h-6" />
                            </div>
                            <h3 className="text-4xl font-extrabold font-sans text-[#1A1A1A] mb-4 tracking-tight uppercase">{tiles[1].title}</h3>
                            <p className="text-zinc-500 text-base leading-relaxed font-light opacity-90">{tiles[1].desc}</p>
                        </div>
                    </div>
                    {/* Small Node */}
                    <div className="md:col-span-4 md:row-span-1 relative rounded-[4.5rem] overflow-hidden bg-[#0A0A0A] border border-white/5 flex items-center justify-center group transition-all duration-700 shadow-2xl min-h-[350px]">
                        <div className="text-center p-14 relative z-10">
                            <div className="w-28 h-28 rounded-[3.5rem] bg-cyan-400/5 border border-cyan-400/10 flex items-center justify-center text-cyan-400 mb-10 mx-auto transition-transform duration-700 group-hover:rotate-12">
                                <Snowflake className="w-14 h-14" />
                            </div>
                            <h3 className="text-4xl font-extrabold font-sans text-white mb-4 uppercase">{tiles[2].title}</h3>
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                                <p className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-[0.6em]">{tiles[2].sub}</p>
                            </div>
                        </div>
                    </div>
                    {/* Full Width Node */}
                    <div className="md:col-span-12 md:row-span-1 relative rounded-[5rem] overflow-hidden bg-[#F5F2ED] border border-zinc-100 group shadow-2xl transition-all duration-1000 md:mt-8">
                        <div className="flex lg:flex-row h-full min-h-[600px]">
                            <div className="lg:w-1/2 overflow-hidden bg-[#222222]">
                                <LazyImage src={tiles[3].img} alt={tiles[3].title} className="w-full h-full object-cover grayscale-[0.3] transition-all duration-[8s] group-hover:grayscale-0 group-hover:scale-105 opacity-80" wrapperClassName="w-full h-full" />
                            </div>
                            <div className="lg:w-1/2 p-32 flex flex-col justify-center bg-white relative">
                                <div className="inline-flex items-center gap-4 px-5 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-[0.5em] mb-10 w-fit">
                                    <ChefHat className="w-3.5 h-3.5 text-[#FF7A00]" /> LEVEL_04_CRAFT
                                </div>
                                <h3 className="text-8xl font-extrabold font-sans text-[#1A1A1A] mb-8 tracking-tighter leading-[0.9] uppercase">{tiles[3].title}</h3>
                                <p className="text-zinc-500 text-2xl font-light leading-relaxed max-w-xl opacity-80 mb-12">{tiles[3].desc}</p>
                                <div className="flex items-center gap-16 group/stats cursor-default">
                                     <div className="flex flex-col transition-transform duration-500 group-hover/stats:-translate-y-2">
                                        <span className="text-5xl font-black text-[#1A1A1A] tracking-tighter transition-colors duration-500 group-hover/stats:text-[#FF7A00]">92%</span>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 transition-colors duration-500 group-hover/stats:text-zinc-600">FLAVOR_YIELD</span>
                                     </div>
                                     <div className="w-px h-16 bg-zinc-100 transition-colors duration-500 group-hover/stats:bg-orange-200"></div>
                                     <div className="flex flex-col transition-transform duration-500 delay-75 group-hover/stats:-translate-y-2">
                                        <span className="text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase transition-colors duration-500 group-hover/stats:text-[#FF7A00]">Live</span>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 transition-colors duration-500 group-hover/stats:text-zinc-600">KITCHEN_NODE</span>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div></div></section>
    );
};
