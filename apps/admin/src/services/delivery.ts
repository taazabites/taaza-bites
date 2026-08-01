import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  doc, 
  addDoc,
  setDoc,
  updateDoc, 
  deleteDoc,
  where, 
  onSnapshot, 
  writeBatch,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { DeliveryPartner, DeliveryRoute, Delivery } from '../types';
import { auditService } from './audit';

export const deliveryService = {
  /**
   * Subscribe to delivery partners collection in real-time
   */
  subscribeToPartners(callback: (partners: DeliveryPartner[]) => void): () => void {
    const q = query(collection(db, 'deliveryPartners'), orderBy('fullName', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const partners: DeliveryPartner[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        partners.push({
          id: doc.id,
          partnerId: data.partnerId || doc.id,
          fullName: data.fullName || data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          profilePhoto: data.profilePhoto || '',
          vehicleType: data.vehicleType || data.vehicle || '',
          vehicleNumber: data.vehicleNumber || '',
          licenseNumber: data.licenseNumber || '',
          aadhaarNumber: data.aadhaarNumber || '',
          joiningDate: data.joiningDate || '',
          emergencyContact: data.emergencyContact || '',
          status: data.status || 'Active',
          availability: data.availability || 'Available',
          rating: data.rating ?? 4.5,
          completedDeliveries: data.completedDeliveries ?? 0,
          assignedOrders: data.assignedOrders ?? 0,
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        } as DeliveryPartner);
      });
      callback(partners);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'deliveryPartners');
    });
  },

  /**
   * Subscribe to delivery routes collection in real-time
   */
  subscribeToRoutes(callback: (routes: DeliveryRoute[]) => void): () => void {
    const q = query(collection(db, 'deliveryRoutes'), orderBy('routeName', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const routes: DeliveryRoute[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        routes.push({
          id: doc.id,
          routeId: data.routeId || doc.id,
          routeName: data.routeName || '',
          area: data.area || '',
          pincode: data.pincode || '',
          driverId: data.driverId || '',
          driverName: data.driverName || '',
          estimatedTime: data.estimatedTime || '30 mins',
          maximumOrders: data.maximumOrders ?? 20,
          status: data.status || 'Active',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        } as DeliveryRoute);
      });
      callback(routes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'deliveryRoutes');
    });
  },

  /**
   * Subscribe to active/today's deliveries collection in real-time
   */
  subscribeToDeliveries(callback: (deliveries: Delivery[]) => void): () => void {
    const q = query(collection(db, 'deliveries'), orderBy('createdAt', 'desc'), limit(150));
    return onSnapshot(q, (snapshot) => {
      const deliveries: Delivery[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        deliveries.push({
          id: doc.id,
          deliveryId: data.deliveryId || doc.id,
          orderId: data.orderId || '',
          customerId: data.customerId || '',
          customerName: data.customerName || '',
          customerPhone: data.customerPhone || '',
          deliveryAddress: data.deliveryAddress || '',
          deliveryArea: data.deliveryArea || '',
          deliverySlot: data.deliverySlot || '',
          driverId: data.driverId || '',
          driverName: data.driverName || '',
          status: data.status || 'Pending',
          estimatedArrival: data.estimatedArrival || '',
          proofImage: data.proofImage || '',
          notes: data.notes || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        } as Delivery);
      });
      callback(deliveries);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'deliveries');
    });
  },

  /**
   * Add a new delivery partner
   */
  async addPartner(
    partner: Omit<DeliveryPartner, 'id' | 'completedDeliveries' | 'assignedOrders' | 'rating' | 'createdAt' | 'updatedAt'>,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const now = new Date().toISOString();
    const partnerCollection = collection(db, 'deliveryPartners');
    const docRef = doc(partnerCollection);
    
    const newPartner = {
      partnerId: docRef.id,
      ...partner,
      name: partner.fullName, // for backward compatibility with orders.ts
      completedDeliveries: 0,
      assignedOrders: 0,
      rating: 5.0,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, newPartner);
    await auditService.logAction(
      adminId,
      adminEmail,
      'CREATE',
      `Delivery Partner ${newPartner.fullName}`,
      `Added new delivery partner ${newPartner.fullName} with phone ${newPartner.phone}`
    );
  },

  /**
   * Update delivery partner
   */
  async updatePartner(
    id: string,
    partner: Partial<DeliveryPartner>,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const now = new Date().toISOString();
    const docRef = doc(db, 'deliveryPartners', id);
    
    const updateData: any = {
      ...partner,
      updatedAt: now
    };
    if (partner.fullName) {
      updateData.name = partner.fullName; // backward compatibility
    }

    await updateDoc(docRef, updateData);
    await auditService.logAction(
      adminId,
      adminEmail,
      'UPDATE',
      `Delivery Partner ${id}`,
      `Updated partner details for ${partner.fullName || id}`
    );
  },

  /**
   * Add a new delivery route
   */
  async addRoute(
    route: Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'>,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const now = new Date().toISOString();
    const routeCollection = collection(db, 'deliveryRoutes');
    const docRef = doc(routeCollection);

    const newRoute = {
      routeId: docRef.id,
      ...route,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, newRoute);
    await auditService.logAction(
      adminId,
      adminEmail,
      'CREATE',
      `Delivery Route ${newRoute.routeName}`,
      `Created delivery route ${newRoute.routeName} serving area ${newRoute.area}`
    );
  },

  /**
   * Update delivery route
   */
  async updateRoute(
    id: string,
    route: Partial<DeliveryRoute>,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const now = new Date().toISOString();
    const docRef = doc(db, 'deliveryRoutes', id);

    await updateDoc(docRef, {
      ...route,
      updatedAt: now
    });

    await auditService.logAction(
      adminId,
      adminEmail,
      'UPDATE',
      `Delivery Route ${id}`,
      `Updated route details for ${route.routeName || id}`
    );
  },

  /**
   * Delete a delivery route
   */
  async deleteRoute(id: string, adminId: string, adminEmail: string): Promise<void> {
    const docRef = doc(db, 'deliveryRoutes', id);
    await deleteDoc(docRef);
    await auditService.logAction(
      adminId,
      adminEmail,
      'DELETE',
      `Delivery Route ${id}`,
      `Deleted delivery route ${id}`
    );
  },

  /**
   * Create or update delivery record for an order
   */
  async upsertDeliveryForOrder(
    deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const now = new Date().toISOString();
    
    const deliveriesColl = collection(db, 'deliveries');
    // Check if delivery already exists for this orderId
    const q = query(deliveriesColl, where('orderId', '==', deliveryData.orderId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Update existing
      const existingDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'deliveries', existingDoc.id), {
        ...deliveryData,
        updatedAt: now
      });
    } else {
      // Create new
      const docRef = doc(deliveriesColl);
      await setDoc(docRef, {
        deliveryId: docRef.id,
        ...deliveryData,
        createdAt: now,
        updatedAt: now
      });
    }
  },

  /**
   * Assign delivery partner and route to a set of orders
   */
  async assignDriverToOrders(
    orderIds: string[],
    driverId: string,
    driverName: string,
    routeId: string,
    routeName: string,
    estimatedTime: string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const batch = writeBatch(db);
    
    // Update delivery records
    for (const orderId of orderIds) {
      const q = query(collection(db, 'deliveries'), where('orderId', '==', orderId));
      const snapshot = await getDocs(q);
      
      let deliveryDocRef;
      if (!snapshot.empty) {
        deliveryDocRef = snapshot.docs[0].ref;
      } else {
        deliveryDocRef = doc(collection(db, 'deliveries'));
      }
      
      batch.set(deliveryDocRef, {
        orderId,
        driverId,
        driverName,
        status: 'Assigned',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    
    await batch.commit();
  },

  /**
   * Update individual delivery status
   */
  async updateDeliveryStatus(
    deliveryId: string,
    status: Delivery['status'],
    notes?: string,
    proofImage?: string,
    adminId?: string,
    adminEmail?: string
  ): Promise<void> {
    const now = new Date().toISOString();

    await updateDoc(doc(db, 'deliveries', deliveryId), {
      status,
      notes: notes,
      proofImage: proofImage,
      updatedAt: now
    });
  }
};
