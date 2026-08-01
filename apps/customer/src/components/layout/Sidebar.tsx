import {
  LayoutGrid,
  UtensilsCrossed,
  CalendarRange,
  ReceiptText,
  HeartPulse,
  Wallet,
  Gift,
  LifeBuoy,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bell,
  ShieldCheck,
  CreditCard,
  Truck,
  Users,
  BrainCircuit,
  MapPin
} from 'lucide-react';
import {Link, useLocation} from 'react-router-dom';
import {useAuth} from '@/src/context/AuthContext';
import {motion} from 'framer-motion';
import {Button} from '@/src/components/ui/primitives';
import BrandLogo from '../common/BrandLogo';

export default function Sidebar() {
 const location = useLocation();
 const {user, logout, isAdmin} = useAuth();
 const pathname = location.pathname;

  const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: HeartPulse },
  { label: "Subscription Plans", path: "/dashboard/subscriptions", icon: CreditCard },
  { label: "AI Nutrition Coach", path: "/dashboard/ai-coach", icon: BrainCircuit },
  { label: "Today's Meals", path: "/dashboard/todays-meals", icon: UtensilsCrossed },
  { label: "Meal Calendar", path: "/dashboard/calendar", icon: CalendarRange },
  { label: "Order History", path: "/dashboard/orders", icon: ReceiptText },
  { label: "Delivery Tracking", path: "/delivery-experience", icon: Truck },
  { label: "Health Assessment", path: "/health-assessment", icon: LayoutGrid },
  { label: "Wallet & Cash", path: "/dashboard/wallet", icon: Wallet },
  { label: "Manage Addresses", path: "/dashboard/addresses", icon: MapPin },
  { label: "Refer & Earn", path: "/dashboard/refer", icon: Gift },
  { label: "Rewards & Badges", path: "/dashboard/rewards", icon: Sparkles },
  { label: "Community", path: "/dashboard/community", icon: Users },
  { label: "Settings & Profile", path: "/profile", icon: Settings },
  { label: "Support & Help", path: "/dashboard/support", icon: LifeBuoy },
  { label: "Notifications", path: "/dashboard/notifications", icon: Bell },
  ...(isAdmin ? [
  { label: "Admin Console", path: "/enterprise-admin", icon: ShieldCheck },
  { label: "Operations Cockpit", path: "/dashboard/operations", icon: Sparkles }
  ] : []),
  ];

 return (
    <aside className="hidden lg:flex w-60 xl:w-64 flex-col border border-zinc-200/60 bg-white/80 backdrop-blur-3xl p-4 m-4 rounded-[2.5rem] shadow-2xl shadow-zinc-200/40 fixed h-[calc(100vh-2rem)] z-50 overflow-hidden transition-all duration-500">
      {/* Header */}
      <div className="flex items-center justify-center mb-8 px-2 pt-2">
        <Link to="/" className="flex items-center gap-3 group text-decoration-none">
          <BrandLogo size="sm" />
        </Link>
      </div>

  {/* Navigation */}
  <nav className="flex flex-col gap-1 flex-grow overflow-y-auto pr-1 custom-scrollbar">
  {navItems.map((item) => {
  const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/');
  return (
  <Link
  key={item.path}
  to={item.path}
  className={`relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-[11px] xl:text-[12px] font-black uppercase tracking-wider transition-all duration-300 group ${
  isActive 
  ? "text-emerald-700" 
  : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
  }`}
  >
  {isActive && (
  <motion.div 
  layoutId="activeSidebarNav"
  className="absolute inset-0 bg-emerald-50 rounded-2xl border border-emerald-100/50"
  transition={{ type: "spring", stiffness: 400, damping: 35 }}
  />
  )}
  <item.icon className={`relative z-10 h-4.5 w-4.5 transition-colors duration-300 ${isActive ? "text-emerald-600" : "text-zinc-400 group-hover:text-zinc-600"}`} />
  <span className="relative z-10">{item.label}</span>
  {isActive && (
  <motion.div 
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" 
  />
  )}
  </Link>
  );
  })}
  </nav>

  {/* User Profile */}
  <div className="mt-auto pt-4 border-t border-zinc-100/80 space-y-3 shrink-0">
    <Link to="/profile" className="block bg-zinc-50 border border-zinc-200/50 rounded-[2rem] p-4 relative overflow-hidden group transition-all duration-500 hover:shadow-xl hover:shadow-zinc-200/50 cursor-pointer text-decoration-none">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-colors" />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="h-10 w-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
          {user?.email?.[0].toUpperCase() || "R"}
        </div>
        <div className="flex-1 overflow-hidden text-left">
          <p className="text-[11px] font-black truncate text-zinc-900 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">{user?.email?.split('@')[0] || "Rahul Sharma"}</p>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
            <p className="text-[8px] text-emerald-600 uppercase font-black tracking-widest leading-none">Healthy Core</p>
          </div>
        </div>
      </div>
    </Link>
    <Button 
      variant="ghost" 
      size="sm" 
      className="w-full justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 mt-3 rounded-xl text-[8px] font-black uppercase tracking-widest border border-zinc-100 h-8 transition-all duration-300"
      onClick={logout}
    >
      <LogOut className="h-3 w-3 mr-2" /> Log Out
    </Button>

      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('open-command-menu'))}
        className="flex items-center justify-between w-full px-3 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all border border-zinc-100/50"
      >
        <span>Search</span>
        <kbd className="flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded-lg border border-zinc-200 text-[8px] font-black shadow-xs">⌘K</kbd>
      </button>
  </div>
 </aside>
 );
}
