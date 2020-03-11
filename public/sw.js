/* eslint-disable no-undef */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

self.addEventListener('message', (event) =>
{
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting();
});

workbox.precaching.precacheAndRoute([{"revision":"2598c7d31461b8c5b74471ddd7098729","url":"assets/body.css"},{"revision":"c58817c4844b1d07d747fc5acdd83271","url":"assets/card.png"},{"revision":"a4b2129f710f88bca9013d819815f5fc","url":"assets/fonts.css"},{"revision":"e8363f87cd17afd2030b279fc6146cf7","url":"assets/icon-dark.svg"},{"revision":"73a0d79b29cda3e5fd733f7c184510ce","url":"assets/icon-light.svg"},{"revision":"a3b387c93882604792867736aecd56c8","url":"fonts/Montserrat-Bold.ttf"},{"revision":"a8a117360e71de94ae3b0b0f8d15b44d","url":"fonts/Montserrat-Regular.ttf"},{"revision":"793944f4ca6e09ce8703078ce3841526","url":"fonts/NotoSansArabic-Bold.ttf"},{"revision":"9f563abf8532ead724f2d6231983b5d4","url":"fonts/NotoSansArabic-Regular.ttf"},{"revision":"6feff42b73ec938b43163b4bdfdf4ded","url":"icons/120.png"},{"revision":"8d5e93152a8ef1eb3ec750c1faa56dbe","url":"icons/1240x600.png"},{"revision":"f8c866c2e220cec14cb438fa29c28425","url":"icons/144.png"},{"revision":"f2bd3d5b074f29b5e779d4b37d507e24","url":"icons/150.png"},{"revision":"8d7b05824dbbf22b96e67af9a7cfa60b","url":"icons/152.png"},{"revision":"9732f48d469d9b7ae3925261d1e8bfe6","url":"icons/16.png"},{"revision":"ba66b705c8817f9a6055c65e21e8266a","url":"icons/180.png"},{"revision":"d830399c7f7a325aee83ec1298471ef2","url":"icons/192.png"},{"revision":"8a40937a76388678a82bce30de4d348a","url":"icons/24.png"},{"revision":"0d9d331ca7aadd031983c51d0afeff31","url":"icons/300.png"},{"revision":"36d5bbf56b8210c2b3cd5aeb428bbc7d","url":"icons/32.png"},{"revision":"864d7db390d9e4b8827ff28851f87dad","url":"icons/36.png"},{"revision":"e5bd26fd32394c39ffb59243dce2f074","url":"icons/44.png"},{"revision":"53aa240474e3cd7499f8d8da0e9dc620","url":"icons/48.png"},{"revision":"ef62d559139709aa91747b05b4bb29ee","url":"icons/50.png"},{"revision":"d59f9c3303a31880b79bacf8c69d2dcc","url":"icons/512.png"},{"revision":"54462b325f3a42001ad6048c2699c6f6","url":"icons/620x300.png"},{"revision":"e189aaf9953602d5a9c996ce314a7233","url":"icons/72.png"},{"revision":"525111df089e41a6176127973e992d6b","url":"icons/76.png"},{"revision":"e70524e35d8157e2bba4ca790c349822","url":"icons/88.png"},{"revision":"3a42bf43ad5417cb0edd1ef37b3aff30","url":"icons/96.png"},{"revision":"31a77d883b1d8ef3ba02f9d15531c3b3","url":"index.html"},{"revision":"f4abd5f2ed81b3e57212ff0abc28d11c","url":"manifest.json"},{"revision":"a12c7696ac21720e04fbf66bf1650da9","url":"splash/1125x2436.png"},{"revision":"ad4ef7b7af19995dac7600de89bf14fd","url":"splash/1242x2148.png"},{"revision":"f731bc19aad672668844db6265741124","url":"splash/1536x2048.png"},{"revision":"7c3ca8159014ad62f22ab233878b2b67","url":"splash/1668x2224.png"},{"revision":"701852fcb43c518fa3cd998377c4852a","url":"splash/2048x2732.png"},{"revision":"01647c3a290c3063ea342dfb40ac8e75","url":"splash/640x1136.png"},{"revision":"ffbfdba34afeb39aadf5cd958dbcea68","url":"splash/750x1294.png"}]);

// Cache the bundle.js file with a network-first strategy
workbox.routing.registerRoute(
  new RegExp('bundle.js'),
  new workbox.strategies.NetworkFirst()
);

// Cache the ip check with a cache-first strategy for 1 day
workbox.routing.registerRoute(
  new RegExp('https://api.bedan.me/check'),
  new workbox.strategies.CacheFirst({
    cacheName: 'airtegal-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 1
      })
    ]
  })
);