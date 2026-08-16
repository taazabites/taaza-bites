import { useEffect, useState, useMemo } from "react";
import OptimizedImage from "../components/common/OptimizedImage";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coffee, 
  Salad, 
  Moon, 
  Zap, 
  PauseCircle, 
  PlayCircle, 
  Snowflake,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  SkipForward,
  Star,
  Info,
  Clock,
  MapPin,
  Utensils,
  Flame,
  Activity,
  Leaf,
  Sparkles,
  Award,
  ThumbsUp,
  AlertCircle,
  CheckCircle2,
  Heart,
  Plus,
  RefreshCw,
  Eye,
  Camera,
  X,
  Phone
} from "lucide-react";
import { StarRating } from "../components/meals/StarRating";
import { Button, Card } from "../components/ui/primitives";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { db } from '../firebase/db';
import { 
  doc, 
  onSnapshot,
  getDoc,
  getDocs,
  query, 
  where, 
  collection, 
  updateDoc, 
  setDoc,
  addDoc,
  serverTimestamp, 
  Timestamp 
} from "firebase/firestore";
import { Skeleton } from "../components/ui/Skeleton";
import { MealsTimelineSkeleton } from "../components/common/SkeletonLibrary";
import { LoadingState, EmptyState } from "../components/ui/StateRegistry";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PageHeader } from "../components/dashboard/PageHeader";
import { PageTransition } from "../components/dashboard/PageTransition";
import { AddCalendarButton } from "../components/common/AddCalendarButton";
import { cn } from "../lib/utils";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import { plansCache } from "../lib/plans-cache";
import AddOnModal from "../components/meals/AddOnModal";

// Standard TypeScript Interfaces matching firestore collections.ts
export interface MealItem {
  id: string;
  name: string;
  type: "Breakfast" | "Lunch" | "Dinner" | "Snacks";
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionSize: string;
  image: string;
  chefNotes?: string;
  ingredients?: string[];
  deliveryStatus?: "Preparing" | "Ready" | "Out for Delivery" | "Delivered";
  deliveryTime?: string;
}

export default function MealsPage() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Selected calendar date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weeklyStartDate, setWeeklyStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Main real-time database state variables
  const [loading, setLoading] = useState(true);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  
  // Daily meals loaded from subcollection A or top-level collection B
  const [dailyMealsA, setDailyMealsA] = useState<MealItem[]>([]);
  const [dailyMealsB, setDailyMealsB] = useState<MealItem[]>([]);
  
  // Real-time deliveries lists
  const [deliveriesList, setDeliveriesList] = useState<any[]>([]);

  // Local helper states
  const [isSeeding, setIsSeeding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal active targets
  const [selectedNutritionMeal, setSelectedNutritionMeal] = useState<MealItem | null>(null);
  const [ratingMeal, setRatingMeal] = useState<MealItem | null>(null);
  const [reportingMeal, setReportingMeal] = useState<MealItem | null>(null);

  // Form states for modals
  const [ratingTaste, setRatingTaste] = useState(5);
  const [ratingPortion, setRatingPortion] = useState(5);
  const [ratingFreshness, setRatingFreshness] = useState(5);
  const [ratingComments, setRatingComments] = useState("");
  
  const [issueCategory, setIssueCategory] = useState("quality");
  const [issueDescription, setIssueDescription] = useState("");

  // Customer Add-on Modal states
  const [isAddOnModalOpen, setIsAddOnModalOpen] = useState(false);
  const [addOnTargetDate, setAddOnTargetDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [addOnTargetSlot, setAddOnTargetSlot] = useState<"Breakfast" | "Lunch" | "Snacks" | "Dinner">("Dinner");

  // Local modifications to the meals of the day (e.g. custom ingredients, portion sizes, swapped dishes, or boosters)
  const [localMealsOverride, setLocalMealsOverride] = useState<Record<string, Partial<MealItem>>>({});
  
  // Mobile view mode: "list" (timeline list) or "plating" (out-of-the-box Plating Studio)
  const [mobileViewMode, setMobileViewMode] = useState<"list" | "plating">("plating");
  
  // Currently active meal course in the mobile Plating Studio (e.g. index inside todayMeals)
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);

  // Dark theme state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('dashboard_theme') === 'dark';
    }
    return false;
  });

  // Haptic Feedback switch
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const durations = { light: 15, medium: 30, heavy: 50 };
      navigator.vibrate(durations[type]);
    }
  };

  // Real-time Theme Observer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // --- Real-time Firestore Sync Engine (onSnapshot) ---
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    // --- Batch Fetch Static/Semi-static Data ---
    const fetchStaticMealsData = async () => {
      try {
        const subQ = query(
          collection(db, 'subscriptions'),
          where('userId', '==', currentUser.uid)
        );
        const dailyMealsDocRef = doc(db, 'users', currentUser.uid, 'dailyMeals', dateStr);
        const dailyMealsBQ = query(
          collection(db, 'dailyMeals'),
          where('userId', '==', currentUser.uid)
        );
        const deliveriesQ = query(
          collection(db, 'deliveries'),
          where('userId', '==', currentUser.uid)
        );

        const results = await Promise.allSettled([
          getDoc(doc(db, 'users', currentUser.uid)),
          getDocs(subQ),
          getDocs(collection(db, 'mealPlans')),
          getDoc(dailyMealsDocRef),
          getDocs(dailyMealsBQ),
          getDocs(deliveriesQ)
        ]);

        const userSnapRes = results[0];
        if (userSnapRes.status === 'fulfilled' && userSnapRes.value.exists()) {
          setUserDoc(userSnapRes.value.data());
        }

        const subSnapRes = results[1];
        if (subSnapRes.status === 'fulfilled' && !subSnapRes.value.empty) {
          const subsList = subSnapRes.value.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const currentSub = subsList.find((s: any) => s.status === 'active') || 
                             subsList.find((s: any) => s.status === 'paused') || 
                             subsList[0];
          setSubscription(currentSub);
        } else {
          setSubscription(null);
        }

        const mealPlansSnapRes = results[2];
        if (mealPlansSnapRes.status === 'fulfilled') {
          setMealPlans(mealPlansSnapRes.value.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

        const dailyARes = results[3];
        if (dailyARes.status === 'fulfilled' && dailyARes.value.exists() && dailyARes.value.data()?.meals) {
          setDailyMealsA(dailyARes.value.data().meals);
        } else {
          setDailyMealsA([]);
        }

        const dailyBRes = results[4];
        if (dailyBRes.status === 'fulfilled' && !dailyBRes.value.empty) {
          const matchedDoc = dailyBRes.value.docs.find(d => d.data()?.date === dateStr);
          if (matchedDoc && matchedDoc.data()?.meals) {
            setDailyMealsB(matchedDoc.data().meals);
          } else {
            setDailyMealsB([]);
          }
        } else {
          setDailyMealsB([]);
        }

        const deliveriesSnapRes = results[5];
        if (deliveriesSnapRes.status === 'fulfilled') {
          setDeliveriesList(deliveriesSnapRes.value.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
        
      } catch (err) {
        console.error("Meals page data fetch issue:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaticMealsData();

    // 3. Sync subscriptionPlans collections in real-time (Cached)
    const unsubSubPlans = plansCache.subscribe(`meals_page_${currentUser.uid}`, (allPlans) => {
      setSubscriptionPlans(allPlans);
    });

    return () => {
      unsubSubPlans();
    };
  }, [currentUser, selectedDate]);

  // --- Dynamic Merged Computations & Derived States ---
  const activePlan = useMemo(() => {
    if (!subscription) return null;
    const planId = subscription.planId;
    return mealPlans.find(p => p.id === planId) || 
           subscriptionPlans.find(p => p.id === planId) || 
           null;
  }, [subscription, mealPlans, subscriptionPlans]);

  // Merge loaded daily meals and resolve statuses against the deliveries collection
  const todayMeals = useMemo(() => {
    const list = dailyMealsA.length > 0 ? dailyMealsA : dailyMealsB;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    return list.map((meal: MealItem) => {
      // Look for a corresponding delivery document
      const delivery = deliveriesList.find(d => {
        const sameMeal =
          d.mealId === meal.id ||
          String(d.mealType || "").toLowerCase() === String(meal.type || "").toLowerCase();
        const sameDay = d.date === dateStr || d.deliveryDate === dateStr;
        return sameMeal && sameDay;
      }) || deliveriesList.find(d => d.date === dateStr || d.deliveryDate === dateStr);

      const override = localMealsOverride[meal.id] || localMealsOverride[meal.type] || {};

      return {
        ...meal,
        ...override,
        deliveryStatus: (delivery?.status || delivery?.deliveryStatus || override.deliveryStatus || meal.deliveryStatus || 'Preparing') as "Preparing" | "Ready" | "Out for Delivery" | "Delivered",
        deliveryTime: delivery?.estimatedTime || override.deliveryTime || meal.deliveryTime || 'TBD',
        deliveryAgentName: delivery?.deliveryAgentName || null,
        deliveryAgentPhone: delivery?.deliveryAgentPhone || null
      };
    });
  }, [dailyMealsA, dailyMealsB, deliveriesList, selectedDate, localMealsOverride]);

  // Calculate realtime meal totals for today
  const nutritionTotals = useMemo(() => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    todayMeals.forEach(meal => {
      totals.calories += Number(meal.calories || 0);
      totals.protein += Number(meal.protein || 0);
      totals.carbs += Number(meal.carbs || 0);
      totals.fat += Number(meal.fat || 0);
    });
    return totals;
  }, [todayMeals]);

  // Target values derived from active protocol (or fallback defaults if unassigned)
  const targets = useMemo(() => {
    return {
      calories: subscription?.caloriesTarget || activePlan?.calories || 2200,
      protein: activePlan?.protein || 140,
      carbs: activePlan?.carbs || 240,
      fat: activePlan?.fat || 75
    };
  }, [subscription, activePlan]);

  // Percentage calculations
  const percentages = useMemo(() => {
    return {
      calories: targets.calories > 0 ? Math.min(100, Math.round((nutritionTotals.calories / targets.calories) * 100)) : 0,
      protein: targets.protein > 0 ? Math.min(100, Math.round((nutritionTotals.protein / targets.protein) * 100)) : 0,
      carbs: targets.carbs > 0 ? Math.min(100, Math.round((nutritionTotals.carbs / targets.carbs) * 100)) : 0,
      fat: targets.fat > 0 ? Math.min(100, Math.round((nutritionTotals.fat / targets.fat) * 100)) : 0
    };
  }, [nutritionTotals, targets]);

  // --- Real-Time DB Modification Protocols (Actions) ---
  
  // Auto-seeds sample metabolic entries directly inside Firestore collections
  const handleAutoSeedDatabase = async () => {
    if (!currentUser) return;
    setIsSeeding(true);
    triggerHaptic('heavy');
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      // A. Create/Seed a beautiful metabolic plan inside mealPlans
      const planId = "premium-metabolic-elite";
      const planRef = doc(db, 'mealPlans', planId);
      await setDoc(planRef, {
        id: planId,
        name: "TaazaBites Metabolic Elite",
        description: "Premium high-protein dietary cycle supporting recovery, sustained athletic energy levels, and brain focus.",
        price: 9499,
        offerPrice: 7999,
        durationDays: 30,
        mealsPerDay: 4,
        totalMeals: 120,
        calories: 2200,
        protein: 150,
        carbs: 210,
        fat: 80,
        dietType: "Veg",
        goal: "Athletic Energy & Cognitive Recovery",
        features: ["Calibrated Macronutrients", "Insulated Delivery Pods", "Personal Dietitian Support"],
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fm=webp&w=600",
        active: true,
        createdAt: serverTimestamp()
      }, { merge: true });

      // B. Create/Seed active customer subscription linked to user
      const subId = `sub_${currentUser.uid}`;
      await setDoc(doc(db, 'subscriptions', subId), {
        id: subId,
        userId: currentUser.uid,
        planId: planId,
        planName: "TaazaBites Metabolic Elite",
        caloriesTarget: 2200,
        status: "active",
        startDate: Timestamp.now(),
        endDate: Timestamp.fromDate(addDays(new Date(), 30)),
        remainingMeals: 84,
        paused: false,
        pauseHistory: [],
        paymentId: "pay_demometa_12345",
        deliveryTime: "12:00 PM - 01:30 PM",
        mealsPerDay: 4,
        healthAssessmentCompleted: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // C. Create/Seed dailyMeals entries inside user subcollection
      const dailyMealsRef = doc(db, 'users', currentUser.uid, 'dailyMeals', dateStr);
      await setDoc(dailyMealsRef, {
        date: dateStr,
        userId: currentUser.uid,
        updatedAt: serverTimestamp(),
        meals: [
          {
            id: `seed_breakfast_${currentUser.uid}`,
            name: "Avocado Sourdough & Herbed Tofu Scramble",
            type: "Breakfast",
            category: "Keto Friendly",
            calories: 540,
            protein: 24,
            carbs: 45,
            fat: 26,
            portionSize: "Standard (320g)",
            image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fm=webp&fit=crop&q=80&w=600",
            chefNotes: "Drizzled with natural cold-pressed sesame oil and garnished with raw alfalfa sprouts.",
            ingredients: ["Fresh Haas Avocado", "Whole Wheat Sourdough", "Natural Silken Tofu", "Microgreens", "Pumpkin Seeds"]
          },
          {
            id: `seed_lunch_${currentUser.uid}`,
            name: "Protein-Loaded Quinoa Harvest Salad Bowl",
            type: "Lunch",
            category: "High Protein",
            calories: 710,
            protein: 38,
            carbs: 65,
            fat: 22,
            portionSize: "Athletic XL (480g)",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fm=webp&fit=crop&q=80&w=600",
            chefNotes: "Crafted on a base of high-protein black quinoa, alongside tender edamame and direct kitchen-pressed vinaigrette.",
            ingredients: ["Black Quinoa", "Direct Edamame", "English Cucumber", "Tri-Color Bell Peppers", "Shredded Carrots", "Balsamic Vinaigrette"]
          },
          {
            id: `seed_snacks_${currentUser.uid}`,
            name: "Antioxidant Greek Yogurt & Wild Berry Parfait",
            type: "Snacks",
            category: "Probiotic Boost",
            calories: 270,
            protein: 22,
            carbs: 28,
            fat: 6,
            portionSize: "Snack Cup (240g)",
            image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fm=webp&fit=crop&q=80&w=600",
            chefNotes: "Fermented A2 Greek Yogurt infused with pure natural vanilla bean extract and topped with premium wild blueberries.",
            ingredients: ["A2 Probiotic Greek Yogurt", "Fresh Wild Blueberries", "Raspberries", "Chia Seeds", "Zero-Glycemic Stevia"]
          },
          {
            id: `seed_dinner_${currentUser.uid}`,
            name: "Almond-Crusted Mushroom Broccoli Bake",
            type: "Dinner",
            category: "Low Carb",
            calories: 630,
            protein: 30,
            carbs: 22,
            fat: 40,
            portionSize: "Standard (380g)",
            image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fm=webp&fit=crop&q=80&w=600",
            chefNotes: "Highly digestible evening protocol layered with almond flour crumbles and premium shiitake mushroom caps.",
            ingredients: ["Shiitake", "Broccoli Crowns", "Almond Flour Crumbles", "Nutritional Yeast", "Cold-pressed Olive Oil"]
          }
        ]
      }, { merge: true });

      // D. Seed live delivery tracking info inside 'deliveries' collection
      await setDoc(doc(db, 'deliveries', `del_${currentUser.uid}_breakfast`), {
        id: `del_${currentUser.uid}_breakfast`,
        userId: currentUser.uid,
        mealId: `seed_breakfast_${currentUser.uid}`,
        mealType: "Breakfast",
        date: dateStr,
        status: "Delivered",
        estimatedTime: "08:15 AM",
        deliveryAgentName: "Sanjay Kumar",
        deliveryAgentPhone: "+91 98765 01234",
        updatedAt: serverTimestamp()
      }, { merge: true });

      await setDoc(doc(db, 'deliveries', `del_${currentUser.uid}_lunch`), {
        id: `del_${currentUser.uid}_lunch`,
        userId: currentUser.uid,
        mealId: `seed_lunch_${currentUser.uid}`,
        mealType: "Lunch",
        date: dateStr,
        status: "Delivered",
        estimatedTime: "12:45 PM",
        deliveryAgentName: "Sanjay Kumar",
        deliveryAgentPhone: "+91 98765 01234",
        updatedAt: serverTimestamp()
      }, { merge: true });

      await setDoc(doc(db, 'deliveries', `del_${currentUser.uid}_snacks`), {
        id: `del_${currentUser.uid}_snacks`,
        userId: currentUser.uid,
        mealId: `seed_snacks_${currentUser.uid}`,
        mealType: "Snacks",
        date: dateStr,
        status: "Ready",
        estimatedTime: "04:30 PM",
        deliveryAgentName: "Vikas Singh",
        deliveryAgentPhone: "+91 91234 56789",
        updatedAt: serverTimestamp()
      }, { merge: true });

      await setDoc(doc(db, 'deliveries', `del_${currentUser.uid}_dinner`), {
        id: `del_${currentUser.uid}_dinner`,
        userId: currentUser.uid,
        mealId: `seed_dinner_${currentUser.uid}`,
        mealType: "Dinner",
        date: dateStr,
        status: "Out for Delivery",
        estimatedTime: "07:35 PM",
        deliveryAgentName: "Rahul Dev",
        deliveryAgentPhone: "+91 88776 55443",
        updatedAt: serverTimestamp()
      }, { merge: true });

      showToast("Premium molecular protocol database entries seeded successfully!", "success");
    } catch (err: any) {
      console.error("Seeding failed:", err);
      showToast("Error establishing metabolic demo records.", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  // Submit Meal Review directly to `mealReviews` collection in Firestore
  const handleRateMealSubmit = async () => {
    if (!currentUser || !ratingMeal) return;
    setIsProcessing(true);
    triggerHaptic('medium');

    try {
      const reviewData = {
        userId: currentUser.uid,
        mealId: ratingMeal.id,
        mealName: ratingMeal.name,
        subscriptionId: subscription?.id || "direct_review",
        overallRating: Math.round((ratingTaste + ratingPortion + ratingFreshness) / 3),
        ratings: {
          taste: ratingTaste,
          portionSize: ratingPortion,
          freshness: ratingFreshness,
          packaging: 5,
          delivery: 5
        },
        comments: ratingComments || "Delicious and perfectly calibrated!",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'mealReviews'), reviewData);
      showToast("Metabolic culinary feedback captured. Thank you!", "success");
      setRatingMeal(null);
      setRatingComments("");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to lock review.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Create real ticket inside `supportTickets` collection in Firestore
  const handleReportIssueSubmit = async () => {
    if (!currentUser || !reportingMeal) return;
    if (!issueDescription.trim()) {
      showToast("Please elaborate on the delivery discrepancy.", "error");
      return;
    }
    setIsProcessing(true);
    triggerHaptic('heavy');

    try {
      const ticketId = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
      const supportTicket = {
        ticketId,
        userId: currentUser.uid,
        subject: `Discrepancy with: ${reportingMeal.name} (${reportingMeal.type})`,
        category: issueCategory,
        priority: "high",
        status: "open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messages: [
          {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || "Active Member",
            senderRole: "customer",
            message: `Discrepancy reported during today's meal sequence. Category: ${issueCategory}. Description: ${issueDescription}`,
            createdAt: Timestamp.now()
          }
        ]
      };

      await addDoc(collection(db, 'supportTickets'), supportTicket);
      showToast(`Support node opened! Ticket: ${ticketId}. Our logistics team is onto it.`, "success");
      setReportingMeal(null);
      setIssueDescription("");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to route issue report.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Repeat Meal Action: Schedule meal duplicate exactly 7 days from now
  const handleRepeatMealSequence = async (meal: MealItem) => {
    if (!currentUser) return;
    setIsProcessing(true);
    triggerHaptic('medium');
    const futureDate = format(addDays(selectedDate, 7), 'yyyy-MM-dd');

    try {
      const futureScheduleRef = doc(db, 'users', currentUser.uid, 'dailyMeals', futureDate);
      
      // Let's copy this meal as part of a custom plan schedule for the future date
      await setDoc(futureScheduleRef, {
        date: futureDate,
        userId: currentUser.uid,
        updatedAt: serverTimestamp(),
        meals: [
          {
            ...meal,
            id: `repeated_${meal.id}_${Date.now()}`,
            deliveryStatus: 'Preparing',
            deliveryTime: 'TBD'
          }
        ]
      }, { merge: true });

      showToast(`Success! Meal cloned and scheduled again for next cycle on ${format(addDays(selectedDate, 7), 'EEEE, MMM do')}.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast("Failed to register repeated protocol.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Get modern icons associated with meal schedules
  const getMealCategoryIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'breakfast': return <Coffee className="h-5 w-5 text-emerald-500" />;
      case 'lunch': return <Salad className="h-5 w-5 text-orange-500" />;
      case 'dinner': return <Moon className="h-5 w-5 text-indigo-500" />;
      default: return <Utensils className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Modern animated loading skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <MealsTimelineSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <div className={cn(
          "space-y-8 transition-colors duration-500",
          isDark ? "text-zinc-100" : "text-zinc-900"
        )}>

          {/* Dashboard Title Header */}
        <div className="hidden md:block">
          <PageHeader 
            title="Daily Timeline"
            description="Live updates of molecular calories, preparation logs, and real-time biometric synchronization for your nutritional architecture."
            descriptionClassName="hidden md:block"
            badge="Kitchen Status"
            icon={Utensils}
            gradient="from-emerald-950 via-zinc-900 to-emerald-950"
          >
            {subscription && (
              <div className="hidden md:flex bg-white/5 backdrop-blur-md border border-white/10 p-4 px-6 rounded-3xl items-center gap-4 group/stats">
                <div className="p-2 bg-emerald-500/20 rounded-xl group-hover/stats:scale-110 transition-transform">
                  <Activity className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Protocol Tier</p>
                  <p className="text-xl font-black text-white">
                    {activePlan?.name || subscription.planName}
                  </p>
                </div>
              </div>
            )}
          </PageHeader>
        </div>

        {/* Premium Inline Glassmorphic Weekly Calendar Bar */}
        <Card className={cn(
          "p-6 rounded-[2.5rem] border backdrop-blur-xl shadow-xs",
          isDark ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-150"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Metabolic Forecast Timeline</h3>
            <div className="flex gap-1">
              <button 
                id="btn-prev-week"
                onClick={() => { triggerHaptic('light'); setWeeklyStartDate(addDays(weeklyStartDate, -7)); }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-zinc-400" />
              </button>
              <button 
                id="btn-next-week"
                onClick={() => { triggerHaptic('light'); setWeeklyStartDate(addDays(weeklyStartDate, 7)); }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
          </div>
          
          <div className="flex overflow-x-auto snap-x hide-scrollbar gap-2 sm:gap-4 pb-2 -mx-2 px-2 sm:grid sm:grid-cols-7 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
            {Array.from({ length: 7 }).map((_, i) => {
              const day = addDays(weeklyStartDate, i);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <button
                  id={`calendar-day-${i}`}
                  key={day.toString()}
                  onClick={() => { triggerHaptic('light'); setSelectedDate(day); }}
                  className={cn(
                    "flex-shrink-0 w-[4rem] sm:w-auto flex flex-col items-center py-4 rounded-2xl border-2 transition-all hover:scale-[1.03] snap-center group",
                    isSelected 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/20" 
                      : isDark 
                        ? "bg-zinc-900/50 border-white/5 hover:border-zinc-800 text-zinc-400"
                        : "bg-zinc-50 border-zinc-100 hover:border-zinc-200 text-zinc-600"
                  )}
                >
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest mb-1.5",
                    isSelected ? "text-emerald-100" : "text-zinc-400"
                  )}>
                    {format(day, 'EEE')}
                  </span>
                  <span className="text-base sm:text-lg font-black tracking-tight">{format(day, 'd')}</span>
                  {isToday && !isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Fresh Add-ons Banner Card */}
        <Card className={cn(
          "p-4 sm:p-5 rounded-[2rem] border bg-gradient-to-r from-emerald-950/90 via-teal-950/70 to-zinc-950 border-emerald-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white relative overflow-hidden group"
        )}>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />

          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[9px] uppercase tracking-widest border border-emerald-500/30">
                  Custom Add-ons
                </span>
                <h4 className="font-black text-sm text-white">Cold-Pressed Juices, Smoothies & Oats Bowls</h4>
              </div>
              <p className="text-xs text-zinc-300 font-medium mt-0.5">
                Need an add-on for a specific meal? Schedule cold-pressed green juice, protein smoothies or oats for today's dinner, tomorrow's lunch, or any slot!
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              triggerHaptic('light');
              setAddOnTargetDate(format(selectedDate, 'yyyy-MM-dd'));
              setAddOnTargetSlot("Dinner");
              setIsAddOnModalOpen(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest h-11 px-5 rounded-xl shrink-0 flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer z-10 hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" /> Order Add-on
          </Button>
        </Card>

        {/* Core Layout Conditional Display */}
        {!subscription ? (
          <EmptyState
            title="No Active Subscription"
            description="Activate a premium molecular calorie protocol to unlock meal timeline tracking, live rider telemetry, and nutritional reviews."
            actionLabel="Browse Subscription Plans"
            onAction={() => navigate("/plans")}
          />
        ) : todayMeals.length === 0 ? (
          <EmptyState
            title="No Meals Assigned"
            description="Our kitchens prepare fresh boxes according to your customized weekly goals. You can easily select from our premium metabolic menu."
            actionLabel="Explore Menu"
            onAction={() => navigate("/plans")}
            type="search"
          />
        ) : (
          
          /* Dashboard Main Content (Requirement 1 to 5) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Column 1 & 2: Today's Timeline and Meal Feed */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Daily Header with Info Badge */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight">
                  {format(selectedDate, 'EEEE, MMM do')} Timeline
                </h2>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  <Sparkles className="h-3.5 w-3.5" /> High-Fidelity Sync Active
                </div>
              </div>

              {/* Mobile View Mode Selector (lg:hidden) */}
              <div className="flex lg:hidden flex-col gap-3 p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-white/5 rounded-[2rem]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Dishing Interface Engine</h3>
                    <p className="text-[10px] text-zinc-500 font-bold">Experience next-generation tactile molecular meal curation.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[8px] font-black uppercase tracking-widest animate-pulse shrink-0">
                    Featured
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl">
                  <button
                    id="toggle-view-plating"
                    onClick={() => { triggerHaptic('light'); setMobileViewMode('plating'); }}
                    className={cn(
                      "py-2 px-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5",
                      mobileViewMode === 'plating' 
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25" 
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Plating Studio
                  </button>
                  <button
                    id="toggle-view-list"
                    onClick={() => { triggerHaptic('light'); setMobileViewMode('list'); }}
                    className={cn(
                      "py-2 px-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5",
                      mobileViewMode === 'list' 
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25" 
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    )}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    Timeline List
                  </button>
                </div>
              </div>

              {/* Mobile Layout Branch */}
              <div className="block lg:hidden">
                {mobileViewMode === 'plating' ? (
                  <MobilePlatingDeck 
                    todayMeals={todayMeals}
                    activeCourseIndex={activeCourseIndex}
                    setActiveCourseIndex={setActiveCourseIndex}
                    localMealsOverride={localMealsOverride}
                    setLocalMealsOverride={setLocalMealsOverride}
                    triggerHaptic={triggerHaptic}
                    isDark={isDark}
                    showToast={showToast}
                    setSelectedNutritionMeal={setSelectedNutritionMeal}
                    setRatingMeal={setRatingMeal}
                    setReportingMeal={setReportingMeal}
                    handleRepeatMealSequence={handleRepeatMealSequence}
                    navigate={navigate}
                  />
                ) : (
                  /* Standard List Feed for Mobile */
                  <div className="space-y-6 mt-4">
                    <AnimatePresence mode="popLayout">
                      {todayMeals.map((meal: any, idx: number) => {
                        const statusConfig = {
                          Preparing: { style: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400", label: "Kitchen Preparing" },
                          Cooking: { style: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400", label: "Chef Cooking" },
                          Packing: { style: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400", label: "Packing Order" },
                          Ready: { style: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400", label: "Calibrated & Packaged" },
                          "Out for Delivery": { style: "bg-blue-500/15 border-blue-500/25 text-blue-600 dark:text-blue-400 animate-pulse", label: "Rider Dispatched" },
                          Dispatched: { style: "bg-blue-500/15 border-blue-500/25 text-blue-600 dark:text-blue-400 animate-pulse", label: "Rider Dispatched" },
                          Delivered: { style: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400", label: "Handover Secured" }
                        }[meal.deliveryStatus as string] || { style: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500", label: meal.deliveryStatus || "Standby" };

                        return (
                          <motion.div
                            key={meal.id || idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            className="group relative"
                          >
                            <Card className={cn(
                              "p-6 sm:p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-300 shadow-md relative overflow-hidden flex flex-col md:flex-row gap-6",
                              isDark ? "bg-zinc-900/60 border-white/5 text-zinc-100" : "bg-white border-zinc-150 text-zinc-900"
                            )}>
                              
                              <div className="relative w-full md:w-44 h-44 sm:h-auto sm:min-h-[140px] rounded-[1.5rem] overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                                <OptimizedImage 
                                  src={meal.image} 
                                  alt={meal.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-md">
                                  {meal.category}
                                </div>
                              </div>

                              <div className="flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-1.5">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      {getMealCategoryIcon(meal.type)}
                                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{meal.type}</span>
                                    </div>
                                    <span className={cn(
                                      "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                      statusConfig.style
                                    )}>
                                      ● {statusConfig.label}
                                    </span>
                                  </div>

                                  <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                                    {meal.name}
                                  </h3>
                                  
                                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                                    Portions: <span className="font-extrabold text-zinc-700 dark:text-zinc-300">{meal.portionSize || "Standard (350g)"}</span> &bull; Delivery Slot: <span className="text-emerald-500">{meal.deliveryTime}</span>
                                  </p>
                                </div>

                                {meal.chefNotes && (
                                  <div className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border-l-4 border-emerald-500 rounded-r-xl text-xs font-medium italic text-zinc-500 dark:text-zinc-400">
                                    "{meal.chefNotes}"
                                  </div>
                                )}

                                {meal.deliveryAgentName && (
                                  <div className="flex items-center gap-2 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/5 p-2 rounded-xl border border-blue-500/10">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>Rider: {meal.deliveryAgentName} ({meal.deliveryAgentPhone}) &bull; Slot: {meal.deliveryTime}</span>
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-t border-zinc-100 dark:border-white/5 pt-4">
                                  <span><strong className="text-orange-500 text-xs font-black">{meal.calories}</strong> Cal</span>
                                  <span>&bull;</span>
                                  <span><strong className="text-emerald-500 text-xs font-black">{meal.protein}g</strong> Pro</span>
                                  <span>&bull;</span>
                                  <span><strong className="text-teal-500 text-xs font-black">{meal.carbs}g</strong> Carb</span>
                                  <span>&bull;</span>
                                  <span><strong className="text-amber-500 text-xs font-black">{meal.fat}g</strong> Fat</span>
                                </div>

                                <div className="flex items-center justify-between py-1">
                                    <span className="text-[10px] font-black uppercase text-zinc-400">Rate Meal</span>
                                    <StarRating 
                                      onRate={(rating) => {
                                        triggerHaptic('light');
                                        showToast(`Rated ${meal.name} ${rating}/5`, "success");
                                      }}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1 border-t border-zinc-100 dark:border-white/5">
                                  <AddCalendarButton
                                    id={meal.id}
                                    dateStr={format(selectedDate, 'yyyy-MM-dd')}
                                    mealType={meal.type}
                                    mealName={meal.name}
                                    deliveryTimeStr={meal.deliveryTime}
                                    calories={meal.calories}
                                    protein={meal.protein}
                                    carbs={meal.carbs}
                                    fat={meal.fat}
                                    variant="ghost"
                                    showLabel={true}
                                  />

                                  <Button
                                    id={`btn-view-experience-mob-${meal.id}`}
                                    variant="ghost"
                                    onClick={() => { triggerHaptic('medium'); navigate(`/meal-experience/${meal.id}`); }}
                                    className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 px-3 py-1.5 h-auto rounded-lg flex items-center gap-1.5"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Experience
                                  </Button>

                                  <Button
                                    id={`btn-view-nutrition-mob-${meal.id}`}
                                    variant="ghost"
                                    onClick={() => { triggerHaptic('light'); setSelectedNutritionMeal(meal); }}
                                    className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 px-3 py-1.5 h-auto rounded-lg"
                                  >
                                    View Nutrition
                                  </Button>

                                  <Button
                                    id={`btn-rate-meal-mob-${meal.id}`}
                                    variant="ghost"
                                    onClick={() => { triggerHaptic('light'); setRatingMeal(meal); }}
                                    className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 px-3 py-1.5 h-auto rounded-lg"
                                  >
                                    Rate Meal
                                  </Button>

                                  <Button
                                    id={`btn-report-issue-mob-${meal.id}`}
                                    variant="ghost"
                                    onClick={() => { triggerHaptic('medium'); setReportingMeal(meal); }}
                                    className="text-[9px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-500/5 px-3 py-1.5 h-auto rounded-lg"
                                  >
                                    Report Issue
                                  </Button>

                                  <Button
                                    id={`btn-repeat-meal-mob-${meal.id}`}
                                    variant="ghost"
                                    onClick={() => handleRepeatMealSequence(meal)}
                                    className="text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:bg-indigo-500/5 px-3 py-1.5 h-auto rounded-lg ml-auto"
                                  >
                                    Repeat Meal
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Desktop Layout (Always standard Timeline List) */}
              <div className="hidden lg:block space-y-6">
                <AnimatePresence mode="popLayout">
                  {todayMeals.map((meal: any, idx: number) => {
                    const statusConfig = {
                      Preparing: { style: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400", label: "Kitchen Preparing" },
                      Cooking: { style: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400", label: "Chef Cooking" },
                      Packing: { style: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400", label: "Packing Order" },
                      Ready: { style: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400", label: "Calibrated & Packaged" },
                      "Out for Delivery": { style: "bg-blue-500/15 border-blue-500/25 text-blue-600 dark:text-blue-400 animate-pulse", label: "Rider Dispatched" },
                      Dispatched: { style: "bg-blue-500/15 border-blue-500/25 text-blue-600 dark:text-blue-400 animate-pulse", label: "Rider Dispatched" },
                      Delivered: { style: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400", label: "Handover Secured" }
                    }[meal.deliveryStatus as string] || { style: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500", label: meal.deliveryStatus || "Standby" };

                    return (
                      <motion.div
                        key={meal.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="group relative"
                      >
                        <Card className={cn(
                          "p-6 sm:p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-300 shadow-md relative overflow-hidden flex flex-col md:flex-row gap-6",
                          isDark ? "bg-zinc-900/60 border-white/5 text-zinc-100" : "bg-white border-zinc-150 text-zinc-900"
                        )}>
                          
                          {/* Left: Meal Image (Requirement 2) */}
                          <div className="relative w-full md:w-44 h-44 sm:h-auto sm:min-h-[140px] rounded-[1.5rem] overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                            <OptimizedImage 
                              src={meal.image} 
                              alt={meal.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Category Badge on top left of image */}
                            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-md">
                              {meal.category}
                            </div>
                          </div>

                          {/* Right: Core Meal Details */}
                          <div className="flex-1 flex flex-col justify-between space-y-4">
                            
                            {/* Card Header and Badge */}
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {getMealCategoryIcon(meal.type)}
                                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{meal.type}</span>
                                </div>
                                
                                {/* Delivery Status Badge */}
                                <span className={cn(
                                  "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                  statusConfig.style
                                )}>
                                  ● {statusConfig.label}
                                </span>
                              </div>

                              <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                                {meal.name}
                              </h3>
                              
                              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                                Portions: <span className="font-extrabold text-zinc-700 dark:text-zinc-300">{meal.portionSize || "Standard (350g)"}</span> &bull; Delivery Slot: <span className="text-emerald-500">{meal.deliveryTime}</span>
                              </p>
                            </div>

                            {/* Chef Notes Block */}
                            {meal.chefNotes && (
                              <div className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border-l-4 border-emerald-500 rounded-r-xl text-xs font-medium italic text-zinc-500 dark:text-zinc-400">
                                "{meal.chefNotes}"
                              </div>
                            )}

                            {/* Rider info display if Out for Delivery / Delivered */}
                            {meal.deliveryAgentName && (
                              <div className="flex items-center gap-2 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/5 p-2 rounded-xl border border-blue-500/10">
                                <Phone className="h-3.5 w-3.5" />
                                <span>Rider: {meal.deliveryAgentName} ({meal.deliveryAgentPhone}) &bull; Slot: {meal.deliveryTime}</span>
                              </div>
                            )}

                            {/* Macro mini tags */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-t border-zinc-100 dark:border-white/5 pt-4">
                              <span><strong className="text-orange-500 text-xs font-black">{meal.calories}</strong> Cal</span>
                              <span>&bull;</span>
                              <span><strong className="text-emerald-500 text-xs font-black">{meal.protein}g</strong> Pro</span>
                              <span>&bull;</span>
                              <span><strong className="text-teal-500 text-xs font-black">{meal.carbs}g</strong> Carb</span>
                              <span>&bull;</span>
                              <span><strong className="text-amber-500 text-xs font-black">{meal.fat}g</strong> Fat</span>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center justify-between py-1">
                                <span className="text-[10px] font-black uppercase text-zinc-400">Rate Meal</span>
                                <StarRating 
                                  onRate={(rating) => {
                                    triggerHaptic('light');
                                    showToast(`Rated ${meal.name} ${rating}/5`, "success");
                                  }}
                                />
                            </div>

                            {/* Actions bar */}
                            <div className="flex flex-wrap gap-2 pt-1 border-t border-zinc-100 dark:border-white/5">
                              <AddCalendarButton
                                id={meal.id}
                                dateStr={format(selectedDate, 'yyyy-MM-dd')}
                                mealType={meal.type}
                                mealName={meal.name}
                                deliveryTimeStr={meal.deliveryTime}
                                calories={meal.calories}
                                protein={meal.protein}
                                carbs={meal.carbs}
                                fat={meal.fat}
                                variant="ghost"
                                showLabel={true}
                              />

                              <Button
                                id={`btn-view-experience-${meal.id}`}
                                variant="ghost"
                                onClick={() => { triggerHaptic('medium'); navigate(`/meal-experience/${meal.id}`); }}
                                className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 px-3 py-1.5 h-auto rounded-lg flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                Experience
                              </Button>

                              <Button
                                id={`btn-view-nutrition-${meal.id}`}
                                variant="ghost"
                                onClick={() => { triggerHaptic('light'); setSelectedNutritionMeal(meal); }}
                                className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 px-3 py-1.5 h-auto rounded-lg"
                              >
                                View Nutrition
                              </Button>

                              <Button
                                id={`btn-rate-meal-${meal.id}`}
                                variant="ghost"
                                onClick={() => { triggerHaptic('light'); setRatingMeal(meal); }}
                                className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 px-3 py-1.5 h-auto rounded-lg"
                              >
                                Rate Meal
                              </Button>

                              <Button
                                id={`btn-report-issue-${meal.id}`}
                                variant="ghost"
                                onClick={() => { triggerHaptic('medium'); setReportingMeal(meal); }}
                                className="text-[9px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-500/5 px-3 py-1.5 h-auto rounded-lg"
                              >
                                Report Issue
                              </Button>

                              <Button
                                id={`btn-repeat-meal-${meal.id}`}
                                variant="ghost"
                                onClick={() => handleRepeatMealSequence(meal)}
                                className="text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:bg-indigo-500/5 px-3 py-1.5 h-auto rounded-lg ml-auto"
                              >
                                Repeat Meal
                              </Button>
                            </div>

                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

            </div>

            {/* Column 3: Daily Micro-Nutrient Dashboard & Status Overview */}
            <aside className="space-y-8">
              
              {/* Daily Calibrated Nutrition Summary (Requirement 4) */}
              <Card className={cn(
                "p-8 rounded-[3rem] border backdrop-blur-xl shadow-xl space-y-6 relative overflow-hidden",
                isDark ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-150"
              )}>
                
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Total Consumed Today</p>
                  <h3 className="text-xl font-black tracking-tight">Today's Nutrition Summary</h3>
                  <p className="text-[10px] font-bold text-zinc-400">Sum of all active sequences compared to daily targets.</p>
                </div>

                {/* Progress Indicators Container */}
                <div className="space-y-5 pt-2">
                  
                  {/* Calories Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-500" /> Calories</span>
                      <span className="font-mono text-zinc-500">{nutritionTotals.calories} / {targets.calories} kcal ({percentages.calories}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200/20 dark:border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentages.calories}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-orange-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Protein Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-emerald-500" /> Protein</span>
                      <span className="font-mono text-zinc-500">{nutritionTotals.protein} / {targets.protein}g ({percentages.protein}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200/20 dark:border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentages.protein}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Carbs Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Leaf className="h-3.5 w-3.5 text-teal-500" /> Carbs</span>
                      <span className="font-mono text-zinc-500">{nutritionTotals.carbs} / {targets.carbs}g ({percentages.carbs}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200/20 dark:border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentages.carbs}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-teal-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Fat Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Salad className="h-3.5 w-3.5 text-amber-500" /> Fats</span>
                      <span className="font-mono text-zinc-500">{nutritionTotals.fat} / {targets.fat}g ({percentages.fat}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200/20 dark:border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentages.fat}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>

                </div>

                {/* Aesthetic Status Circle Display */}
                <div className="pt-4 border-t border-zinc-100 dark:border-white/5 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="h-3.5 w-3.5" />
                    Molecular Balance Maintained
                  </div>
                </div>

              </Card>

              {/* Premium Chef's Editorial Box */}
              <Card className={cn(
                "p-8 bg-emerald-600 text-white rounded-[3rem] shadow-xl relative overflow-hidden",
                "border-none"
              )}>
                {/* Bouncing background star */}
                <div className="absolute top-0 right-0 p-4 text-white/10">
                  <Star className="h-20 w-20 rotate-12" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="p-2.5 bg-white/10 rounded-xl w-fit text-emerald-100">
                    <Award className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-black tracking-tight leading-tight">Head Chef's Calibration Notes</h4>
                  <p className="text-xs text-emerald-100 leading-relaxed italic">
                    "Today's active protocol centers on dense bioflavonoid and cruciferous cell replenishment. We have added raw microgreens to secure active antioxidant restoration during evening digests."
                  </p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-sm">TB</div>
                    <div>
                      <p className="text-xs font-black">Taaza Culinary Hub</p>
                      <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest">Metabolic Head Chef</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Logistics Actions Info */}
              <Card className={cn(
                "p-8 rounded-[3rem] border",
                isDark ? "bg-zinc-900/40 border-white/5" : "bg-zinc-50/50 border-zinc-150"
              )}>
                <h4 className="text-base font-black tracking-tight flex items-center gap-2"><Clock className="h-4.5 w-4.5 text-zinc-400" /> Sequence Logistics</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 mb-6">Need to pause future meal schedules or shift your default address node?</p>
                
                <Button
                  id="btn-nav-subscription-settings"
                  onClick={() => navigate('/dashboard/subscriptions')}
                  className="w-full rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-black text-xs uppercase tracking-widest py-4 h-auto shadow-md"
                >
                  Adjust Subscription Settings
                </Button>
              </Card>

            </aside>

          </div>
        )}

      </div>

      {/* --- PREMIUM MODALS & SHEET IMPLEMENTATIONS --- */}

      {/* MODAL 1: VIEW NUTRITION (Requirement 5) */}
      <AnimatePresence>
        {selectedNutritionMeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={cn(
                "rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border transition-all max-h-[90vh] overflow-y-auto relative",
                isDark ? "bg-zinc-950 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              {/* Close Button */}
              <button 
                id="btn-close-nutrition-modal"
                onClick={() => setSelectedNutritionMeal(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">{selectedNutritionMeal.type} Molecular Profile</span>
                  <h3 className="text-2xl font-black tracking-tight mt-1">{selectedNutritionMeal.name}</h3>
                  <p className="text-xs font-bold text-zinc-500 mt-1">Gourmet weight formulation: {selectedNutritionMeal.portionSize}</p>
                </div>

                {/* Unsplash Image */}
                <div className="h-48 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <OptimizedImage 
                    src={selectedNutritionMeal.image} 
                    alt={selectedNutritionMeal.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* Macro metrics details grids */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Calories</p>
                    <p className="text-lg font-black mt-0.5 text-orange-500">{selectedNutritionMeal.calories} kcal</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Protein</p>
                    <p className="text-lg font-black mt-0.5 text-emerald-500">{selectedNutritionMeal.protein}g</p>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Carbs</p>
                    <p className="text-lg font-black mt-0.5 text-teal-500">{selectedNutritionMeal.carbs}g</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Fats</p>
                    <p className="text-lg font-black mt-0.5 text-amber-500">{selectedNutritionMeal.fat}g</p>
                  </div>
                </div>

                {/* Ingredients list */}
                {selectedNutritionMeal.ingredients && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Calibrated Fresh Ingredients</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNutritionMeal.ingredients.map((ing, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/20 dark:border-white/5 text-xs font-bold">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chef Notes details */}
                {selectedNutritionMeal.chefNotes && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs font-bold leading-relaxed text-zinc-600 dark:text-zinc-350">
                    <strong className="text-emerald-600 dark:text-emerald-400 font-black block uppercase tracking-widest text-[9px] mb-1">Kitchen Note</strong>
                    "{selectedNutritionMeal.chefNotes}"
                  </div>
                )}

                <Button
                  id="btn-close-nutrition-modal-cta"
                  onClick={() => setSelectedNutritionMeal(null)}
                  className="w-full rounded-2xl py-4 font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Confirm Protocol
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: RATE MEAL (Requirement 5) */}
      <AnimatePresence>
        {ratingMeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border transition-all relative",
                isDark ? "bg-zinc-950 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              {/* Close Button */}
              <button 
                id="btn-close-rate-modal"
                onClick={() => setRatingMeal(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Culinary Quality Feedback</span>
                  <h3 className="text-xl font-black tracking-tight mt-1">Rate: {ratingMeal.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Help our Head Chef refine preparation profiles.</p>
                </div>

                {/* Rating Categories */}
                <div className="space-y-4 pt-2">
                  
                  {/* Tastiness Star Rating */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Tastiness / Spicing Balance</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          id={`star-taste-${star}`}
                          key={star}
                          onClick={() => { triggerHaptic('light'); setRatingTaste(star); }}
                          className="p-1 focus:outline-none"
                        >
                          <Star className={cn(
                            "h-6 w-6 transition-colors",
                            star <= ratingTaste ? "text-yellow-400 fill-yellow-400" : "text-zinc-300 dark:text-zinc-700"
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Portion Size Star Rating */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Portion Sufficiency</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          id={`star-portion-${star}`}
                          key={star}
                          onClick={() => { triggerHaptic('light'); setRatingPortion(star); }}
                          className="p-1 focus:outline-none"
                        >
                          <Star className={cn(
                            "h-6 w-6 transition-colors",
                            star <= ratingPortion ? "text-yellow-400 fill-yellow-400" : "text-zinc-300 dark:text-zinc-700"
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Freshness Star Rating */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Freshness & Heat Insulation</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          id={`star-freshness-${star}`}
                          key={star}
                          onClick={() => { triggerHaptic('light'); setRatingFreshness(star); }}
                          className="p-1 focus:outline-none"
                        >
                          <Star className={cn(
                            "h-6 w-6 transition-colors",
                            star <= ratingFreshness ? "text-yellow-400 fill-yellow-400" : "text-zinc-300 dark:text-zinc-700"
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Add Notes</label>
                    <textarea
                      id="text-rate-comments"
                      placeholder="e.g. Perfectly herbed, arrived beautifully warm!"
                      className={cn(
                        "p-4 rounded-xl border-2 outline-none font-bold text-xs min-h-[90px] resize-none",
                        isDark ? "bg-zinc-900 border-white/5 text-white focus:border-emerald-500" : "bg-zinc-50 border-zinc-100 focus:border-emerald-500"
                      )}
                      value={ratingComments}
                      onChange={(e) => setRatingComments(e.target.value)}
                    />
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    id="btn-cancel-rate"
                    variant="ghost"
                    onClick={() => setRatingMeal(null)}
                    className="rounded-xl py-4 h-auto font-black text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button
                    id="btn-submit-rate"
                    onClick={handleRateMealSubmit}
                    disabled={isProcessing}
                    className="rounded-xl py-4 h-auto font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                  >
                    {isProcessing ? "Saving..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: REPORT ISSUE (Requirement 5) */}
      <AnimatePresence>
        {reportingMeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border transition-all relative",
                isDark ? "bg-zinc-950 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              {/* Close Button */}
              <button 
                id="btn-close-report-modal"
                onClick={() => setReportingMeal(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Discrepancy Hot-Node</span>
                  <h3 className="text-xl font-black tracking-tight mt-1">Report Issue: {reportingMeal.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Instantly logs high-priority assistance with our kitchens & riders.</p>
                </div>

                <div className="space-y-4">
                  {/* Category Selection */}
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Issue Category</label>
                    <select
                      id="select-issue-category"
                      value={issueCategory}
                      onChange={(e) => setIssueCategory(e.target.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 outline-none font-bold text-xs",
                        isDark ? "bg-zinc-900 border-white/5 text-white focus:border-emerald-500" : "bg-zinc-50 border-zinc-150 focus:border-emerald-500"
                      )}
                    >
                      <option value="quality">Meal Quality Discrepancy</option>
                      <option value="temperature">Box Temperature / Not Hot</option>
                      <option value="packaging">Spilled Packaging / Sealed Damaged</option>
                      <option value="delivery">Delayed Delivery Timeline</option>
                      <option value="general">Wrong Recipe Received</option>
                    </select>
                  </div>

                  {/* Elaborations */}
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Discrepancy Details</label>
                    <textarea
                      id="text-issue-description"
                      placeholder="e.g. My delivery box outer seal was torn and the food arrived lukewarm."
                      className={cn(
                        "p-4 rounded-xl border-2 outline-none font-bold text-xs min-h-[100px] resize-none",
                        isDark ? "bg-zinc-900 border-white/5 text-white focus:border-emerald-500" : "bg-zinc-50 border-zinc-150 focus:border-emerald-500"
                      )}
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    id="btn-cancel-report"
                    variant="ghost"
                    onClick={() => setReportingMeal(null)}
                    className="rounded-xl py-4 h-auto font-black text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button
                    id="btn-submit-report"
                    onClick={handleReportIssueSubmit}
                    disabled={isProcessing}
                    className="rounded-xl py-4 h-auto font-black text-xs uppercase tracking-widest bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/10"
                  >
                    {isProcessing ? "Routing..." : "Submit Ticket"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </PageTransition>

      {/* Customer Add-on Ordering & Scheduling Modal */}
      <AddOnModal
        isOpen={isAddOnModalOpen}
        onClose={() => setIsAddOnModalOpen(false)}
        initialDate={addOnTargetDate}
        initialMealSlot={addOnTargetSlot}
        onSuccess={() => {
          // Re-fetch or refresh meals
          showToast("Add-on successfully scheduled!", "success");
        }}
      />
    </DashboardLayout>
  );
}

// ==========================================
// OUT-OF-THE-BOX MOBILE PLATING & DISHING STUDIO
// ==========================================

import { Scale, ShieldCheck } from "lucide-react";

interface MobilePlatingDeckProps {
  todayMeals: any[];
  activeCourseIndex: number;
  setActiveCourseIndex: (idx: number) => void;
  localMealsOverride: Record<string, any>;
  setLocalMealsOverride: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy') => void;
  isDark: boolean;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  setSelectedNutritionMeal: (meal: any) => void;
  setRatingMeal: (meal: any) => void;
  setReportingMeal: (meal: any) => void;
  handleRepeatMealSequence: (meal: any) => void;
  navigate: any;
}

const ALTERNATIVES: Record<string, any[]> = {
  Breakfast: [
    {
      id: "alt_b1",
      name: "Avocado Sourdough Toast with Flax",
      type: "Breakfast",
      calories: 340,
      protein: 14,
      carbs: 32,
      fat: 16,
      portionSize: "320g",
      category: "Keto Friendly",
      image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=400",
      ingredients: ["Sourdough", "Avocado", "Flax Seed", "Microgreens"]
    },
    {
      id: "alt_b2",
      name: "Spiced Ragi & Millet Porridge Bowl",
      type: "Breakfast",
      calories: 290,
      protein: 11,
      carbs: 45,
      fat: 6,
      portionSize: "350g",
      category: "High Fiber",
      image: "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&q=80&w=400",
      ingredients: ["Ragi Millet", "Almond Milk", "Organic Honey", "Chia Seeds"]
    }
  ],
  Lunch: [
    {
      id: "alt_l1",
      name: "High-Protein Paneer Tikka Salad",
      type: "Lunch",
      calories: 480,
      protein: 24,
      carbs: 15,
      fat: 32,
      portionSize: "400g",
      category: "Low Carb",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
      ingredients: ["Spiced Paneer", "Cucumber", "Bell Peppers", "Mint Yogurt"]
    },
    {
      id: "alt_l2",
      name: "Brown Rice Teriyaki Tofu Bowl",
      type: "Lunch",
      calories: 510,
      protein: 20,
      carbs: 68,
      fat: 12,
      portionSize: "450g",
      category: "Plant Based",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
      ingredients: ["Brown Rice", "Organic Tofu", "Broccoli", "Sesame Ginger"]
    }
  ],
  Dinner: [
    {
      id: "alt_d1",
      name: "Lemon Herb Grilled Paneer Steak",
      type: "Dinner",
      calories: 420,
      protein: 22,
      carbs: 12,
      fat: 28,
      portionSize: "380g",
      category: "Keto Friendly",
      image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400",
      ingredients: ["Grilled Paneer", "Asparagus", "Zucchini", "Lemon Vinaigrette"]
    },
    {
      id: "alt_d2",
      name: "Red Lentil Penne Pasta Bowl",
      type: "Dinner",
      calories: 460,
      protein: 25,
      carbs: 58,
      fat: 9,
      portionSize: "420g",
      category: "High Protein",
      image: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80&w=400",
      ingredients: ["Red Lentil Penne", "Marinara Sauce", "Olives", "Fresh Basil"]
    }
  ],
  Snacks: [
    {
      id: "alt_s1",
      name: "Cold-Pressed Fuel Booster Juice",
      type: "Snacks",
      calories: 140,
      protein: 2,
      carbs: 31,
      fat: 1,
      portionSize: "250ml",
      category: "Antioxidant Rich",
      image: "https://images.unsplash.com/photo-1610970881699-44a5587caa90?auto=format&fit=crop&q=80&w=400",
      ingredients: ["Celery", "Green Apple", "Lemon Juice", "Organic Ginger"]
    },
    {
      id: "alt_s2",
      name: "Salted Caramel Energy Protein Ball",
      type: "Snacks",
      calories: 180,
      protein: 9,
      carbs: 22,
      fat: 8,
      portionSize: "120g",
      category: "Keto Energy",
      image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=400",
      ingredients: ["Rolled Oats", "Peanut Butter", "Dates", "Whey Protein"]
    }
  ]
};

function MobilePlatingDeck({
  todayMeals,
  activeCourseIndex,
  setActiveCourseIndex,
  localMealsOverride,
  setLocalMealsOverride,
  triggerHaptic,
  isDark,
  showToast,
  setSelectedNutritionMeal,
  setRatingMeal,
  setReportingMeal,
  handleRepeatMealSequence,
  navigate
}: MobilePlatingDeckProps) {
  
  if (!todayMeals || todayMeals.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-400">
        No assigned courses detected for this cycle.
      </div>
    );
  }

  // Safely get active course, fallback to first index if out of bounds
  const safeIndex = activeCourseIndex < todayMeals.length ? activeCourseIndex : 0;
  const meal = todayMeals[safeIndex];

  const handleUpdateMeal = (updatedFields: any) => {
    setLocalMealsOverride(prev => {
      const key = meal.id || meal.type;
      const existing = prev[key] || {};
      return {
        ...prev,
        [key]: {
          ...existing,
          ...updatedFields
        }
      };
    });
  };

  // 1-Tap Exclude Ingredient
  const handleExcludeIngredient = (ing: string) => {
    triggerHaptic('medium');
    const originalIngredients = meal.ingredients || ["Fresh Grains", "Leafy Greens", "Spiced Tofu", "Crispy Tempeh", "Olive oil drizzle"];
    const filtered = originalIngredients.filter((i: string) => i !== ing);
    handleUpdateMeal({
      ingredients: filtered,
      chefNotes: `Dished without ${ing}`
    });
    showToast(`Successfully extracted ${ing} from molecular structure!`, "success");
  };

  // Restore ingredients
  const handleRestoreIngredients = () => {
    triggerHaptic('light');
    handleUpdateMeal({
      ingredients: undefined, // drops back to baseline
      chefNotes: undefined
    });
    showToast("Restored original chef composition.", "info");
  };

  // 1-Tap Adjust portion
  const handleSetPortion = (size: string, scaleFactor: number) => {
    triggerHaptic('heavy');
    const originalCal = 420; // fallback default
    const baseCals = meal.calories ? Math.round(meal.calories / (meal.portionSize === "Lite (320g)" ? 0.8 : meal.portionSize === "Athlete (520g)" ? 1.25 : 1)) : originalCal;
    const baseProt = meal.protein ? Math.round(meal.protein / (meal.portionSize === "Lite (320g)" ? 0.8 : meal.portionSize === "Athlete (520g)" ? 1.25 : 1)) : 22;
    const baseCarbs = meal.carbs ? Math.round(meal.carbs / (meal.portionSize === "Lite (320g)" ? 0.8 : meal.portionSize === "Athlete (520g)" ? 1.25 : 1)) : 48;
    const baseFats = meal.fat ? Math.round(meal.fat / (meal.portionSize === "Lite (320g)" ? 0.8 : meal.portionSize === "Athlete (520g)" ? 1.25 : 1)) : 12;

    handleUpdateMeal({
      portionSize: size,
      calories: Math.round(baseCals * scaleFactor),
      protein: Math.round(baseProt * scaleFactor),
      carbs: Math.round(baseCarbs * scaleFactor),
      fat: Math.round(baseFats * scaleFactor),
      chefNotes: `Portioned as ${size}`
    });
    showToast(`Plating portion tuned to ${size}!`, "success");
  };

  // Toggle Booster
  const activeBoosters: string[] = meal.activeBoosters || [];
  const handleToggleBooster = (name: string, calBonus: number, protBonus: number, carbBonus: number, fatBonus: number) => {
    triggerHaptic('heavy');
    let nextBoosters = [...activeBoosters];
    let isAdding = true;

    if (activeBoosters.includes(name)) {
      nextBoosters = nextBoosters.filter(b => b !== name);
      isAdding = false;
      showToast(`Extracted ${name} booster.`, "info");
    } else {
      nextBoosters.push(name);
      showToast(`Injected ${name} into plate!`, "success");
    }

    const mult = isAdding ? 1 : -1;
    handleUpdateMeal({
      activeBoosters: nextBoosters,
      calories: Math.max(0, (meal.calories || 400) + calBonus * mult),
      protein: Math.max(0, (meal.protein || 20) + protBonus * mult),
      carbs: Math.max(0, (meal.carbs || 45) + carbBonus * mult),
      fat: Math.max(0, (meal.fat || 12) + fatBonus * mult)
    });
  };

  // Swap with alternative meal
  const handleSwapAlternative = (alt: any) => {
    triggerHaptic('heavy');
    handleUpdateMeal({
      id: alt.id,
      name: alt.name,
      calories: alt.calories,
      protein: alt.protein,
      carbs: alt.carbs,
      fat: alt.fat,
      portionSize: alt.portionSize,
      category: alt.category,
      image: alt.image,
      ingredients: alt.ingredients,
      chefNotes: "Custom Swapped"
    });
    showToast(`Dished customized recipe: ${alt.name}`, "success");
  };

  // Render course tab icons
  const getCourseTabIcon = (type: string, isActive: boolean) => {
    const activeColor = "text-emerald-500";
    const inactiveColor = "text-zinc-400";
    const clr = isActive ? activeColor : inactiveColor;

    switch (type) {
      case "Breakfast":
        return <Coffee className={`w-4 h-4 ${clr}`} />;
      case "Lunch":
        return <Utensils className={`w-4 h-4 ${clr}`} />;
      case "Dinner":
        return <Moon className={`w-4 h-4 ${clr}`} />;
      default:
        return <Salad className={`w-4 h-4 ${clr}`} />;
    }
  };

  const statusColors = {
    Preparing: "border-amber-500 text-amber-500 bg-amber-500/10",
    Cooking: "border-orange-500 text-orange-500 bg-orange-500/10",
    Packing: "border-orange-500 text-orange-500 bg-orange-500/10",
    Ready: "border-emerald-500 text-emerald-500 bg-emerald-500/10",
    "Out for Delivery": "border-blue-500 text-blue-500 bg-blue-500/15 animate-pulse",
    Dispatched: "border-blue-500 text-blue-500 bg-blue-500/15 animate-pulse",
    Delivered: "border-emerald-500 text-emerald-500 bg-emerald-500/10"
  }[meal.deliveryStatus as string] || "border-zinc-400 text-zinc-400 bg-zinc-500/10";

  const ingredientsList = meal.ingredients || ["Fresh Grains", "Leafy Greens", "Spiced Tofu", "Crispy Tempeh", "Olive oil drizzle"];

  return (
    <div className="space-y-6 mt-4 pb-8">
      
      {/* 1. Tactile Horizontal Course Scroller */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar snap-x px-1">
        {todayMeals.map((m: any, idx: number) => {
          const isActive = idx === safeIndex;
          return (
            <button
              key={m.id || m.type}
              id={`btn-course-tab-${idx}`}
              onClick={() => { triggerHaptic('light'); setActiveCourseIndex(idx); }}
              className={cn(
                "snap-center shrink-0 flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-300",
                isActive 
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-lg shadow-black/15" 
                  : isDark ? "bg-zinc-900 border-white/5 text-zinc-400" : "bg-white border-zinc-150 text-zinc-600"
              )}
            >
              {getCourseTabIcon(m.type, isActive)}
              <span>{m.type}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Interactive Molecular Plate Board */}
      <Card className={cn(
        "p-6 rounded-[2.5rem] border backdrop-blur-xl relative overflow-hidden transition-all duration-500 shadow-xl",
        isDark ? "bg-zinc-950/80 border-white/5" : "bg-white border-zinc-150"
      )}>
        <div className="absolute top-4 right-4 z-10">
          <span className={cn(
            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
            statusColors
          )}>
            {meal.deliveryStatus || "Standby"}
          </span>
        </div>

        {/* Dynamic Canvas: Circular Plate Layout */}
        <div className="flex flex-col items-center justify-center pt-6 pb-4">
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* Concentric Tactile Outer Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/20 animate-spin" style={{ animationDuration: '60s' }} />
            
            {/* Mid concentric gradient ring */}
            <div className="absolute inset-3 rounded-full border border-orange-500/20 animate-spin" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />
            
            {/* Concentric solid base ring */}
            <div className="absolute inset-6 rounded-full border-4 border-zinc-100 dark:border-white/5 shadow-inner" />

            {/* Micro-Nutrients Mini Concentric Arc Badges */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-orange-500/25">
              {meal.calories} Cal
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/25">
              {meal.protein}g Pro
            </div>
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-teal-500 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-teal-500/25">
              {meal.carbs}g Carb
            </div>
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 bg-amber-500 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/25">
              {meal.fat}g Fat
            </div>

            {/* Solid Center Plate Image */}
            <div className="w-44 h-44 rounded-full overflow-hidden border-8 border-white dark:border-zinc-900 shadow-2xl relative group">
              <OptimizedImage 
                src={meal.image} 
                alt={meal.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-3">
                <span className="text-[8px] font-black uppercase tracking-widest text-white bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
                  {meal.portionSize || "Standard (350g)"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 space-y-1 max-w-sm px-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {meal.category}
            </span>
            <h3 className="text-lg font-black tracking-tight leading-tight">
              {meal.name}
            </h3>
            {meal.chefNotes && (
              <p className="text-[10px] text-zinc-400 font-bold italic">
                "{meal.chefNotes}"
              </p>
            )}
          </div>
        </div>

        {/* 3. Interactive Ingredient extraction Nodes */}
        <div className="border-t border-zinc-100 dark:border-white/5 pt-5 mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tactile Micro-Plating Recipe</h4>
              <p className="text-[9px] text-zinc-500">Tap individual molecular blocks to isolate or exclude from final plating.</p>
            </div>
            {(meal.ingredients || meal.chefNotes) && (
              <button 
                id="btn-restore-recipe"
                onClick={handleRestoreIngredients}
                className="text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:underline shrink-0"
              >
                Restore Base
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {ingredientsList.map((ing: string, i: number) => (
              <button
                key={ing + i}
                id={`btn-exclude-ing-${i}`}
                onClick={() => handleExcludeIngredient(ing)}
                className="group flex items-center gap-1.5 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 rounded-xl hover:border-rose-500/30 transition-all text-[11px] font-extrabold text-zinc-700 dark:text-zinc-300"
              >
                <span>{ing}</span>
                <X className="w-3 h-3 text-zinc-400 group-hover:text-rose-500 transition-colors" />
              </button>
            ))}
            {ingredientsList.length === 0 && (
              <div className="text-[10px] font-bold text-zinc-500 py-2">
                All optional ingredients excluded. Click "Restore Base" to reset recipe.
              </div>
            )}
          </div>
        </div>

        {/* 4. Portion Calibration Selector */}
        <div className="border-t border-zinc-100 dark:border-white/5 pt-5 mt-4 space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Caloric Portion Tuning</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Lite (320g)", factor: 0.8, id: "lite" },
              { label: "Standard (420g)", factor: 1.0, id: "standard" },
              { label: "Athlete (520g)", factor: 1.25, id: "athlete" }
            ].map((p) => {
              const isSelected = meal.portionSize === p.label || (!meal.portionSize && p.label === "Standard (420g)");
              return (
                <button
                  key={p.label}
                  id={`btn-portion-${p.id}`}
                  onClick={() => handleSetPortion(p.label, p.factor)}
                  className={cn(
                    "py-3 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all text-center",
                    isSelected 
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                      : isDark ? "border-white/5 bg-zinc-900/40 text-zinc-500 hover:border-white/10" : "border-zinc-150 bg-zinc-50/50 text-zinc-500 hover:border-zinc-200"
                  )}
                >
                  {p.label.split(" ")[0]}
                  <span className="block text-[8px] font-bold text-zinc-400 mt-0.5">{p.label.split(" ")[1]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Biometric culinary Boosters */}
        <div className="border-t border-zinc-100 dark:border-white/5 pt-5 mt-4 space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tactile Micro-Boosters</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "Omega Crunch", c: 45, p: 2, cb: 1, f: 4, id: "omega" },
              { name: "Grass-Fed Ghee", c: 90, p: 0, cb: 0, f: 10, id: "ghee" },
              { name: "Cultured Dip", c: 30, p: 2, cb: 1, f: 2, id: "cultured" },
              { name: "Antioxidant Flush", c: 5, p: 0, cb: 1, f: 0, id: "antiox" }
            ].map((b) => {
              const isActive = activeBoosters.includes(b.name);
              return (
                <button
                  key={b.name}
                  id={`btn-booster-${b.id}`}
                  onClick={() => handleToggleBooster(b.name, b.c, b.p, b.cb, b.f)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border transition-all text-left",
                    isActive 
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : isDark ? "border-white/5 bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900/50" : "border-zinc-150 bg-zinc-50/50 text-zinc-600 hover:bg-zinc-50"
                  )}
                >
                  <Plus className={cn("w-3.5 h-3.5 shrink-0 transition-transform", isActive && "rotate-45 text-emerald-500")} />
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest">{b.name}</span>
                    <span className="block text-[8px] font-extrabold text-zinc-400">+{b.c} kcal | +{b.f}g Fat</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Rider Hot Link & Delivery Info (If active) */}
        {meal.deliveryAgentName && (
          <div className="border-t border-zinc-100 dark:border-white/5 pt-5 mt-4">
            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xs">
                  {meal.deliveryAgentName[0]}
                </div>
                <div>
                  <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-400">Assigned Logistics Rider</span>
                  <span className="block text-xs font-black">{meal.deliveryAgentName}</span>
                  <span className="block text-[9px] text-emerald-500 font-bold">Slot Time: {meal.deliveryTime}</span>
                </div>
              </div>
              <a 
                href={`tel:${meal.deliveryAgentPhone}`}
                id="btn-call-rider"
                onClick={() => triggerHaptic('medium')}
                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </Card>

      {/* 3. Out-Of-The-Box alternative swaps carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Chef's Plate Exchange</h4>
            <p className="text-[9px] text-zinc-500">Instant swap with certified alternative macro-equivalent recipes.</p>
          </div>
          <RefreshCw className="w-4 h-4 text-zinc-400 animate-spin" style={{ animationDuration: '25s' }} />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x px-1">
          {(ALTERNATIVES[meal.type] || ALTERNATIVES.Breakfast).map((alt) => {
            const isCurrentlySelected = meal.name === alt.name || meal.id === alt.id;
            return (
              <div
                key={alt.id}
                className="snap-center shrink-0 w-64"
              >
                <Card className={cn(
                  "p-4 rounded-[2rem] border transition-all duration-300 flex flex-col gap-3 relative overflow-hidden h-full",
                  isCurrentlySelected 
                    ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500" 
                    : isDark ? "bg-zinc-900 border-white/5 hover:border-white/10" : "bg-white border-zinc-150 hover:border-zinc-200"
                )}>
                  <div className="relative h-28 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <OptimizedImage 
                      src={alt.image} 
                      alt={alt.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded">
                      {alt.category}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-xs font-black line-clamp-1">{alt.name}</h5>
                    <div className="flex justify-between text-[9px] font-extrabold text-zinc-400">
                      <span>{alt.calories} kcal</span>
                      <span>{alt.protein}g Protein</span>
                    </div>
                  </div>

                  <button
                    id={`btn-swap-recipe-${alt.id}`}
                    onClick={() => handleSwapAlternative(alt)}
                    disabled={isCurrentlySelected}
                    className={cn(
                      "w-full py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                      isCurrentlySelected
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-default"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                    )}
                  >
                    {isCurrentlySelected ? "Active on Plate" : "Swap on Plate"}
                  </button>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Action Hub Bottom Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="btn-active-details"
          onClick={() => { triggerHaptic('medium'); navigate(`/meal-experience/${meal.id}`); }}
          className={cn(
            "p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1.5 text-center",
            isDark ? "bg-zinc-900 border-white/5 text-emerald-400 hover:bg-zinc-900/80" : "bg-white border-zinc-150 text-emerald-600 hover:bg-zinc-50"
          )}
        >
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <span>Active Experience</span>
        </button>

        <button
          id="btn-order-course-addon"
          onClick={() => {
            triggerHaptic('light');
            setAddOnTargetDate(format(selectedDate, 'yyyy-MM-dd'));
            setAddOnTargetSlot(meal.type || "Dinner");
            setIsAddOnModalOpen(true);
          }}
          className={cn(
            "p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1.5 text-center bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-500"
          )}
        >
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>+ Add Juice / Smoothie</span>
        </button>

        <button
          id="btn-view-nutrients"
          onClick={() => { triggerHaptic('light'); setSelectedNutritionMeal(meal); }}
          className={cn(
            "p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1.5 text-center",
            isDark ? "bg-zinc-900 border-white/5 text-emerald-400 hover:bg-zinc-900/80" : "bg-white border-zinc-150 text-emerald-600 hover:bg-zinc-50"
          )}
        >
          <Scale className="w-5 h-5 text-emerald-500" />
          <span>Micro Nutrients</span>
        </button>

        <button
          id="btn-rate-modal-trigger"
          onClick={() => { triggerHaptic('light'); setRatingMeal(meal); }}
          className={cn(
            "p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1.5 text-center",
            isDark ? "bg-zinc-900 border-white/5 text-zinc-300 hover:bg-zinc-900/80" : "bg-white border-zinc-150 text-zinc-600 hover:bg-zinc-50"
          )}
        >
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span>Feedback & Rating</span>
        </button>

        <button
          id="btn-repeat-modal-trigger"
          onClick={() => handleRepeatMealSequence(meal)}
          className={cn(
            "p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1.5 text-center",
            isDark ? "bg-zinc-900 border-white/5 text-zinc-300 hover:bg-zinc-900/80" : "bg-white border-zinc-150 text-zinc-600 hover:bg-zinc-50"
          )}
        >
          <RefreshCw className="w-5 h-5 text-indigo-500" />
          <span>Repeat Meal</span>
        </button>
      </div>

      <div className="text-center">
        <button
          id="btn-report-issue-trigger"
          onClick={() => { triggerHaptic('heavy'); setReportingMeal(meal); }}
          className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:underline inline-flex items-center gap-1"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Report Discrepancy or Temperature Issue
        </button>
      </div>

    </div>
  );
}
