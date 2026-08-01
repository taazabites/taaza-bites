import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RewardPoints, RewardTransaction } from '../types';

export const rewardsService = {
  subscribeRewards(customerId: string, callback: (rewards: RewardPoints | null) => void) {
    const q = query(collection(db, 'rewardPoints'), where('customerId', '==', customerId));
    return onSnapshot(q, (snap) => {
        if (snap.empty) {
            callback(null);
            return;
        }
        const rewards = { id: snap.docs[0].id, ...snap.docs[0].data() } as RewardPoints;
        callback(rewards);
    });
  },

  subscribeRewardTransactions(customerId: string, callback: (transactions: RewardTransaction[]) => void) {
    const q = query(collection(db, 'rewardTransactions'), where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
        const transactions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RewardTransaction));
        callback(transactions);
    });
  }
};
