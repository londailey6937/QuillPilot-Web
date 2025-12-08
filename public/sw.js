/**
 * Service Worker for QuillPilot
 * Provides offline caching for static assets and improves load performance
 */

const CACHE_NAME = "quillpilot-v2";
const STATIC_CACHE_NAME = "quillpilot-static-v2";
const DYNAMIC_CACHE_NAME = "quillpilot-dynamic-v2";

// Static assets to cache immediately on install
const STATIC_ASSETS = ["/", "/index.html", "/favicon.svg", "/site.webmanifest"];

// File extensions to cache dynamically
const CACHEABLE_EXTENSIONS = [
  ".js",
  ".css",
  ".woff2",
  ".woff",
  ".ttf",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
  ".ico",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old versions of our caches
              return (
                name.startsWith("quillpilot-") &&
                name !== STATIC_CACHE_NAME &&
                name !== DYNAMIC_CACHE_NAME
              );
            })
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip external requests (fonts, APIs)
  if (url.origin !== location.origin) {
    // For Google Fonts, use cache-first strategy
    if (
      url.hostname === "fonts.googleapis.com" ||
      url.hostname === "fonts.gstatic.com"
    ) {
      event.respondWith(
        caches.match(request).then((cached) => {
          if (cached) {
            return cached;
          }
          return fetch(request).then((response) => {
            // Cache font files
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
      );
      return;
    }
    return;
  }

  // Check if this is a cacheable asset
  const isCacheableAsset = CACHEABLE_EXTENSIONS.some((ext) =>
    url.pathname.endsWith(ext)
  );

  if (isCacheableAsset) {
    // Cache-first strategy for static assets
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Return cached version, but update cache in background
          fetch(request)
            .then((response) => {
              if (response.ok) {
                caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                  cache.put(request, response);
                });
              }
            })
            .catch(() => {
              // Ignore fetch errors for background update
            });
          return cached;
        }

        // Not in cache, fetch and cache
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first strategy for HTML pages and API calls
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful HTML responses
        const acceptHeader = request.headers.get("accept");
        if (response.ok && acceptHeader && acceptHeader.includes("text/html")) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached;
          }
          // Return offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/index.html");
          }
          throw new Error("No cached response available");
        });
      })
  );
});

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }

  if (event.data === "clearCache") {
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((name) => caches.delete(name)));
    });
  }
});
