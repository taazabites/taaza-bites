import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer, Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

/** Named Firestore DBs used by sibling apps (same Auth project) */
export const FIRESTORE_DB_IDS = {
  customer:
    firebaseConfig.firestoreDatabaseId ||
    'ai-studio-taazabitessubscr-4d42449d-94e2-49b8-84ea-c7c481d0d5f9',
  admin: 'ai-studio-taazabitesadmint-f2702470-dbd9-4fd8-8d80-708eb0bdb4c2',
  delivery: 'ai-studio-taazabitespartne-31c9d739-6454-4c89-9e41-a585d0e10788',
} as const;

const hasValidKey = Boolean(firebaseConfig?.apiKey?.trim());

const clientConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  measurementId: firebaseConfig.measurementId || undefined,
};

let app: FirebaseApp | null = null;
/** Default DB = customer (landing profile / subscribe data) */
export let db: Firestore | null = null;
export let adminDb: Firestore | null = null;
export let deliveryDb: Firestore | null = null;
export let auth: Auth | null = null;

function initNamedDb(firebaseApp: FirebaseApp, databaseId: string): Firestore {
  try {
    return initializeFirestore(
      firebaseApp,
      {
        experimentalForceLongPolling: true,
        useFetchStreams: false,
      } as any,
      databaseId
    );
  } catch {
    // Already initialized for this databaseId
    return getFirestore(firebaseApp, databaseId);
  }
}

if (hasValidKey) {
  try {
    app = getApps().length ? getApps()[0]! : initializeApp(clientConfig);
    db = initNamedDb(app, FIRESTORE_DB_IDS.customer);
    adminDb = initNamedDb(app, FIRESTORE_DB_IDS.admin);
    deliveryDb = initNamedDb(app, FIRESTORE_DB_IDS.delivery);
    auth = getAuth(app);
  } catch (error) {
    console.warn('Failed to initialize Firebase with configured credentials:', error);
  }
} else {
  console.log('No Firebase API Key configured. Running in secure local sandbox mode.');
}

async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

if (import.meta.env.DEV) {
  testConnection();
}

export { app };
