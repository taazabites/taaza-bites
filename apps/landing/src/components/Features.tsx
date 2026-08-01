import { PORTAL_LINKS } from '../config';
import { MobileSwipeContainer } from './MobileSwipeContainer';
import { ArrowRight, ChefHat, Apple, Truck, CalendarCheck, Leaf, Utensils } from 'lucide-react';
import React from 'react';

const FEATURES_DATA = [
    {
        title: "Chef-Prepared Meals",
        description: "Gourmet dishes crafted daily by our experienced culinary team using fresh, seasonal ingredients.",
        icon: ChefHat,
        color: "text-orange-600",
        bgColor: "bg-orange-100"
    },
    {
        title: "Nutritionally Balanced",
        description: "Every meal is designed by nutritionists to ensure optimal macronutrient ratios and calorie control.",
        icon: Apple,
        color: "text-red-600",
        bgColor: "bg-red-100"
    },
    {
        title: "Convenient Delivery",
        description: "Enjoy reliable, daily delivery straight to your home or office, saving you time on cooking and prep.",
        icon: Truck,
        color: "text-blue-600",
        bgColor: "bg-blue-100"
    },
    {
        title: "Flexible Plans",
        description: "Choose from weekly or monthly subscriptions, with the freedom to pause or cancel anytime.",
        icon: CalendarCheck,
        color: "text-purple-600",
        bgColor: "bg-purple-100"
    },
    {
        title: "Sustainable Packaging",
        description: "We use eco-friendly, recyclable containers to minimize our environmental footprint.",
        icon: Leaf,
        color: "text-orange-600",
        bgColor: "bg-orange-100"
    },
    {
        title: "Diverse Menu",
        description: "Explore a wide variety of cuisines and dietary options, ensuring you never get bored.",
        icon: Utensils,
        color: "text-orange-600",
        bgColor: "bg-orange-100"
    }
];

export const Features: React.FC = () => {
    return (
        <section className="py-16 sm:py-24 lg:py-32 bg-white relative overflow-hidden" id="features">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#FF7A00]/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 sm:mb-24">
                    <span className="text-[#FF7A00] font-bold tracking-widest uppercase text-[10px] sm:text-xs mb-4 sm:mb-6 block">The Taazabites Difference</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold font-sans text-[#1A1A1A] tracking-tight mb-6 leading-none uppercase">
                        Why Choose <span className="font-script text-[#FF7A00] normal-case tracking-normal">Us.</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg sm:text-xl text-zinc-800 font-bold leading-relaxed">
                        We combine culinary excellence with nutritional science to deliver the best meal experience.
                    </p>
                </div>

                <div className="lg:hidden w-full">
                    <MobileSwipeContainer itemCount={FEATURES_DATA.length} className="gap-6 pb-6">
                        {FEATURES_DATA.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="flex-shrink-0 w-[85vw] sm:w-[320px] snap-center bg-[#F5F2ED] rounded-[2rem] p-6 sm:p-8 border border-[#FF7A00]/10 shadow-sm flex flex-col items-start group">
                                    <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-xl mb-6 shadow-sm border border-gray-100 ${feature.color}`}>
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-sans font-extrabold text-[#1A1A1A] mb-3 tracking-tight uppercase">{feature.title}</h3>
                                    <p className="text-zinc-700 font-semibold leading-relaxed text-sm">{feature.description}</p>
                                </div>
                            );
                        })}
                    </MobileSwipeContainer>
                </div>

                <div className="hidden lg:grid lg:grid-cols-3 gap-8 lg:gap-12">
                    {FEATURES_DATA.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="bg-[#F5F2ED] rounded-[2.5rem] p-10 border border-[#FF7A00]/10 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 flex flex-col items-start group">
                                <div className={`w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-2xl mb-8 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-500 ${feature.color}`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-sans font-extrabold text-[#1A1A1A] mb-4 tracking-tight uppercase">{feature.title}</h3>
                                <p className="text-zinc-700 font-semibold leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 flex justify-center">
                    <a 
                        href={PORTAL_LINKS.order} 
                        target="_blank"
                        rel="noreferrer"
                        className="group relative px-8 py-4 bg-[#059669] text-white rounded-full font-bold uppercase tracking-[0.15em] text-sm sm:text-base overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#059669] to-[#F59E0B] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            Order Now 
                            <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
                        </span>
                    </a>
                </div>
            </div>
        </section>
    );
};
