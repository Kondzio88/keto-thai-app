const version = "v1";
const CACHE_NAME = `keto-thai-${version}`;
const preCache = [
    "index.html",
    "manifest.webmanifest",
    "icon-192.png",
    "icon-512.png",
    "icon-512-maskable.png",
    "apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(preCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) =>
                Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                return cached;
            }

            return fetch(event.request)
                .then((response) => {
                    // Cache-first serwuje zapamiętane odpowiedzi do następnego wdrożenia,
                    // więc zapamiętujemy tylko pełne sukcesy. Błąd (404/500) i odpowiedź
                    // "opaque" (status 0 — nie wiemy, czy to sukces) nie wchodzą do cache.
                    // 206 (fragment) odrzuca sam cache.put, a status 200 go wyklucza.
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        // waitUntil: bez niego system może uśpić workera, zanim zapis się skończy.
                        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone)));
                    }
                    return response;
                })
                .catch(() => {
                    if (event.request.mode === "navigate") {
                        return caches.match("index.html");
                    }
                });
        })
    );
});

