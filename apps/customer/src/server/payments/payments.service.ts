import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { adminDb } from '../../firebase/firebase-admin';

@Injectable()
export class PaymentsService {
  async verify(data: any) {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      planId,
      amount
    } = data;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return { success: false, error: 'Missing payment identifiers' };
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return { success: false, error: 'Payment gateway not configured' };
    }

    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return { success: false, error: 'Invalid payment signature' };
    }

    // Process the payment record securely on the server
    try {
      const batch = adminDb.batch();
      const timestamp = new Date();
      
      // Create Payment Record
      const paymentRef = adminDb.collection('payments').doc(razorpay_payment_id);
      batch.set(paymentRef, {
        userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount,
        status: 'completed',
        verifiedAt: timestamp,
        createdAt: timestamp,
      });

      // Update Order Record
      const orderRef = adminDb.collection('orders').doc(razorpay_order_id);
      batch.set(orderRef, {
        status: 'paid',
        paymentId: razorpay_payment_id,
        updatedAt: timestamp,
      }, { merge: true });

      // Update user subscription
      if (userId && planId) {
        const userRef = adminDb.collection('users').doc(userId);
        batch.update(userRef, {
          activeSubscription: true,
          currentPlanId: planId,
          lastPaymentDate: timestamp,
        });
      }

      await batch.commit();

      return { 
        success: true, 
        message: 'Payment verified and records updated successfully' 
      };
    } catch (error: any) {
      console.error('Error updating records after payment:', error);
      throw new Error('Failed to update financial records');
    }
  }
}
