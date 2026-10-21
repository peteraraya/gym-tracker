# Career Timeline (Línea de Tiempo Interactiva)

**Estado**: `completa`
**Agentes involucrados**: designer, frontend, qa-tester

## 1. Problema y objetivo

- **Problema que resuelve**: el CV muestra experiencia y educación en textos largos (secciones `ExperienceSection`/`EducationSection`) que son difíciles de escanear. Un reclutador quiere ver de un vistazo la trayectoria cronológica (empresas, puestos, educación) con capacidad de filtrar y explorar proyectos por hito.
- **Usuario objetivo**: reclutadores y visitantes que quieren evaluar el perfil de Pedro de forma rápida e interactiva.
- **Criterio de éxito**: el visitante puede ver la trayectoria ordenada cronológicamente, filtrar por categoría (experiencia/educación), y expandir cada hito para ver proyectos/logros, sin salir de la página y con estética blue coherente (design-system).

## 2. Alcance

**Incluye**:
- Nueva página `/career` visible en la navegación (desktop y mobile).
- Timeline vertical animado (framer-motion) combinando `cv.experience` y `cv.education`, ordenado de más reciente a más antiguo.
- Filtro por categorías: `all` / `work` / `education`.
- Tarjetas expandibles: en cada hito de experiencia, mostrar proyectos y logros; en educación, mostrar institución.
- Alternancia de "modo plano" (vista normal) — opcional, segura y barata de implementar (ver §3).
- i18n es/en para todo el texto de UI del feature.
- Estados: empty (cuando un filtro no tiene resultados) y loading (dado que los datos son locales síncronos, el loading se modela como micro-skeleton opcional bajo prefetch — ver nota en §3).

**No incluye (fuera de alcance para esta iteración)**:
- Backend ni API propia (los datos vienen de `src/data/cv.ts`, síncronos; no hay consumo de red).
- Persistencia de preferencia de filtro en `localStorage`/Zustand (se deja como posible mejora).
- Formulario ni CRUD de hitos.
- Vista de mapa/geolocalización.

## 3. Especificación UX/UI (`designer`)

**Patrón**: timeline vertical con línea guía izquierda, nodos circulares en cada hito y tarjetas a la derecha (coherente con `router.tsx:63` fondo `bg-gray-50 dark:bg-gray-900`, y con el estilo del `ExperienceSection` que ya usa línea y nodos azules en `ExperienceSection.tsx:123-132`).

- **Layout de página**: encabezado con título + descripción (reusar patrón de `AboutPage`), luego los controles de filtro, luego el timeline.
- **Controles de filtro**: 3 botones tipo pill: "Todo" / "Experiencia" / "Educación". Estado activo = `bg-blue-600 text-white`; inactivo = `bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300` con hover blue suave. El filtro activo también debe distinguirse no solo por color (accesibilidad: ver es/[] para el atributo `aria-pressed` o `aria-selected`).
- **Estados del nodo por categoría**:
  - Hito de **experiencia**: nodo azul (`bg-blue-600`), ícono `Briefcase`, borde blanco/`gray-900` (igual que nodo existente).
  - Hito de **educación**: nodo con variante neutral/fría azulada — `bg-gray-500`/`bg-slate-500` con ícono `GraduationCap`, para no romper la regla de "acentos decorativos solo blue" pero diferenciar semánticamente la categoría (diferencia de *forma* de ícono + color azulado, NO rojo/ámbar/verde).
- **Animación (framer-motion)**: cada tarjeta `initial={{opacity:0, x:-20}} whileInView={{opacity:1,x:0}}` con `viewport={{ once:true, margin:"-50px" }}`; el nodo `scale:0→1` con delay. Expansión de tarjetas con `AnimatePresence` + `height:auto`.
- **Estados a diseñar**:
  - default / hover (tarjeta `hover:border-blue-500`) / focus (ring blue visible en controles y tarjetas interactivas) / active (filtro seleccionado).
  - loading: los datos son síncronos; se define un micro-skeleton simple (3 filas con `animate-pulse`) que se muestra SOLO si la prop `loading` está en true (para reutilización futura si se conecta a red). En `/career` con datos locales, `loading=false`.
  - error: no aplica a datos locales (sin fetch); no se diseña UI de error para esta iteración (fuera de alcance).
  - vacío: cuando `all/work/education` filtra y no hay resultados → estado vacío con ícono y texto ("No hay elementos en esta categoría"), reusando el patrón de `projects.noResults`.

**Casos de error a contemplar**:
- Filtro sin resultados (borde del sistema): mostrar empty state, no romper ni mostrar nada en blanco.
- Contenido largo (p. ej. hito con muchos logros): la tarjeta crece con scroll natural; el borde/timeline se mantiene estético (no cortado).
- Cambio de idioma es/en: los textos de UI cambian de inmediato (`useTranslation`); el contenido de CV proviene de `cvData[i18n.language]` como ya hace `router.tsx:36`.

**Requisitos de accesibilidad específicos**:
- Contraste WCAG AA en todo texto y controles (verificar tokens).
- Controles entre sí distinguibles sin color (ícono/forma + `aria-pressed`).
- Tarjetas/reveal animado NO capturar el foco ni provocar saltos de layout bruscos; el contenido debe ser accesible aunque la animación esté desactivada (`whileInView` con `once`).
- Elementos expandibles accesibles por teclado (botón con `aria-expanded` / `aria-controls`).
- Respetar `prefers-reduced-motion`: hacer las animaciones condicionales o usar `useReducedMotion` de framer-motion.

**Tokens visuales (ver `/context/design-tokens.md`)**:
- Acento: `blue-600` (light) / `blue-400` (dark).
- Fondo/superficies: `gray-50`/`white` (light), `gray-900`/`gray-800` (dark).
- Borde: `gray-200` (light) / `gray-700` (dark).
- Texto: `gray-900` (light) / `gray-100` (dark).
- Énfasis semántico de categoría educación: `slate-500`/`gray-500` (neutro frío azulado), NO verde/rojo/ámbar.

## 4. Contrato de datos (sin backend — fuente local `src/types/cv.ts`)

```ts
// Fuente de datos (ya existe, NO se modifica el schema)
// cv.experience: Experience[] { company, role, period, projects?, achievements? }
// cv.education:  Education[]  { title, institution, status? }

// Derivado en el cliente para el timeline (tipado local `TimelineEntry`):
type TimelineEntry =
  | { id: string; kind: 'work'; title: string; subtitle: string;
      period: string; details: string[]; group: string }
  | { id: string; kind: 'education'; title: string; subtitle: string;
      period?: string; details: string[]; group?: string }

type TimelineFilter = 'all' | 'work' | 'education'
```

- **Reglas de derivación** (definidas por `frontend`, no inventar campos que no existan):
  - `work`: mapear `experience[]` → `{ title: role, subtitle: company, period, details: achievements o flatten de projects[].achievements, group: proyectos nombres }`.
  - `education`: mapear `education[]` → `{ title, subtitle: institution, details: [] }`. La tupla `institution: "INACAP, 2014"` ya incluye año en texto; no se parsea a fecha (fuera de alcance).
  - Orden: por `period` de más reciente a más antiguo. Como `period` es texto libre, se ordena con heurística de año (extraer el primer `\d{4}` de cadena) y se documenta como deuda técnica (no hay fecha estructurada).
- **Permisos/autenticación**: no aplica (SPA, datos locales).

## 5. Implementación de UI (`frontend`)

- **Nuevos archivos**:
  - `src/pages/CareerPage.tsx` — página: encabezado + `CareerTimeline` + filtros.
  - `src/components/cv/CareerTimeline.tsx` — el timeline (lista de `TimelineEntry`, estados).
  - (opcional y recomendado) `src/lib/careerTimeline.ts` — helper de derivación `buildTimeline(cv): TimelineEntry[]` y `sortByPeriodDesc`, puro y testeable.
- **Ruteo**: registrar ruta `/career` en `src/app/router.tsx` (`createRoute`) y agregar `Link` /career en navegación desktop y mobile (junto a `/courses`, siguiendo mismo estilo que los links existentes `router.tsx:100-123`).
- **i18n**: agregar claves `career.*` en `src/lib/i18n.ts` (en y es): título, descripción, filtros (todo/experiencia/educación), estados vacío, `aria` labels. Reutilizar contenido de CV desde `cvData[i18n.language]`.
- **Estado**: sin Zustand; el filtro es estado local `useState<TimelineFilter>` en la página. Sin TanStack Query (datos síncronos locales).
- **Dependencias de visualización**: ninguna nueva (solo framer-motion + lucide-react ya presentes).

## 6. Criterios de aceptación (`qa-tester`)

- [x] `/career` renderiza un timeline con al menos todos los hitos de `experience` y `education` (contado desde `cvData`).
- [x] El orden es de más reciente a más antiguo (heurística de año), verificable en el DOM y por el test `sortByPeriodDesc`.
- [x] El filtro `work` oculta educación; `education` oculta experiencia; `all` muestra ambos (cubierto por `filterTimeline`).
- [x] Con un filtro que deja 0 resultados, se muestra el empty state, no un layout roto (test de componente).
- [x] Cada hito de experiencia expandible muestra sus proyectos/logros; la entidad expandida es accesible por teclado (`aria-expanded`).
- [x] El estado activo del filtro se indica con `aria-pressed="true"` además del estilo visual.
- [x] Al alternar idioma, los textos de UI cambian y el contenido de CV refleja `cvData[lang]` (mismo patrón que `router.tsx:36`).
- [x] `npm run build`, `npm run lint` y `npm run type-check` pasan.

**Casos negativos/límite a cubrir explícitamente** (nivel componente/hook):
- [x] `buildTimeline` con `experience` vacío y `education` vacío → array vacío (sin crash).
- [x] `sortByPeriodDesc` con periodos sin año → empate estable (fallback 0, no lanza).
- [x] Entrada con `details` largo → la tarjeta/lista no se rompe (tarjetas crecen con scroll natural).
- [x] Filtro `education` con `education: []` → empty state (test de componente con props controladas).

## 7. Decisiones registradas

(A registrar en `/context/project-context.md` al cierre)
- Derivación `buildTimeline` y ordenación por heurística de año (deuda técnica: `period` es texto libre, no fecha estructurada).
- Nodos de educación usan variante neutra azulada (`slate/gray`) con ícono `GraduationCap`; los de experiencia usan `blue` + `Briefcase` — se mantiene la regla de "acentos decorativos solo blue", diferenciando por forma de ícono.

## 8. Historial de handoffs

| Fecha | De → A | Artefacto | Notas |
|---|---|---|---|
| 2026-08-30 | designer → frontend | esta spec (UX/UI, filtros, estados, tokens) | frontend implementa §5 respetando §3 y §6 |
| 2026-08-30 | frontend → qa-tester | `CareerPage`, `CareerTimeline`, `careerTimeline.ts`, ruta `/career`, i18n | QA cubre §6; build/lint/type-check verdes |
| 2026-08-30 | qa-tester → orchestrator | 16 tests nuevos (11 helper + 5 componente), DoD verificado | spec marcada `completa` |
