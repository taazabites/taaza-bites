import { Router } from 'express';
import { getFirebaseAdmin } from '../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const router = Router();

router.post("/", async (req, res) => {
  console.log("Gupshup Webhook received:", JSON.stringify(req.body, null, 2));
  const { db } = getFirebaseAdmin();
  
  if (!db) {
    return res.status(500).json({ error: "Firebase Admin not initialized" });
  }

  try {
    const payload = req.body;
    const { type, payload: eventPayload } = payload;
    
    // Store log in Firestore
    await db.collection("gupshupWebhooks").add({
      type,
      payload: eventPayload,
      receivedAt: FieldValue.serverTimestamp()
    });

    if (type === 'message' && eventPayload?.type === 'text') {
      const phone = eventPayload.sender?.phone || eventPayload.source;
      const text = eventPayload.payload?.text;
      const name = eventPayload.sender?.name || phone;
      
      if (phone && text) {
        const convRef = db.collection("conversations").doc(phone);
        const convDoc = await convRef.get();
        
        if (!convDoc.exists) {
          await convRef.set({
            phone,
            name,
            channel: 'gupshup',
            status: 'online',
            lastMessage: text,
            unreadCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else {
          await convRef.update({
            lastMessage: text,
            unreadCount: FieldValue.increment(1),
            updatedAt: new Date().toISOString(),
            status: 'online',
            name: name // Update name if it changed
          });
        }

        // Add message
        await convRef.collection("messages").add({
          text,
          sender: 'customer',
          status: 'received',
          createdAt: new Date().toISOString(),
          gupshupMessageId: eventPayload.id
        });
      }
    } else if (type === 'message-event') {
        // Handle delivery receipts if needed
        // eventPayload.type can be 'enqueued', 'failed', 'sent', 'delivered', 'read'
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Gupshup Webhook error:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

export default router;
