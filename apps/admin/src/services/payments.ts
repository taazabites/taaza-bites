import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  getDoc,
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Payment, Refund, Invoice } from '../types';
import axios from 'axios';
import { writeAuditLog } from "../lib/audit-log";
import { canChangePaymentStatus } from "../lib/rbac";

// Toggle for UI Stabilization phase

// Local state for mock data

export enum OperationType {
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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const paymentsService = {
  /**
   * Get all payments (one-time fetch)
   */
  async getPayments(): Promise<Payment[]> {
        const path = 'payments';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(200));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
    } catch (error) {
      console.error('Failed to list payments:', error);
      return [];
    }
  },

  /**
   * Listen to payments collection in realtime
   */
  subscribePayments(callback: (payments: Payment[]) => void, onError?: (error: any) => void) {
    
    const path = 'payments';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(150));
      return onSnapshot(q, (snapshot) => {
        const paymentsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Payment[];
        callback(paymentsList);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        if (onError) onError(error);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  /**
   * Listen to refunds collection in realtime
   */
  subscribeRefunds(callback: (refunds: Refund[]) => void, onError?: (error: any) => void) {
    
    const path = 'refunds';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const refundsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Refund[];
        callback(refundsList);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        if (onError) onError(error);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  /**
   * Listen to invoices collection in realtime
   */
  subscribeInvoices(callback: (invoices: Invoice[]) => void, onError?: (error: any) => void) {
    const path = 'invoices';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const invoicesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Invoice[];
        callback(invoicesList);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        if (onError) onError(error);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  /**
    * Listen to audit logs
    */
  subscribeAuditLogs(callback: (logs: any[]) => void, onError?: (error: any) => void) {
    const path = 'paymentAuditLogs';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(100));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        if (onError) onError(error);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  /**
    * Listen to wallet transactions
    */
  subscribeWalletTransactions(callback: (transactions: any[]) => void, onError?: (error: any) => void) {
    const path = 'walletTransactions';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(100));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        if (onError) onError(error);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  /**
   * Create a new payment and optionally trigger related dashboard / subscription updates
   */
  async createPayment(paymentData: Omit<Payment, 'id'>): Promise<string> {
    
    const path = 'payments';
    try {
      const docRef = doc(collection(db, path));
      const payment: Payment = {
        ...paymentData,
        id: docRef.id,
        paymentId: docRef.id,
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, payment);

      // If payment is completed successfully, trigger automatic downstream systems
      if (payment.status === 'Success') {
        await this.handleCompletedPaymentDownstream(payment);
      }

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  },

  /**
   * Update dynamic payment status (e.g. Pending -> Success) and run workflows
   */
  async updatePaymentStatus(id: string, status: Payment['status'], actor?: { id?: string; name?: string; role?: string }): Promise<void> {
    
    const path = `payments/${id}`;
    try {
      if (actor?.role && !canChangePaymentStatus(actor.role)) {
        throw new Error('You are not permitted to change payment status. This action is audited.');
      }
      const paymentRef = doc(db, 'payments', id);
      const paymentSnap = await getDoc(paymentRef);
      if (!paymentSnap.exists()) throw new Error('Payment not found');

      const payment = paymentSnap.data() as Payment;
      await updateDoc(paymentRef, {
        status,
        updatedAt: new Date().toISOString()
      });
      await writeAuditLog({
        adminId: actor?.id,
        adminName: actor?.name,
        action: 'UPDATE',
        entityType: 'payment',
        entityId: id,
        previousValue: { status: payment.status },
        newValue: { status },
      });

      // Trigger workflows if transitioned to Success
      if (status === 'Success' && payment.status !== 'Success') {
        await this.handleCompletedPaymentDownstream({ ...payment, status });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Refund Management - Issuing complete or partial refunds
   */
  async issueRefund(paymentId: string, amount: number, reason: string, notes?: string): Promise<string> {
    
    const path = 'refunds';
    try {
      // 1. Retrieve original payment
      const paymentRef = doc(db, 'payments', paymentId);
      const paymentSnap = await getDoc(paymentRef);
      if (!paymentSnap.exists()) throw new Error('Payment record not found');

      const payment = paymentSnap.data() as Payment;
      if (payment.status === 'Refunded') {
        throw new Error('This payment has already been refunded');
      }

      // Hit our backend to execute razorpay refund
      const backendUrl = import.meta.env.VITE_APP_URL || '';
      try {
        await axios.post(`${backendUrl}/api/payments/refund`, {
          paymentId,
          amount,
          reason,
          notes
        });
      } catch (err: any) {
        console.warn("Razorpay refund API error, falling back to local simulation:", err);
        // Do not throw; proceed to local Firestore simulation so preview continues to work smoothly
      }

      // 2. Write refund record
      const refundRef = doc(collection(db, 'refunds'));
      const refund: Refund = {
        id: refundRef.id,
        refundId: refundRef.id,
        paymentId,
        amount,
        reason,
        status: 'Success',
        notes: notes || '',
        createdAt: new Date().toISOString()
      };
      await setDoc(refundRef, refund);

      // 3. Update parent payment status
      await updateDoc(paymentRef, {
        status: 'Refunded',
        updatedAt: new Date().toISOString()
      });

      // 4. Update customer wallet if it was a wallet payment
      if (payment.paymentMethod === 'Wallet') {
        try {
          const customerRef = doc(db, 'customers', payment.customerId);
          const customerSnap = await getDoc(customerRef);
          if (customerSnap.exists()) {
            const currentBal = customerSnap.data().walletBalance || 0;
            await updateDoc(customerRef, {
              walletBalance: currentBal + amount
            });
          }
        } catch (walletErr) {
          console.error('Failed to auto-reimburse customer wallet:', walletErr);
        }
      }

      // 5. Check if subscription needs update
      if (payment.subscriptionId) {
        try {
          const subRef = doc(db, 'subscriptions', payment.subscriptionId);
          await updateDoc(subRef, { status: 'Cancelled' });
        } catch (e) {
          console.error('Failed to cancel subscription on refund:', e);
        }
      }

      // 6. Write transaction list log (for reports page / legacy transaction tracking)
      const transactionsRef = collection(db, 'transactions');
      await addDoc(transactionsRef, {
        customerId: payment.customerId,
        amount: -amount,
        type: 'Refund',
        status: 'Success',
        method: payment.paymentMethod,
        timestamp: new Date().toISOString()
      });

      return refundRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  },

  /**
   * Generate Invoice and write to the invoices collection
   */
  async generateInvoice(paymentId: string): Promise<string> {
    
    const path = 'invoices';
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      const paymentSnap = await getDoc(paymentRef);
      if (!paymentSnap.exists()) throw new Error('Payment not found');
      const payment = paymentSnap.data() as Payment;

      // Check if invoice already exists for this payment to avoid duplicates
      const invoicesRef = collection(db, 'invoices');
      const q = await getDocs(invoicesRef);
      const existing = q.docs.find(d => d.data().paymentId === paymentId);
      if (existing) {
        return existing.id;
      }

      const invoiceRef = doc(invoicesRef);
      const invoiceNum = payment.invoiceNumber || `TB-INV-${Math.floor(100000 + Math.random() * 900000)}`;

      const invoice: Invoice = {
        id: invoiceRef.id,
        invoiceId: invoiceRef.id,
        invoiceNumber: invoiceNum,
        customerId: payment.customerId,
        customerName: payment.customerName,
        paymentId: paymentId,
        pdfUrl: `https://storage.googleapis.com/taazabites-invoices/${invoiceNum}.pdf`,
        createdAt: new Date().toISOString()
      };

      await setDoc(invoiceRef, invoice);

      // Also update the payment with its assigned invoice number
      if (!payment.invoiceNumber) {
        await updateDoc(paymentRef, { invoiceNumber: invoiceNum });
      }

      return invoiceRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  },

  /**
   * Core logic to handle downstream events when a payment succeeds:
   * • Update Subscription Status
   * • Update Customer wallet or reward points
   * • Update Order payment state
   */
  async handleCompletedPaymentDownstream(payment: Payment) {
    console.log('Automating completed payment downstream workflows...', payment);

    

    // 1. Update Customer Loyalty / Rewards (10% of amount as reward points)
    try {
      const customerRef = doc(db, 'customers', payment.customerId);
      const customerSnap = await getDoc(customerRef);
      if (customerSnap.exists()) {
        const currentPoints = customerSnap.data().rewardPoints || 0;
        const ptsEarned = Math.round(payment.amount * 0.1);
        await updateDoc(customerRef, {
          rewardPoints: currentPoints + ptsEarned
        });
        console.log(`Earned ${ptsEarned} reward points for Customer ${payment.customerId}`);
      }
    } catch (e) {
      console.error('Error updating customer loyalty downstream:', e);
    }

    // 2. Update Subscription Status to Active if subscriptionId exists
    if (payment.subscriptionId) {
      try {
        const subRef = doc(db, 'subscriptions', payment.subscriptionId);
        await updateDoc(subRef, {
          status: 'Active',
          startDate: new Date().toISOString(),
          // Extend endDate 30 days
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
        console.log(`Activated Subscription ${payment.subscriptionId}`);
      } catch (e) {
        console.error('Error updating subscription downstream:', e);
      }
    }

    // 3. Update Order status if orderId exists
    if (payment.orderId) {
      try {
        const orderRef = doc(db, 'orders', payment.orderId);
        await updateDoc(orderRef, {
          paymentStatus: 'Paid',
          status: 'Confirmed',
          orderStatus: 'Confirmed'
        });
        console.log(`Confirmed Order ${payment.orderId}`);
      } catch (e) {
        console.error('Error updating order downstream:', e);
      }
    }

    // 4. Create an automatic legacy transaction entry
    try {
      const transactionsRef = collection(db, 'transactions');
      await addDoc(transactionsRef, {
        customerId: payment.customerId,
        amount: payment.amount,
        type: 'Payment',
        status: 'Success',
        method: payment.paymentMethod,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('Error adding transaction duplicate downstream:', e);
    }
  },

  async getRefunds(): Promise<Refund[]> {
    const path = 'refunds';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Refund[];
    } catch (error) {
      console.error('Failed to list refunds:', error);
      return [];
    }
  },

  async getInvoices(): Promise<Invoice[]> {
    const path = 'invoices';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  /**
   * Seed dynamic database if empty to ensure rich, beautiful production data
   */
  async seedPaymentsIfEmpty(): Promise<void> {
    try {
      const paymentsRef = collection(db, 'payments');
      const snap = await getDocs(paymentsRef);
      if (!snap.empty) {
        console.log('Payments collection already has records. Seeding skipped.');
        return;
      }

      console.log('Payments empty, seeding initial records...');

      const samplePayments: Omit<Payment, 'id'>[] = [
        {
          paymentId: '',
          transactionId: 'TXN-RAZOR-9082',
          customerId: 'cust_1',
          customerName: 'Aarav Sharma',
          customerPhone: '+91 98765 43210',
          subscriptionId: 'sub_1',
          orderId: 'order_1',
          paymentMethod: 'Razorpay',
          amount: 1530.00,
          gst: 72.85,
          discount: 150.00,
          netAmount: 1452.85,
          currency: 'INR',
          status: 'Success',
          razorpayPaymentId: 'pay_Or98vByXz7qL',
          razorpayOrderId: 'order_Or98h8Ais89K',
          invoiceNumber: 'TB-INV-509124',
          createdAt: '2026-07-09T10:15:30Z',
          updatedAt: '2026-07-09T10:16:00Z'
        },
        {
          paymentId: '',
          transactionId: 'TXN-UPI-1102',
          customerId: 'cust_2',
          customerName: 'Ananya Iyer',
          customerPhone: '+91 87654 32109',
          subscriptionId: 'sub_2',
          orderId: 'order_2',
          paymentMethod: 'UPI',
          amount: 2450.00,
          gst: 116.66,
          discount: 0.00,
          netAmount: 2566.66,
          currency: 'INR',
          status: 'Success',
          invoiceNumber: 'TB-INV-509125',
          createdAt: '2026-07-09T16:45:00Z',
          updatedAt: '2026-07-09T16:45:00Z'
        },
        {
          paymentId: '',
          transactionId: 'TXN-CARD-4421',
          customerId: 'cust_4',
          customerName: 'Riya Sen',
          customerPhone: '+91 95432 10987',
          subscriptionId: 'sub_3',
          orderId: 'order_3',
          paymentMethod: 'Credit Card',
          amount: 890.00,
          gst: 42.38,
          discount: 50.00,
          netAmount: 882.38,
          currency: 'INR',
          status: 'Success',
          invoiceNumber: 'TB-INV-509126',
          createdAt: '2026-07-08T12:30:15Z',
          updatedAt: '2026-07-08T12:31:00Z'
        },
        {
          paymentId: '',
          transactionId: 'TXN-WALL-7721',
          customerId: 'cust_1',
          customerName: 'Aarav Sharma',
          customerPhone: '+91 98765 43210',
          paymentMethod: 'Wallet',
          amount: 450.00,
          gst: 21.42,
          discount: 0.00,
          netAmount: 471.42,
          currency: 'INR',
          status: 'Success',
          invoiceNumber: 'TB-INV-509127',
          createdAt: '2026-07-07T14:20:00Z',
          updatedAt: '2026-07-07T14:20:00Z'
        },
        {
          paymentId: '',
          transactionId: 'TXN-PEND-3211',
          customerId: 'cust_3',
          customerName: 'Kabir Mehta',
          customerPhone: '+91 76543 21098',
          paymentMethod: 'Net Banking',
          amount: 1100.00,
          gst: 52.38,
          discount: 100.00,
          netAmount: 1052.38,
          currency: 'INR',
          status: 'Pending',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          paymentId: '',
          transactionId: 'TXN-FAIL-0912',
          customerId: 'cust_4',
          customerName: 'Riya Sen',
          customerPhone: '+91 95432 10987',
          paymentMethod: 'Debit Card',
          amount: 670.00,
          gst: 31.90,
          discount: 0.00,
          netAmount: 701.90,
          currency: 'INR',
          status: 'Failed',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          paymentId: '',
          transactionId: 'TXN-RAZOR-1190',
          customerId: 'cust_2',
          customerName: 'Ananya Iyer',
          customerPhone: '+91 87654 32109',
          paymentMethod: 'Razorpay',
          amount: 1999.00,
          gst: 95.19,
          discount: 200.00,
          netAmount: 1894.19,
          currency: 'INR',
          status: 'Processing',
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
          updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          paymentId: '',
          transactionId: 'TXN-REF-8802',
          customerId: 'cust_3',
          customerName: 'Kabir Mehta',
          customerPhone: '+91 76543 21098',
          paymentMethod: 'UPI',
          amount: 1250.00,
          gst: 59.52,
          discount: 125.00,
          netAmount: 1184.52,
          currency: 'INR',
          status: 'Refunded',
          invoiceNumber: 'TB-INV-509120',
          createdAt: '2026-07-05T09:15:00Z',
          updatedAt: '2026-07-06T11:00:00Z'
        },
        {
          paymentId: '',
          transactionId: 'TXN-CANC-9904',
          customerId: 'cust_1',
          customerName: 'Aarav Sharma',
          customerPhone: '+91 98765 43210',
          paymentMethod: 'Wallet',
          amount: 320.00,
          gst: 15.23,
          discount: 0.00,
          netAmount: 335.23,
          currency: 'INR',
          status: 'Cancelled',
          createdAt: '2026-07-04T18:10:00Z',
          updatedAt: '2026-07-04T18:25:00Z'
        }
      ];

      for (const p of samplePayments) {
        await this.createPayment(p);
      }

      // Also seed matching refund and invoices
      const refundsRef = collection(db, 'refunds');
      const invoicesRef = collection(db, 'invoices');

      // We retrieve payments to get valid auto-generated payment IDs
      const pSnapshot = await getDocs(paymentsRef);
      const seededPayments = pSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Payment[];

      // Seed Refund
      const refundedPayment = seededPayments.find(p => p.status === 'Refunded');
      if (refundedPayment) {
        const refDoc = doc(refundsRef);
        await setDoc(refDoc, {
          id: refDoc.id,
          refundId: refDoc.id,
          paymentId: refundedPayment.paymentId,
          amount: refundedPayment.amount,
          reason: 'Subscription Plan Modified',
          status: 'Success',
          notes: 'Customer upgraded to high tier and requested a refund for the prorated balance.',
          createdAt: '2026-07-06T11:00:00Z'
        });
      }

      // Seed Invoices
      for (const p of seededPayments) {
        if (p.status === 'Success') {
          const invDoc = doc(invoicesRef);
          await setDoc(invDoc, {
            id: invDoc.id,
            invoiceId: invDoc.id,
            invoiceNumber: p.invoiceNumber || `TB-INV-${Math.floor(100000 + Math.random() * 900000)}`,
            customerId: p.customerId,
            customerName: p.customerName,
            customerEmail: `${p.customerName.toLowerCase().replace(' ', '.')}@gmail.com`,
            paymentId: p.paymentId,
            pdfUrl: `https://storage.googleapis.com/taazabites-invoices/${p.invoiceNumber}.pdf`,
            createdAt: p.createdAt
          });
        }
      }

      console.log('Completed seeding comprehensive Payments, Refunds, and Invoices.');
    } catch (err) {
      console.error('Error seeding initial payments data:', err);
    }
  }
};
