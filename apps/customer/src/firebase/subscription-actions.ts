import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './db';
import { computeRenewalProbability, computeRetentionState } from '../lib/retention';
import { mealsRemainingOf, totalMealsOf } from '../lib/subscription-lifecycle';
import { trackFunnel } from '../lib/funnel-analytics';

async function logEvent(
  userId: string,
  subscriptionId: string,
  type: string,
  payload?: Record<string, unknown>
) {
  await addDoc(collection(db, 'subscriptionEvents'), {
    customerId: userId,
    userId,
    subscriptionId,
    type,
    payload: payload || {},
    createdAt: serverTimestamp(),
  });
}

async function touchCustomerCrm(userId: string, extra: Record<string, unknown> = {}) {
  const userRef = doc(db, 'users', userId);
  const customerRef = doc(db, 'customers', userId);
  const patch = { lastActivityAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra };
  await updateDoc(userRef, patch).catch(() => undefined);
  await updateDoc(customerRef, patch).catch(() => undefined);
}

function nextCalendarDay(from: Date, days = 1) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

export const SubscriptionActions = {
  logEvent,

  pause: async (userId: string, subscriptionId: string, reason?: string, startDate?: string, endDate?: string) => {
    const ref = doc(db, 'subscriptions', subscriptionId);
    await updateDoc(ref, {
      status: 'paused',
      paused: true,
      pauseHistory: [
        {
          startDate: startDate || new Date().toISOString(),
          endDate: endDate || null,
          reason: reason || 'User requested',
          createdAt: new Date().toISOString(),
        },
      ],
      updatedAt: serverTimestamp(),
    });
    await logEvent(userId, subscriptionId, 'paused', { reason });
    await touchCustomerCrm(userId, { retentionState: computeRetentionState({ status: 'paused' }) });
    trackFunnel('subscription_paused', { subscriptionId });
  },

  resume: async (userId: string, subscriptionId: string) => {
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      status: 'active',
      paused: false,
      updatedAt: serverTimestamp(),
    });
    await logEvent(userId, subscriptionId, 'resumed');
    await touchCustomerCrm(userId, { retentionState: 'healthy' });
    trackFunnel('subscription_resumed', { subscriptionId });
  },

  cancel: async (userId: string, subscriptionId: string, reason: string) => {
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      status: 'cancelled',
      cancellationReason: reason,
      paused: false,
      updatedAt: serverTimestamp(),
    });
    await logEvent(userId, subscriptionId, 'cancelled', { reason });
    await touchCustomerCrm(userId, { retentionState: 'churned', hasActiveSubscription: false });
    trackFunnel('subscription_cancelled', { subscriptionId });
  },

  changeAddress: async (userId: string, subscriptionId: string, addressId: string, addressSnapshot?: Record<string, unknown>) => {
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      deliveryAddressId: addressId,
      deliveryAddress: addressSnapshot || null,
      updatedAt: serverTimestamp(),
    });
    await logEvent(userId, subscriptionId, 'address_changed', { addressId });
    await touchCustomerCrm(userId);
  },

  changeDeliveryTime: async (userId: string, subscriptionId: string, deliveryTime: string) => {
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      deliveryTime,
      deliveryTiming: deliveryTime,
      updatedAt: serverTimestamp(),
    });
    await logEvent(userId, subscriptionId, 'delivery_time_changed', { deliveryTime });
    await touchCustomerCrm(userId);
  },

  changeMealPreference: async (userId: string, subscriptionId: string, mealPreference: string[]) => {
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      mealPreference,
      updatedAt: serverTimestamp(),
    });
    await logEvent(userId, subscriptionId, 'meal_preference_changed', { mealPreference });
    await touchCustomerCrm(userId);
  },

  skipDay: async (userId: string, subscriptionId: string, dateStr: string) => {
    const schedules = await getDocs(
      query(
        collection(db, 'mealSchedules'),
        where('userId', '==', userId),
        where('date', '==', dateStr)
      )
    );

    let skipped = 0;
    await runTransaction(db, async (tx) => {
      const subRef = doc(db, 'subscriptions', subscriptionId);
      const subSnap = await tx.get(subRef);
      if (!subSnap.exists()) throw new Error('Subscription not found');
      const sub = subSnap.data();
      if (sub.userId !== userId) throw new Error('Unauthorized');

      for (const s of schedules.docs) {
        const status = String(s.data().deliveryStatus || '');
        if (['delivered', 'skipped', 'cancelled'].includes(status)) continue;
        tx.update(s.ref, { deliveryStatus: 'skipped', status: 'skipped', updatedAt: serverTimestamp() });
        skipped += 1;
      }

      if (skipped === 0) return;

      const end = sub.endDate?.toDate ? sub.endDate.toDate() : new Date(sub.endDate);
      const newEnd = nextCalendarDay(end, 1);
      const remaining = mealsRemainingOf(sub);
      tx.update(subRef, {
        endDate: Timestamp.fromDate(newEnd),
        remainingMeals: remaining,
        mealsRemaining: remaining,
        updatedAt: serverTimestamp(),
      });
    });

    if (skipped > 0) {
      await logEvent(userId, subscriptionId, 'skipped_day', { dateStr, skipped });
      const skippedMealsCount = skipped;
      await touchCustomerCrm(userId, {
        skippedMealsCount,
        retentionState: computeRetentionState({ status: 'active', skippedMealsCount }),
      });
      trackFunnel('subscription_skipped', { subscriptionId, date: dateStr });
    }
    return skipped;
  },

  skipMeal: async (userId: string, subscriptionId: string, scheduleId: string) => {
    const scheduleRef = doc(db, 'mealSchedules', scheduleId);
    const subRef = doc(db, 'subscriptions', subscriptionId);

    await runTransaction(db, async (tx) => {
      const scheduleSnap = await tx.get(scheduleRef);
      const subSnap = await tx.get(subRef);
      if (!scheduleSnap.exists() || !subSnap.exists()) throw new Error('Record not found');
      if (scheduleSnap.data().userId !== userId || subSnap.data().userId !== userId) {
        throw new Error('Unauthorized');
      }
      const status = String(scheduleSnap.data().deliveryStatus || '');
      if (['delivered', 'skipped', 'cancelled'].includes(status)) {
        throw new Error('This meal can no longer be skipped');
      }
      tx.update(scheduleRef, { deliveryStatus: 'skipped', status: 'skipped', updatedAt: serverTimestamp() });
      const end = subSnap.data().endDate?.toDate ? subSnap.data().endDate.toDate() : new Date(subSnap.data().endDate);
      tx.update(subRef, {
        endDate: Timestamp.fromDate(nextCalendarDay(end, 0)),
        updatedAt: serverTimestamp(),
      });
    });

    await logEvent(userId, subscriptionId, 'skipped_meal', { scheduleId });
    await touchCustomerCrm(userId);
    trackFunnel('subscription_skipped', { subscriptionId });
  },

  changeDeliveryDate: async (
    userId: string,
    subscriptionId: string,
    fromDate: string,
    toDate: string
  ) => {
    const schedules = await getDocs(
      query(
        collection(db, 'mealSchedules'),
        where('userId', '==', userId),
        where('date', '==', fromDate)
      )
    );
    for (const s of schedules.docs) {
      const status = String(s.data().deliveryStatus || '');
      if (['delivered', 'cancelled'].includes(status)) continue;
      await updateDoc(s.ref, { date: toDate, updatedAt: serverTimestamp() });
    }
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      nextDeliveryDate: toDate,
      updatedAt: serverTimestamp(),
    });
    await logEvent(userId, subscriptionId, 'delivery_date_changed', { fromDate, toDate });
    await touchCustomerCrm(userId, { nextDeliveryDate: toDate });
  },

  syncCrmProfile: async (userId: string, subscription: Record<string, any>) => {
    const remaining = mealsRemainingOf(subscription);
    const completed = Number(subscription.mealsCompleted || 0);
    const total = totalMealsOf(subscription);
    const payload = {
      lastActivityAt: serverTimestamp(),
      currentPlanId: subscription.planId || null,
      currentSubscriptionId: subscription.id || null,
      mealsRemaining: remaining,
      mealsCompleted: completed,
      nextDeliveryDate: subscription.nextDeliveryDate || null,
      retentionState: computeRetentionState(subscription),
      renewalProbability: computeRenewalProbability({
        status: subscription.status,
        skippedMealsCount: subscription.skippedMealsCount,
        mealsCompleted: completed,
        totalMeals: total,
        endDate: subscription.endDate,
      }),
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(db, 'users', userId), payload).catch(() => undefined);
    await updateDoc(doc(db, 'customers', userId), payload).catch(() => undefined);
  },
};
