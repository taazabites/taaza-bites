import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import HealthHubLayout from "../components/dashboard/HealthHubLayout";
import { PageTransition } from "../components/dashboard/PageTransition";
import PullToRefresh from "../components/common/PullToRefresh";
import { SubscriptionHomeCards } from "../components/dashboard/SubscriptionHomeCards";
import { DeliveryService } from "../firebase/services";
import { 
  UserService, 
  SubscriptionService, 
  HealthAssessmentService,
  MealService,
  HealthProgressService,
  WalletService,
  RewardService,
  AddressService
} from "../firebase/services";
import { 
  User, 
  Subscription, 
  HealthAssessment, 
  MealSchedule, 
  HealthProgress,
  Wallet,
  RewardPoints,
  Address
} from "../firebase/collections";
import { useToast } from "../context/ToastContext";

export default function HealthHub() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Data States
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthAssessment | null>(null);
  const [todayMeals, setTodayMeals] = useState<MealSchedule[]>([]);
  const [weeklyMeals, setWeeklyMeals] = useState<MealSchedule[]>([]);
  const [healthProgress, setHealthProgress] = useState<HealthProgress | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [rewardPoints, setRewardPoints] = useState<RewardPoints | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [delivery, setDelivery] = useState<any>(null);
  
  useEffect(() => {
    if (currentUser) {
      const welcomeKey = `taaza_journey_v2_seen_${currentUser.uid}`;
      if (!localStorage.getItem(welcomeKey)) {
        localStorage.setItem(welcomeKey, "true");
      }
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    // Safety timer to prevent infinite loading state if Firestore hangs
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 4500);

    try {
      if (!currentUser?.uid) {
        clearTimeout(timeout);
        setIsLoading(false);
        return;
      }
      
      const [subRes, healthRes, progressRes, weekRes, walletRes, rewardsRes, addressRes, deliveryRes] = await Promise.allSettled([
        SubscriptionService.getActiveSubscription(currentUser.uid),
        HealthAssessmentService.getAssessments(currentUser.uid),
        HealthProgressService.getProgressLogs(currentUser.uid),
        MealService.getWeeklySchedule(currentUser.uid, new Date()),
        WalletService.getWallet(currentUser.uid),
        RewardService.getRewardPoints(currentUser.uid),
        AddressService.getAddresses(currentUser.uid),
        DeliveryService.getDeliveries(currentUser.uid)
      ]);
      
      clearTimeout(timeout);

      if (subRes.status === 'fulfilled' && subRes.value) {
        setSubscription(subRes.value);
      }
      
      if (healthRes.status === 'fulfilled' && Array.isArray(healthRes.value) && healthRes.value.length > 0) {
        setHealthProfile(healthRes.value[0]);
      }
      
      if (progressRes.status === 'fulfilled' && Array.isArray(progressRes.value) && progressRes.value.length > 0) {
        setHealthProgress(progressRes.value[0]);
      }

      if (weekRes.status === 'fulfilled' && Array.isArray(weekRes.value)) {
        setWeeklyMeals(weekRes.value);
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todays = weekRes.value.filter(m => m.date && m.date.startsWith(todayStr));
        setTodayMeals(todays);
      }

      if (walletRes.status === 'fulfilled' && walletRes.value) {
        setWallet(walletRes.value);
      }

      if (rewardsRes.status === 'fulfilled' && rewardsRes.value) {
        setRewardPoints(rewardsRes.value);
      }

      if (addressRes.status === 'fulfilled' && Array.isArray(addressRes.value)) {
        setAddresses(addressRes.value);
      }

      if (deliveryRes.status === 'fulfilled' && Array.isArray(deliveryRes.value) && deliveryRes.value.length > 0) {
        setDelivery(deliveryRes.value.find((d: any) => !['delivered', 'Delivered'].includes(String(d.deliveryStatus))) || deliveryRes.value[0]);
      }
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      clearTimeout(timeout);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadDashboardData();
    showToast("Dashboard updated", "success");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const currentCalories = todayMeals.reduce((sum, m) => sum + ((m as any).nutrition?.calories || 0), 0);
  const currentProtein = todayMeals.reduce((sum, m) => sum + ((m as any).nutrition?.protein || 0), 0);
  const targetCalories = healthProfile?.recommendedCalories || healthProfile?.calculatedCalories;
  const targetProtein = healthProfile?.recommendedProtein || healthProfile?.calculatedProtein;
  const targetWater = healthProfile?.recommendedWater;
  const waterConsumed = Number((healthProgress as any)?.waterIntake || 0);
  const customerName = (userData as any)?.displayName || (userData as any)?.name || (healthProfile as any)?.fullName || currentUser?.displayName || '';
  const defaultAddr = addresses.find((a) => a.default) || addresses[0];
  const weightCurrent = healthProfile?.weight;
  const weightTarget = healthProfile?.targetWeight;

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <PageTransition>
          <div className="max-w-6xl mx-auto space-y-6">
            <SubscriptionHomeCards
              customerName={customerName}
              subscription={subscription}
              todayMeals={todayMeals}
              address={subscription?.deliveryAddress || defaultAddr}
              delivery={delivery || todayMeals[0]}
              streak={(healthProgress as any)?.streak || 0}
              onRenew={() => navigate(`/plans?mode=renew&subscriptionId=${subscription?.id || ''}`)}
            />
            <HealthHubLayout 
              user={userData || currentUser}
              healthScore={(healthProfile as any)?.score}
              nutrition={{
                calories: { consumed: currentCalories, target: targetCalories || 0 },
                protein: { consumed: currentProtein, target: targetProtein || 0 },
                water: { consumed: waterConsumed, target: targetWater || 0 }
              }}
              weightGoal={{
                current: weightCurrent || 0,
                target: weightTarget || 0,
                label: healthProfile?.goal || "Your goal"
              }}
              todayMeal={todayMeals[0]}
              weeklyMeals={weeklyMeals}
              subscription={subscription}
              wallet={wallet}
              rewardPoints={rewardPoints}
              addresses={addresses}
              deliveryStatus={{
                 status: delivery?.deliveryStatus || todayMeals[0]?.deliveryStatus,
                 eta: todayMeals[0]?.deliveryTime || delivery?.eta,
                 driver: delivery?.partnerName ? { name: delivery.partnerName, phone: delivery.partnerPhone } : undefined
              }}
              onDataRefresh={loadDashboardData}
            />
          </div>
        </PageTransition>
      </PullToRefresh>
    </DashboardLayout>
  );
}
