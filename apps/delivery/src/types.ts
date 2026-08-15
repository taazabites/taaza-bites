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

export type MealSlot = "Breakfast" | "Lunch" | "Dinner" | string;

export type SlotTimingStatus = "on_time" | "running_late" | "delayed";

export interface StructuredAddress {
  type?: "Home" | "Office" | "Other";
  flatNumber?: string;
  building?: string;
  floor?: string;
  landmark?: string;
  gateInstructions?: string;
  securityInstructions?: string;
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  subscriptionId: string;
  partnerId: string;
  customerName: string;
  customerPhone: string;
  customerAltPhone?: string;
  customerPhotoUrl?: string;
  deliveryAddress: string;
  addressDetails?: StructuredAddress;
  area: string;
  pincode: string;
  location: { lat: number; lng: number };
  mealType: MealSlot;
  mealItems: string[];
  mealName?: string;
  isVeg?: boolean;
  quantity: number;
  calories: string;
  protein: string;
  deliveryTimeSlot: string;
  /** e.g. "12/30" */
  subscriptionDay?: string;
  kitchenNotes?: string;
  customerNotes?: string;
  status: OrderStatus;
  paymentStatus: "paid" | "cod";
  deliveryOTP: string;
  isPriority: boolean;
  routeOrder?: number;
  createdAt: number;
  updatedAt: number;
  rejectReason?: string;
  failureReason?: string;
  deliveryPhotoUrl?: string;
  cantReachAttempts?: number;
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

export interface PartnerIssueReport {
  id?: string;
  partnerId: string;
  partnerName?: string;
  type:
    | "vehicle"
    | "accident"
    | "food_damaged"
    | "wrong_package"
    | "customer_unavailable"
    | "address_issue"
    | "kitchen_delay"
    | "traffic"
    | "location_mismatch"
    | "other";
  message: string;
  assignmentId?: string;
  location?: { lat: number; lng: number };
  createdAt: number;
  status: "open" | "acknowledged" | "resolved";
}

/** Dummy tiffin-box security deposit (customer can change later) */
export const TIFFIN_SECURITY_DEPOSIT_INR = 299;
