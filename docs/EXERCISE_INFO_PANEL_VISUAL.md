# Panel de Información del Ejercicio - Guía Visual

## Ubicación del Botón

```
┌─────────────────────────────────────────────────────┐
│  Remo con Barra                                     │
│  Ejercicio 1/15 • Serie 1/3                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Remo con Barra        [ℹ️ Información]       │  │
│  │ Notas del ejercicio...                       │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  [▶️ Iniciar Serie 1]                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Panel Modal Abierto

```
┌─────────────────────────────────────────────────────┐
│ [←] IMAGEN DEL EJERCICIO                            │
│     ┌─────────────────────────────────────────────┐ │
│     │                                             │ │
│     │        [Foto del Remo con Barra]           │ │
│     │                                             │ │
│     │  Remo con Barra                             │ │
│     │  [Espalda] [Intermedio] [Compuesto]        │ │
│     │                                             │ │
│     └─────────────────────────────────────────────┘ │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 📖 Información │ ⚡ Técnica │ ⚠️ Errores │ 💡 Consejos │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  CONTENIDO DE LA PESTAÑA ACTIVA                    │
│  ─────────────────────────────────────────────     │
│                                                     │
│  Descripción:                                       │
│  El remo con barra es un ejercicio compuesto...    │
│                                                     │
│  Equipo:                                            │
│  • Barra olímpica                                   │
│  • Discos de peso                                   │
│                                                     │
│  Músculos Primarios:                                │
│  [Dorsal Ancho] [Trapecio] [Romboide]              │
│                                                     │
│  Músculos Secundarios:                              │
│  [Bíceps] [Espalda Baja]                           │
│                                                     │
│  Beneficios:                                        │
│  ✓ Fortalece la espalda                            │
│  ✓ Mejora la postura                               │
│  ✓ Aumenta la fuerza de tracción                   │
│                                                     │
│  [← Volver al Entrenamiento]                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Pestañas Disponibles

### 1. Información (📖)
```
Descripción
Equipo
Músculos Primarios
Músculos Secundarios
Beneficios
```

### 2. Técnica (⚡)
```
Pasos de Ejecución (numerados)
1. Posición inicial...
2. Agarre...
3. Movimiento...
4. Retorno...

Puntos Clave
• Mantén la espalda recta
• Codos cerca del cuerpo
• Contrae los omóplatos
```

### 3. Errores (⚠️)
```
Errores a Evitar
✕ Usar demasiado peso
✕ Balancearse durante el movimiento
✕ No contraer completamente

Notas de Seguridad
⚠ Calienta bien antes
⚠ Evita movimientos bruscos
⚠ Consulta con un entrenador
```

### 4. Consejos (💡)
```
Consejos Pro
💡 Usa un agarre más ancho para trabajar más el trapecio
💡 Pausa 1 segundo en la contracción máxima
💡 Controla el descenso lentamente

Variaciones Más Fáciles
→ Remo con mancuerna
→ Remo en máquina

Variaciones Más Difíciles
→ Remo con agarre cerrado
→ Remo con pausa

Ejercicios Alternativos
→ Jalón al pecho
→ Remo en T
```

## Interacción

### Abrir Panel
1. Usuario hace clic en "ℹ️ Información"
2. Se abre el modal con la imagen del ejercicio
3. Se muestra la pestaña "Información" por defecto

### Navegar Pestañas
1. Usuario hace clic en una pestaña
2. El contenido cambia dinámicamente
3. La pestaña activa se resalta en azul

### Cerrar Panel
1. Usuario hace clic en "← Volver al Entrenamiento"
2. Se cierra el modal
3. Regresa al entrenamiento sin perder progreso

## Diseño Responsivo

### Desktop
- Panel ancho (max-width: 2xl)
- Imagen grande (h-80)
- Pestañas horizontales
- Contenido espacioso

### Móvil
- Panel fullscreen
- Imagen mediana (h-64)
- Pestañas scrolleables
- Contenido compacto
- Botones grandes para tocar

## Colores y Estilos

### Badges
- **Grupo Muscular**: Azul (`bg-blue-500`)
- **Dificultad Principiante**: Verde (`bg-green-500`)
- **Dificultad Intermedio**: Amarillo (`bg-yellow-500`)
- **Dificultad Avanzado**: Rojo (`bg-red-500`)
- **Categoría**: Púrpura (`bg-purple-500`)

### Pestañas
- **Activa**: Azul con borde inferior
- **Inactiva**: Gris con hover effect

### Contenido
- **Errores**: Fondo rojo claro con ícono ✕
- **Seguridad**: Fondo amarillo claro con ícono ⚠
- **Consejos**: Fondo púrpura claro con ícono 💡
- **Variaciones**: Colores según dificultad

## Accesibilidad

✅ Botón con aria-label
✅ Contraste de colores suficiente
✅ Texto legible en todos los tamaños
✅ Navegación por teclado
✅ Cierre fácil (botón y ESC)
