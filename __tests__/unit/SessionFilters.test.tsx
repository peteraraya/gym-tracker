import { render, screen } from '@/__tests__/helpers/testUtils'
import { SessionFilters } from '@/components/SessionFilters'
import userEvent from '@testing-library/user-event'
import { createMockSession, createMockRoutine } from '@/__tests__/helpers/mockData'

describe('SessionFilters Component - Unit Tests', () => {
  const mockSessions = [
    createMockSession({ 
      id: 'session-1',
      routineId: 'routine-1',
      notes: 'Great workout',
    }),
    createMockSession({ 
      id: 'session-2',
      routineId: 'routine-2',
      notes: 'Feeling tired',
    }),
    createMockSession({ 
      id: 'session-3',
      routineId: 'routine-1',
      date: new Date('2025-10-15'),
    }),
  ]

  const mockRoutines = [
    createMockRoutine({ id: 'routine-1', name: 'Push Day' }),
    createMockRoutine({ id: 'routine-2', name: 'Pull Day' }),
  ]

  const mockOnFilteredSessionsChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render filter component', () => {
    render(
      <SessionFilters
        sessions={mockSessions}
        routines={mockRoutines}
        onFilteredSessionsChange={mockOnFilteredSessionsChange}
      />
    )

    expect(screen.getByText('Filtros')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/buscar por rutina/i)).toBeInTheDocument()
  })

  it('should filter sessions by search term', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionFilters
        sessions={mockSessions}
        routines={mockRoutines}
        onFilteredSessionsChange={mockOnFilteredSessionsChange}
      />
    )

    const searchInput = screen.getByPlaceholderText(/buscar por rutina/i)
    await user.type(searchInput, 'Great')

    // Wait for useEffect to trigger
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockOnFilteredSessionsChange).toHaveBeenCalled()
    const lastCall = mockOnFilteredSessionsChange.mock.calls[mockOnFilteredSessionsChange.mock.calls.length - 1]
    expect(lastCall[0]).toHaveLength(1)
    expect(lastCall[0][0].notes).toBe('Great workout')
  })

  it('should filter sessions by routine', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionFilters
        sessions={mockSessions}
        routines={mockRoutines}
        onFilteredSessionsChange={mockOnFilteredSessionsChange}
      />
    )

    const routineSelect = screen.getByRole('combobox', { name: /rutina/i })
    await user.selectOptions(routineSelect, 'routine-1')

    await new Promise(resolve => setTimeout(resolve, 0))

    const lastCall = mockOnFilteredSessionsChange.mock.calls[mockOnFilteredSessionsChange.mock.calls.length - 1]
    expect(lastCall[0]).toHaveLength(2)
    expect(lastCall[0].every((s: any) => s.routineId === 'routine-1')).toBe(true)
  })

  it('should filter sessions by date range', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionFilters
        sessions={mockSessions}
        routines={mockRoutines}
        onFilteredSessionsChange={mockOnFilteredSessionsChange}
      />
    )

    const weekButton = screen.getByRole('button', { name: /7 días/i })
    await user.click(weekButton)

    await new Promise(resolve => setTimeout(resolve, 0))

    const lastCall = mockOnFilteredSessionsChange.mock.calls[mockOnFilteredSessionsChange.mock.calls.length - 1]
    // Solo las sesiones de los últimos 7 días
    expect(lastCall[0].length).toBeLessThan(mockSessions.length)
  })

  it('should show active filters count', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionFilters
        sessions={mockSessions}
        routines={mockRoutines}
        onFilteredSessionsChange={mockOnFilteredSessionsChange}
      />
    )

    // Aplicar filtro de búsqueda
    const searchInput = screen.getByPlaceholderText(/buscar por rutina/i)
    await user.type(searchInput, 'Great')

    // Debe mostrar contador de 1 filtro activo
    expect(screen.getByText('1')).toBeInTheDocument()

    // Aplicar filtro de rutina
    const routineSelect = screen.getByRole('combobox', { name: /rutina/i })
    await user.selectOptions(routineSelect, 'routine-1')

    // Debe mostrar contador de 2 filtros activos
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should clear all filters', async () => {
    const user = userEvent.setup()
    
    render(
      <SessionFilters
        sessions={mockSessions}
        routines={mockRoutines}
        onFilteredSessionsChange={mockOnFilteredSessionsChange}
      />
    )

    // Aplicar filtros
    const searchInput = screen.getByPlaceholderText(/buscar por rutina/i)
    await user.type(searchInput, 'Great')

    const routineSelect = screen.getByRole('combobox', { name: /rutina/i })
    await user.selectOptions(routineSelect, 'routine-1')

    // Limpiar filtros
    const clearButton = screen.getByRole('button', { name: /limpiar/i })
    await user.click(clearButton)

    await new Promise(resolve => setTimeout(resolve, 0))

    // Verificar que se resetean los filtros
    expect(searchInput).toHaveValue('')
    expect(routineSelect).toHaveValue('all')
    
    // Debe devolver todas las sesiones
    const lastCall = mockOnFilteredSessionsChange.mock.calls[mockOnFilteredSessionsChange.mock.calls.length - 1]
    expect(lastCall[0]).toHaveLength(mockSessions.length)
  })

  it('should show results count', () => {
    render(
      <SessionFilters
        sessions={mockSessions}
        routines={mockRoutines}
        onFilteredSessionsChange={mockOnFilteredSessionsChange}
      />
    )

    expect(screen.getByText(/3 sesiones encontradas/i)).toBeInTheDocument()
  })
})
