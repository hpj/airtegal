// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "airtegal-app";

const offlineFallbackPage = "offline.html";
const assetLinksPage = ".well-known/assetlinks.json";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) =>
      {
        cache.add(offlineFallbackPage);
        cache.add(assetLinksPage);
      })
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        
        return networkResp;
      } catch (error) {
        let cachedResp;

        const cache = await caches.open(CACHE);

        const url = new URL(event.request.url);
      
        if (url.pathname.startsWith('/.well-known/assetlinks.json')) {
          cachedResp = await cache.match(assetLinksPage)
        } else {
          cachedResp = await cache.match(offlineFallbackPage)
        }

        return cachedResp;
      }
    })());
  }
});
