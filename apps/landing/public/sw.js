const CACHE_NAME = 'taazabites-cache-v6';

const CORE_SHELL_ASSETS = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Essential images to cache for offline access and rapid visual loading
const ESSENTIAL_IMAGES = [
  // Taazabites Logo
  'https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg',
  // Hero Background / Main Special Image
  'https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg',
  // Essential Subscription and Plan images
  'https://cdn.urbanpiper.com/media/bizmedia/2025/10/25/XQI0vGF-c0de1c2c-b08a-4bf6-94b7-7cb7547c811a.jpg',
  'https://cdn.urbanpiper.com/media/bizmedia/2025/09/09/5x3bE-3c79d21a-07b6-498b-81fa-649a1c953380.jpg',
  'https://cdn.urbanpiper.com/media/bizmedia/2025/11/04/FzHllQL-b5013e53-f312-455d-9ef5-7c51f71950e2.jpg',
  'https://cdn.urbanpiper.com/media/bizmedia/2025/09/03/HYC3ipj-ea1cb459-9f06-4842-9f10-c36beef7395f.jpg',
  'https://cdn.urbanpiper.com/media/bizmedia/2025/09/03/s9ZRSy5-f46b9d1a-8aca-471a-ae55-11652376cce1.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching core application manifest and icons');
        return cache.addAll(CORE_SHELL_ASSETS)
          .then(() => {
            console.log('[Service Worker] Core assets pre-cached. Caching essential CDN images gracefully...');
            
            // Cache essential remote images individually.
            // Using a mapped array of promises with catch blocks ensures that a failure/timeout/CORS block 
            // of any single CDN image does not block the entire service worker install lifecycle.
            const cdnPromises = ESSENTIAL_IMAGES.map(url => {
              return fetch(url, { mode: 'no-cors' })
                .then(response => {
                  return cache.put(url, response);
                })
                .catch(err => {
                  console.warn(`[Service Worker] Gracefully skipped pre-caching image ${url} on install:`, err);
                });
            });
            return Promise.all(cdnPromises);
          });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Deleting obsolete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and non-http protocols
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Skip tracking scripts, web analytics, firestore, and dev/socket connections
  if (
    url.hostname.includes('firestore') || 
    url.hostname.includes('firebase') || 
    url.hostname.includes('google-analytics') || 
    url.hostname.includes('facebook') || 
    url.pathname.includes('socket.io') || 
    url.pathname.includes('vite')
  ) {
    return;
  }

  // 1. NAVIGATION / HTML requests: Network-Only Strategy
  // We bypass the Service Worker cache for the main page navigation/HTML requests.
  // This ensures the browser always handles domain redirects (e.g., taazabites.in -> www.taazabites.in)
  // correctly, shows the updated URL in the address bar, and loads the absolute latest compiled
  // index.html pointing to the correct hashed CSS/JS files, avoiding any stale asset loading issues.
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    return; // Let the browser handle it directly via the network
  }

  // 2. STATIC ASSETS & FONTS (Hashed/immutable CSS/JS, Google Fonts)
  const isStaticAsset = url.pathname.includes('/assets/') || 
                        url.pathname.endsWith('.js') || 
                        url.pathname.endsWith('.css') || 
                        url.pathname.endsWith('.json') ||
                        url.hostname.includes('fonts.googleapis.com') || 
                        url.hostname.includes('fonts.gstatic.com');

  // 3. IMAGES (Local icons and CDN images)
  const isImage = url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i) || 
                  url.hostname.includes('cdn.urbanpiper.com');

  if (isStaticAsset || isImage) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then(cachedResponse => {
        // If it's in the cache, serve it immediately
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch it from network, cache it, and return
        return fetch(request).then(networkResponse => {
          if (networkResponse.status === 200 || networkResponse.type === 'opaque') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(err => {
          console.warn('[Service Worker] Network fetch failed for static asset/image:', url.pathname, err);
        });
      })
    );
    return;
  }

  // 4. DEFAULT: Network-First strategy for general requests
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
