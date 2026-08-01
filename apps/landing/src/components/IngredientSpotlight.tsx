import { PORTAL_LINKS } from '../config';
import { PieChart, Star, ArrowRight, Heart, Zap, Feather, ShieldCheck } from 'lucide-react';
import React from 'react';
import { LazyImage } from './LazyImage';

const ingredientData = {
    name: "Chia Seeds",
    subtitle: "The Ancient Superfood",
    description: "Don't let their size fool you. These tiny black seeds are a nutritional powerhouse, revered by Aztec warriors for sustained energy. Packed with Omega-3s, fiber, and protein, they are the perfect addition to a modern, healthy lifestyle.",
    benefits: [
        { icon: Heart, title: "Heart Health", text: "Rich in Omega-3 fatty acids." },
        { icon: Zap, title: "Sustained Energy", text: "Slow-release carbs for endurance." },
        { icon: Feather, title: "Digestive Aid", text: "40% fiber by weight." },
        { icon: ShieldCheck, title: "Antioxidants", text: "Fights free radical damage." }
    ],
    cta: {
        text: "Try Our Chia Pudding",
        link: PORTAL_LINKS.order
    },
    image: "https://cdn.urbanpiper.com/media/bizmedia/2025/09/03/s9ZRSy5-f46b9d1a-8aca-471a-ae55-11652376cce1.jpg"
};

export const IngredientSpotlight: React.FC = () => {
    return (
        <section className="py-20 sm:py-32 bg-[#222222] relative overflow-hidden" id="ingredient-spotlight">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[var(--primary)]/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    
                    {/* Visual Side */}
                    <div className="relative order-2 lg:order-1 animate-on-scroll" data-animation="scale-up">
                        <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] group transform transition-transform duration-700 hover:-translate-y-2">
                            <LazyImage 
                                src={`${ingredientData.image}?format=jpeg&w=800&q=80`}
                                srcSet={`${ingredientData.image}?format=jpeg&w=400&q=80 400w, ${ingredientData.image}?format=jpeg&w=800&q=80 800w, ${ingredientData.image}?format=jpeg&w=1200&q=80 1200w, ${ingredientData.image}?format=jpeg&w=1600&q=80 1600w`}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                alt="Close up of Chia Seeds pudding"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                wrapperClassName="aspect-[4/5] sm:aspect-square w-full"
                            />
                            
                            {/* Floating Nutrition Card */}
                            <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-xl">
                                <div className="flex justify-between items-end text-white">
                                    <div className="w-full">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-2 flex items-center gap-2">
                                            <PieChart /> Per Serving (28g)
                                        </p>
                                        <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                            <div className="text-center">
                                                <span className="block text-xl font-bold">11g</span>
                                                <span className="text-[10px] text-zinc-400 font-medium uppercase">Fiber</span>
                                            </div>
                                            <div className="w-px h-8 bg-white/10"></div>
                                            <div className="text-center">
                                                <span className="block text-xl font-bold">4g</span>
                                                <span className="text-[10px] text-zinc-400 font-medium uppercase">Protein</span>
                                            </div>
                                            <div className="w-px h-8 bg-white/10"></div>
                                            <div className="text-center">
                                                <span className="block text-xl font-bold">5g</span>
                                                <span className="text-[10px] text-zinc-400 font-medium uppercase">Omega-3</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Decorative circle behind */}
                        <div className="absolute -top-10 -right-10 w-48 h-48 border border-[var(--primary)]/20 rounded-full -z-10 animate-spin-slow dashed-border"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-2xl -z-10"></div>
                    </div>

                    {/* Content Side */}
                    <div className="order-1 lg:order-2 animate-on-scroll" data-animation="slide-in-right">
                        <span className="text-[var(--accent)] font-bold tracking-widest text-xs uppercase bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6 inline-block shadow-lg">
                            <Star className="mr-2"/> Ingredient Spotlight
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold font-sans text-white mb-2 tracking-tight">
                            {ingredientData.name}
                        </h2>
                        <p className="text-3xl text-[#059669] font-script mb-6">
                            "{ingredientData.subtitle}"
                        </p>
                        <p className="text-zinc-400 text-lg leading-relaxed mb-10 font-light border-l-2 border-white/10 pl-6">
                            {ingredientData.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                            {ingredientData.benefits.map((benefit, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-inner-glow">
                                        <i className={`fas ${benefit.icon}`}></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm mb-0.5">{benefit.title}</h4>
                                        <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">{benefit.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a 
                            href={PORTAL_LINKS.order}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#1A1A1A] font-bold px-8 py-5 rounded-2xl hover:bg-[var(--primary)] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(65,139,30,0.4)] hover:-translate-y-1 active:scale-95 group min-h-[64px]"
                        >
                            <span>{ingredientData.cta.text}</span>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
                        </a>
                    </div>
                </div>
            </div>
            <style>{`
                .dashed-border {
                    border-style: dashed;
                }
                .shadow-inner-glow {
                    box-shadow: inset 0 0 10px rgba(65, 139, 30, 0.2);
                }
            `}</style>
        </section>
    );
};