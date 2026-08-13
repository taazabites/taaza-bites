import { PORTAL_LINKS } from '../config';
import { X } from 'lucide-react';
import { Zap, Upload, Maximize } from 'lucide-react';

import React, { useState, useRef, useEffect } from 'react';
import { MENU_DATA_DETAILED } from '../services/menuData';
import { LazyImage } from './LazyImage';
import { SmartButton } from './SmartButton';

interface AIMealSuggestion {
    mealName: string;
    reason: string;
}

const MealResultCard: React.FC<{ result: AIMealSuggestion }> = ({ result }) => {
    const mealDetails = MENU_DATA_DETAILED.find(item => item.name === result.mealName);
    if (!mealDetails) return null;

    return (
        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-zinc-100 overflow-hidden animate-fade-in-pop max-w-4xl mx-auto relative group">
            <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5 relative h-72 md:h-auto overflow-hidden bg-zinc-50">
                    <LazyImage src={mealDetails.imageUrl} alt={`${mealDetails.name} - Discovered via Taazabites AI scan in Bengaluru`} className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                </div>
                <div className="md:w-3/5 p-10 sm:p-16 flex flex-col bg-white">
                    <h4 className="text-4xl sm:text-5xl font-light font-serif text-[#1A1A1A] leading-[0.85] tracking-tighter mb-8">{mealDetails.name}</h4>
                    <p className="text-zinc-600 text-base leading-relaxed mb-10 font-light italic">"{result.reason}"</p>
                    <SmartButton 
                        label="Order Module" 
                        hoverLabel="Go Live" 
                        href={PORTAL_LINKS.order}
                        variant="accent" 
                        icon={<Zap className="w-5 h-5" />} 
                        className="w-full !h-20" 
                    />
                </div>
            </div>
        </div>
    );
};

export const DishDiscovery: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AIMealSuggestion | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => { setSelectedImage(reader.result as string); analyzeImage(reader.result as string, file.type); };
        reader.readAsDataURL(file);
    };

    const analyzeImage = async (base64Image: string, mimeType: string) => {
        setIsAnalyzing(true);
        try {
            const base64Data = base64Image.split(',')[1];
            const response = await fetch('/api/dish-discovery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base64Data, mimeType })
            });
            if (!response.ok) throw new Error('Failed to analyze image');
            const aiResponse = await response.json();
            setResult(aiResponse);
        } catch (err) {} finally { setIsAnalyzing(false); }
    };

    return (
        <section className="py-24 sm:py-48 bg-[#1A1A1A] relative overflow-hidden min-h-screen flex items-center" id="dish-discovery">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16 sm:mb-24 animate-on-scroll">
                    <h2 className="text-4xl sm:text-8xl md:text-9xl font-black font-serif text-white mb-10 tracking-tighter leading-[0.8]">Snap, Scan, <br/> <span className="text-[#FF7A00]">Eat Clean.</span></h2>
                </div>
                <div className="max-w-3xl mx-auto">
                    {!selectedImage ? (
                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-6 sm:p-20 text-center animate-on-scroll shadow-2xl">
                            <div className="flex flex-col sm:flex-row gap-6">
                                <SmartButton label="Upload Payload" hoverLabel="Select File" onClick={() => fileInputRef.current?.click()} icon={<Upload className="w-5 h-5" />} className="w-full !h-24" />
                                <SmartButton label="Activate Lens" hoverLabel="Scan Live" onClick={() => {}} icon={<Maximize className="w-5 h-5" />} className="w-full !h-24" variant="accent" />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => e.target.files && processFile(e.target.files[0])} />
                        </div>
                    ) : (
                        <div className="space-y-16 animate-fade-in">
                            <div className="relative rounded-[4rem] overflow-hidden shadow-2xl border border-white/10 bg-black aspect-video group/preview">
                                <LazyImage src={selectedImage} alt="Healthy meal meal scan for premium food discovery in Bengaluru" className="w-full h-full object-contain" wrapperClassName="w-full h-full" />
                                {isAnalyzing && <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center"><div className="w-24 h-24 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin mb-10"></div><p className="text-white font-black uppercase tracking-[0.5em] font-mono">DECODING...</p></div>}
                                <button onClick={() => { setSelectedImage(null); setResult(null); }} className="absolute top-8 right-8 w-14 h-14 bg-black/60 text-white rounded-3xl flex items-center justify-center border border-white/10" aria-label="Close prediction result"><X /></button>
                            </div>
                            {result && <MealResultCard result={result} />}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
