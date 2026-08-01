import React, { Component, ErrorInfo, ReactNode, useState } from "react";
import { safeCopyToClipboard } from "@/src/utils/clipboard";
import { Button } from "../ui/primitives";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ChevronDown,
  ChevronUp,
  Terminal,
  Flag,
  CheckCircle2,
  Copy,
  Send,
  X
} from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  isReportModalOpen: boolean;
  reportSubmitted: boolean;
}

interface UnifiedErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  onReport?: (reportDetails: string) => void;
  onGoHome?: () => void;
  compact?: boolean;
}

/**
 * Reusable Unified Error View for inline or application-wide state errors
 */
export function UnifiedErrorState({
  title = "Something went wrong",
  message = "A state or connection error occurred. Our automated self-healing protocol has logged the diagnostic payload.",
  error,
  onRetry,
  onReport,
  onGoHome,
  compact = false
}: UnifiedErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userNote, setUserNote] = useState("");

  const errorString = typeof error === 'string' ? error : error?.message || 'Unknown error state';
  const errorStack = typeof error === 'object' && error?.stack ? error.stack : '';

  const reportId = `ERR-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleCopyPayload = async () => {
    const payload = `[TaazaBites Bug Report - ID: ${reportId}]\nTimestamp: ${new Date().toISOString()}\nError: ${errorString}\nStack: ${errorStack}\nUser Note: ${userNote || 'None'}`;
    await safeCopyToClipboard(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReport = () => {
    if (onReport) {
      onReport(userNote);
    }
    setReportSubmitted(true);
    setTimeout(() => {
      setIsReportOpen(false);
      setReportSubmitted(false);
      setUserNote("");
    }, 2000);
  };

  if (compact) {
    return (
      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-rose-950 dark:text-rose-100">{title}</h4>
            <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          )}
          <button
            onClick={() => setIsReportOpen(true)}
            className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all hover:bg-rose-50"
          >
            <Flag className="w-3.5 h-3.5" /> Report
          </button>
        </div>

        {/* Report Modal */}
        {isReportOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
              <button
                onClick={() => setIsReportOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Flag className="w-5 h-5" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Report System Error</h3>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ticket ID: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{reportId}</span>
              </p>
              {reportSubmitted ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  Report dispatched successfully. Thank you!
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="Describe what you were doing when the error occurred (optional)..."
                    className="w-full h-24 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyPayload}
                      className="flex-1 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy Payload"}
                    </button>
                    <button
                      onClick={handleSendReport}
                      className="flex-[2] py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 text-zinc-100">
      <div className="text-center max-w-lg w-full bg-zinc-900 border border-zinc-800 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500" />

        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-rose-500 animate-pulse" />
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white mb-2">
          {title}
        </h2>
        <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
          {message}
        </p>

        {/* Error Message Snippet */}
        {errorString && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 mb-6 text-left">
            <p className="text-xs font-mono text-rose-400 truncate">
              {errorString}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {onRetry && (
            <Button
              size="md"
              onClick={onRetry}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold w-full cursor-pointer py-3 text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <RefreshCw className="h-4 w-4" /> Retry Action
            </Button>
          )}
          <Button
            size="md"
            variant="outline"
            onClick={() => setIsReportOpen(true)}
            className="rounded-xl border-zinc-700 hover:bg-zinc-800 text-amber-400 border-amber-500/30 font-bold w-full cursor-pointer py-3 text-sm flex items-center justify-center gap-2"
          >
            <Flag className="h-4 w-4" /> Report Issue
          </Button>
          {onGoHome && (
            <Button
              size="md"
              variant="outline"
              onClick={onGoHome}
              className="rounded-xl border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-bold w-full cursor-pointer py-3 text-sm flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" /> Go Home
            </Button>
          )}
        </div>

        {/* Technical Diagnostics Accordion */}
        <div className="border-t border-zinc-800/80 pt-4 text-left">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Technical Diagnostics
            </span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {showDetails && (
            <div className="mt-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-400 overflow-x-auto max-h-48 leading-relaxed">
              <p className="text-rose-400 font-bold mb-1">{errorString}</p>
              {errorStack && (
                <pre className="whitespace-pre-wrap text-zinc-500">
                  {errorStack}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Report Issue Modal Overlay */}
        {isReportOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl relative">
              <button
                onClick={() => setIsReportOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5 text-amber-400">
                <Flag className="w-5 h-5" />
                <h3 className="text-lg font-black text-white">Submit Bug Report</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Reference ID: <span className="font-mono text-emerald-400 font-bold">{reportId}</span>
              </p>

              {reportSubmitted ? (
                <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  Your report has been received by TaazaBites engineering team.
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Additional Context (Optional)</label>
                    <textarea
                      value={userNote}
                      onChange={(e) => setUserNote(e.target.value)}
                      placeholder="e.g., I clicked on checkout after changing my meal plan..."
                      className="w-full h-24 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleCopyPayload}
                      className="flex-1 py-3 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy Details"}
                    </button>
                    <button
                      onClick={handleSendReport}
                      className="flex-[2] py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Global React Error Boundary Class
 */
export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    isReportModalOpen: false,
    reportSubmitted: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("[TaazaBites Error Boundary] Uncaught exception caught:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      sessionStorage.removeItem('page_reloaded_for_chunk');
      sessionStorage.removeItem('chunk_retry_attempts');
      sessionStorage.clear();
    } catch (e) {
      console.error("[TaazaBites Error Boundary] Failed to clear sessionStorage:", e);
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <UnifiedErrorState
          title="Something went wrong"
          message="A critical failure occurred in the application view. Our automated self-healing protocol has logged the diagnostic payload."
          error={this.state.error}
          onRetry={this.handleReset}
          onReport={() => {}}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

