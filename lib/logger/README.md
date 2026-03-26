# Sistema de Logging Estructurado

Sistema de logging centralizado que reemplaza los `console.log/warn/error` dispersos en el código.

## Características

- **Niveles de log**: debug, info, warn, error
- **Contexto estructurado**: Metadata adicional en cada log
- **Filtrado por nivel**: Configurable por entorno
- **Timestamps automáticos**: Cada log incluye timestamp ISO
- **Type-safe**: Totalmente tipado con TypeScript

## Uso Básico

```typescript
import { logger } from '@/lib/logger';

// Logs simples
logger.debug('Mensaje de debug');
logger.info('Operación completada');
logger.warn('Advertencia');
logger.error('Error crítico');

// Con contexto adicional
logger.info('Usuario autenticado', { userId: '123', email: 'user@example.com' });
logger.error('Error al guardar', { operation: 'saveRoutine', routineId: 'abc' });

// Con error object
try {
  // código
} catch (err) {
  logger.error('Operación falló', { operation: 'updateProfile' }, err instanceof Error ? err : undefined);
}
```

## Logger con Contexto

Para módulos que siempre usan el mismo contexto:

```typescript
import { createLogger } from '@/lib/logger';

const logger = createLogger({ module: 'storage', component: 'routines' });

// Todos los logs incluirán automáticamente module y component
logger.info('Rutina creada', { routineId: '123' });
// Output: [timestamp] [INFO] Rutina creada {"module":"storage","component":"routines","routineId":"123"}
```

## Configuración

### Variables de Entorno

```bash
# Nivel mínimo de log (debug, info, warn, error)
NEXT_PUBLIC_LOG_LEVEL=info
```

### Niveles por Entorno

- **Development**: `debug` (muestra todos los logs)
- **Production**: `info` (oculta logs de debug)

## Ejemplos por Caso de Uso

### Operaciones de Storage

```typescript
const logger = createLogger({ module: 'storage' });

logger.info('Guardando rutina', { routineId: routine.id });
logger.error('Error al guardar', { critical: true, routineId: id }, error);
```

### Operaciones de API

```typescript
const logger = createLogger({ module: 'api', endpoint: '/api/sessions' });

logger.info('Request recibido', { method: 'POST', userId: user.id });
logger.warn('Rate limit alcanzado', { userId: user.id, attempts: 5 });
```

### Debugging

```typescript
logger.debug('Estado del workout', { 
  workoutId: workout.id, 
  exercises: workout.exercises.length,
  duration: workout.duration 
});
```

### Errores Críticos

```typescript
try {
  await saveToDatabase(data);
} catch (err) {
  logger.error('Error crítico al guardar', 
    { critical: true, operation: 'saveToDatabase', dataSize: data.length },
    err instanceof Error ? err : undefined
  );
  throw new Error('No se pudo guardar. Verifica tu conexión.');
}
```

## Migración desde console

### Antes

```typescript
console.log('[Storage] Active workout saved');
console.warn('[Storage] Supabase failed:', error);
console.error('[CRITICAL] Error al guardar:', error);
```

### Después

```typescript
logger.debug('Active workout saved', { operation: 'saveActiveWorkout' });
logger.warn('Supabase failed', { operation: 'saveActiveWorkout' }, error);
logger.error('Error al guardar', { critical: true }, error);
```

## Formato de Output

```
[2024-02-28T10:30:45.123Z] [INFO] Usuario autenticado {"userId":"123","email":"user@example.com"}
[2024-02-28T10:30:46.456Z] [ERROR] Error al guardar {"critical":true,"routineId":"abc"} Error: Connection failed
```

## Best Practices

1. **Usa el nivel apropiado**:
   - `debug`: Información detallada para debugging
   - `info`: Eventos importantes del flujo normal
   - `warn`: Situaciones anormales pero recuperables
   - `error`: Errores que requieren atención

2. **Incluye contexto relevante**:
   ```typescript
   // ❌ Malo
   logger.error('Error');
   
   // ✅ Bueno
   logger.error('Error al guardar rutina', { routineId: id, userId: user.id }, error);
   ```

3. **Usa createLogger para módulos**:
   ```typescript
   // ❌ Repetitivo
   logger.info('Operación 1', { module: 'storage' });
   logger.info('Operación 2', { module: 'storage' });
   
   // ✅ Mejor
   const logger = createLogger({ module: 'storage' });
   logger.info('Operación 1');
   logger.info('Operación 2');
   ```

4. **No incluyas información sensible**:
   ```typescript
   // ❌ Malo
   logger.info('Login', { password: user.password });
   
   // ✅ Bueno
   logger.info('Login', { userId: user.id });
   ```

## Testing

En tests, puedes mockear el logger:

```typescript
jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));
```
