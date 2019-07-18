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
    "revision": "1c5d66c0281596b9e0d092e26765a4b7"
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
    "revision": "2d55d4c599cceb7e2ee679c4324ef15f"
  },
  {
    "url": "manifest.json",
    "revision": "e8b2f3ff517a2efcb010cf5c1602cd30"
  },
  {
    "url": "NotoSansArabic-Bold.ttf",
    "revision": "793944f4ca6e09ce8703078ce3841526"
  },
  {
    "url": "NotoSansArabic-Regular.ttf",
    "revision": "9f563abf8532ead724f2d6231983b5d4"
  },
  {
    "url": "Raleway-Bold.ttf",
    "revision": "2f99a85426a45e0c7f8707aae53af803"
  },
  {
    "url": "Raleway-Regular.ttf",
    "revision": "84abe14c9756256a4b91300ba3e4ec62"
  }
]);

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