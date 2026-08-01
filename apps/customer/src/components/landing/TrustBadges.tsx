import React from 'react';
import { Star, ShieldCheck, Users, Trophy } from 'lucide-react';

export default function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-12 py-8 border-y border-zinc-100 dark:border-white/5 w-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 group">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
        </div>
        <div>
          <p className="text-xl font-black text-zinc-900 dark:text-white">4.7 Rating</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Google & Swiggy</p>
        </div>
      </div>

      <div className="flex items-center gap-3 group">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Trophy className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <p className="text-xl font-black text-zinc-900 dark:text-white">15,000+</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Meals Delivered</p>
        </div>
      </div>

      <div className="flex items-center gap-3 group">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-xl font-black text-zinc-900 dark:text-white">FSSAI</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Certified Kitchen</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 group">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Users className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <p className="text-xl font-black text-zinc-900 dark:text-white">5,000+</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Active Members</p>
        </div>
      </div>
    </div>
  );
}
