/* NameForge offline resilience and repeat-visit asset cache.
 * Hashed Vite assets are immutable by filename; HTML always revalidates first.
 */
const STATIC_CACHE = 'nameforge-static-v1';
const PAGE_CACHE = 'nameforge-pages-v1';
const HASHED_ASSET = /\/assets\/.+-[a-z0-9_-]{8,}\.(?:js|css|woff2?|png|jpe?g|webp|svg)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => (key.startsWith('nameforge-static-') && key !== STATIC_CACHE)
        || (key.startsWith('nameforge-pages-') && key !== PAGE_CACHE))
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML is network-first so deployments and translated metadata are not pinned
  // behind an old cached document. The last successful page is the offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(PAGE_CACHE);
      try {
        const response = await fetch(request);
        if (response.ok && response.type === 'basic') {
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (await cache.match(request)) || Response.error();
      }
    })());
    return;
  }

  // Vite content-hashed assets are safe to cache-first: a changed file receives
  // a new URL, while the document itself is always refreshed from the network.
  if (HASHED_ASSET.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone());
      }
      return response;
    })());
  }
});
