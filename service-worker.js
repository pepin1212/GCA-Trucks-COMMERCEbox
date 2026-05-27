// DAF-Trucks CommerceBox — Service Worker — Cache hors-ligne
// Incrémenter CACHE à chaque release terrain pour forcer la mise à jour.
const CACHE = 'daf-commercebox-v2-corrige-2026-bases-v16';

function bustUrl(url) {
  if (!url || url.indexOf('http') !== 0) return url;
  var base = url.split('?')[0].split('#')[0];
  return base + '?cb=' + encodeURIComponent(CACHE);
}

function isAppShell(url) {
  if (!url || url.indexOf('http') !== 0) return false;
  var path = url.split('?')[0].split('#')[0];
  return /\/index\.html$/.test(path) || /\/service-worker\.js$/.test(path) || /\/$/.test(path);
}

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return fetch(bustUrl(self.location.origin + self.location.pathname.replace(/service-worker\.js.*$/, 'index.html')), { cache: 'no-store' })
        .then(function(resp) {
          if (resp && resp.status === 200) return cache.put('./index.html', resp);
        })
        .catch(function() {});
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) {
        return caches.delete(k);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var req = e.request;

  if (isAppShell(req.url)) {
    e.respondWith(
      fetch(bustUrl(req.url), { cache: 'no-store' }).then(function(resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(req.url.split('?')[0], clone);
          });
        }
        return resp;
      }).catch(function() {
        return caches.match(req.url.split('?')[0]).then(function(cached) {
          return cached || caches.match('./index.html') || new Response('Hors-ligne — DAF-Trucks CommerceBox', { status: 503 });
        });
      })
    );
    return;
  }

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
