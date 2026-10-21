/* ============================================================
   ODEA — Service Worker
   Estrategia:
   - Navegacion (HTML): network-first -> si no hay red, cache.
   - Assets estaticos: cache-first, y guarda lo nuevo al vuelo.
   - Cada vez que publicamos una version nueva, cambiamos
     CACHE_VERSION y la app del celular se auto-actualiza.
   ============================================================ */
const CACHE_VERSION = 'odea-v5.69-20261020-radar-senales';
const CACHE = 'odea-' + CACHE_VERSION;
const SHELL = [
  './',
  './odea.html',
  './index.html',
  './manifest.json',
  './assets/odea-ui-v7.css?v=8m',
  './assets/odea-icons-v7.js?v=8f',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './assets/avatar.webp',
  './assets/fronts/cap.webp',
  './assets/fronts/eng.webp',
  './assets/fronts/ai.webp',
  './assets/gods/cronos.webp',
  './assets/gods/atenea.webp',
  './assets/gods/hermes.webp',
  './assets/gods/hestia.webp',
  './assets/gods/pluto.webp',
  './assets/gods/zeus.webp',
  './assets/titans/hades.webp',
  './assets/titans/apolo.webp',
  './assets/titans/prometeo.webp',
  './assets/worlds/camp.webp',
  './assets/worlds/torre.webp',
  './assets/worlds/aldea.webp',
  './assets/worlds/boveda.webp',
  './assets/worlds/b2b.webp',
  './assets/worlds/sagas.svg',
  './assets/bg/cyber-city.webp',
  './assets/bg/odea-homeworld.webp',
  './assets/focus.webp'
];

self.addEventListener('install', (e) => {
  // addAll es atomico: si UN solo recurso falla, no se instala nada.
  // Precargamos uno por uno para que un asset caido no rompa el offline.
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((url) =>
        c.add(url).catch((err) => console.warn('SW: no se pudo precachear', url, err))
      )))
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
    }).catch(() => new Response('', { status: 504, statusText: 'Offline' }))
  );
});
