# Firestore Database Schema

This document outlines the Firestore collections and their data structures for Taaza Bites. It is designed to be scalable for future expansions like multi-city operations, multiple kitchens, and advanced analytics.

## 1. Users & Profiles

### `users` (Customers)
Stores core user identity, roles, and profile information.
- `uid` (String, Document ID) - Firebase Auth UID
- `phoneNumber` (String) - Primary contact
- `email` (String) - Optional
- `displayName` (String) - User's full name
- `role` (String) - 'customer', 'admin', 'kitchen_staff', 'delivery_partner'
- `createdAt` (Timestamp)
- `lastLoginAt` (Timestamp)
- `fcmTokens` (Array<String>) - For push notifications

### `healthAssessments`
Stores the onboarding health profile and goals.
- `userId` (String) - Reference to `users`
- `age`, `gender`, `height`, `weight` (Number/String)
- `activityLevel` (String) - sedentary, moderate, active
- `goal` (String) - Weight Loss, Muscle Gain, etc.
- `foodPreference` (String) - Veg, Egg, Chicken, Jain
- `allergies` (Array<String>)
- `medicalConditions` (Array<String>)
- `calculatedCalories` (Number)
- `calculatedProtein` (Number)
- `updatedAt` (Timestamp)

### `deliveryAddresses`
Stores saved addresses for a user.
- `userId` (String) - Reference to `users`
- `type` (String) - Home, Work, Other
- `addressLine1`, `addressLine2`, `landmark`, `city`, `state`, `pincode` (String)
- `location` (GeoPoint) - Lat/Lng for precise delivery
- `isDefault` (Boolean)
- `deliveryNotes` (String)

## 2. Subscriptions & Meals

### `subscriptionPlans`
Stores the master list of available plans.
- `name` (String) - e.g., "Weight Loss Plan"
- `durationDays` (Number) - e.g., 15, 30
- `mealsPerDay` (Number) - 1, 2, or 3
- `basePrice` (Number)
- `offerPrice` (Number)
- `features` (Array<String>)
- `isActive` (Boolean)

### `subscriptions`
Stores active, paused, or completed user subscriptions.
- `userId` (String)
- `planId` (String)
- `status` (String) - active, paused, cancelled, completed
- `startDate` (Timestamp)
- `endDate` (Timestamp)
- `totalMeals` (Number)
- `mealsConsumed` (Number)
- `addressId` (String)
- `deliverySlot` (String)
- `customizations` (Map) - Preferences specific to this run

### `mealItems`
Master catalog of dishes available.
- `name` (String)
- `description` (String)
- `cuisine` (String)
- `dietType` (String) - Veg, Non-Veg, Vegan, Jain
- `macros` (Map) - calories, protein, carbs, fats
- `ingredients` (Array<String>)
- `allergens` (Array<String>)
- `imageUrl` (String)
- `kitchenId` (String) - For multi-kitchen scaling

### `weeklyMenus`
Stores what is being served on a given date for a specific diet.
- `date` (Timestamp)
- `dietType` (String)
- `breakfastId`, `lunchId`, `dinnerId` (Strings) - Refs to `mealItems`

### `orders` (Daily Deliveries)
The materialized daily deliveries generated from active subscriptions.
- `subscriptionId` (String)
- `userId` (String)
- `deliveryDate` (Timestamp)
- `status` (String) - scheduled, preparing, out_for_delivery, delivered, skipped
- `mealItems` (Array<String>)
- `deliveryAddress` (Map) - Snapshot of the address
- `deliveryPartnerId` (String) - Reference to delivery staff

## 3. Payments & Finances

### `payments`
Ledger of all Razorpay transactions.
- `userId` (String)
- `razorpayOrderId` (String)
- `razorpayPaymentId` (String)
- `amount` (Number)
- `currency` (String)
- `status` (String) - created, authorized, captured, failed, refunded
- `purpose` (String) - 'subscription_purchase', 'wallet_topup'
- `createdAt` (Timestamp)

### `wallets`
Stores the user's prepaid cash balance.
- `userId` (String, Document ID)
- `balance` (Number)
- `lastUpdated` (Timestamp)

### `rewardTransactions`
Ledger of loyalty points.
- `userId` (String)
- `points` (Number) - Positive for earned, negative for spent
- `type` (String) - 'earned', 'redeemed'
- `description` (String) - e.g., "7-Day Streak Bonus"
- `createdAt` (Timestamp)

### `coupons`
Available discount codes.
- `code` (String)
- `type` (String) - 'percentage', 'flat'
- `discountValue` (Number)
- `minOrderValue` (Number)
- `maxDiscount` (Number)
- `validUntil` (Timestamp)
- `isActive` (Boolean)
- `usageLimit` (Number)

## 4. Platform & Operations

### `notifications`
In-app alerts and messages.
- `userId` (String)
- `title` (String)
- `body` (String)
- `type` (String) - 'system', 'delivery', 'promo'
- `isRead` (Boolean)
- `createdAt` (Timestamp)

### `supportTickets`
Customer service queries.
- `userId` (String)
- `subject` (String)
- `status` (String) - open, in_progress, resolved
- `messages` (Array<Map>) - {sender: 'user'|'agent', text: String, timestamp: Timestamp}
- `createdAt` (Timestamp)

### `blogs` / `testimonials` / `faqs`
Content management for the public website.
- Standard fields: `title`, `content`, `author`, `publishedAt`, `isActive`, `category`.
