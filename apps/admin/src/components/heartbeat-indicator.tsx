import { useSystemHeartbeat } from "../hooks/use-system-heartbeat"
import { RefreshCcw, Activity } from "lucide-react"

export function HeartbeatIndicator() {
  const { lastUpdated, isLoading, isError, refresh } = useSystemHeartbeat();

  return (
    <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800/60 px-3 py-1.5 rounded-full shadow-sm">
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Activity className={`h-3 w-3 ${isError ? 'text-rose-500' : 'text-emerald-500'}`} />
        <span>
          {isError ? 'Heartbeat Failed' : lastUpdated ? `Last Updated: ${lastUpdated}` : 'Connecting...'}
        </span>
      </div>
      <button 
        onClick={() => refresh()} 
        disabled={isLoading}
        className="text-zinc-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
      >
        <RefreshCcw className={`h-3 w-3 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
      </button>
    </div>
  );
}
