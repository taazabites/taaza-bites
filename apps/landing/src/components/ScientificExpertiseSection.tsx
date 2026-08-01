import React from 'react';
import { ShieldCheck, Activity, Award, CheckCircle2, UserCheck, Stethoscope } from 'lucide-react';

const EXPERTS = [
    {
        name: "Dr. Ananya Rao",
        role: "Chief Nutrition Strategist",
        qual: "MSc Nutrition & Dietetics",
        desc: "Specializes in hormonal health (PCOS/PCOD) and clinical weight management. Oversees every macro-calculation on the Taazabites platform."
    },
    {
        name: "Chef Vikram Sethi",
        role: "Head of Culinary Operations",
        qual: "15+ Years Culinary Exp.",
        desc: "Expert in Low-GI Indian cooking and cold-chain integrity. Ensures flavor profile consistency without using refined oils or synthetic additives."
    }
];

const CERTIFICATIONS = [
    { label: "FSSAI LICENSED", value: "#21223188002425" },
    { label: "KITCHEN GRADE", value: "CLINICAL-H1" },
    { label: "WATER PURITY", value: "RO-UV-7S" },
    { label: "PACKAGING", value: "ECO-FRIENDLY CONTAINERS" }
];

export const ScientificExpertiseSection: React.FC = () => {
    return (
        <section id="expertise" className="py-16 sm:py-24 bg-[#0A0A0A] text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#059669] rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#FF7A00] rounded-full blur-[120px]"></div>
            </div>
 
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-24 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] tracking-widest uppercase mb-6 sm:mb-8">
                            <Activity className="w-3 h-3" /> Expertly Verified
                        </div>
                        <h2 className="text-[12vw] sm:text-5xl lg:text-6xl font-serif font-light leading-[1.1] mb-6 sm:mb-8 tracking-tight">
                            The Care Behind Every <span className="italic text-emerald-500">Macro-Sync</span>
                        </h2>
                        <p className="text-zinc-400 text-sm sm:text-lg font-light leading-relaxed mb-8 sm:mb-12">
                            Your health is personal, so our nutrition is too. We don't just cook—we calibrate. Every Taazabites meal is a collaboration between certified clinical dietitians and master chefs, ensuring your body gets exactly what it needs to thrive.
                        </p>
 
                        <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
                            {CERTIFICATIONS.map((cert, i) => (
                                <div key={i} className="space-y-0.5 sm:space-y-1">
                                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{cert.label}</span>
                                    <p className="text-xs sm:text-sm font-bold text-white">{cert.value}</p>
                                </div>
                            ))}
                        </div>
 
                        <div className="flex flex-wrap gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] sm:text-xs font-medium">
                                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> FSSAI Certified Kitchen
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] sm:text-xs font-medium">
                                <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" /> Dietitian Approved
                            </div>
                        </div>
                    </div>
 
                    <div className="flex overflow-x-auto pb-6 sm:pb-8 -mx-6 px-6 lg:mx-0 lg:px-0 lg:flex-col gap-4 sm:gap-6 snap-x snap-mandatory scrollbar-hide">
                        {EXPERTS.map((expert, i) => (
                            <div key={i} className="flex-shrink-0 w-[80vw] lg:w-full snap-center group p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
                                    <Award className="w-24 h-24 sm:w-32 sm:h-32" />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative z-10">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0">
                                        <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1">{expert.name}</h3>
                                        <p className="text-emerald-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">{expert.role} • {expert.qual}</p>
                                        <p className="text-zinc-400 text-[13px] sm:text-sm font-light leading-relaxed">
                                            {expert.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <div className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4 sm:gap-6 w-[80vw] lg:w-full flex-shrink-0 snap-center">
                            <div>
                                <h4 className="text-white text-sm sm:text-base font-bold mb-0.5 sm:mb-1">Weekly Clinical Review</h4>
                                <p className="text-zinc-400 text-[10px] sm:text-xs font-light leading-snug">All meal rotation macros are validated against updated RDA guidelines every Sunday.</p>
                            </div>
                            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 shrink-0" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
