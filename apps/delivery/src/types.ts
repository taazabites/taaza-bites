import { RecaptchaVerifier } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export type DeliveryStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "ARRIVED"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED"
  | "RETURN_TO_KITCHEN";

export type PartnerLiveStatus = "ONLINE" | "OFFLINE" | "ON_DELIVERY" | "SUSPENDED";

export type PaymentStatus = "paid" | "cod";

export interface DeliveryStop {
  id: string;
  partnerId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerFirstName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryArea: string;
  area: string;
  pincode?: string;
  deliverySlot: string;
  mealName?: string;
  mealItems: string[];
  packageCount: number;
  quantity: number;
  specialInstructions?: string;
  kitchenNotes?: string;
  paymentStatus: PaymentStatus;
  location?: { lat: number; lng: number } | null;
  isPriority: boolean;
  routeOrder?: number;
  status: DeliveryStatus;
  assignedAt?: number;
  acceptedAt?: number;
  pickedUpAt?: number;
  outForDeliveryAt?: number;
  arrivedAt?: number;
  deliveredAt?: number;
  failedAt?: number;
  issueReason?: string;
  issueNotes?: string;
  deliveryPhotoUrl?: string;
  verificationMethod?: "OTP" | "CONFIRMATION" | "PHOTO" | string;
  earningsTotal?: number;
  createdAt: number;
  updatedAt: number;
}

export interface PartnerProfile {
  uid: string;
  partnerId: string;
  name: string;
  phone: string;
  photo?: string;
  photoUrl?: string;
  active: boolean;
  vehicleType: string;
  vehicleNumber: string;
  serviceAreas: string[];
  currentStatus: PartnerLiveStatus;
  joiningDate?: string;
  emergencyContact?: string;
  upiId?: string;
  isBlocked?: boolean;
  role?: string;
}

export interface DeliveryEarning {
  id: string;
  partnerId: string;
  deliveryId: string;
  orderId: string;
  baseAmount: number;
  bonus: number;
  adjustment: number;
  totalAmount: number;
  status: string;
  createdAt: number;
}

export interface DeliveryIssue {
  id: string;
  deliveryId: string;
  reason: string;
  notes: string;
  reportedBy: string;
  reportedAt: number;
  action?: string;
}

export interface PartnerNotification {
  id: string;
  partnerId: string;
  type: string;
  title: string;
  body: string;
  deliveryId?: string;
  read: boolean;
  createdAt: number;
}

export const ISSUE_REASONS = [
  "Customer unavailable",
  "Wrong address",
  "Customer requested reschedule",
  "Phone unreachable",
  "Refused delivery",
  "Vehicle issue",
  "Kitchen delay",
  "Other",
] as const;

export type IssueReason = (typeof ISSUE_REASONS)[number];
