# 🎯 Guía Rápida: Edición de Series

## Nuevo Sistema Implementado

Ahora puedes editar series libremente, como en Hevy.

## 3 Formas de Usar

### 1️⃣ Rápido (Valores por Defecto)
```
Completa serie → Click ☐ → Listo ✓
```
Usa los valores configurados en la rutina.

### 2️⃣ Personalizado (Editar Primero)
```
Completa serie → Edita reps/peso → Click ☐ → Listo ✓
```
Ajusta valores antes de marcar.

### 3️⃣ Corrección (Editar Después)
```
Click ☐ → Te equivocaste → Edita reps/peso → Guardado ✓
```
Corrige errores después de marcar.

## Elementos de la Interfaz

```
☐ / ☑  = Checkbox (marcar/desmarcar)
[10]   = Input de reps (editable)
[60kg] = Input de peso (editable)
[90s▼] = Dropdown de descanso (editable)
```

## Ejemplos Prácticos

### Ejemplo 1: Entrenamiento Normal
```
Serie 1: ☐ → Completas → ☑ → Descanso
Serie 2: ☐ → Completas → ☑ → Descanso
Serie 3: ☐ → Completas → ☑ → Fin
```

### Ejemplo 2: Fallo en Serie
```
Serie 3: Objetivo 10 reps
         Solo haces 7 reps
         Editas: [10] → [7]
         Marcas: ☐ → ☑
         Registra: 7 reps (fallo)
```

### Ejemplo 3: Error de Peso
```
Serie 1: Marcaste ☑ (60kg)
         Usaste 65kg en realidad
         Editas: [60] → [65]
         Guardado automático ✓
```

### Ejemplo 4: Marcado por Error
```
Serie 2: Marcaste ☑ sin hacer
         Click en ☑ → ☐ (desmarca)
         Completas físicamente
         Click en ☐ → ☑ (marca)
```

## Indicadores Visuales

### Serie Pendiente
```
┌─────────────────────────┐
│ ☐ [2] Serie 2           │  ← Fondo gris
│     10 reps objetivo    │
│ [  ] [60kg] [90s▼]      │
└─────────────────────────┘
```

### Serie Completada
```
┌─────────────────────────┐
│ ☑ [1] Serie 1           │  ← Fondo verde
│     10 reps objetivo    │
│ [10] [60kg] [90s▼]      │
│ ✓ Completada: 10@60kg   │
└─────────────────────────┘
```

## Tips

💡 **Tip 1**: Edita antes de marcar para evitar correcciones
💡 **Tip 2**: Puedes desmarcar si te equivocaste
💡 **Tip 3**: Los cambios se guardan automáticamente
💡 **Tip 4**: El checkbox es grande y fácil de presionar

## Compatibilidad

✅ Funciona con botón "Completar Serie" (nuevo flujo)
✅ Funciona con marcado manual (flujo flexible)
✅ Funciona con countdown 3-2-1
✅ Funciona sin countdown

## ¿Preguntas?

**P: ¿Puedo editar después de completar?**
R: Sí, edita en cualquier momento.

**P: ¿Puedo desmarcar una serie?**
R: Sí, click en ☑ para desmarcar.

**P: ¿Se guardan los cambios?**
R: Sí, automáticamente.

**P: ¿Puedo marcar series en cualquier orden?**
R: Sí, marca la que quieras.

---

**¡Pruébalo ahora!** Inicia un entrenamiento y verás los checkboxes.
