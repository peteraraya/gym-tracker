import { render, screen, waitFor } from '@/__tests__/helpers/testUtils'
import userEvent from '@testing-library/user-event'
import { fireEvent } from '@testing-library/react'
import SessionsPage from '@/app/sessions/page'
import { createMockSession, createMockRoutine } from '@/__tests__/helpers/mockData'

jest.mock('@/context/GymContext', () => ({
  useGym: () => ({
    sessions: [
      createMockSession({
        id: 'session-1',
        routineId: 'routine-1',
        date: new Date('2025-11-30'),
        notes: 'Excellent workout',
      }),
      createMockSession({
        id: 'session-2',
        routineId: 'routine-2',
        date: new Date('2025-11-29'),
        notes: 'Feeling tired',
      }),
      createMockSession({
        id: 'session-3',
        routineId: 'routine-1',
        date: new Date('2025-10-15'),
      }),
    ],
    routines: [
      createMockRoutine({ id: 'routine-1', name: 'Push Day' }),
      createMockRoutine({ id: 'routine-2', name: 'Pull Day' }),
    ],
    loading: false,
    addSession: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    addRoutine: jest.fn(),
    updateRoutine: jest.fn(),
    deleteRoutine: jest.fn(),
    getRoutineById: jest.fn(),
    refreshSessions: jest.fn(),
    refreshRoutines: jest.fn(),
  }),
}))

jest.mock('@/components/layout/ProtectedRoute', () => {
  return function ProtectedRoute({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }
})

describe('Sessions Page - Integration Tests', () => {
  it('should render sessions page with filters and session list', async () => {
    render(<SessionsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Historial de Sesiones/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Filtros')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Push Day')).toBeInTheDocument()
    })
  })

  it('should filter sessions by search term', async () => {
    render(<SessionsPage />)

    const searchInput = screen.getByPlaceholderText(/buscar por rutina/i)
    fireEvent.change(searchInput, { target: { value: 'Excellent' } })

    await waitFor(() => {
      const sessions = screen.queryAllByText(/Push Day|Pull Day/)
      expect(sessions.length).toBeGreaterThan(0)
    })
  })

  it('should open comparison modal when button is clicked', async () => {
    const user = userEvent.setup()
    render(<SessionsPage />)

    const compareButton = screen.getByRole('button', { name: /comparar sesiones/i })
    await user.click(compareButton)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /comparar sesiones/i })).toBeInTheDocument()
    })
  })

  it('should display session notes in cards', async () => {
    render(<SessionsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Excellent workout/i)).toBeInTheDocument()
      expect(screen.getByText(/Feeling tired/i)).toBeInTheDocument()
    })
  })

  it('should filter by routine', async () => {
    const user = userEvent.setup()
    render(<SessionsPage />)

    await waitFor(() => {
      expect(screen.getByText('Push Day')).toBeInTheDocument()
    })

    const routineSelect = screen.getAllByRole('combobox')[0]
    await user.selectOptions(routineSelect, 'routine-1')

    await waitFor(() => {
      const pushDaySessions = screen.getAllByText('Push Day')
      expect(pushDaySessions.length).toBeGreaterThan(0)
    })
  })

  it('should filter by date range', async () => {
    const user = userEvent.setup()
    render(<SessionsPage />)

    const weekButton = screen.getByRole('button', { name: /7 días/i })
    await user.click(weekButton)

    await waitFor(() => {
      const resultTexts = screen.queryAllByText(/sesiones encontradas/i)
      expect(resultTexts.length).toBeGreaterThan(0)
    })
  })

  it('should clear filters and show all sessions', async () => {
    const user = userEvent.setup()
    render(<SessionsPage />)

    const searchInput = screen.getByPlaceholderText(/buscar por rutina/i)
    await user.type(searchInput, 'Excellent')

    const clearButton = screen.getByRole('button', { name: /limpiar/i })
    await user.click(clearButton)

    await waitFor(() => {
      const resultTexts = screen.queryAllByText(/sesiones encontradas/i)
      expect(resultTexts.length).toBeGreaterThan(0)
    })
  })

  it('should show empty state when no results match filters', async () => {
    const user = userEvent.setup()
    render(<SessionsPage />)

    const searchInput = screen.getByPlaceholderText(/buscar por rutina/i)
    await user.type(searchInput, 'NonExistentSearchTerm123')

    await waitFor(() => {
      expect(screen.getByText(/no se encontraron sesiones/i)).toBeInTheDocument()
      expect(screen.getByText(/intenta cambiar los filtros/i)).toBeInTheDocument()
    })
  })
})
