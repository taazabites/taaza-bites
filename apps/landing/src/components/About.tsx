import React from 'react';
import { LazyImage } from './LazyImage';
import AnimateOnView from './AnimateOnView';
import { getOptimizedImageUrl } from './imageOptimizer';

const TIMELINE_DATA = [
    {
        year: "2020",
        title: "The Genesis",
        description: "Born in Bengaluru from a personal struggle to find genuinely healthy, preservative-free food options in a fast-paced urban environment."
    },
    {
        year: "2021",
        title: "First Cloud Kitchen",
        description: "Opened our first state-of-the-art facility, serving a dedicated group of early adopters with macro-calculated, premium meals."
    },
    {
        year: "2023",
        title: "City-Wide Expansion",
        description: "Expanded our cold-chain delivery network across Bangalore, introducing specialized Keto, Vegan, and High-Protein meal plans."
    },
    {
        year: "2025",
        title: "The Nutrition OS",
        description: "Serving thousands of healthy meals daily. We evolved from a kitchen into a complete nutrition solution for peak human performance."
    }
];

export const About: React.FC = () => {
    // SEO Premium: Structured Data for Organization
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Taazabites",
        "url": "https://www.taazabites.in",
        "logo": "https://www.taazabites.in/logo.png",
        "description": "Taazabites is Bangalore's No. 1 healthy meal delivery service, providing premium, chef-crafted, and macro-calculated nutrition.",
        "foundingDate": "2020",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Bengaluru",
            "addressRegion": "Karnataka",
            "addressCountry": "IN"
        },
        "sameAs": [
            "https://www.instagram.com/taazabites",
            "https://www.facebook.com/taazabites"
        ]
    };

    return (
        <section className="bg-[#050505] text-gray-300 font-sans relative overflow-hidden min-h-screen flex flex-col justify-center py-16 sm:py-24 lg:py-32" id="about">

            {/* Premium Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-full sm:w-1/2 h-full bg-white/5 backdrop-blur-3xl transform skew-x-12 translate-x-1/4"></div>
                <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-64 sm:w-96 h-64 sm:h-96 bg-[#059669]/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <AnimateOnView>
                    {/* Header Section */}
                    <div className="text-center mb-12 sm:mb-16 lg:mb-32 animate-on-scroll" data-animation="slide-up">
                        <span className="text-[#059669] font-black tracking-[0.2em] uppercase text-[10px] sm:text-xs mb-4 sm:mb-6 block">Our Heritage & Mission</span>
                        <h1 className="sr-only">About Taazabites - Premium Healthy Indian Food Delivery Mission Bangalore</h1>
                        <h2 className="text-4xl sm:text-5xl lg:text-8xl font-extrabold font-sans text-white tracking-tight mb-4 sm:mb-8 leading-none uppercase">
                            The <span className="italic text-[#F59E0B]">Story.</span>
                        </h2>
                        <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-2xl text-gray-200 font-bold leading-relaxed">
                            We started Taazabites with a singular, uncompromising belief: <strong className="font-black text-white">eating healthy shouldn't be a compromise.</strong> It should be effortless, delicious, and scientifically precise.
                        </p>
                    </div>

                    {/* Split Layout: Image & Mission */}
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 sm:gap-16 lg:gap-24 items-center mb-16 sm:mb-24 lg:mb-32">
                        {/* Image Section */}
                        <div className="w-full lg:col-span-5 relative order-1 lg:order-1 animate-on-scroll" data-animation="slide-up" data-stagger-delay="0.1s">
                            <div className="relative rounded-t-full rounded-b-[2rem] sm:rounded-b-[3rem] overflow-hidden shadow-2xl aspect-[3/4] group border border-white/10">
                                <LazyImage 
                                    src={getOptimizedImageUrl("https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=2070&auto=format&fit=crop", 800)} 
                                    alt="Taazabites expert chefs preparing fresh premium Indian healthy meals in our Bangalore kitchen" 
                                    className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-80 mix-blend-luminosity"
                                    wrapperClassName="w-full h-full"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 text-white">
                                    <span className="text-[8px] sm:text-[10px] font-mono tracking-widest uppercase mb-1.5 sm:mb-2 block text-[#059669]">Facility_01</span>
                                    <h3 className="text-xl sm:text-3xl font-sans font-black uppercase mb-1 sm:mb-2">The Core Kitchen</h3>
                                    <p className="text-white font-bold text-xs sm:text-sm">Bengaluru, Karnataka</p>
                                </div>
                            </div>
                            {/* Floating Badge */}
                            <div className="absolute top-6 sm:top-20 -right-4 sm:-right-12 bg-[#1A1A1A] p-3 sm:p-6 rounded-full shadow-2xl border border-white/10 animate-[bounce_4s_infinite] z-20">
                                <div className="text-center">
                                    <span className="block text-lg sm:text-3xl font-black text-[#F59E0B]">100%</span>
                                    <span className="block text-[6px] sm:text-[10px] font-mono tracking-widest text-white uppercase font-black">Premium</span>
                                </div>
                            </div>
                        </div>

                        {/* Text Section */}
                        <div className="w-full lg:col-span-7 space-y-6 sm:space-y-10 order-2 lg:order-2 animate-on-scroll" data-animation="slide-up" data-stagger-delay="0.2s">
                        <h3 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-sans text-white leading-tight uppercase tracking-tight">
                            More Than Just a <br className="hidden sm:block"/><span className="italic text-[#F59E0B]">Meal Delivery Service.</span>
                        </h3>
                        
                        <div className="prose prose-sm sm:prose-base lg:prose-lg prose-invert text-zinc-200 font-bold leading-relaxed">
                            <p>
                                <strong>Taazabites is Bengaluru's premier healthy Indian diet meal delivery and subscription service.</strong> We deliver chef-crafted, macro-calculated meals across HSR Layout, Sarjapur Road, Bellandur, and South Bengaluru. Our service caters to fitness enthusiasts, busy professionals, and health-conscious individuals looking for reliable daily nutrition.
                            </p>
                            <p>
                                With flexible plans spanning 1 to 3 meals a day, customers can choose between <strong className="text-emerald-400">Pure Veg, Eggitarian, and Non-Veg diet bases</strong>. Every meal is carefully calibrated for fitness goals like Weight Loss (Caloric Deficit), Muscle Gain (High Protein), Keto, or Balanced Wellness.
                            </p>
                            <p>
                                We offer <strong className="text-orange-400">100% flexible pausing with indefinite credit rollovers</strong>, all managed via our 24/7 WhatsApp concierge (+91-7975771457). We are not just feeding you—we are fueling your highest potential.
                            </p>
                        </div>
                        
                        <div className="pt-6 sm:pt-10 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8">
                            <div>
                                <h4 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-sans text-[#059669] mb-1 sm:mb-2">10k+</h4>
                                <p className="text-zinc-400 font-mono tracking-widest uppercase text-[8px] sm:text-[10px] font-black">Meals Delivered</p>
                            </div>
                            <div>
                                <h4 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-sans text-[#059669] mb-1 sm:mb-2">98%</h4>
                                <p className="text-zinc-400 font-mono tracking-widest uppercase text-[8px] sm:text-[10px] font-black">Client Retention</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <h4 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-sans text-[#059669] mb-1 sm:mb-2">0%</h4>
                                <p className="text-zinc-400 font-mono tracking-widest uppercase text-[8px] sm:text-[10px] font-black">Refined Oils</p>
                            </div>
                        </div>
                    </div>
                </div>
                </AnimateOnView>

                {/* Timeline Section */}
                <div className="mt-12 sm:mt-24 pt-12 sm:pt-24 border-t border-white/10">
                    <div className="text-center mb-10 sm:mb-20">
                        <span className="text-[#059669] font-black tracking-[0.2em] uppercase text-[10px] sm:text-xs mb-3 sm:mb-4 block">The Evolution</span>
                        <h3 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-sans text-white uppercase tracking-tight">Our Journey</h3>
                    </div>
                    
                    <div className="relative max-w-5xl mx-auto">
                        {/* Timeline Line */}
                        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-white/10"></div>
 
                    <AnimateOnView>
                        <div className="flex overflow-x-auto pb-10 -mx-6 px-6 md:mx-0 md:px-0 md:block space-y-0 md:space-y-16 relative snap-x snap-mandatory scrollbar-hide">
                            {TIMELINE_DATA.map((item, index) => (
                                <div 
                                    key={index} 
                                    className={`flex-shrink-0 w-[280px] md:w-full snap-center flex flex-col md:flex-row items-center justify-between relative animate-on-scroll ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} ${index !== 0 ? 'md:mt-16' : ''}`}
                                    data-animation="slide-up"
                                    data-stagger-delay={`${index * 0.1}s`}
                                >
                                    {/* Content */}
                                    <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-left md:pl-16' : 'md:text-right md:pr-16'}`}>
                                        <div className="bg-[#1A1A1A] p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-white/5 shadow-2xl hover:border-[#059669]/30 transition-all duration-500 group relative overflow-hidden h-full">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-[#059669] transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
                                            <div className="relative z-10">
                                                <span className="text-[#059669] font-mono tracking-widest text-[10px] sm:text-sm mb-2 sm:mb-4 block">{item.year}</span>
                                                <h4 className="text-lg sm:text-2xl font-black text-white mb-2 sm:mb-4 font-sans uppercase tracking-tight">{item.title}</h4>
                                                <p className="text-xs sm:text-base text-gray-300 font-bold leading-relaxed">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Node */}
                                    <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#050505] border border-white/10 items-center justify-center z-10 shadow-sm">
                                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#059669] shadow-[0_0_15px_rgba(5,150,105,0.5)]"></div>
                                    </div>

                                    {/* Spacer */}
                                    <div className="hidden md:block w-5/12"></div>
                                </div>
                            ))}
                        </div>
                    </AnimateOnView>
                    </div>
                </div>
            </div>
        </section>
    );
};
