# Sistema de Herramientas de Desarrollo

## Descripción
Sistema seguro de herramientas de desarrollo para limpiar y resetear datos de usuario durante el desarrollo y testing. Incluye protecciones para evitar que se active en producción.

## Fecha de Implementación
6 de marzo de 2026

## Problema Resuelto
Durante el desarrollo y testing, es necesario poder limpiar rápidamente los datos de prueba sin tener que hacerlo manualmente desde la consola del navegador o la base de datos. Sin embargo, estas herramientas son peligrosas y no deben estar disponibles en producción.

## Características de Seguridad

### 1. Variable de Entorno
```env
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true  # Solo en desarrollo
```

- Debe estar explícitamente configurada en `true`
- Por defecto es `false`
- Se verifica en cada función
- No se incluye en builds de producción

### 2. Verificación en Código
```typescript
export function isDevToolsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';
}
```

Todas las funciones verifican esto antes de ejecutar:
```typescript
if (!isDevToolsEnabled()) {
  throw new Error('Dev tools are not enabled');
}
```

### 3. Confirmaciones Múltiples
- Confirmación simple para acciones individuales
- Doble confirmación para "Eliminar Todo"
- Mensajes claros sobre irreversibilidad

### 4. UI Visible
- Panel con borde rojo
- Badge "DEV ONLY"
- Advertencias en amarillo
- Solo visible cuando está habilitado

## Funciones Disponibles

### 1. `devClearAllSessions()`
Elimina todas las sesiones de entrenamiento.

**Retorna:**
```typescript
{ deleted: number; error?: string }
```

**Uso:**
```typescript
const result = await devClearAllSessions();
console.log(`${result.deleted} sesiones eliminadas`);
```

### 2. `devClearAllRoutines()`
Elimina todas las rutinas.

**Retorna:**
```typescript
{ deleted: number; error?: string }
```

### 3. `devClearProfile()`
Limpia el perfil del usuario (resetea a valores por defecto).

**Retorna:**
```typescript
{ success: boolean; error?: string }
```

### 4. `devClearPlans()`
Limpia planes semanales y mensuales.

**Retorna:**
```typescript
{ success: boolean; error?: string }
```

### 5. `devClearRecommendations()`
Limpia recomendaciones de progresión.

**Retorna:**
```typescript
{ success: boolean; error?: string }
```

### 6. `devClearAllData()`
Elimina TODOS los datos del usuario.

**Retorna:**
```typescript
{
  sessions: number;
  routines: number;
  profile: boolean;
  plans: boolean;
  recommendations: boolean;
  errors: string[];
}
```

**Características:**
- Requiere doble confirmación
- Limpia: sesiones, rutinas, perfil, planes, recomendaciones, active workout
- Recarga la página automáticamente después de 2 segundos
- Muestra resumen detallado de lo eliminado

### 7. `devGenerateTestData()`
Genera datos de prueba automáticamente.

**Genera:**
- 1 rutina de prueba con 2 ejercicios
- 1 sesión de prueba completada

**Retorna:**
```typescript
{ success: boolean; error?: string }
```

## Componente DevTools

### Ubicación
`components/DevTools.tsx`

### Características
- Solo se renderiza si `isDevToolsEnabled()` es `true`
- Diseño con advertencias visuales (rojo, amarillo)
- Botones organizados por categoría
- Loading states durante operaciones
- Integración con toast y confirm
- Refresh automático de datos después de operaciones

### Botones Disponibles

**Limpiar Datos Individuales:**
- 🗑️ Eliminar Sesiones
- 🗑️ Eliminar Rutinas
- 🗑️ Limpiar Perfil
- 🗑️ Limpiar Planes
- 🗑️ Limpiar Recomendaciones

**Acciones Globales:**
- ✨ Generar Datos de Prueba
- 🚨 ELIMINAR TODO (requiere doble confirmación)

## Integración

### En Settings Page
```typescript
import { DevTools } from '@/components/DevTools';

// En el render
<DevTools />
```

El componente se auto-oculta si dev tools no están habilitados.

### En Storage Service
```typescript
import {
  isDevToolsEnabled,
  devClearAllSessions,
  devClearAllRoutines,
  // ... otras funciones
} from '@/lib/storage/storage';
```

## Configuración

### Desarrollo Local

1. Crear/editar `.env.local`:
```env
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
```

2. Reiniciar el servidor de desarrollo:
```bash
npm run dev
```

3. Ir a Settings → Verás el panel de Dev Tools

### Producción

**IMPORTANTE:** Asegurarse de que `.env.production` NO tenga esta variable o esté en `false`:

```env
# .env.production
NEXT_PUBLIC_ENABLE_DEV_TOOLS=false  # O simplemente no incluir la línea
```

### Vercel/Netlify

En las variables de entorno del proyecto:
- **NO** agregar `NEXT_PUBLIC_ENABLE_DEV_TOOLS`
- O establecerla explícitamente en `false`

## Flujo de Uso

### Escenario 1: Limpiar Sesiones de Prueba
```
1. Usuario va a Settings
2. Ve panel de Dev Tools (rojo)
3. Click en "Eliminar Sesiones"
4. Confirma en modal
5. Toast muestra "X sesiones eliminadas"
6. Datos se refrescan automáticamente
```

### Escenario 2: Reset Completo
```
1. Usuario va a Settings
2. Click en "ELIMINAR TODO"
3. Primera confirmación
4. Segunda confirmación (doble check)
5. Loading spinner
6. Toast con resumen detallado
7. Página se recarga automáticamente
```

### Escenario 3: Generar Datos de Prueba
```
1. Usuario va a Settings
2. Click en "Generar Datos de Prueba"
3. Se crea rutina y sesión automáticamente
4. Toast de confirmación
5. Datos se refrescan
```

## Logging

Todas las operaciones se registran con el logger:

```typescript
logger.info('[DEV] Cleared all sessions', { count: sessions.length });
logger.warn('[DEV] Cleared all user data', { 
  sessionsDeleted, 
  routinesDeleted,
  errors 
});
logger.error('[DEV] Error clearing sessions', {}, error);
```

Prefijo `[DEV]` para identificar operaciones de desarrollo.

## Compatibilidad

### localStorage Mode
- ✅ Todas las funciones funcionan
- Limpia directamente de localStorage
- No requiere autenticación

### Supabase Mode
- ✅ Todas las funciones funcionan
- Elimina de la base de datos
- Requiere autenticación
- Respeta permisos de usuario

## Testing

### Verificar que NO está en Producción

1. Build de producción:
```bash
npm run build
npm start
```

2. Ir a Settings
3. NO debe aparecer el panel de Dev Tools

### Verificar que SÍ está en Desarrollo

1. Configurar `.env.local` con `NEXT_PUBLIC_ENABLE_DEV_TOOLS=true`
2. `npm run dev`
3. Ir a Settings
4. DEBE aparecer el panel de Dev Tools

### Probar Funciones

1. Generar datos de prueba
2. Verificar que se crearon
3. Limpiar sesiones
4. Verificar que se eliminaron
5. Generar datos nuevamente
6. Eliminar todo
7. Verificar que todo se limpió

## Archivos Creados/Modificados

### Creados
- ✅ `components/DevTools.tsx` - Componente UI
- ✅ `docs/DEV_TOOLS_SYSTEM.md` - Esta documentación

### Modificados
- ✅ `lib/storage/storage.ts` - Funciones de limpieza
- ✅ `app/settings/page.tsx` - Integración del componente
- ✅ `.env.local.example` - Variable de ejemplo

## Mejores Prácticas

### DO ✅
- Usar solo en desarrollo local
- Verificar que está deshabilitado antes de deploy
- Usar para limpiar datos de prueba
- Usar para testing de features
- Documentar cuando se usa

### DON'T ❌
- Habilitar en producción
- Usar con datos reales de usuarios
- Compartir builds con dev tools habilitados
- Commitear `.env.local` con dev tools habilitados
- Usar sin confirmación del usuario

## Troubleshooting

### "Dev tools are not enabled"
- Verificar que `NEXT_PUBLIC_ENABLE_DEV_TOOLS=true` en `.env.local`
- Reiniciar servidor de desarrollo
- Verificar que no hay typos en el nombre de la variable

### Panel no aparece en Settings
- Verificar variable de entorno
- Verificar que el componente está importado
- Verificar consola por errores

### Funciones no eliminan datos
- Verificar permisos de Supabase (si aplica)
- Verificar que el usuario está autenticado
- Revisar logs en consola
- Verificar que los datos existen

## Seguridad

### Protecciones Implementadas
1. ✅ Variable de entorno requerida
2. ✅ Verificación en cada función
3. ✅ Confirmaciones múltiples
4. ✅ UI claramente marcada como peligrosa
5. ✅ Logging de todas las operaciones
6. ✅ Auto-oculta si no está habilitado

### Riesgos Mitigados
- ❌ Activación accidental en producción
- ❌ Eliminación sin confirmación
- ❌ Uso por usuarios no autorizados
- ❌ Pérdida de datos sin advertencia

## Futuras Mejoras (Opcional)

1. **Export antes de eliminar**: Exportar datos antes de limpiar
2. **Undo**: Capacidad de deshacer eliminaciones
3. **Backup automático**: Crear backup antes de operaciones destructivas
4. **Más datos de prueba**: Templates variados de rutinas
5. **Importar datos**: Cargar datos desde archivo JSON
6. **Estadísticas**: Ver cuántos datos hay antes de eliminar

## Conclusión

El sistema de Dev Tools proporciona una forma segura y controlada de gestionar datos durante el desarrollo, con múltiples capas de protección para evitar uso en producción. Es una herramienta esencial para desarrollo y testing eficiente.
