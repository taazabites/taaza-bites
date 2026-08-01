import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Leaf, ChevronRight, MessageSquare, ShieldCheck, Heart, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import { useAuth } from '@/src/context/AuthContext';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();

  const menuItems = [
    { label: 'Home', path: '/', icon: Leaf },
    { label: 'How It Works', path: '/how-it-works', icon: ShieldCheck },
    { label: 'Our Menu', path: '/menu', icon: MessageSquare },
    { label: 'Pricing', path: '/pricing', icon: Heart },
    { label: 'Delivery Areas', path: '/delivery-areas', icon: ShieldCheck },
    { label: 'Corporate', path: '/corporate', icon: ShieldCheck },
    { label: 'Blog', path: '/blog', icon: MessageSquare },
    { label: 'Health Assessment', path: '/health-assessment', icon: Heart },
    { label: 'Contact', path: '/contact', icon: MessageSquare },
  ];

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const durations = { light: 15, medium: 30, heavy: 50 };
      navigator.vibrate(durations[type]);
    }
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] transition-all">
        <div className="flex items-center justify-between">
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => { triggerHaptic('light'); navigate('/'); }}
          >
            <BrandLogo size="md" />
          </motion.div>
          
          <div className="flex items-center gap-3">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic('light'); navigate('/menu'); }} 
              className="p-2.5 rounded-2xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-emerald-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic('medium'); setIsOpen(true); }}
              className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%', borderRadius: '4rem 0 0 4rem' }}
              animate={{ x: 0, borderRadius: '0' }}
              exit={{ x: '100%', borderRadius: '4rem 0 0 4rem' }}
              transition={{ type: 'spring', damping: 35, stiffness: 350 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 w-[90%] bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 h-full flex flex-col overflow-y-auto">
                <div className="flex items-center justify-between mb-16">
                  <BrandLogo size="lg" />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-2xl bg-slate-50 text-slate-900"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Navigation Links */}
                <nav className="space-y-3 flex-grow">
                  {menuItems.map((item, i) => (
                    <motion.button
                      key={i}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.2 }}
                      className="w-full flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-emerald-100 transition-colors">
                            <item.icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </motion.button>
                  ))}
                </nav>
                
                {/* User Section & CTA */}
                <div className="mt-12 space-y-4">
                  {currentUser ? (
                    <button 
                      onClick={() => { navigate('/dashboard'); setIsOpen(false); }}
                      className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] bg-emerald-900 text-white shadow-2xl shadow-emerald-900/20 group"
                    >
                      <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center">
                        <LayoutDashboard className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="text-left flex-grow">
                        <div className="font-black text-lg leading-tight">Welcome back{(userData as any)?.firstName ? `, ${(userData as any).firstName}` : ''}</div>
                        <div className="text-xs font-bold text-emerald-400/70 uppercase tracking-widest">Go to Dashboard</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-emerald-400/50" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => { navigate('/login'); setIsOpen(false); }}
                      className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] bg-emerald-900 text-white shadow-2xl shadow-emerald-900/20 group"
                    >
                      <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="text-left flex-grow">
                        <div className="font-black text-lg leading-tight">Join TaazaBites</div>
                        <div className="text-xs font-bold text-emerald-400/70 uppercase tracking-widest">Sign in or Create Account</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-emerald-400/50" />
                    </button>
                  )}
                  <button 
                    onClick={() => { navigate('/plans'); setIsOpen(false); }}
                    className="w-full bg-[#FF6B35] text-white py-6 rounded-[1.5rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-orange-900/20"
                  >
                    Start Subscription
                  </button>
                </div>

                {/* Footer Info */}
                <div className="mt-16 pt-8 border-t border-slate-100">
                  <div className="flex justify-center gap-6 mb-6">
                    {/* Placeholder for social icons if needed */}
                  </div>
                  <p className="text-center text-slate-400 text-xs font-black uppercase tracking-[0.2em]">TaazaBites Bengaluru</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
