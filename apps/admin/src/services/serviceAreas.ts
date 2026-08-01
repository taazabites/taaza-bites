import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ServiceArea } from '../types';
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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const serviceAreasService = {
  /**
   * Subscribe to service areas collection in real-time
   */
  subscribeToAreas(callback: (areas: ServiceArea[]) => void): () => void {
    
    const path = 'serviceAreas';
    const q = query(collection(db, path), orderBy('areaName', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const areas: ServiceArea[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        areas.push({
          id: doc.id,
          areaId: data.areaId || doc.id,
          areaName: data.areaName || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          pincodes: Array.isArray(data.pincodes) ? data.pincodes : [],
          deliveryCharge: Number(data.deliveryCharge ?? 0),
          freeDeliveryAbove: Number(data.freeDeliveryAbove ?? 0),
          minimumOrder: Number(data.minimumOrder ?? 0),
          estimatedDeliveryTime: data.estimatedDeliveryTime || '',
          deliveryRoute: data.deliveryRoute || '',
          status: data.status || 'Active',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        } as ServiceArea);
      });
      callback(areas);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  /**
   * Add a new service area
   */
  async addArea(
    area: Omit<ServiceArea, 'id' | 'createdAt' | 'updatedAt'>,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    
    const path = 'serviceAreas';
    const now = new Date().toISOString();
    const areaCollection = collection(db, path);
    const docRef = doc(areaCollection);
    
    const newArea: Omit<ServiceArea, 'id'> = {
      areaId: docRef.id,
      ...area,
      createdAt: now,
      updatedAt: now
    };

    try {
      await setDoc(docRef, newArea);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${path}/${docRef.id}`);
    }

    await auditService.logAction(
      adminId,
      adminEmail,
      'CREATE',
      `Service Area ${newArea.areaName}`,
      `Added new service area ${newArea.areaName} in ${newArea.city} with PIN codes ${newArea.pincodes.join(', ')}`
    );
  },

  /**
   * Update service area
   */
  async updateArea(
    id: string,
    area: Partial<ServiceArea>,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    
    const path = `serviceAreas/${id}`;
    const now = new Date().toISOString();
    const docRef = doc(db, 'serviceAreas', id);
    
    const updateData = {
      ...area,
      updatedAt: now
    };

    try {
      await updateDoc(docRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }

    await auditService.logAction(
      adminId,
      adminEmail,
      'UPDATE',
      `Service Area ${id}`,
      `Updated service area details for ${area.areaName || id}`
    );
  },

  /**
   * Delete a service area
   */
  async deleteArea(id: string, adminId: string, adminEmail: string): Promise<void> {
    
    const path = `serviceAreas/${id}`;
    const docRef = doc(db, 'serviceAreas', id);
    
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }

    await auditService.logAction(
      adminId,
      adminEmail,
      'DELETE',
      `Service Area ${id}`,
      `Deleted service area with ID ${id}`
    );
  },

  /**
   * Seed Initial Service Areas
   */
  async seedServiceAreas(): Promise<void> {
    
    const path = 'serviceAreas';
    const now = new Date().toISOString();
    
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        const initialAreas = [
          {
            areaName: 'Powai Premium Area',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pincodes: ['400076', '400072'],
            deliveryCharge: 40,
            freeDeliveryAbove: 500,
            minimumOrder: 150,
            estimatedDeliveryTime: '20-30 mins',
            deliveryRoute: 'Powai Premium Route',
            status: 'Active' as const
          },
          {
            areaName: 'Bandra West Coastal Area',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pincodes: ['400050', '400052'],
            deliveryCharge: 50,
            freeDeliveryAbove: 600,
            minimumOrder: 200,
            estimatedDeliveryTime: '25-35 mins',
            deliveryRoute: 'Bandra West Coastal',
            status: 'Active' as const
          },
          {
            areaName: 'Juhu Scheme Area',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pincodes: ['400049'],
            deliveryCharge: 60,
            freeDeliveryAbove: 750,
            minimumOrder: 250,
            estimatedDeliveryTime: '20-30 mins',
            deliveryRoute: 'Juhu Scheme Expressway',
            status: 'Active' as const
          },
          {
            areaName: 'Andheri West Commercial Hub',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pincodes: ['400053', '400058'],
            deliveryCharge: 45,
            freeDeliveryAbove: 500,
            minimumOrder: 150,
            estimatedDeliveryTime: '30-40 mins',
            deliveryRoute: 'Andheri Hub Route',
            status: 'Inactive' as const
          }
        ];

        const batch = writeBatch(db);
        for (const area of initialAreas) {
          const docRef = doc(collection(db, path));
          batch.set(docRef, {
            areaId: docRef.id,
            ...area,
            createdAt: now,
            updatedAt: now
          });
        }
        await batch.commit();
        console.log('Seeded initial Service Areas successfully.');
      }
    } catch (error) {
      console.error('Error seeding initial service areas:', error);
    }
  }
};
