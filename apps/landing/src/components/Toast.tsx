import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    React.useEffect(() => {
        const handleToastEvent = (e: Event) => {
            const customEvent = e as CustomEvent<{ message: string; type: ToastType }>;
            showToast(customEvent.detail.message, customEvent.detail.type);
        };
        window.addEventListener('taaza:toast', handleToastEvent);
        return () => window.removeEventListener('taaza:toast', handleToastEvent);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`pointer-events-auto flex items-center justify-between min-w-[300px] max-w-sm p-4 rounded-xl shadow-lg border animate-slide-up transition-all ${
                            toast.type === 'success' ? 'bg-[#059669]/10 border-[#059669]/20 text-[#059669] backdrop-blur-md' :
                            toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-600 backdrop-blur-md' :
                            'bg-gray-800/90 border-gray-700 text-white backdrop-blur-md'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                            {toast.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
                            {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
                            <span className="text-sm font-medium">{toast.message}</span>
                        </div>
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-black/5 rounded-full transition-colors ml-4"
                        >
                            <X className="w-4 h-4 opacity-70" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
