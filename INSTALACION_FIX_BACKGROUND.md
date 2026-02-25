# 🔧 Instalación del Fix: Entrenamiento en Background

## Problema Resuelto

✅ El entrenamiento ya NO se cierra cuando cambias de app o sales de ella

## Instalación Rápida

### Opción 1: Script Automático (Recomendado)

#### En Windows (PowerShell):
```powershell
.\scripts\install-app-lifecycle.ps1
```

#### En Mac/Linux (Bash):
```bash
chmod +x scripts/install-app-lifecycle.sh
./scripts/install-app-lifecycle.sh
```

### Opción 2: Manual

```bash
# 1. Instalar dependencias
npm install

# 2. Probar en desarrollo
npm run dev

# 3. (Opcional) Para móvil, construir primero
npm run mobile:build
npm run mobile:open
```

**Nota:** No ejecutes `cap:sync` directamente, usa `mobile:build` que lo hace automáticamente.

## Probar que Funciona

1. Ejecuta la app: `npm run dev`
2. Inicia un entrenamiento
3. Completa 2-3 series
4. Sal de la app (botón Home o cambia de pestaña)
5. Espera 30 segundos
6. Vuelve a la app
7. ✅ El entrenamiento debe continuar donde lo dejaste

## Archivos Modificados

- ✅ `hooks/useAppLifecycle.ts` - Nuevo hook
- ✅ `context/WorkoutContext.tsx` - Actualizado
- ✅ `package.json` - Dependencias agregadas

## Documentación Completa

- **Para usuarios**: `docs/SOLUCION_ENTRENAMIENTO_BACKGROUND.md`
- **Para desarrolladores**: `docs/WORKOUT_BACKGROUND_PERSISTENCE_FIX.md`

## Soporte

Si tienes problemas:
1. Verifica que ejecutaste `npm install`
2. Revisa la consola del navegador
3. Prueba en un dispositivo físico (no emulador)

---

**Estado**: ✅ Listo para instalar
**Tiempo estimado**: 2-3 minutos
