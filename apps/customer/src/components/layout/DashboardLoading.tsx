import DashboardMealCalendarSkeleton from "@/src/components/dashboard/DashboardMealCalendarSkeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8">
      <DashboardMealCalendarSkeleton />
    </div>
  );
}
