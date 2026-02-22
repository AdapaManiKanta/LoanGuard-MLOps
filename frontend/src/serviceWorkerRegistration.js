/**
 * serviceWorkerRegistration.js
 * Registers the custom service worker and shows install prompt.
 */

const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/
    )
);

export function register() {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

            if (isLocalhost) {
                // Running on localhost — check if a service worker still exists or not
                checkValidServiceWorker(swUrl);
                navigator.serviceWorker.ready.then(() => {
                    console.log(
                        "[LoanGuard PWA] Serving from service worker cache on localhost."
                    );
                });
            } else {
                registerValidSW(swUrl);
            }
        });
    }
}

function registerValidSW(swUrl) {
    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            registration.onupdatefound = () => {
                const installing = registration.installing;
                if (installing == null) return;
                installing.onstatechange = () => {
                    if (installing.state === "installed") {
                        if (navigator.serviceWorker.controller) {
                            console.log("[LoanGuard PWA] New content available — refresh.");
                        } else {
                            console.log("[LoanGuard PWA] Content cached for offline use.");
                        }
                    }
                };
            };
        })
        .catch((error) => {
            console.error("[LoanGuard PWA] Service worker registration failed:", error);
        });
}

function checkValidServiceWorker(swUrl) {
    fetch(swUrl, { headers: { "Service-Worker": "script" } })
        .then((response) => {
            const contentType = response.headers.get("content-type");
            if (
                response.status === 404 ||
                (contentType != null && contentType.indexOf("javascript") === -1)
            ) {
                // Service worker not found — reload the page
                navigator.serviceWorker.ready.then((registration) => {
                    registration.unregister().then(() => window.location.reload());
                });
            } else {
                registerValidSW(swUrl);
            }
        })
        .catch(() => {
            console.log("[LoanGuard PWA] No internet. Running in offline mode.");
        });
}

export function unregister() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => registration.unregister())
            .catch((error) => console.error(error.message));
    }
}
