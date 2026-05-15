import { render, screen } from '@/__tests__/helpers/testUtils'
import { ProgressDashboard } from '@/components/features/progress/ProgressDashboard'
import { createMultipleSessions } from '@/__tests__/helpers/mockData'

describe('ProgressDashboard Component - Unit Tests', () => {
  it('should render empty state when no sessions', () => {
    render(<ProgressDashboard sessions={[]} />)

    expect(screen.getByText(/completa algunas sesiones/i)).toBeInTheDocument()
  })

  it('should render progress for exercises', () => {
    const sessions = createMultipleSessions(5)
    
    render(<ProgressDashboard sessions={sessions} />)

    expect(screen.getByText('Progreso por Ejercicio')).toBeInTheDocument()
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('should show trend indicators', () => {
    const sessions = createMultipleSessions(5)
    
    render(<ProgressDashboard sessions={sessions} />)

    // Debe mostrar alguna tendencia (Mejorando, Bajando, o Estable)
    const trendText = screen.getByText(/(Mejorando|Bajando|Estable)/i)
    expect(trendText).toBeInTheDocument()
  })

  it('should display exercise metrics', () => {
    const sessions = createMultipleSessions(5)
    
    render(<ProgressDashboard sessions={sessions} />)

    // Verificar que se muestran las métricas
    expect(screen.getByText('Mejor Volumen')).toBeInTheDocument()
    expect(screen.getByText('Volumen Total')).toBeInTheDocument()
    expect(screen.getByText('Sesiones')).toBeInTheDocument()
    expect(screen.getByText('Mejora')).toBeInTheDocument()
  })

  it('should show tip about calculation', () => {
    const sessions = createMultipleSessions(5)
    
    render(<ProgressDashboard sessions={sessions} />)

    expect(screen.getByText(/el progreso se calcula/i)).toBeInTheDocument()
  })

  it('should limit to top 6 exercises', () => {
    // Crear sesiones con 10 ejercicios diferentes
    const sessions = Array.from({ length: 10 }, (_, i) => ({
      id: `session-${i}`,
      routineId: 'routine-1',
      date: new Date(),
      exercises: [{
        exerciseId: `ex-${i}`,
        exerciseName: `Exercise ${i}`,
        completedSets: 3,
        actualReps: [10, 10, 10],
        actualWeight: [50, 50, 50],
      }],
    }))
    
    render(<ProgressDashboard sessions={sessions} />)

    // Solo deben aparecer 6 ejercicios
    const exerciseCards = screen.getAllByText(/Exercise \d+/)
    expect(exerciseCards.length).toBeLessThanOrEqual(6)
  })
})
