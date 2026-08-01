import { collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction } from '../types';

export const financeService = {
  async getTransactions(): Promise<Transaction[]> {
    const txnRef = collection(db, 'transactions');
    const q = query(txnRef, orderBy('timestamp', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
  },

  async issueRefund(txnId: string, amount: number, customerId: string, reason: string): Promise<string> {
    const txnRef = collection(db, 'transactions');
    const docRef = await addDoc(txnRef, {
      customerId,
      amount: -amount,
      type: 'Refund',
      status: 'Success',
      method: 'Original Payment Method',
      timestamp: new Date().toISOString(),
      originalTxnId: txnId,
      reason
    });
    return docRef.id;
  }
};
