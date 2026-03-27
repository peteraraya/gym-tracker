'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { BottomSheet } from '@/components/ui/BottomSheet';
import SetTypeCycleButton from '@/components/SetTypeCycleButton';
import { EditValueModal } from '@/components/EditValueModal';
import { FloatingRestTimer } from './FloatingRestTimer';
import { AddExerciseButton } from './AddExerciseButton';
import type { ExerciseTemplate } from '@/data/exercises';
import type { SetType, Routine } from '@/types';

interface QuickEditModeProps {
  routine: Routine;
  workoutData: {
    completedSets: { [key: string]: number };
    actualReps: { [key: string]: number[] };
    actualWeights: { [key: string]: number[] };
    setTypes: { [key: string]: string[] };
    restOverrides?: { [key: string]: number };
    perSetRestOverrides?: { [key: string]: number[] };
    skippedExercises?: string[];
  };
  onEditReps: (exerciseId: string, setIndex: number, reps: number) => void;
  onEditWeight: (exerciseId: string, setIndex: number, weight: number) => void;
  onEditSetType: (exerciseId: string, setIndex: number, type: SetType) => void;
  onToggleSetComplete: (exerciseId: string, setIndex: number, isComplete: boolean) => void;
  onAddSet?: (exerciseId: string) => void;
  onDeleteSet?: (exerciseId: string, setIndex: number) => void;
  onFinishWorkout?: () => void;
  onEditRestTime?: (exerciseId: string, restTime: number) => void;
  onApplySmartRest?: (exerciseId: string) => void;
  onMoveExercise?: (fromIndex: number, toIndex: number) => void;
  onSkipExercise?: (exerciseId: string) => void;
  onUnskipExercise?: (exerciseId: string) => void;
  onSkipRestTimersChange?: (skip: boolean) => void; // ✅ NUEVO: Callback para notificar cambio
  skipRestTimers?: boolean; // ✅ NUEVO: Estado controlado desde el padre
  onShowExerciseInfo?: (exerciseName: string) => void; // ✅ NUEVO: Callback para mostrar info del ejercicio
  sessions?: any[]; // ✅ NUEVO: Sesiones anteriores para comparar progreso
  onAddExercises?: (exercises: ExerciseTemplate[]) => void; // Callback para agregar ejercicios durante el entrenamiento
}

/**
 * Modo de edición rápida tipo Excel/Hevy
 * Permite ver y editar todos los ejercicios y series en una sola vista
 */
export function QuickEditMode({
  routine,
  workoutData,
  onEditReps,
  onEditWeight,
  onEditSetType,
  onToggleSetComplete,
  onAddSet,
  onDeleteSet,
  onFinishWorkout,
  onEditRestTime,
  onApplySmartRest,
  onMoveExercise,
  onSkipExercise,
  onUnskipExercise,
  onSkipRestTimersChange,
  skipRestTimers: skipRestTimersProp,
  onShowExerciseInfo,
  sessions = [],
  onAddExercises,
}: QuickEditModeProps) {
  const [editingCell, setEditingCell] = useState<{
    exerciseId: string;
    setIndex: number;
    field: 'reps' | 'weight';
    currentValue: number;
    exerciseName: string;
  } | null>(null);
  const [editingRestTime, setEditingRestTime] = useState<{
    exerciseId: string;
    exerciseName: string;
    currentRestTime: number;
  } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [tempRestTime, setTempRestTime] = useState<string>('');
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(new Set());
  const [manuallyExpandedExercises, setManuallyExpandedExercises] = useState<Set<string>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  // ✅ Usar estado controlado si se proporciona, sino usar estado local
  const [skipRestTimersLocal, setSkipRestTimersLocal] = useState(false);
  const skipRestTimers = skipRestTimersProp !== undefined ? skipRestTimersProp : skipRestTimersLocal;
  const setSkipRestTimers = (value: boolean) => {
    if (onSkipRestTimersChange) {
      onSkipRestTimersChange(value);
    } else {
      setSkipRestTimersLocal(value);
    }
  };
  // ✅ Estado para el temporizador flotante
  const [showFloatingTimer, setShowFloatingTimer] = useState(false);
  const [floatingTimerDuration, setFloatingTimerDuration] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restInputRef = useRef<HTMLInputElement>(null);
  const exerciseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const setInputRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Mantener el foco en el input cuando se abre el modal
  useEffect(() => {
    if (editingCell && inputRef.current) {
      // Pequeño delay para asegurar que el modal esté completamente renderizado
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [editingCell]);

  // Mantener el foco en el input de descanso cuando se abre el modal
  useEffect(() => {
    if (editingRestTime && restInputRef.current) {
      const timer = setTimeout(() => {
        restInputRef.current?.focus();
        restInputRef.current?.select();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [editingRestTime]);

  // Scroll automático al ejercicio con series pendientes al montar o cuando cambian los datos
  useEffect(() => {
    const skippedExercises = workoutData.skippedExercises || [];
    
    // Encontrar el primer ejercicio con series incompletas que no esté omitido
    const firstIncompleteExercise = routine.exercises.find((exercise) => {
      const exerciseId = exercise.id;
      if (skippedExercises.includes(exerciseId)) return false; // Saltar omitidos
      const actualReps = workoutData.actualReps[exerciseId] || [];
      const completedCount = actualReps.filter(r => typeof r === 'number' && r > 0).length;
      return completedCount < exercise.sets.length;
    });

    if (firstIncompleteExercise) {
      const exerciseElement = exerciseRefs.current[firstIncompleteExercise.id];
      if (exerciseElement) {
        // Scroll suave al ejercicio con un pequeño offset para el header
        setTimeout(() => {
          const headerOffset = 180; // Altura del header sticky
          const elementPosition = exerciseElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 300);
      }
    }
  }, [routine.exercises, workoutData.actualReps, workoutData.skippedExercises]);

  // Función para iniciar edición con el valor actual
  const startEditing = (
    exerciseId: string,
    setIndex: number,
    field: 'reps' | 'weight',
    currentValue: number,
    exerciseName: string
  ) => {
    console.log('[QuickEdit] startEditing called:', { exerciseId, setIndex, field, currentValue, exerciseName });
    setEditingCell({ exerciseId, setIndex, field, currentValue, exerciseName });
    setTempValue(currentValue === 0 ? '' : String(currentValue));
  };

  // Función para encontrar la siguiente serie incompleta
  const findNextIncompleteSet = (currentExerciseId: string, currentSetIndex: number): { exerciseId: string; setIndex: number; field: 'reps' | 'weight' } | null => {
    const skippedExercises = workoutData.skippedExercises || [];
    
    // Buscar en el ejercicio actual primero (si no está omitido)
    const currentExercise = routine.exercises.find(ex => ex.id === currentExerciseId);
    if (currentExercise && !skippedExercises.includes(currentExerciseId)) {
      const completedCount = workoutData.completedSets[currentExerciseId] || 0;
      
      // Buscar la siguiente serie incompleta en el mismo ejercicio
      for (let i = currentSetIndex + 1; i < currentExercise.sets.length; i++) {
        if (i >= completedCount) {
          // Determinar si necesita editar reps o peso
          const actualReps = workoutData.actualReps[currentExerciseId]?.[i];
          const actualWeight = workoutData.actualWeights[currentExerciseId]?.[i];
          
          // Si no tiene reps, enfocar en reps; si tiene reps pero no peso, enfocar en peso
          if (actualReps === undefined || actualReps === 0) {
            return { exerciseId: currentExerciseId, setIndex: i, field: 'reps' };
          } else if (actualWeight === undefined || actualWeight === 0) {
            return { exerciseId: currentExerciseId, setIndex: i, field: 'weight' };
          }
        }
      }
    }
    
    // Si no hay más series en el ejercicio actual, buscar en los siguientes ejercicios (no omitidos)
    const currentExerciseIndex = routine.exercises.findIndex(ex => ex.id === currentExerciseId);
    for (let exIdx = currentExerciseIndex + 1; exIdx < routine.exercises.length; exIdx++) {
      const exercise = routine.exercises[exIdx];
      
      // Saltar ejercicios omitidos
      if (skippedExercises.includes(exercise.id)) continue;
      
      const completedCount = workoutData.completedSets[exercise.id] || 0;
      
      for (let setIdx = 0; setIdx < exercise.sets.length; setIdx++) {
        if (setIdx >= completedCount) {
          const actualReps = workoutData.actualReps[exercise.id]?.[setIdx];
          const actualWeight = workoutData.actualWeights[exercise.id]?.[setIdx];
          
          if (actualReps === undefined || actualReps === 0) {
            return { exerciseId: exercise.id, setIndex: setIdx, field: 'reps' };
          } else if (actualWeight === undefined || actualWeight === 0) {
            return { exerciseId: exercise.id, setIndex: setIdx, field: 'weight' };
          }
        }
      }
    }
    
    return null;
  };

  // Función para mover el foco a la siguiente serie
  const focusNextIncompleteSet = (currentExerciseId: string, currentSetIndex: number) => {
    const nextSet = findNextIncompleteSet(currentExerciseId, currentSetIndex);
    
    if (nextSet) {
      // Expandir el ejercicio si está colapsado
      setCollapsedExercises(prev => {
        const newSet = new Set(prev);
        newSet.delete(nextSet.exerciseId);
        return newSet;
      });
      
      // Marcar como manualmente expandido
      setManuallyExpandedExercises(prev => {
        const newExpanded = new Set(prev);
        newExpanded.add(nextSet.exerciseId);
        return newExpanded;
      });
      
      // Esperar un momento para que el DOM se actualice
      setTimeout(() => {
        // Scroll al ejercicio si es necesario
        const exerciseElement = exerciseRefs.current[nextSet.exerciseId];
        if (exerciseElement) {
          const headerOffset = 180;
          const elementPosition = exerciseElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        
        // Hacer click en el botón de la siguiente serie para abrir el modal de edición
        setTimeout(() => {
          const refKey = `${nextSet.exerciseId}-${nextSet.setIndex}-${nextSet.field}`;
          const buttonElement = setInputRefs.current[refKey];
          if (buttonElement) {
            buttonElement.click();
          }
        }, 300);
      }, 100);
    }
  };

  // Función para guardar el valor editado
  const saveEdit = () => {
    if (!editingCell) return;
    
    const value = tempValue === '' ? 0 : (editingCell.field === 'reps' ? parseInt(tempValue) : parseFloat(tempValue));
    
    if (!isNaN(value) && value >= 0) {
      if (editingCell.field === 'reps') {
        onEditReps(editingCell.exerciseId, editingCell.setIndex, value);
      } else {
        onEditWeight(editingCell.exerciseId, editingCell.setIndex, value);
      }
    }
    
    setEditingCell(null);
    setTempValue('');
  };

  // Función para cancelar edición (ahora también guarda si hay cambios)
  const cancelEdit = () => {
    // Limpiar timer de auto-cierre
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    
    // Si hay un valor válido, guardarlo antes de cerrar
    if (editingCell && tempValue) {
      const value = editingCell.field === 'reps' ? parseInt(tempValue) : parseFloat(tempValue);
      
      if (!isNaN(value) && value >= 0) {
        if (editingCell.field === 'reps') {
          onEditReps(editingCell.exerciseId, editingCell.setIndex, value);
        } else {
          onEditWeight(editingCell.exerciseId, editingCell.setIndex, value);
        }
      }
    }
    
    setEditingCell(null);
    setTempValue('');
  };

  // Función para actualizar valor con auto-cierre
  const updateValueWithAutoClose = (newValue: string, immediate: boolean = false) => {
    setTempValue(newValue);

    // Limpiar timer anterior
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }

    if (!editingCell) return;

    // Si es inmediato (atajo rápido), guardar y cerrar ahora
    if (immediate) {
      const value = editingCell.field === 'reps' ? parseInt(newValue) : parseFloat(newValue);
      if (!isNaN(value) && value > 0) {
        if (editingCell.field === 'reps') {
          onEditReps(editingCell.exerciseId, editingCell.setIndex, value);
        } else {
          onEditWeight(editingCell.exerciseId, editingCell.setIndex, value);
        }
        setEditingCell(null);
        setTempValue('');
      }
      return;
    }

    // Si no es inmediato (teclado), programar auto-cierre en 2 segundos
    autoCloseTimerRef.current = setTimeout(() => {
      const value = editingCell.field === 'reps' ? parseInt(newValue) : parseFloat(newValue);
      if (!isNaN(value) && value > 0) {
        if (editingCell.field === 'reps') {
          onEditReps(editingCell.exerciseId, editingCell.setIndex, value);
        } else {
          onEditWeight(editingCell.exerciseId, editingCell.setIndex, value);
        }
        setEditingCell(null);
        setTempValue('');
      }
    }, 2000);
  };

  // Función para toggle collapse de un ejercicio
  const toggleCollapse = (exerciseId: string) => {
    setCollapsedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
        // Marcar como manualmente expandido para evitar auto-collapse
        setManuallyExpandedExercises(prevExpanded => {
          const newExpanded = new Set(prevExpanded);
          newExpanded.add(exerciseId);
          return newExpanded;
        });
      } else {
        newSet.add(exerciseId);
        // Remover de manualmente expandido si se colapsa
        setManuallyExpandedExercises(prevExpanded => {
          const newExpanded = new Set(prevExpanded);
          newExpanded.delete(exerciseId);
          return newExpanded;
        });
      }
      return newSet;
    });
  };

  // Función para abrir modal de edición de descanso
  const startEditingRestTime = (exerciseId: string, exerciseName: string, currentRestTime: number) => {
    setEditingRestTime({ exerciseId, exerciseName, currentRestTime });
    setTempRestTime(String(currentRestTime));
  };

  // Función para guardar el tiempo de descanso editado
  const saveRestTime = () => {
    if (!editingRestTime || !onEditRestTime) return;
    
    const value = parseInt(tempRestTime);
    
    if (!isNaN(value) && value >= 0) {
      onEditRestTime(editingRestTime.exerciseId, value);
    }
    
    setEditingRestTime(null);
    setTempRestTime('');
  };

  // Función para cancelar edición de descanso (ahora también guarda si hay cambios)
  const cancelRestEdit = () => {
    // Si hay un valor válido, guardarlo antes de cerrar
    if (editingRestTime && tempRestTime && onEditRestTime) {
      const value = parseInt(tempRestTime);
      
      if (!isNaN(value) && value >= 0) {
        onEditRestTime(editingRestTime.exerciseId, value);
      }
    }
    
    setEditingRestTime(null);
    setTempRestTime('');
  };

  // Calcular progreso total - memoizado para evitar recalcular en cada render
  const { totalSets, completedSets, progressPercent } = useMemo(() => {
    const skippedExercises = workoutData.skippedExercises || [];
    
    // Filtrar ejercicios omitidos
    const activeExercises = routine.exercises.filter(ex => !skippedExercises.includes(ex.id));
    
    const total = activeExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    
    // Solo contar series completadas de ejercicios activos (no omitidos)
    const completed = activeExercises.reduce((sum, ex) => {
      const exerciseReps = workoutData.actualReps[ex.id] || [];
      // Solo contar hasta el número de series que tiene el ejercicio actualmente
      const completedInExercise = exerciseReps
        .slice(0, ex.sets.length)
        .filter(r => r > 0).length;
      return sum + completedInExercise;
    }, 0);
    
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    // Limitar a máximo 100%
    const cappedPercent = Math.min(percent, 100);
    
    return { totalSets: total, completedSets: completed, progressPercent: cappedPercent };
  }, [routine.exercises, workoutData.actualReps, workoutData.skippedExercises]);

  return (
    <div className="space-y-3 pb-32">
      {/* Temporizador flotante */}
      {showFloatingTimer && (
        <FloatingRestTimer
          duration={floatingTimerDuration}
          onComplete={() => {
            setShowFloatingTimer(false);
            // Opcional: Mostrar notificación o vibración
          }}
          onDismiss={() => setShowFloatingTimer(false)}
        />
      )}
      
      {/* Header mejorado - sticky y más visual */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              📝 Edición Rápida
            </h2>
            <p className="text-xs opacity-90">
              Toca cualquier valor para editarlo
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold leading-none">{progressPercent}%</div>
            <div className="text-xs opacity-90 mt-1">{completedSets}/{totalSets} series</div>
          </div>
        </div>
        
        {/* Switch para omitir descansos */}
        <div className="flex items-center justify-between gap-3 mt-3 p-2 bg-white/10 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium">Omitir descansos</span>
          </div>
          <button
            onClick={() => setSkipRestTimers(!skipRestTimers)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 ${
              skipRestTimers ? 'bg-green-500' : 'bg-white/30'
            }`}
            role="switch"
            aria-checked={skipRestTimers}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                skipRestTimers ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {/* Barra de progreso mejorada */}
        <div className="w-full bg-white/20 rounded-full h-2 mt-3 overflow-hidden">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {routine.exercises.map((exercise, exIdx) => {
        const exerciseId = exercise.id;
        const actualReps = workoutData.actualReps[exerciseId] || [];
        const actualWeights = workoutData.actualWeights[exerciseId] || [];
        const setTypes = workoutData.setTypes[exerciseId] || [];
        const isSkipped = workoutData.skippedExercises?.includes(exerciseId) || false;
        
        // Obtener el contador REAL de series completadas desde workoutData
        const completedCount = workoutData.completedSets[exerciseId] || 0;
        const isFullyCompleted = completedCount === exercise.sets.length;
        const isCollapsed = collapsedExercises.has(exerciseId);
        const isManuallyExpanded = manuallyExpandedExercises.has(exerciseId);
        
        // Determinar si es el ejercicio actual (primer incompleto no omitido)
        const firstIncompleteIndex = routine.exercises.findIndex((ex) => {
          const exId = ex.id;
          const isExSkipped = workoutData.skippedExercises?.includes(exId) || false;
          if (isExSkipped) return false; // Saltar ejercicios omitidos
          const count = workoutData.completedSets[exId] || 0;
          return count < ex.sets.length;
        });
        const isCurrent = exIdx === firstIncompleteIndex;
        const isNext = exIdx === firstIncompleteIndex + 1;

        // Auto-colapsar cuando se completa (solo si no está manualmente expandido)
        if (isFullyCompleted && !isCollapsed && completedCount > 0 && !isManuallyExpanded) {
          // Usar setTimeout para evitar actualizar estado durante render
          setTimeout(() => {
            setCollapsedExercises(prev => {
              const newSet = new Set(prev);
              newSet.add(exerciseId);
              return newSet;
            });
          }, 0);
        }

        return (
          <div 
            key={exerciseId}
            ref={(el) => {
              exerciseRefs.current[exerciseId] = el;
            }}
            draggable={onMoveExercise !== undefined}
            onDragStart={() => {
              if (onMoveExercise) {
                setDraggedIndex(exIdx);
              }
            }}
            onDragEnd={() => {
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            onDragOver={(e) => {
              if (onMoveExercise) {
                e.preventDefault();
                setDragOverIndex(exIdx);
              }
            }}
            onDragLeave={() => {
              setDragOverIndex(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (onMoveExercise && draggedIndex !== null && draggedIndex !== exIdx) {
                onMoveExercise(draggedIndex, exIdx);
              }
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            className={`transition-all ${
              dragOverIndex === exIdx && draggedIndex !== exIdx
                ? 'scale-105 ring-2 ring-blue-500'
                : draggedIndex === exIdx
                ? 'opacity-50'
                : ''
            }`}
          >
            <Card className={`overflow-hidden ${
              isSkipped
                ? 'opacity-40 ring-2 ring-yellow-400 dark:ring-yellow-600'
                : isCurrent 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : isNext 
                ? 'ring-2 ring-orange-400 shadow-md' 
                : isFullyCompleted
                ? 'opacity-75'
                : ''
            }`}>
            {/* Header del ejercicio mejorado con más información */}
            <div className={`border-b border-gray-200 dark:border-gray-700 ${
              isCurrent
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30'
                : isNext
                ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30'
                : isFullyCompleted
                ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
                : 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900'
            }`}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleCollapse(exerciseId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCollapse(exerciseId);
                  }
                }}
                aria-expanded={!isCollapsed}
                className="w-full p-3 hover:brightness-95 transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Número de ejercicio más grande y colorido */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-md flex-shrink-0 ${
                      isCurrent
                        ? 'bg-blue-500 text-white'
                        : isNext
                        ? 'bg-orange-500 text-white'
                        : isFullyCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-400 dark:bg-gray-600 text-white'
                    }`}>
                      {exIdx + 1}
                    </div>
                    
                    <div className="text-left flex-1 min-w-0">
                      {/* Nombre y badges */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 truncate">
                          {exercise.name}
                        </h3>
                        {/* Badge de omitido */}
                        {isSkipped && (
                          <span className="px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-bold rounded-full shadow-sm flex-shrink-0">
                            OMITIDO
                          </span>
                        )}
                        {/* Badge de estado más prominente */}
                        {!isSkipped && isCurrent && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm flex-shrink-0">
                            ACTUAL
                          </span>
                        )}
                        {!isSkipped && isNext && !isCurrent && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm flex-shrink-0">
                            SIGUIENTE
                          </span>
                        )}
                      </div>
                      
                      {/* Información del ejercicio */}
                      <div className="space-y-1">
                        {/* Progreso y equipo */}
                        <div className="flex items-center gap-3 flex-wrap text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <span className="font-medium">{completedCount}/{exercise.sets.length} series</span>
                          </div>
                          
                          {exercise.equipment && (
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              <span className="capitalize">{exercise.equipment}</span>
                            </div>
                          )}
                          
                          {/* Botón de información del ejercicio */}
                          {onShowExerciseInfo && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onShowExerciseInfo(exercise.name);
                              }}
                              className="flex items-center gap-1.5 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-md transition-colors"
                              title="Ver información del ejercicio"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-[10px] font-semibold">Info</span>
                            </button>
                          )}
                        </div>
                        
                        {/* Notas del ejercicio si existen */}
                        {exercise.notes && (
                          <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="line-clamp-1 italic">{exercise.notes}</span>
                          </div>
                        )}
                        
                        {/* Icono de collapse */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <svg 
                            className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="font-medium">{isCollapsed ? 'Ver series' : 'Ocultar series'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicador de progreso circular mejorado */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 transform -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - completedCount / exercise.sets.length)}`}
                          className={`transition-all duration-500 ${
                            isFullyCompleted
                              ? 'text-green-500'
                              : completedCount > 0
                              ? 'text-blue-500'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isFullyCompleted ? (
                          <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-none">
                              {completedCount}
                            </div>
                            <div className="text-[9px] text-gray-500 dark:text-gray-400 leading-none mt-0.5">
                              de {exercise.sets.length}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Indicador de descanso - siempre visible */}
              <div className="px-2.5 pb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">
                    Descanso: {(() => {
                      const override = workoutData.restOverrides?.[exerciseId];
                      const restTime = override ?? exercise.restBetweenSets ?? routine.restBetweenSets ?? 90;
                      
                      // Formatear en minutos y segundos
                      if (restTime >= 60) {
                        const minutes = Math.floor(restTime / 60);
                        const seconds = restTime % 60;
                        return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
                      }
                      return `${restTime}s`;
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {onEditRestTime && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const override = workoutData.restOverrides?.[exerciseId];
                        const restTime = override ?? exercise.restBetweenSets ?? routine.restBetweenSets ?? 90;
                        startEditingRestTime(exerciseId, exercise.name, restTime);
                      }}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded text-[10px] font-medium transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Editar
                    </button>
                  )}
                  {/* Botón de omitir/restaurar ejercicio */}
                  {(onSkipExercise || onUnskipExercise) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSkipped && onUnskipExercise) {
                          onUnskipExercise(exerciseId);
                        } else if (!isSkipped && onSkipExercise) {
                          onSkipExercise(exerciseId);
                        }
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${
                        isSkipped
                          ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'
                      }`}
                      title={isSkipped ? 'Restaurar ejercicio' : 'Omitir ejercicio en esta sesión'}
                    >
                      {isSkipped ? (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Restaurar
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                          </svg>
                          Omitir
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Botones de reordenar */}
              {onMoveExercise && routine.exercises.length > 1 && (
                <div className="px-2.5 pb-2 flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Reordenar:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (exIdx > 0) {
                          onMoveExercise(exIdx, exIdx - 1);
                        }
                      }}
                      disabled={exIdx === 0}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[10px] font-medium transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover arriba"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Subir
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (exIdx < routine.exercises.length - 1) {
                          onMoveExercise(exIdx, exIdx + 1);
                        }
                      }}
                      disabled={exIdx === routine.exercises.length - 1}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[10px] font-medium transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover abajo"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Bajar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <CardContent className="p-0">
              {/* Tabla de series */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300 w-8">#</th>
                      <th className="text-center py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300">Reps</th>
                      <th className="text-center py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300">Peso</th>
                      <th className="text-center py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300 w-10">Tipo</th>
                      <th className="text-center py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300 w-16">↻</th>
                      <th className="text-center py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300 w-12">✓</th>
                      {onDeleteSet && exercise.sets.length > 1 && (
                        <th className="text-center py-1.5 px-2 font-semibold text-gray-700 dark:text-gray-300 w-8"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, setIdx) => {
                      const doneReps = actualReps[setIdx];
                      const doneWeight = actualWeights[setIdx];
                      const setType = setTypes[setIdx] || 'normal';
                      
                      // Una serie está completada SOLO si está marcada explícitamente en completedSets
                      // NO basarse en si tiene valores de reps/weight
                      const completedCount = workoutData.completedSets[exerciseId] || 0;
                      const isCompleted = setIdx < completedCount;
                      
                      const isEditingReps = editingCell?.exerciseId === exerciseId && editingCell?.setIndex === setIdx && editingCell?.field === 'reps';
                      const isEditingWeight = editingCell?.exerciseId === exerciseId && editingCell?.setIndex === setIdx && editingCell?.field === 'weight';

                      // Valores a mostrar
                      const displayReps = doneReps !== undefined ? doneReps : set.reps;
                      const displayWeight = doneWeight !== undefined ? doneWeight : (set.weight || 0);
                      
                      // Obtener valores de la serie anterior para copiar
                      const canCopyPrevious = setIdx > 0;
                      const previousReps = canCopyPrevious ? (actualReps[setIdx - 1] || exercise.sets[setIdx - 1]?.reps) : null;
                      const previousWeight = canCopyPrevious ? (actualWeights[setIdx - 1] || exercise.sets[setIdx - 1]?.weight) : null;
                      
                      // Calcular indicadores de progreso comparando con última sesión
                      const lastSession = sessions.length > 0 
                        ? sessions
                            .filter(s => s.exercises.some((e: any) => e.exerciseName === exercise.name))
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                        : null;
                      
                      const lastExerciseData = lastSession?.exercises.find((e: any) => e.exerciseName === exercise.name);
                      const lastReps = lastExerciseData?.actualReps?.[setIdx];
                      const lastWeight = lastExerciseData?.actualWeight?.[setIdx];
                      
                      // Calcular diferencias
                      const repsDiff = (displayReps && lastReps) ? displayReps - lastReps : null;
                      const weightDiff = (displayWeight && lastWeight) ? displayWeight - lastWeight : null;
                      
                      // Determinar si hay progreso
                      const hasRepsProgress = repsDiff !== null && repsDiff !== 0;
                      const hasWeightProgress = weightDiff !== null && weightDiff !== 0;

                      return (
                        <tr
                          key={`${exerciseId}-${setIdx}`}
                          className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${
                            isCompleted
                              ? 'bg-green-50/50 dark:bg-green-900/10'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-900/30'
                          }`}
                        >
                          {/* Número de serie */}
                          <td className="py-2 px-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                              {setIdx + 1}
                            </div>
                          </td>

                          {/* Reps - editable */}
                          <td className="py-2 px-2">
                            <div className="relative">
                              <button
                                ref={(el) => {
                                  setInputRefs.current[`${exerciseId}-${setIdx}-reps`] = el;
                                }}
                                onClick={() => startEditing(exerciseId, setIdx, 'reps', displayReps, exercise.name)}
                                className={`w-full min-h-[44px] px-3 py-2 rounded-lg transition-colors font-bold text-base border-2 ${
                                  displayReps === 0
                                    ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    : isCompleted
                                    ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
                                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                                }`}
                              >
                                {displayReps === 0 ? '-' : displayReps}
                              </button>
                              {/* Indicador de progreso */}
                              {hasRepsProgress && displayReps > 0 && (
                                <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${
                                  repsDiff! > 0 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-orange-500 text-white'
                                }`}>
                                  {repsDiff! > 0 ? '↗' : '↘'}{Math.abs(repsDiff!)}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Peso - editable */}
                          <td className="py-2 px-2">
                            <div className="relative">
                              <button
                                ref={(el) => {
                                  setInputRefs.current[`${exerciseId}-${setIdx}-weight`] = el;
                                }}
                                onClick={() => startEditing(exerciseId, setIdx, 'weight', displayWeight, exercise.name)}
                                className={`w-full min-h-[44px] px-3 py-2 rounded-lg transition-colors font-bold text-sm border-2 ${
                                  displayWeight === 0
                                    ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    : isCompleted
                                    ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
                                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                                }`}
                              >
                                {displayWeight === 0 ? '-' : `${displayWeight} kg`}
                              </button>
                              {/* Indicador de progreso */}
                              {hasWeightProgress && displayWeight > 0 && (
                                <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${
                                  weightDiff! > 0 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-orange-500 text-white'
                                }`}>
                                  {weightDiff! > 0 ? '↗' : '↘'}{Math.abs(weightDiff!)}kg
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Tipo de serie - visible en todas las pantallas */}
                          <td className="py-2 px-2">
                            <div className="flex justify-center">
                              <SetTypeCycleButton
                                value={setType as SetType}
                                onChange={(type) => onEditSetType(exerciseId, setIdx, type)}
                                size="sm"
                                showLabel={false}
                              />
                            </div>
                          </td>

                          {/* Botón copiar serie anterior */}
                          <td className="py-2 px-2">
                            <div className="flex justify-center">
                              {canCopyPrevious && previousReps && previousWeight ? (
                                <button
                                  onClick={() => {
                                    // Copiar reps y peso de la serie anterior
                                    onEditReps(exerciseId, setIdx, previousReps);
                                    onEditWeight(exerciseId, setIdx, previousWeight);
                                  }}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                                  title={`Copiar serie anterior (${previousReps} reps × ${previousWeight}kg)`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </button>
                              ) : (
                                <div className="w-8 h-8" />
                              )}
                            </div>
                          </td>

                          {/* Checkbox de completado */}
                          <td className="py-2 px-2">
                            <div className="flex justify-center">
                              <button
                                onClick={() => {
                                  const newIsCompleted = !isCompleted;
                                  onToggleSetComplete(exerciseId, setIdx, newIsCompleted);
                                  
                                  // Si se marca como completada, mover foco a la siguiente serie
                                  if (newIsCompleted) {
                                    // ✅ Mostrar temporizador flotante si no se están omitiendo descansos
                                    if (!skipRestTimers) {
                                      // Calcular tiempo de descanso
                                      const perSetOverride = workoutData.perSetRestOverrides?.[exerciseId]?.[setIdx];
                                      const exerciseOverride = workoutData.restOverrides?.[exerciseId];
                                      const restTime = perSetOverride ?? exerciseOverride ?? exercise.restBetweenSets ?? routine.restBetweenSets ?? 90;
                                      
                                      setFloatingTimerDuration(restTime);
                                      setShowFloatingTimer(true);
                                    }
                                    
                                    setTimeout(() => {
                                      focusNextIncompleteSet(exerciseId, setIdx);
                                    }, 100);
                                  }
                                }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
                                  isCompleted
                                    ? 'bg-green-500 hover:bg-green-600 text-white scale-110'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-400 dark:text-gray-500'
                                }`}
                              >
                                {isCompleted ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Delete button */}
                          {onDeleteSet && exercise.sets.length > 1 && (
                            <td className="py-2 px-2">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => onDeleteSet(exerciseId, setIdx)}
                                  className="w-5 h-5 rounded-full flex items-center justify-center transition-all bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400"
                                  title="Eliminar serie"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Botón para agregar serie */}
              {onAddSet && (
                <div className="mt-2 px-2 space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSet(exerciseId);
                    }}
                    className="w-full py-2 px-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all font-medium text-xs flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Serie
                  </button>
                  
                  {/* Botón para aplicar descanso inteligente */}
                  {onApplySmartRest && exercise.useSmartRest !== false && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplySmartRest(exerciseId);
                      }}
                      className="w-full py-2 px-3 bg-white dark:bg-gray-800 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg text-purple-600 dark:text-purple-400 hover:border-purple-500 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all font-medium text-xs flex items-center justify-center gap-1.5"
                      title="Aplicar descanso inteligente basado en el tipo de ejercicio"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Aplicar Descanso Inteligente
                    </button>
                  )}
                </div>
              )}
              </CardContent>
            )}
          </Card>
          </div>
        );
      })}

      {/* Botón para agregar ejercicios al entrenamiento */}
      {onAddExercises && (
        <div className="mt-2 mb-4">
          <AddExerciseButton onAddExercises={onAddExercises} />
        </div>
      )}

      {/* Botón flotante compacto para finalizar - esquina inferior derecha */}
      {onFinishWorkout && (
        <button
          onClick={onFinishWorkout}
          disabled={completedSets === 0}
          className={`fixed bottom-6 right-6 z-30 p-4 rounded-full shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 ${
            completedSets === 0
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transform hover:scale-110 active:scale-95'
          }`}
          title={`Finalizar entrenamiento (${completedSets} series)`}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {/* Badge con contador de series */}
          {completedSets > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-green-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-green-500">
              {completedSets}
            </span>
          )}
        </button>
      )}

      {/* Modal de edición */}
      <BottomSheet
        isOpen={editingCell !== null}
        onClose={cancelEdit}
        title={editingCell ? `${editingCell.field === 'reps' ? 'Repeticiones' : 'Peso'} - ${editingCell.exerciseName}` : ''}
      >
        {editingCell && (
          <div className="space-y-6 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {editingCell.field === 'reps' ? 'Repeticiones' : 'Peso (kg)'}
              </p>
              {/* Input editable grande - SIEMPRE VISIBLE Y ENFOCADO */}
              <input
                ref={inputRef}
                type="text"
                inputMode={editingCell.field === 'reps' ? 'numeric' : 'decimal'}
                value={tempValue}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir solo números y punto decimal para peso
                  if (editingCell.field === 'weight') {
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      updateValueWithAutoClose(value, false);
                    }
                  } else {
                    // Solo números para reps
                    if (value === '' || /^\d+$/.test(value)) {
                      updateValueWithAutoClose(value, false);
                    }
                  }
                }}
                onFocus={(e) => e.target.select()}
                autoFocus
                placeholder="Escribe aquí"
                className="w-full text-5xl font-bold text-center bg-transparent border-b-4 border-blue-500 dark:border-blue-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors py-2 mb-2"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Escribe directamente o usa los botones
              </p>
            </div>

            {/* Atajos rápidos para repeticiones comunes */}
            {editingCell.field === 'reps' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Atajos rápidos</p>
                <div className="grid grid-cols-5 gap-2">
                  {[8, 10, 12, 15, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => updateValueWithAutoClose(String(num), true)}
                      className="py-2 text-sm font-semibold bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pesos anteriores y atajos para peso */}
            {editingCell.field === 'weight' && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Pesos anteriores</p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {(() => {
                      // Obtener pesos únicos del ejercicio actual
                      const exercise = routine.exercises.find(ex => ex.id === editingCell.exerciseId);
                      const historicalWeights = exercise?.sets
                        .map(set => set.weight)
                        .filter((w, i, arr) => w && w > 0 && arr.indexOf(w) === i)
                        .sort((a, b) => (b || 0) - (a || 0))
                        .slice(0, 4) || [];
                      
                      return historicalWeights.length > 0 ? historicalWeights.map((weight) => (
                        <button
                          key={weight}
                          onClick={() => updateValueWithAutoClose(String(weight), true)}
                          className="py-2 text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors"
                        >
                          {weight}kg
                        </button>
                      )) : (
                        <p className="col-span-4 text-xs text-gray-400 text-center py-2">
                          No hay pesos anteriores
                        </p>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Incrementos rápidos</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[2.5, 5, 10, 20].map((increment) => (
                      <button
                        key={increment}
                        onClick={() => {
                          const current = parseFloat(tempValue) || 0;
                          updateValueWithAutoClose(String(current + increment), false);
                        }}
                        className="py-2 text-sm font-semibold bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                      >
                        +{increment}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Teclado numérico personalizado - OPCIONAL */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Atajos: cierre inmediato • Teclado: 2s</p>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      const newValue = tempValue === '0' ? String(num) : tempValue + num;
                      updateValueWithAutoClose(newValue, false);
                    }}
                    className="h-16 text-2xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                
                {/* Botón decimal solo para peso */}
                {editingCell.field === 'weight' ? (
                  <button
                    onClick={() => {
                      if (!tempValue.includes('.')) {
                        const newValue = (tempValue || '0') + '.';
                        updateValueWithAutoClose(newValue, false);
                      }
                    }}
                    className="h-16 text-2xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
                  >
                    .
                  </button>
                ) : (
                  <div className="h-16" />
                )}
                
                <button
                  onClick={() => {
                    const newValue = tempValue === '0' ? '0' : tempValue + '0';
                    updateValueWithAutoClose(newValue, false);
                  }}
                  className="h-16 text-2xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
                >
                  0
                </button>
                
                {/* Botón borrar */}
                <button
                  onClick={() => {
                    const newValue = tempValue.length > 1 ? tempValue.slice(0, -1) : '';
                    updateValueWithAutoClose(newValue, false);
                  }}
                  className="h-16 text-xl font-bold bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl transition-colors active:scale-95"
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* Botón de cerrar */}
            <div className="pt-4">
              <button
                onClick={cancelEdit}
                className="w-full py-4 text-base font-bold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Modal de edición de tiempo de descanso */}
      <BottomSheet
        isOpen={editingRestTime !== null}
        onClose={cancelRestEdit}
        title={editingRestTime ? `${editingRestTime.exerciseName} - Descanso` : ''}
      >
        {editingRestTime && (
          <div className="space-y-6 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Tiempo de descanso entre series (segundos)
              </p>
              {/* Input editable grande */}
              <input
                ref={restInputRef}
                type="text"
                inputMode="numeric"
                value={tempRestTime}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setTempRestTime(value);
                  }
                }}
                onFocus={(e) => e.target.select()}
                autoFocus
                placeholder="Segundos"
                className="w-full text-5xl font-bold text-center bg-transparent border-b-4 border-purple-500 dark:border-purple-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors py-2 mb-2"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Escribe directamente o usa los botones
              </p>
            </div>

            {/* Atajos rápidos para tiempos comunes */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Tiempos comunes</p>
              <div className="grid grid-cols-4 gap-2">
                {[30, 60, 90, 120, 180, 240, 300, 360].map((seconds) => (
                  <button
                    key={seconds}
                    onClick={() => setTempRestTime(String(seconds))}
                    className="py-2 text-sm font-semibold bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg transition-colors"
                  >
                    {seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`}
                  </button>
                ))}
              </div>
            </div>

            {/* Teclado numérico */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Teclado numérico</p>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => setTempRestTime(prev => prev === '0' ? String(num) : prev + num)}
                    className="h-16 text-2xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                
                <div className="h-16" />
                
                <button
                  onClick={() => setTempRestTime(prev => prev === '0' ? '0' : prev + '0')}
                  className="h-16 text-2xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
                >
                  0
                </button>
                
                {/* Botón borrar */}
                <button
                  onClick={() => setTempRestTime(prev => prev.length > 1 ? prev.slice(0, -1) : '')}
                  className="h-16 text-xl font-bold bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl transition-colors active:scale-95"
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                onClick={cancelRestEdit}
                className="py-4 text-base font-bold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveRestTime}
                className="py-4 text-base font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
