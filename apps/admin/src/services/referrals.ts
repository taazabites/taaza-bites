import { db } from "../lib/firebase"
import { collection, query, orderBy, onSnapshot, getDocs, doc, updateDoc, serverTimestamp, setDoc, addDoc } from "firebase/firestore"
import { Referral } from "../types"

const COLLECTION_NAME = "referrals"

export const referralService = {
  getReferrals: (callback: (data: Referral[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Referral[];
      callback(data);
    });
  },

  addReferral: async (referralData: Omit<Referral, 'id' | 'createdAt'>) => {
    const ref = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(ref, {
      ...referralData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  },

  updateReferralStatus: async (id: string, status: 'Pending' | 'Completed' | 'Rejected') => {
    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, {
      status,
      updatedAt: serverTimestamp()
    });
  }
}
