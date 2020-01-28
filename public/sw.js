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
    "revision": "f91d0019aa209d7a6b10cc7f19b9a0f3"
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
    "url": "icons/120.png",
    "revision": "6feff42b73ec938b43163b4bdfdf4ded"
  },
  {
    "url": "icons/1240x600.png",
    "revision": "2fd5d6e53899dd685c8be65b8893b497"
  },
  {
    "url": "icons/144.png",
    "revision": "f8c866c2e220cec14cb438fa29c28425"
  },
  {
    "url": "icons/150.png",
    "revision": "f2bd3d5b074f29b5e779d4b37d507e24"
  },
  {
    "url": "icons/152.png",
    "revision": "8d7b05824dbbf22b96e67af9a7cfa60b"
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
    "url": "icons/24.png",
    "revision": "8a40937a76388678a82bce30de4d348a"
  },
  {
    "url": "icons/300.png",
    "revision": "0d9d331ca7aadd031983c51d0afeff31"
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
    "url": "icons/44.png",
    "revision": "e5bd26fd32394c39ffb59243dce2f074"
  },
  {
    "url": "icons/48.png",
    "revision": "53aa240474e3cd7499f8d8da0e9dc620"
  },
  {
    "url": "icons/50.png",
    "revision": "ef62d559139709aa91747b05b4bb29ee"
  },
  {
    "url": "icons/512.png",
    "revision": "d59f9c3303a31880b79bacf8c69d2dcc"
  },
  {
    "url": "icons/620x300.png",
    "revision": "1e27d518bf60559a5fbfb3f2600ed9f9"
  },
  {
    "url": "icons/72.png",
    "revision": "e189aaf9953602d5a9c996ce314a7233"
  },
  {
    "url": "icons/76.png",
    "revision": "525111df089e41a6176127973e992d6b"
  },
  {
    "url": "icons/88.png",
    "revision": "e70524e35d8157e2bba4ca790c349822"
  },
  {
    "url": "icons/96.png",
    "revision": "3a42bf43ad5417cb0edd1ef37b3aff30"
  },
  {
    "url": "index.html",
    "revision": "f6ee79f233e06687529129a70ef69525"
  },
  {
    "url": "manifest.json",
    "revision": "8939c5df35ca61bbe63cfcfba3e79929"
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

// Cache the bundle.js file with a network-first strategy
workbox.routing.registerRoute(
  new RegExp('bundle.js'),
  new workbox.strategies.NetworkFirst()
);

// Cache the ip check with a cache-first strategy for 1 day
workbox.routing.registerRoute(
  new RegExp('https://api.bedan.me/check'),
  new workbox.strategies.CacheFirst({
    cacheName: 'kbf-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 1
      })
    ]
  })
);