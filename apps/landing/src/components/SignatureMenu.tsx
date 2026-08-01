import { PORTAL_LINKS } from '../config';
import { Circle, ArrowRight } from 'lucide-react';

import React from 'react';
import { LazyImage } from './LazyImage';
import { MENU_DATA_DETAILED } from '../services/menuData';
import { MobileSwipeContainer } from './MobileSwipeContainer';

export const SignatureMenu: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    // Select top 3 as signatures
    const signatures = MENU_DATA_DETAILED.slice(0, 3);

    return (
        <section className="py-20 sm:py-36 bg-white relative overflow-hidden scroll-mt-24" id="signature-menu">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-20 gap-6 sm:gap-12">
                    <div className="animate-on-scroll" data-animation="fade-in">
                        <h2 className="text-4xl sm:text-7xl md:text-8xl font-extrabold font-sans text-[#1A1A1A] tracking-tighter leading-[0.9] mb-3 uppercase">
                            The Signature <br/> <span className="text-[#FF7A00] font-script normal-case tracking-normal">Vault.</span>
                        </h2>
                    </div>
                    <p className="text-zinc-500 max-w-sm text-base sm:text-xl font-light leading-relaxed animate-on-scroll" data-animation="fade-in" data-stagger-delay="0.2s">
                        Curated healthy meals engineered for high performance. Discover our best-selling premium modules in Bengaluru.
                    </p>
                </div>

                <MobileSwipeContainer itemCount={signatures.length} className="md:grid md:grid-cols-3 gap-6 sm:gap-12">
                    {signatures.map((item, i) => (
                        <div key={i} className="flex-shrink-0 w-[82vw] sm:w-[65vw] md:w-auto snap-center group relative animate-on-scroll" data-animation="slide-fade-in-up" data-stagger-delay={`${i * 0.15}s`}>
                            <div className="relative aspect-[3/4] rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden mb-6 shadow-xl transition-all duration-700 group-hover:scale-[0.98] group-hover:shadow-2xl bg-zinc-50">
                                <LazyImage 
                                    src={item.imageUrl} 
                                    alt={`${item.name} - Healthy Meal by Taazabites Bangalore`} 
                                    className="w-full h-full object-cover grayscale-[0.1] transition-all duration-[3s] group-hover:grayscale-0 group-hover:scale-110"
                                    wrapperClassName="w-full h-full"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity"></div>
                                
                                <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10">
                                     <span className="text-[9px] font-mono font-bold text-[#059669] uppercase tracking-[0.2em] mb-2 block bg-white/90 px-2 py-0.5 rounded-sm inline-block">Best Seller</span>
                                     <h3 className="text-2xl sm:text-3xl font-extrabold font-sans text-white mb-2 leading-tight uppercase">{item.name}</h3>
                                     <div className="flex items-center gap-4">
                                        <div className="h-px flex-grow bg-white/20"></div>
                                        <span className="text-white font-mono font-bold text-base sm:text-lg">₹{item.price}</span>
                                     </div>
                                </div>

                                <div className="absolute top-6 right-6 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
                                     <a 
                                        href={PORTAL_LINKS.order}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white text-[#1A1A1A] flex items-center justify-center shadow-xl active:scale-90 transition-transform"
                                     >
                                        <ArrowRight className="w-5 h-5 text-zinc-950" />
                                     </a>
                                </div>
                            </div>
                            
                            <div className="px-3 sm:px-6">
                                <p className="text-zinc-500 text-sm sm:text-base leading-relaxed font-light mb-4 sm:mb-8 line-clamp-2 opacity-90 italic">"{item.description}"</p>
                                <div className="flex gap-2">
                                    {item.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </MobileSwipeContainer>

                <div className="mt-12 sm:mt-20 text-center">
                    <button 
                        onClick={() => onNavigate('/menu')}
                        className="group inline-flex items-center gap-3 py-3 px-1 text-xs font-black uppercase tracking-[0.4em] text-[#1A1A1A] hover:text-[#FF7A00] transition-all"
                    >
                        Explore Complete Grid
                        <div className="w-9 h-9 rounded-full border border-zinc-300 flex items-center justify-center group-hover:border-[#FF7A00] group-hover:translate-x-1.5 transition-all">
                            <ArrowRight className="w-4 h-4"/>
                        </div>
                    </button>
                </div>
            </div>
        </section>
    );
};
