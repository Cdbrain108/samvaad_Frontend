/**
 * Samvaad service worker.
 *
 * Deliberately conservative:
 *  - Navigations are network-first, so a deploy is picked up immediately and
 *    the no-cache headers in index.html keep meaning what they say. The cache
 *    is only a fallback for when the device is genuinely offline.
 *  - Hashed build assets are cache-first: the hash in the filename makes them
 *    immutable, so a cache hit is always correct.
 *  - Everything else (API calls, TTS audio from the voice server, Firebase)
 *    passes straight through and is never cached.
 */

const VERSION = 'v1';
const SHELL_CACHE = `samvaad-shell-${VERSION}`;
const ASSET_CACHE = `samvaad-assets-${VERSION}`;

// Resolved against the worker's own scope so this survives subpath hosting —
// GitHub Pages serves the app from /<repo>/, not from /.
const SHELL_URL = new URL('index.html', self.registration.scope).pathname;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll([SHELL_URL]))
      .catch(() => {}) // a failed precache must not block activation
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Matches the hashed filenames produced by vite.config.js's rollupOptions.
const isHashedAsset = (url) =>
  /\/assets\/.+-v3-[A-Za-z0-9_-]+\.(?:js|css|woff2?|png|jpe?g|svg|webp)$/.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept other origins (voice server, Firebase, CDNs) or the API —
  // those responses are large, one-shot, and must not be served stale.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches
            .open(SHELL_CACHE)
            .then((cache) => cache.put(SHELL_URL, copy))
            .catch(() => {});
          return response;
        })
        .catch(() => caches.match(SHELL_URL).then((cached) => cached || Response.error()))
    );
    return;
  }

  if (isHashedAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches
                .open(ASSET_CACHE)
                .then((cache) => cache.put(request, copy))
                .catch(() => {});
            }
            return response;
          })
      )
    );
  }
});
