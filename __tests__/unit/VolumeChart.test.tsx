import { fireEvent, render, screen } from '@testing-library/react';
import { VolumeChart } from '@/components/features/progress/VolumeChart';
import { LocaleProvider } from '@/context/LocaleContext';
import type { WorkoutSession } from '@/types';

describe('VolumeChart', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows session totals and exposes a selectable daily detail', () => {
    const today = new Date();
    const sessions: WorkoutSession[] = [
      {
        id: 'today-session',
        routineId: 'routine-1',
        date: today,
        exercises: [
          {
            exerciseId: 'exercise-1',
            exerciseName: 'Bench Press',
            completedSets: 1,
            actualReps: [10],
            actualWeight: [50],
          },
        ],
      },
    ];

    render(
      <LocaleProvider>
        <VolumeChart sessions={sessions} period="week" />
      </LocaleProvider>,
    );

    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getAllByText('Sesiones')).toHaveLength(2);

    const todayButton = screen.getByRole('button', {
      name: new RegExp(`500 kg, 1 sesiones`),
    });
    fireEvent.click(todayButton);

    expect(screen.getByText(/500 kg · 1 sesiones/)).toBeTruthy();
  });
});
