import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {HelmetProvider} from 'react-helmet-async';
import App from './App.tsx';
import {AuthProvider} from './context/AuthContext';
import {ToastProvider} from './context/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary.tsx';
import './index.css';
import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";

// ----------------------------------------------------------------------
// 1. Intelligent Chunk Loading Failure & Retry Handler
// ----------------------------------------------------------------------
const MAX_CHUNK_RETRIES = 3;
const CHUNK_RETRY_KEY = 'taazabites_chunk_retry_state';

interface ChunkRetryState {
  count: number;
  lastAttempt: number;
}

const getChunkRetryState = (): ChunkRetryState => {
  try {
    const raw = sessionStorage.getItem(CHUNK_RETRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Reset counter if last attempt was over 1 minute ago
      if (Date.now() - parsed.lastAttempt > 60000) {
        return { count: 0, lastAttempt: Date.now() };
      }
      return parsed;
    }
  } catch {
    // Fallback if sessionStorage is inaccessible
  }
  return { count: 0, lastAttempt: Date.now() };
};

const handleChunkError = (errorMsg?: string) => {
  const state = getChunkRetryState();
  if (state.count < MAX_CHUNK_RETRIES) {
    const newState: ChunkRetryState = {
      count: state.count + 1,
      lastAttempt: Date.now(),
    };
    try {
      sessionStorage.setItem(CHUNK_RETRY_KEY, JSON.stringify(newState));
    } catch {
      // Ignore storage errors
    }
    console.warn(`[ChunkLoader] Dynamic module import failed (${errorMsg || 'unknown'}). Intelligent retry attempt ${newState.count}/${MAX_CHUNK_RETRIES}...`);
    
    // Clear stale web caches if supported before performing recovery reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        return Promise.all(names.map((name) => caches.delete(name)));
      }).catch(() => {}).finally(() => {
        window.location.reload();
      });
    } else {
      (window as any).location.reload();
    }
  } else {
    console.error(`[ChunkLoader] Maximum retries (${MAX_CHUNK_RETRIES}) reached for chunk loading failure. Please check network connection.`);
    // Reset state so future navigation attempts are not permanently blocked
    sessionStorage.removeItem(CHUNK_RETRY_KEY);
  }
};

// Listen for Vite dynamic import preload errors
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  handleChunkError('vite:preloadError');
});

// Listen for global unhandled promise rejections from dynamic import() failures
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || String(event.reason || '');
  if (
    reason.includes('Failed to fetch dynamically imported module') ||
    reason.includes('Loading chunk') ||
    reason.includes('error loading dynamically imported module') ||
    reason.includes('Importing a module script failed')
  ) {
    event.preventDefault();
    handleChunkError(reason);
  }
});

// ----------------------------------------------------------------------
// 2. Custom Preload Strategy for Critical Assets & Secondary Routes
// ----------------------------------------------------------------------
const preloadCriticalAssets = () => {
  // Preconnect to critical domains
  const preconnectDomains = [
    'https://images.unsplash.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];

  preconnectDomains.forEach((domain) => {
    if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });

  // Preload critical hero imagery for faster LCP
  const criticalImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=70&w=1200&fm=webp',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=70&w=800&fm=webp'
  ];

  criticalImages.forEach((src) => {
    if (!document.querySelector(`link[rel="preload"][href="${src}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }
  });

  // Idle preload of critical page modules during browser idle time
  const requestIdle = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 2000));
  requestIdle(() => {
    import('./pages/LandingPage').catch(() => {});
    import('./pages/Plans').catch(() => {});
  });
};

// Trigger asset preloading strategy
preloadCriticalAssets();

// Clean up retry tracker when app reloads successfully
try {
  const state = getChunkRetryState();
  if (state.count > 0 && Date.now() - state.lastAttempt > 5000) {
    sessionStorage.removeItem(CHUNK_RETRY_KEY);
  }
} catch {
  // Ignore storage errors
}

// Filter out specific noisy console errors
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = args.map(a => typeof a === 'string' ? a : String(a)).join(' ');
  if (
    msg.includes('Detected an update time that is in the future') ||
    msg.includes('@firebase/analytics') ||
    msg.includes('fetchPriority') ||
    msg.includes('fetchpriority')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Initialize Vercel Analytics and Speed Insights
inject();
injectSpeedInsights();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <BrowserRouter basename="/app">
              <App />
            </BrowserRouter>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
);

// Register service worker for offline support and PWA benefits only in production
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Service Worker registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
  });
} else if (!import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Actively unregister service workers in development to clear stale caches/interceptors
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((success) => {
        if (success) {
          console.log('Successfully unregistered service worker in development mode.');
        }
      });
    }
  });
}

