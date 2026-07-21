/* easy memory item — offline service worker.
 * The app is the design-compiler runtime (support.js) rendering index.html,
 * with React/ReactDOM/Babel and the Inter font vendored locally so nothing is
 * fetched from a CDN. We precache the whole app shell and serve cache-first,
 * which makes the installed PWA fully offline-capable from the first launch.
 * Bump CACHE_VERSION whenever any precached file changes to force a refresh.
 */
const CACHE_VERSION = 'emi-v2';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './support.js',
  './ios-frame.jsx',
  './vendor/react.production.min.js',
  './vendor/react-dom.production.min.js',
  './vendor/babel.min.js',
  './vendor/inter.css',
  './vendor/fonts/inter-0.woff2',
  './vendor/fonts/inter-1.woff2',
  './vendor/fonts/inter-2.woff2',
  './vendor/fonts/inter-3.woff2',
  './vendor/fonts/inter-4.woff2',
  './vendor/fonts/inter-5.woff2',
  './vendor/fonts/inter-6.woff2',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  // Precache the shell, but do NOT skipWaiting here: the new worker stays in
  // the "waiting" state so the page can surface an "Update available" prompt.
  // The user accepts by triggering SKIP_WAITING (see the message handler below).
  // On a first-ever install there is no active worker to wait behind, so this
  // one activates immediately — offline support still works from launch one.
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
  );
});

// The page posts this when the user accepts an update, letting the freshly
// installed worker take over on the next navigation / reload.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle same-origin requests; let anything cross-origin pass through.
  if (url.origin !== self.location.origin) return;

  // Navigation requests: serve the cached app shell so the app opens offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => cached || fetch(req))
    );
    return;
  }

  // Everything else: cache-first, then network (and cache what we fetch).
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
