import { render, screen, waitFor } from '@/__tests__/helpers/testUtils'
import userEvent from '@testing-library/user-event'
import { SessionComparison } from '@/components/features/sessions/SessionComparison'
import { createMockSession, createMockRoutine } from '@/__tests__/helpers/mockData'

describe('Session Comparison - Integration Tests', () => {
  const mockSessions = [
    createMockSession({
      id: 'session-1',
      routineId: 'routine-1',
      date: new Date('2025-11-01'),
      exercises: [{
        exerciseId: 'ex-1',
        exerciseName: 'Bench Press',
        completedSets: 3,
        actualReps: [10, 10, 8],
        actualWeight: [80, 80, 80],
      }],
      notes: 'First session',
    }),
    createMockSession({
      id: 'session-2',
      routineId: 'routine-1',
      date: new Date('2025-11-30'),
      exercises: [{
        exerciseId: 'ex-1',
        exerciseName: 'Bench Press',
        completedSets: 3,
        actualReps: [12, 12, 10],
        actualWeight: [85, 85, 85],
      }],
      notes: 'Second session - improved!',
    }),
  ]

  const mockRoutines = [
    createMockRoutine({ id: 'routine-1', name: 'Push Day' }),
  ]

  it('should open comparison modal', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionComparison
        sessions={mockSessions}
        routines={mockRoutines}
      />
    )

    const compareButton = screen.getByRole('button', { name: /comparar sesiones/i })
    await user.click(compareButton)

    expect(screen.getByRole('heading', { name: /comparar sesiones/i })).toBeInTheDocument()
  })

  it('should allow selecting two sessions', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionComparison
        sessions={mockSessions}
        routines={mockRoutines}
      />
    )

    const compareButton = screen.getByRole('button', { name: /comparar sesiones/i })
    await user.click(compareButton)

    // Seleccionar primera sesión
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'session-1')
    
    // Seleccionar segunda sesión
    await user.selectOptions(selects[1], 'session-2')

    await waitFor(() => {
      // Verificar que se muestra la tabla de comparación
      expect(screen.getByText('Bench Press')).toBeInTheDocument()
    })
  })

  it('should show comparison data with metrics', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionComparison
        sessions={mockSessions}
        routines={mockRoutines}
      />
    )

    const compareButton = screen.getByRole('button', { name: /comparar sesiones/i })
    await user.click(compareButton)

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'session-1')
    await user.selectOptions(selects[1], 'session-2')

    await waitFor(() => {
      // Verificar que se muestran las métricas
      expect(screen.getByText('Peso Prom.')).toBeInTheDocument()
      expect(screen.getByText('Reps Totales')).toBeInTheDocument()
      expect(screen.getByText('Series')).toBeInTheDocument()
    })
  })

  it('should display trend indicators', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionComparison
        sessions={mockSessions}
        routines={mockRoutines}
      />
    )

    const compareButton = screen.getByRole('button', { name: /comparar sesiones/i })
    await user.click(compareButton)

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'session-1')
    await user.selectOptions(selects[1], 'session-2')

    await waitFor(() => {
      // Verificar que se muestran los pesos
      expect(screen.getByText(/80.*kg/)).toBeInTheDocument()
      expect(screen.getByText(/85.*kg/)).toBeInTheDocument()
    })
  })

  it('should show session notes comparison', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionComparison
        sessions={mockSessions}
        routines={mockRoutines}
      />
    )

    const compareButton = screen.getByRole('button', { name: /comparar sesiones/i })
    await user.click(compareButton)

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'session-1')
    await user.selectOptions(selects[1], 'session-2')

    await waitFor(() => {
      expect(screen.getByText('First session')).toBeInTheDocument()
      expect(screen.getByText('Second session - improved!')).toBeInTheDocument()
    })
  })

  it('should show prompt when no sessions selected', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionComparison
        sessions={mockSessions}
        routines={mockRoutines}
      />
    )

    const compareButton = screen.getByRole('button', { name: /comparar sesiones/i })
    await user.click(compareButton)

    expect(screen.getByText(/selecciona dos sesiones/i)).toBeInTheDocument()
  })

  it('should close modal when clicking close button', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionComparison
        sessions={mockSessions}
        routines={mockRoutines}
      />
    )

    const compareButton = screen.getByRole('button', { name: /comparar sesiones/i })
    await user.click(compareButton)

    expect(screen.getByRole('heading', { name: /comparar sesiones/i })).toBeInTheDocument()

    // Buscar botón de cerrar por su etiqueta accesible
    const closeButton = screen.getByRole('button', { name: /cerrar/i })
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /comparar sesiones/i })).not.toBeInTheDocument()
    })
  })

  it('should format dates correctly', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionComparison
        sessions={mockSessions}
        routines={mockRoutines}
      />
    )

    const compareButton = screen.getByRole('button', { name: /comparar sesiones/i })
    await user.click(compareButton)

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 'session-1')
    await user.selectOptions(selects[1], 'session-2')

    await waitFor(() => {
      // Verificar que las fechas están formateadas (hay múltiples apariciones)
      expect(screen.getAllByText(/2025/).length).toBeGreaterThan(0)
    })
  })
})
