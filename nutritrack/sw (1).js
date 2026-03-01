// NutriTrack Service Worker — network-first for HTML, cache-first for assets
const CACHE = 'nutritrack-v3';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Always network-first for HTML — ensures updates show immediately
  if (e.request.destination === 'document' || url.endsWith('.html') || url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Always network for API calls
  if (url.includes('api.nal.usda.gov') || url.includes('supabase.co')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Cache-first for fonts and static assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});
