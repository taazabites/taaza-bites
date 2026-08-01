import { db } from '@/src/firebase/db';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";

export interface MealItem {
  id: string;
  name: string;
  type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  water?: number;
  image: string;
  portionSelected?: "standard" | "bulking" | "keto";
  customized?: boolean;
}

export const getTodayMeals = async (userId: string, dateStr: string): Promise<MealItem[]> => {
  const q = query(collection(db, "users", userId, "dailyMeals"), where("date", "==", dateStr));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].data().meals as MealItem[];
  }
  return []; // Return empty array instead of mock data
};

export const saveTodayMeals = async (userId: string, dateStr: string, meals: MealItem[]) => {
  const docRef = doc(db, "users", userId, "dailyMeals", dateStr);
  await setDoc(docRef, { date: dateStr, meals, updatedAt: serverTimestamp() }, { merge: true });
};
