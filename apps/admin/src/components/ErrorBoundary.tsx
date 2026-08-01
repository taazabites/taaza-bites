import { Component, ErrorInfo, ReactNode, useEffect, useState } from "react"
import { AlertTriangle, RefreshCw, WifiOff, Home, ChevronRight } from "lucide-react"
import { systemMonitoringService } from "../services/system-monitoring"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  isOffline: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isOffline: !navigator.onLine
  }

  private handleOnline = () => {
    this.setState({ isOffline: false })
  }

  private handleOffline = () => {
    this.setState({ isOffline: true })
  }

  public componentDidMount() {
    window.addEventListener("online", this.handleOnline)
    window.addEventListener("offline", this.handleOffline)
  }

  public componentWillUnmount() {
    window.removeEventListener("online", this.handleOnline)
    window.removeEventListener("offline", this.handleOffline)
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isOffline: !navigator.onLine }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("TaazaBites Uncaught Runtime Error:", error, errorInfo)
    systemMonitoringService.logError({
      message: error.message,
      stack: errorInfo.componentStack,
      route: window.location.pathname
    })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = "/"
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public render() {
    // If the browser is offline and the app has failed to load, or user is disconnected
    if (this.state.isOffline) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 selection:bg-emerald-500/30 selection:text-emerald-400">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <WifiOff className="h-8 w-8 text-emerald-400 animate-pulse" />
            </div>
            
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">Connection Interrupted</h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              It looks like you've gone offline. TaazaBites Fresh ERP requires an active internet connection to stream live kitchen queues and deliver real-time logistics.
            </p>

            <div className="bg-zinc-950/60 border border-zinc-800 p-3.5 rounded-xl text-left mb-6">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">Status Indicator</span>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span>Offline mode active • Awaiting internet...</span>
              </div>
            </div>

            <button
              onClick={this.handleRetry}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Check Connection & Retry
            </button>
          </div>
        </div>
      )
    }

    // If there is a JS runtime error (500 Page)
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 selection:bg-emerald-500/30 selection:text-emerald-400">
          <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl" />
            <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-rose-400 animate-bounce" />
            </div>
            
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">System Interruption (500)</h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              An unexpected process exception was encountered inside the TaazaBites application framework. Our engineers have been alerted.
            </p>

            {this.state.error && (
              <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl text-left mb-6 max-h-40 overflow-y-auto">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-1">Process Core Exception</span>
                <p className="font-mono text-xs text-zinc-400 break-words whitespace-pre-wrap">
                  {this.state.error.message || this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Retry Current Action
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="h-3.5 w-3.5" />
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
