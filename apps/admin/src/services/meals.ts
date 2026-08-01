import { collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Meal } from '../types';

export const mealService = {
  async getMeals(): Promise<Meal[]> {
    const mealsRef = collection(db, 'meals');
    const q = query(mealsRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  },

  async createMeal(meal: Omit<Meal, 'id'>): Promise<string> {
    const mealsRef = collection(db, 'meals');
    const docRef = await addDoc(mealsRef, meal);
    return docRef.id;
  },

  async updateMeal(id: string, updates: Partial<Meal>): Promise<void> {
    const mealRef = doc(db, 'meals', id);
    await updateDoc(mealRef, updates);
  },

  async toggleMealStatus(id: string, currentStatus: boolean): Promise<void> {
    const mealRef = doc(db, 'meals', id);
    await updateDoc(mealRef, { isActive: !currentStatus });
  },

  async deleteMeal(id: string): Promise<void> {
    const mealRef = doc(db, 'meals', id);
    await deleteDoc(mealRef);
  }
};
