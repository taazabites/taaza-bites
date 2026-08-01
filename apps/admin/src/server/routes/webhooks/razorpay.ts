import { Router } from 'express';
import crypto from 'crypto';
import { getFirebaseAdmin } from '../../lib/firebase-admin';

const router = Router();

router.post("/", async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  const signature = req.headers['x-razorpay-signature'] as string;
  const { db } = getFirebaseAdmin();
  
  // Verify Webhook Signature
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== signature) {
    console.error("Invalid Webhook Signature");
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = req.body.event;
  const payload = req.body.payload;
  console.log("Verified Razorpay Webhook Event:", event);

  // Store Webhook Log
  if (db) {
    await db.collection('paymentWebhooks').add({
      event,
      payload,
      receivedAt: new Date()
    });
  }

  res.status(200).json({ status: "ok" });
});

export default router;
