"use client";

// Evita prerender estático para esta página (usa hooks de navegación del cliente)
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
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
  Zap
} from 'lucide-react';

import { useTranslations } from '@/context/LocaleContext';

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

  const handleEdit = (id: string) => {
    setEditingRoutine(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoutine(null);
  };

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
    const handler = (e: StorageEvent) => {
      if (e.key === 'weekly_routines_search') {
        setSearchFilter(e.newValue || '');
      }
    };
    if (typeof window !== 'undefined') window.addEventListener('storage', handler);
    const customHandler = (e: any) => {
      setSearchFilter(e?.detail || '');
    };
    if (typeof window !== 'undefined') window.addEventListener('weekly_routines_search_changed', customHandler as EventListener);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('storage', handler); };
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

  const handleStartWorkout = async (routineId: string) => {
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
      startWorkout(routine);
      router.push(`/workout/${routineId}`);
    }
  };

  return (
    <ProtectedRoute>
    <div className="container mx-auto px-4 pt-6 pb-24 sm:pt-8 sm:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl">
                <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="secondary" 
              onClick={() => setIsWizardOpen(true)}
              className="w-full sm:w-auto"
            >
              <Zap className="w-5 h-5" />
              Asistente
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              {t('newRoutine')}
            </Button>
          </div>
        </div>

        {/* Botón flotante de Entrenamiento Libre (esquina inferior derecha) */}

        <WeeklyPlanner searchQuery={searchFilter} />

        <div className="mb-3 mt-4">
          <input
            type="search"
            placeholder="Buscar rutinas..."
            value={searchFilter}
            onChange={(e) => {
              const v = e.target.value;
              setSearchFilter(v);
              try {
                localStorage.setItem('weekly_routines_search', v);
                try { window.dispatchEvent(new CustomEvent('weekly_routines_search_changed', { detail: v })); } catch (e) {}
              } catch (e) {}
            }}
            className="w-full h-11 px-3 rounded-lg bg-gray-900/40 border border-gray-700 text-gray-200 placeholder-gray-400"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
            </div>
          </div>
        ) : routines.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
              <ClipboardList className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('empty.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('empty.description')}
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-5 h-5" />
              {t('empty.createButton')}
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {routines
              .filter(r => {
                if (!searchFilter) return true;
                return (r.name || '').toLowerCase().includes(searchFilter.toLowerCase()) || (r.description || '').toLowerCase().includes(searchFilter.toLowerCase());
              })
              .map((routine) => (
              <div 
                key={routine.id} 
                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col relative"
              >
                {/* Imagen de fondo con opacidad (si existe) */}
                {routine.image && (
                  <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={routine.image} 
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90 backdrop-blur-[2px]" />
                  </div>
                )}
                
                {/* Header compacto con gradiente */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 relative z-10">
                  {/* Badge de estado activo */}
                  {activeWorkout?.routineId === routine.id && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg animate-pulse">
                        <Flame className="w-2.5 h-2.5" />
                        Activo
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-base font-bold text-white line-clamp-1 pr-16">
                    {routine.name}
                  </h3>
                  {routine.description && (
                    <p className="text-xs text-blue-100 line-clamp-1 mt-0.5">
                      {routine.description}
                    </p>
                  )}
                </div>

                {/* Contenido compacto */}
                <div className="p-3 flex-1 flex flex-col relative z-10">
                  {/* Stats en una línea */}
                  <div className="flex items-center justify-between text-xs mb-2 pb-2 border-b border-gray-200 dark:border-gray-700 group-hover:border-gray-300/50 dark:group-hover:border-gray-600/50 transition-colors">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <Dumbbell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold">{routine.exercises.length} ejercicios</span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-500 font-medium">
                      {routine.exercises.reduce((total, ex) => total + ex.sets.length, 0)} series
                    </span>
                  </div>

                  {/* Preview compacto de ejercicios */}
                  <div className="flex-1 mb-3">
                    <div className="space-y-1">
                      {routine.exercises.slice(0, 3).map((exercise, idx) => (
                        <div
                          key={exercise.id}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium line-clamp-1 flex-1">
                            {exercise.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-500 text-[10px] shrink-0">
                            {exercise.sets.length}×{exercise.sets[0]?.reps || '?'}
                          </span>
                        </div>
                      ))}
                      {routine.exercises.length > 3 && (
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 pl-4">
                          +{routine.exercises.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones compactos */}
                  <div className="space-y-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full h-9 text-sm shadow-md group-hover:shadow-lg transition-shadow"
                      onClick={() => handleStartWorkout(routine.id)}
                    >
                      {activeWorkout?.routineId === routine.id ? (
                        <>
                          <Flame className="w-3.5 h-3.5" />
                          Continuar
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          Iniciar
                        </>
                      )}
                    </Button>
                    
                    <div className="flex gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleEdit(routine.id)}
                      >
                        <Pencil className="w-3 h-3" />
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleDelete(routine.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>  

            ))}
          </div>
        )}
      </div>

      {/* Floating Free Workout button */}
      <div className="fixed top-24 right-10 z-40">
        <button
          onClick={() => router.push('/workout/free')}
          aria-label="Entrenamiento Libre"
          title="Entrenamiento Libre"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          <Zap className="w-6 h-6" />
        </button>
      </div>

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
    </ProtectedRoute>
  );
}
