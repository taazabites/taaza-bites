import { 
  collection, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  where, 
  onSnapshot, 
  addDoc, 
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { auditService } from './audit';
import { canTransitionOrder, orderTransitionError, normalizeOrderStatus } from '../lib/order-status';

// Toggle for UI Stabilization phase

// Local state for mock data

// Custom error handling helper for Firestore operations
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const orderService = {
  /**
   * Fetch today's/active orders for backwards compatibility in kitchen/delivery views
   */
  async getTodayOrders(): Promise<Order[]> {
    
    try {
      const q = query(
        collection(db, 'orders'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          driverId: data.assignedDriverId || data.driverId,
          driverName: data.assignedDriverName || data.driverName,
          status: data.orderStatus || data.status || 'Pending'
        } as Order;
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  /**
   * Subscribe to orders collection in real-time
   */
  subscribeToOrders(callback: (orders: Order[]) => void, onError: (err: any) => void): () => void {
    
    const path = 'orders';
    try {
      const q = query(
        collection(db, path),
        orderBy('createdAt', 'desc'),
        limit(200)
      );
      
      return onSnapshot(q, (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          orders.push({
            id: doc.id,
            ...data,
            // Ensure status maps correctly for legacy UI components if they rely on 'status' field
            driverId: data.assignedDriverId || data.driverId,
            driverName: data.assignedDriverName || data.driverName,
            status: data.orderStatus || data.status || 'Pending',
          } as Order);
        });
        callback(orders);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        onError(error);
      });
    } catch (error) {
      onError(error);
      return () => {};
    }
  },

  /**
   * Subscribe to delivery partners collection
   */
  subscribeToDeliveryPartners(callback: (partners: any[]) => void): () => void {
    const path = 'deliveryPartners';
    try {
      const q = query(collection(db, path), orderBy('name', 'asc'));
      return onSnapshot(q, (snapshot) => {
        const partners: any[] = [];
        snapshot.forEach((doc) => {
          partners.push({ id: doc.id, ...doc.data() });
        });
        callback(partners);
      }, (error) => {
        console.error("Error subscribing to delivery partners:", error);
      });
    } catch (error) {
      console.error(error);
      return () => {};
    }
  },

  async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    
    try {
      const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      throw error;
    }
  },
  /**
   * Update individual order status and trigger notifications
   */
  async updateOrderStatus(
    orderId: string, 
    status: 'Pending' | 'Confirmed' | 'Preparing' | 'Packed' | 'Out For Delivery' | 'Delivered' | 'Cancelled' | string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    
    const path = `orders/${orderId}`;
    try {
      const orderRef = doc(db, 'orders', orderId);
      const nowString = new Date().toISOString();
      const existing = await getDoc(orderRef);
      const current = existing.data()?.orderStatus || existing.data()?.status;
      const next = normalizeOrderStatus(status);
      if (!canTransitionOrder(current, next)) {
        throw new Error(orderTransitionError(current, next) || 'Invalid status transition');
      }

      const updateData = {
        orderStatus: next,
        status: next,
        updatedAt: nowString
      };

      await updateDoc(orderRef, updateData);
      
      await auditService.logAction(
        adminId, 
        adminEmail, 
        'UPDATE', 
        `Order ${orderId}`, 
        `Changed status to ${status}`
      );

      // Trigger notifications architecture
      try {
        const snapshot = await getDocs(query(collection(db, 'orders'), where('orderId', '==', orderId)));
        if (!snapshot.empty) {
          const orderDoc = snapshot.docs[0];
          const order = { id: orderDoc.id, ...orderDoc.data() } as Order;
          await this.triggerNotifications(order, status);
        }
      } catch (notifErr) {
        console.error("Notification trigger failed:", notifErr);
      }

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Update order details
   */
  async updateOrder(orderId: string, updates: Partial<Order>, adminId: string, adminEmail: string): Promise<void> {
    
    const path = `orders/${orderId}`;
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, updates);
      await auditService.logAction(adminId, adminEmail, 'UPDATE', `Order ${orderId}`, `Updated fields: ${Object.keys(updates).join(', ')}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Assign driver to an order
   */
  async assignDriver(
    orderId: string,
    driverId: string,
    driverName: string,
    routeId: string,
    routeName: string,
    estimatedTime: string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const path = `orders/${orderId}`;
    try {
      const orderRef = doc(db, 'orders', orderId);
      const nowString = new Date().toISOString();
      
      await updateDoc(orderRef, {
        driverId,
        driverName,
        deliveryArea: routeName, // Use route as deliveryArea
        updatedAt: nowString
      });

      await auditService.logAction(
        adminId,
        adminEmail,
        'UPDATE',
        `Order ${orderId}`,
        `Assigned driver ${driverName} with route ${routeName} (Est. Time: ${estimatedTime})`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Bulk change order status
   */
  async bulkUpdateStatus(
    orderIds: string[],
    status: string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      const nowString = new Date().toISOString();

      for (const orderId of orderIds) {
        const orderRef = doc(db, 'orders', orderId);
        batch.update(orderRef, {
          orderStatus: status,
          status: status, // Legacy compatibility
          updatedAt: nowString
        });
      }

      await batch.commit();

      await auditService.logAction(
        adminId,
        adminEmail,
        'UPDATE',
        `Bulk Orders Status`,
        `Updated ${orderIds.length} orders to status: ${status}`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders/bulk-update-status');
    }
  },

  /**
   * Bulk assign driver
   */
  async bulkAssignDriver(
    orderIds: string[],
    driverId: string,
    driverName: string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      const nowString = new Date().toISOString();

      for (const orderId of orderIds) {
        const orderRef = doc(db, 'orders', orderId);
        batch.update(orderRef, {
          driverId,
          driverName,
          updatedAt: nowString
        });
      }

      await batch.commit();

      await auditService.logAction(
        adminId,
        adminEmail,
        'UPDATE',
        `Bulk Orders Driver`,
        `Assigned driver ${driverName} to ${orderIds.length} orders`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders/bulk-assign-driver');
    }
  },

  /**
   * Subscribe to notifications for a specific order
   */
  subscribeNotifications(orderId: string, callback: (notifications: any[]) => void): () => void {
    
    const q = query(
      collection(db, "notifications"), 
      where("orderId", "==", orderId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => doc.data());
      callback(logs);
    }, (error) => {
      console.error("Error subscribing to notification logs:", error);
    });
  },

  /**
   * Prepares and logs notifications for WhatsApp, Push, and Email
   */
  async triggerNotifications(order: Order, status: string): Promise<void> {
    const validTriggers = ['Confirmed', 'Preparing', 'Out For Delivery', 'Delivered', 'Cancelled'];
    if (!validTriggers.includes(status)) return;

    const customerName = order.customerName || 'Customer';
    const mealName = order.mealName || 'Healthy Meal';
    const orderId = order.orderId || order.id.substring(0, 8);
    const driverName = order.driverName || 'Delivery Executive';

    const templates = {
      Confirmed: {
        whatsapp: `Dear ${customerName}, your Taaza Bites order of ${mealName} has been confirmed! We are getting it ready. ID: ${orderId}`,
        push: `Order Confirmed: We're on it! Fresh ingredients are being prepped.`,
        email: `Subject: Your Taaza Bites Order #${orderId} is Confirmed!\n\nHi ${customerName},\n\nWe have confirmed your healthy meal: ${mealName}.\n\nIt will be prepared and delivered shortly.`
      },
      Preparing: {
        whatsapp: `Hey ${customerName}, our chefs are preparing your fresh ${mealName} meal right now! It's smelling amazing!`,
        push: `Chef is cooking: Your ${mealName} is being freshly prepared right now!`,
        email: `Subject: Fresh Prep Started for Order #${orderId}\n\nHi ${customerName},\n\nOur kitchen experts have started preparing your meal: ${mealName}.\n\nWe cook all meals fresh right before dispatch.`
      },
      'Out For Delivery': {
        whatsapp: `Hey ${customerName}, your ${mealName} is out for delivery with our delivery partner ${driverName}. Get ready for some fresh goodness!`,
        push: `On the way: Your Taaza Bites meal is out for delivery with ${driverName}!`,
        email: `Subject: Your Meal is Out for Delivery! ðŸšš\n\nHi ${customerName},\n\nYour fresh meal: ${mealName} is out for delivery with partner ${driverName}.\n\nEnjoy your meal!`
      },
      Delivered: {
        whatsapp: `Hey ${customerName}, your fresh ${mealName} has been delivered. Enjoy your healthy meal! Don't forget to rate your experience.`,
        push: `Delivered: Bon appÃ©tit! Your fresh meal has arrived.`,
        email: `Subject: Delivered: Enjoy your fresh Taaza Bites meal!\n\nHi ${customerName},\n\nYour meal: ${mealName} has been successfully delivered.\n\nThank you for choosing Taaza Bites!`
      },
      Cancelled: {
        whatsapp: `Dear ${customerName}, we regret to inform you that your order ${orderId} has been cancelled. If this is unexpected, please reach out to customer support.`,
        push: `Order Cancelled: Order #${orderId} has been cancelled.`,
        email: `Subject: Order Cancellation Notice - #${orderId}\n\nHi ${customerName},\n\nWe have cancelled your order for ${mealName} as requested or due to delivery issues.\n\nAny refund due will be credited to your wallet shortly.`
      }
    };

    const t = templates[status as keyof typeof templates];
    if (!t) return;

    const channels: ('Push' | 'WhatsApp' | 'Email')[] = ['Push', 'WhatsApp', 'Email'];
    const nowString = new Date().toISOString();

    for (const channel of channels) {
      let body = '';
      if (channel === 'Push') body = t.push;
      else if (channel === 'WhatsApp') body = t.whatsapp;
      else if (channel === 'Email') body = t.email;

      await addDoc(collection(db, 'notifications'), {
        title: `Order Status: ${status}`,
        body: body,
        channel: channel,
        target: 'Selected',
        timestamp: nowString,
        orderId: order.id,
        customerId: order.customerId
      });
    }
  },

  /**
   * Seeds delivery partners if empty
   */
  async seedDeliveryPartners(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, 'deliveryPartners'));
      if (!snap.empty) return; // Already seeded

      const partners = [
        { name: 'Suresh Kumar', phone: '+91 91234 56789', status: 'Available', vehicle: 'Electric Scooter (MH02-1234)', routeId: 'route-powai' },
        { name: 'Ramesh Singh', phone: '+91 92345 67890', status: 'Available', vehicle: 'Motorcycle (MH02-5678)', routeId: 'route-andheri' },
        { name: 'Amit Patel', phone: '+91 93456 78901', status: 'Busy', vehicle: 'Electric Bicycle (MH02-9999)', routeId: 'route-bandra' },
        { name: 'Karan Malhotra', phone: '+91 94567 89012', status: 'Available', vehicle: 'Electric Scooter (MH02-8888)', routeId: 'route-juhu' }
      ];

      const batch = writeBatch(db);
      for (const partner of partners) {
        const docRef = doc(collection(db, 'deliveryPartners'));
        batch.set(docRef, partner);
      }
      await batch.commit();
      console.log("Successfully seeded delivery partners.");
    } catch (err) {
      console.error("Seeding delivery partners failed: ", err);
    }
  },

  /**
   * Seeds realistic sample orders into Firestore
   */
  async seedSampleOrders(): Promise<void> {
    throw new Error("Sample/mock order seeding is disabled. Use live subscription orders.");
  },

  async generateDailyOrders(userId: string): Promise<{created: number}> {
    if (import.meta.env.VITE_USE_LOCAL_DATA === 'true') {
      return { created: 15 };
    }
    
    // In production, this would be an HTTPS Callable Function.
    // For now, we simulate it by adding a few pending orders to Firestore.
    try {
      const batch = writeBatch(db);
      for (let i = 0; i < 5; i++) {
        const docRef = doc(collection(db, 'orders'));
        const newOrder: any = {
          id: docRef.id,
          orderId: `ORD-GEN-${Math.floor(Math.random() * 10000)}`,
          customerName: "Generated User",
          customerPhone: "+91 9999999999",
          customerAddress: "Auto Gen Address",
          subscriptionId: "SUB-123",
          subscriptionPlan: "Keto Plan",
          meal: "Generated Keto Bowl",
          dietType: "Keto",
          status: "Pending",
          paymentStatus: "Paid",
          deliveryDate: new Date(Date.now() + 86400000).toISOString(),
          deliverySlot: "Lunch",
          kitchenId: "K-1",
          driverId: null,
          createdAt: new Date().toISOString()
        };
        batch.set(docRef, newOrder);
      }
      await batch.commit();
      
      await auditService.logAction(
        userId,
        'system@taazabites.com',
        'CREATE',
        'orders',
        `Generated 5 daily orders manually.`
      );
      
      return { created: 5 };
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'orders');
      throw e;
    }
  }
};
