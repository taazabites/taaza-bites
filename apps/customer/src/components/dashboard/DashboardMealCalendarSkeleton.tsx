import React from "react";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { cn } from "@/src/lib/utils";

interface DashboardMealCalendarSkeletonProps {
  className?: string;
  showDailyDetails?: boolean;
}

export function DashboardMealCalendarSkeleton({
  className,
  showDailyDetails = true,
}: DashboardMealCalendarSkeletonProps) {
  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className={cn("w-full space-y-6 max-w-7xl mx-auto p-4 sm:p-6", className)}>
      {/* 1. Header Banner Skeleton */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-zinc-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 rounded-full bg-emerald-500/20" />
              <Skeleton className="h-5 w-32 rounded-full bg-zinc-700/50" />
            </div>
            <Skeleton className="h-9 w-3/4 sm:w-80 rounded-2xl bg-zinc-700/60" />
            <Skeleton className="h-4 w-full sm:w-96 rounded-xl bg-zinc-700/40" />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex bg-white/5 border border-white/10 p-3.5 px-5 rounded-2xl items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-xl bg-emerald-500/20" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28 bg-zinc-700/60" />
                <Skeleton className="h-6 w-20 bg-zinc-600/80" />
              </div>
            </div>
            <Skeleton className="h-12 w-36 rounded-2xl bg-emerald-600/30" />
          </div>
        </div>
      </div>

      {/* 2. Calendar View Switcher / Filter Tabs Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          "Meal Calendar",
          "Single Day View",
          "Upcoming Shipments",
          "Delivered History",
          "Skipped Days",
          "Paused Schedule",
        ].map((tab, idx) => (
          <Skeleton
            key={idx}
            className={cn(
              "h-11 rounded-2xl shrink-0 border border-zinc-200 dark:border-zinc-800",
              idx === 0
                ? "w-36 bg-zinc-900 dark:bg-white"
                : "w-32 bg-white dark:bg-zinc-900 opacity-60"
            )}
          />
        ))}
      </div>

      {/* 3. Main Calendar Container Skeleton */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-[2.5rem] p-5 sm:p-7 shadow-xl space-y-6">
        {/* Calendar Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-40 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-1">
              <Skeleton className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            </div>
          </div>

          {/* Status Legend Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
              <Skeleton className="h-3 w-14 bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
              <Skeleton className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
              <Skeleton className="h-3 w-14 bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-2.5 h-2.5 rounded-full bg-zinc-400/40" />
              <Skeleton className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>

        {/* 7 Days of Week Labels */}
        <div className="grid grid-cols-7 gap-2 text-center pb-1">
          {daysOfWeek.map((day, i) => (
            <div key={i} className="flex justify-center">
              <Skeleton className="h-4 w-8 sm:w-12 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            </div>
          ))}
        </div>

        {/* 5 Rows x 7 Columns Meal Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {Array.from({ length: 35 }).map((_, cellIdx) => {
            const isSelectedDay = cellIdx === 14; // Simulate today or selected day
            const isWeekendCell = cellIdx % 7 === 5 || cellIdx % 7 === 6;

            return (
              <div
                key={cellIdx}
                className={cn(
                  "min-h-[70px] sm:min-h-[90px] p-2 sm:p-2.5 rounded-2xl border transition-all flex flex-col justify-between",
                  isSelectedDay
                    ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-2 ring-emerald-500/30"
                    : isWeekendCell
                    ? "border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/40"
                    : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                )}
              >
                {/* Cell Top Header */}
                <div className="flex items-center justify-between">
                  <Skeleton
                    className={cn(
                      "h-5 w-5 sm:h-6 sm:w-6 rounded-full",
                      isSelectedDay
                        ? "bg-emerald-600 text-white font-bold"
                        : "bg-zinc-200 dark:bg-zinc-800"
                    )}
                  />
                  <Skeleton className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                </div>

                {/* Cell Body - Meal Pill / Status Indicator */}
                <div className="mt-2 space-y-1">
                  <Skeleton
                    className={cn(
                      "h-3.5 sm:h-4 w-full rounded-lg",
                      cellIdx % 5 === 0
                        ? "bg-emerald-200/80 dark:bg-emerald-900/60"
                        : cellIdx % 5 === 1
                        ? "bg-amber-200/80 dark:bg-amber-900/60"
                        : cellIdx % 5 === 2
                        ? "bg-rose-200/80 dark:bg-rose-900/60"
                        : "bg-zinc-200/60 dark:bg-zinc-800/60"
                    )}
                  />
                  <Skeleton className="hidden sm:block h-2.5 w-2/3 rounded-md bg-zinc-200/50 dark:bg-zinc-800/40" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Selected Day Meal Details Cards Skeleton (Breakfast, Lunch, Dinner) */}
      {showDailyDetails && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-[2.5rem] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28 bg-emerald-500/20 rounded-md" />
              <Skeleton className="h-7 w-52 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-9 w-28 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            </div>
          </div>

          {/* Meal Slots List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {["Breakfast", "Lunch", "Dinner"].map((slotName, slotIdx) => (
              <div
                key={slotIdx}
                className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-3xl space-y-4"
              >
                {/* Slot Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-xl bg-emerald-500/20" />
                    <Skeleton className="h-5 w-24 bg-zinc-300 dark:bg-zinc-700 rounded-md" />
                  </div>
                  <Skeleton className="h-5 w-16 bg-emerald-100 dark:bg-emerald-950 rounded-full" />
                </div>

                {/* Meal Image & Description */}
                <div className="flex gap-3">
                  <Skeleton className="w-16 h-16 rounded-2xl shrink-0 bg-zinc-200 dark:bg-zinc-800" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full bg-zinc-300 dark:bg-zinc-700 rounded-md" />
                    <Skeleton className="h-3 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <Skeleton className="h-3 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                  </div>
                </div>

                {/* Macros Pills */}
                <div className="flex items-center gap-2 pt-1">
                  <Skeleton className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                  <Skeleton className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                  <Skeleton className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                </div>

                {/* Delivery Time & Custom Action Button */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50 dark:border-zinc-800/80">
                  <Skeleton className="h-4 w-28 bg-zinc-300 dark:bg-zinc-700 rounded-md" />
                  <Skeleton className="h-8 w-20 bg-emerald-600/20 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardMealCalendarSkeleton;
