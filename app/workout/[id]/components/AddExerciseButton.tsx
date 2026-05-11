'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { ExerciseTemplate } from '@/data/exercises';

interface AddExerciseButtonProps {
  onAddExercises: (exercises: ExerciseTemplate[]) => void;
}

export const AddExerciseButton: React.FC<AddExerciseButtonProps> = ({ onAddExercises }) => {
  const [showModal, setShowModal] = useState(false);

  const handleSelectExercises = (exercises: ExerciseTemplate[]) => {
    onAddExercises(exercises);
    setShowModal(false);
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-2"
      >
        <span className="text-lg">➕</span>
        <span>Agregar ejercicios</span>
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Agregar ejercicios a la rutina"
        contentClassName="max-w-5xl w-full"
      >
        <ExerciseSelector
          onSelectExercises={handleSelectExercises}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </>
  );
};
