import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../../hooks/useDebounce";
import { 
 Search, 
 LayoutGrid, 
 UtensilsCrossed, 
 CalendarRange, 
 ReceiptText, 
 HeartPulse, 
 Wallet, 
 Gift, 
 Sparkles,
 LifeBuoy, 
 Settings, 
 LogOut, 
 Moon, 
 Sun,
 CornerDownLeft,
 ChevronUp,
 ChevronDown,
 Scan
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/db";

interface CommandItem {
 label: string;
 icon: any;
 action: () => void;
 group: "Navigation" | "Actions";
 keywords?: string;
}

export default function CommandMenu() {
 const navigate = useNavigate();
 const { user, logout } = useAuth();
 
 const [isOpen, setIsOpen] = useState(false);
 const [search, setSearch] = useState("");
 const debouncedSearch = useDebounce(search, 150);
 const [activeIndex, setActiveIndex] = useState(0);
 const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

 // Sync state with DOM on mount and updates
 useEffect(() => {
 const observer = new MutationObserver(() => {
 setIsDark(document.documentElement.classList.contains("dark"));
 });
 observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
 return () => observer.disconnect();
 }, []);

 // Toggle menu on Cmd+K / Ctrl+K and custom event
 useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
 if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
 e.preventDefault();
 setIsOpen(prev => !prev);
 }
 if (e.key === "Escape") {
 setIsOpen(false);
 }
 };
 const handleCustomOpen = () => {
 setIsOpen(true);
 };
 window.addEventListener("keydown", handleKeyDown);
 window.addEventListener("open-command-menu", handleCustomOpen);
 return () => {
 window.removeEventListener("keydown", handleKeyDown);
 window.removeEventListener("open-command-menu", handleCustomOpen);
 };
 }, []);

 const handleNavigate = (path: string) => {
 navigate(path);
 setIsOpen(false);
 };

 const toggleDarkMode = async () => {
 const nextDark = !isDark;
 if (nextDark) {
 document.documentElement.classList.add("dark");
 } else {
 document.documentElement.classList.remove("dark");
 }
 setIsDark(nextDark);
 setIsOpen(false);

 if (user) {
 try {
 const userRef = doc(db, "users", user.uid);
 await setDoc(userRef, { preferences: { darkMode: nextDark } }, { merge: true });
 } catch (err) {
 console.error("Error updating theme preference in database:", err);
 }
 }
 };

 const commands: CommandItem[] = [
 { label: "Scan QR Code / Pass", icon: Scan, action: () => { setIsOpen(false); window.dispatchEvent(new CustomEvent('open-qr-scanner')); }, group: "Actions", keywords: "qr camera scan pass code redeem referral voucher" },
 { label: "Dashboard Overview", icon: LayoutGrid, action: () => handleNavigate("/dashboard"), group: "Navigation", keywords: "home dashboard overview" },
 { label: "AI Nutrition Advisor", icon: Sparkles, action: () => handleNavigate("/ai-engine"), group: "Navigation", keywords: "ai engine logic advisor coach" },
 { label: "Today's Meals", icon: UtensilsCrossed, action: () => handleNavigate("/dashboard/todays-meals"), group: "Navigation", keywords: "food breakfast lunch dinner swap" },
 { label: "Meal Calendar", icon: CalendarRange, action: () => handleNavigate("/dashboard/calendar"), group: "Navigation", keywords: "schedule dates calendar" },
 { label: "Orders & Invoices", icon: ReceiptText, action: () => handleNavigate("/dashboard/orders"), group: "Navigation", keywords: "history billing receipts orders" },
 { label: "Health Assessment", icon: HeartPulse, action: () => handleNavigate("/dashboard/health"), group: "Navigation", keywords: "metrics quiz assessment health" },
 { label: "Wallet & Cash", icon: Wallet, action: () => handleNavigate("/dashboard/wallet"), group: "Navigation", keywords: "money balance deposit credits" },
 { label: "Refer & Earn", icon: Gift, action: () => handleNavigate("/dashboard/refer"), group: "Navigation", keywords: "invite share refer friends coupon" },
 { label: "Rewards & Badges", icon: Sparkles, action: () => handleNavigate("/dashboard/rewards"), group: "Navigation", keywords: "points loyalty prize member" },
 { label: "Support & FAQs", icon: LifeBuoy, action: () => handleNavigate("/dashboard/support"), group: "Navigation", keywords: "help ticket support faqs" },
 { label: "Profile & Settings", icon: Settings, action: () => handleNavigate("/dashboard/profile"), group: "Navigation", keywords: "account settings preferences" },
 { label: "Toggle Theme", icon: isDark ? Sun : Moon, action: toggleDarkMode, group: "Actions", keywords: "theme light dark toggle mode" },
 { label: "Log Out", icon: LogOut, action: () => { logout(); setIsOpen(false); }, group: "Actions", keywords: "exit signout logout" },
 ];

 const filteredCommands = commands.filter(cmd => 
 cmd.label.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
 cmd.keywords?.toLowerCase().includes(debouncedSearch.toLowerCase())
 );

 // Keyboard navigation (Up/Down/Enter)
 const handleKeyDown = (e: React.KeyboardEvent) => {
 if (filteredCommands.length === 0) return;

 if (e.key === "ArrowDown") {
 e.preventDefault();
 setActiveIndex(prev => (prev + 1) % filteredCommands.length);
 } else if (e.key === "ArrowUp") {
 e.preventDefault();
 setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
 } else if (e.key === "Enter") {
 e.preventDefault();
 filteredCommands[activeIndex]?.action();
 }
 };

 return (
 <>
 {/* Global Shortcut Listener & Trigger (hidden trigger if they want custom click, but keyboard is primary) */}
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-[100] bg-zinc-950/70 backdrop-blur-md flex items-start justify-center p-4 pt-[15vh]"
 onClick={() => setIsOpen(false)}
 >
 <motion.div
 initial={{ scale: 0.95, y: -20, opacity: 0 }}
 animate={{ scale: 1, y: 0, opacity: 1 }}
 exit={{ scale: 0.95, y: -20, opacity: 0 }}
 transition={{ type: "spring", damping: 25, stiffness: 300 }}
 className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
 onClick={(e) => e.stopPropagation()}
 onKeyDown={handleKeyDown}
 >
 {/* Search Input */}
 <div className="flex items-center gap-3 p-4 border-b border-zinc-100 ">
 <Search className="h-5 w-5 text-zinc-400 shrink-0" />
 <input
 autoFocus
 placeholder="Search commands or navigate..."
 value={search}
 onChange={(e) => { setSearch(e.target.value); setActiveIndex(0); }}
 className="w-full bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none text-base tracking-tight"
 />
 <kbd className="hidden md:flex items-center gap-1 text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200 ">ESC</kbd>
 </div>

 {/* Commands List */}
 <div className="p-2 max-h-[350px] overflow-y-auto no-scrollbar">
 {filteredCommands.length === 0 && (
 <div className="p-8 text-center text-sm text-zinc-500">No commands found.</div>
 )}
 
 {filteredCommands.map((cmd, index) => (
 <button
 key={cmd.label}
 onMouseEnter={() => setActiveIndex(index)}
 onClick={cmd.action}
 className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors cursor-pointer ${
 index === activeIndex 
 ? "bg-zinc-100 dark:bg-zinc-800" 
 : "bg-transparent"
 }`}
 >
 <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
 index === activeIndex 
 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
 : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
 }`}>
 <cmd.icon className="h-4 w-4" />
 </div>
 <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-white tracking-tight">{cmd.label}</span>
 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{cmd.group}</span>
 {index === activeIndex && (
 <CornerDownLeft className="h-4 w-4 text-zinc-400" />
 )}
 </button>
 ))}
 </div>

 {/* Footer Hint */}
 <div className="flex items-center justify-between p-3 border-t border-zinc-100 bg-zinc-50/50 ">
 <div className="flex items-center gap-2 text-xs text-zinc-500">
 <kbd className="flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded border border-zinc-200 ">
 <ChevronUp className="h-3 w-3" />
 <ChevronDown className="h-3 w-3" />
 </kbd>
 <span className="text-zinc-400 ">to navigate</span>
 </div>
 <div className="flex items-center gap-2 text-xs text-zinc-500">
 <kbd className="bg-white px-1.5 py-0.5 rounded border border-zinc-200 ">Enter</kbd>
 <span className="text-zinc-400 ">to select</span>
 </div>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 );
}
