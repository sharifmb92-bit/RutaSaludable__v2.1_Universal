const CACHE_NAME = 'ruta80-v2-1-0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Instalación del Service Worker de forma segura
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Usamos Promise.allSettled para que no aborte la instalación si falla un recurso
      await Promise.allSettled(
        ASSETS.map(asset => cache.add(asset).catch(err => console.warn('Error en caché:', asset)))
      );
    })
  );
  self.skipWaiting();
});

// Activación y limpieza de versiones antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia: Buscar en caché, si no está pedir a la red
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
