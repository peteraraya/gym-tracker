# Integración del Sistema de Progresión Avanzado

## Guía de Implementación

Esta guía muestra cómo integrar el nuevo sistema de progresión avanzado en las páginas existentes de la aplicación.

## 1. Página de Settings

Agregar configuración de progresión en la página de ajustes.

```tsx
// app/settings/page.tsx
import { useState, useEffect } from 'react';
import ProgressionSettings from '@/components/ProgressionSettings';
import type { ProgressionStrategy } from '@/lib/progression-advanced';

export default function SettingsPage() {
  const [progressionStrategy, setProgressionStrategy] = useState<ProgressionStrategy>('auto');
  const [considerFatigue, setConsiderFatigue] = useState(true);
  const [considerVolume, setConsiderVolume] = useState(true);

  // Cargar configuración desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('progressionSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setProgressionStrategy(settings.strategy || 'auto');
      setConsiderFatigue(settings.considerFatigue ?? true);
      setConsiderVolume(settings.considerVolume ?? true);
    }
  }, []);

  // Guardar configuración
  const handleStrategyChange = (strategy: ProgressionStrategy) => {
    setProgressionStrategy(strategy);
    saveSettings({ strategy, considerFatigue, considerVolume });
  };

  const handleFatigueChange = (consider: boolean) => {
    setConsiderFatigue(consider);
    saveSettings({ strategy: progressionStrategy, considerFatigue: consider, considerVolume });
  };

  const handleVolumeChange = (consider: boolean) => {
    setConsiderVolume(consider);
    saveSettings({ strategy: progressionStrategy, considerFatigue, considerVolume: consider });
  };

  const saveSettings = (settings: any) => {
    localStorage.setItem('progressionSettings', JSON.stringify(settings));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      
      {/* Otras secciones de settings... */}
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sistema de Progresión</h2>
        <ProgressionSettings
          currentStrategy={progressionStrategy}
          onStrategyChange={handleStrategyChange}
          considerFatigue={considerFatigue}
          onFatigueChange={handleFatigueChange}
          considerVolume={considerVolume}
          onVolumeChange={handleVolumeChange}
        />
      </section>
    </div>
  );
}
```

## 2. Página de Progreso

Mostrar análisis detallado de progresión para cada ejercicio.

```tsx
// app/progress/page.tsx
import { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { recommendWeightIncrease } from '@/lib/progression-advanced';
import ProgressionAnalysis from '@/components/ProgressionAnalysis';
import type { ProgressionOptions } from '@/lib/progression-advanced';

export default function ProgressPage() {
  const { sessions } = useGym();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [progressionOptions, setProgressionOptions] = useState<ProgressionOptions>({});

  // Cargar configuración de progresión
  useEffect(() => {
    const saved = localStorage.getItem('progressionSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setProgressionOptions({
        strategy: settings.strategy || 'auto',
        considerFatigue: settings.considerFatigue ?? true,
        considerVolume: settings.considerVolume ?? true
      });
    }
  }, []);

  // Obtener lista de ejercicios únicos
  const exercises = Array.from(
    new Set(
      sessions.flatMap(s => 
        s.exercises?.map(e => ({ id: e.exerciseId, name: e.exerciseName })) || []
      )
    )
  );

  // Calcular recomendación para el ejercicio seleccionado
  const recommendation = selectedExercise
    ? recommendWeightIncrease(selectedExercise, sessions, progressionOptions)
    : null;

  const exerciseName = exercises.find(e => e.id === selectedExercise)?.name;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Análisis de Progresión</h1>

      {/* Selector de ejercicio */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Selecciona un ejercicio
        </label>
        <select
          value={selectedExercise || ''}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">-- Selecciona --</option>
          {exercises.map(ex => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      {/* Análisis de progresión */}
      {recommendation && (
        <ProgressionAnalysis
          recommendation={recommendation}
          exerciseName={exerciseName}
        />
      )}

      {!selectedExercise && (
        <div className="text-center text-gray-500 py-8">
          Selecciona un ejercicio para ver su análisis de progresión
        </div>
      )}
    </div>
  );
}
```

## 3. Durante el Workout

Integrar sugerencias de progresión en tiempo real durante el entrenamiento.

```tsx
// app/workout/[id]/page.tsx
import { useEffect, useState } from 'react';
import { recommendWeightIncrease } from '@/lib/progression-advanced';
import type { ProgressionRecommendation } from '@/lib/progression-advanced';

export default function WorkoutPage({ params }: { params: { id: string } }) {
  const { sessions } = useGym();
  const [recommendations, setRecommendations] = useState<Map<string, ProgressionRecommendation>>(new Map());
  const [progressionOptions, setProgressionOptions] = useState({});

  // Cargar configuración
  useEffect(() => {
    const saved = localStorage.getItem('progressionSettings');
    if (saved) {
      setProgressionOptions(JSON.parse(saved));
    }
  }, []);

  // Calcular recomendaciones para todos los ejercicios de la rutina
  useEffect(() => {
    if (!currentRoutine?.exercises) return;

    const newRecommendations = new Map();
    currentRoutine.exercises.forEach(exercise => {
      const rec = recommendWeightIncrease(
        exercise.exerciseId,
        sessions,
        progressionOptions
      );
      newRecommendations.set(exercise.exerciseId, rec);
    });

    setRecommendations(newRecommendations);
  }, [currentRoutine, sessions, progressionOptions]);

  // Mostrar sugerencia de peso con análisis
  const renderWeightSuggestion = (exerciseId: string) => {
    const rec = recommendations.get(exerciseId);
    if (!rec) return null;

    return (
      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">
              {rec.recommend ? '💪 Sugerencia: ' : '📊 Análisis: '}
              {rec.suggestedWeight?.toFixed(1)} kg
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {rec.reason}
            </div>
          </div>
          <div className={`text-xs px-2 py-1 rounded ${
            rec.confidence === 'high' ? 'bg-green-100 text-green-700' :
            rec.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {rec.confidence === 'high' ? 'Alta' :
             rec.confidence === 'medium' ? 'Media' : 'Baja'}
          </div>
        </div>

        {/* Mostrar factores si hay baja confianza */}
        {rec.confidence === 'low' && rec.factors && (
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {rec.factors.fatigueScore > 7 && (
              <div>⚠️ Fatiga alta: {rec.factors.fatigueScore.toFixed(1)}/10</div>
            )}
            {rec.factors.volumeTrend === 'decreasing' && (
              <div>⚠️ Volumen disminuyendo</div>
            )}
            {!rec.factors.twoForTwo && (
              <div>⚠️ No cumple 2-for-2</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Renderizar ejercicios con sugerencias */}
      {currentRoutine?.exercises.map(exercise => (
        <div key={exercise.exerciseId}>
          {/* UI del ejercicio... */}
          {renderWeightSuggestion(exercise.exerciseId)}
        </div>
      ))}
    </div>
  );
}
```

## 4. Hook Personalizado

Crear un hook reutilizable para facilitar el uso del sistema.

```tsx
// hooks/useProgression.ts
import { useState, useEffect, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { recommendWeightIncrease } from '@/lib/progression-advanced';
import type { ProgressionOptions, ProgressionRecommendation } from '@/lib/progression-advanced';

export function useProgression(exerciseId?: string) {
  const { sessions } = useGym();
  const [options, setOptions] = useState<ProgressionOptions>({});

  // Cargar configuración
  useEffect(() => {
    const saved = localStorage.getItem('progressionSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setOptions({
        strategy: settings.strategy || 'auto',
        considerFatigue: settings.considerFatigue ?? true,
        considerVolume: settings.considerVolume ?? true
      });
    }
  }, []);

  // Calcular recomendación
  const recommendation = useMemo(() => {
    if (!exerciseId) return null;
    return recommendWeightIncrease(exerciseId, sessions, options);
  }, [exerciseId, sessions, options]);

  // Calcular recomendaciones para múltiples ejercicios
  const getRecommendations = (exerciseIds: string[]) => {
    const recommendations = new Map<string, ProgressionRecommendation>();
    exerciseIds.forEach(id => {
      const rec = recommendWeightIncrease(id, sessions, options);
      recommendations.set(id, rec);
    });
    return recommendations;
  };

  return {
    recommendation,
    getRecommendations,
    options,
    setOptions
  };
}

// Uso:
// const { recommendation } = useProgression(exerciseId);
```

## 5. Notificaciones de Progresión

Mostrar notificaciones cuando sea momento de progresar.

```tsx
// components/ProgressionNotification.tsx
import { useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { useProgression } from '@/hooks/useProgression';

export function ProgressionNotification({ exerciseId, exerciseName }: {
  exerciseId: string;
  exerciseName: string;
}) {
  const { recommendation } = useProgression(exerciseId);
  const { showToast } = useToast();

  useEffect(() => {
    if (!recommendation) return;

    // Mostrar notificación solo si recomienda aumentar con alta confianza
    if (recommendation.recommend && recommendation.confidence === 'high') {
      showToast({
        type: 'success',
        title: '🎉 ¡Momento de progresar!',
        message: `${exerciseName}: ${recommendation.reason}`,
        duration: 5000
      });
    }
  }, [recommendation, exerciseName]);

  return null;
}
```

## 6. Migración Gradual

Para migrar del sistema anterior al nuevo sin romper nada:

```tsx
// lib/progression-wrapper.ts
import { recommendWeightIncrease as oldRecommend } from './progression';
import { recommendWeightIncrease as newRecommend } from './progression-advanced';
import type { WorkoutSession } from '@/types';

export function recommendWeightIncrease(
  exerciseId: string,
  sessions: WorkoutSession[],
  options?: any
) {
  // Verificar si el usuario ha habilitado el sistema avanzado
  const useAdvanced = localStorage.getItem('useAdvancedProgression') === 'true';

  if (useAdvanced) {
    return newRecommend(exerciseId, sessions, options);
  } else {
    // Usar sistema anterior
    const oldRec = oldRecommend(exerciseId, sessions, options);
    // Adaptar formato si es necesario
    return {
      ...oldRec,
      confidence: 'medium' as const,
      factors: undefined
    };
  }
}
```

## 7. Testing de Integración

```tsx
// __tests__/integration/progression-integration.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProgressionSettings from '@/components/ProgressionSettings';

describe('Integración de Progresión', () => {
  it('guarda configuración en localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    render(<ProgressionSettings />);
    
    const linearRadio = screen.getByLabelText(/Progresión Lineal/i);
    fireEvent.click(linearRadio);
    
    expect(setItemSpy).toHaveBeenCalledWith(
      'progressionSettings',
      expect.stringContaining('linear')
    );
  });

  it('muestra análisis de progresión correctamente', () => {
    const mockRecommendation = {
      exerciseId: 'ex1',
      recommend: true,
      suggestedWeight: 52.5,
      reason: 'Progresión lineal: 2-for-2 alcanzado',
      confidence: 'high' as const,
      factors: {
        twoForTwo: true,
        volumeTrend: 'increasing' as const,
        fatigueScore: 3.5,
        consistencyScore: 85
      }
    };

    render(<ProgressionAnalysis recommendation={mockRecommendation} />);
    
    expect(screen.getByText(/52.5 kg/i)).toBeInTheDocument();
    expect(screen.getByText(/Alta/i)).toBeInTheDocument();
  });
});
```

## Checklist de Implementación

- [ ] Agregar ProgressionSettings a página de Settings
- [ ] Crear página o sección de análisis de progresión
- [ ] Integrar sugerencias en página de workout
- [ ] Crear hook useProgression
- [ ] Agregar notificaciones de progresión
- [ ] Implementar migración gradual
- [ ] Escribir tests de integración
- [ ] Actualizar documentación de usuario
- [ ] Agregar tooltips explicativos
- [ ] Probar con usuarios beta

## Consideraciones

1. **Performance**: Cachear recomendaciones para evitar recalcular en cada render
2. **UX**: No abrumar al usuario con demasiada información técnica
3. **Defaults**: Usar modo 'auto' por defecto para simplicidad
4. **Feedback**: Permitir al usuario reportar si las sugerencias son útiles
5. **Educación**: Incluir tooltips y guías para explicar conceptos

## Próximos Pasos

1. Implementar en Settings primero (bajo riesgo)
2. Agregar análisis en página de Progreso
3. Integrar sugerencias en Workout (alto impacto)
4. Recopilar feedback de usuarios
5. Iterar basado en uso real
