import React from 'react';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { cn } from '@/src/lib/utils';

/**
 * REUSABLE SKELETON COMPONENT LIBRARY
 * Designed for TaazaBites page loading states (Meals, Plans, Profile, Menu).
 */

/* 1. Text Block Skeletons */
export interface TextBlockSkeletonProps {
  lines?: number;
  hasTitle?: boolean;
  className?: string;
}

export function TextBlockSkeleton({ lines = 3, hasTitle = true, className }: TextBlockSkeletonProps) {
  return (
    <div className={cn("space-y-3 w-full", className)}>
      {hasTitle && <Skeleton className="h-7 w-2/5 rounded-xl mb-4" />}
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={cn(
            "h-4 rounded-lg",
            idx === lines - 1 ? "w-4/5" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

/* 2. Meal Card Skeleton */
export interface MealCardSkeletonProps {
  className?: string;
  variant?: 'compact' | 'detailed';
}

export function MealCardSkeleton({ className, variant = 'detailed' }: MealCardSkeletonProps) {
  return (
    <div className={cn("bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-white/5 p-4 space-y-5 shadow-xs overflow-hidden", className)}>
      {/* Image Placeholder */}
      <div className="relative">
        <Skeleton className="h-52 w-full rounded-[2rem]" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <Skeleton className="h-7 w-24 rounded-xl" />
          <Skeleton className="h-7 w-20 rounded-xl" />
        </div>
      </div>

      {/* Content */}
      <div className="px-3 space-y-3.5">
        <div className="flex justify-between items-start gap-4">
          <Skeleton className="h-6 w-3/5 rounded-xl" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Macros Pills */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>

        {variant === 'detailed' && (
          <div className="space-y-2 pt-1">
            <Skeleton className="h-3.5 w-full rounded-lg" />
            <Skeleton className="h-3.5 w-4/5 rounded-lg" />
          </div>
        )}

        {/* Action Button */}
        <Skeleton className="h-12 w-full rounded-2xl mt-2" />
      </div>
    </div>
  );
}

/* 3. Profile Section Skeleton */
export interface ProfileSectionSkeletonProps {
  className?: string;
}

export function ProfileSectionSkeleton({ className }: ProfileSectionSkeletonProps) {
  return (
    <div className={cn("space-y-6 w-full", className)}>
      {/* User Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-white/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xs">
        <Skeleton className="w-24 h-24 rounded-3xl shrink-0" />
        <div className="space-y-3 text-center sm:text-left w-full">
          <Skeleton className="h-8 w-48 rounded-xl mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-64 rounded-lg mx-auto sm:mx-0" />
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats / Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-white/5 space-y-2">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-white/5 space-y-2">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-white/5 space-y-2">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* 4. Full Meals Timeline Page Skeleton */
export function MealsTimelineSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-white/5 p-6 sm:p-8 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-80 rounded-lg hidden sm:block" />
          </div>
          <Skeleton className="h-12 w-36 rounded-2xl" />
        </div>
      </div>

      {/* Weekly Calendar Skeleton */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-white/5 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-40 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="w-8 h-8 rounded-xl" />
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Nutrition Progress Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-white/5 space-y-3">
            <Skeleton className="h-4 w-20 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-xl" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Meal Cards Grid */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-36 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MealCardSkeleton />
          <MealCardSkeleton />
          <MealCardSkeleton />
        </div>
      </div>
    </div>
  );
}

/* 5. Plans Page Skeleton */
export function PlansPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-white/5 p-8 space-y-4 text-center sm:text-left">
        <Skeleton className="h-9 w-64 rounded-2xl mx-auto sm:mx-0" />
        <Skeleton className="h-4 w-full sm:w-2/3 rounded-lg mx-auto sm:mx-0" />
        <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-white/5">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-44 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-white/5 space-y-3">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <Skeleton className="h-6 w-3/4 rounded-xl" />
              <Skeleton className="h-4 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
