'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { useWorkout } from '@/context/WorkoutContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RoutineForm } from '@/components/RoutineForm';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function RoutinesPage() {
  const router = useRouter();
  const { routines, deleteRoutine } = useGym();
  const { startWorkout, isWorkoutActive, activeWorkout } = useWorkout();
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
    if (confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
      try {
        await deleteRoutine(id);
      } catch (error) {
        console.error('Error deleting routine:', error);
        alert('Error al eliminar la rutina');
      }
    }
  };

  const handleStartWorkout = (routineId: string) => {
    // Si hay un workout activo, preguntar si quiere cancelarlo
    if (isWorkoutActive && activeWorkout?.routineId !== routineId) {
      if (!confirm('Ya tienes un entrenamiento activo. ¿Deseas cancelarlo e iniciar uno nuevo?')) {
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Mis Rutinas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gestiona tus rutinas de entrenamiento
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            ➕ Nueva Rutina
          </Button>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No tienes rutinas todavía
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Crea tu primera rutina para comenzar a entrenar
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Crear Rutina
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <span className="text-gray-600 dark:text-gray-400">Ejercicios:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {routine.exercises.length}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                        Ejercicios:
                      </p>
                      <div className="space-y-1">
                        {routine.exercises.slice(0, 3).map((exercise) => {
                          const setsCount = exercise.sets.length;
                          const repsText = exercise.sets.map(s => s.reps).join('/');
                          return (
                            <div
                              key={exercise.id}
                              className="text-sm text-gray-700 dark:text-gray-300"
                            >
                              • {exercise.name} ({setsCount} series: {repsText} reps)
                            </div>
                          );
                        })}
                        {routine.exercises.length > 3 && (
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            +{routine.exercises.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full mb-2"
                        onClick={() => handleStartWorkout(routine.id)}
                      >
                        {activeWorkout?.routineId === routine.id ? '🔥 Continuar' : '▶️ Iniciar'}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(routine.id)}
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(routine.id)}
                      >
                        🗑️ Eliminar
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
