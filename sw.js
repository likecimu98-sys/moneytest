const CACHE_NAME = 'tutor-app-v150-mobile-week-lab';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=95',
  './financeLogic.js?v=2',
  './app.js?v=106',
  './vendor/react.production.min.js',
  './vendor/react-dom.production.min.js',
  './vendor/fonts/unbounded-cyrillic.woff2',
  './vendor/fonts/unbounded-latin.woff2',
  './vendor/fonts/martian-mono-cyrillic.woff2',
  './vendor/fonts/martian-mono-latin.woff2',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => Promise.all(
    ASSETS.map(asset => c.add(asset).catch(() => null))
  )));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(response => {
      if (response && response.status === 200) {
        try {
          const url = new URL(e.request.url);
          if (url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
        } catch {}
      }
      return response;
    }).catch(() => caches.match(e.request))
  );
});
