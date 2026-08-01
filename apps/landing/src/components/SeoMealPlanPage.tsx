import { PORTAL_LINKS } from '../config';
import React, { useState, useMemo } from 'react';
import { Subscriptions } from './Subscriptions';
import { ScientificExpertiseSection } from './ScientificExpertiseSection';
import { MapPin, Shield, CheckCircle2, Clock, Leaf, Search, Check, Info, ArrowDown, Activity, ChevronDown } from 'lucide-react';
import { LOCALITY_DATA_MAP, LOCALITY_SUB_ZONES } from '../seoLocalityData';

export const SeoMealPlanPage: React.FC<{
    title: React.ReactNode;
    description: string;
    keyword: string;
    localityKey?: string;
    onNavigate?: (path: string) => void;
}> = ({ title, description, keyword, localityKey, onNavigate }) => {
    const locDetail = localityKey ? LOCALITY_DATA_MAP[localityKey] : null;
    const subZones = localityKey ? LOCALITY_SUB_ZONES[localityKey] : [];

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubZone, setSelectedSubZone] = useState<string | null>(null);

    const filteredSubZones = useMemo(() => {
        if (!searchQuery) return subZones;
        return subZones.filter(zone => 
            zone.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [subZones, searchQuery]);

    // Handle auto-scrolling to the subscription cards anchor
    const scrollToSubscriptions = () => {
        const subsElement = document.getElementById("subscriptions");
        if (subsElement) {
            subsElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full flex flex-col min-h-screen pt-20 bg-[#F5F2ED]">
            <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in-up">
                <span className="text-[#059669] font-mono text-[10px] tracking-widest uppercase mb-4 block font-bold">
                    {locDetail ? `LOCALLY CRAFTED IN BENGALURU` : `TAAZABITES NUTRITION EXPERTS`}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-[#1A1A1A] tracking-tight leading-[1.1] mb-6">
                    {title}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto italic">
                    {description}
                </p>
            </div>

            {/* GEO & AEO Hyper-optimization section */}
            {locDetail && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 w-full">
                    <div className="bg-white rounded-[2.5rem] border border-[#FF7A00]/10 p-8 md:p-12 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-full blur-3xl"></div>
                        
                        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                            {/* Local Hub Factual details for Answer Engines / Humans */}
                            <div className="lg:col-span-7 space-y-6">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-bold uppercase tracking-wider">
                                    <MapPin className="w-3.5 h-3.5" /> Local Hub: {locDetail.locality}
                                </div>
                                <h2 className="text-2xl md:text-4xl font-serif font-light text-[#1A1A1A]">
                                    Expertly Crafted Healthy Nutrition for <span className="italic text-[#FF7A00]">{locDetail.locality}</span>
                                </h2>
                                <p className="text-[#1A1A1A]/70 text-sm md:text-base font-light leading-relaxed">
                                    {locDetail.description}
                                </p>

                                <div className="space-y-3 pt-4 border-t border-gray-100">
                                    <div className="flex items-start gap-2.5 text-xs md:text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
                                        <div>
                                            <strong className="text-[#1A1A1A] font-medium">Coverage Zones: </strong>
                                            <span className="text-[#1A1A1A]/70">{locDetail.coverage}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-xs md:text-sm">
                                        <Clock className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
                                        <div>
                                            <strong className="text-[#1A1A1A] font-medium">Daily Dispatch Windows: </strong>
                                            <span className="text-[#1A1A1A]/70">{locDetail.deliveryTimes}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-xs md:text-sm">
                                        <Shield className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
                                        <div>
                                            <strong className="text-[#1A1A1A] font-medium">FSSAI Certification: </strong>
                                            <span className="text-[#1A1A1A]/70">Central Cloud-Kitchen Registered (#21223188002425)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scientific Spec Grid - Perfect for structured search extraction (AEO) */}
                            <div className="lg:col-span-5 bg-[#F9F7F2] rounded-[2rem] p-6 md:p-8 border border-gray-200">
                                <h3 className="text-xs font-sans font-bold text-gray-400 uppercase tracking-widest mb-6">Expert Verification</h3>
                                <div className="divide-y divide-gray-200">
                                    {locDetail.specs.map((spec, index) => (
                                        <div key={index} className="py-3 flex justify-between gap-4 text-xs md:text-sm">
                                            <span className="text-gray-500 font-light">{spec.label}</span>
                                            <span className="text-[#1A1A1A] font-mono font-medium text-right">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                                        <Leaf className="w-4 h-4" />
                                    </div>
                                    <div className="text-[10px] md:text-xs text-gray-500 font-light leading-tight">
                                        Every meal is prepared with extreme care in a professional, sterile kitchen environment. No refined oils, GMOs, or artificial colors.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Real-Time Delivery Check: Local Address Checker */}
                        {subZones.length > 0 && (
                            <div className="mt-12 bg-[#F9F7F2]/50 rounded-[2rem] p-6 md:p-10 border border-gray-200">
                                <div className="max-w-2xl mb-8">
                                    <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A] mb-2 flex items-center gap-2">
                                        <Search className="w-5 h-5 text-[#059669]" /> Verify Delivery Coverage in {locDetail.locality}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-600 font-light">
                                        Select your sector, road, or block below to instantly verify active service, calculate proximity, and check customized dispatch hours.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-12 gap-8 items-start">
                                    {/* Search Input and Sub-zones */}
                                    <div className="md:col-span-7 space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder={`Type your neighborhood, block, or sector...`}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] text-sm text-[#1A1A1A] transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest block">
                                                Active Coverage Neighborhoods (Long-Tail Index)
                                            </span>
                                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                {filteredSubZones.map((zone) => {
                                                    const isSelected = selectedSubZone === zone;
                                                    return (
                                                        <button
                                                            key={zone}
                                                            onClick={() => setSelectedSubZone(zone)}
                                                            className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 font-medium ${
                                                                isSelected
                                                                    ? 'bg-[#059669] text-white shadow-sm scale-102 font-semibold'
                                                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#059669]/50 hover:bg-[#059669]/5'
                                                            }`}
                                                        >
                                                            {isSelected && <Check className="w-3 h-3" />}
                                                            {zone}
                                                        </button>
                                                    );
                                                })}
                                                {filteredSubZones.length === 0 && (
                                                    <p className="text-xs text-gray-400 italic">No matching sub-zone found in our daily dispatch system. Contact support to request priority coverage.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Card Panel */}
                                    <div className="md:col-span-5 w-full">
                                        {selectedSubZone ? (
                                            <div className="bg-white rounded-3xl p-6 border border-[#059669]/20 shadow-md space-y-4 animate-fade-in-up">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    <span className="text-xs font-sans font-bold text-emerald-600 uppercase tracking-wider">
                                                        Active Priority Coverage
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-serif font-medium text-[#1A1A1A]">
                                                        {selectedSubZone}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 font-light mt-1">
                                                        Serviced by: <span className="font-mono font-medium text-[#1A1A1A]">{locDetail.specs[0].value}</span>
                                                    </p>
                                                </div>

                                                <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Service Area:</span>
                                                        <span className="text-[#1A1A1A] font-medium text-right">{locDetail.locality} Zone</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Delivery Fee:</span>
                                                        <span className="text-[#059669] font-bold">₹0 (Free standard delivery)</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Order Cutoff:</span>
                                                        <span className="text-[#1A1A1A] font-medium font-mono">8:00 PM (Next Day Delivery)</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Packaging Type:</span>
                                                        <span className="text-[#1A1A1A] font-medium text-right"> Eco-Friendly Food Container</span>
                                                    </div>
                                                </div>

                                                <a
                                                    href={PORTAL_LINKS.subscribe}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-full mt-2 py-3 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                                >
                                                    Select Subscription Plan <ArrowDown className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="bg-[#F4F1EC] rounded-3xl p-8 border border-dashed border-gray-300 text-center py-12 text-gray-500 space-y-3">
                                                <Info className="w-8 h-8 text-gray-400 mx-auto" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-700">No Neighborhood Selected</p>
                                                    <p className="text-[11px] font-light max-w-[200px] mx-auto mt-1 leading-normal text-gray-500">
                                                        Select or search your specific street/block to display connection nodes and dispatch slots.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Local Locality FAQs */}
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-serif font-medium text-[#1A1A1A] mb-4">Frequently Asked Questions for {locDetail.locality}</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {locDetail.faqs.map((faq, index) => (
                                    <div key={index} className="space-y-1">
                                        <h4 className="text-xs md:text-sm font-semibold text-[#1A1A1A]">Q: {faq.q}</h4>
                                        <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed">A: {faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Directs the user perfectly to the checkout / configuration */}
            <Subscriptions />

            {/* Dynamic SEO Internal Backlink / Inter-linking Hub Section */}
            <div className="bg-white border-t border-gray-100 py-16 px-4 sm:px-6 lg:px-8 mt-12 w-full">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center">
                        <span className="text-[#059669] font-mono text-[10px] tracking-widest uppercase mb-2 block font-bold">
                            TAAZABITES NETWORK HUB
                        </span>
                        <h2 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] tracking-tight">
                            Serving Chef-Prepared Diet Plans <span className="italic text-[#059669]">Across Bengaluru</span>
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500 font-light mt-2 max-w-xl mx-auto leading-relaxed">
                            Forming a highly-synchronized local operational network. Click any of our dedicated nodes below to verify micro-locality logistics, nutrition goals, and customized daily dispatch parameters.
                        </p>
                    </div>

                    {/* Specialized Diet Programs (Wide Bento Layout) */}
                    <div className="bg-[#F9F7F2]/60 rounded-[2rem] p-8 border border-gray-100/80 space-y-6">
                        <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-gray-200/60">
                            <Activity className="w-4 h-4 text-[#059669]" />
                            Nutrition Core Programs
                        </h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { path: "/weight-loss-meal-plan-bangalore", name: "Weight Loss Diet Plan", desc: "Scientific Caloric Deficit Subscriptions" },
                                { path: "/high-protein-meals-bangalore", name: "High-Protein Muscle Builder", desc: "Hypertrophy-focused Athlete Nutrition" },
                                { path: "/pcos-meal-plan-bangalore", name: "PCOS Supportive Program", desc: "Hormone Balancing & Low-GI Nutrition" },
                                { path: "/healthy-food-subscription-bangalore", name: "General Healthy Food Subscription", desc: "Ultimate Everyday Wellness & Longevity Meals" },
                            ].map((lnk) => {
                                const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
                                const isActive = currentPath === lnk.path;
                                return (
                                    <a
                                        key={lnk.path}
                                        href={lnk.path}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (onNavigate) onNavigate(lnk.path);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`group p-4 rounded-2xl border transition-all duration-300 text-left flex flex-col justify-between min-h-[100px] ${
                                            isActive
                                                ? 'bg-[#059669]/5 border-[#059669] pointer-events-none'
                                                : 'bg-white border-gray-200/80 hover:border-[#059669] hover:shadow-[0_4px_20px_rgba(5,150,105,0.05)]'
                                        }`}
                                    >
                                        <div className="flex-1">
                                            <span className={`text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-[#059669]' : 'text-[#1A1A1A] group-hover:text-[#059669]'}`}>
                                                {lnk.name}
                                            </span>
                                            <p className="text-[10px] text-gray-500 font-light mt-1 leading-normal">
                                                {lnk.desc}
                                            </p>
                                        </div>
                                        {!isActive ? (
                                            <span className="text-[10px] text-[#059669] font-mono font-medium mt-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300">
                                                View program &rarr;
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-[#059669] font-mono font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md mt-3 inline-block self-start">
                                                Current Plan
                                            </span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Neighborhood Hubs (Comprehensive Directory) */}
                    <div className="bg-[#F9F7F2]/60 rounded-[2rem] p-8 border border-gray-100/80 space-y-6">
                        <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-gray-200/60">
                            <MapPin className="w-4 h-4 text-[#FF7A00]" />
                            Neighborhood Hubs
                        </h3>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[
                                { path: "/meal-delivery-hsr-layout", name: "HSR Layout", desc: "Sectors 1-7, Haralur Road & Kudlu" },
                                { path: "/meal-delivery-koramangala", name: "Koramangala", desc: "Blocks 1-8, Ejipura & SG Palya" },
                                { path: "/meal-delivery-whitefield", name: "Whitefield", desc: "ITPL, Hope Farm, Hoodi & Varthur" },
                                { path: "/meal-delivery-indiranagar", name: "Indiranagar", desc: "HAL, Defense Colony & Domlur" },
                                { path: "/meal-delivery-sarjapur-road", name: "Sarjapur Road", desc: "Carmelaram, Sompura & Doddakannelli" },
                                { path: "/meal-delivery-kasavanahalli", name: "Kasavanahalli", desc: "Main Road, Junnasandra & Jail Road" },
                                { path: "/meal-delivery-haralur", name: "Haralur", desc: "Reliable Woods, Royal Placid & Kudlu" },
                                { path: "/meal-delivery-bellandur", name: "Bellandur", desc: "Green Glen, RMZ Ecospace & Ecoworld" },
                                { path: "/meal-delivery-marathahalli", name: "Marathahalli", desc: "Spice Garden, AECS Layout & Kundalahalli" },
                                { path: "/meal-delivery-electronic-city", name: "Electronic City", desc: "Phases 1 & 2, Neeladri Rd & Wipro" },
                                { path: "/meal-delivery-jp-nagar", name: "JP Nagar", desc: "Phases 1-8, Dollar Layout & Sarakki" },
                                { path: "/meal-delivery-jayanagar", name: "Jayanagar", desc: "Blocks 1-9, Yediyur & Tilak Nagar" },
                                { path: "/meal-delivery-btm-layout", name: "BTM Layout", desc: "Stages 1 & 2, Tavarekere & Madiwala" },
                                { path: "/meal-delivery-hebbal", name: "Hebbal", desc: "Manyata Tech Park, Kempapura & RT Nagar" },
                                { path: "/meal-delivery-yelahanka", name: "Yelahanka", desc: "Old & New Town, Kogilu Road & Jakkur" },
                                { path: "/meal-delivery-mahadevapura", name: "Mahadevapura", desc: "ORR, Phoenix Marketcity & Hoodi" },
                            ].map((lnk) => {
                                const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
                                const isActive = currentPath === lnk.path;
                                return (
                                    <a
                                        key={lnk.path}
                                        href={lnk.path}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (onNavigate) onNavigate(lnk.path);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`group p-4 rounded-2xl border transition-all duration-300 text-left flex flex-col justify-between min-h-[90px] ${
                                            isActive
                                                ? 'bg-[#059669]/5 border-[#059669] pointer-events-none'
                                                : 'bg-white border-gray-200/80 hover:border-[#FF7A00] hover:shadow-[0_4px_20px_rgba(255,122,0,0.05)]'
                                        }`}
                                    >
                                        <div>
                                            <span className={`text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-[#059669]' : 'text-[#1A1A1A] group-hover:text-[#FF7A00]'}`}>
                                                {lnk.name}
                                            </span>
                                            <p className="text-[10px] text-gray-500 font-light mt-1 leading-normal">
                                                {lnk.desc}
                                            </p>
                                        </div>
                                        {!isActive && (
                                            <span className="text-[10px] text-[#FF7A00] font-mono font-medium mt-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300">
                                                Verify hub &rarr;
                                            </span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scientific Expertise (E-E-A-T) */}
            <div className="mt-24 border-t border-gray-100">
                <ScientificExpertiseSection />
            </div>

            {/* Local AEO FAQ Section */}
            {locDetail?.faqs && locDetail.faqs.length > 0 && (
                <div id="faq" className="max-w-4xl mx-auto px-4 py-24">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#059669]/10 text-[#059669] font-mono text-[10px] rounded-full uppercase tracking-wider mb-4 font-semibold">
                            <Activity className="w-3 h-3" /> Area Specific Questions
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-serif text-[#1A1A1A] tracking-tight">
                            Frequently Asked Questions <span className="italic text-[#059669]">{locDetail.locality}</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {locDetail.faqs.map((faq, idx) => (
                            <details key={idx} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:border-[#059669]/30">
                                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                    <h2 className="text-lg font-serif text-[#1A1A1A] group-open:text-[#059669] transition-colors">
                                        {faq.q}
                                    </h2>
                                    <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-300" />
                                </summary>
                                <div className="px-6 pb-6 pt-2">
                                    <p className="text-gray-600 font-light leading-relaxed">
                                        {faq.a}
                                    </p>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
