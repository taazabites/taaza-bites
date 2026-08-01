import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || config.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || config.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || config.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || config.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || config.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || config.appId
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Analytics & Performance for production monitoring
export const analytics = typeof window !== 'undefined' ? (async () => {
  try {
    if (await isAnalyticsSupported()) {
      return getAnalytics(app);
    }
  } catch (err) {
    // Analytics failed to fetch or unsupported in current environment
  }
  return null;
})() : null;

export const performance = typeof window !== 'undefined' ? getPerformance(app) : null;

export default app;
