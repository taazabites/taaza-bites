import { collection, query, where, onSnapshot, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { systemMonitoringService } from './system-monitoring';

export interface OperationsMetrics {
  liveOrders: number;
  kitchenQueue: number;
  deliveryTracking: number;
  registrationsToday: number;
  activeSubscriptions: number;
  liveRevenue: number;
  alerts: any[];
  recentActivity: any[];
}

export const operationsService = {
  subscribeToLiveMetrics(callback: (metrics: OperationsMetrics) => void) {
    const today = new Date().toISOString().split('T')[0];
    
    let state: OperationsMetrics = {
      liveOrders: 0,
      kitchenQueue: 0,
      deliveryTracking: 0,
      registrationsToday: 0,
      activeSubscriptions: 0,
      liveRevenue: 0,
      alerts: [],
      recentActivity: []
    };
    
    // Throttle notifications slightly to avoid excessive re-renders
    let timeoutId: any = null;
    const notify = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        callback({ ...state });
        timeoutId = null;
      }, 500);
    };

    // Orders Listener
    const qOrders = query(collection(db, 'orders'), where('date', '==', today));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      state.liveOrders = snap.size;
      state.kitchenQueue = snap.docs.filter(d => ['Pending', 'Preparing'].includes(d.data().orderStatus)).length;
      state.deliveryTracking = snap.docs.filter(d => ['Packed', 'Out for Delivery'].includes(d.data().orderStatus)).length;
      notify();
    }, (error) => console.error("Orders listener error:", error));

    // Subscriptions Listener
    const qSubs = query(collection(db, 'subscriptions'), where('status', '==', 'Active'));
    const unsubSubs = onSnapshot(qSubs, (snap) => {
      state.activeSubscriptions = snap.size;
      notify();
    }, (error) => console.error("Subs listener error:", error));

    // Customers Listener (Approximate for today using a limited query of recent)
    const qCustomers = query(collection(db, 'customers'), orderBy('createdAt', 'desc'), limit(100));
    const unsubCustomers = onSnapshot(qCustomers, (snap) => {
      const todayStr = new Date().toDateString();
      state.registrationsToday = snap.docs.filter(d => {
        const data = d.data();
        if (data.createdAt?.toDate) {
            return data.createdAt.toDate().toDateString() === todayStr;
        }
        return false;
      }).length;
      notify();
    }, (error) => console.error("Customers listener error:", error));

    // Transactions Listener
    const qTrans = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'), limit(500));
    const unsubTrans = onSnapshot(qTrans, (snap) => {
       const todayStr = new Date().toDateString();
       let rev = 0;
       snap.docs.forEach(d => {
         const data = d.data();
         const date = data.timestamp ? new Date(data.timestamp).toDateString() : '';
         if (date === todayStr && data.status === 'Success' && data.amount > 0) {
            rev += data.amount || 0;
         }
       });
       state.liveRevenue = rev;
       notify();
    }, (error) => console.error("Transactions listener error:", error));

    // Audit Logs Listener (Activity Feed & Alerts)
    const qLogs = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(30));
    const unsubLogs = onSnapshot(qLogs, (snap) => {
       const logs = snap.docs.map(d => ({id: d.id, ...(d.data() as any)}));
       state.recentActivity = logs.slice(0, 15);
       state.alerts = logs.filter(d => d.status === 'Failed' || d.status === 'Error' || d.action?.includes('Failed') || d.action?.includes('Error'));
       notify();
    }, (error) => console.error("Logs listener error:", error));

    return () => {
      unsubOrders();
      unsubSubs();
      unsubCustomers();
      unsubTrans();
      unsubLogs();
      if (timeoutId) clearTimeout(timeoutId);
    };
  },
  
  async executeQuickAction(actionType: string, status: string, adminId: string, adminName: string) {
     const ref = doc(db, 'systemSettings', 'global');
     await setDoc(ref, { 
       [actionType]: status, 
       updatedAt: new Date().toISOString() 
     }, { merge: true });

     await systemMonitoringService.logAction({
        adminId,
        adminName,
        role: 'Admin',
        module: 'Operations Control Center',
        action: `Quick Action Triggered: ${actionType} -> ${status}`,
        recordId: 'GLOBAL_SETTINGS',
        status: 'Success'
     });
  }
};
