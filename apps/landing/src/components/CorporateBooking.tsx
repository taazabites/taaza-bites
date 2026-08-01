import { MobileSwipeContainer } from './MobileSwipeContainer';
import { 
    Loader2, 
    Send, 
    TrendingUp, 
    Heart, 
    Sliders, 
    Briefcase, 
    Users, 
    Check, 
    Sparkles, 
    DollarSign, 
    Clock, 
    ArrowRight, 
    MapPin, 
    Activity, 
    FileText, 
    CheckCircle2, 
    Building2, 
    Mail, 
    Phone, 
    RefreshCw,
    ShieldCheck,
    Coffee
} from 'lucide-react';
import { WHATSAPP_NUMBER } from '../config';
import React, { useState, useEffect } from 'react';
import { SmartButton } from './SmartButton';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface Projection {
    productivityIncrease: number;
    sickDaysReduction: number;
    annualRoi: number;
    summary: string;
}

export const CorporateBooking: React.FC = () => {
    // Booking Form States
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [selectedService, setSelectedService] = useState<string>("Daily Team Lunch");
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        employeeCount: '',
        requirements: '',
    });

    // Form errors
    const [errors, setErrors] = useState({
        email: '',
        phone: '',
        companyName: '',
        contactName: ''
    });

    // Calculator states
    const [numEmployees, setNumEmployees] = useState(120);
    const [healthScore, setHealthScore] = useState(7);
    const [projection, setProjection] = useState<Projection | null>(null);
    const [isCalcLoading, setIsCalcLoading] = useState(false);
    const [isSynced, setIsSynced] = useState(false);

    // Mobile stats sliding carousel states
    const [statsActiveIndex, setStatsActiveIndex] = useState(0);
    const statsContainerRef = React.useRef<HTMLDivElement>(null);

    const handleStatsScroll = () => {
        if (statsContainerRef.current) {
            const { scrollLeft, clientWidth } = statsContainerRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            setStatsActiveIndex(index);
        }
    };

    // Mobile wellness program sliding carousel states
    const [programActiveIndex, setProgramActiveIndex] = useState(0);
    const programContainerRef = React.useRef<HTMLDivElement>(null);

    const handleProgramScroll = () => {
        if (programContainerRef.current) {
            const { scrollLeft, clientWidth } = programContainerRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            setProgramActiveIndex(index);
        }
    };

    // Run confetti when status transitions to success
    useEffect(() => {
        if (status === 'success') {
            // Blast main explosive burst
            confetti({
                particleCount: 150,
                spread: 85,
                origin: { y: 0.5 }
            })?.catch(e => console.warn("Confetti", e));

            // Delayed smaller pops
            const end = Date.now() + 2 * 1000;
            const interval = setInterval(() => {
                if (Date.now() > end) {
                    return clearInterval(interval);
                }
                confetti({
                    startVelocity: 25,
                    spread: 360,
                    ticks: 50,
                    origin: { x: Math.random(), y: Math.random() - 0.2 }
                })?.catch(e => console.warn("Confetti", e));
            }, 250);

            return () => clearInterval(interval);
        }
    }, [status]);

    const handleOrderTrialBox = (packName: string, minimumMembers: number, pricePerMeal: number) => {
        if (navigator.vibrate) navigator.vibrate([15, 30]);
        const basePrice = 299; // Standard subscription base price
        const discountPct = Math.round((1 - pricePerMeal / basePrice) * 100);
        
        const rawMessage = [
            '🍱 *Taazabites Corporate Office Plan Request* 🍱',
            '====================================',
            `🏢 *Team Size Category:* ${packName} (Min. ${minimumMembers} Members)`,
            `💰 *Special Pricing:* ₹${pricePerMeal}/meal (${discountPct}% OFF Base Price of ₹${basePrice})`,
            `📍 *Target Delivery Zone:* Bengaluru Tech Parks (Please specify your layout)`,
            '------------------------------------',
            'Hi Taazabites Team! We are interested in setting up the corporate wellness meals for our office.',
            'Please let us know the available lunch slots, payment process, and confirm our delivery address.'
        ].join('\n');
        
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(rawMessage)}`;
        const opened = window.open(whatsappUrl, '_blank');
        if (!opened) {
            window.location.href = whatsappUrl;
        }
    };

    const handleCalculate = async () => {
        setIsCalcLoading(true);
        if (navigator.vibrate) navigator.vibrate(12);
        try {
            const response = await fetch('/api/corporate-wellness', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employees: numEmployees, mealsPerWeek: 5, healthScore })
            });
            if (!response.ok) throw new Error('Failed to generate projection');
            const result = await response.json();
            setProjection(result);
            setIsSynced(false); // Reset sync flag for the new projection
        } catch (err) {
            console.error("Failed to generate AI ROI projection:", err);
        } finally {
            setIsCalcLoading(false);
        }
    };

    const handleSyncToForm = () => {
        if (!projection) return;
        if (navigator.vibrate) navigator.vibrate([15, 30, 15]);

        // Map employee count to select dropdown options
        let mappedCount = "10-50";
        if (numEmployees > 50 && numEmployees <= 200) mappedCount = "51-200";
        else if (numEmployees > 200 && numEmployees <= 500) mappedCount = "201-500";
        else if (numEmployees > 500) mappedCount = "500+";

        const projectionNote = `[Wellness Projection Details]
• Plan Choice: ${selectedService}
• Team Count: ${numEmployees} Members
• Estimated Productivity Gain: +${projection.productivityIncrease}%
• Estimated Sick Leave Reduction: -${projection.sickDaysReduction}%
• Annual Economic Vitality Return: ₹${projection.annualRoi.toLocaleString('en-IN')}

Our Custom Requirements: `;

        setFormData(prev => ({
            ...prev,
            employeeCount: mappedCount,
            requirements: prev.requirements.includes("[Wellness Projection Details]") 
                ? prev.requirements // Avoid double appending if already synced
                : projectionNote + prev.requirements
        }));

        setIsSynced(true);
    };

    const validateForm = () => {
        const newErrors = { email: '', phone: '', companyName: '', contactName: '' };
        let isValid = true;

        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
            isValid = false;
        }
        if (!formData.contactName.trim()) {
            newErrors.contactName = 'Contact person name is required';
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Business email is required';
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid business email';
            isValid = false;
        }

        // Indian mobile number validation (allowing optional +91 or 0)
        const phoneRegex = /^(?:\+91|0)?[6789]\d{9}$/;
        const cleanPhone = formData.phone.replace(/[\s-]/g, '');
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
            isValid = false;
        } else if (!phoneRegex.test(cleanPhone)) {
            newErrors.phone = 'Please enter a valid 10-digit mobile number';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Instant validation clear on typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
            if (navigator.vibrate) navigator.vibrate([40, 80]);
            return;
        }

        const { companyName, contactName, email, phone, employeeCount, requirements } = formData;
        
        if (!employeeCount) {
            alert("Please select a team size.");
            return;
        }

        setStatus('submitting');
        if (navigator.vibrate) navigator.vibrate(20);

        const rawMessage = [
            '💼 *Taazabites Corporate Wellness Enquiry* 💼',
            '====================================',
            `🏢 *Company Name:* ${companyName}`,
            `👤 *Contact Person:* ${contactName}`,
            `✉️ *Business Email:* ${email}`,
            `📞 *Mobile Phone:* ${phone}`,
            `👥 *Staff Capacity:* ${employeeCount} employees`,
            `💡 *Primary Interest:* ${selectedService}`,
            '------------------------------------',
            `📝 *Custom Requirements / Notes:*`,
            requirements || 'None specified',
            '====================================',
            '⚡ _Submitted via Taazabites Enterprise Portal_'
        ].join('\n');

        const encodedMessage = encodeURIComponent(rawMessage);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        setStatus('success');
        
        const opened = window.open(whatsappUrl, '_blank');
        if (!opened) {
            window.location.href = whatsappUrl;
        }

        // Transition back to idle smoothly after a short delay
        setTimeout(() => {
            setStatus('idle');
            setFormData({ companyName: '', contactName: '', email: '', phone: '', employeeCount: '', requirements: '' });
            setIsSynced(false);
        }, 3000);
    };

    const services = [
        {
            name: "Daily Team Lunch",
            desc: "Chef-prepared, premium calorie-counted daily hot box deliveries direct to your tech park or office hub.",
            badge: "Most Popular"
        },
        {
            name: "Event & Seminar Catering",
            desc: "Elevated healthy gourmet catering, live cold-pressed juice bars, and grazing tables for retreats or board meetings.",
            badge: "Flexible"
        },
        {
            name: "Executive Healthy Platters",
            desc: "Specially formulated dietitian-approved premium lunch trays tailored for leadership teams and key client sessions.",
            badge: "VIP Service"
        },
        {
            name: "Wellness Consults & Subsidy",
            desc: "Corporate sponsor programs where employers subsidize daily health subscriptions with structured reports.",
            badge: "Full Program"
        }
    ];

    const inputClasses = "w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-[#059669] focus:bg-white focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all duration-300 text-[#1A1A1A] placeholder:text-gray-400 font-medium text-sm";
    const labelClasses = "block text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mb-2 ml-1";

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Taazabites Corporate Wellness Catering & Meal Subscriptions",
        "serviceType": "Corporate Wellness & Office Lunches",
        "provider": {
            "@type": "LocalBusiness",
            "name": "Taazabites",
            "image": "https://www.taazabites.in/images/logo.png",
            "priceRange": "$$",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "HSR Layout",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560102",
                "addressCountry": "IN"
            }
        },
        "areaServed": [
            { "@type": "City", "name": "Bengaluru" },
            { "@type": "Neighborhood", "name": "HSR Layout" },
            { "@type": "Neighborhood", "name": "Koramangala" },
            { "@type": "Neighborhood", "name": "Whitefield" },
            { "@type": "Neighborhood", "name": "Bellandur" }
        ],
        "description": "Premium healthy corporate meal delivery and wellness catering services in Bengaluru. Boost employee productivity with nutritious, calorie-controlled, dietitian-prepared office lunches.",
        "offers": {
            "@type": "Offer",
            "price": "149",
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock"
        }
    };

    return (
        <section className="py-20 sm:py-28 bg-[#FCFAF7] relative overflow-hidden">
            {/* dynamic structured SEO schema */}
            <script type="application/ld+json">
                {JSON.stringify(serviceSchema)}
            </script>

            {/* AEO / GEO Context Layer (Screen Reader Only) - optimized for LLMs to understand the local coverage and service specifics */}
            <div className="sr-only">
                <article>
                    <h1>Taazabites Corporate Wellness & Office Catering Delivery in Bengaluru</h1>
                    <p>Are you searching for the best healthy corporate lunch delivery in Bengaluru? Taazabites offers top-rated dietitian-crafted, calorie-counted meal subscriptions tailored exclusively for tech parks, enterprises, and startups across major IT corridors: HSR Layout, Bellandur, Sarjapur Road, Whitefield, Electronic City, Koramangala, and the Outer Ring Road (ORR).</p>
                    <p>Our corporate wellness B2B programs are proven to increase employee productivity, reduce sick leaves, and provide delicious hot-box meals directly to the office desk. Options include Pure Veg, Eggitarian, and Non-Veg diet bases. We support employee meal subsidies, event catering, and executive platters.</p>
                    <p>Order a trial box today to experience our sustainable, zero-waste corporate catering with 100% flexible pausing and indefinite credit rollovers.</p>
                </article>
            </div>

            {/* Premium decorative backgrounds */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[55rem] h-[55rem] bg-[#059669]/5 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[45rem] h-[45rem] bg-[#F59E0B]/5 rounded-full blur-[140px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 sm:mb-24 max-w-3xl mx-auto">
                    <span className="text-[#059669] bg-[#059669]/10 px-4 py-2 rounded-full font-bold tracking-widest uppercase text-[10px] sm:text-xs mb-6 inline-block">
                        Enterprise Solutions
                    </span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light font-serif text-[#1A1A1A] tracking-tight mb-6 leading-none">
                        Corporate <span className="italic text-[#059669]">Wellness.</span>
                    </h2>
                    <p className="text-base sm:text-lg text-zinc-600 font-light leading-relaxed mb-8">
                        Transform your workplace velocity with Bengaluru's premium dietitian-designed nutrition program. Optimize workforce vitality, minimize health leaves, and unlock peak productivity.
                    </p>

                    {/* Fast Order & Trial Box Action Bar */}
                    <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#059669]/20 shadow-[0_15px_40px_rgba(5,150,105,0.08)] mb-12 text-left">
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4EA] text-[#059669] text-[10px] font-black uppercase tracking-widest mb-2">
                                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" /> Instant Trial Order
                                </div>
                                <h3 className="text-xl sm:text-2xl font-serif text-[#1A1A1A] font-bold">Book an Office Trial Box Today</h3>
                                <p className="text-xs text-zinc-500 mt-1 font-light">Taste-test our hot, calorie-counted dietitian meals with your team before starting a subscription.</p>
                            </div>
                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Taazabites, I want to book a Corporate Trial Box for my team in Bengaluru!')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95"
                            >
                                <Phone className="w-4 h-4" /> Instant WhatsApp Concierge
                            </a>
                        </div>

                        {/* Trial Pack Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#FCFAF7] p-5 rounded-2xl border border-zinc-200 hover:border-[#059669] transition-all flex flex-col justify-between group">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-zinc-900 uppercase">Small Team (10-49)</span>
                                        <div className="text-right">
                                            <span className="text-[10px] text-zinc-400 line-through mr-1 font-mono">₹299</span>
                                            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">₹254 / Meal</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 font-light mb-4">Ideal for team leads & small departments. Hot box delivered direct to desk. Includes 15% OFF standard rate.</p>
                                </div>
                                <button
                                    onClick={() => handleOrderTrialBox('Small Team (10-49 Members)', 10, 254)}
                                    className="w-full bg-white hover:bg-[#059669] text-zinc-800 hover:text-white border border-zinc-200 hover:border-[#059669] py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 group-hover:shadow-sm"
                                >
                                    Start 10+ Plan <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="bg-[#FCFAF7] p-5 rounded-2xl border-2 border-[#059669]/40 hover:border-[#059669] transition-all flex flex-col justify-between relative overflow-hidden group shadow-sm">
                                <div className="absolute top-0 right-0 bg-[#059669] text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl font-mono">25% OFF</div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-[#059669] uppercase">Growing Team (50+)</span>
                                        <div className="text-right">
                                            <span className="text-[10px] text-zinc-400 line-through mr-1 font-mono">₹299</span>
                                            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">₹224 / Meal</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 font-light mb-4">Perfect for department lunches & medium companies. Includes 25% OFF standard rate.</p>
                                </div>
                                <button
                                    onClick={() => handleOrderTrialBox('Growing Team (50-249 Members)', 50, 224)}
                                    className="w-full bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    Start 50+ Plan <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="bg-[#FCFAF7] p-5 rounded-2xl border border-zinc-200 hover:border-[#059669] transition-all flex flex-col justify-between group">
                                <div className="absolute top-0 right-0 bg-zinc-800 text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl font-mono hidden group-hover:block">MAX SAVINGS</div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-zinc-900 uppercase">Enterprise (250+)</span>
                                        <div className="text-right">
                                            <span className="text-[10px] text-zinc-400 line-through mr-1 font-mono">₹299</span>
                                            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">₹209 / Meal</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 font-light mb-4">Designed for tech park floors & full company lunches. Free hot-case setup. Maximum 30% OFF.</p>
                                </div>
                                <button
                                    onClick={() => handleOrderTrialBox('Enterprise (250+ Members)', 250, 209)}
                                    className="w-full bg-white hover:bg-[#059669] text-zinc-800 hover:text-white border border-zinc-200 hover:border-[#059669] py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 group-hover:shadow-sm"
                                >
                                    Start 250+ Plan <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid stats - Desktop view */}
                <div className="hidden md:grid md:grid-cols-3 gap-6 mb-16 sm:mb-20">
                    <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex items-start gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] flex items-center justify-center text-[#059669] shrink-0">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#1A1A1A] text-lg mb-1">+18% Workplace Focus</h3>
                            <p className="text-sm text-zinc-500 font-light leading-relaxed">Nutritious meals stabilize blood sugar levels, preventing midday post-lunch lethargy and fatigue.</p>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex items-start gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] flex items-center justify-center text-[#059669] shrink-0">
                            <Heart className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#1A1A1A] text-lg mb-1">-24% Medical Leaves</h3>
                            <p className="text-sm text-zinc-500 font-light leading-relaxed">Continuous delivery of essential micronutrients supports immunity, directly reducing seasonal sickness absenteeism.</p>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex items-start gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] flex items-center justify-center text-[#059669] shrink-0">
                            <Sliders className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#1A1A1A] text-lg mb-1">100% Turnkey Execution</h3>
                            <p className="text-sm text-zinc-500 font-light leading-relaxed">Smooth custom delivery, automated tracking, and weekly dietitian updates catered directly to your staff.</p>
                        </div>
                    </div>
                </div>

                {/* Grid stats - Mobile view (Side-Sliding) */}
                <div className="md:hidden relative mb-12 overflow-hidden w-full">
                    <div 
                        ref={statsContainerRef}
                        onScroll={handleStatsScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-6 gap-6 scroll-smooth"
                    >
                        <div className="min-w-[85vw] flex-shrink-0 snap-center bg-white p-6 rounded-3xl border border-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center text-[#059669] shrink-0">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#1A1A1A] text-base mb-1">+18% Workplace Focus</h3>
                                <p className="text-xs text-zinc-500 font-light leading-relaxed">Nutritious meals stabilize blood sugar levels, preventing midday post-lunch lethargy and fatigue.</p>
                            </div>
                        </div>

                        <div className="min-w-[85vw] flex-shrink-0 snap-center bg-white p-6 rounded-3xl border border-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center text-[#059669] shrink-0">
                                <Heart className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#1A1A1A] text-base mb-1">-24% Medical Leaves</h3>
                                <p className="text-xs text-zinc-500 font-light leading-relaxed">Continuous delivery of essential micronutrients supports immunity, directly reducing seasonal sickness absenteeism.</p>
                            </div>
                        </div>

                        <div className="min-w-[85vw] flex-shrink-0 snap-center bg-white p-6 rounded-3xl border border-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center text-[#059669] shrink-0">
                                <Sliders className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#1A1A1A] text-base mb-1">100% Turnkey Execution</h3>
                                <p className="text-xs text-zinc-500 font-light leading-relaxed">Smooth custom delivery, automated tracking, and weekly dietitian updates catered directly to your staff.</p>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Carousel Indicators */}
                    <div className="flex items-center justify-center gap-2 mt-2">
                        {[0, 1, 2].map((_, index) => (
                            <button 
                                key={index} 
                                onClick={() => {
                                    if(navigator.vibrate) navigator.vibrate(5);
                                    if(statsContainerRef.current) {
                                        statsContainerRef.current.scrollTo({
                                            left: index * statsContainerRef.current.clientWidth,
                                            behavior: 'smooth'
                                        });
                                    }
                                }} 
                                className={`h-1.5 transition-all duration-500 rounded-full ${statsActiveIndex === index ? 'w-8 bg-[#059669]' : 'w-2 bg-zinc-300'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Bento Grid Container */}
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: ROI Calculator (5 grid cols on lg) */}
                    <div className="lg:col-span-5 min-w-0 bg-white border border-zinc-100 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-[0_15px_35px_rgba(0,0,0,0.03)] relative overflow-hidden h-full">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#F59E0B]/30"></div>
                        
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono">Taazabites AI Diagnostician</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A] tracking-tight">Workforce Vitality Estimator</h2>
                            <p className="text-zinc-500 text-xs mt-1">Configure your staff metrics to project health and financial returns.</p>
                        </div>

                        {/* Sliders Container */}
                        <div className="space-y-6 mb-8">
                            {/* Employee Range */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Active Staff Members</span>
                                    <span className="text-lg font-mono font-bold text-[#1A1A1A]">{numEmployees}</span>
                                </div>
                                <input 
                                    id="calc-staff-slider"
                                    type="range" 
                                    min="10" 
                                    max="1000" 
                                    step="5"
                                    value={numEmployees} 
                                    onChange={e => setNumEmployees(Number(e.target.value))} 
                                    className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none accent-[#059669] cursor-pointer outline-none"
                                    aria-label="Active Staff Members Slider"
                                />
                                <div className="flex justify-between text-[9px] text-zinc-400 font-mono px-1">
                                    <span>10 staff</span>
                                    <span>1000 staff</span>
                                </div>
                            </div>

                            {/* Health Baseline */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Current Team Vitality</span>
                                    <span className="text-lg font-mono font-bold text-[#1A1A1A]">{healthScore} <span className="text-xs text-zinc-400">/ 10</span></span>
                                </div>
                                <input 
                                    id="calc-health-slider"
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    step="1"
                                    value={healthScore} 
                                    onChange={e => setHealthScore(Number(e.target.value))} 
                                    className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none accent-[#F59E0B] cursor-pointer outline-none"
                                    aria-label="Current Team Vitality Baseline Slider"
                                />
                                <div className="flex justify-between text-[9px] text-zinc-400 font-mono px-1">
                                    <span>Needs Focus (1)</span>
                                    <span>Excellent Nutrition (10)</span>
                                </div>
                            </div>
                        </div>

                        {/* Projection Action / Loading */}
                        {isCalcLoading ? (
                            <div className="space-y-6">
                                <button disabled className="w-full bg-zinc-100 text-zinc-400 py-4 rounded-full flex items-center justify-center gap-3 font-medium text-sm border border-zinc-200">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#059669]" /> Running Enterprise Projection Matrix...
                                </button>
                                {/* Shimmer loaders for projection content */}
                                <div className="space-y-4 animate-pulse">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-24 bg-zinc-50 rounded-2xl border border-zinc-100"></div>
                                        <div className="h-24 bg-zinc-50 rounded-2xl border border-zinc-100"></div>
                                    </div>
                                    <div className="h-40 bg-zinc-900 rounded-[2rem]"></div>
                                </div>
                            </div>
                        ) : !projection ? (
                            <SmartButton 
                                label="Calculate ROI & Health Impact"
                                variant="primary"
                                onClick={handleCalculate}
                                icon={<TrendingUp className="w-4 h-4" />}
                                className="w-full"
                            />
                        ) : (
                            <div className="space-y-6 animate-fade-in">
                                {/* Result blocks */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-50/70 p-5 rounded-2xl border border-zinc-100 text-center relative group">
                                        <p className="text-[8px] font-extrabold text-zinc-400 uppercase tracking-widest mb-2">Productivity</p>
                                        <div className="text-3xl font-mono font-extrabold text-[#059669] tracking-tight">
                                            +{projection.productivityIncrease}%
                                        </div>
                                        <p className="text-[10px] text-zinc-500 mt-1 font-light">Midday Efficiency</p>
                                    </div>
                                    <div className="bg-zinc-50/70 p-5 rounded-2xl border border-zinc-100 text-center relative group">
                                        <p className="text-[8px] font-extrabold text-zinc-400 uppercase tracking-widest mb-2">Absenteeism</p>
                                        <div className="text-3xl font-mono font-extrabold text-orange-600 tracking-tight">
                                            -{projection.sickDaysReduction}%
                                        </div>
                                        <p className="text-[10px] text-zinc-500 mt-1 font-light">Sick Leaves Saved</p>
                                    </div>
                                </div>

                                {/* Financial ROI Block */}
                                <div className="bg-gradient-to-br from-[#059669]/5 to-transparent border border-[#059669]/10 p-5 rounded-2xl text-center">
                                    <p className="text-[8px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Estimated Annual Enterprise ROI</p>
                                    <div className="text-3xl font-mono font-extrabold text-[#059669] tracking-tight">
                                        ₹{projection.annualRoi.toLocaleString('en-IN')}
                                    </div>
                                    <p className="text-[9px] text-zinc-500 mt-1">Based on saved health resource losses & focus recovery</p>
                                </div>

                                {/* Dietetic Projection Summary Box */}
                                <div className="bg-[#1A1A1A] text-white p-6 rounded-[2rem] relative overflow-hidden border border-white/5">
                                    <p className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-[0.3em] mb-3 font-mono">Clinical Projection Summary</p>
                                    <p className="text-sm font-serif italic leading-relaxed text-zinc-200">
                                        "{projection.summary}"
                                    </p>
                                    
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#059669]/10 blur-3xl rounded-full"></div>
                                </div>

                                {/* Sync / Application action */}
                                <button 
                                    type="button"
                                    onClick={handleSyncToForm}
                                    className={`w-full py-4 px-6 rounded-full font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border transition-all duration-300 ${
                                        isSynced 
                                            ? "bg-[#E6F4EA] border-[#059669]/20 text-[#059669] cursor-default" 
                                            : "bg-[#059669] hover:bg-[#047857] text-white border-transparent hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-[#059669]/20"
                                    }`}
                                >
                                    {isSynced ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-[#059669]" /> Form Synchronized Successfully
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 text-[#F59E0B]" /> Apply Projection to Quote Form ⚡
                                        </>
                                    )}
                                </button>
                                
                                <div className="text-center">
                                    <button 
                                        type="button"
                                        onClick={() => { setProjection(null); setIsSynced(false); }} 
                                        className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600 inline-flex items-center gap-1.5"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Reset Estimation Grid
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Contact / Request Form (7 grid cols on lg) */}
                    <div className="lg:col-span-7 bg-white border border-zinc-100 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative min-w-0">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#059669]/20 via-[#059669] to-[#059669]/20"></div>
                        
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A] tracking-tight">Request an Enterprise Proposal</h2>
                                <p className="text-zinc-500 text-xs mt-1">Receive a comprehensive healthy catering quote tailored to your workplace.</p>
                            </div>
                            
                            {/* Synced Badge indicator */}
                            <AnimatePresence>
                                {isSynced && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="bg-[#E6F4EA] text-[#059669] text-[9px] font-bold font-mono px-3 py-1.5 rounded-full border border-[#059669]/15 flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Sparkles className="w-3 h-3 text-[#F59E0B] animate-pulse" /> AI Projected
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Interactive Primary Program Goals cards */}
                        <div className="mb-8">
                            <label className={labelClasses}>Select Target Wellness Program</label>
                            
                            {/* Desktop/Tablet View: Grid */}
                            <div className="hidden sm:grid sm:grid-cols-2 gap-4">
                                {services.map((item, idx) => {
                                    const isSelected = selectedService === item.name;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setSelectedService(item.name);
                                                if (navigator.vibrate) navigator.vibrate(8);
                                            }}
                                            className={`text-left p-4 rounded-2xl border text-xs transition-all duration-300 relative overflow-hidden ${
                                                isSelected 
                                                    ? "bg-[#059669]/5 border-[#059669] ring-2 ring-[#059669]/10" 
                                                    : "bg-zinc-50/50 border-zinc-150 hover:bg-white hover:border-zinc-300"
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className={`font-semibold text-sm ${isSelected ? "text-[#059669]" : "text-zinc-800"}`}>{item.name}</span>
                                                {isSelected ? (
                                                    <Check className="w-4 h-4 text-[#059669] bg-[#E6F4EA] p-0.5 rounded-full" />
                                                ) : (
                                                    <span className="text-[8px] bg-zinc-200/50 text-zinc-500 px-2 py-0.5 rounded font-mono font-bold uppercase">{item.badge}</span>
                                                )}
                                            </div>
                                            <p className="text-zinc-500 leading-relaxed text-[11px] font-light">{item.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Mobile View: Touch-enabled horizontal swipe carousel */}
                            <div className="sm:hidden relative overflow-hidden w-full">
                                <div 
                                    ref={programContainerRef}
                                    onScroll={handleProgramScroll}
                                    className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-4 gap-4 scroll-smooth"
                                >
                                    {services.map((item, idx) => {
                                        const isSelected = selectedService === item.name;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedService(item.name);
                                                    if (navigator.vibrate) navigator.vibrate(8);
                                                }}
                                                className={`text-left p-5 rounded-2xl border text-xs transition-all duration-300 relative overflow-hidden min-w-[80vw] flex-shrink-0 snap-center ${
                                                    isSelected 
                                                        ? "bg-[#059669]/5 border-[#059669] ring-2 ring-[#059669]/10" 
                                                        : "bg-zinc-50/50 border-zinc-150"
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className={`font-bold text-sm ${isSelected ? "text-[#059669]" : "text-zinc-800"}`}>{item.name}</span>
                                                    {isSelected ? (
                                                        <Check className="w-4 h-4 text-[#059669] bg-[#E6F4EA] p-0.5 rounded-full" />
                                                    ) : (
                                                        <span className="text-[8px] bg-zinc-200/50 text-zinc-500 px-2 py-0.5 rounded font-mono font-bold uppercase">{item.badge}</span>
                                                    )}
                                                </div>
                                                <p className="text-zinc-500 leading-relaxed text-[11px] font-light mb-3">{item.desc}</p>
                                                <div className="text-[9px] font-mono text-zinc-400 mt-2 flex justify-between items-center border-t border-zinc-100/50 pt-2">
                                                    <span>Program {idx + 1} of 4</span>
                                                    <span className={isSelected ? "text-[#059669] font-bold" : ""}>{isSelected ? "Selected" : "Tap to select"}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Dots Indicators */}
                                <div className="flex items-center justify-center gap-1.5 mt-1">
                                    {[0, 1, 2, 3].map((_, index) => (
                                        <button 
                                            key={index} 
                                            onClick={() => {
                                                if (navigator.vibrate) navigator.vibrate(5);
                                                if (programContainerRef.current) {
                                                    programContainerRef.current.scrollTo({
                                                        left: index * programContainerRef.current.clientWidth,
                                                        behavior: 'smooth'
                                                    });
                                                }
                                            }} 
                                            className={`h-1 transition-all duration-500 rounded-full ${programActiveIndex === index ? 'w-6 bg-[#059669]' : 'w-1.5 bg-zinc-300'}`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <form id="corporate-form" onSubmit={handleSubmit} className="space-y-6">
                            {/* Inputs row 1 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="corp-company-name" className={labelClasses}>Company Name</label>
                                    <div className="relative">
                                        <input 
                                            id="corp-company-name"
                                            type="text" 
                                            name="companyName" 
                                            value={formData.companyName} 
                                            onChange={handleChange} 
                                            className={`${inputClasses} ${errors.companyName ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10' : ''}`} 
                                            placeholder="e.g. Google India" 
                                            autoComplete="organization"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none">
                                            <Building2 className="w-4 h-4" />
                                        </span>
                                    </div>
                                    {errors.companyName && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-medium">{errors.companyName}</p>}
                                </div>
                                <div>
                                    <label htmlFor="corp-contact-name" className={labelClasses}>Contact Person</label>
                                    <div className="relative">
                                        <input 
                                            id="corp-contact-name"
                                            type="text" 
                                            name="contactName" 
                                            value={formData.contactName} 
                                            onChange={handleChange} 
                                            className={`${inputClasses} ${errors.contactName ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10' : ''}`} 
                                            placeholder="e.g. Rohan Sharma" 
                                            autoComplete="name"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none">
                                            <Users className="w-4 h-4" />
                                        </span>
                                    </div>
                                    {errors.contactName && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-medium">{errors.contactName}</p>}
                                </div>
                            </div>

                            {/* Inputs row 2 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="corp-email" className={labelClasses}>Business Email</label>
                                    <div className="relative">
                                        <input 
                                            id="corp-email"
                                            type="email" 
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleChange} 
                                            className={`${inputClasses} ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10' : ''}`} 
                                            placeholder="Rohan@company.com" 
                                            autoComplete="email"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none">
                                            <Mail className="w-4 h-4" />
                                        </span>
                                    </div>
                                    {errors.email && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-medium">{errors.email}</p>}
                                </div>
                                <div>
                                    <label htmlFor="corp-phone" className={labelClasses}>Mobile Number</label>
                                    <div className="relative">
                                        <input 
                                            id="corp-phone"
                                            type="tel" 
                                            name="phone" 
                                            value={formData.phone} 
                                            onChange={handleChange} 
                                            className={`${inputClasses} ${errors.phone ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10' : ''}`} 
                                            placeholder="98765 43210" 
                                            autoComplete="tel"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none">
                                            <Phone className="w-4 h-4" />
                                        </span>
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-medium">{errors.phone}</p>}
                                </div>
                            </div>

                            {/* Team select & delivery areas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="corp-team-size" className={labelClasses}>Approximate Team Size</label>
                                    <select 
                                        id="corp-team-size"
                                        name="employeeCount" 
                                        value={formData.employeeCount} 
                                        onChange={handleChange} 
                                        required 
                                        className={`${inputClasses} appearance-none cursor-pointer bg-no-repeat`}
                                        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'%231A1A1A\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")', backgroundPosition: 'right 16px center' }}
                                    >
                                        <option value="" disabled>Select team size</option>
                                        <option value="10-50">10 - 50 members</option>
                                        <option value="51-200">51 - 200 members</option>
                                        <option value="201-500">201 - 500 members</option>
                                        <option value="500+">500+ members</option>
                                    </select>
                                </div>
                                <div className="flex flex-col justify-center bg-zinc-50 rounded-2xl p-4 border border-zinc-150 relative">
                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
                                        <div>
                                            <h4 className="text-xs font-bold text-zinc-800">Delivery Coverage Bengaluru</h4>
                                            <p className="text-[10px] text-zinc-500 font-light mt-0.5">We cover HSR, Koramangala, Bellandur, Whitefield, Electronic City, and more.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Requirements */}
                            <div>
                                <label htmlFor="corp-requirements" className={labelClasses}>Specific Requests & Nutritional Focus</label>
                                <textarea 
                                    id="corp-requirements"
                                    name="requirements" 
                                    value={formData.requirements} 
                                    onChange={handleChange} 
                                    rows={4} 
                                    className={`${inputClasses} resize-y min-h-[100px] font-mono text-xs`}
                                    placeholder="Tell us about food allergies, specific cuisines, delivery schedules, or premium menu expectations..."
                                ></textarea>
                            </div>
                            
                            {/* Submitting Status feedback or generic submit */}
                            <SmartButton 
                                id="corp-submit-btn"
                                label={status === 'submitting' ? 'Preparing Enterprise File...' : 'Request Custom Quote'}
                                variant="primary"
                                icon={status === 'submitting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                className="w-full mt-4"
                                type="submit"
                                disabled={status === 'submitting'}
                            />
                        </form>
                    </div>

                </div>
            </div>

            {/* FULL SUCCESS REDIRECT OVERLAY WITH CONFETTI BACKGROUND */}
            <AnimatePresence>
                {status === 'success' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-[#1A1A1A]/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
                        id="success-redirect-overlay"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-8 sm:p-12 text-center max-w-lg w-full shadow-2xl relative border border-zinc-100 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#059669]"></div>
                            
                            <div className="w-20 h-20 bg-[#E6F4EA] text-[#059669] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md animate-bounce">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>

                            <span className="text-[#059669] text-[10px] font-black uppercase tracking-widest font-mono">Enquiry Successfully Synced</span>
                            <h3 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A] mt-2 mb-4 tracking-tight">Enterprise Quote Requested</h3>
                            
                            <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-light">
                                Thank you for choosing Taazabites! We are generating your custom enterprise nutrition proposal.
                            </p>

                            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-150 mb-6 flex items-center justify-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin text-[#059669]" />
                                <span className="text-xs text-zinc-600 font-medium">Redirecting you to our onboarding channel on WhatsApp...</span>
                            </div>

                            <a 
                                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent([
                                    '💼 *Taazabites Corporate Wellness Enquiry* 💼',
                                    '====================================',
                                    `🏢 *Company Name:* ${formData.companyName}`,
                                    `👤 *Contact Person:* ${formData.contactName}`,
                                    `✉️ *Business Email:* ${formData.email}`,
                                    `📞 *Mobile:* ${formData.phone}`,
                                    `👥 *Team:* ${formData.employeeCount}`,
                                    `💡 *Interest:* ${selectedService}`
                                ].join('\n'))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-medium text-xs uppercase tracking-widest px-8 py-4 rounded-full w-full transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                            >
                                <Send className="w-4 h-4" /> Open WhatsApp Manually
                            </a>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
