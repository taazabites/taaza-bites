import { Check, Satellite, X, Zap } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { SmartButton } from './SmartButton';

// --- Animated SVG Components ---

const DrivingIcon = ({ active }: { active: boolean }) => (
    <svg 
        viewBox="0 0 24 24" 
        className={`w-8 h-8 transition-colors duration-500 ${active ? 'text-[#FF7A00]' : 'text-zinc-600'}`} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        aria-hidden="true"
    >
        <path d="M5 18h14M3 14l1.5-4.5A2 2 0 016.4 8h11.2a2 2 0 011.9 1.5L21 14v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4z" />
        <circle cx="7" cy="18" r="2" fill="currentColor" className={active ? 'animate-pulse' : ''} />
        <circle cx="17" cy="18" r="2" fill="currentColor" className={active ? 'animate-pulse' : ''} />
        {active && (
            <g className="animate-dash-move">
                <path d="M2 22h20" strokeDasharray="4 4" />
            </g>
        )}
    </svg>
);

const TransitIcon = ({ active }: { active: boolean }) => (
    <svg 
        viewBox="0 0 24 24" 
        className={`w-8 h-8 transition-colors duration-500 ${active ? 'text-[#FF7A00]' : 'text-zinc-600'}`} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        aria-hidden="true"
    >
        <rect x="6" y="3" width="12" height="15" rx="2" />
        <path d="M9 18l-2 3M15 18l2 3" />
        <circle cx="12" cy="7" r="1" fill="currentColor" />
        <path d="M9 11h6M9 14h6" />
        {active && (
            <circle cx="12" cy="12" r="8" className="animate-ping opacity-20" strokeWidth="0.5" />
        )}
    </svg>
);

const BicyclingIcon = ({ active }: { active: boolean }) => (
    <svg 
        viewBox="0 0 24 24" 
        className={`w-8 h-8 transition-colors duration-500 ${active ? 'text-[#FF7A00]' : 'text-zinc-600'}`} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        aria-hidden="true"
    >
        <circle cx="5.5" cy="17.5" r="3.5" className={active ? 'animate-spin-slow origin-[5.5px_17.5px]' : ''} />
        <circle cx="18.5" cy="17.5" r="3.5" className={active ? 'animate-spin-slow origin-[18.5px_17.5px]' : ''} />
        <path d="M15 6a1 1 0 100-2 1 1 0 000 2zm-3 11.5L9 10l3-5h3l2.5 3H21" />
        <path d="M5.5 17.5L9 10" />
    </svg>
);

const WalkingIcon = ({ active }: { active: boolean }) => (
    <svg 
        viewBox="0 0 24 24" 
        className={`w-8 h-8 transition-colors duration-500 ${active ? 'text-[#FF7A00]' : 'text-zinc-600'}`} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        aria-hidden="true"
    >
        <circle cx="12" cy="4" r="2" fill="currentColor" />
        <path d="M12 6v6m0 0l-2 5m2-5l2 5m-2-5l-3-2m3 2l3-2" className={active ? 'animate-walking-limbs' : ''} />
    </svg>
);

interface CommuteNode {
    id: string;
    label: string;
    description: string;
    status: 'completed' | 'active' | 'pending';
    timestamp?: string;
}

const COMMUTE_STAGES: CommuteNode[] = [
    { id: '1', label: 'Synthesis', description: 'Meal engineered & Bio-sealed', status: 'completed', timestamp: '04:20 AM' },
    { id: '2', label: 'Thermal Lock', description: 'Pod secured in cold-chain', status: 'completed', timestamp: '06:15 AM' },
    { id: '3', label: 'In Transit', description: 'Grid transit: Active deployment', status: 'active' },
    { id: '4', label: 'Last Mile', description: 'Final approach to coordinates', status: 'pending' },
    { id: '5', label: 'Deployment', description: 'Bio-Pod delivered', status: 'pending' }
];

type TransitMode = 'driving' | 'transit' | 'bicycling' | 'walking';

export const Commutes: React.FC = () => {
    const [eta, setEta] = useState(18);
    const [integrity, setIntegrity] = useState(99.8);
    const [temp, setTemp] = useState(4.2);
    const [showModal, setShowModal] = useState(false);
    const [activeMode, setActiveMode] = useState<TransitMode>('driving');
    const statusHeaderRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setEta(prev => Math.max(1, prev - (Math.random() > 0.8 ? 1 : 0)));
            setIntegrity(prev => parseFloat((prev + (Math.random() - 0.5) * 0.05).toFixed(1)));
            setTemp(prev => parseFloat((prev + (Math.random() - 0.5) * 0.1).toFixed(1)));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleNodeClick = (node: CommuteNode) => {
        if (navigator.vibrate) navigator.vibrate(12);
        if (node.status === 'active') {
            setShowModal(true);
        } else {
            statusHeaderRef.current?.focus();
        }
    };

    const MODES: { id: TransitMode; label: string; fullLabel: string; icon: React.FC<{ active: boolean }> }[] = [
        { id: 'driving', label: 'RAPID', fullLabel: 'Rapid Driving Mode', icon: DrivingIcon },
        { id: 'transit', label: 'GRID', fullLabel: 'Public Grid Transit Mode', icon: TransitIcon },
        { id: 'bicycling', label: 'PULSE', fullLabel: 'Bicycling Pulse Mode', icon: BicyclingIcon },
        { id: 'walking', label: 'LINK', fullLabel: 'Walking Link Mode', icon: WalkingIcon }
    ];

    return (
        <section 
            id="commutes" 
            className="py-24 sm:py-48 bg-[#050505] text-white relative overflow-hidden"
            aria-labelledby="commute-heading"
        >
            {/* Grid Overlay for Visual Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
                <div className="absolute inset-0 bg-[linear-gradient(#FF7A00_1px,transparent_1px),gradient(90deg,#FF7A00_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            </div>

            <div className="max-w-site mx-auto px-6 relative z-10 w-full">
                <div className="text-center mb-16 sm:mb-20">
                    <span className="text-[9px] sm:text-[10px] font-mono font-black text-[#FF7A00] uppercase tracking-[0.6em] mb-6 block">
                        Live_Grid_Monitor
                    </span>
                    <h2 id="commute-heading" className="text-5xl sm:text-8xl font-light font-serif tracking-tighter leading-[0.9] mb-8 sm:mb-10">
                        Active <span className="text-[#FF7A00]">Commutes.</span>
                    </h2>
                    <p className="text-zinc-500 max-w-xl mx-auto text-base sm:text-lg font-light leading-relaxed">
                        Real-time tracking of your healthy meals as they navigate the Bengaluru delivery network.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Progress HUD */}
                    <div className="lg:col-span-8 bg-[#222222]/40 backdrop-blur-2xl rounded-[3rem] sm:rounded-[4rem] border border-white/5 p-8 sm:p-16 shadow-2xl relative overflow-hidden">
                        <header className="flex justify-between items-start mb-12 sm:mb-16">
                            <div>
                                <h3 
                                    ref={statusHeaderRef}
                                    tabIndex={-1}
                                    className="text-2xl sm:text-3xl font-light font-serif mb-2 outline-none focus:text-[#FF7A00] transition-colors"
                                >
                                    Mission_TB-9455
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-ping" aria-hidden="true"></span>
                                    <span className="text-[8px] sm:text-[9px] font-mono font-black text-[#FF7A00] uppercase tracking-widest">In_Transit</span>
                                </div>
                            </div>
                            <div className="text-right" aria-live="polite">
                                <span className="text-[7px] sm:text-[8px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">ETA</span>
                                <span className="text-4xl sm:text-5xl font-mono font-black text-white tabular-nums">{eta}m</span>
                            </div>
                        </header>

                        {/* Commute Stepper */}
                        <div className="relative" role="list" aria-label="Delivery progress stages">
                            <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800" aria-hidden="true"></div>
                            <div className="space-y-10 sm:space-y-12 relative">
                                {COMMUTE_STAGES.map((node, idx) => (
                                    <div key={node.id} className="flex gap-6 sm:gap-10 items-start group" role="listitem">
                                        <button 
                                            className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 touch-none ${
                                                node.status === 'completed' ? 'bg-[#FF7A00] border-[#FF7A00] text-[#1A1A1A]' : 
                                                node.status === 'active' ? 'bg-[#1A1A1A] border-[#FF7A00] text-[#FF7A00] shadow-[0_0_20px_#FF7A00] cursor-pointer hover:scale-110 active:scale-95' : 
                                                'bg-zinc-900 border-zinc-800 text-[#1A1A1A]'
                                            }`}
                                            aria-label={`${node.label}: ${node.status === 'active' ? 'Current Active Phase. Tap to view transit lens.' : node.status}. ${node.description}`}
                                            onClick={() => handleNodeClick(node)}
                                            disabled={node.status === 'pending'}
                                        >
                                            {node.status === 'completed' ? (
                                                <Check className="text-xs sm:text-sm" aria-hidden="true"/>
                                            ) : node.status === 'active' ? (
                                                <Satellite className="text-[10px] sm:text-xs animate-pulse" aria-hidden="true"/>
                                            ) : (
                                                <span className="text-[10px] sm:text-xs font-mono font-black" aria-hidden="true">{idx + 1}</span>
                                            )}
                                        </button>
                                        <div className="pt-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                                <h4 className={`text-lg sm:text-xl font-bold ${node.status === 'pending' ? 'text-[#1A1A1A]' : 'text-white'}`}>
                                                    {node.label}
                                                </h4>
                                                {node.status === 'active' && (
                                                    <span className="text-[6px] sm:text-[7px] font-mono bg-[#FF7A00]/10 text-[#FF7A00] px-2 py-0.5 rounded border border-[#FF7A00]/20 animate-pulse">TAP_FOR_LENS</span>
                                                )}
                                                {node.timestamp && (
                                                    <span className="text-[8px] sm:text-[9px] font-mono text-zinc-500 uppercase">{node.timestamp}</span>
                                                )}
                                            </div>
                                            <p className={`text-xs sm:text-sm font-light leading-relaxed ${node.status === 'pending' ? 'text-[#1A1A1A]' : 'text-zinc-400'}`}>
                                                {node.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sensor Array Sidebar */}
                    <div className="lg:col-span-4 space-y-6 sm:space-y-8">
                        <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] sm:rounded-[3rem] border border-white/5 p-8 sm:p-10 shadow-xl overflow-hidden relative">
                            <h3 className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-[0.4em] mb-8 sm:mb-10">Sensor_Telemetry</h3>
                            
                            <div className="space-y-10 sm:space-y-12">
                                <div role="group" aria-label="Thermal stability telemetry">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest" id="thermal-label">Thermal_Lock</span>
                                        <span className="text-xl sm:text-2xl font-mono font-black text-cyan-400 tabular-nums" aria-live="polite">{temp}°C</span>
                                    </div>
                                    <div 
                                        className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden" 
                                        role="progressbar" 
                                        aria-valuenow={temp} 
                                        aria-valuemin={0} 
                                        aria-valuemax={10}
                                        aria-labelledby="thermal-label"
                                    >
                                        <div className="h-full bg-cyan-400 transition-all duration-1000 shadow-[0_0_10px_#22D3EE]" style={{ width: `${(temp/10)*100}%` }}></div>
                                    </div>
                                </div>

                                <div role="group" aria-label="meal freshness tracking">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest" id="bio-integrity-label">Bio_Integrity</span>
                                        <span className="text-xl sm:text-2xl font-mono font-black text-orange-400 tabular-nums" aria-live="polite">{integrity}%</span>
                                    </div>
                                    <div 
                                        className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden" 
                                        role="progressbar" 
                                        aria-valuenow={integrity} 
                                        aria-valuemin={0} 
                                        aria-valuemax={100}
                                        aria-labelledby="bio-integrity-label"
                                    >
                                        <div className="h-full bg-orange-400 transition-all duration-1000 shadow-[0_0_10px_#10B981]" style={{ width: `${integrity}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Scanline Decoration */}
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(65,139,30,0.05)_50%,transparent_100%)] bg-[size:100%_40px] animate-scan-y-infinite pointer-events-none" aria-hidden="true"></div>
                        </div>

                        <div className="bg-[#FF7A00] p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] text-[#1A1A1A] shadow-xl group">
                            <h3 className="text-xl sm:text-2xl font-light font-serif mb-4 sm:mb-6 leading-tight">Freshness Tracking Active</h3>
                            <p className="text-xs sm:text-sm font-medium mb-8 sm:mb-10 opacity-80 italic">"Our logistics framework ensures 100% molecular fidelity through the transit node."</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Commutes Transit Modal --- */}
            {showModal && (
                <div 
                    className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" 
                    role="dialog" 
                    aria-modal="true" 
                    aria-labelledby="modal-title"
                >
                    <div className="absolute inset-0 bg-[#1A1A1A]/90 backdrop-blur-xl" onClick={() => setShowModal(false)} aria-hidden="true"></div>
                    <div className="relative bg-zinc-900 w-full max-w-2xl rounded-t-[3rem] sm:rounded-[4rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up sm:animate-scale-up max-h-[92vh] flex flex-col">
                        
                        <div className="sm:hidden w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mt-4 mb-2" aria-hidden="true"></div>

                        {/* Header */}
                        <div className="p-8 sm:p-12 border-b border-white/5 flex justify-between items-center bg-[#1A1A1A]/50 shrink-0">
                            <div>
                                <span className="text-[7px] sm:text-[8px] font-mono font-black text-[#FF7A00] uppercase tracking-[0.6em] block mb-2">TRANSIT_PROTOCOL_X0</span>
                                <h3 id="modal-title" className="text-2xl sm:text-3xl font-light font-serif text-white tracking-tight">Grid Logistics Lens</h3>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-white"
                                aria-label="Close Transit Lens Modal"
                            >
                                <X />
                            </button>
                        </div>

                        <div className="p-8 sm:p-12 space-y-10 sm:space-y-12 overflow-y-auto custom-scrollbar flex-grow pb-safe">
                            {/* Mode Selector */}
                            <div className="space-y-6" role="radiogroup" aria-labelledby="mode-selection-heading">
                                <span className="text-[8px] sm:text-[9px] font-black text-zinc-500 uppercase tracking-widest block ml-2" id="mode-selection-heading">Active_Mode_Selection</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    {MODES.map((mode) => (
                                        <button 
                                            key={mode.id}
                                            onClick={() => { if(navigator.vibrate) navigator.vibrate(8); setActiveMode(mode.id); }}
                                            className={`p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col items-center gap-3 sm:gap-4 group touch-none active:scale-95 ${
                                                activeMode === mode.id 
                                                ? 'bg-[#FF7A00]/10 border-[#FF7A00] shadow-[0_0_30px_rgba(65,139,30,0.2)]' 
                                                : 'bg-[#1A1A1A] border-zinc-800 hover:border-zinc-700'
                                            }`}
                                            aria-pressed={activeMode === mode.id}
                                            aria-label={`Select ${mode.fullLabel}`}
                                            role="radio"
                                        >
                                            <mode.icon active={activeMode === mode.id} />
                                            <span className={`text-[7px] sm:text-[8px] font-mono font-black uppercase tracking-[0.2em] sm:tracking-widest ${activeMode === mode.id ? 'text-[#FF7A00]' : 'text-zinc-600'}`}>
                                                {mode.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Analytics HUD */}
                            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                                <div className="bg-[#1A1A1A] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-white/5 relative overflow-hidden" role="group" aria-label="Latency Analytics">
                                    <div className="relative z-10 flex justify-between items-end">
                                        <div>
                                            <span className="text-[6px] sm:text-[7px] font-black text-zinc-500 uppercase tracking-widest block mb-2" id="node-latency-label">NODE_LATENCY</span>
                                            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums" aria-labelledby="node-latency-label">
                                                {activeMode === 'driving' ? '04.2' : activeMode === 'transit' ? '12.8' : activeMode === 'bicycling' ? '08.5' : '15.2'}
                                                <span className="text-[10px] text-zinc-600 ml-1">MS</span>
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] text-xs" aria-hidden="true">
                                            <Zap className="animate-pulse"/>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FF7A00]/20" aria-hidden="true">
                                        <div className="h-full bg-[#FF7A00] animate-shimmer" style={{ width: '60%' }}></div>
                                    </div>
                                </div>

                                <div className="bg-[#1A1A1A] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-white/5" role="group" aria-label="Thermal integrity state">
                                    <span className="text-[6px] sm:text-[7px] font-black text-zinc-500 uppercase tracking-widest block mb-2" id="thermal-integrity-modal-label">THERMAL_INTEGRITY</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl sm:text-3xl font-mono font-bold text-orange-400 tabular-nums" aria-labelledby="thermal-integrity-modal-label">{integrity}%</span>
                                        <div className="flex gap-1 h-3 items-end" aria-hidden="true">
                                            {[1,2,3,4].map(i => <div key={i} className="w-0.5 sm:w-1 bg-orange-500 rounded-full animate-pulse" style={{ height: `${20 + i*20}%`, animationDelay: `${i*0.2}s` }}></div>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scan-y-infinite {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(400%); }
                }
                .animate-scan-y-infinite { animation: scan-y-infinite 6s linear infinite; }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer { animation: shimmer 2s infinite linear; }

                @keyframes dash-move {
                    0% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: 8; }
                }
                .animate-dash-move { animation: dash-move 0.5s linear infinite; }

                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow { animation: spin-slow 2s linear infinite; }

                @keyframes walking-limbs {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(0.95); }
                }
                .animate-walking-limbs { animation: walking-limbs 0.6s ease-in-out infinite; }
                
                .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
            `}</style>
        </section>
    );
};