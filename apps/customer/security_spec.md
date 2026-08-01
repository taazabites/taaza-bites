# Firestore Security Specification - TaazaBites

## 1. Data Invariants

1.  **Identity Integrity**: A user can only create/update their own profile (`users/{uid}`), addresses, subscriptions, health assessments, and wallet records.
2.  **Relational Consistency**: A `Subscription` must reference a valid `planId` and a valid `userId`.
3.  **Immutable Financials**: Once a `Payment` is marked as `verified`, it cannot be modified by the client.
4.  **Transaction Integrity**: `walletTransactions` must be immutable once created.
5.  **Admin Monopoly**: `subscriptionPlans`, `meals`, `serviceAreas`, and `settings` are read-only for customers and writeable only by admins.
6.  **Subscription Lockdown**: A user cannot modify `remainingMeals` directly; this is handled by the backend (simulated here via strict rules or expected cloud functions, but we must prevent client-side bypass).

## 2. The "Dirty Dozen" Payloads (Attack Vectors)

| ID | Attack Vector | Payload Snippet | Target Path | Expected Result |
|----|---------------|-----------------|-------------|-----------------|
| 1  | Identity Spoofing | `{ "uid": "victim_uid", "role": "admin" }` | `users/attacker_uid` | DENIED |
| 2  | Privilege Escalation | `{ "role": "admin" }` | `users/attacker_uid` (update) | DENIED |
| 3  | PII Leak (Read) | `get()` | `users/victim_uid` | DENIED |
| 4  | Cross-User Address Write | `{ "userId": "victim_uid", ... }` | `addresses/new_id` | DENIED |
| 5  | Illegal Plan Discount | `{ "price": 0.01 }` | `subscriptionPlans/premium_plan` | DENIED |
| 6  | Payment Verification Spoof | `{ "verified": true }` | `payments/pay_123` | DENIED |
| 7  | Wallet Balance Injection | `{ "balance": 1000000 }` | `wallets/attacker_uid` | DENIED |
| 8  | Coupon Usage Bypass | `{ "active": true, "usageLimit": 9999 }` | `coupons/SAVE50` | DENIED |
| 9  | Historical Order Tampering | `{ "amount": 0 }` | `orders/old_order_id` | DENIED |
| 10 | Meal Schedule Hijack | `{ "userId": "victim_uid" }` | `mealSchedules/schedule_id` | DENIED |
| 11 | Global Settings Vandalism | `{ "maintenanceMode": true }` | `settings/global` | DENIED |
| 12 | Support Ticket Escalation | `{ "status": "resolved" }` | `supportTickets/ticket_id` | DENIED |

## 3. Conflict Report

| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
|------------|-------------------|-------------------|--------------------|
| users | BLOCKED (isOwner) | BLOCKED (role immutable) | BLOCKED (schema size) |
| plans | BLOCKED (isAdmin) | BLOCKED (isAdmin) | BLOCKED (schema size) |
| subscriptions | BLOCKED (isOwner) | BLOCKED (status checks) | BLOCKED (schema size) |
| payments | BLOCKED (isOwner) | BLOCKED (immutable verified) | BLOCKED (schema size) |
| wallets | BLOCKED (isOwner) | BLOCKED (system-managed) | BLOCKED (schema size) |
| settings | BLOCKED (isAdmin) | BLOCKED (isAdmin) | BLOCKED (schema size) |
