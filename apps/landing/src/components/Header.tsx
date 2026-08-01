import { X } from 'lucide-react';
import { WHATSAPP_NUMBER, PORTAL_LINKS } from '../config';
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { SmartButton } from "./SmartButton";
import { NutritionTips } from "./NutritionTips";
import { SubscriptionQuickInfo } from "./SubscriptionQuickInfo";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const touchStartRef = React.useRef<number | null>(null);
  const { openAuth, user } = useAuth();

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartRef.current;
    
    // Swipe to the right (close menu)
    if (deltaX > 60) {
      setIsMobileMenuOpen(false);
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const primaryLinks = [
    { name: "Home", path: "/" },
    { name: "Our Menu", path: "/menu" },
    { name: "Meal Plans", path: "/subscriptions" },
    { name: "Free Assessment", path: "/health-assessment" },
  ];

  const moreLinks = [
    { name: "Corporate Booking", path: "/corporate-booking" },
    { name: "Reviews", path: "/testimonials" },
    { name: "Macro Calculator", path: "/macro-calculator" },
    { name: "Delivery Slots & Zones", path: "logistics-drawer-trigger" },
    { name: "Blog", path: "/blog" },
    { name: "Why Us", path: "/why-us" },
    { name: "Careers", path: "/careers" },
    { name: "FAQ", path: "/faq" },
    { name: "WhatsApp Us", path: `https://wa.me/${WHATSAPP_NUMBER}` },
  ];

  const navLinks = [...primaryLinks, ...moreLinks];

  const handleNavClick = (path: string) => {
    if (path === "logistics-drawer-trigger") {
      window.dispatchEvent(new CustomEvent("taazabites:open-logistics"));
      setIsMobileMenuOpen(false);
      return;
    }
    if (path.startsWith('http')) {
      const opened = window.open(path, '_blank');
      if (!opened) {
        window.location.href = path;
      }
      setIsMobileMenuOpen(false);
      return;
    }
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  const isHomePage =
    currentPage === "/" || currentPage === "/home" || !currentPage;
  const isDarkPage = currentPage === "/careers";
  const isHeaderSolid = isScrolled || !isHomePage;

  return (
    <>
      <header
        role="banner"
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
          isHeaderSolid
            ? isDarkPage
              ? "bg-[#050505]/95 backdrop-blur-md shadow-md border-b border-white/10"
              : "bg-[#FFF8F0]/95 backdrop-blur-md shadow-md border-b border-[#059669]/10"
            : "bg-transparent shadow-none"
        }`}
      >
        {/* Nutrition Tips Bar - Hide on scroll for cleaner header */}
        <div
          className={`transition-all duration-300 overflow-hidden ${isScrolled ? "h-0 opacity-0" : "h-auto opacity-100"}`}
        >
          <NutritionTips />
        </div>

        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? "py-2 sm:py-3" : "py-3 sm:py-5"}`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              className="cursor-pointer flex-shrink-0"
              onClick={() => handleNavClick("/")}
            >
              <Logo
                variant={isHeaderSolid && !isDarkPage ? "dark" : "light"}
                className={`transition-transform duration-300 ${isScrolled ? "scale-90 text-[#059669]" : "scale-100 text-[#059669]"}`}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
              {primaryLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.path);
                  }}
                  onMouseEnter={() => {
                    if (typeof window !== "undefined") {
                      (window as any).prefetchComponent?.(link.path);
                    }
                  }}
                  className={`text-sm font-medium transition-colors relative group whitespace-nowrap ${
                    currentPage === link.path
                      ? "text-[#418B1E]"
                      : isHeaderSolid && !isDarkPage
                        ? "text-gray-800 hover:text-[#418B1E]"
                        : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#418B1E] transform origin-left transition-transform duration-300 ${currentPage === link.path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                  ></span>
                </a>
              ))}

              {/* More Dropdown */}
              <div className="relative group">
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    moreLinks.some(link => link.path === currentPage)
                      ? "text-[#418B1E]"
                      : isHeaderSolid && !isDarkPage
                        ? "text-gray-800 hover:text-[#418B1E]"
                        : "text-white/90 hover:text-white"
                  }`}
                >
                  More
                  <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#418B1E] transform origin-left transition-transform duration-300 ${moreLinks.some(link => link.path === currentPage) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                  ></span>
                </button>
                <div className="absolute top-full right-0 mt-4 w-48 bg-[#050505] border border-white/10 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2 translate-y-2 group-hover:translate-y-0">
                  {moreLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.path}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link.path);
                      }}
                      onMouseEnter={() => {
                        if (typeof window !== "undefined") {
                          (window as any).prefetchComponent?.(link.path);
                        }
                      }}
                      className={`block w-full text-left px-5 py-2.5 text-sm transition-colors ${
                        currentPage === link.path ? "bg-[#418B1E]/10 text-[#418B1E] font-medium" : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4">
              {user ? (
                <button
                  type="button"
                  onClick={() => openAuth()}
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-full border transition-all ${
                    isHeaderSolid && !isDarkPage
                      ? "border-gray-200 text-gray-800 hover:border-[#059669]"
                      : "border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  Portals
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuth()}
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-full border transition-all ${
                    isHeaderSolid && !isDarkPage
                      ? "border-gray-200 text-gray-800 hover:border-[#059669]"
                      : "border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  Sign in
                </button>
              )}
              <div className="flex flex-col items-center">
                <SmartButton
                  label="Subscribe"
                  href={PORTAL_LINKS.subscribe}
                  variant="secondary"
                  className={`shadow-sm hover:shadow-md transition-all px-3 py-2 text-sm ${isHeaderSolid && !isDarkPage ? "bg-white text-gray-900 border-gray-200" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}
                />
                <SubscriptionQuickInfo className="mt-1" />
              </div>
              <SmartButton
                label="Order Now"
                href={PORTAL_LINKS.order}
                target="_blank"
                variant="primary"
                className="bg-[#059669] hover:bg-[#047857] text-white px-3 py-2 text-sm shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] hover:-translate-y-0.5 transition-all"
              />
            </div>

            {/* Mobile/Tablet CTAs & Toggle */}
            <div className="lg:hidden flex items-center gap-2 sm:gap-3">
              <a
                href={PORTAL_LINKS.order}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-1.5 sm:px-5 sm:py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md ${
                  isHeaderSolid && !isDarkPage
                    ? "bg-[#059669] text-white hover:bg-[#047857]"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                }`}
              >
                Order Now
              </a>
              <button
                className={`w-9 h-9 sm:w-10 sm:h-10 flex flex-col items-center justify-center rounded-full border transition-all duration-300 active:scale-95 group relative overflow-hidden shrink-0 ${
                  isHeaderSolid && !isDarkPage
                    ? "bg-white border-gray-100 text-[#1A1A1A] shadow-sm hover:shadow-md"
                    : "bg-white/10 border-white/20 text-white backdrop-blur-sm"
                }`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <div className="w-3.5 h-3 sm:w-4 sm:h-3.5 relative flex flex-col justify-between">
                  <span
                    className={`w-full h-[1.5px] sm:h-[2px] rounded-full transition-all duration-300 origin-left ${isHeaderSolid && !isDarkPage ? "bg-[#1A1A1A]" : "bg-white"} ${isMobileMenuOpen ? "rotate-45 translate-x-0.5 -translate-y-0.5" : ""}`}
                  ></span>
                  <span
                    className={`w-full h-[1.5px] sm:h-[2px] rounded-full transition-all duration-300 ${isHeaderSolid && !isDarkPage ? "bg-[#1A1A1A]" : "bg-white"} ${isMobileMenuOpen ? "opacity-0 -translate-x-2" : ""}`}
                  ></span>
                  <span
                    className={`w-full h-[1.5px] sm:h-[2px] rounded-full transition-all duration-300 origin-left ${isHeaderSolid && !isDarkPage ? "bg-[#1A1A1A]" : "bg-white"} ${isMobileMenuOpen ? "-rotate-45 translate-x-0.5 translate-y-0.5" : ""}`}
                  ></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[1001] transition-all duration-500 ease-in-out lg:hidden will-change-opacity ${
          isMobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 right-0 bottom-0 w-[85%] sm:w-[400px] bg-[#FFF8F0] z-[1002] shadow-[0_0_60px_rgba(0,0,0,0.2)] transition-transform duration-600 ease-[cubic-bezier(0.32,0,0.07,1)] lg:hidden flex flex-col will-change-transform ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full pointer-events-none"
        }`}
      >
        <div className="p-4 sm:p-6 flex justify-between items-center border-b border-[#059669]/10 bg-white/50 backdrop-blur-md">
          <Logo variant="dark" className="scale-[0.85] sm:scale-90 origin-left" />
          <button
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white border border-gray-100 text-[#1A1A1A] hover:bg-gray-50 transition-all duration-300 active:scale-90 shadow-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-10">
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#059669] mb-4 sm:mb-6 px-1">Quick Links</p>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.path);
                  }}
                  onTouchStart={() => {
                    if (typeof window !== "undefined") {
                      (window as any).prefetchComponent?.(link.path);
                    }
                  }}
                  style={{
                    transitionDelay: isMobileMenuOpen
                      ? `${index * 40 + 80}ms`
                      : "0ms",
                    transform: isMobileMenuOpen
                      ? "translateX(0)"
                      : "translateX(15px)",
                    opacity: isMobileMenuOpen ? 1 : 0,
                  }}
                  className={`group flex items-center justify-between py-3 sm:py-4 border-b border-gray-50 last:border-0 transition-all duration-300 ${
                    currentPage === link.path
                      ? "text-[#059669]"
                      : "text-gray-800 hover:text-[#059669]"
                  }`}
                >
                  <span className={`text-base sm:text-lg font-sans font-extrabold tracking-wider uppercase transition-all duration-300 ${currentPage === link.path ? "text-[#059669] translate-x-1" : ""}`}>
                    {link.name}
                  </span>
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 -rotate-90 text-gray-300 transition-all duration-300 group-hover:text-[#059669] group-hover:translate-x-1" />
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div
          className="p-6 sm:p-8 pb-10 sm:pb-12 border-t border-[#059669]/10 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.02)] transition-all duration-700 delay-300 flex flex-col gap-3 sm:gap-4"
          style={{
            transform: isMobileMenuOpen ? "translateY(0)" : "translateY(20px)",
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                openAuth();
              }}
              className="w-full justify-center shadow-md py-3.5 sm:py-4 text-[13px] sm:text-sm font-bold rounded-full bg-gray-900 text-white hover:bg-black"
            >
              {user ? 'Portals' : 'Sign in'}
            </button>
            <SmartButton
              label="Subscribe"
              href={PORTAL_LINKS.subscribe}
              variant="primary"
              className="w-full justify-center shadow-md py-3.5 sm:py-4 text-[13px] sm:text-sm font-bold border-transparent bg-[#059669] text-white hover:bg-[#047857]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
             <SubscriptionQuickInfo className="flex justify-center" />
             <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="text-[10px] text-[#059669] font-bold uppercase tracking-widest hover:underline mt-1">24/7 WhatsApp Support</a>
          </div>
        </div>
      </div>
    </>
  );
};
