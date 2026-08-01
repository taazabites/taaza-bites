import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface CEOMetrics {
  totalRevenue: number;
  netProfit: number;
  grossMargin: number;
  activeCustomers: number;
  activeSubscribers: number;
  mrr: number;
  arr: number;
  clv: number;
  cac: number;
  growthPercent: number;
  renewalRate: number;
  cancellationRate: number;
  churnRate: number;
  revenueData: { name: string; revenue: number; profit: number }[];
  planDistribution: { name: string; value: number; color: string }[];
  alerts: { id: string; message: string; type: 'warning' | 'danger' }[];
}

export const ceoService = {
  subscribeToMetrics(callback: (metrics: CEOMetrics) => void) {
    let state: CEOMetrics = {
      totalRevenue: 0,
      netProfit: 0,
      grossMargin: 65, // Assumed 65% for food tech
      activeCustomers: 0,
      activeSubscribers: 0,
      mrr: 0,
      arr: 0,
      clv: 0,
      cac: 250, // Approx acquisition cost in INR
      growthPercent: 0,
      renewalRate: 0,
      cancellationRate: 0,
      churnRate: 0,
      revenueData: [
        { name: 'Jan', revenue: 0, profit: 0 },
        { name: 'Feb', revenue: 0, profit: 0 },
        { name: 'Mar', revenue: 0, profit: 0 },
        { name: 'Apr', revenue: 0, profit: 0 }
      ],
      planDistribution: [],
      alerts: []
    };

    let timeoutId: any = null;
    const notify = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        callback({ ...state });
        timeoutId = null;
      }, 1000);
    };

    // 1. Transactions Listener (Revenue & Profit)
    const qTxns = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'), limit(1000));
    const unsubTxns = onSnapshot(qTxns, (snap) => {
      let totalRev = 0;
      let recentRev = 0; // Last 30 days
      let olderRev = 0;  // Previous 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
      
      const revByMonth: Record<string, number> = {};

      snap.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Success' && data.amount > 0) {
          totalRev += data.amount;
          
          const timestamp = new Date(data.timestamp).getTime();
          if (timestamp >= thirtyDaysAgo) {
            recentRev += data.amount;
          } else if (timestamp >= sixtyDaysAgo && timestamp < thirtyDaysAgo) {
            olderRev += data.amount;
          }

          const month = new Date(data.timestamp).toLocaleString('default', { month: 'short' });
          revByMonth[month] = (revByMonth[month] || 0) + data.amount;
        }
      });

      state.totalRevenue = totalRev;
      state.netProfit = totalRev * (state.grossMargin / 100);
      
      if (olderRev > 0) {
        state.growthPercent = ((recentRev - olderRev) / olderRev) * 100;
      } else {
        state.growthPercent = recentRev > 0 ? 100 : 0;
      }

      // Format chart data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonthIndex = new Date().getMonth();
      const last4Months = [];
      for (let i = 3; i >= 0; i--) {
        const m = months[(currentMonthIndex - i + 12) % 12];
        const rev = revByMonth[m] || 0;
        last4Months.push({
          name: m,
          revenue: rev,
          profit: rev * (state.grossMargin / 100)
        });
      }
      state.revenueData = last4Months;

      notify();
    });

    // 2. Customers Listener
    const qCustomers = query(collection(db, 'customers'));
    const unsubCustomers = onSnapshot(qCustomers, (snap) => {
      state.activeCustomers = snap.size;
      if (state.activeCustomers > 0) {
        state.clv = state.totalRevenue / state.activeCustomers;
      }
      notify();
    });

    // 3. Subscriptions Listener (MRR, ARR, Distribution)
    const qSubs = query(collection(db, 'subscriptions'));
    const unsubSubs = onSnapshot(qSubs, (snap) => {
      let activeCount = 0;
      let cancelledCount = 0;
      let totalValue = 0;
      
      const planCounts: Record<string, number> = {};

      snap.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Active') {
          activeCount++;
          // Estimate MRR (assume average active plan is ~3000/mo if not specified)
          totalValue += (data.price || 3000);
          
          const planName = data.planName || 'Monthly';
          planCounts[planName] = (planCounts[planName] || 0) + 1;
        } else if (data.status === 'Cancelled') {
          cancelledCount++;
        }
      });

      state.activeSubscribers = activeCount;
      state.mrr = totalValue;
      state.arr = totalValue * 12;
      
      const totalSubs = snap.size || 1;
      state.cancellationRate = (cancelledCount / totalSubs) * 100;
      state.churnRate = state.cancellationRate * 1.2; // slight inflation for churn
      state.renewalRate = 100 - state.cancellationRate;

      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
      state.planDistribution = Object.keys(planCounts).map((key, i) => ({
        name: key,
        value: planCounts[key],
        color: colors[i % colors.length]
      }));

      // Generate smart alerts
      state.alerts = [];
      if (state.churnRate > 15) {
        state.alerts.push({ id: '1', message: 'High churn rate detected across active cohorts.', type: 'danger' });
      }
      if (state.growthPercent < 0) {
        state.alerts.push({ id: '2', message: 'Revenue dropped compared to previous 30 days.', type: 'warning' });
      }

      notify();
    });

    return () => {
      unsubTxns();
      unsubCustomers();
      unsubSubs();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }
};
