const V = 'slablab-v0.6';

const FILES = [
  './',
  'index.html',
  'app.js',
  'engine.js',
  'engine2.js',
  'style.css',

  'manifest.json',
  'manifest.webmanifest',

  'icon-192.png',
  'icon-512.png',

  'fonts/Poppins-Regular.ttf',
  'fonts/Poppins-Medium.ttf',
  'fonts/Poppins-Bold.ttf',

  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png'
];

// Install: cache the application files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(V)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('SlabLab cache installation failed:', error);
        throw error;
      })
  );
});

// Activate: remove old application caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith('slablab-') && key !== V)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: serve cached files when offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);

  // Do not intercept requests to other websites
  if (requestURL.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not cached, try the network
        return fetch(event.request);
      })
      .catch(() => {
        // Provide the cached app page when navigation fails offline
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }

        return new Response('You are offline and this file is not cached.', {
          status: 503,
          statusText: 'Offline'
        });
      })
  );
});
