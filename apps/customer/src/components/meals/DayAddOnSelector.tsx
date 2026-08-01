import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  Flame, 
  Zap, 
  Leaf, 
  Coffee, 
  CupSoda, 
  Info, 
  Calendar, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Card, Badge, Button } from '@/src/components/ui/primitives';
import { cn } from '@/src/lib/utils';
import { ADD_ON_CATALOG, AddOnItemDef } from '@/src/firebase/services';
import { triggerHaptic } from '@/src/utils/haptics';

export interface DayAddOnSelection {
  dayId: string; // e.g. "Mon", "Tue" or "2026-07-29"
  dayLabel: string; // e.g. "Monday"
  slot: "Breakfast" | "Lunch" | "Snacks" | "Dinner";
  addOnId: string;
  quantity: number;
}

interface DayAddOnSelectorProps {
  days?: { id: string; label: string; dateStr?: string }[];
  selectedAddOns?: Record<string, Record<string, number>>; // dayId -> { addOnId: qty }
  onChange?: (updated: Record<string, Record<string, number>>) => void;
  onConfirmSchedule?: (selections: DayAddOnSelection[]) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
}

const DEFAULT_DAYS = [
  { id: "Mon", label: "Monday" },
  { id: "Tue", label: "Tuesday" },
  { id: "Wed", label: "Wednesday" },
  { id: "Thu", label: "Thursday" },
  { id: "Fri", label: "Friday" },
  { id: "Sat", label: "Saturday" },
  { id: "Sun", label: "Sunday" },
];

export default function DayAddOnSelector({
  days = DEFAULT_DAYS,
  selectedAddOns: externalSelectedAddOns,
  onChange,
  onConfirmSchedule,
  title = "Customize Daily Meal Add-ons",
  subtitle = "Toggle fresh cold-pressed juices, protein smoothies, or superfood oats for specific days of your meal plan.",
  compact = false,
  className
}: DayAddOnSelectorProps) {
  const [activeDayId, setActiveDayId] = useState<string>(days[0]?.id || "Mon");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedSlot, setSelectedSlot] = useState<"Breakfast" | "Lunch" | "Snacks" | "Dinner">("Dinner");

  // Internal state if not controlled
  const [internalSelections, setInternalSelections] = useState<Record<string, Record<string, number>>>({});

  const selections = externalSelectedAddOns !== undefined ? externalSelectedAddOns : internalSelections;

  const updateSelections = (dayId: string, addOnId: string, delta: number) => {
    triggerHaptic('light');
    const dayData = { ...(selections[dayId] || {}) };
    const currentQty = dayData[addOnId] || 0;
    const newQty = Math.max(0, currentQty + delta);

    if (newQty === 0) {
      delete dayData[addOnId];
    } else {
      dayData[addOnId] = newQty;
    }

    const updated = {
      ...selections,
      [dayId]: dayData
    };

    if (externalSelectedAddOns === undefined) {
      setInternalSelections(updated);
    }
    if (onChange) {
      onChange(updated);
    }
  };

  const handleBulkApplyAllDays = (addOnId: string) => {
    triggerHaptic('medium');
    const updated = { ...selections };
    days.forEach(d => {
      const dayData = { ...(updated[d.id] || {}) };
      dayData[addOnId] = (dayData[addOnId] || 0) + 1;
      updated[d.id] = dayData;
    });

    if (externalSelectedAddOns === undefined) {
      setInternalSelections(updated);
    }
    if (onChange) {
      onChange(updated);
    }
  };

  const handleClearDay = (dayId: string) => {
    triggerHaptic('light');
    const updated = { ...selections };
    delete updated[dayId];
    if (externalSelectedAddOns === undefined) {
      setInternalSelections(updated);
    }
    if (onChange) {
      onChange(updated);
    }
  };

  const categories = ["All", "Cold-Pressed Juices", "Protein Smoothies & Shakes", "Oats & Superfood Bowls", "Herbal Teas & Tonics"];

  const filteredCatalog = useMemo(() => {
    if (activeCategory === "All") return ADD_ON_CATALOG;
    return ADD_ON_CATALOG.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  // Calculate totals across all selected days
  const summary = useMemo(() => {
    let totalItems = 0;
    let totalPrice = 0;
    let totalCalories = 0;
    let totalProtein = 0;

    Object.entries(selections).forEach(([_, dayAddOns]) => {
      Object.entries(dayAddOns).forEach(([addOnId, qty]) => {
        const item = ADD_ON_CATALOG.find(i => i.id === addOnId);
        if (item && qty > 0) {
          totalItems += qty;
          totalPrice += item.price * qty;
          totalCalories += item.calories * qty;
          totalProtein += item.protein * qty;
        }
      });
    });

    return { totalItems, totalPrice, totalCalories, totalProtein };
  }, [selections]);

  const activeDayLabel = days.find(d => d.id === activeDayId)?.label || activeDayId;
  const currentDaySelections = selections[activeDayId] || {};
  const currentDayItemCount = Object.values(currentDaySelections).reduce((a, b) => a + b, 0);

  return (
    <Card className={cn(
      "p-4 sm:p-6 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 text-white shadow-2xl relative overflow-hidden",
      className
    )}>
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[9px] uppercase tracking-widest border border-emerald-500/30">
                Weekly Add-On Planner
              </span>
              <span className="text-[10px] text-zinc-400 font-mono font-bold">
                {summary.totalItems} items selected
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight text-white mt-0.5">{title}</h3>
            {!compact && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {summary.totalItems > 0 && (
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-2xl self-start md:self-auto">
            <div className="text-right">
              <span className="block text-[10px] uppercase font-black tracking-widest text-emerald-400">Add-on Total</span>
              <span className="text-lg font-black text-white">₹{summary.totalPrice}</span>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="text-left text-[10px] text-zinc-400 font-bold space-y-0.5">
              <span className="block text-amber-300">+{summary.totalCalories} Total Cal</span>
              <span className="block text-emerald-300">+{summary.totalProtein}g Total Protein</span>
            </div>
          </div>
        )}
      </div>

      {/* Days Tabs Strip */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Select Day to Customize
          </label>
          {currentDayItemCount > 0 && (
            <button
              onClick={() => handleClearDay(activeDayId)}
              className="text-[10px] text-rose-400 hover:underline font-bold"
            >
              Clear {activeDayLabel} Add-ons
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {days.map(d => {
            const dayCount = Object.values(selections[d.id] || {}).reduce((a, b) => a + b, 0);
            const isActive = activeDayId === d.id;

            return (
              <button
                key={d.id}
                onClick={() => { triggerHaptic('light'); setActiveDayId(d.id); }}
                className={cn(
                  "px-4 py-3 rounded-2xl border text-xs font-black transition-all flex items-center gap-2 shrink-0 relative",
                  isActive
                    ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]"
                    : "bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <span>{d.label}</span>
                {dayCount > 0 && (
                  <span className={cn(
                    "w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center shrink-0",
                    isActive ? "bg-white text-emerald-700" : "bg-emerald-500 text-white"
                  )}>
                    {dayCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Meal Slot selector */}
      <div className="mt-4 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-zinc-300">
          Target slot for <strong className="text-emerald-400">{activeDayLabel}</strong>:
        </span>
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          {(["Breakfast", "Lunch", "Snacks", "Dinner"] as const).map(slot => (
            <button
              key={slot}
              onClick={() => { triggerHaptic('light'); setSelectedSlot(slot); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                selectedSlot === slot 
                  ? "bg-emerald-500 text-white shadow-sm" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { triggerHaptic('light'); setActiveCategory(cat); }}
            className={cn(
              "px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all border whitespace-nowrap",
              activeCategory === cat
                ? "bg-zinc-800 border-emerald-500/50 text-emerald-300"
                : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
        {filteredCatalog.map(item => {
          const dayQty = currentDaySelections[item.id] || 0;

          return (
            <div
              key={item.id}
              className={cn(
                "p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative group",
                dayQty > 0
                  ? "bg-emerald-950/20 border-emerald-500/40 shadow-md shadow-emerald-500/5"
                  : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-800 relative bg-zinc-950">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider truncate">{item.category}</span>
                    <button
                      onClick={() => handleBulkApplyAllDays(item.id)}
                      title="Add 1 to all 7 days of the week"
                      className="text-[9px] font-bold text-zinc-500 hover:text-emerald-400 hover:underline shrink-0"
                    >
                      + All 7 Days
                    </button>
                  </div>
                  <h4 className="text-xs font-black text-white leading-tight line-clamp-1">{item.name}</h4>
                  <p className="text-[10px] text-zinc-400 line-clamp-1">{item.description}</p>
                  
                  <div className="flex items-center gap-1.5 pt-1 text-[9px] font-bold">
                    <span className="text-amber-300 font-mono">{item.calories} cal</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-emerald-300 font-mono">{item.protein}g protein</span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-sm font-black text-white">₹{item.price}</span>

                {dayQty === 0 ? (
                  <button
                    onClick={() => updateSelections(activeDayId, item.id, 1)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs h-8 px-3 rounded-xl flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to {activeDayLabel}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-1">
                    <button
                      onClick={() => updateSelections(activeDayId, item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-emerald-500 text-white font-black flex items-center justify-center hover:bg-emerald-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-black text-xs text-white px-1">{dayQty}</span>
                    <button
                      onClick={() => updateSelections(activeDayId, item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-emerald-500 text-white font-black flex items-center justify-center hover:bg-emerald-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm / Save Button */}
      {onConfirmSchedule && summary.totalItems > 0 && (
        <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between gap-4">
          <div className="text-xs text-zinc-400 font-medium">
            Selected <strong className="text-white font-bold">{summary.totalItems} add-ons</strong> for your meal plan schedule.
          </div>

          <Button
            onClick={() => {
              triggerHaptic('medium');
              const selectionsList: DayAddOnSelection[] = [];
              Object.entries(selections).forEach(([dayId, dayData]) => {
                const dayObj = days.find(d => d.id === dayId);
                Object.entries(dayData).forEach(([addOnId, qty]) => {
                  if (qty > 0) {
                    selectionsList.push({
                      dayId,
                      dayLabel: dayObj?.label || dayId,
                      slot: selectedSlot,
                      addOnId,
                      quantity: qty
                    });
                  }
                });
              });
              onConfirmSchedule(selectionsList);
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs uppercase tracking-widest h-11 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Save Weekly Add-ons (₹{summary.totalPrice})
          </Button>
        </div>
      )}
    </Card>
  );
}
