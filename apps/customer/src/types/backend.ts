import { Timestamp } from "firebase/firestore";

// 1. Users Collection Model
export interface DBUser {
  uid: string;
  fullName: string;
  phone: string;
  email: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  status: 'active' | 'suspended';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastLogin: Timestamp | Date;
}

// 2. Subscription Plans Model
export interface SubscriptionPlan {
  planId: string;
  name: string;
  description: string;
  mealsPerDay: number;
  durationDays: number;
  price: number;
  caloriesTarget: number;
  category: 'weight_loss' | 'muscle_gain' | 'clean_eating' | 'active_metabolism';
  isAvailable: boolean;
  createdAt: Timestamp | Date;
}

// 3. Subscriptions Model
export interface Subscription {
  subscriptionId: string;
  userId: string;
  planId: string;
  planName: string;
  status: 'active' | 'paused' | 'expired' | 'pending';
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  remainingMeals: number;
  mealsPerDay: number;
  deliveryTime: string;
  deliveryAddressId: string;
  pauseStatus: 'none' | 'paused_pending' | 'paused';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  caloriesTarget: number;
  daysRemaining: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// 4. Health Assessments Model
export interface HealthAssessment {
  userId: string;
  height: number; // in cm
  weight: number; // in kg
  age: number;
  gender: 'male' | 'female' | 'other';
  goal: 'weight_loss' | 'muscle_gain' | 'clean_eating' | 'active_metabolism';
  activityLevel: 'sedentary' | 'moderate' | 'highly_active';
  foodPreference: 'veg' | 'non-veg' | 'vegan' | 'keto';
  medicalConditions: string[];
  allergies: string[];
  mealTiming: string;
  BMI: number;
  weightHistory?: { date: string; weight: number; }[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// 5. Payments Model
export interface Payment {
  paymentId: string;
  orderId?: string; // Razorpay Order ID or App transaction reference
  subscriptionId?: string;
  userId: string;
  amount: number;
  currency: string;
  method: 'razorpay' | 'wallet' | 'card' | 'upi';
  gateway: 'razorpay' | 'stripe' | 'internal';
  status: 'captured' | 'failed' | 'pending' | 'refunded';
  invoiceUrl?: string;
  paidAt: Timestamp | Date;
  metadata?: Record<string, any>;
}

// 6. Orders Model
export interface Order {
  orderId: string;
  subscriptionId: string;
  userId: string;
  deliveryDate: string; // ISO format date string (YYYY-MM-DD)
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  mealName: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  deliveryStatus: 'preparing' | 'dispatched' | 'arriving' | 'delivered' | 'cancelled';
  portionType: 'standard' | 'bulking' | 'keto';
  rating?: number;
  feedback?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// 7. Wallet Model
export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  updatedAt: Timestamp | Date;
}

// 8. Reward Points Model
export interface RewardPoints {
  userId: string;
  points: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  updatedAt: Timestamp | Date;
}

// 9. Referrals Model
export interface Referral {
  referralId: string;
  referrerId: string;
  referredId: string;
  status: 'pending' | 'completed';
  rewardPointsEarned: number;
  createdAt: Timestamp | Date;
  completedAt?: Timestamp | Date;
}

// 10. Meal Plans Model
export interface MealPlan {
  mealPlanId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
  ingredients: string[];
  isPremiumSpecial: boolean;
  priceOverride?: number; // Price when purchased separately from wallet
}

// 11. Delivery Schedules Model
export interface DeliverySchedule {
  scheduleId: string;
  userId: string;
  subscriptionId: string;
  deliveryDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "12:00 PM - 2:00 PM"
  assignedRiderName?: string;
  assignedRiderPhone?: string;
  status: 'pending' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveredAt?: Timestamp | Date;
  notes?: string;
  createdAt?: Timestamp | Date;
}

// 12. Notifications Model
export interface DBNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'payment' | 'delivery' | 'offers' | 'subscription' | 'referral';
  read: boolean;
  createdAt: Timestamp | Date;
}

// 13. Support Tickets Model
export interface SupportTicket {
  ticketId: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  category: 'delivery_delay' | 'dietary_query' | 'payment_issue' | 'other';
  attachments?: string[]; // URLs of uploaded files
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// 14. Addresses Model
export interface Address {
  addressId: string;
  userId: string;
  customerName: string;
  phone: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: Timestamp | Date;
}

// 15. Pause Requests Model
export interface PauseRequest {
  requestId: string;
  userId: string;
  subscriptionId: string;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: Timestamp | Date;
}

// 16. Skip Meals Model
export interface SkipMeal {
  skipId: string;
  userId: string;
  subscriptionId: string;
  date: string; // YYYY-MM-DD
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'all';
  refundToWalletAmount: number;
  status: 'skipped' | 'cancelled';
  createdAt: Timestamp | Date;
}

// 17. Coupons Model
export interface Coupon {
  couponId: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate: Timestamp | Date;
  isActive: boolean;
  createdAt: Timestamp | Date;
}

// 18. Settings Model
export interface Setting {
  settingId: string; // e.g., "global_app"
  deliverySlots: string[];
  referralBonusPoints: number;
  minWalletRecharge: number;
  customerSupportPhone: string;
  taxPercentage: number;
  isAppMaintenanceActive: boolean;
}
