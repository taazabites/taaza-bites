import { WHATSAPP_NUMBER, PORTAL_LINKS } from '../config';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCarousel } from '../hooks/useCarousel';
import { SmartButton } from './SmartButton';
import { LazyImage } from './LazyImage';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Flame, 
    Dumbbell, 
    Apple, 
    Droplet, 
    Sparkles, 
    Check, 
    Info, 
    Calendar, 
    Clock, 
    Tag, 
    X, 
    Leaf, 
    ShieldCheck, 
    Compass, 
    ChevronRight, 
    ChevronLeft,
    CheckCircle2, 
    Sliders,
    HelpCircle,
    ArrowRight,
    UtensilsCrossed,
    MapPin,
    User,
    Phone,
    Activity,
    ChevronDown,
    Award,
    HeartPulse,
    Loader2,
    MessageCircle,
    Minus,
    Plus,
    Scale
} from 'lucide-react';

// Official WhatsApp Logo SVG
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* TYPING SCHEMAS */
type DietType = 'veg' | 'eggitarian' | 'nonVeg';
type MealConfig = 'single' | 'double' | 'triple';
type FitnessGoal = 'balanced' | 'deficit' | 'hypertrophy' | 'keto';

interface PlanTier {
    id: string;
    name: string;
    tagline: string;
    basePrice: { veg: number; eggitarian: number; nonVeg: number };
    days: number;
    isPopular?: boolean;
    features: string[];
    description: string;
    imageUrl: string;
}

const PLANS: PlanTier[] = [
    {
        id: 'weekly',
        name: 'Trial',
        tagline: '5 DAYS · BEGINNER',
        basePrice: { veg: 1545, eggitarian: 1545, nonVeg: 1645 },
        days: 5,
        description: 'A perfect introduction to nutritious, chef-prepared meals delivered.',
        imageUrl: 'https://cdn.urbanpiper.com/media/bizmedia/2025/10/25/XQI0vGF-c0de1c2c-b08a-4bf6-94b7-7cb7547c811a.jpg',
        features: [
            'Premium nutrients & macros matched',
            'Clean eating routine established',
            'Zero prep time required',
            'Pause schedule anytime'
        ]
    },
    {
        id: 'habit',
        name: 'The Habit',
        tagline: '20 DAYS · BEST VALUE',
        basePrice: { veg: 5900, eggitarian: 5900, nonVeg: 6100 },
        days: 20,
        isPopular: true,
        description: 'Establish concrete, healthy eating habits with 20 days of fresh meal delivery.',
        imageUrl: 'https://cdn.urbanpiper.com/media/bizmedia/2025/09/09/5x3bE-3c79d21a-07b6-498b-81fa-649a1c953380.jpg',
        features: [
            'Dedicated certified dietitian support',
            'Weekly progress & fitness tracking',
            'Priority delivery scheduling',
            'Free nutrition consultation'
        ]
    },
    {
        id: 'lifestyle',
        name: 'Lifestyle',
        tagline: '60 DAYS · TRANSFORM',
        basePrice: { veg: 16800, eggitarian: 16800, nonVeg: 17400 },
        days: 60,
        description: 'Complete lifestyle transition and sustainable, healthy changes for your long-term wellness.',
        imageUrl: 'https://cdn.urbanpiper.com/media/bizmedia/2025/11/04/FzHllQL-b5013e53-f312-455d-9ef5-7c51f71950e2.jpg',
        features: [
            '100% Premium handpicked organic inputs',
            'Unlimited direct consultations with expert nutritionists',
            'Maximum cost savings & priority kitchen slot',
            'Complementary high protein snack options'
        ]
    }
];

const MAX_DAILY_RATE = 329;

// Calculation pricing rules
const getBaseDailyRate = (days: number) => {
    if (days <= 3) return MAX_DAILY_RATE;
    if (days <= 7) return Math.round(MAX_DAILY_RATE - ((days - 3) / 4) * 10);
    if (days <= 15) return Math.round((MAX_DAILY_RATE - 10) - ((days - 7) / 8) * 10);
    if (days <= 30) return Math.round((MAX_DAILY_RATE - 20) - ((days - 15) / 15) * 30);
    return 279;
};

const calculatePrice = (
    planDays: number, 
    diet: DietType, 
    meals: MealConfig, 
    goal: FitnessGoal, 
    addOns: string[], 
    ecoPackaging: boolean,
    excludeWeekends: boolean = false
) => {
    // If excluding weekends, the actual delivery days are roughly 5/7 of the calendar duration.
    // E.g. a 30-day plan delivers for ~22 days. We adjust the chargeable days.
    const chargeableDays = excludeWeekends ? Math.round(planDays * (5 / 7)) : planDays;
    
    let planBasePrice = 0;
    const plan = PLANS.find(p => p.days === planDays);
    
    if (plan) {
        // If it's a signature plan, the base price is pre-defined for the full duration.
        // If excludeWeekends is true, we prorate it.
        planBasePrice = excludeWeekends ? Math.round((plan.basePrice[diet] / planDays) * chargeableDays) : plan.basePrice[diet];
    } else {
        // Dynamic slider pricing interpolation: base rate drops from ₹329/day (short) down to ₹279/day (bulk)
        let baseDaily = getBaseDailyRate(chargeableDays);
        if (diet === 'nonVeg') baseDaily += 10;
        planBasePrice = baseDaily * chargeableDays;
    }

    let mealMultiplier = 1.0;
    if (meals === 'double') mealMultiplier = 1.8; // Save 10% on combo setup
    if (meals === 'triple') mealMultiplier = 2.5; // Save 16% on full day setup

    const subtotal = planBasePrice * mealMultiplier;

    let goalCost = 0;
    if (goal === 'deficit') goalCost += 10 * chargeableDays * mealMultiplier; 
    else if (goal === 'hypertrophy') goalCost += 20 * chargeableDays * mealMultiplier; 
    else if (goal === 'keto') goalCost += 20 * chargeableDays * mealMultiplier; 
    
    let addOnCost = 0;
    if (addOns.includes('juices')) addOnCost += 99 * chargeableDays * mealMultiplier;
    if (addOns.includes('probiotic')) addOnCost += 59 * chargeableDays * mealMultiplier;
    if (addOns.includes('desserts')) addOnCost += 40 * chargeableDays * mealMultiplier;
    
    if (ecoPackaging) addOnCost += 15 * chargeableDays;

    const total = Math.max(500, Math.round(subtotal + goalCost + addOnCost));
    const nominalValue = planBasePrice * (meals === 'single' ? 1.0 : meals === 'double' ? 2.0 : 3.0) + goalCost + addOnCost;

    return {
        total,
        originalTotal: Math.round(nominalValue),
        savings: Math.round(nominalValue - total) > 0 ? Math.round(nominalValue - total) : 0,
        perMeal: Math.round(total / (chargeableDays * (meals === 'single' ? 1 : meals === 'double' ? 2 : 3)))
    };
};

const getMacros = (diet: DietType, meals: MealConfig, goal: FitnessGoal) => {
    let multiplier = meals === 'single' ? 1.0 : meals === 'double' ? 1.8 : 2.5;
    
    let baseProtein = 0, baseCalories = 0, baseCarbs = 0, baseFats = 0;
    
    if (diet === 'veg') {
        baseCalories = 415; baseProtein = 19; baseCarbs = 48; baseFats = 17;
    } else if (diet === 'eggitarian') {
        baseCalories = 455; baseProtein = 35; baseCarbs = 24; baseFats = 21;
    } else {
        baseCalories = 515; baseProtein = 40; baseCarbs = 32; baseFats = 26;
    }

    if (goal === 'hypertrophy') {
        baseProtein += 16;
        baseCalories += 180;
        baseCarbs += 18;
        baseFats += 4;
    } else if (goal === 'deficit') {
        baseCalories -= 120;
        baseCarbs -= 25;
        baseProtein += 2;
        baseFats -= 2;
    } else if (goal === 'keto') {
        baseCalories += 60;
        baseCarbs -= 20;
        baseFats += 24;
        baseProtein += 6;
    }

    return {
        calories: Math.round(baseCalories * multiplier),
        protein: Math.round(baseProtein * multiplier),
        carbs: Math.max(12, Math.round(baseCarbs * multiplier)),
        fats: Math.round(baseFats * multiplier)
    };
};

import { LocalCoverageFAQ } from './LocalCoverageFAQ';



/* REAL SAMPLE MEALS BASED ON SELECTION FROM services/menuData.ts */
const METABOLIC_MEAL_SAMPLES = {
    veg: [
        {
            name: "Quinoa Power Bowl with Grilled Paneer",
            description: "Nutrient-dense organic quinoa topped with spiced grilled paneer and fiber-rich colorful vegetables.",
            imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/10/25/XQI0vGF-c0de1c2c-b08a-4bf6-94b7-7cb7547c811a.jpg",
            stats: "480 kcal • 25g Prot • 50g Carb • 10g Fiber"
        },
        {
            name: "Dry Fruit Chia Pudding",
            description: "Creamy vanilla chia bowl loaded with healthy omega-3 fatty acids and raw Karnataka farm walnuts.",
            imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/09/03/s9ZRSy5-f46b9d1a-8aca-471a-ae55-11652376cce1.jpg",
            stats: "350 kcal • 12g Prot • 45g Carb • 15g Fiber"
        }
    ],
    eggitarian: [
        {
            name: "Protein Scramble Rice Bowl",
            description: "High-protein fluffy scrambled eggs served with hand-scrambled seasonal vegetables over seasoned field brown rice.",
            imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/09/09/5x3bE-3c79d21a-07b6-498b-81fa-649a1c953380.jpg",
            stats: "520 kcal • 40g Prot • 35g Carb • 24g Fats"
        },
        {
            name: "Chef Special High-Protein Egg Slices",
            description: "Gently boiled cage-free eggs served over fiber-rich organic quinoa greens and microgreens dressing.",
            imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/09/03/HYC3ipj-ea1cb459-9f06-4842-9f10-c36beef7395f.jpg",
            stats: "390 kcal • 30g Prot • 12g Carb • 18g Fats"
        }
    ],
    nonVeg: [
        {
            name: "High Protein Egg Chicken Meal",
            description: "Bengaluru’s highest rated muscle meal. Grilled premium chicken tenders with seasoned hard boiled eggs and green root veggies.",
            imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/09/03/HYC3ipj-ea1cb459-9f06-4842-9f10-c36beef7395f.jpg",
            stats: "450 kcal • 42g Prot • 8g Net Carb • 28g Health Fats"
        },
        {
            name: "Premium Chicken Beetroot Pink Pasta",
            description: "Whole wheat hand-pulled pasta tossed in a velvety low-fat beetroot organic tomato sauce and tender pan-seared chicken.",
            imageUrl: "https://cdn.urbanpiper.com/media/bizmedia/2025/11/04/FzHllQL-b5013e53-f312-455d-9ef5-7c51f71950e2.jpg",
            stats: "580 kcal • 38g Prot • 55g Carb • 25g Fats"
        }
    ]
};

/* HELPER COMPONENT: PREMIUM FAQ ACCORDION ITEM WITH SMOOTH HEIGHT ANIMATIONS */
interface FaqAccordionItemProps {
    q: string;
    a: string;
    isOpen: boolean;
    onToggle: () => void;
}

const FaqAccordionItem: React.FC<FaqAccordionItemProps> = ({ q, a, isOpen, onToggle }) => {
    return (
        <div className="border-b border-white/5 last:border-b-0 py-5">
            <button 
                onClick={onToggle}
                className="w-full flex justify-between items-center text-left py-3.5 min-h-[44px] font-bold text-sm sm:text-base text-white hover:text-orange-400 transition-colors gap-4 group cursor-pointer focus:outline-none"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                        <span className="text-[#FF7A00] font-bold font-serif text-sm">Q</span>
                    </div>
                    <span className="font-sans font-medium tracking-wide">{q}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-orange-400' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-light pl-11 pr-4 pb-4 pt-2 font-sans">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SOCIAL_PROOF_LINES = [
    "🔥 14 residents in HSR Layout started their health cycle today",
    "🥦 9 active nutrition plans deployed to Indiranagar this morning",
    "⚡ 11 fitness goals activated in Koramangala in the last 24 hours",
    "🍎 7 nutrition builders custom-ordered in Whitefield today",
    "🥗 12 wellness routines dispatched to Jayanagar this morning"
];

export const Subscriptions: React.FC = () => {
    const [socialProofIndex, setSocialProofIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSocialProofIndex(prev => (prev + 1) % SOCIAL_PROOF_LINES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const [accordionOpen, setAccordionOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0); // open first by default
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    
    const [compareMode, setCompareMode] = useState(false);
    const [comparePlan1, setComparePlan1] = useState<string>('weekly');
    const [comparePlan2, setComparePlan2] = useState<string>('habit');

    const [compDiet1, setCompDiet1] = useState<DietType>('veg');
    const [compMeals1, setCompMeals1] = useState<MealConfig>('single');
    const [compGoal1, setCompGoal1] = useState<FitnessGoal>('balanced');
    const [compDays1, setCompDays1] = useState<number>(5);

    const [compDiet2, setCompDiet2] = useState<DietType>('veg');
    const [compMeals2, setCompMeals2] = useState<MealConfig>('single');
    const [compGoal2, setCompGoal2] = useState<FitnessGoal>('balanced');
    const [compDays2, setCompDays2] = useState<number>(20);

    // Sync options to global when compare mode is activated
    useEffect(() => {
        if (compareMode) {
            setCompDiet1(dietType);
            setCompMeals1(mealConfig);
            setCompGoal1(fitnessGoal);
            setCompDays1(selectedPlanId === 'custom' ? selectedDays : (PLANS.find(p => p.id === selectedPlanId)?.days || 5));
            setComparePlan1(selectedPlanId || 'weekly');

            const otherPlan = PLANS.find(p => p.id !== selectedPlanId) || PLANS[1];
            setComparePlan2(otherPlan.id);
            setCompDiet2(dietType);
            setCompMeals2(mealConfig);
            setCompGoal2(fitnessGoal);
            setCompDays2(otherPlan.days);
        }
    }, [compareMode]);
    
    // Global customizable state parameters
    const [dietType, setDietType] = useState<DietType>(() => {
        try {
            const saved = localStorage.getItem('tb_diet');
            return (saved as DietType) || 'veg';
        } catch (e) {
            return 'veg';
        }
    });

    const [mealConfig, setMealConfig] = useState<MealConfig>(() => {
        try {
            const saved = localStorage.getItem('tb_meals');
            return (saved as MealConfig) || 'single';
        } catch (e) {
            return 'single';
        }
    });

    const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(() => {
        try {
            const saved = localStorage.getItem('tb_goal');
            return (saved as FitnessGoal) || 'balanced';
        } catch (e) {
            return 'balanced';
        }
    });
    
    // Custom blueprint states
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(() => {
        try {
            return localStorage.getItem('tb_plan_id') || 'weekly';
        } catch (e) {
            return 'weekly';
        }
    });

    const [selectedDays, setSelectedDays] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('tb_days');
            return saved ? parseInt(saved, 10) : 5;
        } catch (e) {
            return 5;
        }
    });

    const [addOns, setAddOns] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('tb_addons');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [ecoPackaging, setEcoPackaging] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('tb_eco');
            return saved !== 'false';
        } catch (e) {
            return true;
        }
    });

    const [excludeWeekends, setExcludeWeekends] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('tb_weekends');
            return saved === 'true';
        } catch (e) {
            return false;
        }
    });
    
    // Checkout User info to prefill and pass to concierge WhatsApp
    const [userName, setUserName] = useState<string>(() => {
        try {
            return localStorage.getItem('tb_name') || '';
        } catch (e) {
            return '';
        }
    });

    const [userPhone, setUserPhone] = useState<string>(() => {
        try {
            return localStorage.getItem('tb_phone') || '';
        } catch (e) {
            return '';
        }
    });

    const [userArea, setUserArea] = useState<string>(() => {
        try {
            return localStorage.getItem('tb_area') || 'HSR Layout';
        } catch (e) {
            return 'HSR Layout';
        }
    });

    const [userTimeSlot, setUserTimeSlot] = useState<string>(() => {
        try {
            return localStorage.getItem('tb_slot') || 'morning';
        } catch (e) {
            return 'morning';
        }
    });

    const [kitchenNotes, setKitchenNotes] = useState<string>(() => {
        try {
            return localStorage.getItem('tb_notes') || '';
        } catch (e) {
            return '';
        }
    });

    // Stepper active step state
    const [stepperStep, setStepperStep] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('tb_stepper_step');
            return saved ? parseInt(saved, 10) : 1;
        } catch (e) {
            return 1;
        }
    });

    // Active auth checks for easy prefilling
    const authContext = useAuth();
    const currentUser = authContext ? authContext.user : null;

    useEffect(() => {
        if (currentUser && !userName) {
            setUserName(currentUser.displayName || '');
        }
    }, [currentUser]);

    // Save states to localStorage for progress persistence
    useEffect(() => {
        try { localStorage.setItem('tb_diet', dietType); } catch (e) {}
    }, [dietType]);

    useEffect(() => {
        try { localStorage.setItem('tb_meals', mealConfig); } catch (e) {}
    }, [mealConfig]);

    useEffect(() => {
        try { localStorage.setItem('tb_goal', fitnessGoal); } catch (e) {}
    }, [fitnessGoal]);

    useEffect(() => {
        try {
            if (selectedPlanId) localStorage.setItem('tb_plan_id', selectedPlanId);
            else localStorage.removeItem('tb_plan_id');
        } catch (e) {}
    }, [selectedPlanId]);

    useEffect(() => {
        try { localStorage.setItem('tb_days', selectedDays.toString()); } catch (e) {}
    }, [selectedDays]);

    useEffect(() => {
        try { localStorage.setItem('tb_addons', JSON.stringify(addOns)); } catch (e) {}
    }, [addOns]);

    useEffect(() => {
        try { localStorage.setItem('tb_eco', ecoPackaging.toString()); } catch (e) {}
    }, [ecoPackaging]);

    useEffect(() => {
        try { localStorage.setItem('tb_weekends', excludeWeekends.toString()); } catch (e) {}
    }, [excludeWeekends]);

    useEffect(() => {
        try { localStorage.setItem('tb_name', userName); } catch (e) {}
    }, [userName]);

    useEffect(() => {
        try { localStorage.setItem('tb_phone', userPhone); } catch (e) {}
    }, [userPhone]);

    useEffect(() => {
        try { localStorage.setItem('tb_area', userArea); } catch (e) {}
    }, [userArea]);

    useEffect(() => {
        try { localStorage.setItem('tb_slot', userTimeSlot); } catch (e) {}
    }, [userTimeSlot]);

    useEffect(() => {
        try { localStorage.setItem('tb_notes', kitchenNotes); } catch (e) {}
    }, [kitchenNotes]);

    useEffect(() => {
        try { localStorage.setItem('tb_stepper_step', stepperStep.toString()); } catch (e) {}
    }, [stepperStep]);
    
    // Checkout Validation Error state
    const [checkoutError, setCheckoutError] = useState<string>('');

    // Booking modal status
    const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
    const [isSubmittingCheckout, setIsSubmittingCheckout] = useState<boolean>(false);

    // Dynamic JSON-LD Product and Offer structured schemas for search engine optimization (SEO)
    const subscriptionPlansSchema = useMemo(() => {
        return PLANS.map(plan => {
            const offers = [
                {
                    "@type": "Offer",
                    "name": `${plan.name} - ${plan.days}-Day Veg Plan`,
                    "price": plan.basePrice.veg.toString(),
                    "priceCurrency": "INR",
                    "availability": "https://schema.org/InStock",
                    "validFrom": "2026-01-01"
                },
                {
                    "@type": "Offer",
                    "name": `${plan.name} - ${plan.days}-Day Eggitarian Plan`,
                    "price": plan.basePrice.eggitarian.toString(),
                    "priceCurrency": "INR",
                    "availability": "https://schema.org/InStock",
                    "validFrom": "2026-01-01"
                },
                {
                    "@type": "Offer",
                    "name": `${plan.name} - ${plan.days}-Day Non-Veg Plan`,
                    "price": plan.basePrice.nonVeg.toString(),
                    "priceCurrency": "INR",
                    "availability": "https://schema.org/InStock",
                    "validFrom": "2026-01-01"
                }
            ];

            const lowPrice = Math.min(plan.basePrice.veg, plan.basePrice.eggitarian, plan.basePrice.nonVeg);
            const highPrice = Math.max(plan.basePrice.veg, plan.basePrice.eggitarian, plan.basePrice.nonVeg);

            return {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": `${plan.name} (${plan.days}-Day Plan) | Taazabites`,
                "image": plan.imageUrl,
                "description": plan.description,
                "brand": {
                    "@type": "Brand",
                    "name": "Taazabites"
                },
                "category": "Diet meal plans",
                "offers": {
                    "@type": "AggregateOffer",
                    "priceCurrency": "INR",
                    "lowPrice": lowPrice.toString(),
                    "highPrice": highPrice.toString(),
                    "offerCount": "3",
                    "offers": offers
                }
            };
        });
    }, []);

    const trustCarousel = useCarousel({
        itemCount: 3,
        slideInterval: 5000
    });

    const faqCarousel = useCarousel({
        itemCount: 7,
        slideInterval: 0
    });

    const coverageCarousel = useCarousel({
        itemCount: 2,
        slideInterval: 0
    });

    // Carousel for small viewports
    const { scrollContainerRef, activeIndex, handlers, goToSlide, goToNext, goToPrevious } = useCarousel({ 
        itemCount: PLANS.length, 
        slideInterval: 0,
        defaultIndex: (() => {
            try {
                const saved = localStorage.getItem('tb_plan_id') || 'weekly';
                const idx = PLANS.findIndex(p => p.id === saved);
                return idx !== -1 ? idx : 0;
            } catch (e) {
                return 0;
            }
        })(),
        depsHash: `${dietType}-${mealConfig}-${fitnessGoal}`
    });

    // Automatically select the active carousel slide on mobile screens to ensure perfect pricing sync
    useEffect(() => {
        if (window.innerWidth < 768 && !checkoutModalOpen) {
            const plan = PLANS[activeIndex];
            if (plan && plan.id !== selectedPlanId) {
                setSelectedPlanId(plan.id);
                setSelectedDays(plan.days);
            }
        }
    }, [activeIndex, selectedPlanId, checkoutModalOpen]);

    const stepperContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (stepperContentRef.current) {
            stepperContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [stepperStep]);

    const handleDietChange = (type: DietType) => {
        if (navigator.vibrate) navigator.vibrate([10, 20]);
        setDietType(type);
    };

    const handleGoalChange = (goal: FitnessGoal) => {
        if (navigator.vibrate) navigator.vibrate(10);
        setFitnessGoal(goal);
    };

    const toggleAddOn = (addon: string) => {
        if (navigator.vibrate) navigator.vibrate(10);
        setAddOns(prev => 
            prev.includes(addon) ? prev.filter(a => a !== addon) : [...prev, addon]
        );
    };

    const activeSelectedPlan = useMemo(() => {
        return PLANS.find(p => p.id === selectedPlanId) || PLANS[1]; // default to popular Habit
    }, [selectedPlanId]);

    const finalPlanDays = useMemo(() => {
        if (selectedPlanId === 'custom') return selectedDays;
        return activeSelectedPlan.days;
    }, [selectedPlanId, selectedDays, activeSelectedPlan]);

    // Slider savings descriptor tag
    const sliderSavingsTier = useMemo(() => {
        const baseDaily = getBaseDailyRate(selectedDays);
        
        const discountPct = Math.round(((MAX_DAILY_RATE - baseDaily) / MAX_DAILY_RATE) * 100);
        
        if (selectedDays < 10) return { label: 'Fresh Starter', discount: discountPct > 0 ? `${discountPct}% volume discount applied` : '0%' };
        if (selectedDays >= 10 && selectedDays < 20) return { label: 'Active Runner', discount: `${discountPct}% volume discount applied` };
        if (selectedDays >= 20 && selectedDays < 45) return { label: 'Commitment Surge', discount: `${discountPct}% volume discount applied` };
        return { label: 'Lifestyle Master', discount: `${discountPct}% ultimate discount applied` };
    }, [selectedDays]);

    const activeCalculatedPrice = useMemo(() => {
        const pricing = calculatePrice(
            finalPlanDays, 
            dietType, 
            mealConfig, 
            fitnessGoal, 
            addOns, 
            ecoPackaging,
            excludeWeekends
        );

        const mealsPerDay = mealConfig === 'single' ? 1 : mealConfig === 'double' ? 2 : 3;
        const chargeableDays = excludeWeekends ? Math.round(finalPlanDays * (5 / 7)) : finalPlanDays;
        const totalMeals = chargeableDays * mealsPerDay;
        const finalPerMeal = totalMeals > 0 ? Math.round(pricing.total / totalMeals) : pricing.perMeal;

        return {
            ...pricing,
            finalTotal: pricing.total,
            perMeal: finalPerMeal,
            couponDiscount: 0
        };
    }, [finalPlanDays, dietType, mealConfig, fitnessGoal, addOns, ecoPackaging, excludeWeekends]);

    const baseCalculatedPrice = useMemo(() => {
        const pricing = calculatePrice(
            finalPlanDays, 
            dietType, 
            mealConfig, 
            fitnessGoal, 
            [], 
            ecoPackaging,
            excludeWeekends
        );

        const mealsPerDay = mealConfig === 'single' ? 1 : mealConfig === 'double' ? 2 : 3;
        const chargeableDays = excludeWeekends ? Math.round(finalPlanDays * (5 / 7)) : finalPlanDays;
        const totalMeals = chargeableDays * mealsPerDay;
        const finalPerMeal = totalMeals > 0 ? Math.round(pricing.total / totalMeals) : pricing.perMeal;

        return {
            ...pricing,
            finalTotal: pricing.total,
            perMeal: finalPerMeal,
            couponDiscount: 0
        };
    }, [finalPlanDays, dietType, mealConfig, fitnessGoal, ecoPackaging, excludeWeekends]);

    const currentMacros = useMemo(() => {
        return getMacros(dietType, mealConfig, fitnessGoal);
    }, [dietType, mealConfig, fitnessGoal]);

    const handleToggleCompare = (planId: string) => {
        if (comparePlan1 === planId) {
            setCompareMode(prev => !prev);
        } else if (comparePlan2 === planId) {
            setCompareMode(prev => !prev);
        } else {
            setComparePlan2(comparePlan1);
            setComparePlan1(planId);
            setCompareMode(true);
            
            setTimeout(() => {
                const compEl = document.getElementById('plan-comparer-section');
                if (compEl) {
                    compEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };

    const handlePlanSelect = (planId: string, openModal: boolean = false) => {
        if (openModal) {
            window.location.href = PORTAL_LINKS.subscribe;
            return;
        }
        setSelectedPlanId(planId);
        const plan = PLANS.find(p => p.id === planId);
        if (plan) {
            setSelectedDays(plan.days);
            const idx = PLANS.findIndex(p => p.id === planId);
            if (idx !== -1) {
                goToSlide(idx);
            }
        }
        setAccordionOpen(true);
    };

    const openCheckout = (planId: string | 'custom') => {
        window.location.href = PORTAL_LINKS.subscribe;
    };

    const handleExecuteCheckout = () => {
        const phoneCleaned = userPhone.trim().replace(/[\s\-\+\(\)]/g, '');
        const isPhoneValid = /^[6-9]\d{9}$/.test(phoneCleaned);
        if (!userName.trim()) {
            setCheckoutError('Please enter the Recipient Name on Step 2 to proceed.');
            setStepperStep(2);
            if (navigator.vibrate) navigator.vibrate([50, 50]);
            return;
        }
        if (!userPhone.trim()) {
            setCheckoutError('Please enter the WhatsApp Mobile Number on Step 2.');
            setStepperStep(2);
            if (navigator.vibrate) navigator.vibrate([50, 50]);
            return;
        }
        if (!isPhoneValid) {
            setCheckoutError('Please enter a valid 10-digit WhatsApp number on Step 2 (e.g. 9876543210).');
            setStepperStep(2);
            if (navigator.vibrate) navigator.vibrate([50, 50]);
            return;
        }

        setIsSubmittingCheckout(true);
        if (navigator.vibrate) navigator.vibrate([20, 60, 20]);
        
        setIsSubmittingCheckout(false);
        setCheckoutModalOpen(false);
        
        const messageParts = [
            `📋 *TAAZABITES NUTRITION SUBSCRIPTION*`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `👋 *Customer Information:*`,
            `- *Name:* ${userName.trim()}`,
            `- *Phone:* ${userPhone.trim()}`,
            `- *Delivery Area:* ${userArea}`,
            `- *Timeslot Preferred:* ${userTimeSlot.toUpperCase()}`,
            ``,
            `⚙️ *Plan Diagnostics Configured:*`,
            `- *Title Name:* ${selectedPlanId === 'custom' ? 'Custom Studio Builder' : activeSelectedPlan.name}`,
            `- *Duration Period:* ${finalPlanDays} Days`,
            `- *Dietary Source Type:* ${dietType.toUpperCase()}`,
            `- *Daily Meal Frequency:* ${mealConfig.toUpperCase()}`,
            `- *Target Fitness Goal:* ${fitnessGoal.toUpperCase()}`,
            ``,
            `🥦 *Preferences & Surcharges:*`,
            `- *Composting Sugar Cane Trays:* ${ecoPackaging ? 'Yes (+₹15/day)' : 'No'}`,
            `- *Automatic Pause on Weekends:* ${excludeWeekends ? 'Yes' : 'No'}`,
        ];

        if (addOns.length > 0) {
            messageParts.push(`- *Extras Infused:* ${addOns.map(a => a.toUpperCase()).join(', ')}`);
        }

        if (kitchenNotes.trim()) {
            messageParts.push(`- *Kitchen Directions:* "${kitchenNotes.trim()}"`);
        }

        messageParts.push(``);
        messageParts.push(`💵 *Constituted Quote Receipt:*`);
        messageParts.push(`👉 *RATE PER MEAL: ₹${activeCalculatedPrice.perMeal}/meal*`);
        messageParts.push(`- *Plan Duration:* ${finalPlanDays} Days (${mealConfig === 'single' ? '1 Meal' : mealConfig === 'double' ? '2 Meals' : '3 Meals'} daily)`);
        messageParts.push(`- *Base Subtotal:* ₹${activeCalculatedPrice.originalTotal.toLocaleString()}`);
        
        if (activeCalculatedPrice.savings > 0) {
            messageParts.push(`- *Duration Savings:* -₹${activeCalculatedPrice.savings.toLocaleString()}`);
        }
        
        messageParts.push(`━━━━━━━━━━━━━━━━━━━━━━━━━`);
        messageParts.push(`🔥 *YOUR TOTAL: ₹${activeCalculatedPrice.finalTotal.toLocaleString()}*`);
        messageParts.push(`_(Including packaging & Bangalore logistics taxes)_`);
        messageParts.push(``);
        messageParts.push(`Hi Taazabites! I've custom-configured my nutrition plan above. Please confirm availability and send me the secure UPI payment link.`);

        const checkoutUrl = PORTAL_LINKS.subscribe;
        
        if (typeof window !== 'undefined') {
            const toastEvent = new CustomEvent('taaza:toast', {
                detail: { message: `Securely establishing checkout gateway...`, type: 'info' }
            });
            window.dispatchEvent(toastEvent);
        }

        // Set persistent has_ordered flag before clearing keys to gate coupons for returning users
        try {
            localStorage.setItem('tb_has_ordered', 'true');
        } catch (e) {}

        // Clear all 14 progress tracking tb_* localStorage keys
        const keysToClear = [
            'tb_diet', 'tb_meals', 'tb_goal', 'tb_plan_id', 'tb_days',
            'tb_addons', 'tb_eco', 'tb_weekends', 'tb_name', 'tb_phone',
            'tb_area', 'tb_slot', 'tb_notes', 'tb_stepper_step'
        ];
        keysToClear.forEach(key => {
            try { localStorage.removeItem(key); } catch (e) {}
        });

        // Reset the React subscription-builder form states
        setUserName('');
        setUserPhone('');
        setUserArea('HSR Layout');
        setUserTimeSlot('morning');
        setKitchenNotes('');
        setStepperStep(1);
        setEcoPackaging(true);
        setExcludeWeekends(false);
        setAddOns([]);
        setSelectedPlanId('custom');
        setSelectedDays(5);

        // Redirect to Rekart backend
        window.location.href = checkoutUrl;
    };

    return (
        <>
        <AnimatePresence>
            {isQuizOpen && (
                <MealPreferenceQuiz 
                    currentDiet={dietType}
                    currentGoal={fitnessGoal}
                    currentMeals={mealConfig}
                    currentPlanId={selectedPlanId}
                    onApplyRecommendations={(rec) => {
                        setDietType(rec.diet);
                        setFitnessGoal(rec.goal);
                        setMealConfig(rec.meals);
                        setSelectedPlanId(rec.planId);
                        setSelectedDays(rec.days);
                        setIsQuizOpen(false);
                        
                        // Dispatch custom success toast for saved preferences
                        const toastEvent = new CustomEvent('taaza:toast', {
                            detail: { 
                                message: "Meal preferences saved successfully! We've customized your plan match.", 
                                type: 'success' 
                            }
                        });
                        window.dispatchEvent(toastEvent);
                        
                        // Scroll to plans list or open checkout
                        setTimeout(() => {
                            const plansEl = document.getElementById('subscriptions-page') || document.getElementById('subscriptions');
                            if (plansEl) plansEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            
                            // Highlight and open checkout
                            openCheckout(rec.planId);
                        }, 500);
                    }}
                    onClose={() => setIsQuizOpen(false)}
                />
            )}
        </AnimatePresence>

        {/* SEO Structured JSON-LD Script for Google Price Range Display */}
        <script type="application/ld+json">
            {JSON.stringify(subscriptionPlansSchema)}
        </script>

        <section className="bg-[#070707] py-16 sm:py-24 lg:py-32 relative overflow-hidden" id="subscriptions">
            
            {/* Ambient Background Glow Plates */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[50rem] h-[50rem] bg-emerald-950/20 rounded-full blur-[130px]" />
                <div className="absolute bottom-1/4 -right-20 w-[40rem] h-[40rem] bg-orange-950/15 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:5rem_5rem]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                


                {/* Main Header Presentation */}
                <div className="text-center mb-12 sm:mb-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 border border-emerald-500/30">
                        <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Premium Subscription Engine
                    </span>
                    <h1 className="sr-only">Healthy Diet Meal Subscription Plans Bengaluru - Taazabites</h1>
                    <h2 className="text-4xl sm:text-6xl lg:text-8xl font-sans font-light text-white tracking-tight leading-none mb-6">
                        Perfect Your Daily Meals <br />
                        <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-amber-400 to-yellow-300">Deliveries Daily</span>
                    </h2>
                    <p className="text-xs sm:text-base lg:text-lg text-gray-400 font-light max-w-3xl mx-auto leading-relaxed mb-8">
                        Precision meal planning for Bangalore. Select a pre-configured healthy cycle or customize your own menu plan to fit your schedule.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <a 
                            href="/health-assessment" 
                            onClick={(e) => {
                                e.preventDefault();
                                window.history.pushState(null, '', '/health-assessment');
                                window.dispatchEvent(new PopStateEvent('popstate'));
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-lg shadow-emerald-900/20 active:scale-95"
                        >
                            <Activity className="w-4 h-4 text-emerald-200 animate-pulse" /> Take Health Assessment
                        </a>
                        <button 
                            onClick={() => {
                                setIsQuizOpen(true);
                                if (navigator.vibrate) navigator.vibrate(20);
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900/85 hover:bg-zinc-800 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border border-white/5 hover:border-orange-500/30 active:scale-95 cursor-pointer select-none"
                        >
                            <Sparkles className="w-4 h-4 text-[#FF7A00] animate-pulse" /> Meal Preference Quiz
                        </button>
                    </div>
                </div>

                {/* Studio Navigation Tabs */}
                {/* SIGNATURE RENDERING SYSTEM */}
                    <div className="space-y-12">
                        
                        {/* Auto-Rotating Authentic Bangalore Social Proof Ticker */}
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/5 shadow-xl text-[11px] sm:text-xs text-zinc-300 font-sans backdrop-blur-md">
                                <span className="flex h-2 w-2 relative shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={socialProofIndex}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.25 }}
                                        className="font-medium tracking-wide flex items-center gap-1.5"
                                    >
                                        {SOCIAL_PROOF_LINES[socialProofIndex]}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Unified Selection Hub for dietary & meal configs */}
                        <div className="max-w-6xl mx-auto bg-zinc-900/30 border border-white/5 rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF7A00]/5 rounded-full blur-[40px] pointer-events-none" />
                            
                            {/* Smart One-Click Optimization Presets */}
                            <div className="mb-8 pb-6 border-b border-white/5 relative z-10">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans block mb-3 text-center md:text-left flex items-center justify-center md:justify-start gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> One-Click Smart Presets
                                </span>
                                <div className="flex flex-nowrap overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x md:flex-wrap md:overflow-x-visible md:pb-0 md:mx-0 md:px-0 items-center justify-start gap-2.5">
                                    {[
                                        { label: '🔥 Weight Loss', diet: 'veg', meals: 'single', goal: 'deficit', desc: 'Veg · 1 Meal · Deficit' },
                                        { label: '💪 Muscle Gainer', diet: 'nonVeg', meals: 'double', goal: 'hypertrophy', desc: 'Non-Veg · 2 Meals · High Protein' },
                                        { label: '🥗 Clean Health', diet: 'veg', meals: 'single', goal: 'balanced', desc: 'Veg · 1 Meal · Balanced Wellness' },
                                        { label: '🥑 Keto Lean', diet: 'eggitarian', meals: 'single', goal: 'keto', desc: 'Egg · 1 Meal · High Fat / Low Carb' }
                                    ].map((preset, idx) => {
                                        const isMatching = dietType === preset.diet && mealConfig === preset.meals && fitnessGoal === preset.goal;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setDietType(preset.diet as DietType);
                                                    setMealConfig(preset.meals as MealConfig);
                                                    setFitnessGoal(preset.goal as FitnessGoal);
                                                    if (navigator.vibrate) navigator.vibrate(15);
                                                }}
                                                className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-2xl text-[11px] font-sans transition-all duration-300 flex flex-col items-start border cursor-pointer ${
                                                    isMatching
                                                        ? 'bg-zinc-900 border-[#FF7A00]/45 text-[#FF7A00] shadow-[0_0_20px_rgba(255,122,0,0.1)] font-bold scale-[1.02]'
                                                        : 'bg-black/40 text-zinc-400 border-white/5 hover:border-white/20 hover:text-white'
                                                }`}
                                            >
                                                <span className="font-bold flex items-center gap-1">{preset.label} {isMatching && <Check className="w-3 h-3 text-orange-400 shrink-0" />}</span>
                                                <span className="text-[9px] text-zinc-500 font-light mt-0.5">{preset.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
                                {/* Diet Selector Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Leaf className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-sans">1. Select Diet Base</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Dietary option selector">
                                        {[
                                            { id: 'veg', label: 'Pure Veg', color: 'border-emerald-500/40 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.08)]', icon: '🥦', hoverGlow: 'hover:border-emerald-500/30', activeText: 'text-emerald-400' },
                                            { id: 'eggitarian', label: 'Eggitarian', color: 'border-amber-400/40 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.08)]', icon: '🥚', hoverGlow: 'hover:border-amber-400/30', activeText: 'text-amber-400' },
                                            { id: 'nonVeg', label: 'Non-Veg', color: 'border-red-500/40 text-red-300 shadow-[0_0_25px_rgba(239,68,68,0.08)]', icon: '🍗', hoverGlow: 'hover:border-red-500/30', activeText: 'text-red-400' }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                id={`diet-selector-btn-${item.id}`}
                                                aria-label={`Select ${item.label} base diet`}
                                                aria-pressed={dietType === item.id}
                                                data-agent-action={`select-diet-${item.id}`}
                                                onClick={() => {
                                                    setDietType(item.id as DietType);
                                                    if (navigator.vibrate) navigator.vibrate(10);
                                                }}
                                                className={`relative py-3 px-1.5 sm:px-3 rounded-2xl border text-xs font-bold font-sans tracking-wide transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                                                    dietType === item.id
                                                        ? `bg-zinc-900/95 font-black scale-[1.02] ${item.color}`
                                                        : `bg-black/50 text-zinc-400 border-white/[0.03] ${item.hoverGlow} hover:text-zinc-200`
                                                }`}
                                            >
                                                <span className="text-sm select-none">{item.icon}</span>
                                                <span className="leading-none text-[10px] xs:text-[11px] sm:text-xs">{item.label}</span>
                                                {dietType === item.id && <Check className={`w-3.5 h-3.5 shrink-0 ${item.activeText}`} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Meals per Day Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <UtensilsCrossed className="w-4 h-4 text-[#FF7A00]" />
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-sans">2. Meals Per Day</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Meals per day selector">
                                        {[
                                            { id: 'single', label: '1 Meal', icon: '🍽️', desc: 'Lunch/Dinner' },
                                            { id: 'double', label: '2 Meals', icon: '🍱', desc: 'Save 10%' },
                                            { id: 'triple', label: '3 Meals', icon: '🍲', desc: 'Save 16%' }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                id={`meals-config-btn-${item.id}`}
                                                aria-label={`Select ${item.label} per day`}
                                                aria-pressed={mealConfig === item.id}
                                                data-agent-action={`select-meals-${item.id}`}
                                                onClick={() => {
                                                    setMealConfig(item.id as MealConfig);
                                                    if (navigator.vibrate) navigator.vibrate(10);
                                                }}
                                                className={`relative py-3 px-1.5 sm:px-3 rounded-2xl border text-xs font-bold font-sans tracking-wide transition-all duration-300 flex flex-col items-center justify-center cursor-pointer min-h-[44px] ${
                                                    mealConfig === item.id
                                                        ? 'bg-zinc-900/95 text-[#FF7A00] border-[#FF7A00]/40 shadow-[0_0_25px_rgba(255,122,0,0.08)] font-black scale-[1.02]'
                                                        : 'bg-black/50 text-zinc-400 border-white/[0.03] hover:border-[#FF7A00]/25 hover:text-zinc-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs select-none">{item.icon}</span>
                                                    <span className="text-[10px] xs:text-[11px] sm:text-xs">{item.label}</span>
                                                    {mealConfig === item.id && <Check className="w-3 h-3 text-[#FF7A00] shrink-0" />}
                                                </div>
                                                <span className={`text-[8px] sm:text-[9px] font-light leading-none mt-0.5 ${mealConfig === item.id ? 'text-orange-400/80 font-medium' : 'text-zinc-500'}`}>{item.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Fitness Goal Selector Column */}
                                <div className="space-y-4 w-full">
                                    <div className="flex items-center gap-2">
                                        <Dumbbell className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-sans">3. Fitness Goal</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Fitness goal selector">
                                        {[
                                            { id: 'balanced', name: 'Balanced', desc: 'Standard Vital', icon: '⚡' },
                                            { id: 'deficit', name: 'Fat Loss', desc: 'Deficit (+₹10)', icon: '🔥' },
                                            { id: 'hypertrophy', name: 'Gain Muscle', desc: 'Protein (+₹20)', icon: '💪' },
                                            { id: 'keto', name: 'Keto Clean', desc: 'Low-carb (+₹20)', icon: '🥑' }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                id={`fitness-goal-btn-${item.id}`}
                                                aria-label={`Select ${item.name} fitness goal`}
                                                aria-pressed={fitnessGoal === item.id}
                                                data-agent-action={`select-fitness-goal-${item.id}`}
                                                onClick={() => {
                                                    setFitnessGoal(item.id as FitnessGoal);
                                                    if (navigator.vibrate) navigator.vibrate(10);
                                                }}
                                                className={`relative py-2.5 px-2 rounded-2xl border text-xs font-sans transition-all duration-300 flex flex-col items-center justify-center cursor-pointer min-h-[44px] ${
                                                    fitnessGoal === item.id
                                                        ? 'bg-zinc-900/95 text-amber-200 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.08)] font-bold scale-[1.02]'
                                                        : 'bg-black/50 text-zinc-400 border-white/[0.03] hover:border-amber-500/25 hover:text-zinc-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1 justify-center w-full">
                                                    <span className="text-xs select-none">{item.icon}</span>
                                                    <span className="text-[10px] sm:text-[11px] font-bold leading-none">{item.name}</span>
                                                    {fitnessGoal === item.id && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                                                </div>
                                                <span className={`text-[8px] font-light leading-none mt-1 text-center ${fitnessGoal === item.id ? 'text-amber-300/80 font-medium' : 'text-zinc-500'}`}>{item.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Meal Preference Quiz Inline Callout */}
                        <div className="max-w-6xl mx-auto bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-sans">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/20">
                                    <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                                </div>
                                <div className="text-zinc-300">
                                    <span className="font-bold text-white block">Unsure of which plan is right for you?</span>
                                    <span className="text-[11px] text-zinc-400 font-light">Find your perfect healthy meal plan and daily diet in just 45 seconds.</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsQuizOpen(true);
                                    if (navigator.vibrate) navigator.vibrate(15);
                                }}
                                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-bold uppercase tracking-wider text-[10px] sm:text-xs transition-all active:scale-95 cursor-pointer select-none"
                            >
                                Take Meal Preference Quiz
                            </button>
                        </div>

                        {/* Interactive pricing & layout state banners */}
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-zinc-950/40 border border-white/5 px-6 py-3.5 rounded-2xl text-xs text-zinc-400 font-sans gap-4 mb-6 max-w-6xl mx-auto">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Showing precision rates for a <strong className="text-white capitalize">{dietType === 'nonVeg' ? 'Non-Veg' : dietType}</strong> plan with <strong className="text-white">{mealConfig === 'single' ? '1 meal' : mealConfig === 'double' ? '2 meals' : '3 meals'}</strong> daily.</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    id="btn-toggle-compare-view"
                                    type="button"
                                    onClick={() => {
                                        setCompareMode(!compareMode);
                                        if (navigator.vibrate) navigator.vibrate(10);
                                    }}
                                    className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all duration-300 cursor-pointer select-none focus:outline-none ${
                                        compareMode 
                                            ? 'bg-orange-500 text-black border-orange-400 font-black shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                                            : 'bg-zinc-900 text-zinc-300 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <Scale className="w-3.5 h-3.5" /> {compareMode ? "Close Compare View" : "Compare Plans Side-by-Side"}
                                </button>
                            </div>
                        </div>

                        {/* Interactive Side-by-Side Comparer Panel */}
                        <AnimatePresence>
                            {compareMode && (
                                <motion.div
                                    id="plan-comparer-section"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    className="overflow-hidden mb-12 max-w-6xl mx-auto px-4 sm:px-0"
                                >
                                    <div className="bg-zinc-950/90 border-2 border-orange-500/30 rounded-3xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-[0_0_50px_rgba(251,146,60,0.1)]">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7A00]/5 rounded-full blur-[80px] pointer-events-none" />
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

                                        {/* Header */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 mb-8 gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-orange-500 font-sans text-xs font-black tracking-widest uppercase">PLAN COMPARER</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                                    <span className="text-emerald-400 font-mono text-[10px] font-bold">LIVE NUTRITION VIEW</span>
                                                </div>
                                                <h3 className="text-2xl sm:text-3xl font-serif text-white font-medium">
                                                    Side-by-Side Nutrition Comparer
                                                </h3>
                                                <p className="text-zinc-400 text-xs mt-1 font-light">
                                                    Compare the exact nutrition details and meals of two different custom plans side-by-side.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCompareMode(false)}
                                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-400 hover:text-white transition-all font-sans cursor-pointer"
                                            >
                                                ✕ Close Comparer
                                            </button>
                                        </div>

                                        {/* Comparison Columns Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                                            {/* COLUMN A */}
                                            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative">
                                                {comparePlan1 !== comparePlan2 && (() => {
                                                    const pr1 = calculatePrice(compDays1, compDiet1, compMeals1, compGoal1, [], ecoPackaging, excludeWeekends);
                                                    const pr2 = calculatePrice(compDays2, compDiet2, compMeals2, compGoal2, [], ecoPackaging, excludeWeekends);
                                                    if (pr1.perMeal < pr2.perMeal) {
                                                        return (
                                                            <span className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md">
                                                                💰 Best Price/Meal
                                                            </span>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00] block mb-2">PLAN CONFIGURATION A</span>
                                                    
                                                    {/* Plan Selector */}
                                                    <div className="space-y-3 mb-6">
                                                        <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 block">Select Base Plan</label>
                                                        <div className="grid grid-cols-4 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                                                            {PLANS.map(p => (
                                                                <button
                                                                    key={p.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setComparePlan1(p.id);
                                                                        setCompDays1(p.days);
                                                                        if (navigator.vibrate) navigator.vibrate(5);
                                                                    }}
                                                                    className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all text-center cursor-pointer ${
                                                                        comparePlan1 === p.id
                                                                            ? 'bg-[#FF7A00] text-black shadow-md font-black'
                                                                            : 'text-zinc-400 hover:text-white hover:bg-white/5 font-semibold'
                                                                    }`}
                                                                >
                                                                    {p.name}
                                                                </button>
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setComparePlan1('custom');
                                                                    setCompDays1(selectedDays);
                                                                    if (navigator.vibrate) navigator.vibrate(5);
                                                                }}
                                                                className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all text-center cursor-pointer ${
                                                                    comparePlan1 === 'custom'
                                                                        ? 'bg-[#FF7A00] text-black shadow-md font-black'
                                                                        : 'text-zinc-400 hover:text-white hover:bg-white/5 font-semibold'
                                                                }`}
                                                            >
                                                                Custom
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Days customizer if Custom plan selected */}
                                                    {comparePlan1 === 'custom' && (
                                                        <div className="mb-4 bg-black/20 p-3 rounded-xl border border-white/5">
                                                            <div className="flex justify-between items-center text-xs mb-1.5">
                                                                <span className="text-[10px] uppercase font-bold text-zinc-500">Duration (Days)</span>
                                                                <span className="font-mono text-[#FF7A00] font-black">{compDays1} Days</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="3"
                                                                max="90"
                                                                value={compDays1}
                                                                onChange={(e) => setCompDays1(parseInt(e.target.value))}
                                                                className="w-full accent-[#FF7A00]"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Configurations */}
                                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                                        {/* Diet */}
                                                        <div>
                                                            <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 block mb-1">Diet Base</label>
                                                            <select
                                                                value={compDiet1}
                                                                onChange={(e) => setCompDiet1(e.target.value as DietType)}
                                                                className="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#FF7A00] cursor-pointer"
                                                            >
                                                                <option value="veg">Pure Veg 🥦</option>
                                                                <option value="eggitarian">Eggitarian 🥚</option>
                                                                <option value="nonVeg">Non-Veg 🍗</option>
                                                            </select>
                                                        </div>
                                                        {/* Meals per day */}
                                                        <div>
                                                            <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 block mb-1">Meals/Day</label>
                                                            <select
                                                                value={compMeals1}
                                                                onChange={(e) => setCompMeals1(e.target.value as MealConfig)}
                                                                className="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#FF7A00] cursor-pointer"
                                                            >
                                                                <option value="single">1 Meal 🍽️</option>
                                                                <option value="double">2 Meals 🍱</option>
                                                                <option value="triple">3 Meals 🍲</option>
                                                            </select>
                                                        </div>
                                                        {/* Goal */}
                                                        <div>
                                                            <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 block mb-1">Fitness Goal</label>
                                                            <select
                                                                value={compGoal1}
                                                                onChange={(e) => setCompGoal1(e.target.value as FitnessGoal)}
                                                                className="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#FF7A00] cursor-pointer"
                                                            >
                                                                <option value="balanced">Balanced ⚡</option>
                                                                <option value="deficit">Fat Loss 🔥</option>
                                                                <option value="hypertrophy">Muscle Gain 💪</option>
                                                                <option value="keto">Keto Clean 🥑</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Macro breakdowns section with beautiful bars */}
                                                    {(() => {
                                                        const m1 = getMacros(compDiet1, compMeals1, compGoal1);
                                                        const p1 = calculatePrice(compDays1, compDiet1, compMeals1, compGoal1, [], ecoPackaging, excludeWeekends);
                                                        
                                                        const maxCal = 1500;
                                                        const maxProt = 120;
                                                        const maxCarbs = 180;
                                                        const maxFats = 90;

                                                        return (
                                                            <div className="space-y-4 mb-6">
                                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-1 flex items-center gap-1">
                                                                    <span>🥗</span> Meal Nutrition Profile
                                                                </h4>
                                                                
                                                                {/* Calories */}
                                                                <div>
                                                                    <div className="flex justify-between items-baseline mb-1">
                                                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">ENERGY</span>
                                                                        <span className="text-white font-mono font-black text-sm">{m1.calories} <span className="text-[10px] font-light text-zinc-500">kcal</span></span>
                                                                    </div>
                                                                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
                                                                        <div className="bg-[#FF7A00] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (m1.calories / maxCal) * 100)}%` }} />
                                                                    </div>
                                                                </div>

                                                                {/* Protein */}
                                                                <div>
                                                                    <div className="flex justify-between items-baseline mb-1">
                                                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">PROTEIN</span>
                                                                        <span className="text-emerald-400 font-mono font-black text-sm">{m1.protein} <span className="text-[10px] font-light text-emerald-500">g</span></span>
                                                                    </div>
                                                                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
                                                                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (m1.protein / maxProt) * 100)}%` }} />
                                                                    </div>
                                                                </div>

                                                                {/* Carbs */}
                                                                <div>
                                                                    <div className="flex justify-between items-baseline mb-1">
                                                                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">CARBOHYDRATES</span>
                                                                        <span className="text-amber-400 font-mono font-black text-sm">{m1.carbs} <span className="text-[10px] font-light text-amber-500">g</span></span>
                                                                    </div>
                                                                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
                                                                        <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (m1.carbs / maxCarbs) * 100)}%` }} />
                                                                    </div>
                                                                </div>

                                                                {/* Fats */}
                                                                <div>
                                                                    <div className="flex justify-between items-baseline mb-1">
                                                                        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">FAT PROFILE</span>
                                                                        <span className="text-purple-400 font-mono font-black text-sm">{m1.fats} <span className="text-[10px] font-light text-purple-500">g</span></span>
                                                                    </div>
                                                                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
                                                                        <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (m1.fats / maxFats) * 100)}%` }} />
                                                                    </div>
                                                                </div>

                                                                {/* Summary pricing comparison */}
                                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-1 pt-2 flex items-center gap-1">
                                                                    <span>💳</span> Commercial Terms
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-4 bg-black/30 p-3 rounded-xl border border-white/5">
                                                                    <div>
                                                                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Rate Per Meal</span>
                                                                        <span className="text-white font-mono font-black text-lg">₹{p1.perMeal}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Total ({compDays1} days)</span>
                                                                        <span className="text-orange-400 font-mono font-black text-lg">₹{p1.total.toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDietType(compDiet1);
                                                        setMealConfig(compMeals1);
                                                        setFitnessGoal(compGoal1);
                                                        if (comparePlan1 !== 'custom') {
                                                            setSelectedPlanId(comparePlan1);
                                                            const p = PLANS.find(pl => pl.id === comparePlan1);
                                                            if (p) setSelectedDays(p.days);
                                                        } else {
                                                            setSelectedPlanId('custom');
                                                            setSelectedDays(compDays1);
                                                        }
                                                        
                                                        setTimeout(() => {
                                                            openCheckout(comparePlan1 === 'custom' ? 'custom' : comparePlan1);
                                                            const checkEl = document.getElementById('checkout-stepper-view');
                                                            if (checkEl) checkEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                        }, 100);

                                                        if (navigator.vibrate) navigator.vibrate([10, 20]);
                                                    }}
                                                    className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-black text-[11px] font-black uppercase tracking-widest py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md active:scale-[0.98] select-none cursor-pointer text-center font-bold"
                                                >
                                                    Select & Book Plan A
                                                </button>
                                            </div>

                                            {/* COLUMN B */}
                                            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative">
                                                {comparePlan1 !== comparePlan2 && (() => {
                                                    const pr1 = calculatePrice(compDays1, compDiet1, compMeals1, compGoal1, [], ecoPackaging, excludeWeekends);
                                                    const pr2 = calculatePrice(compDays2, compDiet2, compMeals2, compGoal2, [], ecoPackaging, excludeWeekends);
                                                    if (pr2.perMeal < pr1.perMeal) {
                                                        return (
                                                            <span className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md">
                                                                💰 Best Price/Meal
                                                            </span>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00] block mb-2">PLAN CONFIGURATION B</span>
                                                    
                                                    {/* Plan Selector */}
                                                    <div className="space-y-3 mb-6">
                                                        <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 block">Select Base Plan</label>
                                                        <div className="grid grid-cols-4 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                                                            {PLANS.map(p => (
                                                                <button
                                                                    key={p.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setComparePlan2(p.id);
                                                                        setCompDays2(p.days);
                                                                        if (navigator.vibrate) navigator.vibrate(5);
                                                                    }}
                                                                    className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all text-center cursor-pointer ${
                                                                        comparePlan2 === p.id
                                                                            ? 'bg-[#FF7A00] text-black shadow-md font-black'
                                                                            : 'text-zinc-400 hover:text-white hover:bg-white/5 font-semibold'
                                                                    }`}
                                                                >
                                                                    {p.name}
                                                                </button>
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setComparePlan2('custom');
                                                                    setCompDays2(selectedDays);
                                                                    if (navigator.vibrate) navigator.vibrate(5);
                                                                }}
                                                                className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all text-center cursor-pointer ${
                                                                    comparePlan2 === 'custom'
                                                                        ? 'bg-[#FF7A00] text-black shadow-md font-black'
                                                                        : 'text-zinc-400 hover:text-white hover:bg-white/5 font-semibold'
                                                                }`}
                                                            >
                                                                Custom
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Days customizer if Custom plan selected */}
                                                    {comparePlan2 === 'custom' && (
                                                        <div className="mb-4 bg-black/20 p-3 rounded-xl border border-white/5">
                                                            <div className="flex justify-between items-center text-xs mb-1.5">
                                                                <span className="text-[10px] uppercase font-bold text-zinc-500">Duration (Days)</span>
                                                                <span className="font-mono text-[#FF7A00] font-black">{compDays2} Days</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="3"
                                                                max="90"
                                                                value={compDays2}
                                                                onChange={(e) => setCompDays2(parseInt(e.target.value))}
                                                                className="w-full accent-[#FF7A00]"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Configurations */}
                                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                                        {/* Diet */}
                                                        <div>
                                                            <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 block mb-1">Diet Base</label>
                                                            <select
                                                                value={compDiet2}
                                                                onChange={(e) => setCompDiet2(e.target.value as DietType)}
                                                                className="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#FF7A00] cursor-pointer"
                                                            >
                                                                <option value="veg">Pure Veg 🥦</option>
                                                                <option value="eggitarian">Eggitarian 🥚</option>
                                                                <option value="nonVeg">Non-Veg 🍗</option>
                                                            </select>
                                                        </div>
                                                        {/* Meals per day */}
                                                        <div>
                                                            <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 block mb-1">Meals/Day</label>
                                                            <select
                                                                value={compMeals2}
                                                                onChange={(e) => setCompMeals2(e.target.value as MealConfig)}
                                                                className="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#FF7A00] cursor-pointer"
                                                            >
                                                                <option value="single">1 Meal 🍽️</option>
                                                                <option value="double">2 Meals 🍱</option>
                                                                <option value="triple">3 Meals 🍲</option>
                                                            </select>
                                                        </div>
                                                        {/* Goal */}
                                                        <div>
                                                            <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 block mb-1">Fitness Goal</label>
                                                            <select
                                                                value={compGoal2}
                                                                onChange={(e) => setCompGoal2(e.target.value as FitnessGoal)}
                                                                className="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#FF7A00] cursor-pointer"
                                                            >
                                                                <option value="balanced">Balanced ⚡</option>
                                                                <option value="deficit">Fat Loss 🔥</option>
                                                                <option value="hypertrophy">Muscle Gain 💪</option>
                                                                <option value="keto">Keto Clean 🥑</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Macro breakdowns section with beautiful bars */}
                                                    {(() => {
                                                        const m2 = getMacros(compDiet2, compMeals2, compGoal2);
                                                        const p2 = calculatePrice(compDays2, compDiet2, compMeals2, compGoal2, [], ecoPackaging, excludeWeekends);
                                                        
                                                        const maxCal = 1500;
                                                        const maxProt = 120;
                                                        const maxCarbs = 180;
                                                        const maxFats = 90;

                                                        return (
                                                            <div className="space-y-4 mb-6">
                                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-1 flex items-center gap-1">
                                                                    <span>🥗</span> Meal Nutrition Profile
                                                                </h4>
                                                                
                                                                {/* Calories */}
                                                                <div>
                                                                    <div className="flex justify-between items-baseline mb-1">
                                                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">ENERGY</span>
                                                                        <span className="text-white font-mono font-black text-sm">{m2.calories} <span className="text-[10px] font-light text-zinc-500">kcal</span></span>
                                                                    </div>
                                                                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
                                                                        <div className="bg-[#FF7A00] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (m2.calories / maxCal) * 100)}%` }} />
                                                                    </div>
                                                                </div>

                                                                {/* Protein */}
                                                                <div>
                                                                    <div className="flex justify-between items-baseline mb-1">
                                                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">PROTEIN</span>
                                                                        <span className="text-emerald-400 font-mono font-black text-sm">{m2.protein} <span className="text-[10px] font-light text-emerald-500">g</span></span>
                                                                    </div>
                                                                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
                                                                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (m2.protein / maxProt) * 100)}%` }} />
                                                                    </div>
                                                                </div>

                                                                {/* Carbs */}
                                                                <div>
                                                                    <div className="flex justify-between items-baseline mb-1">
                                                                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">CARBOHYDRATES</span>
                                                                        <span className="text-amber-400 font-mono font-black text-sm">{m2.carbs} <span className="text-[10px] font-light text-amber-500">g</span></span>
                                                                    </div>
                                                                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
                                                                        <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (m2.carbs / maxCarbs) * 100)}%` }} />
                                                                    </div>
                                                                </div>

                                                                {/* Fats */}
                                                                <div>
                                                                    <div className="flex justify-between items-baseline mb-1">
                                                                        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">FAT PROFILE</span>
                                                                        <span className="text-purple-400 font-mono font-black text-sm">{m2.fats} <span className="text-[10px] font-light text-purple-500">g</span></span>
                                                                    </div>
                                                                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
                                                                        <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (m2.fats / maxFats) * 100)}%` }} />
                                                                    </div>
                                                                </div>

                                                                {/* Summary pricing comparison */}
                                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-1 pt-2 flex items-center gap-1">
                                                                    <span>💳</span> Commercial Terms
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-4 bg-black/30 p-3 rounded-xl border border-white/5">
                                                                    <div>
                                                                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Rate Per Meal</span>
                                                                        <span className="text-white font-mono font-black text-lg">₹{p2.perMeal}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Total ({compDays2} days)</span>
                                                                        <span className="text-orange-400 font-mono font-black text-lg">₹{p2.total.toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDietType(compDiet2);
                                                        setMealConfig(compMeals2);
                                                        setFitnessGoal(compGoal2);
                                                        if (comparePlan2 !== 'custom') {
                                                            setSelectedPlanId(comparePlan2);
                                                            const p = PLANS.find(pl => pl.id === comparePlan2);
                                                            if (p) setSelectedDays(p.days);
                                                        } else {
                                                            setSelectedPlanId('custom');
                                                            setSelectedDays(compDays2);
                                                        }
                                                        
                                                        setTimeout(() => {
                                                            openCheckout(comparePlan2 === 'custom' ? 'custom' : comparePlan2);
                                                            const checkEl = document.getElementById('checkout-stepper-view');
                                                            if (checkEl) checkEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                        }, 100);

                                                        if (navigator.vibrate) navigator.vibrate([10, 20]);
                                                    }}
                                                    className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-black text-[11px] font-black uppercase tracking-widest py-3.5 px-4 rounded-xl transition-all duration-300 shadow-md active:scale-[0.98] select-none cursor-pointer text-center font-bold"
                                                >
                                                    Select & Book Plan B
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Core Cards Responsive Layout */}
                        {/* Desktop Grid Layout */}
                        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto px-4 sm:px-0">
                            {PLANS.map((plan) => {
                                const pricing = calculatePrice(plan.days, dietType, mealConfig, fitnessGoal, [], ecoPackaging, excludeWeekends);
                                const macros = getMacros(dietType, mealConfig, fitnessGoal);

                                return (
                                    <div key={plan.id} className="h-full">
                                        <PlanPresenterCard
                                            plan={plan}
                                            diet={dietType}
                                            goal={fitnessGoal}
                                            meals={mealConfig}
                                            pricing={pricing}
                                            macros={macros}
                                            isSelected={selectedPlanId === plan.id}
                                            onSelect={(openModal) => handlePlanSelect(plan.id, openModal)}
                                            onMealsChange={setMealConfig}
                                            onCompare={() => handleToggleCompare(plan.id)}
                                            isComparing={compareMode && (comparePlan1 === plan.id || comparePlan2 === plan.id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mobile Side-Sliding Carousel Layout */}
                        <div className="md:hidden relative overflow-hidden w-full">
                            {/* High-End Mobile Swipe Assist Guide */}
                            <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] text-zinc-400 tracking-widest uppercase font-sans mb-4 select-none bg-zinc-900/40 py-2 px-4 rounded-full border border-white/[0.04] max-w-[260px] mx-auto shadow-inner">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                <span className="font-medium">Swipe to compare cycles</span>
                                <ArrowRight className="w-3 h-3 text-emerald-400 ml-0.5 animate-bounce-horizontal" />
                            </div>

                            <div 
                                ref={scrollContainerRef} 
                                {...handlers} 
                                className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-12 gap-6 scroll-smooth"
                            >
                                {PLANS.map((plan, i) => {
                                    const pricing = calculatePrice(plan.days, dietType, mealConfig, fitnessGoal, [], ecoPackaging, excludeWeekends);
                                    const macros = getMacros(dietType, mealConfig, fitnessGoal);

                                    return (
                                        <div key={plan.id} className="w-[82vw] xs:w-[85vw] flex-shrink-0 snap-center">
                                            <PlanPresenterCard
                                                plan={plan}
                                                diet={dietType}
                                                goal={fitnessGoal}
                                                meals={mealConfig}
                                                pricing={pricing}
                                                macros={macros}
                                                isSelected={selectedPlanId === plan.id}
                                                onSelect={(openModal) => handlePlanSelect(plan.id, openModal)}
                                                onMealsChange={setMealConfig}
                                                onCompare={() => handleToggleCompare(plan.id)}
                                                isComparing={compareMode && (comparePlan1 === plan.id || comparePlan2 === plan.id)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Mobile Indicators with Tactile Chevrons */}
                            <div className="flex items-center justify-center gap-4 mt-4 select-none">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        if (navigator.vibrate) navigator.vibrate(8);
                                        goToPrevious();
                                    }}
                                    className="p-2.5 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/10 active:scale-95 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-md"
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                                </button>

                                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-zinc-900/50 border border-white/[0.03] rounded-2xl">
                                    {PLANS.map((_, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => { if(navigator.vibrate) navigator.vibrate(5); goToSlide(i); }} 
                                            className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${activeIndex === i ? 'w-8 bg-emerald-500' : 'w-2 bg-gray-600'}`}
                                            aria-label={`Go to slide ${i + 1}`}
                                        />
                                    ))}
                                </div>

                                <button 
                                    type="button"
                                    onClick={() => {
                                        if (navigator.vibrate) navigator.vibrate(8);
                                        goToNext();
                                    }}
                                    className="p-2.5 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/10 active:scale-95 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-md"
                                    aria-label="Next slide"
                                >
                                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                                </button>
                            </div>
                        </div>

                        {/* DYNAMIC MEAL PREVIEWS based on selected diet structure */}
                        <div className="bg-[#0b0b0b] border border-white/[0.03] rounded-3xl p-6 sm:p-12 max-w-6xl mx-auto shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-white/[0.03] font-serif italic font-black pointer-events-none select-none text-8xl sm:text-9xl tracking-tighter">GOURMET</div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <div>
                                    <span className="text-[#FF7A00] text-xs uppercase font-sans tracking-widest block mb-1">CRAFTED FRESH WEEKLY</span>
                                    <h3 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
                                        Sample Dishes Delivered for <span className="italic text-emerald-400 capitalize">{dietType === 'nonVeg' ? 'Non-Veg' : dietType}</span>
                                    </h3>
                                </div>
                                <span className="text-xs text-gray-400 font-sans flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                    <Sparkles className="w-4 h-4 text-[#FF7A00] animate-pulse" /> Rotated Daily for Menu Zero Fatigue
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {METABOLIC_MEAL_SAMPLES[dietType as keyof typeof METABOLIC_MEAL_SAMPLES]?.map((meal, index) => (
                                    <div key={index} className="flex gap-4 sm:gap-6 bg-black/60 p-4 rounded-2xl border border-white/[0.03] hover:border-white/10 transition-colors group">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-white/10 relative">
                                            <LazyImage 
                                                src={meal.imageUrl} 
                                                alt={`${meal.name} - healthy meal delivery in Bengaluru`} 
                                                sizes="112px"
                                                wrapperClassName="w-full h-full aspect-square"
                                                className="w-full h-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        </div>
                                        <div className="flex flex-col justify-between">
                                            <div>
                                                <h4 className="text-white text-sm sm:text-base font-bold mb-1 leading-tight">{meal.name}</h4>
                                                <p className="text-gray-400 text-xs font-light leading-relaxed mb-2 line-clamp-2">{meal.description}</p>
                                            </div>
                                            <span className="inline-block text-xs font-sans text-emerald-400 bg-emerald-950/20 border border-emerald-500/10 px-2.5 py-1 rounded-md self-start">
                                                {meal.stats}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Savings & Value Calculator (CRO driver) */}
                        <SavingsCalculator />

                        {/* Customer trust checkmarks in Bangalore */}
                        <div className="mt-16 text-center max-w-5xl mx-auto border-t border-white/[0.03] pt-16 overflow-hidden w-full">
                            <div 
                                ref={trustCarousel.scrollContainerRef}
                                {...trustCarousel.handlers}
                                className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-6 snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-3 md:gap-6"
                            >
                                {[
                                    { icon: ShieldCheck, title: 'Nutritionist-Crafted Balanced Meals', text: 'Every meal is carefully portioned and designed to help you achieve your health goals with the right balance of protein, carbs, and healthy fats.' },
                                    { icon: Calendar, title: 'Flexible Meal Scheduling', text: 'Pause, skip, or reschedule your meals anytime. Your subscription adapts to your lifestyle.' },
                                    { icon: Leaf, title: 'Eco-Friendly Packaging', text: 'Delivered in sustainable sugarcane-based containers that are safe for you and the environment.' }
                                ].map((card, idx) => {
                                    const CardIcon = card.icon;
                                    return (
                                        <div key={idx} className="snap-center shrink-0 w-[280px] sm:w-[320px] md:w-auto bg-zinc-900/40 p-6 rounded-2xl border border-white/[0.03] hover:border-white/10 transition-all duration-300">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-900/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-[#059669]">
                                                <CardIcon className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-white font-semibold text-sm sm:text-base mb-2">{card.title}</h4>
                                            <p className="text-gray-400 text-xs leading-relaxed font-light">{card.text}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mobile indicators */}
                            <div className="flex justify-center gap-1.5 mt-2 md:hidden">
                                {[0, 1, 2].map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => trustCarousel.goToSlide(index)}
                                        className="w-11 h-11 flex items-center justify-center -mx-1 group cursor-pointer focus:outline-none"
                                        aria-label={`Go to slide ${index + 1}`}
                                    >
                                        <span className={`transition-all duration-300 rounded-full h-1.5 ${
                                            trustCarousel.activeIndex === index ? 'bg-emerald-500 w-4' : 'bg-white/20 group-hover:bg-white/40 w-1.5'
                                        }`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Taste & Compliance zero risks box */}
                        <div className="mt-12 bg-gradient-to-r from-emerald-950/20 via-[#FF7A00]/5 to-black border border-emerald-500/15 rounded-3xl p-6 sm:p-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative overflow-hidden">
                            <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-[#FF7A00]/40 flex items-center justify-center bg-[#111] shadow-[0_0_50px_rgba(255,122,0,0.1)] relative">
                                <Award className="w-10 h-10 text-emerald-400" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <span className="text-[#FF7A00] font-sans text-xs tracking-widest uppercase block mb-1">QUALITY GUARANTEE</span>
                                <h4 className="text-white font-serif text-lg sm:text-2xl tracking-tight mb-2">
                                    Taste & Freshness <span className="italic text-emerald-400">Zero-Risk First Week Guarantee</span>
                                </h4>
                                <p className="text-gray-400 text-xs sm:text-sm font-light leading-relaxed">
                                    We maintain uncompromising culinary excellence. If you are not completely satisfied with the nutrient standard or taste quality of your meals within the first week (5 delivery days), simply contact us. We will instantly refund the remaining outstanding cycle balance. No complex paperwork, no friction.
                                </p>
                            </div>
                        </div>

                    </div>

                <div className="flex flex-col items-center justify-center mt-12 mb-8">
                    <button
                        onClick={() => {
                            setSelectedPlanId('custom');
                            openCheckout('custom');
                            if (navigator.vibrate) navigator.vibrate(5);
                        }}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-900/30 active:scale-95 cursor-pointer shadow-lg"
                    >
                        <Sliders className="w-4 h-4 text-orange-400 animate-pulse" /> Build a Custom Plan
                    </button>
                    <p className="text-[11px] text-zinc-500 mt-2 font-sans tracking-wide">
                        Need a custom duration (e.g. 15, 30, or 45 days)? Configure exactly what you need.
                    </p>
                </div>

                {/* THE PROTOCOL MATRIX COMPARISONS TABLE / CARDS */}
                <div className="mt-24 max-w-4xl mx-auto bg-zinc-950/80 p-5 sm:p-12 rounded-3xl border border-white/10 shadow-2xl animate-fade-in text-white select-none">
                    <h3 className="text-2xl font-serif tracking-tight mb-8 font-light border-b border-white/[0.03] pb-4">
                        Why Choose Taazabites?
                    </h3>
                    
                    {/* Desktop/Tablet Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full font-sans text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-gray-500 uppercase tracking-widest text-xs">
                                    <th className="py-4 font-bold">FEATURES AND HYGIENE</th>
                                    <th className="py-4 font-bold text-emerald-400">TAAZABITES ADVANTAGE</th>
                                    <th className="py-4 font-bold">STANDARD COMMERCIAL APPS</th>
                                    <th className="py-4 font-bold">COOKING BY YOURSELF</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300">
                                {[
                                    { param: 'Cooking Oil Policy', taaza: '100% Extra Virgin Olive Oil (0% Ghee, Coconut Oil, or Seed Oils)', standard: 'High reuse seed palm/refined oils', home: 'Flexible but hard to stick to' },
                                    { param: 'Precision Macro Matching', taaza: 'Exact scales verified by food nutritionist', standard: 'Approximate standard estimations', home: 'Heavy scale math needed' },
                                    { param: 'Hold & Shift Schedules', taaza: 'No fee instant holiday skips (Credits roll)', standard: 'Not supported after placing order', home: 'High grocery rot wastage' },
                                    { param: 'Freshly Sourced Logistics', taaza: 'Delivered in thermal-controlled boxes', standard: 'Rider delays / cold stale deliveries', home: 'Time-consuming prep chores' },
                                    { param: 'Organic Chemical Zero', taaza: 'Rigid testing for high heavy metal crops', standard: 'Low cost batch food chemicals', home: 'Vulnerable to pesticide crops' }
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-all">
                                        <td className="py-4 font-semibold text-white">{row.param}</td>
                                        <td className="py-4 text-emerald-400 flex items-center gap-1.5 font-bold font-sans">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {row.taaza}
                                        </td>
                                        <td className="py-4 text-gray-500">{row.standard}</td>
                                        <td className="py-4 text-gray-500">{row.home}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Stacked Cards */}
                    <div className="block md:hidden space-y-6">
                        {[
                            { param: 'Cooking Oil Policy', taaza: '100% Extra Virgin Olive Oil (0% Ghee, Coconut Oil, or Seed Oils)', standard: 'High reuse seed palm/refined oils', home: 'Flexible but hard to stick to' },
                            { param: 'Precision Macro Matching', taaza: 'Exact scales verified by food nutritionist', standard: 'Approximate standard estimations', home: 'Heavy scale math needed' },
                            { param: 'Hold & Shift Schedules', taaza: 'No fee instant holiday skips (Credits roll)', standard: 'Not supported after placing order', home: 'High grocery rot wastage' },
                            { param: 'Freshly Sourced Logistics', taaza: 'Delivered in thermal-controlled boxes', standard: 'Rider delays / cold stale deliveries', home: 'Time-consuming prep chores' },
                            { param: 'Organic Chemical Zero', taaza: 'Rigid testing for high heavy metal crops', standard: 'Low cost batch food chemicals', home: 'Vulnerable to pesticide crops' }
                        ].map((row, i) => (
                            <div key={i} className="bg-white/[0.02] p-4 rounded-2xl border border-white/[0.04] space-y-3.5">
                                <h4 className="text-sm font-bold text-white tracking-wide border-b border-white/[0.03] pb-2 font-serif">{row.param}</h4>
                                <div className="space-y-2 text-xs">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">Taazabites Advantage:</span>
                                        <div className="text-emerald-300 font-semibold flex items-start gap-1.5 leading-relaxed bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>{row.taaza}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <div className="bg-black/20 p-2 rounded-xl border border-white/[0.02]">
                                            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Commercial Apps</span>
                                            <p className="text-zinc-400 leading-normal">{row.standard}</p>
                                        </div>
                                        <div className="bg-black/20 p-2 rounded-xl border border-white/[0.02]">
                                            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Cooking Yourself</span>
                                            <p className="text-zinc-400 leading-normal">{row.home}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DELIVERY ZONES SECTION */}
                <div className="mt-24 max-w-5xl mx-auto border-t border-white/[0.03] pt-20">
                    <div className="text-center mb-12">
                        <span className="text-[#FF7A00] font-sans text-xs tracking-widest uppercase block mb-1">DELIVERY ZONES</span>
                        <h3 className="text-3xl sm:text-4xl font-extrabold font-sans text-white tracking-tight uppercase">Delivery Coverage</h3>
                        <p className="text-gray-400 text-xs sm:text-sm font-light mt-2">Precision routed thermal-controlled deliveries directly to your zone.</p>
                    </div>

                    <div className="relative overflow-hidden w-full">
                        {/* Smooth left/right gradient shadows to indicate side scrolling is available on mobile/tablet */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent pointer-events-none z-10 md:hidden" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none z-10 md:hidden" />

                        <div 
                            ref={coverageCarousel.scrollContainerRef}
                            {...coverageCarousel.handlers}
                            className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-6 snap-x snap-mandatory pb-4 -mx-4 px-6 sm:mx-0 sm:px-0 md:grid md:grid-cols-2 relative scroll-smooth"
                        >
                            {/* Active Zones */}
                            <div className="snap-center shrink-0 w-[290px] sm:w-[340px] md:w-auto bg-gradient-to-b from-[#0A0A0A] to-[#111] p-8 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] text-center relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none"></div>
                                <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-6">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-6 uppercase tracking-wider text-sm font-sans flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Active Zones
                                </h4>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {['Kasavanahalli (HQ)', 'HSR Layout', 'Koramangala', 'Sarjapur Road', 'Bellandur', 'Electronic City'].map(zone => (
                                        <span key={zone} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                                            zone.includes('HQ') 
                                                ? 'bg-orange-950/50 text-orange-400 border border-orange-500/30 font-bold shadow-[0_0_15px_rgba(251,146,60,0.1)]' 
                                                : 'bg-emerald-950/20 text-emerald-300 border border-emerald-500/10 hover:bg-emerald-900/40'
                                        }`}>
                                            {zone}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Coming Soon */}
                            <div className="snap-center shrink-0 w-[290px] sm:w-[340px] md:w-auto bg-[#0b0b0b] p-8 rounded-2xl border border-white/[0.03] text-center px-4 relative overflow-hidden hover:border-white/10 transition-colors">
                                 <div className="w-12 h-12 rounded-full bg-orange-950/20 border border-orange-500/10 flex items-center justify-center text-orange-400 mx-auto mb-6">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-300 mb-6 uppercase tracking-wider text-sm font-sans flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500/50"></span>
                                    Coming Soon
                                </h4>
                                <div className="flex flex-wrap justify-center gap-2 opacity-50">
                                    {['Indiranagar', 'BTM Layout', 'Jayanagar', 'JP Nagar', 'Hebbal', 'Yelahanka'].map(zone => (
                                        <span key={zone} className="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-black/40 text-gray-400 border border-white/10">
                                            {zone}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Mobile indicators */}
                    <div className="flex justify-center gap-1.5 mt-2 md:hidden">
                        {[0, 1].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => coverageCarousel.goToSlide(index)}
                                className="w-11 h-11 flex items-center justify-center -mx-1 group cursor-pointer focus:outline-none"
                                aria-label={`Go to slide ${index + 1}`}
                            >
                                <span className={`transition-all duration-300 rounded-full h-1.5 ${
                                    coverageCarousel.activeIndex === index ? 'bg-emerald-500 w-4' : 'bg-white/20 group-hover:bg-white/40 w-1.5'
                                }`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* DYNAMIC METABOLIC TRANSFORMATION EVIDENCE & TESTIMONIALS */}
                <TransformationGallery />

                {/* DYNAMIC SUBSCRIPTION LOGISTICS & OPERATIONS FAQ */}
                <SubscriptionLogisticsFaq />

                {/* FAQ OBJECTIONS SECTION TO BOOST CONVERSION */}
                <div className="mt-24 max-w-4xl mx-auto border-t border-white/[0.03] pt-20">
                    <div className="text-center mb-12">
                        <span className="text-[#FF7A00] font-sans text-xs tracking-widest uppercase block mb-1">FREQUENTLY ASKED QUESTIONS</span>
                        <h3 className="text-3xl sm:text-4xl font-extrabold font-sans text-white tracking-tight uppercase">Frequently Asked Doubts</h3>
                        <p className="text-gray-400 text-xs sm:text-sm font-light mt-2">Everything you need to know about our service, deliveries, and scheduling.</p>
                    </div>

                    {/* Desktop View: Accordion */}
                    <div className="hidden sm:block bg-[#0b0b0b] border border-white/[0.03] rounded-3xl p-6 sm:p-10 divide-y divide-white/5 shadow-xl max-w-3xl mx-auto">
                        {[
                            {
                                q: "How much does Taazabites Trial plan cost?",
                                a: "The Trial plan costs ₹1,545 for 5 days of veg diet (single meal per day). The non-vegetarian option starts at ₹1,645."
                            },
                            {
                                q: "How much is The Habit plan?",
                                a: "The Habit plan is priced at ₹5,900 for 20 days of delivery (veg diet, single meal). Non-vegetarian starts at ₹6,100."
                            },
                            {
                                q: "What is the cost of The Lifestyle plan?",
                                a: "The Lifestyle plan costs ₹16,800 for 60 days on a veg diet (single meal per day). Non-vegetarian options start at ₹17,400."
                            },
                            {
                                q: "How does the plan hold/pause process function?",
                                a: "You can pause your active meal subscription indefinitely with no extra fee. Just coordinate with our dedicated Whatsapp concierge with a 12-hour warning buffer. Your credit balance stays completely protected and rolls over to future cycles."
                            },
                            {
                                q: "Where does the kitchen construct the food?",
                                a: "Our operations are located in custom, climate-controlled organic hubs in Bangalore. Our team manages strict hazard control protocols, chemical-free raw cleaning sanitization, and 100% molecular kitchen safety standard benchmarks."
                            },
                            {
                                q: "Can I adjust my macros or dietary type mid-cycle?",
                                a: "Absolutely. If you change your goals from Fat Loss to High Protein, or wish to shift from Veg to Non-Veg during your Habit or Lifestyle cycle, simply ask your nutritionist concierge line. We update the configuration with adaptive pricing adjustments."
                            },
                            {
                                q: "What packaging configurations do you deliver in?",
                                a: "We believe in ecological vitality. Every dish arrives fresh, safe, and steam-sealed inside premium compostable eco-friendly food containers which degrade cleanly back into nature. No residual microplastics, zero toxic heat leakage."
                            }
                        ].map((faq, index) => (
                            <FaqAccordionItem 
                                key={index} 
                                q={faq.q} 
                                a={faq.a} 
                                isOpen={openFaq === index} 
                                onToggle={() => setOpenFaq(openFaq === index ? null : index)} 
                            />
                        ))}
                    </div>

                    {/* Mobile View: Side-Sliding Cards */}
                    <div className="sm:hidden relative overflow-hidden w-full">
                        <div 
                            ref={faqCarousel.scrollContainerRef}
                            {...faqCarousel.handlers}
                            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-8 gap-5 scroll-smooth"
                        >
                            {[
                                {
                                    q: "How much does Taazabites Trial plan cost?",
                                    a: "The Trial plan costs ₹1,545 for 5 days of veg diet (single meal per day). The non-vegetarian option starts at ₹1,645."
                                },
                                {
                                    q: "How much is The Habit plan?",
                                    a: "The Habit plan is priced at ₹5,900 for 20 days of delivery (veg diet, single meal). Non-vegetarian starts at ₹6,100."
                                },
                                {
                                    q: "What is the cost of The Lifestyle plan?",
                                    a: "The Lifestyle plan costs ₹16,800 for 60 days on a veg diet (single meal per day). Non-vegetarian options start at ₹17,400."
                                },
                                {
                                    q: "How does the plan hold/pause process function?",
                                    a: "You can pause your active meal subscription indefinitely with no extra fee. Just coordinate with our dedicated Whatsapp concierge with a 12-hour warning buffer. Your credit balance stays completely protected and rolls over to future cycles."
                                },
                                {
                                    q: "Where does the kitchen construct the food?",
                                    a: "Our operations are located in custom, climate-controlled organic hubs in Bangalore. Our team manages strict hazard control protocols, chemical-free raw cleaning sanitization, and 100% molecular kitchen safety standard benchmarks."
                                },
                                {
                                    q: "Can I adjust my macros or dietary type mid-cycle?",
                                    a: "Absolutely. If you change your goals from Fat Loss to High Protein, or wish to shift from Veg to Non-Veg during your Habit or Lifestyle cycle, simply ask your nutritionist concierge line. We update the configuration with adaptive pricing adjustments."
                                },
                                {
                                    q: "What packaging configurations do you deliver in?",
                                    a: "We believe in ecological vitality. Every dish arrives fresh, safe, and steam-sealed inside premium compostable eco-friendly food containers which degrade cleanly back into nature. No residual microplastics, zero toxic heat leakage."
                                }
                            ].map((faq, index) => (
                                <div key={index} className="w-[85vw] flex-shrink-0 snap-center bg-[#0b0b0b] border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between min-h-[180px]">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-xs shrink-0 font-bold">Q</span>
                                            <h4 className="text-white font-medium text-sm font-serif leading-snug">{faq.q}</h4>
                                        </div>
                                        <p className="text-gray-400 text-xs font-light leading-relaxed pl-8">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Indicators */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                            {[0, 1, 2, 3, 4, 5, 6].map((_, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => { if(navigator.vibrate) navigator.vibrate(5); faqCarousel.goToSlide(index); }} 
                                    className={`h-1.5 transition-all duration-500 rounded-full ${faqCarousel.activeIndex === index ? 'w-8 bg-emerald-500' : 'w-2 bg-gray-600'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* HIGH-FIDELITY CHECKOUT MODAL AND ORDER CONFIGURE STATION */}
            <AnimatePresence>
                {checkoutModalOpen && (
                    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden" role="dialog" aria-modal="true">
                        <div className="fixed inset-0 bg-black/95 backdrop-blur-md" onClick={() => setCheckoutModalOpen(false)}></div>
                        
                        <motion.div 
                            initial={{ y: "100%", opacity: 0.5 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0.5 }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="relative bg-zinc-950 w-full max-w-2xl rounded-t-[2rem] sm:rounded-3xl shadow-2xl border-t sm:border border-white/10 z-10 flex flex-col h-[94vh] sm:h-auto sm:max-h-[92vh] overflow-hidden text-white self-end sm:self-center"
                        >
                            {/* Mobile Bottom Sheet Grab Handle */}
                            <div className="w-12 h-1 bg-white/15 rounded-full mx-auto my-3 sm:hidden shrink-0" />

                            {/* Modal Header */}
                            <div className="p-5 sm:p-6 border-b border-white/[0.03] flex justify-between items-center bg-black/60 shrink-0">
                                <div>
                                    <span className="text-xs font-sans font-bold text-orange-400 uppercase tracking-widest block mb-0.5">SECURE INSTANT CHECKOUT</span>
                                    <h3 className="text-lg sm:text-xl font-sans text-white font-bold">Configure & Complete Order</h3>
                                </div>
                                <button 
                                    onClick={() => setCheckoutModalOpen(false)}
                                    className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0 cursor-pointer focus:outline-none"
                                    aria-label="Close checkout modal"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Interactive Stepper Progress Indicator */}
                            <div className="px-5 sm:px-8 py-3.5 border-b border-white/[0.03] bg-black/40 flex flex-col gap-2.5 shrink-0">
                                <div className="flex justify-between items-center text-xs text-zinc-400 font-sans uppercase tracking-wider">
                                    <span className="font-semibold text-zinc-500">Step {stepperStep} of 3</span>
                                    <span className="text-[#FF7A00] font-black">
                                        {stepperStep === 1 && "1. Customize Plan"}
                                        {stepperStep === 2 && "2. Delivery & Logistics"}
                                        {stepperStep === 3 && "3. Review & Checkout"}
                                    </span>
                                </div>
                                
                                {/* Progress Bar Track */}
                                <div className="relative w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-500 via-orange-500 to-yellow-400 transition-all duration-300" 
                                        style={{ width: `${(stepperStep / 3) * 100}%` }}
                                    />
                                </div>

                                {/* Step Nodes */}
                                <div className="flex justify-between items-center text-[10px] sm:text-xs text-zinc-500 font-medium pt-1 px-1">
                                    {[
                                        { step: 1, label: 'Plan Config' },
                                        { step: 2, label: 'Delivery' },
                                        { step: 3, label: 'Checkout' }
                                    ].map((node) => {
                                        const isCompleted = node.step < stepperStep;
                                        const isActive = node.step === stepperStep;
                                        return (
                                            <button
                                                key={node.step}
                                                type="button"
                                                onClick={() => {
                                                    // Guard forward jumps to step 3 if step 2 inputs are not filled/validated
                                                    if (node.step === 3 && stepperStep !== 3) {
                                                        const phoneCleaned = userPhone.trim().replace(/[\s\-\+\(\)]/g, '');
                                                        const isPhoneValid = /^[6-9]\d{9}$/.test(phoneCleaned);
                                                        if (!userName.trim()) {
                                                            setCheckoutError('Please enter the Recipient Name on Step 2 to proceed.');
                                                            setStepperStep(2);
                                                            setTimeout(() => {
                                                                if (stepperContentRef.current) {
                                                                    stepperContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                                                }
                                                            }, 50);
                                                            if (navigator.vibrate) navigator.vibrate([50, 50]);
                                                            return;
                                                        }
                                                        if (!userPhone.trim()) {
                                                            setCheckoutError('Please enter the WhatsApp Mobile Number on Step 2.');
                                                            setStepperStep(2);
                                                            setTimeout(() => {
                                                                if (stepperContentRef.current) {
                                                                    stepperContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                                                }
                                                            }, 50);
                                                            if (navigator.vibrate) navigator.vibrate([50, 50]);
                                                            return;
                                                        }
                                                        if (!isPhoneValid) {
                                                            setCheckoutError('Please enter a valid 10-digit WhatsApp number on Step 2 (e.g. 9876543210).');
                                                            setStepperStep(2);
                                                            setTimeout(() => {
                                                                if (stepperContentRef.current) {
                                                                    stepperContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                                                }
                                                            }, 50);
                                                            if (navigator.vibrate) navigator.vibrate([50, 50]);
                                                            return;
                                                        }
                                                    }
                                                    setCheckoutError('');
                                                    setStepperStep(node.step);
                                                    if (navigator.vibrate) navigator.vibrate(10);
                                                }}
                                                className={`flex items-center gap-1.5 transition-colors focus:outline-none cursor-pointer ${
                                                    isActive ? 'text-white font-bold' : isCompleted ? 'text-emerald-400' : 'text-zinc-600'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border transition-all ${
                                                    isActive 
                                                        ? 'bg-[#FF7A00] border-[#FF7A00] text-black font-extrabold shadow-md' 
                                                        : isCompleted 
                                                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 font-bold' 
                                                            : 'bg-zinc-950 border-white/5 text-zinc-600'
                                                }`}>
                                                    {isCompleted ? <Check className="w-3 h-3" /> : node.step}
                                                </div>
                                                <span className="hidden xs:inline">{node.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Stepper Content Body */}
                            <div ref={stepperContentRef} className="p-5 sm:p-6 md:p-8 overflow-y-auto flex-grow bg-zinc-950">
                                
                                {/* STEP 1: NUTRITION & FITNESS GOAL CONFIGURATION */}
                                {stepperStep === 1 && (
                                    <div className="space-y-6">
                                        {/* High-visibility High Demand Scarcity Alert */}
                                        <div className="bg-orange-500/10 border border-orange-500/20 text-[#FF7A00] rounded-2xl p-4 text-xs flex items-center gap-3">
                                            <Flame className="w-5 h-5 text-orange-400 animate-pulse shrink-0" />
                                            <div>
                                                <p className="font-bold text-sm">High Demand Batch Alert!</p>
                                                <p className="text-zinc-400 font-light mt-0.5">We are at 94% capacity for tomorrow's delivery cycle in Bengaluru. Lock your order now to reserve your kitchen slot.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Leaf className="w-4 h-4 text-emerald-400" /> 1. Select Dietary Preference
                                            </h4>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: 'veg', label: 'Pure Veg', color: 'bg-emerald-500' },
                                                    { id: 'eggitarian', label: 'Eggitarian', color: 'bg-amber-400' },
                                                    { id: 'nonVeg', label: 'Non-Veg', color: 'bg-red-500' }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setDietType(item.id as DietType);
                                                            if (navigator.vibrate) navigator.vibrate(10);
                                                        }}
                                                        className={`py-3.5 px-2 rounded-2xl border text-xs font-bold font-sans tracking-wide transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                                                            dietType === item.id
                                                                ? 'bg-zinc-900 border-[#FF7A00]/50 text-white font-black shadow-lg shadow-black/40'
                                                                : 'bg-black/30 text-zinc-500 border-white/[0.02] hover:text-zinc-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`w-2 h-2 rounded-full ${item.color}`} />
                                                            {item.label}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <UtensilsCrossed className="w-4 h-4 text-orange-400" /> 2. Choose Daily Meal Frequency
                                            </h4>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: 'single', label: '1 Meal', desc: 'Lunch or Dinner' },
                                                    { id: 'double', label: '2 Meals', desc: 'Save 10%' },
                                                    { id: 'triple', label: '3 Meals', desc: 'Save 16%' }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setMealConfig(item.id as MealConfig);
                                                            if (navigator.vibrate) navigator.vibrate(10);
                                                        }}
                                                        className={`py-3.5 px-2 rounded-2xl border text-xs font-bold font-sans tracking-wide transition-all flex flex-col items-center justify-center cursor-pointer ${
                                                            mealConfig === item.id
                                                                ? 'bg-zinc-900 border-[#FF7A00]/50 text-[#FF7A00] font-black shadow-lg shadow-black/40'
                                                                : 'bg-black/30 text-zinc-500 border-white/[0.02] hover:text-zinc-300'
                                                        }`}
                                                    >
                                                        <span className="block mb-0.5">{item.label}</span>
                                                        <span className="text-[9px] font-light text-zinc-500 leading-none">{item.desc}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Dumbbell className="w-4 h-4 text-amber-500" /> 3. Target Health & Fitness Goal
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                                {[
                                                    { id: 'balanced', name: 'Balanced', desc: 'Default vital' },
                                                    { id: 'deficit', name: 'Fat Loss', desc: 'Deficit (+₹10)' },
                                                    { id: 'hypertrophy', name: 'Muscle Gain', desc: 'Protein (+₹20)' },
                                                    { id: 'keto', name: 'Keto Clean', desc: 'Fats (+₹20)' }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFitnessGoal(item.id as FitnessGoal);
                                                            if (navigator.vibrate) navigator.vibrate(10);
                                                        }}
                                                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                                            fitnessGoal === item.id 
                                                                ? 'bg-zinc-900 text-amber-200 border-amber-500/40 shadow-lg' 
                                                                : 'bg-black/30 text-zinc-500 border-white/[0.02] hover:border-zinc-800 hover:text-zinc-300'
                                                        }`}
                                                    >
                                                        <span className="text-xs font-bold block">{item.name}</span>
                                                        <span className="text-[9px] text-zinc-500 block mt-0.5 leading-none">{item.desc}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Dynamic Daily Nutrition Board */}
                                        <div className="bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-white/[0.03] space-y-3.5">
                                            <div className="flex justify-between items-center text-xs text-zinc-400 font-sans tracking-wide">
                                                <span className="flex items-center gap-1.5 font-bold"><Activity className="w-3.5 h-3.5 text-[#FF7A00]" /> Daily Nutrition Estimates</span>
                                                <span className="text-zinc-500 text-[10px]">Recommended Plan Details</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-4 gap-2 text-center">
                                                <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.02]">
                                                    <span className="text-[10px] text-zinc-500 block font-sans">CALORIES</span>
                                                    <span className="text-base font-bold text-white font-mono">{currentMacros.calories}</span>
                                                    <span className="text-[8px] text-zinc-600 block">kcal/day</span>
                                                </div>
                                                <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.02]">
                                                    <span className="text-[10px] text-zinc-500 block font-sans">PROTEIN</span>
                                                    <span className="text-base font-bold text-emerald-400 font-mono">{currentMacros.protein}g</span>
                                                    <span className="text-[8px] text-emerald-600 block">protein</span>
                                                </div>
                                                <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.02]">
                                                    <span className="text-[10px] text-zinc-500 block font-sans">CARBS</span>
                                                    <span className="text-base font-bold text-amber-400 font-mono">{currentMacros.carbs}g</span>
                                                    <span className="text-[8px] text-amber-600 block">energy</span>
                                                </div>
                                                <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.02]">
                                                    <span className="text-[10px] text-zinc-500 block font-sans">FAT</span>
                                                    <span className="text-base font-bold text-[#FF7A00] font-mono">{currentMacros.fats}g</span>
                                                    <span className="text-[8px] text-orange-600 block">healthy fats</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: DURATION, ADDONS & PACKAGING PREFERENCES */}
                                {stepperStep === 1 && (
                                    <div className="space-y-6 border-t border-white/[0.03] pt-6 mt-8">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4 text-[#FF7A00]" /> 4. Subscription Duration Period
                                                </h4>
                                                <span className="text-xs text-zinc-500 font-sans italic">{sliderSavingsTier.label}</span>
                                            </div>
                                            
                                            <div className="bg-zinc-900/30 p-5 rounded-2xl border border-white/[0.03] space-y-4">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-zinc-400">Drag to change days:</span>
                                                    <span className="text-[#FF7A00] font-bold text-sm bg-orange-500/10 px-3 py-1 rounded border border-orange-500/20 font-mono">{selectedDays} Days</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-3.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedDays(prev => Math.max(5, prev - 1));
                                                            setSelectedPlanId('custom');
                                                            if (navigator.vibrate) navigator.vibrate(5);
                                                        }}
                                                        className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 hover:text-white shrink-0 flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-md shadow-black/40 focus:outline-none"
                                                        aria-label="Decrease days"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>

                                                    <input 
                                                        type="range" 
                                                        min="5" 
                                                        max="90" 
                                                        value={selectedDays} 
                                                        onChange={e => { 
                                                            setSelectedDays(Number(e.target.value)); 
                                                            setSelectedPlanId('custom');
                                                            if (navigator.vibrate) navigator.vibrate(5); 
                                                        }}
                                                        className="flex-grow h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ew-resize accent-emerald-500"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedDays(prev => Math.min(90, prev + 1));
                                                            setSelectedPlanId('custom');
                                                            if (navigator.vibrate) navigator.vibrate(5);
                                                        }}
                                                        className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 hover:text-white shrink-0 flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-md shadow-black/40 focus:outline-none"
                                                        aria-label="Increase days"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                
                                                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                                                    <span>5d (Trial)</span>
                                                    <span>20d (Habit)</span>
                                                    <span>60d (Lifestyle)</span>
                                                    <span>90d (Ultimate)</span>
                                                </div>

                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {[
                                                        { label: '5-Day Trial', val: 5 },
                                                        { label: '20-Day Habit', val: 20 },
                                                        { label: '60-Day Lifestyle', val: 60 },
                                                        { label: '90-Day Program', val: 90 }
                                                    ].map(shortcut => (
                                                        <button
                                                            key={shortcut.val}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedDays(shortcut.val);
                                                                setSelectedPlanId('custom');
                                                                if (navigator.vibrate) navigator.vibrate(10);
                                                            }}
                                                            className={`px-3.5 min-h-[44px] flex items-center justify-center text-[10px] font-sans rounded-xl border transition-all cursor-pointer focus:outline-none ${
                                                                selectedDays === shortcut.val
                                                                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 font-bold shadow-sm'
                                                                    : 'bg-black/30 text-zinc-500 border-white/[0.02] hover:text-gray-350'
                                                            }`}
                                                        >
                                                            {shortcut.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Sliders className="w-4 h-4 text-emerald-400" /> 5. Schedule & Delivery Preferences
                                            </h4>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                                <button
                                                    type="button"
                                                    onClick={() => { setExcludeWeekends(!excludeWeekends); if (navigator.vibrate) navigator.vibrate(5); }}
                                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                                        excludeWeekends 
                                                            ? 'bg-emerald-950/15 text-emerald-300 border-emerald-500/30 shadow-lg' 
                                                            : 'bg-black/30 text-zinc-500 border-white/[0.02] hover:border-zinc-800 hover:text-zinc-400'
                                                    }`}
                                                >
                                                    <span className="text-xs font-bold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-500" /> Pause Weekends automatically</span>
                                                    <span className="text-[10px] text-zinc-500 block mt-1 leading-snug">Zero weekend deliveries. Pushes outstanding cycle credits forward.</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => { setEcoPackaging(!ecoPackaging); if (navigator.vibrate) navigator.vibrate(5); }}
                                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                                        ecoPackaging 
                                                            ? 'bg-emerald-950/15 text-emerald-300 border-emerald-500/30 shadow-lg' 
                                                            : 'bg-black/30 text-zinc-500 border-white/[0.02] hover:border-zinc-800 hover:text-zinc-400'
                                                    }`}
                                                >
                                                    <span className="text-xs font-bold flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-emerald-400" /> Eco Composting Tray</span>
                                                    <span className="text-[10px] text-zinc-500 block mt-1 leading-snug">Natural sugarcane compostable trays (+₹15/day). Safe for health & earth.</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Apple className="w-4 h-4 text-yellow-500" /> 6. Probiotic & Nutrition Boosters (Add-ons)
                                            </h4>
                                            
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {[
                                                    { id: 'juices', name: 'Cold-Pressed Green Juices', price: '₹99/day' },
                                                    { id: 'probiotic', name: 'Pure Milk Kefir', price: '₹59/day' },
                                                    { id: 'desserts', name: 'Fit Desserts', price: '₹40/day' }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => toggleAddOn(item.id)}
                                                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                                            addOns.includes(item.id) 
                                                                ? 'bg-emerald-950/20 text-emerald-300 border-emerald-500/40 shadow-md' 
                                                                : 'bg-black/30 text-zinc-500 border-white/[0.02] hover:border-zinc-800 hover:text-zinc-400'
                                                        }`}
                                                    >
                                                        <span className="text-xs font-bold block">{item.name}</span>
                                                        <span className="text-[10px] text-zinc-500 block mt-0.5">{item.price}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: LOGISTICS AREA, CONTACTS & TIMESLOTS */}
                                {stepperStep === 2 && (
                                    <div className="space-y-6 animate-fade-in">
                                        {/* SECTION 1: RECIPIENT CONTACT DETAILS */}
                                        <div className="bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-white/[0.03] space-y-4">
                                            <h4 className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <User className="w-4 h-4 text-orange-400" /> 1. Recipient Contact Details
                                            </h4>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                                <div className="relative font-sans">
                                                    <span className="text-[10px] text-zinc-500 block mb-1.5 uppercase tracking-wider font-bold">Recipient's Full Name</span>
                                                    <div className="relative">
                                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                                        <input 
                                                            type="text" 
                                                            value={userName}
                                                            onChange={e => {
                                                                setUserName(e.target.value);
                                                                if (checkoutError) setCheckoutError('');
                                                            }}
                                                            placeholder="e.g. Amit Kumar"
                                                            className="w-full bg-black/30 border border-white/10 rounded-2xl py-3 pl-11 pr-4 outline-none focus:border-[#FF7A00] text-sm text-white h-12"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="relative font-sans">
                                                    <span className="text-[10px] text-zinc-500 block mb-1.5 uppercase tracking-wider font-bold">WhatsApp Mobile Number</span>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                                        <input 
                                                            type="tel" 
                                                            value={userPhone}
                                                            onChange={e => {
                                                                setUserPhone(e.target.value);
                                                                if (checkoutError) setCheckoutError('');
                                                            }}
                                                            placeholder="e.g. 9876543210"
                                                            className="w-full bg-black/30 border border-white/10 rounded-2xl py-3 pl-11 pr-4 outline-none focus:border-[#FF7A00] text-sm text-white font-mono h-12"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-zinc-500 block leading-snug">
                                                🔒 Your contact details will only be used to send delivery coordinates, dynamic invoice updates, and a payment liaison link on WhatsApp.
                                            </span>
                                        </div>

                                        {/* SECTION 2: DELIVERY LOGISTICS */}
                                        <div className="bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-white/[0.03] space-y-4">
                                            <h4 className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-emerald-400" /> 2. Delivery Routing Logistics
                                            </h4>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <span className="text-[10px] text-zinc-500 block mb-1.5 uppercase tracking-wider font-bold">Delivery Area (Bangalore Zone)</span>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                                        <select 
                                                            value={userArea}
                                                            onChange={e => setUserArea(e.target.value)}
                                                            className="w-full bg-black/30 border border-white/10 rounded-2xl py-3 pl-11 pr-10 outline-none focus:border-[#FF7A00] text-xs text-white appearance-none h-12 cursor-pointer"
                                                        >
                                                            <option value="Kasavanahalli">Kasavanahalli</option>
                                                            <option value="Haralur Road">Haralur Road</option>
                                                            <option value="HSR Layout">HSR Layout</option>
                                                            <option value="Bellandur">Bellandur</option>
                                                            <option value="Sarjapur Road">Sarjapur Road</option>
                                                            <option value="Koramangala">Koramangala</option>
                                                            <option value="Electronic City">Electronic City</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <span className="text-[10px] text-zinc-500 block mb-1.5 uppercase tracking-wider font-bold">Preferred Time Slot</span>
                                                    <div className="relative">
                                                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                                        <select 
                                                            value={userTimeSlot}
                                                            onChange={e => setUserTimeSlot(e.target.value)}
                                                            className="w-full bg-black/30 border border-white/10 rounded-2xl py-3 pl-11 pr-10 outline-none focus:border-[#FF7A00] text-xs text-white appearance-none h-12 cursor-pointer"
                                                        >
                                                            <option value="morning">Morning (7:00 - 9:00 AM)</option>
                                                            <option value="lunch">Lunch hour (11:30 - 1:30 PM)</option>
                                                            <option value="dinner">Dinner (6:30 - 8:30 PM)</option>
                                                            <option value="split">Split Combo slots (Meal-wise)</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION 3: SPECIAL DIRECTIVES */}
                                        <div className="bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-white/[0.03] space-y-4">
                                            <h4 className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Sliders className="w-4 h-4 text-[#FF7A00]" /> 3. Special Kitchen Directives
                                            </h4>
                                            
                                            <textarea
                                                value={kitchenNotes}
                                                onChange={e => setKitchenNotes(e.target.value)}
                                                placeholder="List any ingredient skips, allergies (e.g. gluten-free, skip peanuts), spice preferences, or delivery instructions here..."
                                                rows={3}
                                                className="w-full bg-black/30 border border-white/10 rounded-2xl py-3.5 px-4 outline-none focus:border-[#FF7A00] text-sm text-white resize-none font-sans"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: ORDER REVIEW, PROMO CODES & whatsapp INITIATION */}
                                {stepperStep === 3 && (
                                    <div className="space-y-6 animate-fade-in">
                                        
                                        {/* Order Dispatch Details Summary Card */}
                                        <div className="bg-gradient-to-r from-zinc-900/50 to-black/80 p-5 rounded-2xl border border-emerald-500/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black block font-sans">ORDER FOR RECIPIENT</span>
                                                    <span className="text-sm font-bold text-white mt-0.5 block">{userName}</span>
                                                </div>
                                            </div>
                                            <div className="text-zinc-400 text-xs font-mono bg-white/[0.02] border border-white/5 px-3.5 py-2 rounded-xl flex flex-col items-start sm:items-end w-full sm:w-auto">
                                                <span className="text-[9px] text-zinc-500 uppercase font-sans tracking-wider block font-bold">WHATSAPP DIRECT CONTACT</span>
                                                <span className="text-emerald-400 font-bold font-mono mt-0.5">{userPhone}</span>
                                            </div>
                                        </div>

                                        {/* Your 100% Risk-Free Guarantee (CRO Driver) */}
                                        <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/[0.03] space-y-3 font-sans">
                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-widest border-b border-white/[0.05] pb-2">
                                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Your 100% Risk-Free Guarantee
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-zinc-400 leading-snug">
                                                <div className="flex items-start gap-2">
                                                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                    <span><strong>Pause / Postpone Anytime</strong>: Going on vacation? Just notify us via WhatsApp to put your days on hold.</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                    <span><strong>Pro-Rata Refunds</strong>: If you ever need to cancel, we refund 100% of your remaining un-delivered meals.</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                    <span><strong>Chef-Grade Purity</strong>: Cooked with premium organic oils. No MSG, no palm oil, and zero artificial coloring.</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                    <span><strong>Daily Fresh Sourcing</strong>: Farm-fresh vegetables and clean lean protein cooked fresh daily.</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Diagnostic Selection recap */}
                                        <div className="bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-white/[0.03] space-y-3 font-sans text-xs text-zinc-400">
                                            <div className="flex justify-between pb-2 border-b border-white/[0.03] items-center">
                                                <span className="font-bold text-white uppercase tracking-wider text-[10px]">Diagnostics Summary</span>
                                                <span className="text-[#FF7A00] font-black text-[11px] bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20">
                                                    {selectedPlanId === 'custom' ? 'CUSTOM BUILDER' : activeSelectedPlan.name.toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1">
                                                <div>
                                                    <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wide">DIETARY TYPE</span>
                                                    <span className="text-white font-bold flex items-center gap-1.5 mt-0.5 capitalize">🌿 {dietType}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wide">FREQUENCY</span>
                                                    <span className="text-white font-bold flex items-center gap-1.5 mt-0.5 capitalize">🍽️ {mealConfig} meals / day</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wide">HEALTH TARGET</span>
                                                    <span className="text-white font-bold flex items-center gap-1.5 mt-0.5 capitalize">⚡ {fitnessGoal}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wide">DURATION PERIOD</span>
                                                    <span className="text-white font-bold flex items-center gap-1.5 mt-0.5">📅 {finalPlanDays} Days</span>
                                                </div>
                                                {addOns.length > 0 && (
                                                    <div className="col-span-2 border-t border-white/[0.02] pt-2">
                                                        <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wide">INFUSED NUTRITION ADDONS</span>
                                                        <span className="text-emerald-400 font-bold text-[11px] mt-0.5 block">
                                                            {addOns.map(a => {
                                                                if (a === 'juices') return 'Cold-Pressed Green Juices';
                                                                if (a === 'probiotic') return 'Pure Milk Kefir';
                                                                if (a === 'desserts') return 'Fit Desserts';
                                                                return a;
                                                            }).join(' + ')}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="col-span-2 border-t border-white/[0.02] pt-2 flex flex-col sm:flex-row justify-between gap-1.5 text-[10px] text-zinc-500">
                                                    <span>Automatically Skip Weekends: <strong>{excludeWeekends ? 'Yes' : 'No'}</strong></span>
                                                    <span>Eco-friendly Sugarcane Trays: <strong>{ecoPackaging ? 'Yes' : 'No'}</strong></span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Consolidated Receipt Cost */}
                                        <div className="bg-zinc-900/40 p-5 rounded-2xl border border-white/[0.03] space-y-4">
                                            {/* Price-per-meal hero highlight */}
                                            <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-sans font-black">Conversion Highlight</span>
                                                    <span className="text-xs text-zinc-300 font-light font-sans mt-0.5">Price Per Meal Rate</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-black text-[#FF7A00] font-mono">₹{activeCalculatedPrice.perMeal}</span>
                                                    <span className="text-[10px] text-zinc-500 font-bold font-sans uppercase tracking-wider block leading-none">/ meal delivered</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2.5 pt-1">
                                                <div className="flex justify-between items-baseline text-zinc-500 text-xs font-sans">
                                                    <span>Base Subtotal ({mealConfig === 'single' ? '1 Meal' : mealConfig === 'double' ? '2 Meals' : '3 Meals'} daily):</span>
                                                    <span className="text-zinc-300 font-mono">₹{activeCalculatedPrice.originalTotal.toLocaleString()}</span>
                                                </div>
                                                {activeCalculatedPrice.savings > 0 && (
                                                    <div className="flex justify-between items-baseline text-orange-400 text-xs font-sans font-semibold">
                                                        <span>Duration Savings:</span>
                                                        <span className="font-mono">-₹{activeCalculatedPrice.savings.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-baseline pt-3 border-t border-white/[0.03] text-white">
                                                    <span className="text-sm font-semibold font-sans">Final Order Total ({finalPlanDays} Days):</span>
                                                    <span className="text-xl font-extrabold font-mono text-white">
                                                        ₹{activeCalculatedPrice.finalTotal.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Validation Error Banner */}
                            {checkoutError && (
                                <div className="mx-5 sm:mx-6 md:mx-8 mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-xs shrink-0 animate-fade-in shadow-md shadow-red-950/20">
                                    <Info className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                                    <div className="flex-grow">
                                        <p className="font-bold text-red-450 uppercase tracking-widest text-[10px]">Validation Required</p>
                                        <p className="text-zinc-400 font-light mt-0.5">{checkoutError}</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setCheckoutError('')}
                                        className="text-zinc-500 hover:text-white transition-colors cursor-pointer focus:outline-none"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Stepper Footer Action Bar */}
                            <div className="p-5 sm:p-6 border-t border-white/[0.03] bg-black/60 flex justify-between items-center gap-3 shrink-0">
                                {stepperStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStepperStep(prev => prev - 1);
                                            if (navigator.vibrate) navigator.vibrate(10);
                                        }}
                                        className="px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[44px]"
                                    >
                                        Back
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {stepperStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (stepperStep === 2) {
                                                const phoneCleaned = userPhone.trim().replace(/[\s\-\+\(\)]/g, '');
                                                const isPhoneValid = /^[6-9]\d{9}$/.test(phoneCleaned);
                                                if (!userName.trim()) {
                                                    setCheckoutError('Please enter the Recipient Name to proceed.');
                                                    if (stepperContentRef.current) {
                                                        stepperContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }
                                                    if (navigator.vibrate) navigator.vibrate([50, 50]);
                                                    return;
                                                }
                                                if (!userPhone.trim()) {
                                                    setCheckoutError('Please enter the WhatsApp Mobile Number.');
                                                    if (stepperContentRef.current) {
                                                        stepperContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }
                                                    if (navigator.vibrate) navigator.vibrate([50, 50]);
                                                    return;
                                                }
                                                if (!isPhoneValid) {
                                                    setCheckoutError('Please enter a valid 10-digit WhatsApp number (e.g. 9876543210).');
                                                    if (stepperContentRef.current) {
                                                        stepperContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }
                                                    if (navigator.vibrate) navigator.vibrate([50, 50]);
                                                    return;
                                                }
                                            }
                                            setCheckoutError('');
                                            setStepperStep(prev => prev + 1);
                                            if (navigator.vibrate) navigator.vibrate(15);
                                        }}
                                        className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        Continue <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <SmartButton
                                        label={isSubmittingCheckout ? "Preparing Liaison..." : "Confirm on WhatsApp"}
                                        variant="primary"
                                        icon={isSubmittingCheckout ? <Loader2 className="w-5 h-5 animate-spin" /> : <WhatsAppIcon className="w-5 h-5 text-white" />}
                                        disabled={isSubmittingCheckout}
                                        className="px-6 py-3.5 text-xs font-bold uppercase tracking-widest font-sans text-center flex justify-center shrink-0"
                                        onClick={handleExecuteCheckout}
                                    />
                                )}
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Mobile Floating Sticky Booking Bar (CRO Driver) */}
            {!checkoutModalOpen && (
                <div className="md:hidden fixed bottom-4 inset-x-4 z-[1000] animate-fade-in pointer-events-auto">
                    <div className="bg-zinc-950/95 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
                        <div className="flex flex-col pl-2">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-extrabold font-sans leading-none">
                                    {selectedPlanId === 'custom' ? 'Custom Studio Builder' : activeSelectedPlan.name}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-emerald-400 text-lg font-black font-sans leading-none">
                                    ₹{baseCalculatedPrice.perMeal}
                                </span>
                                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                                    /meal
                                </span>
                            </div>
                            <span className="text-[9px] text-zinc-500 font-medium font-sans mt-0.5 block leading-none">
                                Total ({finalPlanDays}d): ₹{baseCalculatedPrice.finalTotal.toLocaleString()}
                            </span>
                        </div>
                        
                        <button
                            onClick={() => {
                                if (navigator.vibrate) navigator.vibrate(15);
                                openCheckout(activeSelectedPlan.id);
                            }}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-4 py-2.5 sm:px-4.5 sm:py-3 rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] flex items-center gap-1 cursor-pointer focus:outline-none"
                        >
                            <span>Configure & Book</span>
                            <ArrowRight className="w-3 h-3 stroke-[3]" />
                        </button>
                    </div>
                </div>
            )}
        </section>

        {/* FLOATING ACTION BUTTON */}
        <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi Taazabites Nutrition Team! I'm interested in a custom meal plan and would like a consultation.\n\nMy current preferences:\n- Diet: ${dietType}\n- Goal: ${fitnessGoal}\n- Meals/Day: ${mealConfig}\n\nPlease help me choose the right plan for my metabolic needs!`)}`}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-6 right-6 z-[90] flex items-center gap-2 bg-[#25D366] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:-translate-y-1 hover:shadow-[0_6px_25px_rgba(37,211,102,0.6)] transition-all duration-300 font-sans font-black text-[10px] sm:text-xs uppercase tracking-wide cursor-pointer"
        >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-current" />
            </div>
            <span className="hidden sm:inline">Consult Nutritionist</span>
            <span className="inline sm:hidden">Consult</span>
        </a>

        <LocalCoverageFAQ />
        </>
    );
};

/* COMPONENT: PLAN CARD RE-FACTOR FOR EXTREME PRECISION */
interface PlanPresenterCardProps {
    plan: PlanTier;
    diet: DietType;
    goal: FitnessGoal;
    meals: MealConfig;
    pricing: ReturnType<typeof calculatePrice>;
    macros: ReturnType<typeof getMacros>;
    isSelected: boolean;
    onSelect: (openModal?: boolean) => void;
    onMealsChange: (meals: MealConfig) => void;
    onCompare?: () => void;
    isComparing?: boolean;
}

const TIER_BENEFITS: Record<string, { title: string; points: string[] }> = {
    weekly: {
        title: "Weekly Plan Health Advantages",
        points: [
            "Enjoy clean, healthy, and perfectly balanced food",
            "Perfect balance of protein and healthy carbs for natural energy",
            "Great portion control with fiber-rich complex carbs",
            "Perfect calorie count for a fresh start in just 5 days"
        ]
    },
    habit: {
        title: "Habit Plan Health Advantages",
        points: [
            "20 days of premium proteins to help muscle recovery and repair",
            "Keep your energy high with consistent, high-quality vegetarian proteins",
            "Natural hunger control and feeling full with healthy, clean fats",
            "Sustained natural energy levels preventing midday sluggishness"
        ]
    },
    lifestyle: {
        title: "Lifestyle Plan Health Advantages",
        points: [
            "Build long-term stamina and maintain a fit, healthy body composition",
            "Excellent support for long-term recovery with healthy fatty acids",
            "60 days of nutrient-rich meal variety for your body's wellness",
            "Healthy, long-term body fitness and sustainable wellness"
        ]
    }
};

const PlanPresenterCard: React.FC<PlanPresenterCardProps> = ({ 
    plan, 
    diet, 
    goal, 
    meals, 
    pricing, 
    macros, 
    isSelected, 
    onSelect,
    onMealsChange,
    onCompare,
    isComparing
}) => {
    const [showMacros, setShowMacros] = useState(false);
    const [showBenefits, setShowBenefits] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    useEffect(() => {
        if (isSelected) {
            setShowBenefits(true);
        }
    }, [isSelected]);

    // Calculate original price per meal for a premium high-conversion strikethrough effect
    const mealsCount = plan.days * (meals === 'single' ? 1 : meals === 'double' ? 2 : 3);
    const originalPerMeal = mealsCount > 0 ? Math.round(pricing.originalTotal / mealsCount) : pricing.perMeal;
    const hasDiscount = originalPerMeal > pricing.perMeal && pricing.savings > 0;

    // Plan tier specific ribbon/personality colors
    const tierTheme = useMemo(() => {
        if (plan.id === 'weekly') {
            return {
                border: isSelected ? 'border-amber-500' : 'border-amber-500/20 hover:border-amber-500/50',
                glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
                ribbon: 'from-amber-400 to-orange-500',
                badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            };
        }
        if (plan.id === 'habit') {
            return {
                border: isSelected ? 'border-emerald-500' : 'border-emerald-500/20 hover:border-emerald-500/50',
                glow: 'shadow-[0_0_35px_rgba(16,185,129,0.2)]',
                ribbon: 'from-emerald-400 to-teal-500',
                badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            };
        }
        return {
            border: isSelected ? 'border-orange-500' : 'border-white/[0.05] hover:border-orange-500/50',
            glow: 'shadow-[0_0_40px_rgba(255,122,0,0.2)]',
            ribbon: 'from-orange-400 to-rose-600',
            badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        };
    }, [plan.id, isSelected]);

    return (
        <motion.article 
            whileHover={isMobile ? {} : { y: -8, scale: isSelected ? 1.025 : 1.015 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={(e) => {
                // Ignore click if it originated from nested buttons, anchors or interactive selectors
                if (e.target instanceof HTMLElement && (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select'))) {
                    return;
                }
                if (!isSelected) {
                    onSelect(false);
                }
            }}
            className={`group relative flex flex-col h-full rounded-3xl overflow-hidden shadow-2xl border transition-all duration-500 select-none bg-zinc-950/80 backdrop-blur-md cursor-pointer ${
                isSelected 
                    ? `${tierTheme.border} ${tierTheme.glow} bg-gradient-to-b from-zinc-900/90 to-black/95 scale-[1.02]` 
                    : plan.isPopular 
                        ? 'border-orange-500/30 shadow-[0_15px_40px_-5px_rgba(255,122,0,0.12)] bg-gradient-to-b from-zinc-950/90 to-black/95 hover:border-orange-500/60' 
                        : `border-white/[0.03] hover:border-white/20 bg-gradient-to-b from-zinc-900/40 to-black/60`
            }`}
        >
            {/* Top decorative gradient bar reflecting plan personality */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${tierTheme.ribbon} shrink-0`} />

            {/* Popular overlay tag */}
            {plan.isPopular && (
                <div className="absolute inset-x-0 top-5 flex justify-center pointer-events-none z-20">
                    <div className="bg-gradient-to-r from-[#FF7A00] to-orange-600 text-black text-[10px] font-black uppercase tracking-widest px-4.5 py-1.5 rounded-full border border-white/20 shadow-[0_4px_15px_rgba(255,122,0,0.3)] shrink-0 flex items-center gap-1.5 animate-pulse">
                        <Award className="w-3.5 h-3.5 text-black fill-current" /> Most Popular Selection
                    </div>
                </div>
            )}

            <div className="relative w-full aspect-[16/10] shrink-0 overflow-hidden bg-zinc-950">
                <LazyImage src={plan.imageUrl} alt={plan.name} className="w-full h-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-700" wrapperClassName="w-full h-full aspect-[16/10]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-[3]" />
                
                {onCompare && (
                    <div className="absolute top-4 left-4 z-20">
                        <button
                            id={`btn-card-compare-${plan.id}`}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCompare();
                            }}
                            className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full border transition-all duration-300 cursor-pointer select-none focus:outline-none ${
                                isComparing 
                                    ? 'bg-orange-500 text-black border-orange-400 font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                                    : 'bg-black/65 text-zinc-300 border-white/10 hover:bg-black/85 hover:text-white'
                            }`}
                        >
                            <Scale className="w-3 h-3" /> {isComparing ? 'Comparing' : 'Compare'}
                        </button>
                    </div>
                )}

                {isSelected && (
                    <div className="absolute top-4 right-4 z-20">
                        <span className="flex items-center gap-1 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-400/20">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Selected
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4 sm:p-8 flex flex-col flex-grow relative z-10">
                {/* Meta details taglines */}
                <div className="flex justify-between items-center mb-3 sm:mb-4.5">
                    <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${tierTheme.badgeBg}`}>
                        {plan.tagline}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-zinc-400 font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-white/5 bg-white/5 font-mono">{plan.days} Days</span>
                </div>
                
                <h3 className="text-xl sm:text-3xl font-serif text-white tracking-tight mb-1.5 sm:mb-2 font-bold leading-tight">
                    {plan.name}
                </h3>
                <p className="text-zinc-400 text-[13px] sm:text-sm leading-relaxed font-light mb-4 sm:mb-5 min-h-[36px] sm:min-h-[40px] line-clamp-2">
                    {plan.description}
                </p>

                {/* Micro Confirmation Badges showing Diet Type & Meal config on the card */}
                <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-5">
                    <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/[0.03] text-zinc-300 border border-white/5 flex items-center gap-1">
                        <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${diet === 'veg' ? 'bg-emerald-500' : diet === 'eggitarian' ? 'bg-amber-400' : 'bg-red-500'}`} />
                        {diet === 'veg' ? 'Pure Veg' : diet === 'eggitarian' ? 'Eggitarian' : 'Non-Veg'}
                    </span>
                    <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/[0.03] text-zinc-300 border border-white/5 flex items-center gap-1">
                        🍽️ {meals === 'single' ? '1 Meal/day' : meals === 'double' ? '2 Meals/day' : '3 Meals/day'}
                    </span>
                </div>

                {/* Dynamic Social Proof & Urgency Tags (CRO Driver) */}
                {plan.id === 'weekly' && (
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-orange-400 font-sans font-bold bg-orange-500/10 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-orange-500/20 mb-4 sm:mb-5 self-start">
                        <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400 animate-pulse shrink-0" />
                        Only 4 promo slots left!
                    </div>
                )}
                {plan.id === 'habit' && (
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-emerald-400 font-sans font-bold bg-emerald-500/10 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-emerald-500/20 mb-4 sm:mb-5 self-start">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
                        93% choose this cycle
                    </div>
                )}
                {plan.id === 'lifestyle' && (
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-yellow-400 font-sans font-bold bg-yellow-500/10 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-yellow-500/20 mb-4 sm:mb-5 self-start">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 shrink-0" />
                        Saves ₹3,000+ monthly
                    </div>
                )}

                {/* Visual pricing stats */}
                <div className="flex flex-col border-b border-white/10 pb-4 sm:pb-5 mb-4 sm:mb-5">
                    <div className="flex items-baseline gap-1 mb-1 sm:mb-1.5">
                        <span className="text-lg sm:text-xl font-bold text-[#FF7A00] font-sans">₹</span>
                        <div className="flex items-baseline gap-1.5 sm:gap-2">
                            <span className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-none font-sans">
                                {pricing.perMeal}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm sm:text-base text-zinc-500 font-normal line-through font-mono">
                                    ₹{originalPerMeal}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">/ meal</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[11px] sm:text-sm mt-1 bg-white/[0.01] border border-white/[0.02] p-1.5 sm:p-2 rounded-xl">
                        <span className="font-light text-zinc-400 font-sans">
                            Total {plan.days}d: <strong className="text-white font-mono">₹{pricing.total.toLocaleString()}</strong>
                        </span>
                        {pricing.savings > 0 && (
                            <span className="text-emerald-400 font-black bg-emerald-950/40 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-emerald-500/20 text-[8px] sm:text-[9px] uppercase tracking-wider">
                                Save ₹{pricing.savings.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Estimated nutrition display - Collapsible */}
                <div className="pb-5 border-b border-white/[0.03] flex flex-col gap-2 text-xs font-sans text-zinc-500">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMacros(!showMacros);
                            if (navigator.vibrate) navigator.vibrate(8);
                        }}
                        className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all w-full cursor-pointer group/btn py-2.5 px-3.5 bg-white/[0.02] hover:bg-white/[0.05] active:scale-[0.98] rounded-xl border border-white/5 min-h-[44px] focus:outline-none select-none"
                    >
                        <span className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00] animate-pulse" /> Est. Daily Nutrition
                        </span>
                        <span className="text-[#FF7A00] font-black tracking-widest text-[10px] flex items-center gap-1">
                            {showMacros ? "Hide ▲" : "Reveal ▼"}
                        </span>
                    </button>
                    {showMacros && (
                        <div className="space-y-4 bg-black/60 border border-white/[0.03] rounded-2xl p-4 text-left text-[11px] font-sans text-zinc-400 animate-fade-in">
                            <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="flex flex-col p-1.5 rounded-xl bg-white/[0.02]">
                                    <span className="text-[8px] uppercase tracking-widest text-zinc-500 mb-0.5 leading-none">ENERGY</span>
                                    <span className="text-white font-bold font-mono text-xs">{macros.calories}k</span>
                                </div>
                                <div className="flex flex-col p-1.5 rounded-xl bg-emerald-950/20 border border-emerald-500/10">
                                    <span className="text-[8px] uppercase tracking-widest text-emerald-500/70 mb-0.5 leading-none">PRO</span>
                                    <span className="text-emerald-400 font-bold font-mono text-xs">{macros.protein}g</span>
                                </div>
                                <div className="flex flex-col p-1.5 rounded-xl bg-amber-950/20 border border-amber-500/10">
                                    <span className="text-[8px] uppercase tracking-widest text-amber-500/70 mb-0.5 leading-none">CARB</span>
                                    <span className="text-amber-400 font-bold font-mono text-xs">{macros.carbs}g</span>
                                </div>
                                <div className="flex flex-col p-1.5 rounded-xl bg-red-950/20 border border-red-500/10">
                                    <span className="text-[8px] uppercase tracking-widest text-red-500/70 mb-0.5 leading-none">FAT</span>
                                    <span className="text-red-400 font-bold font-mono text-xs">{macros.fats}g</span>
                                </div>
                            </div>
                            
                            {/* Visual Progress Indicators with Caloric Contribution Ratios */}
                            <div className="space-y-2.5 pt-2 border-t border-white/[0.03]">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-mono">
                                        <span className="text-emerald-400 font-semibold uppercase tracking-wider">PROTEIN POWER</span>
                                        <span className="text-zinc-500">{Math.round((macros.protein * 4 / (macros.calories || 1)) * 100)}% of energy</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                            style={{ width: `${Math.min(100, Math.round((macros.protein / 80) * 100))}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-mono">
                                        <span className="text-amber-400 font-semibold uppercase tracking-wider">FUEL CARBS</span>
                                        <span className="text-zinc-500">{Math.round((macros.carbs * 4 / (macros.calories || 1)) * 100)}% of energy</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                                            style={{ width: `${Math.min(100, Math.round((macros.carbs / 120) * 100))}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-mono">
                                        <span className="text-red-400 font-semibold uppercase tracking-wider">HEALTHY FATS</span>
                                        <span className="text-zinc-500">{Math.round((macros.fats * 9 / (macros.calories || 1)) * 100)}% of energy</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-red-500 rounded-full transition-all duration-500" 
                                            style={{ width: `${Math.min(100, Math.round((macros.fats * 9 / 300) * 100))}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Specific Tier Macro-Nutritional Benefits - Accordion */}
                <div className="pb-5 border-b border-white/[0.03] flex flex-col gap-2 text-xs font-sans text-zinc-500">
                    <button
                        id={`btn-benefits-${plan.id}`}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowBenefits(!showBenefits);
                            if (navigator.vibrate) navigator.vibrate(8);
                        }}
                        className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all w-full cursor-pointer group/btn py-2.5 px-3.5 bg-white/[0.02] hover:bg-white/[0.05] active:scale-[0.98] rounded-xl border border-white/5 min-h-[44px] focus:outline-none select-none"
                    >
                        <span className="flex items-center gap-2 font-bold">
                            <HeartPulse className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Show Benefits
                        </span>
                        <span className="text-emerald-400 font-black tracking-widest text-[10px] flex items-center gap-1">
                            {showBenefits ? "Hide ▲" : "Reveal ▼"}
                        </span>
                    </button>
                    {showBenefits && (
                        <div id={`benefits-content-${plan.id}`} className="space-y-2 bg-zinc-950/60 border border-white/[0.03] rounded-2xl p-4 text-[11px] font-sans text-zinc-400 animate-fade-in">
                            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-300 mb-1 border-b border-white/5 pb-1 flex items-center gap-1">
                                <span className="text-emerald-400">✨</span> {TIER_BENEFITS[plan.id]?.title || "Macro Advantages"}
                            </p>
                            <ul className="space-y-2">
                                {(TIER_BENEFITS[plan.id]?.points || []).map((point, idx) => (
                                    <li id={`benefit-item-${plan.id}-${idx}`} key={idx} className="flex items-start gap-2 leading-relaxed text-zinc-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom features checklist */}
            <div className="space-y-3 flex-grow mb-8 relative z-10 px-5 sm:px-8">
                {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        </div>
                        <span className="text-sm text-zinc-300 font-light leading-snug">{feature}</span>
                    </div>
                ))}
            </div>

            {/* Lock Choice button */}
            <div className="mt-auto border-t border-white/[0.03] p-4.5 bg-black/40">
                <SmartButton 
                    label={isSelected ? "Selected" : "Select & Configure"}
                    variant={isSelected ? 'accent' : plan.isPopular ? 'primary' : 'dark'}
                    icon={isSelected ? <CheckCircle2 className="w-5 h-5 text-black" /> : <ArrowRight className="w-5 h-5" />}
                    className={`w-full py-3.5 text-xs font-bold tracking-widest uppercase rounded-2xl ${
                        !plan.isPopular && !isSelected ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' : ''
                    }`}
                    onClick={(e) => {
                        e?.stopPropagation();
                        onSelect(true);
                    }}
                />
            </div>
        </motion.article>
    );
};

/* COMPONENT: INTERACTIVE SUBSCRIPTION SAVINGS & VALUE CALCULATOR FOR CRO */
const SavingsCalculator: React.FC = () => {
    const [mealsPerWeek, setMealsPerWeek] = useState(6);
    const [restaurantCost, setRestaurantCost] = useState(250);

    // Calculate metrics
    const weeklyRestaurantExpense = mealsPerWeek * restaurantCost;
    const weeklyTaazaExpense = mealsPerWeek * 199; // average discounted subscription cost per meal of Taazabites
    const weeklySavings = Math.max(0, weeklyRestaurantExpense - weeklyTaazaExpense);
    const monthlySavings = Math.round(weeklySavings * 4.34);
    const yearlySavings = monthlySavings * 12;
    
    // Time saved: assume 45 mins saved per meal (ordering, waiting, cooking, cleanup)
    const monthlyHoursSaved = Math.round((mealsPerWeek * 45 * 4.34) / 60);

    const handleClaimClick = () => {
        const target = document.getElementById('subscriptions');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            if (navigator.vibrate) navigator.vibrate(20);
        }
    };

    return (
        <div className="bg-[#0b0b0b] border border-white/[0.03] rounded-3xl p-6 sm:p-12 max-w-6xl mx-auto shadow-2xl relative overflow-hidden mt-16 font-sans">
            <div className="absolute top-0 right-0 p-8 text-white/[0.02] font-serif italic font-black pointer-events-none select-none text-8xl sm:text-9xl tracking-tighter z-0">SAVINGS</div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6">
                <div>
                    <span className="text-[#FF7A00] text-xs uppercase tracking-widest block mb-1 font-bold">SMART SUBSCRIPTION VALUE</span>
                    <h3 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
                        Interactive Savings & Purity Calculator
                    </h3>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-2 bg-emerald-950/20 px-4 py-2 rounded-full border border-emerald-500/10">
                    <Sparkles className="w-4 h-4 text-[#FF7A00] animate-pulse" /> 
                    Subscribing is cheaper & healthier than Swiggy/Zomato
                </span>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Sliders Column */}
                <div className="space-y-6">
                    {/* Slider 1: Meals per week */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <label className="text-sm font-semibold text-zinc-300">
                                How many meals do you order or eat out weekly?
                            </label>
                            <span className="text-[#FF7A00] font-bold text-sm bg-orange-500/10 px-3 py-1 rounded border border-orange-500/20 font-mono">
                                {mealsPerWeek} Meals
                            </span>
                        </div>
                        <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/[0.03] flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setMealsPerWeek(prev => Math.max(1, prev - 1))}
                                className="w-9 h-9 rounded-full bg-zinc-950 border border-white/10 hover:bg-zinc-900 text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input 
                                type="range" 
                                min="1" 
                                max="14" 
                                value={mealsPerWeek} 
                                onChange={e => setMealsPerWeek(Number(e.target.value))}
                                className="flex-grow h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ew-resize accent-orange-500"
                            />
                            <button
                                type="button"
                                onClick={() => setMealsPerWeek(prev => Math.min(14, prev + 1))}
                                className="w-9 h-9 rounded-full bg-zinc-950 border border-white/10 hover:bg-zinc-900 text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Slider 2: Average restaurant cost */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <label className="text-sm font-semibold text-zinc-300">
                                Average cost per meal on Swiggy / Zomato?
                            </label>
                            <span className="text-[#FF7A00] font-bold text-sm bg-orange-500/10 px-3 py-1 rounded border border-orange-500/20 font-mono">
                                ₹{restaurantCost}
                            </span>
                        </div>
                        <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/[0.03] flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setRestaurantCost(prev => Math.max(150, prev - 10))}
                                className="w-9 h-9 rounded-full bg-zinc-950 border border-white/10 hover:bg-zinc-900 text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input 
                                type="range" 
                                min="150" 
                                max="600" 
                                step="10"
                                value={restaurantCost} 
                                onChange={e => setRestaurantCost(Number(e.target.value))}
                                className="flex-grow h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-ew-resize accent-orange-500"
                            />
                            <button
                                type="button"
                                onClick={() => setRestaurantCost(prev => Math.min(600, prev + 10))}
                                className="w-9 h-9 rounded-full bg-zinc-950 border border-white/10 hover:bg-zinc-900 text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                            *Includes delivery charges, rain surges, restaurant GST, and platform fees.
                        </span>
                    </div>
                </div>

                {/* Metrics / Output Display Column */}
                <div className="bg-zinc-950/60 p-6 rounded-3xl border border-white/5 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Cost savings card */}
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/[0.02] flex flex-col justify-between">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Monthly Cash Saved</span>
                            <div className="my-2">
                                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                                    ₹{monthlySavings.toLocaleString()}
                                </span>
                            </div>
                            <span className="text-[10px] text-zinc-500">
                                Save ₹{yearlySavings.toLocaleString()}/year!
                            </span>
                        </div>

                        {/* Time savings card */}
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/[0.02] flex flex-col justify-between">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Time Reclaimed</span>
                            <div className="my-2">
                                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                                    {monthlyHoursSaved} Hrs
                                </span>
                            </div>
                            <span className="text-[10px] text-zinc-500">
                                Spent cooking or waiting
                            </span>
                        </div>
                    </div>

                    {/* Gamified Lifestyle Savings Equivalence Banner */}
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-orange-500/15 rounded-2xl p-4 text-xs">
                        <div className="flex items-start gap-2.5">
                            <span className="text-lg leading-none select-none shrink-0">
                                {monthlySavings >= 6000 ? "🏅" : monthlySavings >= 4000 ? "🥗" : monthlySavings >= 2000 ? "🥑" : "🥤"}
                            </span>
                            <div>
                                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block mb-0.5">Lifestyle Equivalent Value</span>
                                <p className="text-zinc-300 font-light leading-relaxed">
                                    {monthlySavings >= 6000 
                                        ? "Equivalent to 1.5 free weeks of gourmet nutrition food or a premium Cult.fit Gym Pass!" 
                                        : monthlySavings >= 4000 
                                        ? "Equivalent to 1 full week of completely free gourmet nutritional lunches!" 
                                        : monthlySavings >= 2000 
                                        ? "Equivalent to 4 free delicious high-protein diet lunches every single month!" 
                                        : "Equivalent to saving enough for multiple healthy smoothies or a premium supplement pack!"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Compare Table */}
                    <div className="space-y-2 border-t border-white/[0.05] pt-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Weekly Restaurant Food:</span>
                            <span className="text-zinc-300 font-mono font-medium line-through">₹{weeklyRestaurantExpense.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Weekly Taazabites Subscription:</span>
                            <span className="text-[#FF7A00] font-mono font-bold">₹{weeklyTaazaExpense.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-dashed border-white/10">
                            <span className="text-white">Your Net Monthly Savings:</span>
                            <span className="text-emerald-400 font-mono text-base">₹{monthlySavings.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* CTA button */}
                    <button
                        onClick={handleClaimClick}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-[#FF7A00] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 hover:brightness-110 cursor-pointer border border-white/5 font-sans"
                    >
                        Claim My Diet Plan (Save 20% Now)
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

/* COMPONENT: DYNAMIC SUBSCRIPTION LOGISTICS & OPERATIONS FAQ SECTION */
const SubscriptionLogisticsFaq: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pauses' | 'timings' | 'address' | 'freshness'>('pauses');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const tabs = [
        { id: 'pauses' as const, label: 'Hold & Pauses', icon: Calendar, description: 'Manage vacations & plans' },
        { id: 'timings' as const, label: 'Delivery Timings', icon: Clock, description: 'Real-time schedule blocks' },
        { id: 'address' as const, label: 'Address & Routes', icon: MapPin, description: 'Shift locations instantly' },
        { id: 'freshness' as const, label: 'Freshness & Cold Chain', icon: ShieldCheck, description: 'Thermal isolation standards' }
    ];

    const faqData = {
        pauses: [
            {
                q: "How do I pause my subscription if I travel?",
                a: "Simply send a pause request to our dedicated WhatsApp concierge line. With a 12-hour warning buffer (before 6 PM the previous day), we will freeze your deliveries. Your paid days are fully protected and roll over indefinitely.",
                interactiveElement: 'pauses-timeline'
            },
            {
                q: "Is there a limit on how many times I can pause?",
                a: "No! We offer completely unlimited skips and pauses. Whether you travel for a weekend or pause for a 2-week vacation, your subscription credits never expire and resume exactly when you say so.",
                interactiveElement: 'none'
            },
            {
                q: "What is the cutoff time to pause the next day's meal?",
                a: "Our logistics team schedules raw ingredient procurement and fresh prep with strict schedules. The cutoff is 6:00 PM the previous evening. Any pause received after 6:00 PM will apply to the day after next.",
                interactiveElement: 'none'
            }
        ],
        timings: [
            {
                q: "What are the daily delivery time slots?",
                a: "We operate three precise delivery slots in Bengaluru: Breakfast is delivered between 7:00 AM and 9:00 AM, Lunch between 11:30 AM and 1:30 PM, and Dinner between 6:30 PM and 8:30 PM.",
                interactiveElement: 'timings-schedule'
            },
            {
                q: "Can I receive all my daily meals together in the morning?",
                a: "Yes! If you prefer absolute convenience and want all 2 or 3 meals delivered together, we can pack and dispatch them in our special morning thermal bag. Simply let our WhatsApp concierge know your preference.",
                interactiveElement: 'none'
            },
            {
                q: "Do you deliver on weekends and public holidays?",
                a: "By default, our standard subscription packages run Monday to Friday (or Monday to Saturday depending on your choice). On Sundays, our kitchen is closed for deep sanitization. If a holiday falls mid-cycle, you can choose to skip or receive delivery.",
                interactiveElement: 'none'
            }
        ],
        address: [
            {
                q: "Can I deliver to my office during the day and home at night?",
                a: "Absolutely. Many of our active tech subscribers receive their lunch at their workspace (e.g. RMZ Ecoworld, Manyata Tech Park) and dinner at their residential gated community. We coordinate this transition effortlessly.",
                interactiveElement: 'address-whatsapp'
            },
            {
                q: "How do I change my delivery address mid-subscription?",
                a: "Just drop a quick text on WhatsApp to our support team with your new GPS coordinates or Google Maps link. As long as it's within our active Bengaluru delivery zones, we'll route it starting the very next slot.",
                interactiveElement: 'none'
            }
        ],
        freshness: [
            {
                q: "How are meals kept fresh during delivery in Bangalore traffic?",
                a: "We never use standard plastic bags. All meals are placed in state-of-the-art double-walled thermal insulation bags along with high-performance non-toxic frozen gel packs. This maintains a sterile cold chain environment below 6°C during transit.",
                interactiveElement: 'freshness-spec'
            },
            {
                q: "Can I microwave the containers directly?",
                a: "Yes! Our premium eco-friendly food containers are 100% microwave-safe and heat-stable up to 140°C. They are also completely free of chemical linings, ensuring zero microplastic transfer into your hot food.",
                interactiveElement: 'none'
            }
        ]
    };

    const currentFaqs = faqData[activeTab];

    return (
        <div id="logistics-faq" className="bg-[#0b0b0b] border border-white/[0.03] rounded-3xl p-6 sm:p-12 max-w-6xl mx-auto shadow-2xl relative overflow-hidden mt-20 font-sans">
            <div className="absolute top-0 right-0 p-8 text-white/[0.02] font-serif italic font-black pointer-events-none select-none text-8xl sm:text-9xl tracking-tighter">LOGISTICS</div>
            
            <div className="text-center md:text-left mb-10 border-b border-white/5 pb-6">
                <span className="text-[#FF7A00] text-xs uppercase tracking-widest block mb-1 font-bold">100% FLEXIBLE OPERATION MODULES</span>
                <h3 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
                    Subscription Logistics & Delivery Concierge
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm font-light mt-2 max-w-2xl">
                    Our subscription plans are designed to fit your busy lifestyle. Pause, shift timings, or change locations in real-time with zero friction.
                </p>
            </div>

            {/* Layout Grid */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Tabs Panel (Left column on large screens) */}
                <div className="lg:col-span-4 space-y-3">
                    {tabs.map((tab) => {
                        const TabIcon = tab.icon;
                        const isSelected = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setOpenFaqIndex(0); // auto open first FAQ in the new tab
                                    if (navigator.vibrate) navigator.vibrate(12);
                                }}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 focus:outline-none cursor-pointer group ${
                                    isSelected 
                                        ? 'bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/30 text-white shadow-[0_4px_20px_rgba(255,122,0,0.05)]' 
                                        : 'bg-zinc-900/20 border-white/[0.03] text-zinc-400 hover:bg-zinc-900/40 hover:text-white hover:border-white/10'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                                    isSelected 
                                        ? 'bg-orange-500 text-black border-orange-400/30' 
                                        : 'bg-zinc-950 border-white/5 group-hover:border-white/20 text-zinc-400'
                                }`}>
                                    <TabIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold tracking-wide font-sans">{tab.label}</h4>
                                    <p className="text-[10px] text-zinc-500 font-light mt-0.5">{tab.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area (FAQs and dynamic visual display) */}
                <div className="lg:col-span-8 grid lg:grid-cols-12 gap-6">
                    
                    {/* FAQ Items (Col-span-7) */}
                    <div className="lg:col-span-7 space-y-3.5 bg-zinc-950/60 p-5 rounded-3xl border border-white/5">
                        {currentFaqs.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <div key={index} className="border-b border-white/[0.03] last:border-0 pb-3.5 last:pb-0">
                                    <button
                                        onClick={() => {
                                            setOpenFaqIndex(isOpen ? null : index);
                                            if (navigator.vibrate) navigator.vibrate(8);
                                        }}
                                        className="w-full flex justify-between items-start text-left py-2.5 min-h-[44px] group focus:outline-none cursor-pointer"
                                    >
                                        <div className="flex gap-3 pr-2">
                                            <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md mt-0.5 font-mono shrink-0 ${
                                                isOpen ? 'bg-orange-500/20 text-orange-400 border border-orange-500/10' : 'bg-zinc-900 text-zinc-500 border border-white/5'
                                            }`}>
                                                Q{index + 1}
                                            </span>
                                            <span className={`text-xs sm:text-sm font-semibold tracking-wide transition-colors ${
                                                isOpen ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'
                                            }`}>
                                                {faq.q}
                                            </span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-zinc-500 mt-1 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-orange-400' : ''}`} />
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light pl-11 pr-2 pb-2.5 pt-1 font-sans">
                                                    {faq.a}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Dynamic Visual Aid Display Panel (Col-span-5) */}
                    <div className="lg:col-span-5 bg-[#121212] rounded-3xl p-5 border border-white/[0.04] flex flex-col justify-between min-h-[280px]">
                        
                        {/* Tab 1: Pauses and holds visualization */}
                        {activeTab === 'pauses' && (
                            <div className="flex flex-col h-full justify-between animate-fade-in space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Hold/Pause Simulation</span>
                                        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Credits Safe</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white font-serif">Credit Rollover Tracker</h4>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed">Your paid subscription days never expire when paused. Check the rollover mechanic below:</p>
                                </div>

                                <div className="space-y-2.5 bg-black/40 p-3 rounded-2xl border border-white/5 text-[11px]">
                                    <div className="flex justify-between items-center text-zinc-400 pb-1.5 border-b border-white/5">
                                        <span>Current Sub Cycle:</span>
                                        <span className="text-white font-semibold font-mono">20 Days Plan</span>
                                    </div>
                                    <div className="flex justify-between items-center text-zinc-400 font-bold">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Planned Vacation:
                                        </span>
                                        <span className="text-orange-400 font-mono font-bold">Paused (5 Days)</span>
                                    </div>
                                    <div className="flex justify-between items-center text-zinc-400 font-bold border-t border-dashed border-white/10 pt-1.5 mt-1.5 text-xs">
                                        <span className="text-white">New Expiry Extension:</span>
                                        <span className="text-emerald-400 font-mono font-bold">+5 Extra Days</span>
                                    </div>
                                </div>

                                <div className="text-[10px] text-zinc-500 italic bg-white/[0.01] p-2.5 rounded-xl border border-white/[0.02] text-center">
                                    ⚡ 100% automated credit restoration on resume.
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Timings visualization */}
                        {activeTab === 'timings' && (
                            <div className="flex flex-col h-full justify-between animate-fade-in space-y-4">
                                <div className="space-y-2">
                                    <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest block">Daily Slot Schedule</span>
                                    <h4 className="text-sm font-bold text-white font-serif">Precision Dispatch Block</h4>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed">Meals are cooked, packed under strict medical safety, and dispatched instantly:</p>
                                </div>

                                <div className="space-y-2">
                                    {[
                                        { meal: 'Breakfast Slot', time: '7:00 AM - 9:00 AM', status: 'Live Dispatch', color: 'bg-orange-500' },
                                        { meal: 'Lunch Slot', time: '11:30 AM - 1:30 PM', status: 'On-Time Route', color: 'bg-emerald-500' },
                                        { meal: 'Dinner Slot', time: '6:30 PM - 8:30 PM', status: 'Evening Prep', color: 'bg-blue-400' }
                                    ].map((slot, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/5 text-[11px]">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${slot.color}`} />
                                                <span className="text-zinc-300 font-bold">{slot.meal}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-mono font-semibold">{slot.time}</div>
                                                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">{slot.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-[10px] text-zinc-500 italic bg-white/[0.01] p-2.5 rounded-xl border border-white/[0.02] text-center">
                                    🚚 Heat-insulated thermal bags guarantee optimal temp.
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Address updates visualization */}
                        {activeTab === 'address' && (
                            <div className="flex flex-col h-full justify-between animate-fade-in space-y-4">
                                <div className="space-y-2">
                                    <span className="text-[10px] text-[#059669] font-bold uppercase tracking-widest block">WhatsApp Concierge Service</span>
                                    <h4 className="text-sm font-bold text-white font-serif">Instant Route Redirection</h4>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed">Send a quick WhatsApp text to our active delivery assistant to change routes mid-cycle:</p>
                                </div>

                                <div className="bg-[#075E54]/10 border border-[#128C7E]/20 rounded-2xl p-3 space-y-2 text-[11px] font-sans relative">
                                    {/* Whatsapp Simulated Bubble 1 */}
                                    <div className="bg-[#202c33] text-zinc-300 p-2 rounded-lg rounded-tl-none max-w-[85%] border border-white/5 text-[10.5px]">
                                        <span className="text-emerald-400 font-semibold block text-[9px] uppercase tracking-wider mb-0.5">YOU (SUBSCRIBER)</span>
                                        "Hey! Delivering to my office today at RMZ Ecoworld. Can we shift lunch there?"
                                    </div>
                                    {/* Whatsapp Simulated Bubble 2 */}
                                    <div className="bg-[#005c4b] text-white p-2 rounded-lg rounded-tr-none max-w-[85%] ml-auto text-[10.5px] border border-emerald-500/10">
                                        <span className="text-amber-400 font-semibold block text-[9px] uppercase tracking-wider mb-0.5">TAAZABITES CONCIERGE</span>
                                        "Sure, Amit! Shifted to RMZ, Tower 4B. Delivery rider will arrive by 12:45 PM. Enjoy!"
                                    </div>
                                </div>

                                <div className="text-[10px] text-zinc-500 italic bg-white/[0.01] p-2.5 rounded-xl border border-white/[0.02] text-center">
                                    💬 Average support response window: &lt; 4 minutes.
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Packaging and Freshness visualization */}
                        {activeTab === 'freshness' && (
                            <div className="flex flex-col h-full justify-between animate-fade-in space-y-4">
                                <div className="space-y-2">
                                    <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest block">Biological Integrity</span>
                                    <h4 className="text-sm font-bold text-white font-serif">Thermal Isolation Specs</h4>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed">Our advanced cold-chain and packaging structure keeps nutrition intact:</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 space-y-1">
                                        <span className="text-[9px] text-[#059669] font-bold uppercase tracking-wider block">Eco Bagasse</span>
                                        <p className="text-zinc-400 font-light leading-snug">Sugarcane trays, compostable, 100% microwave-safe, zero plastic toxin leakage.</p>
                                    </div>
                                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 space-y-1">
                                        <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider block">Gel-Pack Chilled</span>
                                        <p className="text-zinc-400 font-light leading-snug">Maintains core meals transit temperature under 6°C to prevent bacteria growth.</p>
                                    </div>
                                </div>

                                <div className="text-[10px] text-zinc-500 italic bg-white/[0.01] p-2.5 rounded-xl border border-white/[0.02] text-center">
                                    🍃 Sustainable packaging degrades in exactly 90 days.
                                </div>
                            </div>
                        )}
                        
                    </div>

                </div>

            </div>

            {/* Quick Contact CTA */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-xs text-zinc-500 font-light text-center sm:text-left flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    Have specific custom logistic questions? Our active Whatsapp support desk is available 24/7.
                </span>
                <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Taazabites!%20I%20have%20questions%20about%20my%20subscription%20logistics.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 text-xs font-black uppercase tracking-wider hover:bg-[#25D366]/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366] fill-current" /> Chat on WhatsApp
                </a>
            </div>
        </div>
    );
};


/* COMPONENT: INTERACTIVE 'MEAL PREFERENCE QUIZ' */
interface MealPreferenceQuizProps {
    currentDiet: DietType;
    currentGoal: FitnessGoal;
    currentMeals: MealConfig;
    currentPlanId: string | null;
    onApplyRecommendations: (recommendation: {
        diet: DietType;
        goal: FitnessGoal;
        meals: MealConfig;
        planId: string;
        days: number;
    }) => void;
    onClose: () => void;
}

const MealPreferenceQuiz: React.FC<MealPreferenceQuizProps> = ({
    currentDiet,
    currentGoal,
    currentMeals,
    currentPlanId,
    onApplyRecommendations,
    onClose
}) => {
    const [step, setStep] = useState<number>(1);
    const [selectedGoal, setSelectedGoal] = useState<FitnessGoal>(currentGoal || 'balanced');
    const [selectedDiet, setSelectedDiet] = useState<DietType>(currentDiet || 'veg');
    const [selectedMeals, setSelectedMeals] = useState<MealConfig>(currentMeals || 'single');
    const [selectedPlanId, setSelectedPlanId] = useState<string>(currentPlanId || 'habit');

    // Goals options
    const goals = [
        {
            id: 'deficit' as const,
            label: 'Calorie Deficit & Fat Loss',
            desc: 'Sustainably drop body fat and improve definition with calorie-controlled, fiber-rich meals.',
            icon: Flame,
            color: 'text-orange-500 border-orange-500/25 bg-orange-500/5 hover:border-orange-500/40',
            bgGlow: 'bg-orange-500/10'
        },
        {
            id: 'hypertrophy' as const,
            label: 'Clean Muscle Hypertrophy',
            desc: 'Optimize protein intake and clean complex carbs to fuel intense training and build lean tissue.',
            icon: Dumbbell,
            color: 'text-emerald-500 border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/40',
            bgGlow: 'bg-emerald-500/10'
        },
        {
            id: 'keto' as const,
            label: 'Therapeutic Keto Clean',
            desc: 'High-fat, moderate protein, and ultra-low carbohydrates to activate fat-burning ketosis.',
            icon: Droplet,
            color: 'text-purple-500 border-purple-500/25 bg-purple-500/5 hover:border-purple-500/40',
            bgGlow: 'bg-purple-500/10'
        },
        {
            id: 'balanced' as const,
            label: 'Sustained Energy & Vitality',
            desc: 'Balanced, organic diet loaded with micronutrients to prevent afternoon slumps and keep you sharp.',
            icon: HeartPulse,
            color: 'text-blue-500 border-blue-500/25 bg-blue-500/5 hover:border-blue-500/40',
            bgGlow: 'bg-blue-500/10'
        }
    ];

    // Diet options
    const diets = [
        {
            id: 'veg' as const,
            label: '100% Pure Vegetarian',
            desc: 'Rich green leaf proteins, custom-spiced organic paneer, and high-fiber wholesome grains.',
            icon: Leaf,
            badge: '🥦 Clean Green Base'
        },
        {
            id: 'eggitarian' as const,
            label: 'Balanced Eggitarian',
            desc: 'Premium vegetarian dishes enhanced with nutrient-rich free-range pasteurized farm eggs.',
            icon: Activity,
            badge: '🍳 High Bioavailability'
        },
        {
            id: 'nonVeg' as const,
            label: 'Premium Non-Vegetarian',
            desc: 'Clean, lean chicken breast, fresh seasonal fish fillets, and high-protein egg preparations.',
            icon: Flame,
            badge: '🍗 100% Halal Sourced'
        }
    ];

    // Meals per day options
    const mealsConfigs = [
        {
            id: 'single' as const,
            label: 'Single Meal / Day',
            desc: 'One premium box delivered daily. Ideal for an office lunch or a convenient healthy dinner.',
            badge: '🍽️ Lunch OR Dinner'
        },
        {
            id: 'double' as const,
            label: 'Dual Power Combo (2 Meals)',
            desc: 'Two nutrient-dense meals per day. Perfect for full lunch & dinner fuel, skipping home prep.',
            badge: '🍱 Lunch + Dinner (Save 10%)'
        },
        {
            id: 'triple' as const,
            label: 'Triple Full Fuel (3 Meals)',
            desc: 'Breakfast, lunch, and dinner. Complete meal coverage with zero stress and maximum routine.',
            badge: '🥞 Whole Day Cycle (Save 16%)'
        }
    ];

    // Commitment plans
    const plansList = [
        {
            id: 'weekly',
            days: 5,
            label: '5-Day Trial Plan',
            desc: 'Low commitment, high taste. Test out our portion sizes, textures, and delivery schedules first.',
            badge: 'Beginner Friendly'
        },
        {
            id: 'habit',
            days: 20,
            label: '20-Day Habit Plan',
            desc: 'The best way to build a habit. Establish consistent healthy eating patterns and see great, visible results.',
            badge: 'Best Value & Most Popular',
            popular: true
        },
        {
            id: 'lifestyle',
            days: 60,
            label: '60-Day Lifestyle Cycle',
            desc: 'A complete lifestyle change. Premium fresh ingredients, maximum savings, and personalized nutritionist support.',
            badge: 'Ultimate Transformation'
        }
    ];

    const handleSelectGoal = (goal: FitnessGoal) => {
        setSelectedGoal(goal);
        if (navigator.vibrate) navigator.vibrate(10);
        setTimeout(() => setStep(2), 350);
    };

    const handleSelectDiet = (diet: DietType) => {
        setSelectedDiet(diet);
        if (navigator.vibrate) navigator.vibrate(10);
        setTimeout(() => setStep(3), 350);
    };

    const handleSelectMeals = (meals: MealConfig) => {
        setSelectedMeals(meals);
        if (navigator.vibrate) navigator.vibrate(10);
        setTimeout(() => setStep(4), 350);
    };

    const handleSelectPlan = (planId: string) => {
        setSelectedPlanId(planId);
        if (navigator.vibrate) navigator.vibrate(10);
        setTimeout(() => setStep(5), 350);
    };

    // Recommended plan days
    const chosenPlan = plansList.find(p => p.id === selectedPlanId) || plansList[1];
    const days = chosenPlan.days;

    // Call actual functions from parent scope
    const pricing = calculatePrice(days, selectedDiet, selectedMeals, selectedGoal, [], false, false);
    const macros = getMacros(selectedDiet, selectedMeals, selectedGoal);

    const handleApply = () => {
        if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
        onApplyRecommendations({
            diet: selectedDiet,
            goal: selectedGoal,
            meals: selectedMeals,
            planId: selectedPlanId,
            days: days
        });
    };

    // Step titles & descriptions
    const stepMetadata = [
        { title: "Choose Your Primary Fitness Goal", desc: "Select what you want to achieve with your fresh meals." },
        { title: "Choose Your Dietary Preference", desc: "We customize our clean kitchens to match your food preferences." },
        { title: "Select Daily Meal Count", desc: "How many healthy meal boxes do you want delivered to you each day?" },
        { title: "Select Your Plan Duration", desc: "Longer durations help build consistent healthy habits and save you more." },
        { title: "Your Personalized Meal Plan Match", desc: "We've analyzed your preferences and designed the perfect meal subscription for you." }
    ];

    if (typeof window === 'undefined' || typeof document === 'undefined' || !document.body) {
        return null;
    }

    return createPortal(
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] overflow-y-auto bg-black/98 backdrop-blur-xl p-4 sm:p-6 md:p-8 font-sans"
        >
            <div className="min-h-full flex items-center justify-center w-full">
                <div className="w-full max-w-4xl bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] relative my-8 flex flex-col shrink-0">
                {/* Neon Orange Decorative Border Ring */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF7A00] via-amber-400 to-emerald-500" />
                
                {/* Background ambient radial circle */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-white/[0.04] flex justify-between items-center relative z-10 bg-zinc-950/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-950/20">
                            <Sparkles className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold font-serif text-white tracking-tight">1-Minute Meal Preference Quiz</h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-medium mt-0.5">Taazabites Precision Nutrition</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/10 hover:bg-zinc-800 transition-all cursor-pointer focus:outline-none"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress Indicators */}
                <div className="px-6 sm:px-8 py-4 bg-zinc-950/30 border-b border-white/[0.03] flex items-center justify-between text-xs font-mono relative z-10 overflow-x-auto gap-2">
                    <div className="flex items-center gap-2.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} className="flex items-center gap-1.5 animate-fade-in">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all border ${
                                    step === s
                                        ? 'bg-orange-500 text-black border-orange-400 font-bold scale-110 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                                        : step > s
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-medium'
                                        : 'bg-zinc-900/50 text-zinc-600 border-white/5 font-light'
                                }`}>
                                    {s === 5 ? '✓' : s}
                                </span>
                                <span className={`text-[10px] uppercase font-bold tracking-wider shrink-0 ${step === s ? 'text-white' : 'text-zinc-600'}`}>
                                    {s === 1 ? 'Goal' : s === 2 ? 'Diet' : s === 3 ? 'Meals' : s === 4 ? 'Cycle' : 'Result'}
                                </span>
                                {s < 5 && <span className="text-zinc-800 font-light mx-0.5">•</span>}
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider shrink-0 bg-zinc-900 px-2 py-1 rounded border border-white/5 font-mono">
                        Step {step} of 5
                    </span>
                </div>

                {/* Step Metadata Header */}
                <div className="px-6 sm:px-8 pt-6 sm:pt-8 text-center sm:text-left">
                    <h4 className="text-lg sm:text-xl font-serif text-white tracking-tight font-medium">
                        {stepMetadata[step - 1].title}
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-400 font-light mt-1.5 max-w-2xl leading-relaxed">
                        {stepMetadata[step - 1].desc}
                    </p>
                </div>

                {/* Interactive Body */}
                <div className="p-6 sm:p-8 relative z-10 min-h-[340px] flex flex-col justify-between">
                    
                    {/* Animated Step Loader */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.25 }}
                            className="w-full h-full flex-grow"
                        >
                            {/* Step 1: Goal Select */}
                            {step === 1 && (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {goals.map((g) => {
                                        const GoalIcon = g.icon;
                                        const isSelected = selectedGoal === g.id;
                                        return (
                                            <button
                                                key={g.id}
                                                onClick={() => handleSelectGoal(g.id)}
                                                className={`p-5 rounded-3xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group focus:outline-none min-h-[120px] ${
                                                    isSelected
                                                        ? 'bg-zinc-900 border-orange-500 shadow-[0_4px_30px_rgba(249,115,22,0.06)]'
                                                        : 'bg-zinc-900/30 border-white/5 hover:border-white/15 hover:bg-zinc-900/50'
                                                }`}
                                            >
                                                {/* Decorative background circle */}
                                                <div className={`absolute -bottom-10 -right-10 w-28 h-28 rounded-full blur-[30px] transition-opacity duration-500 ${
                                                    isSelected ? g.bgGlow + ' opacity-100' : 'bg-transparent opacity-0 group-hover:opacity-100'
                                                }`} />

                                                <div className="flex gap-4 relative z-10">
                                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                                                        isSelected
                                                            ? 'bg-orange-500 text-black border-orange-400'
                                                            : 'bg-zinc-950 border-white/5 group-hover:border-white/10 text-zinc-400'
                                                    }`}>
                                                        <GoalIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
                                                            {g.label}
                                                            {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                                                        </h5>
                                                        <p className="text-[11px] text-zinc-400 font-light mt-1.5 leading-relaxed pr-2">
                                                            {g.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Step 2: Diet Select */}
                            {step === 2 && (
                                <div className="space-y-3.5">
                                    {diets.map((d) => {
                                        const DietIcon = d.icon;
                                        const isSelected = selectedDiet === d.id;
                                        return (
                                            <button
                                                key={d.id}
                                                onClick={() => handleSelectDiet(d.id)}
                                                className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group focus:outline-none flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                                                    isSelected
                                                        ? 'bg-zinc-900 border-emerald-500/60 shadow-[0_4px_25px_rgba(16,185,129,0.04)]'
                                                        : 'bg-zinc-900/30 border-white/5 hover:border-white/15 hover:bg-zinc-900/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                                                        isSelected
                                                            ? 'bg-emerald-500 text-black border-emerald-400'
                                                            : 'bg-zinc-950 border-white/5 group-hover:border-white/10 text-zinc-400'
                                                    }`}>
                                                        <DietIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-bold tracking-wide text-white flex items-center gap-1.5">
                                                            {d.label}
                                                            {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                                                        </h5>
                                                        <p className="text-[11px] text-zinc-400 font-light mt-1 leading-relaxed">
                                                            {d.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 border select-none self-start sm:self-center ${
                                                    isSelected
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-zinc-900 text-zinc-500 border-white/5'
                                                }`}>
                                                    {d.badge}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Step 3: Meal Config Select */}
                            {step === 3 && (
                                <div className="space-y-3.5">
                                    {mealsConfigs.map((m) => {
                                        const isSelected = selectedMeals === m.id;
                                        return (
                                            <button
                                                key={m.id}
                                                onClick={() => handleSelectMeals(m.id)}
                                                className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group focus:outline-none flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                                                    isSelected
                                                        ? 'bg-zinc-900 border-orange-500/60 shadow-[0_4px_25px_rgba(249,115,22,0.04)]'
                                                        : 'bg-zinc-900/30 border-white/5 hover:border-white/15 hover:bg-zinc-900/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-mono font-black transition-all ${
                                                        isSelected
                                                            ? 'bg-orange-500 text-black border-orange-400'
                                                            : 'bg-zinc-950 border-white/5 group-hover:border-white/10 text-zinc-400 text-sm'
                                                    }`}>
                                                        {m.id === 'single' ? '1' : m.id === 'double' ? '2' : '3'}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-bold tracking-wide text-white flex items-center gap-1.5">
                                                            {m.label}
                                                            {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                                                        </h5>
                                                        <p className="text-[11px] text-zinc-400 font-light mt-1 leading-relaxed">
                                                            {m.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 border select-none self-start sm:self-center ${
                                                    isSelected
                                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                        : 'bg-zinc-900 text-zinc-500 border-white/5'
                                                }`}>
                                                    {m.badge}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Step 4: Duration Select */}
                            {step === 4 && (
                                <div className="space-y-3.5">
                                    {plansList.map((p) => {
                                        const isSelected = selectedPlanId === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => handleSelectPlan(p.id)}
                                                className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden group focus:outline-none flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                                                    isSelected
                                                        ? 'bg-zinc-900 border-orange-500/60 shadow-[0_4px_25px_rgba(249,115,22,0.04)]'
                                                        : 'bg-zinc-900/30 border-white/5 hover:border-white/15 hover:bg-zinc-900/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-mono font-black transition-all ${
                                                        isSelected
                                                            ? 'bg-orange-500 text-black border-orange-400'
                                                            : 'bg-zinc-950 border-white/5 group-hover:border-white/10 text-zinc-400 text-xs'
                                                    }`}>
                                                        {p.days}d
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-bold tracking-wide text-white flex items-center gap-1.5">
                                                            {p.label}
                                                            {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                                                            {p.popular && (
                                                                <span className="text-[8px] bg-amber-400 text-black px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                                                                    Highly Recommended
                                                                </span>
                                                            )}
                                                        </h5>
                                                        <p className="text-[11px] text-zinc-400 font-light mt-1 leading-relaxed">
                                                            {p.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 border select-none self-start sm:self-center ${
                                                    isSelected
                                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                        : 'bg-zinc-900 text-zinc-500 border-white/5'
                                                }`}>
                                                    {p.badge}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Step 5: Results Panel */}
                            {step === 5 && (
                                <div className="grid md:grid-cols-12 gap-6 items-start w-full">
                                    {/* Left Column: Plan match summary */}
                                    <div className="md:col-span-7 bg-zinc-900/40 border border-white/5 rounded-3xl p-5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono text-[9px] font-bold uppercase tracking-wider">98.4% Fitness Match</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        </div>
                                        <div>
                                            <h5 className="text-xl font-serif text-white tracking-tight font-black flex items-center gap-1.5">
                                                {chosenPlan.label}
                                            </h5>
                                            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-light">
                                                We have matched you with a specialized <strong className="text-white capitalize">{selectedDiet === 'nonVeg' ? 'Non-Veg' : selectedDiet}</strong> diet optimized specifically for <strong className="text-white capitalize">{selectedGoal === 'deficit' ? 'Calorie Deficit' : selectedGoal === 'hypertrophy' ? 'Muscle Building' : selectedGoal === 'keto' ? 'Ketosis' : 'Balanced Nutrition'}</strong> with a delivery commitment of <strong className="text-white">{selectedMeals === 'single' ? '1 Meal' : selectedMeals === 'double' ? '2 Meals' : '3 Meals'} per day</strong> over a <strong className="text-white">{days}-day cycle</strong>.
                                            </p>
                                        </div>

                                        {/* Benefits list */}
                                        <div className="space-y-2 bg-black/30 p-4 rounded-2xl border border-white/5 text-xs">
                                            <div className="flex gap-2.5 text-zinc-300">
                                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>Dietitian support to guide your food and fitness journey.</span>
                                            </div>
                                            <div className="flex gap-2.5 text-zinc-300">
                                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>Double-wall insulated delivery keeps your food perfectly fresh and clean.</span>
                                            </div>
                                            <div className="flex gap-2.5 text-zinc-300">
                                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>Completely flexible schedules: skip, pause, or change routes anytime.</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Macro bento and price */}
                                    <div className="md:col-span-5 bg-zinc-900 border border-white/5 rounded-3xl p-5 space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-orange-400 uppercase tracking-widest block font-bold">Estimated Daily Budget</span>
                                            <div className="text-3xl font-mono text-white font-black">{macros.calories} <span className="text-xs font-light text-zinc-500">kcal / day</span></div>
                                        </div>

                                        {/* Macros progress lines */}
                                        <div className="space-y-3 bg-black/40 p-3.5 rounded-2xl border border-white/5">
                                            {/* Protein */}
                                            <div>
                                                <div className="flex justify-between items-baseline mb-1 text-[10px]">
                                                    <span className="text-zinc-400 font-bold">PROTEIN</span>
                                                    <span className="text-emerald-400 font-mono font-black">{macros.protein}g</span>
                                                </div>
                                                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (macros.protein / 150) * 100)}%` }} />
                                                </div>
                                            </div>
                                            {/* Carbs */}
                                            <div>
                                                <div className="flex justify-between items-baseline mb-1 text-[10px]">
                                                    <span className="text-zinc-400 font-bold">CARBOHYDRATES</span>
                                                    <span className="text-amber-400 font-mono font-black">{macros.carbs}g</span>
                                                </div>
                                                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(100, (macros.carbs / 250) * 100)}%` }} />
                                                </div>
                                            </div>
                                            {/* Fats */}
                                            <div>
                                                <div className="flex justify-between items-baseline mb-1 text-[10px]">
                                                    <span className="text-zinc-400 font-bold">HEALTHY FATS</span>
                                                    <span className="text-purple-400 font-mono font-black">{macros.fats}g</span>
                                                </div>
                                                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, (macros.fats / 100) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Commercial terms summary */}
                                        <div className="grid grid-cols-2 gap-3 bg-black/20 p-3 rounded-2xl border border-white/[0.03] text-center">
                                            <div>
                                                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Rate Per Meal</span>
                                                <span className="text-white font-mono font-black text-sm sm:text-base">₹{pricing.perMeal}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Total Price</span>
                                                <span className="text-orange-400 font-mono font-black text-sm sm:text-base">₹{pricing.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Nav Buttons */}
                    <div className="mt-8 pt-5 border-t border-white/[0.04] flex justify-between items-center gap-4">
                        {step > 1 ? (
                            <button
                                onClick={() => {
                                    setStep(prev => prev - 1);
                                    if (navigator.vibrate) navigator.vibrate(8);
                                }}
                                className="px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 hover:border-white/10 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer select-none focus:outline-none"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 5 ? (
                            <button
                                onClick={() => {
                                    setStep(prev => prev + 1);
                                    if (navigator.vibrate) navigator.vibrate(10);
                                }}
                                className="px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-white/5 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer select-none focus:outline-none"
                            >
                                Skip / Next <ChevronRight className="w-4 h-4 text-orange-400" />
                            </button>
                        ) : (
                            <button
                                onClick={handleApply}
                                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:scale-[1.02] active:scale-[0.98] transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer select-none shadow-xl shadow-orange-500/10 focus:outline-none"
                            >
                                <CheckCircle2 className="w-4 h-4 text-black font-black" /> Apply Settings & Check Out
                            </button>
                        )}
                    </div>

                </div>
            </div>
            </div>
        </motion.div>,
        document.body
    );
};


/* COMPONENT: TRANSFORMATION GALLERY WITH METABOLIC CHARTS & TESTIMONIALS (NO STOCK IMAGES) */
interface CaseStudy {
    id: string;
    name: string;
    age: number;
    role: string;
    location: string;
    plan: string;
    initials: string;
    challenge: string;
    duration: string;
    quote: string;
    dietitian: string;
    metrics: {
        before: {
            hba1c: number;
            hba1cStatus: string;
            visceralFat: number;
            visceralStatus: string;
            energy: number;
            energyDesc: string;
            weight: number;
            symptoms: string[];
        };
        after: {
            hba1c: number;
            hba1cStatus: string;
            visceralFat: number;
            visceralStatus: string;
            energy: number;
            energyDesc: string;
            weight: number;
            symptoms: string[];
        };
    };
    chartData: {
        before: number[];
        after: number[];
    };
}

const TRANSFORMATION_CASES: CaseStudy[] = [
    {
        id: 'arjun',
        name: 'Arjun Mehta',
        age: 34,
        role: 'Lead Product Designer at a Fintech',
        location: 'Koramangala, Bangalore',
        plan: '20-Day Habit (Keto Clean + Fats Extra)',
        initials: 'AM',
        challenge: 'Long desk-bound 12-hour shifts, high blood sugar alerts, and severe 3 PM energy slumps.',
        duration: '60 Days of Discipline',
        dietitian: 'Dr. Shruti Rao, PhD (Clinical Dietetics)',
        quote: 'My work requires deep, uninterrupted focus, but I was dragging myself through the afternoon on double espressos and sugary biscuits. Shifting to Taazabites healthy, nutrient-rich meal plans stabilized my energy levels. The brain fog evaporated within a week, and my medical reports literally shocked my doctor.',
        metrics: {
            before: {
                hba1c: 6.4,
                hba1cStatus: 'High Sugar Risk',
                visceralFat: 14,
                visceralStatus: 'High Health Risk',
                energy: 35,
                energyDesc: 'Severe Afternoon Crash',
                weight: 84,
                symptoms: ['Brain Fog at 3 PM', 'Constant Sugar Cravings', 'Interrupted Sleep']
            },
            after: {
                hba1c: 5.1,
                hba1cStatus: 'Excellent Healthy Range',
                visceralFat: 8,
                visceralStatus: 'Fit & Healthy',
                energy: 95,
                energyDesc: 'All-Day Focused Energy',
                weight: 76,
                symptoms: ['All-Day Mental Clarity', 'No Afternoon Slumps', 'Better Deep Sleep']
            }
        },
        chartData: {
            before: [145, 160, 185, 190, 130, 165, 180, 140, 175, 195, 155, 120], // Highly volatile blood sugar
            after: [90, 95, 110, 115, 98, 105, 112, 95, 102, 110, 95, 92] // Highly stable blood sugar
        }
    },
    {
        id: 'priya',
        name: 'Dr. Priya Iyer',
        age: 29,
        role: 'Resident General Physician',
        location: 'Indiranagar, Bangalore',
        plan: '60-Day Lifestyle (High-Protein Veg)',
        initials: 'PI',
        challenge: 'Erratic hospital duty hours, sleep deprivation, and poor digestion.',
        duration: '90 Days of Consistency',
        dietitian: 'Nikhil Gowda, MSc (Nutritional Science)',
        quote: 'As a doctor, I knew my physical routine was unsustainable, but hospital food and late-night food deliveries were destroying my gut. Taazabites cooks exclusively with 100% Extra Virgin Olive Oil, with strictly zero ghee, coconut oil, or toxic seed oils. My digestion healed completely, and I sustained steady physical stamina throughout 14-hour standing shifts.',
        metrics: {
            before: {
                hba1c: 5.8,
                hba1cStatus: 'Borderline High Sugar',
                visceralFat: 11,
                visceralStatus: 'High Body Fat',
                energy: 40,
                energyDesc: 'Unstable Energy Levels',
                weight: 68,
                symptoms: ['Severe Acid Reflux', 'Muscle Loss & Low Tone', 'Extreme Fatigue']
            },
            after: {
                hba1c: 4.9,
                hba1cStatus: 'Excellent Healthy Level',
                visceralFat: 6,
                visceralStatus: 'Healthy Lean Balance',
                energy: 92,
                energyDesc: 'Steady All-Day Stamina',
                weight: 61,
                symptoms: ['Acid Reflux Eliminated', 'Gained 2.5kg Lean Muscle', 'Stable Dynamic Energy']
            }
        },
        chartData: {
            before: [130, 150, 170, 125, 145, 160, 135, 155, 168, 130, 142, 158],
            after: [85, 90, 105, 102, 92, 98, 101, 88, 94, 102, 90, 86]
        }
    },
    {
        id: 'rohan',
        name: 'Rohan Hegde',
        age: 41,
        role: 'Founder & VP of Engineering',
        location: 'Whitefield, Bangalore',
        plan: '20-Day Habit (Fat Loss Deficit)',
        initials: 'RH',
        challenge: 'High-stress corporate schedule, feeling older and constantly fatigued, and weight gain around the midsection.',
        duration: '45 Days of Alignment',
        dietitian: 'Dr. Shruti Rao, PhD (Clinical Dietetics)',
        quote: 'I used to believe healthy eating meant starvation or tasteless salads. Taazabites proved me wrong—their meals are cooked with incredible local spices, premium ingredients, and are extremely filling. I feel 10 years younger, my overall body fat dropped, and I no longer suffer from afternoon brain fog.',
        metrics: {
            before: {
                hba1c: 6.2,
                hba1cStatus: 'Unstable Blood Sugar',
                visceralFat: 15,
                visceralStatus: 'Unhealthy Body Fat',
                energy: 30,
                energyDesc: 'Exhausted by 2 PM',
                weight: 91,
                symptoms: ['Mild High Blood Pressure', 'Low Physical Stamina', 'Severe Afternoon Brain Fog']
            },
            after: {
                hba1c: 5.0,
                hba1cStatus: 'Healthy & Normalized',
                visceralFat: 9,
                visceralStatus: 'Clean & Fit',
                energy: 90,
                energyDesc: 'Superb Mental Focus',
                weight: 80,
                symptoms: ['Normal Blood Pressure', 'Better Physical Strength', 'Zero Afternoon Energy Drops']
            }
        },
        chartData: {
            before: [140, 165, 180, 155, 172, 190, 148, 166, 185, 150, 162, 178],
            after: [88, 92, 108, 105, 95, 100, 104, 91, 97, 106, 92, 89]
        }
    }
];

const TransformationGallery: React.FC = () => {
    const [activeIdx, setActiveIdx] = useState<number>(0);
    const [compareState, setCompareState] = useState<'before' | 'after'>('after');
    const caseStudy = TRANSFORMATION_CASES[activeIdx];

    const currentMetrics = compareState === 'before' ? caseStudy.metrics.before : caseStudy.metrics.after;
    const isAfter = compareState === 'after';

    // Handle slide navigation
    const handleNext = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        setActiveIdx((prev) => (prev + 1) % TRANSFORMATION_CASES.length);
    };

    const handlePrev = () => {
        if (navigator.vibrate) navigator.vibrate(10);
        setActiveIdx((prev) => (prev - 1 + TRANSFORMATION_CASES.length) % TRANSFORMATION_CASES.length);
    };

    return (
        <section className="mt-28 max-w-6xl mx-auto px-4 sm:px-6 relative z-10" id="metabolic-transformations">
            {/* Header decor banner */}
            <div className="text-center mb-16">
                <span className="text-[#FF7A00] font-mono text-xs tracking-widest uppercase font-black block mb-2">
                    ⚡ Verified Health & Wellness Evidence
                </span>
                <h3 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-sans text-white tracking-tight leading-none mb-4 uppercase">
                    Real Bangalore Health Success Stories
                </h3>
                <p className="text-gray-400 text-xs sm:text-base font-light max-w-3xl mx-auto leading-relaxed">
                    Real progress stories, feedback, and energy level tracking from actual Taazabites subscribers. 
                    <span className="text-emerald-400 font-bold ml-1">No generic stock images—only real journeys and healthy life transformations.</span>
                </p>
            </div>

            {/* Quick Case Study Select Tabs */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 max-w-2xl mx-auto">
                {TRANSFORMATION_CASES.map((t, idx) => (
                    <button
                        key={t.id}
                        onClick={() => {
                            setActiveIdx(idx);
                            if (navigator.vibrate) navigator.vibrate(10);
                        }}
                        className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border select-none ${
                            activeIdx === idx
                                ? 'bg-orange-500 text-black border-orange-400 font-black shadow-lg shadow-orange-500/10'
                                : 'bg-[#0a0a0a]/60 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white'
                        }`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${activeIdx === idx ? 'bg-black' : 'bg-emerald-500'}`} />
                        {t.name} <span className="text-[9px] opacity-70 font-mono">({t.age} yrs)</span>
                    </button>
                ))}
            </div>

            {/* Main Interactive Bento Grid Card */}
            <div className="relative bg-[#070707] border border-white/[0.04] rounded-[2.5rem] p-6 sm:p-10 shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Visual Accent glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Top bar with Navigation and Case Metadata */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-8 border-b border-white/[0.04] mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <div>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest block">Health Progress Verified</span>
                            <span className="text-xs text-zinc-500 font-mono uppercase font-bold">Member ID: TZB-2026-{caseStudy.initials}</span>
                        </div>
                    </div>

                    {/* Nav arrows */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                            onClick={handlePrev}
                            className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/10 hover:bg-zinc-800 transition-all cursor-pointer focus:outline-none"
                            aria-label="Previous case study"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-mono text-zinc-500 bg-zinc-950 border border-white/5 px-3 py-2 rounded-xl">
                            {activeIdx + 1} / {TRANSFORMATION_CASES.length}
                        </span>
                        <button
                            onClick={handleNext}
                            className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/10 hover:bg-zinc-800 transition-all cursor-pointer focus:outline-none"
                            aria-label="Next case study"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                    {/* COLUMN 1: Profile and Lifestyle Identity */}
                    <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            {/* Visual Concentric Circle Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 flex items-center justify-center shrink-0 relative overflow-hidden group shadow-inner">
                                    <div className="absolute inset-1 rounded-xl bg-zinc-950 flex items-center justify-center font-bold font-serif text-lg text-white">
                                        {caseStudy.initials}
                                    </div>
                                    <div className="absolute -inset-1 bg-gradient-to-tr from-transparent via-orange-500/20 to-emerald-500/20 rounded-full animate-spin [animation-duration:8s] opacity-60" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-serif text-white tracking-tight font-black">{caseStudy.name}</h4>
                                    <p className="text-xs text-zinc-400 leading-tight">{caseStudy.role}</p>
                                    <p className="text-[10px] text-zinc-500 font-mono mt-1">{caseStudy.location}</p>
                                </div>
                            </div>

                            {/* Challenge and Plan metadata blocks */}
                            <div className="space-y-3 pt-2">
                                <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4 space-y-1">
                                    <span className="text-[9px] text-orange-400 font-mono font-bold uppercase tracking-widest block">Primary Health Challenge</span>
                                    <p className="text-xs text-zinc-300 font-light leading-relaxed">{caseStudy.challenge}</p>
                                </div>
                                <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4 space-y-1">
                                    <span className="text-[9px] text-[#FF7A00] font-mono font-bold uppercase tracking-widest block">Active Cycle Config</span>
                                    <p className="text-xs text-white font-bold tracking-wide flex items-center gap-1.5">
                                        <Activity className="w-3.5 h-3.5 text-[#FF7A00]" /> {caseStudy.plan}
                                    </p>
                                </div>
                                <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4 space-y-1">
                                    <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-widest block">Verification Period</span>
                                    <p className="text-xs text-zinc-300 font-bold flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {caseStudy.duration}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lab Signoff footer */}
                        <div className="pt-4 border-t border-white/[0.03] flex items-center gap-3 text-[10px] text-zinc-500">
                            <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0 opacity-80" />
                            <div>
                                <span className="block font-bold text-zinc-400 uppercase tracking-wide">Dietitian Sign-Off</span>
                                <span className="font-light">{caseStudy.dietitian}</span>
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 2: BEFORE-AFTER METRICS DUAL CONTROL */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Selector Tab */}
                        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-1 flex relative">
                            <button
                                onClick={() => {
                                    setCompareState('before');
                                    if (navigator.vibrate) navigator.vibrate(8);
                                }}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative z-10 cursor-pointer select-none focus:outline-none ${
                                    !isAfter 
                                        ? 'bg-zinc-900 text-red-400 border border-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.05)] font-black' 
                                        : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                Before Taazabites
                            </button>
                            <button
                                onClick={() => {
                                    setCompareState('after');
                                    if (navigator.vibrate) navigator.vibrate(8);
                                }}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative z-10 cursor-pointer select-none focus:outline-none ${
                                    isAfter 
                                        ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.05)] font-black' 
                                        : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                After 60-Day Program ✓
                            </button>
                        </div>

                        {/* Metrics Panel (Changes depending on Before vs After state) */}
                        <div className="bg-zinc-900/15 border border-white/5 rounded-3xl p-5 space-y-4 relative overflow-hidden min-h-[360px] flex flex-col justify-between">
                            <div className="space-y-4">
                                <h5 className="text-xs uppercase font-mono tracking-widest text-zinc-400 font-black border-b border-white/5 pb-2.5 flex items-center justify-between">
                                    <span>Personal Health Metrics</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                                        isAfter ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                        {isAfter ? 'Healthy & Energized' : 'Fatigued & Unhealthy'}
                                    </span>
                                </h5>

                                {/* Metric 1: HbA1c (Blood Sugar) */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs items-baseline">
                                        <span className="text-zinc-400 font-bold uppercase tracking-wide">Average Blood Sugar</span>
                                        <div className="text-right font-mono">
                                            <span className={`font-black text-sm ${isAfter ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {currentMetrics.hba1c}%
                                            </span>
                                            <span className="text-[10px] text-zinc-500 ml-1.5">({currentMetrics.hba1cStatus})</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-700 ${
                                                isAfter ? 'bg-emerald-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                            }`} 
                                            style={{ width: `${Math.min(100, (currentMetrics.hba1c / 8) * 100)}%` }} 
                                        />
                                    </div>
                                </div>

                                {/* Metric 2: Visceral Fat Level */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs items-baseline">
                                        <span className="text-zinc-400 font-bold uppercase tracking-wide">Body Fat Rating</span>
                                        <div className="text-right font-mono">
                                            <span className={`font-black text-sm ${isAfter ? 'text-emerald-400' : 'text-amber-500'}`}>
                                                LVL {currentMetrics.visceralFat}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 ml-1.5">({currentMetrics.visceralStatus})</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-700 ${
                                                isAfter ? 'bg-emerald-500' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                            }`} 
                                            style={{ width: `${Math.min(100, (currentMetrics.visceralFat / 20) * 100)}%` }} 
                                        />
                                    </div>
                                </div>

                                {/* Metric 3: Subjective Cellular Energy */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs items-baseline">
                                        <span className="text-zinc-400 font-bold uppercase tracking-wide">Daily Energy Level</span>
                                        <div className="text-right font-mono">
                                            <span className={`font-black text-sm ${isAfter ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {currentMetrics.energy}%
                                            </span>
                                            <span className="text-[10px] text-zinc-500 ml-1.5">({currentMetrics.energyDesc})</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-700 ${
                                                isAfter ? 'bg-emerald-500' : 'bg-red-400'
                                            }`} 
                                            style={{ width: `${currentMetrics.energy}%` }} 
                                        />
                                    </div>
                                </div>

                                {/* Metric 4: Total Weight recomposition */}
                                <div className="pt-3 border-t border-white/[0.03] flex justify-between items-center text-xs">
                                    <span className="text-zinc-400 font-bold uppercase tracking-wide">Total Weight</span>
                                    <span className="font-mono font-black text-white text-base">
                                        {currentMetrics.weight} kg
                                    </span>
                                </div>
                            </div>

                            {/* Symptoms list mapping */}
                            <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-2">
                                <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 font-bold">
                                    {isAfter ? 'Verified Health Benefits:' : 'Reported Fatigue Symptoms:'}
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                    {currentMetrics.symptoms.map((sym, sIdx) => (
                                        <div key={sIdx} className="flex items-center gap-2 text-zinc-300">
                                            <span className={`w-1.5 h-1.5 rounded-full ${isAfter ? 'bg-emerald-500' : 'bg-red-500/60'}`} />
                                            <span>{sym}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 3: THE VOICE & CHARTS PANEL */}
                    <div className="lg:col-span-3 flex flex-col justify-between space-y-6">
                        {/* Interactive Sparkline Blood Sugar Curve Representation */}
                        <div className="bg-[#0b0b0b] border border-white/[0.04] rounded-3xl p-5 space-y-3 relative overflow-hidden">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-zinc-400 uppercase font-mono tracking-widest font-black block">
                                    Daily Energy Level Curve
                                </span>
                                <span className="text-[8px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-zinc-500 font-mono">
                                    {isAfter ? 'Stable (Healthy Energy)' : 'Spiking (Sugar Crashes)'}
                                </span>
                            </div>

                            {/* Custom SVG sparkline representing glycemic stability */}
                            <div className="h-20 w-full bg-zinc-950/40 rounded-2xl border border-white/[0.03] flex items-end relative p-2 overflow-hidden">
                                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="glycemicGlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={isAfter ? '#10b981' : '#ef4444'} stopOpacity="0.2"/>
                                            <stop offset="100%" stopColor={isAfter ? '#10b981' : '#ef4444'} stopOpacity="0.0"/>
                                        </linearGradient>
                                    </defs>
                                    
                                    {/* Grid reference lines */}
                                    <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2,2" />
                                    
                                    {/* Glow under line */}
                                    <path
                                        d={`M 0,40 ${caseStudy.chartData[compareState].map((val, idx) => {
                                            const percent = (idx / 11) * 100;
                                            // Scale val between 0 (high = index 195) and 40 (low = index 80)
                                            const normalizedY = 40 - ((val - 80) / (200 - 80)) * 36;
                                            return `L ${percent},${normalizedY}`;
                                        }).join(' ')} L 100,40 Z`}
                                        fill="url(#glycemicGlow)"
                                    />
                                    
                                    {/* Main line */}
                                    <path
                                        d={caseStudy.chartData[compareState].map((val, idx) => {
                                            const percent = (idx / 11) * 100;
                                            const normalizedY = 40 - ((val - 80) / (200 - 80)) * 36;
                                            return `${idx === 0 ? 'M' : 'L'} ${percent},${normalizedY}`;
                                        }).join(' ')}
                                        fill="none"
                                        stroke={isAfter ? '#10b981' : '#ef4444'}
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                
                                {/* Absolute indicator overlays */}
                                <div className="absolute top-2 right-2 flex items-center gap-1.5 font-mono text-[9px] text-zinc-500">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isAfter ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                                    <span>Daily Sugar Tracking</span>
                                </div>
                            </div>
                        </div>

                        {/* Subscriber Testimonial Quote */}
                        <div className="bg-gradient-to-br from-zinc-950 to-[#0c0c0c] border border-white/[0.04] rounded-3xl p-5 flex flex-col justify-between flex-grow min-h-[220px] relative">
                            {/* Quotes Marks Asset SVG */}
                            <span className="text-4xl font-serif text-zinc-800 leading-none absolute top-4 left-4 select-none pointer-events-none">“</span>
                            
                            <p className="text-[11px] sm:text-xs text-zinc-300 font-light leading-relaxed relative z-10 pt-4 italic pr-2">
                                {caseStudy.quote}
                            </p>

                            <div className="pt-4 border-t border-white/[0.03] mt-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-white tracking-wide uppercase">
                                    — Verified {caseStudy.initials} Success
                                </span>
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider font-mono select-none">
                                    Signed
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};




