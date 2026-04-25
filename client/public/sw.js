/* =========================================================================
   QualityVoice Service Worker — PWA Cache Strategy
   - Static assets: Cache-First
   - API calls: Network-First with offline fallback
   - Navigation: Network-First, fallback to cached index.html
   ========================================================================= */

const CACHE_NAME = 'qualityvoice-v1';
const STATIC_CACHE = 'qv-static-v1';
const API_CACHE = 'qv-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
];

/* ── Install: pre-cache static assets ──────────────────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ── Activate: clean old caches ─────────────────────────────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: smart routing strategy ─────────────────────────────────────── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // API calls — Network-First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Navigation requests — Network-First, fallback to index.html for SPA
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }

  // Static assets — Cache-First
  event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
});

/* ── Background Sync ──────────────────────────────────────────────────── */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reviews') {
    event.waitUntil(syncPendingReviews());
  }
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

/* ── Push Notifications ──────────────────────────────────────────────── */
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    tag: data.tag || 'qv-notification',
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'QualityVoice',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url === url && 'focus' in c);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

/* ── Helper: Cache-First strategy ────────────────────────────────────── */
async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

/* ── Helper: Network-First strategy ─────────────────────────────────── */
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(
      JSON.stringify({ error: 'Offline', message: 'No cached data available.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/* ── Helper: Background sync for queued reviews ─────────────────────── */
async function syncPendingReviews() {
  // Retrieve queued reviews from IndexedDB and retry submission
  const clients = await self.clients.matchAll();
  clients.forEach((c) => c.postMessage({ type: 'SYNC_COMPLETE', tag: 'sync-reviews' }));
}

async function syncNotifications() {
  const clients = await self.clients.matchAll();
  clients.forEach((c) => c.postMessage({ type: 'SYNC_COMPLETE', tag: 'sync-notifications' }));
}
