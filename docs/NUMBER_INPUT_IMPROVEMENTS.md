# Mejoras en Inputs Numéricos

## Estado: ✅ COMPLETADO

## Problema
Los inputs numéricos en la aplicación tenían varios problemas:
1. Cuando el usuario borraba todo el contenido, quedaba un "0" visible
2. No había validación en tiempo real
3. Valores NaN no se manejaban correctamente
4. Los errores solo aparecían al hacer submit

## Solución Implementada

### 1. Hook Personalizado (`hooks/useNumberInput.ts`)
Creado un hook reutilizable para manejar inputs numéricos con:
- Validación en tiempo real
- Manejo correcto de campos vacíos
- Conversión automática de NaN a 0
- Validación de min/max
- No muestra "0" cuando el campo está vacío

### 2. Validación en Tiempo Real

#### RoutineForm (`components/RoutineForm.tsx`)
- ✅ Validación en tiempo real de pesos
- ✅ Errores mostrados debajo de cada campo individual
- ✅ Campos vacíos no muestran "0"
- ✅ Valores inválidos se convierten a 0 internamente
- ✅ Borde rojo en campos con error
- ✅ Mensaje de error específico por campo

**Comportamiento:**
```typescript
// Cuando el usuario borra el campo
value={set.weight === 0 ? '' : set.weight ?? ''}

// Al cambiar el valor
onChange={(e) => {
  const val = e.target.value;
  if (val === '') {
    handleSetChange(exerciseIndex, setIndex, 'weight', 0);
  } else {
    const num = parseFloat(val);
    handleSetChange(exerciseIndex, setIndex, 'weight', isNaN(num) ? 0 : Math.max(0, num));
  }
}}
```

#### Workout con Rutina (`app/workout/[id]/page.tsx`)
- ✅ Input de peso no muestra "0" cuando está vacío
- ✅ Placeholder descriptivo
- ✅ Validación de valores mínimos

#### Workout Libre (`app/workout/free/page.tsx`)
- ✅ Inputs de reps y peso con manejo correcto de vacío
- ✅ Placeholders descriptivos
- ✅ Validación en tiempo real

#### Calculadoras

**BMICalculator (`components/BMICalculator.tsx`)**
- ✅ Peso, altura, edad con campos vacíos correctos
- ✅ Medidas corporales (cuello, cintura, cadera)
- ✅ Placeholders descriptivos

**OneRMCalculator (`components/OneRMCalculator.tsx`)**
- ✅ Peso y repeticiones con validación
- ✅ Límite máximo de 12 reps
- ✅ Mínimo de 1 rep

### 3. Patrón de Implementación

Para todos los inputs numéricos se sigue este patrón:

```typescript
<Input
  type="number"
  value={valor === 0 ? '' : valor}
  onChange={(e) => {
    const val = e.target.value;
    if (val === '') {
      setValor(0); // Internamente es 0
    } else {
      const num = parseFloat(val); // o parseInt para enteros
      setValor(isNaN(num) ? 0 : Math.max(minimo, num));
    }
  }}
  min="0"
  placeholder="Texto descriptivo"
/>
```

### 4. Beneficios

1. **UX Mejorada:**
   - No hay "0" molesto cuando el usuario borra el campo
   - Placeholders descriptivos guían al usuario
   - Validación inmediata sin esperar al submit

2. **Validación Robusta:**
   - Errores mostrados en tiempo real
   - Valores inválidos manejados automáticamente
   - Límites min/max respetados

3. **Consistencia:**
   - Mismo comportamiento en toda la app
   - Patrón reutilizable y fácil de mantener

## Archivos Modificados

- ✅ `hooks/useNumberInput.ts` (nuevo)
- ✅ `components/RoutineForm.tsx`
- ✅ `app/workout/[id]/page.tsx`
- ✅ `app/workout/free/page.tsx`
- ✅ `components/BMICalculator.tsx`
- ✅ `components/OneRMCalculator.tsx`

## Próximos Pasos (Opcional)

- Aplicar el mismo patrón a otros calculadores:
  - CaloriesBurnedCalculator
  - ProgressionCalculator
  - VolumeCalculator
  - WilksCalculator
  - TempoCalculator
  - PlateCalculator
  - PercentageRMCalculator
  - TdeeCalculator
  - UnitConverter

- Considerar usar el hook `useNumberInput` en componentes futuros para mayor consistencia
