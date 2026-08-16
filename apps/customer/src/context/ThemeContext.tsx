import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_KEY = "theme";
const LEGACY_THEME_KEY = "dashboard_theme";

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_THEME_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    if (stored === "amoled") return "dark";

    const settingsRaw = localStorage.getItem("taaza_app_settings");
    if (settingsRaw) {
      const parsed = JSON.parse(settingsRaw);
      if (parsed.themeMode === "system") return "system";
      if (parsed.themeMode === "amoled" || parsed.themeMode === "dark" || parsed.darkMode) return "dark";
      if (parsed.themeMode === "light") return "light";
    }
  } catch {
    // Ignore unreadable storage and fall back to system.
  }
  return "system";
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") return systemPrefersDark() ? "dark" : "light";
  return preference;
}

function persistPreference(preference: ThemePreference) {
  localStorage.setItem(THEME_KEY, preference);
  localStorage.setItem(LEGACY_THEME_KEY, preference === "system" ? resolveTheme(preference) : preference);

  try {
    const raw = localStorage.getItem("taaza_app_settings");
    const parsed = raw ? JSON.parse(raw) : {};
    localStorage.setItem(
      "taaza_app_settings",
      JSON.stringify({
        ...parsed,
        themeMode: preference,
        darkMode: resolveTheme(preference) === "dark",
      })
    );
  } catch {
    // Settings blob is optional.
  }
}

export function applyResolvedTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme: resolved } }));
}

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  isDark: boolean;
  setTheme: (preference: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() => readStoredPreference());
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(readStoredPreference()));

  useEffect(() => {
    const next = resolveTheme(preference);
    applyResolvedTheme(next);
    persistPreference(preference);
    setResolved(next);
  }, [preference]);

  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = resolveTheme("system");
      applyResolvedTheme(next);
      setResolved(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference((prev) => (resolveTheme(prev) === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({
      preference,
      resolved,
      isDark: resolved === "dark",
      setTheme,
      toggleTheme,
    }),
    [preference, resolved, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
