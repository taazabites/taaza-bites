import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/primitives';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Phone, 
  ExternalLink, 
  Flame, 
  ChefHat, 
  PackageCheck, 
  Navigation, 
  Bike, 
  Sparkles, 
  Thermometer, 
  ShieldCheck, 
  Play, 
  Pause, 
  RefreshCw,
  User,
  Star,
  Zap,
  X
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { triggerHaptic } from '../../utils/haptics';

export interface DeliveryTrackerProps {
  status?: 'preparing' | 'out_for_delivery' | 'delivered' | 'scheduled';
  eta?: string;
  driver?: { name?: string; phone?: string; rating?: number; vehicle?: string };
  address?: string;
  addresses?: any[];
}

const KITCHEN_STAGES = [
  {
    id: 'verified',
    label: 'Order Verified',
    subtext: 'Macro-calibration complete',
    icon: ChefHat,
    color: 'from-amber-500 to-orange-500',
    baseMinutes: 18,
  },
  {
    id: 'cooking',
    label: 'Flame Cooking',
    subtext: 'Sous-vide & wok searing at 180°C',
    icon: Flame,
    color: 'from-orange-500 to-rose-500',
    baseMinutes: 12,
  },
  {
    id: 'packaging',
    label: 'Thermal Sealed',
    subtext: 'Insulated eco-box quality check',
    icon: PackageCheck,
    color: 'from-emerald-500 to-teal-500',
    baseMinutes: 6,
  },
  {
    id: 'en_route',
    label: 'Rider En Route',
    subtext: 'Live EV courier on GPS path',
    icon: Bike,
    color: 'from-teal-500 to-cyan-500',
    baseMinutes: 10,
  },
  {
    id: 'delivered',
    label: 'Arrived at Doorstep',
    subtext: 'Handed over fresh & hot',
    icon: CheckCircle2,
    color: 'from-emerald-600 to-green-500',
    baseMinutes: 0,
  }
];

export default function DeliveryTrackerWidget({ 
  status = 'preparing', 
  eta = '08:15 AM', 
  driver = { name: 'Ramesh K.', phone: '+91 98765 43210', rating: 4.9, vehicle: 'Ather EV Bike' }, 
  address,
  addresses = []
}: DeliveryTrackerProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Active location determination
  const activeAddressObj = useMemo(() => {
    if (addresses && addresses.length > 0) {
      return addresses.find(a => a.default) || addresses[0];
    }
    return null;
  }, [addresses]);

  const activeAddressText = useMemo(() => {
    if (address) return address;
    if (activeAddressObj) {
      return `${activeAddressObj.houseNumber || ''} ${activeAddressObj.street || ''}, ${activeAddressObj.area || activeAddressObj.city || 'Koramangala'}`;
    }
    return 'Sector 4, Koramangala 4th Block, Bengaluru';
  }, [address, activeAddressObj]);

  // Estimate distance based on location string hash
  const calculatedDistanceKm = useMemo(() => {
    const text = activeAddressText.toLowerCase();
    if (text.includes('indiranagar')) return 4.8;
    if (text.includes('hsr')) return 3.2;
    if (text.includes('whitefield')) return 12.5;
    if (text.includes('jp nagar')) return 5.4;
    if (text.includes('mg road')) return 6.1;
    return 3.6; // Default distance in km from Central Taaza Kitchen
  }, [activeAddressText]);

  // Stage mapping
  const initialStageIndex = useMemo(() => {
    if (status === 'delivered') return 4;
    if (status === 'out_for_delivery') return 3;
    if (status === 'preparing') return 1;
    return 0;
  }, [status]);

  const [currentStageIndex, setCurrentStageIndex] = useState(initialStageIndex);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Sync initial stage if prop changes
  useEffect(() => {
    setCurrentStageIndex(initialStageIndex);
  }, [initialStageIndex]);

  // Estimated Arrival calculation
  const totalDriveMinutes = useMemo(() => {
    return Math.round(calculatedDistanceKm * 2.8); // ~2.8 min per km driving
  }, [calculatedDistanceKm]);

  const remainingMinutesForStage = useMemo(() => {
    if (currentStageIndex >= 4) return 0;
    const stageMinutes = KITCHEN_STAGES[currentStageIndex].baseMinutes;
    if (currentStageIndex === 3) {
      return totalDriveMinutes;
    }
    return stageMinutes + totalDriveMinutes;
  }, [currentStageIndex, totalDriveMinutes]);

  // Live countdown seconds
  const [secondsRemaining, setSecondsRemaining] = useState(remainingMinutesForStage * 60);

  useEffect(() => {
    setSecondsRemaining(remainingMinutesForStage * 60);
  }, [remainingMinutesForStage]);

  useEffect(() => {
    if (secondsRemaining <= 0 || currentStageIndex >= 4) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, currentStageIndex]);

  // Auto-simulation step advancement
  useEffect(() => {
    if (!isSimulating || currentStageIndex >= 4) {
      if (currentStageIndex >= 4 && isSimulating) {
        setIsSimulating(false);
        showToast(' Delivery complete! Enjoy your fresh TaazaBites meal.', 'success');
      }
      return;
    }

    const interval = setInterval(() => {
      triggerHaptic('medium');
      setCurrentStageIndex(prev => {
        const next = prev + 1;
        const stage = KITCHEN_STAGES[next];
        if (stage) {
          showToast(` Real-time Status Update: ${stage.label}`, 'info');
        }
        return next;
      });
    }, 6000); // Advances stage every 6s in simulation mode

    return () => clearInterval(interval);
  }, [isSimulating, currentStageIndex, showToast]);

  // Formatting helper for mm:ss
  const formatCountdown = (totalSecs: number) => {
    if (totalSecs <= 0) return 'Arriving Now';
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const currentStage = KITCHEN_STAGES[currentStageIndex];
  const progressPercent = Math.min(100, Math.round(((currentStageIndex + 1) / KITCHEN_STAGES.length) * 100));

  if (status === 'scheduled') {
    return (
      <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 p-6 rounded-[2.2rem] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">Next Scheduled Delivery</h3>
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mt-0.5">{eta || 'Tomorrow morning • 08:00 AM'}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">📍 {activeAddressText}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card 
        className="bg-zinc-950 dark:bg-zinc-900 text-white border-none p-5 sm:p-6 rounded-[2.2rem] relative overflow-hidden shadow-2xl shadow-emerald-950/30 group transition-all"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header & Live Pulse */}
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live Kitchen Sync
              </span>

              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full">
                {calculatedDistanceKm} km away
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {currentStageIndex >= 4 ? 'Arrived!' : formatCountdown(secondsRemaining)}
              </h3>
              {currentStageIndex < 4 && (
                <span className="text-xs font-semibold text-emerald-400/90">
                  est. arrival
                </span>
              )}
            </div>
          </div>

          {/* Interactive Simulation Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              setIsSimulating(!isSimulating);
              showToast(isSimulating ? 'Paused kitchen simulation' : '⚡ Started live kitchen progression simulation', 'info');
            }}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
            }`}
            title="Simulate real-time kitchen progress"
          >
            {isSimulating ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
            <span>{isSimulating ? 'Simulating...' : 'Simulate'}</span>
          </button>
        </div>

        {/* Current Active Stage Highlight Banner */}
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-5 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentStage.color} flex items-center justify-center text-white shadow-md`}>
              <currentStage.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">{currentStage.label}</p>
              <p className="text-[11px] text-zinc-400 font-medium">{currentStage.subtext}</p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setShowDetailModal(true);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-400 transition-colors cursor-pointer"
            title="View Full Map & Kitchen Details"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Animated Rider Route & Progress Track */}
        <div className="relative z-10 space-y-2 mb-5">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <span className="flex items-center gap-1">
              <ChefHat className="w-3 h-3 text-emerald-400" /> Central Kitchen
            </span>
            <span>{progressPercent}% Complete</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-400" /> Your Doorstep
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700">
            {/* Filled Animated Track */}
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full relative"
              initial={{ width: '10%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              {/* Pulse trail glow */}
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/50 blur-xs rounded-full" />
            </motion.div>
          </div>
        </div>

        {/* 5 Stage Pipeline Dots */}
        <div className="relative z-10 flex items-center justify-between pt-1">
          {KITCHEN_STAGES.map((st, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <button
                key={st.id}
                onClick={() => {
                  triggerHaptic('light');
                  setCurrentStageIndex(idx);
                }}
                className="flex flex-col items-center gap-1 group/dot cursor-pointer"
                title={`Set stage to: ${st.label}`}
              >
                <div 
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-110 shadow-lg'
                      : isCompleted
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-zinc-800 text-zinc-600 border border-zinc-700'
                  }`}
                >
                  <st.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tight hidden sm:block ${
                  isCurrent ? 'text-emerald-400' : isCompleted ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  {st.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Saved Address Bar */}
        <div className="relative z-10 mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="text-zinc-300 font-medium truncate">
              <span className="font-bold text-white mr-1">Deliver to:</span>
              {activeAddressText}
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              navigate('/dashboard/addresses');
            }}
            className="text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 shrink-0 cursor-pointer"
          >
            Change
          </button>
        </div>
      </Card>

      {/* Detail Modal / Full Live Tracker Drawer */}
      <AnimatePresence>
        {showDetailModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[10%] max-w-lg mx-auto bg-zinc-900 border border-zinc-800 text-white rounded-[2.5rem] p-6 z-50 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Navigation className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white">Live Logistics Command</h3>
                    <p className="text-xs text-zinc-400 font-medium">Real-time telemetry & courier stream</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Timeline Cards */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Kitchen & Delivery Log</p>
                {KITCHEN_STAGES.map((st, i) => {
                  const isDone = i <= currentStageIndex;
                  const isCurrent = i === currentStageIndex;

                  return (
                    <div
                      key={st.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-white shadow-md'
                          : isDone
                          ? 'bg-zinc-800/50 border-zinc-700 text-zinc-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isDone ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-600'
                        }`}>
                          <st.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black">{st.label}</p>
                          <p className="text-[10px] text-zinc-400">{st.subtext}</p>
                        </div>
                      </div>

                      {isDone && (
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          {isCurrent ? 'Active' : 'Passed'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Courier Profile Box */}
              {driver && (
                <div className="p-4 bg-zinc-800/80 rounded-2xl border border-zinc-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-white">{driver.name || 'Ramesh K.'}</p>
                        <span className="flex items-center text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md">
                          <Star className="w-3 h-3 fill-amber-400 mr-0.5" /> {driver.rating || 4.9}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-400">{driver.vehicle || 'Zero-Emission Ather EV'}</p>
                    </div>
                  </div>

                  {driver.phone && (
                    <a
                      href={`tel:${driver.phone}`}
                      className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center justify-center"
                      title="Call Delivery Partner"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              {/* Temperature & Quality Assurance Note */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-800/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-black text-emerald-400">
                    <Thermometer className="w-4 h-4 text-rose-400" /> Bio-Box Internal Temp
                  </span>
                  <span className="font-mono font-bold text-white">68.4°C (Optimal Hot)</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  Chef Vikas has verified the nitrogen flush seal and verified all macro calibrations prior to dispatch.
                </p>
              </div>

              {/* Close Action */}
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-3.5 rounded-2xl bg-white text-zinc-950 font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all cursor-pointer"
              >
                Close Delivery Telemetry
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
