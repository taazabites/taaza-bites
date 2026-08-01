import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LifeBuoy, HeartPulse, HelpCircle, MessageSquare } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AINutritionHub from "../components/nutrition/AINutritionHub";
import SupportHub from "../components/support/SupportHub";
import { cn } from "../../src/lib/utils";
import { PageHeader } from "../components/dashboard/PageHeader";
import { PageTransition } from "../components/dashboard/PageTransition";
import { Button } from "../components/ui/primitives";

export default function SupportPage() {
  // Main Tab controller: "nutrition" or "support"
  const [activeTab, setActiveTab] = useState<"nutrition" | "support">("nutrition");

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          
          <PageHeader 
            title="Help & Support"
            description="Access clinical nutritionist consultations, common FAQs, and 24/7 technical assistance for your healthy lifestyle journey."
            badge="Customer Support"
            icon={HelpCircle}
            gradient="from-indigo-950 via-zinc-900 to-indigo-900"
          >
            <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-[2rem] border border-white/10 self-start lg:self-center">
              <button
                onClick={() => setActiveTab("nutrition")}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all",
                  activeTab === "nutrition" 
                    ? "bg-white text-zinc-950 shadow-xl" 
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <HeartPulse className="h-4 w-4" />
                AI Nutrition Guide
              </button>
              <button
                onClick={() => setActiveTab("support")}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all",
                  activeTab === "support" 
                    ? "bg-white text-zinc-950 shadow-xl" 
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <LifeBuoy className="h-4 w-4" />
                Contact Support
              </button>
            </div>
          </PageHeader>

          {/* Tab View Transition */}
          <AnimatePresence mode="wait">
            {activeTab === "nutrition" ? (
              <motion.div
                key="nutrition-hub"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AINutritionHub />
              </motion.div>
            ) : (
              <motion.div
                key="support-hub"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SupportHub />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </PageTransition>
    </DashboardLayout>
  );
}

