/* eslint-disable no-undef */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

self.addEventListener('message', (event) =>
{
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting();
});

workbox.precaching.precacheAndRoute([
  {
    "url": "body.css",
    "revision": "bef9c5c82e2ac87febd66db98fc4f8f4"
  },
  {
    "url": "fonts.css",
    "revision": "96c0f7881407d44eafc15b1e21153aad"
  },
  {
    "url": "Icon-144.png",
    "revision": "ddbe46224704e861d7ad54aefcb19686"
  },
  {
    "url": "Icon-16.png",
    "revision": "5e4787d260a9a7e455a3621fbc49c681"
  },
  {
    "url": "Icon-192.png",
    "revision": "69ea483a0819509a9c891de60ff4a3fb"
  },
  {
    "url": "Icon-36.png",
    "revision": "307e3c8110918f2356161f73a19401e8"
  },
  {
    "url": "Icon-48.png",
    "revision": "1027f74579f421bc8e95cff420bcafdf"
  },
  {
    "url": "Icon-512.png",
    "revision": "543a835123727cd6e0f26557eb6630c1"
  },
  {
    "url": "Icon-72.png",
    "revision": "310230e07fb95d839e72de6b6ead27ea"
  },
  {
    "url": "Icon-96.png",
    "revision": "485878dc6561b69dd02d6e634f6cef36"
  },
  {
    "url": "index.html",
    "revision": "8440d9bf5c55bcfc61296f917a5cdd22"
  },
  {
    "url": "manifest.json",
    "revision": "e8b2f3ff517a2efcb010cf5c1602cd30"
  },
  {
    "url": "Montserrat-Bold.ttf",
    "revision": "a3b387c93882604792867736aecd56c8"
  },
  {
    "url": "Montserrat-Regular.ttf",
    "revision": "a8a117360e71de94ae3b0b0f8d15b44d"
  },
  {
    "url": "NotoSansArabic-Bold.ttf",
    "revision": "793944f4ca6e09ce8703078ce3841526"
  },
  {
    "url": "NotoSansArabic-Regular.ttf",
    "revision": "9f563abf8532ead724f2d6231983b5d4"
  }
]);

// Cache the bundle.js file with a stale-while-revalidate strategy
workbox.routing.registerRoute(
  new RegExp('bundle.js'),
  new workbox.strategies.StaleWhileRevalidate({
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

// Cache cards and packs with a stale-while-revalidate strategy
// This might cause problems while in lobby with players having mis-matched cards and packs
workbox.routing.registerRoute(
  new RegExp('https://kbf.herokuapp.com'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'kbf-cache'
  })
);