const V = 'slablab-v1.1-audit15';

const CORE_FILES = [
  './',
  'index.html',
  'app.js',
  'engine.js',
  'engine2.js',
  'style.css'
];

const OPTIONAL_FILES = [
  'manifest.json',
  'manifest.webmanifest',
  'Poppins-Regular.ttf',
  'Poppins-Medium.ttf',
  'Poppins-Bold.ttf',
  'icon-192.png',
  'icon-512.png',
  'maskable-512.png',
  'apple-touch-icon.png'
];

async function cacheFile(cache, file, required) {
  const url = new URL(file, self.registration.scope);

  const response = await fetch(url.href, {
    cache: 'reload'
  });

  if (!response.ok) {
    throw new Error(
      'Failed to fetch ' + url.href +
      ': HTTP ' + response.status
    );
  }

  await cache.put(url.href, response.clone());
}

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(V);

      try {
        for (const file of CORE_FILES) {
          await cacheFile(cache, file, true);
        }

        for (const file of OPTIONAL_FILES) {
          try {
            await cacheFile(cache, file, false);
          } catch (error) {
            console.warn(
              'Optional file not cached:',
              file,
              error
            );
          }
        }

        await self.skipWaiting();
      } catch (error) {
        await caches.delete(V);
        console.error(
          'SlabLab offline installation failed:',
          error
        );
        throw error;
      }
    })()
  );
});

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

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(
        event.request,
        { ignoreSearch: true }
      );

      if (cached) return cached;

      try {
        return await fetch(event.request);
      } catch (error) {
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(V);

          const page =
            await cache.match(
              new URL('index.html', self.registration.scope).href
            ) ||
            await cache.match(self.registration.scope);

          if (page) return page;
        }

        return new Response(
          'This resource is not available offline.',
          {
            status: 503,
            statusText: 'Offline'
          }
        );
      }
    })()
  );
});
