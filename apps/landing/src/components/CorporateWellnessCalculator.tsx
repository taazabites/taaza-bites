import { RefreshCw } from 'lucide-react';
import { TrendingUp, Loader2 } from 'lucide-react';

import React, { useState } from 'react';
import { SmartButton } from './SmartButton';

interface Projection {
    productivityIncrease: number;
    sickDaysReduction: number;
    annualRoi: number;
    summary: string;
}

const StatBlock: React.FC<{ label: string; val: number; unit: string; color: string }> = ({ label, val, unit, color }) => (
    <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 text-center group/stat transition-all hover:bg-white hover:shadow-xl">
        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">{label}</p>
        <div className={`text-4xl font-mono font-black ${color} tracking-tighter mb-1 tabular-nums group-hover:scale-110 transition-transform`}>
            {val}<span className="text-sm opacity-40 ml-1">{unit}</span>
        </div>
    </div>
);

const ProjectionSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-100/10 to-transparent -translate-x-full animate-shimmer"></div>
        <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-zinc-50 rounded-[2rem] border border-zinc-100"></div>
            <div className="h-32 bg-zinc-50 rounded-[2rem] border border-zinc-100"></div>
        </div>
        <div className="h-48 bg-[#1A1A1A] rounded-[2.5rem] border border-white/5"></div>
    </div>
);

export const CorporateWellnessCalculator: React.FC = () => {
    const [numEmployees, setNumEmployees] = useState(120);
    const [healthScore, setHealthScore] = useState(7);
    const [projection, setProjection] = useState<Projection | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCalculate = async () => {
        setIsLoading(true);
        if (navigator.vibrate) navigator.vibrate(10);
        try {
            const response = await fetch('/api/corporate-wellness', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employees: numEmployees, mealsPerWeek: 5, healthScore })
            });
            if (!response.ok) throw new Error('Failed to generate projection');
            const result = await response.json();
            setProjection(result);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-10">
            <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-4">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373] animate-pulse"></div>
                     <span className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-[0.4em]">Diagnostic_Tool_v2</span>
                </div>
                <h3 className="text-3xl font-light font-serif text-[#1A1A1A] mb-2">Workforce Analytics</h3>
                <p className="text-zinc-400 text-sm font-light">Project the health impact on your fleet.</p>
            </div>

            <div className="space-y-8">
                <div className="space-y-5">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Staff</span>
                        <span className="text-xl font-mono font-bold text-[#1A1A1A] tabular-nums">{numEmployees}</span>
                    </div>
                    <input 
                        type="range" min="10" max="1000" value={numEmployees} 
                        onChange={e => setNumEmployees(Number(e.target.value))} 
                        className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none accent-[#FF7A00] cursor-pointer"
                    />
                </div>

                <div className="space-y-5">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Vitality Baseline</span>
                        <span className="text-xl font-mono font-bold text-[#1A1A1A] tabular-nums">{healthScore}/10</span>
                    </div>
                    <input 
                        type="range" min="1" max="10" value={healthScore} 
                        onChange={e => setHealthScore(Number(e.target.value))} 
                        className="w-full h-1.5 bg-zinc-100 rounded-full appearance-none accent-[#D4A373] cursor-pointer"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-8">
                    <SmartButton label="Processing Grid Data..." variant="primary" disabled icon={<Loader2 className="w-5 h-5 animate-spin" />} className="w-full !h-18" />
                    <ProjectionSkeleton />
                </div>
            ) : !projection ? (
                <SmartButton 
                    label="Run Wellness Projection"
                    variant="primary"
                    onClick={handleCalculate}
                    icon={<TrendingUp className="w-5 h-5" />}
                    className="w-full !h-18"
                />
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <StatBlock label="Efficiency Gain" val={projection.productivityIncrease} unit="%" color="text-orange-600" />
                        <StatBlock label="Health Stability" val={projection.sickDaysReduction} unit="%" color="text-cyan-600" />
                    </div>
                    <div className="bg-[#1A1A1A] text-white p-10 rounded-[2.5rem] relative overflow-hidden ring-1 ring-white/10">
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-4 font-mono">Summary_Report_0xFA</p>
                        <p className="text-lg font-serif italic leading-relaxed text-zinc-200">"{projection.summary}"</p>
                        <button 
                            onClick={() => setProjection(null)} 
                            className="mt-10 text-[9px] font-black text-[#FF7A00] uppercase tracking-[0.3em] flex items-center gap-2 group/back"
                        >
                            <RefreshCw className="w-4 h-4 group-hover:rotate-[-90deg] transition-transform"/> Recalculate Node
                        </button>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A00]/10 blur-3xl rounded-full"></div>
                    </div>
                </div>
            )}
        </div>
    );
};
