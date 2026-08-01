import { adminDb } from "../../firebase/firebase-admin.ts";
import { FieldValue } from "firebase-admin/firestore";

export const SubscriptionService = {
  /**
   * Activates a subscription after successful payment.
   * Creates initial orders and schedules.
   */
  async activateSubscription(userId: string, planId: string, paymentId: string, addressId: string, deliverySlot: string) {
    const planDoc = await adminDb.collection("subscriptionPlans").doc(planId).get();
    if (!planDoc.exists) throw new Error("Invalid plan ID");
    const plan = planDoc.data();

    const subId = `sub_${Date.now()}`;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (plan?.durationDays || 30));

    const subscription = {
      id: subId,
      userId,
      planId,
      planName: plan?.name,
      status: 'active',
      startDate: startDate,
      endDate: endDate,
      remainingMeals: (plan?.mealsPerDay || 1) * (plan?.durationDays || 30),
      deliveryAddressId: addressId,
      deliverySlot: deliverySlot,
      paymentId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await adminDb.collection("subscriptions").doc(subId).set(subscription);
    
    // Update user profile
    await adminDb.collection("users").doc(userId).update({
      hasActiveSubscription: true,
      updatedAt: FieldValue.serverTimestamp()
    });

    // Create first 7 days of scheduled orders
    await this.generateOrders(subId, userId, startDate, 7, plan?.mealsPerDay || 1);

    return { subId };
  },

  async generateOrders(subscriptionId: string, userId: string, startDate: Date, days: number, mealsPerDay: number) {
    const batch = adminDb.batch();
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      for (let j = 0; j < mealsPerDay; j++) {
        const orderId = `ord_${subscriptionId}_${dateStr}_${j}`;
        const orderRef = adminDb.collection("orders").doc(orderId);
        batch.set(orderRef, {
          id: orderId,
          userId,
          subscriptionId,
          date: dateStr,
          mealType: j === 0 ? 'Breakfast' : j === 1 ? 'Lunch' : 'Dinner',
          status: 'scheduled',
          createdAt: FieldValue.serverTimestamp()
        });
      }
    }
    await batch.commit();
  }
};
