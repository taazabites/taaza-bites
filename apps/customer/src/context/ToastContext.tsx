import {createContext, useContext, useState, ReactNode, useCallback} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {X, CheckCircle, AlertCircle, Info} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({children}: {children: ReactNode}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, {id, message, type}]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{opacity: 0, y: -20, scale: 0.95}}
              animate={{opacity: 1, y: 0, scale: 1}}
              exit={{opacity: 0, scale: 0.95, y: -10}}
              className="pointer-events-auto flex items-center justify-between p-4 rounded-xl border bg-white/95 backdrop-blur-md shadow-lg"
              style={{
                borderColor:
                  toast.type === 'success'
                    ? '#10b981'
                    : toast.type === 'error'
                    ? '#ef4444'
                    : toast.type === 'warning'
                    ? '#f59e0b'
                    : '#3b82f6',
              }}
            >
              <div className="flex items-center space-x-3">
                {toast.type === 'success' && (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                {toast.type === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
                {toast.type === 'warning' && (
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                {toast.type === 'info' && (
                  <Info className="w-5 h-5 text-blue-500 shrink-0" />
                )}
                <p className="text-sm font-medium text-gray-800">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
