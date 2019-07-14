const cacheName = 'kbf-cache';

const urlsToCache = [
  './index.html',
  './bundle.js'
];

self.addEventListener('install', (event) =>
{
  console.log('The service worker is being installed.');

  event.waitUntil(precache());
});

self.addEventListener('fetch', (event) =>
{
  event.respondWith(fetchUpdate(event.request));
});

function precache()
{
  // open a cache and cache our files
  return caches.open(cacheName)
    .then((cache) => cache.addAll(urlsToCache))
    .catch(error);
}

function fetchUpdate(request)
{
  // open the cache
  return caches.open(cacheName).then((cache) =>
  {
    // check if the requested data has a cached version already
    return cache.match(request).then((response) =>
    {
      // updates the cached version or caches it or the first time
      const promise = fetch(request).then((response) =>
      {
        cache.put(request, response.clone());

        return response;
      }).catch(error);

      // if there were no cached versions, waits for a new fetch and returns its response
      // if there were a cached version, returns it immediately while also updating the existing one
      return response || promise.then((response) => response);
    }).catch(error);
  }).catch(error);
}

function error(err)
{
  console.log(err);
}