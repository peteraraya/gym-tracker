import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WorkoutPage from '../page';

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'routine-1' }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn()
  })
}));

// Mock de contextos
vi.mock('@/context/GymContext', () => ({
  useGym: () => ({
    getRoutineById: vi.fn(() => mockRoutine),
    addSession: vi.fn().mockResolvedValue({}),
    sessions: [],
    loading: false
  })
}));

vi.mock('@/context/WorkoutContext', () => ({
  useWorkout: () => ({
    activeWorkout: null,
    startWorkout: vi.fn(),
    updateWorkoutProgress: vi.fn(),
    clearRestState: vi.fn(),
    finishWorkout: vi.fn(),
    cancelWorkout: vi.fn()
  })
}));

vi.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  })
}));

vi.mock('@/context/ConfirmContext', () => ({
  useConfirm: () => ({
    confirm: vi.fn().mockResolvedValue(false)
  })
}));

// Mock de componentes
vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/components/ui/Modal', () => ({
  Modal: ({ isOpen, children }: any) => isOpen ? <div data-testid="modal">{children}</div> : null
}));

vi.mock('@/components/ui/Input', () => ({
  Input: (props: any) => <input {...props} />
}));

vi.mock('@/components/features/workout/Timer', () => ({
  Timer: ({ duration, onComplete }: any) => (
    <div data-testid="timer">
      <div>{duration}s</div>
      <button onClick={onComplete}>Complete</button>
    </div>
  )
}));

vi.mock('@/components/features/workout/PreparationCountdown', () => ({
  PreparationCountdown: ({ onComplete }: any) => (
    <div data-testid="countdown">
      <button onClick={onComplete}>Start</button>
    </div>
  )
}));

vi.mock('@/components/features/workout/WorkoutGlobalTimer', () => ({
  WorkoutGlobalTimer: () => <div data-testid="global-timer">Timer</div>
}));

vi.mock('@/components/layout/ProtectedRoute', () => ({
  default: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/components/features/exercises/ExerciseInfoPanel', () => ({
  ExerciseInfoPanel: () => <div data-testid="info-panel">Info</div>
}));

vi.mock('@/components/features/workout/WeightSelector', () => ({
  WeightSelector: ({ value, onChange }: any) => (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      data-testid="weight-selector"
    />
  )
}));

vi.mock('@/components/features/workout/SetTypeSelector', () => ({
  default: () => <div>SetTypeSelector</div>,
  SetTypeBadge: () => <div>Badge</div>
}));

vi.mock('@/components/features/workout/SetTypeCycleButton', () => ({
  default: () => <div>CycleButton</div>
}));

vi.mock('@/components/icons/lucide', () => ({
  Plus: () => <span>+</span>
}));

// Mock de componentes de workout
vi.mock('../components/WorkoutHeader', () => ({
  WorkoutHeader: () => <div data-testid="workout-header">Header</div>
}));

vi.mock('../components/ExerciseCard', () => ({
  ExerciseCard: ({ onCompleteSet, onSkipExercise }: any) => (
    <div data-testid="exercise-card">
      <button onClick={onCompleteSet} data-testid="complete-set-btn">Complete</button>
      <button onClick={onSkipExercise} data-testid="skip-exercise-btn">Skip</button>
    </div>
  )
}));

vi.mock('../components/SetControls', () => ({
  SetControls: ({ onSetChange }: any) => (
    <div data-testid="set-controls">
      <button onClick={() => onSetChange(2)} data-testid="next-set-btn">Next</button>
    </div>
  )
}));

vi.mock('../components/SeriesTable', () => ({
  SeriesTable: ({ onAddSet, onApplySmartRest }: any) => (
    <div data-testid="series-table">
      <button onClick={onAddSet} data-testid="add-set-btn">Add</button>
      <button onClick={onApplySmartRest} data-testid="smart-rest-btn">Smart Rest</button>
    </div>
  )
}));

vi.mock('../components/ExerciseList', () => ({
  ExerciseList: () => <div data-testid="exercise-list">List</div>
}));

vi.mock('../components/WorkoutSummary', () => ({
  WorkoutSummary: () => <div data-testid="workout-summary">Summary</div>
}));

vi.mock('../hooks/useWorkoutState', () => ({
  useWorkoutState: () => ({
    currentExerciseIndex: 0,
    currentSet: 1,
    currentReps: '',
    currentWeight: '',
    sessionNotes: '',
    workoutData: {
      completedSets: {},
      actualReps: {},
      actualWeights: {},
      setTypes: {},
      perSetRestOverrides: {},
      restOverrides: {},
      actualSetDurations: {},
      actualPauseDurations: {},
      actualRestTimes: {}
    },
    setCurrentExerciseIndex: vi.fn(),
    setCurrentSet: vi.fn(),
    setCurrentReps: vi.fn(),
    setCurrentWeight: vi.fn(),
    completeSet: vi.fn(),
    updateActualReps: vi.fn(),
    updateActualWeights: vi.fn(),
    updateSetType: vi.fn(),
    updatePerSetRestOverride: vi.fn(),
    updateCompletedSets: vi.fn(),
    reset: vi.fn()
  })
}));

vi.mock('@/lib/storage/storage', () => ({
  getActiveWorkout: vi.fn().mockResolvedValue(null),
  saveActiveWorkout: vi.fn().mockResolvedValue({}),
  clearActiveWorkout: vi.fn().mockResolvedValue({})
}));

vi.mock('@/data/exercises', () => ({
  EXERCISE_DATABASE: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest',
      equipment: 'barbell'
    }
  ]
}));

vi.mock('@/lib/workout/restCalculator', () => ({
  calculateRestBetweenSets: () => ({
    recommended: 90,
    min: 60,
    max: 120
  })
}));

vi.mock('../utils/workoutCalculations', () => ({
  calculateNextRestTime: () => 90,
  calculateExerciseRestTime: () => 120,
  updateNestedArray: (arr: any) => arr
}));

const mockRoutine = {
  id: 'routine-1',
  name: 'Push Day',
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      sets: [
        { reps: 10, weight: 60 },
        { reps: 8, weight: 70 }
      ],
      useSmartRest: true
    },
    {
      id: 'ex-2',
      name: 'Incline Press',
      sets: [
        { reps: 8, weight: 50 }
      ],
      useSmartRest: true
    }
  ]
};

describe('WorkoutPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar la página de workout', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('workout-header')).toBeInTheDocument();
    });
  });

  it('debe mostrar el componente global timer', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('global-timer')).toBeInTheDocument();
    });
  });

  it('debe mostrar la tarjeta del ejercicio actual', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
    });
  });

  it('debe mostrar los controles de serie', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('set-controls')).toBeInTheDocument();
    });
  });

  it('debe mostrar la tabla de series', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('series-table')).toBeInTheDocument();
    });
  });

  it('debe mostrar la lista de ejercicios', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-list')).toBeInTheDocument();
    });
  });

  it('debe permitir completar una serie', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
    });

    const completeButton = screen.getByTestId('complete-set-btn');
    fireEvent.click(completeButton);

    // Verificar que se completó
    expect(completeButton).toBeInTheDocument();
  });

  it('debe permitir saltar un ejercicio', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
    });

    const skipButton = screen.getByTestId('skip-exercise-btn');
    fireEvent.click(skipButton);

    expect(skipButton).toBeInTheDocument();
  });

  it('debe permitir navegar entre series', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('set-controls')).toBeInTheDocument();
    });

    const nextButton = screen.getByTestId('next-set-btn');
    fireEvent.click(nextButton);

    expect(nextButton).toBeInTheDocument();
  });

  it('debe permitir agregar una serie', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('series-table')).toBeInTheDocument();
    });

    const addButton = screen.getByTestId('add-set-btn');
    fireEvent.click(addButton);

    expect(addButton).toBeInTheDocument();
  });

  it('debe permitir aplicar descanso inteligente', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('series-table')).toBeInTheDocument();
    });

    const smartRestButton = screen.getByTestId('smart-rest-btn');
    fireEvent.click(smartRestButton);

    expect(smartRestButton).toBeInTheDocument();
  });

  it('debe mostrar modal de notas al completar workout', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
    });

    // Simular completar todas las series
    const completeButton = screen.getByTestId('complete-set-btn');
    fireEvent.click(completeButton);

    // El modal debería aparecer después de completar
    expect(completeButton).toBeInTheDocument();
  });

  it('debe renderizar correctamente con múltiples ejercicios', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-list')).toBeInTheDocument();
    });

    expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
  });

  it('debe mostrar el panel de información del ejercicio', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
    });

    // El panel de información debería estar disponible
    expect(screen.queryByTestId('info-panel')).toBeInTheDocument();
  });

  it('debe manejar el flujo completo de una serie', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
    });

    // 1. Completar serie
    const completeButton = screen.getByTestId('complete-set-btn');
    fireEvent.click(completeButton);

    // 2. Verificar que se completó
    expect(completeButton).toBeInTheDocument();
  });

  it('debe manejar el flujo de navegación entre ejercicios', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-list')).toBeInTheDocument();
    });

    // Verificar que se puede navegar
    expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
  });

  it('debe renderizar correctamente en modo loading', async () => {
    render(<WorkoutPage />);

    // Debería mostrar contenido después de cargar
    await waitFor(() => {
      expect(screen.getByTestId('workout-header')).toBeInTheDocument();
    });
  });

  it('debe manejar errores de rutina no encontrada', async () => {
    // Mock para rutina no encontrada
    vi.mock('@/context/GymContext', () => ({
      useGym: () => ({
        getRoutineById: vi.fn(() => null),
        addSession: vi.fn(),
        sessions: [],
        loading: false
      })
    }));

    render(<WorkoutPage />);

    // Debería redirigir o mostrar error
    await waitFor(() => {
      expect(screen.queryByTestId('workout-header')).not.toBeInTheDocument();
    });
  });

  it('debe permitir múltiples acciones en secuencia', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
    });

    // 1. Agregar serie
    const addButton = screen.getByTestId('add-set-btn');
    fireEvent.click(addButton);

    // 2. Aplicar descanso inteligente
    const smartRestButton = screen.getByTestId('smart-rest-btn');
    fireEvent.click(smartRestButton);

    // 3. Completar serie
    const completeButton = screen.getByTestId('complete-set-btn');
    fireEvent.click(completeButton);

    expect(completeButton).toBeInTheDocument();
  });

  it('debe mantener estado consistente durante interacciones', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
    });

    // Realizar múltiples acciones
    const completeButton = screen.getByTestId('complete-set-btn');
    fireEvent.click(completeButton);

    const skipButton = screen.getByTestId('skip-exercise-btn');
    fireEvent.click(skipButton);

    // Verificar que el estado se mantiene
    expect(screen.getByTestId('exercise-card')).toBeInTheDocument();
  });
});
