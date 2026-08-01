import { Utensils, Compass, Home, BookOpen, Calculator, CalendarDays, HelpCircle, PhoneCall, MapPin } from 'lucide-react';
import React from 'react';

export interface NotFoundProps {
    onNavigate: (path: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigate }) => {
    const quickLinks = [
        {
            title: "Configure Diet Plan",
            desc: "Custom calorie-counted plans.",
            icon: CalendarDays,
            path: "/subscriptions",
            color: "text-emerald-600 bg-emerald-50 border-emerald-100"
        },
        {
            title: "Calculate Macros",
            desc: "Find your perfect calorie-split.",
            icon: Calculator,
            path: "/macro-calculator",
            color: "text-amber-600 bg-amber-50 border-amber-100"
        },
        {
            title: "Browse Fresh Menu",
            desc: "See our zero-seed-oil dishes.",
            icon: Utensils,
            path: "/menu",
            color: "text-orange-600 bg-orange-50 border-orange-100"
        },
        {
            title: "Nutritional Blog",
            desc: "Dietitian articles and health guides.",
            icon: BookOpen,
            path: "/blog",
            color: "text-blue-600 bg-blue-50 border-blue-100"
        },
        {
            title: "Local Coverage Hub",
            desc: "Check our active Bangalore wards.",
            icon: MapPin,
            path: "/seo-strategy",
            color: "text-purple-600 bg-purple-50 border-purple-100"
        },
        {
            title: "Contact Concierge",
            desc: "Talk to our 24/7 nutritionists.",
            icon: PhoneCall,
            path: "/contact",
            color: "text-rose-600 bg-rose-50 border-rose-100"
        }
    ];

    return (
        <section className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 bg-[#F5F2ED] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
                <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-emerald-500 blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
            </div>

            <div className="max-w-4xl w-full text-center relative z-10 space-y-12">
                {/* Visual Header */}
                <div className="space-y-4">
                    <div className="inline-flex items-center justify-center mb-2">
                        <div className="relative animate-float">
                            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-[#E2DFDA]">
                                <Utensils className="w-12 h-12 text-[#059669]" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#059669] block">
                        HTTP Status Node 404
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-serif font-light text-zinc-900 tracking-tight leading-none">
                        Dish <span className="text-[#059669] italic font-normal">Off the Menu</span>
                    </h1>
                    <p className="text-zinc-600 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
                        The page you are looking for doesn't exist or has moved. Let's redirect you to a fresh meal plan option, or configure your diet macros below.
                    </p>
                </div>

                {/* Grid of helpful links (Addresses the MEDIUM audit issue directly) */}
                <div className="space-y-4">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 text-center">
                        Explore Popular Kitchen Destinations
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
                        {quickLinks.map((link, idx) => {
                            const IconComponent = link.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.preventDefault(); onNavigate(link.path); }}
                                    className="bg-white border border-[#E2DFDA] rounded-2xl p-4 hover:border-[#059669] hover:shadow-md transition-all duration-300 flex items-start gap-4 group text-left"
                                >
                                    <div className={`p-2.5 rounded-xl border shrink-0 transition-transform group-hover:scale-110 ${link.color}`}>
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="font-bold text-xs text-zinc-800 group-hover:text-[#059669] transition-colors">
                                            {link.title}
                                        </h3>
                                        <p className="text-[10px] text-zinc-500 leading-normal font-light">
                                            {link.desc}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Primary Return Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button 
                        onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
                        className="w-full sm:w-auto bg-[#059669] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-600/10 hover:bg-[#047857] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group text-xs font-mono uppercase tracking-widest"
                    >
                        <Home className="w-4 h-4" /> Return to Homepage
                    </button>
                    <button 
                        onClick={(e) => { e.preventDefault(); onNavigate('/seo-strategy'); }}
                        className="w-full sm:w-auto bg-zinc-900 text-white hover:bg-zinc-800 font-bold py-3.5 px-8 rounded-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group text-xs font-mono uppercase tracking-widest"
                    >
                        <Compass className="w-4 h-4 text-emerald-400" /> SEO Strategy Hub
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
};

