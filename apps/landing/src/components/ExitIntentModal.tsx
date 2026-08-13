import { PORTAL_LINKS } from '../config';
import { X, Dna, CheckCircle, ArrowRight } from 'lucide-react';

import React, { useEffect, useRef, useState } from 'react';
import { LazyImage } from './LazyImage';

export interface ExitIntentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DecryptText: React.FC<{ text: string; reveal: boolean }> = ({ text, reveal }) => {
    const [display, setDisplay] = useState(reveal ? text : "........");
    
    useEffect(() => {
        if (!reveal) return;
        
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplay(prev => 
                text
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) return text[index];
                        return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)];
                    })
                    .join("")
            );
            
            if (iteration >= text.length) clearInterval(interval);
            iteration += 1 / 3;
        }, 40);
        
        return () => clearInterval(interval);
    }, [reveal, text]);

    return <span className="font-mono tracking-[0.2em]">{display}</span>;
};

export const ExitIntentModal: React.FC<ExitIntentModalProps> = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState<'analyzing' | 'authorized'>('analyzing');
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(100);

    useEffect(() => {
        if (!isOpen) {
            setStatus('analyzing');
            setProgress(0);
            return;
        }

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setStatus('authorized'), 400);
                    return 100;
                }
                return prev + 4;
            });
        }, 40);

        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 0.05));
        }, 100);

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, [isOpen]);

    const handleCopy = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("TAAZA20").catch((err) => console.error("Clipboard copy failed:", err));
        }
        setCopied(true);
        if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;
    
    const promoImage = "https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg";

    return (
        <div 
            className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-xl z-[10000] flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-[#F5F2ED] w-full max-w-2xl rounded-[4rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.4)] relative border border-white flex flex-col md:flex-row group/modal animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Visual Side */}
                <div className="relative h-40 md:h-auto md:w-5/12 overflow-hidden shrink-0 bg-[#222222]">
                    <LazyImage 
                        src={promoImage}
                        alt="High-yield premium nutrition Bengaluru" 
                        className="w-full h-full object-cover transition-transform duration-[12s] group-hover/modal:scale-110 opacity-70" 
                        wrapperClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#F5F2ED] via-transparent to-transparent md:bg-gradient-to-r"></div>
                    
                    <div className="absolute top-6 left-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 text-[8px] font-black text-white uppercase tracking-widest shadow-xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_10px_#10B981]"></span>
                            GRANT_ACTIVE
                        </div>
                    </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 p-8 sm:p-10 relative flex flex-col justify-center min-h-[440px]">
                    <button 
                        onClick={onClose} 
                        className="absolute top-6 right-6 w-10 h-10 rounded-[1.2rem] bg-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 transition-all active:scale-90 z-20"
                        aria-label="Close modal"
                    >
                        <X className="text-lg"/>
                    </button>

                    {status === 'analyzing' ? (
                        <div className="h-full py-4 animate-fade-in flex flex-col justify-center text-center md:text-left">
                            <div className="mb-8">
                                <div className="w-14 h-14 bg-orange-50 rounded-[1.8rem] flex items-center justify-center text-orange-600 mb-6 mx-auto md:mx-0 shadow-inner">
                                    <Dna className="text-2xl animate-pulse"/>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] font-sans mb-2 leading-none tracking-tighter uppercase">Syncing Profile...</h3>
                                <p className="text-zinc-500 text-base leading-relaxed font-light">Identifying high-yield nutritional gaps.</p>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-orange-600 font-mono">
                                    <span>CALIBRATING</span>
                                    <span className="tabular-nums">{progress}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden p-[2px] border border-zinc-50 shadow-inner">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#FF7A00] to-[#86efac] rounded-full transition-all duration-150 ease-linear shadow-[0_0_20px_rgba(65,139,30,0.4)]" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full animate-fade-in-pop text-center md:text-left">
                            <div className="mb-8">
                                <div className="inline-flex items-center gap-2 mb-4 text-[#FF7A00] text-[10px] font-black uppercase tracking-[0.4em] font-mono">
                                    <CheckCircle /> ACCESS_GRANTED
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-extrabold font-sans text-[#1A1A1A] mb-4 tracking-tighter leading-[0.9] uppercase">
                                    Fuel Your <br/> <span className="text-[#FF7A00] font-script normal-case tracking-normal">Peak Self.</span>
                                </h2>
                                <p className="text-zinc-500 text-base leading-relaxed max-w-sm mx-auto md:mx-0 font-light">
                                    Unlock elite nutrition today. authorized <span className="text-[#FF7A00] font-bold">20% Intro-Grant</span>.
                                </p>
                            </div>

                            {/* Tactical Offer Module */}
                            <div 
                                onClick={handleCopy}
                                className="relative bg-white border-2 border-dashed border-orange-100 rounded-[2rem] p-2.5 flex items-center justify-between mb-8 cursor-pointer group/coupon hover:border-orange-500 transition-all duration-500 active:scale-[0.98] shadow-sm hover:shadow-lg"
                            >
                                <div className="flex flex-col pl-4 py-2">
                                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-1 font-mono">GRID_KEY</span>
                                    <span className="text-xl font-black text-[#1A1A1A] group-hover:text-[#FF7A00] transition-colors leading-none">
                                        <DecryptText text="TAAZA20" reveal={true} />
                                    </span>
                                </div>

                                <div className={`h-12 px-6 rounded-[1.4rem] flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-xl ${copied ? 'bg-[#FF7A00] text-white' : 'bg-[#1A1A1A] text-white hover:bg-[#FF7A00]'}`}>
                                    {copied ? 'DONE' : 'COPY'}
                                </div>

                                <div className="absolute -top-3 -right-3 w-10 h-10 bg-white border border-zinc-50 rounded-2xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 -rotate-90">
                                        <circle cx="12" cy="12" r="10" stroke="#F4F4F5" strokeWidth="2" fill="transparent" />
                                        <circle 
                                            cx="12" cy="12" r="10" 
                                            stroke="#FF7A00" strokeWidth="2" fill="transparent" 
                                            strokeDasharray={2 * Math.PI * 10}
                                            strokeDashoffset={(2 * Math.PI * 10) * (1 - timeLeft / 100)}
                                            className="transition-all duration-1000 ease-linear"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <a 
                                href={PORTAL_LINKS.order}
                                className="relative h-16 w-full rounded-[1.5rem] bg-[#1A1A1A] text-white flex items-center justify-center gap-4 overflow-hidden shadow-2xl group/cta mt-auto border border-white/5 active:scale-95 transition-all"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF7A00]/30 to-transparent -translate-x-full group-hover/cta:animate-scan transition-transform duration-1000"></div>
                                <span className="relative z-10 font-black text-[10px] uppercase tracking-[0.4em]">INITIALIZE</span>
                                <ArrowRight className="relative z-10 text-[#D4A373] transition-transform group-hover/cta:translate-x-1"/>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
