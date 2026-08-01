import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { MenuItem } from '../types';
import { auditService } from './audit';

// Toggle for UI Stabilization phase

// Local state for mock data

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Menu Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const menuService = {
  /**
   * Subscribe to real-time menu updates (excluding soft-deleted items).
   */
  subscribeMenu(
    onUpdate: (items: MenuItem[]) => void, 
    onError?: (err: any) => void
  ) {
    
    const path = 'menuItems';
    const menuRef = collection(db, path);
    
    return onSnapshot(
      menuRef,
      (snapshot) => {
        const items = snapshot.docs
          .map(doc => ({
            id: doc.id,
            mealId: doc.id,
            ...doc.data()
          }))
          .filter((item: any) => !item.isDeleted) as MenuItem[];
        
        // Sort by displayOrder first, then mealName
        items.sort((a, b) => {
          const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
          if (orderDiff !== 0) return orderDiff;
          return a.mealName.localeCompare(b.mealName);
        });
        
        onUpdate(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (wrappedError) {
          if (onError) onError(wrappedError);
        }
      }
    );
  },

  /**
   * Create a new menu meal
   */
  async createMeal(
    meal: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>,
    adminId: string,
    adminEmail: string
  ): Promise<string> {
    
    const path = 'menuItems';
    try {
      const menuRef = collection(db, path);
      const now = new Date().toISOString();
      const newMealData = {
        ...meal,
        isDeleted: false,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(menuRef, newMealData);
      
      // Update with the generated document ID
      await updateDoc(doc(db, path, docRef.id), { mealId: docRef.id });

      await auditService.logAction(
        adminId,
        adminEmail,
        'CREATE',
        `Menu Meal ${docRef.id}`,
        `Created meal "${meal.mealName}" under category "${meal.category}" with price ₹${meal.price}`
      );
      
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  /**
   * Update an existing menu meal
   */
  async updateMeal(
    id: string,
    updates: Partial<MenuItem>,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    
    const path = `menu/${id}`;
    try {
      const mealRef = doc(db, 'menuItems', id);
      const now = new Date().toISOString();
      const updatedData = {
        ...updates,
        updatedAt: now
      };
      
      // Clean unique key fields
      delete (updatedData as any).id;
      
      await updateDoc(mealRef, updatedData);
      
      await auditService.logAction(
        adminId,
        adminEmail,
        'UPDATE',
        `Menu Meal ${id}`,
        `Updated fields: ${Object.keys(updates).join(', ')}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Delete a menu meal (soft delete preferred)
   */
  async deleteMeal(
    id: string,
    adminId: string,
    adminEmail: string,
    softDelete: boolean = true
  ): Promise<void> {
    
    const path = `menu/${id}`;
    try {
      const mealRef = doc(db, 'menuItems', id);
      
      // Get name for audit
      const mealSnap = await getDoc(mealRef);
      const mealName = mealSnap.exists() ? mealSnap.data().mealName : id;
      
      if (softDelete) {
        await updateDoc(mealRef, {
          isDeleted: true,
          status: 'Inactive',
          updatedAt: new Date().toISOString()
        });
        
        await auditService.logAction(
          adminId,
          adminEmail,
          'DELETE',
          `Menu Meal ${id}`,
          `Soft-deleted meal "${mealName}" (marked isDeleted=true)`
        );
      } else {
        await deleteDoc(mealRef);
        
        await auditService.logAction(
          adminId,
          adminEmail,
          'DELETE',
          `Menu Meal ${id}`,
          `Hard-deleted meal "${mealName}" from Firestore`
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Duplicate an existing menu meal
   */
  async duplicateMeal(
    id: string,
    adminId: string,
    adminEmail: string
  ): Promise<string> {
    
    const path = `menu/${id}`;
    try {
      const mealRef = doc(db, 'menuItems', id);
      const mealSnap = await getDoc(mealRef);
      
      if (!mealSnap.exists()) {
        throw new Error('Original meal not found');
      }
      
      const original = mealSnap.data() as MenuItem;
      const now = new Date().toISOString();
      
      const duplicateData: Omit<MenuItem, 'id'> = {
        ...original,
        mealName: `${original.mealName} (Copy)`,
        displayOrder: (original.displayOrder || 0) + 1,
        createdAt: now,
        updatedAt: now
      };
      
      // Ensure the isDeleted field is false
      (duplicateData as any).isDeleted = false;
      
      const menuRef = collection(db, 'menuItems');
      const docRef = await addDoc(menuRef, duplicateData);
      
      await updateDoc(doc(db, 'menuItems', docRef.id), { mealId: docRef.id });

      await auditService.logAction(
        adminId,
        adminEmail,
        'CREATE',
        `Menu Meal ${docRef.id}`,
        `Duplicated meal "${original.mealName}" as "${duplicateData.mealName}"`
      );
      
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  }
};
