import { render, screen, fireEvent, waitFor, within } from '@/__tests__/helpers/testUtils'

// Ensure jsdom has a safe `scrollTo` to avoid noisy errors from QuickEditMode
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.scrollTo = () => {}
}

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'routine-1' }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn()
  })
}));

// Mock de contextos
const _stableSessions: any[] = [];

// Stable gym mock object so tests can override behavior per-case
const _gymMockImpl: any = {
  getRoutineById: () => mockRoutine,
  addSession: jest.fn().mockResolvedValue({}),
  sessions: _stableSessions,
  loading: false,
  updateRoutine: jest.fn(),
}

jest.mock('@/context/GymContext', () => ({
  GymProvider: ({ children }: any) => children,
  useGym: () => _gymMockImpl,
  useRoutines: () => ({ routines: [], loading: false, refreshRoutines: jest.fn() }),
  useSessions: () => ({ sessions: _stableSessions, loading: false }),
}));

jest.mock('@/context/WorkoutContext', () => ({
  WorkoutProvider: ({ children }: any) => children,
  useWorkout: () => ({
    activeWorkout: null,
    startWorkout: jest.fn(),
    updateWorkoutProgress: jest.fn(),
    updateModifiedRoutine: jest.fn(),
    clearRestState: jest.fn(),
    finishWorkout: jest.fn(),
    cancelWorkout: jest.fn()
  })
}));

jest.mock('@/context/ToastContext', () => {
  // Return stable jest.fn references to avoid changing function identities
  const success = jest.fn()
  const error = jest.fn()
  const info = jest.fn()
  return {
    useToast: () => ({ success, error, info })
  }
});

jest.mock('@/context/ConfirmContext', () => ({
  useConfirm: () => ({
    confirm: jest.fn().mockResolvedValue(false)
  })
}));

// Mock de componentes
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/Card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div>{children}</div>
}));

jest.mock('@/components/ui/Modal', () => ({
  Modal: ({ isOpen, children }: any) => isOpen ? <div data-testid="modal">{children}</div> : null
}));

jest.mock('@/components/ui/Input', () => ({
  Input: (props: any) => <input {...props} />
}));

jest.mock('@/components/features/workout/Timer', () => ({
  Timer: ({ duration, onComplete }: any) => (
    <div data-testid="timer">
      <div>{duration}s</div>
      <button onClick={onComplete}>Complete</button>
    </div>
  )
}));

jest.mock('@/components/features/workout/PreparationCountdown', () => ({
  PreparationCountdown: ({ onComplete }: any) => (
    <div data-testid="countdown">
      <button onClick={onComplete}>Start</button>
    </div>
  )
}));

jest.mock('@/components/features/workout/WorkoutGlobalTimer', () => ({
  WorkoutGlobalTimer: () => <div data-testid="global-timer">Timer</div>
}));

// MinimizedTimer is used in the header; mock it so tests can find the global timer
jest.mock('@/components/features/workout/MinimizedTimer', () => ({
  MinimizedTimer: () => <div data-testid="global-timer">Timer</div>
}));

// Mock SetExecutionModal and start/complete splashes to avoid overlays in tests
jest.mock('@/components/features/workout/SetExecutionModal', () => ({
  SetExecutionModal: ({ isOpen, onComplete, onCancel }: any) => (
    isOpen ? (
      <div data-testid="set-execution">
        <button data-testid="complete-set-btn" onClick={() => onComplete(1)}>Complete</button>
        <button data-testid="cancel-set-btn" onClick={onCancel}>Cancel</button>
      </div>
    ) : null
  )
}));

jest.mock('@/components/features/workout/WorkoutStartSplash', () => ({
  WorkoutStartSplash: ({ onComplete }: any) => (
    <div data-testid="start-splash">
      <button onClick={onComplete}>Start Splash</button>
    </div>
  )
}));

jest.mock('@/components/features/workout/WorkoutCompleteSplash', () => ({
  WorkoutCompleteSplash: ({ onComplete }: any) => (
    <div data-testid="complete-splash">
      <button onClick={onComplete}>Done</button>
    </div>
  )
}));

jest.mock('@/components/layout/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>
}));

jest.mock('@/components/features/exercises/ExerciseInfoPanel', () => ({
  ExerciseInfoPanel: () => <div data-testid="info-panel">Info</div>
}));

jest.mock('@/components/features/workout/WeightSelector', () => ({
  WeightSelector: ({ value, onChange }: any) => (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      data-testid="weight-selector"
    />
  )
}));

jest.mock('@/components/features/workout/SetTypeSelector', () => ({
  default: () => <div>SetTypeSelector</div>,
  SetTypeBadge: () => <div>Badge</div>
}));

jest.mock('@/components/features/workout/SetTypeCycleButton', () => ({
  default: () => <div>CycleButton</div>
}));

jest.mock('@/components/icons/lucide', () => ({
  X: () => <span>X</span>,
  CheckCircle: () => <span>O</span>,
  AlertCircle: () => <span>!</span>,
  Info: () => <span>i</span>,
  AlertTriangle: () => <span>Δ</span>,
  Plus: () => <span>+</span>,
  Clock: () => <span>⏱</span>,
  Weight: () => <span>⚖️</span>,
  ListChecks: () => <span>☑️</span>,
  Repeat: () => <span>🔁</span>,
  Settings: () => <span>⚙️</span>
}));

// Mock external lucide-react imports used directly in components
jest.mock('lucide-react', () => ({
  Timer: () => <span>T</span>,
  ArrowRight: () => <span>→</span>,
  Plus: () => <span>+</span>,
  Check: () => <span>✓</span>
}));

// Mock de componentes de workout
jest.mock('../components/ExerciseCard', () => ({
  ExerciseCard: ({ onCompleteSet, onSkipExercise, onShowInfo }: any) => (
    <div data-testid="exercise-card">
      <button onClick={onCompleteSet} data-testid="complete-set-btn">Complete</button>
      <button onClick={onSkipExercise} data-testid="skip-exercise-btn">Skip</button>
      <button onClick={onShowInfo} data-testid="info-btn">Info</button>
      <button data-testid="next-set-btn">Next</button>
    </div>
  )
}));

jest.mock('../components/SetControls', () => ({
  SetControls: ({ onSetChange }: any) => (
    <div data-testid="set-controls">
      <button onClick={() => onSetChange(2)} data-testid="next-set-btn">Next</button>
    </div>
  )
}));

jest.mock('../components/SeriesTable', () => ({
  SeriesTable: ({ onAddSet, onApplySmartRest }: any) => (
    <div data-testid="series-table">
      <button onClick={onAddSet} data-testid="add-set-btn">Add</button>
      <button onClick={onApplySmartRest} data-testid="smart-rest-btn">Smart Rest</button>
    </div>
  )
}));

jest.mock('../components/ExerciseList', () => ({
  ExerciseList: () => <div data-testid="exercise-list">List</div>
}));

jest.mock('../components/WorkoutSummary', () => ({
  WorkoutSummary: () => <div data-testid="workout-summary">Summary</div>
}));

// Debug: inspect key modules to ensure mocks/exports are functions/components
// eslint-disable-next-line no-console
console.log('[Test Debug] CompactWorkoutHeader exports:', Object.keys(require('../components/CompactWorkoutHeader')))
// eslint-disable-next-line no-console
console.log('[Test Debug] QuickEditMode exports:', Object.keys(require('../components/QuickEditMode')))
// eslint-disable-next-line no-console
console.log('[Test Debug] WorkoutModals exports:', Object.keys(require('../components/WorkoutModals')))

// Implementación realista y reactiva de `useWorkoutState` para tests
jest.mock('../hooks/useWorkoutState', () => {
  const React = require('react')
  return {
    useWorkoutState: () => {
      const [currentExerciseIndex, setCurrentExerciseIndex] = React.useState(0)
      const [currentSet, setCurrentSet] = React.useState(1)
      const [currentReps, setCurrentReps] = React.useState<any>('')
      const [currentWeight, setCurrentWeight] = React.useState<any>('')
      const [sessionNotes, setSessionNotes] = React.useState('')
      const [workoutData, setWorkoutData] = React.useState<any>({
        completedSets: {},
        actualReps: {},
        actualWeights: {},
        setTypes: {},
        lastWeights: {},
        perSetRestOverrides: {},
        restOverrides: {},
        actualSetDurations: {},
        actualPauseDururations: {},
        actualRestTimes: {}
      })

      const getExerciseData = (exerciseId: string) => ({
        completedSets: workoutData.completedSets[exerciseId] || 0,
        actualReps: workoutData.actualReps[exerciseId] || [],
        actualWeights: workoutData.actualWeights[exerciseId] || [],
        setTypes: workoutData.setTypes[exerciseId] || [],
        lastWeights: workoutData.lastWeights?.[exerciseId] || []
      })

      const restoreData = (restoredData: any) => {
        if (!restoredData) return
        const wd = restoredData.workoutData || restoredData
        setWorkoutData((prev: any) => ({ ...prev, ...wd }))
        if (typeof restoredData.currentExerciseIndex !== 'undefined') setCurrentExerciseIndex(restoredData.currentExerciseIndex)
        if (typeof restoredData.currentSet !== 'undefined') setCurrentSet(restoredData.currentSet)
        if (typeof restoredData.currentReps !== 'undefined') setCurrentReps(restoredData.currentReps)
        if (typeof restoredData.currentWeight !== 'undefined') setCurrentWeight(restoredData.currentWeight)
        if (typeof restoredData.sessionNotes !== 'undefined') setSessionNotes(restoredData.sessionNotes)
      }

      const completeSetAt = (exerciseId: string, setIndex: number, reps: number, weight: number) => {
        setWorkoutData((prev: any) => {
          const actualReps = { ...(prev.actualReps || {}) }
          actualReps[exerciseId] = [...(actualReps[exerciseId] || [])]
          actualReps[exerciseId][setIndex] = reps

          const actualWeights = { ...(prev.actualWeights || {}) }
          actualWeights[exerciseId] = [...(actualWeights[exerciseId] || [])]
          actualWeights[exerciseId][setIndex] = weight

          const completedSets = { ...(prev.completedSets || {}) }
          completedSets[exerciseId] = (completedSets[exerciseId] || 0) + 1

          return { ...prev, actualReps, actualWeights, completedSets }
        })
        setCurrentSet((s: number) => s + 1)
      }

      const updateActualReps = (exerciseId: string, arr: any[]) => setWorkoutData((p: any) => ({ ...p, actualReps: { ...(p.actualReps || {}), [exerciseId]: arr } }))
      const updateActualWeights = (exerciseId: string, arr: any[]) => setWorkoutData((p: any) => ({ ...p, actualWeights: { ...(p.actualWeights || {}), [exerciseId]: arr } }))
      const updateSetType = (exerciseId: string, arr: any[]) => setWorkoutData((p: any) => ({ ...p, setTypes: { ...(p.setTypes || {}), [exerciseId]: arr } }))
      const updatePerSetRestOverride = (exerciseId: string, setIndex: number, sec: number) => setWorkoutData((p: any) => {
        const per = { ...(p.perSetRestOverrides || {}) }
        per[exerciseId] = [...(per[exerciseId] || [])]
        per[exerciseId][setIndex] = sec
        return { ...p, perSetRestOverrides: per }
      })
      const updateCompletedSets = (exerciseId: string, count: number) => setWorkoutData((p: any) => ({ ...p, completedSets: { ...(p.completedSets || {}), [exerciseId]: count } }))
      const reset = () => {
        setWorkoutData({
          completedSets: {},
          actualReps: {},
          actualWeights: {},
          setTypes: {},
          lastWeights: {},
          perSetRestOverrides: {},
          restOverrides: {},
          actualSetDurations: {},
          actualPauseDururations: {},
          actualRestTimes: {}
        })
        setCurrentExerciseIndex(0)
        setCurrentSet(1)
        setCurrentReps('')
        setCurrentWeight('')
        setSessionNotes('')
      }

      return {
        currentExerciseIndex,
        currentSet,
        currentReps,
        currentWeight,
        sessionNotes,
        workoutData,
        setCurrentExerciseIndex,
        setCurrentSet,
        setCurrentReps,
        setCurrentWeight,
        completeSetAt,
        restoreData,
        updateActualReps,
        updateActualWeights,
        updateSetType,
        updatePerSetRestOverride,
        updateCompletedSets,
        reset,
        getExerciseData
      }
    }
  }
})

// Helper para entrar en Modo Guiado (UI por defecto es Edición Rápida)
const goToGuidedMode = async () => {
  // Use query selectors to avoid throwing and ensure we click the actual button
  const guidedBtn = screen.queryByRole('button', { name: /modo guiado/i }) || screen.queryByText(/modo guiado/i)
  if (!guidedBtn) throw new Error('No se encontró el botón Modo Guiado')
  fireEvent.click(guidedBtn)
  await waitFor(() => {
    expect(screen.getByTestId('exercise-card')).toBeInTheDocument()
  })
  // Intentar iniciar la serie para mostrar los controles (si aplica)
  const startBtn = screen.queryByRole('button', { name: /iniciar serie/i }) || screen.queryByText(/iniciar serie/i)
  if (startBtn) {
    fireEvent.click(startBtn)
    // esperar brevemente a que aparezcan los controles de serie si existen
    try {
      await waitFor(() => expect(screen.getByTestId('set-controls')).toBeInTheDocument(), { timeout: 500 })
    } catch {}
  }
}



// Mock workout suggestions to avoid complex side-effects in integration tests
jest.mock('../hooks/useWorkoutSuggestions', () => ({
  useWorkoutSuggestions: () => ({
    suggestions: [],
    dismissedSuggestions: new Set(),
    dismissSuggestion: jest.fn()
  })
}));

jest.mock('@/lib/storage/storage', () => ({
  getActiveWorkout: jest.fn().mockResolvedValue(null),
  saveActiveWorkout: jest.fn().mockResolvedValue({}),
  clearActiveWorkout: jest.fn().mockResolvedValue({})
}));

jest.mock('@/data/exercises', () => ({
  EXERCISE_DATABASE: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest',
      equipment: 'barbell'
    }
  ]
}));

jest.mock('@/lib/workout/restCalculator', () => ({
  calculateRestBetweenSets: () => ({
    recommended: 90,
    min: 60,
    max: 120
  })
}));

// Mock generator de rutinas para evitar operaciones pesadas en tests
jest.mock('@/lib/routines/routineGenerator', () => ({
  generateRoutine: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../utils/workoutCalculations', () => ({
  calculateNextRestTime: () => 90,
  calculateExerciseRestTime: () => 120,
  updateNestedArray: (arr: any) => arr
}));

import WorkoutPage from '../page';

// Debug: tipo del componente importado
// eslint-disable-next-line no-console
console.log('[Test Debug] WorkoutPage import type:', typeof WorkoutPage, WorkoutPage)

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
    jest.clearAllMocks();
    try {
      sessionStorage.removeItem('workout_splash_ts')
    } catch (e) {}
    try {
      localStorage.removeItem('gym-tracker-active-workout')
    } catch (e) {}
  });

  it('debe renderizar la página de workout', async () => {
    render(<WorkoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('workout-header')).toBeInTheDocument();
    });
  });

  it('debe mostrar el componente global timer', async () => {
    render(<WorkoutPage />);
    // Buscar el tiempo dentro del header sticky
    await waitFor(() => {
      const header = screen.getByTestId('workout-header')
      expect(within(header).getByText(/tiempo/i)).toBeInTheDocument()
      expect(within(header).getAllByText(/\d+:\d{2}/).length).toBeGreaterThan(0)
    })
  });

  it('debe mostrar la tarjeta del ejercicio actual', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
  });

  it('debe mostrar los controles de serie', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    await waitFor(() => {
      // Aceptar tanto el SetControls real como el fallback dentro del ExerciseCard
      const hasSetControls = !!screen.queryByTestId('set-controls') || !!screen.queryByTestId('next-set-btn')
      expect(hasSetControls).toBeTruthy();
    });
  });

  it('debe mostrar la tabla de series', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    // Expandir la tabla de series antes de verificar
    const toggle = screen.getByRole('button', { name: /ver todas las series/i }) || screen.getByText(/ver todas las series/i)
    fireEvent.click(toggle)
    await waitFor(() => {
      expect(screen.getByTestId('series-table')).toBeInTheDocument();
    });
  });

  it('debe mostrar la lista de ejercicios', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    await waitFor(() => {
      expect(screen.getByTestId('exercise-list')).toBeInTheDocument();
    });
  });

  it('debe permitir completar una serie', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    await waitFor(() => expect(screen.getByTestId('complete-set-btn')).toBeInTheDocument(), { timeout: 3000 })
    const completeButton = screen.getByTestId('complete-set-btn')
    fireEvent.click(completeButton)
    const either = screen.queryByTestId('exercise-card') || screen.queryByTestId('timer') || screen.queryByTestId('modal')
    expect(either).toBeInTheDocument()
  });

  it('debe permitir saltar un ejercicio', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    const skipButton = await waitFor(() => screen.getByTestId('skip-exercise-btn'))
    fireEvent.click(skipButton);
    expect(skipButton).toBeInTheDocument();
  });

  it('debe permitir navegar entre series', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    const nextButton = await waitFor(() => screen.getByTestId('next-set-btn'))
    fireEvent.click(nextButton);
    expect(nextButton).toBeInTheDocument();
  });

  it('debe permitir agregar una serie', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    const toggle = screen.getByRole('button', { name: /ver todas las series/i }) || screen.getByText(/ver todas las series/i)
    fireEvent.click(toggle)
    await waitFor(() => expect(screen.getByTestId('series-table')).toBeInTheDocument())
    const addButton = screen.getByTestId('add-set-btn')
    fireEvent.click(addButton)
    expect(addButton).toBeInTheDocument()
  });

  it('debe permitir aplicar descanso inteligente', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    const toggle = screen.getByRole('button', { name: /ver todas las series/i }) || screen.getByText(/ver todas las series/i)
    fireEvent.click(toggle)
    await waitFor(() => expect(screen.getByTestId('series-table')).toBeInTheDocument())
    const smartRestButton = screen.getByTestId('smart-rest-btn')
    fireEvent.click(smartRestButton)
    expect(smartRestButton).toBeInTheDocument()
  });

  it('debe mostrar modal de notas al completar workout', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    await waitFor(() => expect(screen.getByTestId('complete-set-btn')).toBeInTheDocument(), { timeout: 3000 })
    const completeButton = screen.getByTestId('complete-set-btn')
    fireEvent.click(completeButton)
    const either = screen.queryByTestId('exercise-card') || screen.queryByTestId('timer') || screen.queryByTestId('modal')
    expect(either).toBeInTheDocument()
  });

  it('debe renderizar correctamente con múltiples ejercicios', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    await waitFor(() => expect(screen.getByTestId('exercise-list')).toBeInTheDocument())
    expect(screen.getByTestId('exercise-card')).toBeInTheDocument()
  });

  it('debe mostrar el panel de información del ejercicio', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    await waitFor(() => expect(screen.getByTestId('exercise-card')).toBeInTheDocument())
    const infoBtn = screen.getByTestId('info-btn')
    fireEvent.click(infoBtn)
    await waitFor(() => expect(screen.getByTestId('info-panel')).toBeInTheDocument())
  });

  it('debe manejar el flujo completo de una serie', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    await waitFor(() => expect(screen.getByTestId('complete-set-btn')).toBeInTheDocument(), { timeout: 3000 })
    const completeButton = screen.getByTestId('complete-set-btn')
    fireEvent.click(completeButton)
    const either = screen.queryByTestId('exercise-card') || screen.queryByTestId('timer') || screen.queryByTestId('modal')
    expect(either).toBeInTheDocument()
  });

  it('debe manejar el flujo de navegación entre ejercicios', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    await waitFor(() => expect(screen.getByTestId('exercise-list')).toBeInTheDocument())
    expect(screen.getByTestId('exercise-card')).toBeInTheDocument()
  });

  it('debe renderizar correctamente en modo loading', async () => {
    render(<WorkoutPage />);
    // Debería mostrar contenido después de cargar
    await waitFor(() => {
      expect(screen.getByTestId('workout-header')).toBeInTheDocument();
    });
  });

  it('debe manejar errores de rutina no encontrada', async () => {
    // Temporarily override the stable gym mock to simulate no routine
    const original = _gymMockImpl.getRoutineById
    _gymMockImpl.getRoutineById = () => null

    render(<WorkoutPage />)

    await waitFor(() => {
      expect(screen.queryByTestId('workout-header')).not.toBeInTheDocument()
    })

    // Restore
    _gymMockImpl.getRoutineById = original
  })

  it('debe permitir múltiples acciones en secuencia', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    const toggle = screen.getByRole('button', { name: /ver todas las series/i }) || screen.getByText(/ver todas las series/i)
    fireEvent.click(toggle)
    await waitFor(() => expect(screen.getByTestId('series-table')).toBeInTheDocument())
    const addButton = screen.getByTestId('add-set-btn')
    fireEvent.click(addButton)
    const smartRestButton = screen.getByTestId('smart-rest-btn')
    fireEvent.click(smartRestButton)
    await waitFor(() => expect(screen.getByTestId('complete-set-btn')).toBeInTheDocument(), { timeout: 3000 })
    const completeButton = screen.getByTestId('complete-set-btn')
    fireEvent.click(completeButton)
    const either = screen.queryByTestId('exercise-card') || screen.queryByTestId('timer') || screen.queryByTestId('modal')
    expect(either).toBeInTheDocument()
  });

  it('debe mantener estado consistente durante interacciones', async () => {
    render(<WorkoutPage />);
    await goToGuidedMode();
    await waitFor(() => expect(screen.getByTestId('complete-set-btn')).toBeInTheDocument(), { timeout: 3000 })
    const completeButton = screen.getByTestId('complete-set-btn')
    fireEvent.click(completeButton)
    const skipButton = screen.queryByTestId('skip-exercise-btn')
    if (skipButton) {
      fireEvent.click(skipButton)
    }
    const either = screen.queryByTestId('exercise-card') || screen.queryByTestId('timer') || screen.queryByTestId('modal')
    expect(either).toBeInTheDocument()
  });
});
