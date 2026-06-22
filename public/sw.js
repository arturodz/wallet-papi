// Wallet PAPI — hand-rolled service worker (offline app-shell).
//
// Why hand-rolled instead of Serwist? `@serwist/next` v9 injects a webpack
// config, which Next 16's default Turbopack build rejects ("This build is
// using Turbopack, with a `webpack` config"), failing `next build`. The
// Turbopack-supported `@serwist/turbopack` path serves the SW from a route
// handler and never emits a physical public/sw.js, which our PWA needs. So
// this minimal SW gives us the same behavior with zero build-tool conflict.
//
// Strategy:
//   - Navigations (GET, mode "navigate"): network-first, fall back to the
//     last cached copy of that page, then the precached /offline shell.
//   - Static assets (_next/static, /icons, fonts): stale-while-revalidate.
//   - Everything non-GET (server actions / mutations): passed straight to the
//     network, never cached or intercepted. Offline = read-only by design.

const VERSION = "v1";
const PRECACHE = `papi-precache-${VERSION}`;
const PAGES = `papi-pages-${VERSION}`;
const ASSETS = `papi-assets-${VERSION}`;

// Minimal app shell precached on install.
const PRECACHE_URLS = ["/offline", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([PRECACHE, PAGES, ASSETS]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

// Network-first: try the network, cache success, fall back to cache then shell.
async function networkFirst(request) {
  const cache = await caches.open(PAGES);
  try {
    const fresh = await fetch(request);
    // Only cache complete, basic GET responses.
    if (fresh && fresh.status === 200 && fresh.type === "basic") {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await caches.match("/offline");
    if (offline) return offline;
    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// Stale-while-revalidate: serve cache immediately, refresh in the background.
async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res && res.status === 200) cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never intercept mutations or cross-origin requests; let them hit the network.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // App-shell navigations.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Hashed/static assets and icons.
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:js|css|woff2?|png|svg|ico|jpg|jpeg|webp)$/.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
