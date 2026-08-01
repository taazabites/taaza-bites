# TaazaBites Fresh ERP & Customer Platform

## Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Folder Structure](#folder-structure)
3. [Firestore Schema](#firestore-schema)
4. [Role-Based Access Control (RBAC) & Security](#role-based-access-control-rbac--security)
5. [System Automation Workflows](#system-automation-workflows)
6. [API & Services Layer](#api--services-layer)
7. [Customer Flow](#customer-flow)
8. [Admin User Manual](#admin-user-manual)
9. [Deployment Guide](#deployment-guide)

---

## Overview & Architecture
TaazaBites is a comprehensive full-stack platform managing everything from customer meal subscriptions to kitchen production, delivery logistics, inventory, and finance.
Built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Firebase (Firestore & Auth)**.

### Key Modules:
- **Customer Storefront:** Plan selection, realtime meal viewing, wallet management, order checkout, real-time live tracker.
- **HQ Admin Dashboard:** Centralized ERP hub for managing orders, kitchen queue, inventory, customers, and delivery riders.
- **Realtime Logistics:** Atomic transactions via Firebase to sync customer actions directly to kitchen boards and delivery routes.

---

## Folder Structure
```text
/
├── .env.example                # Environment variables configuration
├── firebase.json               # Firebase rules and hosting settings
├── firestore.rules             # Rigorous RBAC rules for Firestore
├── src/
│   ├── App.tsx                 # Lazy loaded routes and suspense wrappers
│   ├── components/             # Reusable UI components & layouts
│   │   ├── ErrorBoundary.tsx   # Global 500 error & offline handling
│   │   ├── ProtectedRoute.tsx  # Admin Auth Gate
│   │   ├── admin-layout.tsx    # Admin Dashboard shell
│   │   ├── header.tsx          # App Headers
│   │   ├── sidebar.tsx         # Admin Side navigation
│   ├── contexts/               # React Context Providers (AuthContext)
│   ├── lib/                    # Core library initialization (firebase.ts)
│   ├── pages/                  # Route modules
│   │   ├── Home.tsx            # Customer Storefront (B2C)
│   │   ├── not-found.tsx       # Custom 404 Error page
│   │   └── [admin].tsx         # Admin ERP routes (orders, kitchen, etc.)
│   ├── services/               # Data access layer (Firestore services)
│   ├── types/                  # Global TypeScript Interfaces
│   └── main.tsx                # Application Entry Point
```

---

## Firestore Schema
### 1. `customers`
- **Fields:** `id`, `firstName`, `lastName`, `email`, `phone`, `status`, `walletBalance`, `rewardPoints`, `calorieTarget`, `proteinTarget`

### 2. `subscriptions` / `subscriptionPlans`
- **Fields:** `id`, `name`, `price`, `duration`, `mealsPerDay`, `calories`, `status`, `features`

### 3. `menu` / `meals`
- **Fields:** `id`, `mealName`, `category`, `calories`, `protein`, `price`, `availability`, `thumbnailUrl`, `status`

### 4. `orders`
- **Fields:** `id`, `orderId`, `customerId`, `subscriptionId`, `mealName`, `deliveryAddress`, `deliveryArea`, `orderStatus` (Pending/Preparing/Packed/Out for Delivery/Delivered)

### 5. `transactions` / `payments`
- **Fields:** `id`, `paymentId`, `amount`, `status`, `method`, `customerId`, `timestamp`

### 6. `supportTickets`
- **Fields:** `id`, `ticketId`, `customerId`, `subject`, `category`, `priority`, `status`

### 7. `inventory` / `ingredients`
- **Fields:** `id`, `name`, `stock`, `unit`, `reorderLevel`, `supplierId`, `status`

---

## Role-Based Access Control (RBAC) & Security
The `firestore.rules` file enforces tight security.
- **Admin Users:** Fully authenticated users with Admin UIDs can read/write across all operational collections (orders, kitchen, inventory, customers).
- **Public/Customers:** Have restricted access to view their own active subscriptions, menu items, service areas, and to write to their specific order/transaction sub-collections.
- **Atomic Operations:** Key financial transactions (like Wallet Debits + Order Creation + Subscription Activation) use `runTransaction` in Firestore to prevent data inconsistencies or leakage.

---

## System Automation Workflows
- **Kitchen Queue Automation:** New orders immediately appear on the `/kitchen` live display as "Pending". Chef actions (Preparing -> Packed) sync instantly to the Customer's Tracker.
- **Inventory Sync:** As kitchen items are packed, inventory deductions are logged, reducing the risk of human error.
- **Wallet Debit:** Purchasing subscriptions atomically debits the customer wallet balance, awards 10% loyalty reward points, logs a transaction receipt, and initiates the first day's order.
- **Delivery Dispatch:** Once packed, orders enter the `/delivery` routing system where drivers are auto-assigned.

---

## API & Services Layer
All data fetching and modifications happen inside `/src/services/` where logic is cleanly abstracted.
Methods like `getOrders()`, `updateOrderStatus()`, `getInventory()`, etc., are optimized with Firestore `limit()` and `orderBy()` queries for cost and speed.

---

## Customer Flow
1. **Landing & Registration:** Customer accesses B2C homepage, checks Pincode availability, creates a profile (granted a complimentary ₹1500 wallet credit for testing).
2. **Subscription Selection:** Browses real-time dynamic menu and plan catalog.
3. **Checkout (Wallet or Gateway):** Finalizes address, delivery slot (Morning/Afternoon/Evening), applies coupons.
4. **Order Tracking:** Dashboard tab opens with a real-time progress indicator showing exact order stage (Pending -> Confirmed -> Preparing -> Packed -> Delivered).

---

## Admin User Manual
1. **Accessing the ERP:** Navigate to `/login` and authenticate with admin credentials.
2. **Dashboard Overview:** Monitor high-level KPI metrics (Revenue, Profit, Order volume, Churn prediction).
3. **Kitchen Screen (`/kitchen`):** Monitor incoming live orders. Move orders through prep stages via drag-and-drop or status buttons.
4. **Inventory Management (`/inventory`):** Set low-stock alerts and view depletion graphs.
5. **Support Helpdesk (`/support`):** Respond to customer tickets raised in the B2C portal.

---

## Deployment Guide
### Preparing Firebase
1. Initialize Firebase in the root using `firebase init`.
2. Select **Hosting** & **Firestore**.
3. Deploy Firestore Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Preparing Production Build
The React application is optimized with Vite code-splitting and lazy-loading via `React.Suspense`.
1. Set the correct API keys in `.env` (use `.env.example` as a template).
2. Compile and minify the application:
   ```bash
   npm run build
   ```
3. Deploy the compiled assets (`/dist` folder) to Firebase Hosting or Google Cloud Run:
   ```bash
   firebase deploy --only hosting
   ```

### Scalability
The platform leverages Firebase NoSQL structure. By structuring root collections logically, it scales seamlessly to 100,000+ customers. Live listeners are aggressively paginated and limited (`limit(50)`) to maintain fast load times and minimize bandwidth usage.
