import { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin } from '../lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = (req as any).headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const { app } = getFirebaseAdmin();
    if (!app) {
      return res.status(503).json({ error: 'Firebase Admin not configured' });
    }
    const decodedToken = await getAuth(app).verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { db } = getFirebaseAdmin();
    if (!db) return res.status(500).json({ error: 'Database error' });

    try {
      const adminDoc = await db.collection('admins').doc(req.user.uid).get();
      if (!adminDoc.exists) return res.status(403).json({ error: 'Forbidden: No role assigned' });
      
      const role = adminDoc.data()?.role;
      if (!allowedRoles.includes(role)) return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      
      next();
    } catch (error) {
      console.error('Authorization Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
