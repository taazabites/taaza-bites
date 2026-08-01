import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

import { 
  Customer, 
  Subscription, 
  Order, 
  Payment, 
  MenuItem, 
  DeliveryPartner, 
  Delivery, 
  Coupon,
  KitchenProductionItem,
  Ingredient,
  StockMovement
} from '../types';


export const reportService = {
  subscribeCustomers(callback: (data: Customer[]) => void): () => void {
    return onSnapshot(collection(db, "customers"), (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Customer[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "customers");
    });
  },

  subscribeSubscriptions(callback: (data: Subscription[]) => void): () => void {
    return onSnapshot(collection(db, "subscriptions"), (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subscription[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "subscriptions");
    });
  },

  subscribeOrders(callback: (data: Order[]) => void): () => void {
    return onSnapshot(collection(db, "orders"), (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "orders");
    });
  },

  subscribePayments(callback: (data: Payment[]) => void): () => void {
    return onSnapshot(collection(db, "payments"), (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "payments");
    });
  },

  subscribeMenuItems(callback: (data: MenuItem[]) => void): () => void {
    return onSnapshot(collection(db, "menuItems"), (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, mealName: doc.data().mealName || doc.data().name, ...doc.data() })) as MenuItem[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "menuItems");
    });
  },

  subscribeDeliveryPartners(callback: (data: DeliveryPartner[]) => void): () => void {
    return onSnapshot(collection(db, "deliveryPartners"), (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DeliveryPartner[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "deliveryPartners");
    });
  },

  subscribeDeliveries(callback: (data: Delivery[]) => void): () => void {
    return onSnapshot(collection(db, "deliveries"), (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Delivery[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "deliveries");
    });
  },

  subscribeCoupons(callback: (data: Coupon[]) => void): () => void {
    return onSnapshot(collection(db, "coupons"), (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Coupon[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "coupons");
    });
  },

  subscribeKitchenItems(callback: (data: KitchenProductionItem[]) => void): () => void {
    return onSnapshot(collection(db, "kitchenProduction"), (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as KitchenProductionItem[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "kitchenProduction");
    });
  },

  subscribeIngredients(callback: (data: Ingredient[]) => void): () => void {
    return onSnapshot(collection(db, "ingredients"), (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ingredient[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "ingredients");
    });
  },

  subscribeStockMovements(callback: (data: StockMovement[]) => void): () => void {
    return onSnapshot(collection(db, "stockMovements"), (snap) => {
      callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StockMovement[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "stockMovements");
    });
  }
};
