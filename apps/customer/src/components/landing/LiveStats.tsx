import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, ShoppingBag, MapPin } from 'lucide-react';

export default function LiveStats() {
  const [stats, setStats] = useState({
    activeUsers: 1542,
    mealsToday: 892,
    areas: 14
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeUsers: prev.activeUsers + (Math.random() > 0.7 ? 1 : 0),
        mealsToday: prev.mealsToday + (Math.random() > 0.5 ? 1 : 0),
        areas: prev.areas
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-emerald-600 py-4 overflow-hidden relative group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Users className="w-3 h-3" /> {stats.activeUsers.toLocaleString()} People Cooking Now
            </span>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <ShoppingBag className="w-3 h-3" /> {stats.mealsToday.toLocaleString()} Meals Dispatched Today
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Serving {stats.areas} Localities in BLR
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
