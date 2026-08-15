export type OldRole =
  | 'superAdmin'
  | 'admin'
  | 'Operations Manager'
  | 'Kitchen Manager'
  | 'Nutritionist'
  | 'Delivery Manager'
  | 'Finance Manager'
  | 'Support Executive'
  | 'Marketing Manager'
  | 'Inventory Manager'
  | 'Read Only Auditor';

export type Role =
  | 'Super Admin'
  | 'Admin'
  | 'Operations Manager'
  | 'Kitchen Manager'
  | 'Kitchen Staff'
  | 'Delivery Manager'
  | 'Delivery Partner'
  | 'Finance Manager'
  | 'Marketing Manager'
  | 'CRM Executive'
  | 'Support Executive'
  | 'Inventory Manager'
  | 'Nutritionist'
  | 'Analytics Viewer'
  | 'Read Only Auditor';

export interface User {
  id: string;
  email: string;
  role: Role | OldRole;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  status: 'Active' | 'Suspended';
}

export interface CustomerNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isPinned?: boolean;
  priority?: string;
  type?: string;
  timestamp?: string;
}

export interface Customer {
  health?: {
    age?: number | string;
    gender?: string;
    height?: number;
    weight?: number;
    goal?: string;
    dietPreference?: string;
    allergies?: string[];
    medicalConditions?: string[];
    lastUpdated?: string;
  };
  addresses?: any[];
  notes?: CustomerNote[];
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  updatedAt?: string;
  email: string;
  phone: string;
  status: 'Active' | 'Suspended';
  walletBalance: number;
  rewardPoints: number;
  createdAt: string;
  healthAssessmentId?: string;
  calorieTarget?: number;
  proteinTarget?: number;
  allergies?: string[];
  goals?: string[];
  referralsCount?: number;
  referralCode?: string;
  referredByCode?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore?: number;
  riskReasons?: string[];
  crmSegment?: string;
  calculatedAt?: string;
  lastActivityAt?: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: 'Active' | 'Paused' | 'Cancelled' | 'Frozen';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  remainingMeals?: number;
  lastDeliveryDate?: string;
}

export interface Order {
  id: string;
  orderId?: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  subscriptionId?: string;
  planName?: string;
  mealId?: string;
  mealName?: string;
  deliveryAddress: string;
  deliveryArea?: string;
  deliverySlot?: string;
  driverId?: string;
  driverName?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | string;
  orderStatus?: 'Pending' | 'Confirmed' | 'Preparing' | 'Packed' | 'Out For Delivery' | 'Delivered' | 'Cancelled' | string;
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Prepping' | 'Packed' | 'Out for Delivery' | 'Out For Delivery' | 'Delivered' | 'Cancelled' | string;
  deliveryDate?: string;
  meals?: string[] | any;
  amount?: number;
  specialInstructions?: string;
  createdAt?: string | any;
  updatedAt?: string | any;
}

export interface Transaction {
  id: string;
  customerId: string;
  amount: number;
  type: 'Payment' | 'Refund' | 'Wallet Credit' | 'Wallet Debit';
  status: 'Success' | 'Failed' | 'Pending';
  timestamp: string;
  method: string;
}

export interface Ticket {
  id: string;
  customerId: string;
  subject: string;
  status: 'Open' | 'Pending' | 'Resolved' | 'Escalated';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: string;
  updatedAt: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
  allergens: string[];
  isActive: boolean;
  imageUrl?: string;
}

export interface SubscriptionPlan {
  id: string; // planId
  name: string; // planName
  description: string;
  duration: number; // durationDays
  mealsPerDay: number;
  totalMeals: number;
  price: number;
  offerPrice: number; // discountPrice
  calories: number; // dailyCalories
  protein: number; // dailyProtein
  carbs: number; // to keep, not requested but good for recipe
  fat: number; // to keep, not requested
  deliverySchedule: string;
  features: string[];
  badge?: string;
  imageUrl?: string;
  shortDescription?: string;
  mealTypes: string[]; // Added
  popular: boolean; // Added
  status: 'Active' | 'Inactive';
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealVariant {
  name: string; // e.g., 'Small' | 'Regular' | 'Large'
  price: number;
  offerPrice?: number;
}

export interface MenuItem {
  id: string; // matches the Firestore doc id
  mealId?: string; // or document ID
  mealName: string;
  shortDescription: string;
  description: string;
  category: string;
  mealType: string; // 'Veg' | 'Egg' | 'Chicken' | 'Fish'
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string;
  allergens: string;
  servingSize: string;
  price: number;
  offerPrice: number;
  thumbnailUrl: string;
  imageUrls: string[];
  tags: string[];
  availability: 'Available' | 'Out of Stock';
  status: 'Active' | 'Inactive' | 'Draft';
  featured: boolean;
  bestSeller: boolean;
  recommended: boolean;
  displayOrder: number;
  preparationTime: string;
  variants: MealVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPartner {
  id: string; // matches document ID
  partnerId: string;
  fullName: string;
  phone: string;
  email: string;
  profilePhoto?: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  aadhaarNumber?: string;
  joiningDate?: string;
  emergencyContact?: string;
  status: 'Active' | 'Inactive' | 'Deactivated';
  availability: 'Available' | 'Busy' | 'Offline';
  currentStatus?: string;
  serviceAreas?: string[];
  rating: number;
  completedDeliveries: number;
  assignedOrders: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryRoute {
  id: string; // matches document ID
  routeId: string;
  routeName: string;
  area: string;
  pincode: string; // PIN Codes (comma-separated or single)
  driverId: string; // Assigned Driver ID
  driverName: string; // Assigned Driver Name
  estimatedTime: string; // Estimated Delivery Time
  maximumOrders: number;
  status: 'Active' | 'Inactive';
  path?: { lat: number; lng: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: string; // matches document ID
  deliveryId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryArea: string;
  deliverySlot: string;
  driverId: string;
  driverName: string;
  status: 'Pending' | 'Assigned' | 'Picked Up' | 'Out For Delivery' | 'Delivered' | 'Failed' | 'Returned' | 'Cancelled' | 'Accepted' | 'Arrived' | string;
  estimatedArrival: string;
  proofImage?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceArea {
  id: string; // matches document ID
  areaId: string;
  areaName: string;
  city: string;
  state: string;
  country: string;
  pincodes: string[]; // Multiple pin codes
  deliveryCharge: number;
  freeDeliveryAbove: number;
  minimumOrder: number;
  estimatedDeliveryTime: string; // e.g. '30-45 mins'
  deliveryRoute?: string; // Optional assigned route name or ID
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  couponId: string;
  title: string;
  couponCode: string;
  description: string;
  discountType: 'Percentage' | 'Flat' | 'Free Delivery';
  discountValue: number;
  maximumDiscount: number;
  minimumOrder: number;
  validFrom: string;
  validUntil: string;
  maximumUsage: number;
  usedCount: number;
  usagePerCustomer: number;
  applicablePlans: string[];
  applicableAreas: string[];
  applicableCategories?: string[];
  applicableCustomers?: string[];
  subscriptionOnly: boolean;
  subscriptionEligible?: boolean;
  subscriptionPrice?: number;
  firstOrderOnly: boolean;
  autoApply: boolean;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CouponRedemption {
  id: string; // redemptionId
  couponId: string;
  customerId: string;
  orderId: string;
  discountAmount: number;
  redeemedAt: string;
}

export interface Referral {
  id: string; // referralId
  referrerCustomerId: string;
  referredCustomerId: string;
  rewardAmount: number;
  status: 'Pending' | 'Completed' | 'Rejected';
  createdAt: string;
}



export interface Offer {
  id: string;
  offerId: string;
  title: string;
  description: string;
  bannerImage: string;
  redirectUrl: string;
  ctaText?: string;
  offerType?: 'Promotion' | 'Announcement' | 'Survey' | 'Update';
  applicableAreas?: string[];
  displayOrder: number;
  status: 'Active' | 'Inactive';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentId: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string; // Additional field for UI search/filtering
  subscriptionId?: string;
  orderId?: string;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallet' | 'Razorpay' | string;
  amount: number;
  gst: number;
  discount: number;
  netAmount: number;
  currency: string;
  status: 'Pending' | 'Processing' | 'Success' | 'Failed' | 'Refunded' | 'Cancelled';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Refund {
  id: string;
  refundId: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: 'Pending' | 'Success' | 'Failed';
  createdAt: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  paymentId: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface KitchenIngredientItem {
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface RecipeTemplate {
  id: string;
  mealName: string;
  ingredients: KitchenIngredientItem[];
  instructions: string;
  prepTime: number; // in minutes
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  packagingInstructions: string;
  imageUrl?: string;
}

export interface KitchenProductionItem {
  id: string;
  mealName: string;
  qtyRequired: number;
  qtyCompleted: number;
  status: 'Pending' | 'Preparing' | 'Cooking' | 'Packing' | 'Ready' | 'Completed';
  chefId?: string;
  chefName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KitchenTask {
  id: string;
  staffId: string;
  staffName: string;
  taskDescription: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedAt: string;
  completedAt?: string;
}

export interface StaffItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
}

export interface SupportAgent {
  id: string;
  agentId: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Offline' | 'Busy';
  assignedTickets: number;
  rating: number;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  subject: string;
  category: 'General Inquiry' | 'Subscription' | 'Payment' | 'Delivery' | 'Meal Quality' | 'Refund' | 'Technical Issue' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
  assignedAgentId?: string;
  assignedAgentName?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  lastReplyMessage?: string;
  lastReplySender?: string;
  satisfactionRating?: number;
  notes?: string;
  attachments?: string[];
}

export interface TicketReply {
  id: string;
  replyId: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'agent' | 'system';
  message: string;
  createdAt: string;
  attachments?: string[];
}

export interface KnowledgeBaseItem {
  id: string;
  itemId: string;
  category: string;
  title: string;
  content: string;
  type: 'FAQ' | 'Policy' | 'Standard Reply';
  createdAt: string;
}

export interface Franchise {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstNumber: string;
  fssaiNumber: string;
  address: string;
  city: string;
  state: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  securityDeposit: number;
  status: 'Pending' | 'Active' | 'Suspended' | 'Terminated';
  monthlyRevenue: number;
  assignedBranchId?: string;
  assignedBrandId?: string;
  createdAt: any;
}

export interface Brand {
  id: string;
  name: string; // e.g., Taaza Bites, Taaza Cafe
  logoUrl?: string;
  primaryColor?: string;
  status: 'Active' | 'Inactive';
}

export interface Settlement {
  id: string;
  franchiseId: string;
  period: string; // e.g., "YYYY-MM"
  totalRevenue: number;
  platformCommission: number; // percentage or fixed
  franchiseCommission: number;
  netPayout: number;
  status: 'Pending' | 'Processing' | 'Paid';
  paidAt?: any;
}

export interface Campaign {
  id: string;
  name: string;
  channel: 'WhatsApp' | 'Push' | 'Email' | 'SMS';
  templateId?: string;
  subject?: string;
  body: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  segment: string;
  status: 'Draft' | 'Scheduled' | 'Processing' | 'Completed' | 'Failed';
  scheduledAt?: string;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  failedCount: number;
  createdAt: string;
}

export interface CommunicationLog {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientContact: string; // phone or email
  channel: 'WhatsApp' | 'Push' | 'Email' | 'SMS';
  type: 'Transactional' | 'Marketing';
  subject?: string;
  body: string;
  status: 'Sent' | 'Delivered' | 'Opened' | 'Clicked' | 'Failed';
  errorMessage?: string;
  timestamp: string;
}

export interface AutomationTrigger {
  id: string;
  name: string;
  description: string;
  channel: 'WhatsApp' | 'Push' | 'Email' | 'SMS';
  templateId: string;
  isActive: boolean;
  updatedAt: string;
}

export interface Ingredient {
  id: string; // ingredientId
  name: string;
  category: string;
  unit: string;
  sku?: string;
  barcode?: string;
  description?: string;
  minimumStock: number;
  maximumStock: number;
  currentStock: number;
  reorderLevel: number;
  preferredSupplierId?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
  stock?: number;
  minStock?: number;
  maxStock?: number;
  supplierName?: string;
  storageLocation?: string;
  costPerUnit?: number;
  expiryDate?: string;
  gstPercent?: number;
}

export interface Stock {
  id: string; // stockId
  ingredientId: string;
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  warehouse: string;
  lastUpdated: string;
}

export interface StockMovement {
  id: string; // movementId
  ingredientId: string;
  ingredientName: string;
  movementType: 'Purchase' | 'Consumption' | 'Adjustment' | 'Waste' | 'Return' | 'Transfer';
  quantity: number;
  referenceType: string;
  referenceId: string;
  performedBy: string;
  remarks?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string; // purchaseOrderId
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'Draft' | 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled' | 'Pending Approval' | 'Approved';
  subtotal: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  poNumber?: string;
  items?: any[];
  totalCost?: number;
  approvedBy?: string;
  receivedBy?: string;
}

export interface Supplier {
  id: string; // supplierId
  companyName: string;
  name?: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
  paymentTerms?: string;
  productsSupplied?: string[];
}

export interface Wallet {
  id: string; // walletId
  customerId: string;
  currentBalance: number;
  currency: string;
  status: 'Active' | 'Frozen';
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string; // transactionId
  walletId: string;
  customerId: string;
  transactionType: 'Credit' | 'Debit' | 'Refund' | 'Subscription Cashback' | 'Reward Redemption' | 'Admin Adjustment';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string;
  remarks?: string;
  createdAt: string;
}

export interface RewardPoints {
  id: string; // rewardId
  customerId: string;
  availablePoints: number;
  lifetimePoints: number;
  redeemedPoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  createdAt: string;
  updatedAt: string;
}

export interface RewardTransaction {
  id: string; // transactionId
  customerId: string;
  points: number;
  transactionType: 'Earned' | 'Redeemed' | 'Expired' | 'Adjustment';
  referenceType: string;
  referenceId: string;
  remarks?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  expenseId: string;
  category: 'Kitchen Purchases' | 'Packaging' | 'Salaries' | 'Delivery Costs' | 'Utilities' | 'Marketing' | 'Miscellaneous';
  amount: number;
  description: string;
  vendorName?: string;
  paymentMethod: string;
  paidBy: string;
  date: string;
  createdAt: string;
}

