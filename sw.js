const CACHE_NAME = 'english-reading-trainer-v25-stable-app';
const APP_ASSETS = [
  './',
  './index.html',
  './css/style.css?v=stable-app-20260616',
  './css/mixed-questions.css?v=stable-app-20260616',
  './css/non-choice.css?v=stable-app-20260616',
  './css/polished-ui.css?v=stable-app-20260616',
  './css/study-tools.css?v=stable-app-20260616',
  './css/vocab-review.css?v=stable-app-20260616',
  './css/app-shell.css?v=stable-app-20260616',
  './css/customer-app-polish.css?v=stable-app-20260616',
  './css/customer-mobile-final.css?v=stable-app-20260616',
  './css/virtual-category-bank.css?v=stable-app-20260616',
  './css/topic-mobile-authoritative.css?v=stable-app-20260616',
  './js/passages.js?v=stable-app-20260616',
  './js/manual-passages.js?v=stable-app-20260616',
  './js/curated-passages.js?v=stable-app-20260616',
  './js/stable-app.js?v=stable-app-20260616',
  './manifest.json?v=stable-app-20260616',
  './icons/icon.svg?v=stable-app-20260616'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
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
    fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
