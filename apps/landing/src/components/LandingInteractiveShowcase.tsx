/**
 * LandingInteractiveShowcase.tsx
 * Out-of-the-box interactive meal & macro matrix for Taazabites landing page.
 * Enhances both desktop and mobile UX with smooth tab switching, macro bars, and locality checks.
 */

import React, { useState } from 'react';
import { Target, Flame, Activity, CheckCircle2, ArrowRight, MapPin, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { LazyImage } from './LazyImage';

interface GoalPlan {
    id: string;
    name: string;
    tagline: string;
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
    description: string;
    badge: string;
    imageUrl: string;
    meals: {
        slot: string;
        name: string;
        desc: string;
        calories: string;
    }[];
}

const GOAL_PLANS: GoalPlan[] = [
    {
        id: 'weight-loss',
        name: 'Calorie Deficit & Weight Loss',
        tagline: 'Sustainable fat loss without muscle wasting or starvation',
        calories: '1,350 - 1,550 kcal',
        protein: '85g+',
        carbs: '120g (Low GI)',
        fats: '35g (Good Fats)',
        description: 'Engineered for steady, healthy weight loss. High fiber millet rotis, lean protein curries, and clean cold-pressed oils.',
        badge: 'Most Popular in HSR',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop',
        meals: [
            { slot: 'Breakfast (7-9 AM)', name: 'Sprouted Moong & Vegetable Poha', desc: 'Mint chutney, roasted peanuts, high fiber, high protein.', calories: '380 kcal' },
            { slot: 'Lunch (12 PM)', name: 'Jowar Roti + Paneer Tikka Masala', desc: 'Served with brown rice, dal tadka, and cucumber mint raita.', calories: '540 kcal' },
            { slot: 'Dinner (7 PM)', name: 'Herbed Grilled Tofu & Roasted Broccoli', desc: 'Warm zucchini soup with olive oil drizzle.', calories: '430 kcal' }
        ]
    },
    {
        id: 'high-protein',
        name: 'High Protein / Muscle Hypertrophy',
        tagline: 'Maximized protein synthesis for active fitness enthusiasts',
        calories: '2,100 - 2,400 kcal',
        protein: '140g+',
        carbs: '180g',
        fats: '55g',
        description: 'Packed with dense amino-acid profiles, double paneer/tofu/chicken portions, and slow-release complex carbohydrates.',
        badge: 'Tech Professional Choice',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop',
        meals: [
            { slot: 'Breakfast (7-9 AM)', name: 'High Protein Egg White & Paneer Bhurji', desc: 'Multigrain sourdough toast and almond milk.', calories: '520 kcal' },
            { slot: 'Lunch (12 PM)', name: 'Grilled Chicken / Tofu Breast Bowl', desc: 'Quinoa pilaf, roasted sweet potatoes, and peanut satay sauce.', calories: '780 kcal' },
            { slot: 'Dinner (7 PM)', name: 'Spinach Dal + Paneer Steak', desc: 'Steamed edamame and sautéed bell peppers.', calories: '650 kcal' }
        ]
    },
    {
        id: 'pcos-hormone',
        name: 'PCOS & Hormone Balance',
        tagline: 'Anti-inflammatory, low-glycemic meals to regulate insulin',
        calories: '1,450 - 1,650 kcal',
        protein: '90g',
        carbs: '110g (Zero Refined Sugar)',
        fats: '45g (Omega-3 Rich)',
        description: 'Designed specifically for hormonal harmony. Zero dairy inflammation triggers option, rich in flaxseeds, turmeric, and greens.',
        badge: 'Dietitian Approved',
        imageUrl: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1200&auto=format&fit=crop',
        meals: [
            { slot: 'Breakfast (7-9 AM)', name: 'Ragi & Moringa Superfood Dosa', desc: 'Coconut chutney and sambar with drumsticks.', calories: '410 kcal' },
            { slot: 'Lunch (12 PM)', name: 'Amaranth Khichdi + Dal Palak', desc: 'Served with steamed bottle gourd sabzi.', calories: '560 kcal' },
            { slot: 'Dinner (7 PM)', name: 'Baked Fish / Tofu Steak with Turmeric Broth', desc: 'Steamed French beans and carrots.', calories: '450 kcal' }
        ]
    },
    {
        id: 'keto-lowcarb',
        name: 'Ketogenic & Low Carb',
        tagline: 'Deep nutritional ketosis with Indian culinary authenticity',
        calories: '1,600 - 1,800 kcal',
        protein: '110g',
        carbs: 'Under 25g Net',
        fats: '120g (Healthy MCTs)',
        description: 'Almond flour rotis, paneer bhurji in pure ghee, avocado salads, and zero-carb coconut curries.',
        badge: 'Rapid Fat Burn',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200&auto=format&fit=crop',
        meals: [
            { slot: 'Breakfast (7-9 AM)', name: 'Avocado & Scrambled Paneer Bowl', desc: 'Roasted pumpkin seeds and black pepper.', calories: '480 kcal' },
            { slot: 'Lunch (12 PM)', name: 'Almond Flour Roti + Palak Paneer', desc: 'Cooked in pure farm ghee with garlic tempering.', calories: '690 kcal' },
            { slot: 'Dinner (7 PM)', name: 'Mushroom Broccoli Stir Fry in Olive Oil', desc: 'Rich walnut and cheese garnish.', calories: '510 kcal' }
        ]
    }
];

const LOCALITIES = [
    { name: 'HSR Layout', status: 'Dispatching Now (< 25 min)', active: true },
    { name: 'Bellandur / Tech Parks', status: 'Live Kitchen Active', active: true },
    { name: 'Sarjapur Road', status: 'Next Slot Open (Lunch)', active: true },
    { name: 'Koramangala', status: 'Dispatches Every 30 Mins', active: true },
    { name: 'Indiranagar', status: 'Morning & Lunch Slots Open', active: true },
    { name: 'Whitefield', status: 'Batch #2 Preparing', active: true },
];

export const LandingInteractiveShowcase: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const [activePlanId, setActivePlanId] = useState('weight-loss');
    const [selectedLocality, setSelectedLocality] = useState('HSR Layout');

    const activePlan = GOAL_PLANS.find(p => p.id === activePlanId) || GOAL_PLANS[0];

    return (
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden" id="interactive-matrix">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#059669] bg-[#059669]/10 px-3.5 py-1.5 rounded-full inline-block mb-4">
                        Precision Nutrition Engine
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-serif text-gray-900 tracking-tight leading-tight mb-4">
                        Designed for Your <span className="text-[#059669] italic">Exact Goal</span>
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base font-light leading-relaxed">
                        Select your primary fitness objective below to instantly preview macro breakdowns, dietitian-designed meal schedules, and calorie targets.
                    </p>
                </div>

                {/* Goal Selector Tabs */}
                <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-12 no-scrollbar">
                    {GOAL_PLANS.map((plan) => (
                        <button
                            key={plan.id}
                            onClick={() => setActivePlanId(plan.id)}
                            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 shrink-0 whitespace-nowrap flex items-center gap-2 border ${
                                activePlanId === plan.id
                                    ? 'bg-[#059669] text-white border-[#059669] shadow-[0_10px_25px_rgba(5,150,105,0.3)] scale-105'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                            }`}
                        >
                            <Target className={`w-4 h-4 ${activePlanId === plan.id ? 'text-white' : 'text-[#059669]'}`} />
                            {plan.name.split('/')[0]}
                        </button>
                    ))}
                </div>

                {/* Active Plan Showcase Card */}
                <div className="bg-[#F9F8F5] rounded-[2.5rem] border border-gray-200 p-6 sm:p-12 shadow-sm transition-all duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        
                        {/* Left: Info & Macros */}
                        <div className="lg:col-span-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-[#F59E0B]/20 text-[#B45309] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#F59E0B]/30">
                                        {activePlan.badge}
                                    </span>
                                    <span className="text-xs font-mono text-gray-500">
                                        FSSAI & Dietitian Verified
                                    </span>
                                </div>

                                <h3 className="text-2xl sm:text-4xl font-serif text-gray-900 mb-3 leading-snug">
                                    {activePlan.name}
                                </h3>
                                <p className="text-[#059669] font-medium text-sm sm:text-base mb-4">
                                    {activePlan.tagline}
                                </p>
                                <p className="text-gray-600 font-light text-sm sm:text-base mb-8 leading-relaxed">
                                    {activePlan.description}
                                </p>

                                {/* Macro Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Calories</p>
                                        <p className="text-sm sm:text-base font-bold text-gray-900">{activePlan.calories}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Protein</p>
                                        <p className="text-sm sm:text-base font-bold text-[#059669]">{activePlan.protein}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Carbs</p>
                                        <p className="text-sm sm:text-base font-bold text-gray-900">{activePlan.carbs}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Healthy Fats</p>
                                        <p className="text-sm sm:text-base font-bold text-gray-900">{activePlan.fats}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <button
                                    onClick={() => onNavigate('/subscriptions')}
                                    className="w-full sm:w-auto px-8 py-4 bg-[#059669] hover:bg-[#047857] text-white rounded-full font-bold uppercase tracking-wider text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    Customize This Plan
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onNavigate('/macro-calculator')}
                                    className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-full font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
                                >
                                    Calculate My Exact Macros
                                </button>
                            </div>
                        </div>

                        {/* Right: Daily Sample Schedule & Image */}
                        <div className="lg:col-span-6 flex flex-col gap-6">
                            <div className="relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-lg border border-white">
                                <LazyImage
                                    src={activePlan.imageUrl}
                                    alt={activePlan.name}
                                    className="w-full h-full object-cover"
                                    wrapperClassName="w-full h-full"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B] font-bold">Sample Daily Menu</span>
                                    <h4 className="text-lg sm:text-xl font-serif font-medium">Freshly Cooked & Delivered Daily in Bengaluru</h4>
                                </div>
                            </div>

                            {/* Meal Slots List */}
                            <div className="space-y-3">
                                {activePlan.meals.map((meal, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm">
                                        <div className="pr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-mono font-bold text-[#059669] uppercase">{meal.slot}</span>
                                                <span className="text-[10px] text-gray-400 font-mono">• {meal.calories}</span>
                                            </div>
                                            <h5 className="text-xs sm:text-sm font-bold text-gray-900">{meal.name}</h5>
                                            <p className="text-[11px] text-gray-500 font-light mt-0.5">{meal.desc}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-[#059669]/10 flex items-center justify-center text-[#059669] shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bengaluru Locality Live Dispatch Status Bar */}
                <div className="mt-16 bg-gray-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Live Bengaluru Kitchen Operations</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-serif">Check Delivery in Your Locality</h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                            <Clock className="w-4 h-4 text-[#F59E0B]" />
                            Breakfast (7-9 AM) • Lunch (11:30-1:30 PM) • Dinner (6:30-8:30 PM)
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {LOCALITIES.map((loc) => (
                            <div
                                key={loc.name}
                                onClick={() => setSelectedLocality(loc.name)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                    selectedLocality === loc.name
                                        ? 'bg-[#059669]/20 border-[#059669] text-white shadow-md'
                                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className={`w-5 h-5 ${selectedLocality === loc.name ? 'text-[#059669]' : 'text-gray-400'}`} />
                                    <div>
                                        <p className="text-sm font-bold text-white">{loc.name}</p>
                                        <p className="text-[11px] text-emerald-400 font-mono mt-0.5">{loc.status}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${selectedLocality === loc.name ? 'bg-[#059669] text-white' : 'bg-white/10 text-gray-400'}`}>
                                    {selectedLocality === loc.name ? 'Selected' : 'Check'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                            <span>100% Biodegradable Sugarcane Bagasse Microwave-Safe Packaging across all Bengaluru deliveries.</span>
                        </div>
                        <button
                            onClick={() => onNavigate('/delivery-coverage')}
                            className="text-[#059669] hover:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                            View Full Pincode List <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
};
