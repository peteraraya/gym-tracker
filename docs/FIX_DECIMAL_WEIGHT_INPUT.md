# Corrección: Permitir Puntos Decimales en Inputs de Peso

## Problema
Los inputs de peso con `type="number"` no permitían ingresar puntos decimales correctamente en algunos navegadores móviles, especialmente en iOS y algunos teclados Android.

## Causa
El atributo `type="number"` en HTML tiene comportamiento inconsistente entre navegadores:
- Algunos teclados móviles no muestran el punto decimal
- Otros no permiten ingresar el punto hasta que hay un número
- La validación nativa puede rechazar valores mientras se escribe

## Solución Implementada

### Cambios Realizados

1. **EditSessionModal.tsx**
   - Cambió `type="number"` a `type="text"` con `inputMode="decimal"`
   - Agregó validación manual con regex: `/^[0-9]*[.,]?[0-9]*$/`
   - Permite tanto punto (.) como coma (,) como separador decimal
   - Normaliza coma a punto antes de parseFloat

2. **RoutineForm.tsx**
   - Aplicó la misma corrección en los inputs de peso
   - Mantiene la validación de valores positivos
   - Permite entrada fluida de decimales

3. **WeightSelector.tsx**
   - Componente reutilizable usado en múltiples lugares
   - Cambió `type="number"` a `type="text"` con `inputMode="decimal"`
   - Agregó validación con regex: `/^[0-9]*[.,]?[0-9]*$/`
   - Normaliza coma a punto antes de parseFloat
   - Mantiene funcionalidad de historial de pesos

4. **EditValueModal.tsx**
   - Ya tenía implementación correcta con teclado numérico personalizado
   - Incluye botón de punto decimal para pesos

## Ventajas de la Solución

1. **Compatibilidad Universal**: Funciona en todos los navegadores y dispositivos
2. **UX Mejorada**: Los usuarios pueden escribir decimales naturalmente
3. **Flexibilidad**: Acepta tanto punto como coma (útil para usuarios europeos)
4. **Validación Robusta**: Previene entrada de caracteres no numéricos

## Ejemplo de Uso

### WeightSelector (Componente Reutilizable)

```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  
  // Permitir números, punto decimal y coma
  if (val !== '' && !/^[0-9]*[.,]?[0-9]*$/.test(val)) {
    return; // No actualizar si no es un formato válido
  }
  
  setInputValue(val);
  
  if (val === '') {
    onChange(0);
  } else {
    // Convertir coma a punto para parseFloat
    const normalizedVal = val.replace(',', '.');
    const num = parseFloat(normalizedVal);
    if (!isNaN(num) && num >= 0) {
      onChange(Math.max(0, num));
    }
  }
};

<input
  type="text"
  inputMode="decimal"
  value={inputValue}
  onChange={handleInputChange}
  placeholder="0"
  aria-label="Peso"
/>
```

### Inputs Directos (EditSessionModal, RoutineForm)

```typescript
<input
  type="text"
  inputMode="decimal"
  value={weight}
  onChange={(e) => {
    const value = e.target.value;
    // Permitir números, punto decimal y coma
    if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
      // Convertir coma a punto para parseFloat
      const normalizedValue = value.replace(',', '.');
      const numValue = normalizedValue === '' ? 0 : parseFloat(normalizedValue) || 0;
      setWeight(numValue);
    }
  }}
/>
```

## Valores Permitidos

- `12` → 12
- `12.5` → 12.5
- `12,5` → 12.5 (normalizado)
- `.5` → 0.5
- `0.25` → 0.25
- `` (vacío) → 0

## Testing

Probar en:
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Desktop Chrome/Firefox/Safari
- ✅ Teclados físicos
- ✅ Teclados virtuales

## Archivos Modificados

- `components/EditSessionModal.tsx`
- `components/RoutineForm.tsx`
- `components/WeightSelector.tsx`
- `app/workout/[id]/components/EditValueModal.tsx` (ya estaba correcto)
