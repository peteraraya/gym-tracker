# Dev Tools - Guía Rápida

## ⚠️ IMPORTANTE: Solo para Desarrollo

Este sistema permite limpiar datos de usuario durante desarrollo. **NUNCA debe estar habilitado en producción.**

## Activación Rápida

### 1. Configurar Variable de Entorno

Crear o editar `.env.local`:

```env
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
```

### 2. Reiniciar Servidor

```bash
npm run dev
```

### 3. Acceder

1. Abrir la app: `http://localhost:3000`
2. Ir a **Settings** (⚙️)
3. Scroll hasta el final
4. Verás un panel rojo con "Herramientas de Desarrollo"

## Funciones Disponibles

### Limpiar Datos Individuales

- **Eliminar Sesiones**: Borra todas las sesiones de entrenamiento
- **Eliminar Rutinas**: Borra todas las rutinas
- **Limpiar Perfil**: Resetea el perfil a valores por defecto
- **Limpiar Planes**: Borra planes semanales y mensuales
- **Limpiar Recomendaciones**: Borra recomendaciones de progresión

### Acciones Globales

- **Generar Datos de Prueba**: Crea 1 rutina y 1 sesión de ejemplo
- **ELIMINAR TODO**: Borra TODOS los datos (requiere doble confirmación)

## Uso Típico

### Escenario 1: Empezar de Cero
```
1. Click en "ELIMINAR TODO"
2. Confirmar 2 veces
3. Esperar a que se limpie
4. Página se recarga automáticamente
```

### Escenario 2: Probar con Datos de Ejemplo
```
1. Click en "Generar Datos de Prueba"
2. Ir a Rutinas → Verás "Rutina de Prueba"
3. Ir a Sesiones → Verás sesión completada
4. Probar features con estos datos
```

### Escenario 3: Limpiar Solo Sesiones
```
1. Click en "Eliminar Sesiones"
2. Confirmar
3. Sesiones eliminadas, rutinas intactas
```

## Desactivación

### Para Producción

**Opción 1:** No incluir la variable
```env
# .env.production
# NO incluir NEXT_PUBLIC_ENABLE_DEV_TOOLS
```

**Opción 2:** Establecer en false
```env
# .env.production
NEXT_PUBLIC_ENABLE_DEV_TOOLS=false
```

### Verificar que está Desactivado

```bash
npm run build
npm start
```

Ir a Settings → NO debe aparecer el panel de Dev Tools

## Seguridad

✅ **Protecciones Implementadas:**
- Variable de entorno requerida
- Verificación en cada función
- Confirmaciones múltiples
- UI claramente marcada como peligrosa
- Auto-oculta si no está habilitado

❌ **NO Hacer:**
- Habilitar en producción
- Usar con datos reales
- Commitear `.env.local`
- Compartir builds con dev tools

## Troubleshooting

### Panel no aparece
- ✅ Verificar `.env.local` tiene `NEXT_PUBLIC_ENABLE_DEV_TOOLS=true`
- ✅ Reiniciar servidor (`npm run dev`)
- ✅ Refrescar navegador

### "Dev tools are not enabled"
- ✅ Verificar variable de entorno
- ✅ Verificar no hay typos
- ✅ Reiniciar servidor

### Datos no se eliminan
- ✅ Verificar que existen datos
- ✅ Revisar consola por errores
- ✅ Verificar permisos (si usa Supabase)

## Comandos Útiles

```bash
# Desarrollo con dev tools
npm run dev

# Build de producción (sin dev tools)
npm run build
npm start

# Verificar variables de entorno
cat .env.local
```

## Documentación Completa

Ver `docs/DEV_TOOLS_SYSTEM.md` para documentación técnica detallada.
