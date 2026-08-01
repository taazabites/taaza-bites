import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  DocumentData,
  QueryConstraint,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './db';

// Generic error handler for Firestore security rule violations
const handleFirestoreError = (error: any, operation: string, collectionName: string) => {
  if (error?.code === 'permission-denied') {
    const errorResponse = {
      status: 'error',
      message: 'Missing or insufficient permissions.',
      operation,
      collection: collectionName,
      code: 'permission-denied',
      timestamp: new Date().toISOString()
    };
    console.warn(`[Firestore Security Notice] ${operation} on ${collectionName}:`, errorResponse);
  } else {
    console.warn(`[Firestore Notice] ${operation} on ${collectionName}:`, error);
  }
};

// Generic CRUD operations
export const addDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, 'addDocument', collectionName);
  }
};

export const getDocument = async <T>(collectionName: string, id: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, 'getDocument', collectionName);
    return null;
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    handleFirestoreError(error, 'updateDocument', collectionName);
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'deleteDocument', collectionName);
  }
};

export const getDocuments = async <T>(
  collectionName: string, 
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  } catch (error) {
    handleFirestoreError(error, 'getDocuments', collectionName);
    return [];
  }
};

export const subscribeToCollection = <T>(
  collectionName: string, 
  constraints: QueryConstraint[], 
  callback: (data: T[]) => void
) => {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, 
    (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
      callback(data);
    },
    (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error);
      callback([]);
    }
  );
};

export const subscribeToDocument = <T>(
  collectionName: string, 
  id: string, 
  callback: (data: T | null) => void
) => {
  const docRef = doc(db, collectionName, id);
  return onSnapshot(docRef, 
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error(`Error subscribing to ${collectionName}/${id}:`, error);
      callback(null);
    }
  );
};
