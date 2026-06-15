const CACHE_NAME = 'english-reading-trainer-v11-exam-ui';
const APP_ASSETS = [
  './',
  './index.html',
  './css/style.css?v=exam-ui-20260616',
  './css/mixed-questions.css?v=exam-ui-20260616',
  './css/non-choice.css?v=exam-ui-20260616',
  './css/polished-ui.css?v=exam-ui-20260616',
  './js/passages.js?v=exam-ui-20260616',
  './js/manual-passages.js?v=exam-ui-20260616',
  './js/generated-passages.js?v=exam-ui-20260616',
  './js/curated-passages.js?v=exam-ui-20260616',
  './js/activate-generated-bank.js?v=exam-ui-20260616',
  './js/advanced-question-types.js?v=exam-ui-20260616',
  './js/exam-question-types.js?v=exam-ui-20260616',
  './js/non-choice-question-types.js?v=exam-ui-20260616',
  './js/app.js?v=exam-ui-20260616',
  './js/question-type-labels.js?v=exam-ui-20260616',
  './js/non-choice-runtime.js?v=exam-ui-20260616',
  './manifest.json?v=exam-ui-20260616',
  './icons/icon.svg?v=exam-ui-20260616'
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
