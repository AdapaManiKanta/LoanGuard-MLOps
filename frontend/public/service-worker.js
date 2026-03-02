/* ============================================================
   LoanGuard Service Worker — disabled offline caching
   ============================================================ */

// This service worker is intentionally minimal.  It bypasses any cache
// and simply proxies requests to the network.  Existing caches are
// removed during activation to clear previously stored assets.

self.addEventListener("install", (event) => {
  // immediately take control of the page
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  // delete all caches to clear offline data
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // always perform a normal network fetch; do not read/write cache
  event.respondWith(fetch(event.request));
});
