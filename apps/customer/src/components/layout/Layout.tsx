import {ReactNode, useState, useEffect, Suspense, lazy} from 'react';
const Navbar = lazy(() => import('./Navbar'));
const PublicNavbar = lazy(() => import('./PublicNavbar'));
const PublicFooter = lazy(() => import('./PublicFooter'));
const BottomNav = lazy(() => import('./BottomNav'));
const Sidebar = lazy(() => import('./Sidebar'));
import { useAuth } from "@/src/context/AuthContext";
import {useToast} from '@/src/context/ToastContext';
import {useNavigate, useLocation} from 'react-router-dom';
import {motion, AnimatePresence} from 'framer-motion';
import {Plus, PauseCircle, LifeBuoy, MapPin, RefreshCcw, ArrowUp, Scan} from 'lucide-react';
import { triggerHaptic } from '@/src/utils/haptics';
import { cn } from '@/src/lib/utils';
import { BottomSheet } from '../ui/BottomSheet';
import { SupportSheet } from './SupportSheet';
import { DeliveryTrackerSheet } from './DeliveryTrackerSheet';
import { PauseSubscriptionSheet } from './PauseSubscriptionSheet';
import { WalletSheet } from './WalletSheet';
import { QRScannerModal } from '../common/QRScannerModal';
import { throttle } from '../../lib/performance';

import CommandMenu from './CommandMenu';
import MobileInstallPrompt from './mobile-install-prompt';
import { DynamicSeoHelmet } from '../common/DynamicSeoHelmet';
import { useSubscriptionLifecycleNotifications } from '@/src/hooks/useSubscriptionLifecycleNotifications';

export default function Layout({children}: {children: ReactNode}) {
  const {user} = useAuth();
  useSubscriptionLifecycleNotifications();
  const {showToast} = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isSupportSheetOpen, setIsSupportSheetOpen] = useState(false);
  const [isDeliverySheetOpen, setIsDeliverySheetOpen] = useState(false);
  const [isPauseSheetOpen, setIsPauseSheetOpen] = useState(false);
  const [isWalletSheetOpen, setIsWalletSheetOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenScanner = () => setIsQRModalOpen(true);
    window.addEventListener('open-qr-scanner', handleOpenScanner);
    return () => window.removeEventListener('open-qr-scanner', handleOpenScanner);
  }, []);

  const isDashboardPath = location.pathname.startsWith('/dashboard') || 
                         location.pathname.startsWith('/hub') || 
                         location.pathname.startsWith('/admin') || 
                         location.pathname.startsWith('/enterprise-admin') || 
                         location.pathname.startsWith('/premium') ||
                         location.pathname.startsWith('/meals') ||
                         location.pathname.startsWith('/plating') ||
                         location.pathname.startsWith('/health-assessment') ||
                         location.pathname.startsWith('/delivery-experience') ||
                         location.pathname.startsWith('/ai-engine') ||
                         location.pathname.startsWith('/progress') ||
                         location.pathname.startsWith('/profile') ||
                         location.pathname.startsWith('/orders') ||
                         location.pathname.startsWith('/wallet') ||
                         location.pathname.startsWith('/refer') ||
                         location.pathname.startsWith('/rewards') ||
                         location.pathname.startsWith('/community') ||
                         location.pathname.startsWith('/support') ||
                         location.pathname.startsWith('/addresses') ||
                         location.pathname.startsWith('/notifications') ||
                         location.pathname.startsWith('/subscriptions') ||
                         location.pathname.startsWith('/operations') ||
                         location.pathname.startsWith('/kitchen') ||
                         location.pathname.startsWith('/feedback') ||
                         location.pathname.startsWith('/settings') ||
                         location.pathname.startsWith('/ai-coach');

  const handleQuickAction = (action: string, path: string) => {
    triggerHaptic('light');
    if (action === 'Scan QR Pass') {
       setIsQRModalOpen(true);
       setIsFabOpen(false);
       return;
    }
    if (action === 'Support') {
       setIsSupportSheetOpen(true);
       setIsFabOpen(false);
       return;
    }
    if (action === 'Track Delivery') {
       setIsDeliverySheetOpen(true);
       setIsFabOpen(false);
       return;
    }
    if (action === 'Pause Subscription') {
       setIsPauseSheetOpen(true);
       setIsFabOpen(false);
       return;
    }
    if (action === 'Wallet') {
       setIsWalletSheetOpen(true);
       setIsFabOpen(false);
       return;
    }
    showToast(`Opening ${action}...`, "info");
    navigate(path);
    setIsFabOpen(false);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/login-otp';

  if (!isDashboardPath) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 overflow-x-clip w-full relative">
        <DynamicSeoHelmet />
        <Suspense fallback={null}><PublicNavbar /></Suspense>
        <AnimatePresence mode="wait">
          <motion.main 
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={cn("flex-grow", isAuthPage ? "pt-20 lg:pt-20 pb-6 bg-slate-50/80" : "pt-24 lg:pt-32")}
          >
            {children}
          </motion.main>
        </AnimatePresence>
        {!isAuthPage && <Suspense fallback={null}><PublicFooter /></Suspense>}
        <ScrollToTop />
        <MobileInstallPrompt />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] min-h-screen flex flex-col lg:flex-row bg-slate-50/50 dark:bg-zinc-950 overflow-x-clip w-full relative">
      <DynamicSeoHelmet />
      <CommandMenu />
      
      {/* Ambient Mobile Background Glow */}
      <div className="fixed inset-0 pointer-events-none lg:hidden z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[40%] bg-emerald-500/5 blur-[100px] rounded-[100%]" />
      </div>

      {/* Desktop Sidebar */}
      <Suspense fallback={null}><Sidebar /></Suspense>

      {/* Main Content Pane */}
      <div className="flex-grow min-w-0 lg:ml-64 xl:ml-72 flex flex-col min-h-full relative z-10 transition-all duration-500">
        <Suspense fallback={null}><Navbar /></Suspense>
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-44 lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, scale: 0.992 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.992 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full min-h-full flex-grow"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Floating Action Button (FAB) & Bottom Sheet */}
        {isDashboardPath && (
          <>
            <BottomSheet 
              isOpen={isFabOpen} 
              onClose={() => setIsFabOpen(false)}
              title="Quick Actions"
            >
              <div className="space-y-3 pb-8">
                <button 
                  onClick={() => handleQuickAction('Scan QR Pass', '')} 
                  className="w-full flex items-center gap-4 p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-left cursor-pointer transition-all active:scale-95 border border-emerald-500/20"
                >
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                    <Scan className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-zinc-900 dark:text-white block">Scan QR Code / Pass</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Camera scanner for referrals & membership passes</span>
                  </div>
                </button>
                <button 
                  onClick={() => handleQuickAction('Track Delivery', '/delivery-experience')} 
                  className="w-full flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 hover:bg-emerald-50/80 dark:bg-zinc-900 dark:hover:bg-emerald-500/10 text-left cursor-pointer transition-all active:scale-95 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-zinc-900 dark:text-white block">Track Delivery</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Live driver status and ETA</span>
                  </div>
                </button>
                <button 
                  onClick={() => handleQuickAction('Pause Subscription', '/dashboard/calendar')} 
                  className="w-full flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 hover:bg-orange-50/80 dark:bg-zinc-900 dark:hover:bg-orange-500/10 text-left cursor-pointer transition-all active:scale-95 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                    <PauseCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-zinc-900 dark:text-white block">Pause Plan</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Temporarily stop your meals</span>
                  </div>
                </button>
                <button 
                  onClick={() => handleQuickAction('Reorder Meal', '/dashboard/todays-meals')} 
                  className="w-full flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 hover:bg-blue-50/80 dark:bg-zinc-900 dark:hover:bg-blue-500/10 text-left cursor-pointer transition-all active:scale-95 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <RefreshCcw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-zinc-900 dark:text-white block">Reorder Past Favorite</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Quickly order what you loved</span>
                  </div>
                </button>
                <button 
                  onClick={() => handleQuickAction('Wallet', '/dashboard')} 
                  className="w-full flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 hover:bg-yellow-50/80 dark:bg-zinc-900 dark:hover:bg-yellow-500/10 text-left cursor-pointer transition-all active:scale-95 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 dark:text-yellow-400"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                  </div>
                  <div>
                    <span className="text-sm font-black text-zinc-900 dark:text-white block">Wallet & Coupons</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Check balance & promos</span>
                  </div>
                </button>
                <button 
                  onClick={() => handleQuickAction('Support', '/dashboard')} 
                  className="w-full flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 hover:bg-indigo-50/80 dark:bg-zinc-900 dark:hover:bg-indigo-500/10 text-left cursor-pointer transition-all active:scale-95 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <LifeBuoy className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-zinc-900 dark:text-white block">Nutritionist Support</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Chat with health experts</span>
                  </div>
                </button>
              </div>
            </BottomSheet>

            <div className="lg:hidden fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] right-4 sm:right-6 z-50">
              <motion.button 
                whileTap={{ scale: 0.88 }}
                onClick={() => setIsFabOpen(!isFabOpen)}
                className="h-14 w-14 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center cursor-pointer border-2 border-white/20 active:bg-emerald-700 transition-colors"
                aria-label="Quick Actions"
              >
                <motion.div animate={{ rotate: isFabOpen ? 45 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  <Plus className="h-6 w-6 stroke-[2.5]" />
                </motion.div>
              </motion.button>
            </div>
          </>
        )}

        {/* Mobile Bottom Navigation */}
        <Suspense fallback={null}><BottomNav /></Suspense>
        <MobileInstallPrompt />

        <SupportSheet isOpen={isSupportSheetOpen} onClose={() => setIsSupportSheetOpen(false)} />
        <DeliveryTrackerSheet isOpen={isDeliverySheetOpen} onClose={() => setIsDeliverySheetOpen(false)} />
        <PauseSubscriptionSheet isOpen={isPauseSheetOpen} onClose={() => setIsPauseSheetOpen(false)} />
        <WalletSheet isOpen={isWalletSheetOpen} onClose={() => setIsWalletSheetOpen(false)} />
        <QRScannerModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
      </div>
    </div>
  );
}

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = throttle(() => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }, 250);

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-32 right-6 z-50 w-12 h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center shadow-xl text-emerald-600 cursor-pointer lg:bottom-12"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
