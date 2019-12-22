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
    "revision": "2598c7d31461b8c5b74471ddd7098729"
  },
  {
    "url": "card.png",
    "revision": "4a7b114dab98456b98fd1765b3bfd268"
  },
  {
    "url": "fonts.css",
    "revision": "96c0f7881407d44eafc15b1e21153aad"
  },
  {
    "url": "Icon-144.png",
    "revision": "f8c866c2e220cec14cb438fa29c28425"
  },
  {
    "url": "Icon-16.png",
    "revision": "dfe36061079a9e03216f9247e2fde542"
  },
  {
    "url": "Icon-192.png",
    "revision": "d830399c7f7a325aee83ec1298471ef2"
  },
  {
    "url": "Icon-36.png",
    "revision": "864d7db390d9e4b8827ff28851f87dad"
  },
  {
    "url": "Icon-48.png",
    "revision": "53aa240474e3cd7499f8d8da0e9dc620"
  },
  {
    "url": "Icon-512.png",
    "revision": "d59f9c3303a31880b79bacf8c69d2dcc"
  },
  {
    "url": "Icon-72.png",
    "revision": "e189aaf9953602d5a9c996ce314a7233"
  },
  {
    "url": "Icon-96.png",
    "revision": "3a42bf43ad5417cb0edd1ef37b3aff30"
  },
  {
    "url": "index.html",
    "revision": "c1fced792213141c688ebd9726eefb50"
  },
  {
    "url": "manifest.json",
    "revision": "d723d1eb12c6fea981cfe3d5bd4c10de"
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

// Cache the ip check with a cache-first strategy for 1 day
workbox.routing.registerRoute(
  new RegExp('https://kbf.herokuapp.com/check/'),
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