// Service Worker para PWA con soporte offline completo
const CACHE_NAME = 'gym-tracker-v1';
const RUNTIME_CACHE = 'gym-tracker-runtime-v1';
const IMAGE_CACHE = 'gym-tracker-images-v1';

// Recursos críticos para cachear en la instalación
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/routines',
  '/progress',
  '/sessions',
  '/exercises',
  '/ai-assistant',
  '/offline',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && 
                     cacheName !== RUNTIME_CACHE && 
                     cacheName !== IMAGE_CACHE;
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

// Estrategia de caché para diferentes tipos de recursos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no sean GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requests a APIs externas (Supabase, etc.)
  if (url.origin !== self.location.origin) {
    // Para Supabase, intentar network first, luego cache
    if (url.hostname.includes('supabase')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Cachear respuestas exitosas de Supabase
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Si falla, intentar desde cache
            return caches.match(request);
          })
      );
      return;
    }
    // Otras APIs externas, solo network
    return;
  }

  // Estrategia para imágenes: Cache First
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

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

  // Estrategia para páginas HTML: Network First, luego Cache
  if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear la respuesta
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Si falla, buscar en cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Si no está en cache, mostrar página offline
              return caches.match('/offline');
            });
        })
    );
    return;
  }

  // Estrategia para otros recursos: Cache First, luego Network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Actualizar cache en background
          fetch(request).then((response) => {
            if (response.ok) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, response);
              });
            }
          }).catch(() => {});
          
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
      })
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Gym Tracker';
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ],
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  // ✨ NEW: Manejar acciones específicas de notificaciones de descanso
  if (event.action === 'skip') {
    // Enviar mensaje a la app para saltar el descanso
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          clientList.forEach(client => {
            client.postMessage({
              type: 'notification-action',
              action: 'skip',
              notificationData: event.notification.data
            });
          });
        })
    );
    return;
  }

  if (event.action === 'add-30s') {
    // Enviar mensaje a la app para añadir 30 segundos
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          clientList.forEach(client => {
            client.postMessage({
              type: 'notification-action',
              action: 'add-30s',
              notificationData: event.notification.data
            });
          });
        })
    );
    return;
  }

  if (event.action === 'continue') {
    // Enviar mensaje a la app para continuar
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          clientList.forEach(client => {
            client.postMessage({
              type: 'notification-action',
              action: 'continue',
              notificationData: event.notification.data
            });
          });
        })
    );
  }

  if (event.action === 'more-rest') {
    // Enviar mensaje a la app para más descanso
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          clientList.forEach(client => {
            client.postMessage({
              type: 'notification-action',
              action: 'more-rest',
              notificationData: event.notification.data
            });
          });
        })
    );
  }

  if (event.action === 'close') {
    return;
  }

  // Abrir o enfocar la app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url === self.location.origin && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir una nueva ventana
        if (clients.openWindow) {
          const urlToOpen = event.notification.data?.url || '/';
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background Sync para sincronizar datos cuando vuelva la conexión
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-workouts') {
    event.waitUntil(syncWorkouts());
  }
});

async function syncWorkouts() {
  try {
    // Obtener datos pendientes de sincronización desde IndexedDB
    const pendingData = await getPendingSyncData();
    
    if (pendingData.length === 0) {
      return;
    }

    // Intentar sincronizar con el servidor
    for (const data of pendingData) {
      try {
        const response = await fetch(data.url, {
          method: data.method,
          headers: data.headers,
          body: JSON.stringify(data.body)
        });

        if (response.ok) {
          // Marcar como sincronizado
          await markAsSynced(data.id);
        }
      } catch (error) {
        console.error('[SW] Error syncing data:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Error in syncWorkouts:', error);
  }
}

// Helpers para IndexedDB (simplificado)
async function getPendingSyncData() {
  // Implementar lectura de IndexedDB
  return [];
}

async function markAsSynced(id) {
  // Implementar actualización en IndexedDB
}

// Periodic Background Sync (experimental)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'update-stats') {
    event.waitUntil(updateStats());
  }
});

async function updateStats() {
  // Actualizar estadísticas en background
  console.log('[SW] Updating stats in background');
}

// Helper: formatea segundos a MM:SS
function formatSeconds(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// Genera un data URL SVG con el número grande (para usar en `notification.image`)
function createNumberSVGDataUrl(number, opts = {}) {
  const width = opts.width || 512;
  const height = opts.height || 256;
  const bg = opts.bg || '#0f172a'; // fondo oscuro
  const fg = opts.fg || '#ffffff'; // texto claro
  const fontSize = opts.fontSize || Math.floor(height * 0.6);
  const fontFamily = opts.fontFamily || 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
  const sanitized = String(number)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" rx="28" fill="${bg}"/>` +
    `<text x="50%" y="50%" fill="${fg}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="700" dominant-baseline="middle" text-anchor="middle">${sanitized}</text>` +
    `</svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Message handling para comunicación con la app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (!event.data || !event.data.type) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
    return;
  }

  // ===== REST TIMER MESSAGES =====
  // START_REST -> inicia/actualiza una notificación con cuenta regresiva
  if (event.data.type === 'START_REST') {
    const duration = Number(event.data.duration) || 0;
    // Forzamos siempre el título 'Descanso' en la notificación para evitar
    // que otros mensajes (p.ej. de bienvenida) sobreescriban el texto.
    const title = 'Descanso';
    const nextExercise = event.data.nextExercise;
    const tag = event.data.tag || 'rest-timer';
    const endTime = Number(event.data.endTime) || (Date.now() + duration * 1000);

    self._restNotifications = self._restNotifications || {};
    self._restIntervals = self._restIntervals || {};

    self._restNotifications[tag] = { endTime, title, nextExercise };

    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    const formatted = formatSeconds(remaining);

    // Base options for the notification updates. Use the same `tag` so updates replace the notification.
    const baseOptions = {
      body: title,
      tag,
      renotify: false, // actualizar sin volver a notificar (sin sonido/vibración cada vez)
      requireInteraction: true,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { endTime, nextExercise },
      actions: event.data.actions || [
        { action: 'skip', title: 'Saltar' },
        { action: 'add-30s', title: '+30s' },
        { action: 'close', title: 'Cerrar' }
      ]
    };

    // Initial notification: include a vibration so user notices start and an image
    const initialOptions = Object.assign({}, baseOptions, {
      vibrate: [200, 100, 200],
      image: createNumberSVGDataUrl(formatted, { width: 512, height: 256 })
    });

    // Show the remaining time as the notification title (aparece grande en muchas UIs)
    self.registration.showNotification(formatted, initialOptions);

    // Limpiar intervalo anterior si existe
    if (self._restIntervals[tag]) {
      clearInterval(self._restIntervals[tag]);
    }

    // Intentar mantener la notificación actualizada desde el SW (su ejecución puede interrumpirse por el runtime)
    self._restIntervals[tag] = setInterval(() => {
      try {
        const meta = self._restNotifications[tag];
        if (!meta) return;
        const remainingSec = Math.max(0, Math.ceil((meta.endTime - Date.now()) / 1000));
        const fmt = formatSeconds(remainingSec);
        // Use baseOptions for updates (no vibrate, no renotify)
        const opts = Object.assign({}, baseOptions, {
          data: { endTime: meta.endTime, nextExercise: meta.nextExercise },
          image: createNumberSVGDataUrl(fmt, { width: 512, height: 256 })
        });
        self.registration.showNotification(fmt, opts);

        if (remainingSec <= 0) {
          clearInterval(self._restIntervals[tag]);
          delete self._restIntervals[tag];

          self.registration.showNotification('Descanso terminado', {
            body: meta.nextExercise ? `Listo para: ${meta.nextExercise}` : 'Descanso finalizado',
            tag,
            renotify: true,
            vibrate: [300, 100, 300],
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
          });

          delete self._restNotifications[tag];
        }
      } catch (err) {
        console.error('[SW] Error updating rest notification:', err);
      }
    }, 1000);

    return;
  }

  // UPDATE_REST -> actualizar la notificación con tiempo restante proporcionado
  if (event.data.type === 'UPDATE_REST') {
    const tag = event.data.tag || 'rest-timer';
    const remaining = Number(event.data.remaining) || 0;

    self._restNotifications = self._restNotifications || {};
    const meta = self._restNotifications[tag] || { nextExercise: event.data.nextExercise };
    // Asegurar título fijo
    meta.title = 'Descanso';
    const formatted = formatSeconds(Math.max(0, remaining));

    self.registration.showNotification(formatted, {
      body: 'Descanso',
      tag,
      renotify: false,
      requireInteraction: true,
      data: { remaining },
      image: createNumberSVGDataUrl(formatted, { width: 512, height: 256 })
    });

    if (remaining <= 0) {
      // finalizar
      self.registration.showNotification('Descanso terminado', {
        body: meta.nextExercise ? `Listo para: ${meta.nextExercise}` : 'Descanso finalizado',
        tag,
        renotify: true,
        vibrate: [300, 100, 300],
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
      });

      if (self._restIntervals && self._restIntervals[tag]) {
        clearInterval(self._restIntervals[tag]);
        delete self._restIntervals[tag];
      }
      delete self._restNotifications[tag];
    }

    return;
  }

  // END_REST -> terminar y mostrar aviso final
  if (event.data.type === 'END_REST') {
    const tag = event.data.tag || 'rest-timer';
    if (self._restIntervals && self._restIntervals[tag]) {
      clearInterval(self._restIntervals[tag]);
      delete self._restIntervals[tag];
    }
    if (self._restNotifications && self._restNotifications[tag]) {
      const meta = self._restNotifications[tag];
      self.registration.showNotification('Descanso terminado', {
        body: meta.nextExercise ? `Listo para: ${meta.nextExercise}` : 'Descanso finalizado',
        tag,
        renotify: true,
        vibrate: [300, 100, 300],
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
      });
      delete self._restNotifications[tag];
    }
    return;
  }
});
