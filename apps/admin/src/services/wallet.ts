import { collection, query, onSnapshot, where, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Wallet, WalletTransaction } from '../types';

export const walletService = {
  subscribeWallet(customerId: string, callback: (wallet: Wallet | null) => void) {
    const q = query(collection(db, 'wallets'), where('customerId', '==', customerId));
    return onSnapshot(q, (snap) => {
        if (snap.empty) {
            callback(null);
            return;
        }
        const wallet = { id: snap.docs[0].id, ...snap.docs[0].data() } as Wallet;
        callback(wallet);
    });
  },

  async adjustBalance(customerId: string, amount: number, type: WalletTransaction['transactionType'], referenceId: string, remarks: string): Promise<void> {
    // Implement transaction and balance update using batch
  }
};
