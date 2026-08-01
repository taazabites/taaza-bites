
import { collection, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface DashboardMetrics {
  todaysOrders: number;
  todaysRevenue: number;
  activeSubscribers: number;
  pendingOrders: number;
  kitchenQueue: number;
  liveDeliveries: number;
  newCustomers: number;
  lowStockAlerts: number;
  monthlyRevenue: number;
  totalCustomers: number;
  supportTickets: number;
  planDistribution: { name: string; value: number; color: string }[];
  recentActivity: any[];
  revenueData: { name: string; total: number; subs: number }[];
  ordersData: { name: string; orders: number }[];
  customerGrowth: { name: string; total: number }[];
  orderStatusDistribution: { name: string; value: number; color: string }[];
}

export const dashboardService = {
  subscribeToMetrics(callback: (metrics: DashboardMetrics) => void, onError?: (error: Error) => void) {
    let currentMetrics: DashboardMetrics = {
      todaysOrders: 0,
      todaysRevenue: 0,
      activeSubscribers: 0,
      pendingOrders: 0,
      kitchenQueue: 0,
      liveDeliveries: 0,
      newCustomers: 0,
      lowStockAlerts: 0,
      monthlyRevenue: 0,
      totalCustomers: 0,
      supportTickets: 0,
      planDistribution: [],
      recentActivity: [],
      revenueData: [
        { name: 'Mon', total: 0, subs: 0 },
        { name: 'Tue', total: 0, subs: 0 },
        { name: 'Wed', total: 0, subs: 0 },
        { name: 'Thu', total: 0, subs: 0 },
        { name: 'Fri', total: 0, subs: 0 },
        { name: 'Sat', total: 0, subs: 0 },
        { name: 'Sun', total: 0, subs: 0 }
      ],
      ordersData: [
        { name: 'Mon', orders: 0 },
        { name: 'Tue', orders: 0 },
        { name: 'Wed', orders: 0 },
        { name: 'Thu', orders: 0 },
        { name: 'Fri', orders: 0 },
        { name: 'Sat', orders: 0 },
        { name: 'Sun', orders: 0 }
      ],
      customerGrowth: [],
      orderStatusDistribution: [
        { name: 'Pending', value: 0, color: '#f59e0b' },
        { name: 'Preparing', value: 0, color: '#3b82f6' },
        { name: 'Packed', value: 0, color: '#8b5cf6' },
        { name: 'Delivered', value: 0, color: '#10b981' }
      ]
    };

    let unsubOrders = () => {};
    let unsubSubs = () => {};
    let unsubCust = () => {};
    
    const fireCallback = () => {
      callback({ ...currentMetrics });
    };

    // Emit initial cached/default state immediately so subscriber never waits
    fireCallback();

    try {
      // 1. Orders listener
      const qOrders = query(collection(db, 'orders'));
      unsubOrders = onSnapshot(qOrders, (snapshot) => {
        let todaysOrders = 0;
        let todaysRevenue = 0;
        let pendingOrders = 0;
        let kitchenQueue = 0;
        let liveDeliveries = 0;
        
        let statusCounts = { Pending: 0, Preparing: 0, Packed: 0, Delivered: 0 };
        
        const todayStr = new Date().toISOString().split('T')[0];

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.status === 'Pending') pendingOrders++;
          if (data.status === 'Preparing') kitchenQueue++;
          if (data.status === 'Packed' || data.status === 'Out for Delivery') liveDeliveries++;
          
          if (statusCounts[data.status] !== undefined) {
             statusCounts[data.status]++;
          } else if (data.status === 'Out for Delivery') {
             statusCounts['Packed']++;
          }
          
          if (data.createdAt && typeof data.createdAt === 'string' && data.createdAt.startsWith(todayStr)) {
            todaysOrders++;
            todaysRevenue += (data.total || 0);
          }
        });
        
        currentMetrics.todaysOrders = todaysOrders;
        currentMetrics.todaysRevenue = todaysRevenue;
        currentMetrics.pendingOrders = pendingOrders;
        currentMetrics.kitchenQueue = kitchenQueue;
        currentMetrics.liveDeliveries = liveDeliveries;
        currentMetrics.orderStatusDistribution = [
          { name: 'Pending', value: statusCounts.Pending, color: '#f59e0b' },
          { name: 'Preparing', value: statusCounts.Preparing, color: '#3b82f6' },
          { name: 'Packed/Out', value: statusCounts.Packed, color: '#8b5cf6' },
          { name: 'Delivered', value: statusCounts.Delivered, color: '#10b981' }
        ];

        fireCallback();
      }, onError);

      // 2. Subscriptions listener
      const qSubs = query(collection(db, 'subscriptions'));
      unsubSubs = onSnapshot(qSubs, async (snapshot) => {
        let activeSubscribers = 0;
        let planCount: Record<string, number> = {};
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.status === 'Active') {
             activeSubscribers++;
             if (data.planId) {
                planCount[data.planId] = (planCount[data.planId] || 0) + 1;
             }
          }
        });
        
        currentMetrics.activeSubscribers = activeSubscribers;
        
        // Try to map plan IDs to names
        try {
           const plansSnap = await getDocs(collection(db, 'subscriptionPlans'));
           const planNames: Record<string, string> = {};
           plansSnap.forEach(p => planNames[p.id] = p.data().name || p.id);
           
           const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
           currentMetrics.planDistribution = Object.keys(planCount).map((pid, idx) => ({
             name: planNames[pid] || pid,
             value: planCount[pid],
             color: colors[idx % colors.length]
           }));
        } catch(e) {}

        fireCallback();
      }, onError);

      // 3. Customers listener
      const qCust = query(collection(db, 'customers'));
      unsubCust = onSnapshot(qCust, (snapshot) => {
        currentMetrics.totalCustomers = snapshot.size;
        
        let newCustomers = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.createdAt && typeof data.createdAt === 'string' && data.createdAt.startsWith(todayStr)) {
            newCustomers++;
          }
        });
        currentMetrics.newCustomers = newCustomers;

        fireCallback();
      }, onError);

      return () => {
        unsubOrders();
        unsubSubs();
        unsubCust();
      };
    } catch (err) {
      if (onError && err instanceof Error) onError(err);
      return () => {};
    }
  }
};
