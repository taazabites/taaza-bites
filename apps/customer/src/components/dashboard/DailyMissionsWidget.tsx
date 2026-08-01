import React, { useState, useEffect } from 'react';
import { Card, Button } from '../ui/primitives';
import { CheckCircle2, Circle, Flame, Droplets, Activity, Moon, Smile, Zap, Sparkles, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Mission {
  id: string;
  title: string;
  xp: number;
  category: 'hydration' | 'nutrition' | 'activity' | 'recovery';
  completed: boolean;
}

export default function DailyMissionsWidget() {
  const [selectedMood, setSelectedMood] = useState<string | null>(() => {
    return localStorage.getItem(`taaza_mood_${new Date().toISOString().split('T')[0]}`) || null;
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`taaza_missions_${today}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: '1', title: 'Hydrate 2.5L Clean Water', xp: 25, category: 'hydration', completed: false },
      { id: '2', title: 'Consume Chef High-Protein Meal', xp: 50, category: 'nutrition', completed: false },
      { id: '3', title: '15-Min Post-Lunch Walking Streak', xp: 35, category: 'activity', completed: false },
      { id: '4', title: 'Wind-down & Sleep before 11 PM', xp: 40, category: 'recovery', completed: false },
    ];
  });

  const [earnedXP, setEarnedXP] = useState<number>(() => {
    const saved = localStorage.getItem('taaza_user_health_xp');
    return saved ? parseInt(saved, 10) : 480;
  });

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`taaza_mood_${today}`, mood);
  };

  const toggleMission = (id: string) => {
    const updated = missions.map(m => {
      if (m.id === id) {
        const nextState = !m.completed;
        const xpDelta = nextState ? m.xp : -m.xp;
        const newTotalXP = Math.max(0, earnedXP + xpDelta);
        setEarnedXP(newTotalXP);
        localStorage.setItem('taaza_user_health_xp', newTotalXP.toString());
        return { ...m, completed: nextState };
      }
      return m;
    });

    setMissions(updated);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`taaza_missions_${today}`, JSON.stringify(updated));
  };

  const moods = [
    { label: 'Energetic', icon: '⚡', bg: 'hover:bg-amber-50 dark:hover:bg-amber-950/30' },
    { label: 'Focused', icon: '🧠', bg: 'hover:bg-blue-50 dark:hover:bg-blue-950/30' },
    { label: 'Calm', icon: '🌿', bg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30' },
    { label: 'Tired', icon: '🔋', bg: 'hover:bg-rose-50 dark:hover:bg-rose-950/30' },
  ];

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 p-6 rounded-[2rem] shadow-xl shadow-zinc-200/40 dark:shadow-none relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Daily Momentum</span>
          </div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Today's Health Mission</h3>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
          <Award className="w-4 h-4" />
          <span className="text-xs font-black">{earnedXP} XP</span>
        </div>
      </div>

      {/* Mood Check-In */}
      <div className="mb-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/5">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">
          How is your energy & mood right now?
        </p>
        <div className="grid grid-cols-4 gap-2">
          {moods.map(m => {
            const isSelected = selectedMood === m.label;
            return (
              <button
                key={m.label}
                onClick={() => handleMoodSelect(m.label)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 border
                  ${isSelected 
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm' 
                    : `bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-800 ${m.bg}`
                  }
                `}
              >
                <span className="text-base">{m.icon}</span>
                <span className="text-[10px] tracking-tight">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {missions.map(mission => (
          <div
            key={mission.id}
            onClick={() => toggleMission(mission.id)}
            className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border ${
              mission.completed 
                ? 'bg-emerald-50/60 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20 text-zinc-900 dark:text-white' 
                : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-100 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {mission.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 shrink-0" />
              )}
              <span className={`text-xs font-bold ${mission.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : ''}`}>
                {mission.title}
              </span>
            </div>

            <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded-lg ${
              mission.completed ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
            }`}>
              +{mission.xp} XP
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
