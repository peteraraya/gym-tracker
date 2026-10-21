// ─── Service Worker Profesional GymLogiX ───
// Estrategias de caché avanzadas, offline-first, sync en segundo plano,
// notificaciones push y temporizadores de descanso en background.

const CACHE_NAME = 'gym-logic-shell-v3';
const RUNTIME_CACHE = 'gym-logic-runtime-v3';
const API_CACHE = 'gym-logic-api-v3';
const IMAGE_CACHE = 'gym-logic-images-v3';
const FONT_CACHE = 'gym-logic-fonts-v3';

const SW_VERSION = '3.0.0';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/badge-72x72.png',
  '/offline',
];

const CACHEABLE_API_PATTERNS = [
  /\/api\/routines/,
  /\/api\/sessions/,
  /\/api\/profile/,
  /supabase\.co\/rest\/v1\/routines/,
  /supabase\.co\/rest\/v1\/sessions/,
  /supabase\.co\/rest\/v1\/profiles/,
];

const NO_CACHE_PATTERNS = [
  /\/api\/auth/,
  /\/api\/webhook/,
  /\/share/,
];

function isCacheableAPI(url) {
  return CACHEABLE_API_PATTERNS.some((pattern) => pattern.test(url));
}

function isNoCacheAPI(url) {
  return NO_CACHE_PATTERNS.some((pattern) => pattern.test(url));
}

function shouldCacheRequest(request) {
  const url = new URL(request.url);
  if (request.method !== 'GET') return false;
  if (url.origin !== self.location.origin && !url.hostname.includes('supabase.co')) return false;
  if (isNoCacheAPI(url.href)) return false;
  return true;
}

self.addEventListener('install', (event) => {
  console.log('[SW v' + SW_VERSION + '] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] App shell precached, forcing activation');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Precaching failed:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW v' + SW_VERSION + '] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              const currentCaches = [CACHE_NAME, RUNTIME_CACHE, API_CACHE, IMAGE_CACHE, FONT_CACHE];
              return !currentCaches.includes(cacheName);
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // App Shell - Cache First
  if (PRECACHE_URLS.some((p) => request.url.includes(p) || request.url.endsWith(p))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Imágenes - Cache First
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cachedResponse || new Response('', { status: 404 }));
        });
      })
    );
    return;
  }

  // Fuentes - Cache First
  if (request.destination === 'font' || request.url.includes('/_next/static/')) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Navegación HTML - Network First con fallback a Cache /offline
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match('/offline');
          });
        })
    );
    return;
  }

  // API Requests - Network First con Cache fallback
  if (shouldCacheRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && request.method === 'GET' && !isNoCacheAPI(url.href)) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            if (request.mode === 'navigate') {
              return caches.match('/offline');
            }
            return new Response(JSON.stringify({ error: 'offline', message: 'Sin conexión a internet' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            });
          });
        })
    );
    return;
  }

  // Otros recursos - Network First
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ─── 4. BACKGROUND SYNC: Sincronización en segundo plano ───
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  if (event.tag === 'sync-workout-data') {
    event.waitUntil(syncWorkoutData());
  }
  if (event.tag === 'sync-user-profile') {
    event.waitUntil(syncUserProfile());
  }
});

async function openIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('gym-logic-sync', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pending-workouts')) {
        db.createObjectStore('pending-workouts', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pending-profile')) {
        db.createObjectStore('pending-profile', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function syncWorkoutData() {
  try {
    const db = await openIDB();
    const tx = db.transaction('pending-workouts', 'readonly');
    const store = tx.objectStore('pending-workouts');
    const pendingWorkouts = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    for (const workout of pendingWorkouts) {
      try {
        await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workout.data),
        });
        const delTx = db.transaction('pending-workouts', 'readwrite');
        const delStore = delTx.objectStore('pending-workouts');
        await new Promise((resolve, reject) => {
          const delReq = delStore.delete(workout.id);
          delReq.onsuccess = () => resolve();
          delReq.onerror = () => reject(delReq.error);
        });
        console.log('[SW] Synced workout:', workout.id);
      } catch (err) {
        console.error('[SW] Failed to sync workout:', workout.id, err);
        break;
      }
    }
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETED',
        tag: 'sync-workout-data',
        success: true,
      });
    });
  } catch (err) {
    console.error('[SW] Background sync error:', err);
  }
}

async function syncUserProfile() {
  try {
    const db = await openIDB();
    const tx = db.transaction('pending-profile', 'readonly');
    const store = tx.objectStore('pending-profile');
    const pendingProfile = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    for (const profile of pendingProfile) {
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile.data),
        });
        const delTx = db.transaction('pending-profile', 'readwrite');
        const delStore = delTx.objectStore('pending-profile');
        await new Promise((resolve, reject) => {
          const delReq = delStore.delete(profile.id);
          delReq.onsuccess = () => resolve();
          delReq.onerror = () => reject(delReq.error);
        });
      } catch (err) {
        console.error('[SW] Failed to sync profile:', err);
        break;
      }
    }
  } catch (err) {
    console.error('[SW] Profile sync error:', err);
  }
}

// ─── 5. MESSAGES: Comunicación con clientes ───
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (type === 'GET_CLIENTS') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        event.ports[0].postMessage({ clients: clients.length });
      })
    );
    return;
  }
  if (type === 'STORE_FOR_SYNC') {
    const { store, data } = payload;
    event.waitUntil(
      (async () => {
        const db = await openIDB();
        const tx = db.transaction(store, 'readwrite');
        const objStore = tx.objectStore(store);
        await new Promise((resolve, reject) => {
          const req = objStore.put({ data, timestamp: Date.now() });
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      })()
    );
    return;
  }
  if (type === 'BROADCAST') {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage(payload);
      });
    });
  }
});

// ─── 6. NOTIFICACIONES PUSH ───
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de GymLogiX',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'gym-logic-push',
    renotify: true,
    actions: [
      { action: 'open', title: 'Abrir', icon: '/icons/icon-192x192.png' },
      { action: 'close', title: 'Cerrar' },
    ],
    data: {
      url: '/',
      timestamp: Date.now(),
    },
  };
  event.waitUntil(
    self.registration.showNotification('GymLogiX', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') {
    return;
  }
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// ─── 7. TEMPORIZADORES DE DESCANSO EN BACKGROUND ───
const restTimers = new Map();

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  if (type === 'START_REST_TIMER') {
    const { tag, duration, nextExercise } = payload;
    const endTime = Date.now() + duration * 1000;
    restTimers.set(tag, { endTime, nextExercise });
    setTimeout(() => {
      self.registration.showNotification('¡Descanso finalizado!', {
        body: nextExercise ? 'Siguiente ejercicio: ' + nextExercise : '¡Es hora de entrenar!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [500, 200, 500],
        tag: 'rest-' + tag,
        renotify: true,
        requireInteraction: true,
      });
      restTimers.delete(tag);
    }, duration * 1000);
  }
  if (type === 'STOP_REST_TIMER') {
    const { tag } = payload;
    restTimers.delete(tag);
  }
});
