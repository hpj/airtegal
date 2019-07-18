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
    "revision": "1dc75eb064a3504f72d60362186fe88b"
  },
  {
    "url": "manifest.json",
    "revision": "e8b2f3ff517a2efcb010cf5c1602cd30"
  }
]);

// Cache the bundle.js file which has all css and icons and modules with stale-while-revalidate strategy
workbox.routing.registerRoute(
  new RegExp('bundle.js'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'kbf-cache'
  }));

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy
workbox.routing.registerRoute(
  new RegExp('https://fonts.googleapis.com'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets'
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year
workbox.routing.registerRoute(
  new RegExp('https://fonts.gstatic.com'),
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [ 0, 200 ]
      }),
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30
      })
    ]
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
  new workbox.strategies.NetworkFirst()
);