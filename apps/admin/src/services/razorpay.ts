import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Payment } from '../types';
import { adminFetch } from '../lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const razorpayService = {
  loadScript: () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  createOrder: async (amount: number, customerId: string, customerName: string, metadata: any = {}) => {
    try {
      const response = await adminFetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Razorpay expects amount in paise
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          customerId,
          notes: {
            customerName,
            customerId,
            ...metadata
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }
      
      const order = await response.json();

      // Store the initial pending payment record in Firestore
      const paymentRef = collection(db, 'payments');
      const paymentData: Omit<Payment, 'id'> = {
        paymentId: `PAY-${Date.now()}`,
        transactionId: order.receipt,
        customerId,
        customerName,
        paymentMethod: 'Razorpay',
        amount: amount,
        gst: amount * 0.05,
        discount: 0,
        netAmount: amount * 1.05,
        currency: 'INR',
        status: 'Pending',
        razorpayOrderId: order.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...metadata
      };
      
      const docRef = await addDoc(paymentRef, paymentData);
      
      return { order, docId: docRef.id };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  verifyPayment: async (paymentDetails: any) => {
    try {
      const response = await adminFetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentDetails)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment verification failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  processRefund: async (paymentId: string, amount?: number, reason?: string) => {
    try {
      const response = await adminFetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, amount, reason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Refund failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }
};
