"use client";

import { useWorkout } from "@/context/WorkoutContext";
import { useConfirm } from "@/context/NotificationContext";
import { useRouter, usePathname } from "next/navigation";
import { Activity, X } from "@/components/icons/lucide";

export function ActiveWorkoutBanner() {
  const { activeWorkout, cancelWorkout } = useWorkout();
  const { confirm } = useConfirm();
  const router = useRouter();
  const pathname = usePathname();

  // No mostrar el banner si no hay workout activo
  if (!activeWorkout) return null;

  // No mostrar el banner si ya estamos en una página de workout
  if (pathname?.startsWith("/workout")) return null;

  const handleContinue = () => {
    // Determinar la ruta correcta según el tipo de entrenamiento
    const targetRoute =
      activeWorkout.routineId === "free-training"
        ? "/workout/free"
        : `/workout/${activeWorkout.routineId}`;

    router.push(targetRoute);
  };

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: "Cancelar entrenamiento",
      message: "¿Cancelar entrenamiento activo? Se perderá todo el progreso.",
      confirmText: "Sí, cancelar",
      cancelText: "Continuar",
      variant: "danger",
    });

    if (confirmed) {
      // console.log("[ActiveWorkoutBanner] User confirmed cancellation");

      // Marcar la cancelación antes de llamar a cancelWorkout
      try {
        const timestamp = Date.now().toString();
        localStorage.setItem("gym-tracker-cancelled", timestamp);
        sessionStorage.setItem("workout_cancelled", timestamp);
        localStorage.setItem("workout_cancelled_persistent", timestamp);
        // console.log(
        //   "[ActiveWorkoutBanner] Set cancellation markers:",
        //   timestamp,
        // );
      } catch (e) {
        console.error(
          "[ActiveWorkoutBanner] Error setting cancellation markers:",
          e,
        );
      }

      // Remove possible modal/backdrop elements left in the DOM
      try {
        document
          .querySelectorAll(".modal-backdrop, .modal-overlay, [data-backdrop]")
          .forEach((el) => el.remove());
      } catch (e) {}

      // Cancelar el workout
      await cancelWorkout();


      // Redirigir después de un pequeño delay para asegurar que el estado se limpió
      setTimeout(() => {
        router.replace("/routines");
      }, 100);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-2xl border-t-2 border-emerald-400">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {/* Info del entrenamiento - Centrada y profesional */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm sm:text-base truncate">
                  {activeWorkout.routineName}
                </p>
                <p className="text-xs opacity-90 flex items-center gap-2">
                  <span>
                    Ejercicio {activeWorkout.currentExerciseIndex + 1}
                  </span>
                  <span>•</span>
                  <span>Serie {activeWorkout.currentSet}</span>
                </p>
              </div>
            </div>

            {/* Botones de acción - Más visibles y profesionales */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleContinue}
                className="px-5 py-2 text-sm font-bold bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all hover:scale-105 shadow-md"
              >
                Continuar
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-105 shadow-md flex items-center gap-1.5"
                aria-label="Descartar entrenamiento"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Descartar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
