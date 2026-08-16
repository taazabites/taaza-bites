import { useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, HeartPulse, HelpCircle, MessageCircle, Phone } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import SupportHub from "../components/support/SupportHub";
import { cn } from "../lib/utils";
import { PageHeader } from "../components/dashboard/PageHeader";
import { PageTransition } from "../components/dashboard/PageTransition";

const AINutritionHub = lazy(() => import("../components/nutrition/AINutritionHub"));

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<"support" | "nutrition">("support");

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-6">
          <PageHeader
            title="Help & Support"
            description="Raise a ticket, call kitchen/dispatch, or chat on WhatsApp. Nutrition AI is optional and only loads when you open that tab."
            badge="Customer Support"
            icon={HelpCircle}
            gradient="from-indigo-950 via-zinc-900 to-indigo-900"
          >
            <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-[2rem] border border-white/10 self-start lg:self-center">
              <button
                type="button"
                onClick={() => setActiveTab("support")}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all",
                  activeTab === "support" ? "bg-white text-zinc-950 shadow-xl" : "text-zinc-400 hover:text-white"
                )}
              >
                <LifeBuoy className="h-4 w-4" />
                Contact Support
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("nutrition")}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all",
                  activeTab === "nutrition" ? "bg-white text-zinc-950 shadow-xl" : "text-zinc-400 hover:text-white"
                )}
              >
                <HeartPulse className="h-4 w-4" />
                AI Nutrition Guide
              </button>
            </div>
          </PageHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://wa.me/917975771457"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4"
            >
              <MessageCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-bold">WhatsApp kitchen / support</p>
                <p className="text-xs text-zinc-500">+91 79757 71457</p>
              </div>
            </a>
            <a
              href="tel:+917975771457"
              className="flex items-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
            >
              <Phone className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
              <div>
                <p className="text-sm font-bold">Call ops</p>
                <p className="text-xs text-zinc-500">Same number as WhatsApp</p>
              </div>
            </a>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "support" ? (
              <motion.div
                key="support-hub"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SupportHub />
              </motion.div>
            ) : (
              <motion.div
                key="nutrition-hub"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense
                  fallback={
                    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-10 text-center text-sm text-zinc-500">
                      Loading nutrition guide…
                    </div>
                  }
                >
                  <AINutritionHub />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
