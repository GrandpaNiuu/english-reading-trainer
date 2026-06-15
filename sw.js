const CACHE_NAME = 'english-reading-trainer-v17-adaptive-count';
const APP_ASSETS = [
  './',
  './index.html',
  './css/style.css?v=adaptive-count-20260616',
  './css/mixed-questions.css?v=adaptive-count-20260616',
  './css/non-choice.css?v=adaptive-count-20260616',
  './css/polished-ui.css?v=adaptive-count-20260616',
  './css/study-tools.css?v=adaptive-count-20260616',
  './css/vocab-review.css?v=adaptive-count-20260616',
  './css/app-shell.css?v=adaptive-count-20260616',
  './css/customer-app-polish.css?v=adaptive-count-20260616',
  './css/customer-mobile-final.css?v=adaptive-count-20260616',
  './js/passages.js?v=adaptive-count-20260616',
  './js/manual-passages.js?v=adaptive-count-20260616',
  './js/generated-passages.js?v=adaptive-count-20260616',
  './js/curated-passages.js?v=adaptive-count-20260616',
  './js/activate-generated-bank.js?v=adaptive-count-20260616',
  './js/advanced-question-types.js?v=adaptive-count-20260616',
  './js/exam-question-types.js?v=adaptive-count-20260616',
  './js/non-choice-question-types.js?v=adaptive-count-20260616',
  './js/app.js?v=adaptive-count-20260616',
  './js/question-type-labels.js?v=adaptive-count-20260616',
  './js/non-choice-runtime.js?v=adaptive-count-20260616',
  './js/practice-mode-runtime.js?v=adaptive-count-20260616',
  './js/study-tools-runtime.js?v=adaptive-count-20260616',
  './js/vocab-review-runtime.js?v=adaptive-count-20260616',
  './js/question-count-runtime.js?v=adaptive-count-20260616',
  './js/app-shell-runtime.js?v=adaptive-count-20260616',
  './js/customer-facing-runtime.js?v=adaptive-count-20260616',
  './js/customer-stable-runtime.js?v=adaptive-count-20260616',
  './js/adaptive-question-count-runtime.js?v=adaptive-count-20260616',
  './manifest.json?v=adaptive-count-20260616',
  './icons/icon.svg?v=adaptive-count-20260616'
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
