const CACHE_NAME = 'english-reading-trainer-v5-10500';
const APP_ASSETS = [
  './',
  './index.html',
  './css/style.css?v=10500-20260616',
  './js/passages.js?v=10500-20260616',
  './js/generated-passages.js?v=10500-20260616',
  './js/curated-passages.js?v=10500-20260616',
  './js/activate-generated-bank.js?v=10500-20260616',
  './js/app.js?v=10500-20260616',
  './manifest.json?v=10500-20260616',
  './icons/icon.svg?v=10500-20260616'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
