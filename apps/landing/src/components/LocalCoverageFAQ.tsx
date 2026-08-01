import React, { useState, useRef } from 'react';
import { MapPin, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { MobileSwipeContainer } from './MobileSwipeContainer';

const COVERAGE_DATA = [
    {
        id: 'kasavanahalli',
        locality: 'Kasavanahalli (HQ)',
        description: 'Taazabites operates its state-of-the-art Central Kitchen and logistics headquarters in Kasavanahalli, Bengaluru. This central hub dispatches hot, calorie-controlled, and high-protein meal subscriptions daily at lightning speed, ensuring maximum nutritional integrity for our nearest neighbors.',
        faq: [
            { q: "Is daily delivery available in Kasavanahalli?", a: "Yes, since our primary kitchen and HQ are in Kasavanahalli, residents enjoy first-priority delivery slots with premium, fully flexible morning and evening windows." },
            { q: "Can I self-collect or visit the Kasavanahalli kitchen?", a: "Yes, active subscribers can coordinate with our dedicated WhatsApp concierge line to schedule direct pickup or visit our high-hygiene kitchen." }
        ]
    },
    {
        id: 'hsr',
        locality: 'HSR Layout',
        description: 'Situated right next to our Kasavanahalli HQ, HSR Layout is one of our primary delivery corridors. We deliver freshly prepared, dietitian-approved calorie-deficit and keto meal plans to tech professionals and fitness lovers daily with strict temperature control.',
        faq: [
            { q: "Does Taazabites deliver daily to HSR Layout?", a: "Yes, we provide daily scheduled deliveries to all sectors of HSR Layout, covering both residential addresses and corporate tech parks." },
            { q: "What is the delivery cutoff time for HSR Layout?", a: "To receive your meal the next day in HSR Layout, please complete your subscription or daily order by 8:00 PM." }
        ]
    },
    {
        id: 'koramangala',
        locality: 'Koramangala',
        description: 'Our delivery network provides comprehensive coverage across all blocks of Koramangala. We specialize in bringing chef-crafted, calorie-counted diet meals directly to the bustling tech and startup offices, as well as residential homes in the area.',
        faq: [
            { q: "Is healthy meal delivery available in Koramangala?", a: "Yes, Taazabites delivers freshly prepared, macro-calculated healthy meals across all blocks of Koramangala." },
            { q: "Do you deliver lunch to Koramangala offices?", a: "Absolutely. We offer dedicated lunchtime deliveries directly to corporate offices and co-working spaces in Koramangala." }
        ]
    },
    {
        id: 'sarjapur',
        locality: 'Sarjapur Road',
        description: 'Taazabites services the entire Sarjapur Road corridor, including Kasavanahalli and Haralur Road. We ensure that fitness enthusiasts and busy professionals in this high-density area have reliable access to 100% preservative-free nutrition.',
        faq: [
            { q: "Can I get a monthly diet plan delivered to Sarjapur Road?", a: "Yes, our Habit (20-day) and Lifestyle (60-day) subscription plans are fully available for delivery along Sarjapur Road and adjacent areas." },
            { q: "Are deliveries on Sarjapur Road handled by trained staff?", a: "Yes, all our deliveries along the Sarjapur corridor are executed by our trained hygiene-compliant logistics partners." }
        ]
    },
    {
        id: 'whitefield',
        locality: 'Whitefield',
        description: 'Catering to Bengaluru’s major IT hub, our Whitefield delivery routes are optimized for professional schedules. We deliver fresh, dietitian-approved lunch and dinner subscriptions designed for corporate employees seeking clean eating without compromising on taste.',
        faq: [
            { q: "Does Taazabites deliver to ITPL and Whitefield tech parks?", a: "Yes, we regularly deliver healthy meal subscriptions to major tech parks and residential enclaves in Whitefield." },
            { q: "How does Whitefield delivery packaging handle transit?", a: "Our meals arrive in premium, temperature-stable compostable eco-friendly food containers, ensuring your food stays fresh and safe during the commute to Whitefield." }
        ]
    },
    {
        id: 'indiranagar',
        locality: 'Indiranagar',
        description: 'We bring our premium macro-calculated meals to the heart of Indiranagar. Whether you are looking for a calorie-deficit plan or a high-protein muscle builder, our smooth delivery ensures your dietary goals are met with precision in this vibrant neighborhood.',
        faq: [
            { q: "What diet plans are available for delivery in Indiranagar?", a: "All our specialized plans, including Calorie Deficit, High Protein, and Keto, are available for delivery in Indiranagar." },
            { q: "Can I pause my Indiranagar meal delivery if I travel?", a: "Yes, active subscribers in Indiranagar can easily pause and resume their meal deliveries via our support channel." }
        ]
    },
    {
        id: 'electronic-city',
        locality: 'Electronic City',
        description: 'Taazabites delivers dietitian-approved, macro-precise high-protein and calorie-deficit meal plans to tech professionals and residents in Electronic City. Our dedicated delivery network ensures fresh, temperature-stable meals arrive exactly when scheduled.',
        faq: [
            { q: "Do you deliver to Electronic City Phase 1 and Phase 2?", a: "Yes, we cover both Phase 1 and Phase 2 of Electronic City, including major tech parks, corporate offices, and gated communities." },
            { q: "What time are meals delivered to Electronic City?", a: "Meals are delivered in designated time slots: Morning (7:00 - 9:00 AM) for breakfast/lunch, and Evening (6:00 - 8:00 PM) for dinner to align with your work hours." }
        ]
    }
];

export const LocalCoverageFAQ: React.FC = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollLeft, clientWidth } = containerRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            setActiveSlide(index);
        }
    };

    const scrollToSlide = (index: number) => {
        if (containerRef.current) {
            const { clientWidth } = containerRef.current;
            containerRef.current.scrollTo({
                left: index * clientWidth,
                behavior: 'smooth'
            });
            setActiveSlide(index);
        }
    };

    const scrollPrev = () => {
        const nextIndex = Math.max(0, activeSlide - 1);
        scrollToSlide(nextIndex);
    };

    const scrollNext = () => {
        const nextIndex = Math.min(COVERAGE_DATA.length - 1, activeSlide + 1);
        scrollToSlide(nextIndex);
    };

    return (
        <section className="py-24 bg-[#0a0a0a] border-t border-white/5 relative z-10" id="delivery-zones">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 border border-emerald-500/30">
                        <MapPin className="w-3.5 h-3.5" /> Delivery Coverage
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold font-sans text-white tracking-tight mb-6 uppercase">
                        Bengaluru Delivery <span className="font-script text-[#FF7A00] normal-case tracking-normal">Coverage & FAQs</span>
                    </h2>
                    <p className="text-gray-400 font-light max-w-2xl mx-auto text-xs sm:text-sm">
                        Precision nutrition delivered fresh across Bengaluru's major hubs directly from our main operational kitchen. Swipe or slide to explore specific coverage details for your locality.
                    </p>
                </div>

                {/* DESKTOP VIEW: Grid with 3 columns */}
                <div className="hidden lg:grid gap-8 lg:grid-cols-3">
                    {COVERAGE_DATA.map((zone) => (
                        <div 
                            key={zone.id} 
                            className={`bg-[#111] border rounded-3xl p-8 hover:bg-zinc-900/40 transition-all duration-300 flex flex-col justify-between ${
                                zone.locality.includes('HQ') 
                                    ? 'border-orange-500/30 shadow-[0_0_30px_rgba(255,122,0,0.05)]' 
                                    : 'border-white/[0.03] hover:border-white/10'
                            }`}
                        >
                            <div>
                                <h3 className="text-2xl font-extrabold font-sans text-white mb-4 flex items-center gap-2 uppercase">
                                    <MapPin className={`w-5 h-5 shrink-0 ${zone.locality.includes('HQ') ? 'text-orange-500' : 'text-emerald-500'}`} />
                                    <span>{zone.locality}</span>
                                    {zone.locality.includes('HQ') && (
                                        <span className="ml-auto text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-mono font-bold tracking-widest uppercase">HQ Hub</span>
                                    )}
                                </h3>
                                <p className="text-sm text-gray-400 font-light leading-relaxed mb-6 font-sans">
                                    {zone.description}
                                </p>
                            </div>
                            
                            <div className="space-y-4 pt-6 border-t border-white/[0.05]">
                                <h4 className="text-xs font-sans font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                    <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
                                    Local FAQ
                                </h4>
                                {zone.faq.map((item, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="text-sm font-semibold text-gray-200">
                                            Q: {item.q}
                                        </div>
                                        <div className="text-sm text-gray-500 font-light leading-relaxed">
                                            A: {item.a}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* MOBILE / TABLET VIEW: Sliding Carousel Container */}
                <div className="lg:hidden relative w-full mt-8">
                    <MobileSwipeContainer itemCount={COVERAGE_DATA.length} className="gap-6" theme="dark">
                        {COVERAGE_DATA.map((zone) => (
                            <div 
                                key={zone.id} 
                                className={`min-w-[85vw] sm:min-w-[400px] flex-shrink-0 snap-center bg-[#111] border rounded-3xl p-6 sm:p-8 flex flex-col justify-between ${
                                    zone.locality.includes('HQ') 
                                        ? 'border-orange-500/30 shadow-[0_0_20px_rgba(255,122,0,0.05)]' 
                                        : 'border-white/[0.03]'
                                }`}
                            >
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-extrabold font-sans text-white mb-3 flex items-center gap-2 uppercase">
                                        <MapPin className={`w-5 h-5 shrink-0 ${zone.locality.includes('HQ') ? 'text-orange-500' : 'text-emerald-500'}`} />
                                        <span>{zone.locality}</span>
                                        {zone.locality.includes('HQ') && (
                                            <span className="ml-auto text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-mono font-bold tracking-widest uppercase">HQ Hub</span>
                                        )}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed mb-6 font-sans">
                                        {zone.description}
                                    </p>
                                </div>
                                
                                <div className="space-y-4 pt-5 border-t border-white/[0.05]">
                                    <h4 className="text-[10px] font-sans font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <HelpCircle className="w-3 h-3 text-orange-400" />
                                        Local FAQ
                                    </h4>
                                    {zone.faq.map((item, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="text-xs sm:text-sm font-semibold text-gray-200">
                                                Q: {item.q}
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
                                                A: {item.a}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </MobileSwipeContainer>
                </div>
            </div>
            
            {/* Inline JSON-LD for GEO/SEO */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": COVERAGE_DATA.flatMap(zone => zone.faq.map(f => ({
                        "@type": "Question",
                        "name": f.q,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": f.a
                        }
                    })))
                })
            }} />
        </section>
    );
};
