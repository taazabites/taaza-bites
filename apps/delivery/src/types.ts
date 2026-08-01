import { RecaptchaVerifier } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export type OrderStatus = 
  | "assigned"
  | "accepted"
  | "rejected"
  | "picked_up"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned";

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  subscriptionId: string;
  partnerId: string;
  customerName: string;
  customerPhone: string;
  customerAltPhone?: string;
  deliveryAddress: string;
  area: string;
  pincode: string;
  location: { lat: number; lng: number };
  mealType: string;
  mealItems: string[];
  quantity: number;
  calories: string;
  protein: string;
  deliveryTimeSlot: string;
  kitchenNotes?: string;
  customerNotes?: string;
  status: OrderStatus;
  paymentStatus: "paid" | "cod";
  deliveryOTP: string;
  isPriority: boolean;
  createdAt: number;
  updatedAt: number;
  rejectReason?: string;
  failureReason?: string;
  deliveryPhotoUrl?: string;
}

export interface PartnerStats {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  failedDeliveries: number;
  performanceScore: number;
  rating: number;
  completedKm: number;
  workingHours: number;
}
