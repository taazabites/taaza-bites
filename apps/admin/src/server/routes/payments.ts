import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getFirebaseAdmin } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const router = Router();

let razorpayInstance: Razorpay | null = null;

function getRazorpay() {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn("Razorpay credentials missing. Payment features will fail.");
    return null;
  }

  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    return razorpayInstance;
  } catch (error) {
    console.error("Failed to initialize Razorpay:", error);
    return null;
  }
}

router.get("/config", (req, res) => {
  res.json({
    keyId: process.env.VITE_RAZORPAY_KEY_ID
  });
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency, receipt, notes, customerId } = req.body;
    const razorpay = getRazorpay();
    const { db } = getFirebaseAdmin();
    
    if (!razorpay) {
      throw new Error("Razorpay is not configured on the server.");
    }

    if (!amount || amount < 100) { // Min 100 paise (1 INR)
      throw new Error("Amount must be at least 100 paise (₹1)");
    }
    
    const options = {
      amount: Math.round(amount),
      currency: currency || "INR",
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);
    
    await db.collection('paymentLogs').add({
      type: 'ORDER_CREATED',
      orderId: order.id,
      customerId: customerId || 'guest',
      amount: amount / 100,
      timestamp: FieldValue.serverTimestamp(),
      payload: order
    });

    res.json(order);
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customerId } = req.body;
    const { db } = getFirebaseAdmin();
    
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Find payment in Firestore and update
      await db.collection('paymentLogs').add({
        type: 'PAYMENT_VERIFIED',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        customerId: customerId || 'guest',
        timestamp: FieldValue.serverTimestamp()
      });
      res.json({ status: "success" });
    } else {
      res.status(400).json({ error: "Invalid signature" });
    }
  } catch (error: any) {
    console.error("Razorpay Verification Error:", error);
    res.status(500).json({ error: error.message || "Failed to verify payment" });
  }
});

export default router;
