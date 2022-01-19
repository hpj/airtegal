const CACHE = 'airtegal-app';

const offlineFallbackPage = 'offline.html';

const assetLinksPage = '.well-known/assetlinks.json';

self.addEventListener('message', (event) =>
{
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting();
});

self.addEventListener('install', async(event) =>
{
  event.waitUntil(caches.open(CACHE).then(cache =>
  {
    cache.add(offlineFallbackPage);
    cache.add(assetLinksPage);
  }));
});

self.addEventListener('fetch', (event) =>
{
  if (event.request.mode === 'navigate')
  {
    event.respondWith((async() =>
    {
      try
      {
        const preloadResp = await event.preloadResponse;

        if (preloadResp)
          return preloadResp;

        return await fetch(event.request);
      }
      catch (error)
      {
        const cache = await caches.open(CACHE);

        const url = new URL(event.request.url);
      
        if (url.pathname.startsWith('/.well-known/assetlinks.json'))
          return await cache.match(assetLinksPage);

        return await cache.match(offlineFallbackPage);
      }
    })());
  }
});
