// DAF-Trucks CommerceBox — Service Worker — Cache hors-ligne
const CACHE = 'daf-commercebox-v1';
const ASSETS = [
  './',
  './index.html',
  './xlsx.full.min.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // xlsx.full.min.js peut être lourd : on l'exclut du précache initial
      return cache.addAll(ASSETS.filter(a => a !== './xlsx.full.min.js'))
        .catch(() => cache.addAll(['./index.html']));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached || new Response('Hors-ligne — DAF-Trucks CommerceBox'));
    })
  );
});
