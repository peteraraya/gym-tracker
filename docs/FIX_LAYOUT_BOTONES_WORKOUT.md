# Fix: Reorganización de Botones en Página de Workout

## Cambios Realizados

### 1. Remover Botón "Cancelar" Duplicado
- **Archivo**: `app/workout/[id]/page.tsx`
- **Cambio**: Removido el botón "Cancelar" de la sección de botones de acción (abajo)
- **Resultado**: Solo queda el botón "Cancelar" en el header (arriba)

### 2. Bloquear "Completar Serie" Hasta Iniciar
- **Archivo**: `app/workout/[id]/components/ExerciseCard.tsx`
- **Cambio**: 
  - Agregado prop `isSetStarted` (default: false)
  - El botón "Completar Serie" ahora está deshabilitado hasta que se presione "Iniciar Serie"
  - Agregado tooltip: "Inicia la serie primero"
- **Lógica**: `disabled={!isSetComplete || !isSetStarted}`

### 3. Mejorar Visibilidad del Botón "Saltar"
- **Archivo**: `app/workout/[id]/components/ExerciseCard.tsx`
- **Cambio**:
  - Cambiar variant de "ghost" a "secondary" para mejor visibilidad
  - Texto más descriptivo: "⏭️ Saltar Ejercicio" (desktop) / "⏭️ Saltar" (mobile)
  - Mismo tamaño y peso que el botón "Completar"

### 4. Actualizar Paso de Props
- **Archivo**: `app/workout/[id]/page.tsx`
- **Cambio**: Pasar `isSetStarted={isExecutingSet}` al ExerciseCard
- **Efecto**: El botón se habilita cuando el usuario presiona "Iniciar Serie"

## Flujo de UX Mejorado

1. Usuario ve "▶️ Iniciar Serie" prominente arriba
2. Ingresa reps y peso
3. Presiona "Iniciar Serie" → Countdown de preparación
4. Botón "✅ Completar Serie" se habilita
5. Botón "⏭️ Saltar Ejercicio" siempre visible como alternativa

## Beneficios

- ✅ Menos confusión (un solo "Cancelar")
- ✅ Flujo más claro (iniciar → completar)
- ✅ Botón "Saltar" más visible y accesible
- ✅ Previene completar sin iniciar la serie
