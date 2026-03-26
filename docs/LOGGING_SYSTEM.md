# Sistema de Logging Estructurado - Implementación

## Resumen

Se ha implementado un sistema de logging estructurado que reemplaza los 100+ `console.log/warn/error` dispersos en el código con un logger centralizado, configurable y con contexto.

## Archivos Creados

### `lib/logger/index.ts`
Logger principal con las siguientes características:
- 4 niveles: `debug`, `info`, `warn`, `error`
- Filtrado por nivel según entorno
- Timestamps automáticos en formato ISO
- Contexto estructurado (metadata)
- Soporte para objetos Error
- Singleton pattern para consistencia

### `lib/logger/README.md`
Documentación completa con:
- Guía de uso
- Ejemplos por caso de uso
- Best practices
- Guía de migración desde console

## Archivos Actualizados

### Archivos Principales
1. **`lib/storage/storage.ts`** - 30+ reemplazos
   - Todos los console.log/warn/error reemplazados
   - Logger con contexto `{ module: 'storage' }`
   - Metadata estructurada en cada log

2. **`lib/supabase/service.ts`** - 6 reemplazos
   - Console.warn reemplazados con logger.warn
   - Contexto `{ module: 'supabase-service' }`

3. **`lib/supabase/client.ts`** - 1 reemplazo
   - Warning de configuración con logger

4. **`lib/supabase/server.ts`** - 1 reemplazo
   - Warning de configuración con logger

5. **`lib/validation/schemas.ts`** - 1 reemplazo
   - Validación con logger estructurado

### Configuración
- **`.env.local.example`** - Variable `NEXT_PUBLIC_LOG_LEVEL` agregada

## Características del Sistema

### 1. Niveles de Log
```typescript
logger.debug('Mensaje de debug');  // Solo en desarrollo
logger.info('Operación exitosa');   // Producción y desarrollo
logger.warn('Advertencia');         // Producción y desarrollo
logger.error('Error crítico');      // Producción y desarrollo
```

### 2. Contexto Estructurado
```typescript
logger.info('Rutina guardada', { 
  routineId: '123', 
  userId: 'abc',
  operation: 'createRoutine' 
});
```

### 3. Manejo de Errores
```typescript
try {
  await operation();
} catch (err) {
  logger.error('Operación falló', 
    { critical: true, operation: 'saveData' },
    err instanceof Error ? err : undefined
  );
}
```

### 4. Logger con Contexto
```typescript
const logger = createLogger({ module: 'storage' });
// Todos los logs incluirán automáticamente module: 'storage'
```

## Configuración por Entorno

### Development
```bash
NEXT_PUBLIC_LOG_LEVEL=debug  # Muestra todos los logs
```

### Production
```bash
NEXT_PUBLIC_LOG_LEVEL=info   # Oculta logs de debug
```

### Staging
```bash
NEXT_PUBLIC_LOG_LEVEL=warn   # Solo warnings y errors
```

## Formato de Output

```
[2024-02-28T10:30:45.123Z] [INFO] Rutina guardada {"module":"storage","routineId":"123"}
[2024-02-28T10:30:46.456Z] [ERROR] Error al guardar {"critical":true,"operation":"saveRoutine"} Error: Connection failed
```

## Beneficios

### 1. Debugging Mejorado
- Contexto estructurado facilita búsqueda de logs
- Timestamps precisos para análisis temporal
- Metadata adicional sin contaminar el mensaje

### 2. Producción
- Filtrado por nivel reduce ruido en producción
- Logs estructurados facilitan análisis automatizado
- Información crítica siempre visible

### 3. Mantenibilidad
- API consistente en todo el código
- Fácil de extender (ej: enviar a servicio externo)
- Type-safe con TypeScript

### 4. Performance
- Logs de debug eliminados en producción
- Sin overhead de string concatenation innecesaria
- Lazy evaluation del contexto

## Próximos Pasos

### Archivos Pendientes de Migración
Aún quedan algunos archivos con console.log/warn/error:
- Componentes React (contexts, pages)
- Hooks personalizados
- Utilidades varias

### Mejoras Futuras
1. **Integración con servicios externos**
   - Sentry para errors
   - LogRocket para debugging
   - CloudWatch/DataDog para analytics

2. **Logs estructurados avanzados**
   - Correlation IDs para tracing
   - User context automático
   - Performance metrics

3. **Dashboard de logs**
   - Visualización en tiempo real
   - Filtros avanzados
   - Alertas automáticas

## Uso Recomendado

### Para Nuevas Features
```typescript
import { createLogger } from '@/lib/logger';

const logger = createLogger({ module: 'nueva-feature' });

export function nuevaFuncion() {
  logger.debug('Iniciando operación');
  
  try {
    // código
    logger.info('Operación exitosa', { resultado: data });
  } catch (err) {
    logger.error('Error en operación', {}, err instanceof Error ? err : undefined);
    throw err;
  }
}
```

### Para Debugging
```typescript
logger.debug('Estado actual', {
  workout: workout.id,
  exercises: workout.exercises.length,
  duration: workout.duration,
  status: workout.status
});
```

### Para Errores Críticos
```typescript
logger.error('Error crítico al guardar', {
  critical: true,
  operation: 'saveToDatabase',
  userId: user.id,
  dataSize: data.length
}, error);
```

## Testing

El logger puede ser fácilmente mockeado en tests:

```typescript
jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}));
```

## Conclusión

El sistema de logging estructurado está implementado y funcionando en los archivos más críticos del proyecto (storage, supabase, validation). Proporciona una base sólida para debugging en desarrollo y monitoreo en producción, con la flexibilidad de extenderse según las necesidades del proyecto.
