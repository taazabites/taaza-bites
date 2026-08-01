import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, Sparkles, Plane, ShieldCheck, CheckCircle2, 
  ArrowRight, Clock, Bell, RefreshCw, Info, Sun, Compass
} from 'lucide-react';
import { Button } from "@/src/components/ui/primitives";
import { cn } from "@/src/lib/utils";
import { format, addDays, parseISO, differenceInDays } from "date-fns";
import { 
  generateSmartPauseSuggestions, 
  analyzeTravelPatternProfile, 
  UPCOMING_HOLIDAY_FREEZES,
  DEFAULT_PAUSE_HISTORY,
  SmartPauseSuggestion 
} from "@/src/utils/smartPauseEngine";
import { triggerHaptic } from "@/src/utils/haptics";

interface PauseSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPause: (startDate: string, endDate: string, reason: string) => Promise<void>;
  isProcessing: boolean;
  isDark: boolean;
  historyRecords?: any[];
  mealsPerDay?: number;
}

export default function PauseSubscriptionModal({ 
  isOpen, 
  onClose, 
  onPause, 
  isProcessing, 
  isDark,
  historyRecords = DEFAULT_PAUSE_HISTORY,
  mealsPerDay = 2
}: PauseSubscriptionModalProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const defaultEndStr = format(addDays(new Date(), 4), 'yyyy-MM-dd');

  const [activeTab, setActiveTab] = useState<'smart' | 'custom' | 'holidays'>('smart');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string>('smart_weekend_getaway');
  const [reason, setReason] = useState('Vacation Travel');
  const [autoResume, setAutoResume] = useState(true);
  const [sendReminder, setSendReminder] = useState(true);

  // Compute travel profile insights
  const profile = useMemo(() => {
    return analyzeTravelPatternProfile(historyRecords, mealsPerDay);
  }, [historyRecords, mealsPerDay]);

  // Compute smart suggestions based on currently selected start date
  const smartSuggestions = useMemo(() => {
    return generateSmartPauseSuggestions(startDate, historyRecords, mealsPerDay);
  }, [startDate, historyRecords, mealsPerDay]);

  // Selected suggestion object
  const currentSuggestion = smartSuggestions.find(s => s.id === selectedSuggestionId) || smartSuggestions[0];

  // Duration in days
  const computedDays = useMemo(() => {
    try {
      const d1 = parseISO(startDate);
      const d2 = parseISO(endDate);
      const diff = differenceInDays(d2, d1);
      return diff > 0 ? diff : 1;
    } catch {
      return 3;
    }
  }, [startDate, endDate]);

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (!endDate || new Date(endDate) <= new Date(newStart)) {
      try {
        setEndDate(format(addDays(parseISO(newStart), 4), 'yyyy-MM-dd'));
      } catch {
        setEndDate(newStart);
      }
    }
  };

  const handleSelectSuggestion = (s: SmartPauseSuggestion) => {
    triggerHaptic('light');
    setSelectedSuggestionId(s.id);
    setStartDate(s.startDate);
    setEndDate(s.resumeDate);
    setReason(`Smart Pause: ${s.title}`);
  };

  const handleSelectHoliday = (h: typeof UPCOMING_HOLIDAY_FREEZES[0]) => {
    triggerHaptic('medium');
    setStartDate(h.startDate);
    setEndDate(h.suggestedResumeDate);
    setReason(`Holiday Freeze: ${h.holidayName}`);
    setActiveTab('smart');
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) return;
    triggerHaptic('heavy');
    const fullReason = `${reason}${autoResume ? ' [Auto-Resume Active]' : ''}${sendReminder ? ' [24h Reminder Enabled]' : ''}`;
    await onPause(startDate, endDate, fullReason);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={cn(
              "rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full shadow-2xl border transition-all my-8 max-h-[90vh] overflow-y-auto hide-scrollbar",
              isDark ? "bg-zinc-950 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-900"
            )}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">Pause Subscription</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Select your return date and we will auto-resume fresh deliveries
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

                        <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1 tracking-wider">
                  Start Date
                </label>
                <input 
                  type="date" 
                  min={todayStr}
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1 tracking-wider">
                  Resume / End Date
                </label>
                <input 
                  type="date" 
                  min={startDate || todayStr}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1 tracking-wider">
                  Pause Reason (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Vacation, Out of town, Personal work..."
                  className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-sm font-medium"
                  rows={2}
                />
              </div>
            </div>

            {/* Smart Auto-Resume & Reminder Automation Toggles */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-white/5 space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900 dark:text-white">Smart Auto-Resume</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Deliveries automatically restart on return date</p>
                  </div>
                </div>
                <input 
                  type="checkbox"
                  checked={autoResume}
                  onChange={(e) => setAutoResume(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
                />
              </div>

              <div className="border-t border-zinc-200/50 dark:border-white/5 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900 dark:text-white">24h Pre-Return Notification</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">WhatsApp / Push alert 1 day before auto-resume</p>
                  </div>
                </div>
                <input 
                  type="checkbox"
                  checked={sendReminder}
                  onChange={(e) => setSendReminder(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
                />
              </div>
            </div>

            {/* Pause Summary Box */}
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block text-zinc-900 dark:text-white">
                    Pause: {format(parseISO(startDate), "MMM d")} → {format(parseISO(endDate), "MMM d, yyyy")} ({computedDays} Days)
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {computedDays * mealsPerDay} meal credits rolled over. Next delivery resumes {format(parseISO(endDate), "EEEE, MMM d")}.
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-2xl py-3.5 h-auto font-black text-xs uppercase tracking-widest border-zinc-200 dark:border-white/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isProcessing || !startDate || !endDate}
                className="flex-2 rounded-2xl py-3.5 h-auto font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
              >
                {isProcessing ? 'Processing Pause...' : `Confirm Smart Pause (${computedDays} Days)`}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
