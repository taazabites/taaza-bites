import React, { useState, useEffect } from 'react';
import { Home, Building2, ShoppingBag, PackageOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { PORTAL_LINKS } from '../config';

interface MobileBottomNavProps {
    currentPath: string;
    onNavigate: (path: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentPath, onNavigate }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const tabs = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/corporate-booking', icon: Building2, label: 'Corporate' },
        { href: PORTAL_LINKS.order, icon: ShoppingBag, label: 'Order', isAction: true },
        { href: PORTAL_LINKS.subscribe, icon: PackageOpen, label: 'Subscribe', isAccent: true }
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1000] pb-[env(safe-area-inset-bottom)] transition-all duration-300">
            {/* Glossy Glass Backdrop */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl shadow-[0_-12px_40px_rgba(0,0,0,0.12)] border-t border-white/60 rounded-t-[2.2rem]" />
            
            <div className="relative flex items-center justify-around h-16 sm:h-20 px-3 sm:px-12 max-w-2xl mx-auto">
                {tabs.map((tab) => {
                    const isActive = tab.path ? (currentPath === tab.path || (currentPath === '/home' && tab.path === '/')) : false;
                    const Icon = tab.icon;
                    const isAnchor = !!tab.href;
                    const Tag = isAnchor ? 'a' : 'button';
                    
                    const elementProps = isAnchor ? {
                        href: tab.href,
                    } : {
                        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            if (tab.path) onNavigate(tab.path);
                        },
                        onTouchStart: () => {
                            if (tab.path && typeof window !== "undefined") {
                                (window as any).prefetchComponent?.(tab.path);
                            }
                        }
                    };

                    return (
                        <Tag
                            key={tab.label}
                            {...(elementProps as any)}
                            className="relative flex flex-col items-center justify-center h-full flex-1 group active:scale-95 transition-transform"
                        >
                            <div className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-105 -translate-y-0.5' : 'opacity-75 group-hover:opacity-100'}`}>
                                <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
                                    isActive 
                                        ? "bg-[#059669] text-white shadow-[0_8px_20px_rgba(5,150,105,0.35)]" 
                                        : tab.isAccent
                                            ? "bg-[#059669]/10 text-[#059669] border border-[#059669]/20"
                                            : tab.isAction
                                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                                : "text-zinc-600 group-hover:bg-[#059669]/5"
                                }`}>
                                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                                </div>
                                <span className={`text-[9px] sm:text-[10px] mt-1 font-bold uppercase tracking-[0.1em] transition-colors duration-300 ${
                                    isActive ? "text-[#059669]" : "text-zinc-500"
                                }`}>
                                    {tab.label}
                                </span>
                            </div>
                            
                            {isActive && (
                                <motion.div 
                                    layoutId="activeTabIndicator"
                                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-[#059669] rounded-full shadow-[0_0_10px_rgba(5,150,105,0.8)]" 
                                />
                            )}
                        </Tag>
                    );
                })}
            </div>
        </div>
    );
};
