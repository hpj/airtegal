/* eslint-disable no-undef */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

self.addEventListener('message', (event) =>
{
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting();
});

workbox.precaching.precacheAndRoute([
  {
    "url": "assets/body.css",
    "revision": "2598c7d31461b8c5b74471ddd7098729"
  },
  {
    "url": "assets/card.png",
    "revision": "3ab5e7f65a2c1ce25d2e6f69ec17c37e"
  },
  {
    "url": "assets/fonts.css",
    "revision": "a4b2129f710f88bca9013d819815f5fc"
  },
  {
    "url": "assets/icon-dark.svg",
    "revision": "6afc01874975cfa757302e931fd64668"
  },
  {
    "url": "assets/icon-light.svg",
    "revision": "a3baa8478e73fc280b1a2188c2fa610c"
  },
  {
    "url": "fonts/Montserrat-Bold.ttf",
    "revision": "a3b387c93882604792867736aecd56c8"
  },
  {
    "url": "fonts/Montserrat-Regular.ttf",
    "revision": "a8a117360e71de94ae3b0b0f8d15b44d"
  },
  {
    "url": "fonts/NotoSansArabic-Bold.ttf",
    "revision": "793944f4ca6e09ce8703078ce3841526"
  },
  {
    "url": "fonts/NotoSansArabic-Regular.ttf",
    "revision": "9f563abf8532ead724f2d6231983b5d4"
  },
  {
    "url": "icons/144.png",
    "revision": "f8c866c2e220cec14cb438fa29c28425"
  },
  {
    "url": "icons/16.png",
    "revision": "9ddc84abfe6ce72bfc89b4bea84d6710"
  },
  {
    "url": "icons/180.png",
    "revision": "ba66b705c8817f9a6055c65e21e8266a"
  },
  {
    "url": "icons/192.png",
    "revision": "d830399c7f7a325aee83ec1298471ef2"
  },
  {
    "url": "icons/32.png",
    "revision": "957858fb75d25b14d71d49f8276ff1ac"
  },
  {
    "url": "icons/36.png",
    "revision": "864d7db390d9e4b8827ff28851f87dad"
  },
  {
    "url": "icons/48.png",
    "revision": "53aa240474e3cd7499f8d8da0e9dc620"
  },
  {
    "url": "icons/512.png",
    "revision": "d59f9c3303a31880b79bacf8c69d2dcc"
  },
  {
    "url": "icons/72.png",
    "revision": "e189aaf9953602d5a9c996ce314a7233"
  },
  {
    "url": "icons/96.png",
    "revision": "3a42bf43ad5417cb0edd1ef37b3aff30"
  },
  {
    "url": "index.html",
    "revision": "a6681a226cb6e1f0210e9ccc838957e3"
  },
  {
    "url": "manifest.json",
    "revision": "2a9c17e9184779bc88f449601b29595b"
  },
  {
    "url": "splash/1125x2436.png",
    "revision": "42547b497d2f090ace108ec04ecbc848"
  },
  {
    "url": "splash/1242x2148.png",
    "revision": "3bc9cecddf83a5e01f9f455b3bfa6d80"
  },
  {
    "url": "splash/1536x2048.png",
    "revision": "949d8685e3ab9ccdec839fa7dfb26f77"
  },
  {
    "url": "splash/1668x2224.png",
    "revision": "9b1f25d08176cceec05e7c59d92ce907"
  },
  {
    "url": "splash/2048x2732.png",
    "revision": "2903e05dc3aa32556c34414366a10d14"
  },
  {
    "url": "splash/640x1136.png",
    "revision": "530d7552b5e0638c264dae67ed540394"
  },
  {
    "url": "splash/750x1294.png",
    "revision": "beeea34e8bbf9941135279e17e9a81cb"
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