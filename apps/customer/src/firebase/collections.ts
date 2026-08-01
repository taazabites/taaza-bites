import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  name?: string;
  displayName?: string;
  phone?: string;
  email?: string;
  photoURL?: string;
  role: 'customer' | 'admin' | 'delivery';
  status: 'active' | 'suspended';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin: Timestamp;
  referralCode?: string;
  walletBalance: number;
  rewardPoints: number;
  hasActiveSubscription?: boolean;
}


export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  offerPrice: number;
  duration?: number;
  durationDays: number;
  mealsPerDay: number;
  totalMeals: number;
  calories: number;
  protein: number;
  dietType: string;
  goal: string;
  mealTypes: string[];
  features: string[];
  popular: boolean;
  active: boolean;
  isAvailable?: boolean;
  displayOrder: number;
  image: string;
  deliverySchedule?: string;
  icon?: string;
  accentColor?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName?: string;
  caloriesTarget?: number;
  status: 'active' | 'paused' | 'expired' | 'cancelled' | 'draft';
  startDate: Timestamp;
  endDate: Timestamp;
  remainingMeals: number;
  daysRemaining?: number;
  paused: boolean;
  pauseHistory: any[];
  paymentId: string;
  deliveryTime: string;
  deliveryTiming?: string;
  deliveryAddressId: string;
  mealsPerDay?: number;
  healthAssessmentCompleted?: boolean;
  healthAssessmentId?: string;
  selectedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface HealthAssessment {
  id: string;
  userId: string;
  subscriptionId: string;
  fullName: string;
  phone: string;
  email?: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: string;
  dietPreference?: string;
  dietaryPreference?: string;
  mealPreference: string[];
  activityLevel: string;
  workoutFrequency?: string;
  allergies: string[];
  medicalConditions: string[];
  wakeUpTime: string;
  sleepTime: string;
  waterIntake: number;
  targetWeight: number;
  targetDate?: string;
  bmi?: number;
  bmiCategory?: string;
  recommendedCalories?: number;
  recommendedProtein?: number;
  recommendedWater?: number;
  calculatedCalories?: number;
  calculatedProtein?: number;
  weightHistory?: { date: string; weight: number; }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ServiceArea {
  id: string;
  name: string;
  city: string;
  pincode: string;
  polygonCoordinates: { lat: number; lng: number }[];
  minimumOrder: number;
  deliveryFee: number;
  active: boolean;
  hub?: string;
  area?: string;
  subAreas?: string[];
  pincodes?: string[];
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  houseNumber: string;
  building?: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  deliveryInstructions?: string;
  addressType: 'Home' | 'Work' | 'Other';
  default: boolean;
  verified: boolean;
  serviceAreaId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Meal {
  id: string;
  mealName: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  image: string;
  available: boolean;
  dietType: string;
}

export interface MealItem {
  id?: string;
  mealName: string;
  category: string;
  dietType: string;
  goalTags: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  allergens: string[];
  cuisine: string;
  image: string;
  active: boolean;
}

export interface MealSchedule {
  id: string;
  subscriptionId: string;
  userId: string;
  date: string;
  mealType: string;
  mealId: string;
  mealName?: string;
  status?: string;
  deliveryStatus: 'pending' | 'shipped' | 'delivered' | 'skipped';
  deliveryTime: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderId?: string;
  userId: string;
  subscriptionId: string;
  mealScheduleId: string;
  planName?: string;
  amount: number;
  discount: number;
  coupon: string;
  tax: number;
  status?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryStatus: string;
  orderStatus: string;
  createdAt: Timestamp;
}

export interface Payment {
  id: string;
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  status: string;
  type?: 'subscription' | 'recharge';
  verified: boolean;
  createdAt: Timestamp;
}

export interface Wallet {
  userId: string;
  balance: number;
  cashbackAvailable: number;
  cashbackPending: number;
  cashbackLifetime: number;
  updatedAt: Timestamp;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  referenceId: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Timestamp;
}

export interface RewardPoints {
  userId: string;
  currentPoints: number;
  lifetimePoints: number;
  pointsExpiringSoon: number;
  streakCount?: number;
  lastCheckInDate?: string;
  checkInHistory?: string[];
  updatedAt: Timestamp;
}

export interface RewardTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  points: number;
  reason: string;
  expiryDate?: Timestamp;
  referenceId: string;
  createdAt: Timestamp;
}

export interface Referral {
  id: string;
  referralCode: string;
  referrerUserId: string;
  referredUserId: string;
  referredName?: string;
  referredEmail?: string;
  referredPhone?: string;
  status: 'pending' | 'completed' | 'rewarded';
  rewardIssued: boolean;
  createdAt: Timestamp;
}

export interface ReferralReward {
  id: string;
  userId: string; // The person receiving the reward (referrer)
  referrerId: string;
  referredId: string;
  amount: number;
  points: number;
  status: 'pending' | 'credited';
  createdAt: Timestamp;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  type: 'percentage' | 'flat' | 'free_delivery' | 'first_order' | 'festival' | 'referral';
  discountValue: number;
  maxDiscount?: number;
  minimumOrder: number;
  expiryDate: Timestamp;
  active: boolean;
  usageLimit?: number;
  usageCount: number;
  applicablePlans?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'delivery' | 'subscription' | 'offer' | 'wallet' | 'reward' | 'referral' | 'announcement' | 'support' | 'system';
  priority: 'low' | 'medium' | 'high';
  icon?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'admin' | 'support';
  message: string;
  attachments?: string[];
  createdAt: Timestamp;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  userId: string;
  subject: string;
  category: 'delivery' | 'quality' | 'payment' | 'subscription' | 'refund' | 'technical' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed';
  messages: SupportMessage[];
  attachments?: string[];
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

export interface MealReview {
  id: string;
  userId: string;
  mealId: string;
  mealName?: string;
  scheduleId: string;
  subscriptionId: string;
  ratings: {
    taste: number;
    packaging: number;
    freshness: number;
    portionSize: number;
    delivery: number;
  };
  overallRating: number;
  comments?: string;
  images?: string[];
  createdAt: Timestamp;
}

export interface AppFeedback {
  id: string;
  userId: string;
  appRating: number;
  deliveryRating: number;
  serviceRating: number;
  overallFeedback: string;
  createdAt: Timestamp;
}

export interface FAQ {
  id: string;
  category: 'subscription' | 'payments' | 'delivery' | 'nutrition' | 'refund' | 'wallet' | 'referral' | 'technical';
  question: string;
  answer: string;
  displayOrder: number;
  active: boolean;
}

export interface Setting {
  key: string;
  value: any;
  description: string;
}

// Kitchen & Delivery Management
export type MealStatus = 'Pending' | 'Preparing' | 'Cooking' | 'Packing' | 'Ready' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface HealthProgress {
  id: string;
  userId: string;
  date: string;
  weight: number;
  bmi: number;
  bodyFatPercentage?: number;
  measurements: {
    waist?: number;
    chest?: number;
    arms?: number;
  };
  waterIntake: number; // ml
  sleepHours: number;
  workoutMinutes: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string;
  weight: number;
  energyLevel: number; // 1-10
  mood: string;
  sleepHours: number;
  waterIntake: number; // ml
  workoutMinutes: number;
  createdAt: Timestamp;
}

export interface NutritionReport {
  id: string;
  userId: string;
  date: string;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  mealAdherencePercentage: number;
  subscriptionAdherencePercentage: number;
  createdAt: Timestamp;
}

export interface WeightLog {
  id: string;
  userId: string;
  date: string;
  weight: number;
  createdAt: Timestamp;
}

export interface MealAnalytics {
  id: string;
  userId: string;
  mealId: string;
  status: 'consumed' | 'skipped' | 'customized';
  createdAt: Timestamp;
}

export interface KitchenQueueItem {
  id: string;
  orderId: string;
  userId: string;
  customerName: string;
  mealType: string;
  subscriptionPlan: string;
  deliverySlot: string;
  status: MealStatus;
  priority: 'low' | 'medium' | 'high';
  specialNotes?: string;
  allergies?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Delivery {
  id: string;
  userId: string;
  orderId: string;
  partnerName?: string;
  deliveryStatus: 'Assigned' | 'OutForDelivery' | 'Delivered';
  eta?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: string; // 'google', 'facebook', 'influencer', 'referral', 'email'
  offerCode?: string;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  status: 'active' | 'paused' | 'ended';
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  category?: string;
  userId?: string;
  path: string;
  params?: Record<string, any>;
  value?: number;
  referrer?: string;
  device?: string;
  createdAt: Timestamp;
}

export interface CustomerReview {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  overallRating: number;
  taste: number;
  packaging: number;
  freshness: number;
  portionSize: number;
  delivery: number;
  comments: string;
  status: 'pending' | 'approved' | 'rejected';
  helpfulCount: number;
  replies?: { author: string; message: string; createdAt: Timestamp }[];
  createdAt: Timestamp;
}

export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  clickUrl?: string;
  type?: string;
  deviceToken?: string;
  createdAt: Timestamp;
}

export interface EmailLog {
  id: string;
  userId?: string;
  email: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed';
  error?: string;
  templateName?: string;
  createdAt: Timestamp;
}

export interface WhatsAppLog {
  id: string;
  userId?: string;
  phone: string;
  message: string;
  status: 'sent' | 'failed';
  error?: string;
  templateName?: string;
  createdAt: Timestamp;
}

export interface MealCustomization {
  id: string;
  userId: string;
  subscriptionId: string;
  mealScheduleId: string;
  originalMealId: string;
  newMealId?: string;
  type: 'replace_meal' | 'replace_ingredient' | 'swap_veg_nonveg' | 'change_portion' | 'add_protein';
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  details?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PauseRequest {
  id: string;
  userId: string;
  subscriptionId: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SubscriptionChange {
  id: string;
  userId: string;
  subscriptionId: string;
  type: 'upgrade' | 'downgrade' | 'cancel' | 'renew';
  newPlanId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  reason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MealCalendar {
  id: string;
  userId: string;
  subscriptionId: string;
  date: string;
  mealType: string;
  mealId: string;
  status: 'scheduled' | 'skipped' | 'customized' | 'delivered';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DeliverySchedule {
  id: string;
  userId: string;
  subscriptionId: string;
  date: string;
  timeSlot: string;
  status: 'scheduled' | 'rescheduled' | 'cancelled' | 'delivered';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
