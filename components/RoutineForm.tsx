'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRoutines } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { Exercise } from '@/types';
import { Input, TextArea } from '@/components/ui/Input';
import { useTranslations } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EditValueModal } from '@/components/EditValueModal';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { EquipmentDropdown } from '@/components/EquipmentDropdown';
import { RestTimeSelector, RestTimeSelectorCompact } from '@/components/RestTimeSelector';
import SetTypeSelector from '@/components/SetTypeSelector';
import { ExerciseTemplate, getExerciseByName, MuscleGroup } from '@/data/exercises';
import { WarmupExercise } from '@/data/warmupExercises';
import { WarmupRecommendation } from '@/components/WarmupRecommendation';
import { useConfirm } from '@/context/ConfirmContext';
import { getRoutineStats } from '@/lib/routineEstimation';

interface RoutineFormProps {
  routineId?: string | null;
  onClose: () => void;
}

export const RoutineForm: React.FC<RoutineFormProps> = ({ routineId, onClose }) => {
  const { addRoutine, updateRoutine, getRoutineById } = useRoutines();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  
  // Clave para localStorage
  const STORAGE_KEY = 'gym-tracker-routine-draft';
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string>('');
  const [exercises, setExercises] = useState<Omit<Exercise, 'id'>[]>([]);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [restBetweenSets, setRestBetweenSets] = useState(60);
  const [restBetweenExercises, setRestBetweenExercises] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ exerciseIndex: number; setIndex: number; message: string }>>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<'basic' | 'exercises' | 'review'>('basic');
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set());
  const [editingValue, setEditingValue] = useState<{
    exerciseIndex: number;
    setIndex: number;
    field: 'reps' | 'weight';
    currentValue: number;
  } | null>(null);

  // Calcular estadísticas de la rutina
  const routineStats = useMemo(() => {
    return getRoutineStats(exercises, restBetweenSets, restBetweenExercises);
  }, [exercises, restBetweenSets, restBetweenExercises]);

  const toggleExerciseExpanded = (index: number) => {
    setExpandedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Guardar borrador en localStorage con debounce para evitar escrituras excesivas
  useEffect(() => {
    // No guardar si estamos editando una rutina existente
    if (routineId) return;
    
    // Solo guardar si hay algún dato ingresado
    if (!name && !description && !image && exercises.length === 0) return;
    
    // Debounce: esperar 1 segundo antes de guardar
    const timeoutId = setTimeout(() => {
      try {
        const draft = {
          name,
          description,
          image,
          exercises,
          restBetweenSets,
          restBetweenExercises,
          currentStep,
          timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch (e) {
        console.warn('Error saving draft:', e);
      }
    }, 1000); // Esperar 1 segundo de inactividad antes de guardar
    
    return () => clearTimeout(timeoutId);
  }, [name, description, image, exercises, restBetweenSets, restBetweenExercises, currentStep, routineId]);

  // Restaurar borrador al montar (solo si no estamos editando)
  useEffect(() => {
    if (routineId) {
      // Lógica existente para editar rutina
      const routine = getRoutineById(routineId);
      if (routine) {
        setName(routine.name);
        setDescription(routine.description || '');
        setImage(routine.image || '');
        type StoredExercise = typeof routine.exercises[number];
        const migratedExercises = routine.exercises.map((r: StoredExercise) => {
          const { id, ...rest } = r;
          const restMaybe = rest as unknown as { sets?: unknown; reps?: unknown; weight?: unknown };
          if (typeof restMaybe.sets === 'number') {
            // Formato antiguo: migrar a nuevo formato
            const oldSets = restMaybe.sets as number;
            const oldReps = (restMaybe.reps as number) || 10;
            const oldWeight = (restMaybe.weight as number) || 0;
            const newExercise = {
              name: (rest as Omit<Exercise, 'id'>).name,
              equipment: (rest as Omit<Exercise, 'id'>).equipment,
              notes: (rest as Omit<Exercise, 'id'>).notes,
              sets: Array(oldSets).fill(null).map(() => ({ 
                reps: oldReps, 
                weight: oldWeight,
                type: 'normal' as import('@/types').SetType
              })),
              // Preservar campos de descanso si existen
              restBetweenSets: (rest as any).restBetweenSets,
              useSmartRest: (rest as any).useSmartRest
            } as Omit<Exercise, 'id'>;
            return newExercise;
          }
          // Formato nuevo: preservar todos los campos incluyendo restBetweenSets y useSmartRest
          return rest as Omit<Exercise, 'id'>;
        });
        setExercises(migratedExercises);
        setRestBetweenSets(routine.restBetweenSets || 60);
        setRestBetweenExercises(routine.restBetweenExercises || 120);
        setCurrentStep('exercises');
      }
    } else {
      // Intentar restaurar borrador
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const draft = JSON.parse(stored);
          // Solo restaurar si el borrador es reciente (menos de 24 horas)
          const age = Date.now() - (draft.timestamp || 0);
          if (age < 24 * 60 * 60 * 1000) {
            setName(draft.name || '');
            setDescription(draft.description || '');
            setImage(draft.image || '');
            setExercises(draft.exercises || []);
            setRestBetweenSets(draft.restBetweenSets || 60);
            setRestBetweenExercises(draft.restBetweenExercises || 120);
            setCurrentStep(draft.currentStep || 'basic');
          } else {
            // Borrador muy antiguo, eliminarlo
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (e) {
        console.warn('Error restoring draft:', e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineId]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing draft:', e);
    }
  };

  const handleCancelWithConfirm = async () => {
    // Si hay datos ingresados, pedir confirmación
    if (name || description || image || exercises.length > 0) {
      const confirmed = await confirm({
        title: 'Cancelar creación de rutina',
        message: '¿Estás seguro? Se perderá todo el progreso no guardado.',
        confirmText: 'Sí, cancelar',
        cancelText: 'Continuar editando',
        variant: 'danger'
      });
      
      if (!confirmed) return;
    }
    
    clearDraft();
    onClose();
  };

  const handleAddExercise = () => {
    setIsExerciseSelectorOpen(true);
  };

  const handleSelectExercises = (exerciseTemplates: ExerciseTemplate[]) => {
    console.log('[RoutineForm] handleSelectExercises called with:', exerciseTemplates.length, 'exercises');
    console.log('[RoutineForm] Exercise names:', exerciseTemplates.map(e => e.name));
    
    const newExercises: Omit<Exercise, 'id'>[] = exerciseTemplates.map(template => {
      let defaultRestSecs: number | undefined;
      if (template.restTime) {
        const match = template.restTime.match(/(\d+)/);
        if (match) {
          defaultRestSecs = parseInt(match[1]);
          if (template.restTime.toLowerCase().includes('minuto')) {
            defaultRestSecs = defaultRestSecs * 60;
          }
        }
      }
      return {
        name: template.name,
        sets: Array(template.defaultSets || 3).fill(null).map(() => ({ 
          reps: template.defaultReps || 10, 
          weight: 0,
          type: 'normal' as import('@/types').SetType
        })),
        equipment: template.equipment,
        notes: '',
        restBetweenSets: defaultRestSecs
      };
    });
    
    console.log('[RoutineForm] Created', newExercises.length, 'new exercises');
    console.log('[RoutineForm] Current exercises:', exercises.length);
    
    setExercises([...exercises, ...newExercises]);
    
    console.log('[RoutineForm] After setExercises, total should be:', exercises.length + newExercises.length);
    
    setIsExerciseSelectorOpen(false);
  };

  const handleAddCustomExercise = () => {
    setExercises([...exercises, { 
      name: '', 
      sets: [{ reps: 10, weight: 0 }], 
      equipment: '', 
      notes: '' 
    }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
    // Limpiar el estado de expandido para este índice
    setExpandedExercises(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      // Ajustar índices mayores
      const adjusted = new Set<number>();
      newSet.forEach(i => {
        if (i > index) adjusted.add(i - 1);
        else adjusted.add(i);
      });
      return adjusted;
    });
  };

  const handleMoveExercise = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newExercises = [...exercises];
    const [movedExercise] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, movedExercise);
    setExercises(newExercises);
    
    // Ajustar el estado de expandido
    setExpandedExercises(prev => {
      const newSet = new Set<number>();
      prev.forEach(i => {
        if (i === fromIndex) {
          newSet.add(toIndex);
        } else if (fromIndex < toIndex) {
          if (i > fromIndex && i <= toIndex) newSet.add(i - 1);
          else newSet.add(i);
        } else {
          if (i >= toIndex && i < fromIndex) newSet.add(i + 1);
          else newSet.add(i);
        }
      });
      return newSet;
    });
  };

  // duplicate handleMoveExercise removed (logic kept in the earlier declaration)

  const handleExerciseChange = (index: number, field: 'name' | 'equipment' | 'notes', value: string) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    const exercise = newExercises[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    exercise.sets.push({ 
      reps: lastSet?.reps || 10, 
      weight: lastSet?.weight || 0,
      type: 'normal' // Tipo por defecto
    });
    setExercises(newExercises);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    if (newExercises[exerciseIndex].sets.length > 1) {
      newExercises[exerciseIndex].sets.splice(setIndex, 1);
      setExercises(newExercises);
    }
  };

  const handleCopySet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    const exercise = newExercises[exerciseIndex];
    const setToCopy = exercise.sets[setIndex];
    exercise.sets.splice(setIndex + 1, 0, { ...setToCopy });
    setExercises(newExercises);
  };

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight' | 'type', value: number | import('@/types').SetType) => {
    const newExercises = [...exercises];
    if (field === 'type') {
      newExercises[exerciseIndex].sets[setIndex][field] = value as import('@/types').SetType;
    } else {
      newExercises[exerciseIndex].sets[setIndex][field] = value as number;
    }
    setExercises(newExercises);
    
    // Marcar campo como tocado
    const fieldKey = `${exerciseIndex}-${setIndex}-${field}`;
    setTouchedFields(prev => new Set(prev).add(fieldKey));
    
    // Validación en tiempo real solo para campos tocados
    if (field === 'weight' && typeof value === 'number') {
      // Verificar si es ejercicio de peso corporal
      const exercise = newExercises[exerciseIndex];
      const isBodyweightExercise = exercise.equipment?.toLowerCase().includes('peso corporal') || 
                                   exercise.equipment?.toLowerCase().includes('bodyweight') ||
                                   exercise.name?.toLowerCase().includes('plancha') ||
                                   exercise.name?.toLowerCase().includes('flexion') ||
                                   exercise.name?.toLowerCase().includes('dominada') ||
                                   exercise.name?.toLowerCase().includes('abdominal');
      
      // Solo validar peso si no es ejercicio de peso corporal
      if (!isBodyweightExercise) {
        if (value <= 0) {
          // Agregar error si no existe
          const errorExists = validationErrors.some(
            err => err.exerciseIndex === exerciseIndex && err.setIndex === setIndex && err.message.includes('Peso')
          );
          if (!errorExists) {
            setValidationErrors(prev => [
              ...prev,
              { exerciseIndex, setIndex, message: 'Peso requerido (> 0)' }
            ]);
          }
        } else {
          // Remover error si existe
          setValidationErrors(prev => 
            prev.filter(err => !(err.exerciseIndex === exerciseIndex && err.setIndex === setIndex && err.message.includes('Peso')))
          );
        }
      } else {
        // Si es ejercicio de peso corporal, remover cualquier error de peso
        setValidationErrors(prev => 
          prev.filter(err => !(err.exerciseIndex === exerciseIndex && err.setIndex === setIndex && err.message.includes('Peso')))
        );
      }
    }
    
    if (field === 'reps' && typeof value === 'number') {
      if (value <= 0) {
        // Agregar error de reps si no existe
        const errorExists = validationErrors.some(
          err => err.exerciseIndex === exerciseIndex && err.setIndex === setIndex && err.message.includes('Reps')
        );
        if (!errorExists) {
          setValidationErrors(prev => [
            ...prev,
            { exerciseIndex, setIndex, message: 'Reps requeridas (> 0)' }
          ]);
        }
      } else {
        // Remover error de reps si existe
        setValidationErrors(prev => 
          prev.filter(err => !(err.exerciseIndex === exerciseIndex && err.setIndex === setIndex && err.message.includes('Reps')))
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    
    // Marcar todos los campos como tocados al hacer submit
    const allTouchedFields = new Set<string>();
    exercises.forEach((exercise, ei) => {
      exercise.sets.forEach((s, si) => {
        allTouchedFields.add(`${ei}-${si}-reps`);
        allTouchedFields.add(`${ei}-${si}-weight`);
      });
    });
    setTouchedFields(allTouchedFields);
    
    const errors: Array<{ exerciseIndex: number; setIndex: number; message: string }> = [];
    exercises.forEach((exercise, ei) => {
      exercise.sets.forEach((s, si) => {
        const reps = typeof s.reps === 'number' ? s.reps : parseInt(String(s.reps));
        if (!reps || reps <= 0) {
          errors.push({ exerciseIndex: ei, setIndex: si, message: 'Reps requeridas (> 0)' });
        }
        // Solo validar peso si no es un ejercicio de peso corporal
        // Los ejercicios de peso corporal pueden tener peso 0
        const weight = typeof s.weight === 'number' ? s.weight : parseFloat(String(s.weight || 0));
        const isBodyweightExercise = exercise.equipment?.toLowerCase().includes('peso corporal') || 
                                     exercise.equipment?.toLowerCase().includes('bodyweight') ||
                                     exercise.name?.toLowerCase().includes('plancha') ||
                                     exercise.name?.toLowerCase().includes('flexion') ||
                                     exercise.name?.toLowerCase().includes('dominada') ||
                                     exercise.name?.toLowerCase().includes('abdominal');
        
        if (!isBodyweightExercise && (!weight || weight <= 0)) {
          errors.push({ exerciseIndex: ei, setIndex: si, message: 'Peso requerido (> 0)' });
        }
      });
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      try {
        const first = errors[0];
        const selector = `input[name=weight-${first.exerciseIndex}-${first.setIndex}]`;
        const el = typeof window !== 'undefined' ? document.querySelector(selector) as HTMLElement | null : null;
        el?.focus();
      } catch (e) {}
      return;
    }

    setValidationErrors([]);
    setIsSubmitting(true);

    const exercisesWithIds: Exercise[] = exercises.map((exercise, index) => ({
      ...exercise,
      id: routineId 
        ? getRoutineById(routineId)?.exercises[index]?.id || `ex-${routineId}-${index}`
        : `ex-new-${index}-${crypto.randomUUID()}`,
    }));

    // Debug: Verificar que los campos de descanso se están guardando
    console.log('[RoutineForm] Guardando ejercicios:', exercisesWithIds.map(ex => ({
      name: ex.name,
      restBetweenSets: ex.restBetweenSets,
      useSmartRest: ex.useSmartRest
    })));

    try {
      if (routineId) {
        await updateRoutine(routineId, {
          name,
          description,
          image,
          exercises: exercisesWithIds,
          restBetweenSets,
          restBetweenExercises,
        });
      } else {
        await addRoutine({
          name,
          description,
          image,
          exercises: exercisesWithIds,
          restBetweenSets,
          restBetweenExercises,
        });
      }
      success(routineId ? t('updateSuccess') : t('createSuccess'));
      clearDraft(); // Limpiar borrador al guardar exitosamente
      onClose();
    } catch (err) {
      console.error('Error saving routine:', err);
      
      // Mostrar mensaje de error específico
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      if (errorMessage.includes('conexión') || errorMessage.includes('internet') || errorMessage.includes('Verifica')) {
        // Error de conexión - Mostrar mensaje con opción de reintentar
        error(
          `❌ ${errorMessage}\n\n💾 Se guardó un borrador local. Puedes intentar de nuevo cuando tengas conexión.`,
          10000 // 10 segundos
        );
        
        // El borrador ya se guardó en storage.ts, solo informar al usuario
        console.log('[RoutineForm] Borrador guardado automáticamente por el sistema de storage');
      } else if (errorMessage.includes('Base de datos requerida')) {
        // Base de datos no habilitada
        error(
          '❌ La base de datos no está habilitada. Contacta al administrador del sistema.',
          8000
        );
      } else {
        // Otro tipo de error
        error(
          `❌ ${errorMessage}\n\nIntenta de nuevo o contacta soporte si el problema persiste.`,
          8000
        );
      }
      
      // No cerrar el formulario para que el usuario pueda reintentar
      // onClose(); // Comentado intencionalmente
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage('');
  };

  const t = useTranslations('routineForm');
  const tc = useTranslations('common');

  const routineMuscleGroups: MuscleGroup[] = exercises
    .map(ex => {
      const template = getExerciseByName(ex.name);
      return template?.muscleGroup;
    })
    .filter((mg): mg is MuscleGroup => mg !== undefined);

  const canProceedToExercises = name.trim().length > 0;
  
  // Validación mejorada para el paso de ejercicios
  const validateExercises = () => {
    const errors: Array<{ exerciseIndex: number; setIndex: number; message: string }> = [];
    const exercisesWithErrors = new Set<number>();
    
    exercises.forEach((exercise, ei) => {
      // Validar que el ejercicio tenga nombre
      if (!exercise.name || exercise.name.trim().length === 0) {
        errors.push({ exerciseIndex: ei, setIndex: -1, message: 'Nombre del ejercicio requerido' });
        exercisesWithErrors.add(ei);
      }
      
      exercise.sets.forEach((s, si) => {
        const reps = typeof s.reps === 'number' ? s.reps : parseInt(String(s.reps));
        if (!reps || reps <= 0) {
          errors.push({ exerciseIndex: ei, setIndex: si, message: 'Reps requeridas (> 0)' });
          exercisesWithErrors.add(ei);
        }
        
        // Solo validar peso si no es un ejercicio de peso corporal
        const weight = typeof s.weight === 'number' ? s.weight : parseFloat(String(s.weight || 0));
        const isBodyweightExercise = exercise.equipment?.toLowerCase().includes('peso corporal') || 
                                     exercise.equipment?.toLowerCase().includes('bodyweight') ||
                                     exercise.equipment?.toLowerCase().includes('calistenia') ||
                                     exercise.name?.toLowerCase().includes('plancha') ||
                                     exercise.name?.toLowerCase().includes('flexion') ||
                                     exercise.name?.toLowerCase().includes('dominada') ||
                                     exercise.name?.toLowerCase().includes('abdominal') ||
                                     exercise.name?.toLowerCase().includes('pull up') ||
                                     exercise.name?.toLowerCase().includes('push up');
        
        if (!isBodyweightExercise && (!weight || weight <= 0)) {
          errors.push({ exerciseIndex: ei, setIndex: si, message: 'Peso requerido (> 0)' });
          exercisesWithErrors.add(ei);
        }
      });
    });
    
    return { errors, exercisesWithErrors };
  };
  
  const canProceedToReview = exercises.length > 0 && 
                             exercises.every(ex => ex.name.trim().length > 0) &&
                             validateExercises().errors.length === 0;

  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Progress Steps */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          {([
            { key: 'basic', label: 'Información', icon: '📝' },
            { key: 'exercises', label: 'Ejercicios', icon: '💪' },
            { key: 'review', label: 'Revisar', icon: '✓' }
          ] as Array<{ key: 'basic' | 'exercises' | 'review'; label: string; icon: string }>).map((step, index) => (
            <React.Fragment key={step.key}>
              <button
                type="button"
                onClick={() => {
                  if (step.key === 'basic' || (step.key === 'exercises' && canProceedToExercises) || (step.key === 'review' && canProceedToReview)) {
                    setCurrentStep(step.key);
                  }
                }}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 p-3 sm:p-4 rounded-xl transition-all ${
                  currentStep === step.key
                    ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                    : step.key === 'exercises' && !canProceedToExercises
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : step.key === 'review' && !canProceedToReview
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer'
                }`}
                disabled={
                  (step.key === 'exercises' && !canProceedToExercises) ||
                  (step.key === 'review' && !canProceedToReview)
                }
              >
                <span className="text-2xl sm:text-xl">{step.icon}</span>
                <div className="text-center sm:text-left">
                  <div className="text-xs sm:text-sm font-semibold">{step.label}</div>
                  <div className="text-[10px] sm:text-xs opacity-75">Paso {index + 1}</div>
                </div>
              </button>
              {index < 2 && (
                <div className={`hidden sm:block w-8 h-0.5 mx-2 ${
                  (index === 0 && (currentStep === 'exercises' || currentStep === 'review')) ||
                  (index === 1 && currentStep === 'review')
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        {/* Step 1: Basic Information */}
        {currentStep === 'basic' && (
          <div className="flex-1 space-y-6 animate-fadeIn">
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                📝 Información Básica
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dale un nombre y descripción a tu rutina
              </p>
            </div>

            <Input
              label={t('routineName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('routineNamePlaceholder')}
              required
              className="text-base sm:text-lg font-semibold"
            />

            <TextArea
              label={t('description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={4}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('imageLabel')} <span className="text-gray-500 text-xs">(Opcional)</span>
              </label>
              {image ? (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={image} 
                    alt={t('imagePreviewAlt')}
                    className="w-full h-56 sm:h-64 object-cover rounded-xl shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 bg-red-600 text-white p-2.5 rounded-full hover:bg-red-700 transition-all shadow-lg opacity-0 group-hover:opacity-100 active:scale-95"
                  >
                    <span className="text-lg">✕</span>
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 sm:p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label 
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <span className="text-5xl sm:text-6xl mb-3">📷</span>
                    <span className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">{t('imageUploadClick')}</span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">{t('imageFormats')}</span>
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RestTimeSelector
                label={t('restBetweenSets')}
                value={restBetweenSets}
                onChange={(v) => setRestBetweenSets(v)}
                includeZero={false}
              />
              <RestTimeSelector
                label={t('restBetweenExercises')}
                value={restBetweenExercises}
                onChange={(v) => setRestBetweenExercises(v)}
                includeZero={false}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelWithConfirm}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setCurrentStep('exercises')}
                disabled={!canProceedToExercises}
                className="px-8"
              >
                Siguiente: Ejercicios →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Exercises */}
        {currentStep === 'exercises' && (
          <div className="flex-1 space-y-6 animate-fadeIn">
            <div className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 sm:p-6 rounded-xl border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                💪 Ejercicios de la Rutina
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Agrega los ejercicios que formarán parte de tu rutina
              </p>
            </div>

            {/* Estadísticas de la rutina */}
            {exercises.length > 0 && (
              <div className="bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⏱️</span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Duración Estimada
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tiempo estimado</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {routineStats.estimatedDurationFormatted}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rango</div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {routineStats.durationRange.minFormatted} - {routineStats.durationRange.maxFormatted}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ejercicios</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {routineStats.totalExercises}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Series totales</div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {routineStats.totalSets}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  💡 Estimación basada en ~30s por serie + descansos configurados
                </p>
              </div>
            )}

            {exercises.length > 0 && (
              <WarmupRecommendation
                routineMuscleGroups={routineMuscleGroups}
                onAddWarmups={(warmups: WarmupExercise[]) => {
                  const warmupExercises: Omit<Exercise, 'id'>[] = warmups.map(w => ({
                    name: `🔥 ${w.name}`,
                    sets: Array(w.defaultSets || 2).fill(null).map(() => ({
                      reps: w.defaultReps || 10,
                      weight: 0,
                      type: 'warmup' as import('@/types').SetType // Calentamiento por defecto
                    })),
                    equipment: w.equipment,
                    notes: w.duration ? `Duración: ${w.duration}` : ''
                  }));
                  setExercises([...warmupExercises, ...exercises]);
                }}
              />
            )}

            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('exercisesTitle')} ({exercises.length})
                </h3>
                <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                  <Button 
                    type="button" 
                    variant="primary" 
                    size="sm" 
                    onClick={handleAddExercise}
                    className="flex-1 sm:flex-none"
                  >
                    ➕ {t('fromLibrary')}
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleAddCustomExercise}
                    className="flex-1 sm:flex-none"
                  >
                    ✏️ {t('manual')}
                  </Button>
                </div>
              </div>

              {exercises.length === 0 && (
                <div className="text-center py-12 sm:py-16 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="text-6xl sm:text-7xl mb-4">🏋️</div>
                  <p className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('noExercises')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Comienza agregando ejercicios desde la biblioteca
                  </p>
                  <Button type="button" variant="primary" onClick={handleAddExercise}>
                    {t('addFirstExercise')}
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {exercises.map((exercise, exerciseIndex) => {
                  const isExpanded = expandedExercises.has(exerciseIndex);
                  
                  return (
                  <div
                    key={exerciseIndex}
                    data-exercise-index={exerciseIndex}
                    draggable
                    onDragStart={(e) => {
                      setDraggedExerciseIndex(exerciseIndex);
                      e.dataTransfer.effectAllowed = 'move';
                      e.currentTarget.classList.add('opacity-50');
                    }}
                    onDragEnd={(e) => {
                      setDraggedExerciseIndex(null);
                      setDragOverIndex(null);
                      e.currentTarget.classList.remove('opacity-50');
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setDragOverIndex(exerciseIndex);
                    }}
                    onDragLeave={() => {
                      setDragOverIndex(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedExerciseIndex !== null && draggedExerciseIndex !== exerciseIndex) {
                        handleMoveExercise(draggedExerciseIndex, exerciseIndex);
                      }
                      setDraggedExerciseIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 transition-all overflow-hidden ${
                      dragOverIndex === exerciseIndex && draggedExerciseIndex !== exerciseIndex
                        ? 'border-blue-500 dark:border-blue-400 scale-105 shadow-xl'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {/* Header colapsable - siempre visible */}
                    <div 
                      className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        validationErrors.some(err => err.exerciseIndex === exerciseIndex) 
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500' 
                          : ''
                      }`}
                      onClick={() => toggleExerciseExpanded(exerciseIndex)}
                    >
                      {/* Drag handle */}
                      <div 
                        className="shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                        </svg>
                      </div>

                      {/* Número */}
                      <div className="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {exerciseIndex + 1}
                      </div>

                      {/* Nombre del ejercicio */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                            {exercise.name || `Ejercicio ${exerciseIndex + 1}`}
                          </div>
                          {validationErrors.some(err => err.exerciseIndex === exerciseIndex) && (
                            <span className="shrink-0 px-2 py-0.5 text-xs font-semibold bg-amber-500 text-white rounded-full animate-pulse">
                              ⚠️ Completar
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {exercise.sets.length} {exercise.sets.length === 1 ? 'serie' : 'series'}
                          {exercise.equipment && ` • ${exercise.equipment}`}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (exercises.length === 1) {
                              // Si es el último ejercicio, mostrar confirmación (confirm devuelve Promise<boolean>)
                              (async () => {
                                try {
                                  const confirmed = await confirm({
                                    title: 'Eliminar ejercicio',
                                    message: '¿Estás seguro de eliminar el último ejercicio? La rutina quedará vacía.',
                                    confirmText: 'Eliminar',
                                    cancelText: 'Cancelar',
                                    variant: 'warning'
                                  });
                                  if (confirmed) handleRemoveExercise(exerciseIndex);
                                } catch (e) { /* ignore */ }
                              })();
                            } else {
                              handleRemoveExercise(exerciseIndex);
                            }
                          }}
                          className="shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-95"
                          title="Eliminar ejercicio"
                        >
                          <span className="text-lg">🗑️</span>
                        </button>
                        
                        {/* Icono de expandir/colapsar */}
                        <div className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Contenido expandible */}
                    {isExpanded && (
                      <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <Input
                            placeholder={t('exerciseName')}
                            value={exercise.name}
                            onChange={(e) => handleExerciseChange(exerciseIndex, 'name', e.target.value)}
                            required
                            className={`font-medium ${
                              validationErrors.some(err => err.exerciseIndex === exerciseIndex && err.setIndex === -1)
                                ? 'border-red-500 dark:border-red-500'
                                : ''
                            }`}
                          />
                          {validationErrors.some(err => err.exerciseIndex === exerciseIndex && err.setIndex === -1) && (
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                              ⚠️ El nombre del ejercicio es requerido
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('equipmentLabel')}
                          </label>
                          <EquipmentDropdown
                            value={exercise.equipment || ''}
                            onChange={(value) => handleExerciseChange(exerciseIndex, 'equipment', value)}
                            placeholder={t('equipmentPlaceholder')}
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('sets')} ({exercise.sets.length})
                            </label>
                            <Button 
                              type="button" 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleAddSet(exerciseIndex)}
                              className="text-xs"
                            >
                              ➕ {t('addSet')}
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            {exercise.sets.map((set, setIndex) => (
                              <div key={setIndex} className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                {/* Header compacto en una línea */}
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                      {setIndex + 1}
                                    </span>
                                  </div>
                                  
                                  {/* Selector de tipo compacto */}
                                  <div className="flex-1 min-w-0">
                                    <SetTypeSelector
                                      value={set.type || 'normal'}
                                      onChange={(type) => handleSetChange(exerciseIndex, setIndex, 'type', type)}
                                      compact
                                    />
                                  </div>
                                  
                                  {/* Botones de acción */}
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleCopySet(exerciseIndex, setIndex)}
                                      className="p-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-all active:scale-95"
                                      title={t('copySetTitle')}
                                    >
                                      📋
                                    </button>
                                    {exercise.sets.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                                        className="p-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-all active:scale-95"
                                        title={t('removeSetTitle')}
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Inputs de reps y peso en una línea */}
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">Reps</label>
                                    <button
                                      type="button"
                                      onClick={() => setEditingValue({
                                        exerciseIndex,
                                        setIndex,
                                        field: 'reps',
                                        currentValue: set.reps || 0
                                      })}
                                      className={`w-full text-center font-semibold h-8 text-sm rounded-md border-2 transition-colors ${
                                        set.reps && set.reps > 0
                                          ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                                          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600'
                                      } ${
                                        touchedFields.has(`${exerciseIndex}-${setIndex}-reps`) &&
                                        validationErrors.some(err => err.exerciseIndex === exerciseIndex && err.setIndex === setIndex && err.message.includes('Reps'))
                                          ? 'border-red-500 dark:border-red-500'
                                          : ''
                                      }`}
                                    >
                                      {set.reps || '-'}
                                    </button>
                                    {touchedFields.has(`${exerciseIndex}-${setIndex}-reps`) &&
                                     validationErrors.some(err => err.exerciseIndex === exerciseIndex && err.setIndex === setIndex && err.message.includes('Reps')) && (
                                      <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                                        Reps requeridas
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">Peso (kg)</label>
                                    <button
                                      type="button"
                                      onClick={() => setEditingValue({
                                        exerciseIndex,
                                        setIndex,
                                        field: 'weight',
                                        currentValue: set.weight || 0
                                      })}
                                      className={`w-full text-center font-semibold h-8 text-sm rounded-md border-2 transition-colors ${
                                        set.weight && set.weight > 0
                                          ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                                          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600'
                                      } ${
                                        touchedFields.has(`${exerciseIndex}-${setIndex}-weight`) &&
                                        validationErrors.some(err => err.exerciseIndex === exerciseIndex && err.setIndex === setIndex && err.message.includes('Peso'))
                                          ? 'border-red-500 dark:border-red-500'
                                          : ''
                                      }`}
                                    >
                                      {set.weight ? `${set.weight} kg` : '-'}
                                    </button>
                                    {touchedFields.has(`${exerciseIndex}-${setIndex}-weight`) &&
                                     validationErrors.some(err => err.exerciseIndex === exerciseIndex && err.setIndex === setIndex && err.message.includes('Peso')) && (
                                      <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                                        Peso requerido
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Input
                          placeholder={t('notes')}
                          value={exercise.notes || ''}
                          onChange={(e) => handleExerciseChange(exerciseIndex, 'notes', e.target.value)}
                        />

                        <div className="flex items-center gap-3 p-3 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <span className="text-xl">⏱️</span>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Descanso entre series:
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const willEnableSmartRest = !exercise.useSmartRest;
                                  
                                  // Si se activa el descanso inteligente, calcular y aplicar el tiempo recomendado
                                  if (willEnableSmartRest) {
                                    const exerciseTemplate = getExerciseByName(exercise.name);
                                    if (exerciseTemplate) {
                                      // Calcular promedio de reps de todas las series
                                      const avgReps = Math.round(
                                        exercise.sets.reduce((sum, set) => sum + (set.reps || 10), 0) / exercise.sets.length
                                      );
                                      
                                      // Importar la función de cálculo
                                      import('@/lib/restCalculator').then(({ calculateRestBetweenSets }) => {
                                        const restRecommendation = calculateRestBetweenSets(
                                          exerciseTemplate,
                                          exercise.sets.length,
                                          avgReps,
                                          'intermediate'
                                        );
                                        
                                        // Redondear a intervalos de 5 segundos
                                        const recommendedTime = Math.round(restRecommendation.recommended / 5) * 5;
                                        
                                        // Aplicar el tiempo calculado - usar el estado actual
                                        setExercises(currentExercises => {
                                          const updatedExercises = [...currentExercises];
                                          updatedExercises[exerciseIndex].restBetweenSets = recommendedTime;
                                          updatedExercises[exerciseIndex].useSmartRest = true;
                                          return updatedExercises;
                                        });
                                        
                                        // Mostrar notificación con el tiempo calculado
                                        const minutes = Math.floor(recommendedTime / 60);
                                        const seconds = recommendedTime % 60;
                                        const timeStr = seconds > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${minutes}:00`;
                                        success(`Descanso inteligente aplicado: ${timeStr} (${restRecommendation.description})`, 3000);
                                      });
                                    }
                                  } else {
                                    // Si se desactiva, limpiar el tiempo específico
                                    setExercises(currentExercises => {
                                      const updatedExercises = [...currentExercises];
                                      updatedExercises[exerciseIndex].restBetweenSets = undefined;
                                      updatedExercises[exerciseIndex].useSmartRest = false;
                                      return updatedExercises;
                                    });
                                  }
                                }}
                                className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                                  exercise.useSmartRest
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                                title="Usar descanso inteligente basado en características del ejercicio"
                              >
                                🧠 Inteligente
                              </button>
                            </div>
                            {!exercise.useSmartRest && (
                              <RestTimeSelectorCompact
                                value={exercise.restBetweenSets}
                                onChange={(v) => {
                                  const newExercises = [...exercises];
                                  newExercises[exerciseIndex].restBetweenSets = v;
                                  setExercises(newExercises);
                                }}
                                placeholder={`${Math.floor(restBetweenSets / 60)}:${(restBetweenSets % 60).toString().padStart(2, '0')} (global)`}
                                className="flex-1"
                              />
                            )}
                            {exercise.useSmartRest && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-purple-600 dark:text-purple-400 italic">
                                  Descanso inteligente
                                </span>
                                {exercise.restBetweenSets && (
                                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-semibold">
                                    {Math.floor(exercise.restBetweenSets / 60)}:{(exercise.restBetweenSets % 60).toString().padStart(2, '0')}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep('basic')}
                className="order-2 sm:order-1"
              >
                ← Volver
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  const validation = validateExercises();
                  if (validation.errors.length > 0) {
                    // Expandir ejercicios con errores
                    setExpandedExercises(validation.exercisesWithErrors);
                    
                    // Marcar todos los campos como tocados
                    const allTouchedFields = new Set<string>();
                    exercises.forEach((exercise, ei) => {
                      exercise.sets.forEach((s, si) => {
                        allTouchedFields.add(`${ei}-${si}-reps`);
                        allTouchedFields.add(`${ei}-${si}-weight`);
                      });
                    });
                    setTouchedFields(allTouchedFields);
                    setValidationErrors(validation.errors);
                    
                    // Mostrar toast con resumen de errores
                    const errorCount = validation.errors.length;
                    const exerciseCount = validation.exercisesWithErrors.size;
                    error(`⚠️ Completa los datos faltantes: ${errorCount} ${errorCount === 1 ? 'campo' : 'campos'} en ${exerciseCount} ${exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}. Los campos están marcados en rojo.`);
                    
                    // Scroll al primer ejercicio con error
                    setTimeout(() => {
                      const firstErrorExercise = Math.min(...Array.from(validation.exercisesWithErrors));
                      const element = document.querySelector(`[data-exercise-index="${firstErrorExercise}"]`);
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  } else {
                    setCurrentStep('review');
                  }
                }}
                className="order-1 sm:order-2 px-8"
              >
                Siguiente: Revisar →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 'review' && (
          <div className="flex-1 space-y-6 animate-fadeIn">
            <div className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 sm:p-6 rounded-xl border border-green-200 dark:border-green-800">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                ✓ Revisar Rutina
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verifica que todo esté correcto antes de guardar
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
              {image && (
                <div className="relative h-48 sm:h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={image} 
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{name}</h2>
                    {description && (
                      <p className="text-sm text-white/90 line-clamp-2">{description}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="p-4 sm:p-6 space-y-4">
                {!image && (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{name}</h2>
                    {description && (
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{description}</p>
                    )}
                  </>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 sm:p-4 rounded-xl text-center border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{exercises.length}</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Ejercicios</div>
                  </div>
                  <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 sm:p-4 rounded-xl text-center border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Series</div>
                  </div>
                  <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 sm:p-4 rounded-xl text-center border border-green-200 dark:border-green-800">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                      {Math.floor(restBetweenSets / 60)}:{(restBetweenSets % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Descanso/Serie</div>
                  </div>
                  <div className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 sm:p-4 rounded-xl text-center border border-amber-200 dark:border-amber-800">
                    <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {Math.floor(restBetweenExercises / 60)}:{(restBetweenExercises % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Descanso/Ej.</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Lista de Ejercicios
                  </h3>
                  {exercises.map((exercise, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {exercise.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {exercise.sets.length} series • {exercise.equipment || 'Sin equipamiento'}
                        </div>
                        {exercise.notes && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                            {exercise.notes}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('exercises')}
                        className="shrink-0 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-all text-xs"
                      >
                        ✏️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep('exercises')}
                className="order-2 sm:order-1"
              >
                ← Volver
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={exercises.length === 0 || isSubmitting}
                className="order-1 sm:order-2 px-8"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {t('saving')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>✓</span>
                    {routineId ? t('updateRoutineBtn') : t('createRoutineBtn')}
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>

      <Modal
        isOpen={isExerciseSelectorOpen}
        onClose={() => setIsExerciseSelectorOpen(false)}
        title={t('selectExercisesTitle')}
      >
        <ExerciseSelector
          onSelectExercises={handleSelectExercises}
          onClose={() => setIsExerciseSelectorOpen(false)}
        />
      </Modal>

      {/* Modal de edición de valores con teclado numérico */}
      {editingValue && (
        <EditValueModal
          isOpen={true}
          onClose={() => setEditingValue(null)}
          title={`${exercises[editingValue.exerciseIndex]?.name || 'Ejercicio'} - Serie ${editingValue.setIndex + 1}`}
          field={editingValue.field}
          currentValue={editingValue.currentValue}
          onSave={(value) => {
            handleSetChange(editingValue.exerciseIndex, editingValue.setIndex, editingValue.field, value);
            setEditingValue(null);
          }}
          historicalWeights={
            editingValue.field === 'weight'
              ? exercises[editingValue.exerciseIndex]?.sets
                  .map(s => s.weight)
                  .filter((w): w is number => typeof w === 'number' && w > 0)
                  .filter((w, i, arr) => arr.indexOf(w) === i)
                  .sort((a, b) => b - a) || []
              : []
          }
        />
      )}
    </div>
  );
};

