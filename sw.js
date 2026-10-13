const V = 'slablab-v0.7';

const CORE_FILES = [
  './',
  './index.html',
  './app.js',
  './engine.js',
  './engine2.js',
  './style.css'
];

const OPTIONAL_FILES = [
  './manifest.json',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './fonts/Poppins-Regular.ttf',
  './fonts/Poppins-Medium.ttf',
  './fonts/Poppins-Bold.ttf',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

// Install and cache essential files first
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(V);

      // Essential files must be cached successfully
      for (const file of CORE_FILES) {
        const response = await fetch(file, { cache: 'reload' });

        if (!response.ok) {
          throw new Error(
            'Failed to cache essential file: ' + file
          );
        }

        await cache.put(file, response);
      }

      // Optional files are cached independently
      await Promise.all(
        OPTIONAL_FILES.map(async file => {
          try {
            await cache.add(file);
          } catch (error) {
            console.warn(
              'Optional file was not cached:',
              file,
              error
            );
          }
        })
      );

      await self.skipWaiting();
    })()
  );
});

// Activate the new version
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(
            key =>
              key.startsWith('slablab-') &&
              key !== V
          )
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// Serve cached files when offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(V);

      const cached = await cache.match(
        event.request,
        { ignoreSearch: true }
      );

      if (cached) return cached;

      try {
        return await fetch(event.request);
      } catch (error) {
        if (event.request.mode === 'navigate') {
          const page =
            await cache.match('./index.html') ||
            await cache.match('./');

          if (page) return page;
        }

        return new Response(
          'This resource is unavailable offline.',
          {
            status: 503,
            statusText: 'Offline'
          }
        );
      }
    })()
  );
});
