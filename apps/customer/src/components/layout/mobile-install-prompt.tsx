import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share, PlusSquare, CheckCircle2, Smartphone } from "lucide-react";
import { Button } from "@/src/components/ui/primitives";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function MobileInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Check if app is already running in standalone (PWA) mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) return;

    // 2. Check if user dismissed previously
    const hasBeenDismissed = localStorage.getItem("taazabites_pwa_dismissed");
    if (hasBeenDismissed) return;

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // 4. Handle Android/Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Reveal prompt on mobile/tablet or window width <= 768px
      if (window.innerWidth <= 768 || isIOSDevice) {
        setTimeout(() => setIsVisible(true), 2500);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Fallback timer for iOS or mobile web views where beforeinstallprompt doesn't fire natively
    const isMobileViewport = window.innerWidth <= 768 || /android|iphone|ipad|ipod/i.test(userAgent);
    let fallbackTimer: NodeJS.Timeout | null = null;

    if (isMobileViewport) {
      fallbackTimer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
        localStorage.setItem("taazabites_pwa_dismissed", "true");
      }
      setDeferredPrompt(null);
    } else {
      // Direct user or simulate success
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSInstructions(false);
    localStorage.setItem("taazabites_pwa_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5rem)] left-3 right-3 sm:left-4 sm:right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-[100] bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-2xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden no-select"
        >
          {/* Subtle green gradient top accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          <button
            onClick={handleDismiss}
            aria-label="Close install prompt"
            className="absolute top-3 right-3 p-1.5 rounded-full text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {!showIOSInstructions ? (
            <div className="flex items-start gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-shrink-0 items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Smartphone className="h-6 w-6 animate-pulse" />
              </div>

              <div className="flex-1 pr-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
                    Install TaazaBites
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                    Fast & Offline
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-3 leading-relaxed">
                  Add to your home screen for instant 1-tap ordering, meal tracking, and live order alerts.
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleInstallClick}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-1.5 rounded-xl py-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Install App
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDismiss}
                    className="px-3 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs active:scale-95 rounded-xl"
                  >
                    Not Now
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>How to Install on Mobile:</span>
              </div>
              <ol className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2 pl-1">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span>Tap the <Share className="w-3.5 h-3.5 inline mx-0.5 text-emerald-600" /> <strong>Share</strong> button in browser controls.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span>Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-600" /> <strong>Add to Home Screen</strong>.</span>
                </li>
              </ol>
              <Button
                size="sm"
                onClick={handleDismiss}
                className="w-full mt-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs rounded-xl"
              >
                Got It
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

