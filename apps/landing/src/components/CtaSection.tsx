import React from 'react';
import { SmartButton } from './SmartButton';
import { LazyImage } from './LazyImage';
import { WHATSAPP_NUMBER, PORTAL_LINKS } from '../config';

// Official WhatsApp Logo SVG
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const CtaSection: React.FC = () => {
    return (
        <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden bg-[#050505]">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <LazyImage 
                    src="https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg" 
                    alt="Premium Indian healthy food flat lay background" 
                    className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
                    wrapperClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
                <div className="absolute inset-0 bg-[#059669]/10 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <span className="text-[#059669] font-bold tracking-widest uppercase text-[10px] sm:text-xs mb-4 sm:mb-6 block">Take Action</span>
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold font-sans text-white tracking-tight mb-6 sm:mb-8 leading-none uppercase">
                    Ready to Transform <br className="hidden sm:block" /> Your <span className="font-script text-[#059669] normal-case tracking-normal">Diet?</span>
                </h2>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto font-light">
                    Join thousands of others who have simplified their lives and improved their health with Taazabites.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    <SmartButton 
                        label="View Meal Plans" 
                        href={PORTAL_LINKS.subscribe} 
                        variant="primary"
                        className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg shadow-[0_8px_30px_rgba(5,150,105,0.25)] font-black uppercase tracking-wider"
                    />
                    <SmartButton 
                        label="WhatsApp Us" 
                        href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                        variant="secondary"
                        icon={<WhatsAppIcon className="w-5 h-5 text-[#25D366] fill-current" />}
                        className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg bg-white/5 text-white hover:bg-white/10 border-white/10 backdrop-blur-sm font-black uppercase tracking-wider"
                    />
                </div>
            </div>
        </section>
    );
};
