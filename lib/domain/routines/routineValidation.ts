/**
 * Validación pura de rutinas.
 * Sin dependencias de React ni contexto de aplicación.
 */

import type { Exercise } from "@/types";
import type { ExerciseTemplate } from "@/data/exercises";
import {
  validateExerciseName,
  validateSetReps,
  validateSetWeight,
  isBodyweightExercise,
} from "./routineCalculations";

type ExerciseWithoutId = Omit<Exercise, "id">;

export interface RoutineValidationError {
  exerciseIndex: number;
  setIndex: number;
  message: string;
}

export interface RoutineValidationResult {
  errors: RoutineValidationError[];
  exercisesWithErrors: Set<number>;
}

/**
 * Valida todos los ejercicios de una rutina.
 * Devuelve errores agrupados por ejercicio y serie.
 */
export function validateRoutineExercises(
  exercises: ExerciseWithoutId[],
): RoutineValidationResult {
  const errors: RoutineValidationError[] = [];
  const exercisesWithErrors = new Set<number>();

  exercises.forEach((exercise, ei) => {
    const nameError = validateExerciseName(exercise.name);
    if (nameError) {
      errors.push({
        exerciseIndex: ei,
        setIndex: -1,
        message: nameError,
      });
      exercisesWithErrors.add(ei);
    }

    exercise.sets.forEach((set, si) => {
      const repsError = validateSetReps(set.reps);
      if (repsError) {
        errors.push({
          exerciseIndex: ei,
          setIndex: si,
          message: repsError,
        });
        exercisesWithErrors.add(ei);
      }

      const weightError = validateSetWeight(
        set.weight,
        isBodyweightExercise(exercise),
      );
      if (weightError) {
        errors.push({
          exerciseIndex: ei,
          setIndex: si,
          message: weightError,
        });
        exercisesWithErrors.add(ei);
      }
    });
  });

  return { errors, exercisesWithErrors };
}

/**
 * Valida que se pueda pasar al paso de ejercicios (paso 1 del wizard).
 */
export function canProceedToBasic(
  name: string,
  description: string,
): boolean {
  return name.trim().length > 0 && description.trim().length > 0;
}

/**
 * Valida que se pueda pasar al paso de revisión (paso 3 del wizard).
 */
export function canProceedToReview(
  exercises: ExerciseWithoutId[],
): boolean {
  if (exercises.length === 0) return false;
  if (!exercises.every((ex) => ex.name.trim().length > 0)) return false;
  return validateRoutineExercises(exercises).errors.length === 0;
}

/**
 * Extrae grupos musculares únicos de ejercicios usando plantillas.
 */
export function getExerciseMuscleGroups(
  exercises: ExerciseWithoutId[],
  getTemplate: (name: string) => ExerciseTemplate | undefined,
): string[] {
  const groups = new Set<string>();
  exercises.forEach((ex) => {
    const template = getTemplate(ex.name);
    if (template?.muscleGroup) {
      groups.add(template.muscleGroup);
    }
  });
  return Array.from(groups);
}
