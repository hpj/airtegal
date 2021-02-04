/* eslint-disable no-undef */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.0/workbox-sw.js');

self.addEventListener('message', (event) =>
{
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting();
});

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// Cache the bundle.js file with a network-first strategy
workbox.routing.registerRoute(
  new RegExp('bundle.js'),
  new workbox.strategies.NetworkFirst()
);

// Cache the ip check with a cache-first strategy for 1 day
workbox.routing.registerRoute(
  new RegExp('https://api.airtegal.me/check'),
  new workbox.strategies.CacheFirst({
    cacheName: 'airtegal-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 1
      })
    ]
  })
);