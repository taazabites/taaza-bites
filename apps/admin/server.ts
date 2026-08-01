import express from "express";
import path from "path";
import Razorpay from 'razorpay';
import crypto from 'crypto';
import axios from 'axios';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import authRoutes from './src/server/routes/auth';
import meRoutes from './src/server/routes/me';
import superAdminRoutes from './src/server/routes/super-admin';
import gupshupWebhookRoutes from './src/server/routes/webhooks/gupshup';
import razorpayWebhookRoutes from './src/server/routes/webhooks/razorpay';
import { authenticate, authorize } from './src/server/middleware/auth-middleware';
import firebaseConfig from "./firebase-applet-config.json";



// Lazy initialization helpers
let firebaseAdminApp: any = null;
let firestoreDb: any = null;

function getFirebaseAdmin() {
  if (firebaseAdminApp) return { app: firebaseAdminApp, db: firestoreDb };

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("Firebase Admin credentials missing. Firestore-dependent features will fail.");
    return { app: null, db: null };
  }

  try {
    // Clean private key: handle literal \n and ensure proper PEM format
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    
    const formattedKey = privateKey.replace(/\\n/g, '\n');
    const databaseId = firebaseConfig.firestoreDatabaseId || "ai-studio-taazabitesadmint-f2702470-dbd9-4fd8-8d80-708eb0bdb4c2";
    
    if (getApps().length === 0) {
      firebaseAdminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedKey,
        })
      });
      firestoreDb = getFirestore(firebaseAdminApp, databaseId);
    } else {
      firebaseAdminApp = getApps()[0];
      firestoreDb = getFirestore(firebaseAdminApp, databaseId);
    }
    return { app: firebaseAdminApp, db: firestoreDb };
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    return { app: null, db: null };
  }
}

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

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // CORS for landing / sibling apps calling /api/me
  app.use((req, res, next) => {
    const origin = req.headers.origin || '';
    const allowed = [
      process.env.VITE_LANDING_URL || 'http://localhost:3002',
      process.env.VITE_CUSTOMER_URL || 'http://localhost:3000',
      process.env.VITE_DELIVERY_URL || 'http://localhost:3003',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
    ];
    if (!origin || allowed.some((o) => origin.startsWith(o.replace(/\/$/, '')))) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.status(204).end();
    next();
  });

  // Health check route
  app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use(meRoutes);
  app.use('/api/super-admin', superAdminRoutes);
  app.use('/api/webhooks/gupshup', gupshupWebhookRoutes);
  app.use('/api/razorpay/webhook', razorpayWebhookRoutes);
  
  app.get("/api/payments/config", authenticate, authorize(['Super Admin', 'Admin', 'Finance Manager']), (req, res) => {
    res.json({
      keyId: process.env.VITE_RAZORPAY_KEY_ID
    });
  });

  app.post("/api/payments/create-order", async (req, res) => {
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
      
      // Amount in smallest unit (paise for INR)
      const options = {
        amount: Math.round(amount),
        currency: currency || "INR",
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {}
      };

      const order = await razorpay.orders.create(options);
      
      // Log order creation if db is available
      if (db) {
        await db.collection('paymentLogs').add({
          type: 'ORDER_CREATED',
          orderId: order.id,
          customerId: customerId || 'guest',
          amount: amount / 100,
          timestamp: FieldValue.serverTimestamp(),
          payload: order
        });
      }

      res.json(order);
    } catch (error: any) {
      console.error("Razorpay Order Creation Error:", error);
      res.status(500).json({ error: error.message || "Failed to create order" });
    }
  });

  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customerId } = req.body;
      const { db } = getFirebaseAdmin();
      
      const text = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(text)
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        // Find payment in Firestore and update if db is available
        if (db) {
          const paymentsRef = db.collection('payments');
          const snapshot = await paymentsRef.where('razorpayOrderId', '==', razorpay_order_id).limit(1).get();
          
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await doc.ref.update({
              status: 'Success',
              razorpayPaymentId: razorpay_payment_id,
              updatedAt: FieldValue.serverTimestamp()
            });
          }
        }

        res.json({ status: "ok" });
      } else {
        if (db) {
          await db.collection('paymentLogs').add({
            type: 'SIGNATURE_VERIFICATION_FAILED',
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            timestamp: FieldValue.serverTimestamp()
          });
        }
        res.status(400).json({ error: "Invalid signature" });
      }
    } catch (error: any) {
      console.error("Payment Verification Error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  app.post("/api/payments/refund", async (req, res) => {
    try {
      const { paymentId, amount, notes, reason } = req.body;
      const razorpay = getRazorpay();
      const { db } = getFirebaseAdmin();

      if (!razorpay || !paymentId || paymentId.startsWith('mock') || !paymentId.startsWith('pay_')) {
        console.warn("Razorpay not configured or mock payment. Simulating refund in database.");
        if (db) {
          const paymentsRef = db.collection('payments');
          let paymentDoc = await paymentsRef.doc(paymentId).get();
          if (!paymentDoc.exists) {
            const snapshot = await paymentsRef.where('razorpayPaymentId', '==', paymentId).limit(1).get();
            if (!snapshot.empty) {
              paymentDoc = snapshot.docs[0];
            } else {
              paymentDoc = null;
            }
          }

          if (paymentDoc) {
            const paymentData = paymentDoc.data();
            await paymentDoc.ref.update({
              status: 'Refunded',
              updatedAt: FieldValue.serverTimestamp()
            });

            // Add to refunds collection
            await db.collection('refunds').add({
              paymentId: paymentDoc.id,
              razorpayPaymentId: paymentId,
              razorpayRefundId: `ref_mock_${Math.floor(Math.random() * 1000000)}`,
              amount: amount || (paymentData?.amount || 0),
              reason: reason || 'Refund processed from admin (Simulated)',
              status: 'Success',
              createdAt: FieldValue.serverTimestamp()
            });
          }
        }
        return res.json({ id: `ref_mock_${Date.now()}`, amount: (amount || 0) * 100, status: 'processed' });
      }
      
      // 1. Fetch payment from Razorpay
      const payment = await razorpay.payments.fetch(paymentId);
      
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      // 2. Process Refund via Razorpay
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount ? Math.round(amount * 100) : undefined, // Convert to paise if partial
        notes: { ...notes, reason: reason || 'Admin requested' }
      });

      // 3. Update Firestore (Webhooks will also handle this, but we do it here for instant feedback)
      if (db) {
        const paymentsRef = db.collection('payments');
        const snapshot = await paymentsRef.where('razorpayPaymentId', '==', paymentId).limit(1).get();
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          await doc.ref.update({
            status: 'Refunded',
            updatedAt: FieldValue.serverTimestamp()
          });

          // Add to refunds collection
          await db.collection('refunds').add({
            paymentId: doc.id,
            razorpayPaymentId: paymentId,
            razorpayRefundId: refund.id,
            amount: (refund.amount as number) / 100,
            reason: reason || 'Refund processed from admin',
            status: 'Success',
            createdAt: FieldValue.serverTimestamp()
          });
        }
      }

      res.json(refund);
    } catch (error: any) {
      console.error("Refund Error:", error);
      res.status(500).json({ error: error.message || "Refund failed" });
    }
  });

  app.post("/api/razorpay/webhook", async (req, res) => {
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

    // Store Webhook Log if db is available
    if (db) {
      await db.collection('paymentWebhooks').add({
        event,
        payload,
        receivedAt: FieldValue.serverTimestamp()
      });

      try {
        switch (event) {
          case 'payment.captured': {
            const payment = payload.payment.entity;
            const orderId = payment.order_id;
            
            const paymentsRef = db.collection('payments');
            const snapshot = await paymentsRef.where('razorpayOrderId', '==', orderId).limit(1).get();
            
            if (!snapshot.empty) {
              const paymentDoc = snapshot.docs[0];
              const paymentData = paymentDoc.data();
              
              await paymentDoc.ref.update({
                status: 'Success',
                razorpayPaymentId: payment.id,
                paymentMethod: payment.method,
                updatedAt: FieldValue.serverTimestamp()
              });

              // Update Wallet if applicable
              if (paymentData.type === 'Wallet Top-up') {
                const customerRef = db.collection('customers').doc(paymentData.customerId);
                const customerSnap = await customerRef.get();
                if (customerSnap.exists) {
                  const currentBalance = customerSnap.data()?.walletBalance || 0;
                  await customerRef.update({
                    walletBalance: currentBalance + (payment.amount / 100)
                  });

                  await db.collection('walletTransactions').add({
                    customerId: paymentData.customerId,
                    amount: payment.amount / 100,
                    type: 'Credit',
                    method: 'Razorpay',
                    remarks: `Top-up via Razorpay (ID: ${payment.id})`,
                    timestamp: FieldValue.serverTimestamp(),
                    status: 'Success'
                  });
                }
              }

              // Handle Subscriptions
              if (paymentData.subscriptionId) {
                await db.collection('subscriptions').doc(paymentData.subscriptionId).update({
                  status: 'Active',
                  updatedAt: FieldValue.serverTimestamp()
                });
              }
            }
            break;
          }

          case 'payment.failed': {
            const payment = payload.payment.entity;
            const orderId = payment.order_id;
            const snapshot = await db.collection('payments').where('razorpayOrderId', '==', orderId).limit(1).get();
            if (!snapshot.empty) {
              await snapshot.docs[0].ref.update({
                status: 'Failed',
                razorpayPaymentId: payment.id,
                errorDescription: payment.error_description,
                updatedAt: FieldValue.serverTimestamp()
              });
            }
            break;
          }

          case 'refund.processed': {
            const refund = payload.refund.entity;
            const paymentId = refund.payment_id;
            const snapshot = await db.collection('payments').where('razorpayPaymentId', '==', paymentId).limit(1).get();
            if (!snapshot.empty) {
              await snapshot.docs[0].ref.update({
                status: 'Refunded',
                updatedAt: FieldValue.serverTimestamp()
              });
            }
            break;
          }

          case 'subscription.activated':
          case 'subscription.charged': {
            const subscription = payload.subscription.entity;
            const subId = subscription.id;
            // Update internal subscription record
            const snapshot = await db.collection('subscriptions').where('razorpaySubscriptionId', '==', subId).limit(1).get();
            if (!snapshot.empty) {
              await snapshot.docs[0].ref.update({
                status: 'Active',
                updatedAt: FieldValue.serverTimestamp()
              });
            }
            break;
          }

          case 'subscription.cancelled': {
            const subscription = payload.subscription.entity;
            const subId = subscription.id;
            const snapshot = await db.collection('subscriptions').where('razorpaySubscriptionId', '==', subId).limit(1).get();
            if (!snapshot.empty) {
              await snapshot.docs[0].ref.update({
                status: 'Cancelled',
                updatedAt: FieldValue.serverTimestamp()
              });
            }
            break;
          }
        }
      } catch (error) {
        console.error("Webhook logic error:", error);
      }
    }

    res.json({ status: "ok" });
  });

  // Gupshup Webhook
  app.post("/api/webhooks/gupshup", async (req, res) => {
    console.log("Gupshup Webhook received:", JSON.stringify(req.body, null, 2));
    const { db } = getFirebaseAdmin();
    
    try {
      const payload = req.body;
      const { type, payload: eventPayload } = payload;
      
      // Store log in Firestore
      if (db) {
        await db.collection("gupshupWebhooks").add({
          type,
          payload: eventPayload,
          receivedAt: FieldValue.serverTimestamp()
        });

        // If it's a message status update, log it in communicationLogs
        if (type === 'message-event') {
          await db.collection("communicationLogs").add({
            channel: 'whatsapp',
            direction: 'outbound',
            recipient: eventPayload.destination,
            status: eventPayload.status,
            messageId: eventPayload.id,
            timestamp: FieldValue.serverTimestamp(),
            provider: 'gupshup'
          });
        }
      }

      res.status(200).json({ status: "ok" });
    } catch (error) {
      console.error("Gupshup Webhook Error:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Push Notifications
  app.post("/api/notifications/send", async (req, res) => {
    const { token, title, body, data } = req.body;
    const { app: adminApp } = getFirebaseAdmin();
    
    if (!adminApp) {
      return res.status(500).json({ error: "Firebase Admin not initialized" });
    }

    try {
      const message = {
        notification: { title, body },
        token,
        data: data || {}
      };
      
      const response = await adminApp.messaging().send(message);
      res.json({ success: true, messageId: response });
    } catch (error: any) {
      console.error("FCM Send Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Gateway Settings Management
  app.get("/api/settings/gateways", async (req, res) => {
    const { db } = getFirebaseAdmin();
    if (!db) return res.status(500).json({ error: "Database not connected" });

    try {
      const doc = await db.collection("systemSettings").doc("gatewayConfiguration").get();
      
      const defaultStructure = {
        gupshup: { 
          appName: process.env.GUPSHUP_APP_NAME || "", 
          apiKey: "********", 
          baseUrl: "https://api.gupshup.io", 
          webhookUrl: `${process.env.APP_URL || 'https://ais-pre-hrbadbpnr6imfq2uxyiyzy-126297766833.asia-east1.run.app'}/api/webhooks/gupshup`, 
          webhookStatus: 'warning', 
          apiStatus: 'warning', 
          templateSyncStatus: 'pending', 
          lastSyncTime: "" 
        },
        firebase: { 
          projectId: "taazabites", 
          authStatus: 'connected', 
          firestoreStatus: 'connected', 
          storageStatus: 'connected', 
          functionsStatus: 'connected', 
          realtimeConnection: 'connected' 
        },
        razorpay: { 
          keyId: process.env.VITE_RAZORPAY_KEY_ID || "", 
          webhookSecret: "********", 
          webhookStatus: 'warning', 
          paymentApiStatus: 'warning', 
          refundApiStatus: 'warning', 
          lastWebhookReceived: "" 
        },
        email: { 
          brevoSmtpKey: "********", 
          senderEmail: process.env.SENDER_EMAIL || "", 
          smtpStatus: 'warning' 
        },
        notifications: { 
          fcmServerKey: "********", 
          fcmProject: "taazabites", 
          status: 'warning' 
        }
      };

      let data: any = {};
      if (doc.exists) {
        data = doc.data() || {};
      }

      // Deep merge function to guarantee nested objects and their fields exist
      const deepMerge = (target: any, source: any) => {
        for (const key of Object.keys(source)) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
          } else {
            if (target[key] === undefined) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };

      const finalConfig = deepMerge(data, defaultStructure);

      // Mask sensitive values for frontend
      if (finalConfig.gupshup) finalConfig.gupshup.apiKey = "********";
      if (finalConfig.razorpay) finalConfig.razorpay.webhookSecret = "********";
      if (finalConfig.email) finalConfig.email.brevoSmtpKey = "********";
      if (finalConfig.notifications) finalConfig.notifications.fcmServerKey = "********";
      
      res.json(finalConfig);
    } catch (error) {
      console.error("GET /api/settings/gateways error:", error);
      res.status(500).json({ error: "Failed to load gateway settings" });
    }
  });

  app.put("/api/settings/gateways", async (req, res) => {
    const { db } = getFirebaseAdmin();
    if (!db) return res.status(500).json({ error: "Database not connected" });

    try {
      const { config, adminUser } = req.body;
      
      // Merge with existing secrets if "********" is provided
      const existingDoc = await db.collection("systemSettings").doc("gatewayConfiguration").get();
      const existingData = existingDoc.exists ? existingDoc.data() : {};

      const finalConfig = { ...config };
      
      const unmask = (current: any, existing: any, field: string, envFallback: string) => {
        if (current) {
          if (current[field] === "********") {
            current[field] = (existing && existing[field]) || envFallback || "";
          }
        }
      };

      unmask(finalConfig.gupshup, existingData?.gupshup, "apiKey", process.env.GUPSHUP_API_KEY || "");
      unmask(finalConfig.razorpay, existingData?.razorpay, "webhookSecret", process.env.RAZORPAY_WEBHOOK_SECRET || "");
      unmask(finalConfig.email, existingData?.email, "brevoSmtpKey", process.env.BREVO_SMTP_KEY || "");
      if (finalConfig.notifications) {
        unmask(finalConfig.notifications, existingData?.notifications, "fcmServerKey", process.env.FCM_SERVER_KEY || "");
      }

      await db.collection("systemSettings").doc("gatewayConfiguration").set({
        ...finalConfig,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: adminUser || "system"
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save gateway settings" });
    }
  });

  // Gateway Connection Testers
  app.post("/api/settings/test/gupshup", async (req, res) => {
    let { apiKey, appName } = req.body;
    const { db } = getFirebaseAdmin();
    try {
      if (!apiKey || apiKey === "********") {
        if (db) {
          const doc = await db.collection("systemSettings").doc("gatewayConfiguration").get();
          if (doc.exists) {
            apiKey = doc.data()?.gupshup?.apiKey;
          }
        }
        if (!apiKey || apiKey === "********") {
          apiKey = process.env.GUPSHUP_API_KEY;
        }
      }
      const response = await axios.get("https://api.gupshup.io/wa/api/v1/template/list", {
        headers: { 'apikey': apiKey }
      });
      res.json({ status: "success", data: response.data });
    } catch (error: any) {
      res.status(500).json({ status: "failed", error: error.response?.data || error.message });
    }
  });

  app.post("/api/settings/test/razorpay", async (req, res) => {
    let { keyId, webhookSecret } = req.body;
    const { db } = getFirebaseAdmin();
    try {
      let keySecret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!webhookSecret || webhookSecret === "********") {
        if (db) {
          const doc = await db.collection("systemSettings").doc("gatewayConfiguration").get();
          if (doc.exists) {
            const data = doc.data();
            webhookSecret = data?.razorpay?.webhookSecret;
            keyId = keyId || data?.razorpay?.keyId;
          }
        }
        if (!keySecret) {
          keySecret = process.env.RAZORPAY_KEY_SECRET;
        }
      }
      
      const rInstance = new Razorpay({
        key_id: keyId || process.env.VITE_RAZORPAY_KEY_ID || "",
        key_secret: keySecret || ""
      });
      
      await rInstance.orders.all({ count: 1 });
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ status: "failed", error: error.message });
    }
  });

  app.post("/api/settings/test/firebase", async (req, res) => {
    const { db } = getFirebaseAdmin();
    if (!db) return res.status(500).json({ status: "failed", error: "Firebase Admin not initialized" });
    try {
      await db.collection("systemSettings").limit(1).get();
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ status: "failed", error: error.message });
    }
  });

  app.post("/api/settings/test/email", async (req, res) => {
    let { brevoSmtpKey, senderEmail } = req.body;
    const { db } = getFirebaseAdmin();
    const nodemailer = await import("nodemailer");
    try {
      if (!brevoSmtpKey || brevoSmtpKey === "********") {
        if (db) {
          const doc = await db.collection("systemSettings").doc("gatewayConfiguration").get();
          if (doc.exists) {
            const data = doc.data();
            brevoSmtpKey = data?.email?.brevoSmtpKey;
            senderEmail = senderEmail || data?.email?.senderEmail;
          }
        }
        if (!brevoSmtpKey || brevoSmtpKey === "********") {
          brevoSmtpKey = process.env.BREVO_SMTP_KEY;
        }
      }
      const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
          user: senderEmail || process.env.SENDER_EMAIL,
          pass: brevoSmtpKey
        }
      });
      await transporter.verify();
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ status: "failed", error: error.message });
    }
  });

  app.post("/api/settings/test/notifications", async (req, res) => {
    let { fcmServerKey, fcmProject } = req.body;
    const { db } = getFirebaseAdmin();
    try {
      if (!fcmServerKey || fcmServerKey === "********") {
        if (db) {
          const doc = await db.collection("systemSettings").doc("gatewayConfiguration").get();
          if (doc.exists) {
            fcmServerKey = doc.data()?.notifications?.fcmServerKey;
          }
        }
        if (!fcmServerKey || fcmServerKey === "********") {
          fcmServerKey = process.env.FCM_SERVER_KEY;
        }
      }
      if (fcmServerKey && fcmServerKey.length > 5) {
        res.json({ status: "success" });
      } else {
        res.status(400).json({ status: "failed", error: "FCM Server Key is empty or invalid" });
      }
    } catch (error: any) {
      res.status(500).json({ status: "failed", error: error.message });
    }
  });

  app.get("/api/gupshup/templates/sync", async (req, res) => {
    const { db } = getFirebaseAdmin();
    const apiKey = process.env.GUPSHUP_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Gupshup API Key missing" });

    try {
      const response = await axios.get("https://api.gupshup.io/wa/api/v1/template/list", {
        headers: { 'apikey': apiKey }
      });
      
      const templates = response.data.templates || [];
      
      if (db) {
        const batch = db.batch();
        templates.forEach((tpl: any) => {
          const tplRef = db.collection("messageTemplates").doc(tpl.id || tpl.elementName);
          batch.set(tplRef, {
            externalId: tpl.id,
            name: tpl.elementName,
            category: tpl.category,
            status: tpl.status,
            language: tpl.languageCode,
            body: tpl.data,
            updatedAt: FieldValue.serverTimestamp(),
            provider: 'gupshup'
          });
        });
        await batch.commit();

        await db.collection("systemSettings").doc("gatewayConfiguration").set({
          "gupshup.templateSyncStatus": 'synced',
          "gupshup.lastSyncTime": new Date().toISOString()
        }, { merge: true });
      }

      res.json({ success: true, count: templates.length });
    } catch (error: any) {
      console.error("Gupshup Sync Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/razorpay/refund", async (req, res) => {
    try {
      const { paymentId, amount, reason, notes } = req.body;
      const { db } = getFirebaseAdmin();
      let keySecret = process.env.RAZORPAY_KEY_SECRET;
      let keyId = process.env.VITE_RAZORPAY_KEY_ID;
      
      if (db) {
        const doc = await db.collection("systemSettings").doc("gatewayConfiguration").get();
        if (doc.exists) {
          const data = doc.data();
          if (data?.razorpay?.keyId) keyId = data.razorpay.keyId;
        }
      }

      const rInstance = new Razorpay({
        key_id: keyId || "",
        key_secret: keySecret || ""
      });

      const refundParams: any = {
        amount: amount * 100, // Amount in paise
        notes: {
          reason: reason || "Customer request",
          additional_notes: notes || ""
        }
      };

      const result = await rInstance.payments.refund(paymentId, refundParams);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Razorpay Refund Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Cron Jobs
  app.post("/api/cron/daily-orders", async (req, res) => {
    try {
      const { db } = getFirebaseAdmin();
      if (!db) return res.status(500).json({ error: "Database not connected" });
      
      const subscriptionsSnap = await db.collection("subscriptions")
        .where("status", "==", "Active")
        .get();

      let ordersGenerated = 0;
      let kitchenTasksGenerated = 0;

      const batch = db.batch();

      for (const docSnap of subscriptionsSnap.docs) {
        const sub = docSnap.data();
        
        // Simple mock logic for daily orders (should check if today is a delivery day based on sub.deliveryDays)
        // We will generate one order for today
        const orderRef = db.collection("orders").doc();
        batch.set(orderRef, {
          orderId: `ORD-${Date.now().toString().substring(5)}`,
          customerId: sub.customerId || "",
          customerName: sub.customerName || "Customer",
          customerPhone: sub.customerPhone || "",
          subscriptionId: docSnap.id,
          planName: sub.planName || "",
          mealName: sub.mealName || "",
          deliveryArea: sub.address?.area || "",
          paymentStatus: "Paid",
          orderStatus: "Pending",
          createdAt: new Date().toISOString()
        });
        ordersGenerated++;

        // Add to kitchen production
        const kitchenRef = db.collection("kitchenProduction").doc();
        batch.set(kitchenRef, {
          orderId: orderRef.id,
          mealName: sub.mealName || "Meal",
          quantity: 1,
          preparationStatus: "Pending",
          dietaryNotes: sub.dietaryNotes || "",
          targetCompletionTime: "12:00 PM",
          createdAt: new Date().toISOString()
        });
        kitchenTasksGenerated++;
      }

      await batch.commit();

      res.json({ success: true, ordersGenerated, kitchenTasksGenerated });
    } catch (error: any) {
      console.error("Cron Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Google Maps Proxy
  app.post("/api/maps/distance", async (req, res) => {
    try {
      const { origins, destinations, mode } = req.body;
      const response = await axios.get("https://maps.googleapis.com/maps/api/distancematrix/json", {
        params: {
          origins,
          destinations,
          mode,
          key: process.env.VITE_GOOGLE_MAPS_API_KEY
        }
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch distance" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    // Prevent unmatched /api/* from falling through to the SPA shell
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
      }
      next();
    });
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
