/* eslint-disable no-undef */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

self.addEventListener('message', (event) =>
{
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting();
});

workbox.precaching.precacheAndRoute([]);

// Cache the bundle.js file with a network-first strategy
workbox.routing.registerRoute(
  new RegExp('bundle.js'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'kbf-cache'
  })
);

// Cache the geoip check with a cache-first strategy for 1 day
workbox.routing.registerRoute(
  new RegExp('https://geoip-db.com/jsonp'),
  new workbox.strategies.CacheFirst({
    cacheName: 'kbf-cache',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [ 0, 200 ]
      }),
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 1
      })
    ]
  })
);

// Cache cards and packs with a network-first strategy
workbox.routing.registerRoute(
  new RegExp('https://kbf.herokuapp.com'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'kbf-cache'
  })
);