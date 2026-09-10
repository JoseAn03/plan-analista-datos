/* ============================================================
   ODEA — Service Worker
   Estrategia:
   - Navegacion (HTML): network-first -> si no hay red, cache.
   - Assets estaticos: cache-first, y guarda lo nuevo al vuelo.
   - Cada vez que publicamos una version nueva, cambiamos
     CACHE_VERSION y la app del celular se auto-actualiza.
   ============================================================ */
const CACHE_VERSION = 'odea-v6.1-202609091910';
const CACHE = 'odea-' + CACHE_VERSION;
const SHELL = [
  './',
  './odea.html',
  './index.html',
  './quiz.html',
  './quiz-definitivo.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Fuentes de Google etc.: comportamiento normal de red
  if (url.origin !== location.origin) return;

  // Navegacion a HTML: primero red (siempre version fresca), cache como respaldo
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((m) => m || caches.match('./odea.html'))
        )
    );
    return;
  }

  // Estaticos: cache-first + guardado al vuelo
  e.respondWith(
    caches.match(req).then((m) => {
      if (m) return m;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    }).catch(() => caches.match('./odea.html'))
  );
});
