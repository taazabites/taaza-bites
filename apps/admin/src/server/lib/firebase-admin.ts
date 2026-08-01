import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';

export const FIRESTORE_DB_IDS = {
  admin:
    firebaseConfig.firestoreDatabaseId ||
    'ai-studio-taazabitesadmint-f2702470-dbd9-4fd8-8d80-708eb0bdb4c2',
  customer: 'ai-studio-taazabitessubscr-4d42449d-94e2-49b8-84ea-c7c481d0d5f9',
  delivery: 'ai-studio-taazabitespartne-31c9d739-6454-4c89-9e41-a585d0e10788',
} as const;

let app: App | null = null;
const dbCache = new Map<string, Firestore>();

function readPrivateKey(): string | null {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) return null;
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  return privateKey.replace(/\\n/g, '\n');
}

/** Soft init — returns nulls when service-account env is missing (local UI still runs). */
export const getFirebaseAdmin = (): { app: App | null; db: Firestore | null } => {
  if (app) {
    return { app, db: getNamedDb(FIRESTORE_DB_IDS.admin) };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = readPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    return { app: null, db: null };
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } else {
      app = getApps()[0]!;
    }
    return { app, db: getNamedDb(FIRESTORE_DB_IDS.admin) };
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return { app: null, db: null };
  }
};

export function getNamedDb(databaseId: string): Firestore | null {
  const { app: adminApp } = getFirebaseAdmin();
  if (!adminApp) return null;
  if (dbCache.has(databaseId)) return dbCache.get(databaseId)!;
  const db = getFirestore(adminApp, databaseId);
  dbCache.set(databaseId, db);
  return db;
}
