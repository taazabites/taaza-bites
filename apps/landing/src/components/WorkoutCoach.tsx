import { PORTAL_LINKS } from '../config';
import { ChevronDown, Check, Lightbulb } from 'lucide-react';
import { Zap, Loader2, Cpu } from 'lucide-react';

import React, { useState } from 'react';
import { SmartButton } from './SmartButton';

const baseWorkoutItems = [
    { title: "Mountain Sync Flow", reps: "5 rounds", desc: " Mountain pose to forward fold, plank, chaturanga, and dog variations.", tip: "Breath synchronization is priority." },
    { title: "Kinetic Squats", reps: "15 reps", desc: "Feet shoulder-width. Controlled hip descent. High chest stability.", tip: "Heel drive ensures glute activation." },
    { title: "Core Handshake (Push-ups)", reps: "10-12 reps", desc: "Wide hands. Straight-line identity from vertex to heels.", tip: "Modify on nodes (knees) if form decays." },
    { title: "Static ISO-Plank", reps: "45 seconds", desc: "Forearm engagement. Core tension max. High glute sync.", tip: "Focus on neural steady-state." },
];

export const WorkoutCoach: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [workoutItems, setWorkoutItems] = useState(baseWorkoutItems);
    const [completed, setCompleted] = useState<boolean[]>(new Array(baseWorkoutItems.length).fill(false));

    const toggle = (i: number) => {
        if (navigator.vibrate) navigator.vibrate(10);
        const next = [...completed];
        next[i] = !next[i];
        setCompleted(next);
    };

    const generateProtocol = () => {
        setIsGenerating(true);
        if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
        
        // Simulated AI shuffle/gen
        setTimeout(() => {
            const shuffled = [...baseWorkoutItems].sort(() => 0.5 - Math.random());
            setWorkoutItems(shuffled);
            setCompleted(new Array(shuffled.length).fill(false));
            setIsGenerating(false);
        }, 1200);
    };

    const progress = Math.round((completed.filter(Boolean).length / workoutItems.length) * 100);

    return (
        <section className="py-24 sm:py-56 bg-white relative overflow-hidden" id="workout-coach">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16 sm:mb-32 animate-on-scroll">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4A373] mb-8 block font-mono">MOVEMENT_LAB_SYNC</span>
                    <h2 className="text-5xl sm:text-8xl font-extrabold font-sans uppercase text-[#1A1A1A] mb-10 tracking-tighter leading-[0.85]">
                        Neural <br className="sm:hidden" /> <span className="text-[#FF7A00]">Coaching.</span>
                    </h2>
                    <p className="text-zinc-700 max-w-xl mx-auto text-lg sm:text-2xl font-bold leading-relaxed">
                        Complement your nutrition plan with AI-calibrated movement patterns. Zero equipment. 100% focused on your health.
                    </p>
                </div>

                {/* Generator HUD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 bg-zinc-50/50 p-8 sm:p-12 rounded-[3.5rem] border border-zinc-100 shadow-xl relative overflow-hidden animate-on-scroll">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:100%_30px] pointer-events-none"></div>
                    
                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-4 font-mono">SYST_INTENSITY</label>
                        <div className="relative">
                            <select className="w-full bg-white border border-zinc-200 rounded-[1.5rem] px-6 py-4 outline-none focus:border-[#D4A373]/50 text-[#1A1A1A] font-bold transition-all cursor-pointer appearance-none shadow-sm">
                                <option>Level_01 (Baseline)</option>
                                <option>Level_02 (Optimal)</option>
                                <option>Level_03 (Peak_Demand)</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none text-xs"/>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-4 font-mono">TARGET_REGION</label>
                        <div className="relative">
                            <select className="w-full bg-white border border-zinc-200 rounded-[1.5rem] px-6 py-4 outline-none focus:border-[#D4A373]/50 text-[#1A1A1A] font-bold transition-all cursor-pointer appearance-none shadow-sm">
                                <option>System_Wide (Full)</option>
                                <option>Core_Stability</option>
                                <option>Lower_Drive</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none text-xs"/>
                        </div>
                    </div>
                    
                    <div className="md:col-span-2 mt-6 relative">
                        <SmartButton 
                            label={isGenerating ? "GENERATING PROTOCOL..." : "Initialize Protocol"}
                            variant="primary"
                            icon={isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                            className={`w-full !h-20 !text-[11px] ${isGenerating ? 'opacity-80 cursor-wait' : ''}`}
                            onClick={generateProtocol}
                            disabled={isGenerating}
                        />
                        {/* Subtle progress indicator during generation */}
                        <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-zinc-200 rounded-full overflow-hidden transition-all duration-500 ${isGenerating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                            <div className="h-full w-full bg-gradient-to-r from-orange-400 via-orange-600 to-orange-400 bg-[length:200%_auto] animate-[shine_1.5s_linear_infinite] rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Workout List */}
                <div className={`space-y-12 transition-all duration-700 ${isGenerating ? 'opacity-30 blur-sm pointer-events-none scale-95' : 'opacity-100 blur-0'}`}>
                    <div className="text-center mb-16">
                        <div className="flex justify-between items-end px-2 mb-4">
                            <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">Protocol_Fulfillment</span>
                            <span className="text-xl font-mono font-black text-[#FF7A00] tabular-nums">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-[#D4A373] to-[#FF7A00] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_15px_#10B981]" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {workoutItems.map((item, i) => (
                            <div 
                                key={i} 
                                className={`p-8 sm:p-10 rounded-[3rem] border transition-all duration-700 cursor-pointer group/card ${
                                    completed[i] 
                                    ? 'bg-zinc-50 border-zinc-200 opacity-60' 
                                    : 'bg-white border-zinc-100 shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-1'
                                }`} 
                                onClick={() => toggle(i)}
                            >
                                <div className="flex items-start gap-8">
                                    <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all duration-700 ${
                                        completed[i] ? 'bg-[#FF7A00] border-[#FF7A00] text-white shadow-[0_0_20px_#10B981]' : 'border-zinc-200 text-transparent group-hover/card:border-[#D4A373]/50'
                                    }`}>
                                        <Check className="text-sm"/>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                                            <h4 className={`font-extrabold text-2xl font-sans uppercase ${completed[i] ? 'line-through text-zinc-400' : 'text-[#1A1A1A] group-hover/card:text-[#FF7A00]'}`}>{item.title}</h4>
                                            <span className="text-[10px] font-mono font-black text-[#FF7A00] uppercase bg-yellow-50 px-4 py-1.5 rounded-full w-fit border border-yellow-100/50">{item.reps}</span>
                                        </div>
                                        <p className="text-zinc-700 text-base leading-relaxed mb-6 font-semibold">{item.desc}</p>
                                        <div className="flex items-center gap-4 text-[9px] font-black text-[#FF7A00] uppercase tracking-widest bg-orange-50/50 px-5 py-3 rounded-2xl w-fit border border-orange-100/50 group-hover/card:bg-orange-100/50 transition-all">
                                            <Lightbulb className="text-[#D4A373]"/> 
                                            <span className="opacity-40">PRO_TIP_0{i+1}:</span> {item.tip}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#1A1A1A] rounded-[4rem] p-10 sm:p-20 text-white relative overflow-hidden shadow-2xl animate-on-scroll group/cta">
                         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF7A00]/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover/cta:scale-125 transition-transform duration-[4s]"></div>
                         <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4A373]/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

                         <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                            <div className="text-center lg:text-left flex-1">
                                <div className="inline-flex items-center gap-3 mb-8">
                                    <div className="w-2 h-2 rounded-full bg-[#D4A373] animate-ping"></div>
                                    <span className="text-[#D4A373] text-[10px] font-black uppercase tracking-[0.5em] block font-mono">POST_SESSION_SYNC</span>
                                </div>
                                <h4 className="text-4xl sm:text-6xl font-extrabold font-sans uppercase mb-8 leading-[0.9] tracking-tighter">Bio-Repair <br/> <span className="text-[#FF7A00]">Protocol.</span></h4>
                                <p className="text-zinc-200 text-lg font-bold leading-relaxed max-w-sm">
                                    Precisely <span className="text-white font-black font-mono">42g</span> of high-yield protein waiting to repair your cellular identity.
                                </p>
                            </div>
                            <div className="shrink-0 w-full lg:w-auto">
                                <SmartButton 
                                    label="Synchronize Meal" 
                                    href={PORTAL_LINKS.order}
                                    target="_blank"
                                    variant="accent"
                                    icon={<Zap className="w-5 h-5" />}
                                    className="w-full lg:w-72 !h-24 !text-xs"
                                />
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
