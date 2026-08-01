import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/firebase/db";
import { format, subDays, isSameDay } from "date-fns";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function StreakTracker({ userId, isDark }: { userId: string, isDark?: boolean }) {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      setLoading(true);
      const endDate = new Date();
      const startDate = subDays(endDate, 30);
      const dateStrStart = format(startDate, 'yyyy-MM-dd');
      
      const q = query(
        collection(db, 'mealSchedules'),
        where('userId', '==', userId),
        where('date', '>=', dateStrStart)
      );
      
      const snap = await getDocs(q);
      const schedules = snap.docs.map(d => d.data());
      
      // Calculate streak
      let currentStreak = 0;
      let checkDate = new Date();
      
      while (true) {
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        const hasMeal = schedules.some(s => s.date === dateStr && s.deliveryStatus === 'delivered');
        
        if (hasMeal) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else {
          if (!isSameDay(checkDate, new Date())) {
            break;
          }
          checkDate = subDays(checkDate, 1);
        }
      }
      
      setStreak(currentStreak);
      setLoading(false);
    };

    if (userId) {
      fetchStreak();
    }
  }, [userId]);

  if (loading) return null;

  return (
    <div className={`p-6 rounded-[2rem] border relative overflow-hidden group transition-all ${
      isDark 
        ? "bg-orange-950/20 border-orange-500/20 text-orange-100 hover:border-orange-500/40" 
        : "bg-orange-50/50 border-orange-100/50 text-orange-900 hover:border-orange-200"
    }`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform" />
      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Current Streak</span>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Flame className="h-5 w-5 text-orange-500" />
          </motion.div>
        </div>
        <div>
          <p className="text-4xl font-black tracking-tight">{streak}</p>
          <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mt-1">Days in a row</p>
        </div>
      </div>
    </div>
  );
}
