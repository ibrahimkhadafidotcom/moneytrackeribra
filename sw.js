const CACHE_NAME = "money-tracker-cloud-sync-v7-10-daily-food-budget-20260724-710";

const APP_SHELL = [
  "./",
  "./index.html?v=20260724-710",
  "./manifest.json?v=20260723-75",
  "./cloud-sync.js?v=20260723-78",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;

  if(url.pathname.endsWith("/firebase-config.js")){
    event.respondWith(fetch(event.request,{cache:"no-store"}));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if(response && response.ok){
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request,copy)
          );
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(response =>
          response ||
          caches.match("./index.html?v=20260724-710")
        )
      )
  );
});
