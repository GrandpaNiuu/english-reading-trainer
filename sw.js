const CACHE_NAME = 'english-reading-trainer-v12-selfcheck-balanced';
const APP_ASSETS = [
  './',
  './index.html',
  './css/style.css?v=selfcheck-20260616',
  './css/mixed-questions.css?v=selfcheck-20260616',
  './css/non-choice.css?v=selfcheck-20260616',
  './css/polished-ui.css?v=selfcheck-20260616',
  './js/passages.js?v=selfcheck-20260616',
  './js/manual-passages.js?v=selfcheck-20260616',
  './js/generated-passages.js?v=selfcheck-20260616',
  './js/curated-passages.js?v=selfcheck-20260616',
  './js/activate-generated-bank.js?v=selfcheck-20260616',
  './js/advanced-question-types.js?v=selfcheck-20260616',
  './js/exam-question-types.js?v=selfcheck-20260616',
  './js/non-choice-question-types.js?v=selfcheck-20260616',
  './js/app.js?v=selfcheck-20260616',
  './js/question-type-labels.js?v=selfcheck-20260616',
  './js/non-choice-runtime.js?v=selfcheck-20260616',
  './js/practice-mode-runtime.js?v=selfcheck-20260616',
  './manifest.json?v=selfcheck-20260616',
  './icons/icon.svg?v=selfcheck-20260616'
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
