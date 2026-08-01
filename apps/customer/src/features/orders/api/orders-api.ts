import { db } from '@/src/firebase/db';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export interface Order {
  id: string;
  planName: string;
  amount: number;
  status: "active" | "completed" | "cancelled" | "processing";
  date: any;
  items: string[];
}

export const getOrders = async (userId: string): Promise<Order[]> => {
  const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
};
