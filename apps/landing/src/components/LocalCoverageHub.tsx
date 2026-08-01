import { MobileSwipeContainer } from './MobileSwipeContainer';
import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

const HUB_AREAS = [
    { name: "HSR Layout", desc: "Premium high-protein delivery for fitness enthusiasts in Sectors 1-7." },
    { name: "Sarjapur Road", desc: "Priority dispatch for gated communities and tech parks near Kasavanahalli." },
    { name: "Bellandur", desc: "Macro-calculated meals delivered to RMZ Ecospace and corporate hubs." },
    { name: "Koramangala", desc: "Healthy diet subscriptions for professionals across all blocks." },
    { name: "Indiranagar", desc: "Clean eating options for active lifestyles near 100 Feet Road." },
    { name: "Electronic City", desc: "Fuel your workday with nutritious lunches delivered to Phases 1 & 2." },
    { name: "Whitefield", desc: "Scientific nutrition plans delivered to ITPL and residential enclaves." },
    { name: "Marathahalli", desc: "Calorie-counted bowls for busy commuters near ORR." }
];

export const LocalCoverageHub: React.FC = () => {
    return (
        <section id="local-coverage" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-xs font-bold text-[#059669] uppercase tracking-[0.3em] mb-4">Service Availability</h2>
                    <h3 className="text-3xl sm:text-4xl font-serif font-light text-[#1A1A1A] mb-6">
                        Serving the Healthiest <span className="italic">Neighborhoods</span> in Bengaluru
                    </h3>
                    <p className="max-w-2xl mx-auto text-gray-500 font-light text-sm sm:text-base">
                        Our cloud kitchen hub in Kasavanahalli is strategically located to ensure 
                        fresh, hot, and on-time delivery across the city's major residential and technology corridors.
                    </p>
                </div>

                <div className="lg:hidden w-full"><MobileSwipeContainer itemCount={HUB_AREAS.length} className="gap-6 pb-10 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                    {HUB_AREAS.map((area, idx) => (
                        <div 
                            key={idx}
                            className="flex-shrink-0 w-[280px] sm:w-auto snap-center group p-8 rounded-[2rem] bg-[#F9F8F6] border border-transparent hover:border-[#059669]/20 hover:bg-white hover:shadow-xl transition-all duration-500"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:bg-[#059669] group-hover:text-white transition-colors duration-500">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h4 className="text-lg font-bold text-[#1A1A1A] mb-3">{area.name}</h4>
                            <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">
                                {area.desc}
                            </p>
                            <div className="flex items-center gap-2 text-[#059669] text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                                Check Availability <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    ))}
                </MobileSwipeContainer></div>
                <div className="hidden lg:grid lg:grid-cols-4 gap-6 pb-10">
                    {HUB_AREAS.map((area, idx) => (
                        <div 
                            key={idx}
                            className="group p-8 rounded-[2rem] bg-[#F9F8F6] border border-transparent hover:border-[#059669]/20 hover:bg-white hover:shadow-xl transition-all duration-500"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:bg-[#059669] group-hover:text-white transition-colors duration-500">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h4 className="text-lg font-bold text-[#1A1A1A] mb-3">{area.name}</h4>
                            <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">
                                {area.desc}
                            </p>
                            <div className="flex items-center gap-2 text-[#059669] text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                                Check Availability <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-20 p-8 sm:p-12 rounded-[3rem] bg-[#1A1A1A] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#059669]/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="text-center lg:text-left">
                            <h4 className="text-white text-2xl font-serif font-light mb-4">Not in these areas yet?</h4>
                            <p className="text-gray-400 text-sm font-light max-w-md">
                                We are rapidly expanding our delivery fleet. Connect with our concierge to request 
                                priority setup for your community or workplace.
                            </p>
                        </div>
                        <a 
                            href="https://wa.me/917975771457"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-10 py-5 bg-[#059669] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#047857] transition-all hover:-translate-y-1 shadow-lg shadow-[#059669]/20"
                        >
                            Request Area Launch
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
