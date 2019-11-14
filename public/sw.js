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
    "revision": "6c2e154f0287fdfb7c692039f6f8e238"
  },
  {
    "url": "fonts.css",
    "revision": "96c0f7881407d44eafc15b1e21153aad"
  },
  {
    "url": "google92d94755931a0391.html",
    "revision": "343596c7544c5333db385515c52c5053"
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
    "revision": "cf60ad2695455ed14e1d5e7828fe9198"
  },
  {
    "url": "manifest.json",
    "revision": "4f35bc5368751f05f7d97ef1a7b1ddc7"
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

// Cache cards and packs with a stale-while-revalidate strategy
// TODO This might cause problems while in lobby with players having mis-matched cards and packs
workbox.routing.registerRoute(
  new RegExp('https://kbf.herokuapp.com/v1/'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'kbf-cache'
  })
);