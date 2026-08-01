import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Calendar, CheckCircle2, Flame, TrendingUp, Filter } from 'lucide-react';
import { Card } from '../ui/primitives';

interface DayData {
  day: string;
  fullDate: string;
  calories: number; // % of target
  protein: number;  // % of target
  fiber: number;    // % of target
  calGrams: number; // actual kcal
  proteinGrams: number; // actual g
  fiberGrams: number;   // actual g
  avgConsistency: number;
}

const mockWeeklyData: DayData[] = [
  { day: 'Mon', fullDate: 'Jul 20', calories: 95, protein: 90, fiber: 85, calGrams: 1995, proteinGrams: 126, fiberGrams: 30, avgConsistency: 90 },
  { day: 'Tue', fullDate: 'Jul 21', calories: 100, protein: 98, fiber: 92, calGrams: 2100, proteinGrams: 137, fiberGrams: 32, avgConsistency: 97 },
  { day: 'Wed', fullDate: 'Jul 22', calories: 88, protein: 85, fiber: 80, calGrams: 1850, proteinGrams: 119, fiberGrams: 28, avgConsistency: 84 },
  { day: 'Thu', fullDate: 'Jul 23', calories: 102, protein: 100, fiber: 95, calGrams: 2140, proteinGrams: 140, fiberGrams: 33, avgConsistency: 99 },
  { day: 'Fri', fullDate: 'Jul 24', calories: 92, protein: 94, fiber: 88, calGrams: 1930, proteinGrams: 131, fiberGrams: 31, avgConsistency: 91 },
  { day: 'Sat', fullDate: 'Jul 25', calories: 98, protein: 96, fiber: 90, calGrams: 2050, proteinGrams: 134, fiberGrams: 31, avgConsistency: 95 },
  { day: 'Sun', fullDate: 'Today', calories: 69, protein: 70, fiber: 80, calGrams: 1450, proteinGrams: 98, fiberGrams: 28, avgConsistency: 73 },
];

export function WeeklyMacroBarChart() {
  const [selectedMacro, setSelectedMacro] = useState<'all' | 'protein' | 'calories' | 'fiber'>('all');
  const [activeHover, setActiveHover] = useState<DayData | null>(null);

  const averageConsistency = Math.round(
    mockWeeklyData.reduce((acc, curr) => acc + curr.avgConsistency, 0) / mockWeeklyData.length
  );

  return (
    <Card className="p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white">
                Weekly Macro Consistency
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {averageConsistency}% Target Met
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-semibold mt-0.5">Last 7 days target achievement summary</p>
          </div>
        </div>

        {/* Macro Filter Selector */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
          {[
            { id: 'all', label: 'All Macros' },
            { id: 'protein', label: 'Protein' },
            { id: 'calories', label: 'Calories' },
            { id: 'fiber', label: 'Fiber' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedMacro(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedMacro === tab.id
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mockWeeklyData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onMouseMove={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                setActiveHover(state.activePayload[0].payload as DayData);
              }
            }}
            onMouseLeave={() => setActiveHover(null)}
          >
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 700 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 600 }}
              unit="%"
              domain={[0, 110]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data: DayData = payload[0].payload;
                  return (
                    <div className="bg-zinc-900 text-white p-3 rounded-2xl shadow-xl border border-zinc-800 text-xs space-y-1.5 font-sans min-w-[150px]">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-1 font-bold text-zinc-300">
                        <span>{data.day} ({data.fullDate})</span>
                        <span className="text-emerald-400 font-black">{data.avgConsistency}% Met</span>
                      </div>
                      <div className="space-y-1 pt-1 font-medium text-[11px]">
                        {(selectedMacro === 'all' || selectedMacro === 'calories') && (
                          <div className="flex justify-between text-orange-400">
                            <span>Calories:</span>
                            <span className="font-bold">{data.calGrams} kcal ({data.calories}%)</span>
                          </div>
                        )}
                        {(selectedMacro === 'all' || selectedMacro === 'protein') && (
                          <div className="flex justify-between text-emerald-400">
                            <span>Protein:</span>
                            <span className="font-bold">{data.proteinGrams} g ({data.protein}%)</span>
                          </div>
                        )}
                        {(selectedMacro === 'all' || selectedMacro === 'fiber') && (
                          <div className="flex justify-between text-teal-400">
                            <span>Fiber:</span>
                            <span className="font-bold">{data.fiberGrams} g ({data.fiber}%)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {(selectedMacro === 'all' || selectedMacro === 'calories') && (
              <Bar dataKey="calories" name="Calories %" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={18} />
            )}
            {(selectedMacro === 'all' || selectedMacro === 'protein') && (
              <Bar dataKey="protein" name="Protein %" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={18} />
            )}
            {(selectedMacro === 'all' || selectedMacro === 'fiber') && (
              <Bar dataKey="fiber" name="Fiber %" fill="#14b8a6" radius={[6, 6, 0, 0]} maxBarSize={18} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Key Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            <span>Calories Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Protein Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
            <span>Fiber Target</span>
          </div>
        </div>

        <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>6/7 Days Hit 90%+ Goals</span>
        </div>
      </div>
    </Card>
  );
}
