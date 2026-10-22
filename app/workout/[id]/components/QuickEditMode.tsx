"use client";

import { useState, useMemo, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { useTranslations } from "@/context/LocaleContext";
import { Card, CardContent } from "@/components/ui/Card";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { PlateCalculator } from "@/components/features/workout/PlateCalculator";
import { Timer, ArrowRight, Plus, Check } from "@/components/icons/lucide";
import { Spinner } from "@/components/ui/Spinner";
import SetTypeCycleButton from "@/components/features/workout/SetTypeCycleButton";
import { FloatingRestTimer } from "./FloatingRestTimer";
import { SwipeButton } from "@/components/ui/SwipeButton";
import { AddExerciseButton } from "./AddExerciseButton";
import { useConfirm } from "@/context/NotificationContext";
import { useToast } from "@/context/NotificationContext";
import { compareWithRecord } from "@/lib/domain/exercises/personalRecords";
import { PRCelebration } from "@/components/features/workout";
import type { ExerciseTemplate } from "@/data/exercises";
import type { SetType, Routine, WorkoutSession } from "@/types";
import type { SessionExercise } from "../types/workout.types";

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
    /** Flags explícitos de completado por serie: se activan al marcar una serie. */
    completedSetFlags?: { [exerciseId: string]: boolean[] };
  };
  onEditReps: (exerciseId: string, setIndex: number, reps: number) => void;
  onEditWeight: (exerciseId: string, setIndex: number, weight: number) => void;
  onEditSetType: (exerciseId: string, setIndex: number, type: SetType) => void;
  onToggleSetComplete: (
    exerciseId: string,
    setIndex: number,
    isComplete: boolean,
  ) => void;
  togglingKeys?: { [key: string]: boolean };
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
  // Auto-advance: control para avanzar foco automáticamente a la siguiente serie
  onAutoAdvanceChange?: (value: boolean) => void;
  autoAdvance?: boolean;
  onShowExerciseInfo?: (exerciseName: string) => void; // ✅ NUEVO: Callback para mostrar info del ejercicio
  sessions?: WorkoutSession[]; // ✅ NUEVO: Sesiones anteriores para comparar progreso
  onAddExercises?: (exercises: ExerciseTemplate[], insertIndex?: number) => void; // Callback para agregar ejercicios durante el entrenamiento
  /** Cuando es true, no renderiza el sticky header interno (el padre lo muestra en su bloque sticky) */
  hideHeader?: boolean;
  /** Info de la serie actualmente en ejecución (para mostrar TUT en modo Quick) */
  activeSet?: { exerciseId: string; setIndex: number; startTime: number } | null;
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
  onAutoAdvanceChange,
  autoAdvance: autoAdvanceProp,
  onShowExerciseInfo,
  sessions = [],
  onAddExercises,
  togglingKeys = {},
  hideHeader = false,
  activeSet = null,
}: QuickEditModeProps) {
  const t = useTranslations("workout");
  const [editingCell, setEditingCell] = useState<{
    exerciseId: string;
    setIndex: number;
    field: "reps" | "weight";
    exerciseName: string;
  } | null>(null);
  const [editingRestTime, setEditingRestTime] = useState<{
    exerciseId: string;
    exerciseName: string;
    currentRestTime: number;
  } | null>(null);
  const [copySetTarget, setCopySetTarget] = useState<{
    exerciseId: string;
    setIndex: number;
    exerciseName: string;
    reps: number;
    weight: number;
    previousReps: number;
    previousWeight: number;
  } | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [tempRestTime, setTempRestTime] = useState<string>("");
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(
    new Set(),
  );
  const [manuallyExpandedExercises, setManuallyExpandedExercises] = useState<
    Set<string>
  >(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  // ✅ Usar estado controlado si se proporciona, sino usar estado local
  const [skipRestTimersLocal, setSkipRestTimersLocal] = useState(false);
  const skipRestTimers =
    skipRestTimersProp !== undefined ? skipRestTimersProp : skipRestTimersLocal;
  const setSkipRestTimers = (value: boolean) => {
    if (onSkipRestTimersChange) {
      onSkipRestTimersChange(value);
    } else {
      setSkipRestTimersLocal(value);
    }
  };
  // Auto-advance control (por defecto true)
  const [autoAdvanceLocal, setAutoAdvanceLocal] = useState(true);
  
  // Estado para la celebración de PR
  const [prInfo, setPrInfo] = useState<{ show: boolean; title: string; subtitle: string }>({ show: false, title: '', subtitle: '' });

  // ── TUT (Tiempo Bajo Tensión) para la serie activa en modo Quick ──────────
  const [tutElapsed, setTutElapsed] = useState(0);
  useEffect(() => {
    if (!activeSet?.startTime) { 
      setTimeout(() => setTutElapsed(0), 0); 
      return; 
    }
    const tick = () => setTutElapsed(Math.floor((Date.now() - activeSet.startTime) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeSet?.startTime]);

  const formatTUT = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const autoAdvance =
    autoAdvanceProp !== undefined ? autoAdvanceProp : autoAdvanceLocal;
  const setAutoAdvance = (value: boolean) => {
    if (onAutoAdvanceChange) {
      onAutoAdvanceChange(value);
    } else {
      setAutoAdvanceLocal(value);
    }
  };
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  // ✅ Estado para el temporizador flotante
  const [showFloatingTimer, setShowFloatingTimer] = useState(false);
  const [floatingTimerDuration, setFloatingTimerDuration] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSavingCellRef = useRef(false);
  const restInputRef = useRef<HTMLInputElement>(null);
  const exerciseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const setInputRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Estado para resaltar campos faltantes cuando el usuario intenta completar una serie
  const [fieldValidation, setFieldValidation] = useState<
    Record<string, { reps?: boolean; weight?: boolean }>
  >({});
  const [showQuickEditGuide, setShowQuickEditGuide] = useState(false);
  const [showPlateCalculator, setShowPlateCalculator] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setShowQuickEditGuide(
          localStorage.getItem("gymlogix_quick_edit_guide_seen") !== "true",
        );
      } catch (error) {
        console.error("No se pudo leer el estado de la guía de edición rápida", error);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const dismissQuickEditGuide = () => {
    try {
      localStorage.setItem("gymlogix_quick_edit_guide_seen", "true");
      setShowQuickEditGuide(false);
    } catch (error) {
      console.error("No se pudo guardar el estado de la guía de edición rápida", error);
      setShowQuickEditGuide(false);
    }
  };

  const copyValuesToFollowingSets = async (
    exerciseId: string,
    setIndex: number,
    reps: number,
    weight: number,
  ) => {
    const accepted = await confirm({
      title: t("copyValuesTitle"),
      message: t("copyValuesConfirm"),
      confirmText: t("copyToFollowingSets"),
    });
    if (!accepted) return;

    const exercise = routine.exercises.find((item) => item.id === exerciseId);
    if (!exercise) return;

    const targets = exercise.sets
      .map((_, index) => index)
      .filter((index) => {
        if (index <= setIndex || workoutData.completedSetFlags?.[exerciseId]?.[index]) {
          return false;
        }
        return index >= (workoutData.completedSets?.[exerciseId] ?? 0);
      });
    if (!targets.length) return;

    const previousValues = targets.map((index) => ({
      index,
      reps: workoutData.actualReps[exerciseId]?.[index] ?? 0,
      weight: workoutData.actualWeights[exerciseId]?.[index] ?? 0,
    }));
    targets.forEach((index) => {
      onEditReps(exerciseId, index, reps);
      onEditWeight(exerciseId, index, weight);
    });
    showToast(t("valuesCopied"), "success", 6000, {
      label: t("undo"),
      onClick: () => {
        previousValues.forEach(({ index, reps: oldReps, weight: oldWeight }) => {
          onEditReps(exerciseId, index, oldReps);
          onEditWeight(exerciseId, index, oldWeight);
        });
      },
    });
  };

  const copyPreviousSetValues = () => {
    if (!copySetTarget) return;
    const { exerciseId, setIndex, previousReps, previousWeight } = copySetTarget;
    const oldReps = workoutData.actualReps[exerciseId]?.[setIndex] ?? 0;
    const oldWeight = workoutData.actualWeights[exerciseId]?.[setIndex] ?? 0;
    onEditReps(exerciseId, setIndex, previousReps);
    onEditWeight(exerciseId, setIndex, previousWeight);
    showToast(`${previousReps} ${t("repsShort")} × ${previousWeight} kg`, "success", 6000, {
      label: t("undo"),
      onClick: () => {
        onEditReps(exerciseId, setIndex, oldReps);
        onEditWeight(exerciseId, setIndex, oldWeight);
      },
    });
    setCopySetTarget(null);
  };

  const triggerFieldValidation = (
    exerciseId: string,
    setIdx: number,
    fields: { reps?: boolean; weight?: boolean },
  ) => {
    const key = `${exerciseId}-${setIdx}`;
    setFieldValidation((prev) => ({ ...prev, [key]: fields }));
    setTimeout(() => {
      setFieldValidation((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }, 2500);
  };

  // Focus and select the active cell value when entering inline edit mode.
  useEffect(() => {
    if (editingCell && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [editingCell]);

  // Tipos de serie y metadatos para selector grande
  const SET_TYPES: SetType[] = [
    'normal',
    'warmup',
    'dropset',
    'failure',
    'amrap',
    'rest-pause',
    'cluster',
  ];

  const SET_TYPE_INFO: Record<SetType, { icon: string; label: string; description: string; color: string }> = {
    normal: {
      icon: '💪',
      label: 'Normal',
      description: 'Serie estándar de trabajo',
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
    },
    warmup: {
      icon: '🔥',
      label: 'Calentamiento',
      description: 'Serie de calentamiento con peso ligero',
      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700',
    },
    dropset: {
      icon: '⬇️',
      label: 'Drop Set',
      description: 'Reducir peso y continuar sin descanso',
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700',
    },
    failure: {
      icon: '🔴',
      label: 'Al Fallo',
      description: 'Serie hasta el fallo muscular',
      color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700',
    },
    amrap: {
      icon: '♾️',
      label: 'AMRAP',
      description: 'Máximas repeticiones posibles',
      color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700',
    },
    'rest-pause': {
      icon: '⏸️',
      label: 'Rest-Pause',
      description: 'Pausas cortas dentro de la serie',
      color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700',
    },
    cluster: {
      icon: '🔗',
      label: 'Cluster',
      description: 'Mini-series con descansos breves',
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
    },
  };

  // Estado para selector grande de tipo de serie
  const [showSetTypeSelector, setShowSetTypeSelector] = useState(false);
  const [setTypeTarget, setSetTypeTarget] = useState<{
    exerciseId: string;
    setIndex: number;
    exerciseName?: string;
    currentType: SetType;
  } | null>(null);

  // Estado para opciones del ejercicio (•••)
  const [exerciseOptionsTarget, setExerciseOptionsTarget] = useState<{
    exerciseId: string;
    exIdx: number;
    exerciseName: string;
    isSkipped: boolean;
  } | null>(null);

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
      const completedCount = workoutData.completedSets?.[exerciseId] || 0;
      return completedCount < exercise.sets.length;
    });

    if (firstIncompleteExercise) {
      const exerciseElement = exerciseRefs.current[firstIncompleteExercise.id];
      if (exerciseElement) {
        // Scroll suave al ejercicio con un pequeño offset para el header
        setTimeout(() => {
          const headerOffset = 180; // Altura del header sticky
          const elementPosition = exerciseElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }, 300);
      }
    }
  }, [routine.exercises, workoutData.actualReps, workoutData.skippedExercises]);

  // Función para iniciar edición con el valor actual
  const startEditing = (
    exerciseId: string,
    setIndex: number,
    field: "reps" | "weight",
    currentValue: number,
    exerciseName: string,
  ) => {
    // Prevenir edición si el ejercicio está omitido
    const skippedExercises = workoutData.skippedExercises || [];
    if (skippedExercises.includes(exerciseId)) {
      try {
        showToast?.('Ejercicio omitido. Restaura para editar.', 'info', 2000);
      } catch {}
      return;
    }

    isSavingCellRef.current = false;
    setEditingCell({ exerciseId, setIndex, field, exerciseName });
    setTempValue(currentValue === 0 ? "" : String(currentValue));
  };

  // Función para encontrar la siguiente serie incompleta
  const findNextIncompleteSet = (
    currentExerciseId: string,
    currentSetIndex: number,
  ): {
    exerciseId: string;
    setIndex: number;
    field: "reps" | "weight";
  } | null => {
    const skippedExercises = workoutData.skippedExercises || [];

    // Buscar en el ejercicio actual primero (si no está omitido)
    const currentExercise = routine.exercises.find(
      (ex) => ex.id === currentExerciseId,
    );
    if (currentExercise && !skippedExercises.includes(currentExerciseId)) {
      const completedCount = workoutData.completedSets[currentExerciseId] || 0;

      // Buscar la siguiente serie incompleta en el mismo ejercicio
      for (let i = currentSetIndex + 1; i < currentExercise.sets.length; i++) {
        if (i >= completedCount) {
          // Determinar si necesita editar reps o peso
          const actualReps = workoutData.actualReps[currentExerciseId]?.[i];
          const actualWeight =
            workoutData.actualWeights[currentExerciseId]?.[i];

          // Si no tiene reps, enfocar en reps; si tiene reps pero no peso, enfocar en peso
          if (actualReps === undefined || actualReps === 0) {
            return {
              exerciseId: currentExerciseId,
              setIndex: i,
              field: "reps",
            };
          } else if (actualWeight === undefined || actualWeight === 0) {
            return {
              exerciseId: currentExerciseId,
              setIndex: i,
              field: "weight",
            };
          }
        }
      }
    }

    // Si no hay más series en el ejercicio actual, buscar en los siguientes ejercicios (no omitidos)
    const currentExerciseIndex = routine.exercises.findIndex(
      (ex) => ex.id === currentExerciseId,
    );
    for (
      let exIdx = currentExerciseIndex + 1;
      exIdx < routine.exercises.length;
      exIdx++
    ) {
      const exercise = routine.exercises[exIdx];

      // Saltar ejercicios omitidos
      if (skippedExercises.includes(exercise.id)) continue;

      const completedCount = workoutData.completedSets[exercise.id] || 0;

      for (let setIdx = 0; setIdx < exercise.sets.length; setIdx++) {
        if (setIdx >= completedCount) {
          const actualReps = workoutData.actualReps[exercise.id]?.[setIdx];
          const actualWeight = workoutData.actualWeights[exercise.id]?.[setIdx];

          if (actualReps === undefined || actualReps === 0) {
            return { exerciseId: exercise.id, setIndex: setIdx, field: "reps" };
          } else if (actualWeight === undefined || actualWeight === 0) {
            return {
              exerciseId: exercise.id,
              setIndex: setIdx,
              field: "weight",
            };
          }
        }
      }
    }

    return null;
  };

  // Función para mover el foco a la siguiente serie
  const focusNextIncompleteSet = (
    currentExerciseId: string,
    currentSetIndex: number,
  ) => {
    const nextSet = findNextIncompleteSet(currentExerciseId, currentSetIndex);

    if (nextSet) {
      // Expandir el ejercicio si está colapsado
      setCollapsedExercises((prev) => {
        const newSet = new Set(prev);
        newSet.delete(nextSet.exerciseId);
        return newSet;
      });

      // Marcar como manualmente expandido
      setManuallyExpandedExercises((prev) => {
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
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
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
    if (!editingCell || isSavingCellRef.current) return;

    const value =
      tempValue.trim() === ""
        ? 0
        : editingCell.field === "reps"
          ? parseInt(tempValue, 10)
          : parseFloat(tempValue.replace(",", "."));

    if (
      tempValue.trim() !== "" &&
      Number.isFinite(value) &&
      value >= 0 &&
      (editingCell.field !== "reps" || Number.isInteger(value))
    ) {
      const previousValue =
        editingCell.field === "reps"
          ? workoutData.actualReps[editingCell.exerciseId]?.[editingCell.setIndex] ?? 0
          : workoutData.actualWeights[editingCell.exerciseId]?.[editingCell.setIndex] ?? 0;
      if (editingCell.field === "reps") {
        onEditReps(editingCell.exerciseId, editingCell.setIndex, value);
      } else {
        onEditWeight(editingCell.exerciseId, editingCell.setIndex, value);
      }
      if (previousValue !== value) {
        showToast(t("valueUpdated"), "success", 5000, {
          label: t("undo"),
          onClick: () => {
            if (editingCell.field === "reps") {
              onEditReps(editingCell.exerciseId, editingCell.setIndex, previousValue);
            } else {
              onEditWeight(editingCell.exerciseId, editingCell.setIndex, previousValue);
            }
          },
        });
      }
    }

    isSavingCellRef.current = true;
    setEditingCell(null);
    setTempValue("");
  };

  // Escape discards the draft; blur and Enter commit it.
  const cancelEdit = () => {
    isSavingCellRef.current = true;
    setEditingCell(null);
    setTempValue("");
  };

  const handleCellKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
      return;
    }
    if (event.key !== "Enter" || !editingCell) return;

    event.preventDefault();
    const currentCell = editingCell;
    const value =
      currentCell.field === "reps"
        ? parseInt(tempValue, 10)
        : parseFloat(tempValue.replace(",", "."));
    if (
      tempValue.trim() === "" ||
      !Number.isFinite(value) ||
      value < 0 ||
      (currentCell.field === "reps" && !Number.isInteger(value))
    ) {
      return;
    }
    saveEdit();
    window.setTimeout(() => {
      if (currentCell.field === "reps") {
        const exercise = routine.exercises.find(
          (item) => item.id === currentCell.exerciseId,
        );
        if (!exercise) return;
        const nextWeight =
          workoutData.actualWeights[currentCell.exerciseId]?.[currentCell.setIndex] ??
          exercise.sets[currentCell.setIndex]?.weight ??
          0;
        startEditing(
          currentCell.exerciseId,
          currentCell.setIndex,
          "weight",
          nextWeight,
          exercise.name,
        );
      } else if (autoAdvance) {
        focusNextIncompleteSet(currentCell.exerciseId, currentCell.setIndex);
      }
    }, 0);
  };

  // Función para toggle collapse de un ejercicio
  const toggleCollapse = (exerciseId: string) => {
    setCollapsedExercises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
        // Marcar como manualmente expandido para evitar auto-collapse
        setManuallyExpandedExercises((prevExpanded) => {
          const newExpanded = new Set(prevExpanded);
          newExpanded.add(exerciseId);
          return newExpanded;
        });
      } else {
        newSet.add(exerciseId);
        // Remover de manualmente expandido si se colapsa
        setManuallyExpandedExercises((prevExpanded) => {
          const newExpanded = new Set(prevExpanded);
          newExpanded.delete(exerciseId);
          return newExpanded;
        });
      }
      return newSet;
    });
  };

  // Función para abrir modal de edición de descanso
  const startEditingRestTime = (
    exerciseId: string,
    exerciseName: string,
    currentRestTime: number,
  ) => {
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
    setTempRestTime("");
  };

  // Función para cancelar edición de descanso (descarta cambios)
  const cancelRestEdit = () => {
    setEditingRestTime(null);
    setTempRestTime("");
  };

  // Calcular progreso total - memoizado para evitar recalcular en cada render
  const { totalSets, completedSets, progressPercent } = useMemo(() => {
    const skippedExercises = workoutData.skippedExercises || [];

    // Filtrar ejercicios omitidos
    const activeExercises = routine.exercises.filter(
      (ex) => !skippedExercises.includes(ex.id),
    );

    const total = activeExercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    // Solo contar series completadas de ejercicios activos (no omitidos)
    const completed = activeExercises.reduce((sum, ex) => {
      // Preferir el contador explícito si existe
      const explicit = workoutData.completedSets?.[ex.id];
      if (typeof explicit === 'number') return sum + Math.min(explicit, ex.sets.length);
      const exerciseReps = workoutData.actualReps[ex.id] || [];
      const completedInExercise = exerciseReps
        .slice(0, ex.sets.length)
        .filter((r) => r > 0).length;
      return sum + completedInExercise;
    }, 0);

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    // Limitar a máximo 100%
    const cappedPercent = Math.min(percent, 100);

    return {
      totalSets: total,
      completedSets: completed,
      progressPercent: cappedPercent,
    };
  }, [routine.exercises, workoutData.actualReps, workoutData.skippedExercises, workoutData.completedSets]);

  // ID del ejercicio «anclado» al tope — el último en el que el usuario marcó una serie
  const [pinnedExerciseId, setPinnedExerciseId] = useState<string | null>(null);

  // Lista de ejercicios para mostrar: el anclado primero, luego el resto en orden original
  const displayExercises = useMemo(() => {
    const withIndex = routine.exercises.map((exercise, originalIdx) => ({
      exercise,
      originalIdx,
    }));
    if (!pinnedExerciseId) return withIndex;
    const pinned = withIndex.find(
      ({ exercise }) => exercise.id === pinnedExerciseId,
    );
    if (!pinned) return withIndex;
    return [
      pinned,
      ...withIndex.filter(({ exercise }) => exercise.id !== pinnedExerciseId),
    ];
  }, [routine.exercises, pinnedExerciseId]);

  // Auto-collapse: mover la lógica de auto-collapse fuera del render a un efecto
  // para evitar llamar a setState durante la fase de renderizado.
  useEffect(() => {
    if (!routine || !routine.exercises) return;

    const timer = setTimeout(() => {
      setCollapsedExercises((prev) => {
        const updated = new Set(prev);
        let changed = false;

        for (const ex of routine.exercises) {
          const exerciseId = ex.id;
          const completedCount = workoutData.completedSets?.[exerciseId] || 0;
          const isFullyCompleted = completedCount === ex.sets.length;

          if (
            isFullyCompleted &&
            !updated.has(exerciseId) &&
            !manuallyExpandedExercises.has(exerciseId)
          ) {
            updated.add(exerciseId);
            changed = true;
          }
        }

        return changed ? updated : prev;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [routine.exercises, workoutData.completedSets, manuallyExpandedExercises]);

  // Elapsed timer local para encabezado compacto (desde el montaje)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const startTs = Date.now();
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTs) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const formatElapsed = (s: number) => {
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${String(ss).padStart(2, "0")}`;
  };

  // Ejercicio actual: preferir el anclado, si no existe usar el primer incompleto
  const currentExerciseId = useMemo(() => {
    if (pinnedExerciseId) return pinnedExerciseId;
    const skipped = workoutData.skippedExercises || [];
    const found = routine.exercises.find((ex) => {
      if (skipped.includes(ex.id)) return false;
      const completed = workoutData.completedSets?.[ex.id] || 0;
      return completed < ex.sets.length;
    });
    return found?.id ?? routine.exercises[0]?.id ?? null;
  }, [pinnedExerciseId, routine.exercises, workoutData.completedSets, workoutData.skippedExercises]);

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

      {showQuickEditGuide && (
        <section
          aria-label={t("quickEditGuideTitle")}
          className="rounded-2xl border border-emerald-300/70 bg-emerald-50/90 p-3 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30 sm:p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                {t("quickEditGuideTitle")}
              </p>
              <ol className="mt-2 grid gap-1.5 text-xs leading-relaxed text-emerald-900 dark:text-emerald-200 sm:grid-cols-3 sm:gap-3">
                <li><span className="font-bold">1.</span> {t("quickEditGuideStep1")}</li>
                <li><span className="font-bold">2.</span> {t("quickEditGuideStep2")}</li>
                <li><span className="font-bold">3.</span> {t("quickEditGuideStep3")}</li>
              </ol>
            </div>
            <button
              type="button"
              onClick={dismissQuickEditGuide}
              className="min-h-10 shrink-0 rounded-lg px-3 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
            >
              {t("quickEditGuideDismiss")}
            </button>
          </div>
        </section>
      )}

      {/* Header compacto - sticky (omitido cuando hideHeader=true, el padre lo gestiona) */}
      {!hideHeader && (
      <div className="sticky top-16 z-30 rounded-b-2xl border border-gray-200 bg-white/95 px-3 py-3 text-gray-900 shadow-md backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/95 dark:text-gray-100">
        <div className="flex items-center gap-2.5">

          {/* Título + tiempo */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-sm font-bold tracking-tight">{t("quickEditMode")}</span>
            <span className="rounded-full bg-gray-100 px-2 py-1 font-mono text-xs tabular-nums text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {formatElapsed(elapsedSeconds)}
            </span>
          </div>

          {/* Progreso */}
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1.5 dark:bg-gray-800"
            role="progressbar"
            aria-label={t("workoutProgress")}
            aria-valuemin={0}
            aria-valuemax={Math.max(totalSets, 1)}
            aria-valuenow={Math.min(completedSets, totalSets)}
            aria-valuetext={`${completedSets} ${t("of")} ${totalSets} ${t("sets")}`}
          >
            <span className="text-sm font-bold leading-none tabular-nums">{progressPercent}%</span>
            <span className="text-[10px] leading-none tabular-nums text-gray-500 dark:text-gray-400">{completedSets}/{totalSets}</span>
          </div>

          <div className="h-6 w-px shrink-0 bg-gray-200 dark:bg-gray-700" />

          {/* Controles */}
          <div className="flex shrink-0 items-center gap-1.5">

            {/* Pill: Omitir descansos */}
            <button
              onClick={() => {
                const newVal = !skipRestTimers;
                setSkipRestTimers(newVal);
                try {
                  showToast(
                    newVal ? t("skipRestEnabled") : t("skipRestDisabled"),
                    "info",
                    2200,
                  );
                } catch {}
              }}
              title={t("skipRestDescription")}
              aria-label={skipRestTimers ? t("skipRestEnabled") : t("skipRestDisabled")}
              aria-pressed={skipRestTimers}
              className={`flex min-h-10 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 ${
                skipRestTimers
                  ? "bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-900"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <Timer className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">{skipRestTimers ? t("enabled") : t("disabled")}</span>
            </button>

            {/* Pill: Avance automático */}
            <button
              onClick={() => {
                const newVal = !autoAdvance;
                setAutoAdvance(newVal);
                try {
                  showToast(
                    newVal ? t("autoAdvanceEnabled") : t("autoAdvanceDisabled"),
                    "info",
                    2200,
                  );
                } catch {}
              }}
              title={t("autoAdvanceDescription")}
              aria-label={autoAdvance ? t("autoAdvanceEnabled") : t("autoAdvanceDisabled")}
              aria-pressed={autoAdvance}
              className={`flex min-h-10 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 ${
                autoAdvance
                  ? "bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-900"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <ArrowRight className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">{autoAdvance ? t("enabled") : t("disabled")}</span>
            </button>

            {/* Agregar serie */}
            {onAddSet && currentExerciseId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSet(currentExerciseId);
                }}
                className="hidden h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus-visible:ring-emerald-300 sm:flex"
                title={t("addSet")}
                aria-label={t("addSet")}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Finalizar entrenamiento */}
            {onFinishWorkout && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFinishWorkout();
                }}
                disabled={completedSets === 0}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-300 ${
                  completedSets > 0
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                }`}
                title={t("finishWorkout")}
                aria-label={t("finishWorkout")}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-500 dark:bg-emerald-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* Serie en curso */}
        {activeSet && (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900 dark:bg-blue-950/50">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600 dark:bg-blue-300" />
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-blue-800 dark:text-blue-200">
                {t("setInProgress")}
              </span>
              {(() => {
                const ex = routine.exercises.find((e) => e.id === activeSet.exerciseId);
                return ex ? (
                  <span className="truncate text-[10px] text-blue-700 dark:text-blue-300">
                    {ex.name} · #{activeSet.setIndex + 1}
                  </span>
                ) : null;
              })()}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase tracking-wide text-blue-700 dark:text-blue-300">{t("timeUnderTension")}</span>
              <span className="text-base font-black leading-none tabular-nums text-blue-950 dark:text-white">
                {formatTUT(tutElapsed)}
              </span>
            </div>
          </div>
        )}
      </div>
      )}

      {displayExercises.map(({ exercise, originalIdx: exIdx }) => {
        const exerciseId = exercise.id;
        const actualReps = workoutData.actualReps[exerciseId] || [];
        const actualWeights = workoutData.actualWeights[exerciseId] || [];
        const setTypes = workoutData.setTypes[exerciseId] || [];
        const isSkipped =
          workoutData.skippedExercises?.includes(exerciseId) || false;

        // Obtener el contador REAL de series completadas desde workoutData
        const completedCount = workoutData.completedSets[exerciseId] || 0;
        const isFullyCompleted = completedCount === exercise.sets.length;
        const isCollapsed = collapsedExercises.has(exerciseId);
        const isManuallyExpanded = manuallyExpandedExercises.has(exerciseId);

        // Determinar si es el ejercicio actual
        const firstIncompleteIndex = routine.exercises.findIndex((ex) => {
          const exId = ex.id;
          const isExSkipped =
            workoutData.skippedExercises?.includes(exId) || false;
          if (isExSkipped) return false;
          const count = workoutData.completedSets[exId] || 0;
          return count < ex.sets.length;
        });
        // El ejercicio anclado siempre es «actual»; si no hay anclado, usar el primero incompleto
        const isCurrent = pinnedExerciseId
          ? exerciseId === pinnedExerciseId
          : exIdx === firstIncompleteIndex;
        const isNext = exIdx === firstIncompleteIndex + 1;

        // Auto-collapse handled by useEffect (moved out of render)

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
              if (
                onMoveExercise &&
                draggedIndex !== null &&
                draggedIndex !== exIdx
              ) {
                onMoveExercise(draggedIndex, exIdx);
              }
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            className={`transition-all ${
              dragOverIndex === exIdx && draggedIndex !== exIdx
                ? "scale-105 ring-2 ring-blue-500"
                : draggedIndex === exIdx
                  ? "opacity-50"
                  : ""
            }`}
          >
            <Card
              className={`overflow-hidden ${
                isSkipped
                  ? "opacity-40 ring-2 ring-yellow-400 dark:ring-yellow-600"
                  : isCurrent
                    ? "ring-2 ring-blue-500 shadow-lg"
                    : isNext
                      ? "ring-2 ring-gray-300 shadow-sm dark:ring-gray-700"
                      : isFullyCompleted
                        ? "ring-2 ring-emerald-700 dark:ring-emerald-300"
                        : ""
              }`}
            >
              {/* Header del ejercicio mejorado con más información */}
              <div
                className={`border-b border-gray-200 dark:border-gray-700 shadow rounded ${
                  isCurrent
                    ? "bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30"
                    : isNext
                      ? "bg-gray-100 dark:bg-gray-800"
                      : isFullyCompleted
                        ? "bg-linear-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
                        : "bg-linear-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900"
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleCollapse(exerciseId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleCollapse(exerciseId);
                    }
                  }}
                  aria-expanded={!isCollapsed}
                  aria-label={`${exercise.name}: ${isCollapsed ? t("showSets") : t("hideSets")}`}
                  className="w-full cursor-pointer rounded-t-xl p-3 text-left transition-colors hover:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 active:bg-black/[0.04] dark:hover:bg-white/[0.03] dark:focus-visible:ring-blue-300"
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    {/* Drag Handle (indicador visual de que se puede arrastrar toda la tarjeta) */}
                    {onMoveExercise && (
                      <div 
                        className="shrink-0 text-gray-300 dark:text-gray-600 mt-4 cursor-grab active:cursor-grabbing hover:text-gray-400 dark:hover:text-gray-500 transition-colors"
                        title="Arrastra para reordenar"
                      >
                        <svg width="14" height="20" viewBox="0 0 16 16" fill="currentColor">
                          <circle cx="4" cy="4" r="1.5" />
                          <circle cx="4" cy="8" r="1.5" />
                          <circle cx="4" cy="12" r="1.5" />
                          <circle cx="12" cy="4" r="1.5" />
                          <circle cx="12" cy="8" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      {/* Número de ejercicio más grande y colorido */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-md shrink-0 ${
                          isCurrent
                            ? "bg-blue-500 text-white"
                            : isFullyCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-400 dark:bg-gray-600 text-white"
                        }`}
                      >
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
                            <span className="px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-bold rounded-full shadow-sm shrink-0">
                              {t("exerciseSkipped").toUpperCase()}
                            </span>
                          )}
                          {/* Badge de estado más prominente */}
                          {!isSkipped && isCurrent && (
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm shrink-0">
                              {t("currentExercise").toUpperCase()}
                            </span>
                          )}
                          {!isSkipped && isNext && !isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-200 text-[10px] font-bold text-gray-700 shrink-0 dark:bg-gray-700 dark:text-gray-200">
                              {t("nextExercise").toUpperCase()}
                            </span>
                          )}
                          {!isSkipped && isFullyCompleted && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-[10px] font-bold text-white shadow-sm shrink-0 dark:bg-emerald-300 dark:text-gray-950">
                              ✓ {t("exerciseCompleted")}
                            </span>
                          )}
                          {!isSkipped &&
                            !isFullyCompleted &&
                            !isCurrent &&
                            !isNext && (
                              <span className="px-2 py-0.5 rounded-full bg-gray-200 text-[10px] font-bold text-gray-800 shrink-0 dark:bg-gray-700 dark:text-gray-200">
                                {t("exercisePending")}
                              </span>
                            )}
                        </div>

                        {/* Información del ejercicio */}
                        <div className="space-y-1">
                          {/* Progreso y equipo */}
                          <div className="flex items-center gap-3 flex-wrap text-xs">
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                />
                              </svg>
                              <span className="font-medium">
                                {completedCount}/{exercise.sets.length} {t("sets")}
                              </span>
                            </div>

                            {exercise.equipment && (
                              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                  />
                                </svg>
                                <span className="capitalize">
                                  {exercise.equipment}
                                </span>
                              </div>
                            )}

                            {/* Botón de información del ejercicio */}
                            {onShowExerciseInfo && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onShowExerciseInfo(exercise.name);
                                }}
                                className="flex min-h-10 items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus-visible:ring-blue-300"
                                title={t("exerciseInfo")}
                                aria-label={`${t("exerciseInfo")}: ${exercise.name}`}
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="text-[10px] font-semibold">
                                  {t("infoShort")}
                                </span>
                              </button>
                            )}

                            {/* Opciones Rápidas minimalistas movidas al menú de opciones (•••) */}
                          </div>

                          {/* Notas del ejercicio si existen */}
                          {exercise.notes && (
                            <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <svg
                                className="w-3.5 h-3.5 mt-0.5 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="line-clamp-1 italic">
                                {exercise.notes}
                              </span>
                            </div>
                          )}

                          {/* Icono de collapse */}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <svg
                              className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            <span className="font-medium">
                              {isCollapsed ? t("showSets") : t("hideSets")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Indicador de progreso circular mejorado */}
                    <div
                      className="flex shrink-0 flex-col items-center gap-1"
                      role="progressbar"
                      aria-label={`${exercise.name}: ${completedCount} ${t("of")} ${exercise.sets.length} ${t("sets")}`}
                      aria-valuemin={0}
                      aria-valuemax={Math.max(exercise.sets.length, 1)}
                      aria-valuenow={Math.min(completedCount, exercise.sets.length)}
                    >
                      <div className="relative w-14 h-14">
                        <svg aria-hidden="true" className="w-14 h-14 transform -rotate-90">
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
                            strokeDashoffset={`${2 * Math.PI * 24 * (1 - completedCount / Math.max(exercise.sets.length, 1))}`}
                            className={`transition-all duration-500 ${
                              isFullyCompleted
                                ? "text-green-500"
                                : isCurrent && completedCount > 0
                                  ? "text-blue-500"
                                  : "text-gray-300 dark:text-gray-600"
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isFullyCompleted ? (
                            <svg
                              className="w-7 h-7 text-green-600 dark:text-green-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <div className="text-center">
                              <div className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-none">
                                {completedCount}
                              </div>
                              <div className="text-[9px] text-gray-500 dark:text-gray-400 leading-none mt-0.5">
                                {t("of")} {exercise.sets.length}
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
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {onEditRestTime ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const override =
                            workoutData.restOverrides?.[exerciseId];
                          const restTime =
                            override ??
                            exercise.restBetweenSets ??
                            routine.restBetweenSets ??
                            90;
                          startEditingRestTime(
                            exerciseId,
                            exercise.name,
                            restTime,
                          );
                        }}
                        className="min-h-10 rounded-md text-left font-medium transition-colors hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:hover:text-white dark:focus-visible:ring-blue-300"
                        aria-label={`${t("editRestTime")} ${exercise.name}`}
                      >
                        {t("rest")}:{" "}
                        {(() => {
                          const override =
                            workoutData.restOverrides?.[exerciseId];
                          const restTime =
                            override ??
                            exercise.restBetweenSets ??
                            routine.restBetweenSets ??
                            90;
                          if (restTime >= 60) {
                            const minutes = Math.floor(restTime / 60);
                            const seconds = restTime % 60;
                            return seconds > 0
                              ? `${minutes}m ${seconds}s`
                              : `${minutes}m`;
                          }
                          return `${restTime}s`;
                        })()}
                      </button>
                    ) : (
                      <span className="font-medium">
                        {t("rest")}:{" "}
                        {(() => {
                          const override =
                            workoutData.restOverrides?.[exerciseId];
                          const restTime =
                            override ??
                            exercise.restBetweenSets ??
                            routine.restBetweenSets ??
                            90;
                          if (restTime >= 60) {
                            const minutes = Math.floor(restTime / 60);
                            const seconds = restTime % 60;
                            return seconds > 0
                              ? `${minutes}m ${seconds}s`
                              : `${minutes}m`;
                          }
                          return `${restTime}s`;
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
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
                        className={`flex min-h-10 items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-300 ${
                          isSkipped
                            ? "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        }`}
                        title={
                          isSkipped ? t("restoreExercise") : t("skipExercise")
                        }
                        aria-label={
                          isSkipped ? t("restoreExercise") : t("skipExercise")
                        }
                      >
                        {isSkipped ? (
                          <>
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            {t("restoreExercise")}
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                              />
                            </svg>
                            {t("skipExercise")}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {!isCollapsed && (
                <CardContent className="p-0">
                  {/* Filas de series — diseño de tarjeta, no tabla */}
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {/* Cabecera compacta alineada con filas */}
                    <div className="px-2 py-1.5 bg-gray-50 dark:bg-gray-900/50">
                      <div className="grid grid-cols-[24px_minmax(56px,1fr)_minmax(62px,1fr)_28px_38px_48px] md:grid-cols-[32px_2fr_2fr_32px_48px_56px] gap-1 items-center h-11">
                        <div className="flex justify-center">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-gray-600 dark:text-gray-300">
                            N°
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="mx-auto text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">{t("repsShort")}</div>
                        </div>

                        <div className="flex items-center">
                          <div className="mx-auto text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">{t("weightShort")}</div>
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="hidden text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:block">{t("setType")}</div>
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 sm:hidden">{t("setTypeShort")}</div>
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">✓</div>
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">✓</div>
                        </div>
                      </div>
                    </div>

                    {exercise.sets.map((set, setIdx) => {
                      const doneReps = actualReps[setIdx];
                      const doneWeight = actualWeights[setIdx];
                      const setType = setTypes[setIdx] || "normal";

                      const completedCount =
                        workoutData.completedSets?.[exerciseId] || 0;
                      // Usar flag explícito de completado si está disponible;
                      // solo activado al pulsar el botón naranja (no por edición de reps).
                      const isCompleted = workoutData.completedSetFlags
                        ? Boolean(workoutData.completedSetFlags[exerciseId]?.[setIdx])
                        : typeof doneReps === 'number' && doneReps > 0;
                      const togglingKey = `${exerciseId}:${setIdx}`;
                      const isToggling = Boolean(togglingKeys?.[togglingKey]);

                      // Mostrar valor explícito si > 0; si no, usar el valor de la rutina como referencia
                      const displayReps =
                        doneReps !== undefined && doneReps > 0
                          ? doneReps
                          : set.reps;
                      const displayWeight =
                        doneWeight !== undefined && doneWeight > 0
                          ? doneWeight
                          : set.weight || 0;

                      const validationKey = `${exerciseId}-${setIdx}`;
                      const validation = fieldValidation[validationKey] || {};

                      const canCopyPrevious = setIdx > 0;
                      const previousReps = canCopyPrevious
                        ? actualReps[setIdx - 1] ||
                          exercise.sets[setIdx - 1]?.reps
                        : null;
                      const previousWeight = canCopyPrevious
                        ? actualWeights[setIdx - 1] ||
                          exercise.sets[setIdx - 1]?.weight
                        : null;

                      const lastSession =
                        sessions.length > 0
                          ? sessions
                              .filter((s) =>
                                s.exercises.some(
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  (e: any) => e.exerciseName === exercise.name,
                                ),
                              )
                              .sort(
                                (a, b) =>
                                  new Date(b.date).getTime() -
                                  new Date(a.date).getTime(),
                              )[0]
                          : null;

                      const lastExerciseData = lastSession?.exercises.find(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (e: any) => e.exerciseName === exercise.name,
                      );
                      const lastReps = lastExerciseData?.actualReps?.[setIdx];
                      const lastWeight =
                        lastExerciseData?.actualWeight?.[setIdx];

                      const repsDiff =
                        displayReps && lastReps ? displayReps - lastReps : null;
                      const weightDiff =
                        displayWeight && lastWeight
                          ? displayWeight - lastWeight
                          : null;
                      const hasRepsProgress =
                        repsDiff !== null && repsDiff !== 0;
                      // Mostrar el delta de peso SIN decimales: redondear a entero.
                      // Si al redondear queda en 0, ocultamos la etiqueta para evitar mostrar +0 o -0.
                      const weightDiffRounded =
                        weightDiff !== null ? Math.round(weightDiff) : null;
                      const hasWeightProgress =
                        weightDiffRounded !== null && weightDiffRounded !== 0;
                      const weightDiffLabel =
                        weightDiffRounded !== null
                          ? weightDiffRounded > 0
                            ? `+${weightDiffRounded}`
                            : `${weightDiffRounded}`
                          : null;

                      // Serie lista para marcar: tiene valores pero aún no completada
                      const isReadyToComplete =
                        displayReps > 0 && displayWeight > 0 && !isCompleted;

                      const isActiveSet =
                        activeSet?.exerciseId === exerciseId &&
                        activeSet?.setIndex === setIdx;
                      const hasEditedSetType =
                        setTypes[setIdx] !== undefined &&
                        setTypes[setIdx] !== (set.type || "normal");
                      const hasEditedValues =
                        (typeof doneReps === "number" && doneReps > 0) ||
                        (typeof doneWeight === "number" && doneWeight > 0) ||
                        hasEditedSetType;

                      return (
                        <div key={`${exerciseId}-${setIdx}`}>
                          <div
                            data-completion-state={
                              isCompleted
                                ? "completed"
                                : isActiveSet
                                  ? "active"
                                  : hasEditedValues
                                    ? "edited"
                                    : "pending"
                            }
                            className={`flex items-center gap-1 border-l-4 px-2 py-1.5 transition-colors ${
                              isSkipped ? 'pointer-events-none opacity-60' : ''
                            } ${
                              isCompleted
                                ? "border-emerald-700 bg-emerald-50 dark:border-emerald-300 dark:bg-emerald-950/40"
                                : isActiveSet
                                  ? "border-blue-600 bg-blue-50 dark:border-blue-300 dark:bg-blue-950/40"
                                  : hasEditedValues
                                    ? "border-teal-700 bg-teal-50 dark:border-teal-300 dark:bg-teal-950/40"
                                    : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40"
                            }`}
                          >
                          {/* Datos  */}
                          <div className="grid grid-cols-[24px_minmax(56px,1fr)_minmax(62px,1fr)_28px_38px_48px] md:grid-cols-[32px_2fr_2fr_32px_48px_56px] gap-1 items-center flex-1">
                            {/* Número */}
                            <div className="flex justify-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                  isCompleted
                                    ? "bg-emerald-700 text-white dark:bg-emerald-300 dark:text-gray-950"
                                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                                }`}
                              >
                                {setIdx + 1}
                              </div>
                            </div>

                            {/* Reps */}
                            <div className="relative w-full">
                              {editingCell?.exerciseId === exerciseId &&
                              editingCell.setIndex === setIdx &&
                              editingCell.field === "reps" ? (
                                <input
                                  ref={inputRef}
                                  type="text"
                                  inputMode="numeric"
                                  value={tempValue}
                                  onChange={(event) => {
                                    if (/^\d*$/.test(event.target.value)) {
                                      setTempValue(event.target.value);
                                    }
                                  }}
                                  onBlur={saveEdit}
                                  onKeyDown={handleCellKeyDown}
                                  aria-label={`${exercise.name}, ${t("set")} ${setIdx + 1}, ${t("repsPerformed")}`}
                                  aria-invalid={validation.reps ? "true" : "false"}
                                  className="h-11 w-full rounded-xl border-2 border-blue-500 bg-white text-center text-lg font-black tabular-nums text-gray-900 shadow-sm outline-none ring-2 ring-blue-500/20 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                />
                              ) : (
                                <button
                                  ref={(el) => {
                                    setInputRefs.current[
                                      `${exerciseId}-${setIdx}-reps`
                                    ] = el;
                                  }}
                                  onClick={() =>
                                    !isSkipped &&
                                    startEditing(
                                      exerciseId,
                                      setIdx,
                                      "reps",
                                      displayReps,
                                      exercise.name,
                                    )
                                  }
                                  disabled={isSkipped}
                                  aria-label={`${exercise.name}, ${t("set")} ${setIdx + 1}, ${t("repsPerformed")}`}
                                  aria-invalid={validation.reps ? "true" : "false"}
                                  className={`w-full h-11 rounded-xl border-2 font-black text-lg tabular-nums shadow-sm transition-all active:scale-[0.98] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-300 ${
                                    isCompleted
                                        ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                                        : isActiveSet
                                          ? "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                                          : typeof doneReps === "number" && doneReps > 0
                                            ? "text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700"
                                            : displayReps === 0
                                              ? "text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 border-dashed border-gray-300 dark:border-gray-700"
                                            : "text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                  }`}
                                >
                                  {displayReps === 0 ? "—" : displayReps}
                                  {validation.reps && (
                                    <span className="absolute -inset-px rounded-xl ring-2 ring-red-500 dark:ring-red-700 animate-pulse pointer-events-none" />
                                  )}
                                </button>
                              )}
                              {hasRepsProgress && displayReps > 0 && (
                                <div
                                  className="absolute -top-1 -right-1 rounded-full bg-gray-200 px-1 py-0.5 text-[8px] font-bold text-gray-800 shadow dark:bg-gray-700 dark:text-gray-100"
                                >
                                  {repsDiff! > 0 ? "+" : ""}
                                  {repsDiff}
                                </div>
                              )}
                            </div>

                            {/* Peso */}
                            <div className="relative">
                              {editingCell?.exerciseId === exerciseId &&
                              editingCell.setIndex === setIdx &&
                              editingCell.field === "weight" ? (
                                <div className="space-y-1">
                                  <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="decimal"
                                    value={tempValue}
                                    onChange={(event) => {
                                      if (/^\d*([.,]\d*)?$/.test(event.target.value)) {
                                        setTempValue(event.target.value);
                                      }
                                    }}
                                    onBlur={saveEdit}
                                    onKeyDown={handleCellKeyDown}
                                    aria-label={`${exercise.name}, ${t("set")} ${setIdx + 1}, ${t("weightUsed")}`}
                                    aria-invalid={validation.weight ? "true" : "false"}
                                    className="h-11 w-full rounded-xl border-2 border-blue-500 bg-white text-center text-sm font-black tabular-nums text-gray-900 shadow-sm outline-none ring-2 ring-blue-500/20 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                  />
                                  {/(barra|barbell)/i.test(exercise.equipment ?? "") && (
                                    <button
                                      type="button"
                                      onMouseDown={(event) => event.preventDefault()}
                                      onClick={() => setShowPlateCalculator(true)}
                                      className="w-full rounded-lg py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/40"
                                    >
                                      {t("openPlateCalculator")}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <button
                                  ref={(el) => {
                                    setInputRefs.current[
                                      `${exerciseId}-${setIdx}-weight`
                                    ] = el;
                                  }}
                                  onClick={() =>
                                    !isSkipped &&
                                    startEditing(
                                      exerciseId,
                                      setIdx,
                                      "weight",
                                      displayWeight,
                                      exercise.name,
                                    )
                                  }
                                  disabled={isSkipped}
                                  aria-label={`${exercise.name}, ${t("set")} ${setIdx + 1}, ${t("weightUsed")}`}
                                  aria-invalid={validation.weight ? "true" : "false"}
                                  className={`flex h-11 w-full flex-col items-center justify-center rounded-xl border-2 text-sm font-black leading-none tabular-nums shadow-sm transition-all active:scale-[0.98] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-300 ${
                                    isCompleted
                                        ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                                        : isActiveSet
                                          ? "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                                          : typeof doneWeight === "number" && doneWeight > 0
                                            ? "text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700"
                                            : displayWeight === 0
                                              ? "text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 border-dashed border-gray-300 dark:border-gray-700"
                                            : "text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                  }`}
                                >
                                  {displayWeight === 0 ? (
                                    <span className="text-lg">—</span>
                                  ) : (
                                    <>
                                      <span className="text-base font-black">
                                        {displayWeight}
                                      </span>
                                      <span className="text-[9px] font-normal opacity-60">
                                        kg
                                      </span>
                                    </>
                                  )}
                                  {validation.weight && (
                                    <span className="absolute -inset-px rounded-xl ring-2 ring-red-500 dark:ring-red-700 animate-pulse pointer-events-none" />
                                  )}
                                </button>
                              )}
                              {hasWeightProgress && displayWeight > 0 && (
                                <div
                                  className="absolute -top-1 -right-1 rounded-full bg-gray-200 px-1 py-0.5 text-[8px] font-bold text-gray-800 shadow dark:bg-gray-700 dark:text-gray-100"
                                >
                                  {weightDiffLabel}
                                </div>
                              )}
                            </div>

                            {/* Tipo - abrir selector grande */}
                            <div className="flex justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isSkipped) return;
                                  setSetTypeTarget({
                                    exerciseId,
                                    setIndex: setIdx,
                                    exerciseName: exercise.name,
                                    currentType: setType as SetType,
                                  });
                                  setShowSetTypeSelector(true);
                                }}
                                disabled={isSkipped}
                                aria-label={`${exercise.name}, ${t("set")} ${setIdx + 1}, ${SET_TYPE_INFO[setType as SetType]?.label || setType}`}
                                className={`flex h-11 w-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-300 ${
                                  isCompleted
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                                    : isActiveSet
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                                      : hasEditedSetType
                                        ? "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                }`}
                                title={`Tipo: ${SET_TYPE_INFO[setType as SetType]?.label || setType}`}
                              >
                                <span className="text-base">{SET_TYPE_INFO[setType as SetType]?.icon ?? '•'}</span>
                              </button>
                            </div>

                            <div className="flex justify-center">
                              <button
                                type="button"
                                disabled={isSkipped}
                                onClick={() => setCopySetTarget({
                                  exerciseId,
                                  setIndex: setIdx,
                                  exerciseName: exercise.name,
                                  reps: displayReps,
                                  weight: displayWeight,
                                  previousReps: Number(previousReps ?? 0),
                                  previousWeight: Number(previousWeight ?? 0),
                                })}
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-base font-bold text-gray-500 transition-colors hover:bg-blue-100 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-blue-900/40 dark:hover:text-blue-200"
                                aria-label={`${t("copyValuesTitle")}: ${exercise.name}, ${t("set")} ${setIdx + 1}`}
                                title={t("copyValuesTitle")}
                              >
                                ⧉
                              </button>
                            </div>

                            {/* Completar */}
                            <div className="flex justify-center">
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    if (isToggling) return;
                                    // Si falta reps/peso, mostrar validación y abrir editor del campo faltante
                                    if (!isCompleted && !isReadyToComplete) {
                                      const missingReps = !(displayReps > 0);
                                      const missingWeight = !(
                                        displayWeight > 0
                                      );
                                      if (missingReps || missingWeight) {
                                        const parts: string[] = [];
                                        if (missingReps) parts.push("reps");
                                        if (missingWeight) parts.push("peso");
                                        showToast(
                                          `Falta ${parts.join(" y ")} en la serie ${setIdx + 1}`,
                                          "warning",
                                          3000,
                                        );
                                        triggerFieldValidation(
                                          exerciseId,
                                          setIdx,
                                          {
                                            reps: missingReps,
                                            weight: missingWeight,
                                          },
                                        );
                                        // Abrir editor en el primer campo faltante
                                        if (missingWeight) {
                                          startEditing(
                                            exerciseId,
                                            setIdx,
                                            "weight",
                                            displayWeight,
                                            exercise.name,
                                          );
                                        } else if (missingReps) {
                                          startEditing(
                                            exerciseId,
                                            setIdx,
                                            "reps",
                                            displayReps,
                                            exercise.name,
                                          );
                                        }
                                      }
                                      return;
                                    }

                                    const newIsCompleted = !isCompleted;
                                    onToggleSetComplete(
                                      exerciseId,
                                      setIdx,
                                      newIsCompleted,
                                    );
                                    if (newIsCompleted) {
                                      // RC-4: No iniciar FloatingRestTimer local aquí — el timer global
                                      // ya se inicia en handleQuickToggleSetComplete vía onToggleSetComplete.
                                      // Iniciar ambos causaba dos timers simultáneos.
                                      const newCompletedCount =
                                        completedCount + 1;
                                      if (
                                        newCompletedCount < exercise.sets.length
                                      ) {
                                        setPinnedExerciseId(exerciseId);
                                      } else {
                                        setPinnedExerciseId(null);
                                      }

                                      // Validar si es un nuevo récord personal
                                      if (displayWeight > 0) {
                                        const comparison = compareWithRecord(exercise.id, displayWeight, sessions);
                                        if (comparison.isNewRecord && comparison.previousRecord && comparison.previousRecord > 0) {
                                          // Retrasamos la celebración un poquito para que la UI termine de actualizarse
                                          setTimeout(() => {
                                            setPrInfo({
                                              show: true,
                                              title: '¡Nuevo Récord!',
                                              subtitle: `Superaste los ${comparison.previousRecord}kg en ${exercise.name} 🎉`
                                            });
                                          }, 200);
                                        }
                                      }

                                      // Mostrar snackbar "Deshacer" para revertir la marcación
                                      try {
                                        showToast(
                                          "Serie marcada como completada",
                                          "success",
                                          6000,
                                          {
                                            label: "Deshacer",
                                            onClick: () => {
                                              try {
                                                onToggleSetComplete(
                                                  exerciseId,
                                                  setIdx,
                                                  false,
                                                );
                                              } catch {}
                                              // Evitar mover la lista al deshacer. En su lugar,
                                              // simplemente enfocamos el control de reps para que
                                              // el usuario pueda editar o continuar sin desplazamiento.
                                              setTimeout(() => {
                                                try {
                                                  setInputRefs.current[
                                                    `${exerciseId}-${setIdx}-reps`
                                                  ]?.focus();
                                                } catch {}
                                              }, 50);
                                            },
                                          },
                                        );
                                      } catch {}

                                      // Sólo avanzar y abrir el siguiente input automáticamente si la activación fue por teclado
                                      // (event.detail === 0 para activaciones por teclado o programáticas). Esto evita
                                      // que la UI haga foco molesto tras clicks táctiles/ratón.
                                      const isKeyboardActivation =
                                        e?.detail === 0;
                                      if (autoAdvance && isKeyboardActivation) {
                                        setTimeout(
                                          () =>
                                            focusNextIncompleteSet(
                                              exerciseId,
                                              setIdx,
                                            ),
                                          100,
                                        );
                                      }
                                    } else {
                                      // No limpiar `pinnedExerciseId` al desmarcar para evitar
                                      // que la lista se mueva. Mantener el anclaje y solo
                                      // enfocar si es necesario.
                                      // (Historicamente se limpiaba aquí y eso provocaba
                                      // desplazamientos inesperados en la UI.)
                                    }
                                  }}
                                  aria-disabled={
                                    isSkipped || isToggling ||
                                    (!isReadyToComplete && !isCompleted)
                                  }
                                  title={
                                    !isReadyToComplete && !isCompleted
                                      ? "Completa reps y peso antes de marcar como completada"
                                      : undefined
                                  }
                                  disabled={
                                    isSkipped || isToggling ||
                                    (!isReadyToComplete && !isCompleted)
                                  }
                                  className={`relative h-12 w-14 md:h-10 md:w-12 rounded-xl flex items-center justify-center transition-all active:scale-90 touch-manipulation ${
                                    isCompleted
                                      ? "bg-emerald-700 text-white shadow-md shadow-emerald-200 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:bg-emerald-300 dark:text-gray-950 dark:shadow-emerald-900 dark:hover:bg-emerald-200 dark:focus-visible:ring-emerald-300"
                                      : isActiveSet
                                        ? "border-2 border-blue-600 bg-blue-50 text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:focus-visible:ring-blue-300"
                                        : "border-2 border-dashed border-gray-400 bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-2 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus-visible:ring-gray-300"
                                  }`}
                                  aria-label={`${t("set")} ${setIdx + 1}: ${
                                    isCompleted
                                      ? t("setCompleted")
                                      : isReadyToComplete
                                        ? t("setReady")
                                        : t("setPending")
                                  }`}
                                  aria-pressed={isCompleted}
                                  aria-busy={isToggling}
                                >
                                  {isToggling ? (
                                    <Spinner size="sm" className="text-white" />
                                  ) : isCompleted ? (
                                    // Checkmark relleno (path relleno + stroke)
                                    <svg
                                      className="h-5 w-5 stroke-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  ) : isReadyToComplete ? (
                                    // Relámpago = "ejecuta ahora"
                                    <svg
                                      className="h-5 w-5"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M13 2L4 14h7v8l9-12h-7V2z" />
                                    </svg>
                                  ) : (
                                    // Checkmark outline fino = vacío
                                    <svg
                                      className="h-4 w-4 stroke-2 opacity-50"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                          {/* end inner grid */}

                          {/* Eliminar (si aplica, fuera del grid) */}
                          {onDeleteSet && exercise.sets.length > 1 && (
                            <div className="ml-1 flex items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteSet(exerciseId, setIdx);
                                }}
                                className="hidden md:flex ml-1 w-6 h-6 shrink-0 rounded-full items-center justify-center bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 active:scale-90 touch-manipulation"
                                title="Eliminar serie"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>

                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const confirmed = await confirm({
                                    title: `Eliminar serie ${setIdx + 1}`,
                                    message: `¿Eliminar la serie ${setIdx + 1} de ${exercise.name}? Esta acción no se puede deshacer.`,
                                    confirmText: "Eliminar",
                                    cancelText: "Cancelar",
                                    variant: "danger",
                                  });
                                  if (confirmed)
                                    onDeleteSet(exerciseId, setIdx);
                                }}
                                className="md:hidden ml-1 w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 active:scale-95 touch-manipulation"
                                title="Acciones"
                              >
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <circle cx="5" cy="12" r="1.5" />
                                  <circle cx="12" cy="12" r="1.5" />
                                  <circle cx="19" cy="12" r="1.5" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        {/* end set row */}
                      </div>
                      );
                    })}
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
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
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
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
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

      {/* Celebración de PR */}
      <PRCelebration 
        show={prInfo.show} 
        onComplete={() => setPrInfo(prev => ({ ...prev, show: false }))} 
        title={prInfo.title}
        subtitle={prInfo.subtitle}
      />

      {/* Footer fijo (SwipeButton para completar serie o Finalizar entrenamiento) */}
      {onFinishWorkout && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-30 pb-safe">
          {(() => {
            const skippedExercises = workoutData.skippedExercises || [];
            let nextIncompleteExId: string | null = null;
            let nextIncompleteSetIdx: number | null = null;
            let nextIncompleteExName: string = "";
            let nextIncompleteReps: number = 0;
            let nextIncompleteWeight: number = 0;
            
            for (const ex of routine.exercises) {
              if (skippedExercises.includes(ex.id)) continue;
              
              const completedCount = workoutData.completedSets?.[ex.id] || 0;
              
              // Buscar la primera serie que no esté completada usando la misma lógica que la UI
              const firstIncompleteIdx = ex.sets.findIndex((_, idx) => {
                const doneReps = workoutData.actualReps[ex.id]?.[idx];
                const isCompleted = workoutData.completedSetFlags
                  ? Boolean(workoutData.completedSetFlags[ex.id]?.[idx])
                  : typeof doneReps === 'number' && doneReps > 0;
                return !isCompleted;
              });
              
              if (firstIncompleteIdx !== -1) {
                nextIncompleteExId = ex.id;
                nextIncompleteSetIdx = firstIncompleteIdx;
                nextIncompleteExName = ex.name;
                nextIncompleteReps = workoutData.actualReps[ex.id]?.[firstIncompleteIdx] || ex.sets[firstIncompleteIdx].reps || 0;
                nextIncompleteWeight = workoutData.actualWeights[ex.id]?.[firstIncompleteIdx] || ex.sets[firstIncompleteIdx].weight || 0;
                break;
              } else if (completedCount < ex.sets.length) {
                // Fallback por si hay discrepancia entre completedSets y los flags individuales
                nextIncompleteExId = ex.id;
                nextIncompleteSetIdx = completedCount;
                nextIncompleteExName = ex.name;
                nextIncompleteReps = workoutData.actualReps[ex.id]?.[completedCount] || ex.sets[completedCount].reps || 0;
                nextIncompleteWeight = workoutData.actualWeights[ex.id]?.[completedCount] || ex.sets[completedCount].weight || 0;
                break;
              }
            }

            if (nextIncompleteExId !== null && nextIncompleteSetIdx !== null) {
              return (
                <SwipeButton
                  key={`quick-swipe-${nextIncompleteExId}-${nextIncompleteSetIdx}`}
                  onComplete={() => onToggleSetComplete(nextIncompleteExId!, nextIncompleteSetIdx!, true)}
                  disabled={!nextIncompleteReps || !nextIncompleteWeight}
                  text={
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[16px] truncate max-w-[250px]">
                        {nextIncompleteExName}
                      </span>
                      <span className="text-[14px]">
                        {t("completeSet")} {nextIncompleteSetIdx + 1}
                      </span>
                    </div>
                  }
                  completedText={
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[17px]">{t("setCompletedFeedback")}</span>
                    </div>
                  }
                />
              );
            }

            return (
              <button
                onClick={onFinishWorkout}
                disabled={completedSets === 0}
                className={`w-full min-h-[56px] rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 font-bold text-lg ${
                  completedSets === 0
                    ? "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-[1.02] active:scale-95"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {t("finishWorkout")} ({completedSets} {t("sets")})
              </button>
            );
          })()}
        </div>
      )}

      <BottomSheet
        isOpen={copySetTarget !== null}
        onClose={() => setCopySetTarget(null)}
        title={t("copyValuesTitle")}
      >
        {copySetTarget && (
          <div className="space-y-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {copySetTarget.setIndex > 0 && (
              <button
                type="button"
                disabled={copySetTarget.previousReps <= 0}
                onClick={copyPreviousSetValues}
                className="min-h-12 w-full rounded-xl border border-gray-200 px-4 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                {t("copyPreviousSet")}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const target = copySetTarget;
                setCopySetTarget(null);
                void copyValuesToFollowingSets(
                  target.exerciseId,
                  target.setIndex,
                  target.reps,
                  target.weight,
                );
              }}
              className="min-h-12 w-full rounded-xl bg-emerald-600 px-4 text-left text-sm font-semibold text-white hover:bg-emerald-500"
            >
              {t("copyToFollowingSets")}
            </button>
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        isOpen={showPlateCalculator}
        onClose={() => setShowPlateCalculator(false)}
        title={t("plateCalculator")}
      >
        {editingCell?.field === "weight" && (
          <PlateCalculator
            targetWeight={
              Number(tempValue.replace(",", ".")) ||
              workoutData.actualWeights[editingCell.exerciseId]?.[editingCell.setIndex] ||
              routine.exercises.find((item) => item.id === editingCell.exerciseId)?.sets[
                editingCell.setIndex
              ]?.weight ||
              0
            }
          />
        )}
      </BottomSheet>

      {/* Selector grande para tipo de serie */}
      <BottomSheet
        isOpen={showSetTypeSelector}
        onClose={() => {
          setShowSetTypeSelector(false);
          setSetTypeTarget(null);
        }}
        title={setTypeTarget ? `${setTypeTarget.exerciseName} - Tipo de serie` : 'Tipo de serie'}
        maxHeight="100vh"
      >
        {setTypeTarget && (
          <div className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Elige el tipo de la serie (ej: Al fallo si no pudiste completar la repetición).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SET_TYPES.map((t) => {
                const info = SET_TYPE_INFO[t];
                return (
                  <button
                    key={t}
                    onClick={() => {
                      try {
                        onEditSetType(setTypeTarget.exerciseId, setTypeTarget.setIndex, t as SetType);
                        showToast(`Tipo seleccionado: ${info.label}`, 'success', 2000);
                      } catch {}
                      setShowSetTypeSelector(false);
                      setSetTypeTarget(null);
                    }}
                    className={`w-full p-4 rounded-xl text-left flex items-center gap-3 transition-shadow hover:shadow-md ${info.color}`}
                  >
                    <div className="text-2xl">{info.icon}</div>
                    <div>
                      <div className="font-bold">{info.label}</div>
                      <div className="text-sm opacity-80">{info.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Modal de edición de tiempo de descanso */}
      <BottomSheet
        isOpen={editingRestTime !== null}
        onClose={cancelRestEdit}
        title={
          editingRestTime ? `${editingRestTime.exerciseName} - Descanso` : ""
        }
        maxHeight="95vh"
      >
        {editingRestTime && (
          <>
            <div className="space-y-4 px-4 pt-4 pb-2">
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
                    if (value === "" || /^\d+$/.test(value)) {
                      setTempRestTime(value);
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="Segundos"
                  className="w-full text-5xl font-bold text-center bg-transparent border-b-4 border-purple-500 dark:border-purple-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors py-2 mb-2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Escribe directamente o usa los botones
                </p>
              </div>

              {/* Atajos rápidos para tiempos comunes */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                  Tiempos comunes
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 90, 120, 180, 240, 300, 360].map((seconds) => {
                    const mins = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    const label =
                      seconds < 60
                        ? `${seconds}s`
                        : secs > 0
                          ? `${mins}m ${secs}s`
                          : `${mins}m`;
                    return (
                      <button
                        key={seconds}
                        onClick={() => setTempRestTime(String(seconds))}
                        className="py-2 text-sm font-semibold bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg transition-colors"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Teclado numérico */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                  Teclado numérico
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() =>
                        setTempRestTime((prev) =>
                          prev === "0" ? String(num) : prev + String(num),
                        )
                      }
                      className="h-14 text-2xl font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors active:scale-95"
                    >
                      {num}
                    </button>
                  ))}

                  <div className="h-14" />

                  <button
                    onClick={() =>
                      setTempRestTime((prev) =>
                        prev === "" || prev === "0" ? "0" : prev + "0"
                      )
                    }
                    className="h-14 text-2xl font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors active:scale-95"
                  >
                    0
                  </button>

                  {/* Botón borrar */}
                  <button
                    onClick={() =>
                      setTempRestTime((prev) =>
                        prev.length > 1 ? prev.slice(0, -1) : "",
                      )
                    }
                    className="h-14 text-xl font-bold bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl transition-colors active:scale-95"
                  >
                    ⌫
                  </button>
                </div>
              </div>
            </div>

            {/* Botones de acción — sticky para que siempre sean visibles */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 grid grid-cols-2 gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={cancelRestEdit}
                className="py-3.5 text-base font-bold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveRestTime}
                className="py-3.5 text-base font-bold bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-colors"
              >
                Guardar
              </button>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}

export default QuickEditMode;
