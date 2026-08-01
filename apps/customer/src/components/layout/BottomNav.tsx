import { useNavigate, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, Calendar, Activity, User } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { triggerHaptic } from '@/src/utils/haptics';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { label: "Home", path: "/dashboard", icon: Home },
    { label: "Meals", path: "/dashboard/todays-meals", icon: UtensilsCrossed },
    { label: "Calendar", path: "/dashboard/calendar", icon: Calendar },
    { label: "Journey", path: "/progress", icon: Activity },
    { label: "Profile", path: "/profile", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] left-3 right-3 sm:left-6 sm:right-6 z-50 max-w-md mx-auto bg-white/85 dark:bg-zinc-950/85 backdrop-blur-3xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.25rem] shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden no-select transition-all duration-300">
      <div className="px-1.5 py-1">
        <div className="flex justify-between items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/');
            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  triggerHaptic('light');
                  navigate(item.path);
                }}
                className="relative flex flex-col items-center justify-center flex-1 h-full min-h-[48px] cursor-pointer group rounded-2xl transition-colors py-1 px-1"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActiveIndicator"
                    className="absolute inset-0 bg-emerald-500/15 dark:bg-emerald-400/20 rounded-2xl border border-emerald-500/30 dark:border-emerald-400/30 shadow-xs"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative flex items-center justify-center">
                  <item.icon 
                    className={cn(
                      "h-5 w-5 transition-all duration-300 relative z-10 mb-0.5",
                      isActive 
                        ? "text-emerald-600 dark:text-emerald-400 scale-110 drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)]" 
                        : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                    )} 
                  />
                  {item.label === "Meals" && (
                    <motion.span 
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ repeat: Infinity, duration: 2.2 }}
                      className="absolute -top-1 -right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-zinc-950 z-20 shadow-xs"
                    />
                  )}
                  {item.label === "Journey" && (
                    <motion.div 
                      animate={{ y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 2.8 }}
                      className="absolute -top-2.5 -right-3.5 bg-emerald-600 text-white text-[7px] font-black px-1.5 py-[2px] rounded-full z-20 shadow-xs tracking-tight"
                    >
                      NEW
                    </motion.div>
                  )}
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider transition-all duration-300 relative z-10 mt-0.5 whitespace-nowrap",
                  isActive ? "text-emerald-700 dark:text-emerald-400 opacity-100 scale-100" : "text-zinc-400 dark:text-zinc-500 opacity-80 scale-95"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.span 
                    layoutId="activeDot"
                    className="absolute bottom-0.5 w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full shadow-xs"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

