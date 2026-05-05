"use client";

// Evita prerender estático para esta página (usa hooks de navegación del cliente)
export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { useWorkout } from '@/context/WorkoutContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RoutineForm } from '@/components/RoutineForm';
import RoutineWizard from '@/components/RoutineWizard';
import WeeklyPlanner from '@/components/WeeklyPlanner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { generateRoutine } from '@/lib/routineGenerator';
import {
  Plus,
  Play,
  Pencil,
  Trash2,
  ClipboardList,
  Dumbbell,
  Flame,
  Zap,
  Copy
} from '@/components/icons/lucide';

import { useTranslations } from '@/context/LocaleContext';
import { LoadingState } from '@/components/LoadingState';
import { PageHeader, PageLayout, PageContent } from '@/layouts';

export default function RoutinesPage() {
  const router = useRouter();
  const { routines, deleteRoutine, loading, addRoutine } = useGym();
  const { startWorkout, isWorkoutActive, activeWorkout } = useWorkout();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  const t = useTranslations('routines');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  // ✅ FASE 3 - Problema #17: Debounce para searchFilter
  const [debouncedSearchFilter, setDebouncedSearchFilter] = useState<string>('');

  // Debounce del searchFilter para evitar recalcular filteredRoutines en cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchFilter(searchFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchFilter]);

  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [startingWorkoutId, setStartingWorkoutId] = useState<string | null>(null);

  const handleEdit = useCallback((id: string) => {
    setEditingRoutine(id);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRoutine(null);
  }, []);

  const handleWizardComplete = async (data: any) => {
    try {
      // Generar rutinas usando el generador inteligente (ahora retorna array)
      const generatedRoutines = await generateRoutine(data);

      // Agregar todas las rutinas al contexto
      for (const generatedRoutine of generatedRoutines) {
        // Remover campos que addRoutine no espera (id, createdAt, updatedAt)
        const { id, createdAt, updatedAt, ...routineData } = generatedRoutine;
        await addRoutine(routineData);
      }

      setIsWizardOpen(false);
      success(`¡${generatedRoutines.length} rutina(s) creada(s) exitosamente! Puedes editarlas si lo deseas.`);
    } catch (err) {
      console.error('Error generating routine:', err);
      error('Error al generar la rutina. Intenta de nuevo.');
    }
  };

  // Abrir modal si la URL contiene ?create=1 (lee desde window para evitar hooks de navegación en prerender)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('create') === '1') {
      setIsModalOpen(true);
    }

    // Inicializar filtro desde localStorage (escrito por WeeklyPlanner)
    try {
      const stored = localStorage.getItem('weekly_routines_search') || '';
      setSearchFilter(stored);
    } catch (e) { }
  }, []);

  // Escuchar cambios en localStorage para sincronizar el filtro (cuando se modifica desde WeeklyPlanner)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: StorageEvent) => {
      if (e.key === 'weekly_routines_search') {
        setSearchFilter(e.newValue || '');
      }
    };

    const customHandler = (e: CustomEvent) => {
      setSearchFilter(e.detail || '');
    };

    window.addEventListener('storage', handler);
    window.addEventListener('weekly_routines_search_changed', customHandler as EventListener);

    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('weekly_routines_search_changed', customHandler as EventListener);
    };
  }, []);

  const handleDelete = async (id: string) => {
    // Encontrar el nombre de la rutina para mostrarlo en la confirmación
    const routine = routines.find(r => r.id === id);
    const routineName = routine?.name || 'esta rutina';

    const confirmed = await confirm({
      title: t('confirmDelete.title'),
      message: `${t('confirmDelete.message')} "${routineName}"? Esta acción no se puede deshacer.`,
      confirmText: t('confirmDelete.confirmText'),
      cancelText: t('confirmDelete.cancelText'),
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await deleteRoutine(id);
        success(t('toast.deleteSuccess'));
      } catch (err) {
        console.error('Error deleting routine:', err);
        error(t('toast.deleteError'));
      }
    }
  };

  const handleDuplicate = useCallback(async (id: string) => {
    if (duplicatingId) return; // Evitar duplicaciones múltiples

    try {
      const routineToDuplicate = routines.find(r => r.id === id);
      if (!routineToDuplicate) {
        error('Rutina no encontrada');
        return;
      }

      const confirmed = await confirm({
        title: 'Duplicar Rutina',
        message: `¿Deseas crear una copia de "${routineToDuplicate.name}"?`,
        confirmText: 'Duplicar',
        cancelText: 'Cancelar'
      });

      if (confirmed) {
        setDuplicatingId(id);

        // Toast de progreso
        success('⏳ Duplicando rutina...');

        // Pequeño delay para que el usuario vea el feedback
        await new Promise(resolve => setTimeout(resolve, 300));

        const duplicatedRoutine = {
          ...routineToDuplicate,
          id: `routine_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: `${routineToDuplicate.name} (Copia)`,
          exercises: routineToDuplicate.exercises.map(ex => ({
            ...ex,
            id: `exercise_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
          }))
        };

        await addRoutine(duplicatedRoutine);

        // Toast de éxito
        success('✅ Rutina duplicada exitosamente');

        try {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'routine_duplicated', {
              routine_name: routineToDuplicate.name
            });
          }
        } catch (e) {
          // ignore analytics errors
        }
      }
    } catch (e) {
      console.error('Error duplicating routine:', e);
      error('❌ Error al duplicar la rutina');
    } finally {
      setDuplicatingId(null);
    }
  }, [duplicatingId, routines, confirm, addRoutine, success, error]);

  const handleStartWorkout = useCallback(async (routineId: string) => {
    if (startingWorkoutId) return; // Prevenir clicks múltiples

    try {
      // Si hay un workout activo, preguntar si quiere cancelarlo
      if (isWorkoutActive && activeWorkout?.routineId !== routineId) {
        const confirmed = await confirm({
          title: t('confirmActive.title'),
          message: t('confirmActive.message'),
          confirmText: t('confirmActive.confirmText'),
          cancelText: t('confirmActive.cancelText'),
          variant: 'warning'
        });

        if (!confirmed) {
          return;
        }
      }

      const routine = routines.find(r => r.id === routineId);
      if (routine) {
        setStartingWorkoutId(routineId);
        startWorkout(routine);
        router.push(`/workout/${routineId}`);
      }
    } catch (e) {
      console.error('Error starting workout:', e);
      setStartingWorkoutId(null);
    }
  }, [startingWorkoutId, isWorkoutActive, activeWorkout, routines, confirm, startWorkout, router, t]);

  // Filtrado optimizado con useMemo
  const filteredRoutines = useMemo(() => {
    if (!searchFilter.trim()) return routines;
    const query = searchFilter.toLowerCase();
    return routines.filter(r =>
      (r.name || '').toLowerCase().includes(query) ||
      (r.description || '').toLowerCase().includes(query)
    );
  }, [routines, searchFilter]);

  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader
          title={t('title')}
          subtitle={t('subtitle')}
          icon={<ClipboardList className="w-7 h-7 text-white" />}
          gradient="from-slate-700 via-slate-800 to-gray-900"
          actions={(
            <>
              <Button
                variant="secondary"
                onClick={() => setIsWizardOpen(true)}
                className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm shadow-md"
              >
                <Zap className="w-4 h-4" />
                Asistente
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto bg-white text-slate-800 hover:bg-white/90 shadow-md font-semibold"
              >
                <Plus className="w-4 h-4" />
                {t('newRoutine')}
              </Button>
            </>
          )}
        />

        <PageContent>


          {/* Weekly Planner */}
          <div className="mb-6">
            <WeeklyPlanner searchQuery={debouncedSearchFilter} />
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="search"
                placeholder="🔍 Buscar rutinas por nombre o descripción..."
                value={searchFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchFilter(v);
                  try {
                    localStorage.setItem('weekly_routines_search', v);
                    try { window.dispatchEvent(new CustomEvent('weekly_routines_search_changed', { detail: v })); } catch (e) { }
                  } catch (e) { }
                }}
                aria-label="Buscar rutinas"
                className="w-full h-12 px-4 pl-12 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
              </div>
            </div>
          ) : routines.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                <ClipboardList className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {t('empty.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {t('empty.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="w-5 h-5" />
                  {t('empty.createButton')}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setIsWizardOpen(true)}
                >
                  <Zap className="w-5 h-5" />
                  Asistente
                </Button>
              </div>
            </div>
          ) : filteredRoutines.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">
                No se encontraron rutinas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Intenta con otro término de búsqueda
              </p>
              <Button
                variant="ghost"
                onClick={() => setSearchFilter('')}
              >
                Limpiar búsqueda
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoutines.map((routine) => {
                const totalExercises = routine.exercises.length;
                const totalSeries = routine.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);

                return (
                  <div
                    key={routine.id}
                    className="group bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                  >
                    {/* Active workout badge */}
                    {activeWorkout?.routineId === routine.id && (
                      <div className="absolute top-3 right-3 z-20">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                          <Flame className="w-3 h-3" />
                          Activo
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Header con título */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {routine.name}
                          </h3>
                        </div>
                      </div>

                      {/* Descripción */}
                      {routine.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                          {routine.description}
                        </p>
                      )}

                      {/* Stats rápidas */}
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-semibold text-blue-700 dark:text-blue-300">
                            {totalExercises}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 text-xs">
                            ejercicio{totalExercises !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                          <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                            {totalSeries}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs">
                            series
                          </span>
                        </div>
                      </div>

                      {/* Lista de ejercicios (primeros 3) */}
                      <div className="space-y-2 mb-4 flex-1">
                        {routine.exercises.slice(0, 3).map((exercise, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm bg-white/50 dark:bg-gray-700/30 rounded-lg p-2"
                          >
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 w-5">
                              {idx + 1}.
                            </span>
                            <span className="flex-1 text-zinc-700 dark:text-zinc-300 font-medium truncate">
                              {exercise.name}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                              {exercise.sets?.length || 0} series
                            </span>
                          </div>
                        ))}
                        {routine.exercises.length > 3 && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                            +{routine.exercises.length - 3} más
                          </p>
                        )}
                      </div>

                      {/* Botón de acción principal */}
                      <Button
                        variant="gradient"
                        onClick={() => handleStartWorkout(routine.id)}
                        disabled={startingWorkoutId === routine.id}
                        className="w-full gap-2 shadow-lg hover:shadow-xl transition-all mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        aria-label={activeWorkout?.routineId === routine.id ? `Continuar entrenamiento ${routine.name}` : `Iniciar entrenamiento ${routine.name}`}
                      >
                        {startingWorkoutId === routine.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Iniciando...
                          </>
                        ) : activeWorkout?.routineId === routine.id ? (
                          <>
                            <Flame className="w-4 h-4" />
                            Continuar
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Iniciar Entrenamiento
                          </>
                        )}
                      </Button>

                      {/* Botones secundarios */}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(routine.id)}
                          className="flex-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                          aria-label={`Editar rutina ${routine.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(routine.id)}
                          disabled={duplicatingId === routine.id}
                          className="flex-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800"
                          aria-label={`Duplicar rutina ${routine.name}`}
                        >
                          {duplicatingId === routine.id ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Duplicando...
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Duplicar
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(routine.id)}
                          className="flex-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
                          aria-label={`Eliminar rutina ${routine.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating Free Workout button */}
          <div className="fixed top-6 right-4 sm:bottom-8 sm:right-6 z-40">
            <button
              onClick={() => router.push('/workout/free')}
              aria-label="Entrenamiento Libre - Entrena sin rutina predefinida"
              title="Entrenamiento Libre"
              className="group flex items-center justify-center gap-2 px-5 py-4 sm:w-14 sm:h-14 sm:p-0 rounded-full bg-linear-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span className="text-sm font-semibold sm:hidden">Libre</span>
            </button>
          </div>

          {/* Modals */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={editingRoutine ? t('modal.editTitle') : t('modal.newTitle')}
            closeOnClickOutside={false}
            closeOnEscape={false}
          >
            <RoutineForm routineId={editingRoutine} onClose={handleCloseModal} />
          </Modal>

          {isWizardOpen && (
            <RoutineWizard
              onComplete={handleWizardComplete}
              onCancel={() => setIsWizardOpen(false)}
            />
          )}
        </PageContent>
      </PageLayout>
    </ProtectedRoute>
  );
}
