import { PORTAL_LINKS } from '../config';
import { ChevronDown, Satellite, Dna, Fingerprint, Shield } from 'lucide-react';
import { Loader2, Atom, Cpu } from 'lucide-react';

import React, { useState } from 'react';
import { SmartButton } from './SmartButton';

interface PlanResult {
    breakfast: { name: string; reason: string };
    lunch: { name: string; reason: string };
    dinner: { name: string; reason: string };
    summary: string;
    dailyTotals: { calories: string; protein: string };
}

const ResultSkeleton: React.FC = () => (
    <div className="bg-white/40 backdrop-blur-md p-10 sm:p-14 rounded-[3.5rem] border border-zinc-100 shadow-sm relative h-full flex flex-col animate-pulse overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
        
        <div className="flex justify-between items-start mb-12">
            <div className="space-y-2">
                <div className="h-2 w-24 bg-zinc-100 rounded-full"></div>
                <div className="h-10 w-48 bg-zinc-100 rounded-xl"></div>
            </div>
            <div className="h-12 w-20 bg-zinc-50 rounded-2xl"></div>
        </div>

        <div className="space-y-10 flex-grow">
            {[1, 2, 3].map(i => (
                <div key={i} className="space-y-3">
                    <div className="h-2 w-32 bg-zinc-100 rounded-full"></div>
                    <div className="h-6 w-3/4 bg-zinc-100 rounded-lg"></div>
                    <div className="h-3 w-full bg-zinc-50 rounded-md"></div>
                </div>
            ))}
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-50 flex items-center justify-between">
            <div className="flex gap-10">
                <div className="h-10 w-20 bg-zinc-50 rounded-xl"></div>
                <div className="h-10 w-20 bg-zinc-50 rounded-xl"></div>
            </div>
            <div className="h-14 w-32 bg-zinc-100 rounded-2xl"></div>
        </div>
    </div>
);

export const MealPlanner: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<PlanResult | null>(null);
    const [formData, setFormData] = useState({
        weight: '',
        age: '',
        diet: 'Non-Veg Protocol',
        goal: 'Weight Deficit',
        dislikes: ''
    });

    const handleHaptic = () => {
        if (navigator.vibrate) navigator.vibrate(12);
    };

    const handleSynthesis = async (e: React.FormEvent) => {
        e.preventDefault();
        handleHaptic();
        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/meal-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    diet: [formData.diet],
                    goal: formData.goal,
                    dislikes: formData.dislikes,
                    info: `User is ${formData.age} years old and weighs ${formData.weight}kg.`
                })
            });
            if (!response.ok) throw new Error('Failed to generate plan');
            const plan = await response.json();
            setResult(plan);
        } catch (error) {
            console.error("Neural link failure:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="py-24 sm:py-48 bg-[#F5F2ED] relative overflow-hidden" id="meal-planner">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="text-center mb-16 sm:mb-24 animate-on-scroll">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-zinc-100 text-[#FF7A00] text-[8px] font-black uppercase tracking-[0.5em] mb-10 shadow-sm">
                        <Cpu className="animate-pulse w-3 h-3"/> Neural_Engine_v7.4
                    </div>
                    <h2 className="text-5xl md:text-8xl font-extrabold font-sans text-[#1A1A1A] tracking-tighter leading-[0.85] mb-8 uppercase">
                        Quantum <br className="sm:hidden" /> <span className="text-[#FF7A00] font-script normal-case tracking-normal">Nutrition.</span>
                    </h2>
                    <p className="text-zinc-700 max-w-xl mx-auto text-lg sm:text-2xl font-bold leading-relaxed">
                        Hyper-personalized meal planning. We construct your optimal daily meal plan based on your health goals.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Input Module */}
                    <div className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.08)] p-8 sm:p-14 relative overflow-hidden animate-on-scroll">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#FF7A00_1px,transparent_1px)] [background-size:25px_25px]"></div>
                        
                        <form onSubmit={handleSynthesis} className="space-y-8 relative z-10">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-4">Bio_Weight</label>
                                    <input 
                                        type="number"
                                        required
                                        value={formData.weight}
                                        onChange={e => setFormData({...formData, weight: e.target.value})}
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:border-[#FF7A00]/30 focus:bg-white transition-all font-mono text-[#1A1A1A]" 
                                        placeholder="KG" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-4">Age_Idx</label>
                                    <input 
                                        type="number"
                                        required
                                        value={formData.age}
                                        onChange={e => setFormData({...formData, age: e.target.value})}
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:border-[#FF7A00]/30 focus:bg-white transition-all font-mono text-[#1A1A1A]" 
                                        placeholder="YRS" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-4">Dietary_Schema</label>
                                <div className="relative">
                                    <select 
                                        value={formData.diet}
                                        onChange={e => setFormData({...formData, diet: e.target.value})}
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none appearance-none cursor-pointer focus:border-[#FF7A00]/30 focus:bg-white transition-all text-[#1A1A1A] font-bold text-sm"
                                    >
                                        <option>Non-Veg Protocol</option>
                                        <option>Vegetarian Protocol</option>
                                        <option>Keto High-Fat</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none text-[10px]"/>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-4">Objective</label>
                                <div className="relative">
                                    <select 
                                        value={formData.goal}
                                        onChange={e => setFormData({...formData, goal: e.target.value})}
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none appearance-none cursor-pointer focus:border-[#FF7A00]/30 focus:bg-white transition-all text-[#1A1A1A] font-bold text-sm"
                                    >
                                        <option>Weight Deficit</option>
                                        <option>Hypertrophy</option>
                                        <option>Metabolic Reset</option>
                                        <option>Peak Cognition</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none text-[10px]"/>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-4">Negative_Filters</label>
                                <input 
                                    value={formData.dislikes}
                                    onChange={e => setFormData({...formData, dislikes: e.target.value})}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 outline-none focus:border-[#FF7A00]/30 focus:bg-white transition-all font-mono text-[#1A1A1A] text-sm" 
                                    placeholder="e.g. peanuts, dairy" 
                                />
                            </div>

                            <div className="pt-4">
                                <SmartButton 
                                    label={isLoading ? "SYNCHRONIZING..." : "Initialize Synthesis"} 
                                    icon={isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Atom className="w-5 h-5" />}
                                    className="w-full !h-20 !text-[11px]"
                                    type="submit"
                                    disabled={isLoading}
                                />
                            </div>
                        </form>
                    </div>

                    {/* Result Module */}
                    <div className="relative h-full min-h-[500px]">
                        {!result && !isLoading && (
                            <div className="h-full bg-[#222222] rounded-[3.5rem] flex flex-col items-center justify-center p-12 text-center border border-white/5 shadow-2xl group animate-fade-in">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-4xl text-zinc-600 mb-10 group-hover:scale-110 transition-transform duration-700">
                                    <Satellite className="opacity-40"/>
                                </div>
                                <span className="text-[9px] font-mono font-black text-[#FF7A00] uppercase tracking-[0.8em] mb-4">Awaiting_Payload</span>
                                <p className="text-zinc-400 font-bold leading-relaxed">Enter your health details to generate a precision plan.</p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="h-full animate-fade-in">
                                <ResultSkeleton />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                                    <div className="w-20 h-20 bg-[#1A1A1A] rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 mb-6">
                                        <Dna className="text-[#FF7A00] text-3xl animate-pulse"/>
                                    </div>
                                    <span className="text-[9px] font-mono font-black text-[#FF7A00] uppercase tracking-[0.5em] animate-pulse">Architecting_Protocol...</span>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="bg-[#1A1A1A] p-10 sm:p-14 rounded-[3.5rem] border border-white/10 shadow-2xl animate-fade-in-pop relative h-full flex flex-col">
                                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Fingerprint className="text-9xl text-white"/></div>
                                
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <span className="text-[8px] font-mono font-black text-[#FF7A00] uppercase tracking-[0.4em] block mb-2">OUTPUT_GEN_01</span>
                                        <h3 className="text-4xl font-extrabold font-sans text-white tracking-tight uppercase">Your Matrix.</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[7px] font-mono font-black text-zinc-500 uppercase tracking-widest block mb-1">STABILITY</span>
                                        <span className="text-xl font-mono font-bold text-orange-400">99.8%</span>
                                    </div>
                                </div>

                                <div className="space-y-8 flex-grow">
                                    {[
                                        { label: 'ALPHA_SYNC (BFAST)', val: result.breakfast },
                                        { label: 'DELTA_SYNC (LUNCH)', val: result.lunch },
                                        { label: 'OMEGA_SYNC (DINNER)', val: result.dinner }
                                    ].map((meal, i) => (
                                        <div key={i} className="group/item">
                                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-2 block font-mono">{meal.label}</span>
                                            <h4 className="text-xl font-bold text-white mb-1 group-hover/item:text-[#FF7A00] transition-colors">{meal.val.name}</h4>
                                            <p className="text-zinc-300 text-xs font-semibold leading-relaxed line-clamp-2 italic">"{meal.val.reason}"</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex gap-10">
                                        <div className="flex flex-col">
                                            <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest mb-1">TOTAL_KCAL</span>
                                            <span className="text-lg font-mono font-bold text-white">{result.dailyTotals.calories}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[6px] font-black text-zinc-500 uppercase tracking-widest mb-1">PROTEIN_YLD</span>
                                            <span className="text-lg font-mono font-bold text-orange-400">{result.dailyTotals.protein}</span>
                                        </div>
                                    </div>
                                    <SmartButton 
                                        label="SYNC ALL" 
                                        variant="accent" 
                                        className="!h-14 !px-8 !text-[9px]" 
                                        href={PORTAL_LINKS.order}
                                        target="_blank"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <p className="mt-16 text-[9px] font-black uppercase tracking-[0.6em] text-zinc-300 flex items-center justify-center gap-4">
                    <span className="w-12 h-px bg-zinc-100"></span>
                    <Shield className="text-[#FF7A00]"/> End-to-End Encrypted Bio-Data Processing
                    <span className="w-12 h-px bg-zinc-100"></span>
                </p>
            </div>
            <style>{`
                @keyframes shimmer { 
                    0% { transform: translateX(-100%); } 
                    100% { transform: translateX(100%); } 
                }
                .animate-shimmer { animation: shimmer 2s infinite linear; }
                .animate-spin-slow { animation: spin 12s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </section>
    );
};
