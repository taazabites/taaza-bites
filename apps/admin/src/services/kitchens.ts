import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';

export interface Kitchen {
  id: string;
  branchId: string;
  name: string;
  capacity: number;
  status: 'Active' | 'Inactive';
  createdAt: any;
}

const COLLECTION_NAME = 'kitchens';

export const kitchenService = {
  async getKitchens(): Promise<Kitchen[]> {
    const q = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Kitchen));
  },

  async addKitchen(kitchen: Omit<Kitchen, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...kitchen,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  async updateKitchen(id: string, kitchen: Partial<Kitchen>): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), { ...kitchen });
  },

  async deleteKitchen(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
};
