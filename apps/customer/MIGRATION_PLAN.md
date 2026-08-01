# TaazaBites Backend Migration Plan (V1.5)

This document outlines the migration from the current flattened Firestore structure to a modular, enterprise-grade architecture capable of supporting 100,000+ customers.

## 1. Current State Assessment

Currently, TaazaBites uses a semi-flattened Firestore structure with core collections like `users`, `subscriptions`, `healthAssessments`, and `orders`. Some data is mixed (e.g., PII in the main `users` document).

### Current Collections:
- `users`: Mixed auth and profile data.
- `subscriptions`: User subscription instances.
- `healthAssessments`: User health survey results.
- `orders`: Daily meal delivery logs.
- `wallets`: Single-field balance documents.

## 2. Proposed V1.5 Architecture

The new structure segregates data by functional service boundaries (Authentication, Customer, Health, Subscription, Payment, etc.).

### Modular Collections:
- **Auth**: `users` (Core UID/Email/Role only)
- **Customer**: `customerProfiles`, `customerPreferences`, `customerAddresses`
- **Health**: `healthAssessments`, `bodyMetrics`, `healthGoals`, `nutritionProfiles`
- **Meal**: `mealItems`, `recipes`, `weeklyMenus`
- **Order**: `orders`, `orderItems`
- **Payment**: `payments`, `paymentTransactions`, `invoices`
- **Loyalty**: `wallets`, `walletTransactions`, `rewardPoints`, `rewardHistory`
- **Engagement**: `notifications`, `emailQueue`, `smsQueue`, `pushQueue`
- **Analytics**: `events`, `analyticsSummaries`

## 3. Migration Steps

### Step 1: Schema Shadowing (Read-Only)
- Deploy new security rules that allow the server (Admin SDK) to write to the new collections.
- Update `server.ts` to "dual-write" incoming data to both old and new locations.

### Step 2: Data Backfill
- Run a background script to migrate existing documents from `users` to `customerProfiles` and `customerPreferences`.
- Migrate `healthAssessments` to the new normalized schema.

### Step 3: Frontend Switchover
- Update frontend services to read from the new collections.
- Maintain legacy collections as read-only for 30 days.

### Step 4: Cleanup
- Deprecate old collections.
- Update Firestore indexes.

## 4. Rollback Plan

### Strategy: Parallel Persistence
During the migration, the system will maintain "Dual Writes". If a critical failure is detected in the new services:
1. Revert the frontend service endpoints to point back to the legacy collections.
2. The legacy data remains consistent because it was never stopped during Step 1 & 2.
3. Fix the V1.5 logic and retry the switchover.

## 5. Security & Scaling
- **App Check**: Enabling App Check to prevent unauthorized API access.
- **RBAC**: Strict role-based access control in `firestore.rules`.
- **Backend-Only writes**: Sensitive operations (Wallet updates, Subscription activation) are moved entirely to `server.ts` (acting as Cloud Functions).
