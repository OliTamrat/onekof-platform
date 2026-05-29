const CACHE_NAME = 'onekof-v3';
const STATIC_ASSETS = [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests — skip external URLs entirely
  // This prevents CSP connect-src violations for Google Fonts, Cloudflare, etc.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip non-GET requests and API calls
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Cache-first for static assets (fonts, images)
  if (
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(woff2?|ttf|png|jpg|svg|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }))
    );
    return;
  }

  // Network-first for pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && url.pathname.startsWith('/dashboard')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        // Return cached version if available, otherwise a plain 503.
        // Never return undefined — event.respondWith(undefined) throws TypeError
        // and kills all subsequent fetch events on the page.
        const cached = await caches.match(request);
        return cached || new Response('', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});
