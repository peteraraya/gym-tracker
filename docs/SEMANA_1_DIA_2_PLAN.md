# 📅 SEMANA 1 - DÍA 2: PLAN DE ACCIÓN

**Fecha**: Febrero 28, 2026  
**Duración estimada**: 5 horas  
**Objetivo**: Completar validación en storage y componentes

---

## 🎯 OBJETIVO DEL DÍA

Validar todos los datos que entran y salen del storage, y agregar validación en componentes críticos.

---

## 📋 TAREAS DEL DÍA

### Tarea 1: Actualizar lib/storage/localStorage.ts (2 horas)

#### Paso 1: Importar esquemas
```typescript
import { 
  WorkoutSessionSchema, 
  RoutineSchema, 
  validateDataWithLogging 
} from '@/lib/validation';
```

#### Paso 2: Validar en getActiveWorkout()
**Ubicación**: `lib/storage/localStorage.ts` línea ~150

**Cambio**:
```typescript
// ANTES
export async function getActiveWorkout(): Promise<ActiveWorkout | null> {
  const stored = localStorage.getItem(STORAGE_KEYS.activeWorkout);
  if (!stored) return null;
  return JSON.parse(stored);
}

// DESPUÉS
export async function getActiveWorkout(): Promise<ActiveWorkout | null> {
  const stored = localStorage.getItem(STORAGE_KEYS.activeWorkout);
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored);
    const validationResult = validateDataWithLogging(
      WorkoutStateSchema,
      data,
      '[localStorage] getActiveWorkout'
    );
    
    if (validationResult.success && validationResult.data) {
      return validationResult.data;
    }
    
    // Datos corruptos - limpiar
    localStorage.removeItem(STORAGE_KEYS.activeWorkout);
    return null;
  } catch (e) {
    console.error('[localStorage] Error parsing active workout:', e);
    localStorage.removeItem(STORAGE_KEYS.activeWorkout);
    return null;
  }
}
```

#### Paso 3: Validar en saveActiveWorkout()
**Ubicación**: `lib/storage/localStorage.ts` línea ~160

**Cambio**:
```typescript
// ANTES
export async function saveActiveWorkout(payload: ActiveWorkout): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.activeWorkout, JSON.stringify(payload));
}

// DESPUÉS
export async function saveActiveWorkout(payload: ActiveWorkout): Promise<void> {
  const validationResult = validateDataWithLogging(
    WorkoutStateSchema,
    payload,
    '[localStorage] saveActiveWorkout'
  );
  
  if (!validationResult.success) {
    throw new Error(`Invalid workout state: ${validationResult.error}`);
  }
  
  localStorage.setItem(STORAGE_KEYS.activeWorkout, JSON.stringify(payload));
}
```

#### Paso 4: Validar en getSessions()
**Ubicación**: `lib/storage/localStorage.ts` línea ~200

**Cambio**:
```typescript
// ANTES
export async function getSessions(): Promise<WorkoutSession[]> {
  const stored = localStorage.getItem(STORAGE_KEYS.sessions);
  if (!stored) return [];
  return JSON.parse(stored);
}

// DESPUÉS
export async function getSessions(): Promise<WorkoutSession[]> {
  const stored = localStorage.getItem(STORAGE_KEYS.sessions);
  if (!stored) return [];
  
  try {
    const data = JSON.parse(stored);
    if (!Array.isArray(data)) return [];
    
    // Validar cada sesión
    const validSessions = data.filter(session => {
      const validationResult = validateDataWithLogging(
        WorkoutSessionSchema,
        session,
        '[localStorage] getSessions'
      );
      return validationResult.success;
    });
    
    return validSessions;
  } catch (e) {
    console.error('[localStorage] Error parsing sessions:', e);
    return [];
  }
}
```

#### Paso 5: Validar en saveSessions()
**Ubicación**: `lib/storage/localStorage.ts` línea ~210

**Cambio**:
```typescript
// ANTES
export async function saveSessions(sessions: WorkoutSession[]): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
}

// DESPUÉS
export async function saveSessions(sessions: WorkoutSession[]): Promise<void> {
  // Validar cada sesión
  for (const session of sessions) {
    const validationResult = validateDataWithLogging(
      WorkoutSessionSchema,
      session,
      '[localStorage] saveSessions'
    );
    
    if (!validationResult.success) {
      throw new Error(`Invalid session: ${validationResult.error}`);
    }
  }
  
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
}
```

#### Paso 6: Crear tests
**Archivo**: `lib/storage/localStorage.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getActiveWorkout,
  saveActiveWorkout,
  getSessions,
  saveSessions,
} from './localStorage';

describe('localStorage validation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getActiveWorkout', () => {
    it('debe retornar null si no hay datos', async () => {
      const result = await getActiveWorkout();
      expect(result).toBeNull();
    });

    it('debe validar y retornar workout válido', async () => {
      const validWorkout = {
        routineId: 'routine-1',
        routineName: 'Push Day',
        currentExerciseIndex: 0,
        currentSet: 1,
        completedSets: {},
        actualReps: {},
        actualWeights: {},
        startedAt: new Date(),
      };

      await saveActiveWorkout(validWorkout);
      const result = await getActiveWorkout();
      
      expect(result).toBeDefined();
      expect(result?.routineId).toBe('routine-1');
    });

    it('debe limpiar datos corruptos', async () => {
      localStorage.setItem('active-workout', JSON.stringify({
        routineId: '', // Inválido
        routineName: 'Push Day',
      }));

      const result = await getActiveWorkout();
      expect(result).toBeNull();
      expect(localStorage.getItem('active-workout')).toBeNull();
    });
  });

  describe('getSessions', () => {
    it('debe retornar array vacío si no hay datos', async () => {
      const result = await getSessions();
      expect(result).toEqual([]);
    });

    it('debe validar y retornar sesiones válidas', async () => {
      const validSession = {
        id: 'session-1',
        routineId: 'routine-1',
        date: new Date(),
        exercises: [],
      };

      await saveSessions([validSession]);
      const result = await getSessions();
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('session-1');
    });

    it('debe filtrar sesiones inválidas', async () => {
      const validSession = {
        id: 'session-1',
        routineId: 'routine-1',
        date: new Date(),
        exercises: [],
      };

      const invalidSession = {
        id: 'session-2',
        routineId: '', // Inválido
        date: new Date(),
        exercises: [],
      };

      localStorage.setItem('sessions', JSON.stringify([validSession, invalidSession]));
      const result = await getSessions();
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('session-1');
    });
  });

  describe('saveActiveWorkout', () => {
    it('debe lanzar error si datos son inválidos', async () => {
      const invalidWorkout = {
        routineId: '', // Inválido
        routineName: 'Push Day',
        currentExerciseIndex: 0,
        currentSet: 1,
        completedSets: {},
        actualReps: {},
        actualWeights: {},
        startedAt: new Date(),
      };

      await expect(saveActiveWorkout(invalidWorkout)).rejects.toThrow();
    });
  });

  describe('saveSessions', () => {
    it('debe lanzar error si alguna sesión es inválida', async () => {
      const invalidSession = {
        id: 'session-1',
        routineId: '', // Inválido
        date: new Date(),
        exercises: [],
      };

      await expect(saveSessions([invalidSession])).rejects.toThrow();
    });
  });
});
```

---

### Tarea 2: Actualizar components/WeightSelector.tsx (1 hora)

#### Paso 1: Importar validación
```typescript
import { validateDataWithLogging } from '@/lib/validation';
```

#### Paso 2: Validar pesos guardados
**Ubicación**: `components/WeightSelector.tsx` línea ~30

**Cambio**:
```typescript
// ANTES
useEffect(() => {
  try {
    const stored = localStorage.getItem(`weight-history-${exerciseId}`);
    if (stored) {
      const parsed = JSON.parse(stored) as number[];
      const unique = Array.from(new Set(parsed)).sort((a, b) => b - a);
      setSavedWeights(unique.slice(0, 10));
    }
  } catch (e) {
    console.warn('Error loading weight history', e);
  }
}, [exerciseId]);

// DESPUÉS
useEffect(() => {
  try {
    const stored = localStorage.getItem(`weight-history-${exerciseId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Validar que sea array de números
      if (!Array.isArray(parsed) || !parsed.every(w => typeof w === 'number' && w >= 0)) {
        console.warn('[WeightSelector] Invalid weight history format');
        localStorage.removeItem(`weight-history-${exerciseId}`);
        setSavedWeights([]);
        return;
      }
      
      const unique = Array.from(new Set(parsed)).sort((a, b) => b - a);
      setSavedWeights(unique.slice(0, 10));
    }
  } catch (e) {
    console.warn('[WeightSelector] Error loading weight history', e);
    localStorage.removeItem(`weight-history-${exerciseId}`);
  }
}, [exerciseId]);
```

#### Paso 3: Validar peso antes de guardar
**Ubicación**: `components/WeightSelector.tsx` línea ~60

**Cambio**:
```typescript
// ANTES
const saveWeight = (weight: number) => {
  if (weight <= 0) return;

  try {
    const stored = localStorage.getItem(`weight-history-${exerciseId}`);
    let weights: number[] = stored ? JSON.parse(stored) : [];
    
    if (!weights.includes(weight)) {
      weights.push(weight);
      weights = Array.from(new Set(weights)).sort((a, b) => b - a).slice(0, 10);
      localStorage.setItem(`weight-history-${exerciseId}`, JSON.stringify(weights));
      setSavedWeights(weights);
    }
  } catch (e) {
    console.warn('Error saving weight history', e);
  }
};

// DESPUÉS
const saveWeight = (weight: number) => {
  if (weight <= 0 || !Number.isFinite(weight)) return;

  try {
    const stored = localStorage.getItem(`weight-history-${exerciseId}`);
    let weights: number[] = stored ? JSON.parse(stored) : [];
    
    // Validar que sea array de números válidos
    if (!Array.isArray(weights) || !weights.every(w => typeof w === 'number' && w >= 0)) {
      weights = [];
    }
    
    if (!weights.includes(weight)) {
      weights.push(weight);
      weights = Array.from(new Set(weights))
        .filter(w => Number.isFinite(w) && w >= 0)
        .sort((a, b) => b - a)
        .slice(0, 10);
      
      localStorage.setItem(`weight-history-${exerciseId}`, JSON.stringify(weights));
      setSavedWeights(weights);
    }
  } catch (e) {
    console.warn('[WeightSelector] Error saving weight history', e);
  }
};
```

#### Paso 4: Crear tests
**Archivo**: `components/WeightSelector.test.tsx`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeightSelector } from './WeightSelector';

describe('WeightSelector validation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe validar pesos guardados', () => {
    const validWeights = [100, 95, 90];
    localStorage.setItem('weight-history-ex-1', JSON.stringify(validWeights));

    render(
      <WeightSelector
        value={100}
        onChange={() => {}}
        exerciseId="ex-1"
      />
    );

    // Verificar que cargó los pesos
    expect(localStorage.getItem('weight-history-ex-1')).toBeDefined();
  });

  it('debe limpiar pesos inválidos', () => {
    const invalidWeights = 'not-an-array';
    localStorage.setItem('weight-history-ex-1', invalidWeights);

    render(
      <WeightSelector
        value={100}
        onChange={() => {}}
        exerciseId="ex-1"
      />
    );

    // Verificar que limpió los datos inválidos
    expect(localStorage.getItem('weight-history-ex-1')).toBeNull();
  });

  it('debe rechazar pesos negativos', () => {
    const { getByRole } = render(
      <WeightSelector
        value={0}
        onChange={() => {}}
        exerciseId="ex-1"
      />
    );

    const input = getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '-50' } });
    fireEvent.blur(input);

    // Verificar que no guardó el peso negativo
    expect(localStorage.getItem('weight-history-ex-1')).toBeNull();
  });
});
```

---

### Tarea 3: Actualizar components/Timer.tsx (1 hora)

#### Paso 1: Validar duración
**Ubicación**: `components/Timer.tsx` línea ~30

**Cambio**:
```typescript
// ANTES
interface TimerProps {
  duration: number;
  onComplete?: () => void;
  autoStart?: boolean;
  title?: string;
  nextExerciseName?: string;
  showMotivation?: boolean;
  onActualDurationChange?: (actualDuration: number) => void;
}

// DESPUÉS
interface TimerProps {
  duration: number; // Debe ser > 0
  onComplete?: () => void;
  autoStart?: boolean;
  title?: string;
  nextExerciseName?: string;
  showMotivation?: boolean;
  onActualDurationChange?: (actualDuration: number) => void;
}

// Validar en el componente
export const Timer: React.FC<TimerProps> = ({ 
  duration, 
  // ... otros props
}) => {
  // Validar duración
  if (!Number.isFinite(duration) || duration <= 0) {
    console.error('[Timer] Invalid duration:', duration);
    return <div>Error: Invalid timer duration</div>;
  }

  // ... resto del código
};
```

#### Paso 2: Validar callbacks
**Ubicación**: `components/Timer.tsx` línea ~100

**Cambio**:
```typescript
// Validar que onActualDurationChange sea función
useEffect(() => {
  if (onActualDurationChange && typeof onActualDurationChange !== 'function') {
    console.error('[Timer] onActualDurationChange is not a function');
  }
}, [onActualDurationChange]);
```

#### Paso 3: Crear tests
**Archivo**: `components/Timer.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timer } from './Timer';

describe('Timer validation', () => {
  it('debe rechazar duración inválida', () => {
    const { container } = render(
      <Timer duration={-1} />
    );

    expect(container.textContent).toContain('Error');
  });

  it('debe rechazar duración NaN', () => {
    const { container } = render(
      <Timer duration={NaN} />
    );

    expect(container.textContent).toContain('Error');
  });

  it('debe aceptar duración válida', () => {
    const { container } = render(
      <Timer duration={90} />
    );

    expect(container.textContent).not.toContain('Error');
  });
});
```

---

### Tarea 4: Testing y QA (1 hora)

#### Paso 1: Ejecutar tests
```bash
npm run test:ci
```

#### Paso 2: Verificar cobertura
```bash
npm run test:coverage
```

#### Paso 3: Verificar build
```bash
npm run build
```

#### Paso 4: Crear PR
- [ ] Commit: "feat: add Zod validation to storage and components"
- [ ] Push a rama feature
- [ ] Crear PR con descripción
- [ ] Solicitar revisión

---

## 📊 CHECKLIST DEL DÍA

### localStorage.ts
- [ ] Importar esquemas
- [ ] Validar getActiveWorkout()
- [ ] Validar saveActiveWorkout()
- [ ] Validar getSessions()
- [ ] Validar saveSessions()
- [ ] Crear tests

### WeightSelector.tsx
- [ ] Importar validación
- [ ] Validar pesos al cargar
- [ ] Validar pesos al guardar
- [ ] Crear tests

### Timer.tsx
- [ ] Validar duración
- [ ] Validar callbacks
- [ ] Crear tests

### QA
- [ ] Ejecutar tests
- [ ] Verificar cobertura
- [ ] Verificar build
- [ ] Crear PR

---

## ⏱️ TIMELINE

| Hora | Tarea | Duración |
|------|-------|----------|
| 09:00 | localStorage.ts | 2 horas |
| 11:00 | WeightSelector.tsx | 1 hora |
| 12:00 | Almuerzo | 1 hora |
| 13:00 | Timer.tsx | 1 hora |
| 14:00 | Testing y QA | 1 hora |
| 15:00 | ✅ Completado | - |

---

## 🎯 OBJETIVO FINAL

Al final del día:
- ✅ 100% de datos validados
- ✅ 0 errores de validación
- ✅ Fallback para datos corruptos
- ✅ Tests completos
- ✅ PR lista para revisión

---

**Generado por**: Kiro  
**Fecha**: Febrero 27, 2026  
**Próxima revisión**: Febrero 28, 2026

