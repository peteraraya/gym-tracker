'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { useWorkout } from '@/context/WorkoutContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RoutineForm } from '@/components/RoutineForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Plus, 
  Play, 
  Pencil, 
  Trash2, 
  ClipboardList, 
  Dumbbell,
  Flame
} from 'lucide-react';

export default function RoutinesPage() {
  const router = useRouter();
  const { routines, deleteRoutine } = useGym();
  const { startWorkout, isWorkoutActive, activeWorkout } = useWorkout();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingRoutine(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoutine(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Eliminar rutina',
      message: '¿Estás seguro de que quieres eliminar esta rutina?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger'
    });
    
    if (confirmed) {
      try {
        await deleteRoutine(id);
        success('Rutina eliminada exitosamente');
      } catch (err) {
        console.error('Error deleting routine:', err);
        error('Error al eliminar la rutina');
      }
    }
  };

  const handleStartWorkout = async (routineId: string) => {
    // Si hay un workout activo, preguntar si quiere cancelarlo
    if (isWorkoutActive && activeWorkout?.routineId !== routineId) {
      const confirmed = await confirm({
        title: 'Entrenamiento activo',
        message: 'Ya tienes un entrenamiento activo. ¿Deseas cancelarlo e iniciar uno nuevo?',
        confirmText: 'Iniciar nuevo',
        cancelText: 'Cancelar',
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
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl">
                <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              Mis Rutinas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gestiona tus rutinas de entrenamiento
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Nueva Rutina
          </Button>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
              <ClipboardList className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No tienes rutinas todavía
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Crea tu primera rutina para comenzar a entrenar
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-5 h-5" />
              Crear Rutina
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {routines.map((routine) => (
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
                        Ejercicios:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {routine.exercises.length}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 font-medium">
                        Vista previa:
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
                            +{routine.exercises.length - 3} más
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
                            Continuar Entrenamiento
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Iniciar Entrenamiento
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
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(routine.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRoutine ? 'Editar Rutina' : 'Nueva Rutina'}
      >
        <RoutineForm routineId={editingRoutine} onClose={handleCloseModal} />
      </Modal>
    </div>
    </ProtectedRoute>
  );
}
