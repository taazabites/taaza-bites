import { Menu, Bell, Search, User as UserIcon, LogOut, Plus, Moon, Sun, Store, ChevronDown, Users, ClipboardList, CreditCard, ChefHat, Tag, Package, Truck, UtensilsCrossed, Clock } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../../contexts/auth-context"
import { getAdminEmail } from "../../utils/admin"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion } from "motion/react"
import { useNavigate } from "react-router-dom"

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void
}

export function Header({ setSidebarOpen }: HeaderProps) {
  const { user, logout, triggerSessionWarning } = useAuth()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) {
      return stored === 'dark';
    }
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Branch Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="hidden md:flex items-center gap-2 outline-none px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium border border-transparent hover:border-border cursor-pointer relative z-50">
            <Store className="h-4 w-4 text-muted-foreground" />
            <span>HQ Branch</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-card border-border shadow-xl z-50">
            <DropdownMenuItem onClick={() => navigate("/branches")} className="text-foreground focus:bg-muted cursor-pointer">
              <Store className="mr-2 h-4 w-4 text-primary" />
              <span>HQ Branch</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/branches")} className="text-muted-foreground focus:bg-muted cursor-pointer">
              <Store className="mr-2 h-4 w-4" />
              <span>Downtown</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/branches")} className="text-muted-foreground focus:bg-muted cursor-pointer">
              <Store className="mr-2 h-4 w-4" />
              <span>Westside</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => navigate("/branches")} className="text-primary focus:bg-primary/10 focus:text-primary cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Branch</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 md:gap-4 relative z-50">
        {/* Global Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 h-9 w-64 bg-background" />
        </div>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger className="hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-md shadow-primary/20 cursor-pointer outline-none relative z-50">
            <Plus className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl z-50">
            <DropdownMenuLabel className="font-normal text-muted-foreground text-xs uppercase tracking-wider">Quick Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate("/customers")} className="cursor-pointer focus:bg-muted">
              <Users className="mr-2 h-4 w-4 text-blue-500" /> <span>Add Customer</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/orders")} className="cursor-pointer focus:bg-muted">
              <ClipboardList className="mr-2 h-4 w-4 text-emerald-500" /> <span>Create Order</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/plans")} className="cursor-pointer focus:bg-muted">
              <CreditCard className="mr-2 h-4 w-4 text-indigo-500" /> <span>Add Sub Plan</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/meals")} className="cursor-pointer focus:bg-muted">
              <ChefHat className="mr-2 h-4 w-4 text-amber-500" /> <span>Add Meal</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => navigate("/coupons")} className="cursor-pointer focus:bg-muted">
              <Tag className="mr-2 h-4 w-4 text-purple-500" /> <span>Add Coupon</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/inventory/orders")} className="cursor-pointer focus:bg-muted">
              <Package className="mr-2 h-4 w-4 text-rose-500" /> <span>Create PO</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Switcher Toggle Switch */}
        <div className="flex items-center gap-2 relative z-50">
          <button
            onClick={toggleTheme}
            className={`relative flex h-8 w-14 items-center rounded-full p-1 transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 bg-muted border border-border ${
              isDark ? "justify-end" : "justify-start"
            }`}
            aria-label="Toggle theme"
          >
            {/* Background Icons */}
            <div className="absolute inset-0 flex justify-between items-center px-1.5 text-muted-foreground pointer-events-none">
              <Sun className={`h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? 'opacity-40' : 'opacity-100 text-amber-500'}`} />
              <Moon className={`h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? 'opacity-100 text-blue-400' : 'opacity-40'}`} />
            </div>

            {/* Sliding Thumb */}
            <motion.div
              layout
              className="flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-sm z-10"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {isDark ? (
                <Moon className="h-3 w-3 text-primary fill-primary/10" />
              ) : (
                <Sun className="h-3 w-3 text-primary fill-primary/10" />
              )}
            </motion.div>
          </button>
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group z-50 cursor-pointer" onClick={() => navigate("/notifications")}>
          <Bell className="h-4 w-4 group-hover:animate-pulse" />
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
        </button>

        <div className="h-6 w-px bg-border mx-1"></div>

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer relative z-50">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {user?.name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl rounded-xl z-50">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-foreground leading-none">{user?.name || "Admin Master"}</p>
                <p className="text-xs text-muted-foreground leading-none mt-1">{getAdminEmail(user)}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => navigate("/settings")} className="text-foreground focus:bg-muted cursor-pointer py-2">
              <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            {user && (
              <DropdownMenuItem 
                onClick={() => triggerSessionWarning?.()} 
                className="text-amber-500 hover:text-amber-400 focus:bg-amber-500/10 focus:text-amber-400 cursor-pointer py-2"
              >
                <Clock className="mr-2 h-4 w-4 text-amber-500" />
                <span>Test Session Warning</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem 
              onClick={() => logout()}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
