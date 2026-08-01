import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, BookOpen, ChefHat, Package, Droplet, Users, FileText } from 'lucide-react';

export function KitchenTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { name: "Dashboard", path: "/kitchen", icon: LayoutDashboard },
    { name: "Production Planner", path: "/kitchen/planner", icon: CalendarDays },
    { name: "Recipes", path: "/kitchen/recipes", icon: BookOpen },
    { name: "Prep Board", path: "/kitchen/board", icon: ChefHat },
    { name: "Packing", path: "/kitchen/packing", icon: Package },
    { name: "Ingredients", path: "/kitchen/consumption", icon: Droplet },
    { name: "Staff", path: "/kitchen/staff", icon: Users },
    { name: "Reports", path: "/kitchen/reports", icon: FileText }
  ];

  return (
    <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto pb-0">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const TabIcon = tab.icon;
        
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`pb-3 text-sm font-semibold relative transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap px-1 select-none ${
              isActive ? "text-emerald-400 font-bold" : "text-zinc-400 hover:text-white"
            }`}
          >
            <TabIcon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
            {tab.name}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
