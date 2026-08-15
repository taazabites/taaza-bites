import { Outlet, NavLink } from "react-router-dom";
import { Home, Package, User, LogOut, IndianRupee, Clock3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export default function Layout() {
  const { signOut } = useAuth();
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const navItems = [
    { to: "/", icon: <Home className="size-6" />, label: "Home" },
    { to: "/deliveries", icon: <Package className="size-6" />, label: "Queue" },
    { to: "/history", icon: <Clock3 className="size-6" />, label: "History" },
    { to: "/earnings", icon: <IndianRupee className="size-6" />, label: "Pay" },
    { to: "/profile", icon: <User className="size-6" />, label: "Me" },
  ];

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground md:flex-row">
      {offline && (
        <div className="bg-amber-500 text-white text-center text-xs font-bold py-1">
          Offline — actions retry when the network returns. Delivered waits for server confirm.
        </div>
      )}
      <header className="flex items-center justify-between border-b p-4 md:hidden">
        <h1 className="text-xl font-bold tracking-tight">Taaza Partner</h1>
        <Button variant="ghost" size="icon" onClick={signOut}>
          <LogOut className="size-5" />
        </Button>
      </header>
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-background p-2 md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 min-w-[56px] ${isActive ? "text-primary" : "text-muted-foreground"}`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="border-b p-6">
          <h1 className="text-2xl font-bold text-primary">Taaza Bites</h1>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 ${isActive ? "bg-accent text-primary" : "text-muted-foreground"}`
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
