import React from 'react';
import { Card } from '../ui/primitives';
import { PauseCircle, FastForward, MapPin, Clock, ArrowUpRight, Gift, Headphones, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuickActionsWidget() {
  const actions = [
    { label: "Pause Plan", icon: <PauseCircle className="w-5 h-5 text-rose-500" />, path: "/dashboard/subscriptions", bg: "bg-rose-50 dark:bg-rose-500/10" },
    { label: "Skip Tomorrow", icon: <FastForward className="w-5 h-5 text-amber-500" />, path: "/dashboard/calendar", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { label: "Change Address", icon: <MapPin className="w-5 h-5 text-blue-500" />, path: "/dashboard/addresses", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Refer & Earn", icon: <Gift className="w-5 h-5 text-purple-500" />, path: "/dashboard/refer", bg: "bg-purple-50 dark:bg-purple-500/10" },
    { label: "Support", icon: <Headphones className="w-5 h-5 text-zinc-500" />, path: "/dashboard/support", bg: "bg-zinc-100 dark:bg-zinc-800" },
    { label: "Profile", icon: <UserCircle className="w-5 h-5 text-zinc-500" />, path: "/dashboard/settings", bg: "bg-zinc-100 dark:bg-zinc-800" },
  ];

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 p-6 rounded-[2rem]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {actions.map((action, idx) => (
          <Link 
            key={idx} 
            to={action.path}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${action.bg} transition-transform duration-300 group-hover:scale-110 group-active:scale-95`}>
              {action.icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
