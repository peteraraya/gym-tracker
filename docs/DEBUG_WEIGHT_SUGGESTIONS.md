# Debug: Weight Suggestions

## Qué Ver en la Pantalla

### Si NO hay historial de entrenamientos
Deberías ver este mensaje en la tarjeta del ejercicio:
```
💡 Completa más entrenamientos para ver sugerencias de peso personalizadas
```

### Si HAY historial de entrenamientos
Deberías ver el banner de sugerencia:
```
┌─────────────────────────────────────────┐
│ 💪 Sugerencia de Peso          +5kg     │
│ Completaste 3 series con 10 reps.      │
│ ¡Hora de subir!                         │
│ [Usar 70kg] [Ignorar]                  │
└─────────────────────────────────────────┘
```

## Cómo Verificar en la Consola del Navegador

1. Abre las DevTools (F12)
2. Ve a la pestaña "Console"
3. Busca estos logs:

```
[Weight Suggestion] Checking conditions: {
  hasExercise: true,
  exerciseName: "Press de Banca",
  sessionsCount: 5,
  currentSet: 1
}

[Weight Suggestion] Generated: {
  suggested: 70,
  lastUsed: 65,
  increase: 5,
  confidence: "high",
  reason: "Completaste 3 series con 10 reps. ¡Hora de subir!"
}
```

## Casos Posibles

### Caso 1: No hay sesiones previas
```
[Weight Suggestion] Checking conditions: {
  hasExercise: true,
  exerciseName: "Press de Banca",
  sessionsCount: 0,  ← Sin sesiones
  currentSet: 1
}
[Weight Suggestion] No suggestion - missing exercise or sessions
```
**Solución:** Completa al menos un entrenamiento con este ejercicio

### Caso 2: Ejercicio no tiene historial
```
[Weight Suggestion] Checking conditions: {
  hasExercise: true,
  exerciseName: "Press de Banca",
  sessionsCount: 5,  ← Hay sesiones pero...
  currentSet: 1
}
[Weight Suggestion] Generated: null  ← No hay historial de este ejercicio
```
**Solución:** Las sesiones no incluyen este ejercicio específico

### Caso 3: Sugerencia generada correctamente
```
[Weight Suggestion] Checking conditions: {
  hasExercise: true,
  exerciseName: "Press de Banca",
  sessionsCount: 5,
  currentSet: 1
}
[Weight Suggestion] Generated: {
  suggested: 70,
  lastUsed: 65,
  increase: 5,
  confidence: "high",
  reason: "Completaste 3 series con 10 reps. ¡Hora de subir!"
}
```
**Resultado:** Banner de sugerencia visible ✅

## Cómo Crear Datos de Prueba

### Opción 1: Completar un entrenamiento real
1. Inicia un entrenamiento
2. Completa todas las series de un ejercicio
3. Guarda el entrenamiento
4. Inicia otro entrenamiento con el mismo ejercicio
5. Deberías ver la sugerencia

### Opción 2: Usar datos de prueba (si tienes acceso a la base de datos)
Inserta una sesión de prueba en la base de datos con el ejercicio que quieres probar.

## Verificación Paso a Paso

1. **Abre la consola del navegador** (F12 → Console)
2. **Inicia un entrenamiento**
3. **Busca los logs** `[Weight Suggestion]`
4. **Verifica:**
   - ✅ `hasExercise: true`
   - ✅ `sessionsCount: > 0`
   - ✅ `Generated: { ... }` (no null)
5. **Mira la pantalla:**
   - Si hay sugerencia → Banner visible
   - Si no hay sugerencia → Mensaje de "Completa más entrenamientos"

## Problemas Comunes

### No veo ningún mensaje
- Verifica que `ExerciseCard` esté recibiendo la prop `weightSuggestion`
- Revisa la consola por errores de React

### Veo el mensaje pero no el banner
- Normal si no hay historial
- Completa un entrenamiento primero

### El banner no aparece aunque hay historial
- Verifica en consola si `Generated: null`
- El ejercicio debe tener el mismo nombre exacto en las sesiones
- Verifica que las sesiones tengan datos de peso y reps

## Logs de Debug Agregados

He agregado logs en:
1. `app/workout/[id]/page.tsx` - Generación de sugerencias
2. `app/workout/[id]/components/ExerciseCard.tsx` - Mensaje cuando no hay sugerencia

## Próximos Pasos

Una vez que confirmes que funciona:
1. Puedo remover los logs de debug
2. Puedo ajustar el mensaje de "no hay sugerencia"
3. Puedo mejorar el algoritmo de sugerencias

## Contacto

Si ves algo diferente en los logs, comparte:
1. Screenshot de la consola
2. Screenshot de la pantalla
3. Número de sesiones que tienes guardadas
