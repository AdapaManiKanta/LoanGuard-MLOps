/* ============================================================
   LoanGuard Service Worker — Cache-first with network fallback
   ============================================================ */

const CACHE_NAME = "loanguard-cache-v1";

// Assets to pre-cache on install (shell resources)
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/static/js/main.chunk.js",
    "/static/js/0.chunk.js",
    "/static/js/bundle.js",
    "/manifest.json",
    "/favicon.ico",
    "/logo192.png",
    "/logo512.png",
];

// ── Install: pre-cache static shell ─────────────────────────
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ── Activate: clean up old caches ───────────────────────────
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => k !== CACHE_NAME)
                        .map((k) => caches.delete(k))
                )
            )
            .then(() => self.clients.claim())
    );
});

// ── Fetch: cache-first for static, network-first for API ────
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Always go network-first for Flask API calls
    if (url.port === "5000" || url.hostname === "127.0.0.1") {
        event.respondWith(
            fetch(request).catch(() =>
                new Response(
                    JSON.stringify({ error: "You are offline. Please reconnect." }),
                    { headers: { "Content-Type": "application/json" }, status: 503 }
                )
            )
        );
        return;
    }

    // Cache-first for everything else (JS, CSS, fonts, images)
    event.respondWith(
        caches.match(request).then(
            (cached) =>
                cached ||
                fetch(request).then((response) => {
                    // Only cache successful same-origin GET responses
                    if (
                        !response ||
                        response.status !== 200 ||
                        response.type !== "basic" ||
                        request.method !== "GET"
                    ) {
                        return response;
                    }
                    const toCache = response.clone();
                    caches
                        .open(CACHE_NAME)
                        .then((cache) => cache.put(request, toCache));
                    return response;
                })
        )
    );
});
