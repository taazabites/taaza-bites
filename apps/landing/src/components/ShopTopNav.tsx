/**
 * Shared top nav for Products / Subscriptions shop surfaces.
 * Profile opens a dropdown; Subscriptions & Deliveries can open the auth drawer.
 */
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Calendar, ShoppingBag, Truck, User } from "lucide-react";
import { Logo } from "./Logo";
import { ShopAuthDrawer } from "./ShopAuthDrawer";
import { PORTAL_LINKS } from "../config";

export type ShopNavAction = "products" | "subscriptions" | "deliveries";

const NAV_ITEMS: {
  label: string;
  icon: typeof ShoppingBag;
  action: ShopNavAction;
}[] = [
  { label: "Products", icon: ShoppingBag, action: "products" },
  { label: "Subscriptions", icon: Calendar, action: "subscriptions" },
  { label: "Deliveries", icon: Truck, action: "deliveries" },
];

const PROFILE_LINKS = [
  { label: "Delivery History", href: `${PORTAL_LINKS.customer}/dashboard/orders` },
  { label: "Transactions and Invoices", href: `${PORTAL_LINKS.customer}/dashboard/wallet` },
  { label: "Account", href: `${PORTAL_LINKS.customer}/profile` },
  { label: "Support", href: `${PORTAL_LINKS.customer}/dashboard/support` },
] as const;

interface ShopTopNavProps {
  active: "products" | "subscriptions";
  onNavigate: (path: string) => void;
}

export const ShopTopNav: React.FC<ShopTopNavProps> = ({ active, onNavigate }) => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState<"subscriptions" | "deliveries" | "profile">(
    "subscriptions"
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const openAuth = (intent: "subscriptions" | "deliveries" | "profile") => {
    setProfileOpen(false);
    setAuthIntent(intent);
    setAuthOpen(true);
  };

  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = profileRef.current;
      if (el && !el.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  const handleNav = (action: ShopNavAction) => {
    setProfileOpen(false);
    if (action === "products") {
      onNavigate("/products");
      return;
    }
    if (active === "subscriptions" && (action === "subscriptions" || action === "deliveries")) {
      openAuth(action);
      return;
    }
    if (action === "subscriptions") {
      onNavigate("/subscriptions");
      return;
    }
    openAuth("deliveries");
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="shrink-0 cursor-pointer"
            aria-label="Taaza Bites home"
          >
            <Logo showText={false} size="sm" />
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="flex items-center gap-4 sm:gap-6" aria-label="Shop">
              {NAV_ITEMS.map(({ label, icon: Icon, action }) => {
                const isActive = action === active;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleNav(action)}
                    className={`flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-sm font-medium transition-colors cursor-pointer ${
                      isActive ? "text-[#6B9F3C]" : "text-zinc-800 hover:text-[#6B9F3C]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${
                        isActive ? "text-[#6B9F3C]" : "text-zinc-700"
                      }`}
                      strokeWidth={1.75}
                    />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Profile — circular icon + dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#6B9F3C] flex items-center justify-center text-[#6B9F3C] hover:bg-[#6B9F3C]/10 transition-colors cursor-pointer"
                aria-label="Profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <User className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    role="menu"
                    className="absolute right-0 top-[calc(100%+10px)] w-56 bg-white rounded-xl border border-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-2 z-50 origin-top-right"
                  >
                    {PROFILE_LINKS.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-50 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        {item.label}
                      </a>
                    ))}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => openAuth("profile")}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#6B9F3C] hover:bg-[#6B9F3C]/5 transition-colors cursor-pointer"
                    >
                      Log In
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <ShopAuthDrawer
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        intent={authIntent}
      />
    </>
  );
};
