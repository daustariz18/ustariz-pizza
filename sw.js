const CACHE_NAME = "ustariz-cache-v2";
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./style.css?v=20260219-3",
  "./script.js?v=20260219-2",
  "./manifest.json",
  "./img/logo_IA_Ustariz_Pizza.png",
  "./img/Join_Data.png",
  "./img/ustariz_pizza_logo_1.png",
  "./img/ustariz_pizza_logo_2.png"
];

globalThis.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  globalThis.skipWaiting();
});

globalThis.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  );
  globalThis.clients.claim();
});

globalThis.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  const isSameOrigin = requestUrl.origin === globalThis.location.origin;
  if (!isSameOrigin) return;

  const isNavigationRequest = request.mode === "navigate";

  if (isNavigationRequest) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", responseClone));
          return networkResponse;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((networkResponse) => {
        if (networkResponse?.status === 200 && networkResponse.type === "basic") {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});