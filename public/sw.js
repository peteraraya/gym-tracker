const CACHE_PREFIX = "gym-logic-";
const SHELL_CACHE = `${CACHE_PREFIX}shell-v4`;
const STATIC_CACHE = `${CACHE_PREFIX}static-v4`;
const IMAGE_CACHE = `${CACHE_PREFIX}images-v4`;
const FONT_CACHE = `${CACHE_PREFIX}fonts-v4`;
const MAX_IMAGES = 120;
const MAX_FONTS = 40;

const SHELL_URLS = [
  "/",
  "/offline",
  "/manifest.json",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/apple-touch-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/badge-72x72.png",
];

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  const excess = keys.length - maxEntries;
  if (excess <= 0) return;
  await Promise.all(keys.slice(0, excess).map((request) => cache.delete(request)));
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && response.type !== "opaque") {
    await cache.put(request, response.clone());
    if (maxEntries) await trimCache(cache, maxEntries);
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.add("/offline");
      await Promise.allSettled(
        SHELL_URLS.filter((url) => url !== "/offline").map((url) => cache.add(url)),
      );
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const currentCaches = new Set([SHELL_CACHE, STATIC_CACHE, IMAGE_CACHE, FONT_CACHE]);
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith(CACHE_PREFIX) && !currentCaches.has(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request).catch(async () => {
        const exactCachedPage = await caches.match(request);
        if (exactCachedPage) return exactCachedPage;
        return (
          (await caches.match("/offline")) ||
          new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
        );
      }),
    );
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(
            JSON.stringify({ error: "offline", message: "Sin conexión a internet" }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          ),
      ),
    );
    return;
  }

  if (request.destination === "image") {
    event.respondWith(
      cacheFirst(request, IMAGE_CACHE, MAX_IMAGES).catch(
        () => new Response("", { status: 404 }),
      ),
    );
    return;
  }

  if (request.destination === "font") {
    event.respondWith(
      cacheFirst(request, FONT_CACHE, MAX_FONTS).catch(
        () => new Response("", { status: 504 }),
      ),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      cacheFirst(request, STATIC_CACHE).catch(
        () => new Response("", { status: 504 }),
      ),
    );
    return;
  }

  if (SHELL_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        return fetch(request);
      }),
    );
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag !== "sync-workout-data" && event.tag !== "sync-user-profile") return;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) =>
        client.postMessage({ type: "SYNC_REQUESTED", tag: event.tag }),
      );
    }),
  );
});

self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};
  if (type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (type === "GET_CLIENTS") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        event.ports[0]?.postMessage({ clients: clients.length });
      }),
    );
    return;
  }
  if (type === "BROADCAST") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage(payload));
      }),
    );
    return;
  }
  if (type === "CLEANUP") {
    event.waitUntil(
      Promise.all([STATIC_CACHE, IMAGE_CACHE, FONT_CACHE].map((name) => caches.delete(name))),
    );
  }
});

self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Nueva notificación de GymLogiX",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: "gym-logic-push",
    data: { url: "/", timestamp: Date.now() },
  };
  event.waitUntil(self.registration.showNotification("GymLogiX", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow ? self.clients.openWindow(url) : undefined;
    }),
  );
});

const restTimers = new Map();

self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};
  if (type === "START_REST_TIMER") {
    const { tag, duration, nextExercise } = payload;
    const endTime = Date.now() + duration * 1000;
    const timeout = setTimeout(() => {
      self.registration.showNotification("¡Descanso finalizado!", {
        body: nextExercise ? `Siguiente ejercicio: ${nextExercise}` : "¡Es hora de entrenar!",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
        tag: `rest-${tag}`,
        requireInteraction: true,
      });
      restTimers.delete(tag);
    }, duration * 1000);
    restTimers.set(tag, { endTime, timeout });
    return;
  }
  if (type === "STOP_REST_TIMER") {
    const timer = restTimers.get(payload?.tag);
    if (timer) clearTimeout(timer.timeout);
    restTimers.delete(payload?.tag);
  }
});
