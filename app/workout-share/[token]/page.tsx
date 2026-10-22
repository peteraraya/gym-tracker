"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "@/context/LocaleContext";
import { createClient } from "@/lib/infrastructure/supabase/client";

interface SharedWorkoutSnapshot {
  routine: {
    name: string;
    exercises: Array<{ id: string; name: string; sets: number; reps: number; weight?: number }>;
  };
  workout: {
    currentExerciseIndex: number;
    currentSet: number;
    completedSets: Record<string, number>;
    actualReps: Record<string, number[]>;
    actualWeights: Record<string, number[]>;
    startedAt?: string;
    isResting?: boolean;
  };
}

function isSharedWorkoutSnapshot(value: unknown): value is SharedWorkoutSnapshot {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<SharedWorkoutSnapshot>;
  return (
    typeof candidate.routine?.name === "string" &&
    Array.isArray(candidate.routine.exercises) &&
    candidate.routine.exercises.every(
      (exercise) =>
        typeof exercise.id === "string" &&
        typeof exercise.name === "string" &&
        typeof exercise.sets === "number",
    ) &&
    typeof candidate.workout?.currentExerciseIndex === "number" &&
    typeof candidate.workout.currentSet === "number" &&
    candidate.workout.completedSets !== null &&
    typeof candidate.workout.completedSets === "object"
  );
}

export default function SharedWorkoutPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const t = useTranslations("workoutShare");
  const [snapshot, setSnapshot] = useState<SharedWorkoutSnapshot | null>(null);
  const [status, setStatus] = useState<"loading" | "active" | "unavailable" | "error">("loading");

  useEffect(() => {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      setStatus("unavailable");
      return;
    }

    let mounted = true;
    const fetchWorkout = async () => {
      try {
        const { data, error } = await createClient().rpc("get_shared_workout", {
          p_token: token,
        });
        if (error) throw error;
        if (!mounted) return;
        if (!isSharedWorkoutSnapshot(data)) {
          setSnapshot(null);
          setStatus("unavailable");
          return;
        }
        setSnapshot(data);
        setStatus("active");
      } catch (error) {
        console.error("[SharedWorkoutPage] Could not load shared workout", error);
        if (mounted) setStatus("error");
      }
    };

    void fetchWorkout();
    const intervalId = window.setInterval(() => void fetchWorkout(), 5000);
    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  const currentExercise =
    snapshot?.routine.exercises[snapshot.workout.currentExerciseIndex];
  const completed = currentExercise
    ? snapshot?.workout.completedSets[currentExercise.id] ?? 0
    : 0;

  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          {t("viewerLabel")}
        </p>
        {status === "loading" && <p className="mt-3">{t("loading")}</p>}
        {status === "unavailable" && <p className="mt-3">{t("unavailable")}</p>}
        {status === "error" && <p role="alert" className="mt-3 text-red-600">{t("error")}</p>}
        {snapshot && status === "active" && (
          <>
            <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {snapshot.routine.name}
            </h1>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              {t("exercisePosition")
                .replace("{current}", String(snapshot.workout.currentExerciseIndex + 1))
                .replace("{total}", String(snapshot.routine.exercises.length))}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {currentExercise?.name ?? t("betweenExercises")}
            </h2>
            {currentExercise && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {t("setProgress")
                  .replace("{completed}", String(completed))
                  .replace("{total}", String(currentExercise.sets))}
              </p>
            )}
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {t("readOnly")}
            </p>
          </>
        )}
      </section>
    </main>
  );
}
