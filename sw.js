const CACHE = 'cadre-familial-v2';
const SHELL = [
  './',
  'index.html',
  'admin.html',
  'styles.css',
  'app.js',
  'admin.js',
  'manifest.json',
  'photos/sample-1.svg',
  'photos/sample-2.svg',
  'photos/sample-3.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => key === CACHE ? null : caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.endsWith('/config.json')) {
    event.respondWith(fetch(event.request).catch(() => caches.match('config.example.json')));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('index.html'));
    })
  );
});
