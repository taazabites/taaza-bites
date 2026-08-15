import { 
  runTransaction,
  doc,
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp, 
  serverTimestamp,
  QueryConstraint,
  startAfter,
  getDocs,
  Unsubscribe,
  arrayUnion,
  documentId
} from 'firebase/firestore';
import { db } from './db';
import { auth } from './auth';

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
      return headers;
    }
  } catch (e) {
    console.warn("Error getting ID token:", e);
  }

  const savedSim = localStorage.getItem('taaza_simulated_user');
  if (savedSim) {
    try {
      const parsed = JSON.parse(savedSim);
      if (parsed?.uid) {
        headers['Authorization'] = `Bearer sim_token_${parsed.uid}`;
      }
    } catch (e) {
      // ignore
    }
  }
  return headers;
}
import { plansCache } from '../lib/plans-cache';
import { 
  addDocument, 
  getDocument, 
  updateDocument, 
  deleteDocument,
  getDocuments, 
  subscribeToCollection, 
  subscribeToDocument 
} from './firestore';
import { 
  User, 
  SubscriptionPlan, 
  Subscription, 
  HealthAssessment, 
  Address, 
  Order, 
  Payment, 
  Meal, 
  MealSchedule, 
  Wallet, 
  RewardPoints,
  RewardTransaction,
  Referral,
  ReferralReward,
  Notification, 
  Coupon, 
  SupportTicket,
  MealReview, 
  AppFeedback,
  FAQ,
  SupportMessage,
  Setting,
  ServiceArea,
  WalletTransaction,
  KitchenQueueItem,
  Delivery,
  MealStatus,
  HealthProgress,
  DailyCheckIn,
  NutritionReport,
  WeightLog,
  MealAnalytics,
  MealItem
} from './collections';
import { writeBatch, getDoc, setDoc } from 'firebase/firestore';

// User Service
export const UserService = {
  getUser: (uid: string) => getDocument<User>('users', uid),
  createUser: (uid: string, data: Partial<User>) => addDocument('users', uid, {
    ...data,
    role: data.role || 'customer',
    status: 'active',
    walletBalance: 0,
    rewardPoints: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  }),
  updateUser: (uid: string, data: Partial<User>) => updateDocument('users', uid, {
    ...data,
    updatedAt: serverTimestamp(),
  }),
  updateLastLogin: (uid: string) => updateDocument('users', uid, {
    lastLogin: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }),
  subscribeUser: (uid: string, callback: (user: User | null) => void) => 
    subscribeToDocument<User>('users', uid, callback)
};

// Session Service
export const SessionService = {
  recordSession: async (userId: string) => {
    const sessionId = `sess_${Date.now()}`;
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Basic parser for device info
    let device = "Desktop";
    if (/android/i.test(userAgent)) device = "Android";
    else if (/iphone|ipad|ipod/i.test(userAgent)) device = "iOS";
    
    const sessionData = {
      id: sessionId,
      userId,
      device,
      userAgent,
      platform,
      ip: 'tracked-on-server', // In a real app, this would be set by a cloud function
      lastActive: serverTimestamp(),
      loginAt: serverTimestamp(),
      status: 'active'
    };

    await setDoc(doc(db, 'users', userId, 'sessions', sessionId), sessionData);
    return sessionId;
  },
  getSessions: async (userId: string) => {
    try {
      if (!userId) return [];
      return await getDocuments<any>(`users/${userId}/sessions`, [orderBy('lastActive', 'desc')]);
    } catch (err) {
      console.warn('Error fetching user sessions:', err);
      return [];
    }
  },
  revokeSession: async (userId: string, sessionId: string) => {
    try {
      if (!userId || !sessionId) return;
      await deleteDocument(`users/${userId}/sessions`, sessionId);
    } catch (err) {
      console.warn('Error revoking user session:', err);
    }
  }
};

// Subscription Service
export const SubscriptionService = {
  isNewUser: async (userId: string): Promise<boolean> => {
    if (!userId) return true;
    try {
      const subs = await getDocuments<any>('subscriptions', [where('userId', '==', userId), limit(1)]);
      if (subs.length > 0) return false;
      const ords = await getDocuments<any>('orders', [where('userId', '==', userId), limit(1)]);
      if (ords.length > 0) return false;
    } catch (e) {
      console.warn("isNewUser check error:", e);
    }
    return true;
  },
  getPlans: async () => {
    const cached = plansCache.getPlansSync();
    if (cached && cached.length > 0) {
      return cached.filter(p => p.active);
    }
    try {
      return await getDocuments<SubscriptionPlan>('subscriptionPlans', [
        where('active', '==', true)
      ]);
    } catch (e) {
      console.warn("getPlans fetch error:", e);
      return [];
    }
  },
  getActiveSubscription: async (userId: string) => {
    try {
      if (!userId) return null;
      const subs = await getDocuments<Subscription>('subscriptions', [
        where('userId', '==', userId)
      ]);
      return subs.find(s => s.status === 'active' || s.status === 'paused') || subs[0] || null;
    } catch (e) {
      console.warn("getActiveSubscription error:", e);
      return null;
    }
  },
  createDraftSubscription: (userId: string, planId: string) => {
    return addDocument('subscriptionDrafts', userId, { 
      userId, 
      planId, 
      status: 'draft', 
      selectedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },
  createSubscription: (data: Omit<Subscription, 'id'>) => {
    const id = `sub_${Date.now()}`;
    return addDocument('subscriptions', id, { ...data, createdAt: serverTimestamp() });
  },
  subscribeToUserSubscription: (userId: string, callback: (subs: Subscription[]) => void) =>
    subscribeToCollection<Subscription>('subscriptions', [
      where('userId', '==', userId)
    ], (subs) => {
      callback(subs.filter(s => s.status === 'active' || s.status === 'paused'));
    }),
  pauseSubscription: (id: string, reason?: string, startDate?: string, endDate?: string) => {
    const pauseEntry = {
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      reason: reason || 'User requested',
      createdAt: new Date().toISOString()
    };
    
    return updateDocument('subscriptions', id, { 
      status: 'paused', 
      paused: true,
      pauseHistory: arrayUnion(pauseEntry),
      updatedAt: serverTimestamp() 
    });
  },
  resumeSubscription: (id: string) => updateDocument('subscriptions', id, { 
    status: 'active', 
    paused: false,
    updatedAt: serverTimestamp() 
  }),
  cancelSubscription: (id: string, reason: string) => updateDocument('subscriptions', id, {
    status: 'cancelled',
    cancellationReason: reason,
    updatedAt: serverTimestamp()
  }),
  updateDeliveryDetails: (id: string, data: { deliveryAddressId?: string; deliveryTime?: string; deliveryInstructions?: string; mealPreference?: string[]; nextDeliveryDate?: string }) => 
    updateDocument('subscriptions', id, { ...data, updatedAt: serverTimestamp() })
};

// Meal Service

export const SubscriptionChangeService = {
  requestPause: (userId, subscriptionId, startDate, endDate, days, reason) => {
    const id = `pause_${Date.now()}`;
    return addDocument('pauseRequests', id, {
      userId,
      subscriptionId,
      startDate,
      endDate,
      days,
      reason: reason || '',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },
  requestResume: (userId, subscriptionId) => {
    const id = `resume_${Date.now()}`;
    // We can use the same pauseRequests collection with a special status or negative days,
    // but the spec asks for "Resume Request", let's store it in subscriptionChanges
    return addDocument('subscriptionChanges', id, {
      userId,
      subscriptionId,
      type: 'resume',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },
  requestPlanChange: (userId, subscriptionId, type, newPlanId) => {
    const id = `change_${Date.now()}`;
    return addDocument('subscriptionChanges', id, {
      userId,
      subscriptionId,
      type,
      newPlanId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};

export const MealCustomizationService = {
  requestCustomization: (userId, subscriptionId, mealScheduleId, originalMealId, type, details, newMealId) => {
    const id = `mc_${Date.now()}`;
    return addDocument('mealCustomizations', id, {
      userId,
      subscriptionId,
      mealScheduleId,
      originalMealId,
      newMealId: newMealId || null,
      type,
      details,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};

export interface AddOnItemDef {
  id: string;
  name: string;
  category: "Cold-Pressed Juices" | "Protein Smoothies & Shakes" | "Oats & Superfood Bowls" | "Herbal Teas & Tonics";
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
  badge?: string;
  ingredients: string[];
}

export const ADD_ON_CATALOG: AddOnItemDef[] = [
  {
    id: "addon_juice_green",
    name: "Cold-Pressed Green Cleanse Detox Juice",
    category: "Cold-Pressed Juices",
    description: "Pure cold-pressed green elixirs with organic celery, green apple, spinach, ginger, and Meyer lemon.",
    price: 99,
    calories: 85,
    protein: 2,
    carbs: 18,
    fat: 0,
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fm=webp&w=600",
    badge: "Best Seller",
    ingredients: ["Celery", "Green Apple", "Spinach", "Fresh Ginger", "Meyer Lemon"]
  },
  {
    id: "addon_juice_orange",
    name: "Valencia Orange Immunity Fuel Juice",
    category: "Cold-Pressed Juices",
    description: "Cold-pressed Valencia oranges, organic carrots, raw turmeric, and a hint of black pepper.",
    price: 99,
    calories: 110,
    protein: 2,
    carbs: 24,
    fat: 0,
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fm=webp&w=600",
    badge: "Immunity Boost",
    ingredients: ["Valencia Orange", "Organic Carrot", "Raw Turmeric", "Black Pepper", "Mint"]
  },
  {
    id: "addon_juice_beet",
    name: "Beetroot Pomegranate Energy Surge Juice",
    category: "Cold-Pressed Juices",
    description: "Nitrate-rich cold-pressed beetroot, ruby pomegranate, crisp mint, and soaked chia seeds.",
    price: 99,
    calories: 105,
    protein: 3,
    carbs: 22,
    fat: 1,
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fm=webp&w=600",
    badge: "Stamina Boost",
    ingredients: ["Beetroot", "Pomegranate", "Peppermint", "Soaked Chia Seeds", "Rock Salt"]
  },
  {
    id: "addon_smoothie_berry",
    name: "Wild Berry Organic Hemp Protein Smoothie",
    category: "Protein Smoothies & Shakes",
    description: "Antioxidant-loaded wild blueberries, organic hemp protein, unsweetened almond milk & chia seeds.",
    price: 149,
    calories: 220,
    protein: 18,
    carbs: 26,
    fat: 5,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fm=webp&w=600",
    badge: "18g Organic Protein",
    ingredients: ["Wild Blueberries", "Organic Hemp Protein", "Unsweetened Almond Milk", "Chia Seeds", "Stevia"]
  },
  {
    id: "addon_smoothie_cacao",
    name: "Avocado Raw Cacao Whey Power Shake",
    category: "Protein Smoothies & Shakes",
    description: "Creamy Hass avocado, raw organic cacao powder, grass-fed whey isolate, and natural dates.",
    price: 149,
    calories: 290,
    protein: 26,
    carbs: 22,
    fat: 12,
    image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fm=webp&w=600",
    badge: "26g Whey Isolate",
    ingredients: ["Hass Avocado", "Raw Organic Cacao", "Grass-fed Whey Isolate", "Medjool Dates", "A2 Milk"]
  },
  {
    id: "addon_smoothie_pb_banana",
    name: "Peanut Butter Banana Oats Power Shake",
    category: "Protein Smoothies & Shakes",
    description: "Natural roasted peanut butter, ripe banana, rolled oats, and vanilla whey protein.",
    price: 139,
    calories: 320,
    protein: 24,
    carbs: 38,
    fat: 10,
    image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fm=webp&w=600",
    badge: "Post-Workout",
    ingredients: ["Natural Peanut Butter", "Robusta Banana", "Rolled Oats", "Vanilla Whey Isolate"]
  },
  {
    id: "addon_bowl_oats",
    name: "Metabolic Rolled Oats & Almond Butter Bowl",
    category: "Oats & Superfood Bowls",
    description: "Warm slow-cooked rolled oats with creamy roasted almond butter, fresh berries, and flax seeds.",
    price: 129,
    calories: 280,
    protein: 12,
    carbs: 42,
    fat: 9,
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fm=webp&w=600",
    badge: "High Fiber",
    ingredients: ["Rolled Oats", "Almond Butter", "Fresh Strawberries", "Flaxseeds", "Ceylon Cinnamon"]
  },
  {
    id: "addon_bowl_parfait",
    name: "Probiotic A2 Greek Yogurt & Honey Parfait",
    category: "Oats & Superfood Bowls",
    description: "Fermented A2 Greek yogurt with fresh Alphonso mango/berries, raw forest honey, and crushed walnuts.",
    price: 119,
    calories: 210,
    protein: 16,
    carbs: 22,
    fat: 6,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fm=webp&w=600",
    badge: "Probiotic",
    ingredients: ["A2 Probiotic Greek Yogurt", "Alphonso Mango / Berries", "Raw Forest Honey", "Crushed Walnuts"]
  },
  {
    id: "addon_bowl_chia",
    name: "Organic Coconut Chia Seed Pudding Bowl",
    category: "Oats & Superfood Bowls",
    description: "Overnight chia seeds soaked in light coconut milk, garnished with toasted almonds and vanilla bean.",
    price: 109,
    calories: 190,
    protein: 7,
    carbs: 18,
    fat: 11,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fm=webp&w=600",
    badge: "Omega-3 Rich",
    ingredients: ["Organic Chia Seeds", "Light Coconut Milk", "Toasted Almond Flakes", "Natural Vanilla Bean"]
  },
  {
    id: "addon_tea_matcha",
    name: "Ceremonial Matcha Organic Detox Green Tea",
    category: "Herbal Teas & Tonics",
    description: "Authentic Uji Japanese ceremonial matcha infused with organic lemongrass and wild raw honey.",
    price: 79,
    calories: 35,
    protein: 1,
    carbs: 8,
    fat: 0,
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fm=webp&w=600",
    badge: "Calming Energy",
    ingredients: ["Ceremonial Uji Matcha", "Organic Lemongrass", "Wild Raw Honey"]
  }
];

export const AddOnService = {
  getCatalog: () => ADD_ON_CATALOG,
  
  orderAddOn: async (params: {
    userId: string;
    addOn: AddOnItemDef;
    date: string; // yyyy-MM-dd
    mealSlot: "Breakfast" | "Lunch" | "Snacks" | "Dinner";
    quantity?: number;
    paymentMethod: "wallet" | "cod" | "online";
    notes?: string;
  }) => {
    const { userId, addOn, date, mealSlot, quantity = 1, paymentMethod, notes = "" } = params;
    const totalCost = addOn.price * quantity;
    const orderId = `addon_${Date.now()}`;

    // 1. If payment method is wallet, handle wallet deduction
    if (paymentMethod === "wallet") {
      const wallet = await WalletService.getWallet(userId);
      const balance = wallet?.balance || 0;
      if (balance < totalCost) {
        throw new Error(`Insufficient wallet balance (Available: ₹${balance}, Required: ₹${totalCost}). Please top up your wallet.`);
      }
      await WalletService.addTransaction(
        userId,
        totalCost,
        'debit',
        `Scheduled Add-on: ${addOn.name} for ${date} (${mealSlot})`,
        orderId
      );
    }

    // 2. Save order to addonOrders collection
    const orderDoc = {
      id: orderId,
      userId,
      addOnId: addOn.id,
      addOnName: addOn.name,
      category: addOn.category,
      price: addOn.price,
      quantity,
      totalCost,
      date,
      mealSlot,
      status: "Scheduled",
      paymentMethod,
      notes,
      image: addOn.image,
      calories: addOn.calories * quantity,
      protein: addOn.protein * quantity,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDocument('addonOrders', orderId, orderDoc);

    // 3. Attach directly to user's dailyMeals doc for that date so it shows up in daily timeline
    try {
      const dailyMealsRef = doc(db, 'users', userId, 'dailyMeals', date);
      const snap = await getDoc(dailyMealsRef);
      let mealsList: any[] = [];
      if (snap.exists() && snap.data()?.meals) {
        mealsList = [...snap.data().meals];
      }

      // Check if there is an item for this mealSlot
      const slotIndex = mealsList.findIndex((m: any) => m.type?.toLowerCase() === mealSlot.toLowerCase());

      const addOnMealObj = {
        id: `addon_item_${orderId}`,
        name: `[ADD-ON] ${addOn.name}`,
        type: mealSlot,
        category: addOn.category,
        calories: addOn.calories * quantity,
        protein: addOn.protein * quantity,
        carbs: addOn.carbs * quantity,
        fat: addOn.fat * quantity,
        portionSize: `${quantity}x ${addOn.name.split(" ")[0]}`,
        image: addOn.image,
        chefNotes: `Scheduled Add-on (${quantity}x) • ${notes || 'Freshly prepared'}`,
        ingredients: addOn.ingredients,
        deliveryStatus: "Preparing",
        isAddOn: true,
        addOnOrderId: orderId
      };

      if (slotIndex >= 0) {
        // Append add-on to the existing meal's chef notes or add as a secondary item
        const existingMeal = mealsList[slotIndex];
        const existingNotes = existingMeal.chefNotes || "";
        existingMeal.chefNotes = `${existingNotes ? existingNotes + ' | ' : ''}➕ Scheduled Add-on: ${quantity}x ${addOn.name}`;
        if (!existingMeal.scheduledAddOns) existingMeal.scheduledAddOns = [];
        existingMeal.scheduledAddOns.push({
          id: orderId,
          name: addOn.name,
          quantity,
          price: addOn.price,
          image: addOn.image,
          category: addOn.category
        });
      } else {
        // Create new entry for this meal slot
        mealsList.push(addOnMealObj);
      }

      await setDoc(dailyMealsRef, {
        date,
        userId,
        updatedAt: serverTimestamp(),
        meals: mealsList
      }, { merge: true });

      // Award 25 TaazaPoints for scheduling healthy add-ons!
      await RewardService.awardPoints(userId, 25, `Healthy Add-on Scheduled (${addOn.name})`, orderId);

    } catch (err) {
      console.warn("Could not sync add-on with dailyMeals subcollection:", err);
    }

    return {
      success: true,
      orderId,
      message: `${addOn.name} (${quantity}x) successfully scheduled for ${date} (${mealSlot})!`
    };
  },

  getUserAddOnOrders: (userId: string) => 
    getDocuments<any>('addonOrders', [where('userId', '==', userId), limit(50)])
};

export const MealService = {
  getMeals: (category?: string) => {
    const constraints: QueryConstraint[] = [];
    if (category) constraints.push(where('category', '==', category));
    return getDocuments<Meal>('meals', constraints);
  },
  getMealById: (id: string) => getDocument<Meal>('meals', id),
  getMealsByIds: (ids: string[]) => {
    if (!ids || ids.length === 0) return Promise.resolve([]);
    const uniqueIds = Array.from(new Set(ids)).filter(id => !!id);
    if (uniqueIds.length === 0) return Promise.resolve([]);
    // Firestore 'in' query supports up to 30 values
    return getDocuments<Meal>('meals', [where(documentId(), 'in', uniqueIds.slice(0, 30))]);
  },
  getMealSchedules: (userId: string, date: string) => 
    getDocuments<MealSchedule>('mealSchedules', [
      where('userId', '==', userId),
      where('date', '==', date)
    ]),
  getWeeklySchedule: async (userId: string, refDate: Date = new Date()) => {
    const startOfWeek = new Date(refDate);
    startOfWeek.setDate(refDate.getDate() - refDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startStr = startOfWeek.toISOString().split('T')[0];
    const endStr = endOfWeek.toISOString().split('T')[0];

    return getDocuments<MealSchedule>('mealSchedules', [
      where('userId', '==', userId),
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    ]);
  },
  subscribeToSchedules: (userId: string, startDate: string, endDate: string, callback: (schedules: MealSchedule[]) => void) =>
    subscribeToCollection<MealSchedule>('mealSchedules', [
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    ], (data) => {
      // Sort by date and meal type priority
      const mealOrder = ['Breakfast', 'Lunch', 'Dinner'];
      const sorted = [...data].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType);
      });
      callback(sorted);
    }),
  
  skipMeal: async (scheduleId: string, userId: string) => {
    return runTransaction(db, async (transaction) => {
      const scheduleRef = doc(db, 'mealSchedules', scheduleId);
      const scheduleDoc = await transaction.get(scheduleRef);
      if (!scheduleDoc.exists()) throw new Error("Schedule not found");
      if (scheduleDoc.data().userId !== userId) throw new Error("Unauthorized");

      transaction.update(scheduleRef, {
        deliveryStatus: 'skipped',
        status: 'skipped',
        updatedAt: serverTimestamp()
      });
    });
  },
  unskipMeal: async (scheduleId: string, userId: string) => {
    return runTransaction(db, async (transaction) => {
      const scheduleRef = doc(db, 'mealSchedules', scheduleId);
      const scheduleDoc = await transaction.get(scheduleRef);
      if (!scheduleDoc.exists()) throw new Error("Schedule not found");
      
      const walletRef = doc(db, 'wallets', userId);
      const walletDoc = await transaction.get(walletRef);
      
      const deductAmount = 350;

      transaction.update(scheduleRef, {
        deliveryStatus: 'pending',
        updatedAt: serverTimestamp()
      });

      let currentBalance = 0;
      if (walletDoc.exists()) {
        currentBalance = walletDoc.data().balance || 0;
        const newBalance = Math.max(0, currentBalance - deductAmount);
        transaction.update(walletRef, {
          balance: newBalance,
          updatedAt: serverTimestamp()
        });
      }
      
      const txRef = doc(collection(db, 'walletTransactions'));
      transaction.set(txRef, {
        userId,
        type: 'debit',
        amount: deductAmount,
        reason: 'Debit for restored meal',
        referenceId: scheduleId,
        balanceBefore: currentBalance,
        balanceAfter: Math.max(0, currentBalance - deductAmount),
        createdAt: serverTimestamp()
      });
    });
  }
};

// Health Service
export const HealthService = {
  getAssessment: (userId: string) => getDocument<HealthAssessment>('healthAssessments', userId),
  saveAssessment: (userId: string, data: Partial<HealthAssessment>) => addDocument('healthAssessments', userId, {
    ...data,
    userId,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp()
  }),
  updateAssessment: (userId: string, data: Partial<HealthAssessment>) => updateDocument('healthAssessments', userId, {
    ...data,
    updatedAt: serverTimestamp()
  }),
  subscribeToAssessment: (userId: string, callback: (data: HealthAssessment | null) => void) =>
    subscribeToDocument<HealthAssessment>('healthAssessments', userId, callback),
  
  getDailyCheckIn: (userId: string, date: string) => 
    getDocuments<DailyCheckIn>('dailyCheckIns', [
      where('userId', '==', userId),
      where('date', '==', date)
    ]),
  saveDailyCheckIn: (userId: string, data: Partial<DailyCheckIn>) => {
    const id = `checkin_${userId}_${data.date}`;
    return addDocument('dailyCheckIns', id, {
      ...data,
      userId,
      createdAt: serverTimestamp()
    });
  }
};

// Order & Payment Service
export const OrderService = {
  getOrders: async (userId: string, pageSize: number = 10, lastDoc?: any) => {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId)
    ];
    const docs = await getDocuments<Order>('orders', constraints);
    docs.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
    });
    return docs.slice(0, pageSize);
  },
  createOrder: (data: Omit<Order, 'id'>) => {
    const id = `ord_${Date.now()}`;
    return addDocument('orders', id, { ...data, createdAt: serverTimestamp() });
  }
};

export const PaymentService = {
  getPayments: (userId: string) => getDocuments<Payment>('payments', [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ]),
  createPayment: (data: Omit<Payment, 'id'>) => {
    const id = `pay_${Date.now()}`;
    return addDocument('payments', id, { ...data, createdAt: serverTimestamp() });
  }
};

// Address Service
export const AddressService = {
  getAddresses: (userId: string) => getDocuments<Address>('addresses', [where('userId', '==', userId)]),
  getAddress: (id: string) => getDocument<Address>('addresses', id),
  addAddress: async (userId: string, data: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const id = `addr_${Date.now()}`;
    const timestamp = serverTimestamp();
    
    if (data.default) {
      try {
        const addresses = await getDocuments<Address>('addresses', [where('userId', '==', userId)]);
        const defaultAddrs = addresses.filter(a => a.default);
        for (const addr of defaultAddrs) {
          await updateDocument('addresses', addr.id, { default: false, updatedAt: timestamp });
        }
      } catch (e) {
        console.warn("Error resetting default address on add:", e);
      }
    }
    
    return addDocument('addresses', id, { 
      ...data, 
      userId, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp 
    });
  },
  updateAddress: async (id: string, data: Partial<Address>) => {
    const timestamp = serverTimestamp();
    if (data.default) {
      try {
        const addrDoc = await getDocument<Address>('addresses', id);
        if (addrDoc && addrDoc.userId) {
          const defaultAddresses = await getDocuments<Address>('addresses', [
            where('userId', '==', addrDoc.userId)
          ]);
          for (const addr of defaultAddresses) {
            if (addr.id !== id && addr.default) {
              await updateDocument('addresses', addr.id, { default: false, updatedAt: timestamp });
            }
          }
        }
      } catch (e) {
        console.warn("Error resetting default address on update:", e);
      }
    }
    return updateDocument('addresses', id, { ...data, updatedAt: timestamp });
  },
  deleteAddress: (id: string) => deleteDocument('addresses', id),
  subscribeToAddresses: (userId: string, callback: (addresses: Address[]) => void) =>
    subscribeToCollection<Address>('addresses', [where('userId', '==', userId)], callback)
};

// Wallet & Rewards Service
export const WalletService = {
  getWallet: (userId: string) => getDocument<Wallet>('wallets', userId),
  ensureWallet: async (userId: string) => {
    const wallet = await getDocument<Wallet>('wallets', userId);
    if (!wallet) {
      const newWallet: Omit<Wallet, 'id'> = {
        userId,
        balance: 0,
        cashbackAvailable: 0,
        cashbackPending: 0,
        cashbackLifetime: 0,
        updatedAt: serverTimestamp() as any
      };
      await addDocument('wallets', userId, newWallet);
      return { ...newWallet, userId } as Wallet;
    }
    return wallet;
  },
  subscribeToWallet: (userId: string, callback: (wallet: Wallet | null) => void) =>
    subscribeToDocument<Wallet>('wallets', userId, callback),
  getTransactions: (userId: string) => getDocuments<WalletTransaction>('walletTransactions', [
    where('userId', '==', userId),
    limit(100)
  ]),
  addTransaction: async (userId: string, amount: number, type: 'credit' | 'debit', reason: string, referenceId: string) => {
    return runTransaction(db, async (transaction) => {
      const walletRef = doc(db, 'wallets', userId);
      const walletDoc = await transaction.get(walletRef);
      
      let currentBalance = 0;
      if (walletDoc.exists()) {
        currentBalance = walletDoc.data().balance || 0;
      }

      const newBalance = type === 'credit' ? currentBalance + amount : Math.max(0, currentBalance - amount);
      
      transaction.set(walletRef, {
        userId,
        balance: newBalance,
        updatedAt: serverTimestamp()
      }, { merge: true });

      const txRef = doc(collection(db, 'walletTransactions'));
      transaction.set(txRef, {
        id: txRef.id,
        userId,
        type,
        amount,
        reason,
        referenceId,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        createdAt: serverTimestamp()
      });

      // Notification
      const notifRef = doc(collection(db, 'notifications'));
      transaction.set(notifRef, {
        id: notifRef.id,
        userId,
        title: type === 'credit' ? "Wallet Credited! 💰" : "Wallet Debited! 💳",
        message: type === 'credit' ? `Amount of ₹${amount} credited to your wallet for: ${reason}` : `Amount of ₹${amount} debited from your wallet for: ${reason}`,
        type: 'wallet',
        read: false,
        createdAt: serverTimestamp()
      });
    });
  }
};

export const RewardService = {
  getRewardPoints: (userId: string) => getDocument<RewardPoints>('rewardPoints', userId),
  ensureRewardPoints: async (userId: string) => {
    const rewards = await getDocument<RewardPoints>('rewardPoints', userId);
    if (!rewards) {
      const newRewards: Omit<RewardPoints, 'id'> = {
        userId,
        currentPoints: 0,
        lifetimePoints: 0,
        pointsExpiringSoon: 0,
        streakCount: 0,
        lastCheckInDate: "",
        checkInHistory: [],
        updatedAt: serverTimestamp() as any
      };
      await addDocument('rewardPoints', userId, newRewards);
      return { ...newRewards, userId } as RewardPoints;
    }
    return rewards;
  },
  subscribeToRewardPoints: (userId: string, callback: (reward: RewardPoints | null) => void) =>
    subscribeToDocument<RewardPoints>('rewardPoints', userId, callback),
  dailyCheckIn: async (userId: string) => {
    return runTransaction(db, async (transaction) => {
      const rewardRef = doc(db, 'rewardPoints', userId);
      const rewardDoc = await transaction.get(rewardRef);
      
      let currentPoints = 0;
      let lifetimePoints = 0;
      let streakCount = 0;
      let lastCheckInDate = "";
      let checkInHistory: string[] = [];
      let pointsExpiringSoon = 0;

      if (rewardDoc.exists()) {
        const data = rewardDoc.data() as RewardPoints;
        currentPoints = data.currentPoints || 0;
        lifetimePoints = data.lifetimePoints || 0;
        streakCount = data.streakCount || 0;
        lastCheckInDate = data.lastCheckInDate || "";
        checkInHistory = data.checkInHistory || [];
        pointsExpiringSoon = data.pointsExpiringSoon || 0;
      }

      // Today's date as yyyy-MM-dd
      const todayStr = new Date().toISOString().split('T')[0];

      if (lastCheckInDate === todayStr) {
        throw new Error("Already checked in today!");
      }

      // Check if consecutive
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastCheckInDate === yesterdayStr) {
        streakCount += 1;
      } else {
        streakCount = 1; // reset streak or start new
      }

      // Calculate reward: 10 points base + 5 points per streak day, max 50 points
      const pointsReward = Math.min(50, 10 + (streakCount - 1) * 5);

      // Create transaction record
      const txRef = doc(collection(db, 'rewardTransactions'));
      const notifRef = doc(collection(db, 'notifications'));

      transaction.set(rewardRef, {
        userId,
        currentPoints: currentPoints + pointsReward,
        lifetimePoints: lifetimePoints + pointsReward,
        pointsExpiringSoon,
        streakCount,
        lastCheckInDate: todayStr,
        checkInHistory: arrayUnion(todayStr),
        updatedAt: serverTimestamp()
      }, { merge: true });

      transaction.set(txRef, {
        id: txRef.id,
        userId,
        type: 'credit',
        points: pointsReward,
        reason: `Daily Check-In (Streak Day ${streakCount})`,
        referenceId: 'daily_checkin',
        createdAt: serverTimestamp()
      });

      transaction.set(notifRef, {
        id: notifRef.id,
        userId,
        title: "Check-in Streak Active! 🔥",
        message: `Checked in successfully! Streak Day ${streakCount}: +${pointsReward} Reward Points added.`,
        type: 'reward',
        read: false,
        createdAt: serverTimestamp()
      });

      return {
        success: true,
        pointsEarned: pointsReward,
        streakCount,
        lastCheckInDate: todayStr
      };
    });
  },
  redeemPoints: async (userId: string, points: number, amount: number) => {
    return runTransaction(db, async (transaction) => {
      const rewardRef = doc(db, 'rewardPoints', userId);
      const rewardDoc = await transaction.get(rewardRef);
      if (!rewardDoc.exists()) throw new Error("Reward account not found");
      
      const currentPoints = rewardDoc.data().currentPoints || 0;
      if (currentPoints < points) throw new Error("Insufficient points");

      const walletRef = doc(db, 'wallets', userId);
      const walletDoc = await transaction.get(walletRef);

      transaction.update(rewardRef, {
        currentPoints: currentPoints - points,
        updatedAt: serverTimestamp()
      });

      const txRef = doc(collection(db, 'rewardTransactions'));
      transaction.set(txRef, {
        userId,
        type: 'debit',
        points: points,
        reason: 'Redeemed for wallet credit',
        referenceId: txRef.id,
        createdAt: serverTimestamp()
      });

      let currentBalance = 0;
      if (walletDoc.exists()) {
        currentBalance = walletDoc.data().balance || 0;
        transaction.update(walletRef, {
          balance: currentBalance + amount,
          updatedAt: serverTimestamp()
        });
      } else {
        transaction.set(walletRef, {
          userId,
          balance: amount,
          cashbackAvailable: 0,
          cashbackPending: 0,
          cashbackLifetime: 0,
          updatedAt: serverTimestamp()
        });
      }

      const walletTxRef = doc(collection(db, 'walletTransactions'));
      transaction.set(walletTxRef, {
        userId,
        type: 'credit',
        amount: amount,
        reason: 'Reward points redemption',
        referenceId: txRef.id,
        balanceBefore: currentBalance,
        balanceAfter: currentBalance + amount,
        createdAt: serverTimestamp()
      });
    });
  },
  getTransactions: (userId: string) => getDocuments<RewardTransaction>('rewardTransactions', [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  ]),
  addPoints: async (userId: string, points: number, reason: string) => {
    return runTransaction(db, async (transaction) => {
      const rewardRef = doc(db, 'rewardPoints', userId);
      const rewardDoc = await transaction.get(rewardRef);
      
      const currentPoints = rewardDoc.exists() ? (rewardDoc.data().currentPoints || 0) : 0;
      
      if (!rewardDoc.exists()) {
        transaction.set(rewardRef, {
          userId,
          currentPoints: points,
          lifetimePoints: points,
          streakCount: 0,
          updatedAt: serverTimestamp()
        });
      } else {
        transaction.update(rewardRef, {
          currentPoints: currentPoints + points,
          lifetimePoints: (rewardDoc.data().lifetimePoints || 0) + points,
          updatedAt: serverTimestamp()
        });
      }

      const txRef = doc(collection(db, 'rewardTransactions'));
      transaction.set(txRef, {
        userId,
        type: 'credit',
        points: points,
        reason: reason,
        createdAt: serverTimestamp()
      });
    });
  }
};

export const ReferralService = {
  getReferralInfo: async (userId: string) => {
    const user = await getDocument<User>('users', userId);
    let referralCode = user?.referralCode || '';
    
    if (!referralCode && user) {
      // Generate a unique code if missing: First 4 chars of name + last 4 of UID
      const namePart = (user.displayName || 'TAAZA').slice(0, 4).toUpperCase();
      const uidPart = userId.slice(-4).toUpperCase();
      referralCode = `${namePart}${uidPart}`;
      
      // Update user doc with the new code
      await updateDocument('users', userId, { referralCode });
    }

    return {
      referralCode,
      referralLink: `https://taazabites.com/ref/${referralCode}`
    };
  },
  getReferrals: async (userId: string) => {
    try {
      return await getDocuments<Referral>('referrals', [
        where('referrerUserId', '==', userId)
      ]);
    } catch (err) {
      console.warn('Error fetching referrals:', err);
      return [];
    }
  },
  getReferralRewards: async (userId: string) => {
    try {
      return await getDocuments<ReferralReward>('referralRewards', [
        where('userId', '==', userId)
      ]);
    } catch (err) {
      console.warn('Error fetching referral rewards:', err);
      return [];
    }
  },
  validateReferralCode: async (code: string, userId: string) => {
    const cleanCode = code.trim().toUpperCase();
    // 1. Check if the referred user is actually a new user
    const isNew = await SubscriptionService.isNewUser(userId);
    if (!isNew) {
      return { 
        valid: false, 
        message: "Referral rewards are only eligible for new customers who haven't subscribed before." 
      };
    }

    const users = await getDocuments<User>('users', [where('referralCode', '==', cleanCode), limit(1)]);
    if (users.length === 0) return { valid: false, message: "Invalid referral code" };
    
    const referrer = users[0];
    if (referrer.uid === userId) return { valid: false, message: "Cannot refer yourself" };

    // Check if they were already referred
    const existing = await getDocuments<Referral>('referrals', [
      where('referredUserId', '==', userId),
      limit(1)
    ]);
    if (existing.length > 0) return { valid: false, message: "You have already claimed a referral reward" };

    return { 
      valid: true, 
      referrer,
      message: "Referral code applied! You will get ₹250 cashback after your first successful delivery." 
    };
  },
  processReferral: async (referrerCode: string, referredUserId: string) => {
    const cleanCode = referrerCode.trim().toUpperCase();
    // 1. Check if the referred user is actually a new user
    const isNew = await SubscriptionService.isNewUser(referredUserId);
    if (!isNew) {
      return { 
        success: false, 
        message: "Referral rewards are only eligible for new customers who haven't subscribed before." 
      };
    }

    const users = await getDocuments<User>('users', [where('referralCode', '==', cleanCode), limit(1)]);
    if (users.length === 0) return { success: false, message: "Invalid referral code. Please verify the code and try again." };
    
    const referrer = users[0];
    if (referrer.uid === referredUserId) return { success: false, message: "You cannot use your own referral code." };

    // Check if they were already referred
    const existing = await getDocuments<Referral>('referrals', [
      where('referredUserId', '==', referredUserId),
      limit(1)
    ]);
    if (existing.length > 0) return { success: false, message: "You have already claimed a referral reward on this account." };

    const id = `ref_${referrer.uid}_${referredUserId}`;
    await addDocument('referrals', id, {
      id,
      referrerUserId: referrer.uid,
      referredUserId: referredUserId,
      status: 'pending',
      rewardIssued: false,
      createdAt: serverTimestamp()
    });

    // Instantly credit ₹250 to the new user's wallet
    try {
      await WalletService.addTransaction(
        referredUserId,
        250,
        'credit',
        `Referral Signup Reward (Invited by ${referrer.displayName || 'a friend'})`,
        id
      );
      await RewardService.awardPoints(referredUserId, 100, `Referral Signup Bonus (${cleanCode})`, id);
    } catch (txErr) {
      console.warn("Wallet credit or points error during referral process:", txErr);
    }

    return { 
      success: true,
      amount: 250,
      points: 100,
      referrerName: referrer.displayName || 'a friend',
      message: `Referral code claimed! ₹250 wallet credit & 100 points added from ${referrer.displayName || 'your friend'}.`
    };
  },
  sendDirectInvitation: async (referrerUserId: string, referralCode: string, name: string, email: string, phone?: string) => {
    const simUserId = `sim_user_${Math.random().toString(36).substring(2, 10)}`;
    const id = `inv_${referrerUserId}_${Date.now()}`;
    await addDocument('referrals', id, {
      id,
      referralCode,
      referrerUserId,
      referredUserId: simUserId,
      referredName: name,
      referredEmail: email,
      referredPhone: phone || '',
      status: 'pending',
      rewardIssued: false,
      createdAt: serverTimestamp()
    });
    return { success: true, id };
  },
  simulateReferralConversion: async (referralId: string) => {
    try {
      await ReferralService.rewardReferral(referralId);
      return { success: true };
    } catch (err: any) {
      console.error('Error simulating conversion:', err);
      return { success: false, message: err.message || 'Simulation failed' };
    }
  },
  rewardReferral: async (referralId: string) => {
    return runTransaction(db, async (transaction) => {
      const refDoc = await transaction.get(doc(db, 'referrals', referralId));
      if (!refDoc.exists()) throw new Error("Referral not found");
      const refData = refDoc.data() as Referral;
      if (refData.status === 'rewarded') throw new Error("Referral already rewarded");

      const rewardAmount = 100; // ₹100 for each

      // Update Referrer Wallet
      const referrerWalletRef = doc(db, 'wallets', refData.referrerUserId);
      const referrerWalletDoc = await transaction.get(referrerWalletRef);
      const refBal = referrerWalletDoc.exists() ? referrerWalletDoc.data().balance || 0 : 0;
      transaction.set(referrerWalletRef, {
        balance: refBal + rewardAmount,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Update Referred Wallet
      const referredWalletRef = doc(db, 'wallets', refData.referredUserId);
      const referredWalletDoc = await transaction.get(referredWalletRef);
      const referredBal = referredWalletDoc.exists() ? referredWalletDoc.data().balance || 0 : 0;
      transaction.set(referredWalletRef, {
        balance: referredBal + rewardAmount,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Transactions
      const tx1 = doc(collection(db, 'walletTransactions'));
      transaction.set(tx1, {
        userId: refData.referrerUserId,
        type: 'credit',
        amount: rewardAmount,
        reason: 'Referral Reward',
        referenceId: referralId,
        createdAt: serverTimestamp()
      });

      const tx2 = doc(collection(db, 'walletTransactions'));
      transaction.set(tx2, {
        userId: refData.referredUserId,
        type: 'credit',
        amount: rewardAmount,
        reason: 'Welcome Referral Reward',
        referenceId: referralId,
        createdAt: serverTimestamp()
      });

      // Update Referral status
      transaction.update(doc(db, 'referrals', referralId), {
        status: 'rewarded',
        rewardIssued: true,
        completedAt: serverTimestamp()
      });

      // Notifications
      const n1 = doc(collection(db, 'notifications'));
      transaction.set(n1, {
        userId: refData.referrerUserId,
        title: "Referral Reward! 🎁",
        message: "Your friend joined and you earned ₹100 in your wallet!",
        type: 'referral',
        read: false,
        createdAt: serverTimestamp()
      });

      const n2 = doc(collection(db, 'notifications'));
      transaction.set(n2, {
        userId: refData.referredUserId,
        title: "Welcome Reward! 🎁",
        message: "You joined via referral and earned ₹100 in your wallet!",
        type: 'referral',
        read: false,
        createdAt: serverTimestamp()
      });
    });
  }
};

// Notification Service
export const NotificationService = {
  getNotifications: (userId: string, filter?: string) => {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    ];
    if (filter && filter !== 'all') {
      constraints.push(where('type', '==', filter));
    }
    return getDocuments<Notification>('notifications', constraints);
  },
  markAsRead: (id: string) => updateDocument('notifications', id, { read: true }),
  markAllAsRead: async (userId: string) => {
    const unread = await getDocuments<Notification>('notifications', [
      where('userId', '==', userId),
      where('read', '==', false)
    ]);
    const batch = writeBatch(db);
    unread.forEach(notif => {
      batch.update(doc(db, 'notifications', notif.id), { read: true });
    });
    return batch.commit();
  },
  deleteNotification: (id: string) => deleteDocument('notifications', id),
  subscribeToNotifications: (userId: string, callback: (notifications: Notification[]) => void) =>
    subscribeToCollection<Notification>('notifications', [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    ], callback)
};

// Health Assessment Service
export const HealthAssessmentService = {
  getAssessments: (userId: string) => getDocuments<HealthAssessment>('healthAssessments', [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ]),
  getLastAssessment: async (userId: string) => {
    const assessments = await getDocuments<HealthAssessment>('healthAssessments', [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    ]);
    return assessments[0] || null;
  },
  saveAssessment: async (userId: string, subscriptionId: string, data: Omit<HealthAssessment, 'id' | 'userId' | 'subscriptionId' | 'createdAt' | 'updatedAt'>) => {
    const id = `ha_${Date.now()}`;
    const assessmentData = { 
      ...data, 
      userId, 
      subscriptionId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await addDocument('healthAssessments', id, assessmentData);
    
    // Update subscription
    if (subscriptionId) {
      const subRef = doc(db, 'subscriptions', subscriptionId);
      await setDoc(subRef, {
        healthAssessmentCompleted: true,
        healthAssessmentId: id,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    
    return id;
  },
  updateAssessment: async (id: string, data: Partial<HealthAssessment>) => {
    return updateDocument('healthAssessments', id, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }
};

export const ServiceAreaService = {
  getServiceAreas: async () => {
    let areas = await getDocuments<ServiceArea>('serviceAreas', [where('active', '==', true)]).catch(() => []);
    
    // Filter out any non-Bengaluru areas (e.g. legacy Noida or Indirapuram test records)
    const blrAreas = areas.filter(area => {
      const city = (area.city || "").toLowerCase();
      const name = (area.name || "").toLowerCase();
      const areaName = (area.area || "").toLowerCase();
      const isNoidaOrNCR = city.includes("noida") || name.includes("indirapuram") || name.includes("noida") || areaName.includes("indirapuram");
      if (isNoidaOrNCR) return false;

      // Check if city is Bangalore/Bengaluru or pincode starts with 56
      const isBlrCity = city.includes("bangalore") || city.includes("bengaluru") || city === "";
      const hasBlrPin = area.pincode?.startsWith("56") || area.pincodes?.some(p => p.startsWith("56"));
      return isBlrCity || hasBlrPin;
    });

    const defaults: ServiceArea[] = [
      {
        id: "sa_hsr",
        name: "HSR Layout",
        area: "HSR Layout",
        hub: "Taaza Hub - HSR",
        city: "Bengaluru",
        subAreas: [
          "Sector 1",
          "Sector 2",
          "Sector 3",
          "Sector 4",
          "Sector 6",
          "Sector 7",
          "27th Main Road",
          "Agara"
        ],
        pincodes: ["560102", "560034"],
        active: true,
        deliveryFee: 0,
        minimumOrder: 0,
        pincode: "560102",
        polygonCoordinates: [
          { lat: 12.9081, lng: 77.6476 },
          { lat: 12.9150, lng: 77.6520 },
          { lat: 12.9180, lng: 77.6400 },
          { lat: 12.9050, lng: 77.6350 }
        ]
      },
      {
        id: "sa_koramangala",
        name: "Koramangala",
        area: "Koramangala",
        hub: "Taaza Hub - Koramangala",
        city: "Bengaluru",
        subAreas: [
          "1st Block",
          "3rd Block",
          "4th Block",
          "5th Block",
          "6th Block",
          "7th Block",
          "8th Block",
          "Sony World Signal Zone"
        ],
        pincodes: ["560034", "560095", "560047"],
        active: true,
        deliveryFee: 0,
        minimumOrder: 0,
        pincode: "560034",
        polygonCoordinates: [
          { lat: 12.9300, lng: 77.6100 },
          { lat: 12.9400, lng: 77.6150 },
          { lat: 12.9350, lng: 77.6300 },
          { lat: 12.9250, lng: 77.6250 }
        ]
      },
      {
        id: "sa_indiranagar",
        name: "Indiranagar",
        area: "Indiranagar",
        hub: "Taaza Hub - Indiranagar",
        city: "Bengaluru",
        subAreas: [
          "100ft Road",
          "12th Main",
          "HAL 2nd Stage",
          "HAL 3rd Stage",
          "Domlur",
          "Defence Colony",
          "CMH Road"
        ],
        pincodes: ["560038", "560008", "560071"],
        active: true,
        deliveryFee: 0,
        minimumOrder: 0,
        pincode: "560038",
        polygonCoordinates: [
          { lat: 12.9719, lng: 77.6412 },
          { lat: 12.9780, lng: 77.6480 },
          { lat: 12.9650, lng: 77.6520 },
          { lat: 12.9600, lng: 77.6380 }
        ]
      },
      {
        id: "sa_sarjapur",
        name: "Kasavanahalli & Sarjapur Rd",
        area: "Kasavanahalli & Sarjapur Road",
        hub: "Taaza Hub - Sarjapur",
        city: "Bengaluru",
        subAreas: [
          "Kasavanahalli",
          "Kaikondrahalli",
          "Doddakannelli",
          "Carmelaram",
          "Amrita Nagar",
          "Choodasandra",
          "Gattahalli"
        ],
        pincodes: ["560035", "560099", "560103"],
        active: true,
        deliveryFee: 0,
        minimumOrder: 0,
        pincode: "560035",
        polygonCoordinates: [
          { lat: 12.9100, lng: 77.6700 },
          { lat: 12.9200, lng: 77.6800 },
          { lat: 12.9150, lng: 77.6900 },
          { lat: 12.9000, lng: 77.6750 }
        ]
      },
      {
        id: "sa_bellandur",
        name: "Bellandur & ORR Tech Parks",
        area: "Bellandur & ORR Tech Parks",
        hub: "Taaza Hub - Bellandur",
        city: "Bengaluru",
        subAreas: [
          "Green Glen Layout",
          "RMZ Ecospace",
          "RMZ Ecoworld",
          "Embassy Tech Village",
          "Prestige Tech Park",
          "Kadubeesanahalli"
        ],
        pincodes: ["560103", "560087", "560037"],
        active: true,
        deliveryFee: 0,
        minimumOrder: 0,
        pincode: "560103",
        polygonCoordinates: [
          { lat: 12.9250, lng: 77.6700 },
          { lat: 12.9350, lng: 77.6850 },
          { lat: 12.9300, lng: 77.6950 },
          { lat: 12.9200, lng: 77.6800 }
        ]
      },
      {
        id: "sa_whitefield",
        name: "Whitefield",
        area: "Whitefield",
        hub: "Taaza Hub - Whitefield",
        city: "Bengaluru",
        subAreas: [
          "ITPL",
          "EPIP Zone",
          "Hope Farm",
          "Borewell Road",
          "Kadugodi",
          "Channasandra"
        ],
        pincodes: ["560066", "560067"],
        active: true,
        deliveryFee: 0,
        minimumOrder: 0,
        pincode: "560066",
        polygonCoordinates: [
          { lat: 12.9680, lng: 77.7490 },
          { lat: 12.9800, lng: 77.7600 },
          { lat: 12.9750, lng: 77.7700 },
          { lat: 12.9600, lng: 77.7550 }
        ]
      },
      {
        id: "sa_ecity",
        name: "Electronic City",
        area: "Electronic City",
        hub: "Taaza Hub - E-City",
        city: "Bengaluru",
        subAreas: [
          "Electronic City Phase 1",
          "Electronic City Phase 2",
          "Neeladri Nagar",
          "Wipro Gate",
          "Infosys Campus Zone"
        ],
        pincodes: ["560100", "560105"],
        active: true,
        deliveryFee: 0,
        minimumOrder: 0,
        pincode: "560100",
        polygonCoordinates: [
          { lat: 12.8450, lng: 77.6600 },
          { lat: 12.8580, lng: 77.6700 },
          { lat: 12.8500, lng: 77.6800 },
          { lat: 12.8380, lng: 77.6650 }
        ]
      },
      {
        id: "sa_jpnagar",
        name: "JP Nagar & Jayanagar",
        area: "JP Nagar & Jayanagar",
        hub: "Taaza Hub - South Blr",
        city: "Bengaluru",
        subAreas: [
          "JP Nagar 1st-8th Phase",
          "Jayanagar 3rd, 4th, 9th Block",
          "BTM Layout 1st & 2nd Stage",
          "Bannerghatta Road"
        ],
        pincodes: ["560078", "560011", "560076", "560068"],
        active: true,
        deliveryFee: 0,
        minimumOrder: 0,
        pincode: "560078",
        polygonCoordinates: [
          { lat: 12.9070, lng: 77.5850 },
          { lat: 12.9200, lng: 77.5950 },
          { lat: 12.9150, lng: 77.6050 },
          { lat: 12.9000, lng: 77.5900 }
        ]
      }
    ];

    if (blrAreas.length === 0) {
      return defaults;
    }

    return blrAreas;
  },
  getServiceAreaByPincode: async (pincode: string) => {
    const areas = await ServiceAreaService.getServiceAreas();
    const found = areas.find(area => 
      area.active && (area.pincode === pincode || area.pincodes?.includes(pincode))
    );
    return found || null;
  }
};

export const DeliveryRequestService = {
  createRequest: async (data: { name: string; phone: string; area: string; pincode: string }) => {
    const id = `req_${Date.now()}`;
    return addDocument('deliveryRequests', id, {
      ...data,
      createdAt: serverTimestamp()
    });
  }
};

export const FALLBACK_STATIC_MEALS: MealItem[] = [
  {
    id: "jain_multi_grain_khichdi",
    mealName: "Jain Multi-Grain Khichdi",
    category: "Breakfast",
    dietType: "Jain",
    goalTags: ["Weight Loss", "Heart Health", "Gut Health", "Senior Health", "Low GI"],
    calories: 280,
    protein: 10,
    carbs: 45,
    fat: 6,
    ingredients: ["Moong dal", "Broken wheat", "Ghee", "Turmeric", "Salt", "Jeera"],
    allergens: ["Dairy"],
    cuisine: "Mixed",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=80",
    active: true
  },
  {
    id: "spinach_oats_idli",
    mealName: "Spinach & Oats Idli",
    category: "Breakfast",
    dietType: "Veg",
    goalTags: ["Weight Loss", "Diabetes", "Heart Health", "PCOS", "Gut Health", "Low GI"],
    calories: 240,
    protein: 9,
    carbs: 40,
    fat: 4,
    ingredients: ["Oats flour", "Semolina", "Spinach puree", "Curd", "Mustard seeds"],
    allergens: ["Gluten", "Dairy"],
    cuisine: "South Indian",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
    active: true
  },
  {
    id: "high_protein_avocado_toast_with_eggs",
    mealName: "High-Protein Avocado Toast with Eggs",
    category: "Breakfast",
    dietType: "Egg",
    goalTags: ["Muscle Gain", "Sports Nutrition", "PCOS", "Fat Loss", "High Protein"],
    calories: 380,
    protein: 18,
    carbs: 22,
    fat: 14,
    ingredients: ["Whole-wheat bread", "Avocado", "Eggs", "Pepper", "Cherry tomatoes"],
    allergens: ["Gluten", "Eggs"],
    cuisine: "Continental",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80",
    active: true
  },
  {
    id: "egg_white_mushroom_scramble",
    mealName: "Egg White & Mushroom Scramble",
    category: "Breakfast",
    dietType: "Egg",
    goalTags: ["Weight Loss", "Fat Loss", "Muscle Gain", "Sports Nutrition", "Diabetes", "High Protein"],
    calories: 220,
    protein: 20,
    carbs: 8,
    fat: 10,
    ingredients: ["Egg whites", "Button mushrooms", "Spinach", "Olive oil", "Pepper"],
    allergens: ["Eggs"],
    cuisine: "Continental",
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&auto=format&fit=crop&q=80",
    active: true
  },
  {
    id: "spiced_chicken_keema_wrap",
    mealName: "Spiced Chicken Keema Wrap",
    category: "Breakfast",
    dietType: "Chicken",
    goalTags: ["Muscle Gain", "Sports Nutrition", "Office Wellness", "High Protein"],
    calories: 420,
    protein: 28,
    carbs: 35,
    fat: 12,
    ingredients: ["Minced chicken", "Whole wheat tortilla", "Yogurt spread", "Spices"],
    allergens: ["Gluten", "Dairy"],
    cuisine: "North Indian",
    image: "https://images.unsplash.com/photo-1626700051175-6518c4793f06?w=500&auto=format&fit=crop&q=80",
    active: true
  },
  {
    id: "tofu_moong_dal_chilla",
    mealName: "Tofu & Moong Dal Chilla",
    category: "Breakfast",
    dietType: "Jain",
    goalTags: ["Weight Loss", "Diabetes", "PCOS", "Heart Health", "Gut Health", "High Protein"],
    calories: 260,
    protein: 14,
    carbs: 32,
    fat: 6,
    ingredients: ["Yellow moong dal", "Tofu crumble", "Turmeric", "Green chili", "Coriander"],
    allergens: ["Soy"],
    cuisine: "North Indian",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=80",
    active: true
  },
  {
    id: "jain_bhindi_masala_with_jowar_roti",
    mealName: "Jain Bhindi Masala with Jowar Roti",
    category: "Lunch",
    dietType: "Jain",
    goalTags: ["Weight Loss", "Diabetes", "Low GI"],
    calories: 380,
    protein: 12,
    carbs: 58,
    fat: 9,
    ingredients: ["Okra", "Tomatoes", "Sorghum flour", "Spices"],
    allergens: [],
    cuisine: "North Indian",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
    active: true
  },
  {
    id: "jain_moong_dal_with_steamed_rice",
    mealName: "Jain Moong Dal with Steamed Rice & Salad",
    category: "Lunch",
    dietType: "Jain",
    goalTags: ["Heart Health", "Senior Health", "Gut Health"],
    calories: 420,
    protein: 16,
    carbs: 68,
    fat: 8,
    ingredients: ["Yellow moong dal", "Rice", "Cucumber", "Tomato", "Jeera"],
    allergens: [],
    cuisine: "North Indian",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
    active: true
  },
  {
    id: "low_cal_kadhi_pakoda_brown_rice",
    mealName: "Low-Calorie Kadhi Pakoda with Brown Rice",
    category: "Lunch",
    dietType: "Veg",
    goalTags: ["Weight Loss", "Gut Health", "Senior Health", "Office Wellness", "Low GI"],
    calories: 410,
    protein: 14,
    carbs: 65,
    fat: 9,
    ingredients: ["Gram flour", "Sour yogurt", "Brown basmati rice", "Spices", "Onion"],
    allergens: ["Dairy"],
    cuisine: "North Indian",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
    active: true
  },
  {
    id: "paneer_tikka_salad",
    mealName: "High-Protein Paneer Tikka Salad",
    category: "Lunch",
    dietType: "Veg",
    goalTags: ["Muscle Gain", "Sports Nutrition", "PCOS", "Fat Loss", "High Protein"],
    calories: 380,
    protein: 24,
    carbs: 18,
    fat: 16,
    ingredients: ["Cottage cheese", "Bell peppers", "Greens", "Mint curd dressing"],
    allergens: ["Dairy"],
    cuisine: "Continental",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
    active: true
  },
  {
    id: "grilled_chicken_quinoa_bowl",
    mealName: "Grilled Chicken & Quinoa Energy Bowl",
    category: "Lunch",
    dietType: "Chicken",
    goalTags: ["Muscle Gain", "Sports Nutrition", "Weight Loss", "Fat Loss", "High Protein"],
    calories: 460,
    protein: 36,
    carbs: 42,
    fat: 10,
    ingredients: ["Chicken breast", "Quinoa", "Roasted broccoli", "Lemon mustard vinaigrette"],
    allergens: [],
    cuisine: "Continental",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
    active: true
  },
  {
    id: "jain_dal_panchmel",
    mealName: "Jain Dal Panchmel with Barley Roti",
    category: "Dinner",
    dietType: "Jain",
    goalTags: ["Diabetes", "Heart Health", "Gut Health", "Senior Health", "Low GI"],
    calories: 390,
    protein: 16,
    carbs: 58,
    fat: 8,
    ingredients: ["Five mixed lentils", "Barley flour", "Ghee", "Jeera", "Turmeric"],
    allergens: ["Dairy", "Gluten"],
    cuisine: "North Indian",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
    active: true
  },
  {
    id: "baked_chicken_breast_veggies",
    mealName: "Baked Chicken Breast with Roasted Veggies",
    category: "Dinner",
    dietType: "Chicken",
    goalTags: ["Muscle Gain", "Sports Nutrition", "PCOS", "Fat Loss", "High Protein"],
    calories: 450,
    protein: 38,
    carbs: 24,
    fat: 11,
    ingredients: ["Chicken breast", "Zucchini", "Carrots", "Olive oil", "Rosemary marinade"],
    allergens: [],
    cuisine: "Continental",
    image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=500&auto=format&fit=crop&q=80",
    active: true
  }
];

export const MealItemService = {
  getMealItems: async () => {
    try {
      const items = await getDocuments<MealItem>('mealItems', [where('active', '==', true)]);
      if (items && items.length > 0) {
        return items;
      }
    } catch (err) {
      console.warn("Firestore meal items fetch failed, using fallback static meal list:", err);
    }
    // Static fallback list ensuring /plans always renders beautiful meal previews
    return FALLBACK_STATIC_MEALS;
  },
  seedMealItems: async () => {
    try {
      const existing = await getDocuments<MealItem>('mealItems', [limit(1)]);
      if (existing.length > 0) {
        console.log("Meal items already seeded.");
        return;
      }
    } catch (e) {
      console.warn("Could not check existing meal items, will attempt to seed anyway.", e);
    }

    const seedMeals: Omit<MealItem, 'id'>[] = FALLBACK_STATIC_MEALS.map(({ id, ...m }) => m);

    try {
      for (const meal of seedMeals) {
        const id = meal.mealName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        await setDoc(doc(db, 'mealItems', id), {
          ...meal,
          id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      console.log("Successfully seeded meal items into mealItems collection.");
    } catch (seedErr) {
      console.warn("Non-fatal: Seeding meal items to Firestore skipped (permissions/offline):", seedErr);
    }
  }
};

/*
    const seedMeals: Omit<MealItem, 'id'>[] = [
      // BREAKFASTS
      {
        mealName: "Jain Multi-Grain Khichdi",
        category: "Breakfast",
        dietType: "Jain",
        goalTags: ["Weight Loss", "Heart Health", "Gut Health", "Senior Health", "Low GI"],
        calories: 280,
        protein: 10,
        carbs: 45,
        fat: 6,
        ingredients: ["Moong dal", "Broken wheat", "Ghee", "Turmeric", "Salt", "Jeera"],
        allergens: ["Dairy"],
        cuisine: "Mixed",
        image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Spinach & Oats Idli",
        category: "Breakfast",
        dietType: "Veg",
        goalTags: ["Weight Loss", "Diabetes", "Heart Health", "PCOS", "Gut Health", "Low GI"],
        calories: 240,
        protein: 9,
        carbs: 40,
        fat: 4,
        ingredients: ["Oats flour", "Semolina", "Spinach puree", "Curd", "Mustard seeds"],
        allergens: ["Gluten", "Dairy"],
        cuisine: "South Indian",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "High-Protein Avocado Toast with Eggs",
        category: "Breakfast",
        dietType: "Egg",
        goalTags: ["Muscle Gain", "Sports Nutrition", "PCOS", "Fat Loss", "High Protein"],
        calories: 380,
        protein: 18,
        carbs: 22,
        fat: 14,
        ingredients: ["Whole-wheat bread", "Avocado", "Eggs", "Pepper", "Cherry tomatoes"],
        allergens: ["Gluten", "Eggs"],
        cuisine: "Continental",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Egg White & Mushroom Scramble",
        category: "Breakfast",
        dietType: "Egg",
        goalTags: ["Weight Loss", "Fat Loss", "Muscle Gain", "Sports Nutrition", "Diabetes", "High Protein"],
        calories: 220,
        protein: 20,
        carbs: 8,
        fat: 10,
        ingredients: ["Egg whites", "Button mushrooms", "Spinach", "Olive oil", "Pepper"],
        allergens: ["Eggs"],
        cuisine: "Continental",
        image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Spiced Chicken Keema Wrap",
        category: "Breakfast",
        dietType: "Chicken",
        goalTags: ["Muscle Gain", "Sports Nutrition", "Office Wellness", "High Protein"],
        calories: 420,
        protein: 28,
        carbs: 35,
        fat: 12,
        ingredients: ["Minced chicken", "Whole wheat tortilla", "Yogurt spread", "Spices"],
        allergens: ["Gluten", "Dairy"],
        cuisine: "North Indian",
        image: "https://images.unsplash.com/photo-1626700051175-6518c4793f06?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Tofu & Moong Dal Chilla",
        category: "Breakfast",
        dietType: "Jain",
        goalTags: ["Weight Loss", "Diabetes", "PCOS", "Heart Health", "Gut Health", "High Protein"],
        calories: 260,
        protein: 14,
        carbs: 32,
        fat: 8,
        ingredients: ["Yellow moong dal", "Tofu crumble", "Salt", "Jeera"],
        allergens: ["Soy"],
        cuisine: "North Indian",
        image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Jain Vegetable Upma",
        category: "Breakfast",
        dietType: "Jain",
        goalTags: ["Weight Loss", "Heart Health", "Low GI"],
        calories: 210,
        protein: 6,
        carbs: 38,
        fat: 4,
        ingredients: ["Semolina", "Green peas", "Carrots", "Jeera", "Ghee"],
        allergens: ["Gluten", "Dairy"],
        cuisine: "South Indian",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Jain Soya Granules Poha",
        category: "Breakfast",
        dietType: "Jain",
        goalTags: ["Muscle Gain", "Weight Loss", "High Protein"],
        calories: 275,
        protein: 15,
        carbs: 42,
        fat: 6,
        ingredients: ["Flattened rice", "Soya granules", "Peanuts", "Jeera", "Turmeric"],
        allergens: ["Soy", "Nuts"],
        cuisine: "Mixed",
        image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Veggie Poha with Roasted Sprouts",
        category: "Breakfast",
        dietType: "Veg",
        goalTags: ["Weight Loss", "Heart Health", "Office Wellness", "Gut Health", "Low GI"],
        calories: 290,
        protein: 10,
        carbs: 48,
        fat: 5,
        ingredients: ["Flattened rice", "Carrots", "Peas", "Peanuts", "Sprouted moong", "Onion", "Mustard seeds"],
        allergens: ["Nuts"],
        cuisine: "Mixed",
        image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=80",
        active: true
      },

      // LUNCHES
      {
        mealName: "Jain Shahi Paneer with Millet Roti",
        category: "Lunch",
        dietType: "Jain",
        goalTags: ["Diabetes", "Heart Health", "Senior Health", "PCOS", "Low GI"],
        calories: 480,
        protein: 20,
        carbs: 52,
        fat: 18,
        ingredients: ["Paneer cubes", "Tomato melon seed gravy", "Finger millet flour", "Spices"],
        allergens: ["Dairy"],
        cuisine: "North Indian",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Jain Bhindi Masala with Jowar Roti",
        category: "Lunch",
        dietType: "Jain",
        goalTags: ["Weight Loss", "Diabetes", "Low GI"],
        calories: 380,
        protein: 12,
        carbs: 58,
        fat: 9,
        ingredients: ["Okra", "Tomatoes", "Sorghum flour", "Spices"],
        allergens: [],
        cuisine: "North Indian",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Jain Moong Dal with Steamed Rice & Veggie Salad",
        category: "Lunch",
        dietType: "Jain",
        goalTags: ["Heart Health", "Senior Health", "Gut Health"],
        calories: 420,
        protein: 16,
        carbs: 68,
        fat: 8,
        ingredients: ["Yellow moong dal", "Rice", "Cucumber", "Tomato", "Jeera"],
        allergens: [],
        cuisine: "North Indian",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Low-Calorie Kadhi Pakoda with Brown Rice",
        category: "Lunch",
        dietType: "Veg",
        goalTags: ["Weight Loss", "Gut Health", "Senior Health", "Office Wellness", "Low GI"],
        calories: 410,
        protein: 14,
        carbs: 65,
        fat: 9,
        ingredients: ["Gram flour", "Sour yogurt", "Brown basmati rice", "Spices", "Onion"],
        allergens: ["Dairy"],
        cuisine: "North Indian",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "High-Protein Paneer Tikka Salad",
        category: "Lunch",
        dietType: "Veg",
        goalTags: ["Muscle Gain", "Sports Nutrition", "PCOS", "Fat Loss", "High Protein"],
        calories: 380,
        protein: 22,
        carbs: 15,
        fat: 16,
        ingredients: ["Cottage cheese", "Bell peppers", "Yogurt marinade", "Mint chutney", "Cucumber"],
        allergens: ["Dairy"],
        cuisine: "Mixed",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Boiled Egg Salad with Herb Vinaigrette",
        category: "Lunch",
        dietType: "Egg",
        goalTags: ["Weight Loss", "Fat Loss", "PCOS", "Office Wellness", "High Protein"],
        calories: 320,
        protein: 18,
        carbs: 10,
        fat: 14,
        ingredients: ["Hard-boiled eggs", "Lettuce", "Cherry tomatoes", "Olive oil dressing", "Lemon"],
        allergens: ["Eggs"],
        cuisine: "Continental",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Grilled Chicken Breast with Quinoa",
        category: "Lunch",
        dietType: "Chicken",
        goalTags: ["Muscle Gain", "Sports Nutrition", "Fat Loss", "Weight Loss", "High Protein"],
        calories: 510,
        protein: 42,
        carbs: 38,
        fat: 10,
        ingredients: ["Chicken breast", "Quinoa", "Steamed broccoli", "Olive oil", "Garlic herb seasoning"],
        allergens: [],
        cuisine: "Continental",
        image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Homestyle Chicken Curry with Oats Roti",
        category: "Lunch",
        dietType: "Chicken",
        goalTags: ["Muscle Gain", "Sports Nutrition", "Office Wellness", "High Protein"],
        calories: 490,
        protein: 35,
        carbs: 45,
        fat: 14,
        ingredients: ["Lean chicken", "Oats flour", "Whole wheat", "Onion tomato gravy", "Spices"],
        allergens: ["Gluten"],
        cuisine: "North Indian",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&auto=format&fit=crop&q=80",
        active: true
      },

      // DINNERS
      {
        mealName: "Jain Dal Panchmel with Barley Roti",
        category: "Dinner",
        dietType: "Jain",
        goalTags: ["Diabetes", "Heart Health", "Gut Health", "Senior Health", "Low GI"],
        calories: 390,
        protein: 16,
        carbs: 58,
        fat: 8,
        ingredients: ["Five mixed lentils", "Barley flour", "Ghee", "Jeera", "Turmeric"],
        allergens: ["Dairy", "Gluten"],
        cuisine: "North Indian",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Jain Paneer Bhurji with Millet Paratha",
        category: "Dinner",
        dietType: "Jain",
        goalTags: ["Muscle Gain", "PCOS", "High Protein"],
        calories: 440,
        protein: 24,
        carbs: 38,
        fat: 16,
        ingredients: ["Crumbled paneer", "Tomatoes", "Millet flour", "Ghee", "Jeera"],
        allergens: ["Dairy"],
        cuisine: "North Indian",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Jain Vegetable Stew with Quinoa",
        category: "Dinner",
        dietType: "Jain",
        goalTags: ["Weight Loss", "Heart Health", "Gut Health", "Low GI"],
        calories: 320,
        protein: 12,
        carbs: 45,
        fat: 6,
        ingredients: ["Mixed vegetables", "Coconut milk", "Quinoa", "Jeera", "Turmeric"],
        allergens: [],
        cuisine: "Mixed",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Fibre-Rich Dal Tadka with Quinoa Khichdi",
        category: "Dinner",
        dietType: "Veg",
        goalTags: ["Weight Loss", "Diabetes", "Heart Health", "Gut Health", "Low GI"],
        calories: 360,
        protein: 14,
        carbs: 50,
        fat: 7,
        ingredients: ["Toor dal", "Quinoa", "Garlic", "Onion", "Tomatoes", "Ghee tempering"],
        allergens: ["Dairy"],
        cuisine: "South Indian",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Stir-Fry Tofu with Sesame Vegetables",
        category: "Dinner",
        dietType: "Veg",
        goalTags: ["Weight Loss", "Diabetes", "PCOS", "Fat Loss", "Office Wellness", "Low GI"],
        calories: 310,
        protein: 15,
        carbs: 18,
        fat: 12,
        ingredients: ["Firm tofu", "Broccoli", "Baby corn", "Sesame oil", "Soy sauce", "Sesame seeds"],
        allergens: ["Soy", "Sesame"],
        cuisine: "Continental",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Egg White Omelette with Mushrooms & Spinach",
        category: "Dinner",
        dietType: "Egg",
        goalTags: ["Weight Loss", "Fat Loss", "PCOS", "Sports Nutrition", "High Protein"],
        calories: 210,
        protein: 18,
        carbs: 8,
        fat: 9,
        ingredients: ["Egg whites", "Button mushrooms", "Spinach", "Pepper", "Toast slice"],
        allergens: ["Eggs", "Gluten"],
        cuisine: "Continental",
        image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Baked Chicken Breast with Roasted Veggies",
        category: "Dinner",
        dietType: "Chicken",
        goalTags: ["Muscle Gain", "Sports Nutrition", "PCOS", "Fat Loss", "High Protein"],
        calories: 450,
        protein: 38,
        carbs: 24,
        fat: 11,
        ingredients: ["Chicken breast", "Zucchini", "Carrots", "Olive oil", "Rosemary marinade"],
        allergens: [],
        cuisine: "Continental",
        image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&auto=format&fit=crop&q=80",
        active: true
      },
      {
        mealName: "Lemon Herb Fish with Garlic Beans",
        category: "Dinner",
        dietType: "Chicken",
        goalTags: ["Heart Health", "Weight Loss", "Fat Loss", "PCOS", "High Protein"],
        calories: 340,
        protein: 32,
        carbs: 14,
        fat: 10,
        ingredients: ["Basa fish fillet", "French beans", "Lemon herb drizzle", "Garlic", "Olive oil"],
        allergens: ["Fish"],
        cuisine: "Continental",
        image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&auto=format&fit=crop&q=80",
        active: true
      }
    ];

    for (const meal of seedMeals) {
      const id = meal.mealName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      await setDoc(doc(db, 'mealItems', id), {
        ...meal,
        id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    console.log("Successfully seeded 19 meal items into mealItems collection.");
  }
};
*/

export const RazorpayService = {
  createOrder: async (planId: string, customizations: any, couponCode: string | undefined, deliveryFee: number, userId: string, addressId: string, extra?: { purpose?: string; existingSubscriptionId?: string }) => {
    const headers = await getAuthHeaders();
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        planId,
        couponCode,
        addressId,
        purpose: extra?.purpose || 'subscription',
        existingSubscriptionId: extra?.existingSubscriptionId,
        notes: { userId, planId, addressId } 
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Failed to create payment order');
    return payload;
  },
  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    couponCode?: string;
    amount: number;
    useWallet?: boolean;
    usePoints?: boolean;
    notes: any;
    customizations?: any;
  }) => {
    const headers = await getAuthHeaders();
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Payment verification failed');
    }
    const result = await response.json();
    return result;
  },
  activateZeroOrder: async (data: {
    userId: string;
    planId: string;
    addressId: string;
    walletDeduction: number;
    pointsDeduction: number;
    couponCode?: string;
    deliveryFee?: number;
    customizations?: any;
  }) => {
    const headers = await getAuthHeaders();
    const response = await fetch('/api/payments/activate-zero-order', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Zero order activation failed');
    }
    return response.json();
  }
};

// Coupon Service
export const CouponService = {
  getCoupons: () => getDocuments<Coupon>('coupons', [orderBy('createdAt', 'desc')]),
  getActiveCoupons: () => getDocuments<Coupon>('coupons', [where('active', '==', true)]),
  createCoupon: (data: Omit<Coupon, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>) => {
    const id = `cpn_${Date.now()}`;
    return addDocument('coupons', id, {
      ...data,
      usageCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },
  updateCoupon: (id: string, data: Partial<Coupon>) => updateDocument('coupons', id, { ...data, updatedAt: serverTimestamp() }),
  deleteCoupon: (id: string) => deleteDocument('coupons', id),
  validateCoupon: async (code: string, userId: string, orderAmount: number, planId?: string) => {
    const coupons = await getDocuments<Coupon>('coupons', [
      where('code', '==', code.toUpperCase()),
      where('active', '==', true),
      limit(1)
    ]);
    
    if (coupons.length === 0) return { valid: false, message: "Invalid or inactive coupon" };
    
    const coupon = coupons[0];

    // Check expiry
    const getExpiryMs = (exp: any) => {
      if (!exp) return Infinity;
      if (typeof exp.toMillis === 'function') return exp.toMillis();
      if (exp instanceof Date) return exp.getTime();
      if (typeof exp === 'number') return exp;
      if (typeof exp === 'string') return new Date(exp).getTime() || Infinity;
      return Infinity;
    };
    if (coupon.expiryDate && getExpiryMs(coupon.expiryDate) < Date.now()) {
      return { valid: false, message: "Coupon has expired" };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: "Coupon usage limit reached" };
    }

    // Check minimum order
    if (orderAmount < (coupon.minimumOrder || 0)) {
      return { valid: false, message: `Minimum order of ₹${coupon.minimumOrder} required` };
    }

    // Check applicable plans
    if (planId && coupon.applicablePlans && coupon.applicablePlans.length > 0) {
      if (!coupon.applicablePlans.includes(planId)) {
        return { valid: false, message: "Coupon not applicable to this plan" };
      }
    }

    // Check First Order
    if (coupon.type === 'first_order') {
      const orders = await getDocuments<Order>('orders', [where('userId', '==', userId), limit(1)]);
      if (orders.length > 0) {
        return { valid: false, message: "Coupon only valid for first order" };
      }
    }

    return { valid: true, coupon };
  },
  incrementUsage: (id: string) => runTransaction(db, async (transaction) => {
    const ref = doc(db, 'coupons', id);
    const snap = await transaction.get(ref);
    if (!snap.exists()) return;
    const count = snap.data().usageCount || 0;
    transaction.update(ref, { usageCount: count + 1, updatedAt: serverTimestamp() });
  })
};

// Support Service
export const SupportService = {
  getTickets: (userId: string) => getDocuments<SupportTicket>('supportTickets', [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ]),
  getTicket: (id: string) => getDocument<SupportTicket>('supportTickets', id),
  subscribeToTicket: (id: string, callback: (ticket: SupportTicket | null) => void) =>
    subscribeToDocument<SupportTicket>('supportTickets', id, callback),
  createTicket: (userId: string, data: { subject: string; category: string; priority: string; message: string; attachments?: string[] }) => {
    const id = `tkt_${Date.now()}`;
    const initialMessage: SupportMessage = {
      id: `msg_${Date.now()}`,
      senderId: userId,
      senderName: 'Customer', // Should be user name from auth/user doc
      senderRole: 'customer',
      message: data.message,
      attachments: data.attachments || [],
      createdAt: Timestamp.now()
    };
    
    return addDocument('supportTickets', id, {
      ticketId: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      userId,
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      status: 'open',
      messages: [initialMessage],
      attachments: data.attachments || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },
  addMessage: (ticketId: string, message: Omit<SupportMessage, 'id' | 'createdAt'>) => {
    const msgId = `msg_${Date.now()}`;
    return updateDocument('supportTickets', ticketId, {
      messages: arrayUnion({
        ...message,
        id: msgId,
        createdAt: Timestamp.now()
      }),
      updatedAt: serverTimestamp(),
      status: message.senderRole === 'customer' ? 'open' : 'waiting_for_customer'
    });
  },
  closeTicket: (ticketId: string) => updateDocument('supportTickets', ticketId, {
    status: 'closed',
    updatedAt: serverTimestamp()
  })
};

// Review & Feedback Service
export const ReviewService = {
  submitMealReview: (data: Omit<MealReview, 'id' | 'createdAt'>) => {
    const id = `rev_${Date.now()}`;
    return addDocument('mealReviews', id, {
      ...data,
      createdAt: serverTimestamp()
    });
  },
  submitAppFeedback: (data: Omit<AppFeedback, 'id' | 'createdAt'>) => {
    const id = `fdb_${Date.now()}`;
    return addDocument('feedback', id, {
      ...data,
      createdAt: serverTimestamp()
    });
  },
  getMealReviews: (mealId: string) => getDocuments<MealReview>('mealReviews', [
    where('mealId', '==', mealId),
    orderBy('createdAt', 'desc')
  ])
};

// Admin & Analytics Service
export const AdminService = {
  getLoyaltyStats: async () => {
    const [coupons, referrals, wallets, rewards] = await Promise.all([
      getDocs(collection(db, 'coupons')),
      getDocs(collection(db, 'referrals')),
      getDocs(collection(db, 'wallets')),
      getDocs(collection(db, 'rewardPoints'))
    ]);

    const totalWalletBalance = wallets.docs.reduce((acc, doc) => acc + (doc.data().balance || 0), 0);
    const totalRewardPoints = rewards.docs.reduce((acc, doc) => acc + (doc.data().currentPoints || 0), 0);

    return {
      couponsCount: coupons.size,
      activeCoupons: coupons.docs.filter(d => d.data().active).length,
      totalReferrals: referrals.size,
      successfulReferrals: referrals.docs.filter(d => d.data().status === 'rewarded').length,
      totalWalletBalance,
      totalRewardPoints,
      customerCount: wallets.size
    };
  }
};

// FAQ Service
export const FAQService = {
  getFAQs: (category?: string) => {
    const constraints: QueryConstraint[] = [where('active', '==', true), orderBy('displayOrder', 'asc')];
    if (category) constraints.push(where('category', '==', category));
    return getDocuments<FAQ>('faqs', constraints);
  }
};

// FCM Service (Placeholder for integration logic)
export const FCMService = {
  saveToken: (userId: string, token: string) => {
    return updateDocument('users', userId, {
      fcmToken: token,
      updatedAt: serverTimestamp()
    });
  },
  // In a real app, you'd use a cloud function or backend to send messages.
  // Here we just acknowledge the setup.
  requestPermission: async () => {
    console.log("FCM: Requesting permission...");
    // Integration would happen here
  }
};

export const KitchenService = {
  getKitchenQueue: () => getDocuments<KitchenQueueItem>('kitchenQueue', [orderBy('createdAt', 'asc')]),
  generateTodayQueue: async () => {
    const today = new Date().toISOString().split('T')[0];
    const schedules = await getDocuments<MealSchedule>('mealSchedules', [
      where('date', '==', today),
      where('deliveryStatus', '==', 'pending')
    ]);
    
    for (const schedule of schedules) {
      const queueId = `kq_${schedule.id}`;
      const user = await getDocument<User>('users', schedule.userId);
      const sub = await getDocument<Subscription>('subscriptions', schedule.subscriptionId);
      
      await setDoc(doc(db, 'kitchenQueue', queueId), {
        id: queueId,
        scheduleId: schedule.id,
        userId: schedule.userId,
        customerName: user?.displayName || user?.name || 'Customer',
        subscriptionPlan: sub?.planName || 'Plan',
        mealType: schedule.mealType,
        deliverySlot: schedule.deliveryTime,
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  },
  updateMealStatus: (itemId: string, status: MealStatus) => updateDocument('kitchenQueue', itemId, { status, updatedAt: serverTimestamp() }),
  subscribeToKitchenQueue: (callback: (items: KitchenQueueItem[]) => void) =>
    subscribeToCollection<KitchenQueueItem>('kitchenQueue', [orderBy('createdAt', 'asc')], callback)
};

export const DeliveryService = {
  getDeliveries: (userId?: string) => {
    const constraints = [orderBy('createdAt', 'desc')];
    if (userId) constraints.push(where('userId', '==', userId));
    return getDocuments<Delivery>('deliveries', constraints);
  },
  updateDeliveryStatus: (id: string, deliveryStatus: Delivery['deliveryStatus'], eta?: string) => 
    updateDocument('deliveries', id, { deliveryStatus, eta, updatedAt: serverTimestamp() }),
  subscribeToDeliveries: (callback: (deliveries: Delivery[]) => void, userId?: string) => {
    const constraints = [orderBy('createdAt', 'desc')];
    if (userId) constraints.push(where('userId', '==', userId));
    return subscribeToCollection<Delivery>('deliveries', constraints, callback);
  }
};

// Health & Nutrition Services
export const HealthProgressService = {
  addProgress: (userId: string, data: Omit<HealthProgress, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `hp_${Date.now()}`;
    return addDocument('healthProgress', id, {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },
  getProgress: (userId: string) => getDocuments<HealthProgress>('healthProgress', [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ]),
  getProgressLogs: (userId: string) => getDocuments<HealthProgress>('healthProgress', [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ]),
};

export const DailyCheckInService = {
  addCheckIn: (userId: string, data: Omit<DailyCheckIn, 'id' | 'createdAt'>) => {
    const id = `dci_${Date.now()}`;
    return addDocument('dailyCheckins', id, {
      ...data,
      userId,
      createdAt: serverTimestamp()
    });
  },
  getCheckIns: (userId: string) => getDocuments<DailyCheckIn>('dailyCheckins', [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ]),
};

export const NutritionReportService = {
  addReport: (userId: string, data: Omit<NutritionReport, 'id' | 'createdAt'>) => {
    const id = `nr_${Date.now()}`;
    return addDocument('nutritionReports', id, {
      ...data,
      userId,
      createdAt: serverTimestamp()
    });
  },
  getReports: (userId: string) => getDocuments<NutritionReport>('nutritionReports', [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ]),
};

export const WeightLogService = {
  addLog: (userId: string, data: Omit<WeightLog, 'id' | 'createdAt'>) => {
    const id = `wl_${Date.now()}`;
    return addDocument('weightLogs', id, {
      ...data,
      userId,
      createdAt: serverTimestamp()
    });
  },
  getLogs: (userId: string) => getDocuments<WeightLog>('weightLogs', [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ]),
};

export const MealAnalyticsService = {
  addAnalytics: (userId: string, data: Omit<MealAnalytics, 'id' | 'createdAt'>) => {
    const id = `ma_${Date.now()}`;
    return addDocument('mealAnalytics', id, {
      ...data,
      userId,
      createdAt: serverTimestamp()
    });
  },
  getAnalytics: (userId: string) => getDocuments<MealAnalytics>('mealAnalytics', [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ]),
};


