# 🔍 Auditoría Integral — Gym Tracker

**Fecha:** 2026-09-10
**Alcance:** UX/UI, producto y desarrollo técnico. Cada hallazgo incluye referencia `archivo:línea`.

---

## 1. Resumen ejecutivo

La app tiene una base sólida: buena cobertura de features (mesociclos MEV/MAV/MRV, modo guiado, calculadoras, logros), i18n es/en, React Query, virtualización y documentación abundante. Sin embargo, hay **3 bloques críticos** que frenan la experiencia:

1. **Accesibilidad rota en la acción principal del producto** (completar una serie solo por swipe) y **zoom deshabilitado globalmente**.
2. **Deuda de consistencia** alta: dos `PageLayout`, dos fuentes de iconos, i18n mixto (522 vs 530 claves, 8 solo en inglés), y bugs de mensajería.
3. **Rendimiento arquitectural**: árbol 100% client, monolitos de componentes (110 KB `QuickEditMode`), sin prefetch.

---

## 2. 🔴 Hallazgos críticos (bugs reales)

| # | Problema | Evidencia | Impacto |
|---|---|---|---|
| 1 | **Progress nunca muestra loading** — `const loading = false` hardcodeado; la rama skeleton es código muerto y al cargar se ve "No hay datos". | `app/progress/page.tsx:25,170-194` | Percepción de datos perdidos |
| 2 | **Registro duplicado dice "¡Cuenta creada!"** — si el correo ya existe, muestra éxito en vez de "ya está registrado". | `app/auth/page.tsx:98-103` | Confusión/abandono |
| 3 | **Tendencia falsa en Dashboard** — `isPositive: stats.totalSessions >= 0` es siempre verdadera → "↗ 0%" permanente. | `app/dashboard/page.tsx:290,329` | Métricas engañosas |
| 4 | **Código muerto en Workout** — el panel de "Preconfiguración rápida" nunca renderiza (la guarda ya retorna card "sin ejercicios"). | `app/workout/[id]/page.tsx:286-394` | Complejidad sin función |
| 5 | **Toneladas redondeadas mal** — `achievements` usa `.toFixed(0)`: 500 kg → "1t", 1499 kg → "1t". `sessions` usa `.toFixed(1)`. | `app/achievements/page.tsx:133` vs `app/sessions/page.tsx:142` | Datos incorrectos |
| 6 | **RLS en `profiles` sin políticas** — bloquea perfil/plan/last_weights con DB (error visto en consola). | `supabase/migrations/2026-09-10_profiles_rls_policies.sql` (fix pendiente de aplicar) | Feature rota |

---

## 3. ♿ Accesibilidad (bloqueante para retención móvil)

- **Zoom deshabilitado globalmente**: `userScalable:false` en `app/layout.tsx:44-46` + `DisableZoom.tsx` bloquea Ctrl+rueda y pinch. Violación WCAG 1.4.4 (escala de texto).
- **Completar serie se logra solo deslizando** (`SwipeButton.tsx:46-80`): sin `role="button"`, sin `tabIndex`, sin teclado. **La acción central del producto es inaccesible para teclado/lectores de pantalla.**
- Panel "Más" de la bottom nav (`BottomNavBar.tsx:108-170`): sin `role="dialog"`, sin focus trap, no cierra con Escape.
- Botones RPE se distinguen por color+emoji (`workout/[id]/page.tsx:121-145`); `select`s sin asociación programática correcta (profile); texto `text-[10px]` y targets táctiles minúsculos en 9 lugares de Planning (`planning/page.tsx:180,211,635,735,1385,1397,1461,1471,1476`).
- Vista del mensaje de error de conexión "⚠️" en auth (`app/auth/page.tsx:107`).

---

## 4. 🎨 UX/UI — fricciones del flujo

- **Dashboard**: Quick Actions desaparecen con 1 sola sesión (`dashboard/page.tsx:535-544`); si el perfil falla, el header queda mudo sin retry.
- **Routines**: FAB "Entrenamiento Libre" compite con AI Assistant + bottom nav en móvil (`routines/page.tsx:462-472`); duplicado tiene delay artificial de 300 ms (`:219`).
- **Workout**: RPE se pregunta cada serie sin opción de desactivarlo; terminar rutina faltando ejercicios no existe en `[id]` (sí en free); timer sin "minimizar" en free (`workout/free/page.tsx:238-258`).
- **Planning**: borra mesociclo con `confirm()` nativo del navegador (inconsistente con `useConfirm()`); targets se clampean en silencio; CreateMesocycleModal no cierra con overlay/Escape; sobrecarga cognitiva de micro-datos por fila.
- **Profile**: sin campo nombre/apodo, sin historial de peso corporal, unidades kg/lb ausentes → el dashboard ni saluda y no hay curva de peso.
- **Auth/setup**: sin OAuth social; Setup es 100% técnico y asume que el usuario lee `.env.local`.
- **Sessions**: empty state **sin CTA** de acción (`sessions/page.tsx:464-469`); no hay "duplicar sesión" ni export/backup.

---

## 5. 📈 Producto y retención

Fortalezas: streak, heatmap, logros, modo guiado, mesociclos.

Oportunidades de mayor impacto:
1. **Calculadoras desconectadas del tracker** — 1RM/TDEE calculados no alimentan rutinas/PRs (`app/calculators/page.tsx`). Integrar es alto valor.
2. **Sin recordatorios reales** — Settings solo tiene un *tester* de push técnico, no configuración de "días/hora de entrenamiento".
3. **Sin historial de peso corporal** — feature clave de retención en fitness (foto inicial vs actual).
4. **Sesión sin resumen de volumen parcial en vivo** durante el entrenamiento.
5. **Logros sin compartir** (share/og-image) — growth barato.
6. **Empty states inconsistentes**: Sessions sin CTA; Progress sin ruta accionable; Dashboard no celebra el primer hito.

---

## 6. ⚙️ Técnico / rendimiento

- **Árbol 100% client**: layout con múltiples providers (`layout.tsx:56-114`) convierte toda la app en client; sin Server Components para partes estáticas → JS inicial alto.
- **Monolitos**: `QuickEditMode.tsx` ≈ **110 KB**, `RoutineForm` ≈ 64 KB, Planning ≈ 77 KB. El code-splitting existe pero por página, no por feature interna.
- **React Query sin prefetch/hidratación** y con `refetchOnMount:false` en el queryClient global → datos stale.
- **next-intl instalado pero no usado**: se usa un `LocaleContext` custom; `messages/en.json` tiene **8 claves que faltan en `es.json`** (`routines.noRoutines`, `routines.createRoutine`, `routines.exercises`, `routines.startRoutine`, `routines.editRoutine`, `routines.deleteRoutine`, `routines.noRoutinesDesc`, `volumeChart.units.kg`) — la UI española muestra la clave cruda en vez de traducir.
- **API routes muertas o frágiles**: rutas `routines`/`sessions` retornan 503 si `ENABLE_DATABASE!=true`; endpoints push sin chequeo de sesión.
- **Seguridad**: `VAPID_PRIVATE_KEY` y `VERCEL_OIDC_TOKEN` en archivos de entorno en disco (no trackeados, pero frágiles); la fuga es de práctica operativa más que de código.
- **Esquema duplicado**: docs y `schema.sql` crean `user_profiles`, pero el código y migraciones usan `profiles` → ambigüedad mantenible (`lib/supabase/service.ts:534`).
- **Inconsistencia de storage**: claves localStorage mezclan `gym_tracker_*` y `gym-tracker-*`.

---

## 7. ✅ Plan de remediación priorizado

**Fase 0 — Datos correctos (1 día)**
- Aplicar migración RLS de `profiles`; cambiar diálogo auth ("cuenta ya existe"); corregir `.toFixed(0)` de toneladas; quitar trending falso de Dashboard.

**Fase 1 — Accesibilidad (2-3 días)**
- Reintroducir zoom (`userScalable` + `DisableZoom.tsx` condicional al flujo guiado).
- Añadir `role/tabIndex/onKeyDown` a `SwipeButton` (y un botón alternativo "Completar" de accesibilidad).
- Roles/aria/focus-trap en panel "Más" y modales de Planning.

**Fase 2 — Consistencia (2-3 días)**
- Unificar a `@/layouts/PageLayout` y a `@/components/icons/lucide`; completar las 8 claves en `es.json`; unificar formato de toneladas/volumen en un helper (`lib/utils/volumeCalculations.ts` ya existe).

**Fase 3 — Perf (1-2 días)**
- Conectar `loading` real en Progress; separar `QuickEditMode` en lazy chunks; prefetch de rutinas/sesiones con React Query en layout.

**Fase 4 — Producto (roadmap)**
- Historial de peso corporal → integrar con calculadoras (1RM) → recordatorios configurables → "duplicar sesión" → share de logros → resumen de volumen en vivo.

---

## 8. 📊 Métricas a instrumentar

- Time-to-first-set (primer input completado en sesión), tasa de completar sesión iniciada, días/semana activos, abandono en el wizard de rutinas, % de usuarios con perfil completo.