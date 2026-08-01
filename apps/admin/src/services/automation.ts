import { collection, getDocs, doc, setDoc, query, where, updateDoc, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { systemMonitoringService } from './system-monitoring';

export const systemAutomationService = {
  /**
   * Run the daily CRON job equivalent (simulated from Admin dashboard)
   * This ties the core workflow together:
   * Customers (Active Subscriptions) -> Orders -> Kitchen -> Inventory
   */
  async runDailyBatchOperations(adminId: string, adminName: string) {
    console.log("Starting Daily Batch Automation...");
    const batch = writeBatch(db);
    let ordersCreated = 0;
    let inventoryDeducted = 0;
    let lowStockAlerts = 0;

    try {
      // 1. Fetch all Active Subscriptions
      const subsRef = collection(db, 'subscriptions');
      const activeSubsQuery = query(subsRef, where('status', '==', 'Active'));
      const activeSubsSnap = await getDocs(activeSubsQuery);

      const today = new Date().toISOString().split('T')[0];

      // 2. Generate Orders for today based on active subscriptions
      for (const subDoc of activeSubsSnap.docs) {
        const subData = subDoc.data();
        
        // Prevent duplicate orders for the same day
        const ordersRef = collection(db, 'orders');
        const existingOrderQ = query(
          ordersRef, 
          where('subscriptionId', '==', subDoc.id),
          where('date', '==', today)
        );
        const existingOrderSnap = await getDocs(existingOrderQ);

        if (existingOrderSnap.empty) {
          const newOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const orderDocRef = doc(db, 'orders', newOrderId);
          
          batch.set(orderDocRef, {
            orderId: newOrderId,
            customerId: subData.customerId,
            subscriptionId: subDoc.id,
            mealName: subData.planName || 'Daily Fresh Meal',
            orderStatus: 'Pending', // Triggers kitchen
            date: today,
            timestamp: new Date().toISOString(),
          });
          ordersCreated++;
        }
      }

      // 3. Process Kitchen -> Inventory Deduction
      // Find orders that are 'Packed' today but haven't reduced inventory yet
      const packedOrdersQ = query(collection(db, 'orders'), where('orderStatus', '==', 'Packed'), where('date', '==', today));
      const packedOrdersSnap = await getDocs(packedOrdersQ);

      const inventoryRef = collection(db, 'inventory');
      const inventorySnap = await getDocs(inventoryRef);
      const inventoryItems = inventorySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      for (const _ of packedOrdersSnap.docs) {
        // For each packed meal, deduct a standard set of ingredients (simulated recipe mapping)
        // In a real app, this would lookup a 'Recipe' collection
        for (const item of inventoryItems) {
            if ((item as any).stock > 0) {
                const itemRef = doc(db, 'inventory', item.id);
                // Deduct random small amount to simulate usage
                const deduction = Math.floor(Math.random() * 5) + 1;
                batch.update(itemRef, {
                    stock: increment(-deduction)
                });
                inventoryDeducted++;

                if (((item as any).stock - deduction) <= ((item as any).reorderLevel || 10)) {
                    lowStockAlerts++;
                }
            }
        }
      }

      // Commit the batch
      await batch.commit();

      // Log success
      await systemMonitoringService.logAction({
        adminId,
        adminName,
        role: 'System Automation',
        module: 'Batch Processing',
        action: 'Daily Workflow Triggered',
        recordId: today,
        status: 'Success'
      });

      return {
        success: true,
        ordersCreated,
        inventoryDeducted,
        lowStockAlerts
      };

    } catch (error) {
      console.error("Batch operation failed:", error);
      await systemMonitoringService.logAction({
        adminId,
        adminName,
        role: 'System Automation',
        module: 'Batch Processing',
        action: 'Daily Workflow Triggered',
        recordId: 'ERROR',
        status: 'Failed'
      });
      return { success: false, error };
    }
  },

  async runAIInsights() {
    // Simulate AI Predictive Insights Generation
    return {
      bestSellingPredicted: 'Keto Power Bowl',
      churnRiskCustomers: 12,
      demandForecast: 'High (Weekend Peak Expected)',
      peakOrderTime: '12:30 PM - 01:30 PM',
      inventoryForecast: 'Tomato & Chicken Breast stocks will deplete in 48 hours.'
    };
  }
};
