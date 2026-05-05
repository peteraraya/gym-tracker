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
    } catch (e) {}
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl">
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {t('title')}
                    </h1>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 ml-11">
                    {t('subtitle')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsWizardOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <Zap className="w-4 h-4" />
                    Asistente
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    {t('newRoutine')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
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
                      try { window.dispatchEvent(new CustomEvent('weekly_routines_search_changed', { detail: v })); } catch (e) {}
                    } catch (e) {}
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

            {/* Weekly Planner */}
            <div className="mb-6">
              <WeeklyPlanner searchQuery={debouncedSearchFilter} />
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredRoutines.map((routine) => (
                  <div 
                    key={routine.id} 
                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col relative"
                  >
                    {/* Image with overlay */}
                    {routine.image && (
                      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={routine.image} 
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/70 to-black/90 backdrop-blur-[2px]" />
                      </div>
                    )}

                    {/* Header with gradient */}
                    <div className="bg-linear-to-br from-blue-600 via-purple-600 to-indigo-700 p-5 relative z-10">
                      {/* Active workout badge */}
                      {activeWorkout?.routineId === routine.id && (
                        <div className="absolute top-3 right-3 z-20">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                            <Flame className="w-3 h-3" />
                            Activo
                          </span>
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-white line-clamp-1 pr-20">
                        {routine.name}
                      </h3>
                      {routine.description && (
                        <p className="text-sm text-blue-100 line-clamp-2 mt-2">
                          {routine.description}
                        </p>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col relative z-10 bg-white dark:bg-gray-800">
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-100 dark:border-gray-700 group-hover:border-gray-300/50 dark:group-hover:border-gray-600/50 transition-colors">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-semibold">{routine.exercises.length} ejercicios</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          {routine.exercises.reduce((total, ex) => total + ex.sets.length, 0)} series
                        </span>
                      </div>

                      {/* Preview de ejercicios */}
                      <div className="flex-1 mb-4">
                        <div className="space-y-1.5">
                          {routine.exercises.slice(0, 3).map((exercise) => (
                            <div
                              key={exercise.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                              <span className="text-gray-900 dark:text-gray-100 font-medium line-clamp-1 flex-1">
                                {exercise.name}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-xs shrink-0">
                                {exercise.sets.length}×{exercise.sets[0]?.reps || '?'}
                              </span>
                            </div>
                          ))}
                          {routine.exercises.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 pl-5">
                              +{routine.exercises.length - 3} más
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="space-y-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full h-11 text-sm font-semibold shadow-md group-hover:shadow-lg transition-shadow"
                          onClick={() => handleStartWorkout(routine.id)}
                          disabled={startingWorkoutId === routine.id}
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
                              Iniciar
                            </>
                          )}
                        </Button>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full sm:flex-1 h-10 text-sm"
                            onClick={() => handleEdit(routine.id)}
                            aria-label={`Editar rutina ${routine.name}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full sm:flex-1 h-10 text-sm"
                            onClick={() => handleDuplicate(routine.id)}
                            disabled={duplicatingId === routine.id}
                            aria-label={`Duplicar rutina ${routine.name}`}
                          >
                            {duplicatingId === routine.id ? (
                              <>
                                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="hidden sm:inline">Duplicando...</span>
                                <span className="sm:hidden">Duplicando...</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Duplicar</span>
                                <span className="sm:hidden">Dup.</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="w-full sm:w-auto h-10 text-sm"
                            onClick={() => handleDelete(routine.id)}
                            aria-label={`Eliminar rutina ${routine.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Eliminar</span>
                            <span className="sm:hidden">Elim.</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>  
                ))}
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
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
