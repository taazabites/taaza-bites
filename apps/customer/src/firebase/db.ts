import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { app, auth } from './core';
import config from '../../firebase-applet-config.json';

const dbId = !config.firestoreDatabaseId || config.firestoreDatabaseId === "(default)"
  ? undefined
  : config.firestoreDatabaseId;

export const db = getFirestore(app, dbId);

export async function testFirestoreConnection() {
  try {
    // Attempt to fetch a non-existent doc from a known collection to test connection
    await getDocFromServer(doc(db, '_health_check', 'ping'));
    console.log("Firestore connection test: SUCCESS (Reachable)");
  } catch (error: any) {
    console.error("Firestore connection test: FAILED", error);
    if (error?.message?.includes('the client is offline')) {
      console.error("Please check your Firebase configuration and databaseId.");
    }
  }
}

// Optional: Auto-test on load if in development
if (import.meta.env.DEV) {
  testFirestoreConnection();
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};


