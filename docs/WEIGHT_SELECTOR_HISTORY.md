# Selector de Peso con Historial

## Descripción

Se ha implementado un selector de peso inteligente que recuerda los pesos utilizados anteriormente para cada ejercicio, permitiendo seleccionarlos rápidamente sin tener que escribirlos cada vez.

## Características

### 1. Historial Automático
- Cada vez que ingresas un peso, se guarda automáticamente en el historial del ejercicio
- El historial es específico por ejercicio (cada ejercicio tiene su propio historial)
- Se guardan hasta 10 pesos diferentes por ejercicio

### 2. Selección Rápida
- Al hacer clic en el input de peso, se despliega un dropdown con los pesos guardados
- Los pesos se muestran ordenados de mayor a menor
- Un clic selecciona el peso y cierra el dropdown

### 3. Indicador Visual
- Pequeña flecha hacia abajo indica que hay historial disponible
- El peso actualmente seleccionado se resalta en el dropdown

### 4. Persistencia
- Los pesos se guardan en localStorage con la clave `weight-history-{exerciseId}`
- El historial persiste entre sesiones
- Cada ejercicio mantiene su propio historial independiente

## Implementación

### Componente: `WeightSelector`

```tsx
<WeightSelector
  value={weight}
  onChange={(weight) => handleWeightChange(weight)}
  exerciseId={exercise.id}
  placeholder="0"
/>
```

### Props

- `value`: Peso actual (number | '')
- `onChange`: Callback cuando cambia el peso
- `exerciseId`: ID único del ejercicio (para el historial)
- `placeholder`: Texto placeholder (opcional)
- `className`: Clases CSS adicionales (opcional)

## Integración

El componente se ha integrado en:

1. **Entrenamiento con Rutina** (`app/workout/[id]/page.tsx`)
   - Input de peso para cada serie
   - Historial por ejercicio de la rutina

2. **Entrenamiento Libre** (`app/workout/free/page.tsx`)
   - Input principal para agregar series
   - Inputs de edición en series completadas
   - Inputs en vista colapsada

## UX Mejorada

### Antes
- Escribir el peso manualmente cada vez
- Difícil recordar el peso usado en series anteriores
- Lento en móvil con teclado numérico

### Ahora
- Un clic para seleccionar peso usado anteriormente
- Historial visible de pesos recientes
- Mucho más rápido en móvil
- Menos errores de tipeo

## Ejemplo de Uso

1. Usuario hace Press Banca con 55kg
2. El peso se guarda automáticamente
3. En la siguiente serie, hace clic en el input
4. Ve "55kg" en el dropdown
5. Un clic y listo, no necesita escribir

## Almacenamiento

```javascript
// Estructura en localStorage
{
  "weight-history-press-banca-123": [60, 55, 52.5, 50],
  "weight-history-sentadilla-456": [100, 95, 90, 85]
}
```

## Notas Técnicas

- El componente maneja automáticamente el guardado al perder el foco (onBlur)
- Los pesos se ordenan automáticamente de mayor a menor
- Se eliminan duplicados automáticamente
- El dropdown se cierra al hacer clic fuera
- Compatible con teclado (Tab, Enter, Escape)

## Mejoras Futuras Posibles

- [ ] Sincronizar historial con Supabase
- [ ] Mostrar fecha del último uso de cada peso
- [ ] Sugerencias basadas en progresión (ej: "La semana pasada usaste 55kg")
- [ ] Exportar/importar historial de pesos
- [ ] Estadísticas de pesos más usados
