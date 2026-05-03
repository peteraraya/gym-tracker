import { render, screen } from '@/__tests__/helpers/testUtils'
import { within } from '@testing-library/dom'
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

  const defaultFilters = {
    searchTerm: '',
    selectedRoutine: 'all',
    dateRange: 'all' as const,
  }

  const mockOnFilterChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  function renderFilters(overrides = {}) {
    return render(
      <SessionFilters
        routines={mockRoutines}
        totalSessions={mockSessions.length}
        filteredCount={mockSessions.length}
        filters={{ ...defaultFilters, ...overrides }}
        onFilterChange={mockOnFilterChange}
      />
    )
  }

  it('should render filter component', () => {
    renderFilters()

    expect(screen.getByText('Filtros')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/buscar por rutina/i)).toBeInTheDocument()
  })

  it('should call onFilterChange when search term changes', async () => {
    const user = userEvent.setup()

    renderFilters()

    const searchInput = screen.getByPlaceholderText(/buscar por rutina/i)
    await user.type(searchInput, 'test')

    expect(mockOnFilterChange).toHaveBeenCalled()
    const callSearchTerms = mockOnFilterChange.mock.calls.map(c => c[0].searchTerm)
    expect(callSearchTerms).toContain('t')
  })

  it('should reflect filter values from parent', () => {
    renderFilters({ searchTerm: 'existing' })

    const searchInput = screen.getByPlaceholderText(/buscar por rutina/i)
    expect(searchInput).toHaveValue('existing')
  })

  it('should call onFilterChange when routine changes', async () => {
    const user = userEvent.setup()

    renderFilters()

    const routineSelect = screen.getAllByRole('combobox')[0]
    await user.selectOptions(routineSelect, 'routine-1')

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ selectedRoutine: 'routine-1' })
    )
  })

  it('should call onFilterChange when date range changes', async () => {
    const user = userEvent.setup()

    renderFilters()

    const weekButton = screen.getByRole('button', { name: /7 días/i })
    await user.click(weekButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ dateRange: 'week' })
    )
  })

  it('should show active filters count', () => {
    const { rerender } = renderFilters()

    const filtersHeading = screen.getByRole('heading', { name: /filtros/i })
    const { queryByText: queryWithin } = within(filtersHeading)
    expect(queryWithin('0')).not.toBeInTheDocument()

    // Simulate parent updating filter state
    rerender(
      <SessionFilters
        routines={mockRoutines}
        totalSessions={mockSessions.length}
        filteredCount={1}
        filters={{ ...defaultFilters, searchTerm: 'Great' }}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(within(screen.getByRole('heading', { name: /filtros/i })).getByText('1')).toBeInTheDocument()

    // Simulate adding a second filter
    rerender(
      <SessionFilters
        routines={mockRoutines}
        totalSessions={mockSessions.length}
        filteredCount={1}
        filters={{ ...defaultFilters, searchTerm: 'Great', selectedRoutine: 'routine-1' }}
        onFilterChange={mockOnFilterChange}
      />
    )

    expect(within(screen.getByRole('heading', { name: /filtros/i })).getByText('2')).toBeInTheDocument()
  })

  it('should clear all filters', async () => {
    const user = userEvent.setup()

    renderFilters({ searchTerm: 'test', selectedRoutine: 'routine-1' })

    const clearButton = screen.getByRole('button', { name: /limpiar/i })
    await user.click(clearButton)

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      searchTerm: '',
      selectedRoutine: 'all',
      dateRange: 'all',
    })
  })

  it('should show results count', () => {
    renderFilters()

    const p = screen.getByText(/sesiones encontradas/i)
    expect(p).toBeInTheDocument()
    expect(p.textContent).toContain('3')
  })
})
