/* eslint-disable no-undef */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.0/workbox-sw.js');

self.addEventListener('message', (event) =>
{
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting();
});

workbox.precaching.precacheAndRoute([{"revision":"c58817c4844b1d07d747fc5acdd83271","url":"assets/card.png"},{"revision":"e8363f87cd17afd2030b279fc6146cf7","url":"assets/icon-dark.svg"},{"revision":"73a0d79b29cda3e5fd733f7c184510ce","url":"assets/icon-light.svg"},{"revision":"a1df3d440fef02eab93794b74545eaeb","url":"assets/screenshot-1.png"},{"revision":"d14e9326839a5dc1216b64035a79393d","url":"assets/screenshot-2.png"},{"revision":"fef96f2a14b9a27fe020b59240c4a6d9","url":"assets/screenshot-3.png"},{"revision":"d9c0d918306c438506c97a9ab2fd0d16","url":"bundle.js"},{"revision":"a3b387c93882604792867736aecd56c8","url":"fonts/Montserrat-Bold.ttf"},{"revision":"a8a117360e71de94ae3b0b0f8d15b44d","url":"fonts/Montserrat-Regular.ttf"},{"revision":"793944f4ca6e09ce8703078ce3841526","url":"fonts/NotoSansArabic-Bold.ttf"},{"revision":"9f563abf8532ead724f2d6231983b5d4","url":"fonts/NotoSansArabic-Regular.ttf"},{"revision":"7899bf3843b9c889b86455a47338b7a9","url":"icons/128.png"},{"revision":"fdeb23d1327c13d6d70830f1b160d7a0","url":"icons/144.png"},{"revision":"93ef4e22dca24585ce0347c2e7889afe","url":"icons/152.png"},{"revision":"ba66b705c8817f9a6055c65e21e8266a","url":"icons/180.png"},{"revision":"67096f90e97929a31d77ca01a65df3a3","url":"icons/384.png"},{"revision":"e0ee6089eb43e00bd8801fde18a375ae","url":"icons/512.png"},{"revision":"fda1e30007aea7d40e3f4752dee7c451","url":"icons/72.png"},{"revision":"6baaaa09cddaf05e87186609b1b88e3c","url":"icons/96.png"},{"revision":"aafafbcf0b5eb38b950c398842830d63","url":"index.html"},{"revision":"24b1bd7bd0b757056ba7711e6614fce1","url":"manifest.json"},{"revision":"a12c7696ac21720e04fbf66bf1650da9","url":"splash/1125x2436.png"},{"revision":"ad4ef7b7af19995dac7600de89bf14fd","url":"splash/1242x2148.png"},{"revision":"f731bc19aad672668844db6265741124","url":"splash/1536x2048.png"},{"revision":"7c3ca8159014ad62f22ab233878b2b67","url":"splash/1668x2224.png"},{"revision":"701852fcb43c518fa3cd998377c4852a","url":"splash/2048x2732.png"},{"revision":"01647c3a290c3063ea342dfb40ac8e75","url":"splash/640x1136.png"},{"revision":"ffbfdba34afeb39aadf5cd958dbcea68","url":"splash/750x1294.png"}]);

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
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 1
      })
    ]
  })
);