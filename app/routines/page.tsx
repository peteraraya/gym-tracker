"use client";

// Evita prerender estático para esta página (usa hooks de navegación del cliente)
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { useWorkout } from '@/context/WorkoutContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RoutineForm } from '@/components/RoutineForm';
import WeeklyPlanner from '@/components/WeeklyPlanner';
import ProtectedRoute from '@/components/ProtectedRoute';
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
  const { routines, deleteRoutine, loading } = useGym();
  const { startWorkout, isWorkoutActive, activeWorkout } = useWorkout();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  const t = useTranslations('routines');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    const confirmed = await confirm({
      title: t('confirmDelete.title'),
      message: t('confirmDelete.message'),
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
          <Button 
            variant="primary" 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            {t('newRoutine')}
          </Button>
        </div>

        {/* Botón flotante de Entrenamiento Libre (esquina inferior derecha) */}

        <WeeklyPlanner />

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
              <Card key={routine.id}>
                {routine.image && (
                  <div className="w-full h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={routine.image} 
                      alt={routine.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{routine.name}</CardTitle>
                  {routine.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {routine.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4" />
                        {t('exercisesLabel')}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {routine.exercises.length}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 font-medium">
                        {t('previewLabel')}
                      </p>
                      <div className="space-y-1">
                        {routine.exercises.slice(0, 3).map((exercise) => {
                          const setsCount = exercise.sets.length;
                          const repsText = exercise.sets.map(s => s.reps).join('/');
                          return (
                            <div
                              key={exercise.id}
                              className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                            >
                              <span className="text-blue-600 dark:text-blue-400">•</span>
                              <span>
                                {exercise.name} <span className="text-gray-500">({setsCount} series: {repsText} reps)</span>
                              </span>
                            </div>
                          );
                        })}
                        {routine.exercises.length > 3 && (
                          <div className="text-sm text-gray-500 dark:text-gray-500 pl-4">
                            +{routine.exercises.length - 3} {t('more')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleStartWorkout(routine.id)}
                      >
                        {activeWorkout?.routineId === routine.id ? (
                          <>
                            <Flame className="w-4 h-4" />
                            {t('continueWorkout')}
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            {t('startWorkout')}
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(routine.id)}
                      >
                        <Pencil className="w-4 h-4" />
                        {t('edit')}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(routine.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('delete')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Free Workout button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => router.push('/workout/free')}
          aria-label="Entrenamiento Libre"
          title="Entrenamiento Libre"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          <Zap className="w-6 h-6" />
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRoutine ? t('modal.editTitle') : t('modal.newTitle')}
      >
        <RoutineForm routineId={editingRoutine} onClose={handleCloseModal} />
      </Modal>
    </div>
    </ProtectedRoute>
  );
}
