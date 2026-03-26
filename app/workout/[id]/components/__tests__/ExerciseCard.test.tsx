import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseCard } from '../ExerciseCard';
import type { Exercise } from '@/types';

// Mock del componente WeightSelector
vi.mock('@/components/WeightSelector', () => ({
  WeightSelector: ({ value, onChange }: any) => (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      data-testid="weight-selector"
    />
  )
}));

// Mock del componente Card
vi.mock('@/components/ui/Card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>
}));

// Mock del componente Button
vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, variant, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} {...props}>
      {children}
    </button>
  )
}));

// Mock del componente Input
vi.mock('@/components/ui/Input', () => ({
  Input: (props: any) => <input {...props} />
}));

describe('ExerciseCard', () => {
  const mockExercise: Exercise = {
    id: 'ex-1',
    name: 'Bench Press',
    sets: [
      { reps: 10, weight: 60 },
      { reps: 8, weight: 70 }
    ],
    equipment: 'Barbell',
    restBetweenSets: 90,
    recommendedReps: '8-12'
  };

  const defaultProps = {
    exercise: mockExercise,
    exerciseIndex: 0,
    currentSet: 1,
    completedSets: 0,
    currentReps: '' as const,
    currentWeight: '' as const,
    onRepsChange: vi.fn(),
    onWeightChange: vi.fn(),
    onCompleteSet: vi.fn(),
    onSkipExercise: vi.fn(),
    onShowInfo: vi.fn(),
    isSetStarted: false
  };

  it('debe renderizar el nombre del ejercicio', () => {
    render(<ExerciseCard {...defaultProps} />);
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });

  it('debe mostrar la serie actual', () => {
    render(<ExerciseCard {...defaultProps} />);
    expect(screen.getByText('Serie 1 de 2')).toBeInTheDocument();
  });

  it('debe mostrar el equipamiento', () => {
    render(<ExerciseCard {...defaultProps} />);
    expect(screen.getByText('Barbell')).toBeInTheDocument();
  });

  it('debe mostrar el descanso recomendado', () => {
    render(<ExerciseCard {...defaultProps} />);
    expect(screen.getByText('90s')).toBeInTheDocument();
  });

  it('debe mostrar las reps recomendadas', () => {
    render(<ExerciseCard {...defaultProps} />);
    expect(screen.getByText('8-12')).toBeInTheDocument();
  });

  it('debe mostrar el progreso de series completadas', () => {
    render(<ExerciseCard {...defaultProps} completedSets={1} />);
    expect(screen.getByText('1 de 2 series completadas')).toBeInTheDocument();
  });

  it('debe deshabilitar botón completar si no hay reps y peso', () => {
    render(<ExerciseCard {...defaultProps} isSetStarted={true} />);
    const completeButton = screen.getByText(/Completar/);
    expect(completeButton).toBeDisabled();
  });

  it('debe deshabilitar botón completar si la serie no ha comenzado', () => {
    render(
      <ExerciseCard
        {...defaultProps}
        currentReps={10}
        currentWeight={60}
        isSetStarted={false}
      />
    );
    const completeButton = screen.getByText(/Completar/);
    expect(completeButton).toBeDisabled();
  });

  it('debe habilitar botón completar si hay reps, peso y serie comenzada', () => {
    render(
      <ExerciseCard
        {...defaultProps}
        currentReps={10}
        currentWeight={60}
        isSetStarted={true}
      />
    );
    const completeButton = screen.getByText(/Completar/);
    expect(completeButton).not.toBeDisabled();
  });

  it('debe llamar onCompleteSet cuando se hace click en completar', () => {
    const onCompleteSet = vi.fn();
    render(
      <ExerciseCard
        {...defaultProps}
        currentReps={10}
        currentWeight={60}
        isSetStarted={true}
        onCompleteSet={onCompleteSet}
      />
    );

    const completeButton = screen.getByText(/Completar/);
    fireEvent.click(completeButton);

    expect(onCompleteSet).toHaveBeenCalledOnce();
  });

  it('debe llamar onSkipExercise cuando se hace click en saltar', () => {
    const onSkipExercise = vi.fn();
    render(
      <ExerciseCard
        {...defaultProps}
        onSkipExercise={onSkipExercise}
      />
    );

    const skipButton = screen.getByText(/Saltar/);
    fireEvent.click(skipButton);

    expect(onSkipExercise).toHaveBeenCalledOnce();
  });

  it('debe llamar onRepsChange cuando se cambia el input de reps', () => {
    const onRepsChange = vi.fn();
    render(
      <ExerciseCard
        {...defaultProps}
        onRepsChange={onRepsChange}
      />
    );

    const repsInput = screen.getByDisplayValue('');
    fireEvent.change(repsInput, { target: { value: '10' } });

    expect(onRepsChange).toHaveBeenCalledWith(10);
  });

  it('debe llamar onWeightChange cuando se cambia el peso', () => {
    const onWeightChange = vi.fn();
    render(
      <ExerciseCard
        {...defaultProps}
        onWeightChange={onWeightChange}
      />
    );

    const weightInput = screen.getByTestId('weight-selector');
    fireEvent.change(weightInput, { target: { value: '60' } });

    expect(onWeightChange).toHaveBeenCalledWith(60);
  });

  it('debe mostrar botón de información si onShowInfo está definido', () => {
    render(<ExerciseCard {...defaultProps} onShowInfo={vi.fn()} />);
    expect(screen.getByText('ℹ️ Info')).toBeInTheDocument();
  });

  it('debe llamar onShowInfo cuando se hace click en el botón de información', () => {
    const onShowInfo = vi.fn();
    render(<ExerciseCard {...defaultProps} onShowInfo={onShowInfo} />);

    const infoButton = screen.getByText('ℹ️ Info');
    fireEvent.click(infoButton);

    expect(onShowInfo).toHaveBeenCalledOnce();
  });

  it('debe mostrar indicador de última serie', () => {
    render(
      <ExerciseCard
        {...defaultProps}
        currentSet={2}
        currentReps={10}
        currentWeight={60}
        isSetStarted={true}
      />
    );
    expect(screen.getByText(/Última/)).toBeInTheDocument();
  });

  it('debe mostrar progreso visual correcto', () => {
    const { container } = render(
      <ExerciseCard
        {...defaultProps}
        completedSets={1}
      />
    );

    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle('width: 50%');
  });

  it('debe mostrar mensaje de series completadas cuando hay completadas', () => {
    render(
      <ExerciseCard
        {...defaultProps}
        completedSets={2}
      />
    );
    expect(screen.getByText('✓ 2 series completadas')).toBeInTheDocument();
  });

  it('debe manejar reps vacío correctamente', () => {
    const onRepsChange = vi.fn();
    render(
      <ExerciseCard
        {...defaultProps}
        onRepsChange={onRepsChange}
      />
    );

    const repsInput = screen.getByDisplayValue('');
    fireEvent.change(repsInput, { target: { value: '' } });

    expect(onRepsChange).toHaveBeenCalledWith('');
  });

  it('debe renderizar correctamente en diferentes series', () => {
    const { rerender } = render(
      <ExerciseCard {...defaultProps} currentSet={1} />
    );
    expect(screen.getByText('Serie 1 de 2')).toBeInTheDocument();

    rerender(
      <ExerciseCard {...defaultProps} currentSet={2} />
    );
    expect(screen.getByText('Serie 2 de 2')).toBeInTheDocument();
  });
});
