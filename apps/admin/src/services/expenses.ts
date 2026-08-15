import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Expense } from '../types';
import { auditService } from './audit';

export const expenseService = {
  subscribeExpenses(callback: (expenses: Expense[]) => void) {
    const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const expenses: Expense[] = [];
      snapshot.forEach((doc) => {
        expenses.push({ id: doc.id, ...doc.data() } as Expense);
      });
      callback(expenses);
    }, (error) => {
      console.error("Error subscribing to expenses:", error);
      callback([]);
    });
  },

  async addExpense(expense: Omit<Expense, 'id' | 'createdAt'>, userId: string, userEmail: string): Promise<string> {
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...expense,
      createdAt: new Date().toISOString()
    });

    await auditService.logAction(
      userId,
      userEmail,
      'CREATE',
      'expenses',
      `Added expense: ${expense.expenseId} - ₹${expense.amount} (${expense.category})`
    );

    return docRef.id;
  },

  async deleteExpense(id: string, expenseId: string, userId: string, userEmail: string): Promise<void> {
    await deleteDoc(doc(db, 'expenses', id));
    await auditService.logAction(
      userId,
      userEmail,
      'DELETE',
      'expenses',
      `Deleted expense: ${expenseId}`
    );
  }
};
