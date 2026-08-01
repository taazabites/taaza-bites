import { LottieLoader } from "@/src/components/common/LottieLoader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
      <LottieLoader
        type="loading"
        size="lg"
        text="INITIALIZING PROTOCOL"
        subtext="Fetching metabolic data & precision meal plans..."
      />
    </div>
  );
}

