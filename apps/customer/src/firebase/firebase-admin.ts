import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

type AppletConfig = {
  projectId?: string;
  firestoreDatabaseId?: string;
};

function loadAppletConfig(): AppletConfig | null {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (!existsSync(configPath)) return null;
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8')) as AppletConfig;
  } catch {
    return null;
  }
}

function runtimeProjectId(config: AppletConfig | null): string | undefined {
  if (config?.projectId) return config.projectId;
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
  if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT;
  if (process.env.FIREBASE_CONFIG) {
    try {
      return JSON.parse(process.env.FIREBASE_CONFIG).projectId;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function namedDatabaseId(config: AppletConfig | null): string | undefined {
  const value = config?.firestoreDatabaseId || process.env.FIRESTORE_DATABASE_ID;
  if (!value || value === '(default)') return undefined;
  return value;
}

const config = loadAppletConfig();
const projectId = runtimeProjectId(config);

if (projectId) {
  process.env.GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || projectId;
  process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || projectId;
}

const apps = getApps();
const app = !apps.length
  ? initializeApp({
      credential: applicationDefault(),
      ...(projectId
        ? { projectId, databaseURL: `https://${projectId}.firebaseio.com` }
        : {}),
    })
  : apps[0];

const actualProjectId =
  (app as any).options?.projectId || projectId || process.env.GOOGLE_CLOUD_PROJECT;

const dbId = namedDatabaseId(config);

export const adminDb = dbId ? getFirestore(app, dbId) : getFirestore(app);
export const adminAuth = getAuth(app);
export { actualProjectId };
export default app;
