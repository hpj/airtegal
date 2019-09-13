/* eslint-disable no-undef */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

self.addEventListener('message', (event) =>
{
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting();
});

workbox.precaching.precacheAndRoute([]);

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
// This might cause problems while in lobby with players having mis-matched cards and packs
workbox.routing.registerRoute(
  new RegExp('https://kbf.herokuapp.com/v1/'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'kbf-cache'
  })
);

const clientId = '622201604992401437';

const host = '127.0.0.1';
const port = 6463;

const url = `ws://${host}:${port}/?v=1&client_id=${clientId}&encoding=json`;

const ws = new WebSocket(url);

ws.onopen = () =>
{
  console.log('socket opened');
};

ws.onclose = ws.onerror = (e) =>
{
  console.warn(e);
};

ws.onmessage = (event) =>
{
  console.log(JSON.parse(event.data));
};