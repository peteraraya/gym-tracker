# Refactorización Fase 2 - Plan Detallado

## Objetivo
Refactorizar completamente las 4 páginas principales usando los componentes y hooks de la Fase 1.

## Páginas a Refactorizar

### 1. dashboard/page.tsx (1000+ líneas)
**Estado Actual:**
- Estructura manual con divs
- StatsCard antiguo (no el nuevo StatCard)
- Cálculos de estadísticas inline
- Header manual

**Cambios Necesarios:**
- ✅ Imports ya agregados (PageLayout, StatsGrid, StatCard, EmptyState, LoadingState)
- [ ] Reemplazar estructura manual con PageLayout
- [ ] Reemplazar grid manual con StatsGrid + StatCard nuevo
- [ ] Usar LoadingState para loading
- [ ] Usar EmptyState para sin datos
- [ ] Mantener lazy components (VolumeChart, etc.)

**Complejidad:** Alta (muchas líneas, muchos componentes)

---

### 2. progress/page.tsx (400+ líneas)
**Estado Actual:**
- Estructura manual
- Cálculos de volumen por grupo muscular
- Grid manual de tarjetas

**Cambios Necesarios:**
- [ ] Reemplazar estructura con PageLayout
- [ ] Usar StatsGrid para mostrar volumen por grupo muscular
- [ ] Usar EmptyState para sin datos
- [ ] Usar volumeCalculations.ts para cálculos

**Complejidad:** Media

---

### 3. sessions/page.tsx (400+ líneas)
**Estado Actual:**
- Estructura manual
- Filtrado manual
- Paginación manual

**Cambios Necesarios:**
- [ ] Reemplazar estructura con PageLayout
- [ ] Usar useFilteredData para filtrado + paginación
- [ ] Usar FilterPanel para filtros
- [ ] Usar EmptyState para sin datos
- [ ] Usar LoadingState para carga

**Complejidad:** Media

---

### 4. profile/page.tsx (350+ líneas)
**Estado Actual:**
- Estructura manual
- Múltiples formularios
- Fetch manual de datos

**Cambios Necesarios:**
- [ ] Reemplazar estructura con PageLayout
- [ ] Usar usePageData para fetch de perfil
- [ ] Usar LoadingState para carga
- [ ] Usar EmptyState para errores
- [ ] Mantener formularios (no hay componente genérico aún)

**Complejidad:** Media

---

## Estrategia de Implementación

### Fase 2.1: Dashboard (Hoy)
1. Reemplazar estructura con PageLayout
2. Reemplazar StatsCard antiguo con StatCard nuevo
3. Reemplazar loading con LoadingState
4. Reemplazar empty state con EmptyState
5. Verificar que todo funcione

### Fase 2.2: Progress (Mañana)
1. Reemplazar estructura con PageLayout
2. Usar StatsGrid para volumen por grupo muscular
3. Usar volumeCalculations.ts
4. Agregar EmptyState

### Fase 2.3: Sessions (Próximo)
1. Reemplazar estructura con PageLayout
2. Usar useFilteredData para filtrado
3. Usar FilterPanel para filtros
4. Agregar EmptyState y LoadingState

### Fase 2.4: Profile (Próximo)
1. Reemplazar estructura con PageLayout
2. Usar usePageData para fetch
3. Agregar LoadingState y EmptyState

---

## Beneficios Esperados

- **Reducción de código:** ~400-500 líneas
- **Consistencia visual:** 100%
- **Mantenibilidad:** +60%
- **Reutilización:** +80%

---

## Notas Importantes

1. **No romper funcionalidad:** Mantener toda la lógica existente
2. **Lazy components:** Mantener los lazy-loaded components
3. **Traducciones:** Mantener todas las traducciones
4. **Responsive:** Mantener diseño responsive
5. **Dark mode:** Mantener soporte para dark mode

---

## Checklist de Validación

- [ ] Página se renderiza sin errores
- [ ] Todos los datos se muestran correctamente
- [ ] Responsive en mobile
- [ ] Dark mode funciona
- [ ] Traducciones funcionan
- [ ] No hay console errors
- [ ] Performance es similar o mejor

---

## Próximos Pasos Después de Fase 2

### Fase 3: Componentes Adicionales
1. `components/DataTable.tsx` - Tabla genérica
2. `components/FormSection.tsx` - Sección de formulario
3. `hooks/useLocalStorage.ts` - Abstracción de localStorage
4. `lib/utils/dateFormatting.ts` - Formateo de fechas

### Fase 4: Optimizaciones
1. Code splitting adicional
2. Lazy loading de componentes
3. Memoización de cálculos
4. Optimización de renders

---

## Tiempo Estimado

- Dashboard: 30-45 minutos
- Progress: 20-30 minutos
- Sessions: 25-35 minutos
- Profile: 20-30 minutos
- **Total:** 95-140 minutos (~2 horas)

---

## Recursos

- Documentación: `docs/REFACTORING_USAGE_GUIDE.md`
- Ejemplos: `app/exercises/page.tsx` (ya refactorizada)
- Componentes: `components/PageLayout.tsx`, `components/StatsGrid.tsx`, etc.
- Hooks: `hooks/useFilteredData.ts`, `hooks/usePageData.ts`
