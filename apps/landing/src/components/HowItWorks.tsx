import React from 'react';
import { Target, Utensils, ChefHat, Truck, Activity } from 'lucide-react';
import { LazyImage } from './LazyImage';
import { MobileSwipeContainer } from './MobileSwipeContainer';

const STEPS = [
    {
        number: "01",
        title: "Personalized Plan",
        description: "Choose from our curated Keto, High-Protein, or Vegetarian meal plans tailored to your goals.",
        icon: Utensils
    },
    {
        number: "02",
        title: "Chef Crafted",
        description: "Our expert chefs prepare your meals using 100% premium, fresh ingredients sourced daily.",
        icon: ChefHat
    },
    {
        number: "03",
        title: "Fresh Delivery",
        description: "Receive your nutritious meals at your doorstep in Bengaluru, fresh and ready to eat.",
        icon: Truck
    },
    {
        number: "04",
        title: "Feel The Vitality",
        description: "Enjoy clean eating and watch your energy levels skyrocket as you reach your health goals.",
        icon: Activity
    }
];

export const HowItWorks: React.FC = () => {
    return (
        <section className="py-24 sm:py-32 bg-white relative overflow-hidden" id="how-it-works">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 sm:mb-24">
                    <span className="text-[#059669] font-bold tracking-widest uppercase text-[10px] sm:text-xs mb-4 sm:mb-6 block">Simple Process</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-light font-serif text-[#1A1A1A] tracking-tight leading-none mb-6">
                        How it <span className="italic text-[#059669]">Works.</span>
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                        Your journey to peak vitality is just four simple steps away.
                    </p>
                </div>

                <div className="lg:hidden w-full">
                    <MobileSwipeContainer itemCount={STEPS.length} className="gap-8 pb-10">
                        {STEPS.map((step, index) => (
                            <div key={index} className="flex-shrink-0 w-[85vw] snap-center relative group">
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E6F4EA] flex items-center justify-center mb-8 group-hover:bg-[#059669] transition-all duration-500 shadow-sm group-hover:shadow-[0_20px_40px_rgba(5,150,105,0.2)] group-hover:-translate-y-2">
                                        <span className="text-2xl sm:text-3xl font-serif text-[#059669] group-hover:text-white transition-colors duration-500">{step.number}</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-serif text-[#1A1A1A] mb-4 tracking-tight group-hover:text-[#059669] transition-colors">{step.title}</h3>
                                    <p className="text-gray-500 font-light text-sm sm:text-base leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </MobileSwipeContainer>
                </div>
                
                <div className="hidden lg:grid lg:grid-cols-4 gap-12">
                    {STEPS.map((step, index) => (
                        <div key={index} className="relative group">
                            {index < STEPS.length - 1 && (
                                <div className="absolute top-12 left-[60%] w-full h-[1px] bg-gradient-to-r from-[#059669]/20 to-transparent z-0"></div>
                            )}
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-[#E6F4EA] flex items-center justify-center mb-8 group-hover:bg-[#059669] transition-all duration-500 shadow-sm group-hover:shadow-[0_20px_40px_rgba(5,150,105,0.2)] group-hover:-translate-y-2">
                                    <span className="text-3xl font-serif text-[#059669] group-hover:text-white transition-colors duration-500">{step.number}</span>
                                </div>
                                <h3 className="text-2xl font-serif text-[#1A1A1A] mb-4 tracking-tight group-hover:text-[#059669] transition-colors">{step.title}</h3>
                                <p className="text-gray-500 font-light text-base leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 sm:mt-32 relative rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden aspect-[16/9] sm:aspect-[21/9] shadow-2xl border border-white/20">
                    <LazyImage 
                        src="https://cdn.urbanpiper.com/media/bizmedia/2025/10/25/XQI0vGF-c0de1c2c-b08a-4bf6-94b7-7cb7547c811a.jpg" 
                        alt="Taazabites premium meal preparation process" 
                        className="w-full h-full object-cover"
                        wrapperClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-8 sm:p-16">
                        <div className="max-w-xl">
                            <h4 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white mb-4 tracking-tight">Engineered for Excellence.</h4>
                            <p className="text-white/80 font-light text-sm sm:text-base leading-relaxed">
                                Every meal is a healthy upgrade for your body, meticulously crafted to ensure you perform at your absolute best.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
