
import React from 'react';

interface ExitIntentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ExitIntentModal: React.FC<ExitIntentModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-auto relative transform transition-transform duration-300 animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-2xl text-zinc-400 hover:text-zinc-600 transition-colors"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                <div className="p-8 text-center">
                    <h2 id="modal-title" className="text-2xl font-bold text-[#FF6B35] mb-2 flex items-center justify-center gap-2">
                        <i className="fas fa-gift"></i> Don't Leave Hungry!
                    </h2>
                    <p className="text-zinc-600 mb-6">
                        Unlock a <strong className="font-bold text-zinc-800">FREE healthy dessert</strong> with your first meal order today!
                    </p>
                    <a 
                        href="https://taazabites.in/menu"
                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#63C132] to-[#276749] text-white font-semibold px-6 py-3 rounded-full shadow-lg shadow-[#63C132]/30 hover:scale-105 hover:shadow-xl transition-all duration-300 mb-3"
                    >
                        <i className="fas fa-tag"></i> Claim My Exclusive Offer
                    </a>
                    <button 
                        onClick={onClose}
                        className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                    >
                        No, thanks, I'm just browsing.
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-up {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-scale-up { animation: scale-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};