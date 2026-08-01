import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, FileText, Zap, BarChart3, Settings } from 'lucide-react';

export function OrdersTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { name: "Dashboard", path: "/orders", icon: LayoutDashboard },
    { name: "All Orders", path: "/orders/list", icon: List },
    { name: "Order Generation", path: "/orders/generate", icon: Zap },
    { name: "Reports", path: "/orders/reports", icon: BarChart3 }
  ];

  return (
    <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto pb-0">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path || (tab.path === '/orders/list' && location.pathname.startsWith('/orders/list'));
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
