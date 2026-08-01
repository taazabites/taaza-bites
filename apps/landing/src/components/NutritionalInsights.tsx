import { MobileSwipeContainer } from './MobileSwipeContainer';
import React from 'react';
import { Leaf, Activity, Zap, Dna, Droplets, Heart } from 'lucide-react';
import { useCarousel } from '../hooks/useCarousel';

const insights = [
    {
        id: 1,
        title: "Mitochondrial Bio-Genesis",
        description: "High-protein meals provide amino acids for mitochondrial regeneration, avoiding post-lunch slumps.",
        icon: <Zap className="w-5 h-5 text-[#F59E0B]" />,
        color: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
        fact: "Boosts baseline cellular energy by up to 18%"
    },
    {
        id: 2,
        title: "Nutrient Partitioning",
        description: "Strategic timing ensures body partitions nutrients towards muscle repair instead of fat storage.",
        icon: <Activity className="w-5 h-5 text-[#059669]" />,
        color: "bg-[#059669]/10 border-[#059669]/20",
        fact: "Enhances lean tissue recovery rapidly"
    },
    {
        id: 3,
        title: "Cellular Detox",
        description: "Rich in antioxidants derived from Indian spices like Turmeric to trigger cellular autophagy.",
        icon: <Dna className="w-5 h-5 text-[#FF7A00]" />,
        color: "bg-[#FF7A00]/10 border-[#FF7A00]/20",
        fact: "Turmeric increases antioxidant capacity by 35%"
    },
    {
        id: 4,
        title: "Microbiome Thriving",
        description: "Fermented elements & high fibrous veg maintain a robust gut microbiome for better immunity.",
        icon: <Leaf className="w-5 h-5 text-[#10B981]" />,
        color: "bg-[#10B981]/10 border-[#10B981]/20",
        fact: "Promotes over 20+ diverse bacterial strains"
    },
    {
        id: 5,
        title: "Hydration Retention",
        description: "Balances intracellular water with precise minerals for glowing skin and clear focus.",
        icon: <Droplets className="w-5 h-5 text-[#3B82F6]" />,
        color: "bg-[#3B82F6]/10 border-[#3B82F6]/20",
        fact: "Optimizes cellular water retention"
    },
    {
        id: 6,
        title: "Metabolic Flexibility",
        description: "Low-GI ingredients help body switch between burning glucose & oxidizing fat easily.",
        icon: <Heart className="w-5 h-5 text-[#E11D48]" />,
        color: "bg-[#E11D48]/10 border-[#E11D48]/20",
        fact: "Improves fasting lipid profiles"
    }
];

export const NutritionalInsights: React.FC = () => {
    const { scrollContainerRef, activeIndex, goToSlide, handlers } = useCarousel({ itemCount: insights.length, slideInterval: 5000 });

    return (
        <section className="py-16 md:py-20 bg-white relative overflow-hidden" id="insights">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,150,105,0.03)_0%,rgba(0,0,0,0)_70%)] pointer-events-none"></div>
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-10 md:mb-14 max-w-2xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] mb-3 tracking-tight">
                        Nutritional <span className="text-[#059669]">Insights</span>
                    </h2>
                    <p className="text-sm text-zinc-500 font-light leading-relaxed">
                        Science-backed facts on how precise, chef-crafted nutrition influences cellular vitality, healthspan, and daily performance.
                    </p>
                </div>

                <div className="lg:hidden w-full">
                    <MobileSwipeContainer itemCount={insights.length} className="gap-4 sm:gap-6 pb-4">
                    {insights.map((insight, index) => (
                        <div 
                            key={insight.id}
                            className={`snap-center shrink-0 w-[280px] sm:w-[320px] lg:w-auto group relative bg-zinc-50/50 border border-zinc-100/80 rounded-2xl p-5 hover:bg-white hover:border-[#059669]/20 hover:shadow-lg transition-all duration-300 flex flex-col`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border bg-white shadow-sm ${insight.color}`}>
                                    {insight.icon}
                                </div>
                                <h3 className="text-sm md:text-base font-bold text-[#1A1A1A] leading-tight">
                                    {insight.title}
                                </h3>
                            </div>
                            
                            <p className="text-[13px] text-zinc-600 mb-4 leading-relaxed flex-grow line-clamp-3">
                                {insight.description}
                            </p>
                            
                            <div className="mt-auto bg-white/60 px-3 py-2 rounded-lg border border-zinc-100 flex items-start gap-2">
                                <div className="text-[#059669] shrink-0 mt-0.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <span className="text-[11px] font-medium text-zinc-700 leading-tight">
                                    {insight.fact}
                                </span>
                            </div>
                        </div>
                    ))}
                    </MobileSwipeContainer>
                </div>
                
                <div className="hidden lg:grid lg:grid-cols-3 gap-5">
                    {insights.map((insight, index) => (
                        <div 
                            key={insight.id}
                            className={`group relative bg-zinc-50/50 border border-zinc-100/80 rounded-2xl p-5 hover:bg-white hover:border-[#059669]/20 hover:shadow-lg transition-all duration-300 flex flex-col`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border bg-white shadow-sm ${insight.color}`}>
                                    {insight.icon}
                                </div>
                                <h3 className="text-sm md:text-base font-bold text-[#1A1A1A] leading-tight">
                                    {insight.title}
                                </h3>
                            </div>
                            
                            <p className="text-[13px] text-zinc-600 mb-4 leading-relaxed flex-grow line-clamp-3">
                                {insight.description}
                            </p>
                            
                            <div className="mt-auto bg-white/60 px-3 py-2 rounded-lg border border-zinc-100 flex items-start gap-2">
                                <div className="text-[#059669] shrink-0 mt-0.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <span className="text-[11px] font-medium text-zinc-700 leading-tight">
                                    {insight.fact}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
