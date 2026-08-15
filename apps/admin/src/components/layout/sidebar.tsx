import React, { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/auth-context"
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Receipt,
  LifeBuoy,
  Settings,
  X,
  CreditCard,
  ChefHat,
  Truck,
  PieChart,
  Package,
  HeartPulse,
  Tag,
  Wallet,
  Gift,
  BellRing,
  ShieldCheck,
  ClipboardList,
  MapPin,
  Terminal,
  Building,
  BarChart3,
  Search,
  Beaker,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react"

type SubItem = {
  title: string;
  href: string;
};

type NavItem = {
  title: string;
  icon: any;
  href?: string;
  subItems?: SubItem[];
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/"
  },
  {
    title: "Customers",
    icon: Users,
    subItems: [
      { title: "All Customers", href: "/customers" },
      { title: "Health Assessments", href: "/customers/health" },
      { title: "Delivery Addresses", href: "/customers/addresses" },
      { title: "Wallet", href: "/customers/wallet" },
      { title: "Reward Points", href: "/customers/rewards" },
      { title: "Referrals", href: "/customers/referrals" },
      { title: "Customer Notes", href: "/customers/notes" },
    ]
  },
  {
    title: "Subscriptions",
    icon: CreditCard,
    subItems: [
      { title: "Subscription Plans", href: "/plans" },
      { title: "Active Subscriptions", href: "/subscriptions" },
      { title: "Renewals", href: "/subscriptions/renewals" },
      { title: "Expiring Soon", href: "/subscriptions/expiring" },
    ]
  },
  {
    title: "Orders",
    icon: ClipboardList,
    subItems: [
      { title: "Dashboard", href: "/orders" },
      { title: "All Orders", href: "/orders/list" },
      { title: "Order Generation", href: "/orders/generate" },
      { title: "Reports", href: "/orders/reports" },
    ]
  },
  {
    title: "Menu Management",
    icon: UtensilsCrossed,
    subItems: [
      { title: "Categories", href: "/meals/categories" },
      { title: "Meals", href: "/meals" },
      { title: "Pricing", href: "/meals/pricing" },
      { title: "Availability", href: "/meals/availability" },
      { title: "Weekly Planner", href: "/meals/planner" },
      { title: "Plan Mapping", href: "/meals/mapping" },
    ]
  },
  {
    title: "Kitchen",
    icon: ChefHat,
    subItems: [
      { title: "Dashboard", href: "/kitchen" },
      { title: "Planner", href: "/kitchen/planner" },
      { title: "Recipes", href: "/kitchen/recipes" },
      { title: "Prep Board", href: "/kitchen/board" },
      { title: "Packing", href: "/kitchen/packing" },
      { title: "Ingredients", href: "/kitchen/consumption" },
      { title: "Staff", href: "/kitchen/staff" },
      { title: "Reports", href: "/kitchen/reports" },
      { title: "Today's Schedule", href: "/scheduler" },
    ]
  },
  {
    title: "Inventory",
    icon: Package,
    subItems: [
      { title: "Ingredients", href: "/inventory" },
      { title: "Stock", href: "/inventory/stock" },
      { title: "Suppliers", href: "/inventory/suppliers" },
      { title: "Purchase Orders", href: "/inventory/orders" },
    ]
  },
  {
    title: "Delivery",
    icon: Truck,
    subItems: [
      { title: "Drivers", href: "/delivery/drivers" },
      { title: "Routes", href: "/delivery/routes" },
      { title: "Live Deliveries", href: "/delivery" },
    ]
  },
  {
    title: "Service Areas",
    icon: MapPin,
    subItems: [
      { title: "Delivery Areas", href: "/service-areas" },
      { title: "PIN Codes", href: "/service-areas/pincodes" },
    ]
  },
  {
    title: "Payments",
    icon: Receipt,
    subItems: [
      { title: "Transactions", href: "/finance" },
      { title: "Refunds", href: "/finance/refunds" },
      { title: "Invoices", href: "/finance/invoices" },
    ]
  },
  {
    title: "Coupons & Offers",
    icon: Tag,
    href: "/coupons"
  },
  {
    title: "Marketing & Growth",
    icon: BellRing,
    href: "/marketing"
  },
  {
    title: "Content Management (CMS)",
    icon: BellRing,
    href: "/cms"
  },
  {
    title: "Reports & Analytics",
    icon: PieChart,
    href: "/analytics"
  },
  {
    title: "Advanced Reports",
    icon: PieChart,
    href: "/reports"
  },
  {
    title: "Communication Center",
    icon: BellRing,
    subItems: [
      { title: "Dashboard", href: "/communication" },
      { title: "Campaigns", href: "/communication/campaigns" },
      { title: "Templates", href: "/communication/templates" },
      { title: "Conversations", href: "/communication/conversations" },
      { title: "Notifications", href: "/communication/notifications" },
    ]
  },
  {
    title: "Customer Support",
    icon: LifeBuoy,
    href: "/support"
  },
  {
    title: "Business Settings",
    icon: Settings,
    subItems: [
      { title: "Business Settings", href: "/settings" },
      { title: "Gateway Settings", href: "/settings/gateways" },
    ]
  },
  {
    title: "Admin Management",
    icon: ShieldCheck,
    href: "/admin-management"
  },
  {
    title: "Super Admin",
    icon: ShieldCheck,
    href: "/super-admin"
  },
  {
    title: "Audit Logs",
    icon: Terminal,
    href: "/audit-logs"
  },
  {
    title: "QA Control Center",
    icon: Beaker,
    href: "/qa-test"
  },
  {
    title: "Enterprise",
    icon: Building,
    subItems: [
      { title: "CEO Dashboard", href: "/ceo" },
      { title: "Operations Control Center", href: "/operations" },
      { title: "Franchise Management", href: "/franchises" },
      { title: "Corporate Clients", href: "/corporate" },
      { title: "Branch Management", href: "/branches" },
      { title: "Kitchen Management", href: "/kitchen/management" },
      { title: "Operations Dashboard", href: "/operations/dashboard" },
      { title: "Business Intelligence", href: "/bi" },
      { title: "Performance Dashboard", href: "/performance" },
      { title: "AI Insights Dashboard", href: "/ai-dashboard" },
      { title: "AI CRM Command Center", href: "/crm-command" },
    ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  className?: string;
}

import { motion, AnimatePresence } from "motion/react";

const SidebarItem = React.memo(({ item, active, isExpanded, activeSubHref, toggleExpand, setIsOpen, isCollapsed }: {
  item: NavItem;
  active: boolean;
  isExpanded: boolean;
  activeSubHref: string | null;
  toggleExpand: (title: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed?: boolean;
}) => {
  const hasSub = item.subItems && item.subItems.length > 0;

  return (
    <div className="flex flex-col">
      {hasSub ? (
        <button
          onClick={() => toggleExpand(item.title)}
          title={isCollapsed ? item.title : undefined}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg py-2 text-[0.85rem] font-medium transition-all duration-200 group relative",
            isCollapsed ? "justify-center px-2" : "justify-between px-3",
            active && !isExpanded ? "text-foreground bg-accent/50" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          {active && !isExpanded && (
            <motion.div layoutId="active-nav-indicator" className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full" />
          )}
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <item.icon className={cn("h-[18px] w-[18px] transition-colors shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            {!isCollapsed && <span>{item.title}</span>}
          </div>
          {!isCollapsed && (
            <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0", isExpanded && "rotate-90")} />
          )}
        </button>
      ) : (
        <Link
          to={item.href || "#"}
          title={isCollapsed ? item.title : undefined}
          onClick={() => {
            if (window.innerWidth < 1024) { // Only close on mobile
              setIsOpen(false);
            }
          }}
          className={cn(
            "flex items-center gap-3 rounded-lg py-2 text-[0.85rem] font-medium transition-all duration-200 group relative",
            isCollapsed ? "justify-center px-2" : "px-3",
            active
              ? "bg-emerald-500/10 text-emerald-400 font-semibold"
              : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
          )}
        >
          {active && (
            <motion.div layoutId="active-nav-indicator" className="absolute left-0 top-2 bottom-2 w-[3px] bg-emerald-500 rounded-r-full" />
          )}
          <item.icon className={cn("h-[18px] w-[18px] transition-colors shrink-0", active ? "text-emerald-500" : "text-zinc-500 group-hover:text-white")} />
          {!isCollapsed && <span>{item.title}</span>}
        </Link>
      )}

      {hasSub && !isCollapsed && (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-[2px] mt-1 mb-2 relative before:absolute before:inset-y-0 before:left-[21px] before:w-[1px] before:bg-border">
                {item.subItems!.map((sub) => {
                  const subActive = activeSubHref === sub.href;
                  return (
                    <Link
                      key={sub.href}
                      to={sub.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) { // Only close on mobile
                          setIsOpen(false);
                        }
                      }}
                      className={cn(
                        "relative pl-11 pr-3 py-1.5 text-sm font-medium transition-colors rounded-md group flex items-center",
                        subActive
                          ? "text-emerald-500 bg-emerald-500/10 font-semibold"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                      )}
                    >
                      {subActive && (
                        <motion.div layoutId={`active-subnav-${sub.href}`} className="absolute left-[20px] top-0 bottom-0 w-[2px] bg-emerald-500 rounded-full z-10" />
                      )}
                      {sub.title}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
});

export const Sidebar = React.memo(function Sidebar({ className, isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  const toggleExpand = React.useCallback((title: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  }, []);

  const handleSetIsOpen = React.useCallback((val: boolean) => {
    setIsOpen(val);
  }, [setIsOpen]);

  const filteredNavItems = useMemo(() => {
    const roleFiltered = navItems.filter((item) => {
      if (item.href === "/super-admin") {
        return user?.role === "Super Admin";
      }
      return true;
    });

    if (!searchQuery) return roleFiltered;
    const query = searchQuery.toLowerCase();
    
    return roleFiltered.reduce((acc: NavItem[], item) => {
      const matchesMain = item.title.toLowerCase().includes(query);
      const matchingSubItems = item.subItems?.filter(sub => sub.title.toLowerCase().includes(query));
      
      if (matchesMain || (matchingSubItems && matchingSubItems.length > 0)) {
        acc.push({
          ...item,
          subItems: matchesMain ? item.subItems : matchingSubItems
        });
      }
      return acc;
    }, []);
  }, [searchQuery, user?.role]);

  const checkIsActive = (href: string) => {
    if (href === "/" || href === "/orders" || href === "/customers" || href === "/meals" || href === "/delivery" || href === "/inventory" || href === "/service-areas" || href === "/finance") {
      return location.pathname === href;
    }
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const isGroupActive = (item: NavItem) => {
    if (item.href && checkIsActive(item.href)) return true;
    return item.subItems?.some(sub => checkIsActive(sub.href)) || false;
  };

  React.useEffect(() => {
    const newExpanded = { ...expandedItems };
    let changed = false;
    navItems.forEach(item => {
      if (item.subItems && isGroupActive(item)) {
        if (!newExpanded[item.title]) {
          newExpanded[item.title] = true;
          changed = true;
        }
      }
    });
    if (changed) {
      setExpandedItems(newExpanded);
    }
  }, [location.pathname]);

  React.useEffect(() => {
    if (searchQuery) {
      const newExpanded: Record<string, boolean> = {};
      filteredNavItems.forEach(item => {
        if (item.subItems) {
          newExpanded[item.title] = true;
        }
      });
      setExpandedItems(newExpanded);
    }
  }, [searchQuery, filteredNavItems]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-border bg-card transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none shadow-2xl",
          isCollapsed ? "lg:w-20 w-72" : "w-72",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className={cn("flex h-[60px] items-center justify-between shrink-0 border-b border-border transition-all duration-300", isCollapsed ? "px-3" : "px-6")}>
          <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight text-lg text-foreground group overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shrink-0">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <span className="whitespace-nowrap">
                TaazaBites <span className="text-muted-foreground font-normal">HQ</span>
              </span>
            )}
          </Link>
          
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4 text-emerald-400" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={cn("py-4 shrink-0 transition-all duration-300", isCollapsed ? "px-2" : "px-4")}>
          <div className="relative group flex items-center justify-center">
            <Search className={cn("h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors", isCollapsed ? "static" : "absolute left-3 top-1/2 -translate-y-1/2")} />
            {!isCollapsed && (
              <input
                type="text"
                placeholder="Search menus... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm"
              />
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <nav className="flex flex-col gap-[2px] pb-24">
            {filteredNavItems.length === 0 && !isCollapsed && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No menus found.
              </div>
            )}
            
            {filteredNavItems.map((item) => {
              const active = isGroupActive(item);
              const isExpanded = !!expandedItems[item.title];
              
              const activeSubHref = (active && item.subItems)
                ? item.subItems.find(sub => checkIsActive(sub.href))?.href || null
                : null;

              return (
                <SidebarItem 
                  key={item.title}
                  item={item}
                  active={active}
                  isExpanded={isExpanded}
                  activeSubHref={activeSubHref}
                  toggleExpand={toggleExpand}
                  setIsOpen={handleSetIsOpen}
                  isCollapsed={isCollapsed}
                />
              );
            })}
          </nav>
        </ScrollArea>
        
        <div className={cn("border-t border-border shrink-0 bg-card transition-all duration-300", isCollapsed ? "p-2" : "p-4")}>
          {/* THEME STATUS BLOCK */}
          {!isCollapsed && (
            <div className="mb-4 bg-zinc-950 border border-zinc-800/60 rounded-xl p-3 shadow-inner">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Theme</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
               </div>
               <div className="flex gap-1.5">
                  <div className="h-4 w-full rounded bg-emerald-500/20 border border-emerald-500/30" />
                  <div className="h-4 w-full rounded bg-zinc-800" />
                  <div className="h-4 w-full rounded bg-zinc-800" />
               </div>
               <p className="text-[9px] text-zinc-600 mt-2 font-mono leading-none">THEME: DARK_COSMIC_HQ</p>
            </div>
          )}
          <Link to="/settings" title={isCollapsed ? (user?.name || "Admin Master") : undefined} className={cn("flex w-full items-center gap-3 rounded-lg hover:bg-zinc-900 transition-colors text-left group", isCollapsed ? "justify-center p-2" : "px-2 py-2")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            {!isCollapsed && (
              <>
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                    {user?.name || "Admin Master"}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {user?.role || "Administrator"}
                  </p>
                </div>
                <Settings className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
              </>
            )}
          </Link>
        </div>
      </div>
    </>
  );
});
