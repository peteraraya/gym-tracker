"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  Exercise,
  UserProfile,
  SetType,
  Set as ExerciseSet,
} from "@/types";
import type { ExerciseTemplate, MuscleGroup } from "@/data/exercises";
import type { WarmupExercise } from "@/data/warmupExercises";
import { useRoutines } from "@/context/GymContext";
import { useToast } from "@/context/NotificationContext";
import { useConfirm } from "@/context/NotificationContext";
import { useTranslations } from "@/context/LocaleContext";
import { getExerciseByName } from "@/data/exercises";
import { getRoutineStats } from "@/lib/routineEstimation";
import { getExerciseRecommendations } from "@/lib/exerciseRecommendations";
import logger from "@/lib/logger";
import { getRecommendedWeight } from '@/lib/routineGenerator';
import { useEquipment } from '@/context/EquipmentContext';
import * as storageService from "@/lib/storage/storage";

// storageService is available for future use (e.g. offline-draft persistence via the
// storage abstraction layer). Dynamic imports for storageConfig / localProfile are used
// inside loadProfile so that they stay tree-shakeable on the server.
void storageService;

export interface ValidationError {
  exerciseIndex: number;
  setIndex: number;
  message: string;
}

export interface EditingValue {
  exerciseIndex: number;
  setIndex: number;
  field: "reps" | "weight";
  currentValue: number;
}

export interface UseRoutineFormReturn {
  // Estado del wizard
  currentStep: "basic" | "exercises" | "review";
  setCurrentStep: (step: "basic" | "exercises" | "review") => void;
  // Estado básico
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  image: string;
  restBetweenSets: number;
  setRestBetweenSets: (v: number) => void;
  restBetweenExercises: number;
  setRestBetweenExercises: (v: number) => void;
  // Ejercicios
  exercises: Omit<Exercise, "id">[];
  isExerciseSelectorOpen: boolean;
  setIsExerciseSelectorOpen: (v: boolean) => void;
  // Drag & drop
  draggedExerciseIndex: number | null;
  setDraggedExerciseIndex: (v: number | null) => void;
  dragOverIndex: number | null;
  setDragOverIndex: (v: number | null) => void;
  // Expansión
  expandedExercises: Set<number>;
  toggleExerciseExpanded: (index: number) => void;
  // Validación
  validationErrors: ValidationError[];
  touchedFields: Set<string>;
  showBasicErrors: boolean;
  setShowBasicErrors: (v: boolean) => void;
  // Edición inline
  editingValue: EditingValue | null;
  setEditingValue: (v: EditingValue | null) => void;
  // Submit
  isSubmitting: boolean;
  // Perfil
  userProfile: UserProfile | null;
  // Computed
  routineStats: ReturnType<typeof getRoutineStats>;
  canProceedToExercises: boolean;
  canProceedToReview: boolean;
  routineMuscleGroups: MuscleGroup[];
  // Traducciones
  t: (key: string) => string;
  tc: (key: string) => string;
  // Handlers
  handleCancelWithConfirm: () => Promise<void>;
  handleAddExercise: () => void;
  handleSelectExercises: (templates: ExerciseTemplate[]) => void;
  handleAddWarmups: (warmups: WarmupExercise[]) => void;
  handleAddCustomExercise: () => void;
  handleRemoveExercise: (index: number) => void;
  handleMoveExercise: (from: number, to: number) => void;
  handleExerciseChange: (
    index: number,
    field: "name" | "equipment" | "notes",
    value: string,
  ) => void;
  handleAddSet: (exerciseIndex: number) => void;
  handleRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  handleCopySet: (exerciseIndex: number, setIndex: number) => void;
  handleSetChange: (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weight" | "type",
    value: number | SetType,
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
  validateExercises: () => {
    errors: ValidationError[];
    exercisesWithErrors: Set<number>;
  };
  routineId: string | null | undefined;
  setExercises: React.Dispatch<React.SetStateAction<Omit<Exercise, "id">[]>>;
  setImage: React.Dispatch<React.SetStateAction<string>>;
  setTouchedFields: React.Dispatch<React.SetStateAction<Set<string>>>;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationError[]>>;
  setExpandedExercises: React.Dispatch<React.SetStateAction<Set<number>>>;
  confirm: (...args: any[]) => Promise<boolean>;
  success: (msg: string, timeout?: number) => void;
  error: (msg: string, timeout?: number) => void;
  getExerciseByName: (name: string) => ExerciseTemplate | undefined;
}

/** Clave para el borrador en localStorage */
const STORAGE_KEY = "gym-tracker-routine-draft";

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

function isBodyweightExercise(exercise: Omit<Exercise, "id">): boolean {
  const equipment = exercise.equipment?.toLowerCase() ?? "";
  const name = exercise.name?.toLowerCase() ?? "";
  return (
    equipment.includes("peso corporal") ||
    equipment.includes("bodyweight") ||
    equipment.includes("calistenia") ||
    name.includes("plancha") ||
    name.includes("flexion") ||
    name.includes("dominada") ||
    name.includes("abdominal") ||
    name.includes("pull up") ||
    name.includes("push up")
  );
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------

export function useRoutineForm(
  routineId: string | null | undefined,
  onClose: () => void,
): UseRoutineFormReturn {
  const { addRoutine, updateRoutine, getRoutineById } = useRoutines();
  const { success, error } = useToast();
  const { confirm } = useConfirm();

  // ── Estado del wizard ──────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<
    "basic" | "exercises" | "review"
  >("basic");

  // ── Estado básico ──────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string>("");
  const [restBetweenSets, setRestBetweenSets] = useState(60);
  const [restBetweenExercises, setRestBetweenExercises] = useState(120);

  // ── Ejercicios ─────────────────────────────────────────────────────────
  const [exercises, setExercises] = useState<Omit<Exercise, "id">[]>([]);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);

  // ── Drag & drop ────────────────────────────────────────────────────────
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState<
    number | null
  >(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ── Expansión ──────────────────────────────────────────────────────────
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(
    new Set(),
  );

  // ── Validación ─────────────────────────────────────────────────────────
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showBasicErrors, setShowBasicErrors] = useState(false);

  // ── Edición inline ─────────────────────────────────────────────────────
  const [editingValue, setEditingValue] = useState<EditingValue | null>(null);

  // ── Submit ─────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Perfil del usuario ─────────────────────────────────────────────────
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const equipment = useEquipment();

  // ── Traducciones ───────────────────────────────────────────────────────
  const t = useTranslations("routineForm");
  const tc = useTranslations("common");

  // ── Cargar perfil del usuario ──────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { useLocalStorage } = await import("@/lib/storageConfig");

        if (useLocalStorage()) {
          if (typeof window !== "undefined") {
            const { getProfileLocally } = await import("@/lib/localProfile");
            const localProfile = getProfileLocally();
            if (localProfile) {
              logger.log(
                "[useRoutineForm] ✅ Loaded profile from localStorage:",
                localProfile,
              );
              setUserProfile(localProfile);
              return;
            }
          }
        } else {
          logger.log("[useRoutineForm] ☁️ Loading profile from Supabase...");
          const response = await fetch("/api/profile");
          if (response.ok) {
            const profile = (await response.json()) as UserProfile;
            logger.log(
              "[useRoutineForm] ✅ Loaded profile from Supabase:",
              profile,
            );
            setUserProfile(profile);
          }
        }
      } catch (err) {
        logger.error("[useRoutineForm] ❌ Error loading profile:", err);
      }
    };

    void loadProfile();
  }, []);

  // ── Autosave del borrador (debounce 1 s) ───────────────────────────────
  useEffect(() => {
    // No guardar si estamos editando una rutina existente
    if (routineId) return;

    // Solo guardar si hay algún dato ingresado
    if (!name && !description && !image && exercises.length === 0) return;

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
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch (e) {
        logger.warn("[useRoutineForm] Error saving draft:", e);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    name,
    description,
    image,
    exercises,
    restBetweenSets,
    restBetweenExercises,
    currentStep,
    routineId,
  ]);

  // ── Restaurar borrador / cargar rutina existente ───────────────────────
  useEffect(() => {
    if (routineId) {
      const routine = getRoutineById(routineId);
      if (routine) {
        setName(routine.name);
        setDescription(routine.description ?? "");
        setImage(routine.image ?? "");

        type StoredExercise = (typeof routine.exercises)[number];
        const migratedExercises = routine.exercises.map((r: StoredExercise) => {
          const { id, ...rest } = r;
          void id; // Descartamos el id intencionalmente
          const restMaybe = rest as unknown as {
            sets?: unknown;
            reps?: unknown;
            weight?: unknown;
          };

          if (typeof restMaybe.sets === "number") {
            // Formato antiguo → nuevo
            const oldSets = restMaybe.sets as number;
            const oldReps = (restMaybe.reps as number) ?? 10;
            const oldWeight = (restMaybe.weight as number) ?? 0;
            const restTyped = rest as Omit<Exercise, "id"> & {
              restBetweenSets?: number;
              useSmartRest?: boolean;
            };
            return {
              name: restTyped.name,
              equipment: restTyped.equipment,
              notes: restTyped.notes,
              sets: Array<null>(oldSets)
                .fill(null)
                .map(() => ({
                  reps: oldReps,
                  weight: oldWeight,
                  type: "normal" as SetType,
                })),
              restBetweenSets: restTyped.restBetweenSets,
              useSmartRest: restTyped.useSmartRest,
            } as Omit<Exercise, "id">;
          }

          return rest as Omit<Exercise, "id">;
        });

        setExercises(migratedExercises);
        setRestBetweenSets(routine.restBetweenSets ?? 60);
        setRestBetweenExercises(routine.restBetweenExercises ?? 120);
        setCurrentStep("exercises");
      }
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const draft = JSON.parse(stored) as {
            name?: string;
            description?: string;
            image?: string;
            exercises?: Omit<Exercise, "id">[];
            restBetweenSets?: number;
            restBetweenExercises?: number;
            currentStep?: "basic" | "exercises" | "review";
            timestamp?: number;
          };
          const age = Date.now() - (draft.timestamp ?? 0);
          if (age < 24 * 60 * 60 * 1000) {
            setName(draft.name ?? "");
            setDescription(draft.description ?? "");
            setImage(draft.image ?? "");
            setExercises(draft.exercises ?? []);
            setRestBetweenSets(draft.restBetweenSets ?? 60);
            setRestBetweenExercises(draft.restBetweenExercises ?? 120);
            setCurrentStep(draft.currentStep ?? "basic");
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (e) {
        logger.warn("[useRoutineForm] Error restoring draft:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineId]);

  // ── Computed ───────────────────────────────────────────────────────────
  const routineStats = useMemo(
    () => getRoutineStats(exercises, restBetweenSets, restBetweenExercises),
    [exercises, restBetweenSets, restBetweenExercises],
  );

  const canProceedToExercises = name.trim().length > 0;

  const validateExercises = useCallback((): {
    errors: ValidationError[];
    exercisesWithErrors: Set<number>;
  } => {
    const errors: ValidationError[] = [];
    const exercisesWithErrors = new Set<number>();

    exercises.forEach((exercise, ei) => {
      if (!exercise.name || exercise.name.trim().length === 0) {
        errors.push({
          exerciseIndex: ei,
          setIndex: -1,
          message: "Nombre del ejercicio requerido",
        });
        exercisesWithErrors.add(ei);
      }

      exercise.sets.forEach((s: ExerciseSet, si: number) => {
        const reps =
          typeof s.reps === "number" ? s.reps : parseInt(String(s.reps));
        if (!reps || reps <= 0) {
          errors.push({
            exerciseIndex: ei,
            setIndex: si,
            message: "Reps requeridas (> 0)",
          });
          exercisesWithErrors.add(ei);
        }

        const weight =
          typeof s.weight === "number"
            ? s.weight
            : parseFloat(String(s.weight ?? 0));
        if (!isBodyweightExercise(exercise) && (!weight || weight <= 0)) {
          errors.push({
            exerciseIndex: ei,
            setIndex: si,
            message: "Peso requerido (> 0)",
          });
          exercisesWithErrors.add(ei);
        }
      });
    });

    return { errors, exercisesWithErrors };
  }, [exercises]);

  const canProceedToReview =
    exercises.length > 0 &&
    exercises.every((ex) => ex.name.trim().length > 0) &&
    validateExercises().errors.length === 0;

  const routineMuscleGroups: MuscleGroup[] = exercises
    .map((ex) => {
      const template = getExerciseByName(ex.name);
      return template?.muscleGroup;
    })
    .filter((mg): mg is MuscleGroup => mg !== undefined);

  // ── clearDraft ─────────────────────────────────────────────────────────
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      logger.warn("[useRoutineForm] Error clearing draft:", e);
    }
  }, []);

  // ── toggleExerciseExpanded ─────────────────────────────────────────────
  const toggleExerciseExpanded = useCallback((index: number) => {
    setExpandedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // ── handleCancelWithConfirm ────────────────────────────────────────────
  const handleCancelWithConfirm = useCallback(async () => {
    if (name || description || image || exercises.length > 0) {
      const confirmed = await confirm({
        title: "Cancelar creación de rutina",
        message: "¿Estás seguro? Se perderá todo el progreso no guardado.",
        confirmText: "Sí, cancelar",
        cancelText: "Continuar editando",
        variant: "danger",
      });
      if (!confirmed) return;
    }
    clearDraft();
    onClose();
  }, [
    name,
    description,
    image,
    exercises.length,
    confirm,
    clearDraft,
    onClose,
  ]);

  // ── handleAddExercise ──────────────────────────────────────────────────
  const handleAddExercise = useCallback(() => {
    setIsExerciseSelectorOpen(true);
  }, []);

  // ── handleSelectExercises ──────────────────────────────────────────────
  const handleSelectExercises = useCallback(
    (exerciseTemplates: ExerciseTemplate[]) => {
      logger.log(
        "[useRoutineForm] handleSelectExercises called with:",
        exerciseTemplates.length,
        "exercises",
      );
      logger.log(
        "[useRoutineForm] Exercise names:",
        exerciseTemplates.map((e) => e.name),
      );

      const newExercises: Omit<Exercise, "id">[] = exerciseTemplates.map(
        (template) => {
          const recommendations = getExerciseRecommendations(
            template,
            userProfile,
          );

          logger.log(
            `[useRoutineForm] Recommendations for ${template.name}:`,
            recommendations,
          );

          const sets = Array<null>(recommendations.sets)
            .fill(null)
            .map(() => ({
              reps: recommendations.reps,
              weight: recommendations.weight,
              type: "normal" as SetType,
            }));

          let defaultRestSecs: number | undefined;
          const restTimeMatch = recommendations.restTime.match(/(\d+)/);
          if (restTimeMatch) {
            defaultRestSecs = parseInt(restTimeMatch[1]);
            if (recommendations.restTime.toLowerCase().includes("min")) {
              defaultRestSecs = defaultRestSecs * 60;
            }
          }

          return {
            name: template.name,
            sets,
            equipment: template.equipment,
            notes: "",
            restBetweenSets: defaultRestSecs,
          };
        },
      );

      logger.log(
        "[useRoutineForm] Created",
        newExercises.length,
        "new exercises with intelligent recommendations",
      );

      if (userProfile) {
        success(
          `✨ Ejercicios configurados automáticamente según tu perfil (${userProfile.fitnessLevel ?? "principiante"}, ${userProfile.fitnessGoal ?? "fitness general"})`,
        );
      } else {
        success(
          "✨ Ejercicios configurados con valores recomendados por defecto",
        );
      }

      setExercises((prev) => [...prev, ...newExercises]);
      setIsExerciseSelectorOpen(false);
    },
    [userProfile, success],
  );

  // ── handleAddWarmups ───────────────────────────────────────────────────
  const handleAddWarmups = useCallback((warmups: WarmupExercise[]) => {
    const warmupExercises: Omit<Exercise, "id">[] = warmups.map((w) => ({
      name: `🔥 ${w.name}`,
      sets: Array<null>(w.defaultSets ?? 2)
        .fill(null)
        .map(() => ({
          reps: w.defaultReps ?? 10,
          weight: 0,
          type: "warmup" as SetType,
        })),
      equipment: w.equipment,
      notes: w.duration ? `Duración: ${w.duration}` : "",
    }));

    setExercises((prev) => [...warmupExercises, ...prev]);
  }, []);

  // ── handleAddCustomExercise ────────────────────────────────────────────
  const handleAddCustomExercise = useCallback(() => {
    setExercises((prev) => [
      ...prev,
      { name: "", sets: [{ reps: 10, weight: 0 }], equipment: "", notes: "" },
    ]);
  }, []);

  // ── handleRemoveExercise ───────────────────────────────────────────────
  const handleRemoveExercise = useCallback((index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
    setExpandedExercises((prev) => {
      const next = new Set(prev);
      next.delete(index);
      const adjusted = new Set<number>();
      next.forEach((i) => {
        adjusted.add(i > index ? i - 1 : i);
      });
      return adjusted;
    });
  }, []);

  // ── handleMoveExercise ─────────────────────────────────────────────────
  const handleMoveExercise = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      setExercises((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });

      setExpandedExercises((prev) => {
        const next = new Set<number>();
        prev.forEach((i) => {
          if (i === fromIndex) {
            next.add(toIndex);
          } else if (fromIndex < toIndex) {
            if (i > fromIndex && i <= toIndex) next.add(i - 1);
            else next.add(i);
          } else {
            if (i >= toIndex && i < fromIndex) next.add(i + 1);
            else next.add(i);
          }
        });
        return next;
      });
    },
    [],
  );

  // ── handleExerciseChange ───────────────────────────────────────────────
  const handleExerciseChange = useCallback(
    (index: number, field: "name" | "equipment" | "notes", value: string) => {
      setExercises((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });

      // Si el usuario está escribiendo el nombre, limpiar el error de nombre (setIndex === -1)
      if (field === "name") {
        const trimmed = value?.trim?.() ?? "";
        if (trimmed.length > 0) {
          setValidationErrors((prev) =>
            prev.filter((err) => !(err.exerciseIndex === index && err.setIndex === -1)),
          );
        }

        setTouchedFields((prev) => {
          const next = new Set(prev);
          next.add(`exercise-${index}-name`);
          return next;
        });
      }
    },
    [setValidationErrors, setTouchedFields],
  );

  // ── handleAddSet ───────────────────────────────────────────────────────
  const handleAddSet = useCallback((exerciseIndex: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const exercise = {
        ...next[exerciseIndex],
        sets: [...next[exerciseIndex].sets],
      };
      const lastSet = exercise.sets[exercise.sets.length - 1];
      exercise.sets.push({
        reps: lastSet?.reps ?? 10,
        weight: lastSet?.weight ?? 0,
        type: "normal" as SetType,
      });
      next[exerciseIndex] = exercise;
      return next;
    });
  }, []);

  // ── handleRemoveSet ────────────────────────────────────────────────────
  const handleRemoveSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      setExercises((prev) => {
        const next = [...prev];
        const exercise = {
          ...next[exerciseIndex],
          sets: [...next[exerciseIndex].sets],
        };
        if (exercise.sets.length <= 1) return prev;
        exercise.sets.splice(setIndex, 1);
        next[exerciseIndex] = exercise;
        return next;
      });
    },
    [],
  );

  // ── handleCopySet ──────────────────────────────────────────────────────
  const handleCopySet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      setExercises((prev) => {
        const next = [...prev];
        const exercise = {
          ...next[exerciseIndex],
          sets: [...next[exerciseIndex].sets],
        };
        const setToCopy = exercise.sets[setIndex];
        exercise.sets.splice(setIndex + 1, 0, { ...setToCopy });
        next[exerciseIndex] = exercise;
        return next;
      });
    },
    [],
  );

  // ── handleSetChange ────────────────────────────────────────────────────
  const handleSetChange = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      field: "reps" | "weight" | "type",
      value: number | SetType,
    ) => {
      setExercises((prev) => {
        const next = [...prev];
        const exercise = {
          ...next[exerciseIndex],
          sets: [...next[exerciseIndex].sets],
        };
        const set = { ...exercise.sets[setIndex] };

        if (field === "type") {
          set.type = value as SetType;
        } else {
          (set as Record<string, unknown>)[field] = value as number;
        }

        exercise.sets[setIndex] = set;
        next[exerciseIndex] = exercise;
        return next;
      });

      // Marcar campo como tocado
      const fieldKey = `${exerciseIndex}-${setIndex}-${field}`;
      setTouchedFields((prev) => new Set(prev).add(fieldKey));

      // Validación en tiempo real
      if (field === "weight" && typeof value === "number") {
        setExercises((prev) => {
          const exercise = prev[exerciseIndex];
          const bodyweight = isBodyweightExercise(exercise);

          setValidationErrors((errs) => {
            const filtered = errs.filter(
              (err) =>
                !(
                  err.exerciseIndex === exerciseIndex &&
                  err.setIndex === setIndex &&
                  err.message.includes("Peso")
                ),
            );
            if (!bodyweight && value <= 0) {
              return [
                ...filtered,
                { exerciseIndex, setIndex, message: "Peso requerido (> 0)" },
              ];
            }
            return filtered;
          });

          return prev; // No mutar ejercicios aquí — ya se hizo arriba
        });
      }

      if (field === "reps" && typeof value === "number") {
        setValidationErrors((errs) => {
          const filtered = errs.filter(
            (err) =>
              !(
                err.exerciseIndex === exerciseIndex &&
                err.setIndex === setIndex &&
                err.message.includes("Reps")
              ),
          );
          if (value <= 0) {
            return [
              ...filtered,
              { exerciseIndex, setIndex, message: "Reps requeridas (> 0)" },
            ];
          }
          return filtered;
        });
      }
    },
    [],
  );

  // ── handleSubmit ───────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      // Marcar todos los campos como tocados
      const allTouchedFields = new Set<string>();
      exercises.forEach((exercise, ei) => {
        exercise.sets.forEach((_s: ExerciseSet, si: number) => {
          allTouchedFields.add(`${ei}-${si}-reps`);
          allTouchedFields.add(`${ei}-${si}-weight`);
        });
      });
      setTouchedFields(allTouchedFields);

      const errors: ValidationError[] = [];
      exercises.forEach((exercise, ei) => {
        exercise.sets.forEach((s: ExerciseSet, si: number) => {
          const reps =
            typeof s.reps === "number" ? s.reps : parseInt(String(s.reps));
          if (!reps || reps <= 0) {
            errors.push({
              exerciseIndex: ei,
              setIndex: si,
              message: "Reps requeridas (> 0)",
            });
          }

          const weight =
            typeof s.weight === "number"
              ? s.weight
              : parseFloat(String(s.weight ?? 0));
          if (!isBodyweightExercise(exercise) && (!weight || weight <= 0)) {
            errors.push({
              exerciseIndex: ei,
              setIndex: si,
              message: "Peso requerido (> 0)",
            });
          }
        });
      });

      if (errors.length > 0) {
        setValidationErrors(errors);
        try {
          const first = errors[0];
          const selector = `input[name=weight-${first.exerciseIndex}-${first.setIndex}]`;
          const el =
            typeof window !== "undefined"
              ? (document.querySelector(selector) as HTMLElement | null)
              : null;
          el?.focus();
        } catch (_e) {
          // Silenciar — foco no es crítico
        }
        return;
      }

      setValidationErrors([]);
      setIsSubmitting(true);

      const exercisesWithIds: Exercise[] = exercises.map((exercise, index) => ({
        ...exercise,
        id: routineId
          ? (getRoutineById(routineId)?.exercises[index]?.id ??
            `ex-${routineId}-${index}`)
          : `ex-new-${index}-${crypto.randomUUID()}`,
      }));

      logger.log(
        "[useRoutineForm] Guardando ejercicios:",
        exercisesWithIds.map((ex) => ({
          name: ex.name,
          restBetweenSets: ex.restBetweenSets,
          useSmartRest: ex.useSmartRest,
        })),
      );

      try {
        if (routineId) {
          // Ensure suggested weights are set according to profile and equipment before updating
          const mappedLevel = userProfile
            ? userProfile.fitnessLevel === 'beginner' ? 'principiante' : userProfile.fitnessLevel === 'intermediate' ? 'intermedio' : 'avanzado'
            : 'intermedio';

          const goalMap: Record<string, string> = {
            muscle_gain: 'hypertrophy',
            strength: 'strength',
            weight_loss: 'weight_loss',
            endurance: 'endurance',
            general_fitness: 'general'
          };

          const mappedGoals = userProfile && userProfile.fitnessGoal ? [goalMap[userProfile.fitnessGoal] || 'general'] : [];

          const exercisesWithWeights = exercisesWithIds.map((ex) => ({
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.weight && s.weight > 0) return s;
              try {
                const rec = getRecommendedWeight(ex.name, mappedLevel as any, mappedGoals as any);
                // adjust for equipment: barbell -> dumbbells
                const equipmentStr = (ex.equipment || '').toLowerCase();
                let final = rec;
                const hasBar = equipment.selectedEquipment.has('barra');
                const hasDumb = equipment.selectedEquipment.has('mancuernas');
                if ((equipmentStr.includes('barra') || equipmentStr.includes('barbell')) && !hasBar && hasDumb) {
                  final = Math.round((rec / 2) / 2.5) * 2.5;
                }
                return { ...s, weight: final };
              } catch {
                return { ...s, weight: s.weight || 0 };
              }
            }),
          }));

          await updateRoutine(routineId, {
            name,
            description,
            image,
            exercises: exercisesWithWeights,
            restBetweenSets,
            restBetweenExercises,
          });
        } else {
          const mappedLevel = userProfile
            ? userProfile.fitnessLevel === 'beginner' ? 'principiante' : userProfile.fitnessLevel === 'intermediate' ? 'intermedio' : 'avanzado'
            : 'intermedio';

          const goalMap: Record<string, string> = {
            muscle_gain: 'hypertrophy',
            strength: 'strength',
            weight_loss: 'weight_loss',
            endurance: 'endurance',
            general_fitness: 'general'
          };

          const mappedGoals = userProfile && userProfile.fitnessGoal ? [goalMap[userProfile.fitnessGoal] || 'general'] : [];

          const exercisesWithWeights = exercisesWithIds.map((ex) => ({
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.weight && s.weight > 0) return s;
              try {
                const rec = getRecommendedWeight(ex.name, mappedLevel as any, mappedGoals as any);
                const equipmentStr = (ex.equipment || '').toLowerCase();
                let final = rec;
                const hasBar = equipment.selectedEquipment.has('barra');
                const hasDumb = equipment.selectedEquipment.has('mancuernas');
                if ((equipmentStr.includes('barra') || equipmentStr.includes('barbell')) && !hasBar && hasDumb) {
                  final = Math.round((rec / 2) / 2.5) * 2.5;
                }
                return { ...s, weight: final };
              } catch {
                return { ...s, weight: s.weight || 0 };
              }
            }),
          }));

          await addRoutine({
            name,
            description,
            image,
            exercises: exercisesWithWeights,
            restBetweenSets,
            restBetweenExercises,
          });
        }

        success(routineId ? t("updateSuccess") : t("createSuccess"));
        clearDraft();
        onClose();
      } catch (err) {
        logger.error("[useRoutineForm] Error saving routine:", err);

        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";

        if (
          errorMessage.includes("conexión") ||
          errorMessage.includes("internet") ||
          errorMessage.includes("Verifica")
        ) {
          error(
            `❌ ${errorMessage}\n\n💾 Se guardó un borrador local. Puedes intentar de nuevo cuando tengas conexión.`,
            10000,
          );
          logger.log(
            "[useRoutineForm] Borrador guardado automáticamente por el sistema de storage",
          );
        } else if (errorMessage.includes("Base de datos requerida")) {
          error(
            "❌ La base de datos no está habilitada. Contacta al administrador del sistema.",
            8000,
          );
        } else {
          error(
            `❌ ${errorMessage}\n\nIntenta de nuevo o contacta soporte si el problema persiste.`,
            8000,
          );
        }
        // No cerramos el formulario para que el usuario pueda reintentar
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      exercises,
      routineId,
      name,
      description,
      image,
      restBetweenSets,
      restBetweenExercises,
      addRoutine,
      updateRoutine,
      getRoutineById,
      success,
      error,
      t,
      clearDraft,
      onClose,
    ],
  );

  // ── handleImageUpload ──────────────────────────────────────────────────
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  // ── handleRemoveImage ──────────────────────────────────────────────────
  const handleRemoveImage = useCallback(() => {
    setImage("");
  }, []);

  // ── Return ─────────────────────────────────────────────────────────────
  return {
    // Estado del wizard
    currentStep,
    setCurrentStep,
    // Estado básico
    name,
    setName,
    description,
    setDescription,
    image,
    setImage,
    restBetweenSets,
    setRestBetweenSets,
    restBetweenExercises,
    setRestBetweenExercises,
    // Ejercicios
    exercises,
    isExerciseSelectorOpen,
    setIsExerciseSelectorOpen,
    // Drag & drop
    draggedExerciseIndex,
    setDraggedExerciseIndex,
    dragOverIndex,
    setDragOverIndex,
    // Expansión
    expandedExercises,
    toggleExerciseExpanded,
    // Validación
    validationErrors,
    touchedFields,
    showBasicErrors,
    setShowBasicErrors,
    // Edición inline
    editingValue,
    setEditingValue,
    // Submit
    isSubmitting,
    // Perfil
    userProfile,
    // Computed
    routineStats,
    canProceedToExercises,
    canProceedToReview,
    routineMuscleGroups,
    // Traducciones
    t,
    tc,
    // Handlers
    handleCancelWithConfirm,
    handleAddExercise,
    handleSelectExercises,
    handleAddWarmups,
    handleAddCustomExercise,
    handleRemoveExercise,
    handleMoveExercise,
    handleExerciseChange,
    handleAddSet,
    handleRemoveSet,
    handleCopySet,
    handleSetChange,
    handleSubmit,
    handleImageUpload,
    handleRemoveImage,
    validateExercises,
    routineId,
    setExercises,
    setTouchedFields,
    setValidationErrors,
    setExpandedExercises,
    confirm,
    success,
    error,
    getExerciseByName,
  };
}
