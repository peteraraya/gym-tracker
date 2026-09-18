'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ExerciseSelector } from '@/components/features/exercises/ExerciseSelector';
import { ExerciseTemplate } from '@/data/exercises';

interface AddExerciseButtonProps {
  onAddExercises: (exercises: ExerciseTemplate[], insertIndex?: number) => void;
  insertIndex?: number;
  customButton?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'info';
  className?: string;
  buttonText?: string;
}

export const AddExerciseButton: React.FC<AddExerciseButtonProps> = ({ 
  onAddExercises,
  insertIndex,
  customButton,
  variant = 'secondary',
  className = "w-full flex items-center justify-center gap-2",
  buttonText = "Agregar ejercicios"
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleSelectExercises = (exercises: ExerciseTemplate[]) => {
    onAddExercises(exercises, insertIndex);
    setShowModal(false);
  };

  return (
    <>
      {customButton ? (
        <div onClick={(e) => { e.stopPropagation(); setShowModal(true); }}>
          {customButton}
        </div>
      ) : (
        <Button
          variant={variant}
          onClick={() => setShowModal(true)}
          className={className}
        >
          <span className="text-lg">➕</span>
          <span>{buttonText}</span>
        </Button>
      )}

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
