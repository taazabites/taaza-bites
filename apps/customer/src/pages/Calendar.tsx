import OptimizedImage from "../components/common/OptimizedImage";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { MealService, SubscriptionService } from "../firebase/services";
import { MealSchedule, Meal, Subscription } from "../firebase/collections";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  SkipForward,
  Utensils,
  Droplets,
  Flame,
  Dna,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Plus,
  X,
  ChevronDown,
  CalendarDays,
  Check,
  RotateCcw,
  TrendingUp,
  User,
  Coffee,
  Salad,
  Truck
} from "lucide-react";
import { Card, Button } from "@/src/components/ui/primitives";
import { generateSmartPauseSuggestions } from "@/src/utils/smartPauseEngine";
import { format, 
  addDays, 
  subDays,
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval, 
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isWeekend,
  parseISO
} from "date-fns";
import { 
  collection, 
  query, 
  where, 
  doc, 
  onSnapshot,
  getDoc,
  getDocs,
  updateDoc, 
  setDoc, 
  writeBatch, 
  serverTimestamp, 
  Timestamp 
} from "firebase/firestore";
import { db } from "../firebase/db";
import { LoadingState, EmptyState } from "../components/ui/StateRegistry";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PageHeader } from "../components/dashboard/PageHeader";
import { PageTransition } from "../components/dashboard/PageTransition";
import DashboardMealCalendarSkeleton from "../components/dashboard/DashboardMealCalendarSkeleton";
import { AddCalendarButton } from "../components/common/AddCalendarButton";
import { useToast } from "@/src/context/ToastContext";
import { cn } from "@/src/lib/utils";
import { BottomSheet } from "../components/ui/BottomSheet";

// Types matching the specifications
interface CalendarMonthConfig {
  id: string; // e.g., "2026-07"
  holidays: string[]; // array of ISO strings or date strings "yyyy-MM-dd"
  specialNotes?: Record<string, string>; // date to event details
}

interface DeliveryInfo {
  id: string;
  userId: string;
  date: string;
  mealType: string;
  status: "pending" | "shipped" | "delivered" | "skipped" | "paused";
  estimatedTime?: string;
  actualTime?: string;
  deliveryAgentName?: string;
  deliveryAgentPhone?: string;
}

// Safe Date conversion utilities
const getSafeDate = (d: any): Date => {
  if (!d) return new Date();
  if (typeof d?.toDate === 'function') {
    try {
      const res = d.toDate();
      if (res && !isNaN(res.getTime())) return res;
    } catch { /* ignore */ }
  }
  if (d instanceof Date) return isNaN(d.getTime()) ? new Date() : d;
  if (typeof d === 'string') {
    try {
      const parsed = parseISO(d);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    } catch {
      return new Date();
    }
  }
  if (typeof d === 'number') return new Date(d);
  return new Date();
};

const safeFormatISO = (dateStr: string | undefined | null, fmt = 'EEE, MMM d'): string => {
  if (!dateStr) return '';
  try {
    const parsed = parseISO(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return format(parsed, fmt);
  } catch {
    return dateStr || '';
  }
};

const safeParseISO = (dateStr: string | undefined | null): Date => {
  if (!dateStr) return new Date();
  try {
    const parsed = parseISO(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  } catch {
    return new Date();
  }
};

export default function CalendarPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const hasAutoSeededRef = useRef(false);

  // Selected date & active month states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Real-time states
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [schedules, setSchedules] = useState<MealSchedule[]>([]);
  const [dailyMeals, setDailyMeals] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryInfo[]>([]);
  const [monthConfig, setMonthConfig] = useState<CalendarMonthConfig | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Modals & UI Controls
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'calendar' | 'day' | 'upcoming' | 'delivered' | 'skipped' | 'paused'>('calendar');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseMode, setPauseMode] = useState<"single" | "range" | "weekend">("single");
  const [pauseStartDate, setPauseStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [pauseEndDate, setPauseEndDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Local water intake (persisted client side or fallback)
  const [waterIntake, setWaterIntake] = useState<Record<string, number>>({});

  // Parse URL Parameters
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const actionParam = searchParams.get('action');
    const tabParam = searchParams.get('tab');

    if (dateParam) {
      try {
        const parsed = parseISO(dateParam);
        if (!isNaN(parsed.getTime())) {
          setSelectedDate(parsed);
          setCurrentMonth(parsed);
        }
      } catch (err) {
        console.error("Invalid URL date parameter:", err);
      }
    }

    if (actionParam === 'pause') {
      setShowPauseModal(true);
    }

    if (tabParam && ['calendar', 'day', 'upcoming', 'delivered', 'skipped', 'paused'].includes(tabParam)) {
      setActiveCategoryFilter(tabParam as any);
    }
  }, [searchParams]);

  // Theme support
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('dashboard_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const durations = { light: 15, medium: 30, heavy: 50 };
      navigator.vibrate(durations[type]);
    }
  };

  // Generate standard calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  // Real-time Firestore synchronizer
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const startStr = format(calendarStart, 'yyyy-MM-dd');
    const endStr = format(calendarEnd, 'yyyy-MM-dd');
    const monthId = format(currentMonth, 'yyyy-MM');

    // Batch Static Data Fetch
    const fetchStaticCalendarData = async () => {
      try {
        const subQ = query(collection(db, 'subscriptions'), where('userId', '==', currentUser.uid));
        
        const results = await Promise.allSettled([
          getDoc(doc(db, 'users', currentUser.uid)),
          getDocs(subQ),
          getDoc(doc(db, 'calendarMonths', monthId)),
          getDocs(collection(db, 'meals'))
        ]);

        const userSnapRes = results[0];
        if (userSnapRes.status === 'fulfilled' && userSnapRes.value.exists()) {
          setUserProfile(userSnapRes.value.data());
        }

        const subSnapRes = results[1];
        if (subSnapRes.status === 'fulfilled' && !subSnapRes.value.empty) {
          const list = subSnapRes.value.docs.map(d => ({ id: d.id, ...d.data() } as Subscription));
          const active = list.find(s => s.status === 'active') || list.find(s => s.status === 'paused') || list[0];
          setSubscription(active);
        } else {
          setSubscription(null);
        }

        const monthSnapRes = results[2];
        if (monthSnapRes.status === 'fulfilled' && monthSnapRes.value.exists()) {
          setMonthConfig(monthSnapRes.value.data() as CalendarMonthConfig);
        } else {
          setMonthConfig({
            id: monthId,
            holidays: [],
            specialNotes: {}
          });
        }

        const mealsSnapRes = results[3];
        if (mealsSnapRes.status === 'fulfilled') {
          setDailyMeals(mealsSnapRes.value.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("Error fetching static calendar data:", err);
      }
    };
    
    fetchStaticCalendarData();

    // 3. Sync Meal Schedules for current range (Keep real-time for UX)
    const schedQ = query(
      collection(db, 'mealSchedules'),
      where('userId', '==', currentUser.uid)
    );
    const unsubSched = onSnapshot(schedQ, (snap) => {
      const mealOrder = ['Breakfast', 'Lunch', 'Dinner'];
      const rawList = snap.docs.map(d => ({ id: d.id, ...d.data() } as MealSchedule));
      const list = rawList.filter(s => s.date >= startStr && s.date <= endStr);
      const activeList = list.length > 0 ? list : rawList;
      const sorted = activeList.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType);
      });
      setSchedules(sorted);
      setLoading(false);

      if (snap.empty && currentUser && !hasAutoSeededRef.current) {
        hasAutoSeededRef.current = true;
        handleAutoSeedCalendar();
      }
    }, (err) => {
      console.error("Schedules real-time sync error:", err);
      setLoading(false);
    });

    // 4. Sync Deliveries list (Keep real-time for UX)
    const delivQ = query(
      collection(db, 'deliveries'),
      where('userId', '==', currentUser.uid)
    );
    const unsubDeliv = onSnapshot(delivQ, (snap) => {
      const rawList = snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryInfo));
      const list = rawList.filter(d => d.date >= startStr && d.date <= endStr);
      setDeliveries(list);
    }, (err) => {
      console.error("Deliveries real-time sync error:", err);
    });

    return () => {
      unsubSched();
      unsubDeliv();
    };
  }, [currentUser, currentMonth]);

  // Compute daily parameters
  const dayStats = useMemo(() => {
    const stats: Record<string, {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      isPaused: boolean;
      isHoliday: boolean;
      isDelivered: boolean;
      isScheduled: boolean;
      mealsCount: number;
      deliveredCount: number;
      waterTarget: number;
      waterCurrent: number;
    }> = {};

    calendarDays.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const daySchedules = schedules.filter(s => s.date === dateStr);
      
      const isDayHoliday = monthConfig?.holidays?.includes(dateStr) || false;
      const isDayPaused = daySchedules.length > 0 && daySchedules.every(s => (s.deliveryStatus as string) === 'paused');

      let cal = 0;
      let prot = 0;
      let carb = 0;
      let fat = 0;
      let delivered = 0;
      let scheduled = 0;

      daySchedules.forEach((s) => {
        // Resolve meal ingredients/macros from the general meals library or use sched values
        const mDetail = dailyMeals.find(m => m.id === s.mealId || m.mealName === s.mealName);
        cal += mDetail?.calories || 450;
        prot += mDetail?.protein || 25;
        carb += mDetail?.carbs || 50;
        fat += mDetail?.fat || 12;

        if (s.deliveryStatus === 'delivered') {
          delivered++;
        } else if (s.deliveryStatus === 'pending' || s.deliveryStatus === 'shipped') {
          scheduled++;
        }
      });

      const hasSchedules = daySchedules.length > 0;

      stats[dateStr] = {
        calories: cal,
        protein: prot,
        carbs: carb,
        fat: fat,
        isPaused: isDayPaused || (hasSchedules && daySchedules.every(s => s.deliveryStatus === 'skipped')),
        isHoliday: isDayHoliday,
        isDelivered: hasSchedules && delivered === daySchedules.length,
        isScheduled: hasSchedules && scheduled > 0 && !isDayPaused,
        mealsCount: daySchedules.length,
        deliveredCount: delivered,
        waterTarget: 2.5,
        waterCurrent: waterIntake[dateStr] || 0
      };
    });

    return stats;
  }, [calendarDays, schedules, monthConfig, dailyMeals, waterIntake]);

  // Current selected date statistics
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDaySchedules = useMemo(() => {
    return schedules.filter(s => s.date === selectedDateStr).map(s => {
      const mealInfo = dailyMeals.find(m => m.id === s.mealId || m.mealName === s.mealName);
      const deliveryInfo = deliveries.find(d => d.date === selectedDateStr && d.mealType === s.mealType);
      return {
        ...s,
        meal: mealInfo || {
          mealName: s.mealName || "Calibrated Meal Option",
          calories: 550,
          protein: 30,
          carbs: 60,
          fat: 15,
          image: s.mealType === 'Breakfast' 
            ? "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fm=webp&w=300"
            : s.mealType === 'Lunch'
            ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fm=webp&w=300"
            : "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fm=webp&w=300",
          ingredients: ["Premium local grain", "Chef select protein", "Seasoned herbs"],
          chefNotes: "Balanced healthy option"
        },
        delivery: deliveryInfo
      };
    });
  }, [schedules, selectedDateStr, dailyMeals, deliveries]);

  // Delivery schedule summary calculations
  const deliverySummary = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    const todayDeliv = schedules.filter(s => s.date === todayStr);
    const tomorrowDeliv = schedules.filter(s => s.date === tomorrowStr);
    
    const upcoming = schedules
      .filter(s => s.date > todayStr && s.deliveryStatus === 'pending')
      .slice(0, 4);

    const skipped = schedules.filter(s => s.deliveryStatus === 'skipped').map(s => s.date);
    const paused = schedules.filter(s => (s.deliveryStatus as string) === 'paused').map(s => s.date);

    return {
      todayTime: todayDeliv.length > 0 ? todayDeliv[0].deliveryTime || "08:00 AM - 10:00 AM" : "No schedule today",
      tomorrowTime: tomorrowDeliv.length > 0 ? tomorrowDeliv[0].deliveryTime || "08:00 AM - 10:00 AM" : "No schedule tomorrow",
      upcoming,
      skippedDays: Array.from(new Set(skipped)),
      pausedDays: Array.from(new Set(paused))
    };
  }, [schedules]);

  // Categorized schedules enriched with meal & delivery details
  const categorizedSchedules = useMemo(() => {
    const enrich = (s: MealSchedule) => {
      const mealInfo = dailyMeals.find(m => m.id === s.mealId || m.mealName === s.mealName);
      const deliveryInfo = deliveries.find(d => d.date === s.date && d.mealType === s.mealType);
      return {
        ...s,
        meal: mealInfo || {
          mealName: s.mealName || "Nutritional Meal",
          calories: 520,
          protein: 28,
          carbs: 55,
          fat: 16,
          image: s.mealType === 'Breakfast' 
            ? "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fm=webp&w=300"
            : s.mealType === 'Lunch'
            ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fm=webp&w=300"
            : "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fm=webp&w=300",
          ingredients: ["Fresh organic grains", "Chef select protein", "Micro-greens"],
          chefNotes: "Balanced metabolic composition"
        },
        delivery: deliveryInfo
      };
    };

    const upcoming = schedules.filter(s => s.deliveryStatus === 'pending' || s.deliveryStatus === 'shipped').map(enrich);
    const delivered = schedules.filter(s => s.deliveryStatus === 'delivered').map(enrich);
    const skipped = schedules.filter(s => s.deliveryStatus === 'skipped').map(enrich);
    const paused = schedules.filter(s => (s.deliveryStatus as string) === 'paused').map(enrich);

    return { upcoming, delivered, skipped, paused };
  }, [schedules, dailyMeals, deliveries]);

  const handleSkipSchedule = async (scheduleId: string) => {
    if (!currentUser) return;
    setIsProcessing(true);
    triggerHaptic('medium');
    try {
      await updateDoc(doc(db, 'mealSchedules', scheduleId), {
        deliveryStatus: 'skipped',
        updatedAt: serverTimestamp()
      });
      showToast("Meal skipped successfully. Balance updated.", "info");
    } catch (err) {
      console.error(err);
      showToast("Failed to skip meal.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreSchedule = async (scheduleId: string) => {
    if (!currentUser || !subscription) return;
    setIsProcessing(true);
    triggerHaptic('light');

    try {
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) {
        showToast("Schedule not found.", "error");
        setIsProcessing(false);
        return;
      }
      const batch = writeBatch(db);
      
      batch.update(doc(db, 'mealSchedules', scheduleId), {
        deliveryStatus: 'pending',
        updatedAt: serverTimestamp()
      });
      
      const delivId = `del_${currentUser.uid}_${schedule.date}_${schedule.mealType}`;
      batch.set(doc(db, 'deliveries', delivId), {
        status: 'pending'
      }, { merge: true });
      
      const currentMeals = subscription.remainingMeals || 0;
      batch.update(doc(db, 'subscriptions', subscription.id), {
        remainingMeals: Math.max(0, currentMeals - 1),
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      showToast("Meal restored to active schedule!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to restore meal.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Seeding tool in case Firestore has no data yet
  const handleAutoSeedCalendar = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    triggerHaptic('heavy');
    const batch = writeBatch(db);

    try {
      showToast("Initializing premium meal database...", "info");

      // 1. Create default user configuration
      const userRef = doc(db, 'users', currentUser.uid);
      batch.set(userRef, {
        uid: currentUser.uid,
        name: userProfile?.name || "Premium Dev",
        email: currentUser.email || "dev@taazabites.com",
        role: "customer",
        status: "active",
        walletBalance: userProfile?.walletBalance || 1450,
        rewardPoints: userProfile?.rewardPoints || 800,
        hasActiveSubscription: true,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Create subscription plan if missing
      const planId = "metabolic-elite-30";
      const planRef = doc(db, 'subscriptionPlans', planId);
      batch.set(planRef, {
        id: planId,
        name: "Healthy Fit Subscription",
        description: "Complete high-protein healthy gourmet fitness meal plan.",
        price: 8999,
        offerPrice: 7499,
        durationDays: 30,
        mealsPerDay: 3,
        totalMeals: 90,
        calories: 2200,
        protein: 140,
        dietType: "Non-Veg",
        mealTypes: ["Breakfast", "Lunch", "Dinner"],
        features: ["High Quality Protein", "Natural Sourcing", "Premium Glass Packaging"],
        popular: true,
        active: true,
        displayOrder: 1,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
        createdAt: serverTimestamp()
      }, { merge: true });

      // 3. Create active subscription
      const subId = `sub_${currentUser.uid}`;
      const subRef = doc(db, 'subscriptions', subId);
      batch.set(subRef, {
        id: subId,
        userId: currentUser.uid,
        planId: planId,
        planName: "Metabolic Elite",
        status: "active",
        startDate: Timestamp.fromDate(subDays(new Date(), 5)),
        endDate: Timestamp.fromDate(addDays(new Date(), 25)),
        remainingMeals: 62,
        paused: false,
        pauseHistory: [],
        paymentId: "pay_democalendar_999",
        deliveryTime: "08:00 AM - 10:00 AM",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 4. Seeding month holidays
      const monthId = format(currentMonth, 'yyyy-MM');
      const monthRef = doc(db, 'calendarMonths', monthId);
      const h1 = format(addDays(monthStart, 9), 'yyyy-MM-dd');
      const h2 = format(addDays(monthStart, 19), 'yyyy-MM-dd');
      batch.set(monthRef, {
        id: monthId,
        holidays: [h1, h2],
        specialNotes: {
          [h1]: "TaazaBites Annual Culinary Summit",
          [h2]: "Chef Team Kitchen Maintenance Shutdown"
        }
      }, { merge: true });

      // 5. Seeding meals general library
      const mealsToSeed = [
        {
          id: "m_bf_1",
          mealName: "Fresh Avocado & Tofu Sourdough",
          category: "Metabolic Breakfast",
          calories: 480,
          protein: 22,
          carbs: 45,
          fat: 16,
          ingredients: ["Haas Avocado", "Silken Tofu", "Artisanal Sourdough", "Chia Seeds"],
          image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fm=webp&w=500",
          available: true,
          dietType: "Veg"
        },
        {
          id: "m_lh_1",
          mealName: "Sous-Vide Salmon & Wild Harvest Quinoa",
          category: "Athletic Lunch",
          calories: 680,
          protein: 42,
          carbs: 58,
          fat: 22,
          ingredients: ["Atlantic Salmon", "Red Quinoa", "Direct asparagus", "Olive vinaigrette"],
          image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fm=webp&w=500",
          available: true,
          dietType: "Non-Veg"
        },
        {
          id: "m_dn_1",
          mealName: "Hand-Crafted Keto Salad with Grilled Paneer",
          category: "Cognitive Recovery Dinner",
          calories: 510,
          protein: 34,
          carbs: 18,
          fat: 28,
          ingredients: ["Fresh Paneer", "Alfalfa Sprouts", "Spinach Greens", "Walnuts", "Pomegranate"],
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fm=webp&w=500",
          available: true,
          dietType: "Veg"
        }
      ];

      mealsToSeed.forEach((m) => {
        batch.set(doc(db, 'meals', m.id), m, { merge: true });
      });

      // 6. Generate Meal Schedules & Deliveries for the entire month
      for (let i = -5; i < 25; i++) {
        const schedDate = addDays(new Date(), i);
        const dateStr = format(schedDate, 'yyyy-MM-dd');
        
        // Skip some days or mark delivered for past
        let deliveryStatus: "pending" | "delivered" | "skipped" | "paused" = "pending";
        if (i < 0) {
          deliveryStatus = i === -2 ? "skipped" : "delivered";
        } else if (i === 3) {
          deliveryStatus = "paused";
        }

        const mealTypes = ["Breakfast", "Lunch", "Dinner"];
        for (let m = 0; m < mealTypes.length; m++) {
          const type = mealTypes[m];
          const scheduleId = `ms_${currentUser.uid}_${dateStr}_${type}`;
          const mealId = type === 'Breakfast' ? "m_bf_1" : type === 'Lunch' ? "m_lh_1" : "m_dn_1";
          const mealName = type === 'Breakfast' ? "Fresh Avocado & Tofu Sourdough" : type === 'Lunch' ? "Sous-Vide Salmon & Wild Harvest Quinoa" : "Hand-Crafted Keto Salad with Grilled Paneer";

          batch.set(doc(db, 'mealSchedules', scheduleId), {
            id: scheduleId,
            subscriptionId: subId,
            userId: currentUser.uid,
            date: dateStr,
            mealType: type,
            mealId,
            mealName,
            deliveryStatus,
            deliveryTime: type === 'Breakfast' ? "08:00 AM - 09:30 AM" : type === 'Lunch' ? "12:30 PM - 02:00 PM" : "07:30 PM - 09:00 PM",
            createdAt: serverTimestamp()
          }, { merge: true });

          // Seed accompanying delivery tracking details
          const delivId = `del_${currentUser.uid}_${dateStr}_${type}`;
          batch.set(doc(db, 'deliveries', delivId), {
            id: delivId,
            userId: currentUser.uid,
            date: dateStr,
            mealType: type,
            status: deliveryStatus,
            estimatedTime: type === 'Breakfast' ? "08:15 AM" : type === 'Lunch' ? "12:45 PM" : "07:45 PM",
            actualTime: deliveryStatus === 'delivered' ? (type === 'Breakfast' ? "08:22 AM" : type === 'Lunch' ? "01:02 PM" : "07:51 PM") : null,
            deliveryAgentName: "Ramesh Sharma",
            deliveryAgentPhone: "+91 9876543210"
          }, { merge: true });
        }
      }

      await batch.commit();
      showToast("Gourmet meal calendars initialized successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Verification database seeding failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Perform single meal status toggle with Cutoff Enforcement
  const handleToggleSingleMeal = async (
    scheduleId: string, 
    dateStr: string, 
    mealType: string, 
    newStatus: 'pending' | 'skipped' | 'paused' | 'delivered'
  ) => {
    if (!currentUser) return;

    // Cutoff Check for skipping
    if (newStatus === 'skipped') {
      const now = new Date();
      const [y, m, d] = dateStr.split('-').map(Number);
      const mealDate = new Date(y, m - 1, d);

      if (mealType === 'Dinner' || mealType.toLowerCase().includes('dinner')) {
        mealDate.setHours(14, 0, 0, 0); // 2:00 PM cutoff same day
      } else if (mealType === 'Lunch' || mealType.toLowerCase().includes('lunch')) {
        mealDate.setHours(8, 0, 0, 0); // 8:00 AM cutoff same day
      } else {
        mealDate.setDate(mealDate.getDate() - 1);
        mealDate.setHours(22, 0, 0, 0); // 10:00 PM night before
      }

      if (now.getTime() >= mealDate.getTime()) {
        triggerHaptic('warning');
        const cutoffLabel = (mealType.toLowerCase().includes('dinner')) ? '2:00 PM same day' : (mealType.toLowerCase().includes('lunch')) ? '8:00 AM same day' : '10:00 PM night before';
        showToast(`🔒 Kitchen Locked! ${mealType} cutoff (${cutoffLabel}) has passed. Chefs have started preparation.`, "error");
        return;
      }
    }

    setIsProcessing(true);
    triggerHaptic('medium');
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'mealSchedules', scheduleId), {
        deliveryStatus: newStatus,
        updatedAt: serverTimestamp()
      });
      const delivId = `del_${currentUser.uid}_${dateStr}_${mealType}`;
      batch.set(doc(db, 'deliveries', delivId), {
        status: newStatus
      }, { merge: true });

      await batch.commit();
      
      const statusMsgs: Record<string, string> = {
        skipped: 'Meal skipped before cutoff! ₹280 credited to your Taaza Wallet.',
        paused: 'Meal delivery paused.',
        pending: 'Meal schedule restored!',
        delivered: 'Meal marked as delivered!'
      };
      showToast(statusMsgs[newStatus] || `Meal updated to ${newStatus}`, "success");
    } catch (err) {
      console.error("Error toggling single meal status:", err);
      showToast("Failed to update meal status.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Perform multi-dimensional Pause protocols
  const handleConfirmPauseProtocol = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    triggerHaptic('heavy');

    let activeSub = subscription;
    if (!activeSub) {
      await handleAutoSeedCalendar();
      setIsProcessing(false);
      setShowPauseModal(false);
      showToast("Initialized active subscription and generated meal schedules!", "success");
      return;
    }

    const batch = writeBatch(db);

    try {
      if (pauseMode === "single") {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const daySchedules = schedules.filter(s => s.date === dateStr);
        
        if (daySchedules.length === 0) {
          showToast("No schedules present on the selected date to pause.", "error");
          setIsProcessing(false);
          return;
        }

        daySchedules.forEach((s) => {
          batch.update(doc(db, 'mealSchedules', s.id), {
            deliveryStatus: 'paused',
            updatedAt: serverTimestamp()
          });
          const delivId = `del_${currentUser.uid}_${dateStr}_${s.mealType}`;
          batch.set(doc(db, 'deliveries', delivId), {
            status: 'paused'
          }, { merge: true });
        });

        // Refund meals balance
        const refundedMeals = daySchedules.filter(s => (s.deliveryStatus as string) !== 'paused').length;
        batch.update(doc(db, 'subscriptions', activeSub.id), {
          remainingMeals: (activeSub.remainingMeals || 0) + refundedMeals,
          updatedAt: serverTimestamp()
        });

        showToast(`Paused meals for ${dateStr}. Your meal balance has been updated.`, "success");
      } 
      else if (pauseMode === "range") {
        if (!pauseStartDate || !pauseEndDate) {
          showToast("Please enter valid start and end dates.", "error");
          setIsProcessing(false);
          return;
        }
        if (new Date(pauseEndDate) < new Date(pauseStartDate)) {
          showToast("End date must be on or after start date.", "error");
          setIsProcessing(false);
          return;
        }

        const intervalDays = eachDayOfInterval({
          start: safeParseISO(pauseStartDate),
          end: safeParseISO(pauseEndDate)
        });

        let totalSchedulesPaused = 0;
        intervalDays.forEach((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const daySchedules = schedules.filter(s => s.date === dateStr && (s.deliveryStatus as string) !== 'paused');

          daySchedules.forEach((s) => {
            batch.update(doc(db, 'mealSchedules', s.id), {
              deliveryStatus: 'paused',
              updatedAt: serverTimestamp()
            });
            const delivId = `del_${currentUser.uid}_${dateStr}_${s.mealType}`;
            batch.set(doc(db, 'deliveries', delivId), {
              status: 'paused'
            }, { merge: true });
            totalSchedulesPaused++;
          });
        });

        batch.update(doc(db, 'subscriptions', activeSub.id), {
          remainingMeals: (activeSub.remainingMeals || 0) + totalSchedulesPaused,
          updatedAt: serverTimestamp()
        });

        showToast(`Paused meals from ${pauseStartDate} to ${pauseEndDate}. ${totalSchedulesPaused} meals frozen.`, "success");
      } 
      else if (pauseMode === "weekend") {
        // Find all weekends in current subscription timeframe
        const subStart = activeSub.startDate ? getSafeDate(activeSub.startDate) : subDays(new Date(), 5);
        const subEnd = activeSub.endDate ? getSafeDate(activeSub.endDate) : addDays(new Date(), 25);
        const subDaysList = eachDayOfInterval({ start: subStart, end: subEnd });
        
        let weekendSchedulesPaused = 0;
        subDaysList.forEach((day) => {
          if (isWeekend(day)) {
            const dateStr = format(day, 'yyyy-MM-dd');
            const daySchedules = schedules.filter(s => s.date === dateStr && (s.deliveryStatus as string) !== 'paused');

            daySchedules.forEach((s) => {
              batch.update(doc(db, 'mealSchedules', s.id), {
                deliveryStatus: 'paused',
                updatedAt: serverTimestamp()
              });
              const delivId = `del_${currentUser.uid}_${dateStr}_${s.mealType}`;
              batch.set(doc(db, 'deliveries', delivId), {
                status: 'paused'
              }, { merge: true });
              weekendSchedulesPaused++;
            });
          }
        });

        batch.update(doc(db, 'subscriptions', activeSub.id), {
          remainingMeals: (activeSub.remainingMeals || 0) + weekendSchedulesPaused,
          updatedAt: serverTimestamp()
        });

        showToast(`Weekend pause active. ${weekendSchedulesPaused} meals paused.`, "success");
      }

      await batch.commit();
      setShowPauseModal(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to pause subscription. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    triggerHaptic('heavy');

    if (!subscription) {
      await handleAutoSeedCalendar();
      setIsProcessing(false);
      showToast("Subscription and meal schedules activated!", "success");
      return;
    }

    const batch = writeBatch(db);

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const daySchedules = schedules.filter(s => s.date === dateStr && (s.deliveryStatus as string) === 'paused');

      if (daySchedules.length === 0) {
        showToast("Selected day is not paused.", "error");
        setIsProcessing(false);
        return;
      }

      daySchedules.forEach((s) => {
        batch.update(doc(db, 'mealSchedules', s.id), {
          deliveryStatus: 'pending',
          updatedAt: serverTimestamp()
        });
        const delivId = `del_${currentUser.uid}_${dateStr}_${s.mealType}`;
        batch.set(doc(db, 'deliveries', delivId), {
          status: 'pending'
        }, { merge: true });
      });

      // Deduct resumed meals
      const currentMeals = subscription.remainingMeals || 0;
      batch.update(doc(db, 'subscriptions', subscription.id), {
        remainingMeals: Math.max(0, currentMeals - daySchedules.length),
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      showToast(`Resumed subscription schedule for ${dateStr}.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to resume meals. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIncrementWater = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const current = waterIntake[dateStr] || 0;
    if (current >= 5) return;
    triggerHaptic('light');
    setWaterIntake(prev => ({
      ...prev,
      [dateStr]: Number((current + 0.25).toFixed(2))
    }));
  };

  const handleResetWater = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    triggerHaptic('medium');
    setWaterIntake(prev => ({
      ...prev,
      [dateStr]: 0
    }));
  };

  // Helper colors configuration
  const getDayColors = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const stats = dayStats[dateStr];
    
    if (isSameDay(date, new Date())) {
      return "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-2 ring-blue-500/30 text-blue-600 dark:text-blue-400";
    }

    if (!stats || stats.mealsCount === 0) {
      return "border-zinc-100 dark:border-zinc-900 bg-zinc-50/10 dark:bg-zinc-900/10 text-zinc-400 dark:text-zinc-600";
    }

    if (stats.isHoliday) {
      return "border-zinc-950 dark:border-white bg-zinc-950/10 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 ring-2 ring-zinc-950/20";
    }

    if (stats.isPaused) {
      return "border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20";
    }

    if (stats.isDelivered) {
      return "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400";
    }

    if (stats.isScheduled) {
      return "border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400";
    }

    return "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200";
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8 max-w-7xl mx-auto pb-16">
          
          {/* Premium Header */}
          <div className="hidden md:block">
            <PageHeader 
              title="Meal Delivery Calendar"
              description="Plan your weekly meals, pause delivery anytime, and track your active subscription shipments."
              badge="Deliveries"
              icon={CalendarIcon}
              gradient="from-emerald-950 via-zinc-900 to-emerald-950"
            >
              {subscription && (
                <div className="hidden md:flex bg-white/5 backdrop-blur-md border border-white/10 p-4 px-6 rounded-3xl items-center gap-4 group/stats">
                  <div className="p-2 bg-emerald-500/20 rounded-xl group-hover/stats:scale-110 transition-transform">
                    <Utensils className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Remaining Meals This Month</p>
                    <p className="text-2xl font-black text-white">
                      {subscription.remainingMeals || 0} Meals
                    </p>
                  </div>
                </div>
              )}
              <div className="hidden md:flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPauseModal(true)}
                  className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase tracking-widest text-[10px]"
                >
                  <PauseCircle className="h-5 w-5 mr-2 text-rose-500" />
                  Pause Deliveries
                </Button>
                <Button
                  onClick={handleAutoSeedCalendar}
                  disabled={isProcessing}
                  className="hidden md:flex h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl shadow-emerald-500/20 font-black uppercase tracking-widest text-[10px] border-0"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Load Sample Schedule
                </Button>
              </div>
            </PageHeader>
          </div>

        {/* Category Navigation Pills Bar */}
        <div className="flex items-center justify-between gap-3 p-2 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] sm:rounded-[2.5rem] overflow-x-auto no-scrollbar scrollbar-hide">
          <div className="flex items-center gap-2">
            {[
              { id: 'calendar', label: 'Meal Calendar', icon: CalendarIcon, color: 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-lg' },
              { id: 'day', label: 'Day View', icon: Clock, color: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' },
              { id: 'upcoming', label: 'Upcoming Meals', icon: Clock, color: 'bg-amber-500 text-white shadow-lg shadow-amber-500/20', count: categorizedSchedules.upcoming.length },
              { id: 'delivered', label: 'Delivered Meals', icon: CheckCircle2, color: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20', count: categorizedSchedules.delivered.length },
              { id: 'skipped', label: 'Skipped Meals', icon: SkipForward, color: 'bg-blue-500 text-white shadow-lg shadow-blue-500/20', count: categorizedSchedules.skipped.length },
              { id: 'paused', label: 'Paused Days', icon: PauseCircle, color: 'bg-rose-500 text-white shadow-lg shadow-rose-500/20', count: categorizedSchedules.paused.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveCategoryFilter(tab.id as any); triggerHaptic('light'); }}
                className={cn(
                  "relative px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer",
                  activeCategoryFilter === tab.id
                    ? "text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                {activeCategoryFilter === tab.id && (
                  <motion.div
                    layoutId="calendarFilterActivePill"
                    className={cn("absolute inset-0 rounded-2xl", tab.color)}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="relative z-10 px-2 py-0.5 rounded-full bg-white/20 text-[9px]">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <DashboardMealCalendarSkeleton />
        ) : activeCategoryFilter === 'day' ? (
          /* DAY VIEW SUB-VIEW */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Day View</h2>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1">Timeline for {format(selectedDate, 'EEEE, MMMM do, yyyy')}</p>
              </div>
              <span className="px-4 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl text-xs font-black uppercase tracking-widest">
                {selectedDaySchedules.length} Meals
              </span>
            </div>

            {selectedDaySchedules.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] space-y-4">
                <Utensils className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200">No Meals Scheduled</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">There are no deliveries mapped to this date.</p>
              </Card>
            ) : (
              <div className="relative pl-6 md:pl-8 space-y-8 border-l-2 border-zinc-100 dark:border-zinc-900 my-8">
                {[...selectedDaySchedules].sort((a, b) => {
                  const order: Record<string, number> = { 'Breakfast': 1, 'Lunch': 2, 'Dinner': 3 };
                  return (order[a.mealType] || 4) - (order[b.mealType] || 4);
                }).map((item, index) => (
                  <div key={item.id} className="relative">
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute -left-[35px] md:-left-[41px] w-6 h-6 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center shadow-sm",
                      item.deliveryStatus === 'delivered' ? "bg-emerald-500" :
                      (item.deliveryStatus as string) === 'paused' ? "bg-rose-500" :
                      "bg-amber-500"
                    )}>
                      {item.deliveryStatus === 'delivered' ? <CheckCircle2 className="w-3 h-3 text-white" /> :
                       (item.deliveryStatus as string) === 'paused' ? <PauseCircle className="w-3 h-3 text-white" /> :
                       <Clock className="w-3 h-3 text-white" />}
                    </div>
                    
                    <Card className={cn(
                      "p-5 md:p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[2rem] shadow-sm transition-all",
                      (item.deliveryStatus as string) === 'paused' && "opacity-70 saturate-50"
                    )}>
                      <div className="flex flex-col sm:flex-row gap-5">
                        <OptimizedImage 
                          src={item.meal?.image} 
                          alt={item.meal?.mealName} 
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shrink-0" 
                          referrerPolicy="no-referrer" 
                          
                        />
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                              {item.mealType === 'Breakfast' ? '🍳' : item.mealType === 'Lunch' ? '🥗' : '🍽'} {item.mealType}: <span className="text-zinc-400 dark:text-zinc-500 font-bold text-lg sm:text-xl">{item.deliveryTime || (item.mealType === 'Breakfast' ? "08:00 AM" : item.mealType === 'Lunch' ? "01:00 PM" : "07:00 PM")}</span>
                            </h3>
                            <div className="flex items-center gap-2">
                              <AddCalendarButton
                                id={item.id}
                                dateStr={item.date}
                                mealType={item.mealType}
                                mealName={item.meal?.mealName || item.mealName || "Chef's Special"}
                                deliveryTimeStr={item.deliveryTime}
                                calories={item.meal?.calories}
                                protein={item.meal?.protein}
                                carbs={item.meal?.carbs}
                                fat={item.meal?.fat}
                                showLabel={false}
                              />
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                item.deliveryStatus === 'delivered' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                (item.deliveryStatus as string) === 'paused' ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                                "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              )}>
                                {item.deliveryStatus}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <h4 className="text-lg font-black text-zinc-800 dark:text-zinc-200 truncate mb-2">
                              {item.meal?.mealName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-zinc-500">
                              <span className="flex items-center gap-1">
                                <Flame className="w-3.5 h-3.5" />
                                {item.meal?.calories} kcal
                              </span>
                              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 hidden sm:block" />
                              <span>{item.meal?.protein}g P</span>
                              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 hidden sm:block" />
                              <span>{item.meal?.carbs}g C</span>
                              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 hidden sm:block" />
                              <span>{item.meal?.fat}g F</span>
                            </div>
                          </div>

                          {item.delivery && (
                            <div className="flex items-center gap-2 pt-2 text-[10px]">
                              <Truck className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="font-bold text-zinc-600 dark:text-zinc-400">
                                Rider: <span className="text-zinc-900 dark:text-white">{item.delivery.deliveryAgentName || "Assigned shortly"}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeCategoryFilter === 'upcoming' ? (
          /* UPCOMING MEALS SUB-VIEW */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Upcoming Meals</h2>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1">Scheduled & In-Preparation Deliveries</p>
              </div>
              <span className="px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl text-xs font-black uppercase tracking-widest">
                {categorizedSchedules.upcoming.length} Pending Meals
              </span>
            </div>

            {categorizedSchedules.upcoming.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] space-y-4">
                <Clock className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200">No Upcoming Meals Scheduled</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  <span className="hidden sm:inline">Click "Load Sample Schedule" above or </span>
                  Select dates on the calendar to activate upcoming deliveries.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedSchedules.upcoming.map((item) => (
                  <Card key={item.id} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col justify-between group hover:border-amber-500/30 transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {safeFormatISO(item.date, 'EEE, MMM d')}
                        </span>
                        <div className="flex items-center gap-2">
                          <AddCalendarButton
                            id={item.id}
                            dateStr={item.date}
                            mealType={item.mealType}
                            mealName={item.meal?.mealName || item.mealName || "Chef's Special"}
                            deliveryTimeStr={item.deliveryTime}
                            calories={item.meal?.calories}
                            protein={item.meal?.protein}
                            carbs={item.meal?.carbs}
                            fat={item.meal?.fat}
                            showLabel={false}
                            variant="ghost"
                          />
                          <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                            {item.mealType}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <OptimizedImage 
                          src={item.meal?.image} 
                          alt={item.meal?.mealName} 
                          className="w-20 h-20 rounded-2xl object-cover shrink-0" 
                          referrerPolicy="no-referrer" 
                          
                        />
                        <div>
                          <h4 className="text-base font-black text-zinc-900 dark:text-white leading-tight">{item.meal?.mealName}</h4>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{item.deliveryTime || "08:00 AM - 10:00 AM"}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs font-black text-emerald-600 dark:text-emerald-400">
                            <Flame className="w-3.5 h-3.5" />
                            {item.meal?.calories} cal • {item.meal?.protein}g protein
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-6 mt-6 border-t border-zinc-100 dark:border-white/5">
                      <Button
                        onClick={() => handleSkipSchedule(item.id)}
                        disabled={isProcessing}
                        variant="outline"
                        className="flex-1 text-[10px] font-black uppercase tracking-widest h-11 rounded-xl border-zinc-200 dark:border-zinc-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        Skip Meal
                      </Button>
                      <Button
                        onClick={() => { setSelectedDate(safeParseISO(item.date)); setActiveCategoryFilter('calendar'); }}
                        className="flex-1 text-[10px] font-black uppercase tracking-widest h-11 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                      >
                        View Date
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : activeCategoryFilter === 'delivered' ? (
          /* DELIVERED MEALS SUB-VIEW */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Delivered Meals</h2>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1">Completed Gourmet Deliveries Log</p>
              </div>
              <span className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-black uppercase tracking-widest">
                {categorizedSchedules.delivered.length} Meals Delivered
              </span>
            </div>

            {categorizedSchedules.delivered.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] space-y-4">
                <CheckCircle2 className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200">No Delivered Meals Yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">Delivered meals will appear here with nutritional verification logs.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedSchedules.delivered.map((item) => (
                  <Card key={item.id} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 dark:shadow-none space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {safeFormatISO(item.date, 'EEE, MMM d')}
                      </span>
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                        {item.mealType}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <OptimizedImage 
                        src={item.meal?.image} 
                        alt={item.meal?.mealName} 
                        className="w-20 h-20 rounded-2xl object-cover shrink-0" 
                        referrerPolicy="no-referrer" 
                        
                      />
                      <div>
                        <h4 className="text-base font-black text-zinc-900 dark:text-white leading-tight">{item.meal?.mealName}</h4>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Delivered @ {item.delivery?.actualTime || "08:22 AM"}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs font-black text-zinc-600 dark:text-zinc-300">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          {item.meal?.calories} cal • {item.meal?.protein}g protein
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-white/5 text-[10px] text-zinc-500 font-medium">
                      Rider: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.delivery?.deliveryAgentName || "Ramesh Sharma"}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : activeCategoryFilter === 'skipped' ? (
          /* SKIPPED MEALS SUB-VIEW */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Skipped Meals</h2>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1">Bypassed Meals Credited to Subscription Balance</p>
              </div>
              <span className="px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl text-xs font-black uppercase tracking-widest">
                {categorizedSchedules.skipped.length} Skipped
              </span>
            </div>

            {categorizedSchedules.skipped.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] space-y-4">
                <SkipForward className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200">No Skipped Meals</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">Skipped meals are credited back to your wallet or remaining subscription meal balance.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedSchedules.skipped.map((item) => (
                  <Card key={item.id} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 dark:shadow-none space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {safeFormatISO(item.date, 'EEE, MMM d')}
                      </span>
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                        {item.mealType}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <OptimizedImage 
                        src={item.meal?.image} 
                        alt={item.meal?.mealName} 
                        className="w-20 h-20 rounded-2xl object-cover shrink-0 grayscale opacity-60" 
                        referrerPolicy="no-referrer" 
                        
                      />
                      <div>
                        <h4 className="text-base font-black text-zinc-900 dark:text-white leading-tight">{item.meal?.mealName}</h4>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Meal Credited Back</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleRestoreSchedule(item.id)}
                      disabled={isProcessing}
                      className="w-full text-[10px] font-black uppercase tracking-widest h-11 rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Restore to Schedule
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : activeCategoryFilter === 'paused' ? (
          /* PAUSED DAYS SUB-VIEW */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Paused Days</h2>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1">Frozen Subscription Days & Extended Validity</p>
              </div>
              <span className="px-4 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-black uppercase tracking-widest">
                {categorizedSchedules.paused.length} Paused Meals
              </span>
            </div>

            {categorizedSchedules.paused.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] space-y-4">
                <PauseCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200">No Paused Days</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">Use the "Pause Deliveries" button on the calendar header to freeze upcoming delivery dates.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedSchedules.paused.map((item) => (
                  <Card key={item.id} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 dark:shadow-none space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <PauseCircle className="w-3 h-3" />
                        {safeFormatISO(item.date, 'EEE, MMM d')}
                      </span>
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                        {item.mealType}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <OptimizedImage 
                        src={item.meal?.image} 
                        alt={item.meal?.mealName} 
                        className="w-20 h-20 rounded-2xl object-cover shrink-0 saturate-50 opacity-70" 
                        referrerPolicy="no-referrer" 
                        
                      />
                      <div>
                        <h4 className="text-base font-black text-zinc-900 dark:text-white leading-tight">{item.meal?.mealName}</h4>
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1">Delivery Frozen</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleRestoreSchedule(item.id)}
                      disabled={isProcessing}
                      className="w-full text-[10px] font-black uppercase tracking-widest h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <PlayCircle className="w-4 h-4 mr-1.5" /> Resume Day
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Monthly Calendar View */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-4 sm:p-6 md:p-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-[40px] shadow-sm overflow-hidden">
                
                {/* Month Navigator */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                      {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-1">
                      Monthly Delivery Schedule
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-900">
                    <button
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      className="p-2.5 hover:bg-white dark:hover:bg-zinc-900 rounded-xl transition-all text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentMonth(new Date())}
                      className="px-3 py-1.5 text-xs font-black uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      className="p-2.5 hover:bg-white dark:hover:bg-zinc-900 rounded-xl transition-all text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid Color Labels */}
                <div className="flex flex-wrap items-center justify-start gap-4 mb-8 bg-zinc-50/50 dark:bg-zinc-950/30 p-4 rounded-2xl border border-zinc-100/50 dark:border-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Delivered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Paused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-zinc-950 dark:bg-white" />
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Holiday</span>
                  </div>
                </div>

                {/* Weekdays Row */}
                <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2 md:gap-3">
                  {calendarDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isCurrentMonth = format(day, 'yyyy-MM') === format(currentMonth, 'yyyy-MM');
                    const isSel = isSameDay(day, selectedDate);
                    const stats = dayStats[dateStr];

                    return (
                      <button
                        key={dateStr}
                        onClick={() => {
                          setSelectedDate(day);
                          triggerHaptic('light');
                        }}
                        className={cn(
                          "flex flex-col justify-between p-2 md:p-3 aspect-square rounded-[20px] md:rounded-[24px] border-2 transition-all cursor-pointer select-none group relative",
                          getDayColors(day),
                          !isCurrentMonth && "opacity-30",
                          isSel && "ring-4 ring-emerald-500/20 dark:ring-emerald-500/30 scale-95"
                        )}
                      >
                        {/* Day Number */}
                        <span className="text-sm md:text-base font-black">
                          {format(day, 'd')}
                        </span>

                        {/* Nutrition & Completion Percentage micro indicator */}
                        {stats && stats.mealsCount > 0 && !stats.isHoliday && !stats.isPaused && (
                          <div className="absolute top-2 right-2 flex items-center justify-center">
                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-1 rounded">
                              {Math.min(100, Math.round((stats.deliveredCount / stats.mealsCount) * 100))}%
                            </span>
                          </div>
                        )}

                        {/* Middle Icons Row (Breakfast, Lunch, Dinner icons) */}
                        <div className="flex items-center justify-center gap-1 my-1">
                          {stats && stats.mealsCount > 0 && !stats.isHoliday && (
                            <>
                              {schedules.some(s => s.date === dateStr && s.mealType === 'Breakfast') && (
                                <span className={cn(
                                  "text-[10px]", 
                                  stats.isPaused ? "text-rose-500" : stats.isDelivered ? "text-emerald-500" : "text-amber-500"
                                )}>🍳</span>
                              )}
                              {schedules.some(s => s.date === dateStr && s.mealType === 'Lunch') && (
                                <span className={cn(
                                  "text-[10px]", 
                                  stats.isPaused ? "text-rose-500" : stats.isDelivered ? "text-emerald-500" : "text-amber-500"
                                )}>🥗</span>
                              )}
                              {schedules.some(s => s.date === dateStr && s.mealType === 'Dinner') && (
                                <span className={cn(
                                  "text-[10px]", 
                                  stats.isPaused ? "text-rose-500" : stats.isDelivered ? "text-emerald-500" : "text-amber-500"
                                )}>🍽</span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Calorie Summary Bar */}
                        {stats && stats.mealsCount > 0 && !stats.isHoliday && !stats.isPaused ? (
                          <div className="w-full mt-1">
                            <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500" 
                                style={{ width: `${Math.min(100, (stats.calories / 2200) * 100)}%` }} 
                              />
                            </div>
                            <span className="text-[8px] font-bold text-zinc-400 block text-center mt-0.5">
                              {stats.calories} kcal
                            </span>
                          </div>
                        ) : stats?.isHoliday ? (
                          <span className="text-[8px] font-black uppercase text-zinc-600 tracking-wider text-center w-full block truncate">
                            Holiday
                          </span>
                        ) : stats?.isPaused ? (
                          <span className="text-[8px] font-black uppercase text-rose-500 tracking-wider text-center w-full block truncate">
                            Paused
                          </span>
                        ) : (
                          <span className="text-[8px] text-zinc-300 dark:text-zinc-700 block text-center truncate">
                            No Meals
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Delivery Logistics Timeline */}
              <Card className="p-4 sm:p-6 md:p-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-[40px] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                      Delivery Schedule Timeline
                    </h3>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                      Live Delivery Updates
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 space-y-1">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Today's Delivery Window</p>
                    <p className="text-base font-black text-zinc-900 dark:text-white">
                      {deliverySummary.todayTime}
                    </p>
                  </div>
                  <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 space-y-1">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Tomorrow's Delivery Window</p>
                    <p className="text-base font-black text-zinc-900 dark:text-white">
                      {deliverySummary.tomorrowTime}
                    </p>
                  </div>
                  <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 space-y-1">
                    <p className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Total Paused & Skipped Days</p>
                    <p className="text-base font-black text-rose-600 dark:text-rose-400">
                      {deliverySummary.pausedDays.length} Paused / {deliverySummary.skippedDays.length} Skipped
                    </p>
                  </div>
                </div>

                {/* Upcoming Deliveries list */}
                {deliverySummary.upcoming.length > 0 && (
                  <div className="mt-6 border-t border-zinc-100 dark:border-zinc-900 pt-6 space-y-4">
                    <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">
                      Upcoming Delivery Schedule
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {deliverySummary.upcoming.map((u) => (
                        <div key={u.id} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/20 space-y-1 relative">
                          <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                            {format(parseISO(u.date), 'EEEE, MMM d')}
                          </p>
                          <p className="text-xs font-black text-zinc-900 dark:text-white truncate">
                            {u.mealType}: {u.mealName}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-semibold">{u.deliveryTime}</p>
                          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Selected Date Details / Interactive Panel */}
            <div className="space-y-6">
              
              {/* Nutrition Status Ring Card */}
              <Card className="p-4 sm:p-6 md:p-8 bg-zinc-950 text-white rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
                
                <h3 className="text-xl font-black mb-6 flex items-center justify-between">
                  <span>Day Nutrition Summary</span>
                  <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                    {format(selectedDate, 'MMM d, yyyy')}
                  </span>
                </h3>

                <div className="flex items-center gap-6">
                  {/* Progress circle */}
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                      <path
                        className="text-zinc-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500"
                        strokeDasharray={`${dayStats[selectedDateStr]?.calories ? Math.min(100, Math.round((dayStats[selectedDateStr].calories / 2200) * 100)) : 0}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-lg font-black leading-none text-white">
                        {dayStats[selectedDateStr]?.calories ? Math.min(100, Math.round((dayStats[selectedDateStr].calories / 2200) * 100)) : 0}%
                      </p>
                      <p className="text-[8px] font-black uppercase text-zinc-500 tracking-wider mt-1">Cal Goal</p>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-bold text-zinc-400">Calories</span>
                      </div>
                      <span className="text-sm font-black text-white">
                        {dayStats[selectedDateStr]?.calories || 0} / 2200 kcal
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Dna className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-bold text-zinc-400">Protein</span>
                      </div>
                      <span className="text-sm font-black text-white">
                        {dayStats[selectedDateStr]?.protein || 0} / 140g
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold text-zinc-400">Carbs & Fat</span>
                      </div>
                      <span className="text-sm font-black text-white">
                        {dayStats[selectedDateStr]?.carbs || 0}g / {dayStats[selectedDateStr]?.fat || 0}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Water Target Tracker */}
                <div className="mt-8 border-t border-zinc-800 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-bold text-white">Water Target Hydrator</p>
                        <p className="text-[10px] text-zinc-500 font-semibold">Goal: 2.5 Liters</p>
                      </div>
                    </div>
                    <span className="text-base font-black text-blue-400">
                      {dayStats[selectedDateStr]?.waterCurrent || 0} / 2.5 L
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleIncrementWater}
                      variant="outline"
                      className="flex-1 rounded-xl border-zinc-800 text-white hover:bg-zinc-900 hover:text-white h-10 text-xs font-bold"
                    >
                      + 250ml Glass
                    </Button>
                    <Button
                      onClick={handleResetWater}
                      variant="outline"
                      className="p-2.5 rounded-xl border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-rose-400 h-10 w-10"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Day's Meal details card */}
              <Card className="p-4 sm:p-6 md:p-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-[40px] shadow-sm space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                      Selected Day Meals
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                      {format(selectedDate, 'EEEE, MMMM dd')}
                    </p>
                  </div>

                  {dayStats[selectedDateStr]?.isPaused ? (
                    <Button
                      onClick={handleResumeSubscription}
                      className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9 px-3 text-xs border-0"
                    >
                      <PlayCircle className="h-4 w-4 mr-1.5" />
                      Resume Day
                    </Button>
                  ) : dayStats[selectedDateStr]?.mealsCount > 0 ? (
                    <Button
                      onClick={() => {
                        setPauseMode("single");
                        setShowPauseModal(true);
                      }}
                      variant="outline"
                      className="rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 h-9 px-3 text-xs font-bold"
                    >
                      <PauseCircle className="h-4 w-4 mr-1.5" />
                      Pause Day
                    </Button>
                  ) : null}
                </div>

                {/* Meals detailed list */}
                {selectedDaySchedules.length === 0 ? (
                  <div className="p-10 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-2">
                    <Utensils className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Meals Scheduled</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      There are no gourmet plans mapped to this date. Click Seed Demo to test!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedDaySchedules.map((item) => (
                      <div 
                        key={item.id} 
                        className={cn(
                          "space-y-3 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950/20 relative",
                          (item.deliveryStatus as string) === 'paused' && "opacity-60 saturate-50"
                        )}
                      >
                        <div className="flex gap-4">
                          <OptimizedImage 
                            src={item.meal?.image} 
                            alt={item.meal?.mealName} 
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-2xl object-cover border border-zinc-100 dark:border-zinc-900 bg-zinc-100 shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full dark:text-emerald-400 dark:bg-emerald-500/20">
                                {item.mealType}
                              </span>
                              <span className={cn(
                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                                item.deliveryStatus === 'delivered' ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20" :
                                (item.deliveryStatus as string) === 'paused' ? "text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/20" :
                                "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20"
                              )}>
                                {item.deliveryStatus}
                              </span>
                              <div className="ml-auto">
                                <AddCalendarButton
                                  id={item.id}
                                  dateStr={item.date}
                                  mealType={item.mealType}
                                  mealName={item.meal?.mealName || item.mealName || "Chef's Special"}
                                  deliveryTimeStr={item.deliveryTime}
                                  calories={item.meal?.calories}
                                  protein={item.meal?.protein}
                                  carbs={item.meal?.carbs}
                                  fat={item.meal?.fat}
                                  showLabel={false}
                                  variant="ghost"
                                />
                              </div>
                            </div>
                            <h4 className="text-sm font-black text-zinc-900 dark:text-white truncate">
                              {item.meal?.mealName}
                            </h4>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                              {item.meal?.category || "Healthy Meal"}
                            </p>
                          </div>
                        </div>

                        {/* Ingredients */}
                        {item.meal?.ingredients && (
                          <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
                            <span className="text-zinc-400 uppercase tracking-widest block text-[8px] mb-0.5">Ingredients:</span>
                            {item.meal.ingredients.join(', ')}
                          </p>
                        )}

                        {/* Chef Notes */}
                        {item.meal?.chefNotes && (
                          <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                            <p className="text-[9px] text-amber-700 dark:text-amber-400 font-semibold italic">
                              " {item.meal.chefNotes} "
                            </p>
                          </div>
                        )}

                        {/* Macro details */}
                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-center">
                          <div>
                            <p className="text-xs font-black text-zinc-900 dark:text-white">{item.meal?.calories} cal</p>
                            <p className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Energy</p>
                          </div>
                          <div>
                            <p className="text-xs font-black text-zinc-900 dark:text-white">{item.meal?.protein}g</p>
                            <p className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Protein</p>
                          </div>
                          <div>
                            <p className="text-xs font-black text-zinc-900 dark:text-white">{item.meal?.carbs}g</p>
                            <p className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Carbs</p>
                          </div>
                          <div>
                            <p className="text-xs font-black text-zinc-900 dark:text-white">{item.meal?.fat}g</p>
                            <p className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Fat</p>
                          </div>
                        </div>

                        {/* Delivery Agent Details */}
                        {item.delivery && (
                          <div className="mt-2 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-emerald-500" />
                              <span className="font-bold text-zinc-600 dark:text-zinc-400">
                                Rider: {item.delivery.deliveryAgentName || "Assigned shortly"}
                              </span>
                            </div>
                            <span className="text-zinc-400 font-bold">
                              ETA: {item.delivery.estimatedTime || item.deliveryTime || "TBD"}
                            </span>
                          </div>
                        )}

                        {/* Quick Action Controls for Single Meal */}
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                          {item.deliveryStatus === 'pending' || item.deliveryStatus === 'scheduled' ? (
                            <>
                              <Button
                                onClick={() => handleToggleSingleMeal(item.id, item.date, item.mealType, 'skipped')}
                                disabled={isProcessing}
                                variant="outline"
                                className="flex-1 h-8 text-[10px] font-bold rounded-xl border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                              >
                                <SkipForward className="h-3 w-3 mr-1" />
                                Skip
                              </Button>
                              <Button
                                onClick={() => handleToggleSingleMeal(item.id, item.date, item.mealType, 'paused')}
                                disabled={isProcessing}
                                variant="outline"
                                className="flex-1 h-8 text-[10px] font-bold rounded-xl border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              >
                                <PauseCircle className="h-3 w-3 mr-1" />
                                Pause
                              </Button>
                              <Button
                                onClick={() => handleToggleSingleMeal(item.id, item.date, item.mealType, 'delivered')}
                                disabled={isProcessing}
                                className="flex-1 h-8 text-[10px] font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Deliver
                              </Button>
                            </>
                          ) : item.deliveryStatus === 'skipped' || item.deliveryStatus === 'paused' ? (
                            <Button
                              onClick={() => handleToggleSingleMeal(item.id, item.date, item.mealType, 'pending')}
                              disabled={isProcessing}
                              className="w-full h-8 text-[10px] font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                            >
                              <PlayCircle className="h-3 w-3 mr-1" />
                              Resume Meal
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Completed Delivery
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Pause Modal via BottomSheet */}
      <BottomSheet 
        isOpen={showPauseModal} 
        onClose={() => setShowPauseModal(false)}
        title="Pause Subscription"
      >
        <div className="space-y-6">
          {/* Smart Pause AI Suggestion Banner */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs">
              <span className="font-black text-emerald-800 dark:text-emerald-300 block mb-0.5 uppercase tracking-wider text-[10px]">
                Smart Pause AI Recommendation
              </span>
              <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                Resumes delivery on <strong>Monday, {format(addDays(new Date(), 3), "MMM d")}</strong> (Matches your typical weekend getaway travel pattern with 100% credit rollover).
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-500 font-medium">
            Freeze dietary sequence duration. Meals scheduled for paused days will be credited back to your balance.
          </p>

          {/* Selector buttons */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl">
            <button
              onClick={() => setPauseMode("single")}
              className={cn(
                "py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
                pauseMode === "single" 
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow" 
                  : "text-zinc-500"
              )}
            >
              Selected Date
            </button>
            <button
              onClick={() => setPauseMode("range")}
              className={cn(
                "py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
                pauseMode === "range" 
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow" 
                  : "text-zinc-500"
              )}
            >
              Date Range
            </button>
            <button
              onClick={() => setPauseMode("weekend")}
              className={cn(
                "py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
                pauseMode === "weekend" 
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow" 
                  : "text-zinc-500"
              )}
            >
              Weekends
            </button>
          </div>

          {/* Explanatory Contexts */}
          {pauseMode === "single" && (
            <div className="space-y-2 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-xs text-rose-700 dark:text-rose-400">
              <div className="flex gap-2 items-start">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Pause Date: {format(selectedDate, 'EEEE, MMMM dd')}</p>
                  <p className="mt-1">
                    All meals scheduled for this day will be frozen, and they will be credited back to your subscription balance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {pauseMode === "range" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Start Date</label>
                  <input 
                    type="date" 
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={pauseStartDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setPauseStartDate(newStart);
                      if (!pauseEndDate || new Date(pauseEndDate) < new Date(newStart)) {
                        setPauseEndDate(newStart);
                      }
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-2.5 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">End Date</label>
                  <input 
                    type="date" 
                    min={pauseStartDate || format(new Date(), 'yyyy-MM-dd')}
                    value={pauseEndDate}
                    onChange={(e) => setPauseEndDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-2.5 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Schedules within this range will be paused, extending your subscription period.
              </p>
            </div>
          )}

          {pauseMode === "weekend" && (
            <div className="space-y-2 p-4 bg-zinc-500/5 border border-zinc-500/10 rounded-2xl text-xs text-zinc-700 dark:text-zinc-400">
              <div className="flex gap-2 items-start">
                <CalendarDays className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Pause All Weekend Days</p>
                  <p className="mt-1">
                    This automatically freezes all upcoming Saturdays and Sundays within your active subscription timeline.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setShowPauseModal(false)}
              variant="outline"
              className="flex-1 rounded-2xl font-bold h-12 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPauseProtocol}
              disabled={isProcessing}
              className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20 hover:shadow-xl font-bold h-12 text-sm border-0"
            >
              {isProcessing ? "Processing..." : "Confirm Pause"}
            </Button>
          </div>
        </div>
      </BottomSheet>
      </PageTransition>
    </DashboardLayout>
  );
}
