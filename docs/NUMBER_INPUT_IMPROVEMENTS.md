# Mejoras en Inputs Numéricos

## Estado: ✅ COMPLETADO

## Problema
Los inputs numéricos en la aplicación tenían varios problemas:
1. Cuando el usuario borraba todo el contenido, quedaba un "0" visible
2. No había validación en tiempo real
3. Valores NaN no se manejaban correctamente
4. Los errores solo aparecían al hacer submit
5. Rutinas generadas por el asistente tenían peso 0

## Solución Implementada

### 1. Hook Personalizado (`hooks/useNumberInput.ts`)
Creado un hook reutilizable para manejar inputs numéricos con:
- Validación en tiempo real
- Manejo correcto de campos vacíos
- Conversión automática de NaN a 0
- Validación de min/max
- No muestra "0" cuando el campo está vacío

### 2. Validación en Tiempo Real con Sistema "Touched"

#### RoutineForm (`components/RoutineForm.tsx`)
- ✅ Validación en tiempo real de pesos y reps
- ✅ Sistema de campos "tocados" (touched) para no mostrar errores en carga inicial
- ✅ Errores mostrados debajo de cada campo individual
- ✅ Campos vacíos no muestran "0"
- ✅ Valores inválidos se convierten a 0 internamente
- ✅ Borde rojo en campos con error
- ✅ Mensaje de error específico por campo
- ✅ Al hacer submit, marca todos los campos como tocados y valida

**Comportamiento:**
- **Carga inicial**: No muestra errores aunque los campos tengan peso 0
- **Después de interactuar**: Muestra errores en tiempo real
- **Al hacer submit**: Valida todos los campos y muestra todos los errores

### 3. Generador de Rutinas con Pesos Inteligentes

#### Routine Generator (`lib/routineGenerator.ts`)
- ✅ Calcula pesos recomendados según nivel de experiencia
- ✅ Ajusta pesos según objetivo (fuerza, hipertrofia, resistencia, etc.)
- ✅ Pesos base realistas para cada ejercicio
- ✅ Multiplicadores por nivel:
  - Principiante: 1.0x
  - Intermedio: 1.5x
  - Avanzado: 2.0x
- ✅ Ajustes por objetivo:
  - Fuerza: +20% peso
  - Resistencia/Pérdida de peso: -30% peso
- ✅ Redondeo a múltiplos de 2.5kg (estándar de discos)
- ✅ Notas automáticas con recomendaciones

**Ejemplos de pesos generados:**

Principiante - Hipertrofia:
- Press de Banca: 20kg
- Sentadilla: 30kg
- Peso Muerto: 40kg
- Curl con Barra: 10kg

Intermedio - Hipertrofia:
- Press de Banca: 30kg
- Sentadilla: 45kg
- Peso Muerto: 60kg
- Curl con Barra: 15kg

Avanzado - Fuerza:
- Press de Banca: 48kg (40kg × 2.0 × 1.2)
- Sentadilla: 72kg (60kg × 2.0 × 1.2)
- Peso Muerto: 96kg (80kg × 2.0 × 1.2)

### 4. Patrón de Implementación

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

### 5. Beneficios

1. **UX Mejorada:**
   - No hay "0" molesto cuando el usuario borra el campo
   - Placeholders descriptivos guían al usuario
   - Validación inmediata sin esperar al submit
   - No muestra errores en carga inicial de rutinas existentes

2. **Validación Robusta:**
   - Errores mostrados en tiempo real después de interactuar
   - Valores inválidos manejados automáticamente
   - Límites min/max respetados
   - Sistema de "touched" evita errores prematuros

3. **Rutinas Inteligentes:**
   - Pesos realistas según nivel y objetivo
   - Notas con recomendaciones automáticas
   - Ajustes por tipo de ejercicio
   - Listas para usar sin necesidad de edición

4. **Consistencia:**
   - Mismo comportamiento en toda la app
   - Patrón reutilizable y fácil de mantener

## Archivos Modificados

- ✅ `hooks/useNumberInput.ts` (nuevo)
- ✅ `components/RoutineForm.tsx`
- ✅ `app/workout/[id]/page.tsx`
- ✅ `app/workout/free/page.tsx`
- ✅ `components/BMICalculator.tsx`
- ✅ `components/OneRMCalculator.tsx`
- ✅ `lib/routineGenerator.ts`

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
- Agregar más ejercicios a la base de datos del generador
- Permitir personalización de pesos base por usuario
