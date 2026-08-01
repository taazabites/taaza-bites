import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(readFileSync(configPath, 'utf-8'));

// Ensure the environment project ID matches the config
process.env.GOOGLE_CLOUD_PROJECT = config.projectId;
process.env.GCLOUD_PROJECT = config.projectId;

const apps = getApps();
const app = !apps.length 
  ? initializeApp({
      credential: applicationDefault(),
      projectId: config.projectId,
      databaseURL: `https://${config.projectId}.firebaseio.com`
    })
  : apps[0];

// Use the project ID from the app instance
const actualProjectId = (app as any).options?.projectId || process.env.GOOGLE_CLOUD_PROJECT || config.projectId;

const dbId = config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)" 
  ? config.firestoreDatabaseId 
  : undefined;

export const adminDb = getFirestore(app, dbId);
export const adminAuth = getAuth(app);
export { actualProjectId };
export default app;
