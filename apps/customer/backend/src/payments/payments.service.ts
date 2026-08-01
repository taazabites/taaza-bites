import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';

@Injectable()
export class PaymentsService {
  private db: admin.firestore.Firestore;

  constructor() {
    // Initialize Firebase Admin if not already initialized
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }
    this.db = admin.firestore();
  }

  async verify(data: any) {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      planId,
      amount
    } = data;

    // 1. Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return { success: false, error: 'Missing payment identifiers' };
    }

    // 2. Verify Signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret) {
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return { success: false, error: 'Invalid signature. Payment could not be verified.' };
      }
    }

    // 3. Process Financial Records securely on the backend
    try {
      const batch = this.db.batch();
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      // Create Payment Record
      const paymentRef = this.db.collection('payments').doc(razorpay_payment_id);
      batch.set(paymentRef, {
        userId,
        orderId: razorpay_order_id,
        amount,
        currency: 'INR',
        status: 'completed',
        method: 'razorpay',
        verifiedAt: timestamp,
      });

      // Create Order Record
      const orderRef = this.db.collection('orders').doc(razorpay_order_id);
      batch.set(orderRef, {
        userId,
        planId,
        paymentId: razorpay_payment_id,
        status: 'paid',
        amount,
        createdAt: timestamp,
      }, { merge: true });

      // Update User Subscription Status
      const userRef = this.db.collection('users').doc(userId);
      batch.update(userRef, {
        isSubscribed: true,
        currentPlan: planId,
        lastPaymentAt: timestamp,
      });

      await batch.commit();

      return { 
        success: true, 
        message: 'Payment verified and records secured on backend',
        transactionId: razorpay_payment_id
      };
    } catch (error: any) {
      console.error('Firestore operation failed during payment verification:', error);
      throw new InternalServerErrorException('Failed to process financial records');
    }
  }
}
