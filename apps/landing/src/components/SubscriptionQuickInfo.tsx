/**
 * @file SubscriptionQuickInfo.tsx
 * @description Provides a quick overview of subscription facts and logistics, enhanced with dynamic,
 * hover-based tooltips showing macro-calculated benefits customized to the user's active health goal.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Leaf, MapPin, Info, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MacroBenefit {
    title: string;
    target: string;
    distribution: string;
    focus: string;
    points: string[];
}

const BENEFIT_DETAILS: Record<string, MacroBenefit> = {
    'weight-loss': {
        title: "Weight Loss",
        target: "Caloric Deficit (1200-1500 kcal)",
        distribution: "35% Protein | 35% Carbs | 30% Healthy Fats",
        focus: "High-protein, low glycemic load to preserve lean muscle while stripping fat.",
        points: [
            "Lean protein sources to boost satiety and thermogenesis",
            "Complex low-GI carbs to maintain stable insulin levels"
        ]
    },
    'hypertrophy': {
        title: "Muscle Gain",
        target: "Anabolic Surplus (1800-2200 kcal)",
        distribution: "30% Protein | 45% Carbs | 25% Healthy Fats",
        focus: "Performance-driven complex carbs paired with high protein for muscle hypertrophy and recovery.",
        points: [
            "Optimum protein (1.8g - 2.2g per kg) for muscle protein synthesis",
            "Glycogen-replenishing clean carbs for high-intensity workout fuel"
        ]
    },
    'maintenance': {
        title: "Clean Wellness",
        target: "Isocaloric Balance (1500-1800 kcal)",
        distribution: "30% Protein | 40% Carbs | 30% Healthy Fats",
        focus: "Perfect macro balance to optimize metabolic flexibility, continuous energy, and overall health.",
        points: [
            "Balanced macronutrient ratio for steady all-day cellular energy",
            "Phytochemical-rich greens to combat systemic inflammation"
        ]
    }
};

export const SubscriptionQuickInfo: React.FC<{ className?: string; style?: React.CSSProperties; label?: string }> = ({ className, style, label = "Quick Info & Active Plan Macros" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [hoveredFactIndex, setHoveredFactIndex] = useState<number | null>(null);
    const { user } = useAuth();

    // Default to user's preference, but allow manual toggle/exploration
    const profileGoal = user?.preferences?.goal || 'maintenance';
    const [selectedGoal, setSelectedGoal] = useState<string>(profileGoal);

    // Sync state if user's profile preference changes
    React.useEffect(() => {
        if (user?.preferences?.goal) {
            setSelectedGoal(user.preferences.goal);
        }
    }, [user?.preferences?.goal]);

    const activeBenefit = BENEFIT_DETAILS[selectedGoal] || BENEFIT_DETAILS['maintenance'];

    const facts = [
        {
            icon: <Calendar className="w-5 h-5 text-indigo-400" />,
            title: "Total Flexibility",
            desc: "Pause, skip, or reschedule your meals anytime via WhatsApp or Dashboard with zero penalties.",
            macroBenefit: "Ensures macro-consistency: Pause or shift your days dynamically so you never break your tracking streak."
        },
        {
            icon: <Leaf className="w-5 h-5 text-[#059669]" />,
            title: "Sustainable Packaging",
            desc: "100% biodegradable microwave-safe eco-friendly food containers that are kind to the planet.",
            macroBenefit: "Endocrine protection: Zero plastic/chemical leaching keeps your calculated meal absolutely clean."
        },
        {
            icon: <MapPin className="w-5 h-5 text-orange-400" />,
            title: "Bengaluru Coverage",
            desc: "Fresh delivery across major hubs including HSR, Sarjapur, E-City, and Whitefield.",
            macroBenefit: "Enzyme preservation: Quick transit ensures micronutrients and active probiotics remain fully intact."
        }
    ];

    const goalsList = [
        { id: 'weight-loss', label: 'Weight Loss' },
        { id: 'hypertrophy', label: 'Muscle Gain' },
        { id: 'maintenance', label: 'Wellness' }
    ];

    return (
        <div className={`relative ${className || ''}`} style={style}>
            {/* Trigger Button with Hover-Based Macro Benefit Tooltip */}
            <div className="relative inline-block w-full sm:w-auto">
                <button 
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => setIsOpen(true)}
                    className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-[#059669] transition-all duration-300 flex items-center justify-center gap-1.5 mx-auto sm:mx-0 group py-1.5 px-3 bg-white/5 rounded-full border border-white/5 hover:border-[#059669]/30"
                >
                    <Info className="w-3 h-3 transition-transform group-hover:rotate-12 text-[#059669]" />
                    <span>{label}</span>
                </button>
                
                {/* Active Plan Hover Tooltip */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-3 w-80 bg-[#141414] border border-[#059669]/30 p-5 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] z-[999] pointer-events-auto backdrop-blur-md"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div className="space-y-3 text-left">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] uppercase tracking-widest text-[#059669] font-bold font-mono">
                                        Explore Subscriptions
                                    </span>
                                    {profileGoal === selectedGoal && (
                                        <span className="text-[8px] bg-[#059669]/10 text-[#059669] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                                            Your Active Goal
                                        </span>
                                    )}
                                </div>

                                {/* Premium Tab Selector with sliding layoutId indicator */}
                                <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                                    {goalsList.map((g) => {
                                        const isActive = selectedGoal === g.id;
                                        return (
                                            <button
                                                key={g.id}
                                                onClick={() => setSelectedGoal(g.id)}
                                                className={`relative py-1 text-[9px] font-bold tracking-wider uppercase text-center rounded transition-colors duration-300 z-10 ${
                                                    isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                                                }`}
                                            >
                                                {g.label}
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeGoalPill"
                                                        className="absolute inset-0 bg-[#059669]/20 border border-[#059669]/40 rounded -z-10"
                                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Smooth height and content switch for macro description */}
                                <motion.div 
                                    layout="position"
                                    className="overflow-hidden"
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selectedGoal}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.15 }}
                                            className="space-y-3 pt-1"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-serif font-bold text-white flex items-center gap-1.5">
                                                    <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                                                    {activeBenefit.title} Plan
                                                </h4>
                                                <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-zinc-400 font-mono">
                                                    {activeBenefit.target}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                                                {activeBenefit.focus}
                                            </p>
                                            <div className="pt-2 border-t border-white/5 space-y-1">
                                                <p className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Macro Target Ratio</p>
                                                <p className="text-xs text-emerald-400 font-mono font-medium">{activeBenefit.distribution}</p>
                                            </div>
                                            <div className="space-y-1 pt-1">
                                                {activeBenefit.points.map((pt, i) => (
                                                    <div key={i} className="flex items-start gap-1.5 text-[10px] text-zinc-400 font-light leading-tight">
                                                        <span className="text-[#059669] mt-0.5">✓</span>
                                                        <span>{pt}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </motion.div>
                                
                                <p className="text-[9px] text-zinc-500 font-light text-center border-t border-white/5 pt-2">
                                    💡 Click to view logistics & packaging facts
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick Info & Logistics Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md"
                        />
                        
                        <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-serif font-light text-white">Subscription <span className="text-[#059669]">Facts</span></h2>
                                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">Hover cards to reveal macro benefits</p>
                                </div>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white transition-colors"
                                    aria-label="Close dialog"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Plan Switcher inside Modal */}
                            <div className="mb-6 space-y-2">
                                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">Compare Nutrition Architectures</span>
                                <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                                    {goalsList.map((g) => {
                                        const isActive = selectedGoal === g.id;
                                        return (
                                            <button
                                                key={g.id}
                                                onClick={() => setSelectedGoal(g.id)}
                                                className={`relative py-2 text-xs font-bold tracking-wider uppercase text-center rounded-lg transition-colors duration-300 z-10 ${
                                                    isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                                                }`}
                                            >
                                                {g.label}
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeModalGoalPill"
                                                        className="absolute inset-0 bg-[#059669]/25 border border-[#059669]/40 rounded-lg -z-10"
                                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active Macro Summary with Smooth Layout transitions */}
                            <motion.div 
                                layout="position"
                                className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#059669]/10 to-transparent border border-[#059669]/20 overflow-hidden"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedGoal}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.18 }}
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-bold text-[#059669]">
                                                <Sparkles className="w-4 h-4 text-[#FF7A00]" />
                                                Active Goal: {activeBenefit.title}
                                            </div>
                                            <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                {activeBenefit.target}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                                            This plan guarantees <span className="text-emerald-400 font-medium">{activeBenefit.distribution.toLowerCase()}</span>. {activeBenefit.focus}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>

                            {/* Content List with Tooltips on Hover */}
                            <div className="space-y-3">
                                {facts.map((fact, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onMouseEnter={() => setHoveredFactIndex(i)}
                                        onMouseLeave={() => setHoveredFactIndex(null)}
                                        className="relative flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#059669]/30 transition-all duration-300 cursor-help overflow-hidden"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            {fact.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                                                {fact.title}
                                                <span className="text-[9px] font-mono text-[#059669] font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                                                    (Benefits)
                                                </span>
                                            </h3>
                                            
                                            {/* Swap to Macro Benefit text beautifully on hover */}
                                            <AnimatePresence mode="wait">
                                                {hoveredFactIndex === i ? (
                                                    <motion.p 
                                                        key="benefit"
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -5 }}
                                                        className="text-xs text-emerald-400 leading-relaxed font-medium"
                                                    >
                                                        ✨ {fact.macroBenefit}
                                                    </motion.p>
                                                ) : (
                                                    <motion.p 
                                                        key="desc"
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -5 }}
                                                        className="text-xs text-zinc-400 leading-relaxed font-light"
                                                    >
                                                        {fact.desc}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button 
                                onClick={() => setIsOpen(false)}
                                className="w-full mt-6 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full hover:bg-zinc-200 transition-all duration-300"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
