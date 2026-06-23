const CACHE_NAME = 'ladies-work-v1';
const urlsToCache = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => new Response(JSON.stringify({ success: false, message: 'Offline', offline: true }), { headers: { 'Content-Type': 'application/json' } }))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request).then((fetchRes) => {
      const resClone = fetchRes.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
      return fetchRes;
    }).catch(() => caches.match('/index.html')))
  );
});
