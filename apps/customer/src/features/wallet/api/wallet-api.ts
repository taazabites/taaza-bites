import { db } from '@/src/firebase/db';
import { doc, getDoc, onSnapshot, collection, query, where, getDocs, orderBy } from "firebase/firestore";

export interface WalletData {
  balance: number;
  cashback: number;
  referralClaimed: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: "recharge" | "deduction" | "cashback" | "refund";
  description: string;
  createdAt: any;
}

export const subscribeToWallet = (userId: string, callback: (wallet: WalletData | null) => void) => {
  return onSnapshot(doc(db, "wallets", userId), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as WalletData);
    } else {
      callback({ balance: 0, cashback: 0, referralClaimed: false });
    }
  });
};

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const q = query(collection(db, "walletTransactions"), where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
};
