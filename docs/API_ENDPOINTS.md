# API — Endpoints internos

Este documento resume los endpoints implementados en la carpeta `app/api` (Next.js App Router) y los helpers importantes en `lib/supabase`. Incluye método, ruta, autenticación requerida, cuerpo de petición y respuestas resumen.

> Nota: muchas rutas usan `createClient()` de Supabase en el servidor — revisa [lib/supabase/server.ts](lib/supabase/server.ts#L1-L57) para el comportamiento del cliente servidor y las variables de entorno.

## Variables de entorno relevantes

- `NEXT_PUBLIC_ENABLE_DATABASE` — si != 'true' muchos endpoints devuelven 503 para permitir modo offline.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — cliente Supabase.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` — necesarias para envío de push (`/api/push-send`).

## Resumen rápido de endpoints

- `GET /api/routines` — Listar rutinas del usuario. [app/api/routines/route.ts](app/api/routines/route.ts#L1-L200)
- `POST /api/routines` — Crear rutina. [app/api/routines/route.ts](app/api/routines/route.ts#L1-L200)
- `PUT /api/routines/[id]` — Actualizar rutina por id. [app/api/routines/[id]/route.ts](app/api/routines/[id]/route.ts#L1-L80)
- `DELETE /api/routines/[id]` — Eliminar rutina. [app/api/routines/[id]/route.ts](app/api/routines/[id]/route.ts#L80-L160)
- `GET /api/profile` — Obtener perfil del usuario. [app/api/profile/route.ts](app/api/profile/route.ts#L1-L60)
- `POST /api/profile` — Crear/Actualizar perfil. [app/api/profile/route.ts](app/api/profile/route.ts#L60-L152)
- `GET /api/sessions` — Listar sesiones del usuario. [app/api/sessions/route.ts](app/api/sessions/route.ts#L1-L120)
- `POST /api/sessions` — Crear una sesión (registro de entrenamiento). [app/api/sessions/route.ts](app/api/sessions/route.ts#L120-L240)
- `POST|GET|DELETE /api/push-subscribe` — Registrar/obtener/eliminar suscripciones push (dev). [app/api/push-subscribe/route.ts](app/api/push-subscribe/route.ts#L1-L78)
- `POST|GET /api/push-send` — Enviar notificación push individual o bulk (requiere VAPID). [app/api/push-send/route.ts](app/api/push-send/route.ts#L1-L160)
- `POST /api/weekly-export` — Genera PDF del plan semanal (usa Puppeteer). [app/api/weekly-export/route.ts](app/api/weekly-export/route.ts#L1-L90)

---

## Endpoints detallados

### /api/routines
- Métodos: `GET`, `POST`
- Autenticación: Sí — usa `supabase.auth.getUser()` en servidor.

- GET — Descripción: devuelve las rutinas del usuario con sus ejercicios transformados al formato usado por frontend.
  - Respuestas:
    - `200` Array de rutinas (cada rutina incluye `id`, `name`, `description`, `image`, `restBetweenSets`, `restBetweenExercises`, `exercises`)
    - `401` si no autenticado
    - `503` si `NEXT_PUBLIC_ENABLE_DATABASE !== 'true'`

- POST — Descripción: crea una rutina con ejercicios relacionados.
  - Cuerpo (JSON) mínimo esperado:
    ```json
    {
      "name": "Nombre rutina",
      "exercises": [
        { "name": "Sentadilla", "sets": [{ "reps": 8, "weight": 80 }] }
      ]
    }
    ```
  - Respuestas:
    - `201` { success: true, id }
    - `400` datos inválidos
    - `401` no autenticado
    - `500` errores de BD

Ver implementación: [app/api/routines/route.ts](app/api/routines/route.ts#L1-L200)

### /api/routines/[id]
- Métodos: `PUT`, `DELETE`
- Autenticación: Sí

- PUT — Actualiza rutina (recibe payload similar a POST). Realiza borrado/inserción de ejercicios y devuelve `success: true`.
- DELETE — Elimina la rutina (valida `user_id`).

Ver implementación: [app/api/routines/[id]/route.ts](app/api/routines/[id]/route.ts#L1-L160)

### /api/profile
- Métodos: `GET`, `POST`
- Autenticación: Sí

- GET — Devuelve el perfil del usuario o `null` si no existe.
- POST — Crea o actualiza el perfil. Campos: `age`, `gender`, `height`, `weight`, `fitnessGoal`, `fitnessLevel`, `weeklyWorkouts`.

Ver implementación: [app/api/profile/route.ts](app/api/profile/route.ts#L1-L152)

### /api/sessions
- Métodos: `GET`, `POST`
- Autenticación: Sí

- GET — Devuelve sesiones del usuario con `session_exercises` incluido (ej: `actualReps`, `actualWeight`, `completedSets`).
- POST — Crea una sesión con su lista de ejercicios. Body mínimo:
  ```json
  {
    "routineId": "uuid-routine",
    "exercises": [{
      "exerciseId": "uuid-exercise",
      "completedSets": 3,
      "actualReps": [8,8,7],
      "actualWeight": [80,80,80]
    }]
  }
  ```

Ver implementación: [app/api/sessions/route.ts](app/api/sessions/route.ts#L1-L240)

### /api/push-subscribe
- Métodos: `POST`, `GET`, `DELETE`
- Uso: almacenamiento temporal de suscripciones (en memoria). Pensado para desarrollo; en producción guardar en DB.

Ver implementación: [app/api/push-subscribe/route.ts](app/api/push-subscribe/route.ts#L1-L78)

### /api/push-send
- Métodos: `POST`, `GET`
- Uso: envía notificaciones push usando `web-push`. Requiere VAPID keys configuradas.

Ver implementación: [app/api/push-send/route.ts](app/api/push-send/route.ts#L1-L160)

### /api/weekly-export
- Método: `POST`
- Descripción: recibe `plan` y `routines` y devuelve un `application/pdf` generado con Puppeteer.
- Atención: el endpoint no realiza comprobación de auth en su implementación actual (revisar si quieres restringirlo).

Ver implementación: [app/api/weekly-export/route.ts](app/api/weekly-export/route.ts#L1-L90)

---

## Helpers y servicios relacionados

- `lib/supabase/service.ts` — funciones que replican operaciones CRUD (getRoutines, createRoutine, updateRoutine, deleteRoutine, etc.). Útil como referencia para payloads y shapes de respuesta. [lib/supabase/service.ts](lib/supabase/service.ts#L1-L200)
- `lib/supabase/server.ts` — cliente Supabase para Server Components / API routes. [lib/supabase/server.ts](lib/supabase/server.ts#L1-L57)
- `lib/supabase/client.ts` — cliente para ejecución en browser. [lib/supabase/client.ts](lib/supabase/client.ts#L1-L26)

## Recomendaciones para documentación adicional

- Generar documentación automática de `lib/` con `TypeDoc` y agregar salida en `docs/api` (ver README para comandos sugeridos).
- Añadir ejemplos de petición/respuesta para cada endpoint en `docs/` y actualizar cuando cambie la API.
- Revisar `NEXT_PUBLIC_ENABLE_DATABASE` y añadir nota en la documentación si el endpoint puede servir en modo offline.

## Próximos pasos sugeridos

1. Generar `typedoc` para `lib/` y publicar en `docs/api`.
2. Añadir ejemplos curl/POSTMAN para `POST /api/sessions` y `POST /api/routines`.
3. Decidir y aplicar auth en `weekly-export` si debe quedar protegido.

---

Archivo generado automáticamente por el flujo de documentación inicial.
