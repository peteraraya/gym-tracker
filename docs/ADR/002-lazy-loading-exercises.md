# ADR-002: Carga Diferida de Ejercicios por Grupo Muscular

## Estado

Aceptado

## Contexto

La base de datos de ejercicios de GymLogiX contiene más de 280 ejercicios con detalles completos (técnica, instrucciones, imágenes/GIFs, videos de YouTube). Importar todo este conjunto en cada carga de página (`EXERCISE_DATABASE` de ~30,000 líneas / ~500 KB+) generaba un impacto significativo en el tiempo de carga inicial, especialmente en redes móviles.

## Decisión

Dividir los ejercicios en archivos separados por grupo muscular y crear un índice ligero (`EXERCISE_INDEX`) con solo metadatos esenciales (id, nombre, grupo muscular, equipamiento, imagen).

- **Vista de grupos musculares:** Usa `EXERCISE_INDEX` (~35 KB) para mostrar conteos y tarjetas de grupos sin cargar detalles completos.
- **Entrar a un grupo específico:** Carga dinámicamente solo ese archivo mediante `import()` de Next.js (code splitting automático), obteniendo solo 20-30 ejercicios.
- **Búsqueda global:** Usa el índice ligero para filtrar; los detalles completos se cargan lazy al hacer clic en un ejercicio.

## Consecuencias

### Positivas

- **Reducción ~93%** en datos transferidos en carga inicial de `/exercises`.
- **Mejor rendimiento en móvil** (conexiones más lentas, datos limitados).
- **Next.js genera chunks separados** por grupo muscular, aprovechando el code splitting automático.

### Negativas

- **Complejidad adicional:** Se requieren scripts de generación y mantenimiento para dividir el archivo base.
- **Dos fuentes de verdad:** `EXERCISE_DATABASE` (completo) y `EXERCISE_INDEX` (ligero) deben mantenerse sincronizadas.

### Mitigaciones

- Se crearon scripts `scripts/split-exercises-by-muscle.mjs` y `scripts/generate-exercise-index.mjs` para regenerar los archivos divididos automáticamente.
- Se creó `data/exercises/compat.ts` como capa de compatibilidad para código existente que aún dependa de `EXERCISE_DATABASE`.

## Fecha

2026-10-20
