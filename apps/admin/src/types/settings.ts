export interface BusinessSettings {
  businessName: string;
  brandName: string;
  gstNumber: string;
  fssaiNumber: string;
  supportEmail: string;
  supportPhone: string;
  website: string;
  businessAddress: string;
  operationalHours: string;
  googleMapLink: string;
  businessLogo: string;
  businessBanner: string;
}

export interface KitchenSettings {
  kitchenName: string;
  kitchenAddress: string;
  operatingHours: string;
  preparationTime: string;
  holidayCalendar: string[];
  kitchenStatus: 'Open' | 'Closed' | 'Busy';
}

export interface SubscriptionSettings {
  enablePlans: boolean;
  maxActivePlans: number;
  trialPlanSettings: string;
  renewalReminderDays: number;
  autoRenewal: boolean;
  pauseLimit: number;
  skipMealLimit: number;
}

export interface DeliverySettings {
  deliveryCharges: number;
  freeDeliveryAbove: number;
  minimumOrder: number;
  maxDeliveryDistance: number;
  deliveryTimeSlots: {
    morning: string;
    lunch: string;
    dinner: string;
    expressDelivery: boolean;
  };
  deliveryRadius: number;
}

export interface PaymentSettings {
  enableRazorpay: boolean;
  enableUPI: boolean;
  enableCards: boolean;
  enableNetBanking: boolean;
  enableWallet: boolean;
  refundPolicy: string;
  gstPercentage: number;
}

export interface WalletRewardsSettings {
  signupBonus: number;
  referralBonus: number;
  rewardPointRate: number; // e.g. 1 point = X Rs
  minimumRedemption: number;
  walletExpiry: number; // in days
}

export interface CouponSettings {
  enableCoupons: boolean;
  maxCoupons: number;
  autoApplyCoupons: boolean;
  firstOrderCoupon: string;
  referralCoupon: string;
}

export interface NotificationSettings {
  firebasePush: boolean;
  whatsApp: boolean;
  email: boolean;
  sms: boolean;
  orderUpdates: boolean;
  subscriptionReminders: boolean;
  paymentAlerts: boolean;
}

export interface SEOSettings {
  websiteTitle: string;
  metaDescription: string;
  keywords: string;
  openGraphImage: string;
  googleAnalyticsId: string;
  metaPixelId: string;
  googleTagManagerId: string;
}

export interface SocialSettings {
  instagram: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  twitter: string;
}

export interface LegalSettings {
  privacyPolicy: string;
  termsConditions: string;
  refundPolicy: string;
  shippingPolicy: string;
  cancellationPolicy: string;
}

export interface AdminSecuritySettings {
  sessionTimeout: number; // in minutes
  twoFactorAuth: boolean;
}

// Default initial states for fallback or first-time setup
export const defaultBusinessSettings: BusinessSettings = {
  businessName: "Taaza Bites Catering Services Private Limited",
  brandName: "Taaza Bites",
  gstNumber: "27AADCT9876F1Z1",
  fssaiNumber: "12345678901234",
  supportEmail: "support@taazabites.in",
  supportPhone: "+91 98765 43210",
  website: "https://taazabites.in",
  businessAddress: "Plot No. 42, Sector 4, HSR Layout, Bengaluru, Karnataka 560102",
  operationalHours: "Mon-Sun, 9:00 AM - 10:00 PM",
  googleMapLink: "https://maps.google.com/?q=HSR+Layout+Bengaluru",
  businessLogo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=128&h=128&fit=crop",
  businessBanner: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop",
};

export const defaultKitchenSettings: KitchenSettings = {
  kitchenName: "Bengaluru Central Kitchen (HSR)",
  kitchenAddress: "Basement & Ground Floor, Plot No. 42, HSR Layout, Bengaluru 560102",
  operatingHours: "06:00 AM - 10:00 PM",
  preparationTime: "45 mins",
  holidayCalendar: ["2026-08-15", "2026-10-02", "2026-11-01", "2026-12-25"],
  kitchenStatus: "Open",
};

export const defaultSubscriptionSettings: SubscriptionSettings = {
  enablePlans: true,
  maxActivePlans: 10,
  trialPlanSettings: "Enable 3-day trial plan with single meal per day for first-time buyers",
  renewalReminderDays: 3,
  autoRenewal: true,
  pauseLimit: 5, // max pause days per subscription period
  skipMealLimit: 10, // max skip meals per subscription period
};

export const defaultDeliverySettings: DeliverySettings = {
  deliveryCharges: 40,
  freeDeliveryAbove: 500,
  minimumOrder: 150,
  maxDeliveryDistance: 15, // in km
  deliveryTimeSlots: {
    morning: "07:30 AM - 09:30 AM",
    lunch: "12:00 PM - 02:00 PM",
    dinner: "07:30 PM - 09:30 PM",
    expressDelivery: true,
  },
  deliveryRadius: 8, // in km
};

export const defaultPaymentSettings: PaymentSettings = {
  enableRazorpay: true,
  enableUPI: true,
  enableCards: true,
  enableNetBanking: true,
  enableWallet: true,
  refundPolicy: "Refunds for cancelled meal plans are credited back to Taaza Wallet within 24 hours of cancellation approval.",
  gstPercentage: 5,
};

export const defaultWalletRewardsSettings: WalletRewardsSettings = {
  signupBonus: 100, // ₹ credited to wallet on signup
  referralBonus: 150, // ₹ credited on referral's first purchase
  rewardPointRate: 10, // 10 points = 1 ₹
  minimumRedemption: 100, // minimum points to redeem
  walletExpiry: 365, // in days
};

export const defaultCouponSettings: CouponSettings = {
  enableCoupons: true,
  maxCoupons: 50,
  autoApplyCoupons: false,
  firstOrderCoupon: "TAAZAFIRST",
  referralCoupon: "TAAZAFRIEND",
};

export const defaultNotificationSettings: NotificationSettings = {
  firebasePush: true,
  whatsApp: true,
  email: true,
  sms: false,
  orderUpdates: true,
  subscriptionReminders: true,
  paymentAlerts: true,
};

export const defaultSEOSettings: SEOSettings = {
  websiteTitle: "Taaza Bites | Fresh & Healthy Subscription Meals Delivered Daily",
  metaDescription: "Taaza Bites delivers premium, calorie-counted, nutrition-backed meals right to your doorstep. Subscribe to our flexible plans and reach your fitness goals.",
  keywords: "healthy food, subscription meals, calorie counted, keto diet, high protein meals, Bengaluru food delivery, chef prepared",
  openGraphImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=630&fit=crop",
  googleAnalyticsId: "G-XXXXXXXXXX",
  metaPixelId: "ID-XXXXXXXXXX",
  googleTagManagerId: "GTM-XXXXXXXX",
};

export const defaultSocialSettings: SocialSettings = {
  instagram: "https://instagram.com/taazabites",
  facebook: "https://facebook.com/taazabites",
  youtube: "https://youtube.com/c/taazabites",
  linkedin: "https://linkedin.com/company/taazabites",
  twitter: "https://x.com/taazabites",
};

export const defaultLegalSettings: LegalSettings = {
  privacyPolicy: "This Privacy Policy describes how Taaza Bites collects, uses, and shares your personal information...",
  termsConditions: "These Terms and Conditions govern your use of the Taaza Bites website and our meal subscription services...",
  refundPolicy: "Cancellations of meal subscriptions are eligible for partial refund to the customer wallet based on remaining days...",
  shippingPolicy: "Meals are delivered in high-grade insulated bags daily as per selected slots. Currently serving Bengaluru urban areas...",
  cancellationPolicy: "Subscriptions can be paused, or meals can be skipped up to 24 hours in advance through the customer website...",
};

export const defaultAdminSecuritySettings: AdminSecuritySettings = {
  sessionTimeout: 30, // 30 minutes
  twoFactorAuth: false,
};
