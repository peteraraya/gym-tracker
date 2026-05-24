'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserProfile } from '@/types';
import { getExerciseRecommendations } from '@/lib/exercises/exerciseRecommendations';
import { EXERCISE_DATABASE, type ExerciseTemplate } from '@/data/exercises';
import { calculateRestBetweenSets } from '@/lib/workout/restCalculator';

interface FreeExerciseSet {
  reps: number;
  weight: number;
  duration?: number;
  type?: import('@/types').SetType;
  checked?: boolean;
}

export interface FreeExercise {
  id: string;
  name: string;
  equipment?: string;
  completedSets: FreeExerciseSet[];
  restBetweenSets?: number;
  recommendedSets?: number;
  recommendedReps?: number;
  recommendedWeight?: number;
}

interface StoredState {
  exercises: FreeExercise[];
  activeExerciseIndex: number | null;
  globalRestTime: number;
}

const STORAGE_KEY = 'gym-tracker-free-workout';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): StoredState {
  if (typeof window === 'undefined') return { exercises: [], activeExerciseIndex: null, globalRestTime: 60 };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        exercises: parsed.exercises || [],
        activeExerciseIndex: parsed.activeExerciseIndex ?? null,
        globalRestTime: parsed.globalRestTime ?? 60,
      };
    }
  } catch {}
  return { exercises: [], activeExerciseIndex: null, globalRestTime: 60 };
}

function saveToStorage(data: StoredState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function clearFreeWorkoutStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function useFreeWorkoutState() {
  const [exercises, setExercises] = useState<FreeExercise[]>(() => loadFromStorage().exercises);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(() => loadFromStorage().activeExerciseIndex);
  const [globalRestTime, setGlobalRestTime] = useState(() => loadFromStorage().globalRestTime);
  const [collapsedExercises, setCollapsedExercises] = useState<Set<number>>(() => new Set());

  // Persist state
  useEffect(() => {
    saveToStorage({ exercises, activeExerciseIndex, globalRestTime });
  }, [exercises, activeExerciseIndex, globalRestTime]);

  const activeExercise = activeExerciseIndex !== null ? exercises[activeExerciseIndex] ?? null : null;

  const addExercises = useCallback((templates: ExerciseTemplate[], userProfile: UserProfile | null) => {
    const newItems: FreeExercise[] = templates.map((t) => {
      const recommendations = getExerciseRecommendations(t, userProfile);
      let restSecs: number | undefined;
      const restTimeMatch = recommendations.restTime.match(/(\d+)/);
      if (restTimeMatch) {
        restSecs = parseInt(restTimeMatch[1], 10);
        if (recommendations.restTime.toLowerCase().includes('min')) {
          restSecs = restSecs * 60;
        }
      }
      return {
        id: generateId(),
        name: t.name,
        equipment: t.equipment,
        completedSets: [],
        restBetweenSets: restSecs,
        recommendedSets: recommendations.sets,
        recommendedReps: recommendations.reps,
        recommendedWeight: recommendations.weight,
      };
    });

    setExercises((prev) => {
      return [...prev, ...newItems];
    });
    setActiveExerciseIndex(exercises.length);
  }, [exercises.length]);

  const addExerciseFromSuggestion = useCallback((rawExercises: any[], restBetweenSets: number) => {
    const flattened: any[] = Array.isArray(rawExercises)
      ? rawExercises.flatMap((e: any) => (Array.isArray(e) ? e : [e]))
      : [];

    const toApply = flattened.map((ex: any) => ({
      id: generateId(),
      name: ex.name,
      equipment: ex.equipment,
      completedSets: [],
      restBetweenSets: ex.restBetweenSets ?? restBetweenSets,
      recommendedSets: Array.isArray(ex.sets) ? ex.sets.length : undefined,
      recommendedReps: Array.isArray(ex.sets) && ex.sets[0] ? ex.sets[0].reps : undefined,
      recommendedWeight: Array.isArray(ex.sets) && ex.sets[0] ? ex.sets[0].weight : undefined,
    }));

    setExercises((prev) => {
      return [...prev, ...toApply];
    });
    setActiveExerciseIndex(exercises.length);
  }, [exercises.length]);

  const removeExercise = useCallback((index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
    setActiveExerciseIndex((prev) => {
      if (prev === index) return null;
      if (prev !== null && prev > index) return prev - 1;
      return prev;
    });
  }, []);

  const completeSet = useCallback((reps: number, weight: number, setType: import('@/types').SetType) => {
    setExercises((prev) => {
      if (activeExerciseIndex === null || !prev[activeExerciseIndex]) return prev;
      const exercise = prev[activeExerciseIndex];
      const newExercises = [...prev];
      newExercises[activeExerciseIndex] = {
        ...exercise,
        completedSets: [
          ...exercise.completedSets,
          { reps, weight, type: setType, checked: true },
        ],
      };
      return newExercises;
    });
  }, [activeExerciseIndex]);

  const getSmartRest = useCallback((exerciseId: string, completedSetsCount: number, reps: number): number | undefined => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return undefined;
    const template = EXERCISE_DATABASE.find((e) => e.name === exercise.name);
    if (!template) return undefined;
    const rec = calculateRestBetweenSets(template, completedSetsCount + 1, reps, 'intermediate');
    return rec.recommended;
  }, [exercises]);

  const updateSet = useCallback((exerciseIndex: number, setIndex: number, updates: Partial<FreeExerciseSet>) => {
    setExercises((prev) => {
      const exercise = prev[exerciseIndex];
      if (!exercise) return prev;
      const updatedSets = [...exercise.completedSets];
      updatedSets[setIndex] = { ...updatedSets[setIndex], ...updates };
      const newExercises = [...prev];
      newExercises[exerciseIndex] = { ...exercise, completedSets: updatedSets };
      return newExercises;
    });
  }, []);

  const deleteSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const exercise = prev[exerciseIndex];
      if (!exercise) return prev;
      const newExercises = [...prev];
      newExercises[exerciseIndex] = {
        ...exercise,
        completedSets: exercise.completedSets.filter((_, i) => i !== setIndex),
      };
      return newExercises;
    });
  }, []);

  const toggleSetChecked = useCallback((exerciseIndex: number, setIndex: number, checked: boolean) => {
    updateSet(exerciseIndex, setIndex, { checked });
  }, [updateSet]);

  const toggleCollapse = useCallback((index: number) => {
    setCollapsedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const setExerciseActive = useCallback((index: number) => {
    setActiveExerciseIndex(index);
  }, []);

  return {
    exercises,
    activeExerciseIndex,
    activeExercise,
    globalRestTime,
    collapsedExercises,
    setGlobalRestTime,
    addExercises,
    addExerciseFromSuggestion,
    removeExercise,
    completeSet,
    getSmartRest,
    updateSet,
    deleteSet,
    toggleSetChecked,
    toggleCollapse,
    setExerciseActive,
    clearStorage: clearFreeWorkoutStorage,
  };
}
