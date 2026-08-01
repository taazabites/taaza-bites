import { adminDb } from "../../firebase/firebase-admin.ts";
import { FieldValue } from "firebase-admin/firestore";

export const BillingService = {
  /**
   * Securely add/subtract balance from a user's wallet.
   * Only callable from the backend.
   */
  async updateWalletBalance(userId: string, amount: number, type: 'credit' | 'debit', reason: string, referenceId: string) {
    return adminDb.runTransaction(async (transaction) => {
      const walletRef = adminDb.collection("wallets").doc(userId);
      const walletDoc = await transaction.get(walletRef);
      
      let currentBalance = 0;
      if (walletDoc.exists) {
        currentBalance = walletDoc.data()?.balance || 0;
      }

      const newBalance = type === 'credit' ? currentBalance + amount : Math.max(0, currentBalance - amount);
      
      transaction.set(walletRef, {
        userId,
        balance: newBalance,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });

      const txRef = adminDb.collection("walletTransactions").doc();
      transaction.set(txRef, {
        id: txRef.id,
        userId,
        type,
        amount,
        reason,
        referenceId,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        createdAt: FieldValue.serverTimestamp()
      });

      // Also create a notification
      const notifRef = adminDb.collection("notifications").doc();
      transaction.set(notifRef, {
        id: notifRef.id,
        userId,
        title: type === 'credit' ? "Wallet Credited! 💰" : "Wallet Debited! 💳",
        message: type === 'credit' ? `₹${amount} credited for: ${reason}` : `₹${amount} debited for: ${reason}`,
        type: 'wallet',
        read: false,
        createdAt: FieldValue.serverTimestamp()
      });

      return { newBalance };
    });
  },

  /**
   * Securely update reward points.
   */
  async updateRewardPoints(userId: string, points: number, type: 'credit' | 'debit', reason: string) {
    return adminDb.runTransaction(async (transaction) => {
      const rewardRef = adminDb.collection("rewardPoints").doc(userId);
      const rewardDoc = await transaction.get(rewardRef);
      
      const data = rewardDoc.exists ? rewardDoc.data() : { currentPoints: 0, lifetimePoints: 0 };
      const currentPoints = data?.currentPoints || 0;
      const lifetimePoints = data?.lifetimePoints || 0;

      const newPoints = type === 'credit' ? currentPoints + points : Math.max(0, currentPoints - points);
      const newLifetime = type === 'credit' ? lifetimePoints + points : lifetimePoints;

      transaction.set(rewardRef, {
        userId,
        currentPoints: newPoints,
        lifetimePoints: newLifetime,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });

      const txRef = adminDb.collection("rewardTransactions").doc();
      transaction.set(txRef, {
        id: txRef.id,
        userId,
        type,
        points,
        reason,
        createdAt: FieldValue.serverTimestamp()
      });

      return { newPoints };
    });
  }
};
