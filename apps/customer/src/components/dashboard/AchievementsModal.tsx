import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/primitives";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const navigate = useNavigate();
  
  const achievementList = [
    { name: "Early Bird 7D", desc: "7 consecutive morning deliveries", icon: "⚡", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { name: "Protein Master", desc: "Met protein goals 14 days in a row", icon: "🥩", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { name: "Hydration Hero", desc: "3L water logged daily for 10 days", icon: "💧", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { name: "Zero Sugar Champ", desc: "100% clean low-glycemic week", icon: "🌿", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { name: "Community Star", desc: "Shared 5 meal experience reviews", icon: "⭐", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
    { name: "Metabolic Legend", desc: "Achieved 90+ Health Score", icon: "👑", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 max-w-md w-full text-zinc-900 dark:text-white shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">Achievement Hall</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">15 Badges Unlocked</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 max-h-[300px] overflow-y-auto no-scrollbar">
              {achievementList.map((b, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${b.color} flex flex-col items-start gap-2`}>
                  <span className="text-2xl">{b.icon}</span>
                  <p className="text-xs font-black text-zinc-900 dark:text-white">{b.name}</p>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">{b.desc}</p>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => { onClose(); navigate('/dashboard/rewards'); }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl h-12 text-xs uppercase tracking-widest cursor-pointer"
            >
              Go to Rewards Center
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
