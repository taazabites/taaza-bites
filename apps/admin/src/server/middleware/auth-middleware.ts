import { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin } from '../lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { timingSafeEqual } from 'crypto';
import { normalizeRole } from '../../lib/rbac';

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
    if ((req.user as { cron?: boolean }).cron) return next();

    const { db } = getFirebaseAdmin();
    if (!db) return res.status(500).json({ error: 'Database error' });

    try {
      const adminDoc = await db.collection('admins').doc(req.user.uid).get();
      if (!adminDoc.exists) return res.status(403).json({ error: 'Forbidden: No role assigned' });

      const role = normalizeRole(adminDoc.data()?.role);
      if (role === 'Super Admin' || allowedRoles.includes(role) || allowedRoles.includes(adminDoc.data()?.role)) {
        return next();
      }

      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    } catch (error) {
      console.error('Authorization Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

function secretsMatch(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Cloud Scheduler / internal jobs: X-Cron-Secret, otherwise a signed-in Super Admin/Admin. */
export const authenticateCron = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const expected = String(process.env.CRON_SECRET || process.env.CRON_KEY || '');
  const provided = String(req.headers['x-cron-secret'] || req.query.secret || '');
  if (expected && provided && secretsMatch(provided, expected)) {
    req.user = { uid: 'cron', cron: true };
    return next();
  }
  return authenticate(req, res, (err?: unknown) => {
    if (err) return;
    return authorize(['Super Admin', 'Admin'])(req, res, next);
  });
};
