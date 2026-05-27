// DAF-Trucks CommerceBox — Service Worker — Cache hors-ligne
// Incrémenter CACHE à chaque release terrain pour forcer la mise à jour.
const CACHE = 'daf-commercebox-v2-corrige-2026-bases-fix';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

function isAppShell(url) {
  if (!url || url.indexOf('http') !== 0) return false;
  var path = url.split('?')[0].split('#')[0];
  return /\/index\.html$/.test(path) || /\/service-worker\.js$/.test(path) || /\/$/.test(path);
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS).catch(function() {
        return cache.addAll(['./index.html']);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) {
        return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  var req = e.request;

  // index.html + service-worker : réseau d'abord → évite de rester bloqué sur une vieille version
  if (isAppShell(req.url)) {
    e.respondWith(
      fetch(req).then(function(resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(cache) { cache.put(req, clone); });
        }
        return resp;
      }).catch(function() {
        return caches.match(req).then(function(cached) {
          return cached || new Response('Hors-ligne — DAF-Trucks CommerceBox', { status: 503 });
        });
      })
    );
    return;
  }

  // Autres assets : cache d'abord, puis réseau (hors-ligne)
  e.respondWith(
    caches.match(req).then(function(cached) {
      if (cached) return cached;
      return fetch(req).then(function(resp) {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          var clone = resp.clone();
          caches.open(CACHE).then(function(cache) { cache.put(req, clone); });
        }
        return resp;
      }).catch(function() {
        return new Response('Hors-ligne — DAF-Trucks CommerceBox', { status: 503 });
      });
    })
  );
});
