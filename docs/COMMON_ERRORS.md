# Errores Comunes y Soluciones

## 1. "Breaking Browser Locker Behavior detected"

### Descripción
```
Uncaught Error: Breaking Browser Locker Behavior detected
at injection-tss-mv3.js:1:819
```

### Causa
Este error es causado por extensiones del navegador que interfieren con el código de la aplicación. Comúnmente:
- Bloqueadores de anuncios (AdBlock, uBlock Origin)
- Extensiones de privacidad
- Extensiones de seguridad
- Gestores de contraseñas

### Solución
Este error **NO afecta la funcionalidad de la aplicación**. Es solo un warning de la extensión.

**Opciones:**
1. **Ignorar el error** - La app funciona normalmente
2. **Desactivar extensiones** - Temporalmente para desarrollo
3. **Agregar excepción** - Agregar localhost a la lista blanca de la extensión

### Para Desarrollo
Puedes desactivar las extensiones en modo incógnito o crear un perfil de Chrome sin extensiones para desarrollo.

---

## 2. Error 404 en Supabase - active_workouts

### Descripción
```
Failed to load resource: the server responded with a status of 404
hplrrjqgzefkdevbporx.supabase.co/rest/v1/active_workouts
```

### Causa
La tabla `active_workouts` no existe en la base de datos de Supabase. Esta tabla es opcional y se usa para sincronizar entrenamientos activos entre dispositivos.

### Solución Implementada
El código ahora maneja este error automáticamente:
- Si la tabla no existe, usa localStorage
- No muestra errores en consola
- La funcionalidad sigue funcionando normalmente

### Crear la Tabla (Opcional)
Si quieres habilitar la sincronización de entrenamientos activos:

```sql
-- Crear tabla active_workouts
CREATE TABLE active_workouts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE active_workouts ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo pueden ver/editar sus propios datos
CREATE POLICY "Users can manage their own active workout"
  ON active_workouts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índice para mejorar performance
CREATE INDEX idx_active_workouts_user_id ON active_workouts(user_id);
```

### Sin la Tabla
La app funciona perfectamente sin esta tabla:
- Los entrenamientos activos se guardan en localStorage
- Funcionan en el mismo dispositivo/navegador
- No se sincronizan entre dispositivos

---

## 3. Cannot Update Component While Rendering

### Descripción
```
Error: Cannot update a component (X) while rendering a different component (Y)
```

### Causa
Un componente hijo está llamando a una función de callback que actualiza el estado del padre durante el render, en lugar de hacerlo en un efecto o evento.

### Solución
✅ Ya resuelto en el componente `Timer`.

Mover las llamadas a callbacks que actualizan estado a `useEffect`:

```tsx
// ❌ Mal - Llamar callback durante render
setTimeLeft((prev) => {
  if (prev <= 1) {
    onActualDurationChange(realDuration); // ❌ Actualiza padre durante render
    return 0;
  }
  return prev - 1;
});

// ✅ Bien - Usar useEffect separado
useEffect(() => {
  if (isCompleted && actualDuration > 0 && onActualDurationChange) {
    onActualDurationChange(actualDuration);
  }
}, [isCompleted, actualDuration, onActualDurationChange]);
```

---

## 4. Notificaciones Push - InvalidCharacterError

### Descripción
```
InvalidCharacterError: Failed to execute 'atob' on 'Window'
```

### Causa
VAPID keys no configuradas o inválidas.

### Solución
✅ Ya resuelto. Las VAPID keys válidas están en `.env.local`

Si necesitas generar nuevas keys:
```bash
npx web-push generate-vapid-keys
```

---

## 5. Service Worker No Registrado

### Descripción
Las notificaciones push no funcionan o el modo offline no funciona.

### Causa
El Service Worker no está registrado correctamente.

### Solución
1. Verificar en DevTools → Application → Service Workers
2. Si no aparece, verificar que `ServiceWorkerRegistration` esté en el layout
3. Limpiar caché y recargar: DevTools → Application → Clear storage

### Forzar Re-registro
```javascript
// En la consola del navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  location.reload();
});
```

---

## 6. Errores de CORS en Desarrollo

### Descripción
```
Access to fetch at '...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

### Causa
Configuración de CORS en Supabase o APIs externas.

### Solución
En Supabase Dashboard:
1. Settings → API
2. Agregar `http://localhost:3000` a allowed origins
3. En producción, agregar tu dominio

---

## 7. Hydration Errors

### Descripción
```
Warning: Text content did not match. Server: "..." Client: "..."
```

### Causa
Diferencias entre el HTML generado en el servidor y el cliente.

### Soluciones Comunes
1. **Fechas/Horas**: Usar `suppressHydrationWarning` en elementos con fechas
2. **localStorage**: Usar `ClientOnly` component para código que usa localStorage
3. **Random values**: No usar `Math.random()` en el render inicial

### Ejemplo
```tsx
// ❌ Mal
<div>{new Date().toLocaleString()}</div>

// ✅ Bien
<div suppressHydrationWarning>{new Date().toLocaleString()}</div>

// ✅ Mejor
<ClientOnly>
  <div>{new Date().toLocaleString()}</div>
</ClientOnly>
```

---

## 8. Build Errors - Module Not Found

### Descripción
```
Module not found: Can't resolve '@/components/...'
```

### Solución
1. Verificar que el archivo existe
2. Verificar el path alias en `tsconfig.json`
3. Reiniciar el servidor de desarrollo
4. Limpiar caché: `rm -rf .next && npm run dev`

---

## 9. TypeScript Errors en Producción

### Descripción
El build falla con errores de TypeScript que no aparecen en desarrollo.

### Solución
```bash
# Ejecutar type check
npx tsc --noEmit

# Ver todos los errores
npm run build
```

### Errores Comunes
- Tipos `any` implícitos
- Props faltantes
- Imports incorrectos

---

## 10. Supabase Auth Errors

### Descripción
```
Error: Invalid JWT
Error: User not found
```

### Solución
1. Verificar que las credenciales en `.env.local` sean correctas
2. Verificar que el usuario exista en Supabase Dashboard
3. Limpiar cookies y localStorage
4. Volver a hacer login

### Reset Auth
```javascript
// En la consola del navegador
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 11. PWA No Se Instala

### Descripción
No aparece el botón de instalación de la PWA.

### Requisitos para PWA
- ✅ HTTPS (o localhost)
- ✅ manifest.json válido
- ✅ Service Worker registrado
- ✅ Iconos en todos los tamaños
- ✅ start_url accesible

### Verificar
1. DevTools → Application → Manifest
2. Verificar que no haya errores
3. Lighthouse → PWA audit
4. Verificar que el score sea 100/100

### Forzar Instalación
En Chrome: Menú (⋮) → "Instalar Gym Tracker"

---

## Debugging Tips

### Chrome DevTools
```
F12 → Console: Ver errores de JavaScript
F12 → Network: Ver requests fallidos
F12 → Application: Ver Service Workers, Storage, Manifest
F12 → Lighthouse: Auditar PWA, Performance, Accessibility
```

### Limpiar Todo
```bash
# Limpiar caché de Next.js
rm -rf .next

# Limpiar node_modules
rm -rf node_modules
npm install

# Limpiar caché del navegador
# DevTools → Application → Clear storage → Clear site data
```

### Logs Útiles
```javascript
// Ver todas las keys en localStorage
console.log(Object.keys(localStorage));

// Ver Service Worker activo
navigator.serviceWorker.getRegistration().then(console.log);

// Ver suscripción push
navigator.serviceWorker.ready
  .then(reg => reg.pushManager.getSubscription())
  .then(console.log);
```

---

## Reportar Bugs

Si encuentras un error que no está en esta lista:

1. **Captura el error completo** de la consola
2. **Describe los pasos** para reproducirlo
3. **Incluye información del entorno**:
   - Navegador y versión
   - Sistema operativo
   - Modo (desarrollo/producción)
4. **Verifica** que no sea causado por extensiones del navegador

---

**Última actualización**: Febrero 2026
