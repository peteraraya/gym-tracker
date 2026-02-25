# 🚀 Guía Rápida: Fix Entrenamiento en Background

## ¿Qué hace este fix?

Evita que el entrenamiento se cierre cuando cambias de app o sales de ella en el teléfono.

## Instalación (2 minutos)

### Paso 1: Instalar dependencias

```bash
npm install
```

✅ Esto instala `@capacitor/app` y `@capacitor/core`

### Paso 2: Probar en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000 y prueba:
1. Inicia un entrenamiento
2. Completa 2-3 series
3. Cambia de pestaña del navegador
4. Espera 30 segundos
5. Vuelve a la pestaña
6. ✅ El entrenamiento debe continuar

## Para Móvil (Opcional)

Si quieres probar en tu teléfono:

```bash
# Construir la app (esto también sincroniza con Capacitor)
npm run mobile:build

# Abrir en Android Studio
npm run mobile:open
```

Luego en Android Studio:
1. Conecta tu teléfono
2. Click en "Run" (▶️)
3. Prueba cambiando de app

## ⚠️ Importante

**NO ejecutes** `npm run cap:sync` directamente sin antes construir la app.

**Usa siempre:**
- `npm run dev` para desarrollo web
- `npm run mobile:build` para móvil (incluye sync automático)

## Verificar que Funciona

Busca estos logs en la consola del navegador o logcat:

```
[AppLifecycle] Capacitor listeners registered
[WorkoutContext] App paused, persisting workout...
[WorkoutContext] Workout persisted successfully on pause
```

## Solución de Problemas

### Error: "Could not find the web assets directory"

**Causa:** Intentaste ejecutar `cap:sync` sin construir la app primero.

**Solución:** Usa `npm run mobile:build` en lugar de `cap:sync`

### El entrenamiento aún se pierde

1. Verifica que `@capacitor/app` esté instalado:
   ```bash
   npm list @capacitor/app
   ```

2. Revisa la consola para ver los logs

3. Prueba en un dispositivo físico (no emulador)

### No veo los logs

En Android:
```bash
# Ver logs en tiempo real
adb logcat | grep -i "AppLifecycle\|WorkoutContext"
```

En Web:
- Abre DevTools (F12)
- Ve a la pestaña Console
- Filtra por "AppLifecycle" o "WorkoutContext"

## Comandos Útiles

```bash
# Desarrollo web
npm run dev

# Construir para producción
npm run build

# Construir para móvil
npm run mobile:build

# Abrir en Android Studio
npm run mobile:open

# Ver logs de Android
adb logcat
```

## Documentación Completa

- `docs/SOLUCION_ENTRENAMIENTO_BACKGROUND.md` - Explicación detallada
- `docs/WORKOUT_BACKGROUND_PERSISTENCE_FIX.md` - Documentación técnica
- `INSTALACION_FIX_BACKGROUND.md` - Guía de instalación

## Estado

✅ Código implementado
✅ Dependencias agregadas al package.json
⏳ Pendiente: Ejecutar `npm install`

---

**Tiempo total:** 2-3 minutos
**Dificultad:** Fácil
