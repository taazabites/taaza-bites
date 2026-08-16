import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, User, Sparkles, ShoppingBag, LayoutDashboard } from "lucide-react";
import { cn } from "../../lib/utils";
import BrandLogo from "../common/BrandLogo";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/src/context/AuthContext";
import { triggerHaptic } from "@/src/utils/haptics";
import { throttle } from "../../lib/performance";

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const onScroll = throttle(() => setScrolled(window.scrollY > 20), 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Menu", path: "/menu" },
    { name: "Protocol", path: "/plans" },
    { name: "Philosophy", path: "/about" },
    { name: "Health Score", path: "/health-assessment" },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[100] px-3 py-3 sm:px-6 sm:py-6 transition-all duration-500",
      isOpen ? "pointer-events-auto" : "pointer-events-none"
    )}>
      <div 
        className={cn(
          "max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between transition-all duration-500 pointer-events-auto rounded-full border",
          scrolled 
            ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border-white/20 dark:border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.12)]" 
            : "bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-white/20 dark:border-zinc-800 shadow-sm"
        )}
      >
        <Link to="/" className="flex items-center gap-2 group">
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path} 
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:text-emerald-600 relative group flex items-center gap-1.5",
                location.pathname === link.path ? "text-emerald-600" : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              {(link as any).highlight && <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />}
              {link.name}
              {location.pathname === link.path && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-600 rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {currentUser ? (
            <Link 
              to="/dashboard"
              className="hidden sm:flex px-4 h-10 items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          ) : (
            <Link 
              to="/login"
              className="hidden sm:flex px-4 h-10 items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-emerald-600 transition-colors"
            >
              <User className="w-4 h-4" /> Account
            </Link>
          )}
          
          <Link 
            to="/plans"
            className="hidden sm:flex bg-zinc-950 text-white px-6 h-10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-950/10 hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 items-center gap-2 group cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" /> Start
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden w-11 h-11 flex items-center justify-center text-zinc-950 dark:text-white hover:bg-zinc-100/90 dark:hover:bg-zinc-800 active:scale-90 rounded-full cursor-pointer transition-all border border-zinc-200/50 dark:border-zinc-700 shadow-2xs"
            onClick={() => {
              triggerHaptic('light');
              setIsOpen(!isOpen);
            }}
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/10 backdrop-blur-xs z-[101] pointer-events-auto"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="lg:hidden absolute top-20 left-3 right-3 sm:left-6 sm:right-6 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl rounded-[2rem] border border-slate-200/80 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 overflow-hidden pointer-events-auto z-[102]"
            >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "font-black text-3xl tracking-tighter transition-all flex items-center justify-between group",
                    location.pathname === link.path ? "text-emerald-600" : "text-zinc-950 dark:text-white"
                  )}
                >
                  <span className="flex items-center gap-3">
                    {(link as any).highlight && <Sparkles className="w-5 h-5 text-amber-500" />}
                    {link.name}
                  </span>
                  <ArrowRight className="w-6 h-6 text-zinc-300 group-hover:text-emerald-600 transition-all group-hover:translate-x-2" />
                </Link>
              ))}
              <div className="h-px bg-zinc-100/50 my-2" />
              <div className="grid grid-cols-2 gap-4">
                {currentUser ? (
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsOpen(false)}
                    className="h-14 rounded-2xl bg-zinc-100 text-emerald-600 font-black uppercase tracking-widest text-xs flex items-center justify-center"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)}
                    className="h-14 rounded-2xl bg-zinc-100 text-zinc-950 font-black uppercase tracking-widest text-xs flex items-center justify-center"
                  >
                    Login
                  </Link>
                )}
                <Link 
                  to="/plans" 
                  onClick={() => setIsOpen(false)}
                  className="h-14 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center cursor-pointer"
                >
                  Order
                </Link>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
