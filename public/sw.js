/* eslint-disable no-undef */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

self.addEventListener('message', (event) =>
{
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting();
});

workbox.precaching.precacheAndRoute([
  {
    "url": "Icon-144.png",
    "revision": "d0f62307c6eafcd889857b8eb7d5d3da"
  },
  {
    "url": "Icon-16.png",
    "revision": "5e4787d260a9a7e455a3621fbc49c681"
  },
  {
    "url": "Icon-192.png",
    "revision": "0233ce04759e6b9dc505af077dd09b58"
  },
  {
    "url": "Icon-36.png",
    "revision": "307e3c8110918f2356161f73a19401e8"
  },
  {
    "url": "Icon-48.png",
    "revision": "a08c4248f1139d752d52641203e0a497"
  },
  {
    "url": "Icon-512.png",
    "revision": "1c1b08355f7044ca71678cc00e57e8dc"
  },
  {
    "url": "Icon-72.png",
    "revision": "dde2bb21c845863885e44b1b403bf738"
  },
  {
    "url": "Icon-96.png",
    "revision": "cfbd8d64689fa0318e156552aa340c9e"
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
    "url": "NotoSansArabic-SemiCondensed.ttf",
    "revision": "9fbebac13507b4cf9996b7950b17b9cd"
  },
  {
    "url": "NotoSansArabic-SemiCondensedBold.ttf",
    "revision": "a2a915fbf7560f887f61c46bc1983dc3"
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