import { Outlet, NavLink } from "react-router-dom";
import { Home, Package, User, LogOut, HelpCircle, IndianRupee } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";

export default function Layout() {
  const { signOut } = useAuth();

  const navItems = [
    { to: "/", icon: <Home className="size-6" />, label: "Home" },
    { to: "/deliveries", icon: <Package className="size-6" />, label: "Deliveries" },
    { to: "/earnings", icon: <IndianRupee className="size-6" />, label: "Earnings" },
    { to: "/profile", icon: <User className="size-6" />, label: "Profile" },
    { to: "/help", icon: <HelpCircle className="size-6" />, label: "Help" },
  ];

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground md:flex-row">
      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b p-4 md:hidden">
        <h1 className="text-xl font-bold tracking-tight">Taaza Bites Partner</h1>
        <Button variant="ghost" size="icon" onClick={signOut}>
          <LogOut className="size-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-background p-3 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex items-center justify-center border-b p-6">
          <h1 className="text-2xl font-bold text-primary tracking-tight">Taaza Bites</h1>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={signOut}>
            <LogOut className="size-5" />
            Sign Out
          </Button>
        </div>
      </aside>
    </div>
  );
}
