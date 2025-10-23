import React, { useState, useEffect } from 'react';

export const FloatingWidgets: React.FC<{ onSearchClick: () => void; }> = ({ onSearchClick }) => {
    const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsBackToTopVisible(window.scrollY > 500);
        };
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-44 right-5 z-40 w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-lg transition-all duration-300 ripple-effect ${isBackToTopVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                aria-label="Back to top"
            >
                <i className="fas fa-arrow-up"></i>
            </button>

            {/* AI Search Button */}
            <button
                onClick={onSearchClick}
                className="fixed bottom-28 right-5 z-40 w-12 h-12 rounded-full bg-[var(--accent-secondary)] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 ripple-effect"
                aria-label="AI Search"
            >
                <i className="fas fa-search"></i>
            </button>


            {/* WhatsApp Widget */}
            <a
                href="https://wa.me/917975771457?text=Hi%20Taazabites!"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-5 right-5 z-40 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 ripple-effect"
                aria-label="Chat on WhatsApp"
            >
                <i className="fab fa-whatsapp text-3xl"></i>
            </a>

            {/* Sticky Bottom Nav for Mobile */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-lg z-40 p-2 flex justify-around items-center border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
                <a href="https://taazabites.in/menu" className="flex flex-col items-center text-zinc-300 hover:text-white transition-colors text-xs gap-1 p-2 ripple-effect">
                    <i className="fas fa-utensils text-xl"></i>
                    <span>Order</span>
                </a>
                 <a href="#subscriptions" className="flex flex-col items-center text-zinc-300 hover:text-white transition-colors text-xs gap-1 p-2 ripple-effect">
                    <i className="fas fa-calendar-alt text-xl"></i>
                    <span>Plans</span>
                </a>
                 <button onClick={onSearchClick} className="flex flex-col items-center text-xs gap-1 p-2 transform -translate-y-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white flex items-center justify-center text-2xl shadow-lg border-4 border-zinc-800 ripple-effect">
                        <i className="fas fa-robot"></i>
                    </div>
                    <span className="font-bold text-[var(--primary)]">AI Search</span>
                </button>
                <a href="https://wa.me/917975771457" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-zinc-300 hover:text-white transition-colors text-xs gap-1 p-2 ripple-effect">
                    <i className="fab fa-whatsapp text-xl"></i>
                    <span>Chat</span>
                </a>
                 <a href="#hero" className="flex flex-col items-center text-zinc-300 hover:text-white transition-colors text-xs gap-1 p-2 ripple-effect">
                    <i className="fas fa-home text-xl"></i>
                    <span>Home</span>
                </a>
            </div>
        </>
    );
};