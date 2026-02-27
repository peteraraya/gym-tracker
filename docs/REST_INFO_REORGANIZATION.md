# Reorganización: Información de Descanso Mejorada

## Cambio Realizado

Se reorganizó la información de descanso (base e inteligente) para una mejor accesibilidad y UX durante el entrenamiento.

## Antes

```
┌─────────────────────────────────────┐
│ Remo con Barra                      │
│ Notas del ejercicio...              │
├─────────────────────────────────────┤
│                                     │
│ [▶️ Iniciar Serie 1]                │
│                                     │
│ [Series tabla...]                   │
│                                     │
│ [Agregar Serie]                     │
│                                     │
│ ⏱️ Descanso base: 1min              │ ← Al final
│ 🧠 Inteligente: [Toggle]            │ ← Ocupaba espacio
│                                     │
└─────────────────────────────────────┘
```

## Después

```
┌─────────────────────────────────────┐
│ Remo con Barra    [ℹ️ Información]  │
│ Notas del ejercicio...              │
├─────────────────────────────────────┤
│ ⏱️ Descanso base: 1min              │ ← Justo debajo
│ 🧠 Inteligente: [Toggle] 1m 48s     │ ← Fácil acceso
├─────────────────────────────────────┤
│                                     │
│ [▶️ Iniciar Serie 1]                │
│                                     │
│ [Series tabla...]                   │
│                                     │
│ [Agregar Serie]                     │
│                                     │
└─────────────────────────────────────┘
```

## Beneficios

✅ **Mejor accesibilidad** - Información visible sin scroll
✅ **Menos desorden** - No ocupa espacio al final
✅ **Más lógico** - Descanso junto al título del ejercicio
✅ **Mejor UX** - Toggle de descanso inteligente más accesible
✅ **Diseño limpio** - Separación clara con borde

## Detalles Técnicos

### Nueva Sección
- Ubicación: Entre CardHeader y CardContent
- Altura: Compacta (py-3)
- Fondo: Gris sutil (bg-gray-50 dark:bg-gray-800/50)
- Borde: Separador visual (border-b)

### Contenido
```tsx
<div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
  <div className="flex items-center justify-between gap-4 flex-wrap">
    {/* Descanso Base */}
    <div className="flex items-center gap-2">
      <span>⏱️ Descanso base:</span>
      <span className="font-bold text-blue-600">1min</span>
    </div>

    {/* Descanso Inteligente */}
    <div className="flex items-center gap-2">
      <span>🧠 Inteligente:</span>
      <button>Toggle</button>
      {useSmartRest && <span>1m 48s</span>}
    </div>
  </div>
</div>
```

### Responsive
- Desktop: Dos columnas lado a lado
- Móvil: Flex wrap para adaptarse
- Gap: 4 unidades para separación

## Interacción

### Descanso Base
- Solo lectura
- Muestra el descanso configurado
- Formato: "1min" o "60s"

### Descanso Inteligente
- Toggle on/off
- Cuando está ON:
  - Muestra el tiempo recomendado
  - Tooltip con descripción
  - Botón "Aplicar a todas" en la tabla
- Cuando está OFF:
  - Solo muestra el toggle
  - Fondo gris

## Archivos Modificados

- `app/workout/[id]/page.tsx`
  - Agregada nueva sección de descanso bajo CardHeader
  - Removida sección antigua de descanso al final
  - Reorganización de componentes

## Funcionalidades Incluidas

✅ **Toggle de Descanso Inteligente**
- Activar/desactivar con un clic
- Muestra el tiempo recomendado cuando está activo
- Tooltip con descripción

✅ **Botón "Aplicar a Todas"**
- Aparece solo cuando descanso inteligente está activo
- Aplica el descanso recomendado a todas las series
- Muestra confirmación con toast

✅ **Cálculo Inteligente**
- Basado en el tipo de ejercicio
- Considera el número de series
- Adapta el descanso según las reps

## Próximas Mejoras

- [ ] Animación suave al cambiar entre descanso base e inteligente
- [ ] Historial de descansos utilizados
- [ ] Presets de descanso personalizados
- [ ] Gráfico de descanso vs rendimiento
