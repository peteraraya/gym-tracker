'use client';

import { useWorkout } from '@/context/WorkoutContext';
import { useConfirm } from '@/context/ConfirmContext';
import { useRouter, usePathname } from 'next/navigation';
import { Activity, X } from '@/components/icons/lucide';

export function ActiveWorkoutBanner() {
  const { activeWorkout, cancelWorkout } = useWorkout();
  const { confirm } = useConfirm();
  const router = useRouter();
  const pathname = usePathname();

  // No mostrar el banner si no hay workout activo
  if (!activeWorkout) return null;

  // No mostrar el banner si ya estamos en una página de workout
  if (pathname?.startsWith('/workout')) return null;

  const handleContinue = () => {
    // Determinar la ruta correcta según el tipo de entrenamiento
    const targetRoute = activeWorkout.routineId === 'free-training' 
      ? '/workout/free' 
      : `/workout/${activeWorkout.routineId}`;
    
    router.push(targetRoute);
  };

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: 'Cancelar entrenamiento',
      message: '¿Cancelar entrenamiento activo? Se perderá todo el progreso.',
      confirmText: 'Sí, cancelar',
      cancelText: 'Continuar',
      variant: 'danger'
    });
    
    if (confirmed) {
      try {
        localStorage.setItem('gym-tracker-cancelled', Date.now().toString());
      } catch (e) {
        // ignore
      }
      // Remove possible modal/backdrop elements left in the DOM
      try {
        document.querySelectorAll('.modal-backdrop, .modal-overlay, [data-backdrop]').forEach(el => el.remove());
      } catch (e) {}
      cancelWorkout();
      router.replace('/routines');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg border-t-2 border-emerald-400">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            {/* Info compacta */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Activity className="w-4 h-4 flex-shrink-0 animate-pulse" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs truncate">
                  {activeWorkout.routineName}
                </p>
                <p className="text-[10px] opacity-90">
                  Ej. {activeWorkout.currentExerciseIndex + 1} · Serie {activeWorkout.currentSet}
                </p>
              </div>
            </div>
            
            {/* Botones compactos */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleContinue}
                className="px-3 py-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-md transition-colors whitespace-nowrap"
              >
                Continuar
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                aria-label="Cancelar entrenamiento"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
