// AI Station — Service Worker
// Caches the marketing shell for offline access; never caches API calls.

const CACHE_NAME = 'ai-station-v1';
const SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Never intercept API or cross-origin requests
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) return;

  // Cache-first for shell assets
  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
