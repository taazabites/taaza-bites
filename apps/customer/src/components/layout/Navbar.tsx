import { useEffect, useState } from 'react';
import { Wallet, Bell, User, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { WalletService, NotificationService } from '@/src/firebase/services';
import { triggerHaptic } from '@/src/utils/haptics';
import { QRScannerButton } from '../common/QRScannerButton';
import BrandLogo from '../common/BrandLogo';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { currentUser, userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to wallet document using service
    const unsubWallet = WalletService.subscribeToWallet(currentUser.uid, (wallet) => {
      setWalletBalance(wallet?.balance || 0);
    });

    // Listen to notifications using service
    const unsubNotifications = NotificationService.subscribeToNotifications(currentUser.uid, (notifications) => {
      setUnreadNotifications(notifications.filter(n => !n.read).length);
    });

    return () => {
      unsubWallet();
      unsubNotifications();
    };
  }, [currentUser]);

  const pathname = location.pathname;

  // Check if current route is a deep dashboard/assessment sub-page
  const isSubPage = pathname !== '/dashboard' && pathname !== '/';

  const getMobileTitle = () => {
    if (pathname === '/dashboard') return 'Wellness Hub';
    if (pathname === '/dashboard/todays-meals') return 'Plating Studio';
    if (pathname === '/delivery-experience') return 'Live Tracker';
    if (pathname === '/dashboard/wallet' || pathname === '/wallet') return 'Metabolic Wallet';
    if (pathname === '/health-assessment') return 'Biometrics';
    if (pathname.startsWith('/meal-experience')) return 'Plate Details';
    if (pathname === '/dashboard/notifications') return 'Notifications';
    if (pathname === '/dashboard/settings') return 'Settings';
    if (pathname === '/dashboard/orders') return 'Meal Logs';
    if (pathname === '/dashboard/calendar') return 'Meal Calendar';
    if (pathname === '/progress') return 'My Journey';
    if (pathname === '/profile') return 'My Profile';
    if (pathname === '/community') return 'Community Hub';
    if (pathname === '/support' || pathname === '/dashboard/support' || pathname === '/hub/support') return 'Help & Support';
    return 'TaazaBites';
  };

  const handleBack = () => {
    triggerHaptic('medium');
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-3xl border-b border-zinc-200/40 dark:border-zinc-800/40 px-4 sm:px-6 lg:px-8 py-2.5 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] transition-all no-select lg:bg-transparent lg:border-none lg:backdrop-blur-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Desktop Logo / Mobile Adaptive Title & Back Button */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Back Button & View Title */}
          <div className="lg:hidden flex items-center gap-2.5">
            {isSubPage ? (
              <button
                onClick={handleBack}
                className="w-10 h-10 flex items-center justify-center -ml-1 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 active:scale-90 transition-transform cursor-pointer shadow-2xs"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <BrandLogo size="sm" showText={false} />
            )}
            
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
                {getMobileTitle()}
              </span>
              {!isSubPage && (
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              )}
            </div>
          </div>

          {/* Desktop Logo Link */}
          <Link to="/" className="hidden lg:flex items-center">
            <BrandLogo size="sm" />
          </Link>
        </div>

        {/* Right Side: Theme, Wallet Balance, Notifications & Profile */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          <ThemeToggle />
          {currentUser ? (
            <>
              {/* Wallet Button */}
              <Link
                to="/dashboard/wallet"
                onClick={() => triggerHaptic('light')}
                className="flex items-center text-amber-600 dark:text-amber-400 font-black bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 transition-all px-3 py-2 rounded-xl text-xs border border-amber-500/20 shadow-2xs min-h-[40px]"
              >
                <Wallet className="w-4 h-4 mr-1.5 shrink-0" />
                <span>₹{walletBalance}</span>
              </Link>

              {/* QR Scanner Camera Button */}
              <QRScannerButton variant="icon" />

              {/* Notifications Link */}
              <Link 
                to="/dashboard/notifications" 
                onClick={() => triggerHaptic('light')}
                className="relative w-10 h-10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white active:scale-95 transition-all rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-xs">
                    {unreadNotifications}
                  </span>
                )}
              </Link>

              {/* Avatar Settings Link */}
              <Link
                to="/profile"
                onClick={() => triggerHaptic('light')}
                className="flex items-center justify-center w-10 h-10 rounded-xl active:scale-95 transition-all group"
                aria-label="User Profile"
              >
                <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-800 text-white rounded-full flex items-center justify-center font-black text-xs border border-zinc-200 dark:border-zinc-700 shadow-2xs group-hover:scale-105 transition-transform">
                  {userData?.name ? userData.name[0].toUpperCase() : <User className="w-4 h-4" />}
                </div>
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => triggerHaptic('medium')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-600/10 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
