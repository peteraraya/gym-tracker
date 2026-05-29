import React from 'react'
import { render, screen } from '@/__tests__/helpers/testUtils'
import { CompactWorkoutHeader } from '../components/CompactWorkoutHeader'

const routine = {
  id: 'r1',
  name: 'Test Routine',
  exercises: [
    { id: 'ex1', name: 'Bench Press', sets: [{ reps: 10, weight: 60 }] },
  ],
}

test('CompactWorkoutHeader renders', () => {
  render(
    <CompactWorkoutHeader
      routine={routine as any}
      currentExerciseIndex={0}
      totalExercises={1}
      elapsedTime={90}
      completedSets={{}}
      actualReps={{}}
      actualWeights={{}}
      exercises={routine.exercises as any}
      onCancel={() => {}}
      onPauseToggle={() => {}}
      onEditTime={() => {}}
      onOpenSoundSettings={() => {}}
    />,
  )

  expect(screen.getByText('Test Routine')).toBeInTheDocument()
})
