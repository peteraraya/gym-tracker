# ADR-003: Estrategia Offline-First con saveQueue

## Estado

Aceptado

## Contexto

GymLogiX se usa en gimnasios donde la conectividad puede ser intermitente o inexistente. La aplicación debe permitir a los usuarios registrar entrenamientos incluso sin conexión a internet, sincronizando los datos cuando se recupere la conexión.

## Decisión

Implementar una estrategia **offline-first** con los siguientes componentes:

1. **saveQueue (`lib/utils/saveQueue.ts`):** Cola de operaciones pendientes que se almacenan en IndexedDB/LocalStorage cuando no hay conexión. Al recuperar la conexión, se ejecuta `flush()` para reenviar todas las operaciones pendientes a Supabase.

2. **TanStack Query con `networkMode: 'offlineFirst'`:** Las consultas y mutaciones están configuradas para funcionar sin conexión, usando caché local y reintentos automáticos al recuperar la conectividad.

3. **Service Worker (`public/sw.js`):** Intercepta peticiones de red y sirve recursos estáticos desde caché cuando no hay conexión.

4. **PWA (Capacitor):** La aplicación se instala como app nativa y puede funcionar completamente offline una vez cargada.

## Consecuencias

### Positivas

- **Experiencia ininterrumpida:** Los usuarios pueden entrenar sin preocuparse por la conexión.
- **No pérdida de datos:** Las operaciones se encolan y se sincronizan automáticamente.
- **Mejor percepción de velocidad:** Las lecturas se sirven desde caché local inmediatamente.

### Negativas

- **Complejidad de resolución de conflictos:** Si el mismo dato se modifica offline y online, puede haber conflictos que requieren resolución manual.
- **Estado inconsistente temporalmente:** La UI puede mostrar datos que aún no se han sincronizado con el servidor.

### Mitigaciones

- `saveQueue` implementa reintentos con backoff exponencial (máximo 3 intentos).
- Las operaciones críticas (crear sesión, completar serie) se validan al sincronizar.
- Se muestra indicador visual de estado de conexión (`ConnectionIndicator`).

## Fecha

2026-10-20
