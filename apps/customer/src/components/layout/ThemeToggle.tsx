import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { triggerHaptic } from "../../utils/haptics";
import { cn } from "../../lib/utils";

export default function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => {
        triggerHaptic("light");
        toggleTheme();
      }}
      className={cn(
        "relative flex h-8 w-14 items-center rounded-full p-1 transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
        isDark ? "justify-end" : "justify-start",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <div className="absolute inset-0 flex justify-between items-center px-1.5 text-zinc-400 pointer-events-none">
        <Sun className={cn("h-3.5 w-3.5 transition-opacity duration-200", isDark ? "opacity-40" : "opacity-100 text-amber-500")} />
        <Moon className={cn("h-3.5 w-3.5 transition-opacity duration-200", isDark ? "opacity-100 text-emerald-400" : "opacity-40")} />
      </div>
      <motion.div
        layout
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 shadow-sm z-10"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-emerald-500 fill-emerald-500/10" />
        ) : (
          <Sun className="h-3 w-3 text-emerald-600 fill-emerald-500/10" />
        )}
      </motion.div>
    </button>
  );
}
