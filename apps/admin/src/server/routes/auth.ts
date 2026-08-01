import { Router } from 'express';
import { getFirebaseAdmin } from '../lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

const router = Router();

router.post('/verify-token', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'ID Token is required' });
    }
    
    const { app } = getFirebaseAdmin();
    if (!app) {
      return res.status(503).json({ error: 'Firebase Admin not configured' });
    }
    const decodedToken = await getAuth(app).verifyIdToken(idToken);
    
    res.json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

export default router;
