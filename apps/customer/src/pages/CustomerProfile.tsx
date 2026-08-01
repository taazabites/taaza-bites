import React, { useState } from "react";
import CustomerPortalExperience from "../components/customer/CustomerPortalExperience";
import ProfileCenter from "../components/profile/ProfileCenter";
import { Sparkles, User, Activity } from "lucide-react";

export default function CustomerProfilePage() {
  const [viewMode, setViewMode] = useState<"portal" | "profile">("portal");

  return (
    <div className="w-full">
      <div className="space-y-6">
        
        {/* Top View Mode Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs gap-3 sm:gap-0 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setViewMode("portal")}
              className={`flex-1 sm:flex-none flex justify-center items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                viewMode === "portal"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Live</span> Portal
            </button>

            <button
              onClick={() => setViewMode("profile")}
              className={`flex-1 sm:flex-none flex justify-center items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                viewMode === "profile"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/50"
              }`}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Settings
            </button>
          </div>

          <span className="hidden sm:inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-black text-[9px] uppercase tracking-widest border border-emerald-500/20 shrink-0">
            TaazaBites Member Hub v4.2
          </span>
        </div>

        {/* Render Selected View */}
        {viewMode === "portal" ? (
          <CustomerPortalExperience />
        ) : (
          <ProfileCenter />
        )}

      </div>
    </div>
  );
}


