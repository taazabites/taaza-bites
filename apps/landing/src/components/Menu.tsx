import { PORTAL_LINKS } from '../config';
import { X, Star, ArrowRight } from 'lucide-react';
import { Zap } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LazyImage } from './LazyImage';
import { MENU_DATA_DETAILED } from '../services/menuData';
import { useCarousel } from '../hooks/useCarousel';
import { SmartButton } from './SmartButton';

const CATEGORIES = ['All', 'High-Protein', 'Keto', 'Vegetarian'];

interface MealDetailModalProps {
    item: any;
    onClose: () => void;
}

const MealDetailModal: React.FC<MealDetailModalProps> = ({ item, onClose }) => {
    const nutritionParts = item.nutritionInfo ? item.nutritionInfo.split(', ').map((part: string) => {
        const [key, value] = part.split(': ');
        return { key, value };
    }) : [];

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 animate-fade-in" onClick={onClose}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-[#F5F2ED] w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-up max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="relative h-48 sm:h-64 md:h-auto md:w-1/2 shrink-0 bg-gray-100">
                    <LazyImage src={item.imageUrl} alt={`${item.name} - Detailed healthy meal option`} sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden"></div>
                </div>
                <div className="flex-1 p-6 sm:p-8 md:p-12 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                    <button onClick={onClose} aria-label="Close modal" className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-gray-500 hover:bg-[#059669] hover:text-white hover:shadow-[0_8px_30px_rgba(5,150,105,0.3)] transition-all duration-300 z-20 hover:-translate-y-1"><X className="text-base sm:text-lg"/></button>
                    <div>
                        <div className="inline-block px-3 py-1 bg-[#059669]/10 text-[#059669] rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-4 sm:mb-6 border border-[#059669]/20">
                            {item.tags[0].replace('-', ' ')}
                        </div>
                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-sans font-extrabold text-[#1A1A1A] mb-4 sm:mb-6 tracking-tight leading-tight uppercase">{item.name}</h3>
                        <p className="text-zinc-700 text-base sm:text-lg font-bold leading-relaxed mb-8 sm:mb-10">{item.description}</p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
                            {nutritionParts.map((part: any, i: number) => (
                                <div key={i} className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100/50">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{part.key}</span>
                                    <span className="text-lg sm:text-xl font-semibold text-[#1A1A1A]">{part.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pt-6 sm:pt-8 border-t border-gray-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                        <div className="flex flex-col text-center sm:text-left w-full sm:w-auto">
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price</span>
                            <span className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">₹{item.price}</span>
                        </div>
                        <SmartButton 
                            label="Order Now" 
                            href={PORTAL_LINKS.order}
                            variant="primary" 
                            icon={<Zap className="w-5 h-5" />} 
                            className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg shadow-[0_8px_30px_rgba(5,150,105,0.25)]" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FoodCard: React.FC<{ item: any; index: number; isActive?: boolean; onOpenDetails: () => void; isRecommended?: boolean }> = ({ item, index, isActive = true, onOpenDetails, isRecommended }) => {
    return (
        <motion.div 
            whileTap={{ scale: 0.98, transition: { duration: 0.2 } }}
            className={`group relative bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-700 flex flex-col h-full cursor-pointer border border-white/40 ${isActive ? 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2' : 'opacity-50 scale-95'}`} 
            onClick={onOpenDetails}
        >
            <div className="relative aspect-[4/3] sm:aspect-[1/1] overflow-hidden bg-gray-100">
                <LazyImage src={item.imageUrl} alt={`${item.name} - Premium healthy Indian meal in Bangalore`} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" wrapperClassName="w-full h-full" />
                
                {isRecommended && (
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/90 backdrop-blur-md text-[#059669] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-sm border border-white flex items-center gap-1.5 sm:gap-2">
                        <Star className="text-[#059669]"/> Signature
                    </div>
                )}
            </div>
            
            <div className="p-4 sm:p-8 flex flex-col flex-grow bg-white">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="inline-block px-2 py-1 sm:px-3 sm:py-1 bg-[#E6F4EA] text-[#059669] rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-widest border border-[#059669]/10">
                        {item.tags[0].replace('-', ' ')}
                    </div>
                    <span className="text-lg sm:text-2xl font-extrabold font-sans text-[#1A1A1A] tracking-tight">₹{item.price}</span>
                </div>
                
                <h3 className="font-sans font-extrabold uppercase text-xl sm:text-3xl text-[#1A1A1A] mb-2 sm:mb-3 tracking-tight leading-tight group-hover:text-[#059669] transition-colors">{item.name}</h3>
                <p className="text-zinc-700 font-semibold text-[13px] sm:text-sm leading-relaxed line-clamp-2 mb-4 sm:mb-6 flex-grow">{item.description}</p>
                
                <div className="flex items-center justify-between pt-4 sm:pt-5 border-t border-gray-100/80">
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-[#059669] transition-colors duration-300">View Details</span>
                    <motion.div
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="relative"
                    >
                        <div 
                            aria-label={`View details for ${item.name}`}
                            className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#E6F4EA] text-[#059669] flex items-center justify-center group-hover:bg-[#059669] group-hover:text-white transition-all duration-500 shadow-md group-active:scale-95 overflow-hidden"
                        >
                            <ArrowRight className="text-xs sm:text-base -rotate-45 group-hover:rotate-0 transition-transform duration-500"/>
                            
                            {/* Subtle ripple overlay */}
                            <motion.div
                                initial={false}
                                whileTap={{ scale: 3, opacity: [0, 0.2, 0] }}
                                transition={{ duration: 0.8 }}
                                className="absolute inset-0 bg-white rounded-full pointer-events-none"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

import { MobileSwipeContainer } from './MobileSwipeContainer';

export const Menu: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    
    const filteredItems = useMemo(() => {
        return MENU_DATA_DETAILED.filter(item => activeCategory === 'All' || item.tags.includes(activeCategory.toLowerCase().replace(' ', '-')));
    }, [activeCategory]);

    return (
        <section className="bg-white py-16 sm:py-24 relative overflow-hidden" id="menu">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-40 -left-40 w-[40rem] h-[40rem] bg-[#059669]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-40 -right-40 w-[40rem] h-[40rem] bg-[#F59E0B]/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 md:mb-24 gap-6 sm:gap-8 border-b border-gray-200/60 pb-8">
                    <div className="max-w-2xl">
                        <span className="text-[#059669] font-bold tracking-widest uppercase text-[10px] sm:text-xs mb-4 sm:mb-6 block">Culinary Excellence</span>
                        <h1 className="sr-only">Our Healthy Indian Diet Menu Bengaluru - Taazabites</h1>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-sans text-[#1A1A1A] tracking-tight leading-none uppercase">
                            Our <span className="font-script text-[#059669] normal-case tracking-normal">Menu.</span>
                        </h2>
                    </div>
                    
                    <div className="overflow-hidden w-full md:w-auto md:overflow-visible">
                        <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0">
                        <div className="inline-flex bg-[#E6F4EA]/60 backdrop-blur-md p-1.5 rounded-full border border-[#E6F4EA] shadow-sm">
                            {CATEGORIES.map(cat => (
                                <button 
                                    key={cat} 
                                    onClick={() => { if(navigator.vibrate) navigator.vibrate(8); setActiveCategory(cat); }} 
                                    className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                                        activeCategory === cat 
                                        ? 'bg-[#059669] text-white shadow-md' 
                                        : 'text-gray-500 hover:text-[#1A1A1A] hover:bg-white/50'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

                <div className="relative">
                    <div className="hidden lg:grid grid-cols-3 gap-10">
                        {filteredItems.map((item, idx) => (
                            <div key={idx} className="h-full">
                                <FoodCard 
                                    item={item} 
                                    index={idx} 
                                    onOpenDetails={() => setSelectedItem(item)} 
                                    isRecommended={idx === 0} 
                                />
                            </div>
                        ))}
                    </div>

                    <div className="lg:hidden relative w-full">
                        <MobileSwipeContainer itemCount={filteredItems.length} className="gap-4 sm:gap-6">
                            {filteredItems.map((item, idx) => (
                                <div key={idx} className="w-[85vw] sm:w-[60vw] flex-shrink-0 snap-center">
                                    <FoodCard 
                                        item={item} 
                                        index={idx} 
                                        isActive={true} 
                                        onOpenDetails={() => setSelectedItem(item)} 
                                        isRecommended={idx === 0}
                                    />
                                </div>
                            ))}
                        </MobileSwipeContainer>
                    </div>
                </div>
            </div>
            {selectedItem && <MealDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
        </section>
    );
};